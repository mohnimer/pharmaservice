# PSC procurement email

The existing PSC Procurement Backend web OAuth client replaces service-account sending. Do not disable Google's key-creation policy. Marketing sending is paused; suppression remains active.

See [configuration, acceptance evidence and launch blockers](../../docs/gmail-procurement-rollout.md).

Deploy these source directories including `_shared/psc-mail.ts` for all functions except mail-unsubscribe, and `_shared/quote-pdf.ts` for procurement-mail. Gateway settings are in `supabase/config.toml`.

OAuth callback uses single-use state; OAuth POST and procurement-mail use verified administrator sessions. Dispatch and polling accept either verified administrators or Vault-backed internal worker tokens. mail-unsubscribe is a public UUID opt-out capability. Disabling gateway JWT verification does not authorize anonymous mail operations: protected handlers authenticate before accessing data.
