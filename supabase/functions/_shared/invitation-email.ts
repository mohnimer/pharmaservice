import {composerFields} from './mailbox-compose.ts'
import {SENDER,check,send,mime,MailError,safeCode} from './psc-mail.ts'
import {verifySender} from './mail-senders.ts'
export const INVITATION_SUBJECT='Welcome to Pharma Service | Activate Your School Clinic Account';
export const ACTIVATION_PLACEHOLDER='[Activation Link]';
export function invitationEmailDraft(i:any,s:any){
 const saved=i.email_composition||{};
 if(saved.subject)return {id:i.id,...composerFields({...saved,compose_mode:'normal'})};
 const schools=s.schools.map((x:any)=>[x.name,x.campus_name].filter(Boolean).join(' — ')).join('; ');
 const body=`Dear ${i.full_name||'[Name]'},\n\nWelcome to Pharma Service.\n\nYour school clinic account has been prepared as part of our collaboration with ${s.g.slug==='aeg-education'?'Al Ansari Education Group':s.g.name}.\n\nSchool: ${schools}\nAccount email: ${i.recipient_email||'[Email]'}\n\nPlease use the secure link below to activate your account and create your password:\n\n${ACTIVATION_PLACEHOLDER}\n\nOnce activated, you can browse the catalogue, prepare supply requests and submit estimates to Pharma Service for quotation.\n\nFormal quotations will follow the agreed ${s.g.slug==='aeg-education'?'AEG Management':'management'} approval process.\n\nShould you require assistance, please contact Pharma Service.\n\nKind regards,\nMohamed Al Nimer\nManaging Director\nPharma Service Co. L.L.C.`;
 return {id:i.id,compose_mode:'normal',sender_alias:SENDER,to_recipients:i.recipient_email?[i.recipient_email]:[],cc_recipients:[],bcc_recipients:[],subject:INVITATION_SUBJECT,body_text:body};
}
export function invitationBodies(d:any,link?:string){
 if(/#activate-account\?|token_hash=/i.test(d.body_text))throw new MailError('use_activation_link_placeholder');
 const primary=d.to_recipients[0];
 const privateBody=d.body_text.includes(ACTIVATION_PLACEHOLDER)?d.body_text.split(ACTIVATION_PLACEHOLDER).join(link||ACTIVATION_PLACEHOLDER):d.body_text+'\n\nActivate your account: '+(link||ACTIVATION_PLACEHOLDER);
 const copyBody='Information copy — activation instructions have been sent privately to '+primary+'.\n\n'+d.body_text.split(ACTIVATION_PLACEHOLDER).join('Activation link sent privately to '+primary+'.');
 return {privateBody,copyBody};
}
export async function deliverInvitationCopies(svc:any,i:any,token:string,d:any){
 const additional=d.to_recipients.slice(1),cc=d.cc_recipients,bcc=d.bcc_recipients;
 if(!additional.length&&!cc.length&&!bcc.length)return 'not_requested';
 if(i.copy_status!=='pending')return i.copy_status;
 const claimed=check(await svc.from('psc_customer_invitations').update({copy_status:'sending',copy_last_error:null}).eq('id',i.id).eq('copy_status','pending').select('*').maybeSingle());if(!claimed)return 'sending';
 let attempted=false,accepted=false;
 try{
  await verifySender(token,d.sender_alias);
  const {copyBody}=invitationBodies(d);
  attempted=true;const r=await send(token,mime({to:additional.length?additional.join(', '):d.sender_alias,cc,bcc,from:d.sender_alias,subject:d.subject,text:copyBody,html:(globalThis as any).PSC_BUSINESS_EMAIL_HTML(copyBody),id:'invitation-copy-'+i.id+'-'+i.send_nonce}));accepted=true;
  check(await svc.from('psc_invitation_events').insert({invitation_id:i.id,event:'information_copy_sent',actor:i.approved_by||null,detail:{provider_message_id:r.id}}));
  check(await svc.from('psc_customer_invitations').update({copy_status:'accepted',copy_provider_message_id:r.id,copy_last_error:null}).eq('id',i.id).eq('copy_status','sending'));
  return 'accepted';
 }catch(e){const uncertain=accepted||(e instanceof MailError?e.uncertain:attempted),state=uncertain?'uncertain':'failed';await svc.from('psc_customer_invitations').update({copy_status:state,copy_last_error:safeCode(e)}).eq('id',i.id).eq('copy_status','sending');return state;}
}
