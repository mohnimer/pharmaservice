-- Internal evidence references; ERPNext remains the accounting source of truth.
create table public.order_commercial_controls (
 order_id uuid primary key references public.orders(id) on delete cascade,
 authorization_ref text not null default '', invoice_ref text not null default '',
 funding_required numeric(14,2) not null default 0 check(funding_required>=0),
 funding_received numeric(14,2) not null default 0 check(funding_received>=0),
 receipt_ref text not null default '', credit_approval_ref text not null default '',
 supplier_evidence_ref text not null default '', supplier_valid_until date,
 supplier_po_ref text not null default '', dispatch_ref text not null default '', acceptance_ref text not null default '',
 margin_exception_ref text not null default '', quote_fingerprint text not null default '',
 updated_by uuid not null default auth.uid() references auth.users(id), updated_at timestamptz not null default now(),
 check(length(authorization_ref||invoice_ref||receipt_ref||credit_approval_ref||supplier_evidence_ref||supplier_po_ref||dispatch_ref||acceptance_ref||margin_exception_ref)<=4500)
);
alter table public.order_commercial_controls enable row level security;
revoke all on public.order_commercial_controls from anon;
grant select,insert,update on public.order_commercial_controls to authenticated;
create policy commercial_controls_admin on public.order_commercial_controls for all to authenticated using(private.is_psc_admin()) with check(private.is_psc_admin() and updated_by=auth.uid());

create or replace function private.psc_commercial_fingerprint(p_order_id uuid) returns text
language sql stable security definer set search_path='' as $$
 select md5(jsonb_build_object('quote',jsonb_build_object('id',q.id,'revision',q.current_revision,'terms',q.payment_terms,'delivery',q.delivery_terms,'validity',q.validity_days),
 'lines',(select coalesce(jsonb_agg(to_jsonb(l)-'created_at'-'updated_at' order by l.id),'[]'::jsonb) from public.quote_lines l where l.quote_id=q.id),
 'costs',(select coalesce(jsonb_agg(to_jsonb(c)-'created_at'-'updated_at' order by c.quote_line_id),'[]'::jsonb) from public.quote_line_costs c join public.quote_lines l on l.id=c.quote_line_id where l.quote_id=q.id))::text)
 from public.quotes q where q.order_id=p_order_id;
$$;
revoke all on function private.psc_commercial_fingerprint(uuid) from public,anon,authenticated;

create or replace function private.psc_stamp_commercial_control() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if not private.is_psc_admin() then raise exception 'PSC administrator required'; end if;
 new.quote_fingerprint:=coalesce(private.psc_commercial_fingerprint(new.order_id),'');
 new.updated_by:=auth.uid(); new.updated_at:=now(); return new;
end $$;
revoke all on function private.psc_stamp_commercial_control() from public,anon,authenticated;
create trigger stamp_commercial_control before insert or update on public.order_commercial_controls for each row execute function private.psc_stamp_commercial_control();

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
revoke all on function private.psc_check_commercial_release() from public,anon,authenticated;
create trigger commercial_release_gate before update of status on public.orders for each row execute function private.psc_check_commercial_release();

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
revoke all on function public.psc_set_commercial_status(uuid,text) from public,anon;
grant execute on function public.psc_set_commercial_status(uuid,text) to authenticated;

create table public.commercial_control_history (
 id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id),
 evidence jsonb not null, recorded_by uuid not null references auth.users(id), recorded_at timestamptz not null default now()
);
alter table public.commercial_control_history enable row level security;
revoke all on public.commercial_control_history from anon,authenticated;
grant select on public.commercial_control_history to authenticated;
create policy commercial_history_admin on public.commercial_control_history for select to authenticated using(private.is_psc_admin());
create or replace function private.psc_log_commercial_control() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 insert into public.commercial_control_history(order_id,evidence,recorded_by) values(new.order_id,to_jsonb(new),auth.uid());
 return new;
end $$;
revoke all on function private.psc_log_commercial_control() from public,anon,authenticated;
create trigger log_commercial_control after insert or update on public.order_commercial_controls for each row execute function private.psc_log_commercial_control();
