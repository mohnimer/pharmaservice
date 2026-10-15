(()=>{
 'use strict';
 const data=window.PSC_VARIANT_PHOTOGRAPHS;if(!data)return;
 const norm=v=>String(v??'').normalize('NFKC').trim().replace(/\s+/g,' ').toUpperCase();
 const records=new Map(data.records.map(r=>[r.family_id+'|'+r.product_option_id,r]));
 const local=new Map(data.records.filter(r=>r.sku).map(r=>[r.sku,r]));
 const rejected=new Map((data.rejected||[]).map(r=>[r.sku,r]));
 const same=(r,o)=>r&&norm(r.exact_product_name)===norm(o.exact_product_name)&&norm(r.brand)===norm(o.brand)&&norm(r.pack)===norm(o.pack);
 const image=r=>window.PSC_IMAGE_POLICY?.resolve(r.image_url)??r.image_url;
 function forOption(o,family){
  const r=records.get(family+'|'+o?.product_option_id);
  return same(r,o)&&r.reviewed&&image(r)?r:null;
 }
 function apply(options,family){return (options||[]).map(o=>{
  const r=forOption(o,family);if(r)return {...o,image_url:image(r),image_source:r.source,image_pending:false,image_identity_reviewed:true};
  const sku=o.sku||String(o.product_option_id||'').replace(/^local-catalogue-/,'');
  const bad=rejected.get(sku);
  if(bad&&norm(bad.name)===norm(o.exact_product_name))return {...o,image_url:null,image_pending:true,image_identity_reviewed:false};
  const p=local.get(sku);
  return p?.family_id===family&&same(p,o)?{...o,image_url:image(p),image_source:p.source,image_pending:false,image_identity_reviewed:true}:o;
 });}
 for(const p of window.PSC_DATA?.products||[]){
  const r=local.get(p.pscSku);
  if(r&&same(r,{exact_product_name:p.name,brand:p.brand,pack:p.pack})){
   Object.assign(p,{currentImageUrl:image(r),imageUrl:image(r),imageSource:r.source,imageIdentityReviewed:true,imageStatus:r.pack_confirmed?'VERIFIED EXACT PRODUCT PHOTOGRAPH':'REVIEWED PRODUCT PHOTOGRAPH; PACK TO CONFIRM'});
  }else if(rejected.has(p.pscSku)&&norm(rejected.get(p.pscSku).name)===norm(p.name)){
   Object.assign(p,{currentImageUrl:null,imageUrl:null,imageIdentityReviewed:false,imageStatus:'PHOTO WITHDRAWN: PRODUCT OR PACK MISMATCH'});
  }
 }
 const stock=window.PS_CATALOGUE_STOCK;
 if(stock)window.PS_CATALOGUE_STOCK=Object.freeze({...stock,optionsForFamily:(options,family)=>apply(stock.optionsForFamily(options,family),family)});
 window.PSC_VARIANT_PHOTO_FOR=forOption;
 window.PSC_VARIANT_PHOTO_APPLY=apply;
})();
