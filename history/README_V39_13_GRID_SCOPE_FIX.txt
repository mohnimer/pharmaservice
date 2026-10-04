PSC V39.13 — GRID SCOPE FIX
===========================

Purpose
-------
Undo the V39.4 site-wide technical grid treatment without redesigning any page.

What changes
------------
- Removes repeating grid from .publicLanding and .publicPage.
- Removes repeating grid from the public header.
- Restores the portal/admin canvas to its earlier warm gradient treatment.
- Removes the V39.4 pseudo-grid from generic public page heroes.
- Removes the extra Workshop pseudo-grid that was sitting on top of the Workshop's own grid.
- Preserves the Workshop hero's intentional single 26px editorial grid.
- Does not touch component-local grids such as the V39 family-detail header.

Files
-----
- index.html
- grid-fix-v39.css

No JavaScript, Supabase, catalogue, quotation, authentication or ordering logic is changed.
