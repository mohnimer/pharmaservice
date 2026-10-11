# Catalogue repair checkpoint — retail notice and eighth preview

Production remains unchanged. PR #20 remains draft; overall catalogue release remains HOLD.

## CI failure resolved

Run 38138752128 failed in the browser request check. The Imodium family requires a presentation selection; the test clicked Add to request without it, so no request event was emitted and its `at(-1)` lookup read the preceding Nexium request. The test now chooses the required presentation and asserts that each click emits exactly one new event before inspecting its contents. The same assertion protects the Nexium multiple-selection case.

Commit 90e8bd0a2b3b1cb3d8f7edaefce8e3b1c4ef1259 passed run 38139237059, including all seven real variant checks at 390 px and 1440 px. This confirms the prior runtime/evidence changes under transport-isolated tests, not production persistence or complete visual release approval.

## Eighth exact preview candidate

Panadol Night — local option local-acorus-d226ac6267ee, SKU PSC-MED-126, family PSC-IS-134 — now has an unchanged visually inspected 1024×1024 front/angle photograph. The front/top show 24 caplets. Panadol's regional manufacturer page confirms paracetamol 500 mg + diphenhydramine hydrochloride 25 mg and film-coated caplets, supporting the retained local term 24 film-coated tablets. Source: https://www.panadol.com/en-me/adult-products/panadol-night/

Life Pharmacy UAE benchmark: AED 25 per 24-caplet pack, VAT-inclusive as displayed, checked 2026-10-11. A free-voucher promotion is noted without deducting or assigning a voucher value. Source: https://www.lifepharmacy.com/product/panadol-night-tablets-24-s

Description and price sources remain distinct in detail/request evidence. Stock, wholesale acquisition cost, PSC selling price, registration and licensed supply remain unapproved. Checksum and exact identity are recorded in docs/verified-preview-variant-register.json. No database writes or automatic ID merges.

## User-requested price notice

A shared notice appears above catalogue product results and inside both exact-family and individual-product detail pages:

“Retail prices shown are for reference. Wholesale prices are provided in your quotation.”

It uses a restrained green information line and wraps on mobile; it is not an interactive control. Retail reference wording includes sourced discounted benchmarks; it does not claim all displayed numbers are regulated MRP or undiscounted standard retail prices. Existing per-price evidence qualifications remain visible.

## Alternate image reviews

staging/catalogue-batch33/alternate-source-review-20261011 contains seven unchanged retrieved alternate images, original URLs, checksums, dimensions and visual decisions. These stay excluded from the build.

- Chemist Warehouse Imodium 60-capsule 1200 px canvas: visible exact pack but softened edges/text; quality hold remains.
- Chemist Warehouse Imodium Instants alternate gallery: promotional illustrations; rejected.
- Life Pharmacy Panadol Advance and Extra primary photographs: 700 px; quality hold. Extra with Optizorb also needs formulation review against controlled SKU.
- Panadol Advance/Extra alternate galleries: promotional layouts; rejected as substitutes for clean pack photographs.
- myAster Zyrtec drops direct retrieval returned HTTP 403; no image approval inferred.

Earlier image quality holds, 193/719 historical snapshots, six reviewed separate identity pairs and all commercial release boundaries are preserved.

## Verification

Eight-variant build/evidence/identity/staging checks passed locally. Latest broad checks and eight-variant CI are pending until recorded at their actual tested head. CI now retains card, selected-image, dialog and Nexium-multiple-selection screenshots at 390/1440 px as variant-visual-review artifacts for human visual review. Capturing screenshots does not itself approve layout.
