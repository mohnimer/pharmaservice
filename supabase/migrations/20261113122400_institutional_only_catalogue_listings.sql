create table private.institutional_catalogue_listings (
  sku text primary key,
  product jsonb not null
);
revoke all on private.institutional_catalogue_listings from public, anon, authenticated;

create function public.psc_institutional_catalogue_listings()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select case when exists (
    select 1
    from public.memberships m
    join public.account_groups g on g.id=m.group_id and g.active and g.slug <> 'psc-demo-group'
    join auth.users u on u.id=m.user_id and u.email_confirmed_at is not null
      and (u.banned_until is null or u.banned_until <= now())
    where m.user_id=auth.uid() and exists (
      select 1 from public.schools s where s.active and s.group_id=g.id
        and (s.id=m.school_id or (m.school_id is null and m.role::text='group_admin'))
    )
  ) then (select coalesce(jsonb_agg(l.product order by l.sku), '[]'::jsonb) from private.institutional_catalogue_listings l)
  else '[]'::jsonb end
$$;
revoke all on function public.psc_institutional_catalogue_listings() from public, anon;
grant execute on function public.psc_institutional_catalogue_listings() to authenticated;
