alter table public.psc_mail_drafts
 add column compose_mode text check(compose_mode in ('normal','intro','followup','onboarding','workshop','reply','reply_all','forward')),
 add column sender_alias text check(sender_alias in ('mohamed@pharmaservice.ae','info@pharmaservice.ae','outreach@pharmaservice.ae')),
 add column to_recipients text[] not null default '{}',
 add column cc_recipients text[] not null default '{}',
 add column bcc_recipients text[] not null default '{}';
-- Existing administrator RLS and quotation release controls remain unchanged.

alter table public.psc_crm_tasks add column description text not null default '' check(length(description)<=4000);
