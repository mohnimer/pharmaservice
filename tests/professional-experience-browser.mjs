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
 assert.equal(await page.locator('.psHome h1').innerText(),'Healthcare procurement for institutions.');assert.equal(await page.locator('.psHome .psEyebrow').count(),0);assert.match(await page.locator('.h47HeroPhoto').evaluate(el=>getComputedStyle(el).backgroundImage),/v44-10-5-home-hero-desktop/);
 assert(await page.locator('.psHomeSearch').count());assert.equal(await page.locator('.psHeroComposition').count(),0);
 assert.equal(await page.locator('.psClinicalTile').count(),6);assert.equal(await page.locator('.psBasketCard').count(),0);await noOverflow();
 await page.screenshot({path:`${out}/${width}-home.png`,fullPage:true});
 await page.locator('summary[aria-label="Browse website"]').click();await page.locator('#psBrowseMenu').waitFor();assert(await page.locator('#psBrowseMenu [data-go="start"]').isVisible());await page.screenshot({path:`${out}/${width}-menu.png`});await page.locator('#psBrowseMenu [data-go="ready-baskets"]').click();
 await page.locator('.psBasketGallery').waitFor();assert.equal(await page.locator('.psBasketScene img').count(),3);for(const img of await page.locator('.psBasketScene img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());assert(await img.evaluate(el=>el.naturalWidth===1536&&el.naturalHeight===1024));}await page.locator('[data-ready-basket="clinic-opening"]').click();await page.locator('#mvpLoginEmail').waitFor();assert.equal(await page.evaluate(()=>sessionStorage.getItem('pscPendingReadyBasket')),'clinic-opening');
 // Existing sign-in resumes the exact intended basket, using a transport fixture.
 // Allow the protected-route redirect's native hashchange render to finish before typing.
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.locator('#mvpLoginEmail').fill('test@example.invalid');await page.locator('#mvpLoginPassword').fill('fixture-password');await page.locator('[data-mvp-login]').click();await page.locator('#psReadyBasketDialog').waitFor();
 assert.equal(await page.locator('[data-basket-include="site-list"]').isChecked(),false);assert(await page.locator('.psBasketReviewNote').isVisible());assert(await page.locator('.psBasketDha').count()>0);
 const snapshot=await page.evaluate(()=>{const p=PSC_DATA.products.find(p=>p.pscSku==='PSC-DIA-008');return {name:p.name,pack:p.pack,condition:p.dhaCondition||''};});const dialogText=await page.locator('#psReadyBasketDialog').innerText();assert(dialogText.includes(snapshot.name));assert(dialogText.includes(snapshot.pack));if(snapshot.condition)assert(dialogText.includes(snapshot.condition));
 assert.equal(await page.locator('#app').evaluate(el=>el.inert),true);
 await page.locator('[data-basket-qty="stethoscope|1"]').click();assert.equal(await page.locator('[data-basket-quantity="stethoscope"]').inputValue(),'2');
 await page.locator('[data-basket-include="site-list"]').check();await page.locator('[data-basket-template-add]').click();await page.locator('#psReadyBasketDialog').waitFor({state:'detached'});
 assert.equal(await page.locator('#app').evaluate(el=>el.inert),false);await ctx.addInitScript(()=>window.__testRole='member');await page.reload();await page.locator('.psBasketGallery').waitFor();
 let saved=await page.evaluate(()=>JSON.parse((localStorage.getItem('pscClinicPortalStateV12_1:u1')||localStorage.getItem('pscClinicPortalStateV12_1'))).basket);assert.equal(saved.find(l=>l.sku==='PSC-DIA-008').qty,2);assert(saved.some(l=>l.kind==='unlisted'));
 // Replenishment doesn't rebuy equipment; selected requirement keeps original ID and pack.
 await page.locator('[data-ready-basket="first-aid-rollout"]').click();await page.locator('[data-basket-mode="replenishment"]').click();assert.equal(await page.locator('[data-basket-line="container"]').count(),0);await page.locator('[data-basket-template-add]').click();
 await page.locator('.pillBasket').click();await page.locator('.requestDrawer').waitFor();assert.match(await page.locator('.requestDrawer').innerText(),/planning preview/);
 await page.locator('[data-basket-delta="PSC-DIA-008|1"]').click();assert.match(await page.locator('.requestDrawer').innerText(),/Stethoscope/);await page.locator('button[data-close-basket]').click();
 // Reopen the actual registered scope from the native basket route.
 await go('portal/baskets');await page.locator('[data-ready-basket="clinic-opening"]').click();await page.locator('#psReadyBasketDialog').waitFor();
 await page.screenshot({path:`${out}/${width}-basket.png`});await page.keyboard.press('Escape');assert.equal(await page.locator('#psReadyBasketDialog').count(),0);
 // Native account history/reorder and RFQ remain reachable, not a duplicate navigation system.
 await go('portal/requests');await page.locator('.appShell').waitFor();await noOverflow();await go('portal/replenish');await page.locator('.appShell').waitFor();await noOverflow();
 await go('start');await page.locator('[name="rfq_file"]').waitFor();assert(await page.locator('[name="requirement"]').isVisible());
 await go('home');await page.locator('#psHomeCommand').fill('large sterile gauze');await page.locator('.psHomeSearch button').click();await page.locator('.psInterpretation').waitFor();assert.match(await page.locator('.psInterpretation').innerText(),/gauze/i);await noOverflow();
 assert.deepEqual(errors,[]);summary.push({width,approvedHeroRestored:true,noEyebrows:true,noPromotionalPackshots:true,oneNativeHeader:true,signInResume:true,atomicSavedDraft:true,requestEditable:true,replenishment:true,institutionalScopeReview:true,rfqAndHistory:true,pageErrors:errors,overflow:false});await ctx.close();
 // Anonymous category and search gates preserve the pending intent.
 const anon=await browser.newContext({viewport:{width,height:900}});await anon.addInitScript(()=>window.__testRole='anonymous');await anon.route('**/*',r=>{const host=new URL(r.request().url()).hostname;return host==='127.0.0.1'?r.continue():r.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8'):''});});const a=await anon.newPage();await a.goto('http://127.0.0.1:'+server.address().port+'/#home');await a.locator('.psClinicalTile').first().click();await a.locator('#mvpLoginEmail').waitFor();assert.equal(await a.evaluate(()=>sessionStorage.getItem('pscPendingRoute')),'portal/catalogue/wounds');await a.evaluate(()=>PSC_NAVIGATE('home'));await a.locator('#psHomeCommand').fill('wheelchair');await a.locator('.psHomeSearch button').click();await a.locator('#mvpLoginEmail').waitFor();assert.equal(await a.evaluate(()=>sessionStorage.getItem('pscPendingSearch')),'wheelchair');await anon.close();
 console.log(`${width}: homepage, mobile navigation, account resume, exact basket/request persistence, scope review, history/reorder, RFQ and intelligent search PASS`);
}writeFileSync(`${out}/QA.json`,JSON.stringify(summary,null,2));}finally{await browser.close();server.close();}
