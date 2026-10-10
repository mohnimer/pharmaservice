alter table public.mail_contacts drop constraint mail_contacts_journey_stage_check;
alter table public.mail_contacts add constraint mail_contacts_journey_stage_check check(journey_stage in ('prospect','contacted','onboarding','requirements','quoting','awaiting_decision','customer','dormant','closed'));
create table public.psc_onboarding (
 id uuid primary key default gen_random_uuid(), contact_id uuid not null unique references public.mail_contacts(id),
 status text not null default 'preparing' check(status in ('preparing','waiting','paused','review','active')),
 items jsonb not null, revision integer not null default 1, notes text not null default '',
 recipient text, pack_sent_at timestamptz, reply_after timestamptz, last_checked_at timestamptz, last_error text,
 approved_at timestamptz, approved_by uuid references auth.users(id),
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.psc_onboarding_reminders (
 id uuid primary key default gen_random_uuid(), onboarding_id uuid not null references public.psc_onboarding(id),
 step integer not null check(step in (3,7)), due_at timestamptz not null,
 status text not null default 'pending' check(status in ('pending','drafted','skipped')),
 draft_id uuid references public.psc_mail_drafts(id), task_id uuid references public.psc_crm_tasks(id), unique(onboarding_id,step)
);
create function private.psc_onboarding_started() returns trigger language plpgsql security invoker set search_path='' as $$begin update public.mail_contacts set journey_stage='onboarding' where id=new.contact_id;return new;end $$;
revoke all on function private.psc_onboarding_started() from public,anon,authenticated;
create trigger onboarding_started after insert on public.psc_onboarding for each row execute function private.psc_onboarding_started();
alter table public.psc_mail_drafts add column onboarding_id uuid references public.psc_onboarding(id),add column onboarding_revision integer;
create index onboarding_waiting on public.psc_onboarding(last_checked_at) where status='waiting';
create index onboarding_drafts on public.psc_mail_drafts(onboarding_id);
do $$ declare t text;begin foreach t in array array['psc_onboarding','psc_onboarding_reminders'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 execute format('create policy onboarding_admin_read on public.%I for select to authenticated using(private.is_psc_admin())',t);
end loop;end $$;

create function public.psc_onboarding_save(p_id uuid,p_revision integer,p_patch jsonb) returns public.psc_onboarding language plpgsql security invoker set search_path='' as $$
declare b public.psc_onboarding;begin
 select * into b from public.psc_onboarding where id=p_id for update;
 if b.revision is distinct from p_revision then raise exception 'onboarding_changed';end if;
 if exists(select 1 from public.psc_mail_drafts where onboarding_id=p_id and status in ('sending','uncertain')) then raise exception 'resolve_pending_send';end if;
 update public.psc_onboarding set items=coalesce(p_patch->'items',items),status=coalesce(p_patch->>'status',status),notes=coalesce(p_patch->>'notes',notes),recipient=coalesce(p_patch->>'recipient',recipient),pack_sent_at=coalesce((p_patch->>'pack_sent_at')::timestamptz,pack_sent_at),reply_after=coalesce((p_patch->>'reply_after')::timestamptz,reply_after),approved_at=coalesce((p_patch->>'approved_at')::timestamptz,approved_at),approved_by=coalesce((p_patch->>'approved_by')::uuid,approved_by),last_error=p_patch->>'last_error',updated_at=now(),revision=revision+1 where id=p_id returning * into b;
 update public.psc_onboarding_reminders r set status='pending',draft_id=null,task_id=null where r.onboarding_id=p_id and r.status='drafted' and exists(select 1 from public.psc_mail_drafts d where d.id=r.draft_id and d.status in ('draft','failed'));
 if b.status='active' then update public.mail_contacts set journey_stage='customer' where id=b.contact_id;end if;
 return b;
end $$;
create function public.psc_onboarding_draft(p_id uuid,p_revision integer,p_step integer,p_subject text,p_body text) returns uuid language plpgsql security invoker set search_path='' as $$
declare b public.psc_onboarding;r public.psc_onboarding_reminders;d uuid;t uuid;begin
 select * into b from public.psc_onboarding where id=p_id for update;
 if b.status is distinct from 'waiting' or b.revision is distinct from p_revision then raise exception 'onboarding_changed';end if;
 select * into r from public.psc_onboarding_reminders where onboarding_id=p_id and step=p_step for update;
 if r.id is null or r.status<>'pending' or r.due_at>now() then return null;end if;
 if exists(select 1 from public.psc_mail_drafts where onboarding_id=p_id and onboarding_revision=b.revision and status in ('draft','sending','uncertain')) then return null;end if;
 insert into public.psc_mail_drafts(kind,contact_id,communication_purpose,recipient,subject,body_text,created_by,onboarding_id,onboarding_revision) values('followup',b.contact_id,'account_followup',b.recipient,p_subject,p_body,b.created_by,b.id,b.revision) returning id into d;
 insert into public.psc_crm_tasks(title,due_date,contact_id,created_by,updated_by,source_rule,source_excerpt) values('Review onboarding reminder (day '||p_step||')',(now() at time zone 'Asia/Dubai')::date,b.contact_id,b.created_by,b.created_by,'onboarding_reminder','Open Customers & contacts → customer → Onboarding to review the draft.') returning id into t;
 update public.psc_onboarding_reminders set status='drafted',draft_id=d,task_id=t where id=r.id;
 return d;
end $$;
create function public.psc_claim_onboarding_draft(p_draft uuid,p_updated_at timestamptz,p_user uuid) returns public.psc_mail_drafts language plpgsql security invoker set search_path='' as $$
declare d public.psc_mail_drafts;b public.psc_onboarding;begin
 select * into d from public.psc_mail_drafts where id=p_draft;
 select * into b from public.psc_onboarding where id=d.onboarding_id for update;
 if b.status is distinct from 'waiting' or b.revision is distinct from d.onboarding_revision then raise exception 'onboarding_changed';end if;
 update public.psc_mail_drafts set status='sending',approved_by=p_user,approved_at=now(),updated_at=now() where id=p_draft and status='draft' and updated_at=p_updated_at returning * into d;
 return d;
end $$;
revoke all on function public.psc_onboarding_save(uuid,integer,jsonb),public.psc_onboarding_draft(uuid,integer,integer,text,text),public.psc_claim_onboarding_draft(uuid,timestamptz,uuid) from public,anon,authenticated;
grant execute on function public.psc_onboarding_save(uuid,integer,jsonb),public.psc_onboarding_draft(uuid,integer,integer,text,text),public.psc_claim_onboarding_draft(uuid,timestamptz,uuid) to service_role;
create function private.psc_onboarding_tick() returns void language plpgsql security definer set search_path='' as $$
declare t text;begin
 if not exists(select 1 from public.psc_onboarding where status='waiting') then return;end if;
 select decrypted_secret into t from vault.decrypted_secrets where name='psc_mail_worker';
 perform net.http_post(url:='https://ewewkojlsgqvcqarmpgr.supabase.co/functions/v1/procurement-mail',body:='{"action":"onboarding_tick"}'::jsonb,headers:=jsonb_build_object('Content-Type','application/json','x-psc-worker',t),timeout_milliseconds:=5000);
end $$;
revoke all on function private.psc_onboarding_tick() from public,anon,authenticated;
select cron.schedule('psc-onboarding-reminders','*/5 * * * *','select private.psc_onboarding_tick();');
