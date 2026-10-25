// Entirely isolated PostgreSQL; no connected project or service key.
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';import assert from 'node:assert/strict';
const db=new PGlite(),id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
try{
 await db.exec(`create role authenticated;create role anon;create schema auth;create schema private;
 create function auth.uid() returns uuid language sql stable as $$select current_setting('request.jwt.claim.sub')::uuid$$;
 create function private.is_psc_admin() returns boolean language sql stable as $$select current_setting('request.jwt.claim.sub')='${id(99)}'$$;
 create function private.verified_customer() returns boolean language sql stable as $$select current_setting('request.jwt.claim.sub')<>'${id(3)}'$$;
 create function private.can_access_school(s uuid) returns boolean language sql stable as $$select s='${id(11)}'::uuid or private.is_psc_admin()$$;
 create table memberships(user_id uuid,school_id uuid,role text);
 create table orders(id uuid,school_id uuid);
 create table quotes(id uuid,order_id uuid,quote_number text,status text,current_revision int,sent_at timestamptz,expires_at timestamptz,validity_days int,payment_terms text,delivery_terms text,customer_note text,currency text,subtotal numeric,vat numeric,total numeric,internal_note text,cost_total numeric,gross_margin_pct numeric);
 create table quote_lines(id uuid,quote_id uuid,order_line_id uuid,line_no int,psc_sku_snapshot text,line_description_snapshot text,brand_model_snapshot text,pack_snapshot text,specification_snapshot text,quantity numeric,unit_sell_price_ex_vat numeric,vat_rate_pct numeric,customer_note text,internal_cost numeric);
 create table psc_management_decisions(quote_id uuid,revision int,decision text);alter table psc_management_decisions enable row level security;grant select on psc_management_decisions to authenticated;
 insert into orders values('${id(21)}','${id(11)}'),('${id(22)}','${id(12)}');
 insert into quotes(id,order_id,status,quote_number,internal_note,cost_total,gross_margin_pct) values('${id(31)}','${id(21)}','sent','ISSUED','PRIVATE_SECRET',10,20),('${id(32)}','${id(21)}','draft','DRAFT','PRIVATE_SECRET',20,30),('${id(33)}','${id(22)}','sent','OTHER-CAMPUS','PRIVATE_SECRET',40,50);
 insert into psc_management_decisions values('${id(31)}',3,'approved'),('${id(33)}',1,'approved');
 insert into quote_lines(id,quote_id,line_no,pack_snapshot,internal_cost) values('${id(41)}','${id(31)}',1,'20 exact packs',123);
 grant usage on schema public,auth,private to authenticated;grant select,insert,update on quotes,quote_lines to authenticated;grant select on orders to authenticated;
 alter table quotes enable row level security;alter table quote_lines enable row level security;
 create policy existing_read on quotes for select to authenticated using(true);create policy existing_line_read on quote_lines for select to authenticated using(true);
 create policy admin_update on quotes for update to authenticated using(private.is_psc_admin()) with check(private.is_psc_admin());`);
 await db.exec(readFileSync('supabase/migrations/20261025000100_buyer_issued_quote_reader.sql','utf8'));
 await db.exec(readFileSync('supabase/migrations/20261025000200_buyer_quote_privacy_and_named_authority.sql','utf8'));
 const user=async n=>db.exec(`reset role;set request.jwt.claim.sub='${id(n)}';set role authenticated;`);
 await user(1);assert.equal((await db.query('select internal_note,cost_total,gross_margin_pct from quotes')).rows.length,0);assert.equal((await db.query('select internal_cost from quote_lines')).rows.length,0);
 assert.equal((await db.query('select * from psc_management_decisions')).rows.length,1);
 const payload=(await db.query(`select public.psc_buyer_issued_quotes('${id(11)}') as data`)).rows[0].data;assert.equal(payload.length,1);assert.equal(payload[0].quote_number,'ISSUED');assert.equal(payload[0].issued_lines[0].pack_snapshot,'20 exact packs');assert(!JSON.stringify(payload).includes('PRIVATE_SECRET'));assert(!Object.hasOwn(payload[0],'cost_total'));assert(!Object.hasOwn(payload[0].issued_lines[0],'internal_cost'));
 await assert.rejects(()=>db.query(`select public.psc_buyer_issued_quotes('${id(12)}')`),/Campus access denied/);
 await user(3);await assert.rejects(()=>db.query(`select public.psc_buyer_issued_quotes('${id(11)}')`),/Campus access denied/);
 await db.exec('reset role;set role anon');await assert.rejects(()=>db.query(`select public.psc_buyer_issued_quotes('${id(11)}')`),/permission denied/);
 await user(99);assert.equal((await db.query('select * from quotes')).rows.length,3);assert.equal((await db.query(`update quotes set internal_note='ADMIN EDIT' where id='${id(31)}' returning id`)).rows.length,1);assert.equal((await db.query('select internal_cost from quote_lines')).rows[0].internal_cost,'123');
 console.log('PASS staged privacy SQL: customer direct-table financial reads blocked, issued-only RPC, exact packs, campus/verification/anonymous denial, admin quote read/edit preserved. NOT APPLIED.');
}finally{await db.close();}
