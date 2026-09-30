# PSC V37.5.2 — Canva Hero Lock

## Change
- Replaced the previous programmatic homepage hero with the exact supplied Canva/PDF artwork.
- The PDF page was rendered at high resolution (3600 × 2025, 16:9) and stored as a lossless WebP asset so the typography, kraft card, barcode, spacing and artwork remain visually faithful.
- Desktop displays the supplied 16:9 hero artwork edge-to-edge beneath the existing PSC public header.
- Mobile preserves the same artwork without redesigning it; the hero remains horizontally pannable so the Canva composition is not distorted or re-typeset.

## Safety
- No catalogue, portal, quote/order, Workshop, auth, Supabase, demo, or routing logic was changed.
- No database migrations were added.

## Checks
- `node --check app.js` passed.
- Hero asset is present at `/assets/institutional-hero-canva.webp`.
- Source artwork remains 16:9 and is used without crop on desktop.
