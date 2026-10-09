# PSC Google Workspace procurement communications — 9 October 2026

**Backend deployed; Google credential configuration, owner consent and real Gmail acceptance tests remain outstanding. Mail delivery is not yet verified.** No real emails, campaigns or customer orders were generated during these tests.

## Infrastructure audit

Production is PSC Clinic Portal, `ewewkojlsgqvcqarmpgr`, ap-south-1. Management API confirmed this reference; the brief spelled it differently.

Existing dispatch-notification v2 used service-account keys, with gateway verification disabled and no caller authentication. Existing templates, recipients, events and request links were reused. The outbox had unique event keys, three-attempt counters, queued/sending/sent/failed/blocked states, no records at audit and no retry worker. Quote status changes automatically queued quotation-ready email without separate email approval.

send-mail-campaign v2 authenticated administrators and checked contact outreach basis, but used service-account Gmail without atomic recipient claims or robust uncertain-send handling. Delivery is now explicitly paused, rather than moved onto transactional OAuth. mail-unsubscribe retains UUID-based suppression with stricter method/token validation and safe errors.

Existing accounts, requests, quotations, quote_snapshots, commercial controls, administrator checks and notification triggers remain authoritative. Catalogue, pricing, payment collection and demo workflows were not rebuilt. The project handover's customer authorization, cleared funding and supplier evidence gates remain intact.

Vault was initially empty. Edge environment secret **names could not be inspected**: no CLI management login and no connector secret-list operation. No secret values were read or reported. Presence of old service-account environment secrets is unconfirmed.

## Exact changes

- Migration `20261009105227_gmail_procurement_communications.sql`: connection metadata, hashed single-use OAuth state, mail messages, drafts, attempts and rate slots; all new tables have RLS. Ordinary users cannot execute secret/worker RPCs or access correspondence.
- Vault encrypts refresh token as `psc_gmail_refresh`; internal worker token is independently generated as `psc_mail_worker`. Neither is returned to frontend callers.
- Existing outbox gains attempt, acceptance and retry timestamps, approval fields, held/uncertain states. Its webhook now authenticates and isolates errors from request persistence. Five-minute `psc-procurement-mail` cron processes bounded notifications and one inbound page only while connected. Interrupted sends become uncertain.
- psc-gmail-oauth: verified admin POST; single-use ten-minute callback state; server code exchange; exact mailbox identity verification; offline consent; safe revoked-token reconnection state.
- dispatch-notification: OAuth refresh, conditional send claims, safe failure logs, three bounded attempts with five-minute retry delay. Unknown send outcomes require reconciliation. Gmail acceptance is distinct from actual delivery. Unapproved quotation notifications are held; approved PDF communication supersedes them.
- poll-procurement-mail: imports administrator-labelled mail, original EML and private attachments; unique Gmail ID prevents repeat imports. Existing reviewed thread associations may link replies, otherwise mail enters review. Customer requirements are not overwritten.
- procurement-mail: quotation, supplier RFQ, customer follow-up and internal-test drafts. Quotation PDF uses an issued customer-facing snapshot, excluding internal costs. Revision, commercial fingerprint, header amounts/terms, verified recipient and PDF hash are checked before sending. A partial unique index prevents duplicate sends of one issued snapshot. Explicit administrator email approval is required.
- Existing request inbox gains mailbox status, review queue, documents, history, editable drafts, approval and reconciliation controls. Private documents use sixty-second signed URLs; email text is escaped. Existing follow-up/evidence forms remain intact.
- Source paths: `supabase/functions/{psc-gmail-oauth,dispatch-notification,poll-procurement-mail,procurement-mail,send-mail-campaign,mail-unsubscribe}/index.ts`, `_shared/psc-mail.ts`, `_shared/quote-pdf.ts`, `supabase/config.toml`; frontend `current/behaviour/procurement-mail.js`, `current/manifest.json`, supporting `current/styles/commercial-inbox.css`.

## Administrator configuration

1. Google Cloud project **tenacious-veld-510710-j9** → Google Auth Platform → Clients → existing **PSC Procurement Backend** web application. Register this redirect URI exactly, without a trailing slash:

   `https://ewewkojlsgqvcqarmpgr.supabase.co/functions/v1/psc-gmail-oauth`

2. In [Supabase Edge Function secrets](https://supabase.com/dashboard/project/ewewkojlsgqvcqarmpgr/functions/secrets), enter directly:

   | Secret name | Source |
   | --- | --- |
   | `PSC_GOOGLE_OAUTH_CLIENT_ID` | Existing web application's client ID |
   | `PSC_GOOGLE_OAUTH_CLIENT_SECRET` | Current enabled replacement credential only |

   Do not transmit values in chat, screenshots, GitHub, frontend code or commands that print them. Supabase supplies SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY at runtime. Refresh and worker secrets are managed inside Vault.

3. Keep the audience Internal. Requested scopes are **gmail.send** and **gmail.readonly**. gmail.compose is unnecessary because drafts stay in PSC's private database; the code does not request it. Workspace API controls must permit this existing app if consent is restricted. No new client, extra Gmail scopes or service-account key is needed.
4. Sign in to [PSC admin requests](https://pharmaservice.ae/#admin/requests), choose **Connect / reconnect Google**, and complete consent as **info@pharmaservice.ae**. The server rejects a different mailbox even if account-selection hints are ignored.
5. Confirm connected status; prepare internal test draft, inspect it, tick approval and send. Verify Gmail Sent, the PSC accepted-message record and actual receipt at info@. Acceptance alone is not delivery confirmation.

Secure credential configuration and redirect registration are prerequisites; the owner's Google consent is the only manual authorization step after configuration. No passwords or tokens should be shared with the builder.

## Administrator operating workflow

- Saved website/portal requests queue the existing PSC notification independently of request validity. Inspect notification errors without changing the request. No customer acknowledgment event was configured in the audited outbox; one has not been invented or activated automatically.
- In Gmail create **PSC-Procurement** and label relevant customer/supplier correspondence. Avoid patient records and unrelated mailbox content. Polling runs every five minutes or through Check labelled mail.
- Review unmatched mail, distinguish customer requirements from supplier pricing/stock responses and associate it with a real request. These are reviewable candidates, not automatically created customer records, orders or supplier POs. Original mail and attachments remain evidence.
- Review/issue quotation under existing PSC controls, prepare its draft, inspect PDF and recipient, edit text and explicitly approve sending. Historical snapshots without the new fingerprint are deliberately blocked: create a reviewed new revision through the existing workflow, rather than adding a fingerprint to old evidence.
- Supplier RFQs and customer follow-ups remain drafts until approved. Administrator verifies supplier recipient. No PO release, supply commitment or automatic reminder send is introduced.
- Reconnect through the same button after revoked access. Disconnect revokes Google access before deleting the refresh token. For uncertain sends, Check Gmail sent record; no match remains uncertain rather than unlocking a resend. Definitive failed drafts can return to fresh review through explicit action.

## Acceptance evidence

| Required test | Result |
| --- | --- |
| Google account authorization | **Blocked** pending secret configuration, redirect registration and owner consent |
| Token expiry | Isolated handler test passes refresh grant; actual Google refresh outstanding |
| Revoked access | Isolated invalid_grant test passes safe reconnect state; actual revocation outstanding |
| Website request | Existing browser regression passes retained draft, reused retry key and one saved acknowledgment; actual Gmail notification outstanding |
| Duplicate event | Isolated handler test passes one Gmail call, replay skipped |
| Internal Gmail outbound | **Not run against Google**; owner-approved test required |
| Incoming RFQ/attachment/reply | Implemented; **real mailbox acceptance outstanding** |
| Quotation approval/revision | Isolated unapproved/obsolete sends blocked; browser approval and send checks at mobile/desktop; actual PDF send outstanding |
| Unauthorized caller | **Production HTTP checks pass:** OAuth POST, dispatch, poll and procurement-mail return 401; campaign gateway returns 401 |
| Correspondence security | Production populated rollback fixture hidden from ordinary session; anon/authenticated cannot execute Vault/worker RPCs; bucket private |
| Marketing unsubscribe | Isolated suppression/invalid-token tests pass; malformed live token returns safe 400; no campaign sent |
| Gmail failure | Isolated 429 leaves associated request intact and notification recoverable; 503/timeout outcomes held uncertain |
| Demo isolation | Isolated demo administrator denied; existing browser suite uses mocked traffic and checks demo restrictions; actual account acceptance outstanding |
| OAuth replay/rate | Production rollback test consumes state once and denies second rate slot |
| Actual quotation PDF generation | Local production generator executed with real pdf-lib; rendered PDF checked, totals/bank details present, internal cost snapshot excluded |
| Existing site | Build and three shell tests pass; commercial inbox browser tests pass at 390/1440 px |

Commands: `node tests/gmail-security.mjs`, `PSC_CHROME=/path/to/chromium node tests/gmail-browser.mjs`, existing `npm test` and commercial-inbox suite. Local Deno external dependency fetch was blocked; the isolated harness substitutes only external adapters while type-checking and executing source handlers. Actual dependencies successfully bundled during Supabase deployment. Database fixtures were rolled back; browser fixtures remain local.

## Limitations and security review

- Polling searches labelled mail from the last **90 days**, 20 messages/page, retaining page cursor and deduplicating IDs. No full mailbox archive or push subscription. Unchanged imported messages are not downloaded again.
- EML/attachment limit **10 MB**. Oversize original messages stop that page for intervention; oversize attachments are flagged. Unknown MIME types are stored as octet-stream, never executed. No malware scanning implemented. PDF uses Helvetica/ASCII; review non-Latin content before use.
- UI displays latest 100 messages/drafts and latest 500 selectable requests; older records remain stored. Direct enquiry association/account matching are not implemented. Existing-order association is manual unless an already-reviewed thread match is clear.
- Gmail has no transactional idempotency key. Conditional claims, snapshot uniqueness and deterministic Message-ID reduce duplicates, but uncertain outcomes require reconciliation; exactly-once delivery is not claimed.
- No automatic commercial decisions, order acceptance, accounting posting, marketing activation or patient-data processing. Administrators control message text, recipient review and release.
- New state/rate tables intentionally have no ordinary-user policies (service-only). Safe codes exclude provider error bodies and credentials.
- Supabase advisors still flag pre-existing catalogue definer views/RPCs, two timestamp functions with mutable search_path and disabled leaked-password protection. Unrelated settings remain unchanged. See [view warnings](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view), [RPC permissions](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). New secret RPC permissions were verified restricted.

## Remaining launch blockers, ranked

1. **Transactional:** configure current OAuth replacement credential and redirect, then complete owner consent. Working production notification delivery cannot yet be confirmed.
2. **Acceptance:** approved internal send plus actual saved-request notification; verify Sent/receipt/history, refresh and revocation/reconnect.
3. **Procurement correspondence:** labelled RFQ, attachment, reply and approved/current quotation PDF tests against controlled records before broad operation.
4. **Operational:** review historical snapshots, size limits and non-Latin PDF handling; customer acknowledgment needs a separately approved template/policy.
5. **Independent of transactional launch:** separate marketing-provider review, sender authentication, quota, consent/suppression and applicable UAE requirements before enabling campaigns. This release does not establish legal compliance or initiate bulk delivery.

Only **after actual OAuth send, refresh and reconnect tests pass**, inspect remaining uses of GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY and PSC_MAIL_SENDER, remove obsolete secrets, revoke psc-mailer's unnecessary domain-wide delegation and retire the account if unused elsewhere. Current mail source no longer requires those credentials. No Google permissions were removed, and key-creation policy remains unchanged.

References: [Google web OAuth](https://developers.google.com/identity/protocols/oauth2/web-server), [security guidance](https://developers.google.com/identity/protocols/oauth2/resources/best-practices), [Gmail list](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list), [Gmail send](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/send).

## Deployment record

Production migration applied and all six Edge Functions ACTIVE. OAuth v1, dispatcher v4, procurement-mail v2, campaign/unsubscribe v3; polling deployed with conservative thread association. Source release `856245e647ed53263a491e6f5477695660dcd451` reported successful Vercel deployment. Live protected-function HTTP tests returned the expected authorization failures; no Gmail send was attempted. Browser correspondence tests passed at 390 and 1440 pixels.
