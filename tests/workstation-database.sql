-- Isolated transaction: no test records, emails or tasks persist.
begin;
do $$
declare a uuid; outsider uuid; task uuid; contact uuid;
begin
 select user_id into a from profiles where is_psc_admin limit 1;
 select user_id into outsider from profiles where not is_psc_admin limit 1;
 if a is null or outsider is null then raise exception 'Missing role fixtures'; end if;
 perform set_config('request.jwt.claim.sub',a::text,true);
 execute 'set local role authenticated';
 insert into psc_crm_tasks(title,due_date) values('ROLLBACK ONLY workspace acceptance',current_date) returning id into task;
 update psc_crm_tasks set completed=true,updated_by=a where id=task;
 if not (select completed from psc_crm_tasks where id=task) then raise exception 'Admin update failed';end if;
 insert into mail_contacts(email,first_name,status,marketing_basis,created_by) values('workspace-test@example.invalid','Rollback','paused','not_set',a) returning id into contact;
 insert into psc_crm_notes(contact_id,note) values(contact,'Rollback only');
 perform set_config('request.jwt.claim.sub',outsider::text,true);
 if exists(select 1 from psc_crm_tasks where id=task) or exists(select 1 from psc_crm_notes where contact_id=contact) then raise exception 'Customer can read private CRM';end if;
 begin
  insert into psc_crm_tasks(title,due_date) values('Unauthorized',current_date);
  raise exception 'Unauthorized insert accepted';
 exception when insufficient_privilege then null;
 end;
 execute 'reset role';
end $$;
rollback;
select 'PASS: admin task/contact/note writes; ordinary-user read/write denied; all writes rolled back' as result;
