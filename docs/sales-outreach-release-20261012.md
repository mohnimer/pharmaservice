# Sales outreach release — 12 October 2026

Outreach now opens on Sales outreach. Business contacts without a marketing subscription can receive an individual introduction from sales@, using the existing saved-draft, explicit review, verified sender and logged Gmail transport. Customer/supplier email remains available separately; marketing campaigns retain subscription eligibility.

Sales drafts carry a reply opt-out and the existing unsubscribe URL when available. Unsubscribed, bounced and unavailable contacts are blocked. Eligibility and recipient identity are checked again on send. No contacts are automatically subscribed and no real prospect email was sent during deployment.

Validation: sales composer DOM test passed; all 30 isolated Gmail handler/security tests passed; application shell tests and build passed. Browser regression could not launch because the local Chromium executable is absent. Supabase migration sales_outreach applied; procurement-mail version 10 deployed. Existing database advisor findings remain in the prior documented catalogue/auth baseline.
