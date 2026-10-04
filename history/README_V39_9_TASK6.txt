PSC V39.9 — TASK 6: SUPPLIER OPTION CONTROL DESK

Purpose
- Turn the workbook's Brand Options workbench into a live PSC admin review desk.
- Preserve the rule that Acorus source-list products are candidates until PSC explicitly approves them.

Database changes already applied to Supabase
- 719 Brand Options rows loaded from the controlled workbook across 91 PSC families.
- Source identity corrected from globally unique source_key to unique (family_id, source_key), because the same Acorus item can legitimately be a candidate under more than one PSC family.
- Added company/MAH and supplier-listing evidence fields.
- Added decision history and review timestamps.
- Customer-selectable now requires APPROVE + verification date.
- Internal Preferred requires APPROVE + verification date + B2B cost + current stock evidence.
- Moving an option away from APPROVE automatically clears customer-selectable and Preferred.

Admin UX
- New PSC admin navigation item: Family Options.
- Overview counts for candidates, families, verified, approved, customer-selectable.
- Search by family, brand, exact Acorus product, supplier, reference or company/MAH.
- Filter by VERIFY / APPROVE / HOLD / REJECT.
- Review per family.
- Per option: decision, confirmed brand, controlled presentation, exact pack, B2B cost, VAT evidence/rate, stock evidence, expiry/batch, verification date, customer-selectable, internal Preferred and review note.
- Acorus MRP is labelled as internal retail benchmark only and never becomes PSC selling price.

Files
- app.js
- index.html
- family-options-v39.css
- V39_9_TASK6_OPTION_CONTROL.sql
- V39_9_TASK6_BRAND_OPTIONS_SEED.sql (reproducible source-workbench seed; already applied to connected Supabase)

Deployment
1. Deploy files over the V39.8 Task 5 baseline.
2. The SQL migration has already been applied to the connected PSC Supabase project.
3. Hard refresh once after deployment because app.js is cache-bumped to v399.

Important
- No supplier option has been approved automatically. All 719 imported workbook candidates remain VERIFY until PSC reviews them.
- Public catalogue continues to read only catalogue_product_option_public, so VERIFY / HOLD / REJECT rows are not customer-visible.
