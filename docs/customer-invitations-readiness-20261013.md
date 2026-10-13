# Customer accounts and connected mailbox — release review

Implementation is on `feature/customer-invitations-20261013`, including the separate mailbox checkpoint. It has not been merged or deployed. No production migration, new customer Auth identity, membership, invitation, credit record or test email was created. Existing production reads were used to inspect AEG and authorization. The existing Dany draft from the preceding task is unrelated.

## Implemented

- Connected business mailbox workspace: incoming, sent, all mail, search, paginated history, attachments, conversation view, + Task, editable action and due date, saved to-do tasks, Google Calendar handoff.
- Inbox import no longer requires a procurement label; recent mail is checked during historical backfill. Spam, trash and Gmail drafts are excluded. This is the connected info mailbox, including aliases delivered there, not unrelated mailboxes.
- Branded replies preserve Gmail thread ID, original Message-ID/References and the current Reply-To recipient. Outstanding reply drafts can be resumed, failed sends reviewed and uncertain sends reconciled.
- A common email frame, signature, logo, DM Sans/Arial fallback and model/contact buttons for platform correspondence, quotations, RFQs, notifications, updates and invitations. This does not rewrite messages sent in Gmail's own compose window.
- Administrator invitation management in Customers & contacts and Settings: existing group/school selection, named recipient, role, explicit multi-school scope, draft editing, preview/send, expired/failed reissue, outstanding revocation, sent/activation/expiry timestamps and uncertain-send reconciliation.
- Supabase Auth invitation/magic-link verification and recipient-created passwords. Existing users are reused by exact email. Application tokens are hashed, identity-bound, single-use and expire after one hour. Auth expiry can shorten that window. There are no emailed temporary passwords.
- Activation writes memberships atomically after verified email and a password exists. Existing memberships and Loai's group-admin role are preserved. Legacy provisioning records are checked before creating a new Auth user to prevent unexpected scope grants.
- Backend verified-identity and school scope enforcement. Named, school-scoped management approvers alone can record AEG decisions. Decisions are auditable and bound to an issued revision and its commercial fingerprint. Viewing a quotation does not approve it. Group-admin visibility does not imply management authority.
- AEG commercial release additionally requires approval of the current quotation. Existing customer PO/funding, supplier evidence, margin, VAT, invoice, dispatch and acceptance controls remain in force. Management decisions do not create purchase orders or change order status.
- Account & Credit Documents administration: purchasing entity, covered schools, signatory, issue/collection dates, all requested statuses, proposed 30-day terms, explicitly eligible SKU list, limit, approved terms, approval date/actor, private evidence uploads and audit history. Customer roles cannot read or modify internal credit records. The tracker never grants purchasing credit, modifies SKU data or bypasses commercial release checks.
- Password reset request and token-hash recovery page; a branded Supabase recovery template is supplied.

## Existing AEG account readiness

Production inspection confirmed one existing AEG Education group and the five existing schools below. Migration seeding resolves their existing IDs; it never inserts a group or school. The school quote addresses currently point to Loai, not five named clinic users. Finance email and billing entity remain unknown and untouched.

| Existing school | Campus | Prepared state | Required before sending |
| --- | --- | --- | --- |
| Far Eastern Private School | Shahba Campus | Recipient-free draft in staged migration/test database | Designated person's name and email |
| Far Eastern Private School | Halwan Campus | Recipient-free draft in staged migration/test database | Designated person's name and email |
| The New Filipino Private School | Main Campus | Recipient-free draft in staged migration/test database | Designated person's name and email |
| The New Filipino Private School | RAK Branch | Recipient-free draft in staged migration/test database | Designated person's name and email |
| Universal Philippine School | Al Ain Campus | Recipient-free draft in staged migration/test database | Designated person's name and email |

Loai's existing group-admin membership is not changed or promoted to management approver. Authorized management approver identities and school scope must be supplied explicitly. The five real invitation rows are not yet installed in production.

## Verification evidence

- `npm run test:customer-accounts`: real PostgreSQL policy tests in PGlite plus isolated function tests. Covers all five school activations, cross-school reads/decisions, Loai's group visibility, management-only revision approval, direct API-equivalent SQL denial, expired/mismatched/reused tokens, no duplicate membership, verified identity, demo isolation (including a misflagged admin profile), private credit documents and credit independence.
- `npm run test:mail-safety`: isolated Gmail/Auth adapters. Covers threaded replies, safe MIME headers, HTML-only import, sender routing, administrative authentication, quote/onboarding controls, exactly-once claims and uncertainty after Gmail acceptance with lost bookkeeping.
- `npm run test:customer-accounts-browser`: complete built application at 390px and 1440px. Covers task/calendar handoff, branded reply/preview/send, five draft invitations, recipient review/send using mocked transport, credit tracking without order changes, activation to a single-school dashboard, reset request and recovery/password update. External backend traffic is blocked; all users are synthetic.
- Existing shell, DOM, catalogue and browser regressions passed. Catalogue verification includes 405 identities and 193 approved options; demo requests remain local with zero writes.
- Screenshot evidence is under `docs/testing/customer-accounts/`, using synthetic recipients only. Screenshots are viewport emulations, not physical-device tests.
- The local PostgreSQL fixture mirrors the relevant inspected policies and schema. It is not a clone of the complete production database or a hosted PostgREST/GoTrue integration.

## Outstanding release requirements

This is ready for source/code review and isolated staging installation, not a claim that hosted production activation has been certified.

1. An isolated Supabase test project/branch is needed for real GoTrue OTP verification, password recovery, Storage, full production schema compatibility and REST authorization checks with controlled test identities. The current project has no development branch. Creating a billed branch through the Supabase connector requires organization selection and its native cost confirmation. Do not use production as a substitute.
2. Configure the staged frontend to the isolated project's publishable/anon key and URL. Never publish a service-role key. Configure `PSC_APP_ORIGIN` and `PSC_INVITATION_ORIGIN` to the staging origin in that environment. Invitation sending fails closed if the origin is absent. Configure Supabase Site URL and exact approved reset/activation redirect URLs. Set the hosted Auth minimum password length to at least 12 characters and verify Auth rate limits; frontend password checks alone do not configure the server policy.
3. Install the mailbox migration then the invitation/credit migration in staging. The latter assumes the inspected existing base tables, private provisioning table, quotation snapshot/fingerprint functions and existing policies. Seed synthetic groups/schools for tests; never send to real AEG people.
4. Deploy `customer-invitations`, `procurement-mail`, `poll-procurement-mail`, `dispatch-notification` and `send-mail-campaign` with their shared dependencies to staging. Their application-layer authorization is mandatory. The new invitation endpoint disables platform JWT verification because its inspect action uses the application secret; activation validates the Supabase identity and administrative actions validate PSC administrator authority server-side.
5. Configure a controlled staging Gmail/SMTP delivery path. Supabase password recovery uses Auth email delivery, which is separate from the existing Gmail send API. Install `supabase/templates/recovery.html` as the hosted Auth recovery template and verify delivery to a controlled test address. Its token-hash link avoids the ambiguity of OAuth tokens combined with SPA hash routing.
6. Run the real hosted verification matrix, including Auth email expiry/reuse, existing users, reset, upload/download and direct REST cross-school reads/writes. Run Supabase security advisors on the staging deployment. Local tests cannot substitute for this final integration check.
7. Obtain the five designated clinic names/emails, named management approver(s) and explicit scope. Leave purchasing entities, finance contacts and credit approvals blank until supplied. Review every invitation before sending.
8. Obtain explicit production release approval, then apply migrations/functions/frontend in order. Verify Loai and all five existing school IDs before/after. Invitation email sending remains a separate administrator-reviewed action; seeding a draft never sends mail.

No catalogue, product identity, image, stock or pricing data files are part of this feature. Build-generated catalogue index timestamp changes are excluded from commits.

## References used for integration

- Supabase generateLink: https://supabase.com/docs/reference/javascript/auth-admin-generatelink
- Supabase verifyOtp: https://supabase.com/docs/reference/javascript/auth-verifyotp
- Gmail conversation threading: https://developers.google.com/workspace/gmail/api/guides/threads
