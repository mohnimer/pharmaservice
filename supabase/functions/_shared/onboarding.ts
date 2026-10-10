import {check,MailError,email,accessToken,gmail} from './psc-mail.ts'
export const LABELS:Record<string,string>={agreement:'Signed supply agreement',account_form:'Completed account opening form',registration:'Company / institutional registration',vat:'VAT certificate (if registered)',buyers:'Authorized ordering contacts',billing:'Billing, delivery and invoice instructions',vendor:'Your supplier-registration requirements',credit:'Credit application and PSC credit decision (only if requested)'};
const OPTIONAL=['vat','vendor','credit'];
export function initialItems(){return Object.fromEntries(Object.keys(LABELS).map(k=>[k,{status:['agreement','account_form'].includes(k)?'internal_pending':k==='credit'?'not_applicable':'pending',note:k==='credit'?'No credit requested; no credit approval granted.':''}]))}
export function validateItems(raw:any){
 if(!raw||Object.keys(raw).sort().join()!==Object.keys(LABELS).sort().join())throw new MailError('invalid_onboarding_checklist');
 const items:any={};for(const k of Object.keys(LABELS)){const i=raw[k];if(!i||!['internal_pending','pending','received','verified','not_applicable'].includes(i.status)||typeof i.note!=='string'||i.note.length>1500)throw new MailError('invalid_onboarding_checklist');if(i.status==='not_applicable'&&!OPTIONAL.includes(k))throw new MailError('required_onboarding_item');if(['verified','not_applicable'].includes(i.status)&&!i.note.trim())throw new MailError('onboarding_evidence_required');if(i.status==='internal_pending'&&!['agreement','account_form'].includes(k))throw new MailError('invalid_onboarding_checklist');items[k]={status:i.status,note:i.note.trim()};}return items;
}
export const outstanding=(items:any)=>Object.keys(LABELS).filter(k=>items[k]?.status==='pending');
export const canActivate=(items:any)=>Object.keys(LABELS).every(k=>items[k]?.status==='verified'||(OPTIONAL.includes(k)&&items[k]?.status==='not_applicable'));
export function reminderBody(name:string,items:any){const missing=outstanding(items);if(!missing.length)throw new MailError('no_customer_items_outstanding');return `Hi ${name||'there'},\n\nWe are following up on your Pharma Service account opening. The following items are still outstanding:\n\n${missing.map(k=>'• '+LABELS[k]).join('\n')}\n\nPlease reply with the remaining information, or let us know if you need help completing it. There is no need to resend anything you have already provided.\n\nBest,\nMohamed\nPharma Service Co. L.L.C.\nsales@pharmaservice.ae`;}
export function businessDate(start:string,days:number){const date=new Date(new Date(start).getTime()+4*3600000);date.setUTCHours(5,0,0,0);for(let n=0;n<days;){date.setUTCDate(date.getUTCDate()+1);if(![0,6].includes(date.getUTCDay()))n++;}return date.toISOString()}
async function contact(svc:any,id:string){const c=check(await svc.from('mail_contacts').select('*').eq('id',id).single());if(!c||!email(c.email)||c.status==='bounced')throw new MailError('contact_not_available');if(c.school_id){const s=check(await svc.from('schools').select('account_groups(slug)').eq('id',c.school_id).single());if(s.account_groups?.slug==='psc-demo-group')throw new MailError('demo_mail_disabled');}return c;}
async function save(svc:any,b:any,patch:any){return check(await svc.rpc('psc_onboarding_save',{p_id:b.id,p_revision:b.revision,p_patch:patch}))}
export async function detectReply(svc:any,b:any,token?:string){
 const c=await contact(svc,b.contact_id);if(c.journey_stage&&c.journey_stage!=='onboarding'){await save(svc,b,{status:'paused',last_error:'customer_journey_changed'});return true;}if(c.email.toLowerCase()!==String(b.recipient).toLowerCase()){await save(svc,b,{status:'paused',last_error:'contact_email_changed'});return true;}
 const result=await gmail(token||await accessToken(svc),'messages?'+new URLSearchParams({q:`from:"${b.recipient}" after:${Math.floor(Date.parse(b.reply_after)/1000)} -in:sent`,maxResults:'1',includeSpamTrash:'true'}));
 if(result.messages?.length){await save(svc,b,{status:'paused',last_error:'reply_received_review_required'});check(await svc.from('psc_crm_tasks').upsert({id:b.id,title:'Review onboarding reply before resuming reminders',due_date:new Date(Date.now()+4*3600000).toISOString().slice(0,10),contact_id:b.contact_id,created_by:b.created_by,updated_by:b.created_by,completed:false,source_rule:'onboarding_reply',source_excerpt:'A new email from this contact was found. Review Gmail and update the onboarding checklist.'}));return true;}return false;
}
export async function validateOnboardingSend(svc:any,d:any){const b=check(await svc.from('psc_onboarding').select('*').eq('id',d.onboarding_id).single());if(b.status!=='waiting'||b.revision!==d.onboarding_revision)throw new MailError('onboarding_draft_outdated');if(await detectReply(svc,b))throw new MailError('onboarding_paused_for_reply');}
export async function onboardingAction(svc:any,user:any,b:any){
 const c=await contact(svc,b.contact_id);
 if(b.action==='onboarding_start'){
  if(b.approve!==true)throw new MailError('explicit_onboarding_approval_required');
  const existing=check(await svc.from('psc_onboarding').select('*').eq('contact_id',c.id).maybeSingle());if(existing)return existing;
  return check(await svc.from('psc_onboarding').insert({contact_id:c.id,items:initialItems(),created_by:user.id}).select('*').single());
 }
 const record=check(await svc.from('psc_onboarding').select('*').eq('contact_id',c.id).single());
 if(record.revision!==b.revision)throw new MailError('onboarding_changed_reload');
 if(record.status==='active')throw new MailError('onboarding_already_approved');
 if(b.action==='onboarding_save'){
  const items=validateItems(b.items);if(typeof b.notes!=='string'||b.notes.length>3000)throw new MailError('invalid_onboarding_notes');
  let status=record.status;if(status==='waiting'&&!outstanding(items).length)status='review';if(Object.values(items).some((i:any)=>i.status==='internal_pending'))status='preparing';
  return save(svc,record,{items,notes:b.notes,status});
 }
 if(b.action==='onboarding_pack_sent'){
  if(b.approve!==true||record.pack_sent_at||Object.values(record.items).some((i:any)=>i.status==='internal_pending'))throw new MailError('final_pack_and_confirmation_required');
  const now=new Date().toISOString();const updated=await save(svc,record,{status:outstanding(record.items).length?'waiting':'review',pack_sent_at:now,reply_after:now,recipient:c.email});
  await schedule(svc,updated);return updated;
 }
 if(b.action==='onboarding_pause')return save(svc,record,{status:'paused',last_error:'paused_by_administrator'});
 if(b.action==='onboarding_resume'){
  if(b.approve!==true||!record.pack_sent_at||!outstanding(record.items).length||Object.values(record.items).some((i:any)=>i.status==='internal_pending'))throw new MailError('review_before_resuming');
  const updated=await save(svc,record,{status:'waiting',recipient:c.email,reply_after:new Date().toISOString()});await schedule(svc,updated);return updated;
 }
 if(b.action==='onboarding_activate'){
  if(b.approve!==true||!canActivate(validateItems(record.items)))throw new MailError('verify_all_required_items');
  return save(svc,record,{status:'active',approved_at:new Date().toISOString(),approved_by:user.id});
 }
 throw new MailError('unsupported_onboarding_action');
}
async function schedule(svc:any,b:any){for(const step of [3,7]){const r=await svc.from('psc_onboarding_reminders').insert({onboarding_id:b.id,step,due_at:businessDate(b.pack_sent_at,step)});if(r.error&&r.error.code!=='23505')throw new MailError('reminder_schedule_failed');}}
export async function onboardingTick(svc:any){
 const boards=check(await svc.from('psc_onboarding').select('*').eq('status','waiting').order('last_checked_at',{ascending:true,nullsFirst:true}).limit(20));if(!boards.length)return {checked:0};
 const token=await accessToken(svc);let drafted=0;
 for(const b of boards){try{
  await schedule(svc,b);if(await detectReply(svc,b,token))continue;
  const c=await contact(svc,b.contact_id),jobs=check(await svc.from('psc_onboarding_reminders').select('*').eq('onboarding_id',b.id).eq('status','pending').lte('due_at',new Date().toISOString()).order('step'));
  if(!outstanding(b.items).length){await save(svc,b,{status:'review'});continue;}
  // Do not create several overdue reminders in the same tick after downtime.
  const job=jobs[0];if(job){const id=check(await svc.rpc('psc_onboarding_draft',{p_id:b.id,p_revision:b.revision,p_step:job.step,p_subject:'Account opening — outstanding items',p_body:reminderBody(c.first_name,b.items)}));if(id)drafted++;}
  check(await svc.from('psc_onboarding').update({last_checked_at:new Date().toISOString(),last_error:null}).eq('id',b.id).eq('revision',b.revision));
 }catch{await svc.from('psc_onboarding').update({last_checked_at:new Date().toISOString(),last_error:'reminder_check_failed_review_required'}).eq('id',b.id).eq('revision',b.revision);}}
 return {checked:boards.length,drafted};
}
