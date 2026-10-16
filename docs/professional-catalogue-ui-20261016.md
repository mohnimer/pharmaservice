# Professional catalogue UI — 16 October 2026

Branch: `feature/professional-catalogue-ui-20261016`.
Base: `d1587435fb90f742efd52fe9bfe8680a7348db9e` (latest main at checkout).
Scope: presentation, exact selection and the existing Supply Request. No product-data, schema, supplier-report, homepage, Workshop or production changes.

## Implementation

- Active V50 manifest and router retained. Older V39 modules are historical absorbed sources; edits use their active `current/` equivalents.
- One presentation helper owns category profiles, conservative facts, verified-document links and accessible quantity controls. It reads existing exact identity/pack/model fields. It never uses search-enriched or AI-inferred medical data for professional facts.
- Five layouts prioritize pharmaceuticals; supplements; consumables; devices; capital equipment. Ambiguous categories use generic facts. Future source-verified fields can be rendered without another catalogue or database write.
- `professionalInformation` is an optional presentation input, not a schema migration or a newly populated dataset: `status: VERIFIED`, `source`, one of `pharmaceuticals/supplements/consumables/devices/capital`, `fields`, and `verifiedFields`. Unverified fields are omitted. Documents additionally require their own verified flag, source and HTTPS URL. The product-information team remains responsible for the actual approved data contract and content; an adapter can consume that team's final output without changing records.
- Family checkbox grids replaced by a single exact option selector. Exact pack, strength/form/model identity and local/reference option IDs remain in request snapshots. Reference-only IDs never become procurement foreign keys. Requesting another specification creates a sourcing preference, never an invented SKU.
- Direct exact products retain their stable SKUs; same-family exact products remain accessible in Details. One already verified exact family option is selected automatically.
- Quantity starts at one; integer bounds 1–10,000; buttons and manual entry use the same control. Basket decrement stops at one; explicit Remove remains available. Repeated exact selections combine across direct-product, family and search entry points; different options and packs stay separate. Request feedback names the product and quantity. The existing RPC snapshot retains requested family IDs and local/reference option IDs through submission and history hydration, without treating them as procurement foreign keys.
- Cards have a single Details action. Family representative identity and pack remain visible beside the corresponding reference price; exact selection occurs in Details. DHA logo, reference and required/conditional/alternative distinctions are retained.
- Existing stock/MRP joins and non-Acorus pricing authority retained. Unpriced items say Request quotation. Exact-option availability requires dated option evidence or the existing exact stock projection; family availability never proves an exact selected option.
- Product styling consolidated in the existing `product-editorial.css`; obsolete family checkbox styling removed. Photo framing remains owned by `catalogue-photo-standard.css`. Three desktop columns, two tablet columns and one narrow-mobile column. Homepage and Workshop selectors are untouched.

## Verification

Local: repeatable production build; shell checks; exact identity/evidence/stock/image-policy/search tests; full bundled-app DOM flow; catalogue hydration; reference overlay/provenance; quantity/shared-basket regression. No live customer or supplier mutations.

The dedicated GitHub workflow runs the same isolated checks plus Playwright at 1440, 768 and 390 px, checking exact photographs, pack/request identity, quantity 10, sticky action visibility, grid columns and horizontal overflow. Existing photo-standard checks remain. Artifacts: `professional-catalogue-review` and the existing variant visual review. Local browser QA is unavailable in this environment because its supported browser-control skill is absent; rendered screenshots must be reviewed from CI before production approval.

Production is not authorized. Preview deployment and subsequent production approval remain separate.

## Preview and review record

Vercel preview: https://pharmaservice-git-feature-pro-6b0123-mohameds-projects-9022ad5a.vercel.app (existing Vercel authentication remains enabled).
Draft review: https://github.com/mohnimer/pharmaservice/pull/42.

Desktop, tablet and mobile product screenshots have been inspected. The corrected tablet scroll container keeps the request action visible. The existing customer-account/mailbox workflow passed, including portal/admin/Workshop layout checks, photo framing, sports photographs and the 194-binding photograph suite. The new tests additionally exercise exact-SKU merging across entry points, actual submission payloads against an isolated transport, and saved-request rehydration/reorder. Final per-commit CI results are attached to PR #42. No production release or workbook/data synchronization is part of this change.
