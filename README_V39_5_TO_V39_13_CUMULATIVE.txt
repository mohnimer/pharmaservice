PSC V39.5–V39.13 CUMULATIVE PATCH
==================================

Purpose
-------
This ZIP consolidates the website/code changes from releases V39.5 through V39.13 into a single cumulative patch.

Included functional state
-------------------------
V39.5  Read-only Supabase family catalogue layer
V39.6  Cetirizine family detail prototype
V39.7  Approved brand-option selection gate
V39.8  Structured family request persistence frontend + SQL reconstruction
V39.9  PSC supplier-option control desk + Acorus candidate seed + SQL reconstruction
V39.10 Controlled pricing + fixed-price release guard + SQL reconstruction
V39.11 Generalized family-detail experience across family types
V39.12 Regulatory/DHA detail + evidence-controlled availability + SQL reconstruction
V39.13 Grid scope correction (selected grids only; removes the accidental site-wide grid)

IMPORTANT — DATABASE STATE
--------------------------
The Supabase migrations and seed used during V39.8, V39.9, V39.10 and V39.12 were already applied during the build conversation.
The SQL files are included for reconstruction/audit. Do NOT blindly re-run them against production without checking migration history first.

This cumulative patch intentionally starts at V39.5. It does not include the earlier V39 family-schema foundation migration (Task 1), because that predates V39.5 and was already applied before this release sequence.

Deployment
----------
1. Back up the currently deployed site files.
2. Copy the root files from this ZIP over the matching website files.
3. Do not remove unrelated existing assets/files.
4. Do not re-run included SQL unless the target Supabase project is missing the corresponding migrations.
5. Hard refresh / clear CDN cache after deployment.

Final-file precedence
---------------------
Files were overlaid in strict release order V39.5 -> V39.13. Where multiple releases changed the same file, the newest version is included here.

Key final files
---------------
index.html
app.js
catalogue-family-v39.js
family-layer-v39.js
family-layer-v39.css
family-detail-v39.js
family-detail-v39.css
family-options-v39.css
grid-fix-v39.css
V39_8_TASK5_STRUCTURED_REQUEST.sql
V39_9_TASK6_OPTION_CONTROL.sql
V39_9_TASK6_BRAND_OPTIONS_SEED.sql
V39_10_TASK7_CONTROLLED_PRICING.sql
V39_12_TASK9_REGULATORY_AVAILABILITY.sql

Historical release READMEs are retained under /history for traceability.
