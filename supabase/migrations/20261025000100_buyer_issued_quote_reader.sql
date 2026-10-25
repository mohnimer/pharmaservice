-- Additive customer-safe quotation transport; no permissions removed in this step.
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
