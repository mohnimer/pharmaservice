create table public.psc_email_schedules (
 id uuid primary key default gen_random_uuid(),
 target text not null check(target in ('mailbox','procurement-mail','customer-invitations')),
 target_id uuid not null, send_at timestamptz not null,
 status text not null default 'pending' check(status in ('pending','dispatching','sent','cancelled','failed','uncertain')),
 snapshot jsonb not null,subject text not null,recipient text not null,
 created_by uuid not null references auth.users(id),created_at timestamptz not null default now(),
 started_at timestamptz,finished_at timestamptz,last_error text
);
create unique index psc_email_schedule_active on public.psc_email_schedules(target,target_id) where status in ('pending','dispatching');
create index psc_email_schedule_due on public.psc_email_schedules(send_at) where status='pending';
alter table public.psc_email_schedules enable row level security;
revoke all on public.psc_email_schedules from public,anon,authenticated;
grant all on public.psc_email_schedules to service_role;

create function public.psc_schedule_mail(p_target text,p_target_id uuid,p_send_at timestamptz,p_user uuid,p_snapshot jsonb,p_subject text,p_recipient text)
returns public.psc_email_schedules language plpgsql security invoker set search_path='' as $$
declare r jsonb;j public.psc_email_schedules;begin
 if p_target not in ('mailbox','procurement-mail','customer-invitations') or p_send_at<now()+interval '30 seconds' or p_send_at>now()+interval '366 days'
 or not exists(select 1 from public.profiles where user_id=p_user and is_psc_admin)
 or exists(select 1 from public.memberships m join public.account_groups g on g.id=m.group_id where m.user_id=p_user and g.slug='psc-demo-group') then raise exception 'invalid_mail_schedule';end if;
 if p_target='customer-invitations' then select to_jsonb(t) into r from public.psc_customer_invitations t where id=p_target_id for update;
 else select to_jsonb(t) into r from public.psc_mail_drafts t where id=p_target_id for update;end if;
 if r is null or r->>'status'<>'draft' or r<>p_snapshot then raise exception 'draft_changed_reload';end if;
 insert into public.psc_email_schedules(target,target_id,send_at,created_by,snapshot,subject,recipient)
 values(p_target,p_target_id,p_send_at,p_user,r,p_subject,p_recipient) returning * into j;return j;
end $$;

create function public.psc_cancel_mail_schedule(p_id uuid) returns boolean language plpgsql security invoker set search_path='' as $$
begin update public.psc_email_schedules set status='cancelled',finished_at=now() where id=p_id and status='pending';return found;end $$;

create function public.psc_claim_due_mail_schedules() returns setof public.psc_email_schedules language plpgsql security invoker set search_path='' as $$
begin
 -- A timed-out dispatch may already have reached Gmail. It must never be retried automatically.
 update public.psc_email_schedules set status='uncertain',last_error='scheduled_send_outcome_unknown',finished_at=now() where status='dispatching' and started_at<now()-interval '5 minutes';
 return query with due as(select id from public.psc_email_schedules where status='pending' and send_at<=now() order by send_at limit 2 for update skip locked)
 update public.psc_email_schedules j set status='dispatching',started_at=now() from due where j.id=due.id returning j.*;
end $$;

create function public.psc_authorize_mail_schedule(p_id uuid,p_target text,p_target_id uuid) returns public.psc_email_schedules language plpgsql security invoker set search_path='' as $$
declare j public.psc_email_schedules;r jsonb;begin
 select * into j from public.psc_email_schedules where id=p_id and target=p_target and target_id=p_target_id and status='dispatching' and send_at<=now();
 if j.id is null or not exists(select 1 from public.profiles where user_id=j.created_by and is_psc_admin)
 or exists(select 1 from public.memberships m join public.account_groups g on g.id=m.group_id where m.user_id=j.created_by and g.slug='psc-demo-group') then return null;end if;
 if p_target='customer-invitations' then select to_jsonb(t) into r from public.psc_customer_invitations t where id=p_target_id;
 else select to_jsonb(t) into r from public.psc_mail_drafts t where id=p_target_id;end if;
 if r is null or r->>'status'<>'draft' or r<>j.snapshot then return null;end if;return j;
end $$;

create function private.psc_lock_scheduled_email() returns trigger language plpgsql security definer set search_path='' as $$
declare j public.psc_email_schedules;begin
 select * into j from public.psc_email_schedules where target_id=old.id and ((tg_table_name='psc_customer_invitations' and target='customer-invitations') or (tg_table_name='psc_mail_drafts' and target in ('mailbox','procurement-mail'))) and status in ('pending','dispatching');
 if j.id is not null and (tg_op='DELETE' or j.status='pending' or new.status='draft') then raise exception 'cancel_scheduled_send_before_editing';end if;
 if tg_op='DELETE' then return old;end if;return new;
end $$;
create trigger psc_lock_scheduled_draft before update or delete on public.psc_mail_drafts for each row when(old.status='draft') execute function private.psc_lock_scheduled_email();
create trigger psc_lock_scheduled_invitation before update or delete on public.psc_customer_invitations for each row when(old.status='draft') execute function private.psc_lock_scheduled_email();
revoke all on function private.psc_lock_scheduled_email() from public,anon,authenticated;
revoke all on function public.psc_schedule_mail(text,uuid,timestamptz,uuid,jsonb,text,text), public.psc_cancel_mail_schedule(uuid),public.psc_claim_due_mail_schedules(),public.psc_authorize_mail_schedule(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.psc_schedule_mail(text,uuid,timestamptz,uuid,jsonb,text,text), public.psc_cancel_mail_schedule(uuid),public.psc_claim_due_mail_schedules(),public.psc_authorize_mail_schedule(uuid,text,uuid) to service_role;

create or replace function private.psc_mail_http(p_slug text,p_body jsonb) returns boolean language plpgsql security definer set search_path='' as $$
declare v_token text;v_status int;begin
 if p_slug not in ('dispatch-notification','poll-procurement-mail','email-schedules') then return false;end if;
 if not exists(select 1 from pg_extension e join pg_namespace n on n.oid=e.extnamespace where e.extname='http' and n.nspname='psc_mail_transport')
 or has_schema_privilege('anon','psc_mail_transport','usage') or has_schema_privilege('authenticated','psc_mail_transport','usage') then
 update public.psc_mail_connection set last_error='private_transport_configuration_required' where mailbox='info@pharmaservice.ae';return false;end if;
 select decrypted_secret into v_token from vault.decrypted_secrets where name='psc_mail_worker';
 perform psc_mail_transport.http_set_curlopt('CURLOPT_TIMEOUT_MS','60000');
 select status into v_status from psc_mail_transport.http(('POST','https://ewewkojlsgqvcqarmpgr.supabase.co/functions/v1/'||p_slug,array[row('x-psc-worker',v_token)::psc_mail_transport.http_header],'application/json',p_body::text)::psc_mail_transport.http_request);
 return v_status between 200 and 299;
 exception when others then
 update public.psc_mail_connection set last_error='private_transport_failed' where mailbox='info@pharmaservice.ae';return false;
end $$;
revoke all on function private.psc_mail_http(text,jsonb) from public,anon,authenticated;


create function private.psc_scheduled_mail_tick() returns void language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.psc_email_schedules where (status='pending' and send_at<=now()) or (status='dispatching' and started_at<now()-interval '5 minutes')) then
 perform private.psc_mail_http('email-schedules','{"action":"tick"}'::jsonb);end if;
end $$;
revoke all on function private.psc_scheduled_mail_tick() from public,anon,authenticated;
select cron.schedule('psc-scheduled-emails','* * * * *','select private.psc_scheduled_mail_tick();');
