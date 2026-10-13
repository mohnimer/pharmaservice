-- Sales intentions stay separate from customer authorization, quotations, POs and recognized revenue.
create table public.psc_sales_opportunities (
 id uuid primary key default gen_random_uuid(),
 contact_id uuid not null references public.mail_contacts(id),
 school_id uuid references public.schools(id),
 order_id uuid references public.orders(id),
 title text not null check(length(trim(title)) between 1 and 300),
 stage text not null default 'prospect' check(stage in ('prospect','discovery','requirements','quoting','awaiting_decision','proceeding','closed_won','closed_lost')),
 estimated_value_ex_vat numeric(14,2) check(estimated_value_ex_vat>=0 and estimated_value_ex_vat<>'NaN'::numeric),
 requirement text not null default '' check(length(requirement)<=4000),
 next_action text not null default '' check(length(next_action)<=500),
 next_action_due date,
 owner_label text not null default 'Mohamed' check(length(trim(owner_label)) between 1 and 120),
 decision_contact text not null default '' check(length(decision_contact)<=300),
 decision_note text not null default '' check(length(decision_note)<=2000),
 created_by uuid not null default auth.uid() references auth.users(id),
 updated_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check(stage in ('closed_won','closed_lost') or (length(trim(next_action))>0 and next_action_due is not null)),
 check(stage not in ('closed_won','closed_lost','proceeding') or length(trim(decision_note))>0)
);
alter table public.psc_sales_opportunities enable row level security;
revoke all on public.psc_sales_opportunities from anon,authenticated;
grant select,insert,update on public.psc_sales_opportunities to authenticated;
grant all on public.psc_sales_opportunities to service_role;
create policy sales_admin_read on public.psc_sales_opportunities for select to authenticated using ((select private.is_psc_admin()));
create policy sales_admin_insert on public.psc_sales_opportunities for insert to authenticated with check ((select private.is_psc_admin()) and created_by=auth.uid() and updated_by=auth.uid());
create policy sales_admin_update on public.psc_sales_opportunities for update to authenticated using ((select private.is_psc_admin())) with check ((select private.is_psc_admin()) and updated_by=auth.uid());
-- Never link a live opportunity to a demo campus or order, or to a mismatched campus.
create function private.psc_sales_scope() returns trigger language plpgsql set search_path='' as $$
begin
 if new.school_id is not null and exists(select 1 from public.schools s join public.account_groups g on g.id=s.group_id where s.id=new.school_id and g.slug='psc-demo-group') then raise exception 'demo_scope_not_allowed';end if;
 if new.order_id is not null and exists(select 1 from public.orders o join public.account_groups g on g.id=o.group_id where o.id=new.order_id and (g.slug='psc-demo-group' or new.school_id is not null and o.school_id<>new.school_id)) then raise exception 'order_scope_mismatch';end if;
 if TG_OP='UPDATE' then new.created_by=old.created_by;new.created_at=old.created_at;end if;
 new.updated_at=now();return new;
end $$;
revoke all on function private.psc_sales_scope() from public,anon,authenticated;
create trigger sales_scope before insert or update on public.psc_sales_opportunities for each row execute function private.psc_sales_scope();
create index sales_next_action on public.psc_sales_opportunities(next_action_due) where stage not in ('closed_won','closed_lost');
create index sales_contact on public.psc_sales_opportunities(contact_id);
create unique index crm_service_followup_once on public.psc_crm_tasks(order_id,source_rule) where order_id is not null and source_rule in ('service_day7','service_day30');
