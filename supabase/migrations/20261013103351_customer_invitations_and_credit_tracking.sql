-- Staged feature only. Do not run on production without explicit release approval.
create table public.psc_customer_invitations (
 id uuid primary key default gen_random_uuid(), group_id uuid not null references public.account_groups(id),
 school_id uuid not null references public.schools(id), school_ids uuid[] not null,
 full_name text check(length(full_name) between 1 and 200), recipient_email text check(length(recipient_email)<=254 and recipient_email=lower(recipient_email)),
 role text not null default 'school_clinic_user' check(role in ('school_clinic_user','management_approver')),
 status text not null default 'draft' check(status in ('draft','sending','sent','pending_activation','activated','revoked','failed','uncertain')),
 send_nonce uuid, token_hash text, auth_user_id uuid references auth.users(id), expires_at timestamptz,
 sent_at timestamptz, activated_at timestamptz, revoked_at timestamptz, provider_message_id text,
 created_by uuid references auth.users(id), approved_by uuid references auth.users(id), approved_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), last_error text, seed_key text unique,
 check(cardinality(school_ids) between 1 and 100), check(school_id=any(school_ids))
);
create unique index invitation_one_outstanding_email on public.psc_customer_invitations(recipient_email) where recipient_email is not null and status in ('sending','sent','pending_activation','uncertain');
create table public.psc_invitation_events (
 id uuid primary key default gen_random_uuid(), invitation_id uuid not null references public.psc_customer_invitations(id),
 event text not null, actor uuid references auth.users(id), recorded_at timestamptz not null default now(), detail jsonb not null default '{}'
);
alter table public.psc_customer_invitations enable row level security;
alter table public.psc_invitation_events enable row level security;
revoke all on public.psc_customer_invitations,public.psc_invitation_events from public,anon,authenticated;
grant select on public.psc_customer_invitations,public.psc_invitation_events to authenticated;
grant all on public.psc_customer_invitations,public.psc_invitation_events to service_role;
create policy invitation_admin_read on public.psc_customer_invitations for select to authenticated using(private.is_psc_admin());
create policy invitation_events_admin_read on public.psc_invitation_events for select to authenticated using(private.is_psc_admin());

-- Demo memberships never acquire administrative authority, even if a profile is misflagged.
create or replace function private.is_psc_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p join auth.users u on u.id=p.user_id where p.user_id=auth.uid() and p.is_psc_admin and u.email_confirmed_at is not null and coalesce(u.banned_until,'-infinity')<now()) and not exists(select 1 from public.memberships m join public.account_groups g on g.id=m.group_id where m.user_id=auth.uid() and g.slug='psc-demo-group');
$$;
revoke all on function private.is_psc_admin() from public,anon;
grant execute on function private.is_psc_admin() to authenticated,service_role;
alter table public.memberships drop constraint memberships_role_check;
alter table public.memberships add constraint memberships_role_check check(role in ('psc_admin','group_admin','school_user','management_approver'));
create or replace function private.verified_customer() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null and coalesce(banned_until,'-infinity')<now());
$$;
revoke all on function private.verified_customer() from public,anon;
grant execute on function private.verified_customer() to authenticated,service_role;
create or replace function private.can_access_school(target_school uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.is_psc_admin() or (private.verified_customer() and exists(
  select 1 from public.memberships m join public.schools s on s.group_id=m.group_id
  where m.user_id=auth.uid() and s.id=target_school and s.active and
   (m.school_id=target_school or (m.school_id is null and m.role in ('group_admin','psc_admin')))));
$$;
create or replace function private.can_approve_school(target_school uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.verified_customer() and private.can_access_school(target_school) and
 (not exists(select 1 from public.schools s join public.account_groups g on g.id=s.group_id where s.id=target_school and g.slug='aeg-education') or
 exists(select 1 from public.memberships m join public.schools s on s.group_id=m.group_id where m.user_id=auth.uid() and m.role='management_approver' and m.school_id=target_school and s.id=target_school));
$$;
revoke all on function private.can_approve_school(uuid) from public,anon;
grant execute on function private.can_approve_school(uuid) to authenticated,service_role;
drop policy "group members read schools" on public.schools;
create policy "group members read schools" on public.schools for select to authenticated using(private.can_access_school(id));
create or replace function private.can_submit_school(target_school uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.is_psc_admin() or (private.verified_customer() and exists(select 1 from public.memberships m join public.schools s on s.group_id=m.group_id where m.user_id=auth.uid() and s.id=target_school and s.active and (m.role='school_user' and m.school_id=target_school or m.role='group_admin' and (m.school_id is null or m.school_id=target_school))));
$$;
revoke all on function private.can_submit_school(uuid) from public,anon;
grant execute on function private.can_submit_school(uuid) to authenticated,service_role;
drop policy "members create orders" on public.orders;
create policy "members create orders" on public.orders for insert to authenticated with check(private.can_submit_school(school_id) and requested_by=auth.uid() and status='under_review' and exists(select 1 from public.schools s where s.id=orders.school_id and s.group_id=orders.group_id));
drop policy "members create order lines" on public.order_lines;
create policy "members create order lines" on public.order_lines for insert to authenticated with check(exists(select 1 from public.orders o where o.id=order_lines.order_id and o.status='under_review' and o.requested_by=auth.uid() and private.can_submit_school(o.school_id)));
drop policy "members read quotes" on public.quotes;
create policy "members read quotes" on public.quotes for select to authenticated using(exists(select 1 from public.orders o join public.account_groups g on g.id=o.group_id where o.id=quotes.order_id and private.can_access_school(o.school_id) and (g.slug<>'aeg-education' or quotes.status in ('sent','confirmed','cancelled','expired'))));
-- AEG decisions go through the audited RPC; a group_admin alone is not an approver.
drop policy "members decide quoted orders" on public.orders;
create policy "members decide quoted orders" on public.orders for update to authenticated
 using(private.can_approve_school(school_id) and status='quote_sent' and not exists(select 1 from public.account_groups g where g.id=group_id and g.slug='aeg-education'))
 with check(private.can_approve_school(school_id) and status in ('confirmed','cancelled'));

-- Do not silently run legacy provisioning grants when creating a new invited identity.
grant usage on schema private to service_role;
create or replace function private.invitation_has_legacy_provisioning(p_email text) returns boolean language sql security definer set search_path='' as $$
 select current_setting('role',true)='service_role' and exists(select 1 from private.user_provisioning where lower(email)=lower(p_email) and active);
$$;
revoke all on function private.invitation_has_legacy_provisioning(text) from public,anon,authenticated;
grant execute on function private.invitation_has_legacy_provisioning(text) to service_role;
create or replace function public.psc_invitation_has_legacy_provisioning(p_email text) returns boolean language sql security invoker set search_path='' as $$ select private.invitation_has_legacy_provisioning(p_email); $$;
revoke all on function public.psc_invitation_has_legacy_provisioning(text) from public,anon,authenticated;
grant execute on function public.psc_invitation_has_legacy_provisioning(text) to service_role;
create or replace function private.find_invitation_user(p_email text) returns uuid language sql security definer set search_path='' as $$
 select id from auth.users where lower(email)=lower(p_email) and current_setting('role',true)='service_role' limit 1;
$$;
revoke all on function private.find_invitation_user(text) from public,anon,authenticated;
grant execute on function private.find_invitation_user(text) to service_role;
create or replace function public.psc_find_invitation_user(p_email text) returns uuid language sql security invoker set search_path='' as $$ select private.find_invitation_user(p_email); $$;
revoke all on function public.psc_find_invitation_user(text) from public,anon,authenticated;
grant execute on function public.psc_find_invitation_user(text) to service_role;
create or replace function private.activate_customer_invitation(p_id uuid,p_hash text,p_user uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare i public.psc_customer_invitations; u auth.users; school uuid;
begin
 if current_setting('role',true)<>'service_role' then raise exception 'Internal invitation service required';end if;
 select * into i from public.psc_customer_invitations where id=p_id for update;
 select * into u from auth.users where id=p_user;
 if i.id is null or i.status not in ('sent','pending_activation') or i.expires_at is null or i.expires_at<=now() or i.token_hash is distinct from p_hash or i.auth_user_id is distinct from p_user
  or lower(u.email) is distinct from i.recipient_email or u.email_confirmed_at is null or coalesce(u.encrypted_password,'')='' then raise exception 'Invitation invalid, expired, already used, or identity unverified';end if;
 if exists(select 1 from public.memberships m join public.account_groups g on g.id=m.group_id where m.user_id=p_user and g.slug='psc-demo-group') then raise exception 'Demo accounts cannot activate customer invitations';end if;
 if not exists(select 1 from public.account_groups where id=i.group_id and active and slug<>'psc-demo-group') then raise exception 'Invitation group unavailable';end if;
 if exists(select 1 from unnest(i.school_ids) x left join public.schools s on s.id=x where s.group_id is distinct from i.group_id or not coalesce(s.active,false)) then raise exception 'Invitation school scope changed';end if;
 insert into public.profiles(user_id,full_name,is_psc_admin,account_type) values(p_user,i.full_name,false,'institutional') on conflict(user_id) do nothing;
 foreach school in array i.school_ids loop
  insert into public.memberships(user_id,group_id,school_id,role) values(p_user,i.group_id,school,case i.role when 'school_clinic_user' then 'school_user' else 'management_approver' end) on conflict(user_id,group_id,school_id,role) do nothing;
 end loop;
 update public.psc_customer_invitations set status='activated',activated_at=now(),token_hash=null,updated_at=now() where id=i.id;
 insert into public.psc_invitation_events(invitation_id,event,actor) values(i.id,'activated',p_user);
 return jsonb_build_object('activated',true,'school_ids',i.school_ids);
end $$;
revoke all on function private.activate_customer_invitation(uuid,text,uuid) from public,anon,authenticated;
grant execute on function private.activate_customer_invitation(uuid,text,uuid) to service_role;

create or replace function public.psc_activate_customer_invitation(p_id uuid,p_hash text,p_user uuid) returns jsonb language sql security invoker set search_path='' as $$ select private.activate_customer_invitation(p_id,p_hash,p_user); $$;
revoke all on function public.psc_activate_customer_invitation(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.psc_activate_customer_invitation(uuid,text,uuid) to service_role;

create table public.psc_management_decisions (
 id uuid primary key default gen_random_uuid(), quote_id uuid not null references public.quotes(id), revision integer not null, commercial_fingerprint text not null,
 decision text not null check(decision in ('approved','rejected')), note text not null default '' check(length(note)<=2000),
 decided_by uuid not null references auth.users(id), decided_at timestamptz not null default now(), unique(quote_id,revision)
);
alter table public.psc_management_decisions enable row level security;
revoke all on public.psc_management_decisions from public,anon,authenticated;
grant select on public.psc_management_decisions to authenticated;grant all on public.psc_management_decisions to service_role;
create policy management_decision_read on public.psc_management_decisions for select to authenticated using(private.is_psc_admin() or exists(select 1 from public.quotes q join public.orders o on o.id=q.order_id where q.id=quote_id and private.can_access_school(o.school_id)));
create or replace function private.record_management_decision(p_quote uuid,p_revision integer,p_decision text,p_note text) returns jsonb language plpgsql security definer set search_path='' as $$
declare q public.quotes; o public.orders; fingerprint text;
begin
 select * into q from public.quotes where id=p_quote for update;select * into o from public.orders where id=q.order_id for update;
 if q.id is null or q.status<>'sent' or q.current_revision<>p_revision or q.expires_at is null or q.expires_at<=now() then raise exception 'Current issued quotation required';end if;
 if not private.can_approve_school(o.school_id) or not exists(select 1 from public.memberships where user_id=auth.uid() and school_id=o.school_id and role='management_approver') then raise exception 'Named management approver required';end if;
 fingerprint:=public.psc_mail_quote_fingerprint(o.id);
 if not exists(select 1 from public.quote_snapshots where quote_id=q.id and revision_no=q.current_revision and snapshot_kind='issued' and commercial_fingerprint=fingerprint) then raise exception 'Current issued quotation snapshot required';end if;
 if p_decision not in ('approved','rejected') or length(coalesce(p_note,''))>2000 then raise exception 'Invalid decision';end if;
 insert into public.psc_management_decisions(quote_id,revision,commercial_fingerprint,decision,note,decided_by) values(q.id,p_revision,fingerprint,p_decision,coalesce(p_note,''),auth.uid());
 -- This records management authorization only. No PO, credit or procurement release is created.
 return jsonb_build_object('recorded',true,'decision',p_decision);
end $$;
revoke all on function private.record_management_decision(uuid,integer,text,text) from public,anon;
grant execute on function private.record_management_decision(uuid,integer,text,text) to authenticated;
create or replace function public.psc_record_management_decision(p_quote uuid,p_revision integer,p_decision text,p_note text default '') returns jsonb language sql security invoker set search_path='' as $$
 select private.record_management_decision(p_quote,p_revision,p_decision,p_note);
$$;
revoke all on function public.psc_record_management_decision(uuid,integer,text,text) from public,anon;
grant execute on function public.psc_record_management_decision(uuid,integer,text,text) to authenticated;
create or replace function private.check_aeg_management_release() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status in ('confirmed','under_process','out_for_delivery','delivered') and new.status is distinct from old.status and exists(select 1 from public.account_groups where id=new.group_id and slug='aeg-education') and not exists(
  select 1 from public.quotes q join public.psc_management_decisions d on d.quote_id=q.id and d.revision=q.current_revision where q.order_id=new.id and d.decision='approved' and d.commercial_fingerprint=public.psc_mail_quote_fingerprint(new.id)) then raise exception 'Current AEG management approval required before commercial release';end if;
 return new;
end $$;
revoke all on function private.check_aeg_management_release() from public,anon,authenticated;
create trigger aeg_management_release before update of status on public.orders for each row execute function private.check_aeg_management_release();

create table public.psc_credit_accounts (
 id uuid primary key default gen_random_uuid(),group_id uuid not null references public.account_groups(id), school_ids uuid[] not null default '{}',
 legal_entity text,signatory_name text,signatory_position text,documents_issued_at date,documents_received_at date,
 status text not null default 'not_started' check(status in ('not_started','documents_provided','awaiting_signature','received','under_review','approved','declined')),
 proposed_payment_days integer not null default 30 check(proposed_payment_days between 0 and 365),
 approved_limit numeric(14,2) check(approved_limit>=0),approved_payment_terms text,approved_at timestamptz,approved_by uuid references auth.users(id),
 eligible_skus text[] not null default '{}',documents jsonb not null default '[]',notes text not null default '' check(length(notes)<=5000),
 updated_by uuid not null references auth.users(id),updated_at timestamptz not null default now(),
 check(status<>'approved' or (approved_limit>0 and approved_payment_terms is not null and approved_at is not null and approved_by is not null and cardinality(eligible_skus)>0))
);
create table public.psc_credit_account_history(id uuid primary key default gen_random_uuid(),account_id uuid not null references public.psc_credit_accounts(id),snapshot jsonb not null,actor uuid not null references auth.users(id),recorded_at timestamptz not null default now());
alter table public.psc_credit_accounts enable row level security;alter table public.psc_credit_account_history enable row level security;
revoke all on public.psc_credit_accounts,public.psc_credit_account_history from public,anon,authenticated;
grant select,insert,update on public.psc_credit_accounts to authenticated;grant select on public.psc_credit_account_history to authenticated;
grant all on public.psc_credit_accounts,public.psc_credit_account_history to service_role;
create policy credit_admin_read on public.psc_credit_accounts for select to authenticated using(private.is_psc_admin());
create policy credit_admin_write on public.psc_credit_accounts for all to authenticated using(private.is_psc_admin()) with check(private.is_psc_admin() and updated_by=auth.uid() and not exists(select 1 from public.memberships m join public.account_groups g on g.id=m.group_id where m.user_id=auth.uid() and g.slug='psc-demo-group'));
create policy credit_history_admin_read on public.psc_credit_account_history for select to authenticated using(private.is_psc_admin());
create or replace function private.log_credit_account() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from unnest(new.school_ids) x left join public.schools s on s.id=x where s.group_id is distinct from new.group_id) then raise exception 'Schools must belong to the purchasing group';end if;
 if new.status='approved' and new.approved_by is distinct from auth.uid() then raise exception 'Credit approval must name the current PSC administrator';end if;
 insert into public.psc_credit_account_history(account_id,snapshot,actor) values(new.id,to_jsonb(new),auth.uid());return new;
end $$;
revoke all on function private.log_credit_account() from public,anon,authenticated;
create trigger credit_account_history after insert or update on public.psc_credit_accounts for each row execute function private.log_credit_account();
-- These records track documentation only; never modify order funding checks or SKU eligibility.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('psc-credit-documents','psc-credit-documents',false,10485760,array['application/pdf','image/png','image/jpeg']) on conflict(id) do update set public=false;
create policy credit_documents_admin on storage.objects for all to authenticated using(bucket_id='psc-credit-documents' and private.is_psc_admin()) with check(bucket_id='psc-credit-documents' and private.is_psc_admin() and not exists(select 1 from public.memberships m join public.account_groups g on g.id=m.group_id where m.user_id=auth.uid() and g.slug='psc-demo-group'));
-- Five recipient-free drafts, tied to existing school IDs. Never copy Loai's quote address into clinic invitations.
insert into public.psc_customer_invitations(group_id,school_id,school_ids,seed_key)
 select g.id,s.id,array[s.id],'aeg_initial_'||s.id from public.account_groups g join public.schools s on s.group_id=g.id where g.slug='aeg-education' and s.active on conflict(seed_key) do nothing;
