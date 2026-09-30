# V37.5.1 test report

## Scope
Cosmetic/editorial changes only: Workshop guide-card presentation and Our Model copy/layout.

## Checks completed
- `node --check app.js`: passed.
- Workshop route function remains present and continues to use the existing `PSC_WORKSHOP` data model.
- Workshop category filters and text search code remain unchanged.
- Workshop guide routes, article renderer, Save/Print/Share handlers and catalogue cross-links remain unchanged.
- Homepage Workshop teaser now reuses the Workshop guide-card component.
- Our Model remains on the existing route and legacy Who/What/How aliases still resolve to the same page through the existing router.
- No Supabase schema or migration changes were made.
- No order, quote, customer confirmation, demo isolation, site switching or storefront publishing code was changed.
- CSS brace balance checked after the new override block.

## Visual intent
Workshop guide cards now use a split editorial structure inspired by the supplied reference: restrained information at the top and a clean category-colour illustration area below. The visual uses existing PSC icons rather than stock images or generated product scenes.

Our Model deliberately uses smaller headings, more body copy, real product examples and plain-spoken institutional-supply language.
