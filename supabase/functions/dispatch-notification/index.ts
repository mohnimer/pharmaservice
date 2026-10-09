import {service,admin,worker,accessToken,mime,send,check,logAttempt,noDemoOrder,safeCode,MailError,json} from '../_shared/psc-mail.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SENDER = 'info@pharmaservice.ae'
const DISPLAY_NAME = 'Pharma Service'
const PORTAL_URL = 'https://pharmaservice.ae/#portal/requests'
const ADMIN_REQUESTS_URL = 'https://pharmaservice.ae/#admin/requests'

const esc = (v: unknown='') => String(v ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c] as string))

const clean = (v: unknown) => {
  const s = String(v ?? '').trim()
  return s || null
}

const validEmail = (v: unknown) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim())

function shell(kicker:string,title:string,body:string,ctaLabel?:string,ctaUrl?:string){
  const cta=ctaLabel&&ctaUrl
    ? `<a href="${esc(ctaUrl)}" style="display:inline-block;margin-top:22px;background:#10211f;color:#fff;text-decoration:none;padding:13px 18px;border-radius:10px;font-size:13px;font-weight:700">${esc(ctaLabel)}</a>`
    : ''
  return `<!doctype html><html><body style="margin:0;background:#f2f4f3;font-family:Arial,Helvetica,sans-serif;color:#17211f"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f4f3;padding:28px 12px"><tr><td align="center"><table role="presentation" width="620" cellspacing="0" cellpadding="0" style="max-width:620px;width:100%;background:#fbfaf5;border:1px solid #dfe4e2;border-radius:18px;overflow:hidden"><tr><td style="padding:28px 34px 30px"><div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:#15978f">${esc(kicker)}</div><div style="height:1px;background:#d9d4cb;margin:18px 0 26px"></div><h1 style="font-size:32px;line-height:1.05;letter-spacing:-1px;margin:0 0 18px">${esc(title)}</h1>${body}${cta}<div style="height:1px;background:#d9d4cb;margin:34px 0 18px"></div><div style="font-size:12px;font-weight:700">Pharma Service Co. L.L.C.</div><div style="font-size:11px;line-height:1.55;color:#75807d;margin-top:5px">Institutional healthcare supply · Dubai, UAE<br>info@pharmaservice.ae</div></td></tr></table></td></tr></table></body></html>`
}

function row(label:string,value:unknown){
  const v=clean(value)
  if(!v) return ''
  return `<tr><td style="padding:8px 0;color:#7b8582;font-size:12px;vertical-align:top;width:160px">${esc(label)}</td><td style="padding:8px 0;color:#17211f;font-size:13px;font-weight:600;vertical-align:top">${esc(v)}</td></tr>`
}

function money(value:unknown,currency='AED'){
  const n=Number(value)
  if(!Number.isFinite(n)) return null
  return `${currency} ${n.toFixed(2)}`
}

async function requesterEmail(svc:any,userId:string|null){
  if(!userId) return null
  const {data,error}=await svc.auth.admin.getUserById(userId)
  if(error) return null
  return clean(data?.user?.email)
}

async function buildEnquiry(svc:any,notification:any){
  const {data:e,error}=await svc.from('institutional_enquiries').select('*').eq('id',notification.entity_id).single()
  if(error||!e) throw new Error('Enquiry record not found.')

  const details = `
    <p style="font-size:14px;line-height:1.65;color:#58615f;margin:0 0 16px">A new institutional requirement has been submitted through the Pharma Service website.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${row('Organization',e.organization)}
      ${row('Institution type',e.institution_type)}
      ${row('Sites',e.site_count)}
      ${row('Emirate',e.emirate)}
      ${row('Requirement type',e.requirement_type)}
      ${row('Required by',e.required_by)}
      ${row('Contact',e.name)}
      ${row('Phone',e.contact_number)}
      ${row('Email',e.contact_email)}
      ${row('RFQ / list',e.rfq_file_name)}
    </table>
    <div style="margin-top:18px;padding:16px;border-radius:12px;background:#f3f5f4">
      <div style="font-size:11px;font-weight:800;letter-spacing:.08em;color:#75807d;margin-bottom:7px">REQUIREMENT</div>
      <div style="font-size:14px;line-height:1.6;color:#27312f;white-space:pre-wrap">${esc(e.requirement)}</div>
    </div>`

  return {
    recipientEmail:SENDER,
    recipientName:'Pharma Service',
    subject:notification.subject || `New institutional enquiry — ${e.organization || 'New prospect'}`,
    html:shell('NEW INSTITUTIONAL ENQUIRY',e.organization || 'New institutional enquiry',details)
  }
}

async function buildPortalOrder(svc:any,notification:any){
  await new Promise(r=>setTimeout(r,850))

  const {data:o,error}=await svc.from('orders').select('*').eq('id',notification.entity_id).single()
  if(error||!o) throw new Error('Order record not found.')

  const [{data:school},{data:group},{data:lines}] = await Promise.all([
    o.school_id ? svc.from('schools').select('name,campus_name').eq('id',o.school_id).maybeSingle() : Promise.resolve({data:null}),
    o.group_id ? svc.from('account_groups').select('name').eq('id',o.group_id).maybeSingle() : Promise.resolve({data:null}),
    svc.from('order_lines').select('id,line_description,quantity').eq('order_id',o.id)
  ])

  const site=[school?.name,school?.campus_name].filter(Boolean).join(' — ')
  const details = `
    <p style="font-size:14px;line-height:1.65;color:#58615f;margin:0 0 16px">A live institutional account has submitted a new supply request.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${row('Request',o.order_number)}
      ${row('Account',group?.name)}
      ${row('Site',site)}
      ${row('Lines',(lines||[]).length)}
      ${row('Customer note',o.note)}
    </table>`

  return {
    recipientEmail:SENDER,
    recipientName:'Pharma Service',
    subject:notification.subject || `New portal request — ${o.order_number}`,
    html:shell('NEW PORTAL REQUEST',o.order_number,details,'Open request queue',ADMIN_REQUESTS_URL)
  }
}

async function buildQuoteSent(svc:any,notification:any){
  const {data:q,error:qError}=await svc.from('quotes').select('*').eq('id',notification.entity_id).single()
  if(qError||!q) throw new Error('Quotation record not found.')

  const {data:o,error:oError}=await svc.from('orders').select('*').eq('id',q.order_id).single()
  if(oError||!o) throw new Error('Order record not found for quotation.')

  const [{data:school},{data:group}] = await Promise.all([
    o.school_id ? svc.from('schools').select('name,campus_name,quote_email').eq('id',o.school_id).maybeSingle() : Promise.resolve({data:null}),
    o.group_id ? svc.from('account_groups').select('name').eq('id',o.group_id).maybeSingle() : Promise.resolve({data:null})
  ])

  let recipient=clean(school?.quote_email)
  if(!recipient) recipient=await requesterEmail(svc,o.requested_by)
  if(!recipient || !validEmail(recipient)) {
    throw new Error('No verified quotation recipient is configured for this account.')
  }

  const site=[school?.name,school?.campus_name].filter(Boolean).join(' — ')
  const amount=money(q.total,q.currency||'AED')
  const details = `
    <p style="font-size:14px;line-height:1.65;color:#58615f;margin:0 0 16px">Your Pharma Service quotation is ready in the Clinic Portal.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${row('Quotation',q.quote_number)}
      ${row('Account',group?.name)}
      ${row('Site',site)}
      ${row('Request',o.order_number)}
      ${row('Total',amount)}
      ${row('Validity',q.validity_days ? `${q.validity_days} calendar days` : null)}
      ${row('Delivery',q.delivery_terms)}
      ${row('Payment terms',q.payment_terms)}
    </table>
    <p style="font-size:12px;line-height:1.6;color:#75807d;margin:18px 0 0">The portal is the controlled record for the quotation. Availability, delivery timing and any regulated supply conditions remain subject to the terms recorded against the quotation.</p>`

  return {
    recipientEmail:recipient,
    recipientName:site || group?.name || 'Institutional customer',
    subject:notification.subject || `Quotation ${q.quote_number} — Pharma Service`,
    html:shell('QUOTATION READY',q.quote_number,details,'View quotation',PORTAL_URL)
  }
}

async function buildMessage(svc:any,notification:any){
  if(notification.event_type==='institutional_enquiry_received') return await buildEnquiry(svc,notification)
  if(notification.event_type==='portal_order_received') return await buildPortalOrder(svc,notification)
  if(notification.event_type==='quote_sent') return await buildQuoteSent(svc,notification)
  throw new Error(`Unsupported notification event type: ${notification.event_type}`)
}

Deno.serve(async req=>{
 if(req.method==='OPTIONS')return json({})
 if(req.method!=='POST')return json({error:'method_not_allowed'},405)
 const svc=service();let claimed:any=null,pending:any=null;let attemptedSend=false;
 try{
  if(!await worker(req,svc))await admin(req,svc)
  const body=await req.json(),id=body.notification_id;
  if(typeof id!=='string'||!/^[a-f0-9-]{36}$/i.test(id))throw new MailError('invalid_notification_id')
  if(!check(await svc.rpc('psc_mail_rate',{p_key:'dispatch',p_limit:10,p_seconds:60})))throw new MailError('rate_limited')
  const current=check(await svc.from('notification_outbox').select('*').eq('id',id).maybeSingle());if(!current)throw new MailError('notification_not_found')
  if(current.status==='sent')return json({already_accepted:true})
  pending=current;
  if(!['queued','failed'].includes(current.status)||current.attempts>=3||(current.next_attempt_at&&Date.parse(current.next_attempt_at)>Date.now()))return json({skipped:true,status:current.status})
  if(current.entity_type==='order')await noDemoOrder(svc,current.entity_id)
  if(current.event_type==='quote_sent'){
   const q=check(await svc.from('quotes').select('*').eq('id',current.entity_id).single());await noDemoOrder(svc,q.order_id)
   const fingerprint=check(await svc.rpc('psc_mail_quote_fingerprint',{p_order_id:q.order_id}));
   if(!current.approved_at||!current.approved_by||current.approved_fingerprint!==fingerprint||q.status!=='sent'||Number(current.payload?.revision)!==q.current_revision){
    check(await svc.from('notification_outbox').update({status:'held',last_error:'Quotation communication requires current administrator approval'}).eq('id',id));return json({held_for_approval:true})
   }
  }
  // Obtain the token before claiming. Lack of configuration must not consume send attempts.
  const token=await accessToken(svc)
  claimed=check(await svc.from('notification_outbox').update({status:'sending',attempts:current.attempts+1,last_attempt_at:new Date().toISOString(),last_error:null}).eq('id',id).eq('status',current.status).select('*').maybeSingle());if(!claimed)return json({claimed_elsewhere:true})
  const message=await buildMessage(svc,claimed);if(!validEmail(message.recipientEmail))throw new MailError('invalid_recipient')
  await logAttempt(svc,id,null,'started')
  attemptedSend=true;
  const result=await send(token,mime({to:message.recipientEmail,subject:message.subject,html:message.html,id:'notification-'+id}))
  check(await svc.from('notification_outbox').update({status:'sent',recipient_email:message.recipientEmail,recipient_name:message.recipientName,subject:message.subject,provider_message_id:result.id,accepted_at:new Date().toISOString(),sent_at:new Date().toISOString(),last_error:null}).eq('id',id))
  await logAttempt(svc,id,null,'gmail_accepted',null,result.id)
  check(await svc.from('psc_mail_messages').upsert({gmail_message_id:result.id,gmail_thread_id:result.threadId||result.id,direction:'outbound',kind:'notification',order_id:claimed.entity_type==='order'?claimed.entity_id:claimed.payload?.order_id||null,enquiry_id:claimed.entity_type==='enquiry'?claimed.entity_id:null,sender:SENDER,recipient:message.recipientEmail,subject:message.subject,received_at:new Date().toISOString(),review_status:'linked'}))
  return json({accepted_by_gmail:true,delivery_confirmed:false})
 }catch(e){
  const code=safeCode(e),unknown=e instanceof MailError?e.uncertain:attemptedSend;
  if(claimed){await svc.from('notification_outbox').update({status:unknown?'uncertain':'failed',last_error:code,next_attempt_at:unknown?null:new Date(Date.now()+5*60000).toISOString()}).eq('id',claimed.id).eq('status','sending');await logAttempt(svc,claimed.id,null,unknown?'uncertain':'failed',code).catch(()=>{})}
  else if(pending)await svc.from('notification_outbox').update({last_error:code}).eq('id',pending.id).in('status',['queued','failed']);
  return json({error:code},code==='unauthorized'?401:code==='forbidden'?403:503)
 }
})
