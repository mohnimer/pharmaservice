PSC V39.12 — TASK 9: REGULATORY + AVAILABILITY DETAIL

Scope
- Adds evidence-gated public availability states for controlled catalogue families/options.
- Adds a DHA requirement panel to family detail views using the controlled family fields already loaded in Supabase.
- Extends Admin > Family Options with explicit availability evidence controls.
- Does NOT touch the site-wide grid/background styling. That is intentionally deferred as requested.

Regulatory display
- DHA badge only appears when the family is explicitly DHA-mapped.
- Detail view uses the wording: "Mapped to DHA Standards for Clinics in Educational and Academic Settings V4.1".
- Shows the controlled requirement wording, source classification and reference already stored on the family record.
- Never uses "DHA Approved".
- Required alternative / conditional classifications remain visible and are not converted into mandatory purchase lines.

Availability control
- Default state is UNVERIFIED.
- Public live states: IN STOCK / LIMITED / OUT OF STOCK.
- A live state requires: verified-at timestamp + valid-until timestamp + evidence reference.
- When the validity window expires, public output automatically falls back to CHECK AT QUOTE.
- Public views expose only safe derived labels, never the raw internal stock/evidence text.
- Admin changes are retained in catalogue_option_availability_history.

Live state after migration
- No product option was automatically marked available.
- Existing 719 supplier candidates remain unapproved/customer-hidden.
- All 191 family availability summaries currently resolve conservatively to CHECK AT QUOTE.

QA performed
- JS syntax checks passed for app.js, family-layer-v39.js and family-detail-v39.js.
- Availability guard rejected an IN STOCK state without evidence.
- A transactionally approved/test option became IN STOCK only with a valid evidence window.
- The same test option automatically fell back to CHECK AT QUOTE when the evidence window was expired.
- Test transaction was rolled back.
