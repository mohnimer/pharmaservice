PSC V39.8 — Task 5: Structured Family Request Persistence

Purpose
- Carry a catalogue family request into the existing portal Supply Request basket.
- Persist family_id, presentation, brand preference and approved product_option_id to order_lines.
- Keep existing SKU-based basket/request lines working unchanged.

Files changed
- app.js
- family-detail-v39.js
- family-detail-v39.css
- index.html (cache bump only)
- V39_8_TASK5_STRUCTURED_REQUEST.sql (database guard, already applied to PSC Supabase)

Customer behavior
- On public catalogue: Request quote still goes to the institutional enquiry form.
- In logged-in Clinic Portal catalogue: the same family page now adds a structured family line to Supply Request.
- A presentation is required when the controlled family has presentations.
- Brand modes persisted as: no_preference / specific_option / other_brand.
- Specific approved option preserves product_option_id and an immutable option snapshot.
- Other-brand requests preserve the customer's requested brand/manufacturer/pack text.

Database guard
- Family ID must exist and be active.
- Requested presentation must belong to the controlled family when presentations are defined.
- specific_option is accepted only if the option is active, PSC Decision=APPROVE and Customer Selectable=true.
- Server canonicalizes family name, exact product option, brand and pack snapshots.
- No-preference cannot smuggle a product_option_id.
- Other-brand requests cannot smuggle a product_option_id.

QA completed
- app.js: node --check PASS
- family-detail-v39.js: node --check PASS
- Supabase no-preference family insert: PASS (transaction rolled back)
- Supabase unapproved-option rejection: PASS
- Supabase temporary approved-option canonical snapshot test: PASS (transaction rolled back)
- Zyrtec candidate returned to VERIFY/customer_selectable=false after rollback: VERIFIED

Not in Task 5
- Durable quote-builder edits / immutable quote versions.
- Admin approval workflow for supplier options.
- Fixed-price publication logic.
- Full family-aware replenishment UI.
