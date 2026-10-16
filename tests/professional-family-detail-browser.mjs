// Screenshot-led mobile/desktop family detail simplification regression.
import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';

const server=createServer();
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
mkdirSync('test-results/family-detail',{recursive:true});
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:850}});
  await context.addInitScript(()=>{
   window.__testRole='demo';
   window.__familyRequests=[];
   window.addEventListener('psc:add-family-line',event=>window.__familyRequests.push(event.detail));
  });
  await context.route('**/*',route=>{
   const host=new URL(route.request().url()).hostname;
   if(host==='127.0.0.1')return route.continue();
   return route.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8'):''});
  });
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/#portal/catalogue/all');
  await page.waitForFunction(()=>typeof window.PSC_OPEN_FAMILY_DETAIL==='function');
  await page.evaluate(()=>window.PSC_OPEN_FAMILY_DETAIL('PSC-SC-A18'));
  const sheet=page.locator('.pscFamilyProductSheet');
  await sheet.waitFor();
  assert.equal((await sheet.locator('#pscFamilyTitle').innerText()).trim(),'Stainless steel dressing trolley (2 layer with castor wheels)');
  assert.equal(await sheet.locator('label[for="professionalVariant"]').innerText(),'Choose your brand');
  assert.equal((await sheet.locator('select[data-family-variant] > option[value=""]').innerText()).trim(),'No brand preference');
  assert.equal((await sheet.locator('select[data-family-variant] option[value="other"]').innerText()).trim(),'Specify preferred brand or model');
  assert.equal(await sheet.locator('.professionalPurchaseIdentity,.detailImageMeta,.professionalFacts,.pscRetailPriceNotice').count(),0);
  assert.equal(await sheet.locator('.pscFamilyDisclosureList summary').count(),2);
  assert.equal(await sheet.locator('.pscFamilyReference .mono').innerText(),'PSC-SC-A18');
  assert.equal(await sheet.locator('.fluidProductHeader .mono').count(),0);
  assert.equal(await sheet.locator('.pscFamilyPreview .catalogueImageEmpty').count(),0);
  const titles=await sheet.locator('h2,h3').allInnerTexts();
  assert.equal(titles.filter(s=>s.includes('Stainless steel dressing trolley')).length,1,'Family name must appear once');
  const noImage=(await sheet.locator('.pscFamilyPreview img').count())===0;
  if(noImage){
   const columns=await sheet.locator('.fluidProductGrid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
   assert.equal(columns,1,'Missing image must not reserve a blank column');
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),true);
  await page.screenshot({animations:'disabled',path:'test-results/family-detail/'+width+'-default.png'});
  await sheet.locator('[data-family-variant]').selectOption('other');
  assert.equal(await sheet.locator('label[for="professionalSpecification"]').innerText(),'Preferred brand / model');
  await sheet.locator('[data-family-other-brand]').fill('Preferred model: stainless steel, 2 shelves');
  await sheet.locator('[data-request-quantity]').fill('3');
  await sheet.locator('[data-request-quantity]').blur();
  assert.equal(await sheet.locator('[data-request-quantity]').inputValue(),'3');
  await page.screenshot({animations:'disabled',path:'test-results/family-detail/'+width+'-custom-brand.png'});
  await sheet.locator('[data-family-quote]').click();
  const request=await page.evaluate(()=>window.__familyRequests.at(-1));
  assert.equal(request.familyId,'PSC-SC-A18');
  assert.equal(request.qty,3);
  assert.equal(request.brandPreferenceMode,'other_brand');
  assert.match(request.requestedBrand,/stainless steel, 2 shelves/);
  assert.deepEqual(errors,[],'No browser runtime errors');
  console.log(width+': compact family modal, brand choice, source-safe request PASS');
  await context.close();
 }
}finally{
 await browser.close();server.close();
}
