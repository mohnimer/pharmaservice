# PSC V37.7.2 — Google Workspace service-account Mail Desk

This release simplifies the Gmail connection introduced in V37.7.1.

## Changed

- Removed user OAuth client ID / client secret / refresh-token authentication.
- Added Google Cloud service-account authentication using OAuth 2.0 JWT bearer assertions.
- Uses Google Workspace domain-wide delegation to impersonate only `info@pharmaservice.ae` when requesting a Gmail access token.
- Requests only `https://www.googleapis.com/auth/gmail.send`.
- Sender remains hard-locked to `info@pharmaservice.ae`.
- Mail Desk UI, contacts, campaign approval, recipient history, unsubscribe controls and database model remain unchanged.

## Supabase secrets

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `PSC_MAIL_SENDER=info@pharmaservice.ae`

The Google Workspace Super Admin must authorize the service account's OAuth Client ID once under Domain-wide delegation for `https://www.googleapis.com/auth/gmail.send`.

No refresh token is required after that setup.
