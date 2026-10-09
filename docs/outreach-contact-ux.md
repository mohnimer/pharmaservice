# Shared contacts and email workflow

Customers and Outreach already used `mail_contacts`; the defect was an application-level stale cache. A route-entry refresh and contact-change event now keep Outreach current. No customer/contact rows were merged, overwritten or automatically subscribed.

- Customers is labelled Customers & contacts, with company/person distinction explained.
- Individual email is the first Outreach tab: shared recipient selector, inline Add contact, customer/supplier sender selection, request-response or existing-conversation purpose, saved draft, explicit review and approval.
- Marketing email retains the existing outreach sender, unsubscribe rules and eligibility checks. Adding a contact from the composer preserves the message and selects a newly subscribed contact. Duplicate normalized emails are blocked without overwriting existing permissions.
- The recipient-selection handler now enables the actual review button. Sender setup is under Sender settings, not above every composer. Campaign history refreshes every 30 seconds only while visible, without replacing an open dialog or composer.
- Individual messages reuse the existing draft, rate-limit, alias verification, Gmail send and correspondence logging pipeline. Contact email is revalidated before send. Demo-linked sites and bounced contacts are blocked. Formal quotation attachments remain in the controlled quotation workflow.

Migration adds contact_id and communication_purpose to psc_mail_drafts, with a constrained direct-message context and contact index. Existing admin-read RLS and service-only writes are unchanged. No OAuth scope or credential changes.

Verification: browser tests at 390 and 1440 pixels cover cross-page contact visibility without reload, inline add, draft preservation, duplicate prevention, non-subscriber exclusion from marketing, approval-before-send and recipient-button enablement. Security tests cover direct-mail purpose, recipient-change rejection, verified sales sender and repeated-send rejection. Existing workstation, Gmail UI and application-shell regressions pass. No real customer email was sent.

Production advisor baseline still flags pre-existing catalogue definer views/functions, mutable search paths and disabled leaked-password protection; this release does not change these unrelated objects. See https://supabase.com/docs/guides/database/database-linter and https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection .

Limitations: one-to-one messages are plain text without attachments; use Requests for formal quotations. Gmail alias readiness and actual delivery remain dependent on owner setup. Existing customer-site records without a named contact are not silently converted or matched; link a contact to its site using Customers & contacts.
