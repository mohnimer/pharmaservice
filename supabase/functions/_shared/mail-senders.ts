import {MAILBOX,MailError,gmail,mime} from './psc-mail.ts'
export const SALES='sales@pharmaservice.ae'
export const PROCUREMENT='procurement@pharmaservice.ae'
export function draftSender(kind:string){
 if(kind==='rfq')return PROCUREMENT;
 if(['quotation','followup'].includes(kind))return SALES;
 if(kind==='test')return MAILBOX;
 throw new MailError('unsupported_sender_workflow');
}
export function notificationSender(event:string){
 if(event==='quote_sent')return SALES;
 if(['institutional_enquiry_received','portal_order_received'].includes(event))return MAILBOX;
 throw new MailError('unsupported_sender_workflow');
}
export async function senderStatus(token:string){
 const data=await gmail(token,'settings/sendAs');
 return [SALES,PROCUREMENT].map(address=>({address,ready:!!data.sendAs?.some((s:any)=>s.sendAsEmail?.toLowerCase()===address&&s.verificationStatus==='accepted')}));
}
export async function verifySender(token:string,address:string){
 if(address===MAILBOX)return;
 if(![SALES,PROCUREMENT].includes(address))throw new MailError('unsupported_sender_workflow');
 if(!(await senderStatus(token)).some(s=>s.address===address&&s.ready))throw new MailError(address===SALES?'sales_alias_not_ready':'procurement_alias_not_ready');
}
export function routedMime(address:string,options:Parameters<typeof mime>[0]){
 if(![MAILBOX,SALES,PROCUREMENT].includes(address))throw new MailError('unsupported_sender_workflow');
 return mime(options).replace(`From: Pharma Service <${MAILBOX}>`,`From: Pharma Service <${address}>`).replace(`Reply-To: ${MAILBOX}`,`Reply-To: ${address}`);
}
