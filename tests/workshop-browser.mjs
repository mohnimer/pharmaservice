import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
import {fixture,ids,asUser,call} from './workshop-fixture.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
mkdirSync('test-results/workshop',{recursive:true});
let chain=Promise.resolve();
try{for(const width of [390,1440]){
 const db=await fixture();await asUser(db,'manager');
 await call(db,'configure',{school_id:ids.school,assigned_user:ids.nurse,recipient_user:ids.manager,jurisdiction:'Dubai',clinic_type:'educational',conditions:{oxygen:'no',aed:'yes'},weekday:1,reminder_time:'09:00',reminders:true,email_enabled:false,ps_share:false});
 const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:width===390?'reduce':'no-preference'});
 await ctx.addInitScript(()=>window.__testRole='school');
 let mock=readFileSync('tests/mock-supabase.js','utf8').replaceAll("'u1'","'"+ids.nurse+"'").replaceAll("'g1'","'"+ids.group+"'").replaceAll("'s1'","'"+ids.school+"'").replaceAll("'s2'","'"+ids.school2+"'");
 mock+=";window.__tables.memberships[0].school_id='"+ids.school+"';window.__tables.memberships[0].role='school_user';const originalCreate=window.supabase.createClient;window.supabase.createClient=(...a)=>{const c=originalCreate(...a);const old=c.rpc;c.rpc=async(name,args)=>name==='ps_workshop'?fetch('/__ws_test',{method:'POST',body:JSON.stringify(args)}).then(r=>r.json()):old(name,args);return c;};";
 await ctx.route('**/*',async r=>{
  const url=new URL(r.request().url());
  if(url.pathname==='/__ws_test'){
   const args=r.request().postDataJSON();
   const job=chain.then(async()=>{try{await asUser(db,'nurse');return {data:await call(db,args.p_action,args.p_payload),error:null};}catch(e){return {data:null,error:{message:e.message}};}});chain=job.catch(()=>{});
   return r.fulfill({contentType:'application/json',body:JSON.stringify(await job)});
  }
  if(url.hostname==='127.0.0.1')return r.continue();
  return r.fulfill({contentType:url.hostname==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:url.hostname==='cdn.jsdelivr.net'?mock:''});
 });
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:'+server.address().port;
 await page.goto(base+'/#workshop');await page.locator('.wsDestinations').waitFor();assert.equal(await page.locator('.wsDestinations section').count(),4);await page.screenshot({path:'test-results/workshop/'+width+'-hub.png'});
 await page.goto(base+'/#workshop/guides');await page.locator('.workshopGuideGridV50').first().waitFor();assert.equal(await page.locator('.workshopModuleCardV50').count(),7);
 await page.locator('[data-workshop-q]').fill('Which Glove Should I Actually Wear?');await page.locator('.workshopGuideGridV50 article').waitFor();assert.equal(await page.locator('.workshopGuideGridV50 article').count(),1);
 await page.locator('.workshopGuideGridV50 [data-go]').first().click();await page.locator('.workshopArticleV50').waitFor();
 await page.goto(base+'/#portal/workshop/lesson/consumables');await page.locator('.wsSlide').waitFor();
 await page.locator('[data-ws="slide"][data-index="1"]').click();await page.locator('.wsSlide h2').filter({hasText:'Name the gap'}).waitFor();
 await page.reload();await page.locator('.wsSlide h2').filter({hasText:'Name the gap'}).waitFor();
 await page.screenshot({path:'test-results/workshop/'+width+'-lesson.png'});
 for(const i of [2,3,3]){await page.locator('[data-ws="slide"][data-index="'+i+'"]').click();await page.waitForTimeout(150);}
 await page.locator('[data-ws-quiz]').first().waitFor();await page.locator('[data-ws-quiz][value="1"]').check();await page.locator('[data-ws="quiz_feedback"]').click();await page.locator('.wsFeedback').waitFor();assert((await page.locator('.wsFeedback').innerText()).includes('Correct.'));
 await page.locator('[data-ws="quiz_nav"][data-index="1"]').click();await page.locator('[data-ws-quiz][type="checkbox"]').first().waitFor();
 await page.locator('[data-ws-quiz][value="0"]').check();await page.locator('[data-ws-quiz][value="2"]').check();await page.locator('[data-ws="quiz_submit"]').click();await page.locator('.wsQuizResult').waitFor();assert((await page.locator('.wsQuizResult').innerText()).includes('100% learning score'));
 await page.goto(base+'/#portal/readiness');await page.locator('[data-ws="start"]').waitFor();await page.locator('[data-ws="start"]').click();await page.locator('[data-ws-answer]').first().waitFor();
 let count=Number(await page.locator('.wsProgress progress').getAttribute('max'));
 for(let i=0;i<count;i++){
  await page.locator('[data-ws-answer][value="'+(i===0?'unknown':i===1?'no':'yes')+'"]').check();
  if(i===1){await page.locator('[data-ws-field="quantity"]').fill('10');}
  if(i===2){await page.locator('[data-ws="save_exit"]').click();await page.locator('.wsTableWrap').waitFor();await page.goto(base+'/#portal/readiness');await page.locator('[data-ws="start"]').click();await page.locator('[data-ws-answer]').first().waitFor();for(let n=1;n<=i;n++){await page.locator('[data-ws="check_nav"][data-index="'+n+'"]').click();await page.waitForTimeout(100);}assert(await page.locator('[data-ws-answer][value="yes"]').isChecked());}
  if(i<count-1){await page.locator('[data-ws="check_nav"][data-index="'+(i+1)+'"]').click();await page.waitForTimeout(100);}
  else await page.locator('[data-ws="check_review"]').click();
 }
 await page.locator('#wsReviewed').check();await page.locator('[data-ws="submit"]').click();await page.locator('.wsReport').waitFor();assert(await page.locator('.wsCritical').isVisible());await page.screenshot({path:'test-results/workshop/'+width+'-report.png',fullPage:true});
 await page.pdf({path:'test-results/workshop/'+width+'-report.pdf',format:'A4',printBackground:true});
 await page.locator('.wsIssue').filter({hasText:'first-aid supplies'}).locator('[data-ws="recommend"]').click();await page.locator('#wsSku').selectOption({index:1});await page.locator('#wsQty').fill('10');await page.locator('[data-ws="propose"]').click();await page.locator('.wsProposal').waitFor();assert.equal(await page.locator('[data-ws-proposal]').inputValue(),'10');assert.equal(await page.locator('[data-ws="rfq"]').count(),0);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 assert.deepEqual(errors,[]);await ctx.close();await db.close();console.log(width+': real Postgres journey, guides, resume, quiz, conditional weekly check, critical report, PDF and provisional request PASS');
}}finally{await browser.close();server.close();}
