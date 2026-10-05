PSC V39.32 — SITE-WIDE MICRO-INTERACTIONS ONLY

WHAT THIS PATCH DOES
- Restores the original Pharma Service home hero by removing the V39.31 hero override.
- Keeps all prior V39.28 / V39.29 references intact.
- Adds a dedicated site-wide interaction layer without replacing app.js or styles.css.

INTERACTIONS ADDED
- restrained hover lift and press feedback on buttons
- consistent keyboard focus rings
- subtle input/select focus feedback
- gentle hover feedback on catalogue, family, Workshop, contact and portal cards
- tiny product-image movement on card hover
- checkbox/radio confirmation motion
- modal, drawer and toast entrance motion
- route-change page settle/fade (only on actual navigation, not search/filter rerenders)
- loading spinners + busy labels for meaningful async actions
- upload feedback on document/media uploads
- short "Added" confirmation on add-to-request actions
- subtle table/list row feedback

IMPORTANT
- The home hero is NOT touched by V39.32.
- Old V39.31 hero asset files may remain in the repository; they are harmless because index.html no longer loads the V39.31 CSS/JS.
- Do not replace app.js or styles.css.
- Upload the three files in this patch to the repository root.
