# Procurement basket scenes

Three original AI-generated editorial scenes (v1, retained) illustrate the purchasing tasks of clinic opening, clinical consumables restock, and first-aid points/refills. They were created with the built-in image-generation tool on 19 October 2026 and visually reviewed together for coherent daylight, material detail, composition and lack of branding.

The scenes are discovery artwork, separate from the controlled catalogue and product/component photograph bindings. They do not establish an exact model, pack, included kit contents, clinical suitability or regulatory compliance. The gallery and image alternatives identify them as illustrative. Basket specifications and approvals remain unchanged.

| Task | Asset | Dimensions | Encoded bytes |
| --- | --- | --- | --- |
| Clinic opening & fit-out | `/assets/baskets/clinic-opening-scene-v1.webp` | 1536 × 1024 | 84,800 |
| Clinical consumables restock | `/assets/baskets/clinic-restock-scene-v1.webp` | 1536 × 1024 | 149,256 |
| First-aid points & refills | `/assets/baskets/first-aid-rollout-scene-v1.webp` | 1536 × 1024 | 151,712 |

Original PNGs and the full prompt set are retained in the private execution package. WebP encoding changes format only; the full 3:2 composition is retained with no retouch or crop. Images reserve their intrinsic aspect ratio, decode asynchronously, and later cards load lazily. No generated scene is assigned to a product SKU or used in the component configurator.

Validation covers actual image decoding at 320/390/768/1440, browser overflow, desktop/mobile visual inspection, basket sign-in resumption, exact request snapshots, exclusions, quantities and replenishment. Transaction tests use an isolated transport and send no real requests. This remains part of draft PR55; no production release is authorised by adding these assets.

## Active branded scenes — revision 2

The user's subsequent instruction adds real brands using existing catalogue photographs as image-edit references. The active assets are:

| Task | Asset | Reference SKU / brand | Encoded bytes |
| --- | --- | --- | --- |
| Clinic opening | `/assets/baskets/clinic-opening-scene-brands-v2.webp` | `PS-AC-8291A039F14F` / Braun ThermoScan 7+ | 80,924 |
| Consumables restock | `/assets/baskets/clinic-restock-scene-brands-v2.webp` | `PSC-WND-002` / WOLAID gauze swabs | 156,730 |
| First-aid points/refills | `/assets/baskets/first-aid-rollout-scene-brands-v2.webp` | `PSC-WND-007` / 3M Nexcare Durable bandages | 152,030 |

The built-in image-generation tool edited the scenes with these exact catalogue image references. The main visible brand, design and label were compared visually against each original. The rendered scenes are illustrative reconstructions, not pixel-identical product photographs or verification of fine print. The source catalogue images and all product/pack records remain unchanged. No brand was added to unbranded furniture, cabinets or the generic carry case, and no endorsement or distribution relationship is claimed.

Braun and Nexcare are visual examples and are not automatically added to the clinic/first-aid templates. WOLAID is an existing selected gauze line; the scene does not change its controlled pack or suitability status. The gallery and image alternatives state that brands and contents are confirmed in quotation. All three previews retain their approval gates. Original v1 artwork, v2 PNGs, reference paths, hashes and full edit prompts are preserved in the private execution package.
