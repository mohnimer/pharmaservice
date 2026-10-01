# V37.5.3 — Homepage Integration Polish

Scope: homepage only. The exact Canva hero from V37.5.2 remains unchanged.

## What changed

- Replaced the corporate/SaaS-style "Why this exists" and "How we control the work" blocks with a quieter editorial introduction grounded in real healthcare-supply details.
- Added a four-line technical ledger covering consumables, diagnostics, emergency equipment and regulated lines.
- Rewrote the clinical-need section headline/copy to sound more natural and useful.
- Restyled the clinical category cards to align with the pastel/editorial Workshop language.
- Pulled the Workshop teaser into the same grid/manual visual system used elsewhere.
- Replaced the black guided-tour promo block with a softer account-side explainer.
- Preserved catalogue, Workshop, portal, demo, order/quote and Supabase behavior.

## Hero lock

`assets/institutional-hero-canva.webp` and the `.canvaHeroExact` section are unchanged from V37.5.2.

## QA

- `node --check app.js` passed.
- CSS brace balance is zero.
- No application data functions or persistence code were changed.
