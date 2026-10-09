import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox']});
mkdirSync('test-results',{recursive:true});
async function setup(role,width){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
 await context.addInitScript(role=>{window.__testRole=role;},role);
 await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1'&&u.pathname!='/api/interpret-request')return r.continue();if(u.hostname==='cdn.jsdelivr.net')return r.fulfill({contentType:'text/javascript',body:readFileSync('tests/mock-supabase.js','utf8')});return r.fulfill({status:503,body:''});});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));return {context,page,errors};
}
try{
 for(const width of [390,1440]){
  const {context,page,errors}=await setup('admin',width);
  await page.goto(base+'/#admin/requests');await page.locator('[data-inbox-filter]').waitFor();
  assert.equal(await page.locator('[data-inbox-record]').count(),3);
  const card=page.locator('[data-inbox-record="enquiry:e1"]');
  await card.locator('[name="next_action"]').fill('Ask for sterile size and pack');
  await card.locator('[name="due_date"]').fill('2026-01-01');await card.locator('button[type="submit"]').click();
  await card.locator('[data-inbox-feedback]').filter({hasText:'Saved.'}).waitFor();
  await page.reload();await page.locator('[data-inbox-filter]').waitFor();
  // Fixture resets on reload; verify persistence by refresh within this context instead.
  await card.locator('[name="next_action"]').fill('Ask for sterile size and pack');await card.locator('[name="due_date"]').fill('2026-01-01');await card.locator('button[type="submit"]').click();
  await card.locator('[data-inbox-feedback]').filter({hasText:'Saved.'}).waitFor();
  await page.locator('[data-inbox-refresh]').click();await page.locator('[data-inbox-filter]').waitFor();
  assert.equal(await card.locator('[name="next_action"]').inputValue(),'Ask for sterile size and pack');
  await page.locator('[data-inbox-filter]').selectOption('overdue');assert.equal(await page.locator('[data-inbox-record]').count(),1);
  await card.locator('[name="completed"]').check();await card.locator('button[type="submit"]').click();await card.locator('[data-inbox-feedback]').filter({hasText:'Saved.'}).waitFor();
  await page.locator('[data-inbox-refresh]').click();await page.locator('[data-inbox-filter]').waitFor();await page.locator('[data-inbox-filter]').selectOption('overdue');assert.equal(await page.locator('[data-inbox-record]').count(),0);
  await page.locator('[data-inbox-filter]').selectOption('all');
  const evidence=page.locator('[data-inbox-record="order:o0"] [data-commercial-evidence]');
  await evidence.locator('..').locator('summary').click();
  await evidence.locator('[name="authorization_ref"]').fill('PO-TEST-01');
  await evidence.locator('[name="funding_required"]').fill('500');
  await evidence.locator('[name="funding_received"]').fill('500');
  await evidence.locator('[name="receipt_ref"]').fill('BANK-TEST-01');
  await evidence.locator('[name="attested"]').check();await evidence.locator('button').click();
  await evidence.locator('[data-evidence-feedback]').filter({hasText:'Saved for'}).waitFor();
  await page.locator('[data-inbox-refresh]').click();await page.locator('[data-inbox-filter]').waitFor();
  await page.locator('[data-inbox-record="order:o0"] .commercialEvidence summary').click();
  assert.equal(await evidence.locator('[name="receipt_ref"]').inputValue(),'BANK-TEST-01');

  const downloaded=page.waitForEvent('download');await page.locator('[data-inbox-record="order:o0"] [data-commercial-export="rfq"]').click();
  const rfq=await downloaded;await rfq.saveAs('test-results/rfq-'+width+'.csv');assert.match(readFileSync('test-results/rfq-'+width+'.csv','utf8'),/DRAFT RFQ/);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Inbox page overflow');
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:`test-results/commercial-inbox-${width}.png`,fullPage:true});
  await page.screenshot({path:`test-results/admin-interface-${width}.png`});
  await page.locator('[data-admin-request]').first().click();await page.locator('.modalBackdrop').waitFor();
  assert.match(await page.locator('[data-bank-transfer]').innerText(),/AE740030010805403920001/);
  assert.match(await page.locator('[data-bank-transfer]').innerText(),/10805403920001/);
  await page.locator('[data-request-status]').selectOption('Procurement');
  await page.locator('[data-status-feedback]').filter({hasText:'Verify required funding'}).waitFor();
  await page.screenshot({path:`test-results/admin-quotation-${width}.png`});
  assert.equal(await page.locator('[data-request-status]').inputValue(),'Sent');
  assert.equal(await page.evaluate(()=>window.__tables.orders[0].status),'quote_sent');
  assert.deepEqual(errors,[]);await context.close();
  console.log(`Combined inbox, follow-up save/refresh, overdue/completed filters and quote builder ${width}: PASS`);
 }
 const {context,page,errors}=await setup('live',390);
 await page.goto(base+'/#portal/catalogue/all');await page.locator('[data-cat-q]').waitFor();
 await page.locator('[data-cat-q]').fill('add 2 wheelchairs');await page.locator('[data-cat-q]').press('Enter');
 await page.locator('[data-basket]:visible').first().click();await page.evaluate(()=>{window.__submissionFailOnce=true;});
 await page.locator('[data-submit-request]').click();await page.getByText('Request not confirmed.',{exact:true}).waitFor();
 assert.equal(await page.locator('[data-submit-request]').isEnabled(),true);
 await page.locator('[data-submit-request]').click();await page.getByText('Request received.',{exact:true}).waitFor();
 const calls=await page.evaluate(()=>window.__backendCalls.filter(c=>c.rpc==='psc_submit_institutional_request'));
 assert.equal(calls.length,2);assert.equal(calls[0].args.p_submission_key,calls[1].args.p_submission_key);
 assert.equal(await page.evaluate(()=>window.__tables.orders.filter(o=>o.submission_key).length),1);
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('psc-pending-submission')),null);
 assert.deepEqual(errors,[]);await context.close();console.log('Failure retains draft; retry reuses key; one acknowledged request: PASS');
}finally{await browser.close();server.close();}
