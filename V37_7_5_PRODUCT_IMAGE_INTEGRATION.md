# V37.7.5 — Product Image Integration (Final)

Base: current `mohnimer/pharmaservice` main build used by the V37.7.5 website / portal.

## What changed

- Added a controlled local catalogue visual for every institutional catalogue transaction from `INST-0001` through `INST-0260`.
- Added 260 optimized 1024 × 1024 WebP files under `assets/products/`.
- Added `assets/products/manifest.json` mapping every `INST-####` transaction ID to its local image and master source image.
- Customer-facing catalogue cards, public product detail, portal product detail, replenishment and the supply-request drawer resolve the controlled institutional image first.
- PSC admin product/storefront previews use the same controlled institutional-image resolver where the catalogue mapping is available.
- The resolver now correctly handles both catalogue-row types:
  - provisional catalogue products whose commercial SKU is already `INST-####`; and
  - existing controlled PSC products hydrated into an institutional row, where `pscSku` remains a PSC SKU and the image is keyed by `catalogueTransactionId`.
- Replaced the homepage hero illustration with the latest supplied Pharma Service institutional-supply collage.
- Added the final six local category visuals used by the V37.7.5 public catalogue/navigation system.

## Image-resolution rule

Institutional imagery is keyed to the controlled catalogue transaction, not to supplier evidence.

Resolution order:

1. `catalogueTransactionId` / `catalogue_transaction_id` when it is an `INST-####` ID;
2. a direct `pscSku` / `psc_sku` when that SKU itself is an `INST-####` ID;
3. for existing PSC SKUs, the current in-memory product master is used to recover the mapped `catalogueTransactionId`;
4. only when no institutional mapping exists does the application fall back to the product's ordinary `imageUrl` / `image_url`.

This matters because the live V25 catalogue contains 260 visible institutional rows, of which 194 are provisional `INST-####` products and 66 reuse existing PSC commercial SKUs. The final resolver gives all 260 rows a controlled institutional image.

## QA performed

- 260 / 260 institutional catalogue rows present in the current `catalogue-v25.js` source.
- 260 / 260 institutional catalogue rows resolve to 260 unique `INST-####` asset IDs with the final resolver.
- 260 / 260 institutional WebP files present.
- 260 / 260 manifest entries present with exact `/assets/products/inst-####.webp` paths.
- 260 / 260 WebP files decode successfully.
- All product images are 1024 × 1024.
- `app.js` and `assets/app.js` are identical and pass `node --check`.
- `workshop-data.js` and `site-copy.js` pass `node --check` in the supplied V37.7.5 bundle.
- Static asset references in the update layer resolve locally except for the four intentional base-repository dependencies: `/data.js`, `/core60-regulatory.js`, `/catalogue-v25.js`, and `/supabase.js`. All four are present on current main and are deliberately not replaced by this image update.

## Commercial / regulatory boundary

These catalogue images are representative product visuals unless a specific supplier / brand / model has been commercially verified. They are not supplier quotations, stock confirmation, regulatory approval, product registration evidence, or a guaranteed delivered model.

For regulated medicines and emergency products in particular, the image is presentation-layer material only. The controlled commercial specification, licensed procurement route, current registered product, batch / expiry, storage requirements and actual supplier evidence remain the procurement basis.

## Deployment

This is a controlled **overlay onto the current main repository**, not a replacement for the existing product master or Supabase bootstrap.

Do not delete current-main files that are absent from this release package. Overlay the included paths onto main, preserving the existing `data.js`, `core60-regulatory.js`, `catalogue-v25.js`, `supabase.js`, legacy fallback product assets and existing backend/configuration files.
