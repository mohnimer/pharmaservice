# PSC V37.4 — Workshop + Hero Backdrop

## What changed
- Added the user-supplied clinic image as the real homepage hero background, optimized to WebP.
- Added **The Workshop** as a first-class public navigation destination.
- Added `workshop-data.js` as the single reusable content source for Workshop guides.
- Added 10 launch guides with reusable article sections, signature modules, related products and medical/regulatory footer.
- Added editorial landing page, category filters, search, empty state, Save / Print / Share controls and mobile/print styling.
- Added quiet **From The Workshop** links to relevant catalogue cards and product detail modals.
- Added a restrained homepage Workshop index and **Useful in your clinic** strip under the school-clinic audience area in Our Model.
- Added clean-route application shells for `/workshop` and each `/workshop/[slug]` path.
- Updated sitemap and static public-page navigation.

## Routes
- `/workshop`
- `/workshop/which-glove-should-i-actually-wear`
- `/workshop/sterile-vs-non-sterile-not-quality-grades`
- `/workshop/three-ply-mask-isnt-a-specification`
- `/workshop/disinfectant-contact-time-trap`
- `/workshop/pulse-oximeter-number-can-mislead`
- `/workshop/bp-monitor-check-the-cuff`
- `/workshop/forgotten-glucose-meter-test-control-solution`
- `/workshop/oxygen-cylinder-is-not-an-oxygen-system`
- `/workshop/aed-has-expiring-parts-too`
- `/workshop/ten-minute-school-clinic-stock-expiry-walk`

## Content storage / editing
Workshop content is currently static/local in `/workshop-data.js`.
Each guide is one object using the reusable fields requested in the brief, including slug, title, format, category, excerpt, read time, review status, sections, signature modules, related product/category links, tags, sources and publication status.
No external CMS or dependency was introduced.

## Safety / data boundaries
- Workshop search/filter/navigation performs no Supabase writes.
- Save is browser-local only (`localStorage`, key `pscWorkshopSavedV1`).
- Print uses the browser print flow.
- Share uses the Web Share API when available, otherwise clipboard copy.
- Existing order/quote/demo data paths were not modified by Workshop code.
- Direct product links remain education-first; Workshop pages do not contain Buy Now flows.

## Validation performed
- `node --check app.js` — passed.
- `node --check workshop-data.js` — passed.
- Desktop Workshop landing rendered with 10-guide editorial index — passed.
- Search by title/tag (`glove`) — passed.
- Equipment Readiness category filter — passed.
- Article rendering + three signature modules — passed.
- Save / Print / Share controls present — passed.
- Catalogue renders relevant From The Workshop links — passed.
- Homepage hero CSS references optimized V37.4 supplied-image backdrop — passed.
- Mobile Workshop landing and article rendering — passed.
- Browser render smoke tests returned no page JavaScript errors in the test harness.
- Clean route shells exist for landing + all 10 articles; route handling supports browser `popstate` and existing hash routes.

## Deferred Phase 2
- Professional/source review and source/version records for every medical/technical guide before treating articles as finalized clinical/regulatory reference content.
- Admin CMS editing/publishing workflow for Workshop.
- Context-sensitive portal recommendations based on real asset/consumption/expiry data.
- More technical illustrations / exploded diagrams.
- Server-side user bookmarks instead of browser-local Save.
- Additional printable one-page CHECK THIS templates.
