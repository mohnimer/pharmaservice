# Catalogue and Excel stock refresh

The private controlled Excel and limited candidate projection share a revision.
Production is synchronized only after the authorized release and live verification.
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
6. Assign the next common revision and validate the private workbook. For the current
   13-tab master, generate a candidate with `tools/sync-controlled-master.py private.xlsx
   --output candidate.json`; this publishes no
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

## Current retail and availability contract

Retail MRP is reference pricing; wholesale terms are confirmed in quotation. The
earlier MRP-less15% proposal is historical and must not be reinstated by a refresh.
The current master has493 product/candidate rows; unpublished candidates stay private.
The current adapter reads exact PSC IDs, recorded identity/pack, approved source-row
links, typed report date, availability and matched MRP from the13-tab master. It
rejects mismatched packs, duplicate IDs/source links, contradictory availability,
incorrect price caches and changed content without a new revision. The old adapter
targets the legacy workbook layout and is retained only for historical reference.

The public projection adds only `availability_status` beside the existing stock flag
and MRP. Positive balances are labelled Reported in stock with the actual report
date, not promised current inventory. Explicit zero/nonpositive or expired matched
stock is Out of stock; missing/ambiguous source data is Availability unconfirmed.
Both unavailable and unknown records remain quotation-only. A stock-only report
omitting a product does not prove zero stock. No raw quantity or batch balance is
emitted. Original option/request IDs and exact pack matching remain authoritative.

The weekly workflow must issue an upload reminder even when no newer report exists.
It prepares review candidates; it does not automatically publish or send orders.

The catalogue remains broad for wholesale and institutional customers. School-clinic
requirements receive immediate sourcing priority. A pictured family representative
is an identified actual variant, never a claim that its photo applies to other packs.
