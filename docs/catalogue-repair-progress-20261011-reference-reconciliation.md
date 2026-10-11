# Catalogue repair — reference reconciliation

Starting head: 10220719d8a1f3184c209c29680ee9812202ebeb. Production unchanged; PR #20 draft; release HOLD.

Run 38140734219 passed evidence, identity, staging, build, shell, DOM and catalogue checks but failed the browser label assertion for Zyrtec oral solution. The test selected the first presentation (Tablets), filtering the solution label away. Only 19 mobile screenshots were produced; this run contains no desktop screenshots. Reviewed its mobile selected/card/dialog images and prior run 38140330487 desktop images; the latter demonstrate the old compressed selector, not approval of the new layout.

The browser test now selects the corresponding exact option presentation. Changing presentation clears incompatible exact selections, preventing hidden conflicting choices from reaching the request.

A fresh read-only public descriptor query is preserved in current-public-reference-descriptors-20261011.json: seven Imodium/Zyrtec rows, including Imodium Instant 12 tablets with null pack. The public view includes VERIFY/APPROVE rows regardless of customer_selectable; it cannot establish purchase approval. Six previously reviewed pairs remain separate; missing/differently worded packs are not silently repaired. Even identical pack text must retain separate reference/local provenance. No IDs are merged.

Public descriptors are marked reference_only and visibly qualified. A reference UUID is captured as reference_product_option_id, with purchase product_option_id null and other_brand quotation mode. Local preview records retain local_product_option_id. Evidence remains strictly keyed to the original ID and pack. App basket normalization now retains full requestedProductOptions and single-option snapshots; previously these were discarded for other_brand lines. The real production server's structured persistence remains unresolved: legacy triggers clear product_option_snapshot for other_brand, so isolated event/basket tests do not establish server persistence. No schema or production writes.

New tests/reference-overlay.mjs replays the actual seven descriptors through the app, checking six independent reference requests, distinct local IDs/packs, reference approval limits, persistent browser basket provenance and presentation reset. Zero backend writes. CI runs it before browser verification.

All nine preview photographs, retail/wholesale notice, original 150 staged photographs and historical source evidence are preserved. Image quality holds remain unresolved. Local build, 16 evidence/identity/staging tests and reference-overlay integration passed; broader checks and CI recorded in the next checkpoint.
