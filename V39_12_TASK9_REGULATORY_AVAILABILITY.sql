-- PSC V39.12 Task 9 — regulatory / availability public controls.
-- Applied to Supabase project ewewkojlsgqvcqarmpgr on 2026-10-04.

begin;

alter table public.catalogue_product_options
  add column if not exists availability_status text not null default 'UNVERIFIED',
  add column if not exists availability_verified_at timestamptz,
  add column if not exists availability_valid_until timestamptz,
  add column if not exists availability_evidence_reference text;

alter table public.catalogue_product_options
  drop constraint if exists catalogue_product_options_availability_status_check;
alter table public.catalogue_product_options
  add constraint catalogue_product_options_availability_status_check
  check (availability_status in ('UNVERIFIED','IN_STOCK','LIMITED','OUT_OF_STOCK'));

alter table public.catalogue_product_options
  drop constraint if exists catalogue_product_options_availability_evidence_check;
alter table public.catalogue_product_options
  add constraint catalogue_product_options_availability_evidence_check
  check (
    availability_status='UNVERIFIED'
    or (
      availability_verified_at is not null
      and availability_valid_until is not null
      and availability_valid_until >= availability_verified_at
      and nullif(btrim(coalesce(availability_evidence_reference,'')),'') is not null
    )
  );

create table if not exists public.catalogue_option_availability_history (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.catalogue_product_options(id) on update cascade on delete cascade,
  family_id text not null,
  source_key text not null,
  old_status text,
  new_status text,
  old_verified_at timestamptz,
  new_verified_at timestamptz,
  old_valid_until timestamptz,
  new_valid_until timestamptz,
  evidence_reference text,
  changed_by uuid,
  changed_at timestamptz not null default now()
);

alter table public.catalogue_option_availability_history enable row level security;

drop policy if exists "psc admins read catalogue availability history" on public.catalogue_option_availability_history;
create policy "psc admins read catalogue availability history"
on public.catalogue_option_availability_history
for select to authenticated
using (private.is_psc_admin());

create or replace function public.catalogue_option_availability_guard()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  if new.availability_status='UNVERIFIED' then
    new.availability_verified_at := null;
    new.availability_valid_until := null;
    new.availability_evidence_reference := null;
  else
    if new.availability_verified_at is null
       or new.availability_valid_until is null
       or nullif(btrim(coalesce(new.availability_evidence_reference,'')),'') is null then
      raise exception 'Published availability requires verified-at, valid-until and evidence reference';
    end if;
    if new.availability_valid_until < new.availability_verified_at then
      raise exception 'Availability valid-until cannot predate verification';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_zy_catalogue_option_availability_guard on public.catalogue_product_options;
create trigger trg_zy_catalogue_option_availability_guard
before insert or update
on public.catalogue_product_options
for each row execute function public.catalogue_option_availability_guard();

create or replace function public.catalogue_option_availability_history()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  if old.availability_status is distinct from new.availability_status
     or old.availability_verified_at is distinct from new.availability_verified_at
     or old.availability_valid_until is distinct from new.availability_valid_until
     or old.availability_evidence_reference is distinct from new.availability_evidence_reference then
    insert into public.catalogue_option_availability_history(
      option_id,family_id,source_key,
      old_status,new_status,
      old_verified_at,new_verified_at,
      old_valid_until,new_valid_until,
      evidence_reference,changed_by
    ) values (
      new.id,new.family_id,new.source_key,
      old.availability_status,new.availability_status,
      old.availability_verified_at,new.availability_verified_at,
      old.availability_valid_until,new.availability_valid_until,
      new.availability_evidence_reference,auth.uid()
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_catalogue_option_availability_history on public.catalogue_product_options;
create trigger trg_catalogue_option_availability_history
after update
on public.catalogue_product_options
for each row execute function public.catalogue_option_availability_history();

drop view if exists public.catalogue_product_availability_public;
create view public.catalogue_product_availability_public as
select
  o.family_id,
  o.id as product_option_id,
  case
    when o.availability_status <> 'UNVERIFIED'
     and o.availability_verified_at is not null
     and o.availability_valid_until >= now()
    then o.availability_status
    else 'CHECK_AT_QUOTE'
  end as availability_state,
  case
    when o.availability_status='IN_STOCK'
     and o.availability_verified_at is not null
     and o.availability_valid_until >= now()
    then 'In stock'
    when o.availability_status='LIMITED'
     and o.availability_verified_at is not null
     and o.availability_valid_until >= now()
    then 'Limited availability'
    when o.availability_status='OUT_OF_STOCK'
     and o.availability_verified_at is not null
     and o.availability_valid_until >= now()
    then 'Currently unavailable'
    else 'Availability confirmed at quotation'
  end as availability_label,
  case when o.availability_status <> 'UNVERIFIED' and o.availability_valid_until >= now() then o.availability_verified_at else null end as verified_at,
  case when o.availability_status <> 'UNVERIFIED' and o.availability_valid_until >= now() then o.availability_valid_until else null end as valid_until
from public.catalogue_product_options o
where o.active=true
  and o.psc_decision='APPROVE'
  and o.customer_selectable=true;

drop view if exists public.catalogue_family_availability_public;
create view public.catalogue_family_availability_public as
with live as (
  select * from public.catalogue_product_availability_public where availability_state <> 'CHECK_AT_QUOTE'
),
agg as (
  select family_id,
         bool_or(availability_state='IN_STOCK') as any_in_stock,
         bool_or(availability_state='LIMITED') as any_limited,
         bool_or(availability_state='OUT_OF_STOCK') as any_out,
         max(verified_at) as latest_verified_at,
         max(valid_until) as latest_valid_until
  from live
  group by family_id
)
select
  f.family_id,
  case
    when a.any_in_stock then 'IN_STOCK'
    when a.any_limited then 'LIMITED'
    when a.any_out then 'OUT_OF_STOCK'
    else 'CHECK_AT_QUOTE'
  end as availability_state,
  case
    when a.any_in_stock then 'In stock'
    when a.any_limited then 'Limited availability'
    when a.any_out then 'Currently unavailable'
    when f.availability_wording='Quoted to order' then 'Quoted to order'
    when f.availability_wording='Source on request' then 'Source on request'
    else 'Availability confirmed at quotation'
  end as availability_label,
  case when a.family_id is not null then a.latest_verified_at else null end as verified_at,
  case when a.family_id is not null then a.latest_valid_until else null end as valid_until
from public.catalogue_families f
left join agg a on a.family_id=f.family_id
where f.active=true;

grant select on public.catalogue_product_availability_public to anon, authenticated;
grant select on public.catalogue_family_availability_public to anon, authenticated;

commit;
