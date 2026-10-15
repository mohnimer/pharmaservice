import {Window} from 'happy-dom';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const w=new Window({url:'https://pharmaservice.ae'}),manifest=JSON.parse(readFileSync('current/manifest.json'));
const strip=o=>Object.fromEntries(Object.entries(o).filter(([k])=>!/(image|photo)/i.test(k)));
let before;
for(const f of manifest.javascript.slice(0,manifest.javascript.indexOf('app.js'))){
 if(f==='supabase.js'||f.endsWith('product-knowledge-index.js'))continue;
 if(f.endsWith('/variant-photographs.js'))before=w.PSC_DATA.products.map(strip);
 w.eval(readFileSync(f,'utf8'));
}
assert.deepEqual(w.PSC_DATA.products.map(strip),before,'Image release changed commercial/catalogue fields');
const data=w.PSC_VARIANT_PHOTOGRAPHS;
for(const r of data.records){
 const o={product_option_id:r.product_option_id,family_id:r.family_id,exact_product_name:r.exact_product_name,brand:r.brand,pack:r.pack,sku:r.sku,verified_price_aed:23.5,supplier_stock_status:'fixture'};
 const out=w.PSC_VARIANT_PHOTO_APPLY([o],r.family_id)[0];
 assert.equal(out.image_url,r.image_url);assert.equal(out.image_identity_reviewed,true);assert.deepEqual(strip(out),strip(o));
 for(const [field,value]of [['product_option_id','another-id'],['exact_product_name',r.exact_product_name+' DIFFERENT'],['brand','different brand'],['pack','different pack']]){
  const changed={...o,[field]:value};delete changed.sku;
  assert(!w.PSC_VARIANT_PHOTO_FOR(changed,r.family_id),`Mismatched ${field} borrowed photo`);
 }
 assert(!w.PSC_VARIANT_PHOTO_FOR(o,'another-family'));
 assert(!w.PSC_VARIANT_PHOTO_APPLY([o],'another-family')[0].image_url);
 assert(!w.PSC_IMAGE_POLICY.isBlocked(r.image_url));
}
const b=data.records.find(r=>r.exact_product_name==='BETADINE ANTISEPTIC SLN 120ML');
const b500=data.records.find(r=>r.exact_product_name==='BETADINE ANTISEPTIC SLN 500ML');
assert(b&&b500);assert.notEqual(b.image_url,b500.image_url);
const dettol=w.PSC_DATA.products.find(p=>p.pscSku==='PSC-INF-001');assert(dettol.currentImageUrl.includes('psc-inf-001'));
for(const sku of ['PSC-RES-010','PSC-DSP-010'])assert(w.PSC_DATA.products.find(p=>p.pscSku===sku).currentImageUrl.includes('verified-20261015'));
for(const r of data.rejected)assert.equal(w.PSC_DATA.products.find(p=>p.pscSku===r.sku).currentImageUrl,null);
console.log(`PASS ${data.records.length} exact bindings; identity conflicts rejected; catalogue, stock and price fields unchanged`);
await w.happyDOM.abort();
