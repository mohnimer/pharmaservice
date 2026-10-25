/* Purchasing view helpers. Existing catalogue, request schema and server permissions remain authoritative. */
(() => {
 'use strict';
 const copy=x=>JSON.parse(JSON.stringify(x));
 const numeric=x=>x!==null&&x!==undefined&&x!==''&&Number.isFinite(Number(x))?Number(x):null;
 const issued=q=>q&&['sent','confirmed','cancelled','expired'].includes(q.status);
 function withoutOldCommercial(value){
  if(Array.isArray(value))return value.map(withoutOldCommercial);
  if(!value||typeof value!=='object')return value;
  return Object.fromEntries(Object.entries(value).filter(([key])=>!/^verified_price|^supplier_(stock|mrp)|^acorus(Mrp|Stock|Indicative)/i.test(key)).map(([k,v])=>[k,withoutOldCommercial(v)]));
 }
 function repeatLine(line,product,sourceId){
  const next=withoutOldCommercial(copy(line));
  next.repeatSource=sourceId;next.repeatNotice='New request: availability, price and exact specification will be reconfirmed.';
  if(line.familyId){
   // An old database option is a reference until revalidated, never an automatic foreign key.
   if(next.productOptionId){next.historicalOptionId=next.productOptionId;next.productOptionSnapshot={...(next.productOptionSnapshot||{}),historical_product_option_id:next.productOptionId,reference_only:true};next.productOptionId='';next.brandPreferenceMode='other_brand';next.requestedBrand=next.productOptionSnapshot?.exact_product_name||next.requestedBrand||'Previously requested option';}
   return next;
  }
  if(line.kind==='unlisted'){next.requestId='repeat-'+crypto.randomUUID();return next;}
  const historical=line.lineSnapshot||{name:line.sku||'Previously requested item',pack:'',brand:''};
  const changed=product&&(historical.name!==product.name||historical.pack!==String(product.pack||''));
  const unavailable=!product||product.catalogueVisible===false||product.workbookDecision==='ENQUIRY ONLY'||window.PS_CATALOGUE_STOCK?.forProduct(product)?.availability_status==='out_of_stock';
  if(changed||unavailable)return {kind:'unlisted',requestId:'repeat-'+crypto.randomUUID(),description:historical.name||'Previously requested item',requestUnit:historical.pack||'',qty:line.qty,repeatSource:sourceId,historicalSku:line.sku,lineSnapshot:historical,repeatNotice:'Original reference '+line.sku+'. '+(changed?'The catalogue identity or pack has changed.':'Current selectable supply is unavailable or unconfirmed.')+' Source this exact requirement; no replacement selected.'};
  return {...next,lineSnapshot:historical};
 }
 const groupScope=c=>!!c&&!c.isPscAdmin&&c.schools?.length>1&&c.memberships?.some(m=>m.group_id===c.group?.id&&!m.school_id&&['group_admin','psc_admin'].includes(m.role));
 // Only the already deployed named AEG decision route is exposed. No authority inferred from visibility.
 const canDecide=c=>c?.group?.slug==='aeg-education'&&c.memberships?.some(m=>m.school_id===c.school?.id&&m.role==='management_approver');
 function quoteView(q,lines){
  const rows=issued(q)?(lines||[]).filter(l=>l.quote_id===q.id).map(l=>({name:l.line_description_snapshot||'Specification pending',sku:l.psc_sku_snapshot||'',brand:l.brand_model_snapshot||'',pack:l.pack_snapshot||'Pack pending',spec:l.specification_snapshot||'',qty:numeric(l.quantity),sell:numeric(l.unit_sell_price_ex_vat),vat:numeric(l.vat_rate_pct),note:l.customer_note||''})):[];
  const complete=rows.length>0&&rows.every(r=>r.qty!==null&&r.qty>0&&r.sell!==null&&r.sell>=0&&r.vat!==null&&r.vat>=0);
  const cents=x=>Math.round((x+1e-8)*100)/100;
  const subtotal=complete?cents(rows.reduce((s,r)=>s+r.qty*r.sell,0)):null;
  const vat=complete?cents(rows.reduce((s,r)=>s+cents(r.qty*r.sell*r.vat/100),0)):null;
  return {rows,complete,subtotal,vat,total:complete?cents(subtotal+vat):null};
 }
 function decisionGate(context,request,now=Date.now()){
  const q=request?.quote?.issued,view=quoteView(q,request?.quote?.issuedLines);
  if(!canDecide(context))return {ok:false,reason:'Use your institution’s agreed PO or written authorization process.'};
  if(request.status!=='Sent'||q?.status!=='sent'||request.quote.management_decision)return {ok:false,reason:'This quotation is not awaiting a new decision.'};
  if(!q.id||!Number.isInteger(Number(q.current_revision))||Number(q.current_revision)<1)return {ok:false,reason:'The issued revision is missing. Ask PSC to confirm it.'};
  if(!q.expires_at||!Number.isFinite(Date.parse(q.expires_at)))return {ok:false,reason:'Quotation validity is not recorded. Ask PSC to confirm it.'};
  const expiry=/^\d{4}-\d{2}-\d{2}$/.test(q.expires_at)?Date.parse(q.expires_at+'T23:59:59.999+04:00'):Date.parse(q.expires_at);
  if(expiry<now)return {ok:false,reason:'This quotation has expired. Ask PSC for a current revision.'};
  if(!view.complete||view.rows.some(r=>r.name==='Specification pending'||r.pack==='Pack pending'))return {ok:false,reason:'Exact quotation lines or packs are incomplete. Confirm the issued document with PSC.'};
  return {ok:true,quoteId:q.id,revision:Number(q.current_revision)};
 }
 function latestQuote(quotes,orderId){
  return (quotes||[]).filter(q=>q.order_id===orderId&&issued(q)).sort((a,b)=>(Date.parse(b.sent_at)||0)-(Date.parse(a.sent_at)||0)||Number(b.current_revision||0)-Number(a.current_revision||0)||String(b.id).localeCompare(String(a.id)))[0]||null;
 }
 const statusLabel=s=>({Drafting:'Request under review',Sent:'Quotation issued',Authorized:'Order confirmed',Procurement:'Procurement in progress',Delivery:'Out for delivery',Accepted:'Delivered',Cancelled:'Cancelled'})[s]||'Status needs confirmation';
 function journey(request){
  const r=request||{},q=r.quote?.issued;
  return [{label:'Request',detail:r.id?'Reference '+r.id:'Not recorded'},
   {label:'Quotation',detail:issued(q)?'Issued revision '+(q.current_revision||'not recorded'):'Not issued'},
   {label:'Authorization',detail:r.quote?.management_decision?'Recorded decision: '+r.quote.management_decision:(r.documents||[]).some(d=>['customer_po','approval'].includes(d.document_type))?'Document attached; PSC verification required':'No authorization evidence shown'},
   {label:'Order',detail:r.databaseStatus==='archived'?'Archived record':statusLabel(r.status)},
   {label:'Documents',detail:(r.documents||[]).length+' attached file'+((r.documents||[]).length===1?'':'s')}];
 }
 window.PSC_BUYER_JOURNEY=Object.freeze({repeatLine,withoutOldCommercial,numeric,issued,groupScope,canDecide,quoteView,decisionGate,latestQuote,statusLabel,journey});
})();
