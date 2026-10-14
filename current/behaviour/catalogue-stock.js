(() => {
 'use strict';
 const control=window.PSC_CATALOGUE_CONTROL;if(!control)return;
 const norm=x=>String(x||'').normalize('NFKC').trim().replace(/\s+/g,' ').toUpperCase();
 const bySku=new Map(control.products.map(r=>[r.sku,r]));
 const products=()=>window.PSC_DATA?.products||[];
 const id=p=>p?.catalogueParentId||p?.catalogueReferenceFamilyId||p?.pscSku;
 const current=r=>r&&r.in_stock===true&&(!r.expiry_date||r.expiry_date>=control.stock_date);
 const price=r=>current(r)&&Number(r.mrp_aed)>0?Number(r.mrp_aed):null;
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
 const realPhoto=p=>!!p?.currentImageUrl&&(p.imageIdentityReviewed===true||/VERIFIED EXACT|SOURCE IMAGE AVAILABLE|EXISTING PRODUCT PHOTOGRAPH/.test(p.imageStatus||''))&&!/reference|clinical-icons|clinic-basics|inst-\d+|pill/i.test(p.currentImageUrl);
 const rank=p=>Number(/VERIFIED EXACT/.test(p.imageStatus||''))*100+Number(realPhoto(p))*20+Number(current(forProduct(p)))*10;
 function representative(rows){return [...rows].sort((a,b)=>rank(b)-rank(a)||String(a.pscSku).localeCompare(String(b.pscSku)))[0]||null;}
 function groups(rows){
  const map=new Map();
  for(const p of rows||[]){const key=id(p);if(!map.has(key))map.set(key,[]);map.get(key).push(p);}
  return [...map].map(([family,members])=>{
   const hero=representative(members),name=control.products.find(r=>r.family_id===family)?.family_name||hero.name;
   return {...hero,_familyGroup:{id:family,name,members,representativeSku:hero.pscSku}};
  });
 }
 function optionsForFamily(options,family){
  const rows=[...(options||[])];
  for(const p of products().filter(p=>id(p)===family&&forProduct(p)?.source_kind==='product'&&forProduct(p)?.catalogue_visible)){
   if(rows.some(o=>norm(o.exact_product_name)===norm(p.name)&&norm(o.brand)===norm(p.brand)&&norm(o.pack)===norm(p.pack)))continue;
   rows.push({product_option_id:p.product_option_id||'local-catalogue-'+p.pscSku,family_id:family,exact_product_name:p.name,brand:p.brand||'',pack:p.pack||'',presentation:'',sku:p.pscSku,local_reference:true,image_url:realPhoto(p)?p.currentImageUrl:null,image_pending:!realPhoto(p)});
  }
  return rows.map(o=>{
   const r=forOption(o,family);if(!r?.acorus_managed)return o;
   return {...o,supplier_stock_date:control.stock_date,supplier_stock_status:current(r)?'In stock':'Quotation required',supplier_mrp_aed:price(r),supplier_mrp_source:control.report_name,
    verified_price_aed:price(r),verified_price_type:price(r)?'SUPPLIER_RETAIL_MRP':null,
    verified_price_source:price(r)?control.report_name:null,verified_price_checked_at:price(r)?control.stock_date:null,
    verified_price_vat_basis:'VAT basis not supplied in stock report',
    verified_price_note:price(r)?'Retail MRP; wholesale quotation separate':'Request quotation; no current matched stocked MRP'};
  });
 }
 for(const p of products()){
  const r=forProduct(p);if(!r)continue;
  p.catalogueVisible=r.catalogue_visible;
  if(r.acorus_managed){p.acorusStockDate=control.stock_date;p.acorusStockAvailable=current(r);p.acorusMrp=price(r);}
 }
 window.PS_CATALOGUE_STOCK=Object.freeze({revision:control.revision,stockDate:control.stock_date,reportName:control.report_name,forProduct,forOption,current,price,hasFamily,realPhoto,representative,groups,optionsForFamily});
})();
