PSC V39.21 — Visible Family Routing Fix

WHY THIS EXISTS
V39.20 corrected the database/family architecture, but the live product-card click handler still opened the old flat product modal. That is why a card such as PSC-MED-003 still displayed “Cetirizine — Tablet presentation” even though Cetirizine had already been corrected to family PSC-IS-073 in Supabase.

WHAT V39.21 CHANGES
1. Any catalogue line with a catalogueParentId now opens the PRODUCT FAMILY detail instead of the old item modal.
2. The same rule applies to the Request button, so family-backed lines cannot bypass family/SKU preference controls.
3. Generic medicine presentation scaffolds INST-0207 through INST-0260 are hidden from the flat product-card grid. They remain available internally as controlled child/preview records.
4. Family preview images can use the controlled child record even when that child is hidden from the flat grid.
5. Family preview labelling is family-first (for example, “Cetirizine”), not generic child-line-first.
6. Cache versions are bumped to 3921.

EXPECTED CETIRIZINE BEHAVIOUR
Allergy, Skin & Bites -> Cetirizine family -> family modal titled “Cetirizine” -> presentation choices (Tablets / Drops / Oral solution) -> exact Zyrtec SKU boxes such as 10 mg tablets 20s, oral drops 10 ml, oral solution 75 ml -> Add to request.

DEPLOYMENT
Upload/replace family-detail-v39.js and index.html from this patch. V39.20 database migration is already applied and should not be rerun.
