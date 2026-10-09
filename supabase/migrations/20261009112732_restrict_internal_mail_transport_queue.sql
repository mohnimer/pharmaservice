-- pg_net transports worker authentication headers; ordinary users must neither read nor redirect queued requests.
revoke all on table net.http_request_queue from public, anon, authenticated;
grant all on table net.http_request_queue to service_role;
