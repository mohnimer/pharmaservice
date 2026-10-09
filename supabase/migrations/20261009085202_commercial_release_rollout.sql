create or replace function private.psc_check_commercial_release() returns trigger
language plpgsql security definer set search_path='' as $$
declare c public.order_commercial_controls; q public.quotes; v_sell numeric; v_cost numeric;
begin
 if new.status is not distinct from old.status or new.status not in ('quote_sent','under_process','out_for_delivery','delivered') then return new; end if;
 select * into q from public.quotes where order_id=new.id;
 if q.id is null then raise exception 'Create and price a quotation before advancing this request'; end if;
 select * into c from public.order_commercial_controls where order_id=new.id;
 if c.order_id is null or c.quote_fingerprint<>coalesce(private.psc_commercial_fingerprint(new.id),'') then
  raise exception 'Save commercial evidence for the current quotation before advancing'; end if;
 if exists(select 1 from public.order_lines ol where ol.order_id=new.id and not exists(select 1 from public.quote_lines l where l.quote_id=q.id and l.order_line_id=ol.id)) then raise exception 'Every requested line must be included in the quotation';end if;
 if btrim(c.supplier_evidence_ref)='' or c.supplier_valid_until is null or c.supplier_valid_until<(now() at time zone 'Asia/Dubai')::date then
  raise exception 'Current supplier specification, stock, lead-time and route evidence is required'; end if;
 if not exists(select 1 from public.quote_lines where quote_id=q.id) or exists(
 select 1 from public.quote_lines l left join public.quote_line_costs k on k.quote_line_id=l.id where l.quote_id=q.id and
 (l.quantity<=0 or l.unit_sell_price_ex_vat is null or l.unit_sell_price_ex_vat<=0 or l.vat_rate_pct is null or l.vat_rate_pct not in (0,5) or k.unit_landed_cost is null or k.unit_landed_cost<0)) then
 raise exception 'Complete every quotation line: quantity, selling price, landed cost and reviewed VAT'; end if;
 select sum(l.quantity*l.unit_sell_price_ex_vat),sum(l.quantity*k.unit_landed_cost+coalesce(k.freight_delivery_cost,0)+coalesce(k.install_labour_cost,0)+coalesce(k.foc_other_direct_cost,0)) into v_sell,v_cost
 from public.quote_lines l join public.quote_line_costs k on k.quote_line_id=l.id where l.quote_id=q.id;
 if (v_sell-v_cost)/v_sell<0.20 and btrim(c.margin_exception_ref)='' then raise exception 'Margin below 20 percent requires an approved exception reference'; end if;
 if new.status='quote_sent' then return new; end if;
 if btrim(c.authorization_ref)='' then raise exception 'Customer PO or written approval reference is required'; end if;
 if btrim(c.invoice_ref)='' then raise exception 'Record the ERPNext invoice or funding request reference'; end if;
 if btrim(c.credit_approval_ref)='' and (c.funding_required<=0 or c.funding_received<c.funding_required or btrim(c.receipt_ref)='') then
 raise exception 'Verify required funding against a receipt, or record approved credit terms'; end if;
 if new.status in ('out_for_delivery','delivered') and (btrim(c.supplier_po_ref)='' or btrim(c.dispatch_ref)='') then raise exception 'Supplier PO and dispatch references are required'; end if;
 if new.status='delivered' and btrim(c.acceptance_ref)='' then raise exception 'Signed delivery or customer acceptance reference is required'; end if;
 return new;
end $$;

create or replace function public.psc_set_commercial_status(p_order_id uuid,p_status text) returns void
language plpgsql security invoker set search_path='' as $$
declare q public.quotes; o public.orders; v_quote_status text;
begin
 if not private.is_psc_admin() then raise exception 'PSC administrator required'; end if;
 if p_status not in ('under_review','quote_sent','confirmed','cancelled','under_process','out_for_delivery','delivered') then raise exception 'Invalid commercial status'; end if;
 select * into o from public.orders where id=p_order_id for update;
 if o.id is null then raise exception 'Request not found'; end if;
 select * into q from public.quotes where order_id=o.id for update;
 if q.id is null then raise exception 'Quotation not found'; end if;
 perform public.psc_recalculate_quote(q.id);
 if p_status='quote_sent' and (q.quote_number is null or q.quote_number like 'PSC-DRAFT-%') then
  q.quote_number:='PSC-Q-'||to_char(now(),'YYYY')||'-'||replace(o.id::text,'-','');
  update public.quotes set quote_number=q.quote_number where id=q.id;
 end if;
 v_quote_status:=case p_status when 'under_review' then 'draft' when 'quote_sent' then 'sent' when 'confirmed' then 'confirmed' when 'cancelled' then 'cancelled' else q.status end;
 update public.orders set status=p_status,quote_ref=case when p_status='quote_sent' then q.quote_number else quote_ref end,
 cancelled_at=case when p_status='cancelled' then now() else cancelled_at end, delivered_at=case when p_status='delivered' then now() else delivered_at end where id=o.id;
 update public.quotes set status=v_quote_status,last_edited_by=auth.uid(),
 sent_at=case when p_status='quote_sent' then coalesce(sent_at,now()) else sent_at end,
 issued_by=case when p_status='quote_sent' then auth.uid() else issued_by end,
 expires_at=case when p_status='quote_sent' then coalesce(expires_at,now()+validity_days*interval '1 day') else expires_at end,
 confirmed_at=case when p_status='confirmed' then coalesce(confirmed_at,now()) else confirmed_at end,
 cancelled_at=case when p_status='cancelled' then coalesce(cancelled_at,now()) else cancelled_at end where id=q.id;
 if o.status<>p_status then
 insert into public.status_history(order_id,status,note,changed_by) values(o.id,p_status,'Commercial status updated with release checks',auth.uid());
 insert into public.quote_events(quote_id,event_type,old_status,new_status,note,actor_user_id,metadata) values(q.id,'status_changed',q.status,v_quote_status,'Commercial status updated',auth.uid(),jsonb_build_object('old_order_status',o.status,'new_order_status',p_status));
 end if;
 if p_status='quote_sent' then perform public.psc_capture_quote_snapshot(q.id,'issued','Quotation issued with commercial release checks');end if;
 if p_status in ('confirmed','cancelled') then perform public.psc_capture_quote_snapshot(q.id,'customer_decision','Commercial decision recorded');end if;
end $$;

-- Enable only after the matching frontend is deployed and smoke-tested.
alter table public.orders disable trigger commercial_release_gate;
