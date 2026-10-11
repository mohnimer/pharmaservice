const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const script=fs.readFileSync(__dirname+'/../current/behaviour/catalogue-refresh.js','utf8');
const product={pscSku:'SKU1',name:'Item A-B 20',sourceProductName:'MASTER A-B 20',brand:'Brand',pack:'20 pieces',catalogueParentId:'F1',currentImageUrl:'/exact.jpg'};
const row={family_id:'F1',product_option_id:'DB1',exact_product_name:product.name,brand:'Brand',pack:'20 pieces',image_url:'/original.jpg'};
function setup(products=[product],options=[]){
 const window={PSC_DATA:{products:[]},PS_CATALOGUE_REFRESH:{products,retainedImages:[],approvedOptions:options}};
 vm.runInNewContext(script,{window});
 return window.PS_CATALOGUE_REFRESH;
}
test('explicit exact source alias matches only inside its own family',()=>{
 const r=setup();
 assert.equal(r.mergeOptions([row],'F1')[0].image_url,'/exact.jpg');
 assert.equal(r.mergeOptions([{...row,exact_product_name:'MASTER A-B 20'}],'F1')[0].image_url,'/exact.jpg');
 assert.equal(r.mergeOptions([{...row,family_id:'F2'}],'F2')[0].image_url,'/original.jpg');
});
test('punctuation, brand and known pack differences do not borrow photographs',()=>{
 for(const change of [{exact_product_name:'Item AB 20'},{brand:'Other'},{pack:'10 pieces'}]){
  assert.equal(setup().mergeOptions([{...row,...change}],'F1')[0].image_url,'/original.jpg');
 }
});
test('colliding source identities quarantine the image mapping',()=>{
 const duplicate={...product,pscSku:'SKU2',currentImageUrl:'/different.jpg'};
 assert.equal(setup([product,duplicate]).mergeOptions([row],'F1')[0].image_url,'/original.jpg');
});
test('distinct same-brand packs remain selectable',()=>{
 const option={...row,product_option_id:'LOCAL2',pack:'10 pieces',image_url:'/ten.jpg'};
 const rows=setup([product],[option]).mergeOptions([row],'F1');
 assert.equal(rows.length,2);assert.equal(rows[1].pack,'10 pieces');
});
