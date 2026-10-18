// Delivered-history fixtures only. No automatic replenishment or external calls.
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({args:['--no-sandbox']});
const extension=`(()=>{window.__tables.orders=[{id:'delivered-one',school_id:'s1',group_id:'g1',order_number:'TEST-DELIVERED-ONE',status:'delivered',created_at:'2026-09-01',delivered_at:'2026-09-05'},{id:'other-site',school_id:'s2',group_id:'g1',order_number:'TEST-OTHER-SITE',status:'delivered',created_at:'2026-09-01',delivered_at:'2026-09-05'}];window.__tables.order_lines=[{id:'l1',order_id:'delivered-one',psc_sku_snapshot:'PSC-WND-001',quantity:3},{id:'l2',order_id:'delivered-one',psc_sku_snapshot:'PSC-EQP-006',quantity:1},{id:'l3',order_id:'other-site',psc_sku_snapshot:'PSC-WND-001',quantity:99}];window.__tables.quotes=[];window.__tables.quote_lines=[];})();`;
try{for(const width of [390,1440]){
 const ctx=await browser.newContext({viewport:{width,height:950}});await ctx.addInitScript(()=>window.__testRole='member');
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname==='cdn.jsdelivr.net')return r.fulfill({contentType:'text/javascript',body:readFileSync('tests/mock-supabase.js','utf8')+extension});return r.fulfill({status:503,body:''});});
 const page=await ctx.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/#portal/replenish`);await page.locator('.replenishCard').first().waitFor();
 assert.equal(await page.locator('.replenishCard').count(),2,'current site receives only its own delivered lines: '+await page.locator('.replenishCard').allTextContents());
 const consumable=page.locator('[data-replenish="PSC-WND-001|3"]'),capital=page.locator('[data-replenish="PSC-EQP-006|1"]');
 assert.match(await consumable.innerText(),/Replenish 3/);assert.match(await capital.innerText(),/^Request another/);
 assert.equal(await page.locator('[data-replenish="PSC-WND-001|99"]').count(),0,'other-site usage is not multiplied into this site');
 assert.equal(await page.evaluate(()=>window.__backendCalls.filter(c=>c.rpc||c.action!=='select').length),0,'viewing history never places an order');
 await consumable.click();await page.locator('[data-basket]:visible').first().click();await page.locator('.requestDrawer').waitFor();assert.match(await page.locator('.requestDrawer').innerText(),/gauze/i);
 assert.equal(await page.evaluate(()=>window.__backendCalls.filter(c=>c.rpc||c.action!=='select').length),0,'replenishment creates a reviewable local request, not a supplier commitment');
 await ctx.close();console.log('PASS site-scoped delivered history, recurring/capital distinction and no automatic order',width);
}}finally{await browser.close();server.close();}
