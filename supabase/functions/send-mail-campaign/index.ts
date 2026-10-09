import {service,admin,worker,json,safeCode,check,MailError,MAILBOX,accessToken,send,gmail} from '../_shared/psc-mail.ts'
import {OUTREACH,verifyAlias,validateCampaign,marketingMime,eligible} from '../_shared/outreach.ts'
const uuid=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
async function alias(s:any,token:string){try{await verifyAlias(token);check(await s.from('psc_outreach_settings').update({alias_status:'accepted',checked_at:new Date().toISOString(),last_error:null}).eq('id',true))}catch(e){check(await s.from('psc_outreach_settings').update({enabled:false,alias_status:'unavailable',checked_at:new Date().toISOString(),last_error:safeCode(e)}).eq('id',true));throw e}}
async function tick(s:any){
 check(await s.rpc('psc_outreach_settle'));
 const config=check(await s.from('psc_outreach_settings').select('*').eq('id',true).single());if(!config.enabled)return {paused:true};
 let token:string;try{token=await accessToken(s)}catch(e){check(await s.from('psc_outreach_settings').update({enabled:false,last_error:safeCode(e)}).eq('id',true));throw e}await alias(s,token);
 const job=check(await s.rpc('psc_outreach_claim'));if(!job)return {idle:true};
 const r=job.recipient;let sending=false;
 try{
  const c=check(await s.from('mail_contacts').select('*').eq('id',r.contact_id).maybeSingle());
  if(!eligible(c)||c.email.toLowerCase()!==r.email_snapshot.toLowerCase())throw new MailError('recipient_suppressed');
  const raw=marketingMime(job.campaign,r,c.unsubscribe_token,job.attempt_id);sending=true;
  const accepted=await send(token,raw);
  check(await s.from('psc_outreach_attempts').update({status:'accepted',provider_message_id:accepted.id}).eq('id',job.attempt_id));
  check(await s.from('mail_campaign_recipients').update({status:'sent',sent_at:new Date().toISOString(),provider_message_id:accepted.id,error:null}).eq('id',r.id));
 }catch(e){
  const code=safeCode(e),uncertain=(e instanceof MailError&&e.uncertain)||(sending&&code==='storage_operation_failed');
  const retry=['gmail_rate_limited','gmail_unavailable','google_token_unavailable'].includes(code);
  check(await s.from('psc_outreach_attempts').update({status:uncertain?'uncertain':'failed',error:code}).eq('id',job.attempt_id));
  check(await s.from('mail_campaign_recipients').update({status:uncertain?'uncertain':code==='recipient_suppressed'?'skipped':'failed',error:code,...(!retry&&!uncertain?{attempts:3}:{}),next_attempt_at:new Date(Date.now()+15*60000).toISOString()}).eq('id',r.id));
 }
 check(await s.rpc('psc_outreach_settle'));return {processed:1};
}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return json({});if(req.method!=='POST')return json({error:'method_not_allowed'},405);
 const s=service();try{
  const b=await req.json();if(b.action==='tick'){if(!await worker(req,s))throw new MailError('unauthorized');return json(await tick(s))}
  const user=await admin(req,s);
  if(b.action==='status'||b.action==='verify_alias'){
   check(await s.rpc('psc_outreach_settle'));
   if(b.action==='verify_alias')await alias(s,await accessToken(s));
   return json({sender:OUTREACH,settings:check(await s.from('psc_outreach_settings').select('*').eq('id',true).single()),limit_per_24h:100,interval_seconds:60,test:check(await s.from('psc_outreach_attempts').select('id,status,created_at,error').eq('kind','test').order('created_at',{ascending:false}).limit(1))?.[0]||null})
  }
  if(b.action==='pause'){check(await s.from('psc_outreach_settings').update({enabled:false}).eq('id',true));return json({paused:true})}
  if(b.action==='enable'){
   if(b.confirm_test_received!==true||b.confirm_sender_authentication!==true)throw new MailError('setup_confirmation_required');
   const test=check(await s.from('psc_outreach_attempts').select('id').eq('kind','test').eq('status','accepted').limit(1));if(!test.length)throw new MailError('internal_test_required');
   await alias(s,await accessToken(s));check(await s.from('psc_outreach_settings').update({enabled:true,enabled_by:user.id,enabled_at:new Date().toISOString()}).eq('id',true));return json({enabled:true});
  }
  if(b.action==='test'){
   if(b.approve!==true||!uuid(b.request_id))throw new MailError('explicit_test_approval_required');
   const old=check(await s.from('psc_outreach_attempts').select('id,status').eq('id',b.request_id).maybeSingle());if(old)return json({test:old,replayed:true});
   const token=await accessToken(s);await alias(s,token);
   if(!check(await s.rpc('psc_mail_rate',{p_key:'outreach-tests',p_limit:3,p_seconds:3600})))throw new MailError('rate_limited');
   const c={sender_email:OUTREACH,template:'custom',subject:'PSC outreach sender test',intro:'Approved internal test of the PSC marketing alias. This message is sent only to info@pharmaservice.ae. No campaign or customer email has been sent.',cta_label:'Open PSC workspace',cta_url:'https://pharmaservice.ae/#admin/mail'};
   check(await s.from('psc_outreach_attempts').insert({id:b.request_id,kind:'test',status:'sending'}));let sent=false;
   try{const result=await send(token,marketingMime(c,{email_snapshot:MAILBOX},null,b.request_id));sent=true;check(await s.from('psc_outreach_attempts').update({status:'accepted',provider_message_id:result.id}).eq('id',b.request_id));return json({accepted_by_gmail:true})}
   catch(e){check(await s.from('psc_outreach_attempts').update({status:sent||(e instanceof MailError&&e.uncertain)?'uncertain':'failed',error:safeCode(e)}).eq('id',b.request_id));throw e}
  }
  if(b.action==='reconcile'){
   if(!uuid(b.attempt_id))throw new MailError('invalid_attempt');
   const a=check(await s.from('psc_outreach_attempts').select('*').eq('id',b.attempt_id).single());if(a.status!=='uncertain')throw new MailError('not_uncertain');
   const token=await accessToken(s),match=await gmail(token,'messages?q='+encodeURIComponent('in:sent rfc822msgid:psc-outreach-'+a.id+'@pharmaservice.ae')+'&maxResults=2');
   if(!match.messages?.length)return json({found:false,held:true});
   const id=match.messages[0].id;check(await s.from('psc_outreach_attempts').update({status:'accepted',provider_message_id:id,error:null}).eq('id',a.id));
   if(a.recipient_id)check(await s.from('mail_campaign_recipients').update({status:'sent',provider_message_id:id,sent_at:new Date().toISOString(),error:null}).eq('id',a.recipient_id));
   check(await s.rpc('psc_outreach_settle'));return json({found:true,accepted_by_gmail:true})
  }
  if(!uuid(b.campaign_id))throw new MailError('invalid_campaign');
  const c=check(await s.from('mail_campaigns').select('*').eq('id',b.campaign_id).single());validateCampaign(c);
  if(b.action==='stop'){
   check(await s.from('mail_campaigns').update({status:'partial',last_error:'stopped_by_administrator'}).eq('id',c.id).eq('status','sending'));
   check(await s.from('mail_campaign_recipients').update({status:'skipped',error:'stopped_by_administrator'}).eq('campaign_id',c.id).in('status',['queued','failed']));return json({stopped:true});
  }
  if(b.action==='review'){
   if(c.status!=='draft')throw new MailError('campaign_already_approved');
   const fingerprint=check(await s.rpc('psc_outreach_fingerprint',{p_id:c.id}));
   const recipients=check(await s.from('mail_campaign_recipients').select('id,email_snapshot,contact_id').eq('campaign_id',c.id).order('id').limit(501));if(!recipients.length||recipients.length>500)throw new MailError('choose_1_to_500_contacts');
   if(fingerprint!==check(await s.rpc('psc_outreach_fingerprint',{p_id:c.id})))throw new MailError('campaign_changed_or_setup_incomplete');
   return json({campaign:c,recipients,hash:fingerprint});
  }
  if(b.action==='approve'){
   if(b.approve!==true||typeof b.hash!=='string')throw new MailError('explicit_campaign_approval_required');
   await alias(s,await accessToken(s));const result=await s.rpc('psc_outreach_approve',{p_id:c.id,p_hash:b.hash,p_user:user.id});if(result.error)throw new MailError('campaign_changed_or_setup_incomplete');return json({queued:!!result.data,already_approved:!result.data});
  }
  throw new MailError('invalid_action');
 }catch(e){return json({error:safeCode(e)},safeCode(e)==='unauthorized'?401:safeCode(e)==='forbidden'?403:400)}
})
