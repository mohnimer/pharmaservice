PSC V39.23 — Our Model sourcing-flow rethink

Install on top of V39.22.

What changed
- Completely replaces the oversized Category -> Product Family -> Line Item card diagram in Our Model.
- New visual tells the commercial story instead:
  1. One mixed institutional requirement.
  2. PSC sources each line through the route that fits that category.
  3. Customer receives one coordinated quotation and one point of contact.
- Category / family / line-item hierarchy is still visible, but now appears compactly inside each requirement line.
- Uses four realistic examples: pulse oximeter, nitrile gloves, medical oxygen, and Cetirizine.
- No supplier names, costs, stock claims or regulatory approvals are invented.
- Keeps the approved headline/copy above the section unchanged.

No backend, Supabase, quotation or catalogue data changed.
Changed files only:
- index.html
- v39-23-model-flow.js
- v39-23-model-flow.css

QA
- JavaScript syntax checked.
- CSS braces checked.
- V39.22 remains loaded before V39.23; this patch only replaces the Our Model flow after render.
