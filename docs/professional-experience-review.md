# Professional purchasing experience — revised review scope

The approved homepage hero is restored with its original Healthcare procurement for institutions copy, actions and background composition. Intelligent search and the existing-list/RFQ path sit directly below it, followed by compact clinical categories, the procurement journey and returning-account access. Homepage basket promotions and the newly introduced blood-pressure-monitor hero image are removed.

No decorative eyebrow/kicker text is used. The previous global removal rule again applies to the new experience. Functional preview/approval labels remain near the information they qualify. The compact native public/mobile navigation and account routes are preserved.

Procurement previews now address institutional purchasing tasks: Clinic opening & fit-out, Clinical consumables restock, and First-aid points & refills. Their discovery cards use a coherent series of AI-edited editorial task scenes incorporating Braun, WOLAID and 3M Nexcare catalogue brand examples alongside useful scope information. Scene assets are separate from product photo bindings, retain their full 3:2 compositions, and explicitly illustrate a task rather than prove exact contents. No generated image is used as an exact SKU/component photograph. Exact product photographs remain on actual catalogue/detail and component lines. These previews do not promise complete clinic compliance or replace a site-specific requirement list.

## Ready basket contract

- `current/behaviour/ready-baskets-data.js` contains planning templates, separate from the product master and pricing. Every shipped pilot is `PREVIEW`, with no approval evidence.
- Exact product records are resolved at runtime from their original SKU. Requirement records retain their raw requirement ID, selling basis, DHA reference/status/condition and the existing local-family request snapshot. Missing exact components use the existing unlisted requirement path with no invented product SKU or foreign key.
- Setup and replenishment are modes of one selection, not new inventory items or subscriptions. Replenishment excludes capital equipment. Components can be excluded and quantities edited. No medicine is automatically selected or accepted by this basket mechanism.
- First-aid refill lines are initially unselected in setup mode until existing container contents are checked; replenishment excludes the container. Site-specific requirements and additional stock gaps remain explicit optional quotation lines. All quantities start at one requested unit, not an assumed site consumption rate. A proven included-component relationship suppresses duplicate selection only when it identifies the exact current component and base-kit fingerprints, source, reviewer, review date and UAE market.
- Alternative variants appear only with explicit compatible-base identity and exact-member approval evidence. No compatibility follows from a shared family/category. There are currently no approved alternative choices in the pilot data.
- A `VERIFIED` template requires template approval/source/reviewer/date/UAE market and exact-member evidence for every component. Manufacturer information alone is not clinical suitability or PSC approval. Product-information work continues through its existing field approval adapter; this feature does not add another product-facts schema.
- One native application adapter validates the entire selection and quantity limits before a single draft update. Repeated exact identities consolidate through the existing request key; different identities remain separate. Preview review notes persist on draft lines and flow into the existing request submission note. They do not authorize procurement.

## Review and approval gaps

The three concepts need qualified review of site scope, suitability, kit contents, exact specifications and required versus optional components before being presented as verified combinations. Missing photographs remain missing or explicitly illustrative. No basket price, stock promise, delivery guarantee or clinical approval is invented.

No source master, product/price projection, photo binding, DHA asset/mapping, database schema or production record is changed. Existing retail-reference/wholesale-quotation rules and account access boundaries remain authoritative. This is a feature-branch draft for review; production deployment is outside this change's authorization.

## Validation

- `node --test tests/shell.test.mjs tests/variant-evidence.test.cjs tests/catalogue-stock.test.cjs tests/catalogue-refresh-identity.test.cjs tests/intelligent-search.test.mjs tests/storefront-groups.test.cjs tests/photo-subject-fit.test.cjs`: 37 checks passed.
- `node tests/ready-baskets.mjs`: three previews, evidence rejection, exact identity/pack, kit suppression, atomic rejection, optional exclusions, replenishment, saved draft and existing submission path using an isolated transport passed.
- `node tests/professional-experience-browser.mjs`: 320/390/768/1440 customer journeys passed, covering the restored hero, no decorative eyebrows or homepage basket promotions, working search, native menus, sign-in resume, persisted editable request, institutional basket review, RFQ form, history/reorder and anonymous search/category handoff. No horizontal overflow or page errors.
- Historical pre-revision validation: existing professional catalogue/submission, category grid, navigation, disclosures, photo framing, account continuity, operating journey, intelligent search and search acceptance checks passed. Real backend writes and customer/supplier sends are not part of these tests.

The rejected earlier design and its screenshots are preserved as historical versions. Revised desktop/mobile captures and QA are retained in the private execution package; CI uploads test screenshots as review artifacts. The feature continues on `feature/professional-catalogue-ui-20261016` from current main, retaining the newer navigation, disclosure hierarchy, storefront identities and image corrections.

## Customer portal home redesign

The signed-in home now leads with the native intelligent catalogue search and an existing-list/RFQ entry. Its next-action section prioritises available quotations before newer delivery/processing updates, using only the current site's real visible records. It offers view/review links without creating new approval powers. Empty accounts display an honest empty state.

A saved request replaces the RFQ panel with exact current draft lines/packs, requested units and a Continue your request action. Existing site-specific draft persistence remains authoritative. Reorder and Documents show real account context or explain when records become available. The current account/site remains visible on mobile; there is one prominent search surface on this route, with the native header request and account controls retained.

The three existing basket previews reuse the same registry, image assets, approval gates and atomic adapter in compact cards. Both clinical-category groups and all three DHA marks/conditional descriptions remain. Seven Workshop modules have been removed from the portal home and replaced by three compact guidance links; the full Workshop and all seven modules retain their existing routes.

Before/after real-font captures show the live-like fixture at1440px reduced from2134px to1797px total height, and390px from4354px to2374px. These are repeatable viewport measurements, not a guarantee for accounts with different data. New journey tests cover active/empty accounts at320/390/768/1440, quote priority, exact saved drafts, switching sites, request details, RFQ entry, search, baskets, reorder, documents and guidance, with zero backend writes. Existing category/DHA/disclosure, account/navigation and16 role/viewport layout checks pass. No new backend schema, source data, pricing or production deployment is included.

## Portal visual refinement

Portal category shortcuts now reuse the existing public clinical artwork (wounds, breathing, vitals, medicines, equipment and infection control) instead of new line drawings. Utility actions reuse existing search, request, order and document artwork. The three DHA mapping marks remain separate and unchanged. No image assets or product-photo bindings are altered.

Repeated Preview/review-before-quotation card captions are removed from both full and compact basket discovery. The action is View basket. All template records remain PREVIEW, and contextual preview text, specification review and approval gates remain in the basket flow; no evidence status is promoted by removing repeated presentation copy.

The portal distinguishes its tasks through a cool RFQ/draft panel, a pale green current-activity area, basket photography on white, warm clinical-category surfaces and a dark green guidance section. Styles remain scoped to the customer home. Original public hero, routes, account/site controls, exact request identities, prices, source masters and production remain unchanged. Eight active/empty account journeys, five-width category/DHA/keyboard checks and isolated basket tests pass. Desktop/mobile screenshots use isolated sample accounts.
## School collection theme correction — 19 October 2026

School collections now use the established catalogue tokens, content gutters, lighter heading weights, 8px controls and restrained surfaces. The independent outer panel and nested group/kit frames are removed. Opening groups use the shared disclosure glyph without duplicated icons or blurred previews; mobile collection choices use readable full-width rows. Packs and proposed quantities have their own quiet secondary line. No dataset, SKU/pack value, price, image, DHA rule or request snapshot changed.

Focused validation: four-width public/portal collection and all-five-kit journeys, exact snapshot submission through isolated transport, five-width clinical categories/DHA/keyboard checks, shared basket/evidence tests and seven shell/registry/build checks pass. Desktop/mobile rendered metrics and before/after captures retained privately.

