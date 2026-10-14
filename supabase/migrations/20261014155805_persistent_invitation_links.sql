alter table public.psc_customer_invitations add column persistent_link boolean not null default false;
-- Preserve snapshots for already-approved schedules when this metadata column is added.
update public.psc_email_schedules set snapshot=snapshot||'{"persistent_link":false}'::jsonb where target='customer-invitations' and status='pending';

create or replace function private.activate_customer_invitation(p_id uuid,p_hash text,p_user uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare i public.psc_customer_invitations; u auth.users; school uuid;
begin
 if current_setting('role',true)<>'service_role' then raise exception 'Internal invitation service required';end if;
 select * into i from public.psc_customer_invitations where id=p_id for update;
 select * into u from auth.users where id=p_user;
 if i.id is null or i.status not in ('sent','pending_activation') or (not i.persistent_link and (i.expires_at is null or i.expires_at<=now())) or i.token_hash is distinct from p_hash or i.auth_user_id is distinct from p_user
  or lower(u.email) is distinct from i.recipient_email or u.email_confirmed_at is null or coalesce(u.encrypted_password,'')='' then raise exception 'Invitation invalid, expired, already used, or identity unverified';end if;
 if exists(select 1 from public.memberships m join public.account_groups g on g.id=m.group_id where m.user_id=p_user and g.slug='psc-demo-group') then raise exception 'Demo accounts cannot activate customer invitations';end if;
 if not exists(select 1 from public.account_groups where id=i.group_id and active and slug<>'psc-demo-group') then raise exception 'Invitation group unavailable';end if;
 if exists(select 1 from unnest(i.school_ids) x left join public.schools s on s.id=x where s.group_id is distinct from i.group_id or not coalesce(s.active,false)) then raise exception 'Invitation school scope changed';end if;
 insert into public.profiles(user_id,full_name,is_psc_admin,account_type) values(p_user,i.full_name,false,'institutional') on conflict(user_id) do nothing;
 foreach school in array i.school_ids loop
  insert into public.memberships(user_id,group_id,school_id,role) values(p_user,i.group_id,school,case i.role when 'school_clinic_user' then 'school_user' else 'management_approver' end) on conflict(user_id,group_id,school_id,role) do nothing;
 end loop;
 update public.psc_customer_invitations set status='activated',activated_at=now(),token_hash=null,updated_at=now() where id=i.id;
 insert into public.psc_invitation_events(invitation_id,event,actor) values(i.id,'activated',p_user);
 return jsonb_build_object('activated',true,'school_ids',i.school_ids);
end $$;
revoke all on function private.activate_customer_invitation(uuid,text,uuid) from public,anon,authenticated;
grant execute on function private.activate_customer_invitation(uuid,text,uuid) to service_role;

