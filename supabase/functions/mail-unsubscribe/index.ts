import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type, apikey, authorization','Access-Control-Allow-Methods':'POST, OPTIONS'}
Deno.serve(async req=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:cors})
  try{
    const {token}=await req.json(); if(!token) throw new Error('Missing unsubscribe token.')
    const svc=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}})
    const {data,error}=await svc.from('mail_contacts').update({status:'unsubscribed',unsubscribed_at:new Date().toISOString()}).eq('unsubscribe_token',token).select('id').maybeSingle()
    if(error) throw error
    if(!data) throw new Error('This unsubscribe link is invalid or has expired.')
    return new Response(JSON.stringify({ok:true}),{headers:{...cors,'content-type':'application/json'}})
  }catch(e){ return new Response(JSON.stringify({error:(e instanceof Error ? e.message : String(e))}),{status:400,headers:{...cors,'content-type':'application/json'}}) }
})
