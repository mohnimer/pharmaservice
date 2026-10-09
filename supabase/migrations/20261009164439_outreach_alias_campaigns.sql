-- Outreach uses the existing Gmail grant, but its own approved campaign queue.
alter table public.mail_campaigns drop constraint mail_campaigns_sender_email_check;
alter table public.mail_campaigns add constraint mail_campaigns_sender_email_check check(sender_email in ('info@pharmaservice.ae','outreach@pharmaservice.ae'));
alter table public.mail_campaigns alter column sender_email set default 'outreach@pharmaservice.ae';
alter table public.mail_campaigns add column approved_at timestamptz,add column approved_by uuid references auth.users(id),add column approved_snapshot jsonb;
alter table public.mail_campaign_recipients drop constraint mail_campaign_recipients_status_check;
alter table public.mail_campaign_recipients add constraint mail_campaign_recipients_status_check check(status in ('queued','sending','sent','failed','skipped','uncertain'));
alter table public.mail_campaign_recipients add column attempts int not null default 0,add column next_attempt_at timestamptz not null default now();
create table public.psc_outreach_settings(
 id boolean primary key default true check(id),enabled boolean not null default false,
 alias_status text not null default 'unchecked',checked_at timestamptz,last_error text,
 enabled_by uuid references auth.users(id),enabled_at timestamptz
);
insert into public.psc_outreach_settings(id) values(true);
create table public.psc_outreach_attempts(
 id uuid primary key default gen_random_uuid(),recipient_id uuid references public.mail_campaign_recipients(id),
 kind text not null check(kind in ('campaign','test')),status text not null check(status in ('sending','accepted','failed','uncertain')),
 created_at timestamptz not null default now(),provider_message_id text,error text
);
create index outreach_attempts_created on public.psc_outreach_attempts(created_at desc);
create index outreach_attempts_recipient on public.psc_outreach_attempts(recipient_id);
alter table public.psc_outreach_settings enable row level security;
alter table public.psc_outreach_attempts enable row level security;
revoke all on public.psc_outreach_settings,public.psc_outreach_attempts from public,anon,authenticated;
grant select on public.psc_outreach_settings,public.psc_outreach_attempts to authenticated;
grant all on public.psc_outreach_settings,public.psc_outreach_attempts to service_role;
create policy outreach_settings_admin_read on public.psc_outreach_settings for select to authenticated using(private.is_psc_admin());
create policy outreach_attempts_admin_read on public.psc_outreach_attempts for select to authenticated using(private.is_psc_admin());

-- Browsers can prepare drafts, but cannot approve, send, or rewrite delivery records.
drop policy "psc admins manage mail campaigns" on public.mail_campaigns;
create policy campaigns_admin_read on public.mail_campaigns for select to authenticated using(private.is_psc_admin());
create policy campaigns_admin_draft_insert on public.mail_campaigns for insert to authenticated with check(private.is_psc_admin() and created_by=auth.uid() and status='draft' and approved_at is null and approved_by is null and approved_snapshot is null and sender_email='outreach@pharmaservice.ae' and not exists(select 1 from public.memberships m join public.account_groups g on g.id=m.group_id where m.user_id=auth.uid() and g.slug='psc-demo-group'));
drop policy "psc admins manage mail recipients" on public.mail_campaign_recipients;
create policy recipients_admin_read on public.mail_campaign_recipients for select to authenticated using(private.is_psc_admin());
create policy recipients_admin_draft_insert on public.mail_campaign_recipients for insert to authenticated with check(private.is_psc_admin() and status='queued' and attempts=0 and provider_message_id is null and sent_at is null and exists(select 1 from public.mail_campaigns c where c.id=campaign_id and c.status='draft' and c.created_by=auth.uid()) and exists(select 1 from public.mail_contacts c where c.id=contact_id and lower(c.email)=lower(email_snapshot)));
create function private.psc_lock_campaign_recipient() returns trigger language plpgsql security invoker set search_path='' as $$
declare v_status text;begin
 select status into v_status from public.mail_campaigns where id=new.campaign_id for update;
 if v_status<>'draft' then raise exception 'campaign_is_frozen';end if;return new;
end $$;
revoke all on function private.psc_lock_campaign_recipient() from public,anon,authenticated;
create trigger outreach_recipient_freeze before insert on public.mail_campaign_recipients for each row execute function private.psc_lock_campaign_recipient();
-- Row locking the parent requires UPDATE permission but still cannot mutate it via REST.
grant update on public.mail_campaigns to authenticated;
create policy campaigns_admin_lock on public.mail_campaigns for update to authenticated using(private.is_psc_admin() and status='draft') with check(false);

create function public.psc_outreach_fingerprint(p_id uuid) returns text language sql security invoker set search_path='' as $$
 select md5(jsonb_build_object('campaign',to_jsonb(c),'recipients',coalesce((select jsonb_agg(to_jsonb(r) order by r.id) from public.mail_campaign_recipients r where r.campaign_id=c.id),'[]'::jsonb))::text) from public.mail_campaigns c where c.id=p_id;
$$;
create function public.psc_outreach_approve(p_id uuid,p_hash text,p_user uuid) returns boolean language plpgsql security invoker set search_path='' as $$
declare c public.mail_campaigns;begin
 select * into c from public.mail_campaigns where id=p_id for update;
 if c.status<>'draft' then return false;end if;
 if public.psc_outreach_fingerprint(p_id) is distinct from p_hash then raise exception 'campaign_changed_review_again';end if;
 if not exists(select 1 from public.psc_outreach_settings where enabled and alias_status='accepted') then raise exception 'outreach_setup_required';end if;
 if not exists(select 1 from public.profiles where user_id=p_user and is_psc_admin) or exists(select 1 from public.memberships m join public.account_groups g on g.id=m.group_id where m.user_id=p_user and g.slug='psc-demo-group') then raise exception 'forbidden';end if;
 if c.sender_email<>'outreach@pharmaservice.ae' or not exists(select 1 from public.mail_campaign_recipients where campaign_id=p_id) then raise exception 'invalid_campaign';end if;
 update public.mail_campaigns set status='sending',approved_at=now(),approved_by=p_user,approved_snapshot=to_jsonb(c),recipient_count=(select count(*) from public.mail_campaign_recipients where campaign_id=p_id),last_error=null where id=p_id;
 return true;
end $$;

create function public.psc_outreach_claim() returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.mail_campaign_recipients;c public.mail_contacts;a uuid;begin
 perform 1 from public.psc_outreach_settings where id=true for update;
 if not exists(select 1 from public.psc_outreach_settings where enabled and alias_status='accepted') then return null;end if;
 -- Shared, rolling limits across campaigns and internal tests. Never retry unknown sends.
 if (select count(*) from public.psc_outreach_attempts where created_at>now()-interval '24 hours')>=100 or exists(select 1 from public.psc_outreach_attempts where created_at>now()-interval '1 minute') then return null;end if;
 select x.* into r from public.mail_campaign_recipients x join public.mail_campaigns m on m.id=x.campaign_id where m.status='sending' and m.approved_at is not null and x.status in ('queued','failed') and x.attempts<3 and x.next_attempt_at<=now() order by x.created_at,x.id limit 1 for update of x skip locked;
 if r.id is null then return null;end if;
 select * into c from public.mail_contacts where id=r.contact_id;
 if c.id is null or c.status<>'active' or c.unsubscribed_at is not null or c.marketing_basis not in ('manual_permission','requested_updates') or lower(c.email)<>lower(r.email_snapshot) then
  update public.mail_campaign_recipients set status='skipped',error='not_subscribed_or_address_changed' where id=r.id;return null;
 end if;
 insert into public.psc_outreach_attempts(recipient_id,kind,status) values(r.id,'campaign','sending') returning id into a;
 update public.mail_campaign_recipients set status='sending',attempts=attempts+1,error=null where id=r.id;
 return jsonb_build_object('recipient',to_jsonb(r),'contact',to_jsonb(c),'attempt_id',a,'campaign',(select approved_snapshot from public.mail_campaigns where id=r.campaign_id));
end $$;

create function public.psc_outreach_settle() returns void language plpgsql security invoker set search_path='' as $$
begin
 update public.psc_outreach_attempts set status='uncertain',error='worker_interrupted' where status='sending' and created_at<now()-interval '10 minutes';
 update public.mail_campaign_recipients r set status='uncertain',error='worker_interrupted' where r.status='sending' and exists(select 1 from public.psc_outreach_attempts a where a.recipient_id=r.id and a.status='uncertain');
 update public.mail_campaigns c set sent_count=(select count(*) from public.mail_campaign_recipients where campaign_id=c.id and status='sent'),failed_count=(select count(*) from public.mail_campaign_recipients where campaign_id=c.id and status in ('failed','uncertain')) where approved_at is not null;
 update public.mail_campaigns c set status=case when exists(select 1 from public.mail_campaign_recipients where campaign_id=c.id and status in ('failed','uncertain')) then 'partial' else 'sent' end,sent_at=now() where c.status='sending' and not exists(select 1 from public.mail_campaign_recipients where campaign_id=c.id and (status in ('queued','sending') or (status='failed' and attempts<3)));
end $$;
revoke all on function public.psc_outreach_fingerprint(uuid),public.psc_outreach_approve(uuid,text,uuid),public.psc_outreach_claim(),public.psc_outreach_settle() from public,anon,authenticated;
grant execute on function public.psc_outreach_fingerprint(uuid),public.psc_outreach_approve(uuid,text,uuid),public.psc_outreach_claim(),public.psc_outreach_settle() to service_role;
create function private.psc_outreach_tick() returns void language plpgsql security definer set search_path='' as $$
declare t text;begin
 if not exists(select 1 from public.psc_outreach_settings where enabled) then return;end if;
 select decrypted_secret into t from vault.decrypted_secrets where name='psc_mail_worker';
 perform net.http_post(url:='https://ewewkojlsgqvcqarmpgr.supabase.co/functions/v1/send-mail-campaign',body:='{"action":"tick"}'::jsonb,headers:=jsonb_build_object('Content-Type','application/json','x-psc-worker',t),timeout_milliseconds:=5000);
end $$;
revoke all on function private.psc_outreach_tick() from public,anon,authenticated;
select cron.schedule('psc-outreach-campaigns','* * * * *','select private.psc_outreach_tick();');
