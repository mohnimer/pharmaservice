PSC V44.10.2 — SEARCH HOTFIX

This is an additive correction to V44.10.

FIXED
1. SHOP PORTAL SEARCH
   - Search row no longer has the beige/cream nested-panel appearance.
   - Outer filter wrapper is transparent.
   - Search field is pure white.
   - Input itself is pure white.
   - Search icon background is pure white.
   - Product-type and line filters are white too.
   - One clean grey border, subtle teal focus state.

2. ONE-CHARACTER SEARCH BUG
   - The existing app was rebuilding the catalogue on every literal keypress.
   - V44.10.2 lets the user type continuously, then applies the full query after a 220 ms pause.

3. SEARCH MODE
   - On the public catalogue, the clinical-category grid disappears while a query is active.
   - Search controls and matching results remain visible.
   - On the portal catalogue landing, the category chooser also hides as soon as the prominent search contains text.

UPLOAD
- index.html
- v44-10-2-search-hotfix.css
- v44-10-2-search-hotfix.js

Keep the earlier V44 files in place.
