PSC V39.11 — Task 8: Generalized Family Detail Experience

Purpose
- Generalize the V39 family-detail experience from the Cetirizine prototype to the full controlled family catalogue.
- Preserve the workbook hierarchy: institutional need → PSC family → presentation → approved customer-selectable option → source.
- Preserve current PSC design, request flow, approval gate, controlled pricing and demo/account behavior.

Controlled family patterns
- Medicine family: generic/family title, common-brand recognition line, presentation selector, optional approved brand selector, licensed-route quotation.
- Standard product family: controlled specification, order/pack basis, optional approved product preference only where Brand Selector Mode permits it, fixed price only if commercially released.
- Compatibility-controlled standard family: same standard product behavior plus an explicit compatibility check derived from the controlled commercial specification.
- Equipment / quote-led family: specification, order basis and quote-led treatment; no medicine-style brand selector where workbook mode is hidden.
- Setup / pass-through family: scope-led request with specialist/pass-through language and no forced product selector.

Commercial and publication controls
- Customer-facing option data still comes only from catalogue_product_option_public.
- Customer-facing fixed prices still come only from catalogue_public_fixed_prices.
- Supplier cost, Acorus MRP, landed cost, margin and internal sourcing data are not exposed.
- No new supplier candidate was approved by this task.

Request persistence
- Portal family requests may now carry no presentation when the controlled family has no presentation list.
- Families that do have controlled presentations still require one; the existing Supabase guard enforces this server-side.
- Order/pack basis is carried into the request line for display and snapshot purposes.
- Specific approved options and other-brand requests preserve the existing structured-request rules.

QA completed
- JS syntax passed for app.js, family-layer-v39.js and family-detail-v39.js.
- CSS parsed with zero errors.
- Hard-coded Cetirizine family ID removed from the detail component.
- All family cards now open the shared detail component.
- Customer detail component contains no raw catalogue_product_options, B2B cost or MRP access.
- Transaction test: a no-presentation standard family was accepted by the existing order-line guard.
- Transaction test: Cetirizine without a required presentation was rejected by the existing order-line guard.
- Tests were rolled back.

No Supabase migration is required for V39.11.
