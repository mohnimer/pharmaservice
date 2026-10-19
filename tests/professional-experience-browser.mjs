// Customer journeys with all external transport isolated. No real account or enquiry is submitted.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
const out='test-results/professional-experience';mkdirSync(out,{recursive:true});const summary=[];
try{for(const width of [320,390,768,1440]){
 const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:width===320?'reduce':'no-preference'});
 await ctx.addInitScript(()=>window.__testRole='anonymous');
 await ctx.route('**/*',r=>{const host=new URL(r.request().url()).hostname;if(host==='127.0.0.1')return r.continue();return r.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8'):''});});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const go=async route=>{await page.evaluate(r=>window.PSC_NAVIGATE(r),route);await page.waitForTimeout(200);};
 const noOverflow=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width}: horizontal overflow`);
 await page.goto('http://127.0.0.1:'+server.address().port+'/#home');await page.locator('.psHome').waitFor();await page.waitForTimeout(250);
 assert.equal(await page.locator('[data-ps-scroll-header]').count(),1);assert.equal(await page.locator('.psHome h1').count(),1);
 assert.match(await page.locator('.psHome h1').innerText(),/From requirement/);assert.match(await page.locator('.psHeroLead').innerText(),/All in one place/);
 const searchBox=await page.locator('.psHomeSearch').boundingBox();assert(searchBox.y+searchBox.height<900,'Search must be immediately useful above fold');
 assert.equal(await page.locator('.psClinicalTile').count(),6);assert.equal(await page.locator('.psBasketCard').count(),3);await noOverflow();
 await page.screenshot({path:`${out}/${width}-home.png`,fullPage:true});
 if(width<=980){await page.locator('[data-public-menu]').click();await page.locator('.publicNav.open').waitFor();assert(await page.locator('.publicNav [data-go="start"]').isVisible());await page.screenshot({path:`${out}/${width}-menu.png`});await page.locator('.publicNav [data-go="ready-baskets"]').click();}else await page.locator('.publicNav [data-go="ready-baskets"]').click();
 await page.locator('.psBasketGallery').waitFor();await page.locator('[data-ready-basket="glucose-monitoring"]').click();await page.locator('#mvpLoginEmail').waitFor();assert.equal(await page.evaluate(()=>sessionStorage.getItem('pscPendingReadyBasket')),'glucose-monitoring');
 // Existing sign-in resumes the exact intended basket, using a transport fixture.
 await page.locator('#mvpLoginEmail').fill('test@example.invalid');await page.locator('#mvpLoginPassword').fill('fixture-password');await page.locator('[data-mvp-login]').click();await page.locator('#psReadyBasketDialog').waitFor();
 assert.equal(await page.locator('[data-basket-include="strips"]').isChecked(),false);assert(await page.locator('.psBasketReviewNote').isVisible());assert(await page.locator('.psBasketDha').count()>0);
 const snapshot=await page.evaluate(()=>{const p=PSC_DATA.products.find(p=>p.pscSku==='PSC-DBT-001');return {name:p.name,pack:p.pack,condition:p.dhaCondition||''};});const dialogText=await page.locator('#psReadyBasketDialog').innerText();assert(dialogText.includes(snapshot.name));assert(dialogText.includes(snapshot.pack));if(snapshot.condition)assert(dialogText.includes(snapshot.condition));
 assert.equal(await page.locator('#app').evaluate(el=>el.inert),true);
 await page.locator('[data-basket-qty="meter|1"]').click();assert.equal(await page.locator('[data-basket-quantity="meter"]').inputValue(),'2');
 await page.locator('[data-basket-include="lancing"]').check();await page.locator('[data-basket-template-add]').click();await page.locator('#psReadyBasketDialog').waitFor({state:'detached'});
 assert.equal(await page.locator('#app').evaluate(el=>el.inert),false);await ctx.addInitScript(()=>window.__testRole='member');await page.reload();await page.locator('.psBasketGallery').waitFor();
 let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('pscClinicPortalStateV12_1')).basket);assert.equal(saved.find(l=>l.sku==='PSC-DBT-001').qty,2);assert(saved.some(l=>l.kind==='unlisted'));
 // Replenishment doesn't rebuy equipment; selected requirement keeps original ID and pack.
 await page.locator('[data-ready-basket="nebulizer-setup"]').click();await page.locator('[data-basket-mode="replenishment"]').click();assert.equal(await page.locator('[data-basket-line="compressor"]').count(),0);await page.locator('[data-basket-template-add]').click();
 await page.locator(width<=980?'.mobileCartButton':'.pillBasket').click();await page.locator('.requestDrawer').waitFor();assert.match(await page.locator('.requestDrawer').innerText(),/planning preview/);
 await page.locator('[data-basket-delta="PSC-DBT-001|1"]').click();assert.match(await page.locator('.requestDrawer').innerText(),/ACCU-CHEK/);await page.locator('button[data-close-basket]').click();
 // Exact product details offer a contextual preview through the native router.
 await go('portal/catalogue/diabetes');await page.locator('[data-product-view="PSC-DBT-001"]').first().click();await page.locator('[data-ready-entry="glucose-monitoring"]').waitFor();await page.locator('[data-ready-entry="glucose-monitoring"]').click();await page.locator('#psReadyBasketDialog').waitFor();
 await page.screenshot({path:`${out}/${width}-basket.png`});await page.keyboard.press('Escape');assert.equal(await page.locator('#psReadyBasketDialog').count(),0);
 // Native account history/reorder and RFQ remain reachable, not a duplicate navigation system.
 await go('portal/requests');await page.locator('.appShell').waitFor();await noOverflow();await go('portal/replenish');await page.locator('.appShell').waitFor();await noOverflow();
 await go('start');await page.locator('[name="rfq_file"]').waitFor();assert(await page.locator('[name="requirement"]').isVisible());
 await go('home');await page.locator('#psHomeCommand').fill('large sterile gauze');await page.locator('.psHomeSearch button').click();await page.locator('.psInterpretation').waitFor();assert.match(await page.locator('.psInterpretation').innerText(),/gauze/i);await noOverflow();
 assert.deepEqual(errors,[]);summary.push({width,searchAboveFold:true,oneNativeHeader:true,signInResume:true,atomicSavedDraft:true,requestEditable:true,replenishment:true,contextualBasket:true,rfqAndHistory:true,pageErrors:errors,overflow:false});await ctx.close();
 // Anonymous category and search gates preserve the pending intent.
 const anon=await browser.newContext({viewport:{width,height:900}});await anon.addInitScript(()=>window.__testRole='anonymous');await anon.route('**/*',r=>{const host=new URL(r.request().url()).hostname;return host==='127.0.0.1'?r.continue():r.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8'):''});});const a=await anon.newPage();await a.goto('http://127.0.0.1:'+server.address().port+'/#home');await a.locator('.psClinicalTile').first().click();await a.locator('#mvpLoginEmail').waitFor();assert.equal(await a.evaluate(()=>sessionStorage.getItem('pscPendingRoute')),'portal/catalogue/wounds');await a.evaluate(()=>PSC_NAVIGATE('home'));await a.locator('#psHomeCommand').fill('wheelchair');await a.locator('.psHomeSearch button').click();await a.locator('#mvpLoginEmail').waitFor();assert.equal(await a.evaluate(()=>sessionStorage.getItem('pscPendingSearch')),'wheelchair');await anon.close();
 console.log(`${width}: homepage, mobile navigation, account resume, exact basket/request persistence, contextual setup, history/reorder, RFQ and intelligent search PASS`);
}writeFileSync(`${out}/QA.json`,JSON.stringify(summary,null,2));}finally{await browser.close();server.close();}
