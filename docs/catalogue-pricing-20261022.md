# Approximate catalogue prices and dated availability

For Acorus-managed exact products, show the current matched MRP as a crossed-out reference and the approximate PSC price at 15% below MRP. Round to AED cents using integer fils/basis points, matching the controlled workbook's half-up calculation. Final price, VAT and supply are confirmed in quotation. This is a customer display policy, not acquisition cost or a margin calculation.

Do not use historical MRP, public retailer benchmarks or another pack's price when a current exact matched MRP is unavailable. Keep Request quotation. An exact product with positive unexpired reported stock but no MRP still shows In stock and Request quotation.

Availability has three distinct states: In stock, Out of stock, and Availability unconfirmed. Explicit nonpositive or expired stock is out of stock. A missing or unresolved source match remains unconfirmed. No unavailable/unconfirmed exact product gets a numeric supplier price. The report date remains visible; supplier stock is not live PSC-owned inventory.

The existing listing identities, brand/pack groups, photographs, DHA mapping, quotation workflow and non-Acorus commercial controls are retained. Exact selectable options retain their own MRP, indicative price, stock date and availability in the existing request snapshot; no new transaction schema is introduced.

Private source workbooks, quantities, expiry/batch balances, reconciliation evidence and master output remain outside this repository. The limited public projection and controlled workbook share a revision/date, but this change is a review candidate until separately released.

Validation: stock-policy tests cover rounded half cents, missing/zero MRP, expired/explicit-zero/unconfirmed stock, exact identity/pack matching and request-option snapshots. `tests/stock-pricing-browser.mjs` checks the matched option population, customer listing/detail/request actions and mobile/desktop states with mocked transport. Its explicit-zero cases are fixtures, not claims about supplier stock.
