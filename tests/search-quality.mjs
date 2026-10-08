import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import index from '../current/behaviour/product-knowledge-index.js';
import search from '../current/behaviour/intelligent-search.js';
import {constrainRankedIds} from '../api/interpret-request.mjs';
const items=index.records.filter(r=>r.visible).map(r=>({pscSku:r.id,name:r.officialName,catalogueDisplayName:r.displayName,category:r.category,brand:r.brand,model:r.model,spec:r.specifications,pack:r.pack}));
assert.deepEqual(search.rank(items,search.interpret('PSC-DBT-001')).map(p=>p.pscSku),['PSC-DBT-001']);
assert.equal(search.interpret('add 3 cetirizine 10 mg').terms,'cetirizine 10 mg');
const names=p=>p.catalogueDisplayName;
const cases=[
 ['exact product',"ZYRTEC 10MG TAB 20'S",p=>p.pscSku==='PSC-MED-003'],
 ['SKU','PSC-DBT-001',p=>p.pscSku==='PSC-DBT-001'],
 ['brand','Zyrtec',p=>/zyrtec/i.test(names(p))],
 ['ingredient','cetirizine',p=>index.records.find(r=>r.id===p.pscSku).medicine?.activeIngredients.includes('cetirizine')],
 ['class','antihistamine',p=>index.records.find(r=>r.id===p.pscSku).medicine?.therapeuticClasses.includes('antihistamine')],
 ['class spelling','anti histamine',p=>index.records.find(r=>r.id===p.pscSku).medicine?.therapeuticClasses.includes('antihistamine')],
 ['class spelling','antihistamin',p=>index.records.find(r=>r.id===p.pscSku).medicine?.therapeuticClasses.includes('antihistamine')],
 ['class spelling','anti histamin',p=>index.records.find(r=>r.id===p.pscSku).medicine?.therapeuticClasses.includes('antihistamine')],
 ['lay language','allergy medicine',p=>index.records.find(r=>r.id===p.pscSku).medicine?.therapeuticClasses.includes('antihistamine')],
 ['lay form','allergy tablets',p=>index.records.find(r=>r.id===p.pscSku).medicine?.dosageForm==='tablet'],
 ['class form','antihistamine syrup',p=>index.records.find(r=>r.id===p.pscSku).medicine?.dosageForm==='syrup'],
 ['strength','cetirizine 10 mg',p=>p.pscSku==='PSC-MED-003'||/finallerg 10mg/i.test(names(p))],
 ['ingredient form','loratadine syrup',p=>p.pscSku==='PS-AC-A9F14BB5E5C6'],
 ['approved attribute','non drowsy antihistamine',p=>/telfast/i.test(names(p))],
 ['other class','proton pump inhibitor',p=>index.records.find(r=>r.id===p.pscSku).medicine?.therapeuticClasses.includes('proton-pump-inhibitor')],
 ['other class','nsaid tablets',p=>/ibuprofen/i.test(names(p))],
 ['typo','whelchair',p=>/wheel ?chair/i.test(names(p))],
 ['spacing','wheel chair',p=>/wheel ?chair/i.test(names(p))],
 ['large descriptive','we need big gauze',p=>/gauze.*10.*10/i.test(names(p))],
 ['large typo','need big gaws',p=>/gauze.*10.*10/i.test(names(p))],
 ['typo','gause',p=>/gauze/i.test(names(p))],
 ['descriptive','oxygen thing with meter',p=>/oxygen regulator/i.test(names(p))],
 ['typo','oxgen regulater',p=>/oxygen regulator/i.test(names(p))],
 ['descriptive','machine to check pressure',p=>/blood pressure/i.test(names(p))],
 ['colloquial','sugar machine',p=>/glucometer/i.test(names(p))],
 ['accessory','kids mask for nebuliser',p=>/paediatric.*nebulizer|nebulizer.*paediatric/i.test(names(p))],
 ['typo','stethscope',p=>/stethoscope/i.test(names(p))],
 ['descriptive','oxygen meter finger',p=>/oximeter/i.test(names(p))]
];
const results=[],timings=[];
for(const [kind,query,relevant] of cases){
 let matches,action;for(let n=0;n<5;n++){action=search.interpret(query);const t=performance.now();matches=search.rank(items,action);timings.push(performance.now()-t);}
 const row={kind,query,concept:action.concept||action.terms,ids:matches.map(p=>p.pscSku),top1:!!matches[0]&&relevant(matches[0]),top3:matches.slice(0,3).some(relevant),zero:!matches.length,clarification:action.ambiguous};results.push(row);assert(row.top1,query);
}
const antihistamines=index.records.filter(r=>r.visible&&r.medicine?.therapeuticClasses.includes('antihistamine'));
assert.equal(antihistamines.length,16);
for(const query of ['antihistamine','anti histamine','antihistamin','anti histamin'])assert.deepEqual(new Set(search.rank(items,search.interpret(query)).map(p=>p.pscSku)),new Set(antihistamines.map(r=>r.id)));
assert.equal(search.rank(items,search.interpret('bilastine')).length,0);assert.equal(search.outcome(search.interpret('bilastine'),[]).state,'no_catalogue_match');
assert.equal(search.rank(items,search.interpret('zzznothing')).length,0);assert.equal(search.outcome(search.interpret('zzznothing'),[]).state,'uninterpretable');
assert.equal(search.interpret('big mask').clarificationField,'product_type');
const meter=items.find(p=>p.pscSku==='PSC-DBT-001'),context={selectedProducts:[meter],terms:'glucose meter'};
assert.equal(search.rank(items,search.interpret('strips for this',context),context)[0].pscSku,'PSC-DBT-002');
assert.equal(search.retrieve(items,search.interpret('strips for this',context),context)[0].verifiedCompatibility,true);
assert.equal(search.interpret('add 5 boxes',{terms:'gauze',size:'10x10'}).quantity,5);
assert.equal(search.interpret('make that 5',context).reference,'selected');
assert.equal(search.interpret('we already have the wheelchair').intent,'retain');
assert.equal(search.interpret('deliver this to Sharjah').location,'sharjah');
assert.deepEqual(constrainRankedIds(['PSC-MED-128','invented','PSC-MED-003'],search.interpret('antihistamine')),['PSC-MED-003']);
assert.equal(search.rank(items,search.interpret('allergy tablets')).some(p=>p.pscSku==='PSC-MED-126'),false);
assert.equal(search.rank(items,search.interpret('cetirizine 10 mg')).some(p=>p.pscSku==='PSC-MED-104'),false);
assert.equal(search.rank([{pscSku:'unknown',name:'Brand tablet',category:'Medicines'}],search.interpret('antihistamine')).length,0);
timings.sort((a,b)=>a-b);
const report={environment:'Node local retrieval, no network or render time; includes cold and warm corpus work',retrievalCases:cases.length,metrics:{top1Relevance:results.filter(r=>r.top1).length/results.length,top3Relevance:results.filter(r=>r.top3).length/results.length,zeroResultRateOnExpectedMatches:results.filter(r=>r.zero).length/results.length,clarificationRate:results.filter(r=>r.clarification).length/results.length,incorrectTop1Rate:results.filter(r=>!r.top1).length/results.length,averageLatencyMs:timings.reduce((a,b)=>a+b,0)/timings.length,p95LatencyMs:timings[Math.floor(timings.length*.95)]},antihistamines:antihistamines.map(r=>({id:r.id,name:r.displayName,ingredients:r.medicine.activeIngredients,combination:r.medicine.combination})),results,limitations:['Verified compatibility is limited to the evidence-backed Guide meter/Guide strip relationship; other links remain unverified.','Provisional medicines without matched authoritative evidence remain incomplete.','Browser tests simulate backend/auth; no live provider inference measured.']};
writeFileSync('docs/search-quality-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.metrics,null,2));
