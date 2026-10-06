PSC V44.3 — COLOUR / ICON / PRODUCT VISUAL CORRECTION

Requested corrections implemented:

1. BRING THE COLOUR BACK
- Category cards use colour again.
- Geometry stays uniform: same size, same radius, same spacing.
- Colour is now intentional instead of changing entire page backgrounds.

2. BRING BACK THE ICONS
- Category collage artwork is replaced with the clean existing icon set:
  /assets/clinical-icons/*.png
- Applied to:
  - Home clinical categories
  - Public catalogue categories
  - Buyer portal clinical categories

3. PRODUCT IMAGES
- Current generated / unsettling product illustrations are hidden from:
  - Public catalogue cards
  - Portal product cards
  - Product detail visual area
  - Related product visuals
- The image field stays blank.
- DHA requirement mark remains visible where the product already carries it.
- Drop shadows / filters on product artwork are removed.

4. HOME WORKSHOP PREVIEW
- Restored as three compact blog-preview cards.
- No awkward tall image split.
- No uploaded Workshop artwork in the preview.

5. WORKSHOP GRID
- Restored the subtle 28px grid background to the Workshop landing experience.
- Workshop cards / controls sit over the grid without introducing another page colour.

6. PORTAL BACKGROUND
- Removed #FAF9F9 from the customer portal.
- Portal base and main surfaces are pure white.
- Functional controls use #F5F6F5.
- Clinical category colour cards are intentionally preserved.

PRESERVED
- DM Sans
- Real Pharma Service logo
- V43 Our Model logic
- Catalogue search bar
- app.js and styles.css untouched
- Supabase, catalogue data, orders, quotations, replenishment logic untouched

UPLOAD
- index.html
- v44-full-system-redesign.css
- v44-full-system-redesign.js
