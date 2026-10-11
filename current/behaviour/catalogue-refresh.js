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
    const norm = value => String(value || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toUpperCase();
    const family = r => r.family_id || r.catalogueParentId || r.catalogueReferenceFamilyId || '';
    const key = (id, name) => norm(id) + '|' + norm(name);
    const identity = r => [norm(family(r)), norm(r.exact_product_name), norm(r.brand), norm(r.pack), r.local_reference?'LOCAL':r.reference_only?'REFERENCE':'DATABASE'].join('|');
    const productIdentity = new Map();
    const collisions = new Set();
    for (const product of refresh.products) {
      if (!family(product)) continue;
      for (const name of [product.name, product.sourceProductName]) {
        if (!name) continue;
        const id = key(family(product), name), existing = productIdentity.get(id);
        if (existing && existing.pscSku !== product.pscSku) collisions.add(id);
        else productIdentity.set(id, bySku.get(product.pscSku));
      }
    }
    for (const id of collisions) productIdentity.delete(id);
    const rows = (databaseRows || []).map(row => {
      const candidate = productIdentity.get(key(row.family_id, row.exact_product_name));
      const knownPack = value => norm(value) && !/CONFIRM|VERIFY|PENDING/.test(norm(value));
      const product = candidate && norm(candidate.brand) === norm(row.brand) &&
        !(knownPack(candidate.pack) && knownPack(row.pack) && norm(candidate.pack) !== norm(row.pack)) ? candidate : null;
      return product ? {...row, image_url:referenceTile(product) ? null : product.currentImageUrl || row.image_url,
        image_status:product.imageStatus, image_pending:!product.currentImageUrl} : row;
    });
    const seen = new Set(rows.map(identity));
    for (const row of refresh.approvedOptions) {
      if (familyId && row.family_id !== familyId) continue;
      const id = identity(row);
      if (!seen.has(id)) { rows.push(row); seen.add(id); }
    }
    return rows;
  };
})();
