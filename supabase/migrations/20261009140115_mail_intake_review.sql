create table public.psc_mail_intakes (
 message_id uuid primary key references public.psc_mail_messages(id),
 customer_name text not null default '', institution text not null default '', customer_email text not null default '',
 lines jsonb not null default '[]'::jsonb check(jsonb_typeof(lines)='array' and jsonb_array_length(lines)<=100),
 source_text text not null default '' check(length(source_text)<=100000),
 is_test boolean not null default false, reviewed boolean not null default false,
 revision integer not null default 1, updated_by uuid not null references auth.users(id), updated_at timestamptz not null default now(),
 order_id uuid references public.orders(id)
);
alter table public.psc_mail_intakes enable row level security;
revoke all on public.psc_mail_intakes from anon,authenticated;
grant select on public.psc_mail_intakes to authenticated;
grant all on public.psc_mail_intakes to service_role;
create policy intake_admin_read on public.psc_mail_intakes for select to authenticated using(private.is_psc_admin());
alter table public.psc_mail_drafts add column intake_message_id uuid references public.psc_mail_intakes(message_id), add column intake_revision integer;
create index mail_drafts_intake on public.psc_mail_drafts(intake_message_id);
-- Atomic versioned saves prevent one administrator overwriting another's review.
create function public.psc_save_mail_intake(p_message_id uuid,p_revision integer,p_data jsonb,p_user uuid) returns public.psc_mail_intakes language plpgsql security definer set search_path='' as $$
declare r public.psc_mail_intakes; m public.psc_mail_messages;begin
 select * into m from public.psc_mail_messages where id=p_message_id and direction='inbound' for update;
 if not found then raise exception 'source_missing';end if;
 select * into r from public.psc_mail_intakes where message_id=p_message_id for update;
 if exists(select 1 from public.psc_mail_drafts where intake_message_id=p_message_id and status in ('sending','uncertain')) then raise exception 'Resolve pending send before editing';end if;
 if coalesce(r.revision,0)<>p_revision then raise exception 'intake_changed';end if;
 insert into public.psc_mail_intakes(message_id,customer_name,institution,customer_email,lines,source_text,is_test,reviewed,updated_by)
 values(p_message_id,p_data->>'customer_name',p_data->>'institution',p_data->>'customer_email',p_data->'lines',p_data->>'source_text',coalesce((p_data->>'is_test')::boolean,false) or m.subject ~* '\mtest\M',(p_data->>'reviewed')::boolean,p_user)
 on conflict(message_id) do update set customer_name=excluded.customer_name,institution=excluded.institution,customer_email=excluded.customer_email,lines=excluded.lines,source_text=excluded.source_text,is_test=psc_mail_intakes.is_test or excluded.is_test,reviewed=excluded.reviewed,revision=psc_mail_intakes.revision+1,updated_by=p_user,updated_at=now()
 returning * into r;return r;
end $$;
revoke all on function public.psc_save_mail_intake(uuid,integer,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.psc_save_mail_intake(uuid,integer,jsonb,uuid) to service_role;
-- Reuse the established submission path, retaining approval and account-access controls.
create function public.psc_convert_mail_intake(p_message_id uuid,p_revision integer,p_school_id uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare i public.psc_mail_intakes;result jsonb;begin
 if not private.is_psc_admin() then raise exception 'Administrator required';end if;
 select * into i from public.psc_mail_intakes where message_id=p_message_id;
 if i.is_test then raise exception 'Test intake cannot create a live request';end if;
 if i.revision is distinct from p_revision or not i.reviewed then raise exception 'Review current intake first';end if;
 select public.psc_submit_institutional_request(p_school_id,p_message_id,
 (select jsonb_agg(jsonb_build_object('line_description',x->>'description','quantity',(x->>'quantity')::numeric,'psc_sku_snapshot',nullif(x->>'sku',''),'requested_presentation',concat(x->>'unit','; ',x->>'specification'),'product_option_snapshot',jsonb_build_object('original_requirement',x->>'original','suggested_product',x->>'product_name')))
 from jsonb_array_elements(i.lines) x where x->>'decision' in ('matched','sourcing')),
 concat('Email intake: ',i.institution,' / ',i.customer_name,' / ',i.customer_email,'; source ',p_message_id)) into result;
 return result;
end $$;
revoke all on function public.psc_convert_mail_intake(uuid,integer,uuid) from public,anon;
grant execute on function public.psc_convert_mail_intake(uuid,integer,uuid) to authenticated;
create function public.psc_claim_intake_draft(p_draft uuid,p_updated_at timestamptz,p_user uuid) returns public.psc_mail_drafts language plpgsql security definer set search_path='' as $$
declare d public.psc_mail_drafts;i public.psc_mail_intakes;begin
 select * into d from public.psc_mail_drafts where id=p_draft;
 select * into i from public.psc_mail_intakes where message_id=d.intake_message_id for update;
 if not found or not i.reviewed or i.revision<>d.intake_revision or (i.is_test and lower(d.recipient)<>'info@pharmaservice.ae') then raise exception 'Intake changed';end if;
 update public.psc_mail_drafts set status='sending',approved_by=p_user,approved_at=now(),updated_at=now() where id=p_draft and status='draft' and updated_at=p_updated_at returning * into d;
 if not found then raise exception 'Draft changed';end if;return d;
end $$;
revoke all on function public.psc_claim_intake_draft(uuid,timestamptz,uuid) from public,anon,authenticated;
grant execute on function public.psc_claim_intake_draft(uuid,timestamptz,uuid) to service_role;
