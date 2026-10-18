# Catalogue search and enquiry review

Base: `fccdc4c2bd12aafdbe981a88acc0f85adf5307cc` (main, PR47). Branch: `feature/catalogue-search-review-20261017`. Local review only; no deployment.

The final source check found navigation, Details disclosures and compact WhatsApp work merged after the earlier baseline. This branch starts from that newer main. It preserves its direction-aware headers, Details-only contact placement, variant-count cards, removal of ambiguous multi-variant packs and disclosure hierarchy. Earlier navigation implementation remains on `feature/catalogue-navigation-help-20261017` at `de573840434cbcd090c63a60eb8bcd4cb7b8c211`; do not merge that branch over the newer frontend.

## Changes

- Category/search counts measure rendered family listings and say “listings.” Exact products and specification-led requirements remain separate records behind those listings.
- Cards carry their exact matched public IDs for identity QA. Grouping, ranking, exact packs, photographs, MRP/stock and request snapshots are unchanged. The compact variant-only presentation from main is retained.
- The existing Details enquiry link drafts the displayed family or selected exact product name/reference/pack. It retains its current appearance and placement and sends no message. Reference-only options stay reference-only.
- Catalogue command input remains16px under the current stylesheet cascade.

## Test interpretation

Grouped search assertions check every exact matching ID, unique family placement, representative membership and card count. Exact antihistamine-set equality and ingredient/size exclusions remain enforced. The size follow-up checks every underlying matched record and the resulting exact request line rather than requiring a representative size to appear on a deliberately simplified family card. Request close waits for the existing exit animation to detach.

All browser tests isolate external transport. They do not validate the live database, supplier stock, regulatory clearance, current manufacturer facts or commercial readiness. Existing product-information approval gates remain in force. No new researched facts are populated.

Validation outcomes and exact final commit are recorded in the private execution checkpoint. Before any future release, compare against newer main again and run the affected search, enquiry, navigation, disclosure, identity, Wishlist and submission checks on the integration commit. Publication requires separate authorization.

Passed locally on this integration: build;three shell checks;15 search/stock/image-identity unit checks; search acceptance320/390/1440; command flow1440/390 including grounded asynchronous ranking and stale-response isolation; exact enquiry-context320/390/1440; current navigation demo390/1440/320-reduced-motion and anonymous390; current disclosure320/1440/390-reduced-motion; cohesion320/768/1440 and school320-reduced-motion; professional catalogue, Wishlist and isolated submission checks. The existing review workflow now runs the focused enquiry and search browser suites. Remote CI has not run on this unpushed branch.
