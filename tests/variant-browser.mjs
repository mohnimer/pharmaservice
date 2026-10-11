// Transport-isolated fixtures test UI identity propagation, not real product evidence.
import {readFileSync, mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const family='PSC-SC-C01';
const followonVariants=JSON.parse(readFileSync('docs/verified-preview-variant-register.json','utf8'))
 .filter(row=>row.browser_route).map(row=>({route:row.browser_route,sku:row.psc_sku,
  optionId:row.product_option_id,photo:row.image_path,pack:row.pack,price:row.price_aed,
  description:row.description,descriptionSource:row.description_source,
  imageWidth:row.dimensions[0],priceNote:row.price_note,vatBasis:row.vat_basis}));
const options=[10,20].map(n=>({family_id:family,product_option_id:'fixture-'+n,
 exact_product_name:'TEST ONLY dressing '+n,brand:'Fixture Brand',pack:n+' pieces',
 presentation:'',image_url:'/__variant-fixture/'+n+'.svg'}));
const evidence=options.map((o,i)=>({...o,description:'Fixture exact pack '+o.pack,
 image_source:'Test fixture only',image_verified:true,description_verified:true,
 price_verified:true,price_aed:11+i,price_type:'PUBLIC_RETAIL_BENCHMARK',
 price_unit:o.pack,price_source:'Test fixture only',price_checked_at:'2026-10-11',
 release_status:'APPROVED'}));
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
mkdirSync('test-results/variant-visual-review',{recursive:true});
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
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  await page.locator('.home47.h47Compact').waitFor();
  assert.equal(await page.locator('.h47Hero h1').innerText(),'From requirement to replenishment. All in one place.');
  assert.equal(await page.locator('.h47Hero .h47HeroBody').innerText(),'Shop our comprehensive catalogue of healthcare products, with visibility and compliance throughout.');
  assert.equal(await page.locator('.home47 > section').count(),4);
  assert.equal(await page.locator('.h47Category').count(),6);
  assert.equal(await page.locator('main.publicLanding > .publicHeader').count(),1);
  assert.equal(await page.locator('main.publicLanding > .publicFooter').count(),1);
  for(const selector of ['.h47Hero','.h47Catalogue','.h47Journey','.h47Visibility']){
   await page.locator(selector).scrollIntoViewIfNeeded();
   await page.waitForTimeout(800);
  }
  await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(400);
  assert((await page.locator('body').evaluate(el=>el.scrollWidth))<=width+1,'homepage must not overflow');
  await page.screenshot({path:'test-results/variant-visual-review/'+width+'-homepage.png',fullPage:true});
  await page.locator('.h47Hero [data-go="our-model"]').click();
  await page.waitForURL('**/#our-model');
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  await page.locator('.h47Hero [data-go="contact"]').click();
  await page.waitForURL('**/#contact');
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  await page.locator('#psHomeCommand').fill('sterile gauze');
  await page.locator('.h47Discovery [type="submit"]').click();
  await page.waitForURL('**/#portal/catalogue/all');
  await page.locator('.psInterpretation').waitFor();
  assert((await page.locator('.psInterpretation').innerText()).includes('sterile gauze'));
  assert(await page.locator('.psSearchResults .productCard').count()>0);
  await page.goto('http://127.0.0.1:'+server.address().port+'/#portal/catalogue/sports');
  await page.locator('.productCard.pscEditorialCard').first().waitFor();
  const layout=await page.locator('.productCard.pscEditorialCard').evaluateAll(cards=>cards.map(card=>{
   const r=card.getBoundingClientRect(),v=card.querySelector('.productVisual').getBoundingClientRect(),a=card.querySelector('.exactCanvaActions').getBoundingClientRect();
   return {top:r.top,bottom:r.bottom,imageTop:v.top,imageHeight:v.height,actionsTop:a.top,span:getComputedStyle(card).gridRow,sku:card.querySelector('[data-product-view]')?.dataset.productView};
  }));
  assert(layout.some(c=>c.sku==='PS-AC-A819E3E83997'),'Baby cooling-sheet regression card exists');
  assert(layout.some(c=>c.sku==='PS-AC-2F1516E65F2A'),'Child cooling-sheet regression card exists');
  for(const card of layout){
   assert.equal(card.span,'auto','Editorial cards occupy one grid row');
   const peers=layout.filter(c=>Math.abs(c.top-card.top)<1);
   for(const peer of peers){
    assert(Math.abs(peer.imageTop-card.imageTop)<1,'Image frames start level');
    assert(Math.abs(peer.imageHeight-card.imageHeight)<1,'Image frames have equal heights');
    assert(Math.abs(peer.actionsTop-card.actionsTop)<1,'Row actions align');
    assert(Math.abs(peer.bottom-card.bottom)<1,'Row bottoms align');
   }
  }
  await page.screenshot({path:'test-results/variant-visual-review/'+width+'-sports-level-grid.png',fullPage:true});
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
  await page.locator('.pscSelectedVariantGallery').waitFor({state:'visible'});
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
  assert.equal(selected.length,1);assert.equal(selected[0].product_option_id,null);
  assert.equal(selected[0].reference_product_option_id,'fixture-20');
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
,
{"route": "patient-care", "sku": "PSC-MED-130", "optionId": "local-acorus-4a24ef48aa96", "photo": "/assets/products/verified-20261011/imodium-2mg-6-capsules.jpg", "pack": "6 capsules", "price": 6.5, "description": "Imodium loperamide hydrochloride 2 mg capsules, pack of 6 capsules."},
{"route": "breathing", "sku": "PSC-MED-003", "optionId": "local-acorus-f8356dfd8db2", "photo": "/assets/products/verified-20261011/zyrtec-10mg-20-tablets.jpg", "pack": "20 tablets", "price": 39.5, "description": "Zyrtec cetirizine dihydrochloride 10 mg film-coated tablets, pack of 20 tablets.", "descriptionSource": "https://assets.gskstatic.com/pharma/PM-PI_portal/Lebanon/zyrtec_oral_drops_pil_lb.pdf"},
{"route": "breathing", "sku": "PSC-MED-102", "optionId": "local-acorus-9d511aa6c569", "photo": "/assets/products/verified-20261011/zyrtec-1mgml-75ml.jpg", "pack": "75 ml", "price": 17.5, "description": "Zyrtec cetirizine dihydrochloride 1 mg/ml oral solution, 75 ml bottle.", "descriptionSource": "https://assets.gskstatic.com/pharma/PM-PI_portal/Lebanon/zyrtec_oral_drops_pil_lb.pdf"}
,
{"route": "medicines", "sku": "PSC-MED-126", "optionId": "local-acorus-d226ac6267ee", "photo": "/assets/products/verified-20261011/panadol-night-24-caplets.jpg", "pack": "24 film-coated tablets", "price": 25, "description": "Panadol Night paracetamol 500 mg and diphenhydramine hydrochloride 25 mg film-coated caplets, pack of 24.", "descriptionSource": "https://www.panadol.com/en-me/adult-products/panadol-night/"}
,
{"route": "breathing", "sku": "PS-AC-F28FE7B861A0", "optionId": "local-acorus-f28fe7b861a0", "photo": "/assets/products/verified-20261011/avamys-275mcg-120-sprays.jpg", "pack": "120 sprays", "price": 63, "description": "Avamys fluticasone furoate 27.5 micrograms per spray nasal spray suspension, one bottle containing 120 sprays.", "descriptionSource": "https://assets.gskstatic.com/pharma/PM-PI_portal/Jordan/avamys_nasal_spray_pil_jo.pdf"}
  ].concat(followonVariants)) {
  await page.goto('http://127.0.0.1:'+server.address().port+'/#portal/catalogue/'+variant.route);
  const {sku,optionId}=variant;
  assert.equal(await page.locator('.psSearchResults .pscRetailPriceNotice').count(),1);
  assert((await page.locator('.psSearchResults .pscRetailPriceNotice').innerText()).includes('Wholesale prices are provided in your quotation.'));
  const card=page.locator('.productCard:has([data-product-view="'+sku+'"])');
  await card.waitFor();
  assert.equal(await card.locator('.productMainImage').getAttribute('src'),variant.photo);
  assert((await card.locator('.pack').innerText()).includes(variant.pack));
  assert((await card.locator('.pscPricePreview').innerText()).includes('UAE retail benchmark'));
  assert((await card.locator('.pscPricePreview').innerText()).includes(String(variant.price)));
  await card.screenshot({path:'test-results/variant-visual-review/'+width+'-'+sku+'-card.png'});
  await card.locator('.productVisual').click();
  await page.locator('.pscBrandTick:has([data-family-option="'+optionId+'"])').click();
  assert.equal(await page.locator('.pscFamilyProductSheet .pscRetailPriceNotice').count(),1);
  assert.equal(await preview.getAttribute('src'),variant.photo);
  await page.waitForFunction(expected=>{const img=document.querySelector('.pscFamilyPreview img');return img?.complete&&img.naturalWidth===expected;},variant.imageWidth||1024);
  assert((await page.locator('.detailImageMeta').innerText()).includes(variant.pack));
  assert((await page.locator('.detailImageMeta').innerText()).includes(String(variant.price)));
  // Medicine families require a presentation as well as an exact option.
  // Assert a new event so a blocked submission cannot reuse a prior variant.
  const exactPresentation=await page.locator('[data-family-option="'+optionId+'"]').evaluate(el=>{const o=window.PS_CATALOGUE_REFRESH.approvedOptions.find(o=>o.product_option_id===el.dataset.familyOption);return o?.presentation||'';});
  const matchingPresentation=page.locator('[data-family-presentation]').filter({hasText:exactPresentation});
  const presentationChoice=exactPresentation&&await matchingPresentation.count()?matchingPresentation.first():page.locator('[data-family-presentation]').first();
  if(await presentationChoice.count())await presentationChoice.click();
  await preview.waitFor({state:'visible'});
  assert((await page.locator('.detailImageMeta').innerText()).includes(variant.description),'exact description must survive layout enhancements');
  const optionText=page.locator('.pscBrandTick:has([data-family-option="'+optionId+'"]) > span:not(.pscOptionPrice)');
  assert((await optionText.boundingBox()).width>=140,'exact option text must retain a readable column');
  await page.locator('.pscBrandTick:has([data-family-option="'+optionId+'"])').screenshot({path:'test-results/variant-visual-review/'+width+'-'+sku+'-option.png'});
  await page.locator('.detailImagePane').screenshot({path:'test-results/variant-visual-review/'+width+'-'+sku+'-selected.png'});
  await page.screenshot({path:'test-results/variant-visual-review/'+width+'-'+sku+'-dialog.png'});
  const requestCount=await page.evaluate(()=>window.__variantRequests.length);
  await page.locator('[data-family-quote]').click();
  assert.equal(await page.evaluate(()=>window.__variantRequests.length),requestCount+1,
   variant.optionId+' must emit its own request');
  const actual=await page.evaluate(()=>window.__variantRequests.at(-1).requestedProductOptions[0]);
  assert.equal(actual.local_product_option_id,optionId);
  assert.equal(actual.product_option_id,null);
  assert.equal(actual.pack,variant.pack);
  assert.equal(actual.image_url,variant.photo);
  assert.equal(actual.verified_price_aed,variant.price);
  assert.equal(actual.verified_price_type,'PUBLIC_RETAIL_BENCHMARK');
  assert.equal(actual.verified_description,variant.description);
  assert.equal(actual.verified_price_vat_basis,variant.vatBasis||'Inclusive of VAT as displayed by retailer');
  assert.equal(actual.verified_description_source,variant.descriptionSource || actual.verified_price_source);
  assert.equal(actual.verified_price_checked_at,'2026-10-11');
  if(variant.priceNote)assert.equal(actual.verified_price_note,variant.priceNote);
  assert((await page.locator('body').evaluate(el=>el.scrollWidth))<=width+1,'catalogue must not overflow horizontally');
  }
  // Real same-brand/same-pack strengths must stay distinct under multiple selection.
  await page.goto('http://127.0.0.1:'+server.address().port+'/#portal/catalogue/patient-care');
  const nexiumCard=page.locator('.productCard:has([data-product-view="PS-AC-56CB26FE529B"])');
  await nexiumCard.locator('.productVisual').click();
  for(const id of ['local-acorus-56cb26fe529b','local-acorus-5ed2ff06e0af'])
   await page.locator('.pscBrandTick:has([data-family-option="'+id+'"])').click();
  assert.equal(await page.locator('.pscSelectedVariantRow').count(),2);
  await page.locator('.pscSelectedVariantGallery').waitFor({state:'visible'});
  assert.equal(await preview.count(),0);
  const gallery=await page.locator('.pscSelectedVariantRow img').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('src')).sort());
  assert.deepEqual(gallery,['/assets/products/verified-20261011/nexium-20mg-14-tablets.jpg','/assets/products/verified-20261011/nexium-40mg-14-tablets.jpg']);
  await page.locator('.pscSelectedVariantGallery').screenshot({path:'test-results/variant-visual-review/'+width+'-nexium-multiple.png'});
  const multiplePresentation=page.locator('[data-family-presentation]').first();
  if(await multiplePresentation.count())await multiplePresentation.click();
  const multipleRequestCount=await page.evaluate(()=>window.__variantRequests.length);
  await page.locator('[data-family-quote]').click();
  assert.equal(await page.evaluate(()=>window.__variantRequests.length),multipleRequestCount+1);
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
  await context.close();console.log(width+'px: fixture selection and '+(9+followonVariants.length)+' real variants, Nexium strength multiselect, VAT/source request snapshots and no overflow passed');
 }
}finally{await browser.close();await new Promise(r=>server.close(r));}
