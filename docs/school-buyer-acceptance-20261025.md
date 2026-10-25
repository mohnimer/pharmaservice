# School buyer acceptance assessment — 25 October 2026

Scope: the working local draft, assessed against the user's seven requirements. Pass means demonstrated in automated and realistic isolated browser tests. It does not mean a real nurse pilot or production release has occurred. Baseline: 7c5f7b6f16d2d859e4d5e10ac775c73e4548d90f. Existing public catalogue, prices, images, source masters, DHA wording, production database and purchasing permissions are preserved.

| Requirement | Before | After fixes | Evidence and remaining boundary |
|---|---|---|---|
| 1. School nurse | Partial | Pass | Exact product and 50-strip pack selection, quantities, editable RFQ, device-local draft resume and campus notes demonstrated at 320/390/768/1440. Saved drafts are browser/device-local, not promised as cross-device sync. Real nurse ease/speed remains Unverified. |
| 2. Replenishment / repeat | Pass | Pass | Reuse prior lines, remove unavailable sourcing reference, adjust quantities, add exact product and submit new RFQ; original transaction unchanged. Old price/stock claims removed, missing historical packs not borrowed from today's catalogue. |
| 3. Product confidence | Partial | Partial | Catalogue products and sourcing references distinguished; field-level evidence discipline retained; absent manufacturer documents shown as missing. Complete accurate specifications/supporting documents are unavailable for some catalogue records and cannot be invented. Existing clinical/identity decisions remain open. |
| 4. School administrator | Partial | Partial | Issued lines/revision/currency, clear recorded status, files and decisions demonstrated. Removed direct card approval and delayed parallel status writer; decisions bind to reviewed revision and reject expired/incomplete quotes. Real named authority roster, actual issued records/private files and server release controls still require production-safe validation. |
| 5. Management | Partial | Pass | Existing authorized group scope only, campus/date filters, responsive activity and explicit switch/open request. Prior campus draft retained; other-campus document isolation and foreign-user draft exclusion demonstrated. No new membership or purchasing power granted. Live tenant pilot remains Unverified. |
| 6. Connected journey | Partial | Partial | Request, quotation, authorization evidence, recorded order stage and documents are linked in one context. Record is expandable, not a new dashboard. Real authorization-to-funded-order-to-delivery journey remains subject to authority, commercial release and actual transaction evidence; fixtures do not establish live completion. |
| 7. Commercial / regulatory safeguards | Fail | Fail | Draft rejects stale revision decisions, suppresses unsupported facts/statuses and uses existing audited decision RPC. Known deployed non-AEG visibility-based approval and direct financial-column exposure remain unfixed in production. Restrictive named-approver and issued-only privacy corrections are prepared and tested separately; not applied. |

Result: **3 Pass, 3 Partial, 1 Fail**. Separately **Unverified**: actual staff usability/time savings, actual phones/tablets, real customer private-file access and full production purchasing/release behavior. These are not silently promoted to Pass.

## Fixed during this assessment

- Removed direct approval controls from live request cards; exact quotation must be opened and reviewed. No increase in purchasing authority.
- Bound the decision RPC to the quotation ID/revision actually displayed. A newer server revision cannot be silently approved. Missing/expired validity, incomplete quantities/prices/tax/packs and existing decisions block the decision UI.
- Removed the delayed legacy quotation-status and event writer. A decision now follows one existing audited RPC path; it does not create a PO or release procurement.
- Prevented an unordered older quote or draft replacing the latest issued quotation. Display currency follows the issued record instead of an automatic AED prefix.
- Added compact recorded request/authorization/order/document context, refresh and document navigation. The detailed record is expandable; quotation remains first. Bank details are collapsed.
- Added authorized campus/date filters and explicit campus-request drill-down; preserved the original campus draft. Mobile rows retain campus/reference/status/action instead of hiding columns.
- Added honest product evidence/missing-document states for portal details; existing facts/photos/packs/DHA records unchanged.
- Failed history loading shows a retry state instead of an empty/current-looking cached history. Draft remains available. Signed-document failures close the empty tab and report failure.
- Removed duplicate View/Track actions and repeat shortcut; labelled repeat as a request, not an automatically placed order.
- Removed invented delivery-date fallback and timing-confirmation wording. Archived raw status is retained without inferring cancellation/delivery evidence.

## Verification

- Nine pure buyer-journey tests PASS: exact historical identity/pack retention; historical option reference handling; missing packs; genuine zero vs missing quote values; authority boundary; expired/incomplete/revision decision gates; latest issued quote choice; no inferred authorization/payment.
- Four-width original buyer browser suite PASS: repeat/edit/remove/add exact 50-strip product/new RFQ; historical immutability; issued quotations; signed fixture document; list with no fabricated SKU; campus/draft isolation and public query allowlist.
- Four-width assessment suite PASS: connected record, authorized campus filter/switch/open, preserved notes, failed-load recovery, honest evidence gaps, denied-file tab cleanup; stale revision rejected, reviewed revision sent, correct currency and no independent quotation/order/event writes.
- Portal-home active and empty cases PASS at all four widths: search/list upload/collections/repeat/document routes and draft/campus continuity.
- Existing DOM suite and customer-invitation PostgreSQL RLS suite PASS. These include demo isolation, navigation/history, cross-school denial, named approval, private credit records and no automatic credit.
- Isolated named-approver proposal PASS. Isolated privacy proposal PASS: customers cannot directly read quote headers/lines; issued-only allowlisted projection; exact packs; anonymous/unverified/other-campus denial; scoped decision reads; PSC admin full read/edit retained.
- Build, syntax and Git whitespace checks PASS. Screenshot review exposed an overlarge record panel; replaced with compact disclosure before final capture.

Tests use synthetic accounts/documents or isolated PostgreSQL. No live orders, messages, approvals, stock/pricing changes or permission updates were made. Raw backend read-only audit and screenshots remain private under outputs/school_buyer_20261025.

## Prepared server corrections — explicit activation gate

See staging/buyer-permissions-20261025/REVIEW.md, named-approval-proposal.sql, private-quotation-proposal.sql and customer-reader-proposal.mjs. They are NOT migrations applied to a project and are NOT loaded by the runtime manifest. Privacy activation needs the paired customer RPC reader, real-schema rehearsal, existing admin issue/revision checks and separately authorized rollout. Current frontend allowlisting is not a security boundary; modified clients remain a known deployed risk until the server correction is applied. Do not deploy this draft as a claimed fix for that risk.

## Next exit conditions

1. Mohamed supplies/reviews the actual purchasing-authority roster; separately review the named-approver restriction and privacy/transport changes against the current real schema and policies.
2. Rehearse and authorize server activation, verify direct API denial plus admin quotation issue/revision/decision and private-file access. Do not restore broad sensitive customer reads as a rollback shortcut.
3. Obtain the missing exact product/manufacturer documents and clinical/identity decisions where required; retain sourcing-only states until then.
4. Run representative nurse/admin/group tasks on actual devices with approved accounts, then a controlled genuine commercial workflow. Record failures/time/corrections; do not invent success metrics.
5. Only then seek explicit merge/deployment authority. No deployment is included in this assessment.

## Release authorization addendum — 25 October 2026
The user subsequently instructed deployment after fixes. The privacy proposal was promoted into a two-step release, retaining the same request/quote model: additive `20261025000100_buyer_issued_quote_reader.sql`, then restrictive `20261025000200_buyer_quote_privacy_and_named_authority.sql` after the frontend uses the customer-safe RPC. PSC admin reads remain on existing tables. No memberships are assigned or expanded. Live metadata inspection found no named management approvers, so the formal PO/written-authorization route remains the customer path. This removes the need to invent an authority roster to release a safe read/request experience.

The earlier Fail findings describe the assessed pre-release production baseline. They can change only after recorded migration and live verification receipts; a synthetic pass does not itself close them. Product-document completeness, actual staff/device usability and the full genuine commercial workflow remain explicitly Partial/Unverified after technical deployment. See the private release receipt for actual activation and production version, rather than treating this addendum as proof of release.
