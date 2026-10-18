const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const api=require('../current/behaviour/storefront-groups.js');
const raw=JSON.parse(fs.readFileSync('data/catalogue-public.json','utf8')).products;
const products=raw.filter(p=>p.source_kind==='product');
const grouped=rows=>api.groups(rows,p=>p,rows=>[...rows].sort((a,b)=>a.sku.localeCompare(b.sku))[0]);
const groupOf=(groups,id)=>groups.find(g=>g._familyGroup.members.some(m=>m.sku===id));
test('all exact IDs occur once, source records never mutate, and groups never cross brands/families',()=>{
 const before=JSON.stringify(raw),g=grouped(raw),ids=g.flatMap(g=>g._familyGroup.members.map(m=>m.sku));
 assert.deepEqual([...ids].sort(),raw.map(p=>p.sku).sort());assert.equal(new Set(ids).size,ids.length);assert.equal(JSON.stringify(raw),before);
 for(const x of g){assert.equal(new Set(x._familyGroup.members.map(p=>p.family_id)).size,1);assert.equal(new Set(x._familyGroup.members.map(p=>p.brand)).size,1);}
});
test('clear same-product pack options group, preserving strength and form',()=>{
 const g=grouped(products);
 for(const ids of [['PSC-WND-102','PSC-WND-103'],['PSC-MED-124','PSC-MED-135'],['PSC-MED-130','PSC-MED-131']])assert.equal(groupOf(g,ids[0]),groupOf(g,ids[1]));
 assert.notEqual(groupOf(g,'PSC-MED-130'),groupOf(g,'PSC-MED-114'),'Imodium capsules and Instant tablets stay separate');
 for(const family of ['PSC-SC-B23','PSC-IS-173','PSC-IS-179','PSC-IS-151','PSC-IS-077']){
  const rows=products.filter(p=>p.family_id===family);assert.equal(new Set(rows.map(p=>api.identity(p).key)).size,rows.length,'Distinct models/strengths in '+family);
 }
});
test('NAN line and stage survive pack normalization; unknown packs and generic records remain separate',()=>{
 const rows=products.filter(p=>p.family_id==='PSC-IS-159'),g=grouped(rows);
 assert.equal(g.length,8);assert.equal(groupOf(g,'PS-AC-6703B683D432'),groupOf(g,'PS-AC-D3D58AF8DBDC'));assert.equal(groupOf(g,'PS-AC-5B958D72413A'),groupOf(g,'PS-AC-C7DB4FA9ACC4'));
 for(const family of ['PSC-IS-112','PSC-SC-C10','PSC-SC-C15']){const rows=products.filter(p=>p.family_id===family);assert.equal(grouped(rows).length,rows.length);}
 const p={sku:'X',family_id:'F',source_kind:'product',brand:'B',pack:'5 ml',name:'B 100 mg/5 ml'};
 assert.equal(api.identity(p).rule,'exact-record','Concentration denominator must not be stripped');
});
test('same family and brand never collapse colour, release, formula or route differences',()=>{
 const names=['B Gel 15 g','B Cream 15 g','B Gel SR 15 g','B Gel Blue 15 g','B Gel 2% 15 g','B Gel 5% 15 g','B-X Gel 15 g','B X Gel 15 g'];
 const rows=names.map((name,i)=>({sku:''+i,family_id:'F',source_kind:'product',brand:'B',pack:'15 g',name}));assert.equal(grouped(rows).length,rows.length);
});
test('up to three brands requires an explicit reviewed requirement-scoped decision, with strict evidence gates',()=>{
 const rows=['A','B','C','D'].map(brand=>({sku:brand,brand,name:brand}));
 const choice=brand=>({brand,skus:[brand],rationale:'Reviewed requirement fit',evidence:'Exact public manufacturer reference',requirementFit:'CONFIRMED'});
 const d={status:'APPROVED',requirementKey:'EXACT-SPEC-ONLY',reviewer:'Fixture reviewer',reviewedAt:'2026-10-18',strict:true,candidateSkus:rows.map(p=>p.sku),choices:['A','B','C'].map(choice)};
 assert.equal(api.curate(rows,[d]).length,3);assert.equal(api.curate(rows,[{...d,status:'PENDING'}]).length,4);
 assert.equal(api.curate(rows,[{...d,choices:rows.map(p=>choice(p.brand))}]).length,4,'A fourth preferred brand invalidates the decision');
 assert.equal(api.curate(rows,[{...d,choices:[{...choice('A'),requirementFit:'UNKNOWN'}]}]).length,4);
 assert.equal(api.curate(rows,[{...d,choices:[{...choice('A'),evidence:''}]}]).length,4);
 assert.equal(api.curate([rows[3]],[d]).length,1,'Exact search must not silently lose an existing SKU');
 assert.equal(api.curate(rows,[]).length,4,'Missing approvals never become fake quality rankings');
});
