PSC V39.33 — START PAGE REGRESSION FIX

WHY THE OLD ELEMENTS CAME BACK
- app.js still renders the original .start16HeroActions block.
- v39-22-front-polish.js still injects .start22SupplyCue ("Requirement → Review → Quotation").
- The earlier v39-28 cleanup removed other Start-page helper blocks, but did NOT target those two elements.
- Therefore later renders could make them visible again even though the intended UI decision was to remove them.
- This is a layer-composition bug, not a deliberate design reversal.

THIS FIX
- removes .start16HeroActions on /start
- removes .start22SupplyCue on /start
- preserves .start16RouteBoard (the 01/02/03 route choices below)
- preserves the previously approved removal of .start16Brief and .start16Bottom
- does not change app.js
- does not change styles.css
- does not touch catalogue, Our Model, Workshop, portal or backend files

UPLOAD
1. index.html
2. v39-28-start-cleanup.js

The index.html differs from V39.32 only by the cache-busting query on v39-28-start-cleanup.js.
