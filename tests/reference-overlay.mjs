// Replays dated public descriptors through the full app with no external transport.
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
const review=JSON.parse(readFileSync('docs/current-public-reference-descriptors-20261011.json'));
const pairs=JSON.parse(readFileSync('docs/current-option-identity-verification-20261011.json')).pairs;
const w=new Window({url:'https://example.invalid/#portal/catalogue/patient-care',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableComputedStyleRendering:true}});
const pause=()=>new Promise(r=>setTimeout(r,100));
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
  for(const id of [pair.local_id,pair.database_id])assert(w.document.querySelector('[data-family-option="'+id+'"]'),id+' must remain separate');
  await click('[data-family-option="'+pair.database_id+'"]');
  const presentation=pair.current_record.presentation;
  await click('[data-family-presentation="'+presentation+'"]');
  const label=w.document.querySelector('.pscBrandTick.active');
  assert.match(label.textContent,/Catalogue reference/);
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
  await click('[data-family-option="'+localId+'"]');
  await click('[data-family-presentation="'+pair.current_record.presentation+'"]');
  await click('[data-family-quote]');
  const basket=JSON.parse(w.localStorage.getItem('pscClinicPortalStateV12_1')).basket;
  const snapshot=basket.flatMap(l=>l.requestedProductOptions||[]).find(o=>o.local_product_option_id===localId);
  assert(snapshot);assert.equal(snapshot.product_option_id,null);assert.equal(snapshot.verified_price_aed,price);
  assert(snapshot.verified_description);assert(snapshot.verified_price_source);assert.equal(snapshot.reference_product_option_id,null);
 }
 // Exact local presentations must be reachable even under a generic family.
 const spedifen=w.PS_CATALOGUE_REFRESH.approvedOptions.find(o=>o.product_option_id==='local-acorus-764e4d0db998');
 await w.PSC_OPEN_FAMILY_DETAIL(spedifen.family_id);await pause();
 await click('[data-family-option="'+spedifen.product_option_id+'"]');
 await click('[data-family-presentation="'+spedifen.presentation+'"]');
 assert(w.document.querySelector('[data-family-option="'+spedifen.product_option_id+'"]').checked);
 assert.match(w.document.querySelector('.detailImageMeta').textContent,/Spedifen/);
 await click('[data-family-quote]');
 assert.equal(requests.at(-1).requestedProductOptions[0].local_product_option_id,spedifen.product_option_id);
 assert.equal(requests.at(-1).requestedProductOptions[0].verified_price_aed,28.5);
 // A matching textual pack must also preserve both provenance identities.
 const row=review.rows[0],local=w.PS_CATALOGUE_REFRESH.approvedOptions.find(o=>o.product_option_id===pairs[3].local_id);
 const merged=w.PS_CATALOGUE_REFRESH.mergeOptions([{...row,pack:local.pack,reference_only:true}],row.family_id);
 assert(merged.some(o=>o.product_option_id===row.product_option_id));assert(merged.some(o=>o.product_option_id===local.product_option_id));
 // Switching to a different presentation clears incompatible exact choices.
 await w.PSC_OPEN_FAMILY_DETAIL('PSC-IS-073');await pause();
 await click('[data-family-option="local-acorus-9d511aa6c569"]');
 await click('[data-family-presentation="Oral solution"]');
 assert(w.document.querySelector('[data-family-option="local-acorus-9d511aa6c569"]').checked);
 await click('[data-family-presentation="Tablets"]');
 assert.equal(w.document.querySelectorAll('.pscBrandTick.active').length,0);
 assert.match(w.document.querySelector('.detailImageMeta').textContent,/Choose an exact product variant/);
 const stored=w.localStorage.getItem('pscClinicPortalStateV12_1');
 assert(stored,'actual basket must retain reference provenance');
 const basket=JSON.parse(stored).basket;
 assert(basket.some(l=>l.requestedProductOptions?.some(o=>o.reference_product_option_id===pairs[0].database_id)));
 assert.equal(w.__backendCalls.filter(c=>c.rpc||c.action!=='select').length,0);
 console.log('Seven dated public descriptors, six paired IDs, separate packs/provenance, basket snapshots and presentation reset verified; zero backend writes.');
}finally{await w.happyDOM.close();}
