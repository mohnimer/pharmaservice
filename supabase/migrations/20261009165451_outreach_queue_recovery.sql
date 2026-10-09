create or replace function public.psc_outreach_settle() returns void language plpgsql security invoker set search_path='' as $$
begin
 -- Recover a recorded acceptance if the worker stopped before updating the recipient.
 update public.mail_campaign_recipients r set status='sent',provider_message_id=a.provider_message_id,sent_at=coalesce(r.sent_at,a.created_at),error=null from public.psc_outreach_attempts a where a.recipient_id=r.id and a.status='accepted' and r.status in ('sending','uncertain');
 update public.psc_outreach_attempts set status='uncertain',error='worker_interrupted' where status='sending' and created_at<now()-interval '10 minutes';
 update public.mail_campaign_recipients r set status='uncertain',error='worker_interrupted' where r.status='sending' and exists(select 1 from public.psc_outreach_attempts a where a.recipient_id=r.id and a.status='uncertain');
 update public.mail_campaigns c set sent_count=(select count(*) from public.mail_campaign_recipients where campaign_id=c.id and status='sent'),failed_count=(select count(*) from public.mail_campaign_recipients where campaign_id=c.id and status in ('failed','uncertain')) where approved_at is not null;
 update public.mail_campaigns c set status=case when exists(select 1 from public.mail_campaign_recipients where campaign_id=c.id and status in ('failed','uncertain')) then 'partial' else 'sent' end,sent_at=now() where c.status='sending' and not exists(select 1 from public.mail_campaign_recipients where campaign_id=c.id and (status in ('queued','sending') or (status='failed' and attempts<3)));
end $$;
