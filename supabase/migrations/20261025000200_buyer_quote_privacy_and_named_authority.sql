-- Apply after the frontend uses psc_buyer_issued_quotes. No memberships created or changed.
-- Restrictive SELECT policies combine with existing permissive policies. Customers
-- receive only the safe RPC projection; PSC admin CRUD and quote issue stay intact.
drop policy if exists buyer_private_quotes_guard on public.quotes;
create policy buyer_private_quotes_guard on public.quotes as restrictive for select to authenticated using(private.is_psc_admin());
drop policy if exists buyer_private_quote_lines_guard on public.quote_lines;
create policy buyer_private_quote_lines_guard on public.quote_lines as restrictive for select to authenticated using(private.is_psc_admin());
-- The existing decision-read policy joins quotes. Preserve its campus-safe behavior
-- when customer direct-table quotation rows are hidden by the restrictive policy.
create or replace function private.buyer_can_read_issued_quote(p_quote uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select private.verified_customer() and exists(select 1 from public.quotes q
 join public.orders o on o.id=q.order_id where q.id=p_quote
 and q.status in ('sent','confirmed','cancelled','expired') and private.can_access_school(o.school_id));
$$;
revoke all on function private.buyer_can_read_issued_quote(uuid) from public,anon;
grant execute on function private.buyer_can_read_issued_quote(uuid) to authenticated;
drop policy if exists buyer_issued_decision_read on public.psc_management_decisions;
create policy buyer_issued_decision_read on public.psc_management_decisions for select to authenticated using(private.buyer_can_read_issued_quote(quote_id));


create or replace function private.can_approve_school(target_school uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select private.verified_customer() and private.can_access_school(target_school)
 and exists(select 1 from public.memberships m where m.user_id=auth.uid()
   and m.school_id=target_school and m.role='management_approver');
$$;
