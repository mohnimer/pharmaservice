PSC V39.6 — TASK 3 / CETIRIZINE FAMILY DETAIL

Purpose
- Implement exactly one family detail experience: PSC-IS-073 Cetirizine.
- Keep the existing site, catalogue cards, basket, quotation and account flows untouched.
- Prove the family-page UX before applying it across the 191-family catalogue.

Source controls applied
- Generic/family title remains primary: Cetirizine.
- Controlled recognition line: Common brands: Zyrtec.
- Presentations: 10 mg tablets, Oral drops, Oral solution.
- Default brand preference: No preference.
- Other brand/manufacturer/pack request remains available.
- Institutional pricing is Request quote. Acorus MRP is never displayed as PSC price.
- Availability wording remains quotation-led; no live-stock claim is made.
- Once a specific brand/product is agreed, no silent substitution.

Brand-option safety
- Three Cetirizine/Zyrtec Acorus candidates were loaded into the INTERNAL catalogue_product_options table as VERIFY / not customer-selectable.
- catalogue_product_option_public still exposes zero Cetirizine options until PSC explicitly sets APPROVE + customer_selectable.
- Therefore the current customer family page does NOT expose the three unapproved Zyrtec SKUs as selectable options.
- If a future approved option enters catalogue_product_option_public, this page will show it automatically under Brand preference.

Request CTA in this task
- Request quote uses the existing public institutional enquiry flow as a safe bridge.
- It prefills family, presentation and brand preference into the requirement field.
- Structured order_lines persistence is deliberately deferred to Task 5.

Deploy
Copy the Task 2 files plus these Task 3 additions/updates:
- index.html
- family-layer-v39.js
- family-layer-v39.css
- family-detail-v39.js
- family-detail-v39.css
- catalogue-family-v39.js

No app.js or styles.css replacement is required.
