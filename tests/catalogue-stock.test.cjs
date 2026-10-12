const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function load(){
 const row={sku:'A',name:'Brand 10mg 20 tablets',brand:'Brand',pack:'20 tablets',family_id:'F',family_name:'Ingredient',source_kind:'product',acorus_managed:true,in_stock:true,mrp_aed:12,expiry_date:'2027-01-01',catalogue_visible:true};
 const other={...row,sku:'B',name:'Brand 10mg 10 tablets',pack:'10 tablets',in_stock:false,mrp_aed:7};
 const non={...row,sku:'OTHER',acorus_managed:false};
 const products=[{pscSku:'A',name:row.name,brand:'Brand',pack:'20 tablets',catalogueParentId:'F',currentImageUrl:'/assets/products/a.jpg',imageStatus:'VERIFIED EXACT PRODUCT IMAGE'},{pscSku:'B',name:other.name,brand:'Brand',pack:'10 tablets',catalogueParentId:'F'}];
 const window={PSC_CATALOGUE_CONTROL:{revision:'TEST',stock_date:'2026-10-12',report_name:'Test report',products:[row,other,non]},PSC_DATA:{products}};
 vm.runInNewContext(fs.readFileSync('current/behaviour/catalogue-stock.js','utf8'),{window});return{api:window.PS_CATALOGUE_STOCK,row,other,non,products};
}
test('historical MRP never becomes a price without positive current exact stock',()=>{const{api,row,other}=load();assert.equal(api.price(row),12);assert.equal(api.price(other),null);row.in_stock=false;assert.equal(api.price(row),null);row.in_stock=true;row.mrp_aed=0;assert.equal(api.price(row),null);row.mrp_aed=12;row.expiry_date='2026-10-01';assert.equal(api.price(row),null);});
test('option matching preserves exact pack, brand and family',()=>{const{api}=load();const o={sku:'A',exact_product_name:'Brand 10mg 20 tablets',brand:'Brand',pack:'20 tablets'};assert(api.forOption(o,'F'));assert.equal(api.forOption({...o,pack:'10 tablets'},'F'),null);assert.equal(api.forOption({...o,brand:'Other'},'F'),null);assert.equal(api.forOption(o,'OTHER'),null);});
test('family grouping keeps each variant and identifies its photographed representative',()=>{const{api,products}=load();const groups=api.groups(products);assert.equal(groups.length,1);assert.equal(groups[0].pscSku,'A');assert.equal(groups[0]._familyGroup.members.length,2);assert.equal(groups[0]._familyGroup.name,'Ingredient');});
test('non-Acorus option prices are not overwritten by supplier projection',()=>{const{api,non}=load();const o={sku:'OTHER',exact_product_name:non.name,brand:non.brand,pack:non.pack,verified_price_aed:99};const projected=api.optionsForFamily([o],'F').find(x=>x.sku==='OTHER');assert.equal(projected.verified_price_aed,99);});
