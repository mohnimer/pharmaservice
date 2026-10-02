# PSC V37.7 — Mail Desk

## What changed

A new PSC-admin-only `Mail` module has been added to the portal at `/#admin/mail`.

The sender identity is locked to:

- Display name: `Pharma Service`
- Sender: `info@pharmaservice.ae`
- Reply-to: `info@pharmaservice.ae`

## Mail Desk interface

Four internal tabs:

1. **Compose** — choose Workshop Note, Clinic Check or Supply Note; select an existing Workshop guide; edit subject/opening/CTA; choose eligible contacts; preview the responsive email; save draft; send a test; approve and send.
2. **Contacts** — controlled business-contact register with organization, role, institution type, status and reviewed marketing basis.
3. **History** — campaign send history with recipient, sent and failed counts. V37.7 deliberately does not invent open/click tracking.
4. **Settings** — sender identity and delivery/control status.

Workshop guide pages now show **Create email** to authenticated PSC admins, which opens Mail Desk with that guide preselected.

## Data controls

New migration: `migrations/v37_7_mail_desk.sql`

Tables:

- `mail_contacts`
- `mail_campaigns`
- `mail_campaign_recipients`

All three tables use RLS and are restricted to `private.is_psc_admin()`.

A contact is only send-eligible when:

- status = `active`; and
- `marketing_basis` has been reviewed and is not `not_set`.

Unsubscribed/paused/bounced contacts are excluded again inside the server-side send function, not merely hidden in the UI.

## Sending architecture

Included Supabase Edge Functions:

- `supabase/functions/send-mail-campaign`
- `supabase/functions/mail-unsubscribe`

`send-mail-campaign`:

- requires an authenticated PSC admin;
- rechecks recipient eligibility server-side;
- is hard-locked to `info@pharmaservice.ae`;
- obtains a Microsoft Graph app-only token;
- sends through Microsoft Graph;
- saves messages to the mailbox Sent Items;
- records sent/failed recipient outcomes in Supabase;
- includes an unsubscribe link;
- contains no tracking pixel.

`mail-unsubscribe` updates only the contact identified by its random unsubscribe token.

## One-time live connection required

The website code, database model and Edge Function are included, but Microsoft credentials are deliberately **not** embedded in the ZIP.

Before live sends, deploy the migration/functions and configure these Supabase Edge Function secrets:

- `MS_GRAPH_TENANT_ID`
- `MS_GRAPH_CLIENT_ID`
- `MS_GRAPH_CLIENT_SECRET`
- `PSC_MAIL_SENDER=info@pharmaservice.ae`

The Microsoft Entra application needs the appropriate Graph mail-sending permission and tenant-admin consent. Restrict the application/mailbox scope so it cannot unnecessarily send from other PSC mailboxes.

## Safety / regression boundary

No catalogue, quote/order, Workshop content, customer portal, demo safety or existing Supabase order write paths were changed by Mail Desk.
