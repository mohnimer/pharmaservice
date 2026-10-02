# PSC V37.7.1 — Mail Desk Gmail correction

The PSC domain mailbox is hosted on Google Workspace / Gmail, not Microsoft 365.

V37.7.1 therefore replaces the Microsoft Graph delivery layer with Gmail API delivery while preserving the Mail Desk interface and database model.

## Sender

- Display name: `Pharma Service`
- From: `info@pharmaservice.ae`
- Reply-to: `info@pharmaservice.ae`

## What changed

- Removed Microsoft Graph token/send code.
- Added Google OAuth refresh-token exchange.
- Sends via `gmail.googleapis.com/gmail/v1/users/me/messages/send`.
- Keeps sender hard-locked to `info@pharmaservice.ae`.
- Adds Gmail message ID to recipient delivery history when available.
- Updated Mail Desk Settings language and connection-error wording.
- Updated deployment documentation and secrets.

## Secrets required

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`
- `PSC_MAIL_SENDER=info@pharmaservice.ae`

No Microsoft/Entra credentials are required.
