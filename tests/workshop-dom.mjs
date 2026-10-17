import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {fixture,ids,asUser,call} from './workshop-fixture.mjs';
const db=await fixture();let user='manager';await asUser(db,user);
await call(db,'configure',{school_id:ids.school,assigned_user:ids.nurse,recipient_user:ids.manager,jurisdiction:'Dubai',clinic_type:'educational',conditions:{oxygen:'no',aed:'yes'},weekday:1,reminder_time:'09:00',reminders:true,email_enabled:false,ps_share:false});
user='nurse';await asUser(db,user);
let route='workshop',errors=[],content='',context={userId:ids.nurse,school:{id:ids.school},memberships:[]};
const w=new Window({url:'http://localhost/#workshop',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableComputedStyleRendering:true}});
w.document.body.innerHTML='<div id="root"></div>';w.structuredClone=structuredClone;
let tail=Promise.resolve();
w.PSC_ACCOUNT_CONTEXT=()=>context;w.PSC_CURRENT_ROUTE=()=>route;
w.PSC_SUPABASE={rpc:async(name,args)=>{const job=tail.then(async()=>{try{await asUser(db,user);return {data:await call(db,args.p_action,args.p_payload),error:null};}catch(e){return {data:null,error:{message:e.message}};}});tail=job.catch(()=>{});return job;}};
w.eval(readFileSync('current/workshop/content.js','utf8'));w.eval(readFileSync('current/workshop/app.js','utf8'));
const app=w.PS_WORKSHOP_APP;
function draw(){content=app.render(route);w.document.querySelector('#root').innerHTML=content;app.bind();}
w.PSC_NAVIGATE=r=>{route=r;draw();};
app.configure({shell:x=>x,publicHeader:()=>'<header>PS</header>',publicFooter:()=>'',redraw:draw,toast:x=>errors.push(x)});
const pause=()=>new Promise(r=>setTimeout(r,30));
async function until(fn){for(let i=0;i<150;i++){if(fn())return;await pause();}throw Error('UI wait failed: '+route+' '+errors.join(','));}
async function click(selector){const e=w.document.querySelector(selector);assert(e,selector);e.click();await pause();await tail;await pause();}
try{
 draw();await until(()=>content.includes('Learn. Check. Improve.'));
 assert.equal(w.document.querySelectorAll('.wsDestinations section').length,4);
 w.PSC_NAVIGATE('portal/workshop/lesson/consumables');await until(()=>w.document.querySelector('.wsSlide'));
 for(let i=0;i<4;i++){await click('[data-ws="slide"][data-index="'+Math.min(i+1,3)+'"]');}
 await until(()=>w.document.querySelector('[data-ws-quiz]'));
 let input=w.document.querySelector('[data-ws-quiz][value="1"]');input.checked=true;input.dispatchEvent(new w.Event('change',{bubbles:true}));
 await click('[data-ws="quiz_feedback"]');assert(w.document.body.textContent.includes('Correct.'));
 await click('[data-ws="quiz_nav"][data-index="1"]');
 for(const val of ['0','2']){input=w.document.querySelector('[data-ws-quiz][value="'+val+'"]');input.checked=true;input.dispatchEvent(new w.Event('change',{bubbles:true}));}
 await click('[data-ws="quiz_submit"]');await until(()=>w.document.querySelector('.wsQuizResult'));assert(w.document.body.textContent.includes('100% learning score'));
 w.PSC_NAVIGATE('portal/readiness');await click('[data-ws="start"]');await until(()=>w.document.querySelector('[data-ws-answer]'));
 const count=w.document.querySelector('.wsProgress progress').max;
 for(let i=0;i<count;i++){
  input=w.document.querySelector('[data-ws-answer][value="'+(i===0?'unknown':'yes')+'"]');input.checked=true;input.dispatchEvent(new w.Event('change',{bubbles:true}));await pause();
  await click(i<count-1?'[data-ws="check_nav"][data-index="'+(i+1)+'"]':'[data-ws="check_review"]');
 }
 w.document.querySelector('#wsReviewed').checked=true;await click('[data-ws="submit"]');await until(()=>w.document.querySelector('.wsReport'));
 assert(w.document.querySelector('.wsCritical'));assert(w.document.body.textContent.includes('reported readiness'));assert(w.document.body.textContent.includes('Not sure answer'));
 assert.equal(errors.length,0,errors.join('; '));
 console.log('PASS UI → real Postgres: slides/progress, single/multi quiz, explanations, weekly conditional flow, saved answers, review and critical Report Card');
}finally{await w.happyDOM.close();await db.close();}
