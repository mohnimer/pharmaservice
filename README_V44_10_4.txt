PSC V44.10.4 — PORTAL MAIN CATALOGUE SEARCH FIX

UPLOAD:
1. index.html
2. v44-10-4-portal-main-search.js

KEEP the existing V44.10.2 search hotfix files in place.

FIX:
The large search field on #portal/catalogue previously only mirrored text into
the top header search. It did not open the actual result route.

NOW:
- Type in the large search field on #portal/catalogue.
- After a short typing pause, the portal opens #portal/catalogue/all.
- The full query is applied automatically.
- Matching product cards are shown immediately.
- Pressing Enter does the same thing instantly.
- The persistent header search remains synchronized.
