# Outreach alias integration — 9 October 2026

Marketing sender and reply-to are pinned to `outreach@pharmaservice.ae`. Procurement remains `info@pharmaservice.ae`. The existing OAuth send/readonly grant is reused; alias verification uses Gmail sendAs.list. No new credentials, mailbox license or OAuth scopes.

## Owner setup

1. Google Admin → Directory → Users → info@ → Add Alternate Emails → outreach → Save.
2. Gmail as info@ → Settings → See all settings → Accounts → Send mail as. Add/verify outreach@ if absent. Keep info@ as the normal default.
3. PSC → Outreach → Check alias.
4. Review internal test → Approve & send this test. Only info@ receives it. Confirm Inbox/Sent and inspect Show original for SPF, DKIM and DMARC results.
5. Confirm the setup checkboxes and enable approved campaigns. No campaign is released merely by enabling the sender; each requires its own saved-content/audience approval.

Alias changes can take up to 24 hours. Replies to outreach@ arrive in the existing info@ mailbox. The alias shares mailbox sending limits and domain reputation; it does not create separate quota or delivery guarantees.

## Implemented controls

- Existing campaigns, recipients and suppression records reused. Saved copies of old info@ drafts use the new alias.
- Service-only approval and worker RPCs. Browser can insert drafts, but cannot set approved/sent states. Demo accounts cannot authorize sends.
- Review hash binds approval to the saved campaign and recipients. Approval stores a frozen content snapshot. Recipient insertion locks the parent against concurrent approval.
- Queue processes one recipient per minute, maximum 100 attempts in a rolling 24-hour period. This is PSC's conservative initial limit, not Google's published quota. Other mailbox activity still consumes the shared Google allowance.
- Only active contacts with requested_updates or manual_permission and no unsubscribe timestamp qualify. Checked at claim and immediately before send. Changing a contact's email invalidates the old recipient snapshot.
- Individual messages, stable attempt Message-IDs, Gmail IDs, acceptance timestamps, recorded failures; transient definitive failures retried up to three attempts. Unknown outcomes held for reconciliation, never blindly resent.
- Pause all sending, stop remaining recipients of a campaign, reconcile uncertain attempts with Gmail Sent.
- Visible unsubscribe link plus HTTPS one-click POST endpoint. Existing website unsubscribe remains compatible. No tracking pixels.

## Verification

- 19 isolated mail/security tests passed, including pinned alias, unverified-alias rejection, injection rejection, unsubscribe, permission checks, approval and worker authentication.
- Embedded PostgreSQL (PGlite 0.5.8) ran the actual migrations and queue functions: draft persistence, private worker RPC, blocked browser approval, stale review, duplicate claim, interrupted acceptance recovery, unsubscribe-before-send, rolling quota and customer isolation passed.
- Production draft/recipient insert transaction passed and rolled back. The larger production queue acceptance test was declined by the approval layer without a reason; it was run in isolation instead. Production read-only checks confirmed disabled sender, zero attempts/approved campaigns, and no anon/authenticated access to privileged queue RPCs.
- Browser tests at 390px and 1440px passed for setup and explicit test/campaign approval. Existing workspace tests rerun.
- Security advisors reported no new outreach findings. Existing unrelated catalogue view/function and password-protection findings remain outside this release; see https://supabase.com/docs/guides/database/database-linter.

## Not yet demonstrated

Real alias acceptance, internal inbox receipt and domain-authentication results depend on the owner's Google setup and approved test. No customer campaign or test email was sent by the builder.

Post-acceptance bounce/complaint ingestion is not automated in this release. Review delivery-failure replies in Gmail and mark affected contacts Bounced in Outreach. Gmail acceptance is not inbox-delivery confirmation. One-click header signing should be checked in a received test before scaling.

Functions deployed: send-mail-campaign and mail-unsubscribe. The former now uses explicit admin authentication or the existing server-only worker secret instead of the gateway JWT check; unauthenticated calls are rejected by the handler. Database migrations: outreach_alias_campaigns and outreach_queue_recovery. Cron is inert while sending is disabled.
