-- Preview foundation. No cron activation, outgoing email, customer assignments or live data are seeded.
create schema if not exists private;
create table public.ps_learning_modules(
 id text not null, version integer not null check(version>0), document jsonb not null,
 created_at timestamptz not null default now(), primary key(id,version));
create table public.ps_readiness_banks(
 id text not null, version integer not null check(version>0), document jsonb not null,
 created_at timestamptz not null default now(), primary key(id,version));
create table public.ps_learning_progress(
 user_id uuid not null references auth.users(id), school_id uuid not null references public.schools(id),
 module_id text not null, module_version integer not null, slide integer not null default 0 check(slide>=0),
 completed_at timestamptz, revision integer not null default 1, updated_at timestamptz not null default now(),
 primary key(user_id,school_id,module_id,module_version), foreign key(module_id,module_version) references public.ps_learning_modules(id,version));
create table public.ps_learning_quiz_drafts(
 user_id uuid not null references auth.users(id),school_id uuid not null references public.schools(id),
 module_id text not null,module_version integer not null,responses jsonb not null default '{}',
 revision integer not null default 1,updated_at timestamptz not null default now(),
 primary key(user_id,school_id,module_id,module_version),foreign key(module_id,module_version) references public.ps_learning_modules(id,version));
create table public.ps_learning_attempts(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
 school_id uuid not null references public.schools(id), module_id text not null,module_version integer not null,
 submission_key uuid not null unique, responses jsonb not null, result jsonb not null, content_snapshot jsonb not null,
 created_at timestamptz not null default now(),foreign key(module_id,module_version) references public.ps_learning_modules(id,version));
create table public.ps_readiness_settings(
 school_id uuid primary key references public.schools(id), assigned_user uuid references auth.users(id),
 recipient_user uuid references auth.users(id), purchasing_user uuid references auth.users(id), jurisdiction text not null default 'Not confirmed',
 clinic_type text not null default 'educational',bank_id text not null default 'ps-readiness-pilot',conditions jsonb not null default '{"oxygen":"unknown","aed":"unknown"}',
 weekday integer not null default 1 check(weekday between 0 and 6),reminder_time time not null default '09:00',
 reminders boolean not null default true, email_enabled boolean not null default false,
 ps_share boolean not null default false, revision integer not null default 1,updated_at timestamptz not null default now());
create table public.ps_readiness_reports(
 id uuid primary key default gen_random_uuid(),school_id uuid not null references public.schools(id),
 owner_id uuid not null references auth.users(id), week_start date not null,kind text not null check(kind in ('baseline','weekly')),
 bank_id text not null, bank_version integer not null,bank_snapshot jsonb not null,context_snapshot jsonb not null,
 answers jsonb not null default '{}',revision integer not null default 1,
 status text not null default 'draft' check(status in ('draft','submitted','reviewed')),
 result jsonb,owner_name text not null default '',site_name text not null default '',
 submitted_at timestamptz,reviewed_at timestamptz,reviewed_by uuid references auth.users(id),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(school_id,week_start),foreign key(bank_id,bank_version) references public.ps_readiness_banks(id,version));
create table public.ps_readiness_issues(
 id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id),
 report_id uuid not null references public.ps_readiness_reports(id), question_id text not null,
 label text not null,critical boolean not null default false,category text not null,
 family_id text, purchase_kind text,quantity numeric check(quantity>0 and quantity<=10000),
 status text not null default 'open' check(status in ('open','resolved')),resolution text,
 resolved_by uuid references auth.users(id),resolved_at timestamptz,created_at timestamptz not null default now());
create unique index ps_readiness_one_open_issue on public.ps_readiness_issues(school_id,question_id) where status='open';
create table public.ps_readiness_proposals(
 id uuid primary key default gen_random_uuid(),report_id uuid not null references public.ps_readiness_reports(id),
 issue_id uuid not null references public.ps_readiness_issues(id),school_id uuid not null references public.schools(id),
 proposed_by uuid not null references auth.users(id),family_id text,sku text,product_option_id uuid,
 product_snapshot jsonb not null,quantity numeric not null check(quantity>0 and quantity<=10000),
 status text not null default 'proposed' check(status in ('proposed','removed','requested')),
 order_id uuid references public.orders(id),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create unique index ps_readiness_active_proposal on public.ps_readiness_proposals(report_id,issue_id,coalesce(sku,''),coalesce(family_id,'')) where status<>'removed';
create table public.ps_readiness_rfq_links(
 report_id uuid primary key references public.ps_readiness_reports(id),school_id uuid not null references public.schools(id),
 order_id uuid not null unique references public.orders(id),requested_by uuid not null references auth.users(id),
 created_at timestamptz not null default now());
create table public.ps_readiness_notifications(
 id uuid primary key default gen_random_uuid(),school_id uuid not null references public.schools(id),
 recipient_user uuid not null references auth.users(id),report_id uuid references public.ps_readiness_reports(id),
 event_key text not null unique,kind text not null check(kind in ('due','overdue','report')),
 state text not null default 'unread' check(state in ('unread','read')),
 email_state text not null default 'disabled' check(email_state in ('disabled','queued','sending','sent','failed','uncertain','revoked')),
 attempts integer not null default 0,last_error text,provider_id text,created_at timestamptz not null default now());
create index ps_reports_site_week on public.ps_readiness_reports(school_id,week_start desc);
create index ps_issues_site on public.ps_readiness_issues(school_id,status);
create index ps_notifications_recipient on public.ps_readiness_notifications(recipient_user,created_at desc);

create function private.ps_member(p_school uuid,p_user uuid default auth.uid()) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from auth.users u join public.memberships m on m.user_id=u.id join public.schools s on s.group_id=m.group_id join public.account_groups g on g.id=s.group_id
 where u.id=p_user and u.email_confirmed_at is not null and coalesce(u.banned_until,'-infinity')<now()
 and s.id=p_school and s.active and g.active and g.slug<>'psc-demo-group'
 and (m.school_id=s.id or (m.school_id is null and m.role='group_admin')));
$$;
create function private.ps_manager(p_school uuid,p_user uuid default auth.uid()) returns boolean language sql stable security definer set search_path='' as $$
 select private.ps_member(p_school,p_user) and exists(select 1 from public.memberships m join public.schools s on s.group_id=m.group_id
 where s.id=p_school and m.user_id=p_user and m.role in ('group_admin','management_approver') and (m.school_id=s.id or (m.school_id is null and m.role='group_admin')));
$$;
create function private.ps_nurse(p_school uuid,p_user uuid default auth.uid()) returns boolean language sql stable security definer set search_path='' as $$
 select private.ps_member(p_school,p_user) and exists(select 1 from public.memberships m join public.schools s on s.group_id=m.group_id
 where s.id=p_school and m.user_id=p_user and m.role in ('school_user','group_admin') and (m.school_id=s.id or (m.school_id is null and m.role='group_admin')));
$$;
create function private.ps_ps_access(p_school uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.is_psc_admin() and exists(select 1 from public.ps_readiness_settings c join public.schools s on s.id=c.school_id join public.account_groups g on g.id=s.group_id where c.school_id=p_school and c.ps_share and s.active and g.active and g.slug<>'psc-demo-group');
$$;
create function private.ps_read_report(p_school uuid,p_owner uuid,p_status text) returns boolean language sql stable security definer set search_path='' as $$
 select (private.ps_member(p_school) and (p_owner=auth.uid() or (p_status<>'draft' and private.ps_member(p_school))))
 or (p_status<>'draft' and private.ps_ps_access(p_school));
$$;
create function private.ps_read_issue(p_school uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.ps_member(p_school) or private.ps_ps_access(p_school);
$$;
revoke all on function private.ps_member(uuid,uuid),private.ps_manager(uuid,uuid),private.ps_nurse(uuid,uuid),private.ps_ps_access(uuid),private.ps_read_report(uuid,uuid,text),private.ps_read_issue(uuid) from public,anon;
grant execute on function private.ps_member(uuid,uuid),private.ps_manager(uuid,uuid),private.ps_nurse(uuid,uuid),private.ps_ps_access(uuid),private.ps_read_report(uuid,uuid,text),private.ps_read_issue(uuid) to authenticated;

alter table public.ps_learning_modules enable row level security;
alter table public.ps_readiness_banks enable row level security;
alter table public.ps_learning_progress enable row level security;
alter table public.ps_learning_quiz_drafts enable row level security;
create policy quiz_drafts on public.ps_learning_quiz_drafts for select to authenticated using(user_id=auth.uid() and private.ps_member(school_id));
grant select on public.ps_learning_quiz_drafts to authenticated;
alter table public.ps_learning_attempts enable row level security;
alter table public.ps_readiness_settings enable row level security;
alter table public.ps_readiness_reports enable row level security;
alter table public.ps_readiness_issues enable row level security;
alter table public.ps_readiness_proposals enable row level security;
alter table public.ps_readiness_rfq_links enable row level security;
alter table public.ps_readiness_notifications enable row level security;
create policy learning_content on public.ps_learning_modules for select to authenticated using(exists(select 1 from public.memberships m where m.user_id=auth.uid() and private.ps_member(m.school_id)) or private.is_psc_admin() or exists(select 1 from public.memberships m join public.schools s on s.group_id=m.group_id where m.user_id=auth.uid() and private.ps_member(s.id)));
create policy readiness_banks on public.ps_readiness_banks for select to authenticated using(private.is_psc_admin() or exists(select 1 from public.schools s where private.ps_member(s.id)));
create policy learning_progress on public.ps_learning_progress for select to authenticated using(private.ps_member(school_id) and (user_id=auth.uid() or private.ps_manager(school_id)));
create policy learning_attempts on public.ps_learning_attempts for select to authenticated using(private.ps_member(school_id) and (user_id=auth.uid() or private.ps_manager(school_id)));
create policy readiness_settings on public.ps_readiness_settings for select to authenticated using(private.ps_member(school_id));
create policy readiness_reports on public.ps_readiness_reports for select to authenticated using(private.ps_read_report(school_id,owner_id,status));
create policy readiness_issues on public.ps_readiness_issues for select to authenticated using(private.ps_read_issue(school_id));
create policy readiness_proposals on public.ps_readiness_proposals for select to authenticated using(private.ps_read_issue(school_id));
create policy readiness_links on public.ps_readiness_rfq_links for select to authenticated using(private.ps_read_issue(school_id));
create policy readiness_notifications on public.ps_readiness_notifications for select to authenticated using(recipient_user=auth.uid() and private.ps_member(school_id) and (kind<>'report' or private.ps_manager(school_id)));
grant select on public.ps_learning_modules,public.ps_readiness_banks,public.ps_learning_progress,public.ps_learning_attempts,public.ps_readiness_settings,public.ps_readiness_reports,public.ps_readiness_issues,public.ps_readiness_proposals,public.ps_readiness_rfq_links,public.ps_readiness_notifications to authenticated;
-- No direct client writes. All transitions below validate identity, scope, versions and state.

create function private.ps_score(p_bank jsonb,p_answers jsonb,p_context jsonb,p_kind text) returns jsonb language plpgsql immutable set search_path='' as $$
declare q jsonb;a jsonb;id text;v text;cond text;applicable boolean;total numeric:=0;earned numeric:=0;n integer:=0;answered integer:=0;unknown integer:=0;critical jsonb:='[]';gaps jsonb:='[]';na jsonb:='[]';score integer;grade text;
begin
 for q in select value from jsonb_array_elements(p_bank->'questions') loop
  if coalesce((q->>'baseline_only')::boolean,false) and p_kind<>'baseline' then continue;end if;
  id:=q->>'id';a:=coalesce(p_answers->id,'{}');v:=a->>'value';cond:=q->>'condition';applicable:=true;
  if cond is not null and p_context->'conditions'->>cond='no' then applicable:=false;end if;
  if q->>'requirement'='optional' and v='na' then applicable:=false;end if;
  if not applicable then na:=na||jsonb_build_array(id);continue;end if;
  n:=n+1;total:=total+(q->>'weight')::numeric;
  if v in ('yes','no','unknown') then answered:=answered+1;end if;
  if v='unknown' then unknown:=unknown+1;end if;
  if v='yes' and (cond is null or p_context->'conditions'->>cond in ('yes')) then earned:=earned+(q->>'weight')::numeric;
  else
   gaps:=gaps||jsonb_build_array(jsonb_build_object('id',id,'label',q->>'label','critical',q->'critical','unknown',coalesce(v,'missing') in ('unknown','missing'),'action',q->>'action','family_id',q->>'family_id','category',q->>'category','purchase_kind',q->>'purchase_kind'));
   if coalesce((q->>'critical')::boolean,false) then critical:=critical||jsonb_build_array(id);end if;
  end if;
 end loop;
 score:=case when total>0 then floor(100*earned/total)::integer else null end;
 if answered=n and n>0 then
 select band->>1 into grade from jsonb_array_elements(coalesce(p_bank->'grade_bands','[[97,"A+"],[93,"A"],[90,"A−"],[80,"B"],[70,"C"],[60,"D"],[0,"F"]]'::jsonb)) band where score>=(band->>0)::numeric order by (band->>0)::numeric desc limit 1;
 end if;
 return jsonb_build_object('score',case when answered=n then score else null end,'grade',grade,'complete',answered=n and n>0,'completeness',case when n>0 then floor(100.0*answered/n) else 0 end,'answered',answered,'applicable',n,'unknown',unknown,'critical',critical,'gaps',gaps,'excluded',na,'scoring_version',p_bank->>'scoring_version','pilot',true);
end $$;
revoke all on function private.ps_score(jsonb,jsonb,jsonb,text) from public,anon,authenticated;

create function private.ps_workshop(p_action text,p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare uid uuid:=auth.uid();sid uuid:=(p->>'school_id')::uuid;mod public.ps_learning_modules%rowtype;b public.ps_readiness_banks%rowtype;rep public.ps_readiness_reports%rowtype;cfg public.ps_readiness_settings%rowtype;issue public.ps_readiness_issues%rowtype;
 doc jsonb;q jsonb;a jsonb;result jsonb;prior jsonb;rowdata jsonb;items jsonb;lines jsonb;item jsonb;snap jsonb;outcome jsonb;week date;sid_name text;owner_name text;attempt uuid;good integer:=0;cnt integer:=0;slide integer;expected integer;qty numeric;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null and coalesce(banned_until,'-infinity')<now()) then raise exception 'Verified sign-in required';end if;
 if exists(select 1 from public.memberships m join public.account_groups g on g.id=m.group_id where m.user_id=uid and g.slug='psc-demo-group') then raise exception 'Demo writes are disabled';end if;
 if p_action='publish_content' then
  if not private.is_psc_admin() then raise exception 'PS administrator required';end if;
  doc:=p->'document';if octet_length(doc::text)>250000 or doc->>'status' not in ('pilot','reviewed') or char_length(doc->>'title') not between 1 and 200 then raise exception 'Invalid content';end if;
  if coalesce(doc->>'id','') !~ '^[a-z][a-z0-9-]{1,79}$' then raise exception 'Invalid content identifier';end if;
  if p->>'kind'='module' then
   if jsonb_typeof(doc->'slides')<>'array' or jsonb_typeof(doc->'quiz')<>'array' or jsonb_array_length(doc->'slides') not between 1 and 50 or jsonb_array_length(doc->'quiz') not between 1 and 50 or jsonb_typeof(doc->'minutes')<>'number' or (doc->>'minutes')::numeric not between 1 and 120 or (doc->>'pass_mark')::numeric not between 0 and 100 then raise exception 'Invalid lesson or assessment structure';end if;
   items:=doc->'quiz';
   for q in select value from jsonb_array_elements(items) loop
    if jsonb_typeof(q->'options')<>'array' or jsonb_array_length(q->'options') not between 2 and 8 or jsonb_typeof(q->'correct')<>'array' or jsonb_array_length(q->'correct')=0 then raise exception 'Invalid quiz question';end if;
    for a in select value from jsonb_array_elements(q->'correct') loop
     if jsonb_typeof(a)<>'number' or a::text !~ '^[0-7]$' or (a::text)::integer>=jsonb_array_length(q->'options') then raise exception 'Invalid correct answer';end if;
    end loop;
   end loop;
  elsif p->>'kind'='bank' then
   if jsonb_typeof(doc->'questions')<>'array' or jsonb_array_length(doc->'questions') not between 1 and 100 then raise exception 'Invalid question bank';end if;
   items:=doc->'questions';
   for q in select value from jsonb_array_elements(items) loop
    if jsonb_typeof(q->'weight')<>'number' or (q->>'weight')::numeric not between 1 and 10 or q->>'requirement' not in ('mandatory','conditional','optional') then raise exception 'Invalid readiness rule';end if;
   end loop;
  end if;
  for q in select value from jsonb_array_elements(items) loop
   if coalesce(q->>'id','') !~ '^[a-z][a-z0-9-]{1,79}$' or (select count(*) from jsonb_array_elements(items) x where x->>'id'=q->>'id')<>1 then raise exception 'Question identifiers must be unique and stable';end if;
  end loop;
  if p->>'kind'='module' then insert into public.ps_learning_modules values(doc->>'id',(doc->>'version')::integer,doc,now());
  elsif p->>'kind'='bank' then insert into public.ps_readiness_banks values(doc->>'id',(doc->>'version')::integer,doc,now());else raise exception 'Unknown content type';end if;
  return jsonb_build_object('saved',true);
 end if;
 if p_action='mapping_update' then
  if not private.is_psc_admin() then raise exception 'PS administrator required';end if;
  if jsonb_typeof(p->'question_ids')<>'array' or jsonb_array_length(p->'question_ids')>20 then raise exception 'Invalid mapping';end if;
  for a in select value from jsonb_array_elements(p->'question_ids') loop
   if not exists(select 1 from public.ps_readiness_banks bank_src cross join lateral jsonb_array_elements(bank_src.document->'questions') mapped where mapped->>'id'=a#>>'{}' and mapped->>'category' in ('supplies','equipment')) then raise exception 'Mapping needs a purchasing-related question';end if;
  end loop;
  update public.ps_readiness_catalogue set active=(p->>'active')::boolean,question_ids=array(select jsonb_array_elements_text(p->'question_ids')),revision=revision+1
  where sku=p->>'sku' and revision=(p->>'revision')::integer returning to_jsonb(ps_readiness_catalogue.*) into rowdata;
  if rowdata is null then raise exception 'Mapping changed or unavailable';end if;return rowdata;
 end if;
 if p_action='overview' then
  return jsonb_build_object('banks',(select coalesce(jsonb_agg(document),'[]') from public.ps_readiness_banks),'modules',(select coalesce(jsonb_agg(document),'[]') from public.ps_learning_modules),'catalogue',(select coalesce(jsonb_agg(to_jsonb(c)),'[]') from public.ps_readiness_catalogue c where active or private.is_psc_admin()),'links',(select coalesce(jsonb_agg(to_jsonb(l)),'[]') from public.ps_readiness_rfq_links l where private.ps_read_issue(l.school_id)),'sites',(select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'campus_name',s.campus_name,'manager',private.ps_manager(s.id),'can_configure',private.ps_manager(s.id) and exists(select 1 from public.memberships m where m.user_id=uid and m.group_id=s.group_id and m.role='group_admin' and (m.school_id is null or m.school_id=s.id)),'nurse',private.ps_nurse(s.id))),'[]') from public.schools s where private.ps_member(s.id) or private.ps_ps_access(s.id)),
   'reports',(select coalesce(jsonb_agg(to_jsonb(r) order by r.week_start desc),'[]') from public.ps_readiness_reports r where private.ps_read_report(r.school_id,r.owner_id,r.status)),
   'issues',(select coalesce(jsonb_agg(to_jsonb(i)),'[]') from public.ps_readiness_issues i where private.ps_read_issue(i.school_id)),
   'proposals',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from public.ps_readiness_proposals x where private.ps_read_issue(x.school_id)),
   'quiz_drafts',(select coalesce(jsonb_agg(to_jsonb(d)),'[]') from public.ps_learning_quiz_drafts d where d.user_id=uid and private.ps_member(d.school_id)),
   'training',(select coalesce(jsonb_agg(to_jsonb(t)),'[]') from public.ps_learning_attempts t where private.ps_member(t.school_id) and (t.user_id=uid or private.ps_manager(t.school_id))),
   'progress',(select coalesce(jsonb_agg(to_jsonb(t)),'[]') from public.ps_learning_progress t where private.ps_member(t.school_id) and (t.user_id=uid or private.ps_manager(t.school_id))),
   'settings',(select coalesce(jsonb_agg(to_jsonb(c)),'[]') from public.ps_readiness_settings c where private.ps_member(c.school_id)),
   'delivery',(select coalesce(jsonb_agg(jsonb_build_object('report_id',n.report_id,'kind',n.kind,'email_state',n.email_state)),'[]') from public.ps_readiness_notifications n join public.ps_readiness_reports r on r.id=n.report_id where private.ps_read_report(r.school_id,r.owner_id,r.status)),
   'notifications',(select coalesce(jsonb_agg(to_jsonb(n)),'[]') from public.ps_readiness_notifications n where n.recipient_user=uid and private.ps_member(n.school_id) and (n.kind<>'report' or private.ps_manager(n.school_id))),
   'members',(select coalesce(jsonb_agg(distinct jsonb_build_object('school_id',s.id,'user_id',m.user_id,'name',coalesce(pr.full_name,'Portal user'),'role',m.role)),'[]') from public.memberships m join public.schools s on s.group_id=m.group_id left join public.profiles pr on pr.user_id=m.user_id where private.ps_manager(s.id) and (m.school_id=s.id or (m.school_id is null and m.role='group_admin'))));
 end if;
 if not private.ps_member(sid) then raise exception 'Campus access denied';end if;
 if p_action='progress' then
  if not private.ps_nurse(sid) then raise exception 'Learning access denied';end if;
  select * into mod from public.ps_learning_modules where id=p->>'module_id' and version=(p->>'module_version')::integer;
  if not found then raise exception 'Module not found';end if;
  slide:=(p->>'slide')::integer;if slide<0 or slide>=jsonb_array_length(mod.document->'slides') then raise exception 'Invalid slide';end if;
  insert into public.ps_learning_progress(user_id,school_id,module_id,module_version,slide,completed_at)
  values(uid,sid,mod.id,mod.version,slide,case when slide=jsonb_array_length(mod.document->'slides')-1 then now() end)
  on conflict(user_id,school_id,module_id,module_version) do update set slide=excluded.slide,completed_at=coalesce(ps_learning_progress.completed_at,excluded.completed_at),revision=ps_learning_progress.revision+1,updated_at=now()
  where ps_learning_progress.revision=coalesce((p->>'revision')::integer,0) returning to_jsonb(ps_learning_progress.*) into rowdata;
  if rowdata is null then raise exception 'Progress changed on another device; reload';end if;return rowdata;
 end if;
 if p_action='quiz_save' then
  if not private.ps_nurse(sid) then raise exception 'Learning access denied';end if;
  if jsonb_typeof(p->'responses')<>'object' or octet_length((p->'responses')::text)>20000 then raise exception 'Invalid quiz draft';end if;
  insert into public.ps_learning_quiz_drafts(user_id,school_id,module_id,module_version,responses)
  values(uid,sid,p->>'module_id',(p->>'module_version')::integer,p->'responses')
  on conflict(user_id,school_id,module_id,module_version) do update set responses=excluded.responses,revision=ps_learning_quiz_drafts.revision+1,updated_at=now()
  where ps_learning_quiz_drafts.revision=coalesce((p->>'revision')::integer,0)
  returning to_jsonb(ps_learning_quiz_drafts.*) into rowdata;
  if rowdata is null then raise exception 'Quiz changed on another device; reload';end if;return rowdata;
 end if;
 if p_action='quiz' then
  if not private.ps_nurse(sid) then raise exception 'Learning access denied';end if;
  select * into mod from public.ps_learning_modules where id=p->>'module_id' and version=(p->>'module_version')::integer;if not found then raise exception 'Module not found';end if;
  if not exists(select 1 from public.ps_learning_progress where user_id=uid and school_id=sid and module_id=mod.id and module_version=mod.version and completed_at is not null) then raise exception 'Complete the lesson first';end if;
  select to_jsonb(t) into rowdata from public.ps_learning_attempts t where submission_key=(p->>'submission_key')::uuid;
  if rowdata is not null then if rowdata->>'user_id'<>uid::text or rowdata->'responses' is distinct from p->'responses' then raise exception 'Attempt key conflict';end if;return rowdata;end if;
  result:='[]';
  for q in select value from jsonb_array_elements(mod.document->'quiz') loop
   cnt:=cnt+1;a:=p->'responses'->(q->>'id');
   if a is null or jsonb_typeof(a)<>'array' or jsonb_array_length(a)=0 then raise exception 'Answer every quiz question';end if;
   if (select jsonb_agg(v order by v) from (select distinct value v from jsonb_array_elements(a)) z)=(select jsonb_agg(value order by value) from jsonb_array_elements(q->'correct')) then good:=good+1;result:=result||jsonb_build_array(jsonb_build_object('question_id',q->>'id','correct',true,'explanation',q->>'explanation'));
   else result:=result||jsonb_build_array(jsonb_build_object('question_id',q->>'id','correct',false,'explanation',q->>'explanation'));end if;
  end loop;
  insert into public.ps_learning_attempts(user_id,school_id,module_id,module_version,submission_key,responses,result,content_snapshot)
  values(uid,sid,mod.id,mod.version,(p->>'submission_key')::uuid,p->'responses',jsonb_build_object('score',floor(100.0*good/cnt),'passed',100.0*good/cnt>=(mod.document->>'pass_mark')::numeric,'questions',result),mod.document) returning to_jsonb(ps_learning_attempts.*) into rowdata;delete from public.ps_learning_quiz_drafts where user_id=uid and school_id=sid and module_id=mod.id and module_version=mod.version;return rowdata;
 end if;
 select * into cfg from public.ps_readiness_settings where school_id=sid;
 if p_action='configure' then
  if not private.ps_manager(sid) or not exists(select 1 from public.memberships m join public.schools s on s.group_id=m.group_id where s.id=sid and m.user_id=uid and m.role='group_admin' and (m.school_id=sid or m.school_id is null)) then raise exception 'School administrator required';end if;
  if not private.ps_nurse(sid,(p->>'assigned_user')::uuid) or not private.ps_manager(sid,coalesce(p->>'purchasing_user',p->>'recipient_user')::uuid) or not private.ps_manager(sid,(p->>'recipient_user')::uuid) then raise exception 'Assignee and recipient must have current campus authorization';end if;
  select * into b from public.ps_readiness_banks where id=coalesce(p->>'bank_id','ps-readiness-pilot') order by version desc limit 1;
  if not found or b.document->>'clinic_type' is distinct from p->>'clinic_type' or not (b.document->'jurisdictions' ? (p->>'jurisdiction')) then raise exception 'Unsupported clinic context';end if;
  if (p->'conditions'->>'oxygen') not in ('yes','no','unknown') or (p->'conditions'->>'aed') not in ('yes','no','unknown') then raise exception 'Conditions must be confirmed or unknown';end if;
  if cfg.school_id is not null and cfg.revision<>(p->>'revision')::integer then raise exception 'Settings changed; reload';end if;
  insert into public.ps_readiness_settings(school_id,assigned_user,recipient_user,purchasing_user,jurisdiction,clinic_type,bank_id,conditions,weekday,reminder_time,reminders,email_enabled,ps_share)
  values(sid,(p->>'assigned_user')::uuid,(p->>'recipient_user')::uuid,coalesce(p->>'purchasing_user',p->>'recipient_user')::uuid,p->>'jurisdiction',p->>'clinic_type',b.id,p->'conditions',(p->>'weekday')::integer,(p->>'reminder_time')::time,(p->>'reminders')::boolean,(p->>'email_enabled')::boolean,(p->>'ps_share')::boolean)
  on conflict(school_id) do update set assigned_user=excluded.assigned_user,recipient_user=excluded.recipient_user,purchasing_user=excluded.purchasing_user,jurisdiction=excluded.jurisdiction,clinic_type=excluded.clinic_type,bank_id=excluded.bank_id,conditions=excluded.conditions,weekday=excluded.weekday,reminder_time=excluded.reminder_time,reminders=excluded.reminders,email_enabled=excluded.email_enabled,ps_share=excluded.ps_share,revision=ps_readiness_settings.revision+1,updated_at=now()
  returning to_jsonb(ps_readiness_settings.*) into rowdata;
  -- Draft reassignment preserves answers and invalidates stale editor revisions. Submitted snapshots are immutable.
  update public.ps_readiness_reports set owner_id=(p->>'assigned_user')::uuid,owner_name=coalesce((select full_name from public.profiles where user_id=(p->>'assigned_user')::uuid),'Clinic user'),revision=revision+1 where school_id=sid and status='draft';
  return rowdata;
 end if;
 if not private.ps_nurse(sid) and p_action not in ('review','rfq','notification_read') then raise exception 'Clinic user required';end if;
 if p_action='start' then
  if cfg.assigned_user is distinct from uid then raise exception 'An administrator must assign this clinic check to you';end if;
  week:=date_trunc('week',now() at time zone 'Asia/Dubai')::date;
  select * into b from public.ps_readiness_banks where id=cfg.bank_id order by version desc limit 1;if not found then raise exception 'Question bank not installed';end if;
  select name||case when coalesce(campus_name,'')<>'' then ' · '||campus_name else '' end into sid_name from public.schools where id=sid;
  select full_name into owner_name from public.profiles where user_id=uid;
  insert into public.ps_readiness_reports(school_id,owner_id,week_start,kind,bank_id,bank_version,bank_snapshot,context_snapshot,site_name,owner_name)
  values(sid,uid,week,case when exists(select 1 from public.ps_readiness_reports where school_id=sid and status<>'draft') then 'weekly' else 'baseline' end,b.id,b.version,b.document,to_jsonb(cfg),sid_name,coalesce(owner_name,'Clinic user'))
  on conflict(school_id,week_start) do nothing;
  select to_jsonb(r) into rowdata from public.ps_readiness_reports r where school_id=sid and week_start=week;return rowdata;
 end if;
 if p_action='notification_read' then
  update public.ps_readiness_notifications set state='read' where id=(p->>'id')::uuid and recipient_user=uid and school_id=sid and (kind<>'report' or private.ps_manager(sid));return '{"saved":true}';
 end if;
 select * into rep from public.ps_readiness_reports where id=(p->>'report_id')::uuid and school_id=sid for update;if not found then raise exception 'Report not found';end if;
 if p_action in ('save','submit') then
  if rep.owner_id<>uid or cfg.assigned_user is distinct from uid then raise exception 'Assigned nurse required';end if;
  if p_action='submit' and rep.status<>'draft' then return to_jsonb(rep);end if;
  if rep.status<>'draft' or rep.revision<>(p->>'revision')::integer then raise exception 'Report changed on another device; reload';end if;
  if jsonb_typeof(p->'answers')<>'object' or octet_length((p->'answers')::text)>40000 then raise exception 'Invalid answers';end if;
  for q in select value from jsonb_array_elements(rep.bank_snapshot->'questions') loop
   a:=p->'answers'->(q->>'id');
   if a is not null and (a->>'value' not in ('yes','no','unknown','na') or char_length(coalesce(a->>'note',''))>300 or (a ? 'quantity' and (a->>'quantity') is not null and (a->>'quantity')::numeric not between 1 and 10000)) then raise exception 'Invalid answer';end if;
   if a->>'value'='na' and q->>'requirement'<>'optional' and (q->>'condition' is null or rep.context_snapshot->'conditions'->>(q->>'condition') is distinct from 'no') then raise exception 'Not applicable requires a confirmed condition';end if;
  end loop;
  if p_action='save' then update public.ps_readiness_reports set answers=p->'answers',revision=revision+1,updated_at=now() where id=rep.id returning to_jsonb(ps_readiness_reports.*) into rowdata;return rowdata;end if;
  if p->>'reviewed' is distinct from 'true' then raise exception 'Review answers before submission';end if;
  result:=private.ps_score(rep.bank_snapshot,p->'answers',rep.context_snapshot,rep.kind);
  if not (result->>'complete')::boolean then raise exception 'Complete all applicable questions; use Not sure where needed';end if;
  -- Explicit issue resolution only; a positive answer alone never closes an older gap.
  for item in select value from jsonb_array_elements(coalesce(p->'resolutions','[]')) loop
   if char_length(coalesce(item->>'note',''))<3 then raise exception 'Resolution confirmation required';end if;
   update public.ps_readiness_issues set status='resolved',resolution=left(item->>'note',300),resolved_by=uid,resolved_at=now()
   where id=(item->>'id')::uuid and school_id=sid and status='open' and p->'answers'->question_id->>'value'='yes';
  end loop;
  for item in select value from jsonb_array_elements(result->'gaps') loop
   insert into public.ps_readiness_issues(school_id,report_id,question_id,label,critical,category,family_id,purchase_kind,quantity)
   values(sid,rep.id,item->>'id',item->>'label',(item->>'critical')::boolean,item->>'category',item->>'family_id',item->>'purchase_kind',case when p->'answers'->(item->>'id')->>'value'='no' then nullif(p->'answers'->(item->>'id')->>'quantity','')::numeric end)
   on conflict(school_id,question_id) where status='open' do update set quantity=excluded.quantity,critical=ps_readiness_issues.critical or excluded.critical;
  end loop;
  select r.result into prior from public.ps_readiness_reports r where r.school_id=sid and r.status<>'draft' and r.week_start<rep.week_start and r.bank_id=rep.bank_id and r.bank_version=rep.bank_version and r.kind=rep.kind and r.context_snapshot->>'jurisdiction'=rep.context_snapshot->>'jurisdiction' order by r.week_start desc limit 1;
  result:=result||jsonb_build_object('previous_score',prior->'score','change',case when prior->>'score' is not null then (result->>'score')::integer-(prior->>'score')::integer else null end,
   'open_issues',(select count(*) from public.ps_readiness_issues where school_id=sid and status='open'),
   'open_critical',(select count(*) from public.ps_readiness_issues where school_id=sid and status='open' and critical),
   'issues_snapshot',(select coalesce(jsonb_agg(to_jsonb(i)),'[]') from public.ps_readiness_issues i where school_id=sid and status='open'));
  update public.ps_readiness_reports set answers=p->'answers',result=private.ps_score(rep.bank_snapshot,p->'answers',rep.context_snapshot,rep.kind)||result,status='submitted',submitted_at=now(),updated_at=now(),revision=revision+1 where id=rep.id returning to_jsonb(ps_readiness_reports.*) into rowdata;
  if private.ps_manager(sid,cfg.recipient_user) then
   insert into public.ps_readiness_notifications(school_id,recipient_user,report_id,event_key,kind,email_state)
   values(sid,cfg.recipient_user,rep.id,rep.id::text||':report:'||cfg.recipient_user,'report',case when cfg.email_enabled then 'queued' else 'disabled' end) on conflict(event_key) do nothing;
  end if;return rowdata;
 end if;
 if p_action='review' then
  if not private.ps_manager(sid) or rep.status='draft' then raise exception 'School administrator and submitted report required';end if;
  update public.ps_readiness_reports set status='reviewed',reviewed_at=now(),reviewed_by=uid where id=rep.id returning to_jsonb(ps_readiness_reports.*) into rowdata;return rowdata;
 end if;
 if p_action='propose' then
  if rep.owner_id<>uid or rep.status='draft' then raise exception 'Submitted report owner required';end if;
  select * into issue from public.ps_readiness_issues where id=(p->>'issue_id')::uuid and school_id=sid and status='open';
  if not found or issue.category not in ('supplies','equipment') then raise exception 'This issue needs corrective action, not a shopping item';end if;
  qty:=(p->>'quantity')::numeric;if qty not between 1 and 10000 then raise exception 'Confirm quantity';end if;
  -- Explicit catalogue selection. No name matching and no price/availability assertions.
  snap:=p->'product';if char_length(coalesce(snap->>'name','')) not between 1 and 300 or char_length(coalesce(snap->>'pack','')) not between 1 and 200 then raise exception 'Product identity and pack required';end if;
  if snap->>'family_id' is null and snap->>'sku' is null then raise exception 'Catalogue identifier required';end if;
  if coalesce((snap->>'regulated')::boolean,true) then raise exception 'Restricted or unclassified items require the existing licensed procurement route';end if;
  if not exists(select 1 from public.ps_readiness_catalogue where sku=snap->>'sku' and family_id is not distinct from snap->>'family_id' and name=snap->>'name' and pack=snap->>'pack' and issue.question_id=any(question_ids) and not regulated and active) then raise exception 'Catalogue mapping is unavailable or changed; review it again';end if;
  insert into public.ps_readiness_proposals(report_id,issue_id,school_id,proposed_by,family_id,sku,product_snapshot,quantity)
  values(rep.id,issue.id,sid,uid,snap->>'family_id',snap->>'sku',snap,qty)
  on conflict(report_id,issue_id,coalesce(sku,''),coalesce(family_id,'')) where status<>'removed' do update set quantity=excluded.quantity,updated_at=now()
  where ps_readiness_proposals.status='proposed' returning to_jsonb(ps_readiness_proposals.*) into rowdata;
  return rowdata;
 end if;
 if p_action in ('proposal_edit','proposal_remove') then
  if not private.ps_manager(sid) and rep.owner_id<>uid then raise exception 'Proposal access denied';end if;
  qty:=coalesce((p->>'quantity')::numeric,1);if qty not between 1 and 10000 then raise exception 'Invalid quantity';end if;
  update public.ps_readiness_proposals set quantity=qty,status=case when p_action='proposal_remove' then 'removed' else status end,updated_at=now() where id=(p->>'id')::uuid and report_id=rep.id and status='proposed' returning to_jsonb(ps_readiness_proposals.*) into rowdata;return rowdata;
 end if;
 if p_action='rfq' then
  if not private.ps_manager(sid) or cfg.purchasing_user is distinct from uid or rep.status<>'reviewed' or rep.reviewed_by is distinct from uid then raise exception 'Configured purchasing reviewer must review this report before requesting a quotation';end if;
  select jsonb_build_object('id',o.id,'order_number',o.order_number,'replayed',true) into outcome from public.ps_readiness_rfq_links l join public.orders o on o.id=l.order_id where l.report_id=rep.id;
  if outcome is not null then return outcome;end if;
  select coalesce(jsonb_agg(jsonb_build_object('psc_sku_snapshot',case when c.exact_verified then x.sku else null end,'line_description',x.product_snapshot->>'name','brand_model_snapshot',x.product_snapshot->>'brand','pack_snapshot',x.product_snapshot->>'pack','quantity',x.quantity,'product_option_snapshot',x.product_snapshot||jsonb_build_object('reference_catalogue_id',x.sku,'exact_verified',c.exact_verified,'readiness_report',rep.id,'readiness_issue',x.issue_id))),'[]') into lines
  from public.ps_readiness_proposals x join public.ps_readiness_catalogue c on c.sku=x.sku and c.active and not c.regulated and c.name=x.product_snapshot->>'name' and c.pack=x.product_snapshot->>'pack'
  where x.report_id=rep.id and x.status='proposed';
  if jsonb_array_length(lines)=0 or jsonb_array_length(lines)<>(select count(*) from public.ps_readiness_proposals where report_id=rep.id and status='proposed') then raise exception 'Review all items: a catalogue identity may have changed';end if;
  -- This existing RPC remains the authority for request creation. It does not authorize procurement.
  outcome:=public.psc_submit_institutional_request(sid,rep.id,lines,'PS Report Card '||rep.id||' · administrator-reviewed quotation request. Not a purchase authorization.');
  insert into public.ps_readiness_rfq_links(report_id,school_id,order_id,requested_by) values(rep.id,sid,(outcome->>'id')::uuid,uid);
  update public.ps_readiness_proposals set status='requested',order_id=(outcome->>'id')::uuid where report_id=rep.id and status='proposed';
  return outcome;
 end if;
 raise exception 'Unknown Workshop operation';
end $$;
-- Controlled public catalogue projection for exact, explicitly reviewed recommendation identities.
-- Reuses identifiers from the authoritative catalogue; this is an allowlist, not a product master.
create table public.ps_readiness_catalogue(
 sku text primary key,family_id text,name text not null,brand text,pack text not null,
 question_ids text[] not null default '{}',regulated boolean not null default true,active boolean not null default true,exact_verified boolean not null default false,source_revision text not null,revision integer not null default 1);
alter table public.ps_readiness_catalogue enable row level security;
create policy readiness_catalogue on public.ps_readiness_catalogue for select to authenticated using(private.is_psc_admin() or exists(select 1 from public.schools s where private.ps_member(s.id)));
grant select on public.ps_readiness_catalogue to authenticated;

revoke all on function private.ps_workshop(text,jsonb) from public,anon;
grant execute on function private.ps_workshop(text,jsonb) to authenticated;
create function public.ps_workshop(p_action text,p_payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$ select private.ps_workshop(p_action,p_payload); $$;
revoke all on function public.ps_workshop(text,jsonb) from public,anon;
grant execute on function public.ps_workshop(text,jsonb) to authenticated;

create function private.ps_readiness_tick(p_now timestamptz default now()) returns integer language plpgsql security definer set search_path='' as $$
declare c public.ps_readiness_settings%rowtype;r public.ps_readiness_reports%rowtype;local_now timestamp:=p_now at time zone 'Asia/Dubai';wk date:=date_trunc('week',local_now)::date;due timestamp;kind text;n integer:=0;rid uuid;b public.ps_readiness_banks%rowtype;
begin
 for c in select * from public.ps_readiness_settings where reminders loop
  if not private.ps_nurse(c.school_id,c.assigned_user) then continue;end if;
  select * into b from public.ps_readiness_banks where id=c.bank_id order by version desc limit 1;if not found then continue;end if;
  due:=wk+((c.weekday+6)%7)+c.reminder_time;
  if local_now<due then continue;end if;
  insert into public.ps_readiness_reports(school_id,owner_id,week_start,kind,bank_id,bank_version,bank_snapshot,context_snapshot,site_name,owner_name)
  select c.school_id,c.assigned_user,wk,case when exists(select 1 from public.ps_readiness_reports where school_id=c.school_id and status<>'draft') then 'weekly' else 'baseline' end,b.id,b.version,b.document,to_jsonb(c),s.name||' · '||coalesce(s.campus_name,''),coalesce(p.full_name,'Clinic user')
  from public.schools s left join public.profiles p on p.user_id=c.assigned_user where s.id=c.school_id
  on conflict(school_id,week_start) do nothing;
  select * into r from public.ps_readiness_reports where school_id=c.school_id and week_start=wk;
  if r.status<>'draft' then continue;end if;
  kind:=case when local_now>=due+interval '2 days' then 'overdue' else 'due' end;
  insert into public.ps_readiness_notifications(school_id,recipient_user,report_id,event_key,kind,email_state)
  values(c.school_id,c.assigned_user,r.id,r.id||':'||kind||':'||c.assigned_user,kind,case when c.email_enabled then 'queued' else 'disabled' end)
  on conflict(event_key) do nothing;n:=n+1;
 end loop;return n;
end $$;
revoke all on function private.ps_readiness_tick(timestamptz) from public,anon,authenticated;
-- Deployment operator activates a five-minute cron only in the approved isolated database.
-- select cron.schedule('ps-readiness-weekly','*/5 * * * *','select private.ps_readiness_tick();');

insert into public.ps_learning_modules(id,version,document) values('readiness',1,'{"id": "readiness", "version": 1, "title": "Clinic Readiness & Applicable Standards", "description": "Separate local requirements, reported readiness and learning results.", "minutes": 4, "status": "pilot", "review": "Editorial pilot \u00b7 technical review pending", "objectives": ["Separate local requirements, reported readiness and learning results.", "Distinguish a corrective action from a purchasing recommendation."], "sources": ["dha-4.1"], "slides": [{"title": "Start with your setting", "bullets": ["Confirm your clinic type and licensing jurisdiction.", "A Dubai source does not establish requirements for every UAE school."], "example": "Jurisdiction \u2192 applicable source \u2192 local review"}, {"title": "Evidence has a date", "bullets": ["Review current observations each week.", "An older positive answer is not proof of current readiness."], "example": "Observe \u2192 date \u2192 report"}, {"title": "Three different results", "bullets": ["A quiz measures learning within this module.", "A Report Card summarizes self-reported readiness.", "Neither is official certification."], "example": "Learn / Assess / Report"}, {"title": "Before submitting", "bullets": ["Review every answer, including unknowns.", "Keep unresolved issues open until someone explicitly confirms resolution."], "example": "Example: last week\u2019s shortage stays open until checked."}], "quiz": [{"id": "readiness-q1", "prompt": "Which approach best matches this lesson?", "multiple": false, "options": ["Assume an earlier result is still current.", "Review the current observation and record uncertainty honestly.", "Order automatically when unsure."], "correct": [1], "explanation": "Review current observations. Unknown information remains unresolved and does not authorize a purchase."}, {"id": "readiness-q2", "prompt": "Which statements are correct? Select all that apply.", "multiple": true, "options": ["A learning score is separate from clinic readiness.", "A recommendation is a purchase order.", "An unresolved issue needs explicit follow-up."], "correct": [0, 2], "explanation": "Learning, readiness and purchasing authority are separate. Issues stay open until explicitly resolved."}], "pass_mark": 80}'::jsonb);

insert into public.ps_learning_modules(id,version,document) values('emergency',1,'{"id": "emergency", "version": 1, "title": "Emergency Equipment & Preparedness", "description": "Recognise and escalate reported readiness concerns.", "minutes": 4, "status": "pilot", "review": "Editorial pilot \u00b7 technical review pending", "objectives": ["Recognise and escalate reported readiness concerns.", "Distinguish a corrective action from a purchasing recommendation."], "sources": ["ps-process"], "slides": [{"title": "Check, do not assume", "bullets": ["Review the emergency equipment relevant to your clinic.", "Use your approved local emergency plan and manufacturer instructions."], "example": "Plan \u2192 equipment \u2192 review"}, {"title": "Condition matters", "bullets": ["An item being present does not establish that it is ready to use.", "Report a concern about condition separately from a supply shortage."], "example": "Present \u2260 ready"}, {"title": "Escalate critical concerns", "bullets": ["Use your institution\u2019s immediate escalation procedure.", "A high overall score does not cancel a critical issue."], "example": "Safety action first"}, {"title": "Request with care", "bullets": ["Equipment may be an opening or capital need.", "Restricted medicines and medical gases require the licensed route."], "example": "No automatic purchase order"}], "quiz": [{"id": "emergency-q1", "prompt": "Which approach best matches this lesson?", "multiple": false, "options": ["Assume an earlier result is still current.", "Review the current observation and record uncertainty honestly.", "Order automatically when unsure."], "correct": [1], "explanation": "Review current observations. Unknown information remains unresolved and does not authorize a purchase."}, {"id": "emergency-q2", "prompt": "Which statements are correct? Select all that apply.", "multiple": true, "options": ["A learning score is separate from clinic readiness.", "A recommendation is a purchase order.", "An unresolved issue needs explicit follow-up."], "correct": [0, 2], "explanation": "Learning, readiness and purchasing authority are separate. Issues stay open until explicitly resolved."}], "pass_mark": 80}'::jsonb);

insert into public.ps_learning_modules(id,version,document) values('devices',1,'{"id": "devices", "version": 1, "title": "Medical Equipment & Diagnostics", "description": "Capture exact model and compatibility needs before requesting.", "minutes": 4, "status": "pilot", "review": "Editorial pilot \u00b7 technical review pending", "objectives": ["Capture exact model and compatibility needs before requesting.", "Distinguish a corrective action from a purchasing recommendation."], "sources": ["ps-process"], "slides": [{"title": "Identify the device", "bullets": ["Record the exact device or model when known.", "Avoid choosing a look-alike product as a substitute."], "example": "Brand \u2192 model \u2192 configuration"}, {"title": "Check related supplies", "bullets": ["Confirm compatibility from a verified source.", "If uncertain, request specification review rather than inventing a match."], "example": "Device \u2194 verified consumable"}, {"title": "Report condition", "bullets": ["Separate availability, condition and servicing questions.", "Follow approved local and manufacturer procedures."], "example": "A condition issue may require service, not a purchase."}, {"title": "Confirm the request", "bullets": ["Review the exact pack, unit and quantity.", "A recommendation becomes an RFQ only through the authorized workflow."], "example": "Review \u2192 approve RFQ \u2192 quotation"}], "quiz": [{"id": "devices-q1", "prompt": "Which approach best matches this lesson?", "multiple": false, "options": ["Assume an earlier result is still current.", "Review the current observation and record uncertainty honestly.", "Order automatically when unsure."], "correct": [1], "explanation": "Review current observations. Unknown information remains unresolved and does not authorize a purchase."}, {"id": "devices-q2", "prompt": "Which statements are correct? Select all that apply.", "multiple": true, "options": ["A learning score is separate from clinic readiness.", "A recommendation is a purchase order.", "An unresolved issue needs explicit follow-up."], "correct": [0, 2], "explanation": "Learning, readiness and purchasing authority are separate. Issues stay open until explicitly resolved."}], "pass_mark": 80}'::jsonb);

insert into public.ps_learning_modules(id,version,document) values('consumables',1,'{"id": "consumables", "version": 1, "title": "Medical Consumables & Replenishment", "description": "Turn a reported shortage into an exact, reviewable request.", "minutes": 4, "status": "pilot", "review": "Editorial pilot \u00b7 technical review pending", "objectives": ["Turn a reported shortage into an exact, reviewable request.", "Distinguish a corrective action from a purchasing recommendation."], "sources": ["ps-process"], "slides": [{"title": "Review what is needed", "bullets": ["Review quantity, suitability, condition and relevant expiry dates.", "This check does not require a complete inventory exercise."], "example": "A small review, not a stocktake"}, {"title": "Name the gap", "bullets": ["Choose the supply type that needs attention.", "Unknown quantities stay unresolved; they do not create purchases."], "example": "Dressings / gloves / other supplies"}, {"title": "Pack versus piece", "bullets": ["10 boxes is different from 10 pieces.", "Select the exact product and selling unit before requesting."], "example": "10 \u00d7 selected selling unit"}, {"title": "Keep one request", "bullets": ["Review the proposed items and quantities together.", "Issuing a quotation does not resolve the shortage."], "example": "Report \u2192 RFQ \u2192 quotation \u2192 authorized order \u2192 delivery \u2192 recheck"}], "quiz": [{"id": "consumables-q1", "prompt": "What should you review in first-aid supplies?", "multiple": false, "options": ["Quantity only.", "Quantity, suitability, condition and relevant expiry dates.", "The supplier name only."], "correct": [1], "explanation": "Review all four dimensions; quantity alone does not establish suitability or readiness."}, {"id": "consumables-q2", "prompt": "Which statements are correct? Select all that apply.", "multiple": true, "options": ["A learning score is separate from clinic readiness.", "A recommendation is a purchase order.", "An unresolved issue needs explicit follow-up."], "correct": [0, 2], "explanation": "Learning, readiness and purchasing authority are separate. Issues stay open until explicitly resolved."}], "pass_mark": 80}'::jsonb);

insert into public.ps_learning_modules(id,version,document) values('infection',1,'{"id": "infection", "version": 1, "title": "Infection Prevention & PPE", "description": "Review source-based hand hygiene and PPE principles.", "minutes": 4, "status": "pilot", "review": "Editorial pilot \u00b7 technical review pending", "objectives": ["Review source-based hand hygiene and PPE principles.", "Distinguish a corrective action from a purchasing recommendation."], "sources": ["cdc-standard", "cdc-hands"], "slides": [{"title": "Start with the exposure", "bullets": ["Standard Precautions apply across patient care.", "Select PPE based on the anticipated exposure and approved procedure."], "example": "Risk assessment \u2192 appropriate PPE"}, {"title": "Gloves and hands", "bullets": ["Gloves do not replace hand hygiene.", "CDC recommends hand hygiene immediately after glove removal."], "example": "Gloves + hand hygiene"}, {"title": "Equipment and environment", "bullets": ["Appropriate cleaning of equipment and the environment supports infection prevention.", "Follow the relevant procedure and manufacturer instructions."], "example": "Clean \u2192 follow procedure \u2192 review"}, {"title": "Report the right action", "bullets": ["A PPE shortage may need replenishment.", "A missing procedure or training gap needs a corrective action."], "example": "Training gap \u2260 shopping item"}], "quiz": [{"id": "infection-q1", "prompt": "Do gloves replace hand hygiene?", "multiple": false, "options": ["Yes, for every task.", "No. Hand hygiene is still required.", "Only when supplies are low."], "correct": [1], "explanation": "CDC states that gloves do not replace hand hygiene and recommends cleaning hands immediately after glove removal."}, {"id": "infection-q2", "prompt": "Which statements are correct? Select all that apply.", "multiple": true, "options": ["A learning score is separate from clinic readiness.", "A recommendation is a purchase order.", "An unresolved issue needs explicit follow-up."], "correct": [0, 2], "explanation": "Learning, readiness and purchasing authority are separate. Issues stay open until explicitly resolved."}], "pass_mark": 80}'::jsonb);

insert into public.ps_learning_modules(id,version,document) values('documentation',1,'{"id": "documentation", "version": 1, "title": "Documentation, Expiry Awareness & Safety", "description": "Keep reported issues, dates and decisions traceable.", "minutes": 4, "status": "pilot", "review": "Editorial pilot \u00b7 technical review pending", "objectives": ["Keep reported issues, dates and decisions traceable.", "Distinguish a corrective action from a purchasing recommendation."], "sources": ["ps-process"], "slides": [{"title": "Document observations", "bullets": ["Use concise operational observations.", "Do not enter patient or student medical information."], "example": "Date / issue / owner / action"}, {"title": "Review expiry concerns", "bullets": ["Report relevant expiry concerns using the product\u2019s approved instructions and local process.", "Do not infer shelf life from a photograph or similar product."], "example": "Exact item \u2192 check \u2192 action"}, {"title": "Separate authority", "bullets": ["A nurse can propose supplies.", "The configured administrator reviews purchasing recommendations.", "An RFQ is not authority to procure."], "example": "Proposal \u2192 RFQ \u2192 quotation \u2192 customer authorization"}, {"title": "Close the loop", "bullets": ["A delivery or quote does not automatically close a deficiency.", "The next review asks whether the underlying issue was resolved."], "example": "Delivered \u2192 nurse recheck \u2192 explicit resolution"}], "quiz": [{"id": "documentation-q1", "prompt": "Which approach best matches this lesson?", "multiple": false, "options": ["Assume an earlier result is still current.", "Review the current observation and record uncertainty honestly.", "Order automatically when unsure."], "correct": [1], "explanation": "Review current observations. Unknown information remains unresolved and does not authorize a purchase."}, {"id": "documentation-q2", "prompt": "Which statements are correct? Select all that apply.", "multiple": true, "options": ["A learning score is separate from clinic readiness.", "A recommendation is a purchase order.", "An unresolved issue needs explicit follow-up."], "correct": [0, 2], "explanation": "Learning, readiness and purchasing authority are separate. Issues stay open until explicitly resolved."}], "pass_mark": 80}'::jsonb);

insert into public.ps_readiness_banks(id,version,document) values('ps-readiness-pilot',1,'{"id": "ps-readiness-pilot", "version": 1, "scoring_version": "ps-weighted-v1", "status": "pilot", "title": "Weekly Clinic Check", "jurisdictions": ["Dubai", "Abu Dhabi", "Sharjah", "Other", "Not confirmed"], "clinic_type": "educational", "regulatory_status": "No validated regulatory score. DHA 4.1 is a Dubai source reference only. Other jurisdiction mapping pending.", "sources": [{"id": "dha-4.1", "title": "DHA educational and academic clinic standards \u2014 Version 4.1 circular", "url": "https://services.dha.gov.ae/sheryan/wps/portal/home/circular-details?circularRefNo=CIR-2025-00000098&fromHome=true&isPublicCircular=1", "authority": "DHA", "jurisdiction": "Dubai", "version": "4.1 / CIR-2025-00000098", "checked": "2026-10-17", "status": "Circular verified; question-level clinical/regulatory mapping pending"}, {"id": "cdc-standard", "title": "CDC Standard Precautions for All Patient Care", "url": "https://www.cdc.gov/infection-control/hcp/basics/standard-precautions.html", "checked": "2026-10-17", "status": "Source reviewed; PS lesson clinical review pending"}, {"id": "cdc-hands", "title": "CDC Clinical Safety: Hand Hygiene for Healthcare Workers", "url": "https://www.cdc.gov/clean-hands/hcp/clinical-safety/index.html", "checked": "2026-10-17", "status": "Source reviewed; PS lesson clinical review pending"}, {"id": "ps-process", "title": "PS portal workflow and pilot assessment methodology", "url": "/#workshop", "checked": "2026-10-17", "status": "PS product rules; not a regulatory standard"}], "questions": [{"id": "emergency", "label": "Is the emergency equipment identified in your local plan available and reported ready?", "weight": 3, "critical": true, "category": "equipment", "family_id": null, "purchase_kind": "capital", "requirement": "mandatory", "condition": null, "baseline_only": false, "source": "ps-process", "action": "Review locally and agree an appropriate corrective action."}, {"id": "firstaid", "label": "Are first-aid supplies sufficient, suitable and in usable condition?", "weight": 2, "critical": false, "category": "supplies", "family_id": "PSC-SC-C23", "purchase_kind": "recurring", "requirement": "mandatory", "condition": null, "baseline_only": false, "source": "ps-process", "action": "Review the exact product, pack and quantity before proposing a quotation request."}, {"id": "gloves", "label": "Are appropriate examination gloves sufficient for current needs?", "weight": 2, "critical": false, "category": "supplies", "family_id": null, "purchase_kind": "recurring", "requirement": "mandatory", "condition": null, "baseline_only": false, "source": "ps-process", "action": "Review locally and agree an appropriate corrective action."}, {"id": "infection", "label": "Are the clinic\u2019s hand hygiene and infection-prevention supplies and processes ready?", "weight": 2, "critical": false, "category": "procedure", "family_id": null, "purchase_kind": null, "requirement": "mandatory", "condition": null, "baseline_only": false, "source": "ps-process", "action": "Review locally and agree an appropriate corrective action."}, {"id": "expiry", "label": "Have relevant expiry concerns been checked and addressed?", "weight": 2, "critical": false, "category": "procedure", "family_id": null, "purchase_kind": null, "requirement": "mandatory", "condition": null, "baseline_only": false, "source": "ps-process", "action": "Review locally and agree an appropriate corrective action."}, {"id": "documentation", "label": "Are required local records and procedures available for the clinic team?", "weight": 1, "critical": false, "category": "documentation", "family_id": null, "purchase_kind": null, "requirement": "mandatory", "condition": null, "baseline_only": false, "source": "ps-process", "action": "Review locally and agree an appropriate corrective action."}, {"id": "equipment", "label": "Is routine assessment equipment available and reported usable?", "weight": 2, "critical": false, "category": "equipment", "family_id": null, "purchase_kind": "capital", "requirement": "mandatory", "condition": null, "baseline_only": false, "source": "ps-process", "action": "Review locally and agree an appropriate corrective action."}, {"id": "escalation", "label": "Does the team know how to escalate an urgent clinic concern?", "weight": 3, "critical": true, "category": "procedure", "family_id": null, "purchase_kind": null, "requirement": "mandatory", "condition": null, "baseline_only": false, "source": "ps-process", "action": "Review locally and agree an appropriate corrective action."}, {"id": "oxygen", "label": "Where your clinic uses oxygen, has its readiness been reviewed under the approved local procedure?", "weight": 3, "critical": true, "category": "restricted", "family_id": null, "purchase_kind": "licensed", "requirement": "conditional", "condition": "oxygen", "baseline_only": false, "source": "ps-process", "action": "Review locally and agree an appropriate corrective action."}, {"id": "aed", "label": "Where an AED is part of the clinic plan, has its readiness been reviewed?", "weight": 3, "critical": true, "category": "equipment", "family_id": null, "purchase_kind": "capital", "requirement": "conditional", "condition": "aed", "baseline_only": false, "source": "ps-process", "action": "Review locally and agree an appropriate corrective action."}, {"id": "baseline-plan", "label": "Has the initial clinic readiness responsibility and review process been agreed?", "weight": 1, "critical": false, "category": "procedure", "family_id": null, "purchase_kind": null, "requirement": "mandatory", "condition": null, "baseline_only": true, "source": "ps-process", "action": "Review locally and agree an appropriate corrective action."}, {"id": "baseline-spec", "label": "Have the clinic\u2019s starting equipment and supply requirements been reviewed?", "weight": 1, "critical": false, "category": "equipment", "family_id": null, "purchase_kind": null, "requirement": "mandatory", "condition": null, "baseline_only": true, "source": "ps-process", "action": "Review locally and agree an appropriate corrective action."}, {"id": "optional-improvement", "label": "Are any optional workflow improvements ready for use?", "weight": 1, "critical": false, "category": "procedure", "family_id": null, "purchase_kind": null, "requirement": "optional", "condition": null, "baseline_only": false, "source": "ps-process", "action": "Review locally and agree an appropriate corrective action."}], "grade_bands": [[97, "A+"], [93, "A"], [90, "A\u2212"], [80, "B"], [70, "C"], [60, "D"], [0, "F"]]}'::jsonb);


-- Exact source-backed recommendation mappings
insert into public.ps_readiness_catalogue(sku,family_id,name,brand,pack,question_ids,regulated,active,exact_verified,source_revision) values('PSC-WND-001',null,'Gauze Swab Non-Sterile 5 × 5 cm','WOLAID','Pack / selling unit to confirm',array['firstaid'],false,true,false,'PSC-20261012-STOCK-002');
insert into public.ps_readiness_catalogue(sku,family_id,name,brand,pack,question_ids,regulated,active,exact_verified,source_revision) values('PSC-WND-002',null,'Gauze Swabs ETO Sterile 10 × 10 cm 12-ply','WOLAID','Pack / selling unit to confirm',array['firstaid'],false,true,false,'PSC-20261012-STOCK-002');
insert into public.ps_readiness_catalogue(sku,family_id,name,brand,pack,question_ids,regulated,active,exact_verified,source_revision) values('PSC-PPE-001',null,'Nitrile Examination Gloves','Specification-led','Pack / selling unit to confirm',array['gloves'],false,true,false,'PSC-20261012-STOCK-002');
insert into public.ps_readiness_catalogue(sku,family_id,name,brand,pack,question_ids,regulated,active,exact_verified,source_revision) values('PSC-PPE-002',null,'Vinyl Examination Gloves','Specification-led','Pack / selling unit to confirm',array['gloves'],false,true,false,'PSC-20261012-STOCK-002');

-- End recommendation mappings

create function public.ps_readiness_email(p_action text,p_id uuid default null,p_state text default null,p_provider text default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare n public.ps_readiness_notifications%rowtype;c public.ps_readiness_settings%rowtype;valid boolean;addr text;
begin
 if p_action='claim' then
  select * into n from public.ps_readiness_notifications where email_state='queued' order by created_at for update skip locked limit 1;
  if not found then return null;end if;
 else select * into n from public.ps_readiness_notifications where id=p_id for update;if not found then return null;end if;end if;
 select * into c from public.ps_readiness_settings where school_id=n.school_id;
 valid:=c.email_enabled and private.ps_member(n.school_id,n.recipient_user)
  and (case when n.kind='report' then n.recipient_user=c.recipient_user and private.ps_manager(n.school_id,n.recipient_user)
   else n.recipient_user=c.assigned_user and c.reminders and private.ps_nurse(n.school_id,n.recipient_user) end);
 if not coalesce(valid,false) then update public.ps_readiness_notifications set email_state='revoked' where id=n.id;return null;end if;
 if p_action='claim' then
  update public.ps_readiness_notifications set email_state='sending',attempts=attempts+1 where id=n.id;
  select email into addr from auth.users where id=n.recipient_user;
  return jsonb_build_object('id',n.id,'email',addr,'kind',n.kind,'report_id',n.report_id);
 elsif p_action='recheck' then return jsonb_build_object('authorized',n.email_state='sending');
 elsif p_action='finish' then
  if p_state not in ('sent','failed','uncertain') or n.email_state<>'sending' then raise exception 'Invalid email state';end if;
  update public.ps_readiness_notifications set email_state=p_state,provider_id=p_provider,last_error=case when p_state='sent' then null else p_state end where id=n.id;
  return '{"saved":true}';
 end if;
 raise exception 'Unknown mail operation';
end $$;
revoke all on function public.ps_readiness_email(text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.ps_readiness_email(text,uuid,text,text) to service_role;
