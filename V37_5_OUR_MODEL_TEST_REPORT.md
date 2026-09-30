# V37.5 Our Model rewrite — test report

## Scope
Cosmetic and copy-only rewrite of the public **Our Model** page. No catalogue, Workshop, authentication, demo, order, quote, Supabase or portal data-flow code was intentionally changed.

## Checks completed
- `app.js` JavaScript syntax passes `node --check`.
- Stylesheet opening/closing brace count matches after the new page-specific style block.
- Dynamic Our Model route contains the new hero, real-world examples, practical sourcing explanation, account-continuity section, category-specific checks, school-clinic section and regulated-route language.
- Static `our-model.html` SEO/fallback page was rewritten to match the new positioning and metadata.
- Existing `schoolWorkshopStrip()` integration remains on the dynamic Our Model page.
- Existing public CTAs continue to use current route handlers (`catalogue`, `contact`).

## Copy boundary
The new page describes product/supply considerations and commercial controls. It does not diagnose, prescribe, claim regulatory approval, or represent conditional regulated products as universally available.
