import {service,admin,json,check,accessToken,gmail,send,noDemoOrder,logAttempt,safeCode,MailError} from '../_shared/psc-mail.ts'
import {composerFields,aliasStatus,sourceContext,composerMime} from '../_shared/mailbox-compose.ts'
import '../_shared/business-email.js'
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return json({});if(req.method!=='POST')return json({error:'method_not_allowed'},405);
 const svc=service();let claimed:any=null,attempted=false,accepted=false;
 try{
  const user=await admin(req,svc),b=await req.json();
  if(b.action==='aliases')return json({senders:await aliasStatus(await accessToken(svc))});
  if(b.action==='prepare'){
   const m=check(await svc.from('psc_mail_messages').select('*').eq('id',b.message_id).single());if(m.order_id)await noDemoOrder(svc,m.order_id);
   return json(await sourceContext(m,await accessToken(svc),b.compose_mode));
  }
  if(b.action==='save'){
   const fields=composerFields(b);let old:any=null;
   if(b.draft_id){old=check(await svc.from('psc_mail_drafts').select('*').eq('id',b.draft_id).single());if(old.status!=='draft'||old.kind!=='followup'||old.order_id||old.onboarding_id||old.intake_message_id)throw new MailError('use_original_commercial_workflow');}
   if(['reply','reply_all','forward'].includes(fields.compose_mode)){
    if(!b.source_message_id)throw new MailError('source_email_required');const m=check(await svc.from('psc_mail_messages').select('*').eq('id',b.source_message_id).single());if(m.order_id)await noDemoOrder(svc,m.order_id);
   }
   const payload={...fields,kind:'followup',communication_purpose:'account_followup',reply_message_id:['reply','reply_all','forward'].includes(fields.compose_mode)?b.source_message_id:null,updated_at:new Date().toISOString()};
   return json(check(await (old?svc.from('psc_mail_drafts').update(payload).eq('id',old.id).eq('status','draft'):svc.from('psc_mail_drafts').insert({...payload,created_by:user.id})).select('*').single()));
  }
  if(b.action==='send'){
   const d=check(await svc.from('psc_mail_drafts').select('*').eq('id',b.draft_id).single());if(!d.compose_mode||d.status!=='draft'||d.kind!=='followup'||d.order_id||d.onboarding_id||d.intake_message_id)throw new MailError('draft_not_sendable');
   const fields=composerFields(d),token=await accessToken(svc);if(!(await aliasStatus(token)).some(s=>s.address===fields.sender_alias&&s.ready))throw new MailError('selected_sender_not_verified_in_gmail');
   let context:any=null,source:any=null;if(['reply','reply_all','forward'].includes(fields.compose_mode)){const m=check(await svc.from('psc_mail_messages').select('*').eq('id',d.reply_message_id).single());if(m.order_id)await noDemoOrder(svc,m.order_id);source=m;context=await sourceContext(m,token,fields.compose_mode);}
   claimed=check(await svc.from('psc_mail_drafts').update({status:'sending',approved_by:user.id,approved_at:new Date().toISOString()}).eq('id',d.id).eq('status','draft').select('*').single());
   const attachments=[];if(fields.compose_mode==='forward')for(const a of source?.attachments||[]){if(!a.object_path)continue;if(a.size>10*1024*1024||attachments.reduce((n,x)=>n+x.bytes.length,0)+Number(a.size||0)>15*1024*1024)throw new MailError('forward_attachments_too_large');const file=await svc.storage.from('psc-correspondence').download(a.object_path);if(file.error||!file.data)throw new MailError('forward_attachment_unavailable');attachments.push({name:a.file_name,type:a.mime_type||'application/octet-stream',bytes:new Uint8Array(await file.data.arrayBuffer())});}
   const raw=composerMime(d,fields.compose_mode==='forward'?null:context,attachments);attempted=true;
   const result=await send(token,raw,fields.compose_mode==='forward'?undefined:context?.threadId);accepted=true;
   check(await svc.from('psc_mail_drafts').update({status:'accepted',provider_message_id:result.id,accepted_at:new Date().toISOString(),last_error:null}).eq('id',d.id).eq('status','sending'));await logAttempt(svc,null,d.id,'gmail_accepted',null,result.id);return json({accepted_by_gmail:true});
  }
  if(b.action==='retry'){check(await svc.from('psc_mail_drafts').update({status:'draft',last_error:null}).eq('id',b.draft_id).eq('status','failed').not('compose_mode','is',null).select('id').single());return json({saved:true});}
  if(b.action==='reconcile'){const d=check(await svc.from('psc_mail_drafts').select('*').eq('id',b.draft_id).eq('status','uncertain').not('compose_mode','is',null).single()),r=await gmail(await accessToken(svc),'messages?'+new URLSearchParams({q:'in:sent rfc822msgid:psc-draft-'+d.id+'@pharmaservice.ae',maxResults:'2'}));if(r.messages?.length===1){check(await svc.from('psc_mail_drafts').update({status:'accepted',provider_message_id:r.messages[0].id,accepted_at:new Date().toISOString(),last_error:null}).eq('id',d.id).eq('status','uncertain'));return json({accepted_by_gmail:true});}return json({status:'uncertain'});}
  throw new MailError('unknown_action');
 }catch(e){const code=safeCode(e);if(claimed){const unknown=accepted||(e instanceof MailError?e.uncertain:attempted);await svc.from('psc_mail_drafts').update({status:unknown?'uncertain':'failed',last_error:code}).eq('id',claimed.id).eq('status','sending');}return json({error:code},code==='unauthorized'?401:400);}
})
