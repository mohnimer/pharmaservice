# Acorus catalogue reconciliation — 7 October 2026

The supplied Acorus Master contains 405 unique products. The broader Brand Options workbench contains 906 rows: 193 approved options and 713 requiring review. The customer authorized the new master products to appear as enquiry-only listings where approval is pending.

- 359 new products; 46 existing identities retained under their existing SKUs.
- 193 approved exact options, including 147 new products; 212 additional master products are explicitly enquiry-only.
- 269 controlled families, compared with the previous 191. Additional recommended families without a controlled ID are not invented; their products can be requested individually.
- 280 ZIP assets: 205 photographs and 75 explicitly labelled reference tiles. ZIP assets take priority over existing images for the same reconciled identity.
- 117 existing photographs normalized to 1200 × 1200 JPEG, white canvas, aspect ratio preserved and packaging uncropped.
- 79 imported products have neither a ZIP image nor an existing matched photograph. Their cards and options say the photograph is pending.
- Three existing BinSina image URLs block downloading with HTTP 405. Their original images remain available through the existing URLs; the shared `contain` layout applies to them.

`products.csv` records every imported identity, existing/new status, publication decision and image assignment. `image-index.csv` preserves ZIP image provenance and verification wording. `unapproved-brand-options.csv` records the remaining workbench candidates without publishing supplier MRP, cost or commercial offers.

Matching uses exact normalized names and explicit workbook reconciliation aliases. The reviewed Churn 001 mapping preserves existing SKUs. Different strengths, dosage forms and pack counts are never merged using fuzzy similarity.

No database schema, supplier price, stock record or production record is changed by this import. Local products are excluded from automatic CMS seeding. Families and approved options merge with read-only public views. Local-only families/options are requested as description snapshots, with no nonexistent database foreign keys. Demo requests remain local simulations.

To reproduce: capture `window.PSC_DATA` after the pre-application sources and before `catalogue-refresh-data.js`, then run:

```bash
python tools/import-acorus.py /path/to/workbook.xlsx /path/to/images.zip /path/to/catalogue-snapshot.json
npm run build
npm test
npm run test:dom
npm run test:catalogue
```

Python dependencies are openpyxl and Pillow. Both source SHA-256 hashes are recorded in the generated refresh data. The import only reads supplied files and downloads existing public photographs; it never connects to the database.
