begin;

alter table public.catalogue_product_options
  add column if not exists freight_delivery_cost numeric,
  add column if not exists install_labour_cost numeric,
  add column if not exists foc_other_direct_cost numeric,
  add column if not exists target_gm numeric not null default 0.20,
  add column if not exists public_sell_price_ex_vat numeric,
  add column if not exists vat_rate_pct numeric,
  add column if not exists vat_evidence_note text,
  add column if not exists price_evidence_status text not null default 'MISSING',
  add column if not exists price_source_reference text,
  add column if not exists price_quote_date date,
  add column if not exists price_valid_to date,
  add column if not exists price_decision text not null default 'REQUEST_QUOTE',
  add column if not exists price_verified_at timestamptz,
  add column if not exists price_verified_by uuid,
  add column if not exists margin_override_reason text,
  add column if not exists pricing_note text;

alter table public.catalogue_product_options
  drop constraint if exists catalogue_product_options_price_decision_check;
alter table public.catalogue_product_options
  add constraint catalogue_product_options_price_decision_check
  check (price_decision in ('REQUEST_QUOTE','DRAFT_FIXED','APPROVED_FIXED','HOLD'));

alter table public.catalogue_product_options
  drop constraint if exists catalogue_product_options_price_evidence_check;
alter table public.catalogue_product_options
  add constraint catalogue_product_options_price_evidence_check
  check (price_evidence_status in ('MISSING','PLANNING','PUBLIC_BENCHMARK','SUPPLIER_EVIDENCE','VERIFIED_CURRENT'));

alter table public.catalogue_product_options
  drop constraint if exists catalogue_product_options_target_gm_check;
alter table public.catalogue_product_options
  add constraint catalogue_product_options_target_gm_check
  check (target_gm >= 0 and target_gm < 1);

alter table public.catalogue_product_options
  drop constraint if exists catalogue_product_options_direct_costs_check;
alter table public.catalogue_product_options
  add constraint catalogue_product_options_direct_costs_check
  check (
    (freight_delivery_cost is null or freight_delivery_cost >= 0)
    and (install_labour_cost is null or install_labour_cost >= 0)
    and (foc_other_direct_cost is null or foc_other_direct_cost >= 0)
    and (public_sell_price_ex_vat is null or public_sell_price_ex_vat > 0)
    and (vat_rate_pct is null or (vat_rate_pct >= 0 and vat_rate_pct <= 100))
  );

alter table public.catalogue_product_options
  drop constraint if exists catalogue_product_options_price_dates_check;
alter table public.catalogue_product_options
  add constraint catalogue_product_options_price_dates_check
  check (price_valid_to is null or price_quote_date is null or price_valid_to >= price_quote_date);

create table if not exists public.catalogue_option_price_history (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.catalogue_product_options(id) on update cascade on delete cascade,
  family_id text not null,
  source_key text not null,
  old_price_decision text,
  new_price_decision text,
  old_public_sell_price_ex_vat numeric,
  new_public_sell_price_ex_vat numeric,
  old_landed_cost numeric,
  new_landed_cost numeric,
  old_gm numeric,
  new_gm numeric,
  target_gm numeric,
  price_valid_to date,
  price_evidence_status text,
  margin_override_reason text,
  pricing_note text,
  changed_by uuid,
  changed_at timestamptz not null default now()
);

alter table public.catalogue_option_price_history enable row level security;

drop policy if exists "psc admins read catalogue price history" on public.catalogue_option_price_history;
create policy "psc admins read catalogue price history"
on public.catalogue_option_price_history
for select to authenticated
using (private.is_psc_admin());

create or replace function public.catalogue_option_pricing_guard()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  family_price_treatment text;
  landed numeric;
  gm numeric;
  pricing_changed boolean;
begin
  select website_price_treatment into family_price_treatment
  from public.catalogue_families
  where family_id = new.family_id and active = true;

  if family_price_treatment is null then
    raise exception 'Active catalogue family is required for pricing';
  end if;

  if family_price_treatment <> 'Fixed price when approved' then
    if new.price_decision = 'APPROVED_FIXED' then
      raise exception 'This family is quote-led and cannot publish a fixed price';
    end if;
    new.price_decision := 'REQUEST_QUOTE';
    new.public_sell_price_ex_vat := null;
  end if;

  pricing_changed :=
       tg_op = 'INSERT'
    or old.price_decision is distinct from new.price_decision
    or old.public_sell_price_ex_vat is distinct from new.public_sell_price_ex_vat
    or old.b2b_cost is distinct from new.b2b_cost
    or old.freight_delivery_cost is distinct from new.freight_delivery_cost
    or old.install_labour_cost is distinct from new.install_labour_cost
    or old.foc_other_direct_cost is distinct from new.foc_other_direct_cost
    or old.target_gm is distinct from new.target_gm
    or old.vat_rate_pct is distinct from new.vat_rate_pct
    or old.vat_evidence_note is distinct from new.vat_evidence_note
    or old.price_evidence_status is distinct from new.price_evidence_status
    or old.price_source_reference is distinct from new.price_source_reference
    or old.price_quote_date is distinct from new.price_quote_date
    or old.price_valid_to is distinct from new.price_valid_to
    or old.margin_override_reason is distinct from new.margin_override_reason;

  if new.price_decision = 'APPROVED_FIXED' then
    if new.psc_decision <> 'APPROVE' or new.customer_selectable <> true then
      raise exception 'Fixed-price publication requires APPROVE and customer-selectable option';
    end if;
    if new.verification_date is null then
      raise exception 'Fixed-price publication requires current option verification date';
    end if;
    if new.b2b_cost is null
       or new.freight_delivery_cost is null
       or new.install_labour_cost is null
       or new.foc_other_direct_cost is null then
      raise exception 'Fixed-price publication requires complete landed-cost inputs; enter explicit zero where verified no cost applies';
    end if;
    if new.public_sell_price_ex_vat is null or new.public_sell_price_ex_vat <= 0 then
      raise exception 'Fixed-price publication requires PSC selling price ex VAT';
    end if;
    if new.vat_rate_pct is null or nullif(btrim(coalesce(new.vat_evidence_note,'')),'') is null then
      raise exception 'Fixed-price publication requires verified VAT rate and evidence note';
    end if;
    if new.price_evidence_status <> 'VERIFIED_CURRENT' then
      raise exception 'Fixed-price publication requires VERIFIED_CURRENT price evidence';
    end if;
    if new.price_quote_date is null or new.price_valid_to is null then
      raise exception 'Fixed-price publication requires quote date and validity date';
    end if;
    if new.price_valid_to < current_date then
      raise exception 'Cannot publish an expired fixed price';
    end if;

    landed := new.b2b_cost + new.freight_delivery_cost + new.install_labour_cost + new.foc_other_direct_cost;
    gm := case when new.public_sell_price_ex_vat > 0 then (new.public_sell_price_ex_vat - landed) / new.public_sell_price_ex_vat else null end;

    if gm < new.target_gm and nullif(btrim(coalesce(new.margin_override_reason,'')),'') is null then
      raise exception 'Gross margin is below target; record a margin override reason or revise the price/cost';
    end if;

    if pricing_changed or new.price_verified_at is null then
      new.price_verified_at := now();
      new.price_verified_by := auth.uid();
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_zz_catalogue_option_pricing_guard on public.catalogue_product_options;
create trigger trg_zz_catalogue_option_pricing_guard
before insert or update
on public.catalogue_product_options
for each row
execute function public.catalogue_option_pricing_guard();

create or replace function public.catalogue_option_price_history()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  old_landed numeric;
  new_landed numeric;
  old_gm numeric;
  new_gm numeric;
begin
  if old.price_decision is not distinct from new.price_decision
     and old.public_sell_price_ex_vat is not distinct from new.public_sell_price_ex_vat
     and old.b2b_cost is not distinct from new.b2b_cost
     and old.freight_delivery_cost is not distinct from new.freight_delivery_cost
     and old.install_labour_cost is not distinct from new.install_labour_cost
     and old.foc_other_direct_cost is not distinct from new.foc_other_direct_cost
     and old.target_gm is not distinct from new.target_gm
     and old.vat_rate_pct is not distinct from new.vat_rate_pct
     and old.vat_evidence_note is not distinct from new.vat_evidence_note
     and old.price_evidence_status is not distinct from new.price_evidence_status
     and old.price_source_reference is not distinct from new.price_source_reference
     and old.price_quote_date is not distinct from new.price_quote_date
     and old.price_valid_to is not distinct from new.price_valid_to
     and old.margin_override_reason is not distinct from new.margin_override_reason
     and old.pricing_note is not distinct from new.pricing_note then
    return new;
  end if;

  old_landed := case
    when old.b2b_cost is not null and old.freight_delivery_cost is not null and old.install_labour_cost is not null and old.foc_other_direct_cost is not null
    then old.b2b_cost + old.freight_delivery_cost + old.install_labour_cost + old.foc_other_direct_cost
    else null end;
  new_landed := case
    when new.b2b_cost is not null and new.freight_delivery_cost is not null and new.install_labour_cost is not null and new.foc_other_direct_cost is not null
    then new.b2b_cost + new.freight_delivery_cost + new.install_labour_cost + new.foc_other_direct_cost
    else null end;

  old_gm := case when old.public_sell_price_ex_vat > 0 and old_landed is not null then (old.public_sell_price_ex_vat-old_landed)/old.public_sell_price_ex_vat else null end;
  new_gm := case when new.public_sell_price_ex_vat > 0 and new_landed is not null then (new.public_sell_price_ex_vat-new_landed)/new.public_sell_price_ex_vat else null end;

  insert into public.catalogue_option_price_history(
    option_id,family_id,source_key,
    old_price_decision,new_price_decision,
    old_public_sell_price_ex_vat,new_public_sell_price_ex_vat,
    old_landed_cost,new_landed_cost,
    old_gm,new_gm,target_gm,price_valid_to,
    price_evidence_status,margin_override_reason,pricing_note,changed_by
  ) values (
    new.id,new.family_id,new.source_key,
    old.price_decision,new.price_decision,
    old.public_sell_price_ex_vat,new.public_sell_price_ex_vat,
    old_landed,new_landed,
    old_gm,new_gm,new.target_gm,new.price_valid_to,
    new.price_evidence_status,new.margin_override_reason,new.pricing_note,auth.uid()
  );

  return new;
end;
$$;

drop trigger if exists trg_catalogue_option_price_history on public.catalogue_product_options;
create trigger trg_catalogue_option_price_history
after update
on public.catalogue_product_options
for each row
execute function public.catalogue_option_price_history();

drop view if exists public.catalogue_public_fixed_prices;
create view public.catalogue_public_fixed_prices as
select
  o.family_id,
  o.id as product_option_id,
  o.exact_product_name,
  o.brand,
  o.presentation,
  o.pack,
  o.public_sell_price_ex_vat,
  o.vat_rate_pct,
  o.price_valid_to
from public.catalogue_product_options o
join public.catalogue_families f on f.family_id=o.family_id
where f.active=true
  and f.website_price_treatment='Fixed price when approved'
  and o.active=true
  and o.psc_decision='APPROVE'
  and o.customer_selectable=true
  and o.price_decision='APPROVED_FIXED'
  and o.price_evidence_status='VERIFIED_CURRENT'
  and o.public_sell_price_ex_vat > 0
  and o.price_verified_at is not null
  and o.price_valid_to >= current_date;

drop view if exists public.catalogue_family_price_public;
create view public.catalogue_family_price_public as
select
  family_id,
  min(public_sell_price_ex_vat) as min_price_ex_vat,
  max(public_sell_price_ex_vat) as max_price_ex_vat,
  count(*)::int as priced_option_count,
  min(price_valid_to) as earliest_valid_to
from public.catalogue_public_fixed_prices
group by family_id;

grant select on public.catalogue_public_fixed_prices to anon, authenticated;
grant select on public.catalogue_family_price_public to anon, authenticated;

commit;
