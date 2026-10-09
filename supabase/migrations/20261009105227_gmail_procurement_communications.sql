-- Extend the existing mail infrastructure; no second notification queue.
create table public.psc_mail_connection (
 mailbox text primary key check(mailbox='info@pharmaservice.ae'), status text not null check(status in ('connected','reconnect_required','disconnected')),
 connected_by uuid references auth.users(id),connected_at timestamptz,last_checked_at timestamptz,last_error text,
 poll_page_token text,poll_started_at timestamptz,last_poll_at timestamptz
);
alter table public.psc_mail_connection enable row level security;
revoke all on public.psc_mail_connection from anon,authenticated;
grant select on public.psc_mail_connection to authenticated;
create policy mail_connection_admin on public.psc_mail_connection for select to authenticated using(private.is_psc_admin());
create table public.psc_mail_oauth_states(state_hash text primary key,created_by uuid not null references auth.users(id),created_at timestamptz not null default now(),expires_at timestamptz not null);
alter table public.psc_mail_oauth_states enable row level security;
revoke all on public.psc_mail_oauth_states from public,anon,authenticated;
grant all on public.psc_mail_connection,public.psc_mail_oauth_states to service_role;

create or replace function public.psc_mail_secret(p_operation text,p_value text default null) returns text
language plpgsql security definer set search_path='' as $$
declare v_id uuid;v_value text;
begin
 if p_operation='get' then select decrypted_secret into v_value from vault.decrypted_secrets where name='psc_gmail_refresh';return v_value;
 elsif p_operation='set' and length(p_value) between 10 and 10000 then
  select id into v_id from vault.secrets where name='psc_gmail_refresh';
  if v_id is null then perform vault.create_secret(p_value,'psc_gmail_refresh','PSC Gmail OAuth refresh token');else perform vault.update_secret(v_id,p_value);end if;return null;
 elsif p_operation='delete' then delete from vault.secrets where name='psc_gmail_refresh';return null;
 else raise exception 'Invalid secret operation';end if;
end $$;
revoke all on function public.psc_mail_secret(text,text) from public,anon,authenticated;
grant execute on function public.psc_mail_secret(text,text) to service_role;

select vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'psc_mail_worker','PSC internal mail worker authentication') where not exists(select 1 from vault.secrets where name='psc_mail_worker');
create or replace function public.psc_mail_worker_valid(p_token text) returns boolean
language sql security definer set search_path='' as $$ select length(p_token)=64 and exists(select 1 from vault.decrypted_secrets where name='psc_mail_worker' and decrypted_secret=p_token);$$;
revoke all on function public.psc_mail_worker_valid(text) from public,anon,authenticated;
grant execute on function public.psc_mail_worker_valid(text) to service_role;

alter table public.notification_outbox drop constraint notification_outbox_status_check;
alter table public.notification_outbox add constraint notification_outbox_status_check check(status in ('queued','sending','sent','failed','blocked','uncertain','held'));
alter table public.notification_outbox add column last_attempt_at timestamptz,add column next_attempt_at timestamptz default now(),add column accepted_at timestamptz,
 add column approved_at timestamptz,add column approved_by uuid references auth.users(id),add column approved_fingerprint text;

create table public.psc_mail_messages (
 id uuid primary key default gen_random_uuid(),gmail_message_id text unique not null,gmail_thread_id text not null,
 direction text not null check(direction in ('inbound','outbound')),kind text not null default 'review' check(kind in ('review','customer','supplier','notification','quotation','rfq','followup','test')),
 order_id uuid references public.orders(id),enquiry_id uuid references public.institutional_enquiries(id),
 sender text not null,recipient text not null,subject text not null,received_at timestamptz not null,
 body_text text,raw_object_path text,attachments jsonb not null default '[]',review_status text not null default 'unmatched',
 created_at timestamptz not null default now()
);
create index mail_messages_thread on public.psc_mail_messages(gmail_thread_id);
create index mail_messages_order on public.psc_mail_messages(order_id);
create table public.psc_mail_drafts (
 id uuid primary key default gen_random_uuid(),order_id uuid references public.orders(id),quote_id uuid references public.quotes(id),quote_snapshot_id uuid references public.quote_snapshots(id),quote_fingerprint text,
 kind text not null check(kind in ('quotation','rfq','followup','test')),recipient text not null,subject text not null,body_text text not null,
 attachment_path text,attachment_sha256 text,status text not null default 'draft' check(status in ('draft','sending','accepted','uncertain','failed')),
 created_by uuid not null references auth.users(id),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 approved_by uuid references auth.users(id),approved_at timestamptz,provider_message_id text,accepted_at timestamptz,last_error text
);
create unique index mail_quote_once on public.psc_mail_drafts(quote_snapshot_id) where status in ('sending','accepted','uncertain');
create table public.psc_mail_attempts (
 id uuid primary key default gen_random_uuid(),notification_id uuid references public.notification_outbox(id),draft_id uuid references public.psc_mail_drafts(id),
 attempted_at timestamptz not null default now(),status text not null,error_code text,provider_message_id text
);
do $$ declare t text;begin foreach t in array array['psc_mail_messages','psc_mail_drafts','psc_mail_attempts'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 execute format('create policy mail_admin_read on public.%I for select to authenticated using(private.is_psc_admin())',t);
 end loop;end $$;

create or replace function public.psc_mail_consume_state(p_hash text) returns uuid
language plpgsql security invoker set search_path='' as $$
declare v_user uuid;begin delete from public.psc_mail_oauth_states where state_hash=p_hash and expires_at>now() returning created_by into v_user;return v_user;end $$;
revoke all on function public.psc_mail_consume_state(text) from public,anon,authenticated;grant execute on function public.psc_mail_consume_state(text) to service_role;
create or replace function public.psc_mail_quote_fingerprint(p_order_id uuid) returns text language sql security definer set search_path='' as $$select private.psc_commercial_fingerprint(p_order_id);$$;
revoke all on function public.psc_mail_quote_fingerprint(uuid) from public,anon,authenticated;grant execute on function public.psc_mail_quote_fingerprint(uuid) to service_role;

-- Bounded rate slots, used before worker dispatch or admin actions.
create table public.psc_mail_rate_slots(key text primary key,window_start timestamptz not null,count integer not null);
alter table public.psc_mail_rate_slots enable row level security;revoke all on public.psc_mail_rate_slots from public,anon,authenticated;grant all on public.psc_mail_rate_slots to service_role;
create or replace function public.psc_mail_rate(p_key text,p_limit int,p_seconds int) returns boolean language plpgsql security invoker set search_path='' as $$
declare v_count int;begin
 insert into public.psc_mail_rate_slots values(p_key,now(),1) on conflict(key) do update set count=case when psc_mail_rate_slots.window_start<now()-make_interval(secs=>p_seconds) then 1 else psc_mail_rate_slots.count+1 end,window_start=case when psc_mail_rate_slots.window_start<now()-make_interval(secs=>p_seconds) then now() else psc_mail_rate_slots.window_start end returning count into v_count;
 return v_count<=p_limit;end $$;
revoke all on function public.psc_mail_rate(text,int,int) from public,anon,authenticated;grant execute on function public.psc_mail_rate(text,int,int) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('psc-correspondence','psc-correspondence',false,10485760,array['application/pdf','message/rfc822','application/octet-stream','text/plain','image/png','image/jpeg','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel']) on conflict(id) do nothing;
create policy correspondence_admin_read on storage.objects for select to authenticated using(bucket_id='psc-correspondence' and private.is_psc_admin());
create policy correspondence_admin_draft_upload on storage.objects for insert to authenticated with check(bucket_id='psc-correspondence' and private.is_psc_admin() and (storage.foldername(name))[1]='drafts');

create or replace function public.psc_dispatch_notification_webhook() returns trigger language plpgsql security definer set search_path='' as $$
declare v_token text;begin
 if new.status<>'queued' then return new;end if;
 select decrypted_secret into v_token from vault.decrypted_secrets where name='psc_mail_worker';
 perform net.http_post(url:='https://ewewkojlsgqvcqarmpgr.supabase.co/functions/v1/dispatch-notification',body:=jsonb_build_object('notification_id',new.id),headers:=jsonb_build_object('Content-Type','application/json','x-psc-worker',v_token),timeout_milliseconds:=5000);
 return new;exception when others then return new;end $$;
revoke all on function public.psc_dispatch_notification_webhook() from public,anon,authenticated;

-- Only due, definitive failures are retried. Unknown outcomes require reconciliation.
create or replace function private.psc_mail_tick() returns void language plpgsql security definer set search_path='' as $$
declare v_token text;r record;begin
 delete from public.psc_mail_oauth_states where expires_at<now();
 delete from public.psc_mail_rate_slots where window_start<now()-interval '2 days';
 update public.notification_outbox set status='uncertain',last_error='Worker interrupted; reconcile Gmail before retry' where status='sending' and last_attempt_at<now()-interval '10 minutes';
 update public.psc_mail_drafts set status='uncertain',last_error='Worker interrupted; reconcile Gmail before retry' where status='sending' and updated_at<now()-interval '10 minutes';
 if not exists(select 1 from public.psc_mail_connection where status='connected') then return;end if;
 select decrypted_secret into v_token from vault.decrypted_secrets where name='psc_mail_worker';
 for r in select id from public.notification_outbox where status in ('queued','failed') and attempts<3 and next_attempt_at<=now() order by created_at limit 10 loop
 perform net.http_post(url:='https://ewewkojlsgqvcqarmpgr.supabase.co/functions/v1/dispatch-notification',body:=jsonb_build_object('notification_id',r.id),headers:=jsonb_build_object('Content-Type','application/json','x-psc-worker',v_token));end loop;
 perform net.http_post(url:='https://ewewkojlsgqvcqarmpgr.supabase.co/functions/v1/poll-procurement-mail',body:='{}'::jsonb,headers:=jsonb_build_object('Content-Type','application/json','x-psc-worker',v_token));
end $$;
revoke all on function private.psc_mail_tick() from public,anon,authenticated;
select cron.schedule('psc-procurement-mail','*/5 * * * *','select private.psc_mail_tick();');

alter table public.quote_snapshots add column commercial_fingerprint text;
create or replace function private.psc_mail_snapshot_fingerprint() returns trigger language plpgsql security definer set search_path='' as $$
begin new.commercial_fingerprint:=private.psc_commercial_fingerprint((new.header_snapshot->>'order_id')::uuid);return new;end $$;
revoke all on function private.psc_mail_snapshot_fingerprint() from public,anon,authenticated;
create trigger mail_snapshot_fingerprint before insert on public.quote_snapshots for each row execute function private.psc_mail_snapshot_fingerprint();
