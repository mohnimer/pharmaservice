// Published content and native routes, with isolated account transport and no live writes.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox']});
const out=process.env.PSC_WORKSHOP_QA||'test-results/workshop-articles';mkdirSync(out,{recursive:true});const results=[];
try{for(const width of [320,390,768,1440,1920]){
 const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
 await ctx.addInitScript(()=>window.__testRole='anonymous');
 await ctx.route('**/*',r=>{const h=new URL(r.request().url()).hostname;if(h==='127.0.0.1'||['fonts.googleapis.com','fonts.gstatic.com'].includes(h))return r.continue();return r.fulfill({contentType:h==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:h==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8'):''});});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const fits=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),width+'px horizontal overflow');
 await page.goto(base+'/#home');await page.locator('.psHomeWorkshop').waitFor();await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('.psHomeWorkshop').count(),1);assert.equal(await page.locator('.psHome h1').innerText(),'Healthcare procurement for institutions.');
 assert.match(await page.locator('.h47HeroPhoto').evaluate(e=>getComputedStyle(e).backgroundImage),/v44-10-5-home-hero-desktop/);
 assert.equal(await page.locator('.psHomeWorkshop .kicker,.psHomeWorkshop .eyebrow').count(),0);assert(!/[→↗]/.test(await page.locator('.psHomeWorkshop').innerText()));
 const guides=await page.evaluate(()=>PSC_WORKSHOP.filter(g=>g.status==='published').map(g=>({slug:g.slug,title:g.title,sections:g.body_sections.map(s=>s.title),signature:[g.use_it_right,g.check_your_stock,g.when_ordering]})));
 const featured=await page.locator('.psHomeGuide').evaluateAll(els=>els.map(e=>({route:e.dataset.go,title:e.querySelector('h3').textContent})));
 assert.equal(featured.length,3);for(const f of featured)assert(guides.some(g=>'workshop/'+g.slug===f.route&&g.title===f.title));
 for(const img of await page.locator('.psHomeGuide img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(e=>e.decode());}
 if(width>760){const tops=await page.locator('.psHomeGuide img').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().top));assert(Math.max(...tops)-Math.min(...tops)<2,'Guide images share a consistent top edge');}
 await fits();await page.locator('.psHomeWorkshop').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/'+width+'-home-workshop.png'});
 await page.locator('.psHomeWorkshop [data-go="workshop"]').click();await page.locator('.workshopModuleGridV50').waitFor();assert.equal(new URL(page.url()).pathname,'/workshop');
 const modules=await page.locator('.workshopModuleGridV50 [data-go]').evaluateAll(els=>els.map(e=>e.dataset.go));assert.equal(new Set(modules).size,7);
 await page.evaluate(()=>PSC_NAVIGATE('home'));await page.locator('.psHomeGuide').first().focus();await page.keyboard.press('Enter');await page.locator('.workshopArticleHeaderV50 h1').waitFor();assert.equal(new URL(page.url()).pathname,'/'+featured[0].route);
 await page.goBack();await page.locator('.psHomeWorkshop').waitFor();
 for(const f of featured.slice(1)){await page.locator('.psHomeGuide[data-go="'+f.route+'"]').click();await page.locator('.workshopArticleHeaderV50 h1').waitFor();assert.equal(new URL(page.url()).pathname,'/'+f.route);await page.goBack();await page.locator('.psHomeWorkshop').waitFor();}
 for(const g of guides){
  await page.evaluate(slug=>PSC_NAVIGATE('workshop/'+slug),g.slug);await page.waitForFunction(title=>document.querySelector('.workshopArticleHeaderV50 h1')?.textContent===title,g.title);assert.equal(new URL(page.url()).pathname,'/workshop/'+g.slug);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('main h1').innerText(),g.title);assert.deepEqual(await page.locator('.workshopArticleBody h2').allTextContents(),g.sections);
  assert.deepEqual(await page.locator('.workshopSignatureV50>article>p').allTextContents(),g.signature,'Original guidance stays intact');
  await fits();
  const invalid=await page.locator('.workshopSignatureV50>article,.workshopComparisonV50>article,.workshopRelatedList>button,.workshopArticleBody,.workshopArticleActions').evaluateAll(els=>els.flatMap(e=>{
   const b=e.getBoundingClientRect();if(!e.getClientRects().length)return [];
   const bad=[...e.querySelectorAll('p,span,strong,b,small')].filter(x=>x.getClientRects().length).flatMap(x=>{const r=x.getBoundingClientRect();const range=document.createRange();range.selectNodeContents(x);return [...range.getClientRects()].filter(t=>t.width>0&&(t.left<b.left-2||t.right>b.right+2)).map(()=>x.textContent.slice(0,70));});
   if(e.matches('.workshopSignatureV50>article')){const p=e.querySelector('p').getBoundingClientRect();if(p.width<b.width*.70)bad.push('Summary paragraph is squeezed into a narrow column');}
   return bad.map(text=>({element:e.className,text}));
  }));assert.deepEqual(invalid,[],width+'/'+g.slug+' text containment');
  assert.equal(await page.locator('.workshopArticleActions>button').evaluateAll(els=>els.filter(e=>e.getBoundingClientRect().height<43).length),0);
  const rail=page.locator('.workshopArticleRailV50>button');assert(!/[→↗]/.test(await rail.innerText()));
  if(g.slug==='oxygen-cylinder-is-not-an-oxygen-system'){await page.locator('.workshopSignatureV50').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/'+width+'-oxygen-summary.png'});await rail.click();await page.locator('.workshopModuleHeroV50 h1').waitFor();assert.match(await page.locator('h1').innerText(),/Equipment Readiness/);}
  results.push({width,slug:g.slug,contentPreserved:true,textContained:true,errors:[]});
 }
 await page.goto(base+'/workshop/which-glove-should-i-actually-wear');const save=page.locator('[data-workshop-save]');await save.waitFor();await save.click();assert.equal(await save.getAttribute('aria-pressed'),'true');await page.reload();await save.waitFor();assert.equal(await save.getAttribute('aria-pressed'),'true');await save.click();assert.equal(await save.getAttribute('aria-pressed'),'false');
 assert.deepEqual(await page.evaluate(()=>__backendCalls.filter(c=>c.rpc||(c.action&&c.action!=='select'))),[]);assert.deepEqual(errors,[]);
 await ctx.close();console.log(width+'px: home entry, three guide links, '+guides.length+' complete articles and saved-guide behavior PASS');
}writeFileSync(out+'/QA.json',JSON.stringify(results,null,2));}finally{await browser.close();server.close();}
