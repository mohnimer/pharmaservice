import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const esc = (v: unknown='') => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] as string))

function emailHtml(campaign:any, contact:any, unsubscribeUrl:string){
  const first = esc(contact.first_name || '');
  const hello = first ? `Hello ${first},` : 'Hello,'
  return `<!doctype html><html><body style="margin:0;background:#f2f4f3;font-family:Arial,Helvetica,sans-serif;color:#17211f"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f4f3;padding:28px 12px"><tr><td align="center"><table role="presentation" width="620" cellspacing="0" cellpadding="0" style="max-width:620px;width:100%;background:#fbfaf5;border:1px solid #dfe4e2;border-radius:18px;overflow:hidden"><tr><td style="padding:28px 34px 20px"><div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:#15978f">PHARMA SERVICE</div><div style="height:1px;background:#d9d4cb;margin:18px 0 28px"></div><div style="font-size:13px;color:#66706d;margin-bottom:12px">${hello}</div><h1 style="font-size:36px;line-height:1.02;letter-spacing:-1.5px;margin:0 0 18px">${esc(campaign.workshop_title || campaign.subject)}</h1><p style="font-size:15px;line-height:1.65;color:#58615f;margin:0 0 24px">${esc(campaign.intro || campaign.preview_text || '')}</p>${campaign.cta_url?`<a href="${esc(campaign.cta_url)}" style="display:inline-block;background:#10211f;color:#fff;text-decoration:none;padding:13px 18px;border-radius:10px;font-size:13px;font-weight:700">${esc(campaign.cta_label || 'Read more')}</a>`:''}<div style="height:1px;background:#d9d4cb;margin:34px 0 18px"></div><div style="font-size:12px;font-weight:700">Pharma Service Co. L.L.C.</div><div style="font-size:11px;line-height:1.55;color:#75807d;margin-top:5px">Institutional healthcare supply · Dubai, UAE<br>info@pharmaservice.ae</div><div style="font-size:10px;line-height:1.5;color:#969d9a;margin-top:18px">You are receiving this because your business contact record has an approved outreach basis in PSC Mail Desk. <a href="${esc(unsubscribeUrl)}" style="color:#65716e">Unsubscribe</a>.</div></td></tr></table></td></tr></table></body></html>`
}

async function graphToken(){
  const tenant=Deno.env.get('MS_GRAPH_TENANT_ID')
  const clientId=Deno.env.get('MS_GRAPH_CLIENT_ID')
  const secret=Deno.env.get('MS_GRAPH_CLIENT_SECRET')
  if(!tenant||!clientId||!secret) throw new Error('Microsoft Graph secrets are not configured.')
  const body=new URLSearchParams({client_id:clientId,client_secret:secret,scope:'https://graph.microsoft.com/.default',grant_type:'client_credentials'})
  const r=await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body})
  if(!r.ok) throw new Error(`Graph token failed (${r.status}).`)
  const j=await r.json(); if(!j.access_token) throw new Error('Graph token missing.')
  return j.access_token as string
}

async function sendGraph(token:string,sender:string,to:string,subject:string,html:string){
  const r=await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`,{
    method:'POST',
    headers:{Authorization:`Bearer ${token}`,'content-type':'application/json'},
    body:JSON.stringify({message:{subject,body:{contentType:'HTML',content:html},toRecipients:[{emailAddress:{address:to}}]},saveToSentItems:true})
  })
  if(!r.ok){ const txt=await r.text(); throw new Error(`Graph send failed (${r.status}): ${txt.slice(0,240)}`) }
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
    if(String(campaign.sender_email).toLowerCase()!=='info@pharmaservice.ae') throw new Error('Sender mailbox is not allowed.')

    const sender=Deno.env.get('PSC_MAIL_SENDER')||'info@pharmaservice.ae'
    if(sender.toLowerCase()!=='info@pharmaservice.ae') throw new Error('PSC_MAIL_SENDER must be info@pharmaservice.ae.')
    const graph=await graphToken()

    if(test_mode){
      const to=String(test_to||'info@pharmaservice.ae').toLowerCase()
      if(to!=='info@pharmaservice.ae') throw new Error('Test sends are locked to info@pharmaservice.ae.')
      const html=emailHtml({...campaign,workshop_title:campaign.subject},{first_name:'PSC'},'https://pharmaservice.ae/')
      await sendGraph(graph,sender,to,`TEST · ${campaign.subject}`,html)
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
        await sendGraph(graph,sender,row.email_snapshot,campaign.subject,emailHtml(campaign,c,unsub))
        sent++
        await svc.from('mail_campaign_recipients').update({status:'sent',sent_at:new Date().toISOString(),error:null}).eq('id',row.id)
      }catch(e){
        failed++
        await svc.from('mail_campaign_recipients').update({status:'failed',error:(e instanceof Error ? e.message : String(e)).slice(0,1000)}).eq('id',row.id)
      }
      await new Promise(r=>setTimeout(r,120))
    }
    const status=failed===0?'sent':sent>0?'partial':'failed'
    await svc.from('mail_campaigns').update({status,sent_count:sent,failed_count:failed,sent_at:sent?new Date().toISOString():null,last_error:failed?`${failed} recipient(s) failed`:null}).eq('id',campaign.id)
    return new Response(JSON.stringify({ok:true,status,sent,failed}),{headers:{...cors,'content-type':'application/json'}})
  }catch(e){
    console.error(e)
    return new Response(JSON.stringify({error:(e instanceof Error ? e.message : String(e))}),{status:400,headers:{...cors,'content-type':'application/json'}})
  }
})
