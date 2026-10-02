-- PSC V37.7 Mail Desk
-- Internal outreach records for controlled institutional email from info@pharmaservice.ae.

create table if not exists public.mail_contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  email text not null,
  organization text,
  role text,
  institution_type text,
  tags text[] not null default '{}',
  source_note text,
  status text not null default 'active' check (status in ('active','paused','unsubscribed','bounced')),
  marketing_basis text not null default 'not_set' check (marketing_basis in ('not_set','existing_customer','requested_updates','manual_permission','legitimate_interest_reviewed')),
  unsubscribe_token uuid not null default gen_random_uuid(),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);
create unique index if not exists mail_contacts_email_lower_uidx on public.mail_contacts(lower(email));
create unique index if not exists mail_contacts_unsubscribe_token_uidx on public.mail_contacts(unsubscribe_token);
create index if not exists mail_contacts_status_idx on public.mail_contacts(status, institution_type, role);
alter table public.mail_contacts enable row level security;

drop policy if exists "psc admins manage mail contacts" on public.mail_contacts;
create policy "psc admins manage mail contacts" on public.mail_contacts for all to authenticated
using (private.is_psc_admin()) with check (private.is_psc_admin());

create table if not exists public.mail_campaigns (
  id uuid primary key default gen_random_uuid(),
  template text not null default 'workshop' check (template in ('workshop','clinic-check','supply-note','custom')),
  workshop_slug text,
  workshop_title text,
  subject text not null,
  preview_text text,
  intro text,
  cta_label text,
  cta_url text,
  sender_name text not null default 'Pharma Service',
  sender_email text not null default 'info@pharmaservice.ae',
  status text not null default 'draft' check (status in ('draft','sending','sent','partial','failed')),
  recipient_count integer not null default 0,
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  last_error text
);
create index if not exists mail_campaigns_created_idx on public.mail_campaigns(created_at desc);
alter table public.mail_campaigns enable row level security;

drop policy if exists "psc admins manage mail campaigns" on public.mail_campaigns;
create policy "psc admins manage mail campaigns" on public.mail_campaigns for all to authenticated
using (private.is_psc_admin()) with check (private.is_psc_admin());

create table if not exists public.mail_campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.mail_campaigns(id) on delete cascade,
  contact_id uuid references public.mail_contacts(id) on delete set null,
  email_snapshot text not null,
  name_snapshot text,
  organization_snapshot text,
  status text not null default 'queued' check (status in ('queued','sent','failed','skipped')),
  sent_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  unique(campaign_id,email_snapshot)
);
create index if not exists mail_campaign_recipients_campaign_idx on public.mail_campaign_recipients(campaign_id,status);
alter table public.mail_campaign_recipients enable row level security;

drop policy if exists "psc admins manage mail recipients" on public.mail_campaign_recipients;
create policy "psc admins manage mail recipients" on public.mail_campaign_recipients for all to authenticated
using (private.is_psc_admin()) with check (private.is_psc_admin());

-- Keep sender identity fixed in the data layer too.
alter table public.mail_campaigns drop constraint if exists mail_campaigns_sender_email_check;
alter table public.mail_campaigns add constraint mail_campaigns_sender_email_check check (lower(sender_email)='info@pharmaservice.ae');

-- Generic updated_at trigger, created only if PSC does not already have one under this name.
create or replace function public.psc_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists mail_contacts_set_updated_at on public.mail_contacts;
create trigger mail_contacts_set_updated_at before update on public.mail_contacts
for each row execute function public.psc_set_updated_at();
