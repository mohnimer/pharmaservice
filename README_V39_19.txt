PSC V39.19 — SKU-Level Family Preference Labels

Install on top of V39.18.

What changed
- Family preference boxes are now SKU/product-option based rather than collapsed to one box per brand.
- If Easy has three distinct SKUs under the same family, the customer sees three separate Easy boxes.
- The subtitle is built from the actual option data we have: exact product/model description, presentation/form and pack where available.
- Generic “Acceptable brand” copy is removed.
- The request payload now retains the selected product_option_id(s) and exact product descriptors as preferences.
- “No brand preference” and “Other brand / manufacturer required” remain available.

Safe public option view
- Added catalogue_family_option_reference_public.
- Exposes only product_option_id, family_id, exact_product_name, brand, presentation and pack.
- Does not expose supplier cost, MRP, margin, stock evidence or internal commercial notes.
- Includes active VERIFY / APPROVE reference options so the family page can show the actual candidate variants PSC has mapped.

Example now supported
PSC-SC-C20 shows separate boxes for:
- Easy — Two sided finger splint large
- Easy — Two sided finger splint medium
- Easy — Two sided finger splint small
- Hercules — Wrist brace w/splint one size (08770)
- S-Ortho — Elastic wrist splint A4-001
- S-Ortho — Wrist thumb splint C4-018

The selection remains a quotation preference, not a stock or availability promise.

Supabase migration was applied during this build.
