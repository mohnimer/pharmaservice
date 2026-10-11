(() => {
  'use strict';
  // Individual evidence approval for the repair preview; overall release remains HOLD.
  const records = [{
    family_id:'PSC-IS-126', product_option_id:'local-acorus-ad974c05853f',
    psc_sku:'PS-AC-AD974C05853F', exact_product_name:'Prospan Cough Syrup — 100 ml',
    brand:'Prospan', pack:'100 ml bottle',
    description:'Prospan cough syrup with ivy leaf dry extract, 100 ml bottle.',
    image_url:'/assets/products/verified-20261011/prospan-100ml.jpg',
    image_source:'https://cdn.lifepharmacy.com/products/prospan-syrup-100-ml-bottle/110614-1.jpg',
    image_verified:true, description_verified:true, price_verified:true,
    price_aed:42, price_type:'PUBLIC_RETAIL_BENCHMARK', price_unit:'100 ml bottle',
    price_vat_basis:'Inclusive of VAT as displayed by retailer',
    price_source:'https://www.lifepharmacy.com/product/prospan-syrup-100-ml-bottle/',
    price_checked_at:'2026-10-11', release_status:'APPROVED'
  }, {
    family_id:'PSC-IS-148', product_option_id:'local-acorus-82eeffa2d41b',
    psc_sku:'PS-AC-82EEFFA2D41B', exact_product_name:'Bepanthen Protective Baby Ointment — 100 g',
    brand:'Bepanthen', pack:'100 g',
    description:'Bepanthen Protective Baby Ointment, 100 g pack for external use.',
    image_url:'/assets/products/verified-20261011/bepanthen-baby-ointment-100g.jpg',
    image_source:'https://cdn.lifepharmacy.com/products/bepanthen-ointment-100-g/121567-1.jpg',
    image_verified:true, description_verified:true, price_verified:true,
    price_aed:59, price_type:'PUBLIC_RETAIL_BENCHMARK', price_unit:'100 g',
    price_vat_basis:'Inclusive of VAT as displayed by retailer',
    price_source:'https://www.lifepharmacy.com/product/bepanthen-ointment-100-g',
    price_checked_at:'2026-10-11', release_status:'APPROVED'
  },
{
    "family_id": "PSC-IS-151",
    "product_option_id": "local-acorus-56cb26fe529b",
    "psc_sku": "PS-AC-56CB26FE529B",
    "exact_product_name": "Nexium 20 mg — 14 Tablets",
    "brand": "Nexium",
    "pack": "14 tablets",
    "description": "Nexium esomeprazole 20 mg tablets, pack of 14 tablets.",
    "description_source": "https://www.lifepharmacy.com/ae-ar/product/nexium-20mg-tab-14s-7s-blister-x-2",
    "image_url": "/assets/products/verified-20261011/nexium-20mg-14-tablets.jpg",
    "image_source": "https://cdn.lifepharmacy.com/products/nexium-20mg-tab-14s-7s-blister-x-2/108166-1.jpg",
    "image_verified": true,
    "description_verified": true,
    "price_verified": true,
    "price_aed": 78.5,
    "price_type": "PUBLIC_RETAIL_BENCHMARK",
    "price_unit": "14 tablets",
    "price_vat_basis": "Inclusive of VAT as displayed by retailer",
    "price_source": "https://www.lifepharmacy.com/ae-ar/product/nexium-20mg-tab-14s-7s-blister-x-2",
    "price_checked_at": "2026-10-11",
    "release_status": "APPROVED"
},
{
    "family_id": "PSC-IS-151",
    "product_option_id": "local-acorus-5ed2ff06e0af",
    "psc_sku": "PS-AC-5ED2FF06E0AF",
    "exact_product_name": "Nexium 40 mg — 14 Tablets",
    "brand": "Nexium",
    "pack": "14 tablets",
    "description": "Nexium esomeprazole 40 mg tablets, pack of 14 tablets.",
    "description_source": "https://www.lifepharmacy.com/product/nexium-40mg-tab-14s-7s-blister-x-2",
    "image_url": "/assets/products/verified-20261011/nexium-40mg-14-tablets.jpg",
    "image_source": "https://cdn.lifepharmacy.com/products/nexium-40mg-tab-14s-7s-blister-x-2/108168-1.jpg",
    "image_verified": true,
    "description_verified": true,
    "price_verified": true,
    "price_aed": 110,
    "price_type": "PUBLIC_RETAIL_BENCHMARK",
    "price_unit": "14 tablets",
    "price_vat_basis": "Inclusive of VAT as displayed by retailer",
    "price_source": "https://www.lifepharmacy.com/product/nexium-40mg-tab-14s-7s-blister-x-2",
    "price_checked_at": "2026-10-11",
    "release_status": "APPROVED"
},
{
    "family_id": "PSC-IS-098",
    "product_option_id": "local-acorus-4a24ef48aa96",
    "psc_sku": "PSC-MED-130",
    "exact_product_name": "IMODIUM 2MG CAP 6'S",
    "brand": "Imodium",
    "pack": "6 capsules",
    "description": "Imodium loperamide hydrochloride 2 mg capsules, pack of 6 capsules.",
    "description_source": "https://www.lifepharmacy.com/product/imodium-2mg-cap-hard-gelatin-6-s-blister",
    "image_url": "/assets/products/verified-20261011/imodium-2mg-6-capsules.jpg",
    "image_source": "https://cdn.lifepharmacy.com/products/imodium-2mg-cap-hard-gelatin-6-s-blister/111990-1.jpg",
    "image_verified": true,
    "description_verified": true,
    "price_verified": true,
    "price_aed": 6.5,
    "price_type": "PUBLIC_RETAIL_BENCHMARK",
    "price_unit": "6 capsules",
    "price_vat_basis": "Inclusive of VAT as displayed by retailer",
    "price_source": "https://www.lifepharmacy.com/product/imodium-2mg-cap-hard-gelatin-6-s-blister",
    "price_checked_at": "2026-10-11",
    "release_status": "APPROVED"
},
{
    "family_id": "PSC-IS-073",
    "product_option_id": "local-acorus-f8356dfd8db2",
    "psc_sku": "PSC-MED-003",
    "exact_product_name": "ZYRTEC 10MG TAB 20'S",
    "brand": "Zyrtec",
    "pack": "20 tablets",
    "description": "Zyrtec cetirizine dihydrochloride 10 mg film-coated tablets, pack of 20 tablets.",
    "description_source": "https://assets.gskstatic.com/pharma/PM-PI_portal/Lebanon/zyrtec_oral_drops_pil_lb.pdf",
    "image_url": "/assets/products/verified-20261011/zyrtec-10mg-20-tablets.jpg",
    "image_source": "https://cdn.lifepharmacy.com/products/zyrtec-10mg-tab-20s-10s-blister-x-2/117021-1.jpg",
    "image_verified": true,
    "description_verified": true,
    "price_verified": true,
    "price_aed": 39.5,
    "price_type": "PUBLIC_RETAIL_BENCHMARK",
    "price_unit": "20 tablets",
    "price_vat_basis": "Inclusive of VAT as displayed by retailer",
    "price_source": "https://www.lifepharmacy.com/product/zyrtec-10mg-tab-20s-10s-blister-x-2",
    "price_checked_at": "2026-10-11",
    "release_status": "APPROVED"
},
{
    "family_id": "PSC-IS-073",
    "product_option_id": "local-acorus-9d511aa6c569",
    "psc_sku": "PSC-MED-102",
    "exact_product_name": "ZYRTEC 1MG/ML ORAL SOLUTION 75ML",
    "brand": "Zyrtec",
    "pack": "75 ml",
    "description": "Zyrtec cetirizine dihydrochloride 1 mg/ml oral solution, 75 ml bottle.",
    "description_source": "https://assets.gskstatic.com/pharma/PM-PI_portal/Lebanon/zyrtec_oral_drops_pil_lb.pdf",
    "image_url": "/assets/products/verified-20261011/zyrtec-1mgml-75ml.jpg",
    "image_source": "https://cdn.lifepharmacy.com/products/zyrtec-1mg-ml-oral-sol-75ml-bot/117023-1.jpg",
    "image_verified": true,
    "description_verified": true,
    "price_verified": true,
    "price_aed": 17.5,
    "price_type": "PUBLIC_RETAIL_BENCHMARK",
    "price_unit": "75 ml",
    "price_vat_basis": "Inclusive of VAT as displayed by retailer",
    "price_source": "https://www.lifepharmacy.com/ae-ar/product/zyrtec-1mg-ml-oral-sol-75ml-bot",
    "price_checked_at": "2026-10-11",
    "release_status": "APPROVED"
}
  ];
  const norm = value => String(value || '').normalize('NFKC').trim().replace(/\s+/g,' ').toUpperCase();
  const eligible = (option, record) => option.product_option_id === record.product_option_id &&
    option.family_id === record.family_id && norm(option.exact_product_name) === norm(record.exact_product_name) &&
    norm(option.brand) === norm(record.brand) &&
    ['EXACT PACK TO CONFIRM',norm(record.pack)].includes(norm(option.pack));
  for (const record of records) {
    const options = window.PS_CATALOGUE_REFRESH?.approvedOptions || [];
    const matches = options.filter(option => eligible(option,record));
    if (matches.length !== 1) continue;
    const option = matches[0];
    Object.assign(option,{pack:record.pack,image_url:record.image_url,
      verified_description:record.description});
    // SKU, family, name and brand must also agree on the card record.
    for (const collection of [window.PSC_DATA?.products, window.PS_CATALOGUE_REFRESH?.products]) {
      for (const product of collection || []) {
        if (product.pscSku !== record.psc_sku ||
            product.catalogueParentId !== record.family_id ||
            norm(product.name) !== norm(record.exact_product_name) ||
            norm(product.brand) !== norm(record.brand)) continue;
        Object.assign(product,{product_option_id:record.product_option_id,
          pack:record.pack,cataloguePack:record.pack,currentImageUrl:record.image_url,
          imageUrl:record.image_url,verified_description:record.description});
      }
    }
  }
  window.PSC_VERIFIED_VARIANTS = [...(window.PSC_VERIFIED_VARIANTS || []),...records];
})();
