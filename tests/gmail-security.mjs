import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
// Keep production source intact; replace only external adapters in isolated tests.
const root=mkdtempSync(join(tmpdir(),'psc-mail-test-'));
for(const path of ['_shared/mail-senders.ts','_shared/outreach.ts','_shared/mail-intake.ts','_shared/psc-mail.ts','_shared/quote-pdf.ts','dispatch-notification/index.ts','psc-gmail-oauth/index.ts','poll-procurement-mail/index.ts','procurement-mail/index.ts','send-mail-campaign/index.ts','mail-unsubscribe/index.ts']){
 const file=join(root,path);mkdirSync(join(file,'..'),{recursive:true});
 writeFileSync(file,readFileSync('supabase/functions/'+path,'utf8').replace(/import \{\s*createClient\s*\} from 'https:\/\/esm.sh\/[^']+'/g,'const createClient:any=()=> (globalThis as any).testService').replace(/import \{PDFDocument,StandardFonts,rgb\} from '[^']+'/,'const PDFDocument:any={},StandardFonts:any={},rgb:any=()=>({})'));
}
writeFileSync(join(root,'security_test.ts'),String.raw`
import {draftSender,notificationSender,verifySender,routedMime,SALES,PROCUREMENT} from './_shared/mail-senders.ts';
import {admin,accessToken,gmail,mime,MailError,safeCode} from './_shared/psc-mail.ts';
import {validateIntake,checkIntakeSend,intakeAction} from './_shared/mail-intake.ts';
import {marketingMime,verifyAlias,eligible,OUTREACH} from './_shared/outreach.ts';
function assert(v:unknown,label='assertion failed'){if(!v)throw new Error(label)}
let handler:any;Deno.serve=((fn:any)=>{handler=fn;return {}}) as any;
await import('./procurement-mail/index.ts');const procurement=handler;
await import('./psc-gmail-oauth/index.ts');const oauth=handler;
await import('./dispatch-notification/index.ts');const dispatch=handler;
await import('./poll-procurement-mail/index.ts');const poll=handler;
await import('./mail-unsubscribe/index.ts');const unsubscribe=handler;
await import('./send-mail-campaign/index.ts');const campaigns=handler;

Deno.test('workflow routing pins From and Reply-To and rejects unknown types',()=>{
 for(const [kind,address] of [['rfq',PROCUREMENT],['quotation',SALES],['followup',SALES],['test','info@pharmaservice.ae']]){assert(draftSender(kind)===address);const raw=routedMime(address,{to:'info@pharmaservice.ae',subject:'Test',text:'Body',id:'test'});assert(raw.includes('From: Pharma Service <'+address+'>'));assert(raw.includes('Reply-To: '+address));}
 assert(notificationSender('quote_sent')===SALES);assert(notificationSender('portal_order_received')==='info@pharmaservice.ae');let blocked=false;try{draftSender('unknown')}catch{blocked=true}assert(blocked);
});
Deno.test('transactional aliases fail closed independently',async()=>{const original=fetch;try{globalThis.fetch=(async()=>Response.json({sendAs:[{sendAsEmail:SALES,verificationStatus:'accepted'},{sendAsEmail:PROCUREMENT,verificationStatus:'pending'}]})) as any;await verifySender('fake',SALES);let blocked=false;try{await verifySender('fake',PROCUREMENT)}catch(e){blocked=safeCode(e)==='procurement_alias_not_ready'}assert(blocked)}finally{globalThis.fetch=original}});
Deno.test('marketing MIME pins alias, preserves transactional sender and includes unsubscribe headers',()=>{
 const c={sender_email:OUTREACH,subject:'PSC newsletter',intro:'Hello <script>bad</script>',cta_label:'Read',cta_url:'https://pharmaservice.ae/workshop',template:'workshop'};
 const raw=marketingMime(c,{email_snapshot:'subscriber@example.com'},'11111111-1111-4111-8111-111111111111','test-attempt');
 assert(raw.includes('From: Pharma Service <outreach@pharmaservice.ae>'));assert(raw.includes('Reply-To: outreach@pharmaservice.ae'));assert(raw.includes('List-Unsubscribe-Post: List-Unsubscribe=One-Click'));
 assert(mime({to:'info@pharmaservice.ae',subject:'Quote',text:'Test',id:'q'}).includes('From: Pharma Service <info@pharmaservice.ae>'));
 for(const change of [{sender_email:'wrong@example.com'},{subject:'Injected\r\nBcc: victim@example.com'},{cta_url:'javascript:alert(1)'},{cta_url:'https://evil.example.com'}]){let blocked=false;try{marketingMime({...c,...change},{email_snapshot:'subscriber@example.com'},null,'id')}catch{blocked=true}assert(blocked)}
});
Deno.test('only active subscribed recipients qualify; adding a contact is insufficient',()=>{
 assert(eligible({status:'active',marketing_basis:'manual_permission'}));for(const c of [{status:'unsubscribed',marketing_basis:'manual_permission'},{status:'active',marketing_basis:'existing_customer'},{status:'active',marketing_basis:'manual_permission',unsubscribed_at:'today'},{status:'paused',marketing_basis:'requested_updates'}])assert(!eligible(c));
});
Deno.test('alias must exist and be verified, using existing readonly scope',async()=>{const original=fetch;try{for(const status of ['pending','accepted']){globalThis.fetch=(async()=>Response.json({sendAs:[{sendAsEmail:OUTREACH,verificationStatus:status}]})) as any;let blocked=false;try{await verifyAlias('fake')}catch{blocked=true}assert(blocked===(status==='pending'))}}finally{globalThis.fetch=original}});

Deno.test('intake requires reviewed quantities and decisions',()=>{
 const base={customer_name:'Buyer',institution:'Test School',customer_email:'buyer@example.com',source_text:'Gloves 10 boxes',is_test:true,reviewed:true,lines:[{id:'1',original:'Gloves 10 boxes',description:'Gloves',quantity:10,unit:'boxes',specification:'Confirm size',sku:'',product_name:'',decision:'pending'}]};
 let blocked=false;try{validateIntake(base)}catch{blocked=true}assert(blocked);
 base.lines[0].decision='sourcing';assert(validateIntake(base).lines.length===1);
 base.lines[0].quantity=0;blocked=false;try{validateIntake(base)}catch{blocked=true}assert(blocked);
});
Deno.test('obsolete intake draft and external test recipient are blocked',async()=>{
 const s:any={from:()=>{const c:any={select:()=>c,eq:()=>c,single:async()=>({data:{reviewed:true,revision:2,is_test:true}})};return c}};
 for(const d of [{intake_revision:1,recipient:'info@pharmaservice.ae'},{intake_revision:2,recipient:'supplier@example.com'}]){let blocked=false;try{await checkIntakeSend(s,d)}catch{blocked=true}assert(blocked)}
 await checkIntakeSend(s,{intake_revision:2,recipient:'info@pharmaservice.ae'});
});

let writes=0,sendCalls=0;
const request=(body:any,authorized=true)=>new Request('https://example.test',{method:'POST',headers:authorized?{Authorization:'Bearer valid'}:{},body:JSON.stringify(body)});
function svc(options:any={}){
 const rows:any={profiles:{is_psc_admin:options.admin!==false},memberships:options.demo?[{account_groups:{slug:'psc-demo-group'}}]:[],psc_mail_connection:{status:'connected'},psc_mail_drafts:options.draft,orders:{id:'order',account_groups:{slug:options.demo?'psc-demo-group':'live'}},notification_outbox:options.notification,institutional_enquiries:{organization:'Isolated school',requirement:'Test gauze'},mail_contacts:{id:'test-contact'},quotes:{status:'sent',current_revision:2,order_id:'order'},quote_snapshots:{revision_no:1,commercial_fingerprint:'old'}};
 return {auth:{getUser:async()=>({data:{user:{id:'admin'}},error:null})},rpc:async(name:string)=>({data:name==='psc_mail_worker_valid'?false:name==='psc_mail_rate'?true:name==='psc_mail_secret'?'fake-refresh':name==='psc_mail_quote_fingerprint'?'current':null,error:null}),from:(name:string)=>{
  const chain:any={};for(const method of ['select','eq','in','order','limit','single','maybeSingle'])chain[method]=()=>chain;
  let mutation:any=null;for(const method of ['update','insert','upsert'])chain[method]=(value:any)=>{writes++;mutation=value;return chain};
  chain.then=(resolve:any)=>{if(mutation&&rows[name]&&!Array.isArray(rows[name]))Object.assign(rows[name],mutation);resolve({data:rows[name]?structuredClone(rows[name]):rows[name],error:null})};return chain;
 }}
}
const set=(v:any)=>(globalThis as any).testService=v;
Deno.env.set('PSC_GOOGLE_OAUTH_CLIENT_ID','test-client');Deno.env.set('PSC_GOOGLE_OAUTH_CLIENT_SECRET','test-secret');
Deno.test('all sending, reading and account endpoints reject anonymous calls without writes',async()=>{set(svc());writes=0;for(const fn of [procurement,oauth,dispatch,poll,campaigns]){const r=await fn(request({action:'send',approve:true},false));assert(r.status===401,'anonymous endpoint accepted');}assert(writes===0,'anonymous call mutated records');});
Deno.test('campaign worker rejects caller without worker secret; setup and test require explicit approval',async()=>{set(svc());writes=0;const tick=await campaigns(request({action:'tick'}));assert(tick.status===401);const test=await campaigns(request({action:'test'}));assert((await test.json()).error==='explicit_test_approval_required');const enable=await campaigns(request({action:'enable'}));assert((await enable.json()).error==='setup_confirmation_required');assert(writes===0)});
Deno.test('one-click unsubscribe supports form POST without opening website',async()=>{set(svc());writes=0;const r=await unsubscribe(new Request('https://example.test?token=11111111-1111-4111-8111-111111111111',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'List-Unsubscribe=One-Click'}));assert((await r.json()).ok===true);assert(writes===1)});
Deno.test('ordinary user and demo administrator cannot send',async()=>{for(const opts of [{admin:false},{demo:true}]){let rejected=false;try{await admin(request({}),svc(opts))}catch(e){rejected=['forbidden','demo_mail_disabled'].includes(safeCode(e))}assert(rejected);}});
Deno.test('quotation send requires explicit email approval before reading draft',async()=>{set(svc());writes=0;const r=await procurement(request({action:'send',draft_id:'draft'}));assert((await r.json()).error==='explicit_send_approval_required');assert(writes===0);});
Deno.test('missing supplier alias blocks send before claim or email',async()=>{set(svc({draft:{id:'draft',status:'draft',kind:'rfq',order_id:'order',recipient:'supplier@example.com'}}));writes=0;const original=fetch;let sends=0;globalThis.fetch=(async(url:any)=>{if(String(url).includes('messages/send'))sends++;return Response.json(String(url).includes('settings/sendAs')?{sendAs:[]}:{access_token:'fresh'})}) as any;try{const r=await procurement(request({action:'send',draft_id:'draft',approve:true}));assert((await r.json()).error==='procurement_alias_not_ready');assert(writes===0&&sends===0)}finally{globalThis.fetch=original}});
Deno.test('obsolete quotation blocked before Gmail or record claim',async()=>{set(svc({draft:{id:'draft',status:'draft',kind:'quotation',order_id:'order',quote_fingerprint:'old'}}));writes=0;const r=await procurement(request({action:'send',draft_id:'draft',approve:true}));assert((await r.json()).error==='obsolete_quotation');assert(writes===0&&sendCalls===0);});
Deno.test('access-token expiry uses refresh grant server side',async()=>{const original=fetch;let grant='';globalThis.fetch=(async(_url:any,opts:any)=>{grant=new URLSearchParams(opts.body).get('grant_type')||'';return Response.json({access_token:'fresh-access'})}) as any;try{assert(await accessToken(svc())==='fresh-access');assert(grant==='refresh_token');}finally{globalThis.fetch=original}});
Deno.test('revoked refresh marks connection and gives safe reconnect error',async()=>{const original=fetch;globalThis.fetch=(async()=>Response.json({error:'invalid_grant',error_description:'private diagnostic'},{status:400})) as any;writes=0;try{let code='';try{await accessToken(svc())}catch(e){code=safeCode(e)}assert(code==='reconnect_required');assert(writes===1)}finally{globalThis.fetch=original}});
Deno.test('ambiguous send held for reconciliation, 429 safe to retry',async()=>{const original=fetch;try{globalThis.fetch=(async()=>new Response('',{status:503})) as any;let error:any;try{await gmail('secret','messages/send')}catch(e){error=e}assert(error instanceof MailError&&error.uncertain);globalThis.fetch=(async()=>new Response('',{status:429})) as any;try{await gmail('secret','messages/send')}catch(e){error=e}assert(error.code==='gmail_rate_limited'&&!error.uncertain)}finally{globalThis.fetch=original}});
Deno.test('MIME prevents header injection and pins sender, recipient and stable identifier',()=>{const raw=mime({to:'info@pharmaservice.ae',subject:'Internal test',text:'Hello',id:'draft-123'});assert(raw.includes('Message-ID: <psc-draft-123@pharmaservice.ae>'));assert(raw.includes('From: Pharma Service <info@pharmaservice.ae>'));let rejected=false;try{mime({to:'info@pharmaservice.ae',subject:'x\r\nBcc: other@example.com',id:'x'})}catch{rejected=true}assert(rejected)});
Deno.test('replayed notification event is accepted once, then skipped',async()=>{const notification={id:'11111111-1111-4111-8111-111111111111',status:'queued',attempts:0,event_type:'institutional_enquiry_received',entity_type:'enquiry',entity_id:'enquiry'};set(svc({notification}));const original=fetch;let sends=0;globalThis.fetch=(async(url:any)=>{if(String(url).includes('messages/send')){sends++;return Response.json({id:'gmail-id',threadId:'thread'})}return Response.json({access_token:'fresh'})}) as any;try{const first=await dispatch(request({notification_id:notification.id}));assert((await first.json()).accepted_by_gmail===true);const second=await dispatch(request({notification_id:notification.id}));assert((await second.json()).already_accepted===true);assert(sends===1&&notification.status==='sent')}finally{globalThis.fetch=original}});
Deno.test('Gmail failure leaves request present and recoverable notification',async()=>{const notification={id:'11111111-1111-4111-8111-111111111111',status:'queued',attempts:0,event_type:'institutional_enquiry_received',entity_type:'enquiry',entity_id:'enquiry'};set(svc({notification}));const original=fetch;globalThis.fetch=(async(url:any)=>String(url).includes('messages/send')?new Response('',{status:429}):Response.json({access_token:'fresh'})) as any;try{await dispatch(request({notification_id:notification.id}));assert(notification.status==='failed');assert(notification.entity_id==='enquiry');assert(notification.attempts===1)}finally{globalThis.fetch=original}});
Deno.test('marketing opt-out still updates suppression; malformed tokens do not write',async()=>{set(svc());writes=0;const bad=await unsubscribe(request({token:'invalid'}));assert(bad.status===400&&writes===0);const good=await unsubscribe(request({token:'11111111-1111-4111-8111-111111111111'}));assert((await good.json()).ok===true&&writes===1)});
Deno.test('missing/replayed OAuth state never exchanges authorization code',async()=>{set(svc());const r=await oauth(new Request('https://example.test?state='+ 'a'.repeat(64)+'&code=secret-code'));assert((await r.json()).error==='expired_or_replayed_oauth_state')});
`);
try{const result=spawnSync('npx',['--yes','deno','test','--allow-env',join(root,'security_test.ts')],{encoding:'utf8'});process.stdout.write(result.stdout);process.stderr.write(result.stderr);if(result.status)process.exitCode=result.status;}finally{rmSync(root,{recursive:true,force:true});}
