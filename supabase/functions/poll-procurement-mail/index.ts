import {service,admin,worker,accessToken,gmail,check,json,MAILBOX,unb64,safeCode,MailError} from '../_shared/psc-mail.ts'
const header=(m:any,name:string)=>m.payload?.headers?.find((h:any)=>h.name.toLowerCase()===name.toLowerCase())?.value||''
export function attachmentParts(p:any):any[]{return [...(p?.filename?[p]:[]),...(p?.parts||[]).flatMap(attachmentParts)]}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return json({})
 if(req.method!=='POST')return json({error:'method_not_allowed'},405)
 const svc=service();let authorized=false;
 try{
  if(!await worker(req,svc))await admin(req,svc);authorized=true
  if(!check(await svc.rpc('psc_mail_rate',{p_key:'poll',p_limit:1,p_seconds:240})))return json({skipped:true})
  const token=await accessToken(svc),conn=check(await svc.from('psc_mail_connection').select('*').eq('mailbox',MAILBOX).single())
  const params=new URLSearchParams({q:'label:PSC-Procurement -in:trash -in:spam newer_than:90d',maxResults:'20'});if(conn.poll_page_token)params.set('pageToken',conn.poll_page_token)
  const page=await gmail(token,'messages?'+params);let imported=0;
  for(const item of page.messages||[]){
   if(check(await svc.from('psc_mail_messages').select('id').eq('gmail_message_id',item.id).maybeSingle()))continue
   const metadata=await gmail(token,'messages/'+item.id+'?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date')
   if((metadata.labelIds||[]).includes('SENT'))continue
   const previous=check(await svc.from('psc_mail_messages').select('order_id,enquiry_id,kind').eq('gmail_thread_id',item.threadId).eq('review_status','linked').limit(101))||[]
   const links=new Set(previous.filter((x:any)=>x.order_id||x.enquiry_id).map((x:any)=>String(x.order_id||x.enquiry_id)));const linked=links.size===1&&previous.length<101?previous.find((x:any)=>x.order_id||x.enquiry_id):null;
   // Full content is imported only after an administrator labels it PSC-Procurement.
   const message=await gmail(token,'messages/'+item.id+'?format=full'),raw=await gmail(token,'messages/'+item.id+'?format=raw');
   const rawBytes=unb64(raw.raw);if(rawBytes.length>10*1024*1024)throw new MailError('message_size_exceeded')
   const root='inbound/'+item.id,rawPath=root+'/original.eml';check(await svc.storage.from('psc-correspondence').upload(rawPath,rawBytes,{contentType:'message/rfc822',upsert:true}))
   const attachments=[];for(const [i,part] of attachmentParts(message.payload).entries()){
    if(part.body?.size>10*1024*1024){attachments.push({file_name:part.filename,error:'attachment_size_exceeded'});continue}
    const bytes=part.body?.attachmentId?unb64((await gmail(token,'messages/'+item.id+'/attachments/'+encodeURIComponent(part.body.attachmentId))).data):unb64(part.body?.data||'');
    const path=root+'/attachment-'+i;const type=['application/pdf','text/plain','image/jpeg','image/png','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel'].includes(part.mimeType)?part.mimeType:'application/octet-stream';
    check(await svc.storage.from('psc-correspondence').upload(path,bytes,{contentType:type,upsert:true}));attachments.push({file_name:String(part.filename).slice(0,300),object_path:path,mime_type:type,size:bytes.length})
   }
   const textParts=(p:any):string[]=>[...(p?.mimeType==='text/plain'&&p?.body?.data?[new TextDecoder().decode(unb64(p.body.data))]:[]),...(p?.parts||[]).flatMap(textParts)];
   check(await svc.from('psc_mail_messages').upsert({gmail_message_id:item.id,gmail_thread_id:item.threadId,direction:'inbound',kind:'review',order_id:linked?.order_id||null,enquiry_id:linked?.enquiry_id||null,sender:header(metadata,'From').slice(0,500),recipient:header(metadata,'To').slice(0,500),subject:header(metadata,'Subject').slice(0,1000),received_at:new Date(Number(message.internalDate)).toISOString(),body_text:textParts(message.payload).join('\n').slice(0,100000),raw_object_path:rawPath,attachments,review_status:linked?'linked':'unmatched'}));imported++
  }
  check(await svc.from('psc_mail_connection').update({poll_page_token:page.nextPageToken||null,last_poll_at:new Date().toISOString(),last_error:null}).eq('mailbox',MAILBOX))
  return json({imported,more:!!page.nextPageToken})
 }catch(e){if(authorized)await svc.from('psc_mail_connection').update({last_error:safeCode(e)}).eq('mailbox',MAILBOX);return json({error:safeCode(e)},safeCode(e)==='unauthorized'?401:503)}
})
