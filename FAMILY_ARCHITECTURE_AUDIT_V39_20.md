# V39.20 Family Architecture Audit

## Architecture rule now used

**Clinical category → Product family → presentation/configuration where genuinely relevant → exact SKU/brand option → internal supplier source.**

A family is not a supplier SKU. A presentation is not a keyword scraped from a product title. Supplier-source candidates remain behind the family/SKU layer.

## Corrected

- **Cetirizine** remains one family (`PSC-IS-073`). The missing parent link on `INST-0207` was repaired. The family presentation labels are now simply `Tablets`, `Drops`, `Oral solution`; strength/pack belongs on the SKU option.
- **Paracetamol** tablet/liquid placeholder rows were linked back to `PSC-IS-090`.
- **Valved holding chamber / spacer**: removed false `Inhaler` presentation.
- **Vomit / emesis bags**: removed false `Gel` presentation; gel is a feature of a specific bag SKU, not the family form.
- **Respirators**: removed false nebuliser-solution presentation and rejected the mis-mapped Ventolin respiratory solution candidate.
- **Kidney tray/dish**: removed false `Capsules` presentation and rejected the liver/kidney supplement candidate.
- **Nebulizer equipment**: removed false `Nebuliser solution` presentation from device candidates.
- **Sharp Safe box**: removed false `Capsules` presentation and rejected the unrelated capsule candidate.
- **IV infusion set**: removed false `IV solution` presentation; the set is a consumable, not the fluid.
- **Budesonide**: normalized to `Nebuliser solution`.
- **Montelukast**: normalized to `Tablets` and `Chewable tablets`.
- **SPF 50+ sunscreen**: normalized `Cream / Gel` to `Cream-gel` without changing its regulatory family classification.
- **Oral rehydration salts**: removed unsupported/incomplete family-level form list; exact SKU descriptions now carry the form until the set is deliberately verified.
- **Antacid**: normalized `Chewable tablets` separately from `Tablets`.
- **Simethicone**: removed incomplete family-level form selector because source rows show more than the prior `Capsules` label.
- **Lubricating eye drops**: normalized to `Eye drops`.
- **Antibiotic ear drops**: normalized to `Ear drops`; dual eye/ear wording stays on the exact SKU where applicable.
- **Vaccines**: removed the generic presentation selector. Vaccine/route/form is product-specific and remains on the exact SKU.
- **Insulin and delivery consumables**: removed the misleading family-wide `Injection` selector because the family also contains delivery consumables.
- **Dextrose-saline / normal-saline IV families**: normalized to `IV solution`.
- **Normal saline for injection**: normalized to `Injection`; 500 ml IV infusion candidates were rejected as mismatches.
- **Normal saline IV**: dextrose-containing candidates were rejected from the plain-saline family.
- **Product → family parent links**: exact matches plus 28 high-confidence legacy child links were repaired, including BP monitor, ENT set, eye chart, glucometer, nebulizer, pulse oximeter, gloves, respiratory masks, bandages, syringes, wound-closure strips, underpads, oral-dosing syringe, Cetirizine and Paracetamol.

## Deliberately kept separate

- **Salbutamol MDI** and **Salbutamol nebuliser solution** remain separate families. They are the same active ingredient but materially different delivery systems, compatibility requirements and supply/clinical-use context. The current separation is useful rather than accidental duplication.

## Still Needs Verification — not silently changed

- **SPF 50+ sunscreen** is still classified as a `MEDICINE FAMILY`. The family-form data is cleaner, but its final UAE regulatory/product-class treatment should be confirmed against the exact products supplied before changing page type.
- **Insulin and delivery consumables** is still a mixed family. The misleading presentation selector was removed, but splitting insulin from administration consumables should only be done against the intended institutional requirement model rather than invented as a new regulatory line.
- **Vaccines** remains a broad family because the source model currently treats it that way. The UI no longer pretends there is one generic vaccine presentation; exact vaccine SKUs carry the detail.
- **Adhesive plasters / Band aids** are potentially overlapping source families (`PSC-SC-C01` and `PSC-SC-C03`). They were not merged because they may represent distinct authoritative source lines.

## QA

- Remaining non-medicine options carrying a structured medicine-style presentation after cleanup: **0**.
- Known objectively wrong candidate matches rejected: **3** plus the mismatched saline candidate rows.
- Active products named `*presentation*` with no family parent after cleanup: **0**.
- Repaired sampled parent links verified: **28**.
