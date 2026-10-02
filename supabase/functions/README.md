# PSC Mail Desk Edge Functions — Google Workspace service account

## send-mail-campaign

Authenticated PSC-admin-only Edge Function. It reads approved Mail Desk campaigns and recipients, rechecks contact eligibility, and sends from **`info@pharmaservice.ae`** through the Gmail API. It does not add tracking pixels.

### Authentication model

V37.7.2 uses a **Google Cloud service account with Google Workspace domain-wide delegation**. There is no browser consent flow and no refresh token to generate or renew.

The function creates a short-lived signed JWT as the service account, requests a delegated Google access token with:

- delegated user: `info@pharmaservice.ae`
- OAuth scope: `https://www.googleapis.com/auth/gmail.send`

The service account itself is not a mailbox. Google Workspace authorizes it to impersonate `info@pharmaservice.ae` only for the scope granted by the Workspace administrator.

### Required Supabase secrets

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `PSC_MAIL_SENDER=info@pharmaservice.ae`

`GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` is the `private_key` value from the Google service-account JSON key. It can be stored with its normal PEM newlines or with `\n` escape sequences; the Edge Function handles both.

Do **not** put the service-account key in `app.js`, static HTML, GitHub, browser storage, or any public environment variable.

### One-time Google setup

1. In Google Cloud, use or create a PSC-owned project.
2. Enable **Gmail API**.
3. Create a dedicated service account, e.g. `psc-mail-desk`.
4. Enable **domain-wide delegation** for that service account.
5. Copy the service account's **OAuth Client ID** from its domain-wide delegation section.
6. In Google Workspace Admin (Super Admin): **Security → Access and data control → API controls → Domain-wide delegation → Manage Domain Wide Delegation → Add new**.
7. Enter that service-account Client ID.
8. Grant **only** this OAuth scope for Mail Desk:
   `https://www.googleapis.com/auth/gmail.send`
9. Create a service-account JSON key and store only `client_email` and `private_key` as the two Supabase secrets above. Keep the downloaded JSON file secure; delete unnecessary local copies after the secrets are stored.
10. Set `PSC_MAIL_SENDER=info@pharmaservice.ae` in Supabase secrets.
11. Deploy `send-mail-campaign` with normal JWT verification.
12. Deploy `mail-unsubscribe` with JWT verification disabled.
13. In **Portal → Mail**, use **Send test to info@** before any live campaign.

If Google returns `unauthorized_client`, the common causes are: domain-wide delegation was not enabled on that exact service account, the wrong Client ID was authorized in Workspace Admin, or `gmail.send` was not granted exactly.

If Google returns a Gmail permission error after token creation, verify that `info@pharmaservice.ae` is an active Google Workspace Gmail user and that Gmail API is enabled in the Cloud project.

## mail-unsubscribe

Public token-based opt-out endpoint. Deploy with JWT verification disabled. The token is a random UUID stored on the controlled contact record; the function only changes that contact to `unsubscribed`.
