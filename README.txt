PSC V32 — Canva Product Cards + Header Fix
==========================================

Replace:
- app.js
- styles.css

Product card rebuild:
- Rebuilt to closely follow Mohamed's Canva reference.
- Uniform card heights and aligned image/body/action regions.
- DHA REQUIREMENT / LICENSED ROUTE sits above the image.
- Missing-image placeholder contains colour only.
- Product cards show:
  product title -> pack -> primary clinical need.
- Brand/source/internal SKU clutter removed from the card face.
- Details is the secondary rounded-rectangle action.
- Request is the black pill primary action and adds the item to the request/cart.
- Real product images remain object-fit contain on white.
- Legacy price/request-quote row removed from these cards.

Header fix:
- Solid warm-white background retained behind the portal header.
- Logo is plain, with no tablet/capsule around it.
- Search remains centred.
- Account / notification / cart stay aligned on the right.
- Header is sticky, non-overlapping, and above the clinical-needs scroller.
- Responsive mobile layout keeps logo/search/actions separated cleanly.

No Supabase/database migration is required.
