import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
export const ids=Object.fromEntries(['nurse','other','manager','ps','group','school','school2','otherManager'].map((k,i)=>[k,'00000000-0000-4000-8000-'+String(i+1).padStart(12,'0')]));
export async function fixture(path){
 const db=new PGlite(path);
 await db.exec(readFileSync('tests/workshop-fixture.sql','utf8'));
 await db.query("insert into account_groups values($1,'Test Institution','test',true)",[ids.group]);
 for(const k of ['school','school2'])await db.query("insert into schools values($1,$2,'Test Institution',$3,true)",[ids[k],ids.group,k]);
 for(const k of ['nurse','other','manager','ps','otherManager']){
  await db.query("insert into auth.users values($1,$2,now(),null)",[ids[k],k+'@example.invalid']);
  await db.query("insert into profiles values($1,$2,$3)",[ids[k],k,k==='ps']);
 }
 for(const [u,s,r] of [['nurse','school','school_user'],['other','school2','school_user'],['manager','school','group_admin'],['otherManager','school2','group_admin']])await db.query("insert into memberships(user_id,group_id,school_id,role) values($1,$2,$3,$4)",[ids[u],ids.group,ids[s],r]);
 const original=readFileSync('supabase/migrations/20261009070238_launch_request_intake.sql','utf8');
 await db.exec(original.slice(original.indexOf('create or replace function public.psc_submit_institutional_request(')));
 await db.exec(readFileSync('supabase/migrations/20261017104154_workshop_report_card.sql','utf8'));
 return db;
}
export async function asUser(db,who){await db.exec("reset role;select set_config('request.jwt.claim.sub','"+ids[who]+"',false);set role authenticated;");}
export async function call(db,action,payload={}){const r=await db.query('select public.ps_workshop($1,$2::jsonb) as result',[action,JSON.stringify(payload)]);return r.rows[0].result;}
