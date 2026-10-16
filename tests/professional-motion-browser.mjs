// Real browser verification of state-first motion, focus, scrolling and preferences.
import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const rows=JSON.parse(readFileSync('docs/verified-preview-variant-register.json'));
const family=rows.find(r=>rows.filter(v=>v.family_id===r.family_id).length>1);
const variants=rows.filter(r=>r.family_id===family.family_id);
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
mkdirSync('test-results/motion',{recursive:true});
const settle=page=>page.waitForFunction(()=>!document.querySelector('[data-motion-ghost]'));
try{for(const width of [1440,390])for(const reducedMotion of ['no-preference','reduce']){
 const context=await browser.newContext({viewport:{width,height:950},reducedMotion});
 await context.addInitScript(()=>{window.__testRole='demo';window.__adds=[];document.addEventListener('psc:request-added',e=>window.__adds.push(e.detail));});
 await context.route('**/*',r=>{const host=new URL(r.request().url()).hostname;return host==='127.0.0.1'?r.continue():r.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8'):''});});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=`http://127.0.0.1:${server.address().port}`;
 await page.goto(base+'/#portal/catalogue/allergy');await page.locator('.productCard').first().waitFor();
 await page.locator('[data-product-view="PS-AC-417F1BC9E425"]').first().click();
 await page.locator('[data-request-quantity]').fill('10');
 // Two additions in the same JS task: no animation lock, stale input or lost quantity.
 await page.evaluate(()=>{document.querySelector('.requestAddButton').click();document.querySelector('.requestAddButton').click();});
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.requestAddButton')).backgroundColor==='rgb(229, 245, 241)');
 assert.equal(await page.evaluate(()=>window.__adds.length),2);
 assert.equal(await page.locator('[data-request-quantity]').inputValue(),'10');
 assert.equal(await page.evaluate(()=>window.__adds.at(-1).total),20);
 assert.equal(await page.locator('.toast[role="status"]').count(),1);
 await page.locator('[data-request-quantity]').fill('10000');await page.locator('.requestAddButton').click();
 assert.equal(await page.evaluate(()=>window.__adds.length),2,'Rejected add must never confirm');
 const exitState=await page.evaluate(()=>{
  const image=document.querySelector('.detailProductImageWrap img'),before=image?.getBoundingClientRect();
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  const ghost=document.querySelector('[data-motion-ghost]'),after=ghost?.querySelector('.detailProductImageWrap img')?.getBoundingClientRect();
  return {unlocked:getComputedStyle(document.body).overflow!=='hidden',inert:!ghost||ghost.inert,photoStable:!after||Math.abs(after.width-before.width)<1&&Math.abs(after.height-before.height)<1};
 });
 assert(exitState.unlocked&&exitState.inert&&exitState.photoStable,JSON.stringify(exitState));
 await settle(page);
 assert.equal(await page.locator('.fluidOverlay').count(),0);
 assert.equal(await page.evaluate(()=>document.activeElement?.dataset.productView),'PS-AC-417F1BC9E425');
 await page.locator('[data-basket]:visible').first().click();
 await page.locator('.requestDrawer').waitFor();
 await page.locator('[data-basket-delta="PS-AC-417F1BC9E425|1"]').click();
 assert.equal(await page.locator('[data-basket-delta="PS-AC-417F1BC9E425|1"]').evaluate(el=>el===document.activeElement),true);
 assert.equal(await page.locator('.requestDrawer').evaluate(el=>getComputedStyle(el).animationName),'none','Quantity update must not replay drawer entrance');
 await page.keyboard.press('Escape');await settle(page);
 await page.evaluate(id=>window.PSC_OPEN_FAMILY_DETAIL(id),family.family_id);
 await page.locator('[data-family-variant]').selectOption(variants[0].product_option_id);
 await page.evaluate(()=>{window.__sheet=document.querySelector('.pscFamilyModalShell');const scroller=document.querySelector('.pscFamilyProductSheet');scroller.scrollTop=120;window.__scroll=scroller.scrollTop;});
 await page.locator('[data-family-variant]').selectOption(variants[1].product_option_id);
 assert.equal(await page.evaluate(()=>window.__sheet===document.querySelector('.pscFamilyModalShell')),true);
 assert.equal(await page.locator('[data-family-variant]').evaluate(el=>document.activeElement===el),true);
 // Scroll established after selector auto-scrolling, then change synchronously.
 await page.evaluate(id=>{const scroller=document.querySelector('.pscFamilyProductSheet');scroller.scrollTop=120;const before=scroller.scrollTop;const select=document.querySelector('[data-family-variant]');select.value=id;select.dispatchEvent(new Event('change',{bubbles:true}));window.__scrollStable=before===document.querySelector('.pscFamilyProductSheet').scrollTop;},variants[0].product_option_id);
 assert.equal(await page.evaluate(()=>window.__scrollStable),true);
 const summary=page.locator('.productDisclosureList summary').first();await summary.click();
 assert.equal(await summary.evaluate(el=>el.parentElement.open),true);
 await page.locator('.productBackButton').focus();await page.keyboard.press('Shift+Tab');
 assert.equal(await page.evaluate(()=>document.activeElement.hasAttribute('data-family-quote')),true,'Focus stays within dialog');
 if(reducedMotion==='reduce'){
  assert.equal(await page.evaluate(()=>window.PSC_MOTION.reduced()),true);
  assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.effect?.getTiming().duration>1).length),0);
 }
 await page.locator('.pscFamilyPreview img').evaluate(img=>img.decode());
 await page.screenshot({path:`test-results/motion/${width}-${reducedMotion}.png`});
 await page.keyboard.press('Escape');await settle(page);
 // Slow reads show a truthful placeholder and closing cancels the pending presentation.
 await page.evaluate(id=>{const original=window.PSC_SUPABASE;window.__originalSb=original;window.PSC_SUPABASE={from(){const query=new Proxy({}, {get:(_,key)=>key==='then'?(resolve=>setTimeout(()=>resolve({data:null,error:null}),450)):(()=>query)});return query;}};window.PSC_OPEN_FAMILY_DETAIL(id);},family.family_id);
 await page.locator('.pscProductLoading').waitFor();await page.keyboard.press('Escape');
 await page.waitForTimeout(500);await settle(page);
 assert.equal(await page.locator('[data-psc-family-detail-root]').count(),0,'A late read cannot reopen a closed dialog');
 await page.evaluate(()=>{window.PSC_SUPABASE=window.__originalSb;window.__navigationMarker=true;window.PSC_NAVIGATE('portal/dashboard');});
 await page.waitForFunction(()=>window.PSC_CURRENT_ROUTE()==='portal/dashboard');
 assert.equal(await page.evaluate(()=>window.__navigationMarker),true,'Portal navigation retains the document');
 assert.deepEqual(errors,[]);await context.close();console.log(`${width}px ${reducedMotion}: rapid exact additions, truthful feedback, stable variant shell/scroll, keyboard focus, exit, slow read PASS`);
}}finally{await browser.close();server.close();}
