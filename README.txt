PSC V33 — Exact Canva Cards + DHA Icon
======================================

Replace / upload:
- app.js
- styles.css
- assets/dha-requirement.png

This version intentionally changes ONLY the product-card/product-detail presentation from V32.

Exact changes:
- Removed textual "DHA REQUIREMENT" label from product cards.
- The exact user-supplied DHA PNG is used AS-IS on every DHA-mapped product.
- DHA icon appears top-right over the product image / colour placeholder.
- Same DHA icon also appears in the mapped product detail view.
- Every desktop product card is locked to the same height and internal dimensions.
- Image area is the same size on every card.
- Product title uses the same font size/weight and max two lines on every card.
- Pack and primary clinical need use fixed rows.
- Details is the outlined secondary button.
- Request is BLACK on every card.
- Product detail Request button is also BLACK.
- No teal request button remains in the card/product-detail treatment.
- No database/Supabase changes required.

Important:
Upload the included dha-requirement.png into the repo's assets folder so this exact supplied image is displayed.

V35
---
- Public website header background now uses exactly the same #fbf8f1 page colour as the section beneath it.
- Sticky/scrolled header keeps the same colour.
- Removed the visual white header block; retained only a subtle bottom divider.


V36 — Institutional Product Master v2.2
---------------------------------------
- Supabase institutional master is now the 260-line Product Master v2.2 uploaded by PSC.
- Only INST-0001 through INST-0260 remain active customer listings.
- Legacy PSC-* records are archived/inactive for transaction history and no longer appear as listings.
- Admin Product Master and MASTER metrics now show active products only (260), not archived records.
- Institutional storefront publishes exactly 260 master lines; wholesale remains draft/hidden until curated.
