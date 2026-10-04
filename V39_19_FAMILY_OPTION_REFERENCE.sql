-- V39.19 — safe customer-facing family option descriptors.
-- Exposes product-reference identity only; no supplier cost, MRP, margin or internal evidence fields.
create or replace view public.catalogue_family_option_reference_public as
select
  o.id as product_option_id,
  o.family_id,
  nullif(btrim(o.exact_product_name),'') as exact_product_name,
  nullif(btrim(o.brand),'') as brand,
  nullif(btrim(o.presentation),'') as presentation,
  nullif(btrim(o.pack),'') as pack
from public.catalogue_product_options o
where o.active=true
  and o.psc_decision in ('VERIFY','APPROVE')
  and (
    nullif(btrim(coalesce(o.brand,'')),'') is not null
    or nullif(btrim(coalesce(o.exact_product_name,'')),'') is not null
  );

grant select on public.catalogue_family_option_reference_public to anon, authenticated;
