import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const context={window:{}};
runInNewContext(readFileSync('current/behaviour/school-baskets.js','utf8'),context);
const b=context.window.PS_SCHOOL_BASKETS;
const opening=b.opening.flatMap(group=>group.transactions);
const ids=new Set(opening);

test('complete authority planning coverage without duplicated opening IDs',()=>{
  assert.equal(opening.length,113);
  assert.equal(ids.size,113);
  assert.equal(b.sourceCoverage.uniqueAppendix3Subsections,79);
  assert.equal(b.sourceCoverage.appendixA,24);
  assert.equal(b.sourceCoverage.appendixB,25);
  assert.equal(b.sourceCoverage.appendixC,52);
  assert.equal(b.sourceCoverage.appendixD,12);
  assert(b.opening.some(g=>g.id==='premises'&&g.scopeChecklist.length>=5));
});

test('first-aid point kits have itemized, refillable draft BOMs and no regulated medicines',()=>{
  assert.deepEqual(b.kits.map(k=>k.id).join(','),'general,sports,lab,canteen,mobile');
  assert.equal(b.kits.reduce((n,k)=>n+k.contents.length,0),56);
  for(const k of b.kits){
    assert(k.where&&k.title&&k.details);
    assert(k.contents.length>=8);
    for(const row of k.contents){
      assert.equal(row.length,3);
      assert(row[0]);
      assert(!/^INST-01(?:0[2-9]|1[0-3])$/.test(row[1]||''),'Regulated Appendix 3(D) line in general-access kit: '+row[1]);
    }
  }
});

test('replenishment picks are existing catalogue candidates and not unsupported prices',()=>{
  const r=b.replenishment.flatMap(x=>x.skus);
  assert(r.length>=20);
  assert(r.every(x=>/^PSC-[A-Z]+-\d{3}$/.test(x)));
  assert(!('sellingPrice' in b)||b.sellingPrice===null);
  assert(!b.kits.some(k=>Object.keys(k).some(key=>/price|cost/i.test(key))));
});

test('public and portal catalogue both include the collection interface',()=>{
  const app=readFileSync('app.js','utf8');
  assert.equal(app.split('${schoolBasketSection()}').length-1,2);
  assert(app.includes('data-school-kit-request'));
  assert(app.includes('data-school-collection'));
  assert.doesNotThrow(()=>new Function(app));
});
