# Validation checkpoint — 11 October 2026

## Passed locally

- Source import: all 150 distinct JPEG files decoded at 1200×1200.
- Staging tests: 150 checksums, exact reconciliation counts and no public/build staging directory.
- Strict variant evidence tests: exact identity updates together; pack/family/name/brand mismatches rejected; incomplete evidence held; duplicate identity quarantined.
- Production build.
- Shell tests (3 tests).
- DOM integration suite including family requests and zero simulated backend writes.
- Catalogue suite including exact request snapshots, family hydration, search and zero simulated backend writes.

The tests exercise fixtures and existing catalogue records. They do not certify
every real product photo or price, and no production database was queried here.

## Browser check blocked

`npm run test:catalogue-browser` could not start because Chromium was absent.
`npx playwright install chromium` failed after repeated invalid/truncated ZIP
downloads. No mobile or desktop visual pass is claimed.

## Price research checkpoint

Three exact UAE retailer product listings were retrieved on 11 October 2026
and saved in `staging/catalogue-batch33/uae-retail-evidence.json`:

| Local product | Pack | Displayed AED | Source | Qualification |
|---|---|---:|---|---|
| Aldomet 250 mg | 30 tablets | 18.50 | Nahdi UAE | VAT basis not explicit |
| Alicoxa 200 mg | 20 capsules | 32.50 | myAster UAE | Temporarily out of stock; retailer brand field Tabuk |
| Prospan cough syrup | 100 ml bottle | 42.00 | Life Pharmacy UAE | Retailer displays inclusive of VAT |

These are public retailer benchmarks, not PSC prices, supplier costs or stock
commitments. URL, retailer product ID, commercial unit, exact local option ID,
description and remaining gates are captured per record. All three original
front-pack photographs were visually inspected for the stated strength/pack;
their presentation quality remains unapproved. No record has public release
approval. The importer now joins this evidence by exact family and option ID
into the reconciliation and release inventory, preserving PSC price holds.

## Release decision

HOLD. Source imports and passing technical checks are useful progress, but
full exact image/description/pack/price verification and browser behavior checks
remain outstanding. Production has not been changed.
