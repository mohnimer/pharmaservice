// Exact selection, photography, quantity and layout through the bundled V50 app.
import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const records=JSON.parse(readFileSync('docs/verified-preview-variant-register.json'));
const photos=JSON.parse(readFileSync('data/variant-photographs.json')).records;
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox','--disable-dev-shm-usage']});
mkdirSync('test-results/variant-visual-review',{recursive:true});
try{for(const width of [1440,768,390]){
 const context=await browser.newContext({viewport:{width,height:1000}});
 await context.addInitScript(()=>{window.__testRole='demo';window.__variantRequests=[];window.addEventListener('psc:add-family-line',e=>window.__variantRequests.push(e.detail));});
 await context.route('**/*',r=>{const host=new URL(r.request().url()).hostname;if(host==='127.0.0.1')return r.continue();return r.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8'):''});});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=`http://127.0.0.1:${server.address().port}`;
 await page.goto(base);await page.locator('.home47').waitFor();
 assert.equal(await page.locator('.h47Hero h1').innerText(),'Healthcare procurement for institutions.');
 assert.equal(await page.locator('.home47 > section').count(),4);assert.equal(await page.locator('.h47Category').count(),6);
 await page.goto(base+'/#portal/catalogue/sports');await page.locator('.productCard').first().waitFor();
 const columns=await page.locator('.v25ProductGrid').first().evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
 assert.equal(columns,width===1440?3:width===768?2:1);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.locator('.productCard').first().scrollIntoViewIfNeeded();await page.screenshot({animations:'disabled',path:`test-results/variant-visual-review/${width}-catalogue.png`});
 // Every released exact preview retains its own photo/pack/evidence in the new selector.
 for(const [i,row] of records.entries()){
  await page.evaluate(id=>window.PSC_OPEN_FAMILY_DETAIL(id),row.family_id);
  await page.locator('[data-family-variant]').selectOption(row.product_option_id);
  const detail=page.locator('.pscFamilyProductSheet');
  const actual=photos.find(r=>r.product_option_id===row.product_option_id&&r.family_id===row.family_id);
  const expectedPhoto=actual?.image_url||row.image_path;
  const image=detail.locator('.pscFamilyPreview>img');await image.waitFor();
  assert.equal(await image.getAttribute('src'),expectedPhoto);
  await image.evaluate(img=>img.decode());assert(await image.evaluate(img=>img.naturalWidth>0));
  assert((await detail.locator('.professionalPurchaseIdentity').innerText()).includes(row.pack));
  assert((await detail.locator('.pscRetailPriceNotice').innerText()).includes('Wholesale prices are provided in your quotation.'));
  assert.equal(await detail.locator('[data-request-quantity]').inputValue(),'1');
  await detail.locator('[data-quantity-delta="-1"]').click();assert.equal(await detail.locator('[data-request-quantity]').inputValue(),'1');
  await detail.locator('[data-request-quantity]').fill('10');
  await detail.locator('[data-request-quantity]').blur();
  const geometry=await detail.evaluate(el=>{const g=el.querySelector('.fluidProductGrid'),cs=getComputedStyle(g),r=g.getBoundingClientRect(),b=el.querySelector('.professionalRequestBar').getBoundingClientRect();return {columns:cs.gridTemplateColumns.split(' ').length,gridWidth:r.width,viewport:innerWidth,buttonVisible:b.bottom<=innerHeight+2,stepperHeight:el.querySelector('.quantityStepper').getBoundingClientRect().height,actionHeight:el.querySelector('[data-family-quote]').getBoundingClientRect().height,actionColor:getComputedStyle(el.querySelector('[data-family-quote]')).backgroundColor,stepperWidth:el.querySelector('.quantityStepper').getBoundingClientRect().width,inputWidth:el.querySelector('[data-request-quantity]').getBoundingClientRect().width,barOverflow:el.querySelector('.professionalRequestBar').scrollWidth-el.querySelector('.professionalRequestBar').clientWidth};});
  assert(geometry.stepperWidth>=141&&geometry.inputWidth>=50&&geometry.barOverflow<=1,'Request controls must keep their full readable width: '+JSON.stringify(geometry));assert(Math.abs(geometry.stepperHeight-geometry.actionHeight)<=1,'Quantity and action heights must match: '+JSON.stringify(geometry));const channels=geometry.actionColor.match(/\d+/g).slice(0,3).map(Number);assert(Math.max(...channels)<60&&Math.max(...channels)-Math.min(...channels)<5,'Primary action must be neutral near-black');assert.equal(geometry.columns,width>720?2:1);assert(geometry.gridWidth<=width+1);if(!geometry.buttonVisible)await page.screenshot({animations:'disabled',path:`test-results/variant-visual-review/${width}-sticky-failure.png`});assert(geometry.buttonVisible,JSON.stringify(geometry));
  if(i<3)await page.screenshot({animations:'disabled',path:`test-results/variant-visual-review/${width}-${row.psc_sku}-detail.png`});
  await detail.locator('[data-family-quote]').click();
  const request=await page.evaluate(()=>window.__variantRequests.at(-1));
  assert.equal(request.qty,10);assert.equal(request.familyId,row.family_id);
  const o=request.requestedProductOptions[0];assert.equal(o.pack,row.pack);
  assert.equal(o.local_product_option_id||o.reference_product_option_id||o.product_option_id,row.product_option_id);
  assert.equal(o.product_option_id,null,'Local/reference snapshots must not fabricate database foreign keys');
 }
 // Real exact-SKU quantity: customer basket combines repeated quantities.
 await page.goto(base+'/#portal/catalogue/allergy');
 await page.locator('[data-product-view="PS-AC-417F1BC9E425"]').first().click();
 await page.locator('[data-request-quantity]').fill('10');await page.locator('.requestAddButton').click();
 if(await page.locator('.requestViewButton').isVisible())await page.locator('.requestViewButton').click();
 else{await page.locator('.productBackButton[data-modal-close]').click();await page.locator('[data-basket]:visible').first().click();}
 assert((await page.locator('.requestDrawer').innerText()).includes('Herpesan'));
 assert.equal(await page.locator('[data-basket-delta="PS-AC-417F1BC9E425|1"]').evaluate(e=>e.previousElementSibling.textContent),'10');
 await page.screenshot({animations:'disabled',path:`test-results/variant-visual-review/${width}-shared-request.png`});
 assert.deepEqual(errors,[]);await context.close();console.log(`${width}px: ${records.length} exact variants, quantity 10, shared request, responsive columns and photograph identity PASS`);
}}finally{await browser.close();server.close();}
