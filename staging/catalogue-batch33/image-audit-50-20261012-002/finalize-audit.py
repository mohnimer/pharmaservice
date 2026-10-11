import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parent;REPO=ROOT.parents[2]
data=json.loads((ROOT/'selection.json').read_text())
notes=[
'Moven meloxicam 15 mg carton; 10 capsules appears on lower front. Distinct purple strength panel from 7.5 mg.',
'Moven meloxicam 7.5 mg carton; 10 capsules appears on lower front. Distinct pink strength panel from 15 mg.',
'NAN Comfort stage1 green can; exact 800 g weight not reliably legible. Do not substitute stage1 400 g.',
'NAN Comfort stage2 green can; exact 400 g weight not reliably legible. Do not use the 800 g image.',
'NAN Comfort stage2 green can; exact 800 g weight not reliably legible. Keep separate from 400 g.',
'NAN Comfort stage3 green can; exact 800 g weight not reliably legible. Regional formula/artwork must match.',
'NAN Lactose Free blue-panel can; exact 400 g weight not reliably legible. Not a standard Optipro formula.',
'NAN Optipro stage3 blue can; exact 400 g weight not reliably legible. Keep distinct from Comfort3/SupremePro3.',
'NAN SupremePro stage2 gold can; individual full-original review did not resolve tiny weight label. Do not infer 400 g from can shape.',
'NAN SupremePro stage3 gold can; individual full-original review did not resolve tiny weight label. Do not infer 800 g from can shape.',
'Nasaflex nasal spray carton; 18 ml/bottle appears on front, but local name omits volume/strength. Exact supplier presentation reconciliation required.',
'Nokamen carton, 30 tablets visible. Product front does not establish ingredient, strength or clinical approval.',
'Nolvadex tamoxifen 10 mg carton, 30 tablets visible. Separate from Nolvadex-D 20 mg.',
'Nolvadex-D tamoxifen 20 mg carton, 30 tablets visible. Separate from Nolvadex 10 mg.',
'Ozempic semaglutide 0.25 mg carton, 1 pen and4 disposable needles printed. Full-original review confirms dose; pen volume not reliably legible. Do not infer multi-dose content from headline strength.',
'Ozempic semaglutide 0.5 mg carton, 1 pen and4 disposable needles printed. Exact pen volume/presentation remains pending.',
'Ozempic semaglutide 1 mg carton, 1 pen and4 disposable needles printed. Full-original review confirms dose; exact pen volume remains pending.',
'PediaVIT Multi carton, 50 ml visible; do not borrow Vitamin D-only or Fortified product images.',
'Zenith ProLifer carton explicitly reads Prebiotic, Probiotic & L-glutamate and30 softgels. Full original confirms L-glutamate wording; do not silently replace with L-glutamine.',
'ProRise 20 mg carton, 30 hard-gelatin capsules visible. Distinct from 40 mg presentation.',
'ProRise 40 mg carton, 30 hard-gelatin capsules visible. Distinct from 20 mg presentation.',
'Ruset rosuvastatin/ezetimibe 20 mg/10 mg carton, 30 film-coated tablets visible. Preserve ingredient-order strengths.',
'Ruset rosuvastatin/ezetimibe 5 mg/10 mg carton, 30 film-coated tablets visible. Preserve ingredient-order strengths.',
'Sebamed Anti-Dandruff Shampoo front matches product line; net volume absent/unreadable. pH5.5 is not volume.',
'Sebamed Anti-Hairloss Shampoo front matches line; net volume absent/unreadable. Do not infer200 ml from retailer listing.',
'Sebamed Anti-Stretch Mark Cream carton matches line; net weight/volume absent/unreadable.',
'Sebamed Baby Body Lotion with Camomile carton matches line; net volume absent/unreadable. Keep distinct from Baby Body Milk.',
'Sebamed Baby Body Milk with Panthenol carton matches line; net volume absent/unreadable. Previous pack hold preserved.',
'Sebamed Baby Bubble Bath with Camomile carton matches line; net volume absent/unreadable. Do not borrow Gentle Wash.',
'Sebamed Baby Cleansing Bar single carton; net weight absent/unreadable. Do not borrow verified2x150 g value pack.',
'Sebamed Baby Cream Extra Soft tube matches line; net weight absent/unreadable.',
'Sebamed Baby Detangling Shampoo with Bisabolol carton matches line; net volume absent/unreadable. Distinct from camomile shampoo.',
'Sebamed Baby Diaper Rash Cream with Panthenol carton matches line; net weight absent/unreadable.',
'Sebamed Baby Eau de Cologne with Hydrolyzed Silk carton matches line; net volume absent/unreadable.',
'Sebamed Baby Face & Body Wash Foam pump bottle matches line; net volume absent/unreadable. Distinct pump presentation.',
'Sebamed Baby Gentle Wash with Allantoin carton matches line; net volume absent/unreadable. Distinct from Calendula wash.',
'Sebamed Baby Gentle Wash with Calendula yellow-label carton matches line; net volume absent/unreadable. Distinct from Allantoin wash.',
'Sebamed Baby Lip Balm blister matches line; net weight absent/unreadable. Previous hold preserved.',
'Sebamed Baby Massage Oil carton matches line; net volume absent/unreadable. Distinct from Skin Care Oil.',
'Sebamed Baby Powder with Olive Oil bottle matches line; net weight absent/unreadable. Previous hold preserved.',
'Sebamed Baby Shampoo with Camomile carton matches line; net volume absent/unreadable. Previous hold preserved.',
'Sebamed Baby Skin Care Oil with natural oils carton matches line; net volume absent/unreadable. Distinct from Massage Oil.',
'Sebamed Clear Face Antibacterial Cleansing Foam carton matches line; net volume absent/unreadable. Not Gentle Facial Cleanser.',
'Sebamed Everyday Shampoo carton matches line; net volume absent/unreadable. Distinct from Anti-Dandruff/Anti-Hairloss.',
'Sebamed Extreme Dry Skin Relief Shampoo carton visibly5% Urea; ingredient percentage is not net volume. Previous hold preserved.',
'Sebamed Fresh Classic roll-on bottle matches deodorant type; net volume absent/unreadable. Alcohol/free claims or colour alone do not prove exact size.',
'Sebamed Gentle Facial Cleanser carton matches line; net volume absent/unreadable. Distinct from Clear Face antibacterial foam.',
'Sebamed Intimate Wash Foam pH3.8 carton matches foam line; pH is not net volume. Previous hold preserved.',
'Sebamed Intimate Wash pH3.8 carton says women15-50; age bracket/pH are not net volume. Distinct from foam and pH6.8.',
'Sebamed Intimate Wash pH6.8 carton says women50+; age bracket/pH are not net volume. Distinct from pH3.8.'
]
consistent={1,2,12,13,14,18,19,20,21,22,23};assert len(notes)==50
for r,note in zip(data['records'],notes):
 assert hashlib.sha256((REPO/r['file']).read_bytes()).hexdigest()==r['sha256']
 r.update(visual_review='COMPLETED',visual_observations=note,review_method='Labelled native-content contact sheets for all50; NAN SupremePro2/3, all3 Ozempic presentations and ProLifer additionally inspected individually at full original size.',quality_decision='REPLACEMENT_REQUIRED',quality_reasons=['Small source photograph padded into1200-square canvas','Supplier wallpaper/tabletop/reflections remain','Effective product detail below required native retailer-packshot standard'],supplier_visual_identity_status='FRONT_LABEL_CONSISTENT' if r['batch_index'] in consistent else 'EXACT_PACK_OR_PRESENTATION_UNRESOLVED',next_action='Retrieve native exact-pack photograph; preserve original/local IDs and resolve net quantity/presentation before runtime release')
data.update(batch_id='image-audit-50-20261012-002',batch_status='AUDIT_COMPLETE_REPLACEMENTS_PENDING',production_changed=False,existing_verified_variants_preserved=34,original_sources_unchanged=True,counts={'audited':50,'original_source_images_approved_for_release':0,'replacement_required':50,'front_label_consistent':len(consistent),'pack_or_presentation_unresolved':50-len(consistent)},scope='Second disjoint batch of50 unreleased source candidates. No runtime/price/pack/identity or commercial changes. Audit completion is not50 repaired listings.')
(ROOT/'audit.json').write_text(json.dumps(data,indent=2)+'\n');print(json.dumps(data['counts']))
