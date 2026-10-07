import {readFileSync, existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {Window} from 'happy-dom';

const payloadContext={window:{}};
vm.runInNewContext(readFileSync('current/behaviour/catalogue-refresh-data.js','utf8'),payloadContext);
const refresh=payloadContext.window.PS_CATALOGUE_REFRESH;
assert.equal(refresh.products.length,405);
assert.equal(refresh.approvedOptions.length,193);
assert.equal(refresh.families.length,269);
assert.equal(refresh.products.filter(p=>p.workbookDecision==='ENQUIRY ONLY').length,212);
for(const product of refresh.products){
  assert(!('contractPrice' in product || 'retailBenchmark' in product || 'buyCost' in product));
  if(product.workbookDecision==='ENQUIRY ONLY')assert.equal(product.catalogueParentId,null);
  if(product.currentImageUrl)assert(existsSync('dist'+product.currentImageUrl));
}
assert.equal(new Set(refresh.products.map(p=>p.pscSku)).size,405);
const pause=()=>new Promise(r=>setTimeout(r,100));
const w=new Window({url:'https://example.invalid/#portal/catalogue/medicines',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableComputedStyleRendering:true}});
const errors=[];w.addEventListener('error',e=>errors.push(e.message));
w.document.body.innerHTML='<div id="app"></div>';
w.structuredClone=structuredClone;w.__testRole='demo';w.fetch=()=>{throw Error('External fetch forbidden');};
w.eval(readFileSync('tests/mock-supabase.js','utf8'));
// Exercise successful, non-empty CMS/family hydration, not only offline fallback.
w.__tables.storefronts=[{channel:'institutional',catalogue_initialized:true}];
w.__tables.published_storefront_catalogue=[{channel:'institutional',psc_sku:'PSC-MED-126',product_id:'old-db-id',name:'Obsolete CMS name',image_url:'https://example.invalid/old.jpg',clinical_needs:['medicines']}];
w.__tables.catalogue_family_public=[{family_id:'PSC-SC-B19',family_name:'Database pulse oximeter',clinical_need:'Vitals & Clinical Assessment',page_type:'QUOTE-LED PRODUCT FAMILY',presentations:[],website_price_treatment:'Request quote'}];
async function click(selector){for(let i=0;i<20;i++){const e=w.document.querySelector(selector);if(e){e.click();await pause();return;}await pause();}throw Error('Missing '+selector);}
async function navigate(hash){w.PSC_NAVIGATE(hash);await pause();}
try{
  w.eval(readFileSync('dist/current.js','utf8'));w.document.dispatchEvent(new w.Event('DOMContentLoaded'));await pause();
  const product=name=>w.PSC_DATA.products.find(p=>p.sourceProductName===name);
  const enquiry=product('CEBACT 1000MG INJ IM/IV');assert(enquiry);
  assert.equal(enquiry.catalogueVisible,true);
  assert(w.document.querySelector(`[data-product-view="${enquiry.pscSku}"] img`).src.endsWith('/001-cebact-1000mg-inj-im-iv.jpg'));
  assert.equal(w.PSC_DATA.products.find(p=>p.pscSku==='PSC-MED-126').catalogueDisplayName,'PANADOL NIGHT - 24 FILM-COATED TABLETS');
  await click(`[data-product-view="${enquiry.pscSku}"]`);
  assert.match(w.document.querySelector('.productDetailModal').textContent,/Enquiry only/);
  await click(`[data-add="${enquiry.pscSku}"]`);await click('[data-basket]');
  assert.match(w.document.body.textContent,/CEBACT 1000MG/);
  await click('[data-submit-request]');
  await navigate('portal/requests');assert(w.document.querySelector('[data-request-view^="DEMO-SIM-"]'));
  await navigate('portal/catalogue/patient-care');
  const nexium=product("NEXIUM 20MG TAB 14'S");assert(nexium);
  await click(`[data-product-view="${nexium.pscSku}"]`);
  const root=w.document.querySelector('[data-psc-family-detail-root]');assert(root);
  const option=refresh.approvedOptions.find(o=>o.sku===nexium.pscSku);
  let familyRequest;
  w.addEventListener('psc:add-family-line',event=>{familyRequest=event.detail;});
  await click(`[data-family-option="${option.product_option_id}"]`);
  await click('[data-family-quote]');await click('[data-basket]');
  assert.equal(familyRequest.localFamily,true);
  assert.equal(familyRequest.requestedProductOptions[0].product_option_id,null);
  assert.equal(familyRequest.brandPreferenceMode,'other_brand');
  assert.match(w.document.querySelector('.requestLine').textContent,/Nexium.*20.*14/i);
  await click('[data-submit-request]');
  await navigate('portal/catalogue/patient-care');
  // A new family remains present even when the database returns only an older family.
  assert(w.document.querySelector('[data-psc-family-open="PSC-IS-151"]'));
  await navigate('portal/catalogue/medicines');
  const q=w.document.querySelector('[data-global-search]');q.value='CEBACT';q.dispatchEvent(new w.Event('input',{bubbles:true}));await pause();
  assert(w.document.querySelector(`[data-product-view="${enquiry.pscSku}"]`));
  assert.equal(w.__backendCalls.filter(c=>c.rpc||c.action!=='select').length,0);
  assert.deepEqual(errors,[]);
  console.log('PASS: 405 identities, 193 approved options, enquiry controls, ZIP precedence, non-empty CMS/family hydration, new family selection, exact request snapshots, search and zero demo/backend writes.');
}finally{await w.happyDOM.close();}
