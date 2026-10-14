import {service,admin,json,check,MailError,safeCode,worker,accessToken} from '../_shared/psc-mail.ts'
import {SCHEDULE_TARGETS,scheduledTime,dispatchScheduledEmails} from '../_shared/email-schedules.ts'
import {composerFields} from '../_shared/mailbox-compose.ts'
import {verifySender} from '../_shared/mail-senders.ts'
import {invitationEmailDraft,invitationBodies} from '../_shared/invitation-email.ts'
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return json({});if(req.method!=='POST')return json({error:'method_not_allowed'},405);
 const svc=service();try{
  const b=await req.json();if(b.action==='tick'){if(!await worker(req,svc))throw new MailError('unauthorized');return json(await dispatchScheduledEmails(svc,req.headers.get('x-psc-worker')||''));}
  const user=await admin(req,svc);
  if(b.action==='list'){const rows=check(await svc.from('psc_email_schedules').select('id,target,target_id,send_at,status,subject,recipient,last_error,created_at').order('send_at',{ascending:false}).limit(100));return json({schedules:rows});}
  if(b.action==='cancel'){const r=check(await svc.rpc('psc_cancel_mail_schedule',{p_id:b.id}));if(!r)throw new MailError('scheduled_send_already_started_or_cancelled');return json({cancelled:true});}
  if(b.action!=='schedule'||b.approve!==true||!SCHEDULE_TARGETS.includes(b.target))throw new MailError('explicit_schedule_approval_required');
  const at=scheduledTime(b.send_at),table=b.target==='customer-invitations'?'psc_customer_invitations':'psc_mail_drafts',record=check(await svc.from(table).select('*').eq('id',b.target_id).single());if(record.status!=='draft')throw new MailError('draft_not_schedulable');
  let fields:any;
  if(b.target==='customer-invitations'){
   if(!record.full_name||!record.recipient_email)throw new MailError('invitation_identity_and_draft_required');
   const g=check(await svc.from('account_groups').select('*').eq('id',record.group_id).single()),schools=check(await svc.from('schools').select('*').in('id',record.school_ids));if(!g.active||g.slug==='psc-demo-group'||schools.length!==record.school_ids.length||schools.some((s:any)=>!s.active||s.group_id!==g.id))throw new MailError('invalid_invitation_scope');
   fields=invitationEmailDraft(record,{g,schools});invitationBodies(fields);
  }else{
   if(b.target==='mailbox'&&(!record.compose_mode||record.kind!=='followup'||record.order_id||record.onboarding_id||record.intake_message_id))throw new MailError('use_original_commercial_workflow');
   if(b.target==='procurement-mail'&&record.compose_mode&&!record.order_id&&!record.onboarding_id&&!record.intake_message_id)throw new MailError('use_mailbox_workflow');
   fields=composerFields({...record,compose_mode:record.compose_mode||'normal',sender_alias:record.sender_alias||'mohamed@pharmaservice.ae',to_recipients:record.to_recipients?.length?record.to_recipients:[record.recipient]});
  }
  await verifySender(await accessToken(svc),fields.sender_alias);
  const job=check(await svc.rpc('psc_schedule_mail',{p_target:b.target,p_target_id:b.target_id,p_send_at:at,p_user:user.id,p_snapshot:record,p_subject:fields.subject,p_recipient:fields.recipient||fields.to_recipients.join(', ')}));return json({scheduled:true,id:job.id,send_at:job.send_at});
 }catch(e){return json({error:safeCode(e)},safeCode(e)==='unauthorized'?401:400);}
});
