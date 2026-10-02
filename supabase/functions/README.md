# PSC Mail Desk Edge Functions

## send-mail-campaign
Authenticated PSC-admin-only function. Reads approved Mail Desk campaign/recipient records, rechecks contact eligibility, then sends from `info@pharmaservice.ae` through Microsoft Graph. It does **not** add tracking pixels.

Required Supabase Edge Function secrets:
- `MS_GRAPH_TENANT_ID`
- `MS_GRAPH_CLIENT_ID`
- `MS_GRAPH_CLIENT_SECRET`
- `PSC_MAIL_SENDER=info@pharmaservice.ae`

The Microsoft Entra application must have the appropriate application permission for Graph mail sending and tenant-admin consent. Restrict the app/mailbox scope in Microsoft 365 so it is not unnecessarily able to send as every mailbox.

## mail-unsubscribe
Public token-based opt-out endpoint. Deploy with JWT verification disabled. The token is a random UUID stored on the controlled contact record; the function only changes that record to `unsubscribed`.
