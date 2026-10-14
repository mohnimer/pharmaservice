import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox','--disable-dev-shm-usage']});
const ctx=await browser.newContext({viewport:{width:1440,height:1080}});await ctx.addInitScript(()=>window.__testRole='admin');
const extension=`(()=>{window.__tables.products=[{id:'photo-product',psc_sku:'PHOTO-TEST',name:'Test photograph product',pack:'1 unit',active:true,clinical_needs:[]}];window.__tables.storefront_product_settings=[];window.__tables.product_media=[];window.__photoUploads=[];window.supabase.createClient().storage={from:()=>({upload:async(path,file)=>{window.__photoUploads.push({path,size:file.size});return {error:null};},getPublicUrl:path=>({data:{publicUrl:location.origin+'/assets/products/clean-20261014/cordx-flu-covid-rsv-self-test.jpg'}})})};})();`;
await ctx.route('**/*',r=>{const host=new URL(r.request().url()).hostname;if(host==='127.0.0.1')return r.continue();return r.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8')+extension:''});});
try{const page=await ctx.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/#admin/products/photo-product`);await page.locator('[data-cms-image-upload]').waitFor({state:'attached'});
const input=page.locator('[data-cms-image-upload]'),save=page.locator('[data-cms-image-save]');
await input.setInputFiles('assets/products/clean-20261014/cordx-flu-covid-rsv-self-test.jpg');await page.locator('.cmsPhotoDraft').waitFor();assert.equal(await page.evaluate(()=>window.__photoUploads.length),0,'Selecting a file uploaded it before review');
await save.click();await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>window.__photoUploads.length),0,'Unreviewed photo uploaded');
const checks=page.locator('[data-cms-image-review] input');for(const c of await checks.all())await c.check();
await input.setInputFiles({name:'renamed-photo.jpg',mimeType:'image/jpeg',buffer:readFileSync('assets/products/supplier-20261014/cordx_influenza_a_b_plus_covid_19_plus_rsv_combo_ag_self_test.jpg')});for(const c of await checks.all())await c.check();await save.click();await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>window.__photoUploads.length),0,'Renamed branded photo uploaded');
await input.setInputFiles('assets/products/clean-20261014/cordx-flu-covid-rsv-self-test.jpg');for(const c of await checks.all())await c.check();await save.click();await page.waitForFunction(()=>window.__photoUploads.length===1);await page.waitForTimeout(200);
assert(await page.evaluate(()=>window.__tables.product_media.every(m=>m.published===false&&m.published_institutional===false&&m.published_wholesale===false)),'Upload published before channel approval');
mkdirSync('test-results/photo-standard',{recursive:true});await page.screenshot({path:'test-results/photo-standard/admin-upload.png',fullPage:true});console.log('PASS: local preview, visual-review gate, renamed supplier-image rejection, reviewed clean upload stays draft; mocked storage only');
}finally{await ctx.close();await browser.close();server.close();}
