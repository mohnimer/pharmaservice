PSC V48 — SYSTEM VISUAL CONSISTENCY

Purpose
- Keeps the V46 Our Model / V47 Homepage visual language as the design system.
- Reworks the homepage sourcing section into a more procurement-specific visual.
- Restyles the public header and footer to match the editorial procurement theme.
- Extends the same typography, paper/off-white palette, linework, spacing and restrained card treatment to:
  * Catalogue
  * The Workshop
  * Start / RFQ
  * Contact
  * Login
  * Customer Clinic Portal
  * PSC Admin / backend portal
- Does NOT replace auth, Supabase, catalogue logic, search logic, request logic, quotation logic or admin actions.

Install
1. Upload index.html to the site root, replacing the current index.html.
2. Upload v48-system-visual-consistency.css to the site root.
3. Upload v48-system-visual-consistency.js to the site root.
4. Leave all V39–V47 files and assets in place.
5. Hard refresh / purge deployment cache after upload.

Important
This is an overlay package, not a blank-server backup. It assumes the existing current repository files remain in place.
