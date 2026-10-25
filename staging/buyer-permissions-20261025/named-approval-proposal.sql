-- REVIEW PROPOSAL ONLY. Not a migration, not applied to production.
-- Requires explicit approval and a reviewed list of named purchasing representatives.
create or replace function private.can_approve_school(target_school uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select private.verified_customer() and private.can_access_school(target_school)
 and exists(select 1 from public.memberships m where m.user_id=auth.uid()
   and m.school_id=target_school and m.role='management_approver');
$$;
