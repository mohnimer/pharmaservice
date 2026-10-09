# PSC daily workspace — 9 October 2026

## Included

- Today: due/overdue tasks, incoming mail, pending email drafts and quick actions.
- Task-based mobile/desktop navigation with permanent labels; maintenance grouped away from daily work.
- Requests: individual email, portal, website and unlisted-sourcing requirements. Correspondence and commercial controls are scoped to the selected record.
- Customers: existing mail contacts reused as CRM records, institution/site links, reviewed journey stage, phone, website, notes, matching correspondence and tasks. New CRM contacts default to paused/not reviewed for marketing.
- Tasks: dated follow-ups, owners, completion, existing commercial follow-ups, seven-day agenda, explicit Google Calendar links and ICS export.
- Suggested actions: deterministic wording rules for price objections, delivery timing, specification changes, meetings and approval language. Source wording remains visible. Administrator review creates a task; no autonomous send, commercial commitment or customer-requirement update occurs.
- Outreach: new-prospect introduction, existing Workshop newsletter integration, editable saved campaign copies, accurate paused-delivery messaging.

## Database

Migration `20261009160144_workstation_customer_journey.sql` adds CRM fields to `mail_contacts` and private `psc_crm_tasks` / `psc_crm_notes` tables. RLS restricts reads/writes to PSC administrators and rejects demo writes. No credentials or additional Google scopes. No Edge Function changes.

## Verification

- Build and shell/PDF extraction tests: passed.
- Workspace browser scenarios at 390px and 1440px: task suggestion/create/complete, CRM contact/note save, new-contact marketing exclusion, calendar date/escaping, request-scoped correspondence and prospect template passed.
- Existing email approval and reviewed item-to-supplier-draft browser tests at both widths passed.
- Existing 14 isolated mail security tests passed.
- Production database acceptance transaction: administrator task/contact/note writes passed; ordinary-user read/write denied. All test records rolled back; no customer emails sent.

Browser tests use isolated mocked transport, not authenticated production customer operations. Production database tests exercise actual RLS inside a rolled-back transaction.

## Limits / remaining setup

- Calendar links/export create copies; two-way synchronization and calendar notifications are not connected.
- Suggestions are transparent rule-based assistance, not semantic AI enrichment or external company research. Contact fields and journey stages require review. No automated follow-up sends.
- Bulk marketing remains paused pending a separate configured provider, authenticated sender and recipient/compliance checks. Existing unsubscribe/suppression is preserved; Gmail is not a bulk-marketing fallback.
- Mail intake continues its existing labelled-mail polling, attachment and extraction limits; no new OCR/Word/Excel support in this release.
- Workspace retrieval currently caps each dataset at 10,000 records; large-scale pagination/search requires a later server-side extension.
- Operational logs/drains were not audited as part of this interface release.

## Rollback

Revert the workspace release commit through the normal Git deployment flow. The additive CRM migration can remain safely in place to preserve user-entered tasks and notes. Do not drop the new tables after use.
