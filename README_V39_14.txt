PSC V39.14 — Family UI Alignment

Scope: client-facing family-detail UI only.

Changes:
- Replaced the custom/heavy family modal shell with the exact same product-detail shell/classes used by existing item pages.
- Family detail now inherits the existing white/teal catalogue palette instead of separate medicine/equipment/specialist colour themes.
- Added representative catalogue image preview from the family’s controlled catalogue transaction row(s), using the same /assets/products/inst-xxxx.webp assets as item pages.
- Multiple family transaction previews use the existing product-gallery strip when available.
- Compact quick facts: pack/unit, supply basis, pricing, availability, and requirement classification where mapped.
- Family-specific controls (presentation and approved-option preference) now live inside normal product disclosures rather than large standalone cards.
- Regulatory, availability, compatibility and substitution information are retained, but moved into the same accordion pattern as item pages.
- No supplier/MRP/internal cost fields exposed.
- No approval, price, stock, or regulatory status changed.
- No Supabase migration required.

Assumes V39.5–V39.13 cumulative release is already installed.
