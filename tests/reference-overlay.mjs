// Replays dated public descriptors through the full app with no external transport.
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
const review=JSON.parse(readFileSync('docs/current-public-reference-descriptors-20261011.json'));
const pairs=JSON.parse(readFileSync('docs/current-option-identity-verification-20261011.json')).pairs;
const stock=JSON.parse(readFileSync('data/catalogue-public.json'));
const expectedMrp=sku=>{const r=stock.products.find(r=>r.sku===sku);return r?.acorus_managed?(r.in_stock===true&&r.mrp_aed>0&&(!r.expiry_date||r.expiry_date>=stock.stock_date)?r.mrp_aed:null):undefined;};
const w=new Window({url:'https://example.invalid/#portal/catalogue/patient-care',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableComputedStyleRendering:true}});
const pause=()=>new Promise(r=>setTimeout(r,100));
async function choose(value){const e=w.document.querySelector('[data-family-variant]');assert(e);e.value=value;e.dispatchEvent(new w.Event('change',{bubbles:true}));await pause();}
async function click(selector){const el=w.document.querySelector(selector);assert(el,'Missing '+selector);el.click();await pause();}
try{
 w.document.body.innerHTML='<div id="app"></div>';w.structuredClone=structuredClone;w.__testRole='member';
 w.fetch=()=>{throw Error('External fetch forbidden');};
 w.eval(readFileSync('tests/mock-supabase.js','utf8'));
 w.__tables.catalogue_family_option_reference_public=review.rows;
 w.eval(readFileSync('dist/current.js','utf8'));w.document.dispatchEvent(new w.Event('DOMContentLoaded'));await pause();
 const requests=[];w.addEventListener('psc:add-family-line',e=>requests.push(e.detail));
 for(const pair of pairs){
  await w.PSC_OPEN_FAMILY_DETAIL(pair.family_id);await pause();
  // Neither unequal pack wording nor missing DB packs may replace a local ID.
  for(const id of [pair.local_id,pair.database_id])assert([...w.document.querySelector('[data-family-variant]').options].some(o=>o.value===id),id+' must remain separate');
  await choose(pair.database_id);
  const presentation=pair.current_record.presentation;
  assert.equal(w.document.querySelector('[data-family-variant]').value,pair.database_id);
  const label=w.document.querySelector('.professionalCommercial');
  assert(w.document.querySelector('[data-family-variant]').selectedOptions[0].textContent.includes('quotation reference'));
  assert(!label.textContent.includes('UAE retail benchmark'),'reference UUID cannot inherit local retail evidence');
  await click('[data-family-quote]');
  const draft=requests.at(-1),o=draft.requestedProductOptions[0];
  assert.equal(draft.brandPreferenceMode,'other_brand');assert.equal(o.product_option_id,null);
  assert.equal(o.reference_product_option_id,pair.database_id);assert.equal(o.local_product_option_id,null);
  assert.equal(o.pack,pair.current_record.pack);assert.equal(o.verified_price_aed,undefined);
  assert.equal(draft.productOption.reference_product_option_id,pair.database_id);
 }
 // Verified local previews retain evidence in the actual basket, alongside references.
 for(const [localId,price] of [['local-acorus-4a24ef48aa96',6.5],['local-acorus-f8356dfd8db2',39.5],['local-acorus-9d511aa6c569',17.5]]){
  const pair=pairs.find(p=>p.local_id===localId);
  await w.PSC_OPEN_FAMILY_DETAIL(pair.family_id);await pause();
  await choose(localId);

  await click('[data-family-quote]');
  const basket=JSON.parse((w.localStorage.getItem('pscClinicPortalStateV12_1:u1')||w.localStorage.getItem('pscClinicPortalStateV12_1'))).basket;
  const snapshot=basket.flatMap(l=>l.requestedProductOptions||[]).find(o=>o.local_product_option_id===localId);
  assert(snapshot);assert.equal(snapshot.product_option_id,null);const sourceOption=w.PS_CATALOGUE_REFRESH.approvedOptions.find(o=>o.product_option_id===localId);const mrp=expectedMrp(sourceOption.sku);assert.equal(snapshot.verified_price_aed,mrp===undefined?price:mrp);
  assert(snapshot.verified_description);if(mrp!==null)assert(snapshot.verified_price_source);else assert.equal(snapshot.verified_price_source,null);assert.equal(snapshot.reference_product_option_id,null);
 }
 // Exact local presentations must be reachable even under a generic family.
 const spedifen=w.PS_CATALOGUE_REFRESH.approvedOptions.find(o=>o.product_option_id==='local-acorus-764e4d0db998');
 await w.PSC_OPEN_FAMILY_DETAIL(spedifen.family_id);await pause();
 await choose(spedifen.product_option_id);

 assert.equal(w.document.querySelector('[data-family-variant]').value,spedifen.product_option_id);
 assert.match(w.document.querySelector('.detailImageMeta').textContent,/Spedifen/);
 await click('[data-family-quote]');
 assert.equal(requests.at(-1).requestedProductOptions[0].local_product_option_id,spedifen.product_option_id);
 assert.equal(requests.at(-1).requestedProductOptions[0].verified_price_aed,expectedMrp(spedifen.sku));
 // A matching textual pack must also preserve both provenance identities.
 const row=review.rows[0],local=w.PS_CATALOGUE_REFRESH.approvedOptions.find(o=>o.product_option_id===pairs[3].local_id);
 const merged=w.PS_CATALOGUE_REFRESH.mergeOptions([{...row,pack:local.pack,reference_only:true}],row.family_id);
 assert(merged.some(o=>o.product_option_id===row.product_option_id));assert(merged.some(o=>o.product_option_id===local.product_option_id));
 // Changing back to specification requests clears the exact choice and its image.
 await w.PSC_OPEN_FAMILY_DETAIL('PSC-IS-073');await pause();
 await choose('local-acorus-9d511aa6c569');
 assert.equal(w.document.querySelector('[data-family-variant]').value,'local-acorus-9d511aa6c569');
 await choose('');
 assert.equal(w.document.querySelector('[data-family-variant]').value,'');
 assert.equal(w.document.querySelector('[data-psc-preview-mode]').dataset.pscPreviewMode,'family');
 const stored=(w.localStorage.getItem('pscClinicPortalStateV12_1:u1')||w.localStorage.getItem('pscClinicPortalStateV12_1'));
 assert(stored,'actual basket must retain reference provenance');
 const basket=JSON.parse(stored).basket;
 assert(basket.some(l=>l.requestedProductOptions?.some(o=>o.reference_product_option_id===pairs[0].database_id)));
 assert.equal(w.__backendCalls.filter(c=>c.rpc||c.action!=='select').length,0);
 console.log('Seven dated public descriptors, six paired IDs, separate packs/provenance, basket snapshots and presentation reset verified; zero backend writes.');
}finally{await w.happyDOM.close();}
