# V50 consolidation review

Branch: `v50-consolidation`. Production/main has not been changed.

## Review deployment and publication status

Preview: https://pharmaservice-9v76p88nm-mohameds-projects-9022ad5a.vercel.app

Vercel reports deployment `dpl_5LLEZCQgLKTC18ycgpwTNjbHAWok` READY, target `staging` (non-production). This is an API-created review deployment of the tested build, not a deployment triggered by a GitHub branch push. Its application JavaScript, stylesheet and shell are the exact tested build; unchanged images are served through preview-only rewrites to pharmaservice.ae. The repository build includes those images locally.

The preview requires Vercel authentication. Browser access reached the Vercel login page; the connector rejected temporary authenticated access with HTTP 403. Public browser smoke checks therefore remain incomplete. Protection settings were not changed.

GitHub publication is blocked: CLI push has no credentials and the GitHub connector rejected tree creation with `403 Resource not accessible by integration`. All changes are committed locally on `v50-consolidation`; neither remote branch changed. Both remote `main` and `v50-consolidation` were verified at `6f66ac122ced05ebe2abbebc1f7832e21191873c`. A verified git bundle accompanies this review for publishing from an authorized checkout. Automatic GitHub Preview deployment cannot be confirmed until the branch is pushed; vercel.json supplies the explicit build, output directory and route configuration.

## Architecture

`index.html` is the only HTML shell. The build emits `current.js` and `current.css` from the explicit current-source manifest, preserving the required execution and cascade order. One router in `app.js` owns navigation. Catalogue gating delegates to it. One shared native DOM observer in `current/lifecycle.js` dispatches scoped feature notifications.

Required feature code is absorbed into purpose-named `current/behaviour/` modules and styles into `current/styles/`. Original version files are retained as historical source, but are neither loaded nor build inputs. This is functional consolidation, not a visual redesign. CSS selectors and the ordering of proven layout rules are deliberately preserved.

The V50 Workshop renders natively in `app.js`; its seven module definitions are included, modules have metadata, and the V45/V49 competing Workshop renderer is absent. Clean Start and Workshop routes refresh into the same shell. Old HTML bookmarks redirect to the current application's routes. Archived HTML, scripts under assets, patch utilities and SQL are not published.

## Safety changes

Demo state is in memory, separate from persisted live browser state. Local requests and quote decisions stay isolated by site, survive internal navigation/site switching and reset on refresh. The absorbed quote persistence listener now rejects demo customer decisions before scheduling or writing; tests originally caught a real quote-update attempt in this listener. Core order/custom-request persistence and public enquiries also reject or simulate demo operations. Demo accounts cannot access admin routes.

No schema, migration, Supabase configuration, API key, or production data changes were made. Tests use mocked backend transport, not live accounts. RLS/security of the production database has not been re-audited by these client tests.

## Current feature sources retained

| Source group | Preserved function |
| --- | --- |
| app.js, data.js, core60-regulatory.js, site-copy.js, workshop-data.js, supabase.js | Core routes, forms, account/order workflows, product and editorial data, existing Supabase connection |
| current/behaviour/catalogue-* and family-* | Classification, family/option detail, request configuration, grid and access controls |
| current/behaviour/contact-* and start-interface | Enquiry and Start flow |
| current/behaviour/admin-quote-persistence | Existing live quote persistence and document/event integration, now demo guarded |
| current/behaviour/home-*, model-*, procurement-interface | Existing V50 home and model appearance/behaviour |
| current/behaviour/*search* and product-images | Search, image fallbacks and account search |
| current/behaviour/system-*, interface-*, public-* and interaction-feedback | Existing visual treatments, navigation and interaction effects |
| current/styles/*, styles.css | Preserved visual rules compiled into one current stylesheet |

Internal feature modules still use established DOM enhancement functions and versioned CSS class names. They no longer independently create native observers or load old version assets. Further removal of overlapping style rules or rewriting those functions should require visual comparison; it is not asserted safe by DOM tests alone.

## Safe historical removal

After preview review, `history/entry-points/` and the original source files in the mapping below may be removed without affecting the current build or runtime. Keep `current/`, core unversioned source/data, assets, build tools, package files and deployment configuration. Do not delete SQL/migrations or operational records on the basis of runtime exclusion.

The historical `tools/apply_v50_workshop.py` and `workshop-v50-block.txt` can be retired together with the original V50 patch assets after review. The tool refuses to reapply a patch to the consolidated shell. For future changes, edit the current source and run the build.

| Historical source no longer required | Current replacement |
| --- | --- |
| v44-7-catalogue-update.js | current/behaviour/catalogue-data-extension.js |
| catalogue-v25.js | current/behaviour/catalogue-classification.js |
| catalogue-family-v39.js | current/behaviour/family-data.js |
| v39-20-architecture-fallback.js | current/behaviour/catalogue-architecture.js |
| family-layer-v39.js | current/behaviour/catalogue-families.js |
| family-detail-v39.js | current/behaviour/family-details.js |
| v39-18-fixes.js | current/behaviour/catalogue-detail-controls.js |
| v39-22-front-polish.js | current/behaviour/public-interface.js |
| v39-24-model-walkthrough.js | current/behaviour/model-walkthrough.js |
| v39-26-workshop-contact.js | current/behaviour/contact-and-editorial-data.js |
| v39-27-contact-fix.js | current/behaviour/contact-form.js |
| v39-28-start-cleanup.js | current/behaviour/start-interface.js |
| v39-29-quote-persistence.js | current/behaviour/admin-quote-persistence.js |
| v39-32-site-microinteractions.js | current/behaviour/interaction-feedback.js |
| v39-34-home-community.js | current/behaviour/home-community.js |
| v39-37-copy-tweak.js | current/behaviour/public-copy.js |
| v39-38-no-eyebrows-model.js | current/behaviour/model-headings.js |
| v43-our-model-procurement-ui.js | current/behaviour/procurement-interface.js |
| v44-full-system-redesign.js | current/behaviour/system-interface.js |
| v44-8-product-image-recovery.js | current/behaviour/product-images.js |
| v44-9-uniformity-polish.js | current/behaviour/interface-consistency.js |
| v44-10-refinement.js | current/behaviour/search-refinement.js |
| v44-10-4-portal-main-search.js | current/behaviour/portal-search.js |
| v44-10-6-catalogue-search.js | current/behaviour/catalogue-search.js |
| v45-2-home-catalogue-detail.js | current/behaviour/catalogue-card-details.js |
| v45-3-home-copy.js | current/behaviour/home-copy.js |
| v45-4-hero-vitals-fix.js | current/behaviour/home-vitals.js |
| v45-5-cleanup.js | current/behaviour/interface-cleanup.js |
| v46-our-model-visual-story.js | current/behaviour/model-story.js |
| v47-homepage-redesign.js | current/behaviour/home-layout.js |
| v48-system-visual-consistency.js | current/behaviour/system-theme.js |
| v50-workshop-gate.js | current/behaviour/catalogue-access.js |
| family-layer-v39.css | current/styles/catalogue-families.css |
| family-detail-v39.css | current/styles/family-details.css |
| family-options-v39.css | current/styles/family-options.css |
| grid-fix-v39.css | current/styles/catalogue-grid.css |
| v39-16-ui.css | current/styles/catalogue-interface.css |
| v39-17-model.css | current/styles/procurement-model-base.css |
| v39-18-fixes.css | current/styles/catalogue-detail-controls.css |
| v39-22-front-polish.css | current/styles/public-interface.css |
| v39-24-model-walkthrough.css | current/styles/model-walkthrough.css |
| v39-26-workshop-contact.css | current/styles/contact-and-editorial-data.css |
| v39-27-contact-fix.css | current/styles/contact-form.css |
| v39-32-site-microinteractions.css | current/styles/interaction-feedback.css |
| v39-34-home-community.css | current/styles/home-community.css |
| v39-38-no-eyebrows-model.css | current/styles/model-headings.css |
| v43-our-model-procurement-ui.css | current/styles/procurement-interface.css |
| v44-full-system-redesign.css | current/styles/system-interface.css |
| v44-9-uniformity-polish.css | current/styles/interface-consistency.css |
| v44-10-refinement.css | current/styles/search-refinement.css |
| v44-10-2-search-hotfix.css | current/styles/search-input.css |
| v44-10-5-hero.css | current/styles/home-hero-base.css |
| v44-10-6-catalogue-search.css | current/styles/catalogue-search.css |
| v45-2-home-catalogue-detail.css | current/styles/catalogue-card-details.css |
| v45-3-home-copy.css | current/styles/home-copy.css |
| v45-3a-mobile-hero.css | current/styles/mobile-home.css |
| v45-4-hero-vitals-fix.css | current/styles/home-vitals.css |
| v45-5-cleanup.css | current/styles/interface-cleanup.css |
| v46-our-model-visual-story.css | current/styles/model-story.css |
| v47-homepage-redesign.css | current/styles/home-layout.css |
| v48-system-visual-consistency.css | current/styles/system-theme.css |
| v50-workshop-rebuild.css | current/styles/workshop-design.css |

## Validation

- `npm run build`: PASS; only one HTML, one local application JS, one CSS; product/media assets retained.
- `npm test`: PASS (3 automated tests covering manifest/output isolation, repeatable build/syntax and HTTP deep-route/redirect behaviour).
- `npm run test:dom`: PASS; actual built current application scripts executed in Happy DOM with mocked Supabase. Workshop hub/modules/articles, search/no results/clear, save/print/share, history, direct deep routes; homepage, Start, About, Our Model, Contact, login; public category gate and login resume; portal sections, product family details/request; demo site switch, simulated order, quote confirmation/cancellation, custom/public requests, refresh reset and live storage isolation; public/portal mobile menu controls. Zero backend writes for tested demo flows.
- Browser/visual suite: NOT RUN successfully locally. Chromium launch is denied by environment socket permissions. `npm run test:browser` is included for a supported environment. Pixel equivalence, real browser mobile layout, live login and live backend transactions remain review gates. No claim is made that DOM checks prove those boundaries.

## Review commands

```sh
npm ci
npm run build
npm test
npm run test:dom
npx playwright install chromium
npm run test:browser
node tools/serve.mjs
```

Do not merge into main until the user has reviewed the Vercel Preview and outstanding browser/visual checks have passed.
