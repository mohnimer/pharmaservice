-- Run against the selected PSC project. ALL test writes and notifications roll back.
begin;
do $$
declare
  v_customer uuid; v_admin uuid; v_demo uuid; v_school uuid; v_other uuid;
  v_key uuid := gen_random_uuid(); v_result jsonb; v_replay jsonb; v_before bigint;
  v_lines jsonb := '[{"line_description":"Backend acceptance test — not a customer order","quantity":2,"pack_snapshot":"Test only"}]';
begin
  select m.user_id,s.id into v_customer,v_school from public.memberships m
    join public.profiles p on p.user_id=m.user_id
    join public.account_groups g on g.id=m.group_id
    join public.schools s on s.group_id=g.id
    where not p.is_psc_admin and g.slug<>'psc-demo-group' and s.active limit 1;
  select user_id into v_admin from public.profiles where is_psc_admin limit 1;
  select m.user_id,s.id into v_demo,v_other from public.memberships m
    join public.account_groups g on g.id=m.group_id join public.schools s on s.group_id=g.id
    where g.slug='psc-demo-group' limit 1;
  if v_customer is null or v_admin is null or v_demo is null then raise exception 'Missing test access fixtures'; end if;
  perform set_config('request.jwt.claim.sub',v_customer::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',v_customer,'role','authenticated')::text,true);
  execute 'set local role authenticated';
  v_result:=public.psc_submit_institutional_request(v_school,v_key,v_lines,'Test — rollback required');
  v_replay:=public.psc_submit_institutional_request(v_school,v_key,v_lines,'Test — rollback required');
  if v_result->>'id' is distinct from v_replay->>'id' or not (v_replay->>'replayed')::boolean then raise exception 'Retry duplicated request'; end if;
  if (select count(*) from public.order_lines where order_id=(v_result->>'id')::uuid)<>1 then raise exception 'Missing or duplicate lines'; end if;
  begin
    perform public.psc_submit_institutional_request(v_school,v_key,v_lines,'Changed requirement');
    raise exception 'TEST FAILURE: changed payload accepted';
  exception when others then if sqlerrm='TEST FAILURE: changed payload accepted' then raise; end if; end;
  v_before:=(select count(*) from public.orders);
  begin
    perform public.psc_submit_institutional_request(v_school,gen_random_uuid(),
      jsonb_build_array(jsonb_build_object('line_description','Invalid foreign key','quantity',1,'product_option_id',gen_random_uuid())),'Rollback line error');
    raise exception 'TEST FAILURE: invalid line accepted';
  exception when others then if sqlerrm='TEST FAILURE: invalid line accepted' then raise; end if; end;
  if (select count(*) from public.orders)<>v_before then raise exception 'Partial order left after line failure'; end if;
  begin
    perform public.psc_submit_institutional_request(v_other,gen_random_uuid(),v_lines,'Wrong site');
    raise exception 'TEST FAILURE: unauthorized site accepted';
  exception when others then if sqlerrm='TEST FAILURE: unauthorized site accepted' then raise; end if; end;
  begin
    insert into public.commercial_actions(entity_type,entity_id,next_action,owner_label,due_date)
      values('order',(v_result->>'id')::uuid,'Unauthorized','Test',current_date);
    raise exception 'TEST FAILURE: customer wrote admin action';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claim.sub',v_demo::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',v_demo,'role','authenticated')::text,true);
  begin
    perform public.psc_submit_institutional_request(v_other,gen_random_uuid(),v_lines,'Demo');
    raise exception 'TEST FAILURE: demo submitted request';
  exception when others then if sqlerrm='TEST FAILURE: demo submitted request' then raise; end if; end;
  perform set_config('request.jwt.claim.sub',v_admin::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',v_admin,'role','authenticated')::text,true);
  insert into public.commercial_actions(entity_type,entity_id,next_action,owner_label,due_date)
    values('order',(v_result->>'id')::uuid,'Check specification','Test owner',current_date);
  update public.commercial_actions set completed=true where entity_id=(v_result->>'id')::uuid;
  if not exists(select 1 from public.commercial_actions where entity_id=(v_result->>'id')::uuid and completed) then raise exception 'Admin action persistence failed'; end if;
  if (select status from public.orders where id=(v_result->>'id')::uuid)<>'under_review' then raise exception 'Follow-up altered order state'; end if;
  perform set_config('request.jwt.claim.sub',v_customer::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',v_customer,'role','authenticated')::text,true);
  if exists(select 1 from public.commercial_actions) then raise exception 'Customer can read internal actions'; end if;
end $$;
rollback;
