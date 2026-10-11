# Catalogue repair — reference reconciliation

Starting head: 10220719d8a1f3184c209c29680ee9812202ebeb. Production unchanged; PR #20 draft; release HOLD.

Run 38140734219 passed evidence, identity, staging, build, shell, DOM and catalogue checks but failed the browser label assertion for Zyrtec oral solution. The test selected the first presentation (Tablets), filtering the solution label away. Only 19 mobile screenshots were produced; this run contains no desktop screenshots. Reviewed its mobile selected/card/dialog images and prior run 38140330487 desktop images; the latter demonstrate the old compressed selector, not approval of the new layout.

The browser test now selects the corresponding exact option presentation. Changing presentation clears incompatible exact selections, preventing hidden conflicting choices from reaching the request.

A fresh read-only public descriptor query is preserved in current-public-reference-descriptors-20261011.json: seven Imodium/Zyrtec rows, including Imodium Instant 12 tablets with null pack. The public view includes VERIFY/APPROVE rows regardless of customer_selectable; it cannot establish purchase approval. Six previously reviewed pairs remain separate; missing/differently worded packs are not silently repaired. Even identical pack text must retain separate reference/local provenance. No IDs are merged.

Public descriptors are marked reference_only and visibly qualified. A reference UUID is captured as reference_product_option_id, with purchase product_option_id null and other_brand quotation mode. Local preview records retain local_product_option_id. Evidence remains strictly keyed to the original ID and pack. App basket normalization now retains full requestedProductOptions and single-option snapshots; previously these were discarded for other_brand lines. The real production server's structured persistence remains unresolved: legacy triggers clear product_option_snapshot for other_brand, so isolated event/basket tests do not establish server persistence. No schema or production writes.

New tests/reference-overlay.mjs replays the actual seven descriptors through the app, checking six independent reference requests, distinct local IDs/packs, reference approval limits, persistent browser basket provenance and presentation reset. Zero backend writes. CI runs it before browser verification.

All nine preview photographs, retail/wholesale notice, original 150 staged photographs and historical source evidence are preserved. Image quality holds remain unresolved. Local build, 16 evidence/identity/staging tests and reference-overlay integration passed; broader checks and CI recorded in the next checkpoint.

## Verified result and follow-on evidence

Runtime/evidence 869946efac2b5d1918368fd0d2f062d20c71f923 passed run 38141484081, including both widths and all nine variants. Artifact 11702987084 contains 56 screenshots. Reviewed desktop Zyrtec oral-solution selector and Prospan selector, mobile Avamys notice and description, Panadol Night card and separate Nexium gallery. Selector labels now have a readable column with price beneath. Whole-catalogue release remains HOLD.

Four alternate Zyrtec-drops originals were downloaded unchanged, checksummed and visually reviewed. Native 700 px Al Hadi artwork and three 1000 px MedX AVIFs do not improve the retained 1280 px photograph; sharpness/occupancy holds remain. Exact source URLs, listing URLs, dimensions and rejection reasons are in the follow-on private review.json. BinSina Imodium Instants retrieval failed HTTP 405. No additional preview candidate or retail/PSC price was approved.

Follow-on verification adds actual browser-basket checks for local Imodium 6 capsules, Zyrtec 20 tablets and Zyrtec 75 ml alongside database references. Browser artifacts now additionally capture selected option cards. These test/evidence/checkpoint-only additions require their own CI result at the actual new head.

Fresh read-only inspection of the actual order_lines trigger and psc_submit_institutional_request RPC confirms the server gap, rather than inferring it from old SQL files. Definitions are saved in current-request-persistence-definitions-20261011.json; no customer data queried, no schema changes or writes. Design a separate quotation-reference snapshot field/contract that preserves evidence without treating client descriptions/prices as approved commercial data. This requires isolated schema/trigger/RPC tests before release; do not remove purchase-approval validation to preserve snapshots.
