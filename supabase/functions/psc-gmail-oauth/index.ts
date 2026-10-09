import {service,admin,json,MAILBOX,SCOPES,CALLBACK,config,hash,exchange,gmail,check,safeCode,MailError} from '../_shared/psc-mail.ts'
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return json({})
 const svc=service(),url=new URL(req.url)
 try{
  if(req.method==='GET'){
   const state=url.searchParams.get('state')||'';if(!/^[a-f0-9]{64}$/.test(state))throw new MailError('invalid_oauth_state')
   const userId=check(await svc.rpc('psc_mail_consume_state',{p_hash:await hash(state)}));if(!userId)throw new MailError('expired_or_replayed_oauth_state')
   const profile=check(await svc.from('profiles').select('is_psc_admin').eq('user_id',userId).maybeSingle());if(!profile?.is_psc_admin)throw new MailError('forbidden')
   if(url.searchParams.has('error'))throw new MailError('google_consent_not_granted')
   const code=url.searchParams.get('code');if(!code)throw new MailError('missing_oauth_code')
   const token=await exchange({code,grant_type:'authorization_code',redirect_uri:CALLBACK})
   const scopes=new Set(String(token.scope||'').split(' '));if(SCOPES.some(s=>!scopes.has(s)))throw new MailError('required_scope_not_granted')
   const identity=await gmail(token.access_token,'profile');if(identity.emailAddress?.toLowerCase()!==MAILBOX)throw new MailError('wrong_mailbox_rejected')
   if(!token.refresh_token)throw new MailError('offline_consent_required')
   check(await svc.rpc('psc_mail_secret',{p_operation:'set',p_value:token.refresh_token}))
   check(await svc.from('psc_mail_connection').upsert({mailbox:MAILBOX,status:'connected',connected_by:userId,connected_at:new Date().toISOString(),last_error:null}))
   return new Response(null,{status:303,headers:{Location:'https://pharmaservice.ae/#admin/requests','Cache-Control':'no-store','Referrer-Policy':'no-referrer'}})
  }
  if(req.method!=='POST')return json({error:'method_not_allowed'},405)
  const user=await admin(req,svc),body=await req.json()
  if(body.action==='status')return json({configured:!!Deno.env.get('PSC_GOOGLE_OAUTH_CLIENT_ID')&&!!Deno.env.get('PSC_GOOGLE_OAUTH_CLIENT_SECRET'),connection:check(await svc.from('psc_mail_connection').select('mailbox,status,connected_at,last_error,last_poll_at').eq('mailbox',MAILBOX).maybeSingle()),callback:CALLBACK})
  if(body.action==='disconnect'){
   const refresh=check(await svc.rpc('psc_mail_secret',{p_operation:'get'}));if(refresh){const r=await fetch('https://oauth2.googleapis.com/revoke',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({token:refresh}),signal:AbortSignal.timeout(15000)});if(!r.ok&&r.status!==400)throw new MailError('google_revocation_failed')}
   check(await svc.rpc('psc_mail_secret',{p_operation:'delete'}));check(await svc.from('psc_mail_connection').upsert({mailbox:MAILBOX,status:'disconnected',last_error:null}));return json({disconnected:true})
  }
  if(body.action!=='connect')throw new MailError('invalid_action')
  const {clientId}=config(),state=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('')
  check(await svc.from('psc_mail_oauth_states').insert({state_hash:await hash(state),created_by:user.id,expires_at:new Date(Date.now()+10*60000).toISOString()}))
  const auth=new URL('https://accounts.google.com/o/oauth2/v2/auth');auth.search=new URLSearchParams({client_id:clientId,redirect_uri:CALLBACK,response_type:'code',scope:SCOPES.join(' '),access_type:'offline',prompt:'consent',state,login_hint:MAILBOX,hd:'pharmaservice.ae',include_granted_scopes:'false'}).toString()
  return json({authorization_url:auth.toString()})
 }catch(e){return json({error:safeCode(e)},safeCode(e)==='unauthorized'?401:safeCode(e)==='forbidden'?403:400)}
})
