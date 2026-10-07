(() => {
  'use strict';
  const refresh = window.PS_CATALOGUE_REFRESH;
  const data = window.PSC_DATA;
  if (!refresh || !Array.isArray(data?.products)) return;
  const referenceTile = row => /^REFERENCE TILE/i.test(row.imageStatus || row.image_status || '');
  // Reference graphics are not pack photography. Keep their frame empty in every view.
  for (const row of refresh.products) {
    if (referenceTile(row)) Object.assign(row, {currentImageUrl:null, imageUrl:null, image_url:null});
  }
  const bySku = new Map(data.products.map(p => [p.pscSku, p]));
  for (const row of refresh.products) {
    const current = bySku.get(row.pscSku);
    if (current) Object.assign(current, row);
    else { data.products.push({...row}); bySku.set(row.pscSku, data.products.at(-1)); }
  }
  for (const image of refresh.retainedImages) {
    const product = bySku.get(image.pscSku);
    if (product && !product.currentImageUrl) Object.assign(product, image);
  }
  refresh.approvedOptions = refresh.approvedOptions.map(option => ({...option,
    image_url: referenceTile(option) ? null : bySku.get(option.sku)?.currentImageUrl || option.image_url
  }));
  const catalogue = window.PSC_FAMILY_CATALOGUE_V39;
  if (catalogue) {
    const existing = new Map(catalogue.families.map(f => [f.familyId, f]));
    catalogue.families = refresh.families.map(f => ({...f,
      // Draft workbook formats must not introduce a new mandatory configuration step.
      // Exact approved options already carry their presentation and pack.
      presentations: existing.get(f.familyId)?.presentations || []
    }));
  }
  // DB rows retain their commercial authority; local records supply new identities.
  refresh.mergeFamilies = (databaseRows, fallbackRows) => {
    const rows = new Map(fallbackRows.map(r => [r.family_id, r]));
    for (const row of databaseRows || []) rows.set(row.family_id, {...rows.get(row.family_id), ...row});
    return [...rows.values()];
  };
  refresh.mergeOptions = (databaseRows, familyId = null) => {
    const identity = r => String(r.exact_product_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const productIdentity = new Map();
    for (const product of refresh.products) {
      for (const name of [product.name, product.sourceProductName]) {
        productIdentity.set(identity({exact_product_name:name}), bySku.get(product.pscSku));
      }
    }
    const rows = (databaseRows || []).map(row => {
      const product = productIdentity.get(identity(row));
      return product ? {...row, image_url:referenceTile(product) ? null : product.currentImageUrl || row.image_url,
        image_status:product.imageStatus, image_pending:!product.currentImageUrl} : row;
    });
    const seen = new Set(rows.map(r => r.family_id + ':' + identity(r)));
    for (const row of refresh.approvedOptions) {
      if (familyId && row.family_id !== familyId) continue;
      const key = row.family_id + ':' + identity(row);
      if (!seen.has(key)) { rows.push(row); seen.add(key); }
    }
    return rows;
  };
})();
