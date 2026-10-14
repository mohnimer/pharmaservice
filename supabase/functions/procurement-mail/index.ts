import {scheduledSendUser} from '../_shared/email-schedules.ts'
import {composerFields} from '../_shared/mailbox-compose.ts'
import {draftSender,senderStatus,verifySender,routedMime} from '../_shared/mail-senders.ts'
import {intakeAction,checkIntakeSend} from '../_shared/mail-intake.ts'
import {service,admin,json,MAILBOX,check,accessToken,gmail,mime,send,hash,noDemoOrder,email,logAttempt,safeCode,MailError} from '../_shared/psc-mail.ts'
import {quotePdf} from '../_shared/quote-pdf.ts'
import {onboardingAction,onboardingTick,validateOnboardingSend} from '../_shared/onboarding.ts'
import {worker} from '../_shared/psc-mail.ts'
import '../_shared/business-email.js'
const businessHtml=(text:string)=>(globalThis as any).PSC_BUSINESS_EMAIL_HTML(text)
export async function replyContext(source:any,token:string){
 if(!source||source.direction!=='inbound'||!/^[a-zA-Z0-9_-]+$/.test(source.gmail_message_id))throw new MailError('invalid_reply_source');
 if(source.order_id)await noDemoOrder(service(),source.order_id);
 const original=await gmail(token,'messages/'+source.gmail_message_id+'?format=metadata&metadataHeaders=From&metadataHeaders=Reply-To&metadataHeaders=Subject&metadataHeaders=Message-ID&metadataHeaders=References');
 const h=(name:string)=>original.payload?.headers?.find((x:any)=>x.name.toLowerCase()===name.toLowerCase())?.value||'';
 const address=(s:string)=>s.match(/^[^<>]*<([^<>]+)>$/)?.[1]||s;
 const to=address(h('Reply-To')||h('From')).trim(),subject=h('Subject'),inReplyTo=h('Message-ID').trim();
 if(!email(to)||/[\r\n]/.test(subject)||subject.length>296||!/^<[^<>\s]+>$/.test(inReplyTo))throw new MailError('invalid_reply_headers');
 const ids=(h('References').match(/<[^<>\s]+>/g)||[]).slice(-15);ids.push(inReplyTo);
 return {to,subject:/^re:/i.test(subject)?subject:'Re: '+subject,inReplyTo,references:ids.join(' '),threadId:original.threadId||source.gmail_thread_id};
}
async function directContact(svc:any,id:string,purpose?:string){
 const c=check(await svc.from('mail_contacts').select('*').eq('id',id).single());
 if(!c||!email(c.email)||c.status==='bounced')throw new MailError('contact_not_available');
 if(purpose==='sales_introduction'&&(c.unsubscribed_at||!['active','paused'].includes(c.status)))throw new MailError('contact_opted_out');
 if(c.school_id){const s=check(await svc.from('schools').select('account_groups(slug)').eq('id',c.school_id).single());if(s.account_groups?.slug==='psc-demo-group')throw new MailError('demo_mail_disabled');}
 return c;
}
async function recipient(svc:any,o:any){const school=check(await svc.from('schools').select('quote_email,name,campus_name').eq('id',o.school_id).single());let to=school.quote_email;if(!to){const result=await svc.auth.admin.getUserById(o.requested_by);to=result.data?.user?.email}if(!email(to))throw new MailError('verified_customer_recipient_required');return {to,name:[school.name,school.campus_name].filter(Boolean).join(' - ')}}
async function currentQuote(svc:any,orderId:string){await noDemoOrder(svc,orderId);const q=check(await svc.from('quotes').select('*').eq('order_id',orderId).single());if(!['sent','confirmed'].includes(q.status))throw new MailError('issued_quotation_required');const fp=check(await svc.rpc('psc_mail_quote_fingerprint',{p_order_id:orderId}));return {q,fp}}
function currentSnapshot(q:any,s:any,fp:string){return s?.commercial_fingerprint===fp&&s.revision_no===q.current_revision&&['subtotal','vat','total','currency','payment_terms','delivery_terms','validity_days','customer_note'].every(k=>String(s.header_snapshot?.[k]??'')===String(q[k]??''))}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return json({})
 if(req.method!=='POST')return json({error:'method_not_allowed'},405)
 const svc=service();let draft:any=null,attemptedSend=false,acceptedSend=false;
 try{
  const b=await req.json();
  if(b.action==='onboarding_tick'){if(!await worker(req,svc))throw new MailError('unauthorized');return json(await onboardingTick(svc));}
  const user=await scheduledSendUser(svc,req,b,'procurement-mail')||await admin(req,svc);
  if(String(b.action).startsWith('onboarding_'))return json(await onboardingAction(svc,user,b));
  if(b.action==='sender_status')return json({senders:await senderStatus(await accessToken(svc))});
  if(b.action==='reply_draft'){
   if(typeof b.body_text!=='string'||!b.body_text.trim()||b.body_text.length>30000)throw new MailError('invalid_draft');
   const source=check(await svc.from('psc_mail_messages').select('*').eq('id',b.message_id).single());
   const reply=await replyContext(source,await accessToken(svc));
   return json(check(await svc.from('psc_mail_drafts').insert({kind:'followup',reply_message_id:source.id,communication_purpose:'request_response',recipient:reply.to,subject:reply.subject,body_text:b.body_text,created_by:user.id}).select('*').single()));
  }
  if(b.action==='contact_draft'){
   const sales=b.purpose==='sales_introduction'&&b.audience==='prospect';
   if(!sales&&(b.confirm_transactional!==true||!['customer','supplier'].includes(b.audience)||!['request_response','account_followup'].includes(b.purpose)))throw new MailError('transactional_context_required');
   if(typeof b.subject!=='string'||!b.subject.trim()||/[\r\n]/.test(b.subject)||b.subject.length>300||typeof b.body_text!=='string'||!b.body_text.trim()||b.body_text.length>30000)throw new MailError('invalid_draft');
   const c=await directContact(svc,b.contact_id,b.purpose);

   return json(check(await svc.from('psc_mail_drafts').insert({kind:b.audience==='supplier'?'rfq':'followup',contact_id:c.id,communication_purpose:b.purpose,recipient:c.email,subject:b.subject.trim(),body_text:b.body_text,created_by:user.id}).select('*').single()));
  }
  if(['intake_source','intake_save','intake_rfq'].includes(b.action))return json(await intakeAction(svc,user,b));
  if(b.action==='link'){
   if(!['customer','supplier'].includes(b.kind))throw new MailError('correspondence_kind_required');await noDemoOrder(svc,b.order_id);
   check(await svc.from('psc_mail_messages').update({order_id:b.order_id,kind:b.kind,review_status:'linked'}).eq('id',b.message_id).eq('direction','inbound'));return json({linked:true})
  }
  if(b.action==='ignore') {check(await svc.from('psc_mail_messages').update({review_status:'ignored'}).eq('id',b.message_id).eq('direction','inbound'));return json({ignored:true})}
  if(b.action==='message_draft'){
   const o=await noDemoOrder(svc,b.order_id);let to:string,body:string;
   if(b.kind==='followup'){to=(await recipient(svc,o)).to;body=`Hello,\n\nWe are following up on procurement request ${o.order_number}. Please confirm any outstanding requirements or questions so PSC can review the next step.\n\nRegards,\nPharma Service Co. L.L.C.`}
   else if(b.kind==='rfq'&&email(b.recipient)){
    to=b.recipient;const lines=check(await svc.from('order_lines').select('line_description,quantity,requested_presentation,requested_brand').eq('order_id',o.id).order('created_at'));
    body=`Hello,\n\nPlease provide a written quotation for the following requirements (PSC reference ${o.order_number}):\n\n${lines.map((l:any)=>[l.line_description,'Quantity: '+l.quantity,l.requested_presentation,l.requested_brand].filter(Boolean).join(' | ')).join('\n')}\n\nPlease confirm exact specifications, brand/model, VAT basis, stock, lead time, warranty and quotation validity. This is a request for quotation, not a purchase order or supply commitment.\n\nRegards,\nPharma Service Co. L.L.C.`
   }else throw new MailError('invalid_message_draft');
   return json(check(await svc.from('psc_mail_drafts').insert({kind:b.kind,order_id:o.id,recipient:to,subject:(b.kind==='rfq'?'Supplier RFQ ':'Procurement follow-up ')+o.order_number,body_text:body,created_by:user.id}).select('id').single()))
  }
  if(b.action==='retry_draft'){
   if(b.approve!==true)throw new MailError('explicit_retry_approval_required');
   const r=check(await svc.from('psc_mail_drafts').update({status:'draft',updated_at:new Date().toISOString(),approved_at:null,approved_by:null}).eq('id',b.draft_id).eq('status','failed').select('id').maybeSingle());if(!r)throw new MailError('draft_locked');return json({ready_for_review:true})
  }
  if(b.action==='reconcile_notification'){
   const n=check(await svc.from('notification_outbox').select('*').eq('id',b.notification_id).eq('status','uncertain').single()),token=await accessToken(svc);
   const result=await gmail(token,'messages?'+new URLSearchParams({q:'in:sent rfc822msgid:psc-notification-'+n.id+'@pharmaservice.ae',maxResults:'2'}));
   if(result.messages?.length===1){check(await svc.from('notification_outbox').update({status:'sent',provider_message_id:result.messages[0].id,accepted_at:new Date().toISOString(),sent_at:new Date().toISOString(),last_error:null}).eq('id',n.id).eq('status','uncertain'));await logAttempt(svc,n.id,null,'gmail_reconciled',null,result.messages[0].id);return json({accepted_by_gmail:true,delivery_confirmed:false})}
   return json({status:'uncertain',manual_review_required:true})
  }
  if(b.action==='quotation_draft'){
   const o=await noDemoOrder(svc,b.order_id),{q,fp}=await currentQuote(svc,o.id),contact=await recipient(svc,o);
   const snapshot=check(await svc.from('quote_snapshots').select('*').eq('quote_id',q.id).eq('revision_no',q.current_revision).eq('snapshot_kind','issued').single());if(!currentSnapshot(q,snapshot,fp))throw new MailError('current_issued_snapshot_required');
   const pdf=await quotePdf(snapshot,contact.name),id=crypto.randomUUID(),path='drafts/'+id+'/quotation.pdf';check(await svc.storage.from('psc-correspondence').upload(path,pdf,{contentType:'application/pdf'}));
   const body=`Hello,\n\nPlease find attached Pharma Service quotation ${q.quote_number}, revision ${q.current_revision}, for ${contact.name}.\n\nTotal: ${q.currency||'AED'} ${Number(q.total).toFixed(2)} including applicable VAT.\nPayment terms: ${q.payment_terms||'As recorded in the quotation'}.\nDelivery terms: ${q.delivery_terms||'Subject to PSC confirmation'}.\nValidity: ${q.validity_days} calendar days.\n\nPlease review the quotation and confirm your requirements and written approval. Procurement release remains subject to the agreed funding and supply checks.\n\nRegards,\nPharma Service Co. L.L.C.\nmohamed@pharmaservice.ae`;
   const data=check(await svc.from('psc_mail_drafts').insert({id,order_id:o.id,quote_id:q.id,quote_snapshot_id:snapshot.id,quote_fingerprint:fp,kind:'quotation',recipient:contact.to,subject:'Quotation '+q.quote_number+' - Pharma Service',body_text:body,attachment_path:path,attachment_sha256:await hash(pdf),created_by:user.id}).select('id').single());return json(data)
  }
  if(b.action==='test_draft')return json(check(await svc.from('psc_mail_drafts').insert({kind:'test',recipient:MAILBOX,subject:'PSC controlled Gmail connection test',body_text:'Approved internal integration test. No customer order or commercial commitment.',created_by:user.id}).select('id').single()))
  if(b.action==='save'){
   if(typeof b.subject!=='string'||!b.subject.trim()||/[\r\n]/.test(b.subject)||b.subject.length>300||typeof b.body_text!=='string'||!b.body_text.trim()||b.body_text.length>30000)throw new MailError('invalid_draft');
   const old=check(await svc.from('psc_mail_drafts').select('*').eq('id',b.draft_id).single());if(old.status!=='draft')throw new MailError('draft_locked');
   let payload:any={subject:b.subject,body_text:b.body_text,updated_at:new Date().toISOString()};
   if(b.to_recipients!==undefined){const {compose_mode,...fields}=composerFields({...b,compose_mode:'normal'});payload={...payload,...fields,source_recipient:old.source_recipient||old.recipient};}
   const saved=check(await svc.from('psc_mail_drafts').update(payload).eq('id',old.id).eq('status','draft').eq('updated_at',old.updated_at).select('*').maybeSingle());if(!saved)throw new MailError('draft_locked');return json({...saved,saved:true});
  }
  if(b.action==='reconcile'){
   draft=check(await svc.from('psc_mail_drafts').select('*').eq('id',b.draft_id).eq('status','uncertain').single());const token=await accessToken(svc);const result=await gmail(token,'messages?'+new URLSearchParams({q:'in:sent rfc822msgid:psc-draft-'+draft.id+'@pharmaservice.ae',maxResults:'2'}));
   if(result.messages?.length===1){const m=result.messages[0];check(await svc.from('psc_mail_drafts').update({status:'accepted',provider_message_id:m.id,accepted_at:new Date().toISOString(),last_error:null}).eq('id',draft.id).eq('status','uncertain'));return json({accepted_by_gmail:true})}return json({status:'uncertain',manual_review_required:true})
  }
  if(b.action!=='send'||b.approve!==true)throw new MailError('explicit_send_approval_required')
  draft=check(await svc.from('psc_mail_drafts').select('*').eq('id',b.draft_id).single());if(draft.status!=='draft')throw new MailError('draft_locked')
  const originalRecipient=draft.source_recipient||draft.recipient;
  const envelope=draft.source_recipient?composerFields({...draft,compose_mode:'normal'}):{recipient:draft.recipient,to_recipients:[draft.recipient],cc_recipients:[],bcc_recipients:[],sender_alias:draftSender(draft.kind)};
  if(draft.kind==='test'&&(envelope.recipient!==MAILBOX||envelope.cc_recipients.length||envelope.bcc_recipients.length))throw new MailError('test_recipient_locked')
  let reply:any=null;
  if(draft.reply_message_id){
   const source=check(await svc.from('psc_mail_messages').select('*').eq('id',draft.reply_message_id).single());reply=await replyContext(source,await accessToken(svc));
   if(draft.kind!=='followup'||draft.contact_id||draft.order_id||draft.intake_message_id||draft.attachment_path||originalRecipient.toLowerCase()!==reply.to.toLowerCase()||!draft.source_recipient&&draft.subject!==reply.subject)throw new MailError('reply_context_changed');
  }
  else if(draft.contact_id){
   if(!['rfq','followup'].includes(draft.kind)||!['request_response','account_followup','sales_introduction'].includes(draft.communication_purpose)||draft.attachment_path||draft.order_id)throw new MailError('invalid_contact_draft');
   if(draft.communication_purpose==='sales_introduction'&&draft.kind!=='followup')throw new MailError('invalid_contact_draft');
   const c=await directContact(svc,draft.contact_id,draft.communication_purpose);if(c.email.toLowerCase()!==originalRecipient.toLowerCase())throw new MailError('customer_recipient_changed');
  }
  else if(draft.intake_message_id){const intake=await checkIntakeSend(svc,draft);if(intake.is_test&&(envelope.recipient!==MAILBOX||envelope.cc_recipients.length||envelope.bcc_recipients.length))throw new MailError('test_recipient_locked');}
  else if(['rfq','followup'].includes(draft.kind))await noDemoOrder(svc,draft.order_id)
  let pdf:Uint8Array|undefined;
  if(draft.kind==='quotation'){
   const {q,fp}=await currentQuote(svc,draft.order_id);if(fp!==draft.quote_fingerprint)throw new MailError('obsolete_quotation');
   const snap=check(await svc.from('quote_snapshots').select('*').eq('id',draft.quote_snapshot_id).single());if(!currentSnapshot(q,snap,fp))throw new MailError('obsolete_quotation');
   const c=await recipient(svc,await noDemoOrder(svc,draft.order_id));if(c.to.toLowerCase()!==originalRecipient.toLowerCase())throw new MailError('customer_recipient_changed');
   const file=check(await svc.storage.from('psc-correspondence').download(draft.attachment_path));pdf=new Uint8Array(await file.arrayBuffer());if(await hash(pdf)!==draft.attachment_sha256)throw new MailError('quotation_attachment_changed')
  }
  if(draft.onboarding_id)await validateOnboardingSend(svc,draft);
  const token=await accessToken(svc),sender=envelope.sender_alias;await verifySender(token,sender);
  const claimed=draft.onboarding_id?check(await svc.rpc('psc_claim_onboarding_draft',{p_draft:draft.id,p_updated_at:draft.updated_at,p_user:user.id})):draft.intake_message_id?check(await svc.rpc('psc_claim_intake_draft',{p_draft:draft.id,p_updated_at:draft.updated_at,p_user:user.id})):check(await svc.from('psc_mail_drafts').update({status:'sending',approved_by:user.id,approved_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',draft.id).eq('status','draft').eq('updated_at',draft.updated_at).select('*').maybeSingle());if(!claimed)throw new MailError('draft_changed_or_claimed')
  draft=Array.isArray(claimed)?claimed[0]:claimed;if(!draft?.id)throw new MailError('draft_changed_or_claimed');await logAttempt(svc,null,draft.id,'started');attemptedSend=true;
  const result=await send(token,routedMime(sender,{to:envelope.recipient,cc:envelope.cc_recipients,bcc:envelope.bcc_recipients,subject:draft.subject,text:(globalThis as any).PSC_BUSINESS_EMAIL_SIGNED_TEXT(draft.body_text),html:businessHtml(draft.body_text),id:'draft-'+draft.id,pdf,...(reply?{inReplyTo:reply.inReplyTo,references:reply.references}:{})}),draft.subject===reply?.subject?reply?.threadId:undefined);acceptedSend=true;
  check(await svc.from('psc_mail_drafts').update({status:'accepted',provider_message_id:result.id,accepted_at:new Date().toISOString(),last_error:null}).eq('id',draft.id));
  await logAttempt(svc,null,draft.id,'gmail_accepted',null,result.id);
  check(await svc.from('psc_mail_messages').upsert({gmail_message_id:result.id,gmail_thread_id:result.threadId||result.id,direction:'outbound',kind:draft.kind,order_id:draft.order_id,sender,recipient:draft.recipient,subject:draft.subject,body_text:draft.body_text,received_at:new Date().toISOString(),review_status:'linked',attachments:draft.attachment_path?[{object_path:draft.attachment_path,file_name:'PSC-quotation.pdf'}]:[]}));
  // Replace the old automatic portal-ready email with the explicitly approved PDF communication.
  if(draft.kind==='quotation')await svc.from('notification_outbox').update({status:'blocked',last_error:'Superseded by approved quotation email',next_attempt_at:null}).eq('entity_id',draft.quote_id).eq('event_type','quote_sent').in('status',['queued','held','failed']);
  return json({accepted_by_gmail:true,delivery_confirmed:false})
 }catch(e){
  const code=safeCode(e);if(draft?.status==='sending'){const unknown=acceptedSend||(e instanceof MailError?e.uncertain:attemptedSend);await svc.from('psc_mail_drafts').update({status:unknown?'uncertain':'failed',last_error:code}).eq('id',draft.id).eq('status','sending');await logAttempt(svc,null,draft.id,unknown?'uncertain':'failed',code).catch(()=>{})}
  return json({error:code},code==='unauthorized'?401:code==='forbidden'?403:400)
 }
})
