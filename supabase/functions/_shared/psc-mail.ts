import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.57.4'
export const MAILBOX='info@pharmaservice.ae'
export const SCOPES=['https://www.googleapis.com/auth/gmail.send','https://www.googleapis.com/auth/gmail.readonly']
export const CALLBACK='https://ewewkojlsgqvcqarmpgr.supabase.co/functions/v1/psc-gmail-oauth'
export const cors={'Access-Control-Allow-Origin':'https://pharmaservice.ae','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin'}
export const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'content-type':'application/json','Cache-Control':'no-store'}})
export class MailError extends Error {constructor(public code:string,public uncertain=false){super(code)}}
export const safeCode=(e:unknown)=>e instanceof MailError?e.code:'mail_operation_failed'
export const service=()=>createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}})
export function check<T=any>(r:{data:T,error:unknown}):T{if(r.error)throw new MailError('storage_operation_failed');return r.data}
export async function admin(req:Request,svc:any){
 const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');if(!token)throw new MailError('unauthorized')
 const {data,error}=await svc.auth.getUser(token);if(error||!data.user)throw new MailError('unauthorized')
 const p=check(await svc.from('profiles').select('is_psc_admin').eq('user_id',data.user.id).maybeSingle());if(!p?.is_psc_admin)throw new MailError('forbidden')
 const m=check(await svc.from('memberships').select('account_groups(slug)').eq('user_id',data.user.id));
 if(m?.some((x:any)=>x.account_groups?.slug==='psc-demo-group'))throw new MailError('demo_mail_disabled')
 if(!check(await svc.rpc('psc_mail_rate',{p_key:'admin:'+data.user.id,p_limit:20,p_seconds:60})))throw new MailError('rate_limited')
 return data.user
}
export async function worker(req:Request,svc:any){const token=req.headers.get('x-psc-worker')||'';return !!check(await svc.rpc('psc_mail_worker_valid',{p_token:token}))}
export const email=(s:unknown)=>typeof s==='string'&&s.length<=254&&/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(s)
export function b64(bytes:Uint8Array){let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s)}
export const b64url=(s:string)=>b64(new TextEncoder().encode(s)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
export const unb64=(s:string)=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))
export async function hash(s:string|Uint8Array){const out=await crypto.subtle.digest('SHA-256',typeof s==='string'?new TextEncoder().encode(s):new Uint8Array(s).buffer);return Array.from(new Uint8Array(out),b=>b.toString(16).padStart(2,'0')).join('')}
export function config(){const clientId=Deno.env.get('PSC_GOOGLE_OAUTH_CLIENT_ID'),clientSecret=Deno.env.get('PSC_GOOGLE_OAUTH_CLIENT_SECRET');if(!clientId||!clientSecret)throw new MailError('oauth_configuration_required');return {clientId,clientSecret}}
export async function exchange(params:Record<string,string>){
 const {clientId,clientSecret}=config();let response:Response;
 try{response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({...params,client_id:clientId,client_secret:clientSecret}),signal:AbortSignal.timeout(15000)})}catch{throw new MailError('google_token_unavailable')}
 const data=await response.json();if(!response.ok)throw new MailError(data?.error==='invalid_grant'?'reconnect_required':'google_token_failed');if(!data.access_token)throw new MailError('google_token_failed');return data
}
export async function accessToken(svc:any){
 const connection=check(await svc.from('psc_mail_connection').select('status').eq('mailbox',MAILBOX).maybeSingle());if(connection?.status!=='connected')throw new MailError('reconnect_required')
 const refresh=check(await svc.rpc('psc_mail_secret',{p_operation:'get'}));if(!refresh)throw new MailError('reconnect_required')
 try{const token=await exchange({grant_type:'refresh_token',refresh_token:refresh});if(token.refresh_token)check(await svc.rpc('psc_mail_secret',{p_operation:'set',p_value:token.refresh_token}));return token.access_token as string}
 catch(e){if(safeCode(e)==='reconnect_required')check(await svc.from('psc_mail_connection').update({status:'reconnect_required',last_error:'reconnect_required'}).eq('mailbox',MAILBOX));throw e}
}
export async function gmail(token:string,path:string,options:RequestInit={}){
 let r:Response;const sending=path==='messages/send';
 try{r=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/'+path,{...options,headers:{...options.headers,Authorization:'Bearer '+token,'content-type':'application/json'},signal:AbortSignal.timeout(20000)})}catch{throw new MailError(sending?'send_outcome_unknown':'gmail_unavailable',sending)}
 if(!r.ok){if(r.status===429)throw new MailError('gmail_rate_limited');if(r.status===401)throw new MailError('reconnect_required');if(r.status===403)throw new MailError('gmail_permission_denied');throw new MailError(sending&&r.status>=500?'send_outcome_unknown':'gmail_request_failed',sending&&r.status>=500)}
 return await r.json()
}
export function mime({to,subject,text,html,id,pdf}:{to:string,subject:string,text?:string,html?:string,id:string,pdf?:Uint8Array}){
 if(!email(to)||/[\r\n]/.test(subject)||subject.length>300)throw new MailError('invalid_message_headers')
 const boundary='psc-'+id.replace(/[^a-z0-9-]/gi,''),encoded='=?UTF-8?B?'+b64(new TextEncoder().encode(subject))+'?=';
 const headers=[`From: Pharma Service <${MAILBOX}>`,`Reply-To: ${MAILBOX}`,`To: ${to}`,`Subject: ${encoded}`,`Message-ID: <psc-${id}@pharmaservice.ae>`,'MIME-Version: 1.0'];
 const bodyType=html?'text/html':'text/plain',body=b64(new TextEncoder().encode(html||text||'')).match(/.{1,76}/g)?.join('\r\n')||'';
 if(!pdf)return headers.concat([`Content-Type: ${bodyType}; charset=UTF-8`,'Content-Transfer-Encoding: base64','','',body]).join('\r\n');
 return headers.concat([`Content-Type: multipart/mixed; boundary="${boundary}"`,'','',`--${boundary}`,`Content-Type: ${bodyType}; charset=UTF-8`,'Content-Transfer-Encoding: base64','',body,`--${boundary}`,'Content-Type: application/pdf','Content-Disposition: attachment; filename="PSC-quotation.pdf"','Content-Transfer-Encoding: base64','',b64(pdf).match(/.{1,76}/g)!.join('\r\n'),`--${boundary}--`]).join('\r\n')
}
export async function send(token:string,raw:string){const r=await gmail(token,'messages/send',{method:'POST',body:JSON.stringify({raw:b64url(raw)})});if(!r.id)throw new MailError('send_outcome_unknown',true);return r}
export async function noDemoOrder(svc:any,orderId:string){const o=check(await svc.from('orders').select('*,account_groups(slug)').eq('id',orderId).single());if(o.account_groups?.slug==='psc-demo-group')throw new MailError('demo_mail_disabled');return o}
export async function logAttempt(svc:any,notificationId:string|null,draftId:string|null,status:string,errorCode:string|null=null,providerId:string|null=null){check(await svc.from('psc_mail_attempts').insert({notification_id:notificationId,draft_id:draftId,status,error_code:errorCode,provider_message_id:providerId}))}
