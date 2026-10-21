// Customer guide routes use native behavior with isolated account transport. No live sends or writes.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox']});
const out=process.env.PSC_MODEL_QA||'test-results/how-we-work';mkdirSync(out,{recursive:true});const results=[];
try{for(const width of [320,390,768,1440])for(const role of ['anonymous','member']){
 const ctx=await browser.newContext({viewport:{width,height:950},reducedMotion:width===768?'no-preference':'reduce'});
 await ctx.addInitScript(role=>window.__testRole=role,role);
 await ctx.route('**/*',r=>{const host=new URL(r.request().url()).hostname;if(host==='127.0.0.1'||['fonts.googleapis.com','fonts.gstatic.com'].includes(host))return r.continue();return r.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8'):''});});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const model=async()=>{await page.evaluate(()=>PSC_NAVIGATE('our-model'));await page.locator('[data-model-version="20261021"]').waitFor();};
 const fits=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),width+' page overflow');
 const draft=async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('pscClinicPortalStateV12_1')||'{}').basket||[]);
 await page.goto(base+'/#our-model');await page.locator('[data-model-version="20261021"]').waitFor();
 assert.equal(await page.locator('.model46>section').count(),5);assert.equal(await page.locator('main h1').count(),1);
 assert.equal(await page.locator('.model46 h1').innerText(),'One supply relationship.');
 assert.equal(await page.locator('.publicHeader').count(),1);assert.equal(await page.locator('.publicFooter').count(),1);
 assert.equal(await page.locator('.model46 .kicker,.model46 .eyebrow').count(),0);
 assert(!/[→↗↓]|MATCHED|CHECKED|SOURCED|\bREADY\b|PS intake|Monthly pattern visible/.test(await page.locator('.model46').innerText()));
 assert.equal(await page.locator('.m46Journey li').count(),5);
 for(const img of await page.locator('.model46 img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());assert(await img.evaluate(el=>el.naturalWidth>0));}
 await page.evaluate(()=>document.fonts.ready);await fits();
 const bad=await page.locator('.model46 button,.model46 summary').evaluateAll(els=>els.filter(e=>e.getClientRects().length).map(e=>({text:e.textContent.trim(),height:e.getBoundingClientRect().height,clipped:e.scrollWidth>e.clientWidth+1})).filter(e=>e.height<43||e.clipped));
 assert.deepEqual(bad,[],'Readable controls with 44px targets');
 const before=await draft();await page.evaluate(()=>scrollTo(0,0));
 assert.equal(await page.locator('.m46Faq details:not([open])>p').first().isVisible(),false,'Closed FAQ answers stay closed');
 assert.equal(await page.locator('.m46Faq .psDisclosurePreview:visible,.m46Faq .psDisclosurePlus:visible').count(),0,'No blurred previews or duplicate disclosure icons');
 await page.screenshot({path:out+'/'+width+'-'+role+'.png',fullPage:true});
 const summary=page.locator('.m46Faq summary').first();await summary.focus();await page.keyboard.press('Enter');
 assert.equal(await summary.evaluate(el=>el.parentElement.open),true);assert.match(await page.locator('.m46Faq details[open]').innerText(),/Retail prices.*references/s);await fits();
 await page.keyboard.press('Enter');assert.equal(await summary.evaluate(el=>el.parentElement.open),false);
 for(const id of ['opening','replenishment','kits']){
  await page.locator('[data-model-collection="'+id+'"]').click();await page.locator('.psSchoolCollectionPanel').waitFor();
  assert.equal(await page.locator('[data-school-collection="'+id+'"]').getAttribute('aria-pressed'),'true');
  await page.waitForFunction(id=>document.activeElement?.dataset.schoolCollection===id,id);
  assert.deepEqual(await draft(),before,'Browsing a collection never adds basket lines');
  if(id==='opening'){assert.equal(await page.locator('.psSchoolLines li').count(),121);await page.goBack();await page.locator('.model46').waitFor();}
  else await model();
 }
 for(const route of ['portal/dashboard','portal/requests','portal/documents','portal/replenish']){
  await page.locator('.model46 [data-go="'+route+'"]').click();
  if(role==='anonymous'){await page.locator('#mvpLoginEmail').waitFor();assert.equal(await page.evaluate(()=>sessionStorage.getItem('pscPendingRoute')),route);}
  else{await page.locator('.appShell').waitFor();assert.equal(await page.evaluate(()=>PSC_CURRENT_ROUTE()),route);}
  await fits();await model();
 }
 if(role==='anonymous'){
  await page.locator('.model46 [data-go="portal/documents"]').click();await page.locator('#mvpLoginEmail').waitFor();
  // The protected-route redirect queues a native hashchange render. Type only after it settles.
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.locator('#mvpLoginEmail').fill('test@example.invalid');await page.locator('#mvpLoginPassword').fill('fixture-password');await page.locator('[data-mvp-login]').click();
  try{await page.waitForFunction(()=>PSC_CURRENT_ROUTE()==='portal/documents');}catch(error){
   console.error('Sign-in resume state',await page.evaluate(()=>({route:PSC_CURRENT_ROUTE(),pending:sessionStorage.getItem('pscPendingRoute'),accountReady:!!PSC_ACCOUNT_CONTEXT?.(),emailPresent:!!document.querySelector('#mvpLoginEmail')?.value,passwordPresent:!!document.querySelector('#mvpLoginPassword')?.value,feedback:document.querySelector('.toast')?.textContent,reads:__backendCalls.filter(c=>c.action==='select').length})));throw error;
  }await page.locator('.appShell').waitFor();
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('pscPendingRoute')),null,'Existing resume flow consumes the account intent');await model();
 }
 await page.locator('.m46Actions [data-go="start"]').click();await page.locator('[name="rfq_file"]').waitFor();await model();
 await page.locator('.m46Actions [data-go="catalogue"]').click();await page.locator('.psSchoolBaskets').waitFor();await model();
 await page.evaluate(()=>PSC_OPEN_SCHOOL_COLLECTION('unknown'));assert.equal(await page.locator('.model46').count(),1);
 for(const alias of ['who-we-supply','what-we-supply','how-it-works']){await page.evaluate(alias=>PSC_NAVIGATE(alias),alias);await page.locator('.model46').waitFor();assert.equal(await page.locator('.model46').count(),1);assert.equal(await page.locator('main h1').count(),1);}
 assert.deepEqual(await draft(),before);
 assert.deepEqual(await page.evaluate(()=>__backendCalls.filter(c=>c.rpc||(c.action&&c.action!=='select'))),[]);
 assert.deepEqual(errors,[]);results.push({width,role,sections:5,collectionHandoffs:3,accountRoutes:4,aliases:3,keyboardDisclosure:true,keyboardFocus:true,draftUnchanged:true,liveWrites:0,errors});await ctx.close();
 console.log(width+'/'+role+': collections, account gates, RFQ, aliases and draft preservation PASS');
}writeFileSync(out+'/QA.json',JSON.stringify(results,null,2));}finally{await browser.close();server.close();}
