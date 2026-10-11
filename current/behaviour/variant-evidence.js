(() => {
  'use strict';
  // Release-approved variant evidence only. No family/brand/pack guessing.
  const records = Array.isArray(window.PSC_VERIFIED_VARIANTS) ? window.PSC_VERIFIED_VARIANTS : [];
  const norm = x => String(x ?? '').normalize('NFKC').trim().replace(/\s+/g,' ').toUpperCase();
  const approved = new Map(), collisions = new Set();
  const valid = r => r && r.release_status === 'APPROVED' &&
    r.image_verified === true && r.description_verified === true && r.price_verified === true &&
    r.family_id && r.product_option_id && r.exact_product_name && r.brand && r.pack &&
    r.image_url && r.image_source && r.description && Number(r.price_aed) > 0 &&
    ['PUBLIC_RETAIL_BENCHMARK','PSC_CUSTOMER_PRICE'].includes(r.price_type) &&
    r.price_source && r.price_checked_at && r.price_unit;
  for (const r of records) {
    if (!valid(r)) continue;
    const key = String(r.family_id) + '|' + String(r.product_option_id);
    if (approved.has(key)) collisions.add(key); else approved.set(key,r);
  }
  for (const key of collisions) approved.delete(key);
  window.PSC_VARIANT_EVIDENCE_FOR = (o, familyId) => {
    if (!o?.product_option_id) return null;
    const r = approved.get(String(familyId)+'|'+String(o.product_option_id));
    if (!r || norm(r.exact_product_name)!==norm(o.exact_product_name) ||
        norm(r.brand)!==norm(o.brand) || norm(r.pack)!==norm(o.pack)) return null;
    return r;
  };
  window.PSC_VARIANT_APPLY_OPTIONS = (options, familyId) =>
    (Array.isArray(options)?options:[]).map(o=>{
      const r=window.PSC_VARIANT_EVIDENCE_FOR(o,familyId);
      if (!r) return o;
      return {...o, image_url:r.image_url, image_source:r.image_source,
        verified_description:r.description, verified_price_aed:Number(r.price_aed),
        verified_price_type:r.price_type, verified_price_unit:r.price_unit,
        verified_price_source:r.price_source, verified_price_checked_at:r.price_checked_at};
    });
  window.PSC_VARIANT_EVIDENCE_STATUS = Object.freeze({
    supplied:records.length, approved:approved.size, rejected:records.length-approved.size, collisions:collisions.size
  });
})();