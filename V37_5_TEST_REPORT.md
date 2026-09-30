# V37.5 Test Report

## Scope
Workshop visual/navigation update only. No Supabase schema or write-path changes.

## Checks
- JavaScript syntax: pass.
- Workshop category navigation: seven category cards + View all.
- Search/filter state: reuses existing `data-workshop-category`, `data-workshop-q`, and reset handlers.
- Article routes/content model: unchanged.
- Catalogue → Workshop integration: unchanged.
- Workshop → catalogue related products: unchanged.
- Mobile: 2-column category navigation down to 351px, 1-column below 350px.
- Decorative post-it/slogan copy: not introduced; legacy landing issue-line removed from render.
- No Workshop Supabase writes added.
