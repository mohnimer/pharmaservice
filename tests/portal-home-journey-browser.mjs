// Task-first customer home. Every account record and transaction transport is isolated.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox']});
const out='test-results/portal-home';mkdirSync(out,{recursive:true});const results=[];
const fixture=`(()=>{const t=window.__tables;t.orders=[
 {id:'quote',school_id:'s1',group_id:'g1',order_number:'TEST-QUOTE',status:'quote_sent',created_at:'2026-09-01'},
 {id:'delivery',school_id:'s1',group_id:'g1',order_number:'TEST-DELIVERY',status:'out_for_delivery',created_at:'2026-10-18'},
 {id:'done',school_id:'s1',group_id:'g1',order_number:'TEST-DELIVERED',status:'delivered',created_at:'2026-08-01',delivered_at:'2026-08-05'},
 {id:'other',school_id:'s2',group_id:'g1',order_number:'OTHER-SITE',status:'quote_sent',created_at:'2026-10-19'}];
 t.order_lines=t.orders.map(o=>({id:'line-'+o.id,order_id:o.id,psc_sku_snapshot:'PSC-WND-002',quantity:3,unit_price:20,vat_rate:5}));
 t.quotes=[{id:'q',order_id:'quote',quote_number:'QUOTE-READY',validity_days:7}];t.quote_lines=[];t.order_documents=[];})();`;
try{for(const width of [320,390,768,1440])for(const empty of [false,true]){
 const ctx=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'});await ctx.addInitScript(()=>window.__testRole='member');
 await ctx.route('**/*',r=>{const host=new URL(r.request().url()).hostname;if(host==='127.0.0.1')return r.continue();return r.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8')+fixture+(empty?';window.__tables.orders=[];window.__tables.order_lines=[];window.__tables.quotes=[];':''):''});});
 const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));const base='http://127.0.0.1:'+server.address().port;
 const home=async()=>{await p.evaluate(()=>PSC_NAVIGATE('portal/dashboard'));await p.locator('.psPortalHome').waitFor();};
 await p.goto(base+'/#portal/dashboard');await p.locator('.psPortalHome').waitFor();await p.waitForTimeout(150);
 assert.equal(await p.locator('.psPortalHome h1').innerText(),'Your clinic. Ready for what’s next.');
 const search=await p.locator('.psPortalSearch').boundingBox();assert(search.y+search.height<650,'Search is the first useful action');
 assert(await p.locator('[data-account-switcher]').isVisible());assert(await p.locator('.campusPillMain b').isVisible(),'Current site remains visible');
 assert.equal(await p.locator('.psPortalHome .eyebrow,.psPortalHome .psEyebrow').count(),0);
 assert.equal(await p.locator('.psPortalBasketGrid [data-ready-basket]').count(),3);assert.equal(await p.locator('.pscHomeDha').count(),3);
 assert.equal(await p.locator('.pscHomeCategoryIcon img').count(),6);assert.equal(await p.locator('.pscHomeCategoryIcon svg').count(),0);assert(!(await p.locator('.psPortalBasketGrid').innerText()).includes('Preview · review before quotation'));
 for(const img of await p.locator('.pscHomeCategoryIcon img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());assert(await img.evaluate(el=>el.naturalWidth>0));}await p.evaluate(()=>scrollTo(0,0));

 assert.equal(await p.locator('.psPortalWorkshopGrid').count(),0,'Workshop is a compact help entry, not seven home modules');
 assert(!(await p.locator('.psPortalHome').innerText()).includes('OTHER-SITE'),'No other-site activity leaks');
 if(empty){assert.equal(await p.locator('.psPortalActivity').count(),0);assert.match(await p.locator('.psPortalNoActivity').innerText(),/No requests in progress/);assert(!(await p.locator('.psPortalAttention').innerText()).includes('ready.'));}
 else{assert.equal(await p.locator('.psPortalActivity').count(),2);assert.equal(await p.locator('.psPortalActivity').first().getAttribute('data-request-view'),'TEST-QUOTE','Older quotation ranks ahead of newer delivery');await p.locator('.psPortalActivity').first().click();await p.locator('.modalBackdrop .modal').waitFor();await p.locator('.modalHeader button[data-modal-close]').click();}
 await p.locator('.buyerTaskLinks [data-go="start"]').click();await p.locator('[name="rfq_file"]').waitFor();await home();
 await p.locator('#psPortalCommand').fill('large sterile gauze');await p.locator('.psPortalSearch button').click();await p.locator('.psInterpretation').waitFor();assert.match(await p.locator('.psInterpretation').innerText(),/gauze/i);await home();
 await p.locator('[data-ready-basket="clinic-restock"]').click();await p.locator('#psReadyBasketDialog').waitFor();await p.locator('[data-basket-template-add]').click();await p.locator('#psReadyBasketDialog').waitFor({state:'detached'});await p.locator('.psPortalDraft.hasDraft').waitFor();
 const before=await p.evaluate(()=>JSON.parse((localStorage.getItem('pscClinicPortalStateV12_1:u1')||localStorage.getItem('pscClinicPortalStateV12_1'))).basket);assert(before.length>0);
 await p.locator('.psPortalDraft [data-basket]').click();await p.locator('.requestDrawer').waitFor();assert.match(await p.locator('.requestDrawer').innerText(),/planning preview/);await p.locator('button[data-close-basket]').click();
 await p.locator('[data-account-switcher]').click();await p.locator('[data-school-select="s2"]').click();await p.locator('.psPortalDraft:not(.hasDraft)').waitFor({state:'attached'});assert.equal(await p.locator('.psPortalDraft.hasDraft').count(),0);if(!empty)assert((await p.locator('.psPortalAttention').innerText()).includes('OTHER-SITE'));
 await p.locator('[data-account-switcher]').click();await p.locator('[data-school-select="s1"]').click();await p.locator('.psPortalDraft.hasDraft').waitFor();assert.equal(await p.evaluate(()=>JSON.parse((localStorage.getItem('pscClinicPortalStateV12_1:u1')||localStorage.getItem('pscClinicPortalStateV12_1'))).basket.length),before.length);
 await p.locator('.buyerActionGrid [data-go="portal/replenish"]').click();await p.waitForURL('**/#portal/replenish');if(!empty)assert.equal(await p.locator('.replenishCard').count(),1);await home();
 await p.locator('.buyerActionGrid [data-go="portal/documents"]').click();await p.locator('.documentsIndexPanel').waitFor();await home();
 assert.equal(await p.locator('.buyerActionGrid .buyerAction').count(),4);if(!empty){await p.locator('.buyerRecentSupply [data-reorder-order]').first().click();await p.locator('.requestDrawer').waitFor();assert(await p.evaluate(()=>JSON.parse(localStorage.getItem('pscClinicPortalStateV12_1:u1')).basket.some(l=>l.repeatSource==='TEST-DELIVERED')));await p.locator('button[data-close-basket]').click();}
 await p.locator('.psPortalHelp [data-go="workshop/product-basics"]').click();await p.locator('.workshopModuleHeroV50').waitFor();await home();
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No page overflow; basket rail scrolls inside its own region');
 assert.deepEqual(await p.evaluate(()=>__backendCalls.filter(c=>c.rpc||(c.action&&c.action!=='select'))),[],'Home never sends an order or performs a backend write');assert.deepEqual(errors,[]);
 await p.screenshot({path:`${out}/${width}-${empty?'empty':'active'}-with-draft.png`,fullPage:true});results.push({width,empty,search:true,quotationPriority:!empty,siteIsolation:true,draftContinuity:true,basket:true,rfq:true,reorder:true,documents:true,help:true,writes:0,errors});await ctx.close();console.log(`${width}/${empty?'empty':'active'}: portal tasks and site-isolated request continuity PASS`);
}writeFileSync(out+'/QA.json',JSON.stringify(results,null,2));}finally{await browser.close();server.close();}
