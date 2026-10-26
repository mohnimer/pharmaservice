# Shared master navigation and repeat-request table — 26 October 2026

Preview implementation on the existing shopfront feature branch. No deployment.

The customer dashboard now presents delivered request history in a labelled table: Request, Requested, Items and Repeat. Expanding the item count shows product, recorded pack and quantity in a second table. Missing historical packs remain explicitly missing. Repeating creates a new editable request; historical transactions remain unchanged.

The shared header replaces the sidebar and separate public/mobile menus with two top-right icon dropdowns: Browse website and Account/Workspace. Existing routes, role restrictions, campus switching, sign out, search and direct request access remain available. Menus support exclusive opening, outside-click dismissal, Escape and focus restoration. Customer access does not gain admin routes or permissions.

Validation: focused fixture browser coverage across anonymous/customer/admin roles at 320, 390, 768 and 1440 pixels; exact recorded packs, unchanged historical lines, repeat drafts, authorized campus switching, existing document/admin routes, overflow and runtime errors. These isolated tests do not demonstrate real customer data or live backend acceptance. Pre-existing admin fixture product hydration is allowed; transactional/permission mutations are rejected.

Private screenshots and machine-readable results: outputs/master_navigation_20261026. Production remains the previously released main revision. No product data, prices, images, DHA mapping, master workbooks or backend policies changed.
