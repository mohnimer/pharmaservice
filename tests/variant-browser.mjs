// Transport-isolated fixtures test UI identity propagation, not real product evidence.
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const family='PSC-SC-C01';
const options=[10,20].map(n=>({family_id:family,product_option_id:'fixture-'+n,
 exact_product_name:'TEST ONLY dressing '+n,brand:'Fixture Brand',pack:n+' pieces',
 presentation:'',image_url:'/__variant-fixture/'+n+'.svg'}));
const evidence=options.map((o,i)=>({...o,description:'Fixture exact pack '+o.pack,
 image_source:'Test fixture only',image_verified:true,description_verified:true,
 price_verified:true,price_aed:11+i,price_type:'PUBLIC_RETAIL_BENCHMARK',
 price_unit:o.pack,price_source:'Test fixture only',price_checked_at:'2026-10-11',
 release_status:'APPROVED'}));
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({args:['--no-sandbox']});
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900}});
  await context.addInitScript(records=>{
   window.__testRole='demo';window.PSC_VERIFIED_VARIANTS=records;
   window.__variantRequests=[];
   window.addEventListener('psc:add-family-line',e=>window.__variantRequests.push(e.detail));
  },evidence);
  await context.route('**/*',route=>{
   const u=new URL(route.request().url());
   if(u.pathname.startsWith('/__variant-fixture/'))return route.fulfill({
    contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="green"/></svg>'});
   if(u.hostname==='127.0.0.1')return route.continue();
   if(u.hostname==='cdn.jsdelivr.net')return route.fulfill({contentType:'text/javascript',
    body:readFileSync('tests/mock-supabase.js','utf8')+
     '\nwindow.__tables.catalogue_family_option_reference_public='+JSON.stringify(options)+';'});
   return route.fulfill({status:200,body:''});
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/#portal/catalogue/wounds');
  await page.locator('.pscFamilySelector[data-psc-family-open="'+family+'"]').click();
  await page.locator('[data-family-option="fixture-10"]').waitFor();
  await page.locator('.pscBrandTick:has([data-family-option="fixture-10"])').click();
  const preview=page.locator('.pscFamilyPreview img');
  assert.equal(await preview.getAttribute('src'),options[0].image_url);
  assert.equal(await preview.getAttribute('alt'),options[0].exact_product_name);
  assert((await page.locator('.detailImageMeta').innerText()).includes('10 pieces'));
  assert((await page.locator('.detailImageMeta').innerText()).includes('11'));
  await page.locator('.pscBrandTick:has([data-family-option="fixture-20"])').click();
  assert.equal(await page.locator('.pscSelectedVariantRow').count(),2);
  assert.equal(await page.locator('.pscFamilyPreview img').count(),0);
  await page.locator('.pscBrandTick:has([data-family-option="fixture-10"])').click();
  assert.equal(await preview.getAttribute('src'),options[1].image_url);
  assert((await page.locator('.detailImageMeta').innerText()).includes('20 pieces'));
  assert((await page.locator('.detailImageMeta').innerText()).includes('12'));
  const presentation=page.locator('[data-family-presentation]').first();
  if(await presentation.count())await presentation.click();
  await page.locator('[data-family-quote]').click();
  const requests=await page.evaluate(()=>window.__variantRequests);
  assert.equal(requests.length,1);
  const selected=requests[0].requestedProductOptions;
  assert.equal(selected.length,1);assert.equal(selected[0].product_option_id,'fixture-20');
  assert.equal(selected[0].pack,'20 pieces');
  assert.equal(selected[0].image_url,options[1].image_url);
  assert.equal(selected[0].verified_price_aed,12);
  assert.equal(selected[0].verified_description,'Fixture exact pack 20 pieces');
  // Real checked-in variant evidence must agree from card through request.
  for (const variant of [
   {route:'medicines',sku:'PS-AC-AD974C05853F',optionId:'local-acorus-ad974c05853f',
    photo:'/assets/products/verified-20261011/prospan-100ml.jpg',pack:'100 ml bottle',price:42,
    description:'Prospan cough syrup with ivy leaf dry extract, 100 ml bottle.'},
   {route:'patient-care',sku:'PS-AC-82EEFFA2D41B',optionId:'local-acorus-82eeffa2d41b',
    photo:'/assets/products/verified-20261011/bepanthen-baby-ointment-100g.jpg',pack:'100 g',price:59,
    description:'Bepanthen Protective Baby Ointment, 100 g pack for external use.'},
   {route:'patient-care',sku:'PS-AC-56CB26FE529B',optionId:'local-acorus-56cb26fe529b',
    photo:'/assets/products/verified-20261011/nexium-20mg-14-tablets.jpg',pack:'14 tablets',price:78.5,
    description:'Nexium esomeprazole 20 mg tablets, pack of 14 tablets.'},
   {route:'patient-care',sku:'PS-AC-5ED2FF06E0AF',optionId:'local-acorus-5ed2ff06e0af',
    photo:'/assets/products/verified-20261011/nexium-40mg-14-tablets.jpg',pack:'14 tablets',price:110,
    description:'Nexium esomeprazole 40 mg tablets, pack of 14 tablets.'}
  ]) {
  await page.goto('http://127.0.0.1:'+server.address().port+'/#portal/catalogue/'+variant.route);
  const {sku,optionId}=variant;
  const card=page.locator('.productCard:has([data-product-view="'+sku+'"])');
  await card.waitFor();
  assert.equal(await card.locator('.productMainImage').getAttribute('src'),variant.photo);
  assert((await card.locator('.pack').innerText()).includes(variant.pack));
  assert((await card.locator('.pscPricePreview').innerText()).includes('UAE retail benchmark'));
  assert((await card.locator('.pscPricePreview').innerText()).includes(String(variant.price)));
  await card.locator('.productVisual').click();
  await page.locator('.pscBrandTick:has([data-family-option="'+optionId+'"])').click();
  assert.equal(await preview.getAttribute('src'),variant.photo);
  await page.waitForFunction(()=>{const img=document.querySelector('.pscFamilyPreview img');return img?.complete&&img.naturalWidth===1024;});
  assert((await page.locator('.detailImageMeta').innerText()).includes(variant.pack));
  assert((await page.locator('.detailImageMeta').innerText()).includes(String(variant.price)));
  await page.locator('[data-family-quote]').click();
  const actual=await page.evaluate(()=>window.__variantRequests.at(-1).requestedProductOptions[0]);
  assert.equal(actual.local_product_option_id,optionId);
  assert.equal(actual.product_option_id,null);
  assert.equal(actual.pack,variant.pack);
  assert.equal(actual.image_url,variant.photo);
  assert.equal(actual.verified_price_aed,variant.price);
  assert.equal(actual.verified_price_type,'PUBLIC_RETAIL_BENCHMARK');
  assert.equal(actual.verified_description,variant.description);
  assert.equal(actual.verified_price_vat_basis,'Inclusive of VAT as displayed by retailer');
  assert.equal(actual.verified_description_source,actual.verified_price_source);
  assert.equal(actual.verified_price_checked_at,'2026-10-11');
  assert((await page.locator('body').evaluate(el=>el.scrollWidth))<=width+1,'catalogue must not overflow horizontally');
  }
  // Real same-brand/same-pack strengths must stay distinct under multiple selection.
  const nexiumCard=page.locator('.productCard:has([data-product-view="PS-AC-56CB26FE529B"])');
  await nexiumCard.locator('.productVisual').click();
  for(const id of ['local-acorus-56cb26fe529b','local-acorus-5ed2ff06e0af'])
   await page.locator('.pscBrandTick:has([data-family-option="'+id+'"])').click();
  assert.equal(await page.locator('.pscSelectedVariantRow').count(),2);
  assert.equal(await preview.count(),0);
  const gallery=await page.locator('.pscSelectedVariantRow img').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('src')).sort());
  assert.deepEqual(gallery,['/assets/products/verified-20261011/nexium-20mg-14-tablets.jpg','/assets/products/verified-20261011/nexium-40mg-14-tablets.jpg']);
  await page.locator('[data-family-quote]').click();
  const multiple=await page.evaluate(()=>window.__variantRequests.at(-1).requestedProductOptions);
  assert.equal(multiple.length,2);
  for(const [id,price,photo] of [
   ['local-acorus-56cb26fe529b',78.5,'nexium-20mg-14-tablets.jpg'],
   ['local-acorus-5ed2ff06e0af',110,'nexium-40mg-14-tablets.jpg']]) {
   const option=multiple.find(o=>o.local_product_option_id===id);assert(option);
   assert.equal(option.verified_price_aed,price);
   assert.equal(option.image_url,'/assets/products/verified-20261011/'+photo);
  }
  assert.deepEqual(errors,[]);
  assert.deepEqual(await page.evaluate(()=>window.__backendCalls.filter(c=>c.rpc||c.action!=='select')),[]);
  await context.close();console.log(width+'px: fixture selection and four real variants, Nexium strength multiselect, VAT/source request snapshots and no overflow passed');
 }
}finally{await browser.close();await new Promise(r=>server.close(r));}
