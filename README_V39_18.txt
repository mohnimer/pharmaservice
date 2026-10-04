PSC V39.18 — BRAND PREFERENCE + WHITE FAMILY SELECTORS + MODEL FLOW FIX

Install on top of V39.17.
No Supabase migration is required.

1) CLIENT-FACING BRAND PREFERENCE
- Removes the public approval-gate message from the family page.
- Stops asking the customer to choose an exact supplier/product option.
- Shows controlled brand names as tick-box preferences under the family.
- Brand names come from the family Common Brands / Prominent Brand fields, with approved option brands used only as an additional controlled fallback.
- Customer can tick one or more acceptable brands, leave No brand preference, and/or specify another brand/manufacturer/model/pack.
- Exact SKU/source selection remains a quotation-stage PSC control rather than a customer-facing catalogue approval task.
- Quote/request payload now preserves requestedBrands + requestedBrand + brandPreference.

2) OUR MODEL FLOW
- Fixes the nonsensical refrigerator image shown under Portable Pulse Oximeter.
- Uses the existing Pulse Oximeter product image for the family and exact line example.
- Makes the family and line examples white.
- Adds the same DHA requirement mark asset used on catalogue line cards.

3) FAMILY SELECTOR STRIP
- Family selector cards are white instead of category-tinted.
- Keeps only a subtle category accent line.
- Replaces the text-only DHA tag with /assets/dha-requirement.png — the same DHA mark used on item cards.

Changed files
- index.html
- family-layer-v39.js
- family-layer-v39.css
- family-detail-v39.js
- family-detail-v39.css
- v39-18-fixes.js
- v39-18-fixes.css

QA
- Node syntax check: family-layer-v39.js PASS
- Node syntax check: family-detail-v39.js PASS
- Node syntax check: v39-18-fixes.js PASS
- CSS parser: 0 errors across changed CSS files
- No public copy remains saying named options only appear after PSC approval.
- DHA asset path matches existing catalogue item-card asset: /assets/dha-requirement.png
- Pulse-oximeter product image exists in the supplied site assets: /assets/products/pulse-oximeter.jpg
