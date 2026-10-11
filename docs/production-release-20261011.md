# Homepage and catalogue frontend production release

Moe explicitly authorized making the current homepage and latest listing changes live on 11 October 2026, superseding the earlier draft-only/production-unchanged boundary for this release. PR #20 merged as e733802ac536efb4bb2e721e7f98b524a058d2ee. Vercel production status succeeded at https://vercel.com/mohameds-projects-9022ad5a/pharmaservice/4cDssir2Dwy9pkZYv1WHRoNj1Jry through the existing GitHub integration. The Vercel connector listed no accessible projects; no alternate project was created or deployed.

Production URL: https://pharmaservice.ae. The actual live HTML, JavaScript and CSS exactly match the tested built files, SHA-256:

- index.html: ab4316d361eff187549819e7b4dc5025dc3003ad2c7c33384a4e05fbffb5ca2b
- current.js: 4ac80de33576fb9b1c75a1eb46b5aabd9e5ac74a70baf3e71dd6854565e47009
- current.css: 5e5e01be5415c2cc1c4c3f92c6792fb47725c162385675dc3c4e79afb3e13fb7

The previous live JavaScript hash was eb16927b572255b6029e19ec535ecb34a0d12d7c021cf922218dd74d4a103e64; this confirms the new bundle was served. The merge tree exactly equals verified PR head1fc0aeb910d0a4d4abbe748a4539a30c04fddeba. Actions38155823309 passed at that head; runtime cfd08c84 passed38155318574 with252 desktop/mobile screenshots covering all31 previews, homepage CTAs/search and preserved request flows. See prior progress for visual-capture limitations.

Release includes four-section reference homepage with existing header/footer/artwork/functionality, current catalogue listing/variant layout and identity fixes, retail/wholesale notice,31 evidenced preview variants and browser basket snapshots. Public UAE retail benchmarks remain reference prices; zero PSC selling-price approvals. No database migrations, backend deployment or customer transactions were performed. Authentication and actual server submission were not exercised on production; existing server snapshot-clearing limitation remains unresolved.

Private source staging, including next3 Gloclav candidates and rejected images, is excluded by the static build. Original150 photographs and all evidence remain committed, unchanged. Whole-catalogue evidence work is incomplete; the gap ledger still contains582 pending local card records (not unique saleable products). Continue remaining listings in tested batches through a new draft PR; PR #20 is merged, so its earlier draft status is historical.

Post-deploy read-only HTTP verification matched all31 exact variant image SHA-256 values against the checked-in register; zero mismatches. Full results: docs/production-variant-assets-20261011.json. Private staging URL /staging/catalogue-batch33/gloclav-followon-20261011/sources.json returned404. No authenticated browser session or production request was created.
