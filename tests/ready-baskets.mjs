// Full application against an isolated transport. No supplier/customer sends or live records.
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
const w=new Window({url:'https://example.invalid/#portal/baskets',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableComputedStyleRendering:true}});
const pause=()=>new Promise(r=>setTimeout(r,100));
const errors=[];w.addEventListener('error',e=>errors.push(e.message));
async function click(s){const e=w.document.querySelector(s);assert(e,'Missing '+s);e.click();await pause();}
async function checked(id,value){const e=w.document.querySelector(`[data-basket-include="${id}"]`);assert(e);e.checked=value;e.dispatchEvent(new w.Event('change',{bubbles:true}));await pause();}
const stored=()=>JSON.parse(w.localStorage.getItem('pscClinicPortalStateV12_1')).basket;
try{
 w.document.body.innerHTML='<div id="app"></div>';w.structuredClone=structuredClone;w.__testRole='member';w.fetch=()=>{throw Error('Live transport forbidden');};
 w.eval(readFileSync('tests/mock-supabase.js','utf8'));w.eval(readFileSync('dist/current.js','utf8'));w.document.dispatchEvent(new w.Event('DOMContentLoaded'));await pause();await pause();
 const api=w.PSC_READY_BASKETS,templates=w.PSC_READY_BASKET_TEMPLATES,find=sku=>w.PSC_DATA.products.find(p=>p.pscSku===sku);
 assert.equal(templates.length,3);assert(templates.every(t=>t.status==='PREVIEW'&&!api.verified(t)));
 assert.deepEqual([...templates].map(t=>t.id),['clinic-opening','clinic-restock','first-aid-rollout']);assert(templates.every(t=>t.lines.length>=7));const sceneRoot=w.document.createElement('div');sceneRoot.innerHTML=api.cards();assert.equal(sceneRoot.querySelectorAll('.psBasketScene img').length,3);for(const img of sceneRoot.querySelectorAll('.psBasketScene img')){assert.match(img.getAttribute('src'),/^\/assets\/baskets\/[a-z-]+-scene-brands-v2\.webp$/);assert.match(img.alt,/AI-edited illustrative/);assert(readFileSync('dist'+img.getAttribute('src')).length<250000,'Optimised illustrative scene');}assert.deepEqual([...sceneRoot.querySelectorAll('.psBasketScene img')].map(img=>img.alt.includes('Braun')?'Braun':img.alt.includes('WOLAID')?'WOLAID':img.alt.includes('3M Nexcare')?'3M Nexcare':''),['Braun','WOLAID','3M Nexcare']);assert(!api.gallery().includes('psEyebrow'));
 for(const t of templates)for(const l of t.lines){if(l.sku){assert(find(l.sku),l.sku);assert(!find(l.sku).regulated,'No automatic medicine');}}
 assert.match(find('INST-0137').name,/control/i);assert.match(find('INST-0131').name,/chamber/i);assert.match(find('INST-0132').name,/filter/i);
 // Fixture evidence exercises fail-closed relationship logic; none is released into template data.
 const meter=find('PSC-DBT-001'),strip=find('PSC-DBT-002');
 const approval=p=>({status:'APPROVED',source:'https://example.invalid/test-only-evidence',reviewer:'Test fixture',reviewed_at:'2026-10-19',market:'AE',fingerprint:api.fingerprint(p)});
 assert(!api.approved({...approval(strip),market:'US'},strip));assert(!api.approved(approval(strip),{...strip,pack:'changed pack'}));assert(!api.approved({...approval(strip),reviewer:''},strip));
 const inclusion={id:'strips',sku:strip.pscSku,includedIn:'meter',inclusionEvidence:{...approval(strip),baseFingerprint:api.fingerprint(meter)}};
 assert(api.included(inclusion,[{id:'meter',sku:meter.pscSku,selected:true}]));
 assert(!api.included(inclusion,[{id:'meter',sku:'PSC-RES-001',selected:true}]));assert(!api.included(inclusion,[{id:'meter',sku:meter.pscSku,selected:false}]));
 assert(api.compatible({sku:strip.pscSku,baseLine:'meter',compatibleWith:meter.pscSku,baseFingerprint:api.fingerprint(meter),evidence:approval(strip)},{meter:{sku:meter.pscSku}}));
 assert(!api.compatible({sku:strip.pscSku,evidence:approval(strip)},{}));
 await click('[data-ready-basket="clinic-opening"]');assert(w.document.getElementById('app').inert);
 assert.equal(w.document.querySelector('[data-basket-include="site-list"]').checked,false);
 assert.match(w.document.querySelector('[role="dialog"]').textContent,/Specification to confirm/);
 await click('[data-basket-qty="stethoscope|1"]');await checked('site-list',true);
 await click('[data-basket-template-add]');assert.equal(w.document.querySelector('#psReadyBasketDialog'),null);assert(!w.document.getElementById('app').inert);
 let lines=stored();assert.equal(lines.find(l=>l.sku==='PSC-DIA-008').qty,2);assert(lines.find(l=>l.kind==='unlisted'));assert(lines.every(l=>l.readyBasketReviews.some(n=>n.includes('planning preview'))));
 // Repeated exact identities consolidate without changing the requested pack.
 await click('[data-ready-basket="clinic-opening"]');await click('[data-basket-template-add]');lines=stored();assert.equal(lines.find(l=>l.sku==='PSC-DIA-008').qty,3);
 const before=JSON.stringify(stored());
 assert.equal(w.PSC_ADD_READY_SELECTION({templateId:'clinic-opening',mode:'setup',lines:[{id:'stethoscope',sku:'PSC-DIA-008',quantity:1},{id:'screen',sku:'PSC-EQP-002',quantity:10001}]}).ok,false);assert.equal(JSON.stringify(stored()),before,'Invalid later line cannot partially add earlier lines');
 assert.equal(w.PSC_ADD_READY_SELECTION({templateId:'clinic-opening',mode:'setup',lines:[{id:'stethoscope',sku:'PSC-DBT-001',quantity:1}]}).ok,false,'Never silently substitute');
 const couch=lines.find(l=>l.requirementSnapshot?.sku==='INST-0011'),original=find('INST-0011');assert(couch);assert.equal(couch.requirementSnapshot.pack,original.pack);assert.equal(couch.requirementSnapshot.condition,original.dhaCondition||'');
 // First-aid refills omit storage; existing contents must be checked before loose refills.
 await click('[data-ready-basket="first-aid-rollout"]');assert.equal(w.document.querySelector('[data-basket-include="gauze"]').checked,false);await click('[data-basket-mode="replenishment"]');assert(!w.document.querySelector('[data-basket-line="container"]'));assert(w.document.querySelector('[data-basket-include="gauze"]').checked);await click('[data-basket-template-add]');assert(!stored().some(l=>l.sku==='PSC-EQP-007'));
 await click('[data-ready-basket="clinic-restock"]');await checked('fixation',false);await click('[data-basket-template-add]');assert(!stored().some(l=>l.requirementSnapshot?.sku==='INST-0158'));
 await click('[data-basket]');assert.match(w.document.querySelector('.requestDrawer').textContent,/planning preview/);await click('[data-submit-request]');await pause();
 const rpc=w.__backendCalls.find(c=>c.rpc==='psc_submit_institutional_request');assert(rpc,'Existing real submission path exercised using mocked transport');
 assert.match(rpc.args.p_note,/compatibility, kit contents/);const sent=rpc.args.p_lines;
 assert.equal(sent.find(l=>l.psc_sku_snapshot==='PSC-DIA-008').quantity,3);assert.equal(sent.find(l=>l.psc_sku_snapshot==='PSC-DIA-008').pack_snapshot,find('PSC-DIA-008').pack);
 const requirement=sent.find(l=>l.product_option_snapshot?.requested_requirement?.sku==='INST-0011');assert(requirement);assert.equal(requirement.psc_sku_snapshot,null);assert.equal(requirement.family_id,null);assert.deepEqual(JSON.parse(JSON.stringify(requirement.product_option_snapshot.requested_requirement)),JSON.parse(JSON.stringify(couch.requirementSnapshot)));
 assert(sent.some(l=>l.psc_sku_snapshot===null&&l.line_description.includes('site list, room layout')),'Unknown exact component remains an unlisted quotation requirement');
 assert(!sent.some(l=>l.psc_sku_snapshot==='PSC-RES-001'));assert.equal(stored().length,0);assert.deepEqual(errors,[]);
 console.log('PASS: three previews; exact identities/packs; approval/kit/compatibility gates; atomic quantities; optional lines; replenishment; durable saved draft; existing mocked request submission; DHA wording; no live sends.');
}finally{await w.happyDOM.abort();w.close();}
