PSC V38 — STRAIGHT WHITE PORTAL RAIL + SITE-WIDE SUPPLIED ICON SYSTEM

WHAT CHANGED
- Replaces the floating dark/black portal rail with one continuous straight white sidebar.
- Desktop remains compact/icon-led; labels appear as clean white tooltips.
- Mobile uses the same white design as a labelled drawer.
- Uses the user-supplied Pinterest/collage artwork wherever the existing UI icon system has a semantic match.
- Existing clinical-category artwork from V37.7.7 is preserved; this pass does not overwrite those with duplicate icons.
- Preserves the V37.7.6 product-modal overlap fix and the V37.7.7 product-preview/category fixes.

CURRENT ICON MAPPING
Dashboard/Home/Menu -> Categories
Shop/Inventory -> Shop
Product Master -> Clinic Supplies
Orders/Stock -> Orders
Requests -> My Requests
Edit/Storefront -> Quotes
Repeat/Fulfilment -> Returns
Resources/Documents -> Resources
Reports/Supplier Feed -> Reports
Mail -> Messages
Search -> Search
Assets -> Mobility & Equipment
Settings/Admin -> Settings
Regulatory/Approved -> Regulatory
Help -> Help
Notifications -> Notifications
Logout -> Logout

UPLOAD AS AN OVERLAY
- app.js -> repository root
- styles.css -> repository root
- assets/app.js -> assets/app.js
- assets/styles.css -> assets/styles.css
- assets/ui-icons/* -> assets/ui-icons/*
- assets/category-*.webp -> assets/ (included to preserve the previous category hotfix)

Do not delete assets/products.
After deployment completes, hard refresh once.
