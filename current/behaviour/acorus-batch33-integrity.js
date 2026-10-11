(() => {
  'use strict';
  // Exact family and exact Acorus master SKU identity only. No fuzzy substitutions.
  const normalize = value => String(value || '').normalize('NFKC').trim().toUpperCase().replace(/\s+/g, ' ');
  const imagePath = /^\/assets\/acorus-batch-33\/[a-z0-9_]+\.webp$/;
  const records = Array.isArray(window.PSC_ACORUS_BATCH_33) ? window.PSC_ACORUS_BATCH_33 : [];
  const approved = new Map();
  const collisions = new Set();
  for (const record of records) {
    if (!record?.existing_master_product || record.photo_identity_status !== 'SOURCE PACK CLAIMS CONFIRMED' ||
        record.pack_spec_status !== 'CONFIRMED FROM FRONT PACK / EXISTING SOURCE' ||
        !imagePath.test(record.website_image_path)) continue;
    const key = `${record.psc_family_id}|${normalize(record.existing_master_product)}`;
    if (approved.has(key)) collisions.add(key);
    else approved.set(key, record);
  }
  for (const key of collisions) approved.delete(key);
  window.PSC_ACORUS_ATTACH_OPTIONS = (options, familyId) => {
    if (!Array.isArray(options)) return options;
    return options.map(option => {
      const record = approved.get(`${familyId}|${normalize(option.exact_product_name)}`);
      if (!record) return option;
      return {...option, image_url:record.website_image_path,
        image_source:'Acorus Batch 33; source front-pack claim; review before public release'};
    });
  };
  window.PSC_ACORUS_IMAGE_STATUS = Object.freeze({
    sourceRecords:records.length,exactMappedCandidates:approved.size,duplicateKeys:collisions.size
  });
})();