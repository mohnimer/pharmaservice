-- Additive release: existing quotation and order states remain unchanged.
alter table public.orders add column if not exists submission_key uuid;
alter table public.orders add column if not exists submission_fingerprint text;
create unique index if not exists orders_submission_key_idx
  on public.orders(requested_by, submission_key) where submission_key is not null;

create table public.commercial_actions (
  entity_type text not null check (entity_type in ('order','enquiry','custom')),
  entity_id uuid not null,
  next_action text not null check (char_length(next_action) between 1 and 500),
  owner_label text not null check (char_length(owner_label) between 1 and 120),
  due_date date not null,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid not null default auth.uid() references auth.users(id),
  primary key(entity_type,entity_id)
);
alter table public.commercial_actions enable row level security;
revoke all on public.commercial_actions from anon;
grant select,insert,update on public.commercial_actions to authenticated;
create policy "PSC admins manage commercial actions" on public.commercial_actions
  for all to authenticated using (private.is_psc_admin())
  with check (private.is_psc_admin() and updated_by = (select auth.uid())
    and ((entity_type='order' and exists(select 1 from public.orders o where o.id=entity_id))
      or (entity_type='enquiry' and exists(select 1 from public.institutional_enquiries e where e.id=entity_id))
      or (entity_type='custom' and exists(select 1 from public.custom_requests c where c.id=entity_id))));

create or replace function public.psc_submit_institutional_request(
  p_school_id uuid, p_submission_key uuid, p_lines jsonb, p_note text default ''
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_group uuid;
  v_order public.orders%rowtype;
  v_line jsonb;
  v_fingerprint text;
begin
  if v_uid is null or p_submission_key is null then raise exception 'Sign-in and submission key required'; end if;
  if exists(select 1 from public.memberships m join public.account_groups g on g.id=m.group_id
    where m.user_id=v_uid and g.slug='psc-demo-group') then raise exception 'Demo requests cannot be submitted'; end if;
  select s.group_id into v_group from public.schools s
    where s.id=p_school_id and s.active and private.can_access_school(s.id);
  if v_group is null then raise exception 'Site access not authorized'; end if;
  if jsonb_typeof(p_lines) is distinct from 'array' then raise exception 'Request lines must be an array'; end if;
  if jsonb_array_length(p_lines) not between 1 and 300 or octet_length(p_lines::text)>500000
    or char_length(coalesce(p_note,''))>10000 then raise exception 'Request exceeds supported limits'; end if;
  v_fingerprint := md5(jsonb_build_object('school',p_school_id,'lines',p_lines,'note',coalesce(p_note,''))::text);
  -- Serialize retries for the same user/key, including concurrent submissions.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_uid::text||p_submission_key::text,0));
  select * into v_order from public.orders where requested_by=v_uid and submission_key=p_submission_key;
  if found then
    if v_order.submission_fingerprint is distinct from v_fingerprint then raise exception 'Submission key was used for a different requirement'; end if;
    return jsonb_build_object('id',v_order.id,'order_number',v_order.order_number,'replayed',true);
  end if;
  for v_line in select value from jsonb_array_elements(p_lines) loop
    if jsonb_typeof(v_line) is distinct from 'object'
      or jsonb_typeof(v_line->'quantity') is distinct from 'number'
      or (v_line->>'quantity')::numeric not between 0.001 and 1000000
      or char_length(coalesce(v_line->>'line_description','')) not between 1 and 2000
    then raise exception 'Each line needs a description and a positive quantity'; end if;
  end loop;
  insert into public.orders(order_number,group_id,school_id,requested_by,status,note,channel,submission_key,submission_fingerprint)
  values('PSC-REQ-'||to_char(now(),'YYYYMM')||'-'||replace(p_submission_key::text,'-',''),
    v_group,p_school_id,v_uid,'under_review',coalesce(p_note,''),'institutional',p_submission_key,v_fingerprint)
  returning * into v_order;
  -- A line error rolls back the order AND its queued notification in this transaction.
  insert into public.order_lines(order_id,product_id,psc_sku_snapshot,line_description,brand_model_snapshot,
    pack_snapshot,quantity,family_id,family_name_snapshot,product_option_id,requested_presentation,
    brand_preference_mode,requested_brand,product_option_snapshot)
  select v_order.id,null,x.psc_sku_snapshot,x.line_description,x.brand_model_snapshot,x.pack_snapshot,
    x.quantity,x.family_id,x.family_name_snapshot,x.product_option_id,x.requested_presentation,
    case when x.family_id is not null then coalesce(x.brand_preference_mode,'no_preference') else x.brand_preference_mode end,x.requested_brand,x.product_option_snapshot
  from jsonb_to_recordset(p_lines) as x(psc_sku_snapshot text,line_description text,brand_model_snapshot text,
    pack_snapshot text,quantity numeric,family_id text,family_name_snapshot text,product_option_id uuid,
    requested_presentation text,brand_preference_mode text,requested_brand text,product_option_snapshot jsonb);
  return jsonb_build_object('id',v_order.id,'order_number',v_order.order_number,'replayed',false);
end;
$$;
revoke all on function public.psc_submit_institutional_request(uuid,uuid,jsonb,text) from public,anon;
grant execute on function public.psc_submit_institutional_request(uuid,uuid,jsonb,text) to authenticated;
