import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const data=JSON.parse(readFileSync('data/variant-photographs.json'));
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox','--disable-dev-shm-usage']});
mkdirSync('test-results/variant-photographs',{recursive:true});
try{for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:1000}});await context.addInitScript(()=>window.__testRole='demo');
 await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.fulfill({contentType:r.request().url().includes('cdn.jsdelivr.net')?'text/javascript':'text/plain',body:r.request().url().includes('cdn.jsdelivr.net')?readFileSync('tests/mock-supabase.js','utf8'):''}));
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/#portal/catalogue/all`);await page.waitForFunction(()=>window.PSC_OPEN_FAMILY_DETAIL&&window.PSC_SUPABASE);
 await page.addStyleTag({content:'*,*::before,*::after{animation-duration:0s!important;transition:none!important;scroll-behavior:auto!important}'});
 await page.evaluate(records=>{
  const orig=window.PSC_SUPABASE.from.bind(window.PSC_SUPABASE);
  window.PSC_SUPABASE.from=table=>{
   if(table!=='catalogue_family_option_reference_public')return orig(table);
   let family;const q={select(){return q},eq(k,v){family=v;return q},order(){return q},then(resolve){return Promise.resolve({data:records.filter(r=>r.family_id===family&&!r.sku).map(r=>({product_option_id:r.product_option_id,family_id:r.family_id,exact_product_name:r.exact_product_name,brand:r.brand,pack:r.pack,presentation:'Other / verify'})),error:null}).then(resolve)}};return q;
  };
  window.__photoRequests=[];window.addEventListener('psc:add-family-line',e=>window.__photoRequests.push(e.detail));
 },data.records);
 const decoded=await page.evaluate(async records=>Promise.all(records.map(async r=>{const i=new Image();i.src=r.image_url;await i.decode();return i.naturalWidth>0;})),data.records);assert(decoded.every(Boolean));
 let checked=0;
 for(const family of [...new Set(data.records.filter(r=>!r.runtime_only).map(r=>r.family_id))]){
  await page.evaluate(id=>window.PSC_OPEN_FAMILY_DETAIL(id),family);
  for(const row of data.records.filter(r=>r.family_id===family&&!r.runtime_only)){
   const input=page.locator(`[data-family-option="${row.product_option_id}"]`);
   await input.waitFor();await input.check();
   const photo=page.locator('.pscFamilyPreview>img');await photo.waitFor();assert.equal(await photo.getAttribute('src'),row.image_url);
   await photo.evaluate(i=>i.decode());assert(await photo.evaluate(i=>i.naturalWidth>0),row.exact_product_name);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await input.uncheck();checked++;
  }
  if(family==='PSC-SC-D02'){
   const row=data.records.find(r=>r.family_id===family&&r.exact_product_name==='BETADINE ANTISEPTIC SLN 120ML');
   await page.locator(`[data-family-option="${row.product_option_id}"]`).check();
   await page.waitForTimeout(300);await page.screenshot({path:`test-results/variant-photographs/${width}-betadine.png`});
   const presentation=page.locator('[data-family-presentation]').first();if(await presentation.count())await presentation.click();
   await page.locator('[data-family-quote]').click();
   const request=await page.evaluate(()=>window.__photoRequests.at(-1));assert(request.requestedProductOptions.some(o=>o.reference_product_option_id===row.product_option_id));
  }else await page.keyboard.press('Escape');
  console.log(width,family,checked);
 }
 assert.deepEqual(errors,[]);console.log(`${width}px PASS: ${checked} selected variant photos decoded, identity and horizontal layout checked`);await context.close();
}}finally{await browser.close();server.close();}
