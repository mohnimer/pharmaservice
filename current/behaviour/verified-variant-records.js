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
  }];
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
