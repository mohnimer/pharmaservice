PSC V39.10 — Task 7: Controlled fixed pricing

Purpose
- Implement the Family Catalogue rule: quote-led families remain Request quote; only families marked "Fixed price when approved" may publish a fixed institutional price.
- Preserve evidence hierarchy. Acorus MRP is an internal retail benchmark only and never feeds PSC selling price.
- Follow PSC financial control: Landed Cost = verified B2B cost + freight/delivery + install/labour + FOC/other direct cost. Enter 0 explicitly for verified no-cost components.
- Default target gross margin is 20%. Selling price is reviewed against true landed cost; below-target publication requires a recorded override reason.

Supabase migration (already applied)
- Added controlled pricing fields to catalogue_product_options.
- Added catalogue_option_price_history with PSC-admin-only RLS.
- Added database guard preventing fixed-price publication unless:
  * family permits fixed pricing;
  * product option is APPROVE + customer selectable;
  * current option verification exists;
  * B2B cost and every direct-cost component are explicitly entered;
  * VAT rate + evidence are verified;
  * price evidence is VERIFIED_CURRENT;
  * quote date and unexpired validity are recorded;
  * GM meets target or margin override reason is recorded.
- Added public-safe views catalogue_public_fixed_prices and catalogue_family_price_public. These expose selling price only; supplier cost, MRP, landed cost, margin and supplier data remain private.

Frontend
- Family Options admin desk now includes a collapsible Fixed-price control for eligible STANDARD PRODUCT FAMILY records.
- Shows landed cost, target sell price, actual GM and price verification state.
- Request-quote families are explicitly locked to quotation and cannot publish fixed price.
- Public/portal family cards read only catalogue_family_price_public:
  * no released price -> "Fixed price after approval"
  * one released price -> "AED X ex VAT"
  * multiple released prices -> "From AED X ex VAT"
- Medicine and quote-led families remain "Request quote".

Important current state
- No supplier candidate has been automatically approved or priced.
- No fixed price is currently live.
- Existing request / quotation / demo isolation flows are not replaced by this patch.

Files
- app.js
- family-options-v39.css
- family-layer-v39.js
- family-layer-v39.css
- index.html
- V39_10_TASK7_CONTROLLED_PRICING.sql
