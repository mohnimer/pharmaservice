# Workshop & PS Report Card handover

Branch: feature/workshop-report-card-20261017
Baseline: 09d4831df47fc9d47a630477b933068701041fb3
Draft PR: https://github.com/mohnimer/pharmaservice/pull/49
Preview: https://pharmaservice-git-feature-wor-5f9ba4-mohameds-projects-9022ad5a.vercel.app

**Preview frontend only until an isolated Supabase target is provisioned/configured. No live database migration, cron activation, customer notifications or production deployment has been performed. Do not describe authenticated deployed persistence as operational yet.**

## Pages

| Route | Implemented purpose |
|---|---|
| /workshop | Four destinations |
| /workshop/guides | Existing editorial library, seven topics, search/filter |
| Existing /workshop/<guide> and topic URLs | Original content, references, illustrations, product links and actions |
| /#workshop/courses | Six pilot modules |
| /#portal/workshop/lesson/<id> | Slide navigation, objectives, sources, saved progress |
| /#portal/workshop/quiz/<id> | Single/multi answers, explanations, persisted drafts, attempts/retakes |
| /#portal/workshop/assessments | Separate learning-result history |
| /#portal/readiness | Assigned baseline/weekly check, conditional questions, resume/review/submit |
| /#portal/report-card | Campus history, actual trends, open issues and separate learning scores |
| /#portal/report-card/<id> | Immutable grade/findings/answers, critical warning, delivery state, proposals, review/RFQ and print/PDF |
| /#portal/report-card/settings | Authorized campus assignments, recipient, jurisdiction, bank, conditions, schedule/preferences/consent |
| /#admin/readiness | Customer-authorized readiness/supply follow-up |
| /#admin/workshop-content | Publish new immutable content versions |

The existing V50 router and shells remain authoritative. Original workshop-data.js is unchanged. No second catalogue, inventory system, ERP or account master.

## Persistence and permissions

Migration: supabase/migrations/20261017104154_workshop_report_card.sql, generated with Supabase CLI 2.121.0 migration new.
Tables: ps_learning_modules, ps_readiness_banks, ps_learning_progress, ps_learning_quiz_drafts, ps_learning_attempts, ps_readiness_settings, ps_readiness_reports, ps_readiness_issues, ps_readiness_proposals, ps_readiness_rfq_links, ps_readiness_notifications, ps_readiness_catalogue.

All new tables have RLS and no direct authenticated writes. Guarded public.ps_workshop invokes a private function with verified-user, active campus, role, assignment, revision and state checks. Existing auth/users/profiles/memberships/schools/account groups/orders/lines are reused. Existing school_user, group_admin, management_approver and PS-admin roles are reused.

Drafts remain owner-scoped. Submitted site reports are visible to current authorized campus members. Managers configure only their campuses. PS sees submitted readiness/issues only after explicit campus sharing consent. No frontend service key.

Historical reports snapshot answers, bank/scoring versions, applicability, owner/site and open issues. Reassignment preserves drafts and increments revisions; submitted snapshots remain immutable. Positive answers do not close earlier issues without explicit nurse resolution.

## Scoring

All results remain PS pilot, never official compliance grades. Weight/grade bands are stored in immutable bank versions. Unknown earns no credit. Missing answers cannot submit and have no grade/score. Optional N/A and confirmed-false conditional questions leave the denominator; unknown applicability earns no credit. Completeness is separate. Critical concerns and older unresolved critical issues trigger an independent warning.

Bands: A+97, A93, A−90, B80, C70, D60, F below60. Comparison requires same bank ID/version and jurisdiction; otherwise no prior comparable score. Missed checks show Not submitted/Overdue, never F.

## Scheduling and notifications

Default Monday 09:00 Asia/Dubai. Day/time, assigned nurse, authorized recipient, reminders/email and PS sharing are configurable.
private.ps_readiness_tick creates one site/week assessment, one due notification and one overdue reminder after two days. Repeated ticks deduplicate. Not dependent on browser visits.

Nurse-reviewed submission creates a manager in-app notification transactionally. Optional workshop-notifications Edge Function reuses the existing private mail worker and mail transport. Recipient authorization is checked at claim and just before send. Email contains a secure portal link, no medical findings. Uncertain send outcomes never auto-retry. Failed/uncertain states remain visible. Email defaults off; jobs are not active.

## Isolated deployment requirements

The connected PSC Supabase project is live and has no development branch. No billed branch/project was created.

1. Provide/provision an isolated Supabase branch/project with the existing baseline schema.
2. Apply the new migration there; create designated test users/campus memberships via existing account administration.
3. Set Vercel branch/preview-only PS_PREVIEW_SUPABASE_URL and PS_PREVIEW_SUPABASE_PUBLISHABLE_KEY. Both are required together. Build rejects production override and non-publishable keys.
4. Deploy workshop-notifications to that isolated target with existing private mail transport settings and PS_WORKSHOP_ORIGIN pointing to the preview.
5. Activate a five-minute Supabase cron calling private.ps_readiness_tick() only on the approved target.
6. For explicitly enabled test-recipient email, schedule a private authenticated worker invocation of workshop-notifications. Store its credential in Vault, never frontend/repository.
7. Validate Supabase Auth/RLS and real delivery on that target before any production approval.

Vercel Git integration creates the preview. No production promotion or merge without Moe’s explicit approval.

## Replenishment

Reuse existing psc_submit_institutional_request after manager review. Report locking/unique link prevents duplicate RFQs. Existing order IDs link assessment→issue→proposal→RFQ; quotation/order authority remains unchanged. No supplier PO, charge, procurement authorization or automatic issue closure.

Four initial source catalogue bindings are provisional first-aid/glove requirements. Existing records have unresolved identity/pack details, so no exact saleable variant is inferred. RFQ psc_sku_snapshot is null for these; original catalogue ID remains a reference snapshot. No prices/stock copied. Future verified mappings can preserve exact SKU/pack. Changed/disabled mappings block RFQ for re-review. This small mapping allowlist is not a product master.

Procedural/documentation/training issues cannot become shopping items. Restricted/unclassified products cannot use the shortcut. Unknown answers/quantities do not auto-generate purchases. Full existing catalogue remains available.

## Content dependencies

Six short modules and the operational bank are editorial pilots; clinical/regulatory sign-off pending. Quiz completion is not competency certification.
DHA circular CIR-2025-00000098, 15 May2025, educational/academic clinic standards v4.1: Dubai DHA jurisdiction confirmed. Question-level regulatory mapping NOT validated.
CDC Standard Precautions and Hand Hygiene sources reviewed 17Oct2026; lesson clinical review pending.
Abu Dhabi, Sharjah and other regulatory mappings are not activated as compliance scoring. PS process/scoring rules are not government requirements.

## Tests and limits

Local/CI tests execute real migration and existing RFQ function in PGlite PostgreSQL:
- workshop-backend.mjs: role/tenant denial, revisions, immutable reports, scoring boundaries, incomplete/critical/unknown, identities, administrator RFQ/replay, Dubai schedule/dedupe and recipient revocation.
- workshop-dom.mjs: interface→PostgreSQL slide/quiz/check/report journey.
- workshop-persistence.mjs: database close/reopen retains learning progress.
- workshop-browser.mjs: full built V50 app→isolated PostgreSQL test transport at mobile/desktop widths, preserved guides, resume, quiz, weekly review, report, PDF and proposals.
- Existing DOM/catalogue/customer/account/image/wishlist/request/mobile regression workflows.

Fixture-auth tests do not establish hosted Supabase Auth/RLS integration or real mail delivery. These remain isolated-preview activation tests. PDF export uses the browser’s Save/Print PDF flow; generated PDFs are retained in CI artifacts. No patient/student information is collected. No ChatGPT unattended automation is claimed.
