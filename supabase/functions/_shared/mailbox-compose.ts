import {email,MailError,gmail,mime,SENDER} from './psc-mail.ts'
export const ALIASES=[SENDER,'info@pharmaservice.ae','outreach@pharmaservice.ae'];
export function addresses(value:any):string[]{
 if(Array.isArray(value))value=value.join(',');
 if(typeof value!=='string'||/[\r\n]/.test(value)||value.length>6000)throw new MailError('invalid_recipient_headers');
 if(!value.trim())return [];
 const parts=value.match(/(?:"[^"]*"\s*)?<[^<>]+>|[^,;]+/g)||[];
 const out=parts.map(p=>(p.match(/<([^<>]+)>/)?.[1]||p).trim().toLowerCase());
 if(out.some(p=>!email(p))||out.length>20)throw new MailError('invalid_recipient_headers');return [...new Set(out)];
}
export function composerFields(b:any){
 if(!['normal','intro','followup','onboarding','workshop','reply','reply_all','forward'].includes(b.compose_mode)||!ALIASES.includes(b.sender_alias))throw new MailError('invalid_composer_mode');
 const to=addresses(b.to_recipients),cc=addresses(b.cc_recipients||[]).filter(x=>!to.includes(x)),bcc=addresses(b.bcc_recipients||[]).filter(x=>!to.includes(x)&&!cc.includes(x));
 if(!to.length||to.length+cc.length+bcc.length>20||typeof b.subject!=='string'||!b.subject.trim()||/[\r\n]/.test(b.subject)||b.subject.length>300||typeof b.body_text!=='string'||!b.body_text.trim()||b.body_text.length>30000)throw new MailError('invalid_email');
 return {compose_mode:b.compose_mode,sender_alias:b.sender_alias,to_recipients:to,cc_recipients:cc,bcc_recipients:bcc,recipient:to.join(', '),subject:b.subject.trim(),body_text:b.body_text};
}
export async function aliasStatus(token:string){const data=await gmail(token,'settings/sendAs');return ALIASES.map(address=>({address,ready:!!data.sendAs?.some((s:any)=>s.sendAsEmail?.toLowerCase()===address&&s.verificationStatus==='accepted')}));}
// Gmail metadata uses RFC mailbox headers, including folded lines and display names.
// Typed composer envelopes remain strict and reject all newline input.
export function headerAddresses(value:string):string[]{
 const raw=value.replace(/\r?\n[ \t]+/g,' ');
 if(/[\r\n]/.test(raw)||raw.length>64000)throw new MailError('invalid_recipient_headers');
 const out:string[]=[];let part='',quoted=false,escaped=false,comment=0,angle=false;
 const flush=()=>{const text=part.trim();part='';if(!text)return;const found=text.match(/<([^<>]+)>/);const address=(found?.[1]||text).trim().toLowerCase();if(!email(address))throw new MailError('invalid_recipient_headers');out.push(address);};
 for(const char of raw){
  if(escaped){if(!comment)part+=char;escaped=false;continue;}
  if(char==='\\'&&(quoted||comment)){if(!comment)part+=char;escaped=true;continue;}
  if(comment){if(char==='(')comment++;else if(char===')')comment--;continue;}
  if(char==='"'){quoted=!quoted;part+=char;continue;}
  if(!quoted&&char==='('){comment=1;continue;}
  if(!quoted&&char==='<')angle=true;else if(!quoted&&char==='>')angle=false;
  if(!quoted&&!angle&&char===':'&&!part.includes('@')){part='';continue;}
  if(!quoted&&!angle&&(char===','||char===';')){
   // A comma inside an unquoted display name is not an address separator.
   if(part.includes('>')||email(part.trim())||char===';')flush();else part+=char;
  }else part+=char;
 }
 if(quoted||comment||angle||escaped)throw new MailError('invalid_recipient_headers');flush();
 return [...new Set(out)];
}
export async function sourceContext(source:any,token:string,mode:string){
 if(!source||!/^[\w-]+$/.test(source.gmail_message_id))throw new MailError('invalid_source_email');
 const m=await gmail(token,'messages/'+source.gmail_message_id+'?format=metadata&metadataHeaders=From&metadataHeaders=Reply-To&metadataHeaders=To&metadataHeaders=Cc&metadataHeaders=Subject&metadataHeaders=Message-ID&metadataHeaders=References');
 const h=(name:string)=>(m.payload?.headers||[]).filter((x:any)=>x.name?.toLowerCase()===name.toLowerCase()).map((x:any)=>x.value||'').join(', ');
 const own=(xs:string[])=>xs.filter(x=>!ALIASES.includes(x));
 const to=own(headerAddresses(source.direction==='outbound'?h('To'):h('Reply-To')||h('From')));
 const cc=mode==='reply_all'?own([...headerAddresses(h('To')), ...headerAddresses(h('Cc'))]).filter(x=>!to.includes(x)):[];
 const subject=source.subject||h('Subject');if(/[\r\n]/.test(subject))throw new MailError('invalid_source_email');
 const id=h('Message-ID').trim(),references=[...(h('References').match(/<[^<>\s]+>/g)||[]).slice(-15),id].join(' ');
 return {to_recipients:mode==='forward'?[]:to,cc_recipients:cc,bcc_recipients:[],subject:(mode==='forward'?(/^fwd:/i.test(subject)?subject:'Fwd: '+subject):(/^re:/i.test(subject)?subject:'Re: '+subject)).slice(0,300),threadId:m.threadId||source.gmail_thread_id,inReplyTo:/^<[^<>\s]+>$/.test(id)?id:null,references};
}
export function composerMime(d:any,context:any,attachments:any[]=[] ){return mime({to:d.recipient,cc:d.cc_recipients,bcc:d.bcc_recipients,from:d.sender_alias,attachments,subject:d.subject,text:(globalThis as any).PSC_BUSINESS_EMAIL_SIGNED_TEXT(d.body_text),html:(globalThis as any).PSC_BUSINESS_EMAIL_HTML(d.body_text),id:'draft-'+d.id,...(context?.inReplyTo?{inReplyTo:context.inReplyTo,references:context.references}:{})});}
