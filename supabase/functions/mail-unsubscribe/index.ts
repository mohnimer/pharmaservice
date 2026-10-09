import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type, apikey, authorization','Access-Control-Allow-Methods':'POST, OPTIONS'}
Deno.serve(async req=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:cors})
  if(req.method!=='POST') return new Response('Method not allowed',{status:405,headers:cors})
  try{
    const type=req.headers.get('content-type')||'';
    const body=type.includes('application/x-www-form-urlencoded')?Object.fromEntries(new URLSearchParams(await req.text())):await req.json();
    const token=body.token||(body['List-Unsubscribe']==='One-Click'?new URL(req.url).searchParams.get('token'):null);
    if(typeof token!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) throw new Error('Missing unsubscribe token.')
    const svc=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}})
    const {data,error}=await svc.from('mail_contacts').update({status:'unsubscribed',unsubscribed_at:new Date().toISOString()}).eq('unsubscribe_token',token).select('id').maybeSingle()
    if(error) throw error
    if(!data) throw new Error('This unsubscribe link is invalid or has expired.')
    return new Response(JSON.stringify({ok:true}),{headers:{...cors,'content-type':'application/json'}})
  }catch(e){ return new Response(JSON.stringify({error:'Unable to process this unsubscribe link.'}),{status:400,headers:{...cors,'content-type':'application/json'}}) }
})

