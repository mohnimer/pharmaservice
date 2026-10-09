import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox']});
const extension=`(()=>{const create=window.supabase.createClient;window.supabase.createClient=()=>{const c=create();window.__mailCalls=[];window.__tables.psc_mail_messages=[{id:'m1',direction:'inbound',kind:'review',sender:'buyer@example.invalid',recipient:'info@pharmaservice.ae',subject:'Clinic RFQ <script>alert(1)</script>',body_text:'<img src=x onerror=alert(1)>',received_at:'2026-10-09',review_status:'unmatched',attachments:[]}];window.__tables.psc_mail_drafts=[{id:'d1',kind:'quotation',order_id:'o0',recipient:'buyer@example.invalid',subject:'Quotation test',body_text:'Reviewed terms',status:'draft'}];c.functions={invoke:async(name,{body})=>{window.__mailCalls.push({name,body});if(name==='psc-gmail-oauth')return {data:{configured:true,connection:{status:'connected'}},error:null};if(body.action==='send')window.__tables.psc_mail_drafts[0].status='accepted';return {data:{saved:true,accepted_by_gmail:true},error:null}}};return c;};})();`;
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900}});await context.addInitScript(()=>{window.__testRole='admin'});
  await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname==='cdn.jsdelivr.net')return r.fulfill({contentType:'text/javascript',body:readFileSync('tests/mock-supabase.js','utf8')+extension});return r.fulfill({status:503,body:''});});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/#admin/requests');await page.locator('[data-open-request="order:o0"]').click();await page.locator('[data-mail-draft]').waitFor();
  assert(await page.locator('[data-mail-draft]').textContent().then(t=>t.includes('From: sales@pharmaservice.ae')));
  assert.equal(await page.locator('.pscMailPanel script,.pscMailPanel img').count(),0,'unsafe email content rendered');
  await page.locator('[data-mail-draft] button[type=submit]').click();assert.equal(await page.evaluate(()=>window.__mailCalls.filter(c=>c.body.action==='send').length),0);
  await page.locator('[data-mail-draft] [name=approve]').check();await page.locator('[data-mail-draft] button[type=submit]').click();await page.locator('[data-mail-draft]').filter({hasText:'accepted'}).waitFor();assert.equal(await page.evaluate(()=>window.__mailCalls.filter(c=>c.body.action==='send').length),1);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'correspondence overflows mobile');assert.deepEqual(errors,[]);await page.screenshot({path:'test-results/gmail-admin-'+width+'.png',fullPage:true});await context.close();console.log('Approval-controlled correspondence UI '+width+': PASS');
 }
}finally{await browser.close();server.close();}
