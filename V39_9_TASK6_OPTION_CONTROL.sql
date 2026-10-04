
begin;

alter table public.catalogue_product_options
  add column if not exists company_mah text,
  add column if not exists supplier_listing_evidence text,
  add column if not exists decision_updated_at timestamptz,
  add column if not exists decision_updated_by uuid;

alter table public.catalogue_product_options
  alter column source_key set not null;

alter table public.catalogue_product_options
  drop constraint if exists catalogue_product_options_source_key_key;

alter table public.catalogue_product_options
  drop constraint if exists catalogue_product_options_family_source_key_key;

alter table public.catalogue_product_options
  add constraint catalogue_product_options_family_source_key_key
  unique (family_id, source_key);

alter table public.catalogue_product_options
  drop constraint if exists catalogue_product_options_customer_selectable_guard;

alter table public.catalogue_product_options
  add constraint catalogue_product_options_customer_selectable_guard
  check (
    customer_selectable = false
    or (
      psc_decision = 'APPROVE'
      and verification_date is not null
    )
  );

alter table public.catalogue_product_options
  drop constraint if exists catalogue_product_options_preferred_guard;

alter table public.catalogue_product_options
  add constraint catalogue_product_options_preferred_guard
  check (
    preferred = false
    or (
      psc_decision = 'APPROVE'
      and verification_date is not null
      and b2b_cost is not null
      and nullif(upper(trim(coalesce(stock,''))),'UNKNOWN') is not null
    )
  );

create table if not exists public.catalogue_option_decision_history (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.catalogue_product_options(id) on update cascade on delete cascade,
  family_id text not null,
  source_key text not null,
  old_decision text,
  new_decision text,
  old_customer_selectable boolean,
  new_customer_selectable boolean,
  old_preferred boolean,
  new_preferred boolean,
  review_note text,
  changed_by uuid,
  changed_at timestamptz not null default now()
);

alter table public.catalogue_option_decision_history enable row level security;

drop policy if exists "psc admins read catalogue option history" on public.catalogue_option_decision_history;
create policy "psc admins read catalogue option history"
on public.catalogue_option_decision_history
for select to authenticated
using (private.is_psc_admin());

create or replace function public.catalogue_option_control_before_write()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  if new.psc_decision <> 'APPROVE' then
    new.customer_selectable := false;
    new.preferred := false;
  end if;

  if new.customer_selectable and new.verification_date is null then
    raise exception 'Customer-selectable option requires verification date';
  end if;
  if new.customer_selectable and nullif(btrim(coalesce(new.brand,'')),'') is null then
    raise exception 'Customer-selectable option requires confirmed brand';
  end if;
  if new.customer_selectable and nullif(btrim(coalesce(new.presentation,'')),'') is null then
    raise exception 'Customer-selectable option requires confirmed presentation';
  end if;

  if new.preferred then
    if new.verification_date is null then
      raise exception 'Preferred option requires verification date';
    end if;
    if new.b2b_cost is null then
      raise exception 'Preferred option requires B2B cost evidence';
    end if;
    if nullif(upper(trim(coalesce(new.stock,''))),'UNKNOWN') is null then
      raise exception 'Preferred option requires current stock evidence';
    end if;
  end if;

  new.updated_at := now();

  if tg_op='UPDATE' and (
    old.psc_decision is distinct from new.psc_decision
    or old.customer_selectable is distinct from new.customer_selectable
    or old.preferred is distinct from new.preferred
  ) then
    new.decision_updated_at := now();
    new.decision_updated_by := auth.uid();
  elsif tg_op='INSERT' then
    if new.psc_decision <> 'VERIFY' or new.customer_selectable or new.preferred then
      new.decision_updated_at := now();
      new.decision_updated_by := auth.uid();
    else
      new.decision_updated_at := null;
      new.decision_updated_by := null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_catalogue_option_control_before_write on public.catalogue_product_options;
create trigger trg_catalogue_option_control_before_write
before insert or update
on public.catalogue_product_options
for each row
execute function public.catalogue_option_control_before_write();

create or replace function public.catalogue_option_control_history()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  if old.psc_decision is distinct from new.psc_decision
     or old.customer_selectable is distinct from new.customer_selectable
     or old.preferred is distinct from new.preferred then
    insert into public.catalogue_option_decision_history(
      option_id,family_id,source_key,
      old_decision,new_decision,
      old_customer_selectable,new_customer_selectable,
      old_preferred,new_preferred,
      review_note,changed_by
    ) values (
      new.id,new.family_id,new.source_key,
      old.psc_decision,new.psc_decision,
      old.customer_selectable,new.customer_selectable,
      old.preferred,new.preferred,
      new.review_note,auth.uid()
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_catalogue_option_control_history on public.catalogue_product_options;
create trigger trg_catalogue_option_control_history
after update
on public.catalogue_product_options
for each row
execute function public.catalogue_option_control_history();

commit;
