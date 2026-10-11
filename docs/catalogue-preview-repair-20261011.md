# First real variant preview and remaining identity repair

## Prospan 100 ml

The repair branch now installs one individually verified variant candidate:
`local-acorus-ad974c05853f`, SKU `PS-AC-AD974C05853F`, family `PSC-IS-126`.
Its 1024×1024 photograph was downloaded unchanged from the exact Life Pharmacy
100 ml listing and visually checked: Prospan cough syrup, 100 ml bottle,
white background, no unrelated product or family substitution.

Card and selector pack fields now use **100 ml bottle**. Description is
Prospan cough syrup with ivy leaf dry extract, 100 ml bottle.
The displayed **AED 42** is explicitly a UAE retail benchmark; the retailer
labels it inclusive of VAT. It is not a PSC selling price or supplier cost.
URLs, date, checksum and dimensions are in
`verified-preview-variant-register.json`.

The original Batch 33 crop remains unapproved for image quality. The separately
retrieved retailer photograph is the approved image candidate; this does not
approve the original crop or the other source products.

An Aldomet 1050×1050 retailer image was also retrieved and inspected. It visibly
matches 250 mg / 30 tablets but bears a retailer watermark, so it is retained in
private staging and has not replaced the catalogue photo. The myAster image
retrieval for Alicoxa was blocked; no substitute was invented.

## Identity corrections

The previous catalogue merge stripped punctuation and indexed image candidates
globally by name. It could therefore reuse a photograph from another family.
It now keys explicit name/source-name aliases within their own family, checks
brand and known pack agreement, and quarantines duplicate source keys.
Distinct same-brand packs are retained during option merging.

Local option IDs were previously replaced with null in procurement snapshots.
They are now retained as `local_product_option_id`; the database option ID
remains null for local entries, preserving database foreign-key boundaries.

## Verification and release

Focused tests cover cross-family, punctuation, brand, known-pack and collision
rejection. Browser tests at 390 and 1440 px now exercise the actual Prospan
card, selector, image decode and procurement snapshot as well as fixtures.
The CI result must be inspected on the resulting commit.

Overall release remains **HOLD**. Production is unchanged. This is one real
verified preview candidate, not completion of the catalogue or approval of
the remaining products, prices, stock or supply routes.

## Second verified preview: Bepanthen Protective Baby Ointment 100 g

Exact local option `local-acorus-82eeffa2d41b`, SKU `PS-AC-82EEFFA2D41B`,
family `PSC-IS-148` now uses the unchanged 1024×1024 Life Pharmacy image.
The photograph visibly identifies Protective Baby Ointment and 100 g; it is
not the 30 g moisturizing cream or another Bepanthen formulation. The UAE
retail benchmark is AED 59 including VAT, checked 2026-10-11. No PSC selling
price has been approved. The exact description states product, formulation,
pack and external use without importing unsupported clinical claims.

The actual mobile/desktop browser checks now cover both verified candidates.
Local browser execution is unavailable because this container lacks the
Playwright Chromium executable; GitHub CI installs Chromium and must pass.

Dora's retrieved 700×700 photograph shows 30 tablets and desloratadine, but
its front does not visibly confirm 5 mg. It remains private and unapproved.
The exact retailer listing and AED 34.50 VAT-inclusive benchmark are recorded
in `../staging/catalogue-batch33/additional-retailer-evidence.json`; that does
not authorize a photo or PSC price. Creon 100-capsule listings found during
research do not verify the source's 20-capsule variant and were rejected.

CI run 38134128471 passed build/data/DOM checks but the new real-product test
looked for Prospan in the breathing category. The source catalogue assigns
that SKU to medicines. The test now follows the actual medicines route;
production categorization was not changed to accommodate the test. The
resulting expanded test run still must pass before preview verification.

## Nexium exact strength pair and procurement price qualifications

Two unchanged, visually checked 1024×1024 Life Pharmacy pack photos show
Nexium 20 mg / 14 tablets and 40 mg / 14 tablets separately. Exact option IDs
`local-acorus-56cb26fe529b` and `local-acorus-5ed2ff06e0af` remain under
`PSC-IS-151`. The UAE benchmarks are AED 78.50 and AED 110 respectively,
VAT-inclusive as displayed, checked 2026-10-11. Descriptions state only the
brand, esomeprazole strength, formulation and 14-tablet pack. These four total
verified preview candidates do not approve other strengths or packs.

Verified request snapshots now retain description source, price VAT basis and
any promotional note in addition to source/date/unit/type. The selected detail
shows VAT qualification and evidence date. Actual browser checks exercise all
four candidates at 390 and 1440 px, plus simultaneous selection of the two
same-brand/same-pack Nexium strengths, separate gallery images and separate
request prices. Horizontal overflow is also checked.

Bepanthen cream 30 g remains HOLD: the unchanged 700×700 pack photo has too
much surrounding space, and three retrieved gallery images are promotional
illustrations. Its AED 23.95 discounted benchmark and AED 35 comparison price
are retained privately; the comparison is not asserted as a regulated MRP.
Betaserc 8 mg / 100 tablets has a retrieved AED 81.27 retailer benchmark,
but image download failed and the retailer's brand field says Generic. Both
remain unapproved, with source URLs and hold reasons in the additional
retailer evidence register. No PSC prices or production changes are approved.

## Snapshot option ID reconciliation candidates

A reproducible exact full-name/family/brand comparison of the 193 local and
719 database snapshot records found six unique overlap pairs: three Imodium
presentations and three Zyrtec presentations. Both original option IDs are
retained in `option-id-reconciliation-candidates.json`, along with source file
checksums. All three Imodium database pack fields are missing; all three
Zyrtec pairs have different pack text. No ID merge or pack equivalence is
approved. This comparison is distinct from the Batch 33 source-master-name
crosswalk, which found no exact database links. The snapshots are not a new
production database read. Run `python3 tools/reconcile-option-identities.py`
to reproduce the register.

### Imodium and Zyrtec exact-pack review

Seven individual variants now have preview evidence (the previous four plus Imodium 2 mg/6 capsules, Zyrtec 10 mg/20 tablets and Zyrtec 1 mg/ml/75 ml). The three new photographs are unchanged 1024×1024 retailer originals, with checksums, brand, exact pack, descriptive identity and VAT-inclusive UAE retail benchmarks in the register. These prices are not approved PSC selling prices.

All six retained Imodium/Zyrtec local/database identity overlaps now have separately reviewed retailer pack evidence. The reconciliation tool checks exact ID pairs, family, full name, brand, historical pack text and photograph checksum. It records confirmed pack identity without changing historical database pack text, enabling database options or merging IDs. All six database snapshot records were non-selectable; current database records and commercial approval remain unverified.

Imodium 60 capsules, Imodium Instants 6 tablets and Zyrtec oral drops 10 ml remain on image-quality hold. The alternative Imodium Instants gallery images are promotional illustrations, not pack photographs. The 700 px alternative Imodium and Zyrtec photographs do not resolve the quality hold. Their sources, original bytes and decisions are retained privately outside the built site.

The Zyrtec oral-drops retailer description incorrectly claims a cetirizine/ambroxol combination and includes tablet instructions. That copy was excluded. Zyrtec descriptive identity uses the photographed strength/form plus the manufacturer’s regional leaflet; this does not establish UAE registration. Mobile and desktop browser checks now cover all seven preview variants, including separate description and price sources in procurement snapshots. Overall release remains HOLD and production is unchanged.
