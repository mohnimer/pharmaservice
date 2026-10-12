# Business email base — 12 October 2026

Outreach now has Write email, Contacts and Sender. The composer offers Intro email, Follow-up, Onboarding overview and Workshop email. It selects a contact, provides editable starter copy, saves a draft and presents a preview with a Send email button. No marketing subscription or business-purpose checkbox is required. Explicit opt-outs, bounced addresses, administrator authentication, demo safeguards and duplicate-send controls remain active.

All outgoing MIME From and Reply-To headers now use mohamed@pharmaservice.ae. The existing OAuth connection remains on info@pharmaservice.ae; Mohamed must be an accepted Gmail Send mail as identity on that connected account. Sender readiness can be checked in the Sender tab. Contact emails are HTML with Explore our model and Reach out CTAs. Onboarding overview is introductory guidance, separate from activating an account or formal onboarding evidence.

Browser failure: the unpinned browser SDK added X-Supabase-Api-Version, absent from the email CORS allow-list. Updated the shared allow-list and pinned the browser SDK to 2.57.4. Six Edge Functions were redeployed with the shared headers and sender implementation.

Validation: all 31 isolated backend tests passed, including CORS preflight, unified sender, authorization, opt-outs and duplicate-send cases. The stage composer DOM test and three shell tests passed; build passed. Live preflight and unauthenticated POST validate the browser/API transport; no real prospect emails were sent. Authenticated saving and Gmail sender readiness require a signed-in administrator; no authenticated browser session was available in this environment.
