# PSC catalogue operating rules

These rules implement Moe's instructions of 12 October 2026.

- The website catalogue and `PSC_Catalogue_Control_20261012.xlsx` must be generated from the same private controlled dataset; the website uses a limited public projection and carry the same revision and supplier-stock date. Never update one and describe the pair as synchronized until both have been validated and released.
- Acorus is the supplier name on the stock report. The user's references to Aquarius in this workflow refer to that uploaded Acorus report. Preserve the original report name and date.
- Apply each new uploaded Acorus stock report only to explicitly matched Acorus product identities. Never overwrite another supplier's stock or pricing. Preserve exact brand, strength, form, model and pack. No fuzzy or different-pack matches may release prices.
- For Acorus-managed variants, display the report's MRP only when exact stock is matched, quantity is positive, stock has not expired and MRP is positive. Otherwise show Request quotation and no numeric price. Never fall back to historical MRP or retailer benchmarks as a customer-facing supplier price.
- MRP is retail reference pricing. Wholesale selling prices remain quotation-based. Supplier stock is not PSC-owned stock.
- Keep the catalogue broad across wholesale and institutional customers. Schools are the immediate sourcing/verification priority, not a restriction on the product range.
- Group listing cards by controlled product family. A representative photo must identify the actual pictured product. Each selectable variant retains its own identity, pack, stock status and price. A family image is never evidence for another selected variant.
- Prefer a verified photographed stocked variant as the family representative. Do not use AI pills, reference tiles or an unrelated pack as a product photograph. Do not describe a representative as best-selling without sales evidence.
- Retain quotation-only variants and sourcing requirements separately from confirmed stock. Preserve historical source evidence; absence from a stock-only report is unconfirmed availability, not confirmed zero stock.
- On each stock upload, refresh exact-pack UAE benchmarks using independently sourced prices. Keep ordinary/list prices and promotions separate. Record source URLs, check date, source count, minimum/maximum and verification status. A single source is not a multi-source market average. A sale price is not automatically MRP.
- Barcodes/GTINs are text. Preserve leading zeros. Record product weight, shipping weight, product dimensions and package dimensions separately. Estimates must be visibly labelled; unsupported values remain blank.
- Preserve homepage, procurement behavior, existing product descriptions and IDs, non-Acorus commercial authority, and completed image evidence. Do not write to the production database as part of a stock-report frontend update.
- Before publication, verify the shared revision, exact stock/price joins, no-stock price suppression, family/variant image identity, desktop/mobile behavior and quotation requests. Save actual deployment and workbook versions in the release record.
- Uploaded reports initiate this project workflow. Do not claim an unattended Library-upload trigger is installed unless the automation platform explicitly supports it and confirms creation.

- Keep supplier quantities, exact batch/expiry balances, source workbooks, research evidence and internal commercial fields outside the public GitHub repository. The public projection may contain only the user-authorized listing identity, availability flag and retail MRP. Do not publish raw supplier reports or internal analysis.

## Image release instruction — 14 October 2026

- Release available matching product photographs with brief identity/form/strength/pack checks and file decoding. Do not block image-only publication on price research, replacement photography for cosmetic quality, full-catalogue browser sweeps or historical image-evidence gates. Preserve known pack conflicts, existing verified photos, catalogue identities, prices and procurement behaviour.

## Product image standard — 14 October 2026

- Never publish an image containing Acorus branding, supplier logos, supplier backdrops or watermarks. Product/manufacturer branding on the actual pack is retained.
- Every catalogue image uses the shared white double frame, contained product and generous whitespace. Use transparent cutouts or clean white-background photographs when available. Never crop off product or pack identity.
- Cards omit Pictured / Product example paragraphs. Preserve photo identity and representative-versus-exact status in image alt text, image records and the detailed product view.
- A listing's photo remains visible when its detail view opens. Exact variant selection keeps its own photo identity; never silently borrow another variant's photograph.
- `data/catalogue-image-policy.json` blocks rejected asset paths and hashes from the public build, including renamed copies. OCR is supplementary: human visual review is required because logo-only and blurred supplier branding may be missed.
- Image-only changes must preserve IDs, specs, prices, stock and ordering. Release checks must cover card/detail photo continuity, framing, branding rejection and requests on desktop/mobile.
- New images follow: exact identity → source/photo review → no-supplier-branding check → white/transparent preparation → decode/resolution → variant binding → card/detail preview → publish. An uploaded photo is a draft until reviewed and explicitly published.
