import {service,admin,json,check,email,hash,MailError,safeCode,accessToken,send,mime,SENDER} from '../_shared/psc-mail.ts'
import {verifySender} from '../_shared/mail-senders.ts'
import '../_shared/business-email.js'
import {composerFields} from '../_shared/mailbox-compose.ts'
import {invitationEmailDraft,invitationBodies,deliverInvitationCopies} from '../_shared/invitation-email.ts'
const validUuid=(s:any)=>typeof s==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const text=(s:any,max:number)=>typeof s==='string'&&s.trim().length>0&&s.length<=max&&!/[\r\n]/.test(s);
async function scope(svc:any,b:any){
 if(!validUuid(b.group_id)||!validUuid(b.school_id)||!Array.isArray(b.school_ids)||b.school_ids.length<1||b.school_ids.length>100||new Set(b.school_ids).size!==b.school_ids.length||!b.school_ids.includes(b.school_id)||!b.school_ids.every(validUuid)||!['school_clinic_user','management_approver'].includes(b.role))throw new MailError('invalid_invitation_scope');
 const g=check(await svc.from('account_groups').select('*').eq('id',b.group_id).single());if(!g.active||g.slug==='psc-demo-group')throw new MailError('invalid_invitation_group');
 const schools=check(await svc.from('schools').select('id,name,campus_name,group_id,active').in('id',b.school_ids));if(schools.length!==b.school_ids.length||schools.some((s:any)=>s.group_id!==b.group_id||!s.active))throw new MailError('invalid_invitation_scope');return {g,schools};
}
async function candidate(svc:any,id:string,secret:string){
 if(!validUuid(id)||!/^([a-f0-9]{64})$/.test(secret||''))throw new MailError('invalid_activation_link');
 const i=check(await svc.from('psc_customer_invitations').select('*').eq('id',id).single());
 if(!['sent','pending_activation'].includes(i.status)||!i.expires_at||Date.parse(i.expires_at)<=Date.now()||i.token_hash!==await hash(secret))throw new MailError('invitation_expired_revoked_or_used');return i;
}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return json({});if(req.method!=='POST')return json({error:'method_not_allowed'},405);
 const svc=service();let claimed:any=null,attempted=false,accepted=false;
 try{
  const b=await req.json();
  if(b.action==='inspect'){
   if(!check(await svc.rpc('psc_mail_rate',{p_key:'invitation-inspect:'+await hash(b.id||''),p_limit:20,p_seconds:60})))throw new MailError('rate_limited');
   const i=await candidate(svc,b.id,b.token),s=await scope(svc,i);return json({email:i.recipient_email,full_name:i.full_name,schools:s.schools.map((x:any)=>[x.name,x.campus_name].filter(Boolean).join(' — '))});
  }
  if(b.action==='activate'){
   const jwt=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,''),r=await svc.auth.getUser(jwt);if(r.error||!r.data?.user?.email_confirmed_at)throw new MailError('verified_identity_required');
   const i=await candidate(svc,b.id,b.token),u=r.data.user;if(u.id!==i.auth_user_id||u.email?.toLowerCase()!==i.recipient_email)throw new MailError('invitation_identity_mismatch');
   return json(check(await svc.rpc('psc_activate_customer_invitation',{p_id:i.id,p_hash:await hash(b.token),p_user:u.id})));
  }
  const user=await admin(req,svc);
  if(b.action==='prepare_email'||b.action==='save_email'){
   const i=check(await svc.from('psc_customer_invitations').select('*').eq('id',b.id).single()),s=await scope(svc,i);if(i.status!=='draft')throw new MailError('invitation_locked');
   if(b.action==='prepare_email')return json(invitationEmailDraft(i,s));
   const fields=composerFields({...b,compose_mode:'normal'});invitationBodies(fields);
   const saved=check(await svc.from('psc_customer_invitations').update({recipient_email:fields.to_recipients[0],email_composition:fields,copy_status:fields.to_recipients.length+fields.cc_recipients.length+fields.bcc_recipients.length>1?'pending':'not_requested',copy_last_error:null,updated_at:new Date().toISOString()}).eq('id',i.id).eq('status','draft').eq('updated_at',i.updated_at).select('*').maybeSingle());if(!saved)throw new MailError('invitation_changed');return json({id:i.id,...fields});
  }
  if(b.action==='save_draft'){
   const s=await scope(svc,b);if(b.full_name&&!text(b.full_name,200)||b.recipient_email&&!email(b.recipient_email))throw new MailError('invalid_invitation_identity');
   const old=b.id?check(await svc.from('psc_customer_invitations').select('*').eq('id',b.id).single()):null;
   const previous=old?.email_composition||{},composition=previous.subject?{...previous,to_recipients:[b.recipient_email?.trim().toLowerCase()||'',...(previous.to_recipients||[]).slice(1)]}:{};
   const fields={email_composition:composition,group_id:b.group_id,school_id:b.school_id,school_ids:b.school_ids,role:b.role,full_name:b.full_name?.trim()||null,recipient_email:b.recipient_email?.trim().toLowerCase()||null,updated_at:new Date().toISOString()};
   const r=b.id?await svc.from('psc_customer_invitations').update(fields).eq('id',b.id).eq('status','draft').select('*').maybeSingle():await svc.from('psc_customer_invitations').insert({...fields,created_by:user.id}).select('*').single();const i=check(r);if(!i)throw new MailError('invitation_locked');return json(i);
  }
  if(b.action==='revoke'){
   const i=check(await svc.from('psc_customer_invitations').update({status:'revoked',revoked_at:new Date().toISOString(),token_hash:null,updated_at:new Date().toISOString()}).eq('id',b.id).in('status',['draft','sent','pending_activation','failed']).select('id').maybeSingle());if(!i)throw new MailError('invitation_locked');check(await svc.from('psc_invitation_events').insert({invitation_id:i.id,event:'revoked',actor:user.id}));return json({revoked:true});
  }
  if(b.action==='return_to_draft'){
   const i=check(await svc.from('psc_customer_invitations').select('*').eq('id',b.id).single());if(i.status!=='failed'&&(!['sent','pending_activation'].includes(i.status)||Date.parse(i.expires_at)>Date.now()))throw new MailError('only_expired_or_failed_invitation_can_be_reissued');
   const saved=check(await svc.from('psc_customer_invitations').update({status:'draft',token_hash:null,auth_user_id:null,updated_at:new Date().toISOString()}).eq('id',i.id).eq('updated_at',i.updated_at).select('id').maybeSingle());if(!saved)throw new MailError('invitation_changed');return json({draft:true});
  }
  if(b.action==='reconcile'){
   const i=check(await svc.from('psc_customer_invitations').select('*').eq('id',b.id).eq('status','uncertain').single()),token=await accessToken(svc);
   const found=await (await import('../_shared/psc-mail.ts')).gmail(token,'messages?'+new URLSearchParams({q:'in:sent rfc822msgid:psc-invitation-'+i.id+'-'+i.send_nonce+'@pharmaservice.ae',maxResults:'2'}));
   if(found.messages?.length!==1)return json({status:'uncertain'});
   check(await svc.from('psc_customer_invitations').update({status:'pending_activation',provider_message_id:found.messages[0].id,sent_at:new Date().toISOString(),last_error:null}).eq('id',i.id).eq('status','uncertain'));const s=await scope(svc,i),copy_status=await deliverInvitationCopies(svc,i,token,invitationEmailDraft(i,s));return json({accepted_by_gmail:true,copy_status});
  }
  if(b.action!=='send'||b.approve!==true)throw new MailError('explicit_invitation_send_approval_required');
  const i=check(await svc.from('psc_customer_invitations').select('*').eq('id',b.id).single()),s=await scope(svc,i);if(i.status!=='draft'||!text(i.full_name,200)||!email(i.recipient_email))throw new MailError('invitation_identity_and_draft_required');
  const existing=check(await svc.rpc('psc_find_invitation_user',{p_email:i.recipient_email}));
  if(!existing&&check(await svc.rpc('psc_invitation_has_legacy_provisioning',{p_email:i.recipient_email})))throw new MailError('legacy_provisioning_requires_scope_review');
  if(existing){const m=check(await svc.from('memberships').select('account_groups(slug)').eq('user_id',existing));if(m.some((x:any)=>x.account_groups?.slug==='psc-demo-group'))throw new MailError('demo_mail_disabled');}
  const pending=check(await svc.from('psc_customer_invitations').select('id').eq('recipient_email',i.recipient_email).in('status',['sending','sent','pending_activation','uncertain']).limit(1));if(pending.length)throw new MailError('recipient_has_outstanding_invitation_combine_school_scope');
  const origin=Deno.env.get('PSC_INVITATION_ORIGIN')||(Deno.env.get('SUPABASE_URL')==='https://ewewkojlsgqvcqarmpgr.supabase.co'?'https://pharmaservice.ae':null);if(!origin||!/^https:\/\/[a-zA-Z0-9.-]+$/.test(origin))throw new MailError('invitation_origin_configuration_required');
  const composition=invitationEmailDraft(i,s);if(composition.to_recipients[0]!==i.recipient_email)throw new MailError('invitation_identity_mismatch');invitationBodies(composition);
  const token=await accessToken(svc);await verifySender(token,composition.sender_alias);
  const nonce=crypto.randomUUID();claimed=check(await svc.from('psc_customer_invitations').update({status:'sending',approved_by:user.id,approved_at:new Date().toISOString(),send_nonce:nonce,updated_at:new Date().toISOString()}).eq('id',i.id).eq('status','draft').eq('updated_at',i.updated_at).select('*').maybeSingle());if(!claimed)throw new MailError('invitation_changed_or_claimed');
  const generated=await svc.auth.admin.generateLink({type:existing?'magiclink':'invite',email:i.recipient_email,options:{redirectTo:origin+'/#activate-account'}});if(generated.error||!generated.data?.properties?.hashed_token||!generated.data?.user?.id)throw new MailError('auth_activation_link_unavailable');
  const secret=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join(''),expires=new Date(Date.now()+3600000).toISOString();
  check(await svc.from('psc_customer_invitations').update({token_hash:await hash(secret),auth_user_id:generated.data.user.id,expires_at:expires}).eq('id',i.id).eq('status','sending'));
  const params=new URLSearchParams({id:i.id,token:secret,token_hash:generated.data.properties.hashed_token,type:existing?'magiclink':'invite'}),link=origin+'/#activate-account?'+params;
  const body=invitationBodies(composition,link).privateBody;
  const html=(globalThis as any).PSC_BUSINESS_EMAIL_HTML(body).replace((globalThis as any).PSC_EMAIL_ESC(link),'<a href="'+(globalThis as any).PSC_EMAIL_ESC(link)+'" style="display:inline-block;background:#122f31;color:#fff;padding:14px 20px;border-radius:12px;text-decoration:none">Activate your account</a>');
  attempted=true;const result=await send(token,mime({to:i.recipient_email,from:composition.sender_alias,subject:composition.subject,text:body,html,id:'invitation-'+i.id+'-'+nonce}));accepted=true;
  check(await svc.from('psc_customer_invitations').update({status:'pending_activation',provider_message_id:result.id,sent_at:new Date().toISOString(),last_error:null,updated_at:new Date().toISOString()}).eq('id',i.id).eq('status','sending'));
  check(await svc.from('psc_invitation_events').insert({invitation_id:i.id,event:'sent',actor:user.id,detail:{provider_message_id:result.id}}));const copy_status=await deliverInvitationCopies(svc,{...i,send_nonce:nonce,approved_by:user.id},token,composition);return json({accepted_by_gmail:true,delivery_confirmed:false,copy_status});
 }catch(e){const code=safeCode(e);if(claimed){const uncertain=accepted||(e instanceof MailError?e.uncertain:attempted);await svc.from('psc_customer_invitations').update({status:uncertain?'uncertain':'failed',last_error:code}).eq('id',claimed.id).eq('status','sending');}return json({error:code},code==='unauthorized'?401:400);}
})
