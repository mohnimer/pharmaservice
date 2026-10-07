import {readFileSync, mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox']});
mkdirSync('test-results',{recursive:true});const results=[];
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900}});
  await context.addInitScript(()=>{window.__testRole='demo';});
  await context.route('**/*',route=>{
   const u=new URL(route.request().url());
   if(u.hostname==='127.0.0.1')return route.continue();
   if(u.hostname==='cdn.jsdelivr.net')return route.fulfill({contentType:'text/javascript',body:readFileSync('tests/mock-supabase.js','utf8')+`
window.__tables.catalogue_family_option_reference_public=[{family_id:'PSC-SC-C01',product_option_id:'test-am-20',exact_product_name: "AM WOUND PLASTER LONG 20'S",brand:'Am',presentation:null,pack:null}];`});
   return route.fulfill({status:200,body:''});
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/#portal/catalogue/wounds');await page.locator('.productCard').first().waitFor();
  await page.waitForTimeout(400);
  const frames=await page.locator('.productCard .productVisual:has(.productMainImage)').evaluateAll(nodes=>nodes.filter(n=>getComputedStyle(n.querySelector('.productMainImage')).display!=='none').map(n=>{
   const f=n.getBoundingClientRect(),i=n.querySelector('.productMainImage'),r=i.getBoundingClientRect(),s=getComputedStyle(i);
   return {height:f.height,width:f.width,imageWidth:r.width,inside:r.top>=f.top-1&&r.bottom<=f.bottom+1&&r.left>=f.left-1&&r.right<=f.right+1,fit:s.objectFit,transform:s.transform};
  }));
  assert(frames.length>5);
  for(const f of frames){assert(f.inside,JSON.stringify(f));assert(f.height>=140);assert(Math.abs(f.width-f.height)<2);assert(f.imageWidth>=f.width-3);assert.equal(f.fit,'contain');assert.equal(f.transform,'none');}
  assert.equal(new Set(frames.map(f=>Math.round(f.height))).size,1);
  await page.locator('.productCard').first().screenshot({path:`test-results/card-${width}.png`});
  await page.locator('[data-psc-family-open="PSC-SC-C01"]').click();await page.locator('.pscBrandTick').first().waitFor();
  assert.equal(await page.locator('.pscBrandTick .v449OptionThumb').count(),0);
  const imageCounts=await page.locator('.pscBrandTick').evaluateAll(nodes=>nodes.map(n=>n.querySelectorAll('img').length));
  assert(imageCounts.every(n=>n<=1));
  await page.locator('.pscBrandTick:has(.catalogueOptionImage)').first().screenshot({path:`test-results/option-${width}.png`});
  await page.goto(base+'/#portal/catalogue');assert.equal(await page.locator('[data-psc-family-detail-root]').count(),0);await page.locator('.v449CatalogueSearch input').waitFor();
  await page.locator('.v449CatalogueSearch input').pressSequentially('gauze',{delay:40});
  await page.waitForTimeout(400);assert.equal(new URL(page.url()).hash,'#portal/catalogue');
  assert.equal(await page.locator('.v449CatalogueSearch input').inputValue(),'gauze');
  await page.locator('.v449CatalogueSearch input').press('Enter');await page.locator('[data-cat-q]').waitFor();
  assert.equal(await page.locator('[data-cat-q]').inputValue(),'gauze');
  await page.locator('[data-cat-q]').fill('PIC CLASSIC');
  await page.waitForTimeout(300);assert.equal(await page.locator('[data-cat-q]').inputValue(),'PIC CLASSIC');
  assert.match(await page.locator('.productGrid').innerText(),/PIC CLASSIC/i);
  await page.locator('[data-cat-q]').press('Home');await page.locator('[data-cat-q]').pressSequentially('x',{delay:0});
  assert.equal(await page.locator('[data-cat-q]').inputValue(),'xPIC CLASSIC');
  await page.locator('[data-catalogue-clear]').click();assert.equal(await page.locator('[data-cat-q]').inputValue(),'');
  await page.locator('[data-cat-q]').pressSequentially('zzzznotfound',{delay:0});
  assert.equal(await page.locator('[data-cat-q]').inputValue(),'zzzznotfound');
  assert.equal(await page.locator('.productGrid .productCard').count(),0);
  await page.locator('[data-cat-q]').press('Escape');assert((await page.locator('.productGrid .productCard').count())>10);
  await page.locator('[data-cat-q]').fill('gauze');
  await page.evaluate(()=>window.PSC_NAVIGATE('portal/requests'));await page.locator('.customerShell').waitFor();
  assert((await page.locator('[data-global-search]').evaluateAll(nodes=>nodes.map(n=>n.value))).every(v=>v===''));
  await page.goBack();await page.locator('[data-cat-q]').waitFor();assert.equal(await page.locator('[data-cat-q]').inputValue(),'');
  await page.evaluate(()=>window.PSC_NAVIGATE('portal/catalogue/wounds'));await page.locator('[data-cat-q]').waitFor();assert.equal(await page.locator('[data-cat-q]').inputValue(),'');
  await page.locator('[data-cat-q]').fill('gauze');await page.reload();await page.locator('[data-cat-q]').waitFor();assert.equal(await page.locator('[data-cat-q]').inputValue(),'');
  const header=page.locator(width===390?'.mobileSearchRow [data-global-search]':'.topbarSearch [data-global-search]');
  await header.fill('NEXIUM 20');await header.press('Enter');await page.locator('[data-cat-q]').waitFor();
  assert.equal(await page.locator('[data-cat-q]').inputValue(),'NEXIUM 20');
  assert.match(await page.locator('.productGrid').innerText(),/NEXIUM/i);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(await page.evaluate(()=>window.__backendCalls.filter(c=>c.rpc||c.action!=='select')),[]);
  assert.deepEqual(errors,[]);results.push(`${width}px: uniform contained card photos, exact single option images, stable typing/caret, Enter search, multiword matches, clear/no-results/Escape, navigation/history/refresh reset, no overflow or backend writes`);
  await context.close();
 }
 console.log(JSON.stringify(results,null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
