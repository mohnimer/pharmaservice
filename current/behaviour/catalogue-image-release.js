// Image-only release. Supplier mapping and brief visual checks, independent of price approval.
// Exact local SKU/name/family guards; no invented pack, price, stock or regulatory approval.
(()=>{
 const rows=[
  {
    "sku": "PS-AC-59DB0A861342",
    "name": "Acure Gripe Water",
    "family_id": "PSC-IS-155",
    "image_url": "/assets/products/supplier-20261014/acure_gripe_water.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-1F1A9E6B4FC8",
    "name": "Apex 400 mg — 6 Capsules",
    "family_id": "PSC-IS-143",
    "image_url": "/assets/products/supplier-20261014/apex_400_mg_6_capsules.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-99FA1184061D",
    "name": "Blink Intensive Soothing Eye Drops",
    "family_id": "PSC-IS-102",
    "image_url": "/assets/products/supplier-20261014/blink_intensive_soothing_eye_drops.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-0BBE53B55838",
    "name": "Braun Beard Trimmer BT-5060",
    "family_id": "PSC-IS-173",
    "image_url": "/assets/products/supplier-20261014/braun_beard_trimmer_bt_5060.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-3F16D478897A",
    "name": "Clozac Acne Face Wash — 60 ml",
    "family_id": "PSC-IS-152",
    "image_url": "/assets/products/supplier-20261014/clozac_acne_face_wash_60_ml.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-0CE987FECF69",
    "name": "CorDx Influenza A/B + COVID-19 + RSV Combo Ag Self-Test",
    "family_id": "PSC-IS-177",
    "image_url": "/assets/products/supplier-20261014/cordx_influenza_a_b_plus_covid_19_plus_rsv_combo_ag_self_test.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-A1C278062616",
    "name": "Creon 10000 Pancreatin 150 mg — 20 Capsules",
    "family_id": "PSC-IS-172",
    "image_url": "/assets/products/supplier-20261014/creon_10000_pancreatin_150_mg_20_capsules.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-FBBA279D40A7",
    "name": "Dibase Vitamin D3 50,000 IU/2.5 ml Oral Solution",
    "family_id": "PSC-IS-187",
    "image_url": "/assets/products/supplier-20261014/dibase_vitamin_d3_50_000_iu_2_5_ml_oral_solution.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-28E43B7879F6",
    "name": "Gevhart 20 mg — 30 Tablets",
    "family_id": "PSC-IS-170",
    "image_url": "/assets/products/supplier-20261014/gevhart_20_mg_30_tablets.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-308B2BDDE1D1",
    "name": "Isomar Daily Hygiene Vials Nose & Eyes — 20 x 5 ml",
    "family_id": "PSC-IS-106",
    "image_url": "/assets/products/supplier-20261014/isomar_daily_hygiene_vials_nose_and_eyes_20_x_5_ml.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-A819E3E83997",
    "name": "Kool Temp Cooling Gel Sheets — Baby — 6 Pieces",
    "family_id": "PSC-IS-042",
    "image_url": "/assets/products/supplier-20261014/kool_temp_cooling_gel_sheets_baby_6_pieces.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-2F1516E65F2A",
    "name": "Kool Temp Cooling Gel Sheets — Child — 6 Pieces",
    "family_id": "PSC-IS-042",
    "image_url": "/assets/products/supplier-20261014/kool_temp_cooling_gel_sheets_child_6_pieces.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-FF88CB6488F5",
    "name": "Livatrum — 30 Tablets",
    "family_id": "PSC-IS-188",
    "image_url": "/assets/products/supplier-20261014/livatrum_30_tablets.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-B018FCD1AB8F",
    "name": "Manforce Epic Desire Super Thin Silk Chocolate — 3 Condoms",
    "family_id": "PSC-IS-145",
    "image_url": "/assets/products/supplier-20261014/manforce_epic_desire_super_thin_silk_chocolate_3_condoms.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-ADD977090A6E",
    "name": "Manforce Epic Passion Extra Dotted Fruit Punch — 10 Condoms",
    "family_id": "PSC-IS-145",
    "image_url": "/assets/products/supplier-20261014/manforce_epic_passion_extra_dotted_fruit_punch_10_condoms.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-3189DA62A42B",
    "name": "Manforce Epic Passion Extra Dotted Fruit Punch — 3 Condoms",
    "family_id": "PSC-IS-145",
    "image_url": "/assets/products/supplier-20261014/manforce_epic_passion_extra_dotted_fruit_punch_3_condoms.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-A3C78A070FA9",
    "name": "Manforce Epic Pleasure Long Lasting Raspberry — 3 Condoms",
    "family_id": "PSC-IS-145",
    "image_url": "/assets/products/supplier-20261014/manforce_epic_pleasure_long_lasting_raspberry_3_condoms.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-BA1BA46AB93C",
    "name": "Nokamen — 30 Tablets",
    "family_id": "PSC-IS-157",
    "image_url": "/assets/products/supplier-20261014/nokamen_30_tablets.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-E35706FB3A4E",
    "name": "ProRise 20 mg — 30 Capsules",
    "family_id": "PSC-IS-171",
    "image_url": "/assets/products/supplier-20261014/prorise_20_mg_30_capsules.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-81356E98EBBB",
    "name": "Sebamed Anti-Dandruff Shampoo",
    "family_id": "PSC-IS-115",
    "image_url": "/assets/products/supplier-20261014/sebamed_anti_dandruff_shampoo.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-2C36D93E590E",
    "name": "Sebamed Anti-Hairloss Shampoo",
    "family_id": "PSC-IS-156",
    "image_url": "/assets/products/supplier-20261014/sebamed_anti_hairloss_shampoo.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-375459036D52",
    "name": "Sebamed Anti-Stretch Mark Cream",
    "family_id": "PSC-IS-181",
    "image_url": "/assets/products/supplier-20261014/sebamed_anti_stretch_mark_cream.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-BCA4C20A407A",
    "name": "Sebamed Baby Body Lotion with Camomile",
    "family_id": "PSC-IS-111",
    "image_url": "/assets/products/supplier-20261014/sebamed_baby_body_lotion_with_camomile.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-A7E10BC19B2E",
    "name": "Sebamed Baby Body Milk",
    "family_id": "PSC-IS-111",
    "image_url": "/assets/products/supplier-20261014/sebamed_baby_body_milk.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-BC5797476CD0",
    "name": "Sebamed Baby Bubble Bath with Camomile",
    "family_id": "PSC-IS-131",
    "image_url": "/assets/products/supplier-20261014/sebamed_baby_bubble_bath_with_camomile.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-11057618863A",
    "name": "Sebamed Baby Cream Extra Soft",
    "family_id": "PSC-IS-111",
    "image_url": "/assets/products/supplier-20261014/sebamed_baby_cream_extra_soft.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-7A9F0B81F0AC",
    "name": "Sebamed Baby Detangling Shampoo with Bisabolol",
    "family_id": "PSC-IS-156",
    "image_url": "/assets/products/supplier-20261014/sebamed_baby_detangling_shampoo_with_bisabolol.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-7DB9B5951968",
    "name": "Sebamed Baby Diaper Rash Cream",
    "family_id": "PSC-IS-148",
    "image_url": "/assets/products/supplier-20261014/sebamed_baby_diaper_rash_cream.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-C53213D441F5",
    "name": "Sebamed Baby Eau de Cologne",
    "family_id": "PSC-IS-140",
    "image_url": "/assets/products/supplier-20261014/sebamed_baby_eau_de_cologne.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-541065052372",
    "name": "Sebamed Baby Face & Body Wash Foam",
    "family_id": "PSC-IS-131",
    "image_url": "/assets/products/supplier-20261014/sebamed_baby_face_and_body_wash_foam.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-FC0E90234C62",
    "name": "Sebamed Baby Gentle Wash with Allantoin",
    "family_id": "PSC-IS-131",
    "image_url": "/assets/products/supplier-20261014/sebamed_baby_gentle_wash_with_allantoin.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-7BECD2DB56A1",
    "name": "Sebamed Baby Gentle Wash with Calendula",
    "family_id": "PSC-IS-131",
    "image_url": "/assets/products/supplier-20261014/sebamed_baby_gentle_wash_with_calendula.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-C24E6EFF64E5",
    "name": "Sebamed Baby Lip Balm",
    "family_id": "PSC-IS-162",
    "image_url": "/assets/products/supplier-20261014/sebamed_baby_lip_balm.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-616AA1152228",
    "name": "Sebamed Baby Massage Oil",
    "family_id": "PSC-IS-111",
    "image_url": "/assets/products/supplier-20261014/sebamed_baby_massage_oil.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-3EE243EE9AD4",
    "name": "Sebamed Baby Powder with Olive Oil",
    "family_id": "PSC-IS-141",
    "image_url": "/assets/products/supplier-20261014/sebamed_baby_powder_with_olive_oil.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-DD458AE96334",
    "name": "Sebamed Baby Shampoo with Camomile",
    "family_id": "PSC-IS-131",
    "image_url": "/assets/products/supplier-20261014/sebamed_baby_shampoo_with_camomile.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-779D958F18B0",
    "name": "Sebamed Baby Skin Care Oil",
    "family_id": "PSC-IS-111",
    "image_url": "/assets/products/supplier-20261014/sebamed_baby_skin_care_oil.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-26F075753C6D",
    "name": "Sebamed Clear Face Antibacterial Cleansing Foam",
    "family_id": "PSC-IS-152",
    "image_url": "/assets/products/supplier-20261014/sebamed_clear_face_antibacterial_cleansing_foam.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-ADD6AE257643",
    "name": "Sebamed Everyday Shampoo",
    "family_id": "PSC-IS-156",
    "image_url": "/assets/products/supplier-20261014/sebamed_everyday_shampoo.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-4F24389ACD4A",
    "name": "Sebamed Extreme Dry Skin Relief Shampoo 5% Urea",
    "family_id": "PSC-IS-115",
    "image_url": "/assets/products/supplier-20261014/sebamed_extreme_dry_skin_relief_shampoo_5_urea.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-E5C59FFA9071",
    "name": "Sebamed Intimate Wash pH 3.8 — Women 15–50",
    "family_id": "PSC-IS-160",
    "image_url": "/assets/products/supplier-20261014/sebamed_intimate_wash_ph_3_8_women_15_50.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-76AD982E8388",
    "name": "Sebamed Intimate Wash pH 6.8 — Women 50+",
    "family_id": "PSC-IS-160",
    "image_url": "/assets/products/supplier-20261014/sebamed_intimate_wash_ph_6_8_women_50plus.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-A2C365842B5E",
    "name": "Sebamed Moisturizing Body Lotion",
    "family_id": "PSC-IS-111",
    "image_url": "/assets/products/supplier-20261014/sebamed_moisturizing_body_lotion.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-162F00E6E627",
    "name": "Sebamed Multi Protect Sun Cream SPF 50+",
    "family_id": "PSC-IS-087",
    "image_url": "/assets/products/supplier-20261014/sebamed_multi_protect_sun_cream_spf_50plus.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-CC054B5F47B0",
    "name": "Sebamed Sensitive Skin Cleansing Bar",
    "family_id": "PSC-IS-180",
    "image_url": "/assets/products/supplier-20261014/sebamed_sensitive_skin_cleansing_bar.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-9400698FA1D2",
    "name": "Sebamed Sensitive Skin Liquid Face & Body Wash",
    "family_id": "PSC-IS-180",
    "image_url": "/assets/products/supplier-20261014/sebamed_sensitive_skin_liquid_face_and_body_wash.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-D5D8299CC052",
    "name": "Zyme Nasal Spray 30 ml with Lysozyme",
    "family_id": "PSC-IS-169",
    "image_url": "/assets/products/supplier-20261014/zyme_nasal_spray_30_ml_with_lysozyme.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-4F7D13C2D8F8",
    "name": "ACC LONG EFF 600MG TAB 10's",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/260-acc-long-eff-600mg-tab-10-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-6403E4E1E64A",
    "name": "AGIOLAX GRANULES 250GM",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/263-agiolax-granules-250gm.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-4B7711EA87BC",
    "name": "ALCETA PLUS TAB 24'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/256-alceta-plus-tab-24-s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-79F4D01168DD",
    "name": "ALCETA TAB 12'S",
    "family_id": "PSC-IS-090",
    "image_url": "/assets/products/acorus-2026-10/115-alceta-tab-12-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-0D235D75BB71",
    "name": "ARTELAC ADVANCE 0.5ML 30'S",
    "family_id": "PSC-IS-102",
    "image_url": "/assets/products/acorus-2026-10/264-artelac-advance-0-5ml-30-s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-A89E4E416DFC",
    "name": "ATSTAT 20MG TAB 30'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/044-atstat-20mg-tab-30-s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-F5A5263CFB9C",
    "name": "AVOCAINE SPRAY 50ML",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/092-avocaine-spray-50ml.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-3E00B3A1B51D",
    "name": "AVOCOM NASAL SPRAY 0.05%",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/093-avocom-nasal-spray-0-05.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-9FFA1AF90326",
    "name": "AVOCOM-M CREAM 30GM",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/094-avocom-m-cream-30gm.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-79C56A033917",
    "name": "AYURHOIDS CAP 60'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/240-ayurhoids-cap-60-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-F28A56AD788B",
    "name": "AYURIN PLUS CAP 60'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/241-ayurin-plus-cap-60-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-C59C9E168A8F",
    "name": "AYUVIGO FORTE CAP 60\"S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/242-ayuvigo-forte-cap-60-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-1F9F933E5D61",
    "name": "AZI-ONCE 250MG CAP 6'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/011-azi-once-250mg-cap-6-s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-0B48B339F098",
    "name": "AZIJUB 250MG TAB 6\"S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/014-azijub-250mg-tab-6-s.jpg",
    "source": "relaxed targeted public product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-458B5F70A507",
    "name": "AZIJUB 500MG TAB 6\"S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/023-azijub-500mg-tab-6-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-4D322F3A00A3",
    "name": "BACTALL 500MG TAB 10S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/008-bactall-500mg-tab-10s.jpg",
    "source": "relaxed targeted public product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-51E0E1CA1E40",
    "name": "BETAZOL CREAM 30GM",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/087-betazol-cream-30gm.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-0B277B86665C",
    "name": "BRAUN HAIR BRUSH BR 710",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/139-braun-hair-brush-br-710.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-0763FFE0C7A1",
    "name": "BRAUN SATIN HAIR 5 STRAIGHTENER ST510",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/142-braun-satin-hair-5-straightener-st510.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-AA887F12AE5A",
    "name": "BREXIN 20MG TAB 20'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/147-brexin-20mg-tab-20-s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-612FB5A92787",
    "name": "BRILINTA 90MG TAB 56'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/148-brilinta-90mg-tab-56-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-8C5FCD903603",
    "name": "BRONCOF HERBAL COUGH SYRUP 150ML",
    "family_id": "PSC-IS-126",
    "image_url": "/assets/products/acorus-2026-10/024-broncof-herbal-cough-syrup-150ml.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-4E794686D4FB",
    "name": "BUTAFYL 1% CREAM 15GM",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/103-butafyl-1-cream-15gm.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-5776C8A88CCC",
    "name": "CANESTEN 1% SOLUTION 20ML",
    "family_id": "PSC-IS-086",
    "image_url": "/assets/products/acorus-2026-10/268-canesten-1-solution-20ml.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-BA2A0DD15944",
    "name": "CEFIX 100MG/5ML SUSPENSION 30ML",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/055-cefix-100mg-5ml-suspension-30ml.jpg",
    "source": "relaxed targeted public product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-6B8E27CFD68C",
    "name": "CEFIX 200MG CAP 8'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/056-cefix-200mg-cap-8-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-43A6884BA71B",
    "name": "CEFIX 400MG CAP 6'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/058-cefix-400mg-cap-6-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-C7726A1E6816",
    "name": "CEFUTIL 500MG TAB 10'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/015-cefutil-500mg-tab-10-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-7C1A057BC04A",
    "name": "CIDOCOMB CREAM 30G (AVALON)",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/104-cidocomb-cream-30g-avalon.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-70BCF2EF8CA0",
    "name": "CLARITINE 10MG TAB 10'S",
    "family_id": "PSC-IS-074",
    "image_url": "/assets/products/acorus-2026-10/269-claritine-10mg-tab-10-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-F562BC84F4B1",
    "name": "CLINIJEL GEL 82GM",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/151-clinijel-gel-82gm.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-BC3A03EFEC15",
    "name": "COXIB 200MG CAPSULES 30'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/067-coxib-200mg-capsules-30-s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-3824EF57F3D4",
    "name": "CYPRO-VITA TAB 30'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/154-cypro-vita-tab-30-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-6D3098C1D48F",
    "name": "DECADRON ELIXIR SYRUP 100ML",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/155-decadron-elixir-syrup-100ml.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-ADAC0F763109",
    "name": "DELOR 0.05% CREAM 25GM",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/078-delor-0-05-cream-25gm.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-C35CD04F1EFF",
    "name": "DICLOPID 50MG TAB 20'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/025-diclopid-50mg-tab-20-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-EA7FC17CD0E3",
    "name": "DIOCLAV 1GM TAB 14'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/030-dioclav-1gm-tab-14-s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-E5E1AF7D2FE1",
    "name": "DIOCLAV 625MG TAB 20'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/026-dioclav-625mg-tab-20-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-8DEC2D95BBA5",
    "name": "DOXIPROCT OINTMENT 30GM",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/278-doxiproct-ointment-30gm.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-A362227AAAF5",
    "name": "DOXIPROCT PLUS OINTMENT 20GM",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/279-doxiproct-plus-ointment-20gm.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-66356772D8BC",
    "name": "DOXYLAG 100MG CAP 10'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/116-doxylag-100mg-cap-10-s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-BBDF382B00E6",
    "name": "DUPHALAC SYRUP 300ML",
    "family_id": "PSC-IS-100",
    "image_url": "/assets/products/acorus-2026-10/265-duphalac-syrup-300ml.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-24CADA2749A8",
    "name": "ELEGANT DERMOLITE CERAMIDE CREAM 100GM",
    "family_id": "PSC-IS-111",
    "image_url": "/assets/products/acorus-2026-10/157-elegant-dermolite-ceramide-cream-100gm.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-1C850D5C43B8",
    "name": "ELICA CREAM 30GM",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/095-elica-cream-30gm.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-B46ACC91E599",
    "name": "ELICA-M CREAM 30GM",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/096-elica-m-cream-30gm.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-5DFC82FA18E9",
    "name": "ENTEROGERMINA SUSP 5ML 20'S VIAL",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/257-enterogermina-susp-5ml-20-s-vial.jpg",
    "source": "relaxed targeted public product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-673550EE9818",
    "name": "ETORIGEN 90MG TAB 28'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/105-etorigen-90mg-tab-28-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-1EAB0BF0D212",
    "name": "FAST-FLAM 50MG TAB 20'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/031-fast-flam-50mg-tab-20-s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-1B7429C8708D",
    "name": "FASTUM GEL DISP 100GM",
    "family_id": "PSC-IS-112",
    "image_url": "/assets/products/acorus-2026-10/248-fastum-gel-disp-100gm.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-CF2A59100FF8",
    "name": "FINALLERG 10MG TAB 10’S",
    "family_id": "PSC-IS-073",
    "image_url": "/assets/products/acorus-2026-10/045-finallerg-10mg-tab-10s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-3E7CD6BDAB3C",
    "name": "FINALLERG 10MG TAB 20'S",
    "family_id": "PSC-IS-073",
    "image_url": "/assets/products/acorus-2026-10/046-finallerg-10mg-tab-20-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-89836E13CEAE",
    "name": "FINALLERG 1MG/ML ORAL SOLUTION 100ML",
    "family_id": "PSC-IS-073",
    "image_url": "/assets/products/acorus-2026-10/047-finallerg-1mg-ml-oral-solution-100ml.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-59131A74068D",
    "name": "FUDION CREAM 2% 15GM",
    "family_id": "PSC-IS-082",
    "image_url": "/assets/products/acorus-2026-10/079-fudion-cream-2-15gm.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-A6CA8E5ECFDF",
    "name": "FUNZOL 150MG CAP 1'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/038-funzol-150mg-cap-1-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-1AD5D12A6B00",
    "name": "GASTREX 42MG TAB 30'S",
    "family_id": "PSC-IS-099",
    "image_url": "/assets/products/acorus-2026-10/107-gastrex-42mg-tab-30-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-C06D2EB60C11",
    "name": "GEMCAL CAP 30'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/243-gemcal-cap-30-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-64F829D7DBF1",
    "name": "GLENCET 5MG TAB 10'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/051-glencet-5mg-tab-10-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-BF133E39FDD1",
    "name": "GLENCET 5MG TAB 30'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/052-glencet-5mg-tab-30-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-8396A068D791",
    "name": "GLENCIN T SOLUTION 30ML",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/261-glencin-t-solution-30ml.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-E7D418EDD17C",
    "name": "GLIM 2MG TAB 30'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/250-glim-2mg-tab-30-s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-A8F5876D3083",
    "name": "GLOCLAV 375MG TAB 20'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/165-gloclav-375mg-tab-20-s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-F8251FCFED2E",
    "name": "GLOMOX 1000MG TAB 14'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/166-glomox-1000mg-tab-14-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-55BFDC5900B8",
    "name": "GLOZIMAX 250MG CAP 6'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/032-glozimax-250mg-cap-6-s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-F7A2A57A50DD",
    "name": "GLYCILAX ADULT SUPPO 12\"S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/169-glycilax-adult-suppo-12-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-912652B1A536",
    "name": "HAIRCILLIUM MAN TABLET 60'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/171-haircillium-man-tablet-60-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-47499A9BF8B7",
    "name": "HAIRGAINE SOLN 2% WOMEN 60ML",
    "family_id": "PSC-IS-132",
    "image_url": "/assets/products/acorus-2026-10/069-hairgaine-soln-2-women-60ml.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-D8F2579CE23F",
    "name": "HAIRGAINE SOLN 5% MEN 60ML",
    "family_id": "PSC-IS-132",
    "image_url": "/assets/products/acorus-2026-10/070-hairgaine-soln-5-men-60ml.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-5AABC115B986",
    "name": "HALLSEPT SPRAY 30ML (MOUTH&THROAT)",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/173-hallsept-spray-30ml-mouth-throat.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-4E9C08C332DD",
    "name": "HYCOM 10MG TAB 20'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/080-hycom-10mg-tab-20-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-049287FAA4F6",
    "name": "HYPOSEC 20MG CAP 14'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/081-hyposec-20mg-cap-14-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-3F48EDEC7AB1",
    "name": "IFICIPRO 500MG TAB 10'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/033-ificipro-500mg-tab-10-s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-F99BA396D025",
    "name": "IVYLIN COUGH SYRUP 100ML",
    "family_id": "PSC-IS-126",
    "image_url": "/assets/products/acorus-2026-10/071-ivylin-cough-syrup-100ml.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-B0524E802B12",
    "name": "JOFLAM 50MG TAB 20'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/012-joflam-50mg-tab-20-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-938F720B960C",
    "name": "KLARFAST 10MG TAB 10'S",
    "family_id": "PSC-IS-074",
    "image_url": "/assets/products/acorus-2026-10/018-klarfast-10mg-tab-10-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-5E479CDB5CA0",
    "name": "KOFOL SYRUP 100ML",
    "family_id": "PSC-IS-126",
    "image_url": "/assets/products/acorus-2026-10/073-kofol-syrup-100ml.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-3C4A8C55FEF8",
    "name": "LEJAM 30MG TAB 4'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/258-lejam-30mg-tab-4-s.jpg",
    "source": "relaxed targeted public product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-598D26CADC3C",
    "name": "LEJAM 60MG TAB 4'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/259-lejam-60mg-tab-4-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-400F2ABE665C",
    "name": "LOFLAM 100MG TAB 20’S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/097-loflam-100mg-tab-20s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-666A3B79FCEA",
    "name": "LOFLAM BLISTER 100MG TAB 30's",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/098-loflam-blister-100mg-tab-30-s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-8D861823242C",
    "name": "LOHIST 10MG TAB 10'S",
    "family_id": "PSC-IS-074",
    "image_url": "/assets/products/acorus-2026-10/027-lohist-10mg-tab-10-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-A9F14BB5E5C6",
    "name": "LOHIST 5MG/5ML SYRUP 100ML",
    "family_id": "PSC-IS-074",
    "image_url": "/assets/products/acorus-2026-10/048-lohist-5mg-5ml-syrup-100ml.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-DC4B5D32EE85",
    "name": "LOZATY LOZENGES HONEY&LEMON 24'S",
    "family_id": "PSC-IS-121",
    "image_url": "/assets/products/acorus-2026-10/191-lozaty-lozenges-honey-lemon-24-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-957F8551D9D2",
    "name": "LOZATY LOZENGES PROPOLIS 16'S (SUGAR FREE)",
    "family_id": "PSC-IS-121",
    "image_url": "/assets/products/acorus-2026-10/193-lozaty-lozenges-propolis-16-s-sugar-free.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-D5EE25C904F9",
    "name": "MACROMAX 500MG TAB 3'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/039-macromax-500mg-tab-3-s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-A259CAB80F2D",
    "name": "METROLAG 250MG TAB 20’S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/119-metrolag-250mg-tab-20s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-4E55D6F021C1",
    "name": "METROLAG 500MG TAB 24'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/120-metrolag-500mg-tab-24-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-A569717BF49E",
    "name": "MUGEL MOUTH ULCER GEL 15GM",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/198-mugel-mouth-ulcer-gel-15gm.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-40F211EAC614",
    "name": "NAROX 500MG TAB 10'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/074-narox-500mg-tab-10-s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-9DA976B87FCC",
    "name": "NEOCLAV 1G TAB 14'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/005-neoclav-1g-tab-14-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-24A56F237564",
    "name": "NEOCOFF ADULT SYRUP14MG/5ML,125ML",
    "family_id": "PSC-IS-126",
    "image_url": "/assets/products/acorus-2026-10/088-neocoff-adult-syrup14mg-5ml-125ml.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-F09A440C147E",
    "name": "NEUROBION INJECTION 3ML 6'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/253-neurobion-injection-3ml-6-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-1C0B8156329E",
    "name": "NEUROBION SC TAB 30'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/254-neurobion-sc-tab-30-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-F98E78FA1516",
    "name": "NO RHYNO NASAL SPRAY 120MD",
    "family_id": "PSC-IS-106",
    "image_url": "/assets/products/acorus-2026-10/212-no-rhyno-nasal-spray-120md.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-94420E937D23",
    "name": "NOVIRAX CREAM 15GM",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/111-novirax-cream-15gm.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-23F55B06F429",
    "name": "OCIUM FORTE TAB 30'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/121-ocium-forte-tab-30-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-F6E0A358896E",
    "name": "OMACILLIN 500MG CAP 20S (AMOXYCILLIN)",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/040-omacillin-500mg-cap-20s-amoxycillin.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-9E8C18CB7140",
    "name": "OMAPRO 20MG CAP 14'S (OMEPRAZOLE)",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/036-omapro-20mg-cap-14-s-omeprazole.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-E151AD3C039F",
    "name": "PIC CLASSIC FIX FABRIC SPOOL PLASTER 2.5CMX5M",
    "family_id": "PSC-SC-C01",
    "image_url": "/assets/products/acorus-2026-10/219-pic-classic-fix-fabric-spool-plaster-2-5cmx5m.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-B3B479417542",
    "name": "PRE NAN STAGE 1 400GM",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/220-pre-nan-stage-1-400gm.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-89322EFB4EBB",
    "name": "PROCID GR 20MG 28'S",
    "family_id": "PSC-IS-122",
    "image_url": "/assets/products/acorus-2026-10/076-procid-gr-20mg-28-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-1C0C5CA5BC0C",
    "name": "PROLIDERM PERMETHRIN 5% CREAM",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/122-proliderm-permethrin-5-cream.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-3AEC3FAD79C0",
    "name": "PULMICORT 0.25MG/ML SUSP 20'S",
    "family_id": "PSC-IS-077",
    "image_url": "/assets/products/acorus-2026-10/273-pulmicort-0-25mg-ml-susp-20-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-9CE43E45ACB7",
    "name": "PULMICORT 0.5MG/ML SUSP 20'S",
    "family_id": "PSC-IS-077",
    "image_url": "/assets/products/acorus-2026-10/274-pulmicort-0-5mg-ml-susp-20-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-D2E438C2F50C",
    "name": "REME D- 50, 000 IU S/G CAP 16'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/061-reme-d-50-000-iu-s-g-cap-16-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-03391E832FF4",
    "name": "REVERA ALOEVERA&MOISTURIZING CREAM 100GM",
    "family_id": "PSC-IS-111",
    "image_url": "/assets/products/acorus-2026-10/223-revera-aloevera-moisturizing-cream-100gm.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-7361AF89DCFA",
    "name": "ROZOVAS 10MG TAB 30'S",
    "family_id": "PSC-IS-119",
    "image_url": "/assets/products/acorus-2026-10/112-rozovas-10mg-tab-30-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-6D6A637E3D70",
    "name": "ROZOVAS 20MG TAB 30'S",
    "family_id": "PSC-IS-119",
    "image_url": "/assets/products/acorus-2026-10/113-rozovas-20mg-tab-30-s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-F0AF9D5BA11A",
    "name": "SEFARIN 300MG CAP 10'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/090-sefarin-300mg-cap-10-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-A3425D003DF5",
    "name": "SILOSIN 8MG CAP 30S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/228-silosin-8mg-cap-30s.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-DB5A567B7404",
    "name": "SNAFI 5MG TAB 30'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/262-snafi-5mg-tab-30-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-C6AF26727418",
    "name": "STOPKOF SYRUP 100ML",
    "family_id": "PSC-IS-126",
    "image_url": "/assets/products/acorus-2026-10/083-stopkof-syrup-100ml.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-6F2C9A9F278A",
    "name": "SYMBICORT TURBUHALER 160/4.5MCG 120 DOSE",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/275-symbicort-turbuhaler-160-4-5mcg-120-dose.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-627E5C283056",
    "name": "TANTUM VERDE 0.15% M/WASH 125ML",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/123-tantum-verde-0-15-m-wash-125ml.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-7789FFECC541",
    "name": "TELFAST 120MG TAB 30'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/276-telfast-120mg-tab-30-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-286239754589",
    "name": "TELFAST 180MG TAB 30'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/277-telfast-180mg-tab-30-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-170E9EF33945",
    "name": "TRILAGAVIT TAB 30'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/124-trilagavit-tab-30-s.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-FF3CBF5DE6AD",
    "name": "TRIOPAN SYRUP 100ML",
    "family_id": "PSC-IS-126",
    "image_url": "/assets/products/acorus-2026-10/010-triopan-syrup-100ml.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-BDC5F3EDFE8E",
    "name": "TYOTOCIN EAR DROPS",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/229-tyotocin-ear-drops.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-B683729C25EA",
    "name": "UNI-Z 500MG TAB 3'S (AZITHROMYCIN)",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/013-uni-z-500mg-tab-3-s-azithromycin.jpg",
    "source": "targeted public exact product image",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-1D5B0F878A76",
    "name": "VASTOR 40MG TAB 30'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/064-vastor-40mg-tab-30-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-008B1B46EFE5",
    "name": "VICKS SINUS INHALER VH200E1",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/234-vicks-sinus-inhaler-vh200e1.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-CC2D46A1ED89",
    "name": "VICKS VAPOPADS MENTHOL",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/235-vicks-vapopads-menthol.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-06591B521B5E",
    "name": "VICKS VUL525 HUMUDIFIER MINI COOLMIST",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/237-vicks-vul525-humudifier-mini-coolmist.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-9D74BA9A56ED",
    "name": "VITIFECT SYRUP 120ML",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/238-vitifect-syrup-120ml.jpg",
    "source": "existing web match",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-BE10E5A5B0C4",
    "name": "XYLOLIN PLUS ADULT NASAL SPRAY 10ML",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/239-xylolin-plus-adult-nasal-spray-10ml.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-FA9AB509E96C",
    "name": "ZETOP 10MG TAB 10S",
    "family_id": "PSC-IS-073",
    "image_url": "/assets/products/acorus-2026-10/019-zetop-10mg-tab-10s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PS-AC-C6F8BAF8FC0E",
    "name": "ZYGREL 75MG TAB 28'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/125-zygrel-75mg-tab-28-s.jpg",
    "source": "public exact product listing",
    "review": "Brief visual product/strength/form review; no stock or pricing approval"
  },
  {
    "sku": "PSC-EQP-003",
    "name": "Digital Height & Weight Scale",
    "family_id": "PSC-SC-B01",
    "image_url": "/assets/products/verified-20261019/3c153f30bec26b5fc1ae.png",
    "source": "https://www.pongpitmedical.com/product/189702-187216/%E0%B9%80%E0%B8%84%E0%B8%A3%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%8A%E0%B8%B1%E0%B9%88%E0%B8%87%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%AB%E0%B8%99%E0%B8%B1%E0%B8%81%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%AA%E0%B9%88%E0%B8%A7%E0%B8%99%E0%B8%AA%E0%B8%B9%E0%B8%87-tscale-%E0%B8%A3%E0%B8%B8%E0%B9%88%E0%B8%99-m301d",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Digital Height & Weight Scale",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-PPE-001",
    "name": "Nitrile Examination Gloves",
    "family_id": "PSC-SC-C05",
    "image_url": "/assets/products/verified-20261019/2b39dbc1bd693841e2bb.jpg",
    "source": "https://www.dentalsky.com/medibase-blue-nitrile-powder-free-gloves-s-200.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Nitrile Examination Gloves",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-PPE-003",
    "name": "Surgical Face Masks",
    "family_id": "PSC-SC-C10",
    "image_url": "/assets/products/verified-20261019/650bddc4d52ab384ce37.jpg",
    "source": "https://www.hygiene-shop.com/mundschutz-atemschutzmasken/abena-mundschutz-vliesmaske-3-lagig-typ-iir-blau-50-stueck",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Surgical Face Masks",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-DSP-002",
    "name": "Disposable Syringe 2–3 ml",
    "family_id": "PSC-SC-C24",
    "image_url": "/assets/products/verified-20261019/bd40790123ad6e617c7e.jpg",
    "source": "https://shaklin.ru/katalog/item/shpric_odnorazovyy_3ml_inekta_trehdetalnyy_steriln.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Disposable Syringe 2–3 ml",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-DSP-004",
    "name": "Hypodermic Needles — Assorted Sizes",
    "family_id": "PSC-SC-C16",
    "image_url": "/assets/products/verified-20261019/1f000021b3c89878c341.jpg",
    "source": "https://weigaomedical.en.made-in-china.com/product/SZUAfdnDhRYj/China-Medical-Supplies-Disposable-Eo-Sterile-Hypodermic-Needle-Sizes-for-Single-Use.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Hypodermic Needles — Assorted Sizes",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-DSP-005",
    "name": "IV Cannula — Assorted Gauges",
    "family_id": "PSC-SC-C18",
    "image_url": "/assets/products/verified-20261019/221ec959d3ce838d75e9.jpg",
    "source": "https://www.gariamedical.com/i-v-cannula-with-injection-port-and-wings-12470169.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "IV Cannula — Assorted Gauges",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-DSP-006",
    "name": "IV Giving Set",
    "family_id": "PSC-SC-C19",
    "image_url": "/assets/products/verified-20261019/b5692223f6f3756fb8e2.jpg",
    "source": "https://www.mountainside-medical.com/collections/iv-administration-sets",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "IV Giving Set",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-DSP-007",
    "name": "Alcohol Prep Pads",
    "family_id": "PSC-SC-C02",
    "image_url": "/assets/products/verified-20261019/86a02833557434b4b6ad.jpg",
    "source": "https://medexsupply.com/alcohol-prep-pad-mckesson-70-strength-isopropyl-alcohol-individual-packet-medium-sterile/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Alcohol Prep Pads",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-DSP-008",
    "name": "Medicine Cups",
    "family_id": "PSC-SC-C07",
    "image_url": "/assets/products/verified-20261019/67715008c6e3d624ed7f.jpg",
    "source": "https://www.healthproductsforyou.com/p-mckesson-clear-plastic-disposable-graduated-medicine-cup.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Medicine Cups",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-BAS-001",
    "name": "Examination Couch Roll",
    "family_id": "PSC-SC-C11",
    "image_url": "/assets/products/verified-20261019/e259900b547f8998d73e.jpg",
    "source": "https://www.eb-med.com/consumables/paper-products/couch-roll/20-couch-roll-x-9-rolls",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Examination Couch Roll",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-BAS-002",
    "name": "Disposable Hand Towels",
    "family_id": "PSC-SC-C06",
    "image_url": "/assets/products/verified-20261019/2b1776fd8cdac404e6e3.webp",
    "source": "https://yuchen-material.en.made-in-china.com/product/OEKpHGNYASce/China-2023-Hot-Sell-Medical-Disposable-Surgical-Hand-Paper-Towel-for-Surgical-Packs.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Disposable Hand Towels",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-BAS-003",
    "name": "Digital Thermometer Probe Covers",
    "family_id": "PSC-SC-C12",
    "image_url": "/assets/products/verified-20261019/0eb2d2abf504c4e68064.jpg",
    "source": "https://www.vitalitymedical.com/30-second-oral-digital-stick-thermometer.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Digital Thermometer Probe Covers",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-BAS-004",
    "name": "Wooden Tongue Depressors",
    "family_id": "PSC-SC-C13",
    "image_url": "/assets/products/verified-20261019/b14e3530b41a61b4b0c3.jpg",
    "source": "https://www.doccheckshop.nl/p/103067-0-houten-tongspatel/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Wooden Tongue Depressors",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-BAS-005",
    "name": "Surface Disinfectant Wipes",
    "family_id": "PSC-IS-060",
    "image_url": "/assets/products/verified-20261019/e4e4d240caaa968e540e.jpg",
    "source": "https://www.henryschein.nl/nl-nl/medisch/p/hygiene/desinfecteren-oppervlakten/cleanisept-wipes-maxi-1-pak-a-100-doekjes/813392",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Surface Disinfectant Wipes",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-DIA-008",
    "name": "Clinical Stethoscope",
    "family_id": "PSC-SC-B21",
    "image_url": "/assets/products/verified-20261019/4873b1e78d899d1a083e.png",
    "source": "https://www.medshop.com.ph/products/prestige-clinical-lite-stethoscope",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Clinical Stethoscope",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-DIA-009",
    "name": "Room Thermometer & Humidity Monitor",
    "family_id": "PSC-SC-A04",
    "image_url": "/assets/products/verified-20261019/8302ccfd2c189a18709c.jpg",
    "source": "https://www.cimri.com/dijital-oda-termometresi?page=8",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Room Thermometer & Humidity Monitor",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0081",
    "name": "Gauze bandage — 10 cm",
    "family_id": "PSC-SC-C15",
    "image_url": "/assets/products/verified-20261019/ee35248894f311b33477.webp",
    "source": "https://surginatal.com/brands/ansuya/ansuya-gamjee-roll-10-cm",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Gauze bandage — 10 cm",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0114",
    "name": "AED adult replacement pads",
    "family_id": "PSC-IS-001",
    "image_url": "/assets/products/verified-20261019/7d0d979b49421766fecc.jpg",
    "source": "https://www.aedstore.ae/product-page/buy-lifepoint-pro-aed-adult-defib-pads-online-in-dubai-uae",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "AED adult replacement pads",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0115",
    "name": "AED pediatric pads or attenuator",
    "family_id": "PSC-IS-002",
    "image_url": "/assets/products/verified-20261019/81dd1f622591e1bcea93.jpg",
    "source": "https://responseforlife.org.au/products/zoll-aed-plus-defibrillator-child-pads-pedi-padz-ii-replacement-child-pads",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "AED pediatric pads or attenuator",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0116",
    "name": "AED replacement battery",
    "family_id": "PSC-IS-003",
    "image_url": "/assets/products/verified-20261019/3a66086cd8467d1a3549.jpg",
    "source": "https://www.batterystuff.com/batteries/aed-replacement-batteries/cardiac-science-9146-aed-replacement-battery-by-aed-battery-exchange-9146-abe.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "AED replacement battery",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0117",
    "name": "AED cabinet and location sign",
    "family_id": "PSC-IS-004",
    "image_url": "/assets/products/verified-20261019/0eeea9e6cdad959d3794.png",
    "source": "https://www.ansac-tech.com.sg/category/aed",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "AED cabinet and location sign",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0118",
    "name": "AED emergency accessory pouch",
    "family_id": "PSC-IS-005",
    "image_url": "/assets/products/verified-20261019/14fb78a600e1b118261f.jpg",
    "source": "https://www.e-firstaidsupplies.com/aed-first-responder-pouch.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "AED emergency accessory pouch",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0119",
    "name": "Adult bag-valve-mask resuscitator",
    "family_id": "PSC-IS-006",
    "image_url": "/assets/products/verified-20261019/3def259eed865726534f.jpg",
    "source": "https://www.medline.com/product/Adult-Bag-Valve-Mask-BVM-Manual-Resuscitators/Z05-PF01877",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Adult bag-valve-mask resuscitator",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0120",
    "name": "Pediatric bag-valve-mask resuscitator",
    "family_id": "PSC-IS-007",
    "image_url": "/assets/products/verified-20261019/82e116eaadacd26583f2.jpg",
    "source": "https://www.boundtree.com/airway-oxygen-delivery/bag-valve-masks/airflow-manual-resuscitators-bvm-pediatric/p/group001556",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Pediatric bag-valve-mask resuscitator",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0121",
    "name": "CPR pocket mask",
    "family_id": "PSC-IS-008",
    "image_url": "/assets/products/verified-20261019/01f1ef80424e8a714358.png",
    "source": "https://everythingsafety.co.nz/product/22071/dovetail-first-aid-medical-cpr-pocket-mask/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "CPR pocket mask",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0122",
    "name": "Oxygen regulator and flowmeter",
    "family_id": "PSC-IS-009",
    "image_url": "/assets/products/verified-20261019/556abce0de86a0913951.png",
    "source": "https://www.bsi-med.com/product/bsimed/regulators/101rm-fl-series",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Oxygen regulator and flowmeter",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0123",
    "name": "Oxygen cylinder trolley / restraint",
    "family_id": "PSC-IS-010",
    "image_url": "/assets/products/verified-20261019/2bcfef867f4ec4b61990.jpg",
    "source": "https://www.corcenter.com.br/oxigenoterapia/carrinho-e-suporte-cilindro/carrinho-para-cilindro-de-15-e-16-litros",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Oxygen cylinder trolley / restraint",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0126",
    "name": "Oxygen humidifier bottle",
    "family_id": "PSC-IS-013",
    "image_url": "/assets/products/verified-20261019/6b2b491ac29fc88a05b6.jpg",
    "source": "https://novamedical.com.mx/products/vaso-humidificador-vasohumihuds-129-hudson-rci",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Oxygen humidifier bottle",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0127",
    "name": "Adult nasal cannula",
    "family_id": "PSC-IS-014",
    "image_url": "/assets/products/verified-20261019/c9fcb7ad2282795ab30e.jpg",
    "source": "https://www.bettymills.com/salter-style-cannula-adult-02-w-o-tu-1606b-0-50-mon930643ea",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Adult nasal cannula",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0128",
    "name": "Pediatric nasal cannula",
    "family_id": "PSC-IS-015",
    "image_url": "/assets/products/verified-20261019/9a04eec04dab72a29a1f.png",
    "source": "https://shmedical.ro/masti-oxigen/1088-canula-nazala-oxigen-sterila-pediatric-2-m.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Pediatric nasal cannula",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0129",
    "name": "Adult non-rebreather mask",
    "family_id": "PSC-IS-016",
    "image_url": "/assets/products/verified-20261019/0f3ffdc593dabbe0f12d.jpg",
    "source": "https://www.mountainside-medical.com/collections/oxygen-masks-nasal-cannulas-respiratory-therapy?srsltid=AfmBOopDbRwh4Jw5cTyFcKSL1oM6tWNfcfKVj1joLTs3hMpr2_PeBGkn",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Adult non-rebreather mask",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0130",
    "name": "Pediatric non-rebreather mask",
    "family_id": "PSC-IS-017",
    "image_url": "/assets/products/verified-20261019/31501d5c7aac75881a03.jpg",
    "source": "https://www.henryschein.com/us-en/medical/p/equipment/respiratory/oxygen-mask-nonrebreather/1413814",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Pediatric non-rebreather mask",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0131",
    "name": "Nebulizer replacement chamber and tubing",
    "family_id": "PSC-IS-018",
    "image_url": "/assets/products/verified-20261019/be7a8223b5019e9ce31e.jpg",
    "source": "https://as-kitchen.as-1.co.jp/shop/g/g7-1140-01/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Nebulizer replacement chamber and tubing",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0132",
    "name": "Nebulizer compressor filter",
    "family_id": "PSC-IS-019",
    "image_url": "/assets/products/verified-20261019/d524daac9649b826eb40.jpg",
    "source": "https://medexsupply.com/compressor-replacement-filters-5-pack-1083128/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Nebulizer compressor filter",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0133",
    "name": "Valved holding chamber / spacer — Adult",
    "family_id": "PSC-IS-020",
    "image_url": "/assets/products/verified-20261019/3fdfcc634993a7710976.jpg",
    "source": "https://www.farmaciadelhospital.com.ar/cuidado-personal/aerochamber-plus-aerocamara-flow-vu-adulto-mascarilla-grande-6395",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Valved holding chamber / spacer — Adult",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0134",
    "name": "Valved holding chamber / spacer — Paediatric",
    "family_id": "PSC-IS-020",
    "image_url": "/assets/products/verified-20261019/752663a1087d5add6cb7.jpg",
    "source": "https://www.medical-supermarket.com/Product/133968/MED-AER-601/AeroChamber-with-Flow-Vu-Small-Mask-0-18-Months-Orange-",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Valved holding chamber / spacer — Paediatric",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0138",
    "name": "BP pediatric cuff",
    "family_id": "PSC-IS-024",
    "image_url": "/assets/products/verified-20261019/c9ce7b0a305575f1e752.jpg",
    "source": "https://www.medicalexpo.com/prod/unimed-medical-supplies/product-129265-976331.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "BP pediatric cuff",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0139",
    "name": "BP replacement cuff — Adult",
    "family_id": "PSC-IS-025",
    "image_url": "/assets/products/verified-20261019/2b3e95b5519bf95d1f41.png",
    "source": "https://www.henryschein.co.uk/p/um-201-211-blood-pressure-cuff-adult-22-x-32cm/sph20103",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "BP replacement cuff — Adult",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0140",
    "name": "BP replacement cuff — Large adult",
    "family_id": "PSC-IS-025",
    "image_url": "/assets/products/verified-20261019/c8ed80df65eb047a783f.jpg",
    "source": "https://liveactionsafety.com/automatic-digital-blood-pressure-monitor-replacement-cuff-large-adult/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "BP replacement cuff — Large adult",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0141",
    "name": "Pediatric oximetry sensor",
    "family_id": "PSC-IS-026",
    "image_url": "/assets/products/verified-20261019/9cdc7eb4c96b2cc0d0ac.jpg",
    "source": "https://med-linket-corp.com/products/nellcor-disposable-spo2-sensor-compatible-microfoam-adhesive-for-pediatric-d20",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Pediatric oximetry sensor",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0142",
    "name": "Diagnostic-device batteries / charger",
    "family_id": "PSC-IS-027",
    "image_url": "/assets/products/verified-20261019/3efdf23e098f2a3295f1.jpg",
    "source": "https://parksmed.com/collections/doppler-accessory",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Diagnostic-device batteries / charger",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0143",
    "name": "Replacement otoscope bulbs / heads",
    "family_id": "PSC-IS-028",
    "image_url": "/assets/products/verified-20261019/8abb4b959826633466d0.jpg",
    "source": "https://www.henryschein.es/es-es/medicina/p/diagnostico/orl-bombillas/bombilla-03400-para-cabeza-de-otoscopio-pocket-professional-de-2-5-v-1u/907-2921",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Replacement otoscope bulbs / heads",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0144",
    "name": "Eye-chart occluder",
    "family_id": "PSC-IS-029",
    "image_url": "/assets/products/verified-20261019/a39d792f11a471f681eb.jpg",
    "source": "https://www.optimed.com.au/index.php/our-products/pinhole-occluders",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Eye-chart occluder",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0145",
    "name": "Child-friendly vision chart — Tumbling E",
    "family_id": "PSC-IS-030",
    "image_url": "/assets/products/verified-20261019/e70d1ebb6463791eaa33.png",
    "source": "https://www.accuspire.com/e-chart-linear-spaced-for-10-feet-3-meters/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Child-friendly vision chart — Tumbling E",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0146",
    "name": "Child-friendly vision chart — Symbol / picture",
    "family_id": "PSC-IS-030",
    "image_url": "/assets/products/verified-20261019/b14cee1c3fa3bf557770.jpg",
    "source": "https://www.praxisdienst.com/be-fr/produit/test-de-pres-lea-symboles-en-format-poche/142450",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Child-friendly vision chart — Symbol / picture",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0147",
    "name": "Peak-flow meter — Standard",
    "family_id": "PSC-IS-031",
    "image_url": "/assets/products/verified-20261019/28da42e51800e5b2fe91.jpg",
    "source": "https://hillcroftsupplies.com/shop/consumables/peak-flow-meters",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Peak-flow meter — Standard",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0148",
    "name": "Peak-flow meter — Paediatric / low-range",
    "family_id": "PSC-IS-031",
    "image_url": "/assets/products/verified-20261019/ce23fbbf8c713a3fbfbf.png",
    "source": "https://dynarex.com/products/disposable-medical-supplies/respiratory/36110-peak-flow-meter--low-range",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Peak-flow meter — Paediatric / low-range",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0149",
    "name": "Disposable peak-flow mouthpieces",
    "family_id": "PSC-IS-032",
    "image_url": "/assets/products/verified-20261019/e39854de8c22eb9cc37e.jpg",
    "source": "https://surgicalsystems.co.za/products/peakflow-disposable",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Disposable peak-flow mouthpieces",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0150",
    "name": "Audiometer screening system",
    "family_id": "PSC-IS-033",
    "image_url": "/assets/products/verified-20261019/a37c69222cc16bf42aec.jpg",
    "source": "https://www.macgill.com/maico-audiometer-ma-25.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Audiometer screening system",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0151",
    "name": "Scoliometer",
    "family_id": "PSC-IS-034",
    "image_url": "/assets/products/verified-20261019/74e61bed9e52ab9f6fa6.jpg",
    "source": "https://www.distrimed.com/product_info.php?products_id=8806",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Scoliometer",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0152",
    "name": "Infant / toddler weighing scale",
    "family_id": "PSC-IS-035",
    "image_url": "/assets/products/verified-20261019/5dc36159b342fc22cf3a.png",
    "source": "https://us.secashop.com/products/baby-scales/seca-374/3741321004",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Infant / toddler weighing scale",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0153",
    "name": "Infant length board",
    "family_id": "PSC-IS-036",
    "image_url": "/assets/products/verified-20261019/84ab9447d143e192a47b.png",
    "source": "https://equipoantropometricosperu.tiendada.com/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Infant length board",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0154",
    "name": "Non-adherent sterile dressing — Small",
    "family_id": "PSC-IS-037",
    "image_url": "/assets/products/verified-20261019/1dff29aa672de437b5fe.jpg",
    "source": "https://www.firstaidwarehouse.co.uk/products/wallace-cameron-5cm-x-5cm-non-adherent-dressing-1",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Non-adherent sterile dressing — Small",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0155",
    "name": "Non-adherent sterile dressing — Large",
    "family_id": "PSC-IS-037",
    "image_url": "/assets/products/verified-20261019/1a6930ee894098867497.webp",
    "source": "https://www.hayesfirstaid.com/shop/first-aid-wound-care-dressings-1659/1403006-astroplast-non-adherent-dressing-10cm-x-10cm-26487",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Non-adherent sterile dressing — Large",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0156",
    "name": "Sterile eye pads",
    "family_id": "PSC-IS-038",
    "image_url": "/assets/products/verified-20261019/2660dd05bb226b6f296d.webp",
    "source": "https://medical.en.made-in-china.com/product/HMUxzLZTgORi/China-Medical-Sterile-Wound-Care-Non-Woven-Adhesive-Eye-Pads-Factory.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Sterile eye pads",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0158",
    "name": "Hypoallergenic fixation tape — Narrow",
    "family_id": "PSC-IS-040",
    "image_url": "/assets/products/verified-20261019/bec6e4893b8e4ecadf81.png",
    "source": "https://salvequick.com/our-products/fix-tape-slim-125-cm-refill/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Hypoallergenic fixation tape — Narrow",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0159",
    "name": "Hypoallergenic fixation tape — Medium",
    "family_id": "PSC-IS-040",
    "image_url": "/assets/products/verified-20261019/af402d3ad6dd936c0eec.png",
    "source": "https://salvequick.com/our-products/sterile-compresses-xl/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Hypoallergenic fixation tape — Medium",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0167",
    "name": "Burn dressing — Small",
    "family_id": "PSC-IS-044",
    "image_url": "/assets/products/verified-20261019/cf856afe0f0abb3f372b.jpg",
    "source": "https://www.formasecoursplus.ca/products/gel-pour-brulure-compresse-10cmx10cm/1945112000031176299",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Burn dressing — Small",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0168",
    "name": "Burn dressing — Large",
    "family_id": "PSC-IS-044",
    "image_url": "/assets/products/verified-20261019/ee423a263c3b4aac2318.jpg",
    "source": "https://www.ralphs.com/p/burnaid-burn-dressing-sterile-white-3068/0034768230688",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Burn dressing — Large",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0170",
    "name": "Wound closure strips — Wide",
    "family_id": "PSC-IS-045",
    "image_url": "/assets/products/verified-20261019/99b3ee6f10015847f13d.jpg",
    "source": "https://www.medipreis.de/preisvergleich/leukoplast-wound-closure-strip-12x100-mm-weiss-10x6-st-bsn-medical-gmbh-17875694",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Wound closure strips — Wide",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0171",
    "name": "Splinter forceps",
    "family_id": "PSC-IS-046",
    "image_url": "/assets/products/verified-20261019/0a99c17bfaea3fb36e1c.jpg",
    "source": "https://medexsupply.com/plain-splinter-forceps-4-102mm-sharp-6-302/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Splinter forceps",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0173",
    "name": "Disposable underpads — XL",
    "family_id": "PSC-IS-047",
    "image_url": "/assets/products/verified-20261019/7132ce8ab94f74da30fe.jpg",
    "source": "https://bestbuymedicalsupplies.com/products/fqpv410",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Disposable underpads — XL",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0175",
    "name": "Disposable tissues",
    "family_id": "PSC-IS-049",
    "image_url": "/assets/products/verified-20261019/731a03671703a3c4a1a8.jpg",
    "source": "https://www.ddgroup.com/consumables/face-tissues/cad055--flat-pack-tissue-medical-wipes-2-ply-white/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Disposable tissues",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0176",
    "name": "Sanitary pads",
    "family_id": "PSC-IS-050",
    "image_url": "/assets/products/verified-20261019/4008dcaffd73d82a0896.webp",
    "source": "https://qzagree.en.made-in-china.com/product/dxnYZkhJhXcL/China-Women-Pads-Feminine-Hygiene-Products-Alwaying-Cheap-Ultra-Clean-Sanitary-Napkin-Sanitary-Pads.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Sanitary pads",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0177",
    "name": "Disposable aprons",
    "family_id": "PSC-IS-051",
    "image_url": "/assets/products/verified-20261019/a88fe803081af8fb5182.jpg",
    "source": "https://www.healthproductsforyou.com/p-medline-protective-poly-disposable-aprons.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Disposable aprons",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0178",
    "name": "Surgical mask — Adult",
    "family_id": "PSC-IS-052",
    "image_url": "/assets/products/verified-20261019/4f3830dcbb184344e340.jpg",
    "source": "https://www.farmaciastrebol.com/vg-mascarilla-quirurgica-adulto-50-unidades",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Surgical mask — Adult",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0179",
    "name": "Surgical mask — Paediatric",
    "family_id": "PSC-IS-052",
    "image_url": "/assets/products/verified-20261019/fbe6def5ea601ee0c3c2.jpg",
    "source": "https://medicalistore.it/es/mascarillas-desechables/113690-mascarilla-quirurgica-filtrante-gisafe-98-tipo-3-capas-iir-con-bandas-elasticas-pediatrica-azul-claro-flowpack-paquete.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Surgical mask — Paediatric",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0181",
    "name": "Protective eyewear",
    "family_id": "PSC-IS-054",
    "image_url": "/assets/products/verified-20261019/0db463e3bf9e85383492.png",
    "source": "https://www.strzmetal.com/products/Medical-Goggles.htm",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Protective eyewear",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0182",
    "name": "Face shields",
    "family_id": "PSC-IS-055",
    "image_url": "/assets/products/verified-20261019/93291ecc37ac7a34668d.webp",
    "source": "https://www.industrybuying.com/face-shields-generic-SAF.FAC.533474718",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Face shields",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0183",
    "name": "Isolation gowns",
    "family_id": "PSC-IS-056",
    "image_url": "/assets/products/verified-20261019/cdcc9c7c12b61ae1bf41.jpg",
    "source": "https://www.liberia.ubuy.com/product/11SDRY78-disposable-isolation-gown-size-universal-qty-50-per-case-blue",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Isolation gowns",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0184",
    "name": "Sealed soap replacement cartridges",
    "family_id": "PSC-IS-057",
    "image_url": "/assets/products/verified-20261019/b3f0e6cf4d6ce58f4f7f.jpg",
    "source": "https://www.grainger.com/product/PURELL-Hand-Soap-Series-CS8-460U59",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Sealed soap replacement cartridges",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0186",
    "name": "Hand-sanitizer replacement cartridges",
    "family_id": "PSC-IS-059",
    "image_url": "/assets/products/verified-20261019/01a54c399da2d24b6dc0.jpg",
    "source": "https://www.grainger.com/product/PURELL-Hand-Sanitizer-Gel-56JM39",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Hand-sanitizer replacement cartridges",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0189",
    "name": "Surface disinfectant solution — Bulk / refill",
    "family_id": "PSC-IS-061",
    "image_url": "/assets/products/verified-20261019/dce2c242959a8515852a.png",
    "source": "https://cleansmartcanada.com/products/daily-dis-4litre",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Surface disinfectant solution — Bulk / refill",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0192",
    "name": "Clinical waste bags — Large",
    "family_id": "PSC-IS-063",
    "image_url": "/assets/products/verified-20261019/7f943f68d4193be93f56.jpg",
    "source": "https://idcmedical.com/biohazard-waste-management/biohazard-clinical-waste-bags/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Clinical waste bags — Large",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0195",
    "name": "Sharps container wall bracket",
    "family_id": "PSC-IS-065",
    "image_url": "/assets/products/verified-20261019/92edd5a19a1d3a9e30fb.png",
    "source": "https://www.danielshealth.ca/product/lockable-swing-wall-bracket",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Sharps container wall bracket",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0197",
    "name": "Pharmaceutical waste container — Small",
    "family_id": "PSC-IS-067",
    "image_url": "/assets/products/verified-20261019/29f510fe181ec04a33ed.jpg",
    "source": "https://www.bettymills.com/medline-pharmaceutical-waste-container-with-flap-top-blue-3-gal-10-ea-cs-mds705204b-medmds705204b",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Pharmaceutical waste container — Small",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0198",
    "name": "Pharmaceutical waste container — Large",
    "family_id": "PSC-IS-067",
    "image_url": "/assets/products/verified-20261019/9c21a8ee05f201df2b5d.jpg",
    "source": "https://www.medequipdepot.com/products/bemis-health-care-4011-050-waste-container-11-gal-gasketed-hinged-clear-lid-6-cs-case.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Pharmaceutical waste container — Large",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0200",
    "name": "Oral dosing syringe — 5 ml",
    "family_id": "PSC-IS-068",
    "image_url": "/assets/products/verified-20261019/040e9300d0c9816f4b89.jpg",
    "source": "https://www.sommaplast.com/nossos-produtos?page=2",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Oral dosing syringe — 5 ml",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0201",
    "name": "Oral dosing syringe — 10 ml",
    "family_id": "PSC-IS-068",
    "image_url": "/assets/products/verified-20261019/58d5799030fadcce493f.jpg",
    "source": "https://totalpharmacysupply.com/comar-2-part-oral-dispensers/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Oral dosing syringe — 10 ml",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0205",
    "name": "Specimen containers",
    "family_id": "PSC-IS-071",
    "image_url": "/assets/products/verified-20261019/66bca95d34bfb2538f32.jpg",
    "source": "https://www.ubuy.ec/en/product/D062EQW-mckesson-569-specimen-container-polypropylene-polyethylene-screw-cap-4-oz-120-cc-sterile-pack-of-100",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Specimen containers",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0206",
    "name": "Specimen transport bags",
    "family_id": "PSC-IS-072",
    "image_url": "/assets/products/verified-20261019/a81ee0ac2ce13d05eb71.jpg",
    "source": "https://www.walmart.com/ip/241528385",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Specimen transport bags",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-WND-003",
    "name": "Conforming Bandage 7.5 cm × 4 m",
    "family_id": "PSC-SC-C15",
    "image_url": "/assets/products/verified-20261019/5d09bdde07625e527d1f.jpg",
    "source": "https://www.binsina.ae/en/buy-wolaid-conforming-bandage-7-5cm.html",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-659CA9C5AE14",
    "name": "AG FEMINEX CALCIUM 500MG TAB 30\"S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/eb16798d5a85baee1605.jpg",
    "source": "https://kuludonline.com/products/adrien-gagnon-feminex-calcium-500mg-tab-30s-30tab",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-575B43FFAA5B",
    "name": "BRAUN HAIR DRYER HD 2.1 BRHD210(191738)",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/2a0d20ba4c267a4e0849.jpg",
    "source": "https://www.braunshop.com.tr/braun-brhd210e-hd21-sac-kurutma-makinesi-1-baslikli-2100w",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-AD5D840073E9",
    "name": "Braun Hair Dryer HD 2.2 — 2200 W",
    "family_id": "PSC-IS-173",
    "image_url": "/assets/products/verified-20261019/decde9ed95b82543e25a.jpg",
    "source": "https://www.waitrose.ae/en/products/braun-hair-dryer-hd22-black-2200w_61662/",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-D955AED7D947",
    "name": "BRAUN SILK EPIL FG1100 TRIM31",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/7b29be0acd8bedc9d04b.jpg",
    "source": "https://alainpharmacy.ae/braun-silk-epil-beauty-styler-fg-1100.html",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-C1BF2DF19411",
    "name": "CEFIX 400MG CAP 5'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/2abaaa57d6d6f289c771.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/cefix-400mg-capsules-pack-of-5s/1002272",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-5EAB1268179D",
    "name": "CIPROPHARM 500MG TAB 10'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/c689083b9603301aa26c.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/cipropharm-500mg-tablets-pack-of-10s/1002404",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-F562BB176577",
    "name": "COXIB 200MG CAPSULES 10'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/e8a792cf9a510cad81cf.jpg",
    "source": "https://www.binsina.ae/en/brand/coxib.html",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-058FD986906A",
    "name": "DELOR 0.05% OINTMENT 25GM",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/7fa81b7496e6c6741ec2.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/delor-0.05-ointment-25g/1003076",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-8E9FE3B9BBC4",
    "name": "Dora Desloratadine 5 mg — 30 Tablets",
    "family_id": "PSC-IS-147",
    "image_url": "/assets/products/verified-20261019/fee5d6e0b84bea9d7fec.jpg",
    "source": "https://www.myaster.com/ar/online-pharmacy/p/dora-5mg-film-coated-tablets-pack-of-30s/1025093",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-181B3BD5F4A8",
    "name": "EMIFEN 100MG/5ML SUSPENSION 100ML",
    "family_id": "PSC-IS-091",
    "image_url": "/assets/products/verified-20261019/9e5509466b9fe37ce66a.jpg",
    "source": "https://www.metromed.me/brands/products/global-pharma",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-18B8322BF411",
    "name": "Ergonomic Toothbrush Black — Medium",
    "family_id": "PSC-IS-184",
    "image_url": "/assets/products/verified-20261019/c634ca60c61d7e6ea48b.jpg",
    "source": "https://www.pharmacy295.gr/catalog/stomatiki-ygieini/odontovoyrtses/product/intermed-professional-ergonomic-odontovoyrtsa-medium-mayro-1tem--5205152011477",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-E0C03159604A",
    "name": "Ergonomic Toothbrush Purple — Medium",
    "family_id": "PSC-IS-184",
    "image_url": "/assets/products/verified-20261019/dfd2d78e874fad97f670.jpg",
    "source": "https://avismed.az/intermed-professional-ergonomic-medium-3270-dis-fircasi-b%C9%99novs%C9%99yi",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-22FF3938B7A7",
    "name": "ETORIX 90MG TAB 28'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/0867a5e400f0dc6cf3f0.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/etorix-90mg-tablets-pack-of-28s/1023540",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-82737DADD811",
    "name": "FORXIGA 10MG TAB 28'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/0c043358eed92bb1e2c2.jpg",
    "source": "https://kuludonline.com/products/forxiga-10mg-tab28s-tablet-10-mg-28-pc",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-8B2ACDEDDF89",
    "name": "FUCITHALMIC 1% EYE DROPS 5GM",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/f08e07ee206a6a37f2c8.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/fucithalmic-viscous-eye-drops-5g/1004469",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-30C266FA5150",
    "name": "FUNGIKEM 100MG CAP 15'S (ITRACONAZOLE)",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/96cb6c9a8770d3bcb98c.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/fungikem-100mg-capsules-pack-of-15s/1061966",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-D8A801E0D1E8",
    "name": "GENCET 10MG TAB 20S",
    "family_id": "PSC-IS-073",
    "image_url": "/assets/products/verified-20261019/d2446755809534c2926d.jpg",
    "source": "https://www.noon.com/kuwait-en/neopharma/",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-8DDB831FD6A5",
    "name": "GLIM 1MG TAB 30'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/e6f3241cd7a70fffed60.png",
    "source": "https://outletpharmacyonline.sa/en/glim-1mg-30tab/p797771010?srsltid=AfmBOopWeprOnHsINC9s7Yil6-Y34-oU4pfBAf7zkIoOl8C6L67t0NzU",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-10F136F531BC",
    "name": "GLIT 15MG TAB 28'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/a3d1927a6ddd23a7b5b6.jpg",
    "source": "https://www.doctoroncall.com.my/medicine/en/drugs/glit-15mg-tablet-28s",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-B5F68F0EEF03",
    "name": "Glotrizine 5 mg/5 ml Syrup — 100 ml",
    "family_id": "PSC-IS-073",
    "image_url": "/assets/products/verified-20261019/5148c61c992d065d5970.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/glotrizine-5mg5ml-syrup-100ml/1004831",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-CA529915334B",
    "name": "Glozal Levocetirizine 5 mg — 20 Tablets",
    "family_id": "PSC-IS-161",
    "image_url": "/assets/products/verified-20261019/ddda9f392e5677761754.jpg",
    "source": "https://www.nasserpharmacy.com/index.php?product_id=37206&route=product%2Fproduct",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-6430084923B0",
    "name": "GOGAZ 200MG CAP 30'S",
    "family_id": "PSC-IS-099",
    "image_url": "/assets/products/verified-20261019/71bf300bfe488734fcc7.png",
    "source": "https://www.lifepharmacy.com/product/gogaz-200mg-soft-gel-cap-30s",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-6E606628BF87",
    "name": "HAIRGAINE GEL 2% 30GM",
    "family_id": "PSC-IS-132",
    "image_url": "/assets/products/verified-20261019/28f0bc09710ebf02d6ef.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/hair-gaine-2-gel-30g/1005001",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-D96E047C2187",
    "name": "HY+AI Oral Gel — 30 g",
    "family_id": "PSC-IS-168",
    "image_url": "/assets/products/verified-20261019/60a436a2dd08b53650af.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/intermed-hy-al-oral-gel-for-mouth-ulcer-30g/1062438",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-4D49E9D2478B",
    "name": "Isomar Baby No Gas Spray — 30 ml",
    "family_id": "PSC-IS-106",
    "image_url": "/assets/products/verified-20261019/29066a8307ad2f8e9a22.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/isomar-nose-no-gas-baby-spray-30ml/1005345",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-BAE369B8D77D",
    "name": "Isomar Nose Decongestant Vials — 20 x 5 ml",
    "family_id": "PSC-IS-106",
    "image_url": "/assets/products/verified-20261019/32270a87c58a806a3809.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/isomar-nose-decongestant-vials-pack-of-5ml-x-20s/1057481?srsltid=AfmBOorMp7E43CxvBp7TQNZEP8us6mObyDHfWHr-kDVArbQrsXuJ4tzs",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-F8D8B1697F75",
    "name": "Lozaty Orange — 24 Lozenges",
    "family_id": "PSC-IS-121",
    "image_url": "/assets/products/verified-20261019/5c7353c69d48d56a5ce2.jpg",
    "source": "https://www.alosraonline.com/lozaty-throat-lozenges-orange-flavor-24-s.html",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-D0AF8E856F91",
    "name": "MUCOLYTE SYRUP 100ML",
    "family_id": "PSC-IS-126",
    "image_url": "/assets/products/verified-20261019/c73c65bc5886d66d98c3.jpg",
    "source": "https://www.noon.com/uae-ar/mucolyte-syrup-100ml/Z69F86F3C633EE5C59CDFZ/p/",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-C4D2B178E5A1",
    "name": "NAN 3 OPTIPRO 800GM (DUAL PACK 2X800GM)",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/adc722d5332eb69353fa.webp",
    "source": "https://www.al-dawaa.com/en/p/301250/nan-optipro-3-growing-up-milk-1-year-dual-pack-2-x",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-780FB37E98DC",
    "name": "NAN PRO 1 SUPREME 800GM",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/dd3e6f2e67dc509f6627.jpg",
    "source": "https://gcc.luluhypermarket.com/en-ae/nestle-nan-supreme-pro-1-infant-formula-from-0-6-months-800-g/p/1917761/",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-D27B69D89DD9",
    "name": "NAN PRO 2 SUPREME 800GM",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/f8b1f5844a964218ad2c.jpg",
    "source": "https://www.dubaigrocers.com/products/nan-supreme-pro-2-800-gm",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-0D5F2C5A740B",
    "name": "NEOCLAV 625MG TAB 20'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/487f6566f25eaaa9e284.jpg",
    "source": "https://www.nasserpharmacy.com/bh-en/neoclav-625-mg-20-film-coated-tablets-blister-pack-90003075",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-0CD6E6FDA164",
    "name": "ORAL B KIDS STAR WARS 3+ EXTRA SOFT T/P (40263)",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/f5afceb85d6202a1e3c1.jpg",
    "source": "https://www.mon-pharmacien-conseil.com/fr/brosse-a-dents/16484-oral-b-kids-star-wars-3-brossettes.html",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-6363B90AC36C",
    "name": "ORAL B T/B VITALITY 300 LILAC MIST D103 (78392)",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/68a7f0d67b05e1d20a6b.jpg",
    "source": "https://www.binsina.ae/en/buy-oral-b-electric-toothbrush-vitality-300-rechargeable-d1034133-pink-lilac.html",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-2945182D76CA",
    "name": "RAPIDUS 50MG TAB 20'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/d1603766af01b9a835f2.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/rapidus-50mg-film-coated-tablets-pack-of-20s/1009567",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-911F5DBF1E10",
    "name": "SITANOR MET 50MG/1000MG TAB 56'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/f54300cfac806af83cbf.jpg",
    "source": "https://avismed.az/sitanor-met-50mg/1000-mg-n56-tab",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-6110FE43DDE2",
    "name": "Unident Kids Toothpaste 1000 ppm — 50 ml",
    "family_id": "PSC-IS-185",
    "image_url": "/assets/products/verified-20261019/24c5ca9a157075068b82.jpg",
    "source": "https://alainpharmacy.ae/intermed-unident-kids-tooth-paste-1000-ppm-50-ml.html?srsltid=AfmBOoqXi2kqOk-irFM5QRHlp-X0_NkcqLqSOcPE4OvE45UhSrXjlj0u",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-4EDF32469B8D",
    "name": "Unident Pharma Ortho Smile Care Toothpaste — 75 ml",
    "family_id": "PSC-IS-185",
    "image_url": "/assets/products/verified-20261019/e064238f7fdc1269211b.jpg",
    "source": "https://www.noon.com/qatar-en/intermed-unident-ortho-smile-care-t-p-75ml/ZA1573C0B77B2E8CC63BEZ/p/",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-8CBD36F03D69",
    "name": "Unident Pharma Perio Care Toothpaste — 75 ml",
    "family_id": "PSC-IS-185",
    "image_url": "/assets/products/verified-20261019/6f1096a54ae65eac782d.webp",
    "source": "https://epharmadora.com/vendors/intermed/intermed-unident-pharma-perio-care-toothpaste-75ml.htm",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-1E51264B017E",
    "name": "URISOL EFF GRANULES 4G X 14\"S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/d6671bdfec3ccc4a50f0.jpg",
    "source": "https://www.nahdionline.com/ar-ae/urisol-effervescent-granules-14s/pdp/103006907",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-96A21BD4FF55",
    "name": "Z-MYCIN 500MG TAB 3'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/884d4969276de8cf5d26.jpg",
    "source": "https://www.binsina.ae/en/buy-z-mycin-500mg-azithromycin-tablets-pack-of-3s.html",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-6581A8C080FA",
    "name": "ZYCAL 500MG SOFTAB 30'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/5b0a55afea36826ee340.webp",
    "source": "https://lynnpharmacy.ae/products/zycal-tab-30s",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-2D2C9351DF5B",
    "name": "CorDx Flu A/B + COVID-19 3-in-1 Rapid Test — 1 Test",
    "family_id": "PSC-IS-177",
    "image_url": "/assets/products/verified-20261019/690d60f9a12beb29f6e4.jpg",
    "source": "https://www.noon.com/uae-en/cordx-multiplex-rapid-test-at-home-flu-a-b-covid-19-1-each/Z9E408E1A81612D9037E4Z/p/",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-6398358F2B96",
    "name": "D-Cal Calcium + Vitamin D3 — 30 Softgels",
    "family_id": "PSC-IS-188",
    "image_url": "/assets/products/verified-20261019/3870cbfab48c8bd1920f.jpg",
    "source": "https://www.noon.com/uae-en/d-cal-vitamin-d3-and-calcium-30-softgel/Z3F7481D597FA599B40B5Z/p/",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-184DB35B4013",
    "name": "Dibase Vitamin D3 10,000 IU/ml Oral Drops",
    "family_id": "PSC-IS-187",
    "image_url": "/assets/products/verified-20261019/198ad696f8992a5d70ec.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/dibase-10000iu-oral-solution-drops-10ml/1028681",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-7CC2887C65F3",
    "name": "Miderizone Tolperisone 150 mg — 30 Tablets",
    "family_id": "PSC-IS-183",
    "image_url": "/assets/products/verified-20261019/fa73da502f61192aa32d.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/miderizone-150mg-tablets-pack-of-30s/1029651",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-7249B30E2D1F",
    "name": "Moven Meloxicam 7.5 mg — 10 Capsules",
    "family_id": "PSC-IS-164",
    "image_url": "/assets/products/verified-20261019/2d5e93a0d27da3432ccd.jpg",
    "source": "https://www.nasserpharmacy.com/bh-en/moven-7-5-mg-10-capsules-blister-pack-22310021",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-33236AB32B6C",
    "name": "Sebamed Baby Cleansing Bar",
    "family_id": "PSC-IS-180",
    "image_url": "/assets/products/verified-20261019/0839d8b1d5f88f00d33e.jpg",
    "source": "https://theskinstore.in/products/sebamed-baby-cleansing-bar-100gm",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-4F230BD47C18",
    "name": "Sebamed Gentle Facial Cleanser",
    "family_id": "PSC-IS-152",
    "image_url": "/assets/products/verified-20261019/004f30453bf55fc1ccdf.jpg",
    "source": "https://www.netmeds.com/product/sebamed-sensitive-gentle-facial-cleanser-for-normal-to-dry-skin-150-ml-mmu2lm-14551735",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-D62FDC588E1A",
    "name": "Sebamed Intimate Wash Foam pH 3.8",
    "family_id": "PSC-IS-160",
    "image_url": "/assets/products/verified-20261019/9a11b0912e30e9565a3b.webp",
    "source": "https://www.firstcry.ae/sebamed/sebamed-feminine-intimate-wash-foam-150ml-gentle-soap-free-cleansing-ph-balanced-with-aloe-vera-and-chamomile-extract/d0395aebf64b4/product-detail",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-E49654795A8F",
    "name": "Sebamed Lip Defense SPF 30",
    "family_id": "PSC-IS-162",
    "image_url": "/assets/products/verified-20261019/df0f57095c85f33d05f8.jpg",
    "source": "https://alainpharmacy.ae/sebamed-lip-defense-spf-30.html",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-9DA175F24E74",
    "name": "Sebamed Repair Conditioner",
    "family_id": "PSC-IS-156",
    "image_url": "/assets/products/verified-20261019/aef486431efe7e4e5f69.jpg",
    "source": "https://gcc.luluhypermarket.com/en-ae/sebamed-repair-conditioner-200-ml/p/149489",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-1F1419E1172D",
    "name": "Vitane Liquid Vitamins + Minerals — 200 ml",
    "family_id": "PSC-IS-188",
    "image_url": "/assets/products/verified-20261019/c7d8409d0f36ec4bb89c.jpg",
    "source": "https://www.mumzworld.com/en/vitane-oral-liquid-200-ml",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "INST-0078",
    "name": "Elastic bandage — 10 cm",
    "family_id": "PSC-SC-C14",
    "image_url": "/assets/products/verified-20261019/5d91c6f696fa1c8cbcbe.jpg",
    "source": "https://www.pttavm.com/elastik-bandaj-10-cm-x-120-cm-ds-p-251715934",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Elastic bandage — 10 cm",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0137",
    "name": "Glucose control solution",
    "family_id": "PSC-IS-023",
    "image_url": "/assets/products/verified-20261019/0283291ba508012cc52a.jpg",
    "source": "https://www.praxisdienst.com/be-en/produit/accu-chek-guide-control-solution/140279",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Glucose control solution",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0160",
    "name": "Hypoallergenic fixation tape — Wide",
    "family_id": "PSC-IS-040",
    "image_url": "/assets/products/verified-20261019/addf48f4d9a04e2d5647.jpg",
    "source": "https://moja.pl/pl/p/Heltiso-Hipoalergiczny-przylepiec-tkaninowy-na-rolce-5m-x-5cm-1-sztuka/42124",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Hypoallergenic fixation tape — Wide",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0180",
    "name": "Respirators",
    "family_id": "PSC-IS-053",
    "image_url": "/assets/products/verified-20261019/29684430560041646563.jpg",
    "source": "https://shopee.co.th/3%E0%B9%80%E0%B8%AD%E0%B9%87%E0%B8%A1-%E0%B8%AB%E0%B8%99%E0%B9%89%E0%B8%B2%E0%B8%81%E0%B8%B2%E0%B8%81%E0%B8%9B%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%81%E0%B8%B1%E0%B8%99%E0%B8%9D%E0%B8%B8%E0%B9%88%E0%B8%99%E0%B9%81%E0%B8%9A%E0%B8%9A%E0%B8%9E%E0%B8%B1%E0%B8%9A%E0%B9%84%E0%B8%94%E0%B9%89-%E0%B8%A3%E0%B8%B8%E0%B9%88%E0%B8%99-9320A-FFP2-%281-%E0%B8%8A%E0%B8%B4%E0%B9%89%E0%B8%99%29-3M-Aura%E2%84%A2-9320A-Ffp2-Respirator-1pc.-i.158138210.7236459257",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Respirators",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0188",
    "name": "Surface disinfectant solution — Ready-to-use",
    "family_id": "PSC-IS-061",
    "image_url": "/assets/products/verified-20261019/354d7243a2b632998883.jpg",
    "source": "https://catalogs.bbraun.com/en-01/p/PRID00008751/meliseptol-new-formula-surface-disinfection",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Surface disinfectant solution — Ready-to-use",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0193",
    "name": "General waste bags — Medium",
    "family_id": "PSC-IS-064",
    "image_url": "/assets/products/verified-20261019/ec17a910da2dfd326ceb.jpg",
    "source": "https://www.insinc.co.nz/product/2709788",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "General waste bags — Medium",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0194",
    "name": "General waste bags — Large",
    "family_id": "PSC-IS-064",
    "image_url": "/assets/products/verified-20261019/62bff31adf002848b8ea.jpg",
    "source": "https://neelblue.co.uk/80l-large-extra-strong-waste-bin-bags---pack-of-50/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "General waste bags — Large",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0203",
    "name": "Patient-specific medicine storage box — Small",
    "family_id": "PSC-IS-070",
    "image_url": "/assets/products/verified-20261019/1b2da87bf221f17798e6.jpg",
    "source": "https://www.walmart.com/c/kp/small-medication-lock-box",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Patient-specific medicine storage box — Small",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PS-AC-DC2A1FF485E5",
    "name": "Emivanz 500/5 mg — 30 Tablets",
    "family_id": "PSC-IS-165",
    "image_url": "/assets/products/verified-20261019/140fa5eebd2d34bac361.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/emivanz-500mg5mg-tablets-pack-of-30s/1003851",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-AA3857390E4C",
    "name": "ETOXIB 60MG TAB 30'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/0ea87eaf9320b4c5c97a.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/etoxib-60mg-tablets-pack-of-30s/1037195",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-B481A33B8ADA",
    "name": "FEXOLAG 180MG TAB 30'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/04ba9570facb0f5190d4.png",
    "source": "https://www.lifepharmacy.com/sa-en/product/fexolag-180mg-film-coated-tab-30s",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-43A24DE60E39",
    "name": "GLIT 30MG TAB 28'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/985ff38c417da1a1dc67.png",
    "source": "https://www.lifepharmacy.com/sa-en/product/glit-30mg-tablet-28s-14s-blister-x-2",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-72481ED45E70",
    "name": "IBULGAN 600MG TAB 20'S",
    "family_id": "PSC-IS-091",
    "image_url": "/assets/products/verified-20261019/8f9d2489d8044cb38077.png",
    "source": "https://www.lifepharmacy.com/sa-en/product/ibulgan-fc-600mg-20s-tab-2-b-listers-x-10s",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-05F926A8B794",
    "name": "MONTY 10MG TAB 30'S",
    "family_id": "PSC-IS-079",
    "image_url": "/assets/products/verified-20261019/b35ad5c0cdae68003c19.avif",
    "source": "https://www.medxpharmacy.com/product/monty-10mg-tablets-30s/",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-9BC23001E986",
    "name": "NEOCOFF JUNIOR SYRUP 7MG/5ML,125ML",
    "family_id": "PSC-IS-126",
    "image_url": "/assets/products/verified-20261019/3bf5d51b5f1b1301c976.webp",
    "source": "https://medononline.com/product/neocoff-junior-syrup-125ml-9957",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-4A266A218848",
    "name": "NEOMOL CF 500MG TAB 20'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/35b7fb3ee69bc14809ed.avif",
    "source": "https://www.medxpharmacy.com/product/neomol-cf-tab-20s/",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-683CA878AC68",
    "name": "PROCID GR 40MG 28'S",
    "family_id": "PSC-IS-122",
    "image_url": "/assets/products/verified-20261019/f32e8313e9bf94c89fc7.png",
    "source": "https://www.lifepharmacy.com/sa-en/product/procid-gr-40mg-tab-28s-14s-blister-x-2",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-8F7C2BB1306B",
    "name": "VASTOR 10MG TAB 30'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/9ef0b959d4e977ef5b01.png",
    "source": "https://www.lifepharmacy.com/sa-en/product/vastor-10mg-film-coated-tab-30s",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-8817989F1B28",
    "name": "VICKS VUL510E1 HUMIDIFIER ULTRASONIC COOL (4005)",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/261927bb80b33f84bac0.avif",
    "source": "https://www.medxpharmacy.com/product/vicks-personal-humidifier-ultra-coolmist-vul510e1/",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-49C544EA6E0C",
    "name": "Cetralon Cetirizine 5 mg/5 ml Syrup — 75 ml",
    "family_id": "PSC-IS-073",
    "image_url": "/assets/products/verified-20261019/584d4c49fa2f261be6c7.jpg",
    "source": "https://www.binsina.ae/en/buy-cetralon-5mg5ml-cetirizine-hydrochloride-syrup-75ml.html",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-0BC7A350ED13",
    "name": "Clozac Acne Facial Gel — 50 g",
    "family_id": "PSC-IS-152",
    "image_url": "/assets/products/verified-20261019/feb8d88eb43bb5dada16.jpg",
    "source": "https://elegantgroup.com.ua/catalog/product/gel-proti-akne-klozak",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-A60A93407A6D",
    "name": "Dolvic-K Diclofenac Potassium 50 mg — 20 Tablets",
    "family_id": "PSC-IS-149",
    "image_url": "/assets/products/verified-20261019/b3180629242f0622b6fe.jpg",
    "source": "https://www.myaster.sa/ar/online-pharmacy/p/dolvic-k-50mg-tablets-for-pain-relief-pack-of-20-s/26139",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-E50487D58B2A",
    "name": "Emidol Paracetamol 500 mg — 24 Tablets",
    "family_id": "PSC-IS-090",
    "image_url": "/assets/products/verified-20261019/3c14e1207f8e64f51862.png",
    "source": "https://rakizah.com/en/products/emidol-500mg-24tab",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-7DE9E565CE7F",
    "name": "Isomar Daily Hygiene Spray Nose & Ear — 100 ml",
    "family_id": "PSC-IS-106",
    "image_url": "/assets/products/verified-20261019/d89ad5ade1abb1ef3896.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/isomar-daily-hygiene-spray-100ml/1005347",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-D0757B6AB503",
    "name": "Lomexin 200 mg — 3 Ovules",
    "family_id": "PSC-IS-186",
    "image_url": "/assets/products/verified-20261019/0d34c7e20be2b2336e1d.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/lomexin-200mg-vaginal-ovules-pack-of-3s/1006300",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-7F7266B6E568",
    "name": "Lomexin T 1000 mg — 1 Ovule",
    "family_id": "PSC-IS-186",
    "image_url": "/assets/products/verified-20261019/270e3089fdc4899d8c0e.jpg",
    "source": "https://www.binsina.ae/en/brand/lomexin.html",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-4D0091180AB9",
    "name": "Lozaty Ginger — 24 Lozenges",
    "family_id": "PSC-IS-121",
    "image_url": "/assets/products/verified-20261019/24cbd20dccaf0ec911f3.jpg",
    "source": "https://alainpharmacy.ae/lozaty-ginger-lozenges-24-s.html",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-8D0A1B46D7AE",
    "name": "PUMPINOX 40MG TAB 14'S",
    "family_id": "PSC-IS-122",
    "image_url": "/assets/products/verified-20261019/1617d7718659cd1af2bb.jpg",
    "source": "https://dawapharmacy.ae/products/pumpinox-40mg-tab-14s?srsltid=AfmBOooA-KDSwBl7oDjSft-Mp6M-jw6Ydf69gYj_g0uBvHelOkB4k7do",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-894A608A56AE",
    "name": "RINOCLENIL 100MCG NASAL SPRAY",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/0c1a10acc66d73bad954.jpg",
    "source": "https://sidalih.com/en/products/rino-clenil-100-mcg-beclomethasone-nasal-spray-200-g",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-FC78AF3CB44F",
    "name": "B+ Vitamin B Complex — 30 Softgels",
    "family_id": "PSC-IS-188",
    "image_url": "/assets/products/verified-20261019/2d19695bbd32cc4f922f.jpg",
    "source": "https://www.noon.com/uae-en/zenith-b-30-softgels/ZE51638FF95C724A42D0DZ/p/",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-C4B46B23533F",
    "name": "Beauty Plus Hair Skin & Nails — 30 Softgels",
    "family_id": "PSC-IS-188",
    "image_url": "/assets/products/verified-20261019/4bf2a833a67d72f03c27.jpg",
    "source": "https://www.noon.com/uae-en/beauty-plus-30-s/ZC47516C8C407B05B1528Z/p/",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-8500EF9636BD",
    "name": "Bepanthen Moisturizing Cream — 30 g",
    "family_id": "PSC-IS-111",
    "image_url": "/assets/products/verified-20261019/ec6c11c8b24edbd6d9b2.jpg",
    "source": "https://www.watsons.sa/products/bepanthen-moisturizing-cream-moisturizes-dry-skin-30g",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-6F0697D8906B",
    "name": "Duphalac Double Action",
    "family_id": "PSC-IS-100",
    "image_url": "/assets/products/verified-20261019/2fde1bed72707bd629ec.jpg",
    "source": "https://www.noon.com/uae-en/double-action-solution-300ml/Z4EAD1DE06116A1E7DA31Z/p/",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-75531F59FDD5",
    "name": "Duphalac Fruit Lactulose 667 mg/ml — 200 ml",
    "family_id": "PSC-IS-100",
    "image_url": "/assets/products/verified-20261019/f0712ea5fe5b57fd704a.jpg",
    "source": "https://www.binsina.ae/ar/buy-duphalac-fruit-syrup-200ml.html",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-27ED37EEE993",
    "name": "Lomidex Loperamide 2 mg — 10 Capsules",
    "family_id": "PSC-IS-098",
    "image_url": "/assets/products/verified-20261019/579090c455a73fece87d.jpg",
    "source": "https://oasispharmacy.ae/products/lomidex-2mg-loperamide-10-capsules",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-C78EE225849D",
    "name": "Wegovy Semaglutide 0.5 mg Prefilled Pen",
    "family_id": "PSC-IS-179",
    "image_url": "/assets/products/verified-20261019/1bfcbe9c02585b5cc0ca.png",
    "source": "https://www.nahdionline.com/en-sa/wegovy-0-5-mg-1-prefilled-pen-1-5ml-refrigerator/pdp/102763666",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-1739D7036B10",
    "name": "Wegovy Semaglutide 1.7 mg Prefilled Pen",
    "family_id": "PSC-IS-179",
    "image_url": "/assets/products/verified-20261019/289ebb69d8b13ce59ea2.png",
    "source": "https://www.nahdionline.com/en-ae/wegovy-1-7-mg-1-prefilled-pen-3-ml-refrigerator/pdp/102763682?srsltid=AfmBOopK9Kc16V3u9_Z4PU0JGOON3tQdKeUr4SnpjYe0V6sMSzk02U16",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-E015B822E20F",
    "name": "Zecuf Herbal Cough Remedy — 100 ml",
    "family_id": "PSC-IS-126",
    "image_url": "/assets/products/verified-20261019/56a9b583114452b181cd.jpg",
    "source": "https://www.lifepharmacy.com/product/zecuf-herbal-cough-remedy-100ml",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PSC-EQP-002",
    "name": "Three-Panel Ward Screen",
    "family_id": "PSC-SC-A16",
    "image_url": "/assets/products/verified-20261019/96e6354668fe08a21d3a.png",
    "source": "https://lojapro.pt/inicio/biombo-hospitalar-triplo-dobravel-com-rodas-jms",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Three-Panel Ward Screen",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-EQP-005",
    "name": "Two-Shelf Instrument Trolley",
    "family_id": "PSC-SC-A18",
    "image_url": "/assets/products/verified-20261019/f63f3eac50617b1776c4.jpg",
    "source": "https://www.cirurgicapassos.com.br/moveis-hospitalares/carro-curativo-simples-inox-slt",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Two-Shelf Instrument Trolley",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-EQP-006",
    "name": "Standard Folding Wheelchair",
    "family_id": "PSC-SC-A21",
    "image_url": "/assets/products/verified-20261019/54eb6edc2630af2f387a.jpg",
    "source": "https://ms.gdjianlian.com/product-standard-light-leisure-wheelchair.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Standard Folding Wheelchair",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-DSP-003",
    "name": "Disposable Syringe 5 ml",
    "family_id": "PSC-SC-C24",
    "image_url": "/assets/products/verified-20261019/4870a37b8c042ed4dfbe.jpg",
    "source": "https://phananhco.com/bom-tiem-5cc-1.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Disposable Syringe 5 ml",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-RES-004",
    "name": "Oxygen Mask — Adult",
    "family_id": "PSC-SC-C09",
    "image_url": "/assets/products/verified-20261019/993185a0e90ea4b0a059.jpg",
    "source": "https://www.ice4med.pl/3744-maska-tlenowa-z-drenem-210cm-dla-doroslych-rozmiar-l-1szt.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Oxygen Mask — Adult",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-RES-006",
    "name": "Oxygen Tubing",
    "family_id": "PSC-IS-012",
    "image_url": "/assets/products/verified-20261019/7a977c3d8edd417bf935.jpg",
    "source": "https://www.medicaleshop.com/teleflex-star-lumen-oxygen-supply-tubing",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Oxygen Tubing",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-WST-003",
    "name": "Clinical Waste Bags & Liners",
    "family_id": "PSC-IS-063",
    "image_url": "/assets/products/verified-20261019/ff94764ac2f7150e4d4d.jpg",
    "source": "https://spama.sa/en/3796-waste-bags-yellow-small-10-gallon",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Clinical Waste Bags & Liners",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-WST-004",
    "name": "Spill Kit / Absorbent Kit",
    "family_id": "PSC-IS-062",
    "image_url": "/assets/products/verified-20261019/9c4ca8446ade5815d931.jpg",
    "source": "https://allcarestore.com/products/bloodborne-pathogen-and-bodily-fluid-spill-kit-first-aid-only",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Spill Kit / Absorbent Kit",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-WND-015",
    "name": "Wound Closure Strips",
    "family_id": "PSC-IS-045",
    "image_url": "/assets/products/verified-20261019/0e0f6acd82f033c26282.jpg",
    "source": "https://mockmedical.com/skin-wound-closure-strip-steri-strip-type/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Wound Closure Strips",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0002",
    "name": "Lockable clinical supplies cabinet",
    "family_id": "PSC-SC-A02",
    "image_url": "/assets/products/verified-20261019/fb8f4ccbb1467f95ee52.jpg",
    "source": "https://www.praxisdienst.com/veterinary/furniture-organisation/clinical-furniture/cabinets/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Lockable clinical supplies cabinet",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0003",
    "name": "Digital cold-chain thermometer",
    "family_id": "PSC-SC-A03",
    "image_url": "/assets/products/verified-20261019/ee2d221f5cbe5b01efce.jpg",
    "source": "https://temperature.co.nz/collections/vaccine-cold-chain-thermometers?srsltid=AfmBOoo97DbR6ahuIp1g4hcUz6IAEV-hoBFywP9EeTNiHxkIMDKCV6xG",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Digital cold-chain thermometer",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0007",
    "name": "Lockable records filing cabinet",
    "family_id": "PSC-SC-A06",
    "image_url": "/assets/products/verified-20261019/47e16b50ed4eb8c0e74a.jpg",
    "source": "https://www.leroymerlin.fr/produits/caisson-de-bureau-fromm-starck-tole-laminee-pour-dossiers-suspendus-a4-f4-etageres-de-0-6-mm-epaisseur-90152060.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Lockable records filing cabinet",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0085",
    "name": "Impermeable plastic sheet for covering bed",
    "family_id": "PSC-SC-C17",
    "image_url": "/assets/products/verified-20261019/bd8c7d73a7a2463212f7.jpg",
    "source": "https://spama.sa/3381-plastic-sheet-anti-bacterial-blue",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Impermeable plastic sheet for covering bed",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-EQP-008",
    "name": "IV Stand",
    "family_id": "PSC-SC-A11",
    "image_url": "/assets/products/verified-20261019/b56cb4e991896cec6556.png",
    "source": "https://www.lifepharmacy.com/sa-en/product/kaiyang-iv-stand-ky70402-ky513",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "IV Stand",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0202",
    "name": "Medication labels",
    "family_id": "PSC-IS-069",
    "image_url": "/assets/products/verified-20261019/3483661db6e1625fbbd6.jpg",
    "source": "https://www.unitedadlabel.com/patient-date-medication-medication-instruction-label-2-3-4-x-1-3-4",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Medication labels",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0196",
    "name": "Waste labels and ties",
    "family_id": "PSC-IS-066",
    "image_url": "/assets/products/verified-20261019/2d8101af8d8af30a8345.jpg",
    "source": "https://www.spservices.co.uk/First-Aid/Disposables/Clinical-Waste/Clinical-Waste-Bag-Seal-Tags-Box-100/p/BT17ORANGE",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "label": "Waste labels and ties",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PS-AC-E204E9A3DB72",
    "name": "Wegovy Semaglutide 0.25 mg Prefilled Pen",
    "family_id": "PSC-IS-179",
    "image_url": "/assets/products/verified-20261019/1cfbe5d6c83ba6fe8aa9.png",
    "source": "https://www.nahdionline.com/ar-ae/wegovy-0-25mg-1-prefilled-pen-1-5ml-refrigerator/pdp/102763658",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-0EFF9E2AC288",
    "name": "Wegovy Semaglutide 1 mg Prefilled Pen",
    "family_id": "PSC-IS-179",
    "image_url": "/assets/products/verified-20261019/f58a3ae4ed7cdb3b8673.png",
    "source": "https://www.nahdionline.com/en-sa/wegovy-1-mg-1-prefilled-pen-3-ml-refrigerator/pdp/102763674",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-643A0525B55C",
    "name": "Wegovy Semaglutide 2.4 mg Prefilled Pen",
    "family_id": "PSC-IS-179",
    "image_url": "/assets/products/verified-20261019/2ca7c6ef2ee0d40bfd79.png",
    "source": "https://www.nahdionline.com/en-sa/wegovy-2-4-mg-1-prefilled-pen-3-ml-refrigerator/pdp/102763691",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PSC-RES-007",
    "name": "Nebulizer Mask & Tubing — Paediatric",
    "family_id": "PSC-SC-C08",
    "image_url": "/assets/products/verified-20261019/2b658ba9028cb16063b5.jpg",
    "source": "https://www.binsina.ae/en/buy-wolaid-nebulizer-kit-child.html",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PSC-RES-001",
    "name": "Medical Compressor Nebulizer PRO-110",
    "family_id": "PSC-SC-B15",
    "image_url": "/assets/products/verified-20261019/51e8f5ed1d79daddb858.jpg",
    "source": "https://www.selfmed.com.pl/index.php/product/szwajcarski-nebulizator-b-well-pro-110/",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PSC-DSP-009",
    "name": "Oral Dosing Syringes",
    "family_id": "PSC-IS-068",
    "image_url": "/assets/products/verified-20261019/ba522e67460952f8c10a.jpg",
    "source": "https://glmedicalsupplies.com/monoject-oral-dispenser-syringe-8881901006/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Oral Dosing Syringes",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0108",
    "name": "IV Solution: Dextrose saline",
    "family_id": "PSC-SC-D06A",
    "image_url": "/assets/products/verified-20261019/c4082d0a288ae9cbc590.jpg",
    "source": "https://alcare.sg/alcare-e-store/dextrose-5-iv-w-sodium-chloride-0-9-500ml/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "IV Solution: Dextrose saline",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-WND-016",
    "name": "Sterile Wound Pads / Dressings",
    "family_id": "PSC-SC-C23",
    "image_url": "/assets/products/verified-20261019/25eb919314feb2c09d09.jpg",
    "source": "https://www.med7online.com/products/wolaid-gauz-swabs-eto-sterile-10-10cm-12ply-20s",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "INST-0006",
    "name": "Electric hand dryer",
    "family_id": "PSC-SC-A05",
    "image_url": "/assets/products/verified-20261019/5edb1fe41c63c0c3f86d.jpg",
    "source": "https://www.ywleto.com/automatic-hand-dryer-product/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Electric hand dryer",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0023",
    "name": "Replacement ice-pack set",
    "family_id": "PSC-SC-A20",
    "image_url": "/assets/products/verified-20261019/2b4e14d730cc60c1621c.webp",
    "source": "https://www.fairbizpsstore.com/products/fairbizps-ice-packs-for-vaccine-carrier-box-reusable-long-la-SKU-0085",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Replacement ice-pack set",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-RES-005",
    "name": "Oxygen Mask — Paediatric",
    "family_id": "PSC-SC-C09",
    "image_url": "/assets/products/verified-20261019/745896a220479fa0cc1f.png",
    "source": "https://shmedical.ro/masti-oxigen/1050-masca-oxigen-sterila-pediatrica.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Oxygen Mask — Paediatric",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-WST-001",
    "name": "Sharps Container — Small",
    "family_id": "PSC-SC-B20",
    "image_url": "/assets/products/verified-20261019/c0857fd8a90cdb03520e.png",
    "source": "https://dehealthcare.co.nz/products/sharps-container-1l",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Sharps Container — Small",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0083",
    "name": "Hypodermic needle — 23G",
    "family_id": "PSC-SC-C16",
    "image_url": "/assets/products/verified-20261019/629529449e0bac680eaf.jpg",
    "source": "https://www.shdmedical.co.uk/needles/long-braun-sterican-blue-23g-30mm-1-inch-needle-box-of-100/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Hypodermic needle — 23G",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0084",
    "name": "Hypodermic needle — 25G",
    "family_id": "PSC-SC-C16",
    "image_url": "/assets/products/verified-20261019/50aa269e20af6504ba93.jpg",
    "source": "https://www.ivymedicalshop.com/en/bd-microlance-needles-25g-0.50x16-mm-orange/",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Hypodermic needle — 25G",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0087",
    "name": "IV cannula — 24G",
    "family_id": "PSC-SC-C18",
    "image_url": "/assets/products/verified-20261019/870f2071409da8a0af7d.jpg",
    "source": "https://globalcare.com.bd/product/iv-cannula-cannula-24g",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "IV cannula — 24G",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0088",
    "name": "Butterfly / winged infusion set — 23G",
    "family_id": "PSC-SC-C18",
    "image_url": "/assets/products/verified-20261019/bdbae49ecef58c26a946.jpg",
    "source": "https://prima-shop.ro/microperfuzoare-sterile-fluturasi-cu-ac-23g-albastre-100-bucati",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Butterfly / winged infusion set — 23G",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0089",
    "name": "Butterfly / winged infusion set — 25G",
    "family_id": "PSC-SC-C18",
    "image_url": "/assets/products/verified-20261019/3124abc734904a77786e.jpg",
    "source": "https://www.midmeds.co.uk/shop/md03275-butterfly-infusion-set-orange-25g-x-50-67429",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Butterfly / winged infusion set — 25G",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0101",
    "name": "Disposable syringe — 20 ml",
    "family_id": "PSC-SC-C24",
    "image_url": "/assets/products/verified-20261019/e0928f63f5a766169727.jpg",
    "source": "https://sp.commercesuite.com.br/material-de-consumo/seringas/seringa-descartavel/seringa-descartavel-20-ml-sem-agulha-slip-descarpack",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Disposable syringe — 20 ml",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0124",
    "name": "Medical oxygen refill / exchange",
    "family_id": "PSC-IS-011",
    "image_url": "/assets/products/verified-20261019/3d9bcee0c52ff756ad83.jpg",
    "source": "https://www.airgas.com/product/Gases/Oxygen/p/OX%20USPEA",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Medical oxygen refill / exchange",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-PPE-006",
    "name": "Disposable Hair Covers",
    "family_id": "PSC-SC-C10",
    "image_url": "/assets/products/verified-20261019/9a8579c122d9edbbb7fe.jpg",
    "source": "https://www.cotepro.fr/charlotte-cuisine-protection/251-charlotte-ronde-polypropylene-a-usage-court-boite-de-100.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Disposable Hair Covers",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0100",
    "name": "Disposable syringe — 10 ml",
    "family_id": "PSC-SC-C24",
    "image_url": "/assets/products/verified-20261019/95572d42c73adf711ee1.jpg",
    "source": "https://www.farmaten.com/en/health/first-aid-kit/measuring-devices/bd-discardit-ii-syringe-without-needle-10-ml.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Disposable syringe — 10 ml",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-EQP-001",
    "name": "Manual Medical Bed — Two Crank",
    "family_id": "PSC-SC-A14",
    "image_url": "/assets/products/verified-20261019/45126ead10c3801f3d5c.jpg",
    "source": "https://www.fsykmed.com/product-2-crank-manual-basic-medical-bed.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Manual Medical Bed — Two Crank",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0204",
    "name": "Patient-specific medicine storage box — Large",
    "family_id": "PSC-IS-070",
    "image_url": "/assets/products/verified-20261019/2191ebe36f86712da013.jpg",
    "source": "https://www.cdiscount.com/sante-mieux-vivre/materiel-medical/jk21169-boite-de-rangement-de-medicaments-conteneu/f-1650602-ywe4970744682137.html",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Patient-specific medicine storage box — Large",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PS-AC-7CB34745B16F",
    "name": "Sebamed Fresh Classic Roll-On Deodorant",
    "family_id": "PSC-IS-146",
    "image_url": "/assets/products/verified-20261019/d41f2a78dcebb9ff5df0.png",
    "source": "https://www.lifepharmacy.com/sa-en/product/sebamed-deo-roll-on-fresh-unisex-50ml",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PSC-WND-007",
    "name": "Durable Fabric Bandage Assorted",
    "family_id": "PSC-SC-C01",
    "image_url": "/assets/products/verified-20261019/7fae84e9f0406a83a98f.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/3m-nexcare-durable-fabric-bandage-assorted-pack-of-30s/1000119",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PSC-PPE-002",
    "name": "Vinyl Examination Gloves",
    "family_id": "PSC-SC-C05",
    "image_url": "/assets/products/verified-20261019/b9747c9c8b117df78832.png",
    "source": "https://www.henryschein.co.uk/p/dehp-gloves-vinyl-powder-free-large-100pk/1021923",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Vinyl Examination Gloves",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0060",
    "name": "Vinyl examination gloves — Small",
    "family_id": "PSC-SC-C05",
    "image_url": "/assets/products/verified-20261019/b9747c9c8b117df78832.png",
    "source": "https://www.henryschein.co.uk/p/dehp-gloves-vinyl-powder-free-large-100pk/1021923",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Vinyl examination gloves — Small",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0061",
    "name": "Vinyl examination gloves — Medium",
    "family_id": "PSC-SC-C05",
    "image_url": "/assets/products/verified-20261019/b9747c9c8b117df78832.png",
    "source": "https://www.henryschein.co.uk/p/dehp-gloves-vinyl-powder-free-large-100pk/1021923",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Vinyl examination gloves — Medium",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "INST-0062",
    "name": "Vinyl examination gloves — Large",
    "family_id": "PSC-SC-C05",
    "image_url": "/assets/products/verified-20261019/b9747c9c8b117df78832.png",
    "source": "https://www.henryschein.co.uk/p/dehp-gloves-vinyl-powder-free-large-100pk/1021923",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Vinyl examination gloves — Large",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-PPE-004",
    "name": "Respirator Masks",
    "family_id": "PSC-SC-C10",
    "image_url": "/assets/products/verified-20261019/29684430560041646563.jpg",
    "source": "https://shopee.co.th/3%E0%B9%80%E0%B8%AD%E0%B9%87%E0%B8%A1-%E0%B8%AB%E0%B8%99%E0%B9%89%E0%B8%B2%E0%B8%81%E0%B8%B2%E0%B8%81%E0%B8%9B%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%81%E0%B8%B1%E0%B8%99%E0%B8%9D%E0%B8%B8%E0%B9%88%E0%B8%99%E0%B9%81%E0%B8%9A%E0%B8%9A%E0%B8%9E%E0%B8%B1%E0%B8%9A%E0%B9%84%E0%B8%94%E0%B9%89-%E0%B8%A3%E0%B8%B8%E0%B9%88%E0%B8%99-9320A-FFP2-%281-%E0%B8%8A%E0%B8%B4%E0%B9%89%E0%B8%99%29-3M-Aura%E2%84%A2-9320A-Ffp2-Respirator-1pc.-i.158138210.7236459257",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Respirator Masks",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-PPE-005",
    "name": "Protective Goggles / Eye Protection",
    "family_id": "PSC-SC-C10",
    "image_url": "/assets/products/verified-20261019/0db463e3bf9e85383492.png",
    "source": "https://www.strzmetal.com/products/Medical-Goggles.htm",
    "role": "SPECIFICATION_REFERENCE_ONLY",
    "allowUnbrandedReference": false,
    "label": "Protective Goggles / Eye Protection",
    "review": "Codex visual review 2026-10-19: representative product type/function only. Exact model, size, pack, compatibility, supplied accessories and licensed supply confirmed in quotation. No supplier branding/backdrop. No product or regulatory approval."
  },
  {
    "sku": "PSC-WND-002",
    "name": "Gauze Swabs ETO Sterile 10 × 10 cm 12-ply",
    "family_id": "PSC-SC-C23",
    "image_url": "/assets/products/verified-20261019/25eb919314feb2c09d09.jpg",
    "source": "https://www.med7online.com/products/wolaid-gauz-swabs-eto-sterile-10-10cm-12ply-20s",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-02A4FF962422",
    "name": "K-FLAM 50MG TAB 20'S",
    "family_id": "",
    "image_url": "/assets/products/verified-20261019/acfc46e23b78b3c53f9b.jpg",
    "source": "https://www.zozopharmacy.com/products/k-flam-50mg-tab-20s",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-0DEC19ACEA05",
    "name": "Aldomet 250 mg — 30 Tablets",
    "family_id": "PSC-IS-166",
    "image_url": "/assets/products/verified-20261019/985e9dc0be3325c79a6d.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/aldomet-250mg-tablets-pack-of-30s/1000422",
    "review": "Codex full-size visual review 2026-10-19: exact Aldomet250mg/30-tablet or Hy+Al12g pack label checked; complete original pack, no supplier branding/backdrop/watermark. Original bytes retained. Image-only review; no approval of price, stock, product facts or regulatory status."
  },
  {
    "sku": "PS-AC-EF89A3D78DE4",
    "name": "HY+AI Oral Gel — 12 g",
    "family_id": "PSC-IS-168",
    "image_url": "/assets/products/verified-20261019/a823e04eb5d9cd09a093.jpg",
    "source": "https://www.myaster.com/en/online-pharmacy/p/intermed-hy-al-oral-gel-for-mouth-ulcer-12g/1062439",
    "review": "Codex full-size visual review 2026-10-19: exact Aldomet250mg/30-tablet or Hy+Al12g pack label checked; complete original pack, no supplier branding/backdrop/watermark. Original bytes retained. Image-only review; no approval of price, stock, product facts or regulatory status."
  },
  {
    "sku": "PS-AC-7FA52A9BCF9F",
    "name": "LDNIL 10MG TAB 30'S (ROSUVASTATIN)",
    "family_id": "PSC-IS-119",
    "image_url": "/assets/products/verified-20261019/06f0199e9a0107081de0.png",
    "source": "https://medsgo.ph/prescription-medicines/dyslipidemic-agents/ldnil-rosuvastatin-10mg-film-coated-tablet-1s/",
    "review": "Codex visual review 2026-10-19: brand/product/form/strength and stated pack checked where specified; no supplier backdrop/watermark. Original source bytes preserved. No price, stock, registration or regulatory approval."
  },
  {
    "sku": "PS-AC-D0FA94CC5CCD",
    "name": "Calvit D3 Calcium + Magnesium + Vitamins — 30 Tablets",
    "family_id": "PSC-IS-188",
    "image_url": "/assets/products/verified-20261019/8acf810d15e36c059d81.jpg",
    "source": "https://www.noon.com/uae-en/calvit-d3-tablets-30-s-calcium-vitamin-d3-supplement-bone-strength-joint-health-support-vitamin-d-deficiency-osteoporosis-support-formula/ZDEB5304A849A0632678AZ/p/",
    "review": "Codex full-size visual review 2026-10-19: Calvit D3 calcium/magnesium/vitamins and30-tablet pack label match. Original complete pack pixels retained; plain photo background, no supplier branding/watermark. Image-only review; no product, price, stock or regulator approval."
  },
{
  "sku": "PSC-OXY-001",
  "name": "Oxygen Support Set",
  "family_id": "PSC-SC-B16",
  "image_url": "/assets/products/verified-20261019/40d14a423e3342754e3b.jpg",
  "source": "https://tecnomedica.com.co/cilindros-reguladores/",
  "role": "SPECIFICATION_REFERENCE_ONLY",
  "label": "Oxygen cylinder, trolley and regulator configuration",
  "review": "Codex full-size visual review 2026-10-19: complete oxygen cylinder, wheeled trolley and regulator/gauge configuration on clean white background, no supplier logo, backdrop, watermark or unrelated montage fragments. Illustrative product type only; exact brand/model, connection, flow range, fill status and accessories remain quotation-controlled. Original source pixels unchanged. No UAE compatibility, registration, stock or suitability approval."
}
];
 const refresh=window.PS_CATALOGUE_REFRESH;
 if(!refresh)return;
 const targets=[...refresh.products,...(window.PSC_DATA?.products||[])];
 for(const r of rows){
  const image=window.PSC_IMAGE_POLICY?window.PSC_IMAGE_POLICY.resolve(r.image_url):r.image_url;
  if(!image)continue;
  const p=targets.find(p=>p.pscSku===r.sku&&p.name===r.name&&String(p.catalogueParentId||p.catalogueReferenceFamilyId||'')===r.family_id);
  if(!p||/VERIFIED EXACT/.test(p.imageStatus||''))continue;
  if(r.role==='SPECIFICATION_REFERENCE_ONLY'&&!/^(Specification-led|General \/ model TBC|Specialist route)$/i.test(p.brand||'')&&!(r.allowUnbrandedReference===true&&!String(p.brand||'').trim()))continue;
  Object.assign(p,{currentImageUrl:image,imageUrl:image,image_url:image,imageStatus:'SOURCE IMAGE AVAILABLE — PRODUCT PHOTO REVIEWED',imageIdentityReviewed:true,imageSource:window.PSC_IMAGE_POLICY?.replacement_sources?.[image]||r.source,imageVerification:r.review});
  if(r.role==='SPECIFICATION_REFERENCE_ONLY')Object.assign(p,{imageRole:r.role,imageReferenceLabel:r.label||r.name,imageStatus:'SOURCE IMAGE AVAILABLE — SPECIFICATION REFERENCE ONLY'});
  for(const o of refresh.approvedOptions){
   if(o.sku===r.sku&&o.exact_product_name===r.name&&o.family_id===r.family_id){o.image_url=image;o.image_status=p.imageStatus;o.image_pending=false;}
  }
 }
 window.PSC_IMAGE_RELEASE=Object.freeze({date:'2026-10-19',rows:Object.freeze(rows)});
})();
