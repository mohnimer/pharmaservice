import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const context={window:{}};vm.createContext(context);vm.runInContext(readFileSync('current/behaviour/product-presentation.js','utf8'),context);
const helper=context.window.PSC_PRODUCT_PRESENTATION;
for(const field of ['pscSku','sku','product_option_id','family_id']){
 const html=helper.whatsappHtml({name:'Exact <pack> & product',[field]:'TEST-ONLY-001',pack:'20 tablets'});
 const url=new URL(html.match(/href="([^"]+)"/)[1].replaceAll('&amp;','&'));
 assert.equal(url.host,'wa.me');assert.equal(url.pathname,'/971553511335');
 assert.equal(url.searchParams.get('text'),'Hello Pharma Service, I have a question about Exact <pack> & product · Reference: TEST-ONLY-001 · 20 tablets.');
 assert(!html.includes('<pack>'));assert(html.includes('rel="noopener noreferrer"'));
}
assert(!helper.factsHtml({professionalInformation:{status:'PENDING',source:'Fixture',fields:{strength:'UNAPPROVED'},verifiedFields:['strength']}}).includes('UNAPPROVED'));
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({args:['--no-sandbox']});
try{for(const width of [320,390,1440]){
 const ctx=await browser.newContext({viewport:{width,height:900}});await ctx.addInitScript(()=>window.__testRole='demo');
 await ctx.route('**/*',r=>{const host=new URL(r.request().url()).hostname;if(host==='127.0.0.1')return r.continue();return r.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8'):''});});
 const page=await ctx.newPage();
 await page.goto(`http://127.0.0.1:${server.address().port}/#portal/catalogue/sports`);
 const details=page.locator('.productGrid [data-product-view]').first();await details.waitFor();
 const sku=await details.getAttribute('data-product-view');
 const exact=await page.evaluate(id=>{const p=window.PSC_DATA.products.find(p=>p.pscSku===id);return {name:p.name,pack:p.cataloguePack||p.pack};},sku);
 await details.click();const help=page.locator('.professionalProductDetail .psWhatsAppShortcut').first();await help.waitFor();
 assert.equal(await page.locator('.psWhatsAppShortcut').count(),1,'one existing compact enquiry link');
 if(await page.locator('[data-family-variant]').count()){
  const familyDraft=new URL(await help.getAttribute('href'));
  assert(familyDraft.searchParams.get('text').includes(await page.locator('#pscFamilyTitle').innerText()));
  const option=await page.locator('[data-family-variant] option').evaluateAll((nodes,name)=>nodes.find(n=>n.textContent.includes(name))?.value,exact.name);
  assert(option,'exact local member remains selectable');await page.locator('[data-family-variant]').selectOption(option);
 }
 const draft=new URL(await help.getAttribute('href'));assert(draft.searchParams.get('text').includes(exact.name));assert(draft.searchParams.get('text').includes(sku));
 if(exact.pack)assert(draft.searchParams.get('text').includes(exact.pack));
 assert.equal(await help.getAttribute('target'),'_blank');assert.match(await help.getAttribute('rel'),/noopener/);
 assert.deepEqual(await page.evaluate(()=>window.__backendCalls.filter(c=>c.rpc||c.action!=='select')),[]);
 await ctx.close();console.log('PASS exact enquiry context, compact Details link, no send',width);
}}finally{await browser.close();server.close();}
