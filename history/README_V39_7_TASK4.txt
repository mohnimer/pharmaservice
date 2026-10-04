PSC V39.7 — TASK 4 / APPROVED BRAND-OPTION SELECTION

Purpose
- Harden the family detail selector so named brand/product options can only come from catalogue_product_option_public.
- Keep the existing request database payload unchanged; structured family/order-line persistence remains Task 5.

Implemented
- Customer page never reads catalogue_product_options directly.
- Approval gate is enforced by the Supabase public view: active + PSC Decision APPROVE + Customer Selectable true.
- Approved named options are filtered by the selected presentation.
- Choosing an approved option automatically synchronizes its presentation.
- Changing presentation clears an incompatible specific option back to No preference.
- If PSC later withdraws approval, a stale browser selection is cleared on the next open.
- Other brand required now requires actual text before Request quote continues.
- Catalogue family search is augmented only with brand/product aliases returned by catalogue_product_option_public.
- Supplier cost, MRP, stock and internal preferred flags remain absent from public UI.

Cetirizine safety state
- The 3 Zyrtec Acorus candidates remain VERIFY / not customer-selectable.
- Therefore zero named Zyrtec SKU options are currently exposed publicly.
- The controlled family recognition line “Common brands: Zyrtec” remains visible from the family master, but exact candidate SKUs stay hidden until approval.

Deploy
- This patch assumes V39.5 Task 2 and V39.6 Task 3 are already installed.
- Replace only: index.html, family-layer-v39.js, family-detail-v39.js, family-detail-v39.css.
- README is informational only.
