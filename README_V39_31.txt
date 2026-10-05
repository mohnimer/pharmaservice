PSC V39.31 — Home Hero + Micro-interactions

UPLOAD TO REPOSITORY ROOT:
- index.html
- v39-31-hero-microinteractions.css
- v39-31-hero-microinteractions.js
- assets/hero-school-corridor.webp
- assets/hero-pharmaservice-logo.webp

DO NOT replace app.js or styles.css.

WHAT THIS PATCH DOES
1. Home hero
   - Uses the newly supplied school-clinic corridor image.
   - Image resolves slowly from soft blur to sharp focus.
   - Pharma Service wordmark rises upward into its final position.
   - Responsive crop keeps the children/clinic scene visible on smaller screens.
   - Reduced-motion accessibility is respected.

2. Site-wide micro-interactions
   - Restrained hover/press feedback for buttons and interactive cards.
   - Clear focus-visible states for keyboard navigation.
   - Small open/close motion on disclosure controls.
   - Checkbox/radio tactile feedback.

3. Action feedback
   - Loading spinner/state for submit request, custom request, quote confirm/cancel and login.
   - Existing network-disabled buttons (contact enquiry and Mail Desk send/test) gain spinner feedback automatically.
   - Add-to-request actions briefly confirm with a checkmark instead of leaving the click ambiguous.

SAFETY
- Additive patch only.
- Does not modify app.js, styles.css, Supabase schema, pricing logic or catalogue data.
- Existing V39.28 and V39.29 references are retained in index.html.
