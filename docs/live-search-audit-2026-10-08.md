# PSC live search audit — 8 October 2026

Production search commit: `328bcef95035b07c453a48ebec95aea99f00cc1a`. Public served JavaScript SHA-256 matches the tested bundle: `e7c7af290358df5e5f7b1365ed5ddbed960ac531af594d1b55e89dc8198ffb32`.

## What was actually tested

Authenticated production browser, Shop landing → query → Apply → actual DOM product cards. All 11 queries below were repeated after deployment. These are live rendered results, not retrieval-function output or mocked tests. Browser desktop viewport; responsive local tests are separately identified.

| Query | Interpreted concept | Rendered cards |
|---|---|---|
| antihistamine | antihistamine | 19 |
| anti histamine | anti histamine | 19 |
| antihistamin | antihistamin | 19 |
| cetirizine | cetirizine | 9 |
| allergy medicine | allergy medicine | 18 |
| whelchair | wheelchair | 1 |
| oxygen thing with meter | oxygen regulator | 2 |
| machine to check pressure | blood pressure | 1 |
| sugar machine | glucose meter | 1 |
| big gauze | gauze | 1 |
| stethscope | stethoscope | 1 |

## Exact rendered IDs and first five names

### antihistamine

IDs: `PSC-MED-003`, `PSC-MED-102`, `PSC-MED-104`, `INST-0208`, `INST-0209`, `INST-0210`, `PS-AC-49C544EA6E0C`, `PS-AC-70BCF2EF8CA0`, `PS-AC-8E9FE3B9BBC4`, `PS-AC-CF2A59100FF8`, `PS-AC-3E7CD6BDAB3C`, `PS-AC-89836E13CEAE`, `PS-AC-B5F68F0EEF03`, `PS-AC-CA529915334B`, `PS-AC-8D861823242C`, `PS-AC-A9F14BB5E5C6`, `PS-AC-7789FFECC541`, `PS-AC-286239754589`, `PSC-MED-126`.
First five: ZYRTEC 10MG TAB 20'S; ZYRTEC 1MG/ML ORAL SOLUTION 75ML; ZYRTEC 10MG/ML ORAL DROPS 10ML; Cetirizine — Oral liquid presentation; Loratadine — Tablet presentation.

### anti histamine

IDs: `PSC-MED-003`, `PSC-MED-102`, `PSC-MED-104`, `INST-0208`, `INST-0209`, `INST-0210`, `PS-AC-49C544EA6E0C`, `PS-AC-70BCF2EF8CA0`, `PS-AC-8E9FE3B9BBC4`, `PS-AC-CF2A59100FF8`, `PS-AC-3E7CD6BDAB3C`, `PS-AC-89836E13CEAE`, `PS-AC-B5F68F0EEF03`, `PS-AC-CA529915334B`, `PS-AC-8D861823242C`, `PS-AC-A9F14BB5E5C6`, `PS-AC-7789FFECC541`, `PS-AC-286239754589`, `PSC-MED-126`.
First five: ZYRTEC 10MG TAB 20'S; ZYRTEC 1MG/ML ORAL SOLUTION 75ML; ZYRTEC 10MG/ML ORAL DROPS 10ML; Cetirizine — Oral liquid presentation; Loratadine — Tablet presentation.

### antihistamin

IDs: `PSC-MED-003`, `PSC-MED-102`, `PSC-MED-104`, `INST-0208`, `INST-0209`, `INST-0210`, `PS-AC-49C544EA6E0C`, `PS-AC-70BCF2EF8CA0`, `PS-AC-8E9FE3B9BBC4`, `PS-AC-CF2A59100FF8`, `PS-AC-3E7CD6BDAB3C`, `PS-AC-89836E13CEAE`, `PS-AC-B5F68F0EEF03`, `PS-AC-CA529915334B`, `PS-AC-8D861823242C`, `PS-AC-A9F14BB5E5C6`, `PS-AC-7789FFECC541`, `PS-AC-286239754589`, `PSC-MED-126`.
First five: ZYRTEC 10MG TAB 20'S; ZYRTEC 1MG/ML ORAL SOLUTION 75ML; ZYRTEC 10MG/ML ORAL DROPS 10ML; Cetirizine — Oral liquid presentation; Loratadine — Tablet presentation.

### cetirizine

IDs: `INST-0208`, `PSC-MED-003`, `PSC-MED-102`, `PSC-MED-104`, `PS-AC-49C544EA6E0C`, `PS-AC-CF2A59100FF8`, `PS-AC-3E7CD6BDAB3C`, `PS-AC-89836E13CEAE`, `PS-AC-B5F68F0EEF03`.
First five: Cetirizine — Oral liquid presentation; ZYRTEC 10MG TAB 20'S; ZYRTEC 1MG/ML ORAL SOLUTION 75ML; ZYRTEC 10MG/ML ORAL DROPS 10ML; Cetralon Cetirizine 5 mg/5 ml Syrup — 75 ml.

### allergy medicine

IDs: `PSC-MED-003`, `PSC-MED-102`, `PSC-MED-104`, `INST-0208`, `INST-0209`, `INST-0210`, `PS-AC-49C544EA6E0C`, `PS-AC-70BCF2EF8CA0`, `PS-AC-8E9FE3B9BBC4`, `PS-AC-CF2A59100FF8`, `PS-AC-3E7CD6BDAB3C`, `PS-AC-89836E13CEAE`, `PS-AC-B5F68F0EEF03`, `PS-AC-CA529915334B`, `PS-AC-8D861823242C`, `PS-AC-A9F14BB5E5C6`, `PS-AC-7789FFECC541`, `PS-AC-286239754589`.
First five: ZYRTEC 10MG TAB 20'S; ZYRTEC 1MG/ML ORAL SOLUTION 75ML; ZYRTEC 10MG/ML ORAL DROPS 10ML; Cetirizine — Oral liquid presentation; Loratadine — Tablet presentation.

### whelchair

IDs: `PSC-EQP-006`.
First five: Wheel chair.

### oxygen thing with meter

IDs: `INST-0122`, `PSC-OXY-001`.
First five: Oxygen regulator and flowmeter; Oxygen cylinder with regulator and flow meter.

### machine to check pressure

IDs: `PSC-DIA-003`.
First five: Electronic Blood Pressure (BP) apparatus.

### sugar machine

IDs: `PSC-DBT-001`.
First five: Glucometer.

### big gauze

IDs: `PSC-WND-016`.
First five: Sterile gauze — 10 × 10 cm.

### stethscope

IDs: `PSC-DIA-008`.
First five: Stethoscope.

## Antihistamine membership and count definitions

The 19 live antihistamine results comprise 16 exact catalogue product records and three existing generic presentation records: INST-0208 (cetirizine oral liquid), INST-0209 (loratadine tablets), INST-0210 (loratadine oral liquid). These are not 19 unique brand SKUs. The 16 exact records are Zyrtec (three presentations), Cetralon, Claritine, Dora, Finallerg (three presentations), Glotrizine, Glozal, Lohist (two presentations), Telfast (two strengths) and Panadol Night. Panadol Night is a combination containing diphenhydramine; it is excluded from the lay 'allergy medicine' results. Existing verified ingredient/classification relationships determine membership; this release creates no medical facts.

685 records exist in the precomputed build index, 613 visible in the frozen catalogue. 483 records lack important metadata; 311 of 323 medicine records lack one or more important medicine fields. Those gaps remain flagged, not invented. The authenticated published storefront currently renders 664 catalogue lines with no query and maps 114 lines to DHA requirements. Runtime published visibility differs from frozen visibility; the counts describe different datasets, not inconsistent search counts. Search count derives from the same filtered array as the cards.

## Before/after discriminating queries

- BP machine: four cards including three replacement cuffs → one monitor, PSC-DIA-003.
- Big gauze: five mixed gauze/bandage cards including 5 × 5 → one 10 × 10 product, PSC-WND-016.
- Class and ingredient queries remain constrained to verified relationships.
- Model-ranked IDs no longer prepend to all remaining catalogue records. Hidden/invented IDs are rejected in automated adversarial tests.

## Regression evidence and limits

Live: catalogue landing loads; All Supplies displays 664 cards; clearing restores 664; Cuts & Wounds browses 42; Apply and Enter work; wheelchair detail opens; adding a wheelchair updates the draft; request drawer opens; unknown indexed medicine 'bilastine' shows no match and unlisted-requirement action. Temporary wheelchair test line removed, leaving Request 0. No production request submitted.

Local: all 11 query paths at 320/390/1440; catalogue regressions at 390/768/1024/1440; complete request command sequence at 390/1440; compatible strips context; unlisted handover; simulated submission with zero backend writes; stale-response isolation. These local tests use mocked authentication/backend and do not certify production submission.

Live audit additionally found request drawer close-button overlap (portal header z-index 120, drawer 100). Follow-up raises only the drawer overlay stack and tests close-button hit targeting. Final live closure verification is recorded after that follow-up release.

Physical iPhone Safari keyboard/browser chrome remains unverified. Cloud browser viewport control is unavailable; responsive tests are local, not live mobile certification. Submission and account security were not penetration-tested here. Customer-safe candidate boundaries and demo zero-write behaviour are automated checks, not a claim of exhaustive security verification.

## Latency and remaining programme work

Local retrieval regression: 28 cases, mean 3.826 ms, p95 21.934 ms (retrieval only; no network/render). Live Apply-to-browser-observation samples: 958, 879, 834, 633, 691, 637, 552, 594, 560, 468, 563 ms. These include automation and DOM observation overhead, so are not precise customer latency measurements.

This fixes candidate-grid discrimination, not the whole dependable procurement companion programme. Remaining work: source-approved enrichment gaps, Undo/reversible request edits, broader site/reference handling, real iPhone testing, production handover verification in an approved test account, durable search learning and a customer pilot.

