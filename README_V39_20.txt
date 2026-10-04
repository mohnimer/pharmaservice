PSC V39.20 — FAMILY ARCHITECTURE CLEANUP

Install after V39.19.

Supabase migration status
-------------------------
The V39.20 family-architecture migration has ALREADY BEEN APPLIED to the PSC Supabase project.
The included SQL file is a reconstruction/audit copy. Do not blindly re-run it in production.

Website patch
-------------
- family-detail-v39.js: removes the Cetirizine-specific hard-coded "10 mg tablets" family label. Family presentation is now only the form; strength/pack stays on the SKU option.
- v39-20-architecture-fallback.js: keeps the static/offline fallback aligned with the cleaned family architecture, repairs known parent links, and hides generic medicine presentation scaffolding (`INST-0207`–`INST-0260`) from the public line-card catalogue. Exact brand/SKU preferences remain inside the family layer.
- index.html: cache bump + loads the V39.20 fallback normalizer.
- family-detail-v39.css: unchanged from V39.19, included only so the family-detail pair can be deployed together.

Data corrections
----------------
See FAMILY_ARCHITECTURE_AUDIT_V39_20.md for the full list of corrected, deliberately-kept, and still-needs-verification cases.

No pricing, margin, stock evidence, VAT evidence, customer orders or supplier costs were changed.
