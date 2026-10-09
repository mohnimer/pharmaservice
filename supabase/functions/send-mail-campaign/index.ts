import {service,admin,json,safeCode} from '../_shared/psc-mail.ts'
// Campaign records and suppression remain intact. Activation requires a separate
// marketing provider, consent, quota and sender-authentication review.
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return json({})
 if(req.method!=='POST')return json({error:'method_not_allowed'},405)
 try{await admin(req,service());return json({error:'marketing_delivery_paused',reason:'Separate provider and consent review required.'},409)}
 catch(e){return json({error:safeCode(e)},safeCode(e)==='unauthorized'?401:403)}
})
