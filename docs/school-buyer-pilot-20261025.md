# School buyer pilot and release sequence

## Human validation still required

Software tests and local fixtures do not establish a successful real institutional purchase. Invite representative nurse/procurement/group users only after separate authorization; no invitations or customer communications are issued by this task.

Ask a nurse to find a specific dressing pack and the exact compatible glucose-strip product, explain any unknown fact, prepare a saved multi-line campus RFQ, navigate away and resume it. Ask them to repeat a previous request, change two quantities, remove one line and add another. Confirm original descriptions/packs remain unchanged and that changed/hidden/unavailable options are retained for sourcing review. Repeat on an actual clinic phone and desktop, including keyboard-only controls.

Ask procurement to locate the actual issued quote revision, exact quantities/units, prices, VAT, delivery/payment/validity terms and available original files. Verify the billing legal entity and actual warranty/FOC/exclusion wording in the issued document. Missing fields must be clarified; they are not populated from generic catalogue facts.

Ask an authorized group user to inspect permitted campus activity, change active campus and return to the first campus's draft. Verify no draft, note, document or historical line leaks into the other campus/account. Test a single-campus user separately. Management visibility must never be treated as purchasing authority.

Record task completion, time to familiar product, exact-pack accuracy, repeat-request preparation time, missing-information clarifications and document-finding success. No baseline or improvement percentage has been assumed. Genuine collected orders and preference versus email/WhatsApp require a real authorized pilot, not fixture data.

## Controlled release

1. Review the UI implementation and before/after evidence on the dedicated branch. Catalogue/master/price/stock/image/DHA datasets are unchanged; PR61 remains separate.
2. Resolve the separately staged server authorization and confidential quote-field protections. Review named purchaser evidence and admin compatibility; run direct-API negative tests. No customer permission change is applied in this branch.
3. Validate actual issued quote/document records and clinical/supplier evidence with the responsible owner. Existing school collections stay previews unless independently approved.
4. Complete required CI and actual-device/representative-user checks. Receive explicit approval for any backend changes and production release.
5. Deploy a controlled preview first, then the approved production release; record commit/deployment IDs and verify selected-campus request/document behavior without live test orders or messages.

Rollback: revert the buyer-experience commit and rebuild the prior production source. There is no applied schema migration. Owner-scoped draft data remains on the user's device and should be preserved/exported before reverting to the legacy global-storage reader. The named-approval proposal is not deployed and has no production rollback to perform. Keep the prior deployment available; reverting UI does not repair pre-existing backend permission gaps.
