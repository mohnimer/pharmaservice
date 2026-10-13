# Customer accounts and mailbox — production release, 13 October 2026

Moe explicitly authorized production deployment at 21:15 UAE time, with the two FEPS clinic assignments deferred. This supersedes the earlier hold on deployment; customer invitation sending remains unauthorized.

## Published release

- Feature PR #27 merged as 4ff9e4eee1e476bd0317213f5a01a4162bc266cc.
- Production commit f5fb6d10ef6c6042c55f77f467e7663ae9cf515d includes the private HTTP timeout and the tested MIME decoding memory fix.
- Vercel production deployment dpl_2qjj9wgMBGshEvsLs999xWYzCaRp is READY and assigned to pharmaservice.ae and www.pharmaservice.ae.
- Live current.js SHA-256 f4a1a4c74d8f8a88a191431c46aa8cde5900e0c4622423893d032a787864c353 matches the locally built artifact exactly.
- Supabase: customer-invitations v1; procurement-mail v14; poll-procurement-mail v7; dispatch-notification v9; send-mail-campaign v8.
- Mailbox reply migration and invitation, scope, audit and credit SQL were installed. The large invitation migration was applied in smaller named pieces after connector request-state failures: customer_invitation_draft_tables, customer_verified_admin_roles, customer_school_scope_policies, customer_invitation_identity_lookup, customer_invitation_activation, customer_management_decision_audit, customer_credit_tracking_tables, customer_credit_tracking_security_and_drafts. Do not replay the aggregate invitation migration on this already-migrated production project.
- The private mail transport timeout was increased to 60 seconds for larger inbox imports; no worker secret was exported or printed.

## Account state

Seven outstanding records, all Draft; five have reviewed recipient inputs and two FEPS placeholders have no recipient assignment. No invitation email or clarification email was sent, no customer identity was activated, and no school membership was created.

| School | Prepared recipient drafts | Outstanding |
| --- | --- | --- |
| NFPS Main | Clinic and accounts | Invitation review/send approval |
| NFPS RAK | Clinic and accounts | Invitation review/send approval |
| UPS Al Ain | Accounts | Clinic email not supplied; invitation review/send approval |
| FEPS Shahba | Campus placeholder only | Clinic/accounts campus mapping deferred |
| FEPS Halwan | Campus placeholder only | Clinic/accounts campus mapping deferred |

The clinic and accounts identities use the same existing school customer account and records, with separate email logins. Management approval remains by email. No management-approver memberships were assigned. Credit tracking never grants purchasing credit.

## Verification

- Customer/mail CI on 0c56caded1519b8543ecfd79474190a7169d8b1e passed, including the actual 390px/1440px browser scenarios with mocked delivery.
- Local database authorization fixture, 10 invitation function tests and 36 mail security tests passed. Local browser installation failed in this fresh checkout because the downloaded browser archive was truncated; the CI browser tests succeeded.
- Real deployed database role check: Loai sees five AEG schools and zero internal invitation/credit records. A single-school scope test ran in a transaction and was rolled back; it saw exactly one school, zero other-school rows/orders, and zero internal invitation/credit records. Loai's original membership is retained.
- Five AEG schools, two original AEG memberships and 396 product rows were preserved. Product data, pricing and catalogue images were not written by this release.
- Live browser sign-in page renders the new Forgot password control. Anonymous malformed activation inspection returns invalid_activation_link (400).

## Remaining practical checks

Real email activation and password-recovery delivery have not been exercised in an isolated hosted environment. No real AEG invitations were used as tests. Hosted Auth password policy, Site URL/redirect allowlist and optional branded recovery template still need verification before claiming the entire real-recipient journey certified. The activation email uses the verified production origin only for the exact production Supabase backend; other environments still require explicit PSC_INVITATION_ORIGIN.

Full inbox history backfills incrementally under the existing five-minute poll schedule, with a current-mail check on each cycle. The first complete fixed production cycle finished at 17:53:51 UTC: last_error null, 22 messages imported (up from 8), and a continuation token saved for older history. A worker submission response can be a rate-limit skip and does not prove import; these counts and completion timestamp are the verified evidence.

Existing security advisor findings outside this feature were observed (catalogue definer views, existing quote/trigger functions, mutable legacy search paths and disabled leaked-password protection). They were not silently altered as part of this release. References: https://supabase.com/docs/guides/database/database-linter and https://supabase.com/docs/guides/auth/password-security.

Both final feature CI workflows succeeded: Customer accounts and mailbox 38440438367, Catalogue variant integrity 38440438533. The production inbox memory failure was diagnosed from Supabase runtime logs (Memory/546). Base64 decoding now allocates a typed byte array directly, and raw MIME above 10 MB is not downloaded/decoded. The 2 MB byte-integrity regression test passed. Subsequent real import completed without error.
