import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SENDER='info@pharmaservice.ae'
const DISPLAY_NAME='Pharma Service'
const GMAIL_SEND_SCOPE='https://www.googleapis.com/auth/gmail.send'
const GOOGLE_TOKEN_AUD='https://oauth2.googleapis.com/token'
const esc = (v: unknown='') => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] as string))

function emailHtml(campaign:any, contact:any, unsubscribeUrl:string){
  const first = esc(contact.first_name || '')
  const hello = first ? `Hello ${first},` : 'Hello,'
  return `<!doctype html><html><body style="margin:0;background:#f2f4f3;font-family:Arial,Helvetica,sans-serif;color:#17211f"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f4f3;padding:28px 12px"><tr><td align="center"><table role="presentation" width="620" cellspacing="0" cellpadding="0" style="max-width:620px;width:100%;background:#fbfaf5;border:1px solid #dfe4e2;border-radius:18px;overflow:hidden"><tr><td style="padding:28px 34px 20px"><div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:#15978f">PHARMA SERVICE</div><div style="height:1px;background:#d9d4cb;margin:18px 0 28px"></div><div style="font-size:13px;color:#66706d;margin-bottom:12px">${hello}</div><h1 style="font-size:36px;line-height:1.02;letter-spacing:-1.5px;margin:0 0 18px">${esc(campaign.workshop_title || campaign.subject)}</h1><p style="font-size:15px;line-height:1.65;color:#58615f;margin:0 0 24px">${esc(campaign.intro || campaign.preview_text || '')}</p>${campaign.cta_url?`<a href="${esc(campaign.cta_url)}" style="display:inline-block;background:#10211f;color:#fff;text-decoration:none;padding:13px 18px;border-radius:10px;font-size:13px;font-weight:700">${esc(campaign.cta_label || 'Read more')}</a>`:''}<div style="height:1px;background:#d9d4cb;margin:34px 0 18px"></div><div style="font-size:12px;font-weight:700">Pharma Service Co. L.L.C.</div><div style="font-size:11px;line-height:1.55;color:#75807d;margin-top:5px">Institutional healthcare supply · Dubai, UAE<br>info@pharmaservice.ae</div><div style="font-size:10px;line-height:1.5;color:#969d9a;margin-top:18px">You are receiving this because your business contact record has an approved outreach basis in PSC Mail Desk. <a href="${esc(unsubscribeUrl)}" style="color:#65716e">Unsubscribe</a>.</div></td></tr></table></td></tr></table></body></html>`
}

function bytesToBase64(bytes:Uint8Array){
  let binary=''
  const chunk=0x8000
  for(let i=0;i<bytes.length;i+=chunk){
    binary+=String.fromCharCode(...bytes.subarray(i,Math.min(i+chunk,bytes.length)))
  }
  return btoa(binary)
}
function base64UrlBytes(bytes:Uint8Array){ return bytesToBase64(bytes).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'') }
function base64UrlText(input:string){ return base64UrlBytes(new TextEncoder().encode(input)) }
function encodedHeader(value:string){ return `=?UTF-8?B?${bytesToBase64(new TextEncoder().encode(value))}?=` }
function pemToPkcs8(pem:string){
  const normalized=pem.replace(/\\n/g,'\n').trim()
  const body=normalized.replace(/-----BEGIN PRIVATE KEY-----/g,'').replace(/-----END PRIVATE KEY-----/g,'').replace(/\s+/g,'')
  if(!body) throw new Error('Google service-account private key is empty or invalid.')
  const binary=atob(body)
  const bytes=new Uint8Array(binary.length)
  for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i)
  return bytes.buffer
}

async function googleServiceAccountAccessToken(){
  const serviceAccountEmail=Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL')
  const privateKey=Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
  if(!serviceAccountEmail||!privateKey) throw new Error('Google service-account secrets are not configured.')

  const now=Math.floor(Date.now()/1000)
  const header=base64UrlText(JSON.stringify({alg:'RS256',typ:'JWT'}))
  const claims=base64UrlText(JSON.stringify({
    iss:serviceAccountEmail,
    scope:GMAIL_SEND_SCOPE,
    aud:GOOGLE_TOKEN_AUD,
    iat:now,
    exp:now+3600,
    sub:SENDER,
  }))
  const unsigned=`${header}.${claims}`
  const key=await crypto.subtle.importKey(
    'pkcs8',
    pemToPkcs8(privateKey),
    {name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},
    false,
    ['sign'],
  )
  const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(unsigned))
  const assertion=`${unsigned}.${base64UrlBytes(new Uint8Array(signature))}`
  const body=new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion})
  const r=await fetch(GOOGLE_TOKEN_AUD,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body})
  if(!r.ok){
    const txt=await r.text()
    throw new Error(`Google delegated token exchange failed (${r.status}): ${txt.slice(0,300)}`)
  }
  const j=await r.json()
  if(!j?.access_token) throw new Error('Google delegated access token missing.')
  return j.access_token as string
}

function rawMessage(to:string,subject:string,html:string,unsubscribeUrl:string){
  const headers=[
    `From: ${DISPLAY_NAME} <${SENDER}>`,
    `Reply-To: ${SENDER}`,
    `To: ${to}`,
    `Subject: ${encodedHeader(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    `List-Unsubscribe: <${unsubscribeUrl}>`,
  ]
  return `${headers.join('\r\n')}\r\n\r\n${html}`
}

async function sendGmail(token:string,to:string,subject:string,html:string,unsubscribeUrl:string){
  const raw=base64UrlText(rawMessage(to,subject,html,unsubscribeUrl))
  const r=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{
    method:'POST',
    headers:{Authorization:`Bearer ${token}`,'content-type':'application/json'},
    body:JSON.stringify({raw})
  })
  if(!r.ok){ const txt=await r.text(); throw new Error(`Gmail send failed (${r.status}): ${txt.slice(0,320)}`) }
  const j=await r.json()
  if(!j?.id) throw new Error('Gmail send returned no message id.')
  return j.id as string
}

Deno.serve(async req=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:cors})
  if(req.method!=='POST') return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers:{...cors,'content-type':'application/json'}})
  try{
    const url=Deno.env.get('SUPABASE_URL')!
    const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const auth=req.headers.get('authorization')||''
    const token=auth.replace(/^Bearer\s+/i,'')
    if(!token) throw new Error('Missing authorization token.')
    const svc=createClient(url,serviceKey,{auth:{persistSession:false}})
    const {data:userData,error:userError}=await svc.auth.getUser(token)
    if(userError||!userData.user) throw new Error('Invalid session.')
    const {data:profile,error:profileError}=await svc.from('profiles').select('is_psc_admin').eq('user_id',userData.user.id).maybeSingle()
    if(profileError||!profile?.is_psc_admin) return new Response(JSON.stringify({error:'PSC admin access required.'}),{status:403,headers:{...cors,'content-type':'application/json'}})

    const {campaign_id,test_mode=false,test_to=null}=await req.json()
    if(!campaign_id) throw new Error('campaign_id is required.')
    const {data:campaign,error:cError}=await svc.from('mail_campaigns').select('*').eq('id',campaign_id).single()
    if(cError||!campaign) throw new Error('Campaign not found.')
    if(String(campaign.sender_email).toLowerCase()!==SENDER) throw new Error('Sender mailbox is not allowed.')

    const sender=(Deno.env.get('PSC_MAIL_SENDER')||SENDER).toLowerCase()
    if(sender!==SENDER) throw new Error(`PSC_MAIL_SENDER must be ${SENDER}.`)
    const gmailToken=await googleServiceAccountAccessToken()

    if(test_mode){
      const to=String(test_to||SENDER).toLowerCase()
      if(to!==SENDER) throw new Error(`Test sends are locked to ${SENDER}.`)
      const unsubscribeUrl='https://pharmaservice.ae/'
      const html=emailHtml({...campaign,workshop_title:campaign.subject},{first_name:'PSC'},unsubscribeUrl)
      await sendGmail(gmailToken,to,`TEST · ${campaign.subject}`,html,unsubscribeUrl)
      await svc.from('mail_campaigns').update({status:'draft',last_error:null}).eq('id',campaign.id)
      return new Response(JSON.stringify({ok:true,test:true}),{headers:{...cors,'content-type':'application/json'}})
    }

    const {data:rows,error:rError}=await svc.from('mail_campaign_recipients').select('*,mail_contacts(*)').eq('campaign_id',campaign.id).eq('status','queued')
    if(rError) throw rError
    if(!rows?.length) throw new Error('No queued recipients.')
    await svc.from('mail_campaigns').update({status:'sending',recipient_count:rows.length,last_error:null}).eq('id',campaign.id)

    let sent=0,failed=0
    for(const row of rows){
      const c=row.mail_contacts
      if(!c || c.status!=='active' || !c.marketing_basis || c.marketing_basis==='not_set'){
        await svc.from('mail_campaign_recipients').update({status:'skipped',error:'Contact is not send-eligible.'}).eq('id',row.id)
        continue
      }
      const unsub=`https://pharmaservice.ae/?token=${encodeURIComponent(c.unsubscribe_token)}#unsubscribe`
      try{
        const gmailMessageId=await sendGmail(gmailToken,row.email_snapshot,campaign.subject,emailHtml(campaign,c,unsub),unsub)
        sent++
        await svc.from('mail_campaign_recipients').update({status:'sent',sent_at:new Date().toISOString(),error:null,provider_message_id:gmailMessageId}).eq('id',row.id)
      }catch(e){
        failed++
        await svc.from('mail_campaign_recipients').update({status:'failed',error:(e instanceof Error ? e.message : String(e)).slice(0,1000)}).eq('id',row.id)
      }
      await new Promise(r=>setTimeout(r,160))
    }
    const status=failed===0?'sent':sent>0?'partial':'failed'
    await svc.from('mail_campaigns').update({status,sent_count:sent,failed_count:failed,sent_at:sent?new Date().toISOString():null,last_error:failed?`${failed} recipient(s) failed`:null}).eq('id',campaign.id)
    return new Response(JSON.stringify({ok:true,status,sent,failed}),{headers:{...cors,'content-type':'application/json'}})
  }catch(e){
    console.error(e)
    return new Response(JSON.stringify({error:(e instanceof Error ? e.message : String(e))}),{status:400,headers:{...cors,'content-type':'application/json'}})
  }
})
