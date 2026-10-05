PSC V39.22 — FRONTEND POLISH + WORKSHOP MEDIA

Install on top of V39.21.
No Supabase migration. No catalogue architecture, pricing, request, regulatory or availability data changed.

What changed
1) Our Model
- Replaces the poor/tiny pulse-oximeter rendering in the Category -> Product Family -> Line Item example with a clean transparent product image.
- Enlarges and properly centres the family and line-item product imagery.
- Removes the awkward "Pulse —" prefix in the example line title when present.
- Keeps the family and line-item cards white and leaves the DHA mark treatment intact.

2) Start page
- Fixes the low-contrast / effectively white "It does not need to be cleaned up first." heading.
- Gives the enquiry intro a clearer mint surface and stronger text hierarchy.
- Adds restrained PSC icon character to the three start routes using the existing uploaded UI icon set.
- Adds a compact Requirement -> Review -> Quotation cue beneath the hero CTA.
- Adds a small overlapping icon stamp to the enquiry intro.

3) Workshop media
- Adds the supplied glove artwork to "Which Glove Should I Actually Wear?"
- Adds the supplied AED artwork to "Your AED Has Expiring Parts Too"
- Adds the supplied oxygen-system artwork to "An Oxygen Cylinder Is Not an Oxygen System"
- The artwork appears in Workshop preview cards (including the home Workshop teaser where those guides appear) and as a full editorial image in the individual guide page.
- The source images were only cropped to remove black screenshot framing and compressed to high-quality WebP; the artwork itself was not redesigned.

Files to upload
- index.html
- v39-22-front-polish.css
- v39-22-front-polish.js
- assets/products/pulse-oximeter-clean.png
- assets/workshop/which-glove-should-i-actually-wear.webp
- assets/workshop/aed-has-expiring-parts-too.webp
- assets/workshop/oxygen-cylinder-is-not-an-oxygen-system.webp

QA
- JS syntax checked with Node.
- CSS parsed with zero syntax errors.
- V39.21 script/style references preserved in index.html.
- Patch is DOM-additive/idempotent so it reapplies after the app rerenders on hash navigation.
