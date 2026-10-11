import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parent
REPO=ROOT.parents[2]
data=json.loads((ROOT/'selection.json').read_text())
notes=[
'Acure Gripe Water carton; 130 ml appears on front. Existing catalogue name omits volume; exact option pack still requires reconciliation.',
'Aldomet 250 mg front matches brand/strength; 30-tablet count insufficiently legible in original. Prior quality hold retained.',
'Apex 400 carton matches name/strength; six-capsule count insufficiently legible. Prior quality hold retained.',
'Zenith B+ carton, 30 softgels visible; original has small product area and patterned supplier background.',
'Zenith Beauty+ Plus Hair Skin & Nails carton, 30 softgels visible; supplier background and reflection.',
'Bepanthen Moisturizing Cream carton, 30 g visible. Keep separate from ointment and baby-ointment variants.',
'Blink intensive tears soothing eye-drops carton; pack volume not sufficiently legible. Do not substitute Intensive Plus liquid gel.',
'Braun BeardTrimmer carton and device visible; BT-5060 model insufficiently legible. Generic Braun trimmer photo cannot verify model.',
'Braun Satin Hair HD2.2 and 2200W visible; checked full original after contact-sheet lettering was ambiguous.',
'Calvit D3 carton, 30 tablets visible.',
'Cetralon cetirizine hydrochloride syrup, 5 mg/5 ml and 75 ml visible.',
'Clozac Face wash carton consistent with product; 60 ml label insufficiently legible at source resolution.',
'Clozac Gel / Facial Gel carton consistent with product; 50 g label insufficiently legible.',
'CorDx Flu A/B & COVID-19 3-in-1 carton, 1 Test visible; distinct from RSV combo.',
'CorDx Influenza A/B + COVID-19 + RSV Combo Ag Test visible; test-count/presentation qualification pending.',
'Creon 10000 and 150 mg pancreatin visible; 20-capsule count insufficiently legible.',
'Zenith D-Cal carton, 30 softgels visible.',
'Dibase 10,000 IU/ml oral solution / drops identity visible; exact bottle volume not sufficiently legible.',
'Dibase 300,000 IU/ml solution for injection: original carton appears to state 2 AMPOULES, 1 ml. Catalogue claims 1 ampoule. Quarantine pending exact supplier confirmation; do not silently change pack.',
'Dibase 50,000 IU/2.5 ml oral solution visible; number of units per carton not sufficiently legible.',
'Dolvic-K 50 mg carton, 20 caplets visible; catalogue uses Tablets. Preserve wording discrepancy for exact specification reconciliation.',
'Dora desloratadine carton, 30 tablets visible; strength label consistent with 5 mg identity.',
'Duphalac Double Action bottle/carton visible; exact volume not legible and bottle partly cropped.',
'Duphalac Fruit 667 mg/ml carton, 200 ml visible; distinct from Double Action.',
'Emidol 500 mg paracetamol carton, 24 tablets visible.',
'Emivanz 500 mg/5 mg, metformin hydrochloride/glibenclamide, 30 film-coated tablets. Full original confirms 5 mg; contact sheet could misleadingly resemble 75 mg.',
'Black ergonomic toothbrush in blister; exact brand/model and Medium grade not reliably legible.',
'Purple ergonomic toothbrush in blister; exact brand/model and Medium grade not reliably legible.',
'Gevhart 20, olmesartan medoxomil 20 mg, 30 tablets visible.',
'Glotrizine cetirizine hydrochloride syrup, 5 mg/5 ml, 100 ml visible.',
'Glozal levocetirizine 5 mg, 20 film-coated tablets visible. Do not borrow 30-tablet retailer image.',
'HY+AI Gel, sodium hyaluronate + sucralfate; 12 g text insufficiently legible.',
'HY+AI Gel 30 g foreground carton shares photograph with a second carton. Mixed pack photograph unsuitable for isolated exact-variant card.',
'Isomar Spray No Gas Baby carton visible; 30 ml not reliably legible at source resolution.',
'Isomar Daily Hygiene spray nose/ear carton visible; 100 ml and exact presentation require stronger evidence.',
'Isomar daily-hygiene vials carton nose/eyes visible; 20 x 5 ml count/volume not sufficiently legible.',
'Isomar nose-decongestant vials carton visible; 20 x 5 ml count/volume not sufficiently legible.',
'Kool Temp pink BABY cooling gel-sheet carton, 6 sheets visible. Keep separate from Kool Fever brand and child pack.',
'Kool Temp blue CHILD cooling gel-sheet carton, 6 sheets visible. Keep separate from Kool Fever brand and baby pack.',
'Livatrum dietary-supplement carton, 30 tablets visible.',
'Lomexin fenticonazole nitrate 200 mg, 3 ovules visible.',
'Lomexin T fenticonazole nitrate 1000 mg, 1 ovule visible.',
'Lomidex loperamide 2 mg, 10 capsules: full original confirms count; contact-sheet count was ambiguous.',
'Lozaty Ginger carton, 24 throat lozenges visible.',
'Lozaty Orange carton, 24 throat lozenges visible.',
'Manforce Epic Super Thin silk chocolate carton, 3 N condoms visible.',
'Manforce Epic Extra Dotted fruit punch carton, 10 N condoms visible; distinguish 3 N presentation.',
'Manforce Epic Extra Dotted fruit punch carton, 3 N condoms visible; distinguish 10 N presentation.',
'Manforce Epic Long Lasting raspberry carton, 3 N condoms visible.',
'Miderizone 150 mg film-coated-tablet carton visible; active ingredient and 30-tablet count not reliably legible. Do not infer them from filename.'
]
uncertain={1,2,3,7,8,12,13,15,16,18,20,23,27,28,32,34,35,36,37,50}
assert len(notes)==50
for r,note in zip(data['records'],notes):
 i=r['batch_index'];raw=(REPO/r['file']).read_bytes();assert hashlib.sha256(raw).hexdigest()==r['sha256']
 r.update(visual_review='COMPLETED',visual_observations=note,review_method='Original immutable photographs plus labelled full-canvas and native-content QA sheets; ambiguous Emivanz, Dibase injection, Braun dryer and Lomidex inspected individually.',quality_decision='REPLACEMENT_REQUIRED',quality_reasons=['Large padded canvas; actual source-photo region only about 430 pixels wide','Supplier wallpaper / tabletop / reflections remain in product photograph','Product detail is not comparable to the retained native retailer packshots'],supplier_visual_identity_status='PACK_CONFLICT' if i==19 else 'MIXED_VARIANT_PHOTO' if i==33 else 'EXACT_PACK_OR_MODEL_UNRESOLVED' if i in uncertain else 'FRONT_LABEL_CONSISTENT',next_action='Resolve pack conflict with supplier before sourcing exact image' if i==19 else 'Retrieve isolated exact 30 g photograph' if i==33 else 'Source native exact-pack photograph; verify listing, description and dated retail evidence before runtime release')
data.update(batch_id='image-audit-50-20261012',batch_status='AUDIT_COMPLETE_REPLACEMENTS_PENDING',production_changed=False,existing_verified_variants_preserved=34,original_sources_unchanged=True,counts={'audited':50,'original_source_images_approved_for_release':0,'replacement_required':50,'front_label_consistent':28,'pack_or_model_unresolved':20,'pack_conflict':1,'mixed_variant_photograph':1},scope='Exactly 50 previously unreleased Batch33 source candidates. Image audit completion does not mean 50 repaired/live listings. No source identities, prices or pack fields changed.')
(ROOT/'audit.json').write_text(json.dumps(data,indent=2)+'\n')
print(json.dumps(data['counts']))
