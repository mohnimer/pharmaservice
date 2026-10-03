# PSC V37.7.5 — Final Product Image Release QA

Date: 3 October 2026

## Release decision

**PASS — ready as a controlled overlay onto the current `mohnimer/pharmaservice` main build.**

A mapping defect was found during final QA and corrected before packaging: catalogue rows that reuse an existing PSC commercial SKU were not using the new `INST-####` image because the first image resolver looked only at `pscSku`. The final resolver keys institutional imagery to `catalogueTransactionId` first and recovers the transaction ID for existing PSC SKUs when needed.

## Catalogue coverage

- Current catalogue source: 260 institutional rows (`INST-0001` … `INST-0260`).
- Runtime catalogue-visible products: 260.
- Existing PSC commercial products hydrated into catalogue rows: 66.
- Provisional products whose commercial SKU is already `INST-####`: 194.
- Final institutional image mapping: **260 / 260**.
- Unique institutional asset IDs resolved: **260 / 260**.
- Missing image mappings: **0**.

## Asset integrity

- WebP files: 260.
- Manifest rows: 260.
- Manifest path mismatches: 0.
- Decode failures: 0.
- Dimensions: 1024 × 1024 for all 260 files.
- Product image payload: approximately 4.79 MB before ZIP compression.

There are intentionally reused representative visuals across product variants and related presentation families (for example glove sizes, syringe sizes, bandage widths, oral-liquid medicine families and tablet medicine families). These are presentation assets, not exact-pack evidence.

## Application coverage checked

The controlled image resolver is used by:

- public institutional catalogue cards;
- public product detail sheets;
- portal catalogue cards;
- portal product detail sheets;
- related-product rails;
- replenishment views;
- supply-request drawer lines; and
- PSC admin product/storefront previews where the catalogue mapping is available.

## Syntax / static checks

- `node --check app.js` — PASS.
- `node --check assets/app.js` — PASS.
- Root and `/assets` application copies — byte-identical after final patch.
- `node --check workshop-data.js` — PASS.
- `node --check site-copy.js` — PASS.
- 260 institutional image files — PASS decode check.
- Static references in the update layer — PASS, subject only to the four deliberate current-main dependencies listed below.

## Current-main dependencies intentionally preserved

This overlay does not replace:

- `/data.js`
- `/core60-regulatory.js`
- `/catalogue-v25.js`
- `/supabase.js`

They are present on current main and remain the source of truth for the product master, catalogue construction and Supabase bootstrap.

## Commercial / regulatory caution

The image layer must not be interpreted as verification of an exact supplier model, stock, approval, registration, price, tax status, pack or licensed availability. The catalogue's specification and the live supplier / regulatory evidence continue to control the transaction.
