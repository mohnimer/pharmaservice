# Catalogue recovery checkpoint — 13 October 2026

## Released repair

PR #26 is merged as 81b882baf42eb7d6b7fd6120262b78e45afd562a. Tested source: 4c78fb20486f0f4f1672c0c5f26ff6152e75833c. GitHub Actions run 38384315210 passed the complete catalogue workflow, including desktop/mobile exact variants, quotation snapshots and overflow checks. Herpesan screenshots at 1440px and 390px were visually reviewed.

Production deployment succeeded. Live HTML, JavaScript, CSS and 55 image assets match the tested build: 58/58 SHA256 checks. The stock/family scripts and stylesheet removed during email integration are restored. Current homepage and email changes are preserved. Herpesan retains its existing ID and source photograph; its displayed identity is Herpesan Gel 5 g, pack 5 g tube, stock-report retail MRP AED 18.50. Its existing route is Allergy, Skin & Bites.

## Excel/catalogue continuity

PSC_Catalogue_Control_20261012.xlsx current version 4 and data/catalogue-public.json share PSC-20261012-STOCK-002, stock-report date 2026-10-12. Regenerating the public projection from the current workbook changes no bytes. Do not publish supplier quantities, batch balances, raw reports or private research to this public repository. MRP is a retail reference; wholesale remains quotation based. Unmatched Acorus items show Request quotation without numeric supplier price.

## Image work still incomplete

The selected stocked catalogue contains 274 products. Workbook image status records 30 verified exact photos, 174 existing images needing verification, and 70 without usable source photographs. The 54 entries in the global verified-preview register are a different scope; never conflate these counts. This release restores runtime controls and corrects Herpesan; it does not complete an image batch or generate new packshots.

Historical batch002 remains 20/50 corrected live entries. Keep its remaining evidence holds; do not claim it is complete or start another batch without the user's direction. Later instructions prioritize the current stocked catalogue and require the workbook and website to stay together. Preserve exact brands, strengths, packs, all 150 supplier originals, existing IDs, and photographic evidence. Do not invent packaging or use generic AI pills. Reuse or improve identified original photographs only with exact identity preserved.

## Resume

Read AGENTS.md, this checkpoint, docs/catalogue-stock-upload-workflow.md, the current controlled workbook and existing batch002 release-progress.json. Verify actual main/deployment before edits. The original repair branch catalogue-evidence-repair-20261010 is historical; the recovered frontend repair is on fix/herpesan-stock-20261013. Current stock/report and image work require private evidence; do not reconstruct availability from the older wholesale list. No production database changes were made.
