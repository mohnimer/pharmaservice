PSC V39.17 — OUR MODEL + COMPACT FAMILY SELECTOR

INSTALL ON TOP OF V39.16.

Changed files:
- app.js
- index.html
- v39-17-model.css
- family-layer-v39.js
- family-layer-v39.css

OUR MODEL
- Uses the user-approved “The Institutional Way” copy.
- Lead promise: “That complexity is ours to manage — not yours.”
- Opening / capital and recurring supply become “Set up the clinic.” / “Keep it running.”
- Shows an actual Category -> Product Family -> Line Item depiction using existing controlled site assets.
- Ends with the black CTA: “Send us the requirement. We’ll work out how to supply it.”

CATALOGUE FAMILY UX
- Removes the large family-card wall inside each clinical category.
- Replaces it with a compact, horizontally scrollable family selector similar to the existing category ribbon.
- Each selector shows the controlled family name plus a concise existing subtitle (common brands, presentations, pack basis, or safe availability wording).
- Family selectors are sorted by that existing subtitle, then by family name. No synthetic subcategories are invented.
- Clicking a selector still opens the existing family detail view.
- Published product cards remain immediately below for users who keep scrolling.

No Supabase changes.
No pricing, approval, regulatory, stock, request, admin or portal data changed.

QA performed:
- node --check app.js: PASS
- node --check family-layer-v39.js: PASS
- CSS brace balance: PASS
- exact requested Our Model copy phrases present: PASS
- large family-card classes removed from the V39.17 family layer: PASS
- compact selector retains search + family-detail opening hooks: PASS

Browser rendering is not claimed as tested in this patch.
