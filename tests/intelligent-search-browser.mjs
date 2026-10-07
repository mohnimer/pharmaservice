import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox']});
mkdirSync('test-results',{recursive:true});
try{for(const width of [1440,390]){
const context=await browser.newContext({viewport:{width,height:1000}});
await context.addInitScript(()=>{window.__testRole='demo';});
await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.pathname==='/api/interpret-request')return route.fulfill({status:503,body:'{"fallback":true}'});if(u.hostname==='127.0.0.1')return route.continue();if(u.hostname==='cdn.jsdelivr.net')return route.fulfill({contentType:'text/javascript',body:readFileSync('tests/mock-supabase.js','utf8')});return route.fulfill({status:200,body:''});});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base+'/#portal/catalogue/all');await page.locator('[data-cat-q]').waitFor();
const command=async text=>{await page.locator('[data-cat-q]').fill(text);await page.locator('[data-cat-q]').press('Enter');await page.locator('.psInterpretation').waitFor();await page.waitForTimeout(120);console.log(width,text,await page.locator('.psInterpretation').innerText());};
const request=()=>page.locator('.psLiveRequest');
await command('we need a wheelchair');assert.match(await page.locator('.productGrid').innerText(),/wheel ?chair/i);
await command('add 2 wheelchairs');assert.match(await request().textContent(),/wheel ?chair/i);assert.equal(await request().locator('[data-ps-line-qty]').inputValue(),'2');
await command('we need big gauze');assert.equal(await page.locator('.psClarification').count(),1);
await command('10 x 10');assert.match(await page.locator('.productGrid').innerText(),/10.*10/);
await command('add 5 boxes');assert.match(await request().textContent(),/Sterile gauze — 10 × 10 cm/);assert.equal(await request().locator('[data-ps-line-qty]').count(),2);assert.equal(await request().locator('[data-ps-line-qty]').nth(1).inputValue(),'5');
await command('deliver this to Sharjah');assert.match(await request().locator('[data-ps-scope="location"]').inputValue(),/sharjah/i);
await command('this is for 3 clinics');assert.equal(await request().locator('[data-ps-scope="sites"]').inputValue(),'3');assert.equal(await request().locator('[data-ps-line-qty]').first().inputValue(),'2');
await command('we already have the wheelchairs');assert.equal(await request().locator('[data-ps-line-qty]').count(),1);assert.match(await request().locator('.psRetained').textContent(),/wheel ?chair/i);
await command('only show consumables');assert.equal(await request().locator('[data-ps-line-qty]').inputValue(),'5');
await command('remove the gauze');assert.equal(await request().locator('[data-ps-line-qty]').count(),0);assert.match(await request().locator('.psScopeTotals').textContent(),/Lines: 0.*Total quantity: 0/);
await command('add 2 wheelchairs');
await command('set wheelchair quantity 4');assert.equal(await request().locator('[data-ps-line-qty]').inputValue(),'4');
if(width===390){await page.locator('[data-ps-sheet-open]').click();assert.equal(await request().isVisible(),true);await page.locator('[data-ps-sheet-close]').click();assert.equal(await request().isVisible(),false);await page.locator('[data-ps-sheet-open]').click();}
await page.locator('[data-ps-prepare]').click();assert.match(await page.locator('.psRequestScopeReview').textContent(),/sharjah/i);assert.match(await page.locator('.psRequestScopeReview').textContent(),/Existing \/ retain/);await page.locator('[data-submit-request]').click();assert.match(await page.locator('body').innerText(),/simulated request/i);
assert.deepEqual(await page.evaluate(()=>window.__backendCalls.filter(c=>c.rpc||c.action!=='select')),[]);
await page.reload();await page.locator('[data-cat-q]').waitFor();assert.equal(await request().locator('[data-ps-line-qty]').count(),0);assert.equal(await request().locator('.psRetained').count(),0);
await command('zzznothing');assert.match(await page.locator('.psInterpretation').textContent(),/couldn’t confidently/i);
await page.locator('[data-catalogue-clear]').click();assert((await page.locator('.productCard').count())>10);
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
await page.screenshot({path:`test-results/intelligent-search-${width}.png`,fullPage:false});await context.close();console.log('PASS command sequence, fallback, handoff, demo safety, refresh and layout',width);
}}finally{await browser.close();server.close();}
