-- V39.8 Task 5 — structured family request persistence guard.
-- Applied to PSC Supabase project on 2026-10-04.

create or replace function public.validate_order_line_family_selection()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  fam public.catalogue_families%rowtype;
  opt public.catalogue_product_options%rowtype;
begin
  if new.family_id is null then
    if new.product_option_id is not null
       or new.requested_presentation is not null
       or new.brand_preference_mode is not null
       or new.requested_brand is not null
       or new.product_option_snapshot is not null
       or new.family_name_snapshot is not null then
      raise exception 'Family selection fields require family_id';
    end if;
    return new;
  end if;

  select * into fam
  from public.catalogue_families
  where family_id = new.family_id and active = true;

  if not found then
    raise exception 'Unknown or inactive catalogue family: %', new.family_id;
  end if;

  new.family_name_snapshot := fam.family_name;
  new.line_description := fam.family_name;

  if coalesce(array_length(fam.presentations,1),0) > 0 then
    if nullif(btrim(coalesce(new.requested_presentation,'')),'') is null then
      raise exception 'Presentation is required for family %', new.family_id;
    end if;
    if not (new.requested_presentation = any(fam.presentations)) then
      raise exception 'Presentation % is not controlled for family %', new.requested_presentation, new.family_id;
    end if;
  end if;

  if new.brand_preference_mode not in ('no_preference','specific_option','other_brand') then
    raise exception 'Invalid brand preference mode';
  end if;

  if new.brand_preference_mode = 'specific_option' then
    if new.product_option_id is null then
      raise exception 'Specific option selection requires product_option_id';
    end if;
    select * into opt
    from public.catalogue_product_options
    where id = new.product_option_id
      and family_id = new.family_id
      and active = true
      and psc_decision = 'APPROVE'
      and customer_selectable = true;
    if not found then
      raise exception 'Selected product option is not approved for customer selection';
    end if;
    if nullif(btrim(coalesce(new.requested_presentation,'')),'') is not null
       and nullif(btrim(coalesce(opt.presentation,'')),'') is not null
       and new.requested_presentation <> opt.presentation then
      raise exception 'Selected product option does not match requested presentation';
    end if;
    new.requested_brand := opt.brand;
    new.brand_model_snapshot := opt.exact_product_name;
    new.pack_snapshot := opt.pack;
    new.product_option_snapshot := jsonb_build_object(
      'product_option_id', opt.id,
      'exact_product_name', opt.exact_product_name,
      'brand', opt.brand,
      'presentation', opt.presentation,
      'pack', opt.pack
    );
  elsif new.brand_preference_mode = 'other_brand' then
    if new.product_option_id is not null then
      raise exception 'Other-brand request cannot carry product_option_id';
    end if;
    if nullif(btrim(coalesce(new.requested_brand,'')),'') is null then
      raise exception 'Other-brand request requires requested_brand';
    end if;
    new.product_option_snapshot := null;
    new.brand_model_snapshot := new.requested_brand;
  else
    if new.product_option_id is not null then
      raise exception 'No-preference request cannot carry product_option_id';
    end if;
    new.requested_brand := null;
    new.product_option_snapshot := null;
    new.brand_model_snapshot := 'No preference';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_order_line_family_selection on public.order_lines;
create trigger trg_validate_order_line_family_selection
before insert or update of family_id, product_option_id, requested_presentation, brand_preference_mode, requested_brand, product_option_snapshot
on public.order_lines
for each row
execute function public.validate_order_line_family_selection();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='order_lines_brand_preference_mode_check'
      and conrelid='public.order_lines'::regclass
  ) then
    alter table public.order_lines
      add constraint order_lines_brand_preference_mode_check
      check (brand_preference_mode is null or brand_preference_mode in ('no_preference','specific_option','other_brand'));
  end if;
end $$;
