import {service,worker,accessToken,mime,send,json,MailError} from '../_shared/psc-mail.ts'
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return json({ok:true})
 const svc=service()
 try{
  if(req.method!=='POST'||!await worker(req,svc))return json({error:'forbidden'},403)
  const claim=await svc.rpc('ps_readiness_email',{p_action:'claim'})
  if(claim.error)throw claim.error
  const n=claim.data;if(!n)return json({processed:0})
  let started=false
  try{
   const token=await accessToken(svc)
   const check=await svc.rpc('ps_readiness_email',{p_action:'recheck',p_id:n.id})
   if(check.error||!check.data?.authorized)return json({processed:0})
   // No medical data or readiness finding goes in email. The link enforces current portal access.
   const title=n.kind==='report'?'Your PS Report Card is ready':n.kind==='overdue'?'Weekly Clinic Check reminder':'Your Weekly Clinic Check is due'
   const origin=Deno.env.get('PS_WORKSHOP_ORIGIN')
   if(!origin||!/^https:\/\//.test(origin))throw new MailError('workshop_origin_required')
   const url=origin+'/#'+(n.kind==='report'?'portal/report-card/'+n.report_id:'portal/readiness')
   const text=title+'\n\nSign in to your authorized Clinic Portal to review: '+url+'\n\nThis is a self-reported PS pilot, not regulatory certification.'
   const raw=mime({to:n.email,subject:title,text,id:n.id})
   started=true
   const sent=await send(token,raw)
   const finish=await svc.rpc('ps_readiness_email',{p_action:'finish',p_id:n.id,p_state:'sent',p_provider:sent.id})
   if(finish.error)throw new MailError('delivery_record_uncertain',true)
   return json({processed:1})
  }catch(e){
   await svc.rpc('ps_readiness_email',{p_action:'finish',p_id:n.id,p_state:started?'uncertain':'failed'})
   return json({error:started?'delivery_uncertain':'delivery_failed'},502)
  }
 }catch{return json({error:'workshop_worker_failed'},500)}
})
