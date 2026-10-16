// Full bundled-app, transport-isolated request and identity regression checks.
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
const pause=()=>new Promise(r=>setTimeout(r,100));
const errors=[];
const w=new Window({url:'http://localhost/#portal/catalogue/all',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableComputedStyleRendering:true}});
w.document.body.innerHTML='<div id="app"></div>';
w.structuredClone=structuredClone;w.__testRole='demo';
w.addEventListener('error',e=>errors.push(e.message));
w.eval(readFileSync('tests/mock-supabase.js','utf8'));
w.eval(readFileSync('dist/current.js','utf8'));
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
async function ready(selector){for(let i=0;i<50;i++){const e=w.document.querySelector(selector);if(e)return e;await pause();}throw Error('Missing '+selector+'; '+errors.join(';'));}
async function click(selector){(await ready(selector)).click();await pause();}
async function choose(selector,value){const e=await ready(selector);e.value=value;e.dispatchEvent(new w.Event('change',{bubbles:true}));await pause();}
async function setQty(value){const e=await ready('[data-request-quantity]');e.value=value;e.dispatchEvent(new w.Event('change',{bubbles:true}));await pause();}
function stored(){return JSON.parse(w.sessionStorage.getItem('pscClinicPortalDemoStateV12_1')||w.localStorage.getItem('pscClinicPortalStateV12_1')||'{}');}
try{
 await ready('.productCard');
 const presentation=w.PSC_PRODUCT_PRESENTATION;
 assert.equal(presentation.quantity(-3),1);assert.equal(presentation.quantity(0),1);assert.equal(presentation.quantity(''),1);assert.equal(presentation.quantity(Infinity),1);assert.equal(presentation.quantity(2.9),2);
 for(const category of ['pharmaceuticals','supplements','consumables','devices','capital']){
  const p={professionalInformation:{status:'VERIFIED',source:'Fixture documentation',category,fields:{strength:'10 mg',material:'Nitrile',model:'M1',composition:'Fixture only'},verifiedFields:['strength','material','model','composition']}};
  assert.equal(presentation.facts(p).kind,category);
 }
 assert.equal(presentation.facts({category:'Consumables'}).kind,'generic','Broad source category must not imply a verified clinical product class');
 assert(!presentation.factsHtml({professionalInformation:{status:'VERIFIED',source:'Fixture',category:'pharmaceuticals',fields:{strength:'999 mg'},verifiedFields:[]}}).includes('999 mg'));
 const identity={brand:'Controlled brand',pack:'10 tablets',professionalInformation:{status:'VERIFIED',source:'Fixture',category:'pharmaceuticals',fields:{brand:'Unverified brand',pack:'50 tablets',activeIngredients:['Ingredient A','Ingredient B']},verifiedFields:['pack','activeIngredients']}};
 const exactFacts=presentation.factsHtml(identity);assert(exactFacts.includes('Controlled brand'));assert(exactFacts.includes('10 tablets'));assert(!exactFacts.includes('50 tablets'));assert(!exactFacts.includes('Unverified brand'));assert(exactFacts.includes('Ingredient A + Ingredient B'));
 assert(!presentation.documentsHtml({professionalInformation:{status:'VERIFIED',source:'Fixture',documents:[{url:'javascript:alert(1)',verified:true,source:'Fixture'}]}}));
 assert(!w.document.querySelector('.productCard [data-add]'),'Cards have one details CTA rather than an unqualified add');
 // Exact local product: quantity 10, repeat addition, and same-family SKU separation.
 const p=w.PSC_DATA.products.find(p=>p.pscSku==='PS-AC-417F1BC9E425');assert(p);
 w.PSC_NAVIGATE('portal/catalogue/allergy');await pause();
 await click('[data-product-view="'+p.pscSku+'"]');
 assert((await ready('.professionalPurchaseIdentity')).textContent.includes(p.name));
 await setQty(0);assert.equal(w.document.querySelector('[data-request-quantity]').value,'1');
 await click('[data-quantity-delta="-1"]');assert.equal(w.document.querySelector('[data-request-quantity]').value,'1');
 await setQty(10);await click('.requestAddButton');
 await click('[data-basket]');
 assert((await ready('.requestDrawer')).textContent.includes(p.name));
 assert.equal(w.document.querySelector('[data-basket-delta="'+p.pscSku+'|1"]').previousElementSibling.textContent,'10');
 await click('[data-close-basket]');
 // Open from card again: adding a further 3 combines only this SKU.
 await click('[data-product-view="'+p.pscSku+'"]');await setQty(3);await click('.requestAddButton');await click('[data-basket]');
 assert.equal(w.document.querySelector('[data-basket-delta="'+p.pscSku+'|1"]').previousElementSibling.textContent,'13');
 await click('[data-close-basket]');
 w.PSC_NAVIGATE('portal/catalogue/all');await pause();
 // Two packs of the same brand, reference-only IDs, no fake database FK.
 const family='PSC-SC-C01';
 w.__tables.catalogue_family_option_reference_public=[10,20].map(n=>({family_id:family,product_option_id:'fixture-'+n,exact_product_name:'Fixture dressing '+n,brand:'Fixture',presentation:'',pack:n+' pieces',image_url:'/unverified.jpg'}));
 const requests=[];w.addEventListener('psc:add-family-line',e=>requests.push(e.detail));
 await w.PSC_OPEN_FAMILY_DETAIL(family);await pause();
 await choose('[data-family-variant]','fixture-10');
 assert(!w.document.querySelector('.pscFamilyPreview img'),'Unverified exact photo must not borrow representative image');
 assert((await ready('.professionalPurchaseIdentity')).textContent.includes('Fixture dressing 10'));
 await setQty(10);await click('[data-family-quote]');
 assert.equal(requests.at(-1).qty,10);assert.equal(requests.at(-1).productOption.product_option_id,null);
 assert.equal(requests.at(-1).productOption.reference_product_option_id,'fixture-10');
 assert.equal(requests.at(-1).familyId,family);
 await w.PSC_OPEN_FAMILY_DETAIL(family);await choose('[data-family-variant]','fixture-20');await setQty(4);await click('[data-family-quote]');
 await w.PSC_OPEN_FAMILY_DETAIL(family);await choose('[data-family-variant]','fixture-10');await setQty(2);await click('[data-family-quote]');
 await click('[data-basket]');
 const lines=[...w.document.querySelectorAll('.requestLine')];
 const ten=lines.find(l=>l.textContent.includes('Fixture dressing 10')),twenty=lines.find(l=>l.textContent.includes('Fixture dressing 20'));
 assert(ten&&twenty);assert.equal(ten.querySelector('.qty span').textContent,'12');assert.equal(twenty.querySelector('.qty span').textContent,'4');
 await click('[data-close-basket]');
 await w.PSC_OPEN_FAMILY_DETAIL(family);await choose('[data-family-variant]','other');
 const field=await ready('[data-family-other-brand]');field.value='Exact custom model, 5 per carton';field.dispatchEvent(new w.Event('input',{bubbles:true}));
 await setQty(7);await click('[data-family-quote]');assert.equal(requests.at(-1).qty,7);assert.equal(requests.at(-1).productOption,null);assert(requests.at(-1).requestedBrand.includes('5 per carton'));
 // Request UI persists selections, DHA distinction and wholesale notice.
 await w.PSC_OPEN_FAMILY_DETAIL(family);
 assert(w.document.querySelector('.pscFamilyHeaderDha'));
 assert(w.document.body.textContent.includes('Mapped to the applicable DHA clinic requirement.'));
 assert(w.document.querySelector('.pscRetailPriceNotice'));
 assert.equal(errors.length,0,errors.join(';'));
 console.log('PASS professional catalogue: five profiles, conservative facts, quantity bounds, exact additions, reference identity, distinct packs, unresolved specification, shared basket, DHA and MRP notice');
}finally{await w.happyDOM.close();}
