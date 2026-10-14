# Catalogue photograph standard

Approved by Moe on 14 October 2026.

## Customer presentation

Every listing uses a white double frame and contains its product with generous whitespace. Prefer transparent cutouts or clean white-background photography. Keep the product and pack intact. The same listing photo is visible when opening Details. Selecting an exact variant uses its own photograph; family photos do not become evidence for another variant.

Cards omit Pictured / Product example paragraphs. The actual photographed product remains identified in alt text and detail metadata. Stock, price and supply confirmation remain separate.

## Upload through the administrator Product master

1. Open the exact product's editor and choose its photograph.
2. Review the local preview before anything uploads. Check brand, model, strength/form and pack against the listing.
3. Confirm that the image is clear and has no Acorus logo, supplier backdrop or watermark. Manufacturer branding on the actual product is retained.
4. Click Upload reviewed photo as draft. The client checks decoding, minimum 400×400 dimensions, 10 MB limit and known rejected fingerprints. A renamed rejected file is still rejected.
5. Select the primary photograph, visually review it and publish to the intended channel. Upload does not publish automatically.
6. Check the customer card and detail view at mobile and desktop widths.

Visual review is mandatory. OCR is supplementary: the initial OCR scan found only four of 66 visibly branded supplier photos. Do not describe this as an automatic detector of every possible supplier logo.

## Source-controlled photographs

`data/catalogue-image-policy.json` records blocked paths, file fingerprints and clean replacements. `tools/build.mjs` excludes rejected bytes from `dist`, even under another filename. Runtime image selection also rejects the known URLs. `tests/catalogue-image-policy.test.mjs` checks exclusion and fingerprint rejection. `tests/catalogue-photo-standard-browser.mjs` checks framing and card/detail continuity. `tests/catalogue-photo-upload-browser.mjs` exercises preview, review and staged upload using mocked storage.

This release withdraws 66 branded supplier photos and 32 older copies. Eight clean replacements are mapped: seven retained photographs and a CorDx Flu/COVID/RSV self-test photograph matched to the pictured package. Other withdrawn products remain available for quotation while their clean photographs are replaced. All 82 DHA families retain photographs.
