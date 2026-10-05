PSC V39.26 — Contact + Workshop utility patch

INSTALL
Upload these three files to the repository root:
- index.html
- v39-26-workshop-contact.js
- v39-26-workshop-contact.css

DO NOT replace app.js or styles.css.
This patch is intentionally isolated so it does not roll back the V39.18–V39.24 catalogue/family work.

CONTACT
- Contact-page explanatory copy is reduced to exactly:
  “For a single product, a recurring supply list, capital equipment, clinic setup or a broader RFQ. You can also attach the customer list or RFQ file.”
- The duplicate prospect intro is removed.
- Clinic Portal contact-card spacing/button wrapping is fixed.
- Home clinical-preview CTA spacing is tightened safely.

THE WORKSHOP
- Keeps the existing seven categories.
- Adds 20 practical guides, taking the Workshop from 10 to 30 published guides.
- Categories now feel populated rather than prototype-sparse.
- Every article gets a compact action view:
  THE PROBLEM / CHECK IT NOW / WHAT GOOD LOOKS LIKE / WHEN ORDERING / NEXT ACTION.
- Adds “Run this check” quick checklists to action-oriented guides.
- Removes the public “source/review record to be completed” line from article metadata.
- Replaces heuristic related products with strict explicit “PRODUCTS USED IN THIS CHECK” links only.
- If no exact related catalogue line is specified, no related-product section is shown.
- Contextualises the admin Create Email button copy by guide type.

No Supabase migration. No catalogue/family core files changed.
