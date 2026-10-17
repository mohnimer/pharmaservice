import {PGlite} from '@electric-sql/pglite';
import {fixture,ids,asUser,call} from './workshop-fixture.mjs';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const dir=await mkdtemp(join(tmpdir(),'ps-workshop-'));
try{
 const db=await fixture(dir);await asUser(db,'nurse');
 await call(db,'progress',{school_id:ids.school,module_id:'readiness',module_version:1,slide:1,revision:0});await db.close();
 const reopened=new PGlite(dir);await asUser(reopened,'nurse');const o=await call(reopened,'overview');assert.equal(o.progress[0].slide,1);await reopened.close();
 console.log('PASS learner progress survives a real database close/reopen');
}finally{await rm(dir,{recursive:true,force:true});}
