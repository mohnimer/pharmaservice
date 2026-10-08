# PSC catalogue search: architecture and delivery evidence

## Audit of the V50 baseline

Source: main commit 946e657012c19a0a18cf80d9541af883c527c89a. The live pharmaservice.ae shell responded successfully and matched V50; authenticated production catalogue/provider operations were not exercised.

The controlled catalogue merges the manifest's static data, classification and refresh modules; signed-in CMS reads the Supabase `published_storefront_catalogue` view and approved family options. Products retain PSC IDs (`PSC-*`, `PS-AC-*`, `INST-*`); order lines also support family IDs and approved option snapshots. Public catalogue visibility and authentication remain in the existing application.

The baseline searched names, IDs, brands, models, specifications, packs, curated aliases and about 30 domain concepts. Retrieval used lexical/edit-distance scores and cosine similarity over explicit domain vectors, not pretrained embeddings or a vector database. It lacked verified medicine ingredient/class relationships and had overly broad child-mask aliases. Generic medicine searches could therefore fall through to a crude interpretation failure.

`app.js` retains category filters, actual product cards/images, product detail routes, browser history and the deterministic request basket. Working scope is per institution and includes selected IDs, site count, delivery location and retained items. The mobile request summary opens that same scope as a sheet. Products are loaded client-side; `/api/interpret-request.mjs` uses a build-time copy of the public index. The endpoint verifies existing Supabase authentication and requests constrained output using the installed AI SDK. It does not write catalogue or request records.

## Plan implemented

1. Keep controlled commercial records intact; attach a versioned search record to each existing ID.
2. Generate language aliases and domain vectors across every catalogue record. Preserve explicit factual attributes, provenance and missing-field flags.
3. Extract medicinal facts only from controlled records or matched manufacturer/regulator evidence. Map verified ingredients to sourced WHO ATC ingredient classifications; never treat this as product registration.
4. Combine exact ID/name/brand, fuzzy tokens, aliases, structured ingredients/classes/forms/strengths and domain-vector meaning. Context boosts evidence-backed accessories. Selective LLM enhancement follows immediate local results.
5. Execute commands in existing application state. Require product selection when several genuine lines fit an add instruction. Preserve unlisted original wording without manufacturing an SKU.
6. Retain existing keyword/category fallback and add query regression and narrow mobile stories.

## Search schema and update behavior

`ProductKnowledgeIndex` version 2 records include `id`, `pscSku`, official/display name, brand/model, manufacturer/material when explicit, category/type, specifications, pack/selling unit, explicit dimensions, concepts, aliases/descriptions, vector, institutional context, visibility, fingerprint, provenance, missing fields and enrichment status. `relatedIds` represent search relationships, **not** interchangeable alternatives. `alternatives` and `compatibleIds` require verified source fields or matched evidence records. Evidence links record actual source and target IDs/names.

Medicine records include active ingredient array, generic/INN names, strength/concentration, dosage form, explicit route, therapeutic classes, sourced ingredient ATC classifications, optional verified product ATC, approved claims, missing fields and provenance. Brand-only/provisional listings do not acquire ingredients or classes from model guesses. Missing medicines remain `SEARCH_METADATA_INCOMPLETE`. Search aliases are separate from verified facts.

`tools/build-product-index.mjs` regenerates all records during every build and emits `docs/search-index-summary.json`. Fingerprints invalidate cached enrichment after relevant public record changes, including verified medicine facts and compatibility. Removed records are excluded when rebuilding. Runtime CMS records are re-enriched when changed; the server build index needs a deployment to pick up CMS-only changes. There is no automatic database event subscription or new table/migration. This is the repeatable index-job path allowed by the brief.

Modified components: manifest, product knowledge/index, intent interpreter, API, app search/request handling and build job. Added modules: medicine knowledge, medicine evidence, product relationships and session analytics. No privileged keys or database schema changes. Existing order notes hold scope metadata; existing nullable order-line product/SKU columns hold unlisted descriptions. Reload reconstructs unlisted lines rather than losing their wording.

## Retrieval and boundaries

Normalize spelling/spacing while preserving meaningful dimensions and strength. Interpret into validated action fields (intent, concept/type, terms, size, quantity/unit, reference, clarification and scope). Exact SKU searches return that SKU only. Structured medicine filters precede scoring; wrong form, concentration, unsupported non-drowsy claim and incorrect ingredient/class are excluded. Class matches, exact identities, lexical/fuzzy relevance, domain similarity and verified relationships contribute to ranking.

The index has explicit domain vectors, **not neural embeddings**. It contains reusable medicinal class mappings, including antihistamines, NSAIDs, proton-pump inhibitors and analgesics, rather than an antihistamine-only shortcut. Broader classes still need verified source coverage.

Panadol Night is a verified paracetamol/diphenhydramine combination: it appears lower in ingredient/class discovery, and is excluded from lay allergy queries. This is catalogue discovery, not a clinical recommendation. Child suitability is not invented. The Guide meter/Guide strips relationship is manufacturer-verified; other accessory suggestions do not claim compatibility without evidence.

Submission can invoke the existing LLM asynchronously. Server and client ground IDs to visible real records and constrain medicinal output to locally verified ingredient/class candidates. Sequence guards reject stale responses. The model cannot change the basket or introduce a product fact. Authentication, the existing four-second provider timeout and instance-local burst guard remain. Local retrieval/category browsing survives unavailable provider enhancement; traditional public-field matching is a catch fallback for index errors.

## Acceptance evidence

See [search-implementation-report.md](search-implementation-report.md) for every actual antihistamine ID, acceptance outcomes, counts and limitations. Machine-readable evidence is in `search-quality-results.json` and `search-index-summary.json`.

Tests include exact name/SKU/brand, ingredient/class/form/strength, class typos and lay language, heavy device typos, large gauze, oxygen/pressure/glucose descriptions, pediatric masks, context accessories, deterministic quantity/location/retain commands, no-match/gibberish, malicious model IDs, stale enhancement and unlisted request handoff. Real browser rendering is checked at 320/390/1440px; existing catalogue/history layouts at 390/768/1024/1440px remain covered. Backend/auth are mocked; demo tests assert zero writes.

## Remaining limits

483/685 records have important factual gaps; 311/323 medicine-category/type records remain incomplete (some have sufficient facts for class discovery but lack another required field). These must be supplied from approved records. The report does not equate incomplete records with unusable search results.

Session analytics emit bounded redacted events for search, click, add, clarification, unlisted and abandonment, with a session no-match frequency report. They do not send raw free text, patient/customer identifiers or commercial data to a collection service. A durable cross-user aggregation service is **not configured**, so ongoing commercial search learning remains incomplete.

Live authenticated AI Gateway inference, live non-demo database submission/reload and real iPhone/Safari virtual-keyboard behavior were not verified. Vercel deployment history access was denied. Browser emulation cannot establish device keyboard behavior. Unknown brands/classes without evidence may still yield no class match; unknown dimensions, prices and unverified accessory relations require PS review. No claim of full production completion is made.
