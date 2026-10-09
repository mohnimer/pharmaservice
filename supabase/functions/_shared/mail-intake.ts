import {check,MailError,email,MAILBOX} from './psc-mail.ts'
export function validateIntake(b:any){
 const text=(v:any,n:number)=>{if(typeof v!=='string'||v.length>n)throw new MailError('invalid_intake');return v.trim()};
 const data={customer_name:text(b.customer_name,200),institution:text(b.institution,300),customer_email:text(b.customer_email,254),source_text:text(b.source_text,100000),is_test:b.is_test===true,reviewed:b.reviewed===true,lines:[] as any[]};
 if(data.customer_email&&!email(data.customer_email))throw new MailError('invalid_customer_email');
 if(!Array.isArray(b.lines)||b.lines.length>100)throw new MailError('invalid_intake');
 data.lines=b.lines.map((l:any)=>{const x={id:text(l.id,80),original:text(l.original,2000),description:text(l.description,2000),quantity:l.quantity,unit:text(l.unit,100),specification:text(l.specification,2000),sku:text(l.sku,100),product_name:text(l.product_name,500),decision:text(l.decision,30)};
 if(!['pending','matched','sourcing','clarify','exclude'].includes(x.decision)||x.quantity!==null&&(typeof x.quantity!=='number'||!Number.isFinite(x.quantity)||x.quantity<=0||x.quantity>1000000))throw new MailError('invalid_intake');
 if(data.reviewed&&x.decision!=='exclude'&&(!x.description||x.decision!=='clarify'&&x.quantity===null||x.decision==='pending'||x.decision==='matched'&&!x.sku))throw new MailError('review_each_item');return x});
 if(data.reviewed&&(!data.lines.length||!data.customer_email||!data.institution))throw new MailError('customer_and_items_required');return data
}
export async function intakeAction(svc:any,user:any,b:any){
 if(b.action==='intake_source'){
 const m=check(await svc.from('psc_mail_messages').select('*').eq('id',b.message_id).eq('direction','inbound').single());
 const attachments=[];for(const a of m.attachments||[]){if(!a.object_path)continue;const signed=check(await svc.storage.from('psc-correspondence').createSignedUrl(a.object_path,120));attachments.push({...a,url:signed.signedUrl})}
 return {body_text:m.body_text,subject:m.subject,sender:m.sender,attachments};
 }
 if(b.action==='intake_save'){
 const d=validateIntake(b.data);if(!Number.isInteger(b.revision)||b.revision<0)throw new MailError('invalid_intake');
 const r=await svc.rpc('psc_save_mail_intake',{p_message_id:b.message_id,p_revision:b.revision,p_data:d,p_user:user.id});if(r.error)throw new MailError('intake_changed');return Array.isArray(r.data)?r.data[0]:r.data;
 }
 if(b.action==='intake_rfq'){
 const i=check(await svc.from('psc_mail_intakes').select('*').eq('message_id',b.message_id).single());
 if(!i.reviewed||i.revision!==b.revision)throw new MailError('review_current_intake');
 if(!email(b.recipient))throw new MailError('verified_supplier_required');if(i.is_test&&b.recipient.toLowerCase()!==MAILBOX)throw new MailError('test_recipient_locked');
 if(!Array.isArray(b.line_ids)||!b.line_ids.length||new Set(b.line_ids).size!==b.line_ids.length)throw new MailError('select_rfq_items');
 const lines=i.lines.filter((l:any)=>b.line_ids.includes(l.id));if(lines.length!==b.line_ids.length||lines.some((l:any)=>!['matched','sourcing'].includes(l.decision)))throw new MailError('resolve_selected_items');
 const ref='MAIL-'+i.message_id.slice(0,8).toUpperCase();
 const body=`Hello,\n\n${i.is_test?'INTERNAL TEST ONLY.\n\n':''}Please quote the following requirements (PSC reference ${ref}):\n\n${lines.map((l:any,n:number)=>`${n+1}. ${l.description}\nQuantity: ${l.quantity} ${l.unit}\n${l.product_name?'Proposed product: '+l.product_name+' ('+l.sku+')\n':''}Specifications / clarification: ${l.specification||'Please state the exact specification and pack size offered.'}`).join('\n\n')}\n\nPlease confirm unit price, pack size, VAT, availability, lead time and quotation validity. Clearly identify any substitutions. This RFQ is not a purchase order or a commitment to buy.\n\nRegards,\nPharma Service Co. L.L.C.`;
 return check(await svc.from('psc_mail_drafts').insert({kind:'rfq',intake_message_id:i.message_id,intake_revision:i.revision,recipient:b.recipient,subject:(i.is_test?'TEST - ':'')+'Supplier RFQ '+ref,body_text:body,created_by:user.id}).select('id').single());
 }
 return null;
}
export async function checkIntakeSend(svc:any,d:any){const i=check(await svc.from('psc_mail_intakes').select('revision,reviewed,is_test').eq('message_id',d.intake_message_id).single());if(!i.reviewed||i.revision!==d.intake_revision)throw new MailError('intake_changed_prepare_new_draft');if(i.is_test&&d.recipient.toLowerCase()!==MAILBOX)throw new MailError('test_recipient_locked')}
