import {check,MailError,worker} from './psc-mail.ts'
export const SCHEDULE_TARGETS=['mailbox','procurement-mail','customer-invitations'];
export function scheduledTime(value:unknown,now=Date.now()){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value))throw new MailError('invalid_schedule_time');
 const time=Date.parse(value);if(!Number.isFinite(time)||time<now+30000||time>now+366*86400000)throw new MailError('choose_future_schedule_within_one_year');return new Date(time).toISOString();
}
export async function scheduledSendUser(svc:any,req:Request,b:any,target:string){
 if(b.schedule_id){
  if(b.action!=='send'||b.approve!==true||!await worker(req,svc))throw new MailError('unauthorized');
  const job=check(await svc.rpc('psc_authorize_mail_schedule',{p_id:b.schedule_id,p_target:target,p_target_id:b.draft_id||b.id}));if(!job?.id)throw new MailError('scheduled_email_changed_or_cancelled');return {id:job.created_by};
 }
 if(b.action==='send'){
  const jobs=check(await svc.from('psc_email_schedules').select('id').eq('target',target).eq('target_id',b.draft_id||b.id).in('status',['pending','dispatching']).limit(1));if(jobs?.length)throw new MailError('cancel_scheduled_send_before_sending_now');
 }
 return null;
}
export async function dispatchScheduledEmails(svc:any,workerToken:string,fetcher=fetch){
 const jobs=check(await svc.rpc('psc_claim_due_mail_schedules'));const results=await Promise.all((jobs||[]).map(async(j:any)=>{
  let result:any,status='uncertain',error:string|null='scheduled_send_outcome_unknown';
  try{const r=await fetcher(Deno.env.get('SUPABASE_URL')+'/functions/v1/'+j.target,{method:'POST',headers:{'Content-Type':'application/json','x-psc-worker':workerToken},body:JSON.stringify({action:'send',approve:true,schedule_id:j.id,...(j.target==='customer-invitations'?{id:j.target_id}:{draft_id:j.target_id})}),signal:AbortSignal.timeout(50000)});result=await r.json();
   if(result.accepted_by_gmail){status='sent';error=result.copy_status&&['failed','uncertain'].includes(result.copy_status)?'information_copies_need_review':null;}
   else{const table=j.target==='customer-invitations'?'psc_customer_invitations':'psc_mail_drafts',record=check(await svc.from(table).select('status').eq('id',j.target_id).single());status=['accepted','pending_activation','sent'].includes(record.status)?'sent':['sending','uncertain'].includes(record.status)?'uncertain':'failed';error=status==='sent'?null:String(result.error||'scheduled_send_not_confirmed');}
  }catch{/* Never automatically resend an unknown outcome. */}
  check(await svc.from('psc_email_schedules').update({status,last_error:error,finished_at:new Date().toISOString()}).eq('id',j.id).eq('status','dispatching'));return {id:j.id,status};
 }));return {processed:results.length,results};
}
