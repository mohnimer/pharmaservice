# PSC V50 — Workshop stability + full design rebuild

This patch addresses the issues visible in the 7 Oct review screenshots.

## What changes

- Workshop is rendered natively by `app.js`; the previous V45 mutation-based Workshop router is removed from the page load.
- Seven Workshop Modules become real native routes instead of DOM rewrites.
- Deep Workshop URLs receive Vercel SPA rewrites, fixing the direct-route 404.
- Path routes take precedence over stale hashes, preventing a Workshop URL from being hijacked by an old portal/preview hash.
- The Workshop hub is rebuilt around 4-column compact Module cards, three featured guides, search and a collapsed full guide index.
- Article typography is reduced to editorial scale; the giant headline treatment is removed.
- Article pages use a compact Module breadcrumb, useful metadata, short content sections, optional readiness chain / action treatment, and the three Workshop signature modules.
- Related catalogue products are now manual/exact links only; fuzzy product matching is removed.
- The oversized boxed Workshop principle becomes a compact editorial rule strip.
- Product-card `Details` / `Request` actions lose the stray separator line and gain more breathing room.
- Mobile / tablet layouts are included.

## Routes

- `/workshop`
- `/workshop/product-basics`
- `/workshop/whats-the-difference`
- `/workshop/clinic-checks`
- `/workshop/equipment-readiness`
- `/workshop/stock-expiry`
- `/workshop/school-clinic`
- `/workshop/ordering-specifications`
- `/workshop/<guide-slug>`

## Apply

Copy this package into the root of the current `mohnimer/pharmaservice` checkout and run:

```bash
python tools/apply_v50_workshop.py
node --check app.js
node --check v50-workshop-gate.js
```

Then review the diff before deployment. The patcher creates `_v50_backup/` first.

## Why this is a stability patch, not just CSS

The current build renders Workshop in base `app.js` and then lets `v45-workshop-modules-gate.js` rewrite the rendered DOM through a `MutationObserver`. Navigation to Workshop Module/guide URLs can also cause full page loads, while Vercel currently has no Workshop rewrite. V50 removes that competing Workshop renderer and makes the route + view deterministic.

The other site-wide visual overlays are left untouched in this patch to avoid redesigning unrelated areas. If the older-preview issue persists outside Workshop after V50, the next cleanup should consolidate the V44–V48 mutation layers into native render components rather than stacking additional observers.

## Baseline inspected

This patch was prepared against the current public `mohnimer/pharmaservice` main-branch structure inspected on 7 Oct 2026. Relevant blobs observed: `app.js` a16ce03d4eefe73991007f2eceaf0fede3383870, `index.html` 4f2244b0f33373ce4a98e10dcfabfa6c169b4539, `vercel.json` 20041cad5c1ea981690903878b9eb1edfd3fbad0, and the former Workshop mutation layer `v45-workshop-modules-gate.js` 0e8ae8b86da27f93f22b27980b96680844ca5d16.

The GitHub connection available in this session can read the repository but returned HTTP 403 when asked to create a branch, so this package is deploy-ready but has **not** been pushed or deployed.
