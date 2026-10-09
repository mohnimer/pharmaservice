# Email RFQ intake review — 9 October 2026

Imported incoming correspondence now offers **Review items & prepare supplier RFQ** in the existing request queue. The review queue precedes mailbox maintenance and quotation controls.

## Workflow

1. Open an imported email and its original attachment.
2. Read email and attachments. Text PDFs (up to 30 pages / 10 MB), TXT and simple CSV quantity/unit rows produce proposed items. Up to five attachments are inspected. The source text is retained; errors and limitations are shown. Scans, Word/Excel files and ambiguous layouts require manual entries. No OCR or general-purpose language model extraction is claimed.
3. Review institution/contact, descriptions, quantities and units. Use existing catalogue retrieval to suggest up to six products; an administrator explicitly chooses a match, marks needs sourcing, clarification, or exclusion. Source wording remains visible. Catalogue choice does not establish specification equivalence or availability.
4. Save progress. Select confirmed lines for a supplier, enter the supplier address and confirm review. A draft is created in the existing email approval workflow; nothing sends during intake.
5. Review/edit the supplier draft and explicitly authorize sending. Editing intake invalidates older supplier drafts. Concurrent edits while a send is in flight or uncertain are blocked.
6. For an established real customer, choose its verified site to create a request through the existing submission RPC, then associate the source email. The stable message ID provides retry idempotency. New customers still require existing account setup. Clarification/excluded lines remain in intake and do not become order lines.

## Production changes

- `psc_mail_intakes`: admin-readable, service-written reviewed item lists, contact details, source text, revisions, test flag.
- Two draft linkage fields; service-only versioned-save and atomic-send-claim RPCs; admin-only conversion wrapper using existing request submission logic.
- Extended `procurement-mail`; authenticated `/api/extract-rfq` on the existing Vercel site; pinned PDF.js 5.6.205.
- Existing Gmail auth/admin/demo/rate checks authorize extraction. The API retrieves only attachment links generated for the authorized source message. No new privileged key or external document processing service.
- Test intake cannot create live requests and supplier drafts are restricted to info@pharmaservice.ae. User-marked test status is sticky. Subject containing the word test also enforces it server-side.
- Underlying email source and attachments remain in the private bucket. No commercial emails were sent by this rollout.

## Evidence

- Actual PSC_Test_RFQ.pdf: four extracted lines, quantities 10/5/2/6, units boxes/packs/units/bottles; 500 ml retained as specification text.
- API handler tests: missing auth and non-admin denial; actual PDF bytes extracted through controlled attachment transport; no credentials logged.
- Fourteen isolated security tests pass, covering existing Gmail controls plus intake review, obsolete drafts and external test-recipient blocking.
- Mobile 390 px and desktop 1440 px: catalogue suggestion chosen, item quantity saved, review required before draft creation; preparing a draft produces zero send calls.
- Production database rolled-back tests: stale version rejected, external test recipient rejected, concurrent edit after claiming send rejected. No fixture rows retained.
- Production permissions: RLS enabled; anon read false; ordinary direct writes and privileged save/claim RPC access false.
- Build and existing shell tests pass. Existing Gmail approval browser checks retained.

Earlier live tests separately confirmed official mailbox connected, one approved internal Gmail send and Inbox receipt, and one inbound RFQ with its original EML and PDF retained privately. This rollout adds the review workflow; the owner's authenticated production walkthrough remains to be completed. No live supplier send or customer order creation is used for testing.
