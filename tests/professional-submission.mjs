// Real submission code against an isolated transport: never contacts live Supabase.
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
const w=new Window({url:'https://example.invalid/#portal/catalogue/all',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableComputedStyleRendering:true}});
const pause=()=>new Promise(r=>setTimeout(r,100));
async function click(s){const el=w.document.querySelector(s);assert(el,'Missing '+s);el.click();await pause();}
async function choose(id){const el=w.document.querySelector('[data-family-variant]');el.value=id;el.dispatchEvent(new w.Event('change',{bubbles:true}));await pause();}
async function qty(n){const el=w.document.querySelector('[data-request-quantity]');el.value=n;el.dispatchEvent(new w.Event('change',{bubbles:true}));await pause();}
try{
 w.document.body.innerHTML='<div id="app"></div>';w.structuredClone=structuredClone;w.__testRole='member';w.fetch=()=>{throw Error('No live transport permitted');};
 w.eval(readFileSync('tests/mock-supabase.js','utf8'));w.eval(readFileSync('dist/current.js','utf8'));w.document.dispatchEvent(new w.Event('DOMContentLoaded'));await pause();
 const p=w.PSC_DATA.products.find(p=>p.pscSku==='PS-AC-95CA6F7BE1D9');assert(p);
 const family=p.catalogueReferenceFamilyId||p.catalogueParentId||p.pscSku;
 w.PSC_NAVIGATE('portal/catalogue/all');await pause();await click('[data-product-view="'+p.pscSku+'"]');await qty(10);await click('.requestAddButton');
 if(w.document.querySelector('[data-modal-close] .productBackButton'))await click('[data-modal-close] .productBackButton');
 await w.PSC_OPEN_FAMILY_DETAIL(family);await choose('local-catalogue-'+p.pscSku);await qty(2);await click('[data-family-quote]');
 await click('[data-basket]');
 const rows=[...w.document.querySelectorAll('.requestLine')].filter(l=>l.textContent.includes(p.name));assert.equal(rows.length,1,'Exact direct SKU and exact family option combine across entry points');assert.equal(rows[0].querySelector('.qty span').textContent,'12');
 await click('[data-submit-request]');await pause();
 let rpc=w.__backendCalls.filter(c=>c.rpc==='psc_submit_institutional_request').at(-1);assert(rpc,'Actual request RPC must be exercised');
 const line=rpc.args.p_lines.find(l=>l.psc_sku_snapshot===p.pscSku);assert(line);assert.equal(line.quantity,12);assert.equal(line.product_option_id,null);
 assert.equal(line.product_option_snapshot.requested_family_id,family);
 assert.equal(line.product_option_snapshot.local_product_option_id,'local-catalogue-'+p.pscSku);
 // Hydrate the saved request and use its existing reorder action; retained provenance is durable.
 w.PSC_NAVIGATE('portal/requests');await pause();
 const order=rpc.args.p_submission_key;
 const saved=w.__tables.order_lines.find(l=>l.psc_sku_snapshot===p.pscSku&&l.order_id==='saved-'+order);assert(saved);
 assert.equal(saved.product_option_snapshot.requested_product_options[0].pack,p.pack);
 // A separately requested unknown exact specification never acquires a fake SKU/option FK.
 await w.PSC_OPEN_FAMILY_DETAIL(family);await choose('other');
 const input=w.document.querySelector('[data-family-other-brand]');input.value='Custom exact pack to source';input.dispatchEvent(new w.Event('input',{bubbles:true}));await qty(3);await click('[data-family-quote]');await click('[data-basket]');await click('[data-submit-request]');await pause();
 rpc=w.__backendCalls.filter(c=>c.rpc==='psc_submit_institutional_request').at(-1);
 const custom=rpc.args.p_lines[0];assert.equal(custom.psc_sku_snapshot,null);assert.equal(custom.product_option_id,null);assert.equal(custom.quantity,3);assert.equal(custom.product_option_snapshot.requested_family_id,family);assert.equal(custom.requested_brand,'Other: Custom exact pack to source');
 // No-preference requests keep their selling basis after snapshot hydration.
 await w.PSC_OPEN_FAMILY_DETAIL(family);await choose('');await qty(1);await click('[data-family-quote]');await click('[data-basket]');
 const before=w.document.querySelector('.requestLine .basketInfo span').textContent;
 await click('[data-submit-request]');await pause();
 const finalOrder=w.__tables.orders.at(-1);finalOrder.status='delivered';
 const refreshed=new Window({url:'https://example.invalid/#portal/requests',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableComputedStyleRendering:true}});
 try{
  refreshed.document.body.innerHTML='<div id="app"></div>';refreshed.structuredClone=structuredClone;refreshed.__testRole='member';
  refreshed.eval(readFileSync('tests/mock-supabase.js','utf8'));
  refreshed.__tables.orders=structuredClone(w.__tables.orders);refreshed.__tables.order_lines=structuredClone(w.__tables.order_lines);
  refreshed.eval(readFileSync('dist/current.js','utf8'));refreshed.document.dispatchEvent(new refreshed.Event('DOMContentLoaded'));await pause();
  const reorder=refreshed.document.querySelector('[data-reorder-order="'+finalOrder.order_number+'"]');assert(reorder,'Reloaded delivered request supports existing reorder flow');reorder.click();await pause();
  const restored=JSON.parse(refreshed.localStorage.getItem('pscClinicPortalStateV12_1')).basket.find(l=>l.familyId===family&&l.brandPreferenceMode==='no_preference');
  assert(restored);assert(restored.orderPackBasis);assert(before.includes(restored.orderPackBasis));assert.equal(restored.productOptionSnapshot.requested_family_id,family);
 }finally{await refreshed.happyDOM.close();}
 console.log('PASS isolated submission: exact SKU merges across product/family, saved reference IDs and family/pack snapshots, unknown specification remains no-SKU, existing RPC only');
}finally{await w.happyDOM.close();}
