import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
import index from '../current/behaviour/product-knowledge-index.js';
const requestText=page=>page.locator('.psLiveRequest').textContent();
const expected=index.records.filter(r=>r.visible&&r.medicine?.therapeuticClasses.includes('antihistamine')).map(r=>r.id).sort();
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox']});
mkdirSync('test-results',{recursive:true});
try {for(const width of [320,390,1440]){
 const context=await browser.newContext({viewport:{width,height:900}});
 await context.addInitScript(()=>{window.__testRole='demo';});
 await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.pathname==='/api/interpret-request')return route.fulfill({status:503,body:'{"fallback":true}'});if(u.hostname==='127.0.0.1')return route.continue();if(u.hostname==='cdn.jsdelivr.net')return route.fulfill({contentType:'text/javascript',body:readFileSync('tests/mock-supabase.js','utf8')});return route.fulfill({status:200,body:''});});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/#portal/catalogue/all`);await page.locator('[data-cat-q]').waitFor();
 const command=async text=>{await page.locator('[data-cat-q]').fill(text);await page.locator('[data-cat-q]').press('Enter');await page.locator('.psInterpretation').waitFor();};
 for(const query of ['antihistamine','anti histamine','antihistamin']){
  await command(query);
  const ids=await page.locator('.productCard [data-product-view]').evaluateAll(nodes=>[...new Set(nodes.map(n=>n.dataset.productView))].sort());
  assert.deepEqual(ids,expected,query+' must render all real antihistamine IDs');
 }
 await command('allergy tablets');assert(!await page.locator('.productGrid').textContent().then(s=>s.includes('PANADOL NIGHT')));
 assert.equal(await page.locator('[data-cat-q]').evaluate(el=>getComputedStyle(el).fontSize),'16px');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:`test-results/medicine-search-${width}.png`});
 await command('add 3 boxes of gloves');assert.match(await page.locator('.psInterpretation').innerText(),/Choose an existing catalogue line/);await page.locator('[data-ps-select-sku]').first().click();assert.equal(await page.locator('[data-ps-line-qty]').first().inputValue(),'3');assert.match(await requestText(page),/box/);
 await command('big mask');assert.match(await page.locator('.psInterpretation').innerText(),/Which type of mask/);
 await command('bilastine');assert.match(await page.locator('.psSearchEmpty').innerText(),/matching product indexed/);
 await page.locator('[data-ps-unlisted]').click();
 const request=page.locator('.psLiveRequest');assert.match(await request.textContent(),/bilastine/);assert.match(await request.textContent(),/Unit to confirm/);
 if(width<800)await page.locator('[data-ps-sheet-open]').click();
 await request.locator('[data-ps-prepare]').click();assert.match(await page.locator('.requestDrawer').innerText(),/Unlisted item — requires PS review/);
 await page.locator('[data-submit-request]').click();assert.match(await page.locator('body').innerText(),/simulated request/i);
 assert.deepEqual(await page.evaluate(()=>window.__backendCalls.filter(c=>c.rpc||c.action!=='select')),[]);
 assert.deepEqual(errors,[]);await context.close();console.log('PASS rendered medicinal IDs, ambiguity, unlisted handoff and narrow layout',width);
}}finally{await browser.close();server.close();}
