const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const script=fs.readFileSync(path.join(__dirname,'../current/behaviour/variant-evidence.js'),'utf8');
function setup(records){
  const context={window:{PSC_VERIFIED_VARIANTS:records}};
  vm.runInNewContext(script,context);
  return context.window;
}
const base={family_id:'PSC-SC-D02',product_option_id:'betadine-120',exact_product_name:'BETADINE ANTISEPTIC SLN 120ML',brand:'Betadine',pack:'120 ml',description:'Povidone iodine solution, 120 ml bottle',image_url:'/assets/verified/betadine-120.webp',image_source:'Retail pack photograph',image_verified:true,description_verified:true,price_verified:true,price_aed:25,price_type:'PUBLIC_RETAIL_BENCHMARK',price_unit:'120 ml bottle',price_source:'Published UAE retailer listing',price_checked_at:'2026-10-11',release_status:'APPROVED'};
const option={product_option_id:base.product_option_id,exact_product_name:base.exact_product_name,brand:base.brand,pack:base.pack,image_url:'/assets/old.jpg'};
test('exact variant receives photo description and price together',()=>{
 const w=setup([base]);const out=w.PSC_VARIANT_APPLY_OPTIONS([option],'PSC-SC-D02')[0];
 assert.equal(out.image_url,base.image_url);assert.equal(out.verified_price_aed,25);
 assert.equal(out.verified_description,base.description);
});
test('different pack or family never inherits a photo or price',()=>{
 const w=setup([base]);
 for(const [o,id] of [[{...option,pack:'500 ml'},'PSC-SC-D02'],[option,'PSC-SC-D03'],[{...option,product_option_id:'betadine-500'},'PSC-SC-D02']]){
  const out=w.PSC_VARIANT_APPLY_OPTIONS([o],id)[0];
  assert.equal(out.image_url,o.image_url);assert.equal(out.verified_price_aed,undefined);
 }
});
test('pending or unverified price prevents the whole record from being approved',()=>{
 const w=setup([{...base,price_verified:false},{...base,release_status:'HOLD'}]);
 assert.equal(w.PSC_VARIANT_EVIDENCE_STATUS.approved,0);
});
test('duplicate exact keys are quarantined rather than selected arbitrarily',()=>{
 const w=setup([base,{...base,price_aed:55}]);
 assert.equal(w.PSC_VARIANT_EVIDENCE_STATUS.collisions,1);
 assert.equal(w.PSC_VARIANT_EVIDENCE_FOR(option,'PSC-SC-D02'),null);
});
test('brand and product-name mismatches cannot borrow a price',()=>{
 const w=setup([base]);
 assert.equal(w.PSC_VARIANT_EVIDENCE_FOR({...option,brand:'Dettol'},'PSC-SC-D02'),null);
 assert.equal(w.PSC_VARIANT_EVIDENCE_FOR({...option,exact_product_name:'Betadine 500ml'},'PSC-SC-D02'),null);
});
