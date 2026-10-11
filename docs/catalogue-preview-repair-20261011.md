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
