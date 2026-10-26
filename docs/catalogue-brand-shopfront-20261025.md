# Historical brand-led preview — superseded

The user requested product-family highlights instead. Current design and QA: catalogue-family-shopfront-20261025.md. Earlier brand version retained below and in commit7cf3a6e.

# Catalogue brand shopfront — 25 October 2026

Merchandising presentation on the existing catalogue; no catalogue, price, supplier, account, evidence or request-data changes.

Global catalogue highlights Braun, Accu-Chek, Nexcare, Sebamed and B.Well when matching catalogue records and suitable existing photographs are present. Category pages only feature relevant candidates; Breathing & Oxygen currently shows B.Well and WOLAID. No promotional banner in DHA mapping views. No manufacturer partnership, stock, endorsement, quality-ranking or discount claim is introduced.

Existing approved image resolution is reused, with actual pictured product/pack alt text. No new/generated pack images or fabricated logos. Brand navigation uses a controlled URL query on the existing catalogue and preserves every matched exact member before grouping. Counts measure rendered listings, not option rows. A clear brand filter returns to all brands; search hides the carousel so it does not compete with product finding.

Rotation is7seconds, stops on hover/focus, offscreen/hidden page and overlays; user pause/play and accessible keyboard tabs are present. Reduced-motion users start paused. Stable slide height prevents product-grid movement; route re-renders retain the selected slide/pause preference. Timers/listeners/observers are cleaned up when the page changes.

Validation: build,3 pure unit cases, catalogue identity/request regression, and browser coverage at320/390/768/1440 for exact brand membership, keyboard controls, reduced motion, contextual brands, search suppression, no page overflow and zero backend writes. Automatic rotation/pause also tested. Working preview uses isolated transport; production is unchanged pending visual review.
