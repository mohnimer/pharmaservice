-- Editable envelopes do not change invitation membership or quotation authority.
alter table public.psc_customer_invitations
 add column email_composition jsonb not null default '{}'::jsonb check(jsonb_typeof(email_composition)='object'),
 add column copy_status text not null default 'not_requested' check(copy_status in ('not_requested','pending','sending','accepted','failed','uncertain')),
 add column copy_provider_message_id text,
 add column copy_last_error text;
alter table public.psc_mail_drafts add column source_recipient text;
-- Original context remains auditable even when a PSC administrator edits email recipients.
comment on column public.psc_mail_drafts.source_recipient is 'Original workflow recipient, retained for stale-context checks. Editable envelope remains separate from account and commercial authorization.';
