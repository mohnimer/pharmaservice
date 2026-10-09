import {extractLines,pdfText} from '../lib/rfq-extraction.mjs';
const base='https://ewewkojlsgqvcqarmpgr.supabase.co';
const key='sb_publishable_sy9aBzGOMKQO2CZJyGxD-Q_TyzP4mOb';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
 const auth=req.headers.authorization;if(typeof auth!=='string'||!/^Bearer [\w.-]+$/.test(auth))return res.status(401).json({error:'unauthorized'});
 let b=req.body;try{if(typeof b==='string')b=JSON.parse(b)}catch{return res.status(400).json({error:'invalid_request'})}
 if(!/^[0-9a-f-]{36}$/i.test(b?.message_id||''))return res.status(400).json({error:'invalid_request'});
 try{
 // Existing Edge handler checks identity, PSC admin role, demo isolation and persistent rate limits.
 const source=await fetch(base+'/functions/v1/procurement-mail',{method:'POST',headers:{Authorization:auth,apikey:key,'content-type':'application/json'},body:JSON.stringify({action:'intake_source',message_id:b.message_id}),signal:AbortSignal.timeout(15000)});
 if(!source.ok)return res.status(source.status).json({error:'source_access_failed'});
 const m=await source.json(),warnings=[],sections=[m.body_text||''];
 for(const a of (m.attachments||[]).slice(0,5)){
 if(!['application/pdf','text/plain','text/csv'].includes(a.mime_type)&&! /\.(csv|txt)$/i.test(a.file_name)){warnings.push(a.file_name+': enter items manually; this format is not yet supported.');continue}
 const url=new URL(a.url);if(url.origin!==base||!url.pathname.startsWith('/storage/v1/object/sign/psc-correspondence/'))throw new Error('attachment_origin');
 if(a.size>10*1024*1024){warnings.push(a.file_name+': file exceeds extraction size limit.');continue}
 const r=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error('attachment_unavailable');const bytes=await r.arrayBuffer();if(bytes.byteLength>10*1024*1024)throw new Error('attachment_size');
 try{const t=a.mime_type==='application/pdf'?await pdfText(bytes):new TextDecoder().decode(bytes);sections.push(t);if(!t.trim())warnings.push(a.file_name+': no readable text. Enter items manually from the scan.')}catch{warnings.push(a.file_name+': could not read text. Open the original and enter items manually.')}
 }
 if((m.attachments||[]).length>5)warnings.push('Only the first five attachments were inspected. Review the remaining attachments.');
 const text=sections.join('\n').slice(0,100000),lines=extractLines(text);
 warnings.push('Check every item against the original. Rows without a clear quantity and unit may need to be added manually.');
 return res.status(200).json({source_text:text,lines,warnings});
 }catch{return res.status(503).json({error:'extraction_unavailable'})}
}
