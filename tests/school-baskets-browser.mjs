// Combined collection/portal release: native UI and isolated request transport only.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox']});
const out='test-results/school-collection-release';mkdirSync(out,{recursive:true});const results=[];
try{for(const width of [320,390,768,1440]){
 const ctx=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'});
 await ctx.addInitScript(()=>window.__testRole='member');
 await ctx.route('**/*',r=>{const host=new URL(r.request().url()).hostname;return host==='127.0.0.1'?r.continue():r.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8'):''});});
 const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:'+server.address().port;
 const navigate=async route=>{await p.evaluate(r=>PSC_NAVIGATE(r),route);await p.waitForTimeout(150);};
 const fits=async()=>assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No page overflow');
 await p.goto(base+'/#catalogue');await p.locator('.psSchoolBaskets').waitFor();
 assert.equal(await p.locator('[data-school-collection]').count(),3);assert.equal(await p.locator('.psSchoolCollectionIcon').count(),0);await p.locator('.psSchoolCollectionGrid').screenshot({path:`${out}/${width}-basket-icons.png`});
 await p.locator('[data-school-collection="opening"]').click();await p.locator('.psSchoolGroup').first().waitFor();
 assert.equal(await p.locator('.psSchoolHead .eyebrow').count(),0);
 assert.equal(await p.locator('.psSchoolLines li').count(),121,'113 planning rows plus eight site checks');
 assert(!/\bINST-\d{4}\b/.test(await p.locator('.psSchoolLines').allTextContents().then(x=>x.join(' '))),'Opening rows resolve to customer-readable names');
 const links=await p.locator('.psSchoolLines [data-public-product-view]').count();assert(links>90,'Existing requirement/product identities resolve to Details');
 for(const group of await p.locator('.psSchoolGroup').all())await group.locator('summary').click();
 await fits();await p.screenshot({path:`${out}/${width}-public-opening.png`,fullPage:true});
 await p.locator('.psSchoolGroup').first().locator('summary').click();await p.locator('.psSchoolLines [data-public-product-view]:visible').first().click();await p.locator('.professionalProductDetail').waitFor();
 await p.keyboard.press('Escape');await p.locator('.professionalProductDetail').waitFor({state:'detached'});
 await navigate('portal/catalogue');await p.locator('.psSchoolBaskets').waitFor();
 await p.locator('[data-school-collection="replenishment"]').click();
 assert.equal(await p.locator('.psSchoolGroup').count(),4);
 assert.equal(await p.locator('.psSchoolLines [data-product-view]').count(),26,await p.locator('.psSchoolLines').allTextContents().then(x=>x.join(' | ')));
 const first=await p.locator('.psSchoolLines [data-product-view]').first().getAttribute('data-product-view');
 await p.locator('.psSchoolGroup summary').first().click();await p.locator('.psSchoolLines [data-product-view]').first().click();
 await p.locator('.professionalProductDetail').waitFor();assert((await p.locator('.professionalProductDetail').innerText()).includes(first));
 await p.keyboard.press('Escape');await p.locator('.professionalProductDetail').waitFor({state:'detached'});
 await p.locator('[data-school-collection="kits"]').click();
 for(const id of ['general','sports','lab','canteen','mobile']){
  await p.locator(`[data-school-kit="${id}"]`).click();await p.locator(`[data-school-kit-request="${id}"]`).waitFor();
  const expected=await p.evaluate(id=>PS_SCHOOL_BASKETS.kits.find(k=>k.id===id),id);
  assert.equal(await p.locator('.psSchoolKitBody .psSchoolLines li').count(),expected.contents.length);
  await fits();await p.screenshot({path:`${out}/${width}-kit-${id}.png`,fullPage:true});
  await p.locator(`[data-school-kit-request="${id}"]`).click();await p.locator('.requestDrawer').waitFor();
  const line=await p.evaluate(()=>JSON.parse((localStorage.getItem('pscClinicPortalStateV12_1:u1')||localStorage.getItem('pscClinicPortalStateV12_1'))).basket.at(-1));
  assert.equal(line.kind,'unlisted');assert(!line.sku,'A kit concept is never a fabricated product SKU');
  for(const [label,rawId,pack]of expected.contents){assert(line.description.includes(label));if(rawId)assert(line.description.includes('['+rawId+']'));assert(line.description.includes(pack));}
  assert.match(line.description,/Proposed contents snapshot \(2026-10-19-v1\)/);
  await p.locator('button[data-close-basket]').click();
 }
 await p.locator('[data-school-collection="opening"]').click();await p.locator('[data-school-opening-request]').click();await p.locator('.requestDrawer').waitFor();
 assert.match(await p.locator('.requestDrawer').innerText(),/Medicines and facilities need separate approved scopes/);
 await p.locator('button[data-close-basket]').click();
 const before=await p.evaluate(()=>JSON.parse((localStorage.getItem('pscClinicPortalStateV12_1:u1')||localStorage.getItem('pscClinicPortalStateV12_1'))).basket);
 await navigate('portal/dashboard');await p.locator('.psPortalHome').waitFor();assert.equal(await p.locator('.pscHomeCategoryIcon img').count(),6);
 await p.locator('[data-account-switcher]').click();await p.locator('[data-school-select="s2"]').click();await p.locator('.psPortalDraft:not(.hasDraft)').waitFor({state:'attached'});
 await p.locator('[data-account-switcher]').click();await p.locator('[data-school-select="s1"]').click();await p.locator('.psPortalDraft.hasDraft').waitFor();
 assert.deepEqual(await p.evaluate(()=>JSON.parse((localStorage.getItem('pscClinicPortalStateV12_1:u1')||localStorage.getItem('pscClinicPortalStateV12_1'))).basket),before);
 assert.deepEqual(await p.evaluate(()=>__backendCalls.filter(c=>c.rpc||(c.action&&c.action!=='select'))),[]);
 await p.locator('.psPortalDraft [data-basket]').click();await p.locator('.requestDrawer').waitFor();
 await p.locator('[data-submit-request]').click();
 await p.waitForFunction(()=>__backendCalls.some(c=>c.rpc==='psc_submit_institutional_request'));
 const rpc=await p.evaluate(()=>__backendCalls.find(c=>c.rpc==='psc_submit_institutional_request'));
 assert.equal(rpc.args.p_lines.length,before.length);
 for(const draft of before){const line=rpc.args.p_lines.find(l=>l.line_description===draft.description);assert(line,'Displayed contents snapshot survives native submission unchanged');assert.equal(line.psc_sku_snapshot,null);assert.equal(line.product_id,null);assert.equal(line.quantity,1);}
 assert.deepEqual(errors,[]);results.push({width,openingRows:121,refillProducts:26,kits:5,contentsSnapshots:true,siteIsolation:true,isolatedSubmission:true,liveWrites:0,errors});
 await ctx.close();console.log(`${width}: combined school collections/details/kit snapshots/site isolation PASS`);
}writeFileSync(out+'/QA.json',JSON.stringify(results,null,2));}finally{await browser.close();server.close();}
