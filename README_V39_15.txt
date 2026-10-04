PSC V39.15 — Transparent Icon Regression Fix

Install after V39.14 (or after the V39.5–V39.13 cumulative patch plus V39.14).

Scope only:
- Removes the baked white/off-white square backgrounds from the eight affected clinical-category illustrations.
- Updates the catalogue/homepage icon references to the transparent PNG assets.
- Uses the user-supplied transparent Infection Control & PPE artwork for category-infection.png.
- Cache-bumps app.js to v3915.

Affected category art:
- Sports Injuries
- Eyes, Ears & Screening
- Diabetes & Testing
- Medicines & Symptoms
- Allergy, Skin & Bites
- Patient Care
- Infection Control & PPE
- Procedures & Consumables

Not changed:
- Product photography / SKU images
- Family-detail logic
- Supabase / pricing / regulatory / availability logic
- Grid scope
- Existing already-transparent category icons (Cuts & Wounds, Breathing & Oxygen, Vitals & Assessment, Emergency & Response, Equipment & Mobility)

QA performed:
- app.js syntax passes Node check.
- No references remain to the eight opaque category-*.webp files in app.js.
- Each replacement PNG is RGBA with transparent outer corners.
- Existing ui-icons were audited locally and were already transparent.
- Current clinical-icons in repository use RGBA PNG assets; no white-tile replacement was required there.
