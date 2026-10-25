# School-clinic buyer experience — implementation map

## Baseline verified before implementation

Production `pharmaservice.ae`: Vercel deployment `dpl_92pgTwNQCSb2hPorgXcY3tE7reif`, READY, main commit `26407991feb9d854c6ce4acda72cb9262d99b35d`, checked 25 October 2026. Dedicated branch `feature/school-clinic-buyer-experience-20261025` starts at this production commit. The unrelated price/stock proposal in PR61 is deliberately excluded.

| Journey | Actual evidence | Classification | Smallest useful change |
|---|---|---|---|
| Product discovery/specification | `app.js` catalogue, intelligent search, family details; exact option/request tests | Already working; field verification remains conditional | Retain catalogue, images, exact packs, facts and mappings |
| School collections | `school-baskets.js`: opening, replenishment, first-aid; existing collection tests | Working previews with explicit applicability limits | Link to existing collection routes; preserve contents |
| Saved request | `save`, `hydrateAccount`, per-school basket map, draft undo | Working locally; account boundary incomplete | Bind persisted draft owner to authenticated user; preserve per-site drafts and notes; show current site in review |
| Repeat request | `reorderRequest` blindly copies lines; normal hydrated lines retain only SKU/quantity; hidden unknown lines filtered from basket | Partially implemented | Retain original description/brand/pack snapshots; new editable RFQ draft; unavailable/changed identity becomes an unresolved sourcing line, no substitute |
| Saved frequent items | Existing Wishlist scoped to user/site | Working but less discoverable | Reuse Wishlist in portal task links; no inventory subsystem |
| Existing list | Existing custom request/paste pathway and request-source upload capabilities vary | Partially implemented | Preserve typed sourcing requirements and quantities; do not pretend automatic file interpretation exists |
| Quotation | `schoolQuote`, `calcQuote`, `loadOrdersFromDatabase`; issued quote-lines table exists | Partially implemented | Use issued quote-line values and revision/terms, not catalogue fallback or original request quantities; missing values stay pending |
| Purchase authorization | Deployed RLS/functions inspected read-only; AEG named approver; non-AEG helper currently grants approval by site access | Requires separately reviewed permission decision | No new approval grants. Keep explicit formal authorization route where authority is not established; stage restrictive server proposal separately |
| Documents | Existing metadata table plus private bucket and 60-second signed retrieval; RLS on order/campus folder | Working but difficult to discover | Group real files by request/campus, filter real types, link to request; no fake downloads or document packs |
| Group visibility | Existing verified group-wide school visibility; current UI loads only selected campus | Missing convenient oversight | Lightweight authorized-site activity on existing request page; changing view never changes the active draft/campus |
| Lifecycle/status | Existing DB/UI mapping tracks request/quote/authorization/process/delivery | Working but ambiguous labels | Use evidence-backed stage labels; no invented acceptance/payment/completion |
| Real customer purchase | No representative-user/device evidence collected in this task | Needs human pilot | Record pilot tasks and metrics without fabricated baselines |

## Current → proposed flow

Sign in → selected campus/search → exact product/pack → saved request → submit RFQ → quote/history → scattered files → delivered-product replenishment.

Sign in → selected campus + continue/search/repeat/saved items → exact product or explicit sourcing requirement → review quantities/site and saved note → submit new RFQ → issued quotation with actual revision/lines/terms → grouped genuine documents → repeat retained historical requirement with current availability caveats.

Group users retain the same portal and active-campus purchasing draft. Authorized cross-campus activity is a read-only filter, not a new dashboard or permission.

## Release boundaries

No catalogue/master/stock/price/image/DHA changes, production database writes, permission deployment, live orders, communications or merge/deployment are authorized. Account records and supplier economics remain private. Any separately staged permission change requires approval and isolated tests before deployment. Browser fixtures prove software behavior, not actual customer adoption or a completed purchase.
