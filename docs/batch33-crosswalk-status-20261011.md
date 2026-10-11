# Acorus Batch 33 exact variant image reconciliation

Source: recovered Acorus Batch 33 image package and the current checked-in local catalogue overlay, reconciled 11 October 2026.

| Gate | Count | Interpretation |
|---|---:|---|
| Recovered source images | 150 | Binary assets exist in the local staging ZIP, not the GitHub repository |
| Source front-pack claims confirmed | 119 | Source photo identity claim; not approval of a public variant |
| Source pack/presentation needs verification | 31 | Do not attach automatically |
| Existing master SKU images with front-pack claim | 71 | Candidates for local option matching |
| Exact family ID + catalogue-facing variant name matches | **68** | Potential exact local option image replacements; no price or final approval |
| Existing-master candidates without exact option match | **3** | HOLD |
| New-to-master source products | 79 | HOLD pending option creation and approval |
| Price verified by image pack | 0 | No retail/PSC cost or selling-price evidence in image pack |
| Images approved for public release | 0 | Final release gate not met |

## Three unmatched source candidates

- PSC-IS-120: Sophy Berberine Phytosome 550 mg — 30 Tablets
- PSC-IS-127: Vildagard 50/1000 mg — 60 Tablets
- PSC-IS-127: Vildagard 50/850 mg — 60 Tablets

The previous matcher used abbreviated `existing_master_product` names. These are not the actual `exact_product_name` values of local catalogue options and would have silently failed to link most photos. The staging matcher now keys on `psc_family_id` plus normalized `product_name`, the catalogue-facing name. No fuzzy matches, cross-family fallback, or substitutions.

**Release status: HOLD.** 68 source-to-option identity links are not equivalent to 68 verified product images and prices. Preserve the current website until actual asset installation, browser QA, exact variant pack checks, price evidence and regulatory review pass.
