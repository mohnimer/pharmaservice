// Isolated operational regression. All external transport is mocked; no live writes or sends.
import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({args:['--no-sandbox']});mkdirSync('test-results/operating',{recursive:true});
const extension=`(()=>{const c=window.supabase.createClient();Object.assign(window.__tables,{mail_contacts:[],psc_crm_tasks:[],psc_crm_notes:[],psc_mail_messages:[],psc_mail_drafts:[]});c.functions={invoke:async()=>({data:{configured:false},error:null})};})();`;
try{for(const width of [390,1440]){
 const ctx=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'});await ctx.addInitScript(()=>window.__testRole='admin');
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname==='cdn.jsdelivr.net')return r.fulfill({contentType:'text/javascript',body:readFileSync('tests/mock-supabase.js','utf8')+extension});return r.fulfill({status:503,body:''});});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/#admin/requests`);await page.locator('[data-open-request="order:o0"]').waitFor();
 await page.locator('[data-open-request="order:o0"]').click();
 const card=page.locator('[data-inbox-record="order:o0"]');await card.waitFor();
 assert.equal(await page.locator('[data-inbox-record]').count(),1,'current detail is scoped to one request');
 const next=card.locator('[name="next_action"]');await next.fill('TEST ONLY: obtain exact labelled pack');
 await card.locator('[name="due_date"]').fill('2026-01-01');await card.locator('form').first().locator('button[type="submit"]').click();
 await card.locator('[data-inbox-feedback]').filter({hasText:'Saved.'}).waitFor();
 await page.locator('[data-inbox-refresh]').click();await card.waitFor();assert.equal(await card.locator('[name="next_action"]').inputValue(),'TEST ONLY: obtain exact labelled pack');
 const evidence=card.locator('[data-commercial-evidence]');await card.locator('.commercialEvidence summary').click();
 for(const [name,value] of Object.entries({authorization_ref:'TEST-PO',funding_required:'500',funding_received:'100',receipt_ref:'TEST-PARTIAL-RECEIPT',supplier_evidence_ref:'TEST-SUPPLIER-QUOTE'}))await evidence.locator(`[name="${name}"]`).fill(value);
 await evidence.locator('[name="attested"]').check();await evidence.locator('button[type="submit"]').click();await evidence.locator('[data-evidence-feedback]').filter({hasText:'Saved for the current quotation'}).waitFor();
 assert.equal(await evidence.locator('[name="attested"]').isChecked(),false);
 const download=page.waitForEvent('download');await card.locator('[data-commercial-export="rfq"]').click();const draft=await download;await draft.saveAs(`test-results/operating/rfq-${width}.csv`);assert.match(readFileSync(`test-results/operating/rfq-${width}.csv`,'utf8'),/DRAFT RFQ/);
 await page.locator('[data-open-builder]').first().click();await page.locator('[data-request-status]').waitFor();await page.locator('[data-request-status]').selectOption('Procurement');
 await page.locator('[data-status-feedback]').filter({hasText:'Verify required funding'}).waitFor();
 assert.equal(await page.locator('[data-request-status]').inputValue(),'Sent');assert.equal(await page.evaluate(()=>window.__tables.orders.find(o=>o.id==='o0').status),'quote_sent');
 assert.deepEqual(await page.evaluate(()=>window.__backendCalls.filter(c=>c.rpc).map(c=>c.rpc).filter(n=>!['psc_ensure_quote','psc_set_commercial_status'].includes(n))),[],'no message/order-send RPC');
 assert.deepEqual(errors,[]);await page.screenshot({path:`test-results/operating/controls-${width}.png`});await ctx.close();console.log('PASS current request detail, follow-up, draft RFQ, evidence and blocked procurement',width);
}}finally{await browser.close();server.close();}
