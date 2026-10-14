import {SENDER,MailError,gmail,mime} from './psc-mail.ts'
const ALIASES=[SENDER,'info@pharmaservice.ae','outreach@pharmaservice.ae'];
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
 return ALIASES.map(address=>({address,ready:!!data.sendAs?.some((s:any)=>s.sendAsEmail?.toLowerCase()===address&&s.verificationStatus==='accepted')}));
}
export async function verifySender(token:string,address:string){
 if(!ALIASES.includes(address))throw new MailError('unsupported_sender_workflow');
 if(!(await senderStatus(token)).some(s=>s.address===address&&s.ready))throw new MailError(address===SENDER?'mohamed_sender_not_ready':'selected_sender_not_verified_in_gmail');
}
export function routedMime(address:string,options:Parameters<typeof mime>[0]){
 if(!ALIASES.includes(address))throw new MailError('unsupported_sender_workflow');
 return mime({...options,from:address});
}
