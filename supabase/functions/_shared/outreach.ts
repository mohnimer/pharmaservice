import {MAILBOX,MailError,email,gmail,mime} from './psc-mail.ts'
export const OUTREACH='outreach@pharmaservice.ae'
export const eligible=(c:any)=>c?.status==='active'&&!c.unsubscribed_at&&['manual_permission','requested_updates'].includes(c.marketing_basis)
export async function verifyAlias(token:string){const data=await gmail(token,'settings/sendAs');if(!data.sendAs?.some((s:any)=>s.sendAsEmail?.toLowerCase()===OUTREACH&&s.verificationStatus==='accepted'))throw new MailError('outreach_alias_not_ready')}
const esc=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))
export function validateCampaign(c:any){
 if(c?.sender_email!==OUTREACH||typeof c.subject!=='string'||!c.subject.trim()||c.subject.length>160||/[\r\n]/.test(c.subject)||typeof c.intro!=='string'||!c.intro.trim()||c.intro.length>1200)throw new MailError('invalid_campaign')
 let u:URL;try{u=new URL(c.cta_url)}catch{throw new MailError('invalid_campaign_link')}
 if(u.protocol!=='https:'||u.hostname!=='pharmaservice.ae'||u.username||u.password||u.port)throw new MailError('invalid_campaign_link')
 if(typeof c.cta_label!=='string'||!c.cta_label.trim()||c.cta_label.length>80)throw new MailError('invalid_campaign')
}
export function marketingMime(c:any,r:any,token:string|null,attemptId:string){
 validateCampaign(c);if(!email(r.email_snapshot)||!/^[-a-z0-9]+$/i.test(attemptId))throw new MailError('invalid_message_headers')
 if(token!==null&&!/^[0-9a-f-]{36}$/i.test(token))throw new MailError('invalid_unsubscribe_token')
 const unsubscribe=token?'https://pharmaservice.ae/?token='+token+'#unsubscribe':null;
 const endpoint=token?'https://ewewkojlsgqvcqarmpgr.supabase.co/functions/v1/mail-unsubscribe?token='+token:null;
 const html=`<!doctype html><html><body style="margin:0;background:#f7f7f0;color:#163d35;font-family:Arial,Helvetica,sans-serif"><div style="max-width:600px;margin:auto;padding:36px 24px"><p style="font-size:12px;letter-spacing:2px">PHARMA SERVICE · ${['custom','supply-note'].includes(c.template)?'INSTITUTIONAL SUPPLY':'THE WORKSHOP'}</p><h1 style="font-size:28px;line-height:1.25">${esc(['custom','supply-note'].includes(c.template)?c.subject:c.workshop_title||c.subject)}</h1><p style="line-height:1.7;white-space:pre-line">${esc(c.intro)}</p><p><a style="display:inline-block;padding:14px 20px;background:#17695e;color:white;text-decoration:none;border-radius:6px" href="${esc(c.cta_url)}">${esc(c.cta_label)}</a></p><hr style="border:0;border-top:1px solid #dce0d5;margin-top:32px"><p style="font-size:12px;line-height:1.6">Pharma Service Co. L.L.C. · Ras Al Khor, Dubai, UAE<br>Reply to ${OUTREACH}${unsubscribe?'<br><a href="'+esc(unsubscribe)+'">Unsubscribe from marketing emails</a>':'<br>Internal preview only — no contact subscription is changed.'}</p></div></body></html>`
 const raw=mime({to:r.email_snapshot,subject:c.subject,html,id:'outreach-'+attemptId});
 return raw.replace(`From: Pharma Service <${MAILBOX}>`,`From: Pharma Service <${OUTREACH}>`).replace(`Reply-To: ${MAILBOX}`,`Reply-To: ${OUTREACH}`).replace('MIME-Version: 1.0',endpoint?`List-Unsubscribe: <${endpoint}>\r\nList-Unsubscribe-Post: List-Unsubscribe=One-Click\r\nMIME-Version: 1.0`:'MIME-Version: 1.0')
}
