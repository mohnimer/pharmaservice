PSC V39.16 — Catalogue hierarchy + Start / Our Model refinement

Install on top of V39.15.
No Supabase migration. No approval, pricing, availability or regulatory data changed.

What changed
1. Public catalogue is category-first.
   - Clinical-need cards now lead the page.
   - The #catalogue all view no longer dumps all 191 families into one wall.
   - Opening a category reveals only the families inside that category.
   - Published product listings remain directly below, so the user can also keep scrolling.

2. Family cards now visually belong to the selected category.
   - Same category colour language and collage artwork.
   - Less metadata on the card.
   - Family-detail behavior from V39.14 is preserved, including the item-page-style detail shell and product image preview.

3. /start simplified and rewritten.
   - One clear entry message.
   - Three routes: send a list, browse the catalogue, understand the model.
   - Short practical guidance before the existing enquiry form.
   - Removed the unverified licence-number claim from this page.

4. /our-model rewritten and simplified.
   - Four grounded operating steps: define, source, quote, record.
   - Opening vs recurring supply distinction.
   - Category-specific sourcing logic.
   - Clear commercial/regulatory boundaries instead of broad promises.

QA performed
- app.js syntax: PASS
- family-layer-v39.js syntax: PASS
- relevant CSS parse errors: 0
- V39.14 family-detail files were not changed
- no Supabase tables, policies or live catalogue decisions changed
