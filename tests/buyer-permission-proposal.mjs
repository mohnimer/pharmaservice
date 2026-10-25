// Isolated PostgreSQL only. Never applies this proposal to a connected project.
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const db=new PGlite(),id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
try{
 await db.exec(`create role authenticated; create schema auth;create schema private;
 create function auth.uid() returns uuid language sql stable as $$select current_setting('request.jwt.claim.sub')::uuid$$;
 create table memberships(user_id uuid,school_id uuid,role text);create table orders(id uuid,school_id uuid,status text);
 create function private.verified_customer() returns boolean language sql as $$select true$$;
 create function private.can_access_school(s uuid) returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from memberships m where m.user_id=auth.uid() and (m.school_id=s or m.school_id is null))$$;
 insert into memberships values('${id(1)}','${id(11)}','school_user'),('${id(2)}',null,'group_admin'),('${id(3)}','${id(11)}','management_approver');
 insert into orders values('${id(21)}','${id(11)}','quote_sent'),('${id(22)}','${id(12)}','quote_sent');
 grant usage on schema auth,private,public to authenticated;grant select on memberships to authenticated;grant select,update on orders to authenticated;
 alter table orders enable row level security;
 create policy scoped_read on orders for select to authenticated using(private.can_access_school(school_id));`);
 await db.exec(readFileSync('staging/buyer-permissions-20261025/named-approval-proposal.sql','utf8'));
 await db.exec(`create policy scoped_decision on orders for update to authenticated using(private.can_approve_school(school_id)) with check(private.can_approve_school(school_id));`);
 const user=async n=>db.exec(`reset role;set request.jwt.claim.sub='${id(n)}';set role authenticated;`);
 for(const n of [1,2]){await user(n);const r=await db.query(`update orders set status='confirmed' where id='${id(21)}' returning id`);assert.equal(r.rows.length,0,'visibility/request role cannot directly approve');}
 await user(3);assert.equal((await db.query(`update orders set status='confirmed' where id='${id(21)}' returning id`)).rows.length,1);assert.equal((await db.query(`update orders set status='confirmed' where id='${id(22)}' returning id`)).rows.length,0);
 console.log('PASS isolated staged permission proposal: school/group visibility cannot directly approve; named approver is site scoped. NOT APPLIED.');
}finally{await db.close();}
