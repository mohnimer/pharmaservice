PSC V28 — Demo Institution Sandbox
===================================

Replace:
- app.js
- styles.css

Supabase setup already completed:
- Group: Demo Organisation
- Slug: psc-demo-group
- Sites:
  1. Demo Institution — Head Office
  2. Demo Institution — Branch Site
  3. Demo Institution — Operations Site
- 4 sample orders are seeded across the sites.
- demo@pharmaservice.ae is pre-provisioned as group_admin.

One manual Auth step remains:
Supabase > Authentication > Users > Add user
Email: demo@pharmaservice.ae
Set a shared demo password yourself and auto-confirm the email.
Do not send the password to ChatGPT.

Once created, the existing provisioning trigger automatically attaches
the login to the Demo Organisation and all three sites.

Safety:
- Shared demo users can browse, switch sites, build carts and interact with sample flows.
- New orders, custom requests and quote confirm/cancel actions are SIMULATED LOCALLY.
- Shared demo database records remain pristine.
- Refreshing the page reloads the seeded demo state.
- No AEG/customer records are visible to this tenant.
