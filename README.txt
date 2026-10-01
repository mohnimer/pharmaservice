V37.6 — Fluid catalogue / request interaction pass

- Product detail now opens in-place with app-like sheet behavior on mobile.
- Persistent Add to request / View request actions keep the user in context.
- Supply Request replaces retail-style cart language in the active customer flow.
- Related products can be explored without losing catalogue position.
- Public catalogue gains the same immediate product inspection pattern.
- Search/filter rerenders preserve position and search focus.
- No payment/checkout mechanics and no Supabase write-path changes.

PSC V37.2 — PUBLIC HIERARCHY + BREATHING ROOM
===============================================

Changes from V37.1:
- Consolidates Who We Supply, What We Supply and How It Works into one buyer-facing page: Our Model.
- Simplifies primary navigation to Our Model, Institutional Catalogue and Contact / Request Supply.
- Moves the desktop logo closer to the left edge and gives the header materially more breathing room.
- Rebalances the login gateway with a wider form column, more card padding, calmer field/button sizing and more whitespace.
- Adds our-model.html and redirects the three retired SEO entry pages to it.
- Updates sitemap/canonical routing for the consolidated page.

PSC V37.1 — PUBLIC COSMETIC POLISH
=================================

This patch keeps V37 functionality intact and refines the public-facing visual system.

Changes:
- Fixed the regulated-lines dark callout headline contrast.
- Removed decorative arrow glyphs from public CTAs.
- Prevented awkward CTA label wrapping and improved button spacing.
- Gave the public header/logo/navigation more breathing room on desktop and tablet.
- Increased spacing and typography refinement in audience cards and conversion blocks.
- Included the static entry/SEO pages in this release overlay.

PSC V37 — Responsive Stabilization + Public Conversion + Customer Account Record
===============================================================================
Baseline: PSC V36 Product Master v2.2
Date: 30 September 2026

UPLOAD / REPLACE
----------------
- app.js
- styles.css
- site-copy.js
- assets/dha-requirement.png (unchanged from V36; included for completeness)

ADD
---
- who-we-supply.html
- what-we-supply.html
- how-it-works.html
- catalogue.html
- contact.html
- about.html
- robots.txt
- sitemap.xml
- V37_SUPABASE_APPLIED.txt
- migrations/v37_conversion_documents_and_enquiry_fields.sql

WHAT V37 CHANGES
----------------
1. Responsive stabilization
- Adds one final authoritative V37 responsive layer at the END of styles.css.
- Mobile portal becomes a real off-canvas layout rather than a compressed desktop layout.
- Compact 64 px portal header, centered PSC logo, hamburger left, compact account control right.
- Catalogue search moves below the header on mobile; cart becomes a compact mobile action.
- Sidebar is fully off-canvas on mobile; labels are readable when opened.
- Dashboard sections collapse cleanly; KPI/action tiles remain usable at phone widths.
- Tables become deliberately horizontally scrollable rather than crushing columns.
- Modal and drawer sizing is mobile-safe and respects device safe areas.
- Product cards are one-column on narrow phones and two-column only where space permits.

2. Public website conversion
- Primary navigation now focuses on Who We Supply, What We Supply, How It Works,
  Institutional Catalogue, and Contact / Request Supply.
- Careers, Media and About are moved to the footer.
- Public catalogue is read-only and no longer forces a prospect into login.
- Homepage clinical-need cards now open the public catalogue.
- Adds evidence/control positioning without invented customer logos or unsupported track-record claims.
- Removes the unverified EST. 1984 public metadata line from the app shell.
- Changes "Wholesale pricing" to "Institutional pricing" in homepage editable copy.
- Uses "Mapped to the applicable DHA clinic requirement" rather than approval language.

3. Public enquiry capture
- Adds organization, institution type, site count, emirate, requirement type and required-by date.
- Adds optional RFQ / product-list upload (PDF, Word, Excel or CSV; max 10 MB).
- Keeps the existing live form backward-compatible at the database-policy level during rollout.

4. Customer portal
- Header search now actually routes a query into the institutional catalogue.
- Removes the decorative notification bell.
- Exposes working Stock & expiry and Clinic assets routes in customer navigation.
- Adds Documents to customer navigation.
- Resources page is converted from dead article CTAs into working account-tool links.
- Removes manufactured "tomorrow" delivery promises. Delivery timing now comes from
  orders.expected_delivery_date when available; otherwise the UI says PSC will confirm timing.

5. Documents layer
- Each live order can carry quotation, PO/approval, invoice, delivery note, acceptance,
  warranty/serial and service records.
- Customer uploads are restricted to customer PO, approval, acceptance and other documents.
- PSC admin can manage the full document-type set.
- Documents are stored privately in Supabase and opened through short-lived signed URLs.
- Adds an account-level Documents page aggregating files from the current site.

6. SEO
- Adds route-specific dynamic title/description/Open Graph/canonical metadata in app.js.
- Adds crawlable static public landing pages for the priority buyer-intent pages.
- Adds robots.txt and sitemap.xml.
- Adds conservative Organization structured data using only supported current public details.

SUPABASE
--------
The connected PSC Supabase project was updated while V37 was prepared. See
V37_SUPABASE_APPLIED.txt and the SQL file in /migrations for the applied schema.

IMPORTANT
---------
- V37 does NOT claim that PSC is "DHA approved".
- Exact product availability, price, stock, tax treatment and regulated supply route remain
  transaction-specific and must be verified before commitment.
- The public catalogue intentionally does not expose internal supplier cost or account pricing.
- This V37 release focuses on the exact requested public/mobile/customer improvements;
  the deeper Deal Desk persistence/release-gate work remains a separate next phase.


V37.4 — THE WORKSHOP + HERO BACKDROP
------------------------------------
- Adds the user-supplied clinical interior as the actual homepage hero backdrop behind the existing hero content.
- Adds The Workshop as a first-class public navigation destination.
- Adds central workshop-data.js content model with 10 launch guides.
- Adds filter/search, reusable editorial index rows, reusable guide template, Save/Print/Share, print styling, empty state and direct route stubs.
- Adds From The Workshop links to matching public catalogue cards and portal product detail modals.
- Adds Related clinic supplies at the bottom of guides, after education.
- Adds a restrained homepage Workshop index and a school-clinic Workshop strip inside Our Model.
- No Workshop interaction writes to Supabase. Save uses localStorage only; Print and Share are client-side.
- Workshop content is intentionally static/local in V37.4. Edit /workshop-data.js to add or change guides; a CMS is deferred.
- Medical copy is conservative editorial draft content and is labelled for professional review before external publication.

V37.5 — WORKSHOP CATEGORY NAVIGATION + VISUAL CLEANUP
-----------------------------------------------------
- Replaces Workshop filter pills with seven prominent editorial category cards directly beneath the hero.
- Uses small in-system line icons instead of large/AI-looking category imagery.
- Removes decorative Workshop micro-slogans / issue labels / post-it-style copy from the landing composition.
- Reduces Workshop hero and featured-guide headline scale; headline remains editorial without relying on oversized type.
- Applies PSC pastel category colors while retaining the technical grid-paper backdrop.
- Keeps guide content in the editorial index rather than turning The Workshop into a generic stock-photo blog grid.
- Search, category filtering, article routes, catalogue links, demo safety and data-write boundaries are unchanged.

V37.5 — Our Model human rewrite
- Rewrites the Our Model page away from startup/SaaS language and toward practical institutional healthcare supply.
- Centers the page on product fit, exact specifications, compatibility, category-specific sourcing, regulated routes, repeat supply, expiry, warranty and useful transaction records.
- Replaces generic audience/process grids with a more editorial, human page structure and concrete product examples.
- Keeps the existing catalogue, Workshop, portal, demo and order/quote behavior unchanged.

V37.5.1 — WORKSHOP GUIDE CARDS + OUR MODEL REWRITE
--------------------------------------------------
This cosmetic/copy release sits on top of V37.5.

Workshop:
- Replaces the oversized featured-story/list presentation with reusable split editorial guide cards.
- Cards use a quiet text panel over a category-colour technical illustration panel; no stock photography or AI-style imagery is required.
- Keeps category navigation, search, filtering, article routes, Save/Print/Share, catalogue links and content storage unchanged.
- Applies the same card language to the homepage Workshop teaser for consistency.

Our Model:
- Completely rewrites the page in a quieter, more experienced institutional-supply voice.
- Removes startup/SaaS-style process language and oversized shouting typography.
- Leads with practical product/specification examples: cuff size, meter/strip compatibility, sterile status, pack conversion, AED consumables, expiry and regulated routes.
- Describes sourcing, comparison, verification and transaction records in plain language rather than presenting them as a software workflow.
- Retains the careful regulatory boundary: regulated lines stay subject to the applicable UAE route and controls.

No database schema, quote/order workflow, portal access, demo isolation or catalogue publication logic changed in this release.
