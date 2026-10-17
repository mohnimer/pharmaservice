process.on('uncaughtException',e=>{console.error(e.message,e.detail||'',e.where||'');process.exit(1)});
import assert from 'node:assert/strict';
import {fixture,ids,asUser,call} from './workshop-fixture.mjs';
const db=await fixture();const sid=ids.school;const deny=async(fn)=>{await assert.rejects(fn);};
try {
 await asUser(db,'nurse');await deny(()=>call(db,'configure',{school_id:sid}));await deny(()=>call(db,'start',{school_id:ids.school2}));await deny(()=>db.query("insert into ps_readiness_reports(school_id) values($1)",[sid]));
 await asUser(db,'manager');
 const config={school_id:sid,assigned_user:ids.nurse,recipient_user:ids.manager,jurisdiction:'Dubai',clinic_type:'educational',conditions:{oxygen:'no',aed:'yes'},weekday:1,reminder_time:'09:00',reminders:true,email_enabled:false,ps_share:false};
 await call(db,'configure',config);await deny(()=>call(db,'configure',{...config,revision:1,recipient_user:ids.otherManager}));
 await asUser(db,'nurse');let report=await call(db,'start',{school_id:sid});assert.equal(report.kind,'baseline');assert.equal((await call(db,'start',{school_id:sid})).id,report.id);
 const answers=Object.fromEntries(report.bank_snapshot.questions.map(q=>[q.id,{value:'yes'}]));answers.firstaid={value:'no',quantity:10};answers.emergency={value:'unknown'};
 let saved=await call(db,'save',{school_id:sid,report_id:report.id,revision:report.revision,answers});
 await deny(()=>call(db,'save',{school_id:sid,report_id:report.id,revision:report.revision,answers}));await deny(()=>call(db,'submit',{school_id:sid,report_id:report.id,revision:saved.revision,answers,reviewed:false}));
 report=await call(db,'submit',{school_id:sid,report_id:report.id,revision:saved.revision,answers,reviewed:true});assert.equal(report.status,'submitted');assert.equal(report.result.pilot,true);assert(report.result.score<100);assert(report.result.critical.includes('emergency'));assert(report.result.excluded.includes('oxygen'));assert.equal(report.result.previous_score,null);
 assert.equal((await call(db,'submit',{school_id:sid,report_id:report.id,revision:saved.revision,answers,reviewed:true})).id,report.id);
 await deny(()=>call(db,'save',{school_id:sid,report_id:report.id,revision:report.revision,answers}));await deny(()=>call(db,'rfq',{school_id:sid,report_id:report.id}));assert((await call(db,'overview')).issues.length>=2);
 await asUser(db,'other');assert.equal((await call(db,'overview')).reports.length,0);assert.equal((await db.query('select * from ps_readiness_reports')).rows.length,0);
 await asUser(db,'manager');assert.equal((await call(db,'overview')).reports.length,1);assert.equal((await call(db,'overview')).notifications.length,1);await call(db,'review',{school_id:sid,report_id:report.id});
 await asUser(db,'ps');assert.equal((await call(db,'overview')).reports.length,0,'PS needs customer sharing permission');await db.exec('reset role');await db.query('update ps_readiness_settings set ps_share=true where school_id=$1',[sid]);await asUser(db,'ps');assert.equal((await call(db,'overview')).reports.length,1);
 await asUser(db,'nurse');for(let i=0;i<4;i++){const old=(await db.query("select * from ps_learning_progress")).rows[0];await call(db,'progress',{school_id:sid,module_id:'consumables',module_version:1,slide:i,revision:old?.revision||0});}
 const m=(await db.query("select document from ps_learning_modules where id='consumables'")).rows[0].document;
 const quiz={school_id:sid,module_id:'consumables',module_version:1,submission_key:'00000000-0000-4000-9000-000000000001',responses:Object.fromEntries(m.quiz.map(q=>[q.id,q.correct]))};
 const attempt=await call(db,'quiz',quiz);assert.equal(attempt.result.score,100);assert.equal((await call(db,'quiz',quiz)).id,attempt.id);await deny(()=>call(db,'quiz',{...quiz,responses:{}}));

 // Explicit, exact catalogue selection and administrator-only idempotent RFQ.
 await asUser(db,'nurse');const overview=await call(db,'overview'),gap=overview.issues.find(i=>i.question_id==='firstaid'),mapping=overview.catalogue.find(p=>p.question_ids.includes('firstaid'));
 await deny(()=>call(db,'propose',{school_id:sid,report_id:report.id,issue_id:gap.id,quantity:10,product:{...mapping,name:'Similar name'}}));
 const proposed=await call(db,'propose',{school_id:sid,report_id:report.id,issue_id:gap.id,quantity:10,product:mapping});assert.equal(proposed.quantity,10);
 await asUser(db,'manager');const rfq=await call(db,'rfq',{school_id:sid,report_id:report.id});const retry=await call(db,'rfq',{school_id:sid,report_id:report.id});assert.equal(retry.id,rfq.id);
 await db.exec('reset role');assert.equal((await db.query('select * from orders')).rows.length,1);assert.equal((await db.query('select quantity from order_lines')).rows[0].quantity,'10');
 // Unknown/missing are never compliant; incomplete results have no score/grade.
 const bank=report.bank_snapshot;
 const incomplete=(await db.query('select private.ps_score($1,$2,$3,$4) result',[bank,{},report.context_snapshot,'weekly'])).rows[0].result;
 assert.equal(incomplete.score,null);assert.equal(incomplete.grade,null);assert.equal(incomplete.complete,false);
 for(const [n,g] of [[97,'A+'],[93,'A'],[90,'A−'],[80,'B'],[70,'C'],[60,'D'],[59,'F']]){
  const synthetic={questions:[{id:'yes',weight:n,requirement:'mandatory'},{id:'no',weight:100-n,requirement:'mandatory'}],scoring_version:'test'};
  const scored=(await db.query('select private.ps_score($1,$2,$3,$4) result',[synthetic,{yes:{value:'yes'},no:{value:'no'}},{},'weekly'])).rows[0].result;assert.equal(scored.grade,g);assert.equal(scored.score,n);
 }
 // Weekly creation and reminders use Dubai time and unique keys, not page visits.
 await db.query("select private.ps_readiness_tick('2026-10-19T04:59:00Z')");
 let notifications=(await db.query("select * from ps_readiness_notifications where kind='due'")).rows;assert.equal(notifications.length,0);
 await db.query("select private.ps_readiness_tick('2026-10-19T05:00:00Z')");await db.query("select private.ps_readiness_tick('2026-10-19T05:01:00Z')");
 notifications=(await db.query("select * from ps_readiness_notifications where kind='due'")).rows;assert.equal(notifications.length,1);assert.equal(notifications[0].recipient_user,ids.nurse);
 await db.query("select private.ps_readiness_tick('2026-10-21T05:00:00Z')");await db.query("select private.ps_readiness_tick('2026-10-21T05:05:00Z')");
 assert.equal((await db.query("select * from ps_readiness_notifications where kind='overdue'")).rows.length,1);
 await db.query("update ps_readiness_settings set email_enabled=true");await db.query("update ps_readiness_notifications set email_state='queued' where kind='report'");
 await db.exec('set role service_role');const claimed=(await db.query("select ps_readiness_email('claim') result")).rows[0].result;assert(claimed.email.endsWith('@example.invalid'));await db.exec('reset role');
 await db.query('delete from memberships where user_id=$1',[ids.manager]);await db.exec('set role service_role');assert.equal((await db.query("select ps_readiness_email('recheck',$1) result",[claimed.id])).rows[0].result,null);await db.exec('reset role');
 await asUser(db,'manager');assert.equal((await call(db,'overview')).reports.length,0,'Permission revocation applies immediately');
 console.log('PASS scoring bands, incomplete suppression, exact SKU/pack/quantity, RFQ replay, Dubai schedule dedupe, delivery permission recheck');
 await db.exec("reset role;select set_config('request.jwt.claim.sub','',false);set role anon");await deny(()=>call(db,'overview'));
 console.log('PASS real Postgres: tenant isolation, role guards, persistence/revisions, immutable submissions, grades, critical/unknown, notification recipient, training and replay');
}finally{await db.close();}
