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

test('request options retain description source, VAT basis and promotional qualification',()=>{
 const record={...base,description_source:'Exact source listing',price_vat_basis:'Inclusive of VAT',price_note:'Discounted public retailer price'};
 const out=setup([record]).PSC_VARIANT_APPLY_OPTIONS([option],base.family_id)[0];
 assert.equal(out.verified_description_source,record.description_source);
 assert.equal(out.verified_price_source,record.price_source);
 assert.equal(out.verified_price_checked_at,record.price_checked_at);
 assert.equal(out.verified_price_vat_basis,record.price_vat_basis);
 assert.equal(out.verified_price_note,record.price_note);
});

test('checked-in preview register agrees with exact local identities and image bytes',()=>{
 const crypto=require('node:crypto');
 const root=path.join(__dirname,'..');
 const context={window:{PSC_DATA:{products:[]}}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'current/behaviour/catalogue-refresh-data.js'),'utf8'),context);
 context.window.PSC_DATA.products=context.window.PS_CATALOGUE_REFRESH.products.map(p=>({...p}));
 vm.runInNewContext(fs.readFileSync(path.join(root,'current/behaviour/verified-variant-records.js'),'utf8'),context);
 vm.runInNewContext(script,context);
 const register=JSON.parse(fs.readFileSync(path.join(root,'docs/verified-preview-variant-register.json'),'utf8'));
 assert.equal(register.length,context.window.PSC_VARIANT_EVIDENCE_STATUS.approved);
 for(const row of register){
  const options=context.window.PS_CATALOGUE_REFRESH.approvedOptions.filter(o=>o.product_option_id===row.product_option_id);
  assert.equal(options.length,1);
  const record=context.window.PSC_VARIANT_EVIDENCE_FOR(options[0],row.family_id);assert(record);
  assert.equal(record.exact_product_name,row.product_name);assert.equal(record.pack,row.pack);
  assert.equal(record.image_url,row.image_path);assert.equal(record.price_aed,row.price_aed);
  assert.equal(record.price_source,row.listing_source_url);assert.equal(record.price_checked_at,row.checked_at);
  assert.equal(row.psc_sell_price_approved,false);assert.equal(row.overall_release_status,'HOLD');
  const bytes=fs.readFileSync(path.join(root,row.image_path));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),row.sha256);
  const card=context.window.PSC_DATA.products.find(p=>p.pscSku===row.psc_sku);assert(card);
  assert.equal(card.product_option_id,row.product_option_id);assert.equal(card.pack,row.pack);
  assert.equal(card.currentImageUrl,row.image_path);assert.equal(card.verified_description,record.description);
 }
});
