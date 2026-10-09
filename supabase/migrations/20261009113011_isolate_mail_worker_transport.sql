-- Do not place worker credentials in platform-owned pg_net queue rows.
-- Enable the http extension in Supabase Database > Extensions before scheduled delivery.
-- A missing extension is caught safely; no credentials enter the shared queue.
do $$ declare r record;begin
 for r in select p.oid::regprocedure as signature from pg_proc p join pg_depend d on d.objid=p.oid and d.classid='pg_proc'::regclass join pg_extension e on e.oid=d.refobjid where e.extname='http' and d.deptype='e' loop
 execute format('revoke all on function %s from public,anon,authenticated',r.signature);
 end loop;
end $$;
create or replace function public.psc_dispatch_notification_webhook() returns trigger language plpgsql security definer set search_path='' as $$
begin return new;end $$;
revoke all on function public.psc_dispatch_notification_webhook() from public,anon,authenticated;
create or replace function private.psc_mail_http(p_slug text,p_body jsonb) returns boolean language plpgsql security definer set search_path='' as $$
declare v_token text;v_status int;begin
 if p_slug not in ('dispatch-notification','poll-procurement-mail') then return false;end if;
 select decrypted_secret into v_token from vault.decrypted_secrets where name='psc_mail_worker';
 perform extensions.http_set_curlopt('CURLOPT_TIMEOUT_MS','10000');
 select status into v_status from extensions.http(('POST','https://ewewkojlsgqvcqarmpgr.supabase.co/functions/v1/'||p_slug,array[extensions.http_header('x-psc-worker',v_token)],'application/json',p_body::text)::extensions.http_request);
 return v_status between 200 and 299;
 exception when others then return false;
end $$;
revoke all on function private.psc_mail_http(text,jsonb) from public,anon,authenticated;
create or replace function private.psc_mail_tick() returns void language plpgsql security definer set search_path='' as $$
declare r record;begin
 delete from public.psc_mail_oauth_states where expires_at<now();
 delete from public.psc_mail_rate_slots where window_start<now()-interval '2 days';
 update public.notification_outbox set status='uncertain',last_error='Worker interrupted; reconcile Gmail before retry' where status='sending' and last_attempt_at<now()-interval '10 minutes';
 update public.psc_mail_drafts set status='uncertain',last_error='Worker interrupted; reconcile Gmail before retry' where status='sending' and updated_at<now()-interval '10 minutes';
 if not exists(select 1 from public.psc_mail_connection where status='connected') then return;end if;
 for r in select id from public.notification_outbox where status in ('queued','failed') and attempts<3 and next_attempt_at<=now() order by created_at limit 3 loop
 perform private.psc_mail_http('dispatch-notification',jsonb_build_object('notification_id',r.id));end loop;
 perform private.psc_mail_http('poll-procurement-mail','{}'::jsonb);
end $$;
revoke all on function private.psc_mail_tick() from public,anon,authenticated;
