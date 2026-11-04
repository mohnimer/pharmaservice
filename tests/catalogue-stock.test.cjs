const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function load(){
 const row={sku:'A',name:'Brand 10mg 20 tablets',brand:'Brand',pack:'20 tablets',family_id:'F',family_name:'Ingredient',source_kind:'product',acorus_managed:true,in_stock:true,mrp_aed:12,expiry_date:'2027-01-01',catalogue_visible:true};
 const other={...row,sku:'B',name:'Brand 10mg 10 tablets',pack:'10 tablets',in_stock:false,mrp_aed:7};
 const non={...row,sku:'OTHER',acorus_managed:false};
 const products=[{pscSku:'A',name:row.name,brand:'Brand',pack:'20 tablets',catalogueParentId:'F',currentImageUrl:'/assets/products/a.jpg',imageStatus:'VERIFIED EXACT PRODUCT IMAGE'},{pscSku:'B',name:other.name,brand:'Brand',pack:'10 tablets',catalogueParentId:'F'}];
 const window={PSC_CATALOGUE_CONTROL:{revision:'TEST',stock_date:'2026-10-12',report_name:'Test report',products:[row,other,non]},PSC_DATA:{products}};
 vm.runInNewContext(fs.readFileSync('current/behaviour/storefront-groups.js','utf8'),{window});vm.runInNewContext(fs.readFileSync('current/behaviour/catalogue-stock.js','utf8'),{window});return{api:window.PS_CATALOGUE_STOCK,row,other,non,products,window};
}
test('historical MRP never becomes a price without positive current exact stock',()=>{const{api,row,other}=load();assert.equal(api.price(row),12);assert.equal(api.price(other),null);row.in_stock=false;assert.equal(api.price(row),null);row.in_stock=true;row.mrp_aed=0;assert.equal(api.price(row),null);row.mrp_aed=12;row.expiry_date='2026-10-01';assert.equal(api.price(row),null);});
test('option matching preserves exact pack, brand and family',()=>{const{api}=load();const o={sku:'A',exact_product_name:'Brand 10mg 20 tablets',brand:'Brand',pack:'20 tablets'};assert(api.forOption(o,'F'));assert.equal(api.forOption({...o,pack:'10 tablets'},'F'),null);assert.equal(api.forOption({...o,brand:'Other'},'F'),null);assert.equal(api.forOption(o,'OTHER'),null);});

test('public exclusions preserve internal records, price and portal options',()=>{
 const {api,row,window}=load(),option={sku:'A',exact_product_name:row.name,brand:row.brand,pack:row.pack};row.public_catalogue_visible=false;
 assert.equal(api.publicVisible('A'),false);assert.equal(api.forProduct('A'),row);assert.equal(api.price(row),12);assert.equal(row.catalogue_visible,true);
 window.location={hash:'#catalogue/all'};assert(!api.optionsForFamily([option],'F').some(o=>o.sku==='A'));
 window.location.hash='#portal/catalogue/all';assert(api.optionsForFamily([option],'F').some(o=>o.sku==='A'));
});

test('explicit unavailable and absent/unconfirmed stock remain different; retail is not discounted',()=>{
 const {api,row,other}=load();other.availability_status='unconfirmed';assert.equal(api.availabilityLabel(other),'Availability unconfirmed');other.availability_status='out_of_stock';assert.equal(api.availabilityLabel(other),'Out of stock');assert.equal(api.price(other),null);row.availability_status='in_stock';row.indicative_price_aed=10.2;assert.equal(api.price(row),12);assert.equal(api.availabilityLabel(row),'Reported in stock');
 const option=api.optionsForFamily([{sku:'A',exact_product_name:row.name,brand:row.brand,pack:row.pack}],'F').find(o=>o.sku==='A');assert.equal(option.verified_price_aed,12);assert.match(option.verified_price_note,/2026-10-12/);
});
test('product grouping keeps exact packs and identifies its photographed representative',()=>{const{api,products}=load();const groups=api.groups(products);assert.equal(groups.length,1);assert.equal(groups[0].pscSku,'A');assert.equal(groups[0]._familyGroup.members.length,2);assert.equal(groups[0]._familyGroup.name,'BRAND 10 MG TABLET');assert.equal(groups[0]._familyGroup.parentFamilyId,'F');});
test('non-Acorus option prices are not overwritten by supplier projection',()=>{const{api,non}=load();const o={sku:'OTHER',exact_product_name:non.name,brand:non.brand,pack:non.pack,verified_price_aed:99};const projected=api.optionsForFamily([o],'F').find(x=>x.sku==='OTHER');assert.equal(projected.verified_price_aed,99);});
test('known mixed category photographs never become exact product photos',()=>{const{api,products,window}=load();assert(api.realPhoto(products[0]));window.PSC_DHA_FAMILY_PHOTOS={isMixedPhoto:p=>p.pscSku==='A'};assert.equal(api.realPhoto(products[0]),false);});

test('an image-policy rejection never falls back to the rejected original URL',()=>{
 const {api,products,window}=load();window.PSC_IMAGE_POLICY={resolve:()=>null};assert.equal(api.realPhoto(products[0]),false);
 const p=products[0],r={sku:p.pscSku,family_id:'F',product_option_id:'O',exact_product_name:p.name,brand:p.brand,pack:p.pack,image_url:p.currentImageUrl,reviewed:true,pack_confirmed:true};
 window.PSC_VARIANT_PHOTOGRAPHS={records:[r],rejected:[]};
 vm.runInNewContext(fs.readFileSync('current/behaviour/variant-photographs.js','utf8'),{window});
 assert.equal(window.PSC_VARIANT_PHOTO_FOR(r,'F'),null);assert.equal(p.currentImageUrl,null);assert.equal(p.imageIdentityReviewed,false);
 const result=window.PSC_VARIANT_PHOTO_APPLY([r],'F')[0];assert.equal(result.image_url,null);assert.equal(result.image_pending,true);assert.equal(result.image_identity_reviewed,false);
});
