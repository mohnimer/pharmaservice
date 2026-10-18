import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
const w=new Window({url:'https://example.invalid/#portal/catalogue/dha-equipment',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
w.document.body.innerHTML='<div id="app"></div>';w.structuredClone=structuredClone;w.__testRole='demo';w.eval(readFileSync('tests/mock-supabase.js','utf8'));
const m=JSON.parse(readFileSync('current/manifest.json'));
try{
 for(const f of m.javascript.slice(0,m.javascript.indexOf('app.js')))w.eval(readFileSync(f,'utf8'));
 const data=JSON.stringify(w.PSC_DATA.products),groups=w.PS_CATALOGUE_STOCK.groups(w.PSC_DATA.products.filter(p=>p.dhaMapped&&p.catalogueVisible!==false));
 const exact=w.PSC_DATA.products.filter(p=>p.dhaMapped&&p.catalogueVisible!==false);
 assert.deepEqual(groups.flatMap(p=>p._familyGroup.members.map(m=>m.pscSku)).sort(),exact.map(p=>p.pscSku).sort(),'Every DHA-mapped member stays present exactly once');
 for(const row of w.PSC_DHA_FAMILY_PHOTOS.rows){assert(existsSync('.'+row.path));assert.equal(createHash('sha256').update(readFileSync('.'+row.path)).digest('hex'),row.sha256);}
 for(const p of groups){const example=w.PSC_DHA_FAMILY_PHOTOS.forListing(p);if(p._familyGroup.sourceKind==='product')assert.equal(example,null,'A named product must not borrow a category example');const photo=example?.path||(w.PS_CATALOGUE_STOCK.realPhoto(p)?p.currentImageUrl:null);if(photo)assert(existsSync('.'+photo),'Missing asset '+photo);if(example){assert.equal(example.role,'FAMILY_REPRESENTATIVE_ONLY');assert(example.label.length>8);assert.equal(createHash('sha256').update(readFileSync('.'+photo)).digest('hex'),example.sha256);assert.equal(w.PSC_DHA_FAMILY_PHOTOS.forListing({...p,_familyGroup:undefined}),null,'A family example leaked to a selected SKU');}}
 assert.equal(JSON.stringify(w.PSC_DATA.products),data,'Photo lookup changed controlled products');
 w.eval(readFileSync('app.js','utf8'));w.document.dispatchEvent(new w.Event('DOMContentLoaded'));await new Promise(r=>setTimeout(r,150));
 for(const area of ['equipment','consumables','medicines']){w.PSC_NAVIGATE('portal/catalogue/dha-'+area);await new Promise(r=>setTimeout(r,100));const cards=[...w.document.querySelectorAll('.productCard[data-family-listing]')];assert(cards.length>0);for(const card of cards){const hero=card.querySelector('[data-product-view]')?.dataset.productView,p=w.PSC_DATA.products.find(p=>p.pscSku===hero);if(w.PS_CATALOGUE_STOCK.realPhoto(p))assert(card.querySelector('.productMainImage'),'Bound exact photo lost '+hero);assert(!card.querySelector('.pscFamilyRepresentative'),'Verbose representative caption leaked onto listing');}}
 console.log('PASS: every DHA-mapped member retained, all registered photographs hash-checked, existing exact photos preserved, no example-to-product substitution; missing exact photos remain unfilled.');
}finally{await w.happyDOM.abort();w.close();}
