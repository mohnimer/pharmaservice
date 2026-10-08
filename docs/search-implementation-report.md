# PSC search implementation report

Implemented and tested against the existing V50 catalogue; production activation and live authenticated checks remain outstanding.

Indexed **685** actual records (**613** customer-visible). **483** lack important factual enrichment. **311/323** medicine-category/type records remain incomplete. All products receive deterministic search-language enrichment; missing facts are not invented.

## Actual products with verified antihistamine ingredients

These 16 existing product IDs resolve from `antihistamine`, `anti histamine`, `antihistamin` and `anti histamin`. Fifteen are single-ingredient antihistamine products; Panadol Night is a combination containing diphenhydramine and is excluded from lay allergy searches. Product names and packs below remain controlled catalogue values. Each product’s evidence is retained in the index summary.

| Actual product ID | Catalogue product | Verified ingredient(s) |
|---|---|---|
| PSC-MED-003 | ZYRTEC 10MG TAB 20'S | cetirizine |
| PSC-MED-102 | ZYRTEC 1MG/ML ORAL SOLUTION 75ML | cetirizine |
| PSC-MED-104 | ZYRTEC 10MG/ML ORAL DROPS 10ML | cetirizine |
| PSC-MED-126 | PANADOL NIGHT - 24 FILM-COATED TABLETS | paracetamol, diphenhydramine |
| PS-AC-49C544EA6E0C | Cetralon Cetirizine 5 mg/5 ml Syrup — 75 ml | cetirizine |
| PS-AC-70BCF2EF8CA0 | CLARITINE 10MG TAB 10'S | loratadine |
| PS-AC-8E9FE3B9BBC4 | Dora Desloratadine 5 mg — 30 Tablets | desloratadine |
| PS-AC-CF2A59100FF8 | FINALLERG 10MG TAB 10’S | cetirizine |
| PS-AC-3E7CD6BDAB3C | FINALLERG 10MG TAB 20'S | cetirizine |
| PS-AC-89836E13CEAE | FINALLERG 1MG/ML ORAL SOLUTION 100ML | cetirizine |
| PS-AC-B5F68F0EEF03 | Glotrizine 5 mg/5 ml Syrup — 100 ml | cetirizine |
| PS-AC-CA529915334B | Glozal Levocetirizine 5 mg — 20 Tablets | levocetirizine |
| PS-AC-8D861823242C | LOHIST 10MG TAB 10'S | loratadine |
| PS-AC-A9F14BB5E5C6 | LOHIST 5MG/5ML SYRUP 100ML | loratadine |
| PS-AC-7789FFECC541 | TELFAST 120MG TAB 30'S | fexofenadine |
| PS-AC-286239754589 | TELFAST 180MG TAB 30'S | fexofenadine |

## Acceptance query outcomes

| Query | Interpreted concept | Actual result IDs |
|---|---|---|
| ZYRTEC 10MG TAB 20'S | zyrtec 10mg tab 20 s | PSC-MED-003, PS-AC-3E7CD6BDAB3C |
| PSC-DBT-001 | PSC-DBT-001 | PSC-DBT-001 |
| Zyrtec | zyrtec | PSC-MED-003, PSC-MED-102, PSC-MED-104 |
| cetirizine | cetirizine | PSC-MED-003, PSC-MED-102, PSC-MED-104, PS-AC-49C544EA6E0C, PS-AC-CF2A59100FF8, PS-AC-3E7CD6BDAB3C, PS-AC-89836E13CEAE, PS-AC-B5F68F0EEF03 |
| antihistamine | antihistamine | PSC-MED-003, PSC-MED-102, PSC-MED-104, PS-AC-49C544EA6E0C, PS-AC-70BCF2EF8CA0, PS-AC-8E9FE3B9BBC4, PS-AC-CF2A59100FF8, PS-AC-3E7CD6BDAB3C, PS-AC-89836E13CEAE, PS-AC-B5F68F0EEF03, PS-AC-CA529915334B, PS-AC-8D861823242C, PS-AC-A9F14BB5E5C6, PS-AC-7789FFECC541, PS-AC-286239754589, PSC-MED-126 |
| anti histamine | antihistamine | PSC-MED-003, PSC-MED-102, PSC-MED-104, PS-AC-49C544EA6E0C, PS-AC-70BCF2EF8CA0, PS-AC-8E9FE3B9BBC4, PS-AC-CF2A59100FF8, PS-AC-3E7CD6BDAB3C, PS-AC-89836E13CEAE, PS-AC-B5F68F0EEF03, PS-AC-CA529915334B, PS-AC-8D861823242C, PS-AC-A9F14BB5E5C6, PS-AC-7789FFECC541, PS-AC-286239754589, PSC-MED-126 |
| antihistamin | antihistamine | PSC-MED-003, PSC-MED-102, PSC-MED-104, PS-AC-49C544EA6E0C, PS-AC-70BCF2EF8CA0, PS-AC-8E9FE3B9BBC4, PS-AC-CF2A59100FF8, PS-AC-3E7CD6BDAB3C, PS-AC-89836E13CEAE, PS-AC-B5F68F0EEF03, PS-AC-CA529915334B, PS-AC-8D861823242C, PS-AC-A9F14BB5E5C6, PS-AC-7789FFECC541, PS-AC-286239754589, PSC-MED-126 |
| anti histamin | antihistamine | PSC-MED-003, PSC-MED-102, PSC-MED-104, PS-AC-49C544EA6E0C, PS-AC-70BCF2EF8CA0, PS-AC-8E9FE3B9BBC4, PS-AC-CF2A59100FF8, PS-AC-3E7CD6BDAB3C, PS-AC-89836E13CEAE, PS-AC-B5F68F0EEF03, PS-AC-CA529915334B, PS-AC-8D861823242C, PS-AC-A9F14BB5E5C6, PS-AC-7789FFECC541, PS-AC-286239754589, PSC-MED-126 |
| allergy medicine | antihistamine | PSC-MED-003, PSC-MED-102, PSC-MED-104, PS-AC-49C544EA6E0C, PS-AC-70BCF2EF8CA0, PS-AC-8E9FE3B9BBC4, PS-AC-CF2A59100FF8, PS-AC-3E7CD6BDAB3C, PS-AC-89836E13CEAE, PS-AC-B5F68F0EEF03, PS-AC-CA529915334B, PS-AC-8D861823242C, PS-AC-A9F14BB5E5C6, PS-AC-7789FFECC541, PS-AC-286239754589 |
| allergy tablets | antihistamine | PSC-MED-003, PS-AC-70BCF2EF8CA0, PS-AC-8E9FE3B9BBC4, PS-AC-CF2A59100FF8, PS-AC-3E7CD6BDAB3C, PS-AC-CA529915334B, PS-AC-8D861823242C, PS-AC-7789FFECC541, PS-AC-286239754589 |
| antihistamine syrup | antihistamine | PS-AC-49C544EA6E0C, PS-AC-B5F68F0EEF03, PS-AC-A9F14BB5E5C6 |
| cetirizine 10 mg | cetirizine | PSC-MED-003, PS-AC-CF2A59100FF8, PS-AC-3E7CD6BDAB3C |
| loratadine syrup | loratadine | PS-AC-A9F14BB5E5C6 |
| non drowsy antihistamine | antihistamine | PS-AC-7789FFECC541, PS-AC-286239754589 |
| proton pump inhibitor | proton-pump-inhibitor | PSC-MED-107, PSC-MED-112 |
| nsaid tablets | nsaid | PS-AC-764E4D0DB998 |
| whelchair | wheelchair | PSC-EQP-006 |
| wheel chair | wheelchair | PSC-EQP-006 |
| we need big gauze | gauze | PSC-WND-016, PSC-WND-002, PSC-WND-003, INST-0081, PSC-WND-001 |
| need big gaws | gauze | PSC-WND-016, PSC-WND-002, PSC-WND-003, INST-0081, PSC-WND-001 |
| gause | gauze | PSC-WND-003, INST-0081, PSC-WND-001, PSC-WND-016, PSC-WND-002 |
| oxygen thing with meter | oxygen regulator | INST-0122, PSC-OXY-001 |
| oxgen regulater | oxygen regulator | INST-0122, PSC-OXY-001 |
| machine to check pressure | blood pressure | PSC-DIA-003, INST-0138, INST-0139, INST-0140 |
| sugar machine | glucose meter | PSC-DBT-001 |
| kids mask for nebuliser | nebulizer mask | PSC-RES-007 |
| stethscope | stethoscope | PSC-DIA-008 |
| oxygen meter finger | oximeter | PSC-DIA-001 |

Context: selected PSC-DBT-001 → `strips for this` ranks PSC-DBT-002 first with manufacturer-verified compatibility; `and needles` ranks lancets without inventing compatibility. Browser stories verify `add 3 boxes of gloves` asks which actual glove line, then adds quantity 3/unit box after one selection; `add 5 boxes` uses selected gauze context. `make that 5`, remove/retain, site count and Sharjah location use deterministic state. Bilastine is understood but has no indexed match; the original requirement can be added and handed off for review. Gibberish remains genuinely uninterpretable. Big mask asks one product-type question.

## Measured quality

On **28 curated expected-match queries**, top-1 and top-3 relevance are 100%/100%; false-zero rate 0%; incorrect top-1 0%; clarification 7.1%. Mean local retrieval **3.96 ms**, p95 **22.76 ms**. Timings include cold/warm local corpus work, exclude debounce, rendering/network/provider time. Curated results are not a population-wide accuracy claim.

## Regression and remaining work

Build, shell, DOM, catalogue integrity, intelligent search pure/browser, query quality, rendered medicine/unlisted acceptance, catalogue browser and general browser suites passed. They cover navigation, actual cards/images/details, filters/keywords, direct/hash routes, history/refresh, demo request/quote handoff, request drawer, quantity/scope state and zero demo backend writes. Mobile is emulated at 320px minimum; real Safari keyboard/chrome needs device validation.

Weak areas: medicinal brands without adequate identity evidence; classes outside curated mappings; unsupported non-drowsy attributes; unverified accessory compatibility; missing or conflicting product dimensions; price comparisons without controlled prices. No substitutes or clinical advice are fabricated.

Durable cross-user analytics and live authenticated provider/database submission/reload are not verified/configured. Vercel deployment inspection was denied. These gaps prevent reporting the entire brief as production-complete. See intelligent-search.md for audit, schema, migration/update job, fallback and boundaries.
