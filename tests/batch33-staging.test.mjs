import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=name=>readFileSync(new URL(name,root));
const rows=JSON.parse(read('staging/catalogue-batch33/candidate-image-register.json'));
test('150 unchanged source photographs have unique checksums and stay on hold',()=>{
 assert.equal(rows.length,150);
 assert.equal(new Set(rows.map(r=>r.sha256)).size,150);
 assert.equal(readdirSync(new URL('staging/catalogue-batch33/originals/',root)).length,150);
 for(const r of rows){
  assert.match(r.file,/^staging\/catalogue-batch33\/originals\/[a-z0-9_]+\.jpg$/);
  assert.equal(createHash('sha256').update(read(r.file)).digest('hex'),r.sha256);
  assert.equal(r.release_status,'HOLD');
  assert.equal(r.image_verified,false); assert.equal(r.price_verified,false);
 }
});
test('source identities reconcile separately without inventing database option IDs',()=>{
 const summary=JSON.parse(read('staging/catalogue-batch33/import-summary.json'));
 assert.equal(summary.local_candidate_links,147);
 assert.equal(summary.existing_master_local_links,68);
 assert.equal(summary.new_to_master_local_links,79);
 assert.equal(summary.database_candidate_links,0);
 assert.equal(summary.source_pack_uncertain,31);
 assert.equal(summary.approved_prices,0);
 assert.equal(summary.production_changed,false);
 assert(rows.every(r=>r.database_option_ids.length===0));
});
test('private candidates are absent from runtime manifest and built release',()=>{
 assert(!read('current/manifest.json').toString().includes('staging/'));
 assert(!existsSync(new URL('dist/staging/',root)));
 assert(!existsSync(new URL('assets/catalogue-batch33/originals/',root)));
});
