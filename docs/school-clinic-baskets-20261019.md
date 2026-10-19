# PS School Clinic Opening, Replenishment & First-Aid Collections

Status: **Commercial curation in review; not a regulatory certification, not a verified price list**. Prepared 19 October 2026.

## Authority and boundaries

- Primary source: [DHA Standards for Clinics in Educational and Academic Settings, issue 4.1, effective 11 June 2025](https://dha.gov.ae/uploads/052025/Standards%20for%20Clinics%20in%20Educational%20and%20Academic%20Settings2025552476.pdf).
- The source applies to DHA-licensed educational clinics in Dubai. Other emirates, including the historic Sharjah first school order, require the correct authority and exact site requirements to be confirmed.
- Appendix 3 has **79 source requirement subsections** (A:21, B:25, C:24, D:9). The existing PS classification file expands them to **113 planning records** due to sizes, alternatives and distinct presentations (A:24, B:25, C:52, D:12). No inference that there are 113 separate mandatory purchases is permitted.
- Preserve `if required`, `if no separate treatment rooms`, `A or B`, size choices and product-specific clinical decisions.
- The source is a requirements discovery tool; it does not certify an offer or any product as DHA-approved.

## Release design

Three customer journeys are available on the **public catalogue** and **institutional portal catalogue**:
1. **Complete clinic opening and setup:** premises/isolation and hand hygiene/site checks; Appendix 3(A) furniture; (B) diagnostics/emergency devices; (C) first consumable stock; (D) separately authorized medicine/solution schedule.
2. **Clinic consumables and replenishment:** four need groups with existing catalogue candidates, small-pack preference and strict device compatibility (glucose strips, nebuliser masks, etc.).
3. **First-aid points and kits:** five PS-designed prototypes: general campus, sports/gym, science lab, canteen, mobile trips, with **56 bill-of-material component entries**. Each kit has its own risk review, custodian, suggested placement and refill candidates.

Implementation uses `current/behaviour/school-baskets.js` and `current/styles/school-baskets.css`, rendered through `app.js`, while **preserving the original product catalogue identities, search, images, supplier stock and retail prices**.

### Kit boundary

The five kit BOMs are **commercial planning designs, not statutory BOMs**. School nurse and campus risk/safety lead must approve kit position, contents and quantities; staff training and incident response remain school obligations. Laboratory emergency eyewash installations and chemical safety controls require a distinct risk assessment. Do not insert prescription medicines, injectable drugs or DHA Appendix 3(D) solutions in unattended kits.

Physical case/packaging, tamper seals, contents list, expiry label, refill pack, clear kit location and named responsible school person are **design requirements**. They are not yet manufactured or priced.

## Evidence priorities

1. **Confirm intended school and authority:** licensing, student population, clinic room count, nurse/technical validator, safety lead, kit point count by floor/zone.
2. **Normalize model specifications:** specifically examination couch vs observation bed; oxygen cylinder/regulator/flowmeter compatibility and permitted servicing; AED model/pads/battery/training; refrigerated medicines and storage needs; autoclave if required.
3. **Check catalogue matches:** `PSC-*` means possible existing catalogue identity, not confirmed available or specification compliant; `INST-*` denotes provisional requirement-based record. Existing website retail benchmarks are not supplier buy costs.
4. **Source each line and kit component:** formal supplier quote, exact brand/model and pack, current stock, VAT, landed cost, warranty, expiry, lead time and licenses where required. No guessed prices.
5. **Price:** use the private commercial release controls, including packaging, transport, pick/pack, labels, accessories, specialist services and warranty obligations. Internal targets and supplier comparisons remain private.
6. **Authorize and fund:** customer quotation; written approval/PO; cleared advance or supported credit; supplier PO and acknowledgement; inspect; delivery and acceptance; retain actual records.
7. **Convert to repeat orders:** previously supplied exact SKU/pack choices, simple nurse confirmation of needed quantity and delivery interval. Do not burden the school with PS-owned stocktaking or ERP maintenance.

## Historical comparison

Prior order evidence remains in the private operating workspace. A previous equipment-only quotation does not establish a complete clinic scope, regulatory compliance or current commercial readiness.

## Definition of ready to publish as source-verified

- [x] Full regulatory Appendix 3 subsection coverage through curated catalogue identities.
- [x] Three distinct customer journeys and five scenario kits.
- [x] Quotation-only for general opening and specialized kits.
- [x] Existing product source/master and pricing untouched.
- [ ] Nurse and laboratory safety specialist approval of final kit BOM.
- [ ] Valid supplier and pack/stock evidence for every quoted item.
- [ ] Checked mobile/desktop visual behavior in production-equivalent preview.
- [ ] Tests/build and CI pass.
- [ ] Explicit approval to merge and deploy.

Do not describe a planning set as a ready-made kit with an established price, stocked quantity, or verified compliance.

## Combined release verification

Integrated with the professional portal/home redesign in PR55; PR56's original records and history remain intact. Exact SKU lookup precedes legacy transaction aliases. General replenishment renders only existing visible non-medicine candidates; hidden/licensed-route records stay in the separately authorized schedule. Counts measure rendered candidates. Displayed kit quantities are proposals, not confirmed sales packs. A native unlisted kit request retains the registry version and every proposed component label, original candidate ID and quantity without fabricating SKU records or ordering components. Requests remain site-isolated and quotation-only.

Automated release checks cover all five kit concepts, opening rows/site checks, existing product details, content snapshots, current-site persistence, public and portal catalogue entry, mobile/desktop overflow and absence of backend writes. Clinical and supplier approvals remain open; deployment does not close them.
