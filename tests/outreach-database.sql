-- All fixtures, approvals and attempt records are rolled back. No HTTP calls.
begin;
do $$
declare a uuid;u uuid;c uuid;t uuid;r uuid;h text;j jsonb;n int;
begin
 select user_id into a from profiles where is_psc_admin limit 1;
 select user_id into u from profiles where not is_psc_admin limit 1;
 perform set_config('request.jwt.claim.sub',a::text,true);set local role authenticated;
 insert into mail_contacts(email,status,marketing_basis,created_by) values('outreach-rollback@example.invalid','active','manual_permission',a) returning id into t;
 insert into mail_campaigns(subject,intro,cta_label,cta_url,sender_email,created_by) values('Rollback test','Test','Read','https://pharmaservice.ae/workshop','outreach@pharmaservice.ae',a) returning id into c;
 insert into mail_campaign_recipients(campaign_id,contact_id,email_snapshot) values(c,t,'outreach-rollback@example.invalid') returning id into r;
 begin update mail_campaigns set status='sending' where id=c;raise exception 'browser approved campaign';exception when insufficient_privilege then null;end;
 begin perform psc_outreach_claim();raise exception 'browser invoked worker';exception when insufficient_privilege then null;end;
 reset role;set local role service_role;
 if psc_outreach_claim() is not null then raise exception 'paused queue claimed work';end if;
 update psc_outreach_settings set enabled=true,alias_status='accepted';
 h:=psc_outreach_fingerprint(c);
 begin perform psc_outreach_approve(c,'stale-review',a);raise exception 'stale review accepted';exception when others then if sqlerrm='stale review accepted' then raise;end if;end;
 if not psc_outreach_approve(c,h,a) then raise exception 'approval failed';end if;
 if psc_outreach_approve(c,h,a) then raise exception 'duplicate approval accepted';end if;
 j:=psc_outreach_claim();if j->'recipient'->>'id' is distinct from r::text then raise exception 'wrong claim';end if;
 if psc_outreach_claim() is not null then raise exception 'duplicate claim';end if;
 update psc_outreach_attempts set status='accepted',provider_message_id='rollback-gmail' where id=(j->>'attempt_id')::uuid;
 perform psc_outreach_settle();if (select status from mail_campaign_recipients where id=r)<>'sent' then raise exception 'interrupted acceptance recovery failed';end if;
 -- Queue a second campaign, then withdraw consent before it is claimed.
 update psc_outreach_attempts set created_at=now()-interval '2 minutes';
 insert into mail_campaigns(subject,intro,sender_email,created_by) values('Suppression test','Test','outreach@pharmaservice.ae',a) returning id into c;
 insert into mail_campaign_recipients(campaign_id,contact_id,email_snapshot) values(c,t,'outreach-rollback@example.invalid') returning id into r;
 perform psc_outreach_approve(c,psc_outreach_fingerprint(c),a);
 update mail_contacts set status='unsubscribed',unsubscribed_at=now() where id=t;
 if psc_outreach_claim() is not null then raise exception 'unsubscribed recipient claimed';end if;
 if (select status from mail_campaign_recipients where id=r)<>'skipped' then raise exception 'suppression not recorded';end if;
 update mail_contacts set status='active',unsubscribed_at=null where id=t;
 insert into mail_campaigns(subject,intro,sender_email,created_by) values('Quota test','Test','outreach@pharmaservice.ae',a) returning id into c;
 insert into mail_campaign_recipients(campaign_id,contact_id,email_snapshot) values(c,t,'outreach-rollback@example.invalid') returning id into r;
 perform psc_outreach_approve(c,psc_outreach_fingerprint(c),a);
 insert into psc_outreach_attempts(kind,status,created_at) select 'test','failed',now()-interval '2 hours' from generate_series(1,100);
 if psc_outreach_claim() is not null then raise exception 'rolling budget exceeded';end if;
 if (select status from mail_campaign_recipients where id=r)<>'queued' then raise exception 'quota exhausted recipient lost';end if;
 reset role;perform set_config('request.jwt.claim.sub',u::text,true);set local role authenticated;
 if exists(select 1 from mail_campaigns where id=c) or exists(select 1 from psc_outreach_attempts where id=(j->>'attempt_id')::uuid) then raise exception 'ordinary user reads campaign';end if;
 reset role;
end $$;
rollback;
select 'PASS: draft persistence, browser approval blocked, worker RPC private, paused queue, stale approval, duplicate claim, acceptance recovery, unsubscribe before send, rolling quota, customer isolation; rolled back' as result;
