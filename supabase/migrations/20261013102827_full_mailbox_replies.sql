alter table public.psc_mail_drafts add column if not exists reply_message_id uuid references public.psc_mail_messages(id);
create index if not exists mail_drafts_reply_source on public.psc_mail_drafts(reply_message_id) where reply_message_id is not null;
-- Existing administrator RLS remains in effect. Restart the broader mailbox backfill.
update public.psc_mail_connection set poll_page_token=null where mailbox='info@pharmaservice.ae';
