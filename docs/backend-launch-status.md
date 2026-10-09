# Backend launch status

9 October 2026. Branch `codex/backend-launch`, based on production main `464c6ef`.

## Implemented and tested

- Atomic institutional request submission: request, lines and notification trigger effects commit together. Stable keys support retries without duplicate requests. Demo and unauthorized-site submissions are rejected.
- Combined admin inbox for website enquiries, portal requests and unlisted sourcing requirements, with persistent action, owner, UAE due date, completed follow-up and overdue filters.
- Per-request approval, ERPNext invoice/funding request, required funding, verified receipts/credit approval, supplier confirmation validity, margin exception, supplier PO, dispatch and signed acceptance references.
- Evidence binds to the quotation's lines, prices, costs and terms. An edited quotation requires a renewed review. Evidence updates preserve an admin-only history.
- Database status checks require a complete quotation with all requested lines, reviewed VAT, landed costs, current supplier evidence and at least 20% full direct-cost margin or an approved exception reference. Procurement additionally requires written customer approval and verified funding or approved credit. Dispatch requires supplier PO and delivery-note references; completion requires signed acceptance.
- Atomic admin status RPC updates request, quotation and audit records; failed checks leave status unchanged. Issuance generates a permanent quote reference and records the existing immutable quote snapshot.
- Downloadable supplier RFQ draft reuses requested items and quantities. Accounting handoff CSV reuses request, quotation and funding references. Customer text is escaped against spreadsheet formula execution. Downloads do not send anything or create ERPNext entries.

## Release state — deployed 9 October 2026

PR #19 merged to production as `846de0ce3a3e2dff8844ea899bdf3c6acf2be11f`. Vercel reported a successful production build through its GitHub integration. The JavaScript and stylesheet fetched from `https://pharmaservice.ae` exactly match the tested local build (SHA-256 checks).

The commercial release gate is now enabled through migration `enable_commercial_release_gate`. The full database journey was rerun successfully inside a rolled-back transaction before activation. No test orders, evidence or notifications were retained.

The Vercel connector's deployment-list API returned 403; no authenticated CLI was available. Deployment succeeded through the established GitHub integration. The remote-browser check encountered ERR_EMPTY_RESPONSE, so authenticated live-browser acceptance has not been certified. Local mobile/desktop browser checks and live asset matching passed.

If frontend rollback is required, disable `commercial_release_gate` before restoring the previous admin interface. A controlled live operational pilot and email validation are still required before broad promotion.

## Validation

- Build and shell tests pass.
- Real database tests run inside rolled-back transactions: atomic submission, replay/changed-payload handling, invalid-line rollback, site isolation, demo rejection, internal-action isolation; commercial issuance, blocked underfunded direct updates, stale quotation evidence, procurement, dispatch and acceptance, internal evidence/history isolation and rejection of customer admin transitions.
- Browser mock-transport tests at 390 and 1440 px: inbox filters, follow-up save/refresh, evidence save/refresh, RFQ download, existing quote builder, visible failed status feedback with persisted status unchanged, submission failure/retry preserving one request.
- Existing rendered search and demo draft/Undo regressions passed in the preceding increment. Real iPhone Safari and authenticated production-browser acceptance remain unverified.

## External launch dependencies

- User is completing Google Workspace separately. Verify domain authentication and controlled acknowledgement, PSC alert, quotation, retry/failure and unsubscribe delivery afterward. Active edge functions do not prove delivery. No campaigns were sent.
- ERPNext and bank records are referenced manually. Automatic ERPNext synchronization and bank reconciliation are not connected. Online collection and self-service checkout are deliberately excluded. Bank transfer is the standard method; PSC verifies cleared funds manually. Paymob links may be issued manually by Moe if needed, without becoming a dependency. No statutory invoice or real payment was created by this release.
- Supplier quotes, route/stock evidence, credit approvals and signed deliveries require genuine source records and human verification. The software checks recorded evidence; it does not independently authenticate those external records.
- Finish the existing security review and operational backup/restore and monitoring checks before broad launch.

## Existing security findings

Supabase advisors still identify seven security-definer public catalogue views, two mutable function search paths, public execution grants on existing security-definer functions and disabled leaked-password protection. These predate this release. New tables have admin-only RLS; new public functions are SECURITY INVOKER with empty search paths and no anon execution. Private trigger helpers cannot be called by public, anon or authenticated roles.

Review the public-view projections and intended access before changing them. Blindly switching them can break catalogue access. Relevant remediation: [public views](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view), [function grants](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Bank-transfer policy

Bank instructions are displayed with issued quotations and included in the accounting handoff: Pharma Service Co LLC; Abu Dhabi Commercial Bank; account 10805403920001; AED; IBAN AE740030010805403920001; SWIFT ADCBAEAA. These details were supplied by Moe. The IBAN passes the standard length/checksum validation; this does not independently verify account ownership. No payment button, payment-link generator, Paymob integration or automatic paid status is implemented. Transfers must follow the amount and timing PSC requests under the agreed terms.
