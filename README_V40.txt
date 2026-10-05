PSC V40.0 — PUBLIC SITE HUMAN-DESIGN / DE-AI PASS

OBJECTIVE
Make the public PSC website feel art-directed and procurement-specific rather than AI-generated or SaaS-templated.

WHAT CHANGED

1. MOTION
- Retires the V39.32 broad hover-animation stylesheet.
- Keeps V39.32 JS because its loading states / action confirmations are useful.
- Introduces one coherent public-site motion system:
  • major sections enter once, slowly and subtly
  • 8–10px movement maximum
  • no card zooming / bouncing
  • stagger only where it helps scan a group
  • media settles slightly more slowly
  • community section animation is deliberately slowed
  • prefers-reduced-motion remains respected
- Portal/admin routes are explicitly excluded from the new section animations.

2. FEWER AI-SaaS CARDS
- Reduces over-rounding.
- Removes decorative shadows from public panels.
- Converts Contact information into a ledger.
- Converts generic CTA boxes into editorial bands.
- Converts generic media/service card grids into ruled editorial rows.
- Keeps rounded containers where they are genuinely functional.

3. LESS TEMPLATE-LIKE HOMEPAGE
- Removes the grid texture from the editorial introduction.
- Home clinical category preview becomes intentionally asymmetrical on desktop.
- Workshop preview uses unequal columns so the three articles do not look cloned.
- Portal teaser becomes an editorial band rather than another colored card.

4. TYPOGRAPHY
- Reduces oversized public-page headline scale.
- Preserves one strong hero moment per page.
- Secondary headings stop competing with the page headline.
- Keeps the approved Our Model headline treatment.

5. OUR MODEL
- Keeps the existing illustration, but reduces bubble-like radii and decorative shadow.
- “Source per line. Sell one solution.” is no longer a SaaS pill; it reads as a principle.
- Capital / recurring cards and the catalogue walkthrough are quieter and more editorial.
- Exact catalogue walkthrough remains intact.

6. CATALOGUE
- Category cards are less rounded and no longer jump on hover.
- Hover feedback is border/arrow-based rather than lift/zoom.
- Product / family surfaces are flatter and more utilitarian.
- Existing hierarchy, filters, family layer and product behavior are preserved.

7. START + CONTACT
- Start route board becomes a simple navigation ledger rather than a rounded panel.
- Contact form stays functional but loses excessive rounding.
- Contact information becomes structured rows rather than four cards.

8. NAVIGATION
- Active navigation uses a restrained underline instead of a pill / shadow treatment.

NOT CHANGED
- app.js
- styles.css
- Supabase/backend
- request/quote logic
- catalogue data
- product families
- portal/admin behavior
- V39.33 Start cleanup
- V39.36 community section content/image alignment
- V39.37 copy tweak
- V39.38 no-eyebrow rule

UPLOAD
- index.html
- v40-public-human-design.css
- v40-public-human-design.js

Do not delete v39-32-site-microinteractions.js.
The V40 index intentionally stops loading v39-32-site-microinteractions.css.
