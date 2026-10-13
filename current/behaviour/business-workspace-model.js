/* Operational projections only. No email send, order approval, accounting entry or price write. */
(()=>{
 'use strict';
 const stages={prospect:'First contact',discovery:'Understand the need',requirements:'Requirements received',quoting:'Prepare quotation',awaiting_decision:'Follow up quotation',proceeding:'Customer proceeding',closed_won:'Closed — proceeding',closed_lost:'Closed — not proceeding'};
 const closed=o=>['closed_won','closed_lost'].includes(o.stage);
 const day=(s,n)=>{const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
 const hasAmount=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
 function orderQueue(orders,quotes,controls,date){return orders.filter(o=>!['cancelled','closed'].includes(o.status)).map(o=>{
  const q=quotes.filter(q=>q.order_id===o.id).sort((a,b)=>Number(b.current_revision||0)-Number(a.current_revision||0)||String(b.created_at||'').localeCompare(String(a.created_at||'')))[0],c=controls.find(c=>c.order_id===o.id)||{};
  if(o.status==='delivered')return {order:o,kind:'service',action:'Review delivery and plan the next requirement',quote:q};
  if(q?.status==='sent'||o.status==='quote_sent')return {order:o,kind:'decision',action:q?.expires_at?.slice(0,10)<date?'Refresh the expired quotation before following up':'Follow up the quotation and record the customer’s decision',quote:q};
  if(['confirmed','under_process','authorized','procurement','delivery'].includes(o.status))return {order:o,kind:!c.authorization_ref||!c.receipt_ref&&!c.credit_approval_ref?'cash':'delivery',action:!c.authorization_ref?'Record the customer’s written authorization':!c.receipt_ref&&!c.credit_approval_ref?'Check the agreed funding and record payment evidence':!c.supplier_po_ref?'Check commercial release and supplier acknowledgement':!c.dispatch_ref?'Confirm delivery timing and dispatch documentation':!c.acceptance_ref?'Record delivery acceptance and resolve outstanding items':'Review the completed order and next supply requirement',quote:q};
  return {order:o,kind:'quote',action:'Clarify specifications, verify costs and prepare the quotation',quote:q};
 });}
 function careSuggestions(orders,tasks,date){return orders.filter(o=>o.status==='delivered'&&o.delivered_at).flatMap(o=>[7,30].map(n=>({order_id:o.id,source_rule:'service_day'+n,due_date:day(o.delivered_at.slice(0,10),n),title:n===7?'Check delivery satisfaction — '+o.order_number:'Review consumption and agree the next requirement — '+o.order_number,description:n===7?'Confirm the supplied items and documents meet expectations. Record missing items or defects and the next customer update.':'Ask for actual consumption and current requirements. Agree the next replenishment date with the clinic; prepare a quotation for any requested supply.'}))).filter(s=>s.due_date<=date&&!tasks.some(t=>t.order_id===s.order_id&&t.source_rule===s.source_rule));}
 function pipeline(opportunities){const open=opportunities.filter(o=>!closed(o)),known=open.filter(o=>hasAmount(o.estimated_value_ex_vat));return {open:open.length,known:known.length,unknown:open.length-known.length,value:known.reduce((n,o)=>n+Number(o.estimated_value_ex_vat),0)};}
 const api={stages,closed,day,orderQueue,careSuggestions,pipeline,hasAmount};window.PSC_BUSINESS_MODEL=Object.freeze(api);
 if(typeof module!=='undefined')module.exports=api;
})();
