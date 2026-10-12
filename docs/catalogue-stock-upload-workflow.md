# Catalogue and Excel stock refresh

The private controlled Excel and limited public catalogue projection share a revision.
The full supplier stock report, quantities, expiry balances, retailer observations and
commercial research remain private. GitHub contains only the public product identity,
availability flag and retail MRP requested for the website.

## Each Acorus report uploaded in this project

1. Read the original report and its stated date. Reject stale reports. Preserve the
   original raw rows and source meaning in Daily Stock.
2. Match only reviewed exact supplier names/aliases and exact brand, strength, form,
   model and pack. New names and ambiguous packs go into reconciliation, not automatic
   publication. An item absent from a stock-only report has unconfirmed availability.
3. Refresh Acorus quantities, expiry and MRP. Keep other supplier records unchanged.
   A positive exact matched balance and positive MRP may show retail MRP. Otherwise
   show Request quotation without a numeric price. Historical/retailer references do
   not replace missing supplier MRP.
4. Refresh exact-pack UAE retail benchmarks for current selected catalogue items.
   Record one ordinary/list observation per retailer in the mean. Keep promotions,
   source counts, ranges, dates and large price/pack discrepancies separately.
   Sources with unknown listing freshness must remain qualified public references.
5. Preserve sourced GTINs as text. Candidate cross-market barcodes require physical
   UAE-pack confirmation. Keep product and package measurements separate. Never use
   net content as shipping weight or invent dimensions.
6. Assign the next common revision and validate the private workbook. Generate the
   public projection with `tools/sync-catalogue-from-workbook.py`; this publishes no
   supplier quantities or research observations. New variant identities require a
   reviewed family mapping before release.
7. Build and run integrity, no-stock price suppression, family/variant identity,
   desktop/mobile and quotation-request checks. Preserve all completed photographs,
   product descriptions, IDs, homepage and non-Acorus commercial authority.
8. Save the same controlled Excel identity and release the tested website projection.
   Record workbook version, supplier date, shared revision, tested commit, deployment
   and outstanding evidence. Do not report synchronization before both are verified.

Stock uploads in conversation initiate this workflow. An unattended Library-upload
webhook is not available in the present automation event catalogue. Do not claim it
is installed or silently replace it with polling. No report means no newly verified
supplier snapshot.

The catalogue remains broad for wholesale and institutional customers. School-clinic
requirements receive immediate sourcing priority. A pictured family representative
is an identified actual variant, never a claim that its photo applies to other packs.
