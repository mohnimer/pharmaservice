PSC V39.5 — TASK 2 / READ-ONLY FAMILY CATALOGUE LAYER

Purpose
- Add the 191-family PSC catalogue architecture as a read-only layer above the existing product grids.
- Family data loads from Supabase public.catalogue_family_public.
- catalogue-family-v39.js is a frozen 191-family fallback generated from the supplied catalogue architecture workbook.
- Existing product cards, basket, request creation, quotation, replenishment and admin flows are not changed.

Safety rules implemented from the workbook
- Generic / institutional family remains the main identity.
- Acorus MRP is not displayed as PSC price.
- No candidate supplier product is exposed as an approved customer option.
- Medicine families remain Request quote.
- No Common Brands line or presentation chips are published in Task 2 because the workbook marks those as review-dependent.
- DHA wording is neutral: "DHA requirement", never "DHA approved".
- Availability wording does not claim live stock.

Supabase
- catalogue_families: 191 active family records loaded.
- catalogue_product_options: customer-facing public view currently returns 0 options because none are APPROVE + customer_selectable yet.
- catalogue_family_public was tightened to exclude website_status/internal build-state wording.

Deploy
Copy these four files over the current site root:
- index.html
- catalogue-family-v39.js
- family-layer-v39.js
- family-layer-v39.css

No app.js or styles.css replacement is required for this task.
