create or replace function private.psc_mail_http(p_slug text,p_body jsonb) returns boolean language plpgsql security definer set search_path='' as $$
declare v_token text;v_status int;r record;begin
 if p_slug not in ('dispatch-notification','poll-procurement-mail') then return false;end if;
 if not exists(select 1 from pg_extension where extname='http') then
 update public.psc_mail_connection set last_error='private_transport_configuration_required' where mailbox='info@pharmaservice.ae';return false;end if;
 -- Extension activation must not expose generic network functions to user roles.
 for r in select p.oid::regprocedure as signature from pg_proc p join pg_depend d on d.objid=p.oid and d.classid='pg_proc'::regclass join pg_extension e on e.oid=d.refobjid where e.extname='http' and d.deptype='e' loop
 execute format('revoke all on function %s from public,anon,authenticated',r.signature);
 if has_function_privilege('anon',r.signature,'execute') or has_function_privilege('authenticated',r.signature,'execute') then
 update public.psc_mail_connection set last_error='private_transport_permissions_required' where mailbox='info@pharmaservice.ae';return false;end if;
 end loop;
 select decrypted_secret into v_token from vault.decrypted_secrets where name='psc_mail_worker';
 perform extensions.http_set_curlopt('CURLOPT_TIMEOUT_MS','10000');
 select status into v_status from extensions.http(('POST','https://ewewkojlsgqvcqarmpgr.supabase.co/functions/v1/'||p_slug,array[extensions.http_header('x-psc-worker',v_token)],'application/json',p_body::text)::extensions.http_request);
 return v_status between 200 and 299;
 exception when others then
 update public.psc_mail_connection set last_error='private_transport_failed' where mailbox='info@pharmaservice.ae';return false;
end $$;
revoke all on function private.psc_mail_http(text,jsonb) from public,anon,authenticated;
