# Exact-variant catalogue recovery — 11 October 2026

## Verified current source coverage

- Supabase project: PSC Clinic Portal (project ref withheld from public copy).
- `public.catalogue_product_options`: **719** option rows across 91 linked families.
- `public.catalogue_family_option_reference_public`: **712** reference rows.
- `public.catalogue_public_fixed_prices`: **0** rows.
- `public.catalogue_families`: **191** families.
- **254** of 719 option rows contain `listed_mrp > 0`, imported from Acorus product evidence, but all 719 have `price_evidence_status=MISSING`; these values must not be presented as approved PSC prices.
- **712** option rows have decision `VERIFY` and 7 are `REJECT`. No option row is currently `customer_selectable=true`.
- **3** option rows contain explicit non-placeholder pack data. Pack information is often embedded in `exact_product_name`, which is not equivalent to a verified pack field.
- The checked-in local catalogue overlay defines **193** more option references; **68** include a nonempty `image_url`. Six overlay references share a normalized family-and-name identity with the 712 public view references; approximately **899** unique family-and-name combinations exist before further duplicate review. This is a *planning count*, not a verified unique variant count.
- Recovered Acorus Batch 33 package contains 150 image files, currently **not imported into the repository**. This pack is candidate image evidence, not complete product approval.

## Code staged on repair branch

- Exact option ID + family + name + brand + pack identity gate for approved image/description/price evidence.
- Selected variant changes main preview image, description, pack and price together. Multiple selections show each option independently rather than one representative image.
- Removed cross-SKU antiseptic photo override and old family-level price inference.
- Evidence cannot be promoted by a source-only MRP or fuzzy family match.
- Automated workflow (Node variant tests + build + shell tests) completed successfully on commit `11f58fece3dc2436bef9c1106bf6a324f285d9b2`.

## Release blockers

1. Upload actual binary assets for 150 recovered image candidates and verify exact visual pack matches against individual option IDs.
2. Resolve the 719 database options plus local overlay variants, with duplicates reconciled and rejected options excluded.
3. Obtain current, variant-specific price sources and distinguish published retail MRP, PSC customer selling price and supplier acquisition cost.
4. Confirm variant descriptions and explicit packs; 31 Batch 33 source pack records are flagged uncertain.
5. Run real desktop/mobile browser checks, especially option switching, multi-select, price/description, request snapshots, broken image links and responsive layout.
6. Keep PR #20 draft and production unchanged until all release criteria pass.
