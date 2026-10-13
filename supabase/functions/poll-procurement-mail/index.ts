import {service,admin,worker,accessToken,gmail,check,json,MAILBOX,unb64,safeCode,MailError} from '../_shared/psc-mail.ts'
const header=(m:any,name:string)=>m.payload?.headers?.find((h:any)=>h.name.toLowerCase()===name.toLowerCase())?.value||''
export function attachmentParts(p:any):any[]{return [...(p?.filename?[p]:[]),...(p?.parts||[]).flatMap(attachmentParts)]}
export function messageText(p:any):string{
 const collect=(part:any,type:string):string[]=>[...(part?.mimeType===type&&part?.body?.data?[new TextDecoder().decode(unb64(part.body.data))]:[]),...(part?.parts||[]).flatMap((x:any)=>collect(x,type))];
 const plain=collect(p,'text/plain').join('\n');if(plain.trim())return plain.slice(0,100000);
 return collect(p,'text/html').join('\n').replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<br\s*\/?\s*>|<\/(p|div|tr|li|h[1-6])>/gi,'\n').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").slice(0,100000);
}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return json({})
 if(req.method!=='POST')return json({error:'method_not_allowed'},405)
 const svc=service();let authorized=false;
 try{
  if(!await worker(req,svc))await admin(req,svc);authorized=true
  if(!check(await svc.rpc('psc_mail_rate',{p_key:'poll',p_limit:1,p_seconds:240})))return json({skipped:true})
  const token=await accessToken(svc),conn=check(await svc.from('psc_mail_connection').select('*').eq('mailbox',MAILBOX).single())
  const params=new URLSearchParams({q:'-in:trash -in:spam -in:drafts',maxResults:'20'});if(conn.poll_page_token)params.set('pageToken',conn.poll_page_token)
  const page=await gmail(token,'messages?'+params);
  // Check recent mail on every tick while independently advancing older history.
  const fresh=conn.poll_page_token?await gmail(token,'messages?'+new URLSearchParams({q:'-in:trash -in:spam -in:drafts newer_than:7d',maxResults:'20'})):page;
  const items=[...new Map([...(fresh.messages||[]),...(page.messages||[])].map((x:any)=>[x.id,x])).values()] as any[];let imported=0;const errors:string[]=[];
  for(const item of items){try{ 
   if(check(await svc.from('psc_mail_messages').select('id').eq('gmail_message_id',item.id).maybeSingle()))continue
   const metadata=await gmail(token,'messages/'+item.id+'?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date')
   if((metadata.labelIds||[]).some((l:string)=>['TRASH','SPAM','DRAFT'].includes(l)))continue
   const outbound=(metadata.labelIds||[]).includes('SENT');
   const previous=check(await svc.from('psc_mail_messages').select('order_id,enquiry_id,kind').eq('gmail_thread_id',item.threadId).eq('review_status','linked').limit(101))||[]
   const links=new Set(previous.filter((x:any)=>x.order_id||x.enquiry_id).map((x:any)=>String(x.order_id||x.enquiry_id)));const linked=links.size===1&&previous.length<101?previous.find((x:any)=>x.order_id||x.enquiry_id):null;
   // The administrator has enabled the full connected business mailbox.
   const message=await gmail(token,'messages/'+item.id+'?format=full');
   // Avoid downloading/decoding oversized raw MIME; preserve the message and bounded attachments.
   const raw=Number(metadata.sizeEstimate||message.sizeEstimate||0)<=10*1024*1024?await gmail(token,'messages/'+item.id+'?format=raw'):null;
   const rawBytes=raw?.raw&&raw.raw.length<=Math.ceil(10*1024*1024*4/3)+16?unb64(raw.raw):new Uint8Array();const storeRaw=rawBytes.length>0&&rawBytes.length<=10*1024*1024
   const root='inbound/'+item.id,rawPath=root+'/original.eml';if(storeRaw)check(await svc.storage.from('psc-correspondence').upload(rawPath,rawBytes,{contentType:'message/rfc822',upsert:true}))
   const attachments=[];for(const [i,part] of attachmentParts(message.payload).entries()){
    if(part.body?.size>10*1024*1024){attachments.push({file_name:part.filename,error:'attachment_size_exceeded'});continue}
    const bytes=part.body?.attachmentId?unb64((await gmail(token,'messages/'+item.id+'/attachments/'+encodeURIComponent(part.body.attachmentId))).data):unb64(part.body?.data||'');
    const path=root+'/attachment-'+i;const type=['application/pdf','text/plain','image/jpeg','image/png','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel'].includes(part.mimeType)?part.mimeType:'application/octet-stream';
    check(await svc.storage.from('psc-correspondence').upload(path,bytes,{contentType:type,upsert:true}));attachments.push({file_name:String(part.filename).slice(0,300),object_path:path,mime_type:type,size:bytes.length})
   }
   check(await svc.from('psc_mail_messages').upsert({gmail_message_id:item.id,gmail_thread_id:item.threadId,direction:outbound?'outbound':'inbound',kind:'review',order_id:linked?.order_id||null,enquiry_id:linked?.enquiry_id||null,sender:header(metadata,'From').slice(0,500),recipient:header(metadata,'To').slice(0,500),subject:header(metadata,'Subject').slice(0,1000),received_at:new Date(Number(message.internalDate)).toISOString(),body_text:messageText(message.payload),raw_object_path:storeRaw?rawPath:null,attachments,review_status:outbound||linked?'linked':'unmatched'}));imported++
  }catch(e){errors.push(safeCode(e));if(['reconnect_required','gmail_permission_denied','gmail_rate_limited'].includes(safeCode(e)))throw e;}
  }
  check(await svc.from('psc_mail_connection').update({poll_page_token:page.nextPageToken||null,last_poll_at:new Date().toISOString(),last_error:errors.length?errors[0]:null}).eq('mailbox',MAILBOX))
  return json({imported,more:!!page.nextPageToken,skipped_messages:errors.length})
 }catch(e){if(authorized)await svc.from('psc_mail_connection').update({last_error:safeCode(e)}).eq('mailbox',MAILBOX);return json({error:safeCode(e)},safeCode(e)==='unauthorized'?401:503)}
})
