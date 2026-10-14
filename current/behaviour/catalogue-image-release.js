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
    "sku": "PS-AC-0DEC19ACEA05",
    "name": "Aldomet 250 mg — 30 Tablets",
    "family_id": "PSC-IS-166",
    "image_url": "/assets/products/supplier-20261014/aldomet_250_mg_30_tablets.jpg",
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
    "sku": "PS-AC-FC78AF3CB44F",
    "name": "B+ Vitamin B Complex — 30 Softgels",
    "family_id": "PSC-IS-188",
    "image_url": "/assets/products/supplier-20261014/bplus_vitamin_b_complex_30_softgels.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-C4B46B23533F",
    "name": "Beauty Plus Hair Skin & Nails — 30 Softgels",
    "family_id": "PSC-IS-188",
    "image_url": "/assets/products/supplier-20261014/beauty_plus_hair_skin_and_nails_30_softgels.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-8500EF9636BD",
    "name": "Bepanthen Moisturizing Cream — 30 g",
    "family_id": "PSC-IS-111",
    "image_url": "/assets/products/supplier-20261014/bepanthen_moisturizing_cream_30_g.jpg",
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
    "sku": "PS-AC-AD5D840073E9",
    "name": "Braun Hair Dryer HD 2.2 — 2200 W",
    "family_id": "PSC-IS-173",
    "image_url": "/assets/products/supplier-20261014/braun_hair_dryer_hd_2_2_2200_w.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-D0FA94CC5CCD",
    "name": "Calvit D3 Calcium + Magnesium + Vitamins — 30 Tablets",
    "family_id": "PSC-IS-188",
    "image_url": "/assets/products/supplier-20261014/calvit_d3_calcium_plus_magnesium_plus_vitamins_30_tablets.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-49C544EA6E0C",
    "name": "Cetralon Cetirizine 5 mg/5 ml Syrup — 75 ml",
    "family_id": "PSC-IS-073",
    "image_url": "/assets/products/supplier-20261014/cetralon_cetirizine_5_mg_5_ml_syrup_75_ml.jpg",
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
    "sku": "PS-AC-0BC7A350ED13",
    "name": "Clozac Acne Facial Gel — 50 g",
    "family_id": "PSC-IS-152",
    "image_url": "/assets/products/supplier-20261014/clozac_acne_facial_gel_50_g.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-2D2C9351DF5B",
    "name": "CorDx Flu A/B + COVID-19 3-in-1 Rapid Test — 1 Test",
    "family_id": "PSC-IS-177",
    "image_url": "/assets/products/supplier-20261014/cordx_flu_a_b_plus_covid_19_3_in_1_rapid_test_1_test.jpg",
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
    "sku": "PS-AC-6398358F2B96",
    "name": "D-Cal Calcium + Vitamin D3 — 30 Softgels",
    "family_id": "PSC-IS-188",
    "image_url": "/assets/products/supplier-20261014/d_cal_calcium_plus_vitamin_d3_30_softgels.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-184DB35B4013",
    "name": "Dibase Vitamin D3 10,000 IU/ml Oral Drops",
    "family_id": "PSC-IS-187",
    "image_url": "/assets/products/supplier-20261014/dibase_vitamin_d3_10_000_iu_ml_oral_drops.jpg",
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
    "sku": "PS-AC-A60A93407A6D",
    "name": "Dolvic-K Diclofenac Potassium 50 mg — 20 Tablets",
    "family_id": "PSC-IS-149",
    "image_url": "/assets/products/supplier-20261014/dolvic_k_diclofenac_potassium_50_mg_20_tablets.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-8E9FE3B9BBC4",
    "name": "Dora Desloratadine 5 mg — 30 Tablets",
    "family_id": "PSC-IS-147",
    "image_url": "/assets/products/supplier-20261014/dora_desloratadine_5_mg_30_tablets.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-6F0697D8906B",
    "name": "Duphalac Double Action",
    "family_id": "PSC-IS-100",
    "image_url": "/assets/products/supplier-20261014/duphalac_double_action.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-75531F59FDD5",
    "name": "Duphalac Fruit Lactulose 667 mg/ml — 200 ml",
    "family_id": "PSC-IS-100",
    "image_url": "/assets/products/supplier-20261014/duphalac_fruit_lactulose_667_mg_ml_200_ml.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-E50487D58B2A",
    "name": "Emidol Paracetamol 500 mg — 24 Tablets",
    "family_id": "PSC-IS-090",
    "image_url": "/assets/products/supplier-20261014/emidol_paracetamol_500_mg_24_tablets.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-DC2A1FF485E5",
    "name": "Emivanz 500/5 mg — 30 Tablets",
    "family_id": "PSC-IS-165",
    "image_url": "/assets/products/supplier-20261014/emivanz_500_5_mg_30_tablets.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-18B8322BF411",
    "name": "Ergonomic Toothbrush Black — Medium",
    "family_id": "PSC-IS-184",
    "image_url": "/assets/products/supplier-20261014/ergonomic_toothbrush_black_medium.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-E0C03159604A",
    "name": "Ergonomic Toothbrush Purple — Medium",
    "family_id": "PSC-IS-184",
    "image_url": "/assets/products/supplier-20261014/ergonomic_toothbrush_purple_medium.jpg",
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
    "sku": "PS-AC-B5F68F0EEF03",
    "name": "Glotrizine 5 mg/5 ml Syrup — 100 ml",
    "family_id": "PSC-IS-073",
    "image_url": "/assets/products/supplier-20261014/glotrizine_5_mg_5_ml_syrup_100_ml.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-CA529915334B",
    "name": "Glozal Levocetirizine 5 mg — 20 Tablets",
    "family_id": "PSC-IS-161",
    "image_url": "/assets/products/supplier-20261014/glozal_levocetirizine_5_mg_20_tablets.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-EF89A3D78DE4",
    "name": "HY+AI Oral Gel — 12 g",
    "family_id": "PSC-IS-168",
    "image_url": "/assets/products/supplier-20261014/hyplusai_oral_gel_12_g.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-4D49E9D2478B",
    "name": "Isomar Baby No Gas Spray — 30 ml",
    "family_id": "PSC-IS-106",
    "image_url": "/assets/products/supplier-20261014/isomar_baby_no_gas_spray_30_ml.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-7DE9E565CE7F",
    "name": "Isomar Daily Hygiene Spray Nose & Ear — 100 ml",
    "family_id": "PSC-IS-106",
    "image_url": "/assets/products/supplier-20261014/isomar_daily_hygiene_spray_nose_and_ear_100_ml.jpg",
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
    "sku": "PS-AC-BAE369B8D77D",
    "name": "Isomar Nose Decongestant Vials — 20 x 5 ml",
    "family_id": "PSC-IS-106",
    "image_url": "/assets/products/supplier-20261014/isomar_nose_decongestant_vials_20_x_5_ml.jpg",
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
    "sku": "PS-AC-D0757B6AB503",
    "name": "Lomexin 200 mg — 3 Ovules",
    "family_id": "PSC-IS-186",
    "image_url": "/assets/products/supplier-20261014/lomexin_200_mg_3_ovules.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-7F7266B6E568",
    "name": "Lomexin T 1000 mg — 1 Ovule",
    "family_id": "PSC-IS-186",
    "image_url": "/assets/products/supplier-20261014/lomexin_t_1000_mg_1_ovule.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-27ED37EEE993",
    "name": "Lomidex Loperamide 2 mg — 10 Capsules",
    "family_id": "PSC-IS-098",
    "image_url": "/assets/products/supplier-20261014/lomidex_loperamide_2_mg_10_capsules.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-4D0091180AB9",
    "name": "Lozaty Ginger — 24 Lozenges",
    "family_id": "PSC-IS-121",
    "image_url": "/assets/products/supplier-20261014/lozaty_ginger_24_lozenges.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-F8D8B1697F75",
    "name": "Lozaty Orange — 24 Lozenges",
    "family_id": "PSC-IS-121",
    "image_url": "/assets/products/supplier-20261014/lozaty_orange_24_lozenges.jpg",
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
    "sku": "PS-AC-7CC2887C65F3",
    "name": "Miderizone Tolperisone 150 mg — 30 Tablets",
    "family_id": "PSC-IS-183",
    "image_url": "/assets/products/supplier-20261014/miderizone_tolperisone_150_mg_30_tablets.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-7249B30E2D1F",
    "name": "Moven Meloxicam 7.5 mg — 10 Capsules",
    "family_id": "PSC-IS-164",
    "image_url": "/assets/products/supplier-20261014/moven_meloxicam_7_5_mg_10_capsules.jpg",
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
    "sku": "PS-AC-33236AB32B6C",
    "name": "Sebamed Baby Cleansing Bar",
    "family_id": "PSC-IS-180",
    "image_url": "/assets/products/supplier-20261014/sebamed_baby_cleansing_bar.jpg",
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
    "sku": "PS-AC-7CB34745B16F",
    "name": "Sebamed Fresh Classic Roll-On Deodorant",
    "family_id": "PSC-IS-146",
    "image_url": "/assets/products/supplier-20261014/sebamed_fresh_classic_roll_on_deodorant.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-4F230BD47C18",
    "name": "Sebamed Gentle Facial Cleanser",
    "family_id": "PSC-IS-152",
    "image_url": "/assets/products/supplier-20261014/sebamed_gentle_facial_cleanser.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-D62FDC588E1A",
    "name": "Sebamed Intimate Wash Foam pH 3.8",
    "family_id": "PSC-IS-160",
    "image_url": "/assets/products/supplier-20261014/sebamed_intimate_wash_foam_ph_3_8.jpg",
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
    "sku": "PS-AC-E49654795A8F",
    "name": "Sebamed Lip Defense SPF 30",
    "family_id": "PSC-IS-162",
    "image_url": "/assets/products/supplier-20261014/sebamed_lip_defense_spf_30.jpg",
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
    "sku": "PS-AC-9DA175F24E74",
    "name": "Sebamed Repair Conditioner",
    "family_id": "PSC-IS-156",
    "image_url": "/assets/products/supplier-20261014/sebamed_repair_conditioner.jpg",
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
    "sku": "PS-AC-6110FE43DDE2",
    "name": "Unident Kids Toothpaste 1000 ppm — 50 ml",
    "family_id": "PSC-IS-185",
    "image_url": "/assets/products/supplier-20261014/unident_kids_toothpaste_1000_ppm_50_ml.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-4EDF32469B8D",
    "name": "Unident Pharma Ortho Smile Care Toothpaste — 75 ml",
    "family_id": "PSC-IS-185",
    "image_url": "/assets/products/supplier-20261014/unident_pharma_ortho_smile_care_toothpaste_75_ml.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-8CBD36F03D69",
    "name": "Unident Pharma Perio Care Toothpaste — 75 ml",
    "family_id": "PSC-IS-185",
    "image_url": "/assets/products/supplier-20261014/unident_pharma_perio_care_toothpaste_75_ml.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-1F1419E1172D",
    "name": "Vitane Liquid Vitamins + Minerals — 200 ml",
    "family_id": "PSC-IS-188",
    "image_url": "/assets/products/supplier-20261014/vitane_liquid_vitamins_plus_minerals_200_ml.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-E204E9A3DB72",
    "name": "Wegovy Semaglutide 0.25 mg Prefilled Pen",
    "family_id": "PSC-IS-179",
    "image_url": "/assets/products/supplier-20261014/wegovy_semaglutide_0_25_mg_prefilled_pen.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-C78EE225849D",
    "name": "Wegovy Semaglutide 0.5 mg Prefilled Pen",
    "family_id": "PSC-IS-179",
    "image_url": "/assets/products/supplier-20261014/wegovy_semaglutide_0_5_mg_prefilled_pen.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-0EFF9E2AC288",
    "name": "Wegovy Semaglutide 1 mg Prefilled Pen",
    "family_id": "PSC-IS-179",
    "image_url": "/assets/products/supplier-20261014/wegovy_semaglutide_1_mg_prefilled_pen.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-1739D7036B10",
    "name": "Wegovy Semaglutide 1.7 mg Prefilled Pen",
    "family_id": "PSC-IS-179",
    "image_url": "/assets/products/supplier-20261014/wegovy_semaglutide_1_7_mg_prefilled_pen.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-643A0525B55C",
    "name": "Wegovy Semaglutide 2.4 mg Prefilled Pen",
    "family_id": "PSC-IS-179",
    "image_url": "/assets/products/supplier-20261014/wegovy_semaglutide_2_4_mg_prefilled_pen.jpg",
    "source": "Supplier product photograph; supplied 6 October 2026",
    "review": "Supplier-mapped product identity and visible brand/form reviewed; quotation confirms exact pack"
  },
  {
    "sku": "PS-AC-E015B822E20F",
    "name": "Zecuf Herbal Cough Remedy — 100 ml",
    "family_id": "PSC-IS-126",
    "image_url": "/assets/products/supplier-20261014/zecuf_herbal_cough_remedy_100_ml.jpg",
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
    "sku": "PS-AC-02A4FF962422",
    "name": "K-FLAM 50MG TAB 20'S",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/034-k-flam-50mg-tab-20-s.jpg",
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
    "sku": "PS-AC-8D0A1B46D7AE",
    "name": "PUMPINOX 40MG TAB 14'S",
    "family_id": "PSC-IS-122",
    "image_url": "/assets/products/acorus-2026-10/037-pumpinox-40mg-tab-14-s.jpg",
    "source": "public exact product listing",
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
    "sku": "PS-AC-894A608A56AE",
    "name": "RINOCLENIL 100MCG NASAL SPRAY",
    "family_id": "",
    "image_url": "/assets/products/acorus-2026-10/224-rinoclenil-100mcg-nasal-spray.jpg",
    "source": "existing web match",
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
  }
];
 const refresh=window.PS_CATALOGUE_REFRESH;
 if(!refresh)return;
 for(const r of rows){
  const p=refresh.products.find(p=>p.pscSku===r.sku&&p.name===r.name&&String(p.catalogueParentId||p.catalogueReferenceFamilyId||'')===r.family_id);
  if(!p||/VERIFIED EXACT/.test(p.imageStatus||''))continue;
  Object.assign(p,{currentImageUrl:r.image_url,imageUrl:r.image_url,image_url:r.image_url,imageStatus:'SOURCE IMAGE AVAILABLE — PRODUCT PHOTO REVIEWED',imageIdentityReviewed:true,imageSource:r.source,imageVerification:r.review});
  for(const o of refresh.approvedOptions){
   if(o.sku===r.sku&&o.exact_product_name===r.name&&o.family_id===r.family_id){o.image_url=r.image_url;o.image_status=p.imageStatus;o.image_pending=false;}
  }
 }
 window.PSC_IMAGE_RELEASE=Object.freeze({date:'2026-10-14',rows:Object.freeze(rows)});
})();
