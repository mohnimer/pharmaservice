PSC V27.2 — AEG / Group Account Switcher
=========================================

Replace:
- app.js
- styles.css

What it does:
- Group admins such as Loai can switch between every active institution/campus in their Supabase account group.
- Top-right account block now shows:
  group name -> institution -> campus.
- Clicking the account block opens a clean site switcher.
- Switching site reloads only that site's orders, quotations, replenishment history and custom requests.
- The institutional catalogue remains common across accounts.
- The last selected site is remembered locally.
- Each site keeps its own cart so items are not accidentally carried into another site's order.
- Single-site users do not see a switcher.
- PSC admin behavior is unchanged.

Current AEG group in Supabase:
- Far Eastern Private School — Halwan Campus
- Far Eastern Private School — Shahba Campus
- The New Filipino Private School — Main Campus
- The New Filipino Private School — RAK Branch
- Universal Philippine School — Al Ain Campus
