// Embedded PostgreSQL; no network, Gmail, or production data used.
import {readFileSync} from 'node:fs';
const {PGlite}=await import(process.env.PSC_PGLITE||'@electric-sql/pglite');const db=new PGlite();
try{
await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
create schema auth;create schema private;create schema cron;
create table auth.users(id uuid primary key);create table public.profiles(user_id uuid primary key,is_psc_admin boolean);
create table public.account_groups(id uuid primary key,slug text);create table public.memberships(user_id uuid,group_id uuid);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create function private.is_psc_admin() returns boolean language sql stable security definer set search_path='' as $$select coalesce((select is_psc_admin from public.profiles where user_id=auth.uid()),false)$$;
create function cron.schedule(text,text,text) returns int language sql as $$select 1$$;
insert into auth.users values('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
insert into profiles values('11111111-1111-4111-8111-111111111111',true),('22222222-2222-4222-8222-222222222222',false);
grant usage on schema public,private,auth to anon,authenticated,service_role;grant select on profiles,memberships,account_groups to authenticated,service_role;`);
await db.exec(readFileSync('migrations/v37_7_mail_desk.sql','utf8'));
await db.exec('grant all on all tables in schema public to service_role;grant select,insert,update,delete on mail_contacts,mail_campaigns,mail_campaign_recipients to authenticated;');
await db.exec(readFileSync('supabase/migrations/20261009164439_outreach_alias_campaigns.sql','utf8'));
await db.exec(readFileSync('supabase/migrations/20261009165451_outreach_queue_recovery.sql','utf8'));
const result=await db.exec(readFileSync('tests/outreach-database.sql','utf8'));console.log(result.at(-1).rows[0].result);
}finally{await db.close()}
