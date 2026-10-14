import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
process.on('uncaughtException',e=>{console.error(e.message);process.exit(1)});
const db=new PGlite(),admin='00000000-0000-4000-8000-000000000001';
await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema private;
create table auth.users(id uuid primary key);create table profiles(user_id uuid,is_psc_admin boolean);create table account_groups(id uuid,slug text);create table memberships(user_id uuid,group_id uuid);
create table psc_mail_drafts(id uuid primary key,status text,subject text,updated_at timestamptz);create table psc_customer_invitations(id uuid primary key,status text,subject text,updated_at timestamptz);
grant usage on schema public,auth,private to service_role;grant all on all tables in schema public to service_role;
insert into auth.users values('${admin}');insert into profiles values('${admin}',true);`);
const sql=readFileSync('supabase/migrations/20261014134249_scheduled_email_delivery.sql','utf8').split('create or replace function private.psc_mail_http')[0];await db.exec(sql);
const query=(s,p=[])=>db.query(s,p);const row=(await query("select has_table_privilege('authenticated','psc_email_schedules','select') as permitted,has_function_privilege('anon','psc_claim_due_mail_schedules()','execute') as worker" )).rows[0];assert.equal(row.permitted,false);assert.equal(row.worker,false);
for(const [index,target] of ['mailbox','procurement-mail','customer-invitations'].entries()){
 const id='00000000-0000-4000-8000-'+String(index+10).padStart(12,'0'),table=target==='customer-invitations'?'psc_customer_invitations':'psc_mail_drafts';await query(`insert into ${table} values($1,'draft','Review me',now())`,[id]);
 const schedule=async()=> (await query(`select to_jsonb(psc_schedule_mail($1,$2,now()+interval '1 hour',$3,(select to_jsonb(t) from ${table} t where id=$2),'Review me','buyer@example.invalid')) as job`,[target,id,admin])).rows[0].job;
 const first=await schedule();await assert.rejects(query(`update ${table} set subject='Changed' where id=$1`,[id]),/cancel_scheduled/);await assert.rejects(schedule(),/duplicate key/);
 assert.equal((await query('select psc_cancel_mail_schedule($1) as cancelled',[first.id])).rows[0].cancelled,true);await query(`update ${table} set subject='Reviewed change' where id=$1`,[id]);
 const j=await schedule();assert.equal((await query('select * from psc_claim_due_mail_schedules()')).rows.length,0,'future jobs stay queued');await query("update psc_email_schedules set send_at=now()-interval '1 second' where id=$1",[j.id]);
 const due=(await query('select * from psc_claim_due_mail_schedules()')).rows;assert.equal(due.length,1);assert.equal(due[0].id,j.id);assert.equal((await query('select * from psc_claim_due_mail_schedules()')).rows.length,0,'claimed once');
 assert.equal((await query('select psc_cancel_mail_schedule($1) as cancelled',[j.id])).rows[0].cancelled,false,'cannot cancel after dispatch begins');
 assert.equal((await query('select (psc_authorize_mail_schedule($1,$2,$3)).id as id',[j.id,target,id])).rows[0].id,j.id);
 await query('update profiles set is_psc_admin=false');assert.equal((await query('select (psc_authorize_mail_schedule($1,$2,$3)).id as id',[j.id,target,id])).rows[0].id,null);await query('update profiles set is_psc_admin=true');
 await query(`update ${table} set status='sending' where id=$1`,[id]);await query("update psc_email_schedules set started_at=now()-interval '6 minutes' where id=$1",[j.id]);assert.equal((await query('select * from psc_claim_due_mail_schedules()')).rows.length,0);assert.equal((await query('select status from psc_email_schedules where id=$1',[j.id])).rows[0].status,'uncertain');
}
console.log('PASS: schedule isolation, frozen drafts, cancellation, due-time claims, revoked admin and no retry of unknown outcomes');await db.close();
