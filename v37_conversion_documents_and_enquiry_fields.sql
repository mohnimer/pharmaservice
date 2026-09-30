-- PSC V37 production migration record.
-- This file documents the V37 schema applied to the connected PSC Supabase project.

alter table public.institutional_enquiries
  add column if not exists organization text,
  add column if not exists institution_type text,
  add column if not exists site_count integer,
  add column if not exists emirate text,
  add column if not exists requirement_type text,
  add column if not exists required_by date,
  add column if not exists rfq_object_path text,
  add column if not exists rfq_file_name text;

alter table public.institutional_enquiries
  drop constraint if exists institutional_enquiries_organization_length,
  drop constraint if exists institutional_enquiries_institution_type_length,
  drop constraint if exists institutional_enquiries_site_count_range,
  drop constraint if exists institutional_enquiries_emirate_length,
  drop constraint if exists institutional_enquiries_requirement_type_length;

alter table public.institutional_enquiries
  add constraint institutional_enquiries_organization_length check (organization is null or char_length(organization) between 2 and 180),
  add constraint institutional_enquiries_institution_type_length check (institution_type is null or char_length(institution_type) between 2 and 120),
  add constraint institutional_enquiries_site_count_range check (site_count is null or site_count between 1 and 10000),
  add constraint institutional_enquiries_emirate_length check (emirate is null or char_length(emirate) between 2 and 80),
  add constraint institutional_enquiries_requirement_type_length check (requirement_type is null or char_length(requirement_type) between 2 and 120);

-- Keep the insertion policy backward-compatible during the V36 -> V37 deployment window.
drop policy if exists "public can submit institutional enquiries" on public.institutional_enquiries;
create policy "public can submit institutional enquiries"
on public.institutional_enquiries for insert
to anon, authenticated
with check (
  char_length(name) between 2 and 120
  and char_length(contact_number) between 5 and 40
  and char_length(contact_email) between 5 and 254
  and char_length(requirement) between 10 and 4000
  and (organization is null or char_length(organization) between 2 and 180)
  and (institution_type is null or char_length(institution_type) between 2 and 120)
  and (site_count is null or site_count between 1 and 10000)
  and (emirate is null or char_length(emirate) between 2 and 80)
  and (requirement_type is null or char_length(requirement_type) between 2 and 120)
  and status = 'new'
);

create table if not exists public.order_documents (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  document_type text not null check (document_type in (
    'quotation','customer_po','approval','invoice','delivery_note',
    'acceptance','warranty','service_report','other'
  )),
  title text not null,
  file_name text not null,
  object_path text not null unique,
  mime_type text,
  file_size bigint,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists order_documents_order_id_idx on public.order_documents(order_id, created_at desc);
alter table public.order_documents enable row level security;

drop policy if exists "members read order documents" on public.order_documents;
create policy "members read order documents" on public.order_documents for select to authenticated
using (private.is_psc_admin() or exists (select 1 from public.orders o where o.id=order_documents.order_id and private.can_access_school(o.school_id)));

drop policy if exists "members add customer order documents" on public.order_documents;
create policy "members add customer order documents" on public.order_documents for insert to authenticated
with check (created_by=auth.uid() and document_type in ('customer_po','approval','acceptance','other') and exists (select 1 from public.orders o where o.id=order_documents.order_id and private.can_access_school(o.school_id)));

drop policy if exists "psc admins manage order documents" on public.order_documents;
create policy "psc admins manage order documents" on public.order_documents for all to authenticated
using (private.is_psc_admin()) with check (private.is_psc_admin());

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('order-documents','order-documents',false,15728640,array[
  'application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/msword',
  'application/vnd.ms-excel','image/jpeg','image/png','image/webp'
]) on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('institutional-enquiries','institutional-enquiries',false,10485760,array[
  'application/pdf','text/csv','application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]) on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

-- Storage RLS policies are also applied in the connected project; see V37_SUPABASE_APPLIED.txt.
