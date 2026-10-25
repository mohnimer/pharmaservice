-- STAGED REVIEW ONLY. Not applied. Activate only with the customer RPC reader
-- described in REVIEW.md; legacy customer table reads will intentionally return no rows.
begin;
create or replace function public.psc_buyer_issued_quotes(p_school uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not private.verified_customer() or not private.can_access_school(p_school) then
  raise exception 'Campus access denied' using errcode='42501';
 end if;
 return coalesce((select jsonb_agg(jsonb_build_object(
  'id',q.id,'order_id',q.order_id,'quote_number',q.quote_number,'status',q.status,
  'current_revision',q.current_revision,'sent_at',q.sent_at,'expires_at',q.expires_at,
  'validity_days',q.validity_days,'payment_terms',q.payment_terms,'delivery_terms',q.delivery_terms,
  'customer_note',q.customer_note,'currency',q.currency,'subtotal',q.subtotal,'vat',q.vat,'total',q.total,
  'issued_lines',coalesce((select jsonb_agg(jsonb_build_object(
   'id',l.id,'quote_id',l.quote_id,'order_line_id',l.order_line_id,'line_no',l.line_no,
   'psc_sku_snapshot',l.psc_sku_snapshot,'line_description_snapshot',l.line_description_snapshot,
   'brand_model_snapshot',l.brand_model_snapshot,'pack_snapshot',l.pack_snapshot,
   'specification_snapshot',l.specification_snapshot,'quantity',l.quantity,
   'unit_sell_price_ex_vat',l.unit_sell_price_ex_vat,'vat_rate_pct',l.vat_rate_pct,
   'customer_note',l.customer_note) order by l.line_no) from public.quote_lines l where l.quote_id=q.id),'[]'::jsonb)
 )) from public.quotes q join public.orders o on o.id=q.order_id
 where o.school_id=p_school and q.status in ('sent','confirmed','cancelled','expired')),'[]'::jsonb);
end $$;
revoke all on function public.psc_buyer_issued_quotes(uuid) from public,anon;
grant execute on function public.psc_buyer_issued_quotes(uuid) to authenticated;
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
commit;
