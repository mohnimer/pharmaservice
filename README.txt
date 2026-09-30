PSC V29 — Admin CMS / PIM
==========================

Replace:
- app.js
- styles.css

Supabase database/storage work has ALREADY been applied.

What V29 adds to the PSC admin account
--------------------------------------
1. Database-backed Product Master
   - Product name, brand, pack, type and specification
   - Supplier / supplier SKU
   - Buy cost / landed cost
   - VAT / stock / lead time / evidence status
   - Internal notes
   - Internal supply fields never appear in the public/customer storefront API

2. Product Media
   - Upload JPG / PNG / WebP / GIF from the admin product editor
   - 10 MB limit
   - Set a primary image
   - Remove media
   - Media stored in Supabase Storage bucket: product-media

3. Two storefront presentations from one SKU
   - Institutional
   - Wholesale
   Each channel can independently control:
   - Published / draft state
   - Visible / hidden
   - Featured
   - Display order
   - Display name
   - Short / long description
   - Storefront category
   - Pack label
   - Request quote / show price / contact PSC
   - Display price
   - MOQ

4. Storefront Manager
   - Edit channel headline/supporting copy
   - Turn a storefront on/off
   - See published/draft/featured counts
   - Preview published products

5. Institutional catalogue integration
   - Published Institutional CMS rows override the existing JS catalogue
   - Existing static catalogue remains the fallback until the database master is seeded

6. Wholesale storefront
   - New route: #wholesale
   - Only published + visible Wholesale items appear
   - Not added to the main public navigation yet
   - Admin Storefront Manager can open the live Wholesale page

Initial catalogue migration
---------------------------
The first time a PSC admin logs into V29, if public.products is empty,
the current controlled V25/V28 catalogue is automatically seeded into Supabase.
Default states:
- Institutional = published + visible
- Wholesale = draft + hidden

This lets PSC progressively curate the Wholesale storefront without accidentally
publishing unfinished lines.

Security model
--------------
Customer/public storefront data is served through a restricted Supabase RPC that
returns only customer-safe product fields.
Supplier, cost, evidence and internal notes stay in the protected Product Master.
Only PSC admins can manage products, storefront settings or product media.

Product galleries
-----------------
Multiple uploaded, published product images are now returned safely to the customer storefront. Product cards use the primary image; the product detail view can show the image gallery.

FINAL V29 HARDENING
-------------------
- Current PSC master reconciled to Supabase without overwriting existing controlled records.
- 285 total master records are preserved, including legacy wholesale-only Fittydent lines.
- Exactly 260 current institutional catalogue lines are published to the Institutional storefront.
- Wholesale starts unpublished so PSC can curate it deliberately.
- New products default to Draft + Hidden in both storefronts.
- Public/customer reads come from public.published_storefront_catalogue, a customer-safe projection table.
- Supplier, supplier SKU, buy cost, landed cost, evidence status and internal notes are absent from the public table.
- Save Draft does not alter the live storefront. Publish applies channel-specific copy, visibility, price presentation and approved media.
- DHA mapping remains available to the institutional customer presentation.
