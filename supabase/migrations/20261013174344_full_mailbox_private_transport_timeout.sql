create or replace function private.psc_mail_http(p_slug text,p_body jsonb) returns boolean language plpgsql security definer set search_path='' as $$
declare v_token text;v_status int;begin
 if p_slug not in ('dispatch-notification','poll-procurement-mail') then return false;end if;
 if not exists(select 1 from pg_extension e join pg_namespace n on n.oid=e.extnamespace where e.extname='http' and n.nspname='psc_mail_transport')
 or has_schema_privilege('anon','psc_mail_transport','usage') or has_schema_privilege('authenticated','psc_mail_transport','usage') then
 update public.psc_mail_connection set last_error='private_transport_configuration_required' where mailbox='info@pharmaservice.ae';return false;end if;
 select decrypted_secret into v_token from vault.decrypted_secrets where name='psc_mail_worker';
 perform psc_mail_transport.http_set_curlopt('CURLOPT_TIMEOUT_MS','60000');
 select status into v_status from psc_mail_transport.http(('POST','https://ewewkojlsgqvcqarmpgr.supabase.co/functions/v1/'||p_slug,array[row('x-psc-worker',v_token)::psc_mail_transport.http_header],'application/json',p_body::text)::psc_mail_transport.http_request);
 return v_status between 200 and 299;
 exception when others then
 update public.psc_mail_connection set last_error='private_transport_failed' where mailbox='info@pharmaservice.ae';return false;
end $$;
revoke all on function private.psc_mail_http(text,jsonb) from public,anon,authenticated;

