alter table public.mail_contacts
 add column journey_stage text not null default 'prospect' check(journey_stage in ('prospect','contacted','requirements','quoting','awaiting_decision','customer','dormant','closed')),
 add column phone text not null default '' check(length(phone)<=100),
 add column website text not null default '' check(length(website)<=500),
 add column school_id uuid references public.schools(id);
create index mail_contacts_school on public.mail_contacts(school_id);
create table public.psc_crm_tasks(
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(title) between 1 and 500),
 due_date date not null, owner_label text not null default 'Mohamed' check(length(owner_label) between 1 and 120),
 completed boolean not null default false, priority text not null default 'normal' check(priority in ('normal','high')),
 contact_id uuid references public.mail_contacts(id), order_id uuid references public.orders(id),
 source_message_id uuid references public.psc_mail_messages(id), source_rule text,
 source_excerpt text not null default '' check(length(source_excerpt)<=1000),
 created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), updated_by uuid not null default auth.uid() references auth.users(id),
 unique(source_message_id,source_rule)
);
create index crm_tasks_due on public.psc_crm_tasks(completed,due_date);
create index crm_tasks_contact on public.psc_crm_tasks(contact_id);
create index crm_tasks_order on public.psc_crm_tasks(order_id);
create table public.psc_crm_notes(
 id uuid primary key default gen_random_uuid(),contact_id uuid not null references public.mail_contacts(id),
 note text not null check(length(note) between 1 and 5000),
 created_by uuid not null default auth.uid() references auth.users(id),created_at timestamptz not null default now()
);
create index crm_notes_contact on public.psc_crm_notes(contact_id,created_at desc);
alter table public.psc_crm_tasks enable row level security;
alter table public.psc_crm_notes enable row level security;
revoke all on public.psc_crm_tasks,public.psc_crm_notes from anon,authenticated;
grant select,insert,update on public.psc_crm_tasks to authenticated;
grant select,insert on public.psc_crm_notes to authenticated;
grant all on public.psc_crm_tasks,public.psc_crm_notes to service_role;
create policy crm_tasks_admin_read on public.psc_crm_tasks for select to authenticated using(private.is_psc_admin());
create policy crm_tasks_admin_insert on public.psc_crm_tasks for insert to authenticated with check(private.is_psc_admin() and created_by=auth.uid() and updated_by=auth.uid() and not exists(select 1 from public.memberships m join public.account_groups g on g.id=m.group_id where m.user_id=auth.uid() and g.slug='psc-demo-group'));
create policy crm_tasks_admin_update on public.psc_crm_tasks for update to authenticated using(private.is_psc_admin()) with check(private.is_psc_admin() and updated_by=auth.uid() and not exists(select 1 from public.memberships m join public.account_groups g on g.id=m.group_id where m.user_id=auth.uid() and g.slug='psc-demo-group'));
create policy crm_notes_admin_read on public.psc_crm_notes for select to authenticated using(private.is_psc_admin());
create policy crm_notes_admin_insert on public.psc_crm_notes for insert to authenticated with check(private.is_psc_admin() and created_by=auth.uid() and not exists(select 1 from public.memberships m join public.account_groups g on g.id=m.group_id where m.user_id=auth.uid() and g.slug='psc-demo-group'));
