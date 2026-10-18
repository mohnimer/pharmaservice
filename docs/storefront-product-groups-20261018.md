# Storefront product identity — local review, 18 October 2026

Customers browse recognizable products. Controlled catalogue families remain internal information and sourcing relationships. This change alters presentation only; it does not rebuild product records or release new product facts.

## Automatic rules

- Different recorded brands, models, strengths, forms, release types, formulas, stages and named product lines stay separate.
- Join pack choices only when the controlled pack corroborates a terminal quantity and the remaining product identity matches inside the existing family and brand. Retain all member IDs, original names, packs, prices and photo bindings.
- Unknown packs and generic specifications stay separate. An unresolved pack is not a reason to guess a merge or withhold the existing listing.
- The same grouping runs after search, so every matched member belongs to exactly one rendered listing. Counts measure rendered listings. Details opens the actual product and offers only its packs; single-product Details requires no brand choice.
- Requirement records retain their sourcing role. They do not expose the entire historical supplier-option inventory. Their original requirement ID, wording/status/condition snapshot remains in the existing request snapshot, without creating a product-option foreign key.
- Family images remain examples for requirements, not substitute photographs for named branded products. Exact photos, original request identities, compact Details enquiry links, quantity controls, disclosures, navigation, access gates and legacy saved items remain supported.

The full 491-product projection produces 486 product listings, including five two-pack groups. The current visible runtime subset has 472 products / 467 listings. The existing 194 requirement records and all visibility flags remain unchanged. These counts do not certify identity or commercial approval. Clear pack groups include HemaGel wound gel, Zomig, Imodium capsules and two NAN line/stage pairs. Other NAN stages/lines and different Braun models/products remain distinct.

## Up to three suitable brands

`storefront-brand-choices.js` is a presentation-only approved shortlist, currently empty. Do not choose the first three alphabetically, confuse manufacturer labels with brand identities, or use MRP/photo/stock as a quality score. A broad family is not an exact competing specification.

Each decision records `status: APPROVED`, `familyId`, an exact `requirementKey`, `reviewer`, `reviewedAt`, `candidateSkus`, `strict`, and one to three `choices`. Each choice needs `brand`, original `skus`, a selection `rationale` and a public `evidence` reference. Strict decisions additionally require `requirementFit: CONFIRMED`. Qualification and evidence live in the existing private review workflow; no private supplier/commercial material belongs in this file.

Only fully scoped, valid decisions affect the default product grouping. An exact search still finds an original nonpreferred SKU. Specification-request choices match the exact requirement key, not every record in its family. Missing or invalid approval does not become a fabricated quality ranking. No real brand shortlist is approved by the test fixtures.

Seven broad existing families have more than three recorded brand labels and need a narrower competing-product scope before a quality selection. This is not seven automatic three-brand selections. Unconfirmed packs are optional consolidation exceptions; leaving them separate is a completed safe outcome.

## Validation

Local unit tests cover every original projection ID exactly once, no source mutation, distinct identity boundaries, controlled pack joins and three-brand/strict-fit guards. Browser checks cover 390/1440 product → pack → request, exact photos and IDs, requirement snapshots and existing anonymous login gating. Existing search checks retain the entire matched antihistamine member set at 320/390/1440. Enquiry context, saved items and disclosure/keyboard behavior are checked separately. Backends are mocked; no external sends, live supply acceptance, manufacturer approval or deployment is claimed.

Protected catalogue, image-policy, source-family, refresh, variant-evidence and photograph-binding content is unchanged. No pricing/source master/database/DHA condition/logo edit or deployment. Existing manual identity/suitability decisions remain open. The change is for local branch review.
