-- Run only on the approved isolated feature database after exporting any data to retain.
-- No rollback was executed during development. Never run against production without separate approval.
-- First disable the feature's cron/worker jobs in that environment.
begin;
drop function if exists public.ps_workshop(text,jsonb);
drop function if exists public.ps_readiness_email(text,uuid,text,text);
drop function if exists private.ps_workshop(text,jsonb);
drop function if exists private.ps_readiness_tick(timestamptz);
drop function if exists private.ps_score(jsonb,jsonb,jsonb,text);
drop table if exists public.ps_readiness_notifications,public.ps_readiness_rfq_links,
 public.ps_readiness_proposals,public.ps_readiness_issues,public.ps_readiness_reports,
 public.ps_readiness_settings,public.ps_learning_attempts,public.ps_learning_quiz_drafts,
 public.ps_learning_progress,public.ps_learning_modules,public.ps_readiness_banks,
 public.ps_readiness_catalogue;
drop function if exists private.ps_read_report(uuid,uuid,text);
drop function if exists private.ps_read_issue(uuid);
drop function if exists private.ps_ps_access(uuid);
drop function if exists private.ps_nurse(uuid,uuid);
drop function if exists private.ps_manager(uuid,uuid);
drop function if exists private.ps_member(uuid,uuid);
commit;
-- Existing accounts, memberships, catalogue, guides, orders, RFQs and quotations are retained.
