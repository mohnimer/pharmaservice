# Batch 33 original asset import — 11 October 2026

## Actual imported evidence

The original reuploaded builder ZIP contains 150 unique 1200×1200 JPEG files.
All files decoded successfully, and their original bytes are committed under
`staging/catalogue-batch33/originals`. SHA-256 checksums, original source manifest,
exact candidate links and import counts are committed beside them. No image was
reframed, generated, renamed to another variant, or installed into public assets.
The previously generated WebP recovery ZIP was not available in this checkout.

These are collage crops with substantial margins, rather than finished product
photographs. Inspecting the Aldomet image confirms a visible 250 mg / 30 tablet
pack but also demonstrates the small product within a much larger source canvas.
That single inspection does not approve the other images or public image quality.

## Reconciliation

- 193 local overlay records and 719 database snapshot records inventoried separately.
- 147 exact family/name candidate links: 68 existing-master products and 79
  new-to-master products already represented in the local overlay.
- Three source products still have no exact local match.
- Zero exact database links under the source's existing-master name and family.
  No punctuation-stripping, fuzzy match, family fallback or ID invention was used.
- 119 source pack claims confirmed; 31 uncertain source packs.
- Existing local pack placeholders are preserved. Source claims are recorded
  separately and do not silently replace an unverified commercial specification.
- Recorded database MRPs remain unapproved benchmarks, never PSC sell prices.
- Zero new approved prices or release-approved image records.

The CSV `batch33-option-evidence-reconciliation.csv` links source checksums to
exact local option IDs and records brand, current pack and source pack claim.
`catalogue-option-release-inventory.csv` inventories all 912 snapshot records
with explicit image, description, price and release holds. These snapshots are
not a fresh query of the production database and are not 912 unique products.

## Release boundary

No runtime, catalogue design, public asset, database, price or procurement
behavior changed. The build excludes the staging directory. Automated checksum
and boundary tests enforce this. PR #20 must remain draft.

## Outstanding release work

Review every source photo against the actual variant and exact pack; produce or
obtain presentable image assets; reconcile database and local identities using
supplier SKU evidence; obtain variant-specific UAE price sources with dates,
units and VAT basis; verify card, selection, detail and request persistence on
mobile and desktop. No full-catalogue verification or production approval is
claimed by this import.
