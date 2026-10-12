import {SENDER,MailError,gmail,mime} from './psc-mail.ts'
export const SALES=SENDER
export const PROCUREMENT=SENDER
export function draftSender(kind:string){
 if(['rfq','quotation','followup','test'].includes(kind))return SENDER;
 throw new MailError('unsupported_sender_workflow');
}
export function notificationSender(event:string){
 if(['quote_sent','institutional_enquiry_received','portal_order_received'].includes(event))return SENDER;
 throw new MailError('unsupported_sender_workflow');
}
export async function senderStatus(token:string){
 const data=await gmail(token,'settings/sendAs');
 return [{address:SENDER,ready:!!data.sendAs?.some((s:any)=>s.sendAsEmail?.toLowerCase()===SENDER&&s.verificationStatus==='accepted')}];
}
export async function verifySender(token:string,address:string){
 if(address!==SENDER)throw new MailError('unsupported_sender_workflow');
 if(!(await senderStatus(token)).some(s=>s.ready))throw new MailError('mohamed_sender_not_ready');
}
export function routedMime(address:string,options:Parameters<typeof mime>[0]){
 if(address!==SENDER)throw new MailError('unsupported_sender_workflow');
 return mime(options);
}
