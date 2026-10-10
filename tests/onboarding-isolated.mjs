import {readFileSync} from 'node:fs';import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.PSC_PGLITE||'@electric-sql/pglite');const db=new PGlite();
try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema private;create schema cron;
 create table auth.users(id uuid primary key);create function private.is_psc_admin() returns boolean language sql as $$select false$$;create function cron.schedule(text,text,text) returns integer language sql as $$select 1$$;
 create table mail_contacts(id uuid primary key,journey_stage text constraint mail_contacts_journey_stage_check check(journey_stage in ('prospect','customer')));create table psc_crm_tasks(id uuid primary key default gen_random_uuid(),title text,due_date date,contact_id uuid,created_by uuid,updated_by uuid,source_rule text,source_excerpt text);
 create table psc_mail_drafts(id uuid primary key default gen_random_uuid(),kind text,contact_id uuid,communication_purpose text,recipient text,subject text,body_text text,created_by uuid,status text default 'draft',updated_at timestamptz default now(),approved_by uuid,approved_at timestamptz);
 insert into auth.users values('11111111-1111-4111-8111-111111111111');insert into mail_contacts(id) values('22222222-2222-4222-8222-222222222222');`);
 await db.exec(readFileSync('supabase/migrations/20261010111128_customer_onboarding.sql','utf8'));
 const b=(await db.query(`insert into psc_onboarding(contact_id,items,status,recipient,created_by) values('22222222-2222-4222-8222-222222222222','{}','waiting','test@example.invalid','11111111-1111-4111-8111-111111111111') returning id`)).rows[0].id;
 await db.query(`insert into psc_onboarding_reminders(onboarding_id,step,due_at) values($1,3,now()-interval '1 day'),($1,7,now()-interval '1 day')`,[b]);
 const draft=async(step,rev=1)=>(await db.query('select psc_onboarding_draft($1,$2,$3,$4,$5) as id',[b,rev,step,'Reminder','Only missing items'])).rows[0].id;
 const d=await draft(3);assert(d);assert.equal(await draft(3),null);assert.equal(await draft(7),null);assert.equal((await db.query('select count(*)::int n from psc_crm_tasks')).rows[0].n,1);
 await db.query(`select psc_onboarding_save($1,1,'{"status":"paused"}')`,[b]);let rejected=false;try{await db.query(`select psc_claim_onboarding_draft($1,(select updated_at from psc_mail_drafts where id=$1),'11111111-1111-4111-8111-111111111111')`,[d])}catch{rejected=true}assert(rejected,'paused draft must not be claimable');
 await db.query(`select psc_onboarding_save($1,2,'{"status":"waiting"}')`,[b]);const fresh=await draft(3,3);assert(fresh&&fresh!==d);
 const permissions=(await db.query(`select has_table_privilege('anon','psc_onboarding','SELECT') a,has_table_privilege('authenticated','psc_onboarding','UPDATE') u,has_function_privilege('authenticated','psc_onboarding_draft(uuid,integer,integer,text,text)','EXECUTE') e`)).rows[0];assert.deepEqual(permissions,{a:false,u:false,e:false});
 console.log('Onboarding SQL: atomic draft/task creation, duplicate prevention, pause/revision guards and restricted permissions PASS');
}finally{await db.close()}
