(() => {
 'use strict';
 const control=window.PSC_CATALOGUE_CONTROL;if(!control)return;
 const norm=x=>String(x||'').normalize('NFKC').trim().replace(/\s+/g,' ').toUpperCase();
 const bySku=new Map(control.products.map(r=>[r.sku,r]));
 const products=()=>window.PSC_DATA?.products||[];
 const id=p=>p?.catalogueParentId||p?.catalogueReferenceFamilyId||p?.pscSku;
 const current=r=>r&&r.in_stock===true&&(!r.availability_status||r.availability_status==='in_stock')&&(!r.expiry_date||r.expiry_date>=control.stock_date);
 const price=r=>current(r)&&Number(r.mrp_aed)>0?Number(r.mrp_aed):null;
 const discount=Number(control.price_policy?.discount_rate);
 const hasDiscount=control.price_policy?.basis==='CURRENT_EXACT_STOCK_MRP'&&Number.isFinite(discount)&&discount>0&&discount<1;
 // Calculate in integer fils/basis points so .005 rounds identically to Excel ROUND.
 const indicativePrice=r=>{const mrp=price(r);return mrp===null?null:hasDiscount?Math.round(Math.round(mrp*100)*Math.round((1-discount)*10000)/10000)/100:mrp;};
 const status=r=>current(r)?'in_stock':r?.availability_status==='out_of_stock'||r?.expiry_date&&r.expiry_date<control.stock_date?'out_of_stock':'unconfirmed';
 const statusLabel=r=>({in_stock:'In stock',out_of_stock:'Out of stock',unconfirmed:'Availability unconfirmed'})[status(r)];
 const priceLabel=hasDiscount?'Approx. PSC price':'Retail MRP';
 const forProduct=p=>bySku.get(typeof p==='string'?p:p?.pscSku)||null;
 function forOption(o,family){
  if(o?.sku&&bySku.has(o.sku)){
   const r=bySku.get(o.sku);
   if(norm(r.family_id)===norm(family)&&norm(r.name)===norm(o.exact_product_name)&&norm(r.brand)===norm(o.brand)&&norm(r.pack)===norm(o.pack))return r;
  }
  const matches=control.products.filter(r=>norm(r.family_id)===norm(family)&&norm(r.name)===norm(o?.exact_product_name)&&norm(r.brand)===norm(o?.brand)&&norm(r.pack)===norm(o?.pack));
  return matches.length===1?matches[0]:null;
 }
 const hasFamily=family=>control.products.some(r=>r.family_id===family&&r.acorus_managed);
 const realPhoto=p=>!window.PSC_DHA_FAMILY_PHOTOS?.isMixedPhoto(p)&&!!(window.PSC_IMAGE_POLICY?window.PSC_IMAGE_POLICY.resolve(p?.currentImageUrl):p?.currentImageUrl)&&(p.imageIdentityReviewed===true||/VERIFIED EXACT|SOURCE IMAGE AVAILABLE|EXISTING PRODUCT PHOTOGRAPH/.test(p.imageStatus||''))&&!/reference|clinical-icons|clinic-basics|inst-\d+|pill/i.test(p.currentImageUrl);
 const rank=p=>Number(/VERIFIED EXACT/.test(p.imageStatus||''))*100+Number(realPhoto(p))*20+Number(current(forProduct(p)))*10;
 function representative(rows){return [...rows].sort((a,b)=>rank(b)-rank(a)||String(a.pscSku).localeCompare(String(b.pscSku)))[0]||null;}
 function groups(rows){
  if(window.PSC_STOREFRONT_GROUPS){
   const curated=window.PSC_STOREFRONT_GROUPS.curate(rows,window.PSC_STOREFRONT_BRAND_CHOICES||[]);
   return window.PSC_STOREFRONT_GROUPS.groups(curated,forProduct,representative);
  }
  const map=new Map();
  for(const p of rows||[]){const key=id(p);if(!map.has(key))map.set(key,[]);map.get(key).push(p);}
  return [...map].map(([family,members])=>{
   const hero=representative(members),name=control.products.find(r=>r.family_id===family)?.family_name||hero.name;
   return {...hero,_familyGroup:{id:family,name,members,representativeSku:hero.pscSku}};
  });
 }
 const groupForProduct=p=>{
  const key=window.PSC_STOREFRONT_GROUPS?.identity(p,forProduct(p)||p).key;
  return key?groups(products()).find(g=>g._familyGroup.id===key)||null:null;
 };
 function optionsForFamily(options,family){
  const rows=[...(options||[])];
  for(const p of products().filter(p=>id(p)===family&&forProduct(p)?.source_kind==='product'&&forProduct(p)?.catalogue_visible)){
   if(rows.some(o=>norm(o.exact_product_name)===norm(p.name)&&norm(o.brand)===norm(p.brand)&&norm(o.pack)===norm(p.pack)))continue;
   rows.push({product_option_id:p.product_option_id||'local-catalogue-'+p.pscSku,family_id:family,exact_product_name:p.name,brand:p.brand||'',pack:p.pack||'',presentation:'',sku:p.pscSku,local_reference:true,image_url:realPhoto(p)?p.currentImageUrl:null,image_pending:!realPhoto(p)});
  }
  return rows.map(o=>{
   const r=forOption(o,family);if(!r?.acorus_managed)return o;
   return {...o,supplier_stock_date:control.stock_date,supplier_stock_status:statusLabel(r),supplier_mrp_aed:price(r),supplier_mrp_source:control.report_name,
    verified_price_aed:indicativePrice(r),verified_price_type:price(r)?(hasDiscount?'PSC_INDICATIVE_MRP_DISCOUNT':'SUPPLIER_RETAIL_MRP'):null,
    verified_price_source:price(r)?control.report_name:null,verified_price_checked_at:price(r)?control.stock_date:null,
    verified_price_vat_basis:'VAT basis not supplied in stock report',
    verified_price_note:price(r)?(hasDiscount?'Approximate PSC price: 15% below MRP; final price and VAT confirmed in quotation':'Retail MRP; wholesale quotation separate'):'Request quotation; no current matched stocked MRP'};
  });
 }
 for(const p of products()){
  const r=forProduct(p);if(!r)continue;
  p.catalogueVisible=r.catalogue_visible;
  if(r.acorus_managed){p.acorusStockDate=control.stock_date;p.acorusStockAvailable=current(r);p.acorusMrp=price(r);p.acorusIndicativePrice=indicativePrice(r);p.acorusStockStatus=statusLabel(r);}
 }
 window.PS_CATALOGUE_STOCK=Object.freeze({revision:control.revision,stockDate:control.stock_date,reportName:control.report_name,forProduct,forOption,current,price,indicativePrice,status,statusLabel,hasDiscount,priceLabel,hasFamily,realPhoto,representative,groups,groupForProduct,optionsForFamily});
})();
