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
await page.goto(base+'/#portal/catalogue');await page.locator('[data-cat-q]').waitFor();
assert.equal(await page.locator('.psIntelligentSearch h2').innerText(),'Tell us what you need');
assert.equal(await page.locator('.psIntelligentSearch > p').innerText(),'the way you’d normally say it');
assert((await page.locator('[data-cat-q]').boundingBox()).y<850,'shop search must be immediately prominent');
await page.screenshot({path:`test-results/shop-search-${width}.png`});
await page.locator('[data-cat-q]').focus();
await page.evaluate(()=>{window.__searchInput=document.querySelector('[data-cat-q]');window.__searchTop=window.__searchInput.getBoundingClientRect().top;window.__searchFocus=0;window.__searchInput.addEventListener('focus',()=>window.__searchFocus++);});
for(const char of 'whelchair'){await page.locator('[data-cat-q]').pressSequentially(char);await page.waitForTimeout(170);assert(await page.evaluate(()=>window.__searchInput===document.querySelector('[data-cat-q]')&&document.activeElement===window.__searchInput));assert(Math.abs(await page.evaluate(()=>window.__searchInput.getBoundingClientRect().top-window.__searchTop))<2,'input must not shift while typing');}
assert.equal(await page.evaluate(()=>window.__searchFocus),0);assert.match(await page.locator('.productGrid').innerText(),/wheel ?chair/i);
await page.goto(base+'/#portal/catalogue/all');await page.locator('[data-cat-q]').waitFor();
const command=async text=>{await page.locator('[data-cat-q]').fill(text);await page.locator('[data-cat-q]').press('Enter');await page.locator('.psInterpretation').waitFor();await page.waitForTimeout(120);console.log(width,text,await page.locator('.psInterpretation').innerText());};
const request=()=>page.locator('.psLiveRequest');
await command('we need a wheelchair');assert.match(await page.locator('.productGrid').innerText(),/wheel ?chair/i);
await command('add 2 wheelchairs');assert.match(await request().textContent(),/wheel ?chair/i);assert.equal(await request().locator('[data-ps-line-qty]').inputValue(),'2');
await command('we need big gauze');assert.match(await page.locator('.productGrid').innerText(),/gauze/i); // Only ask when several real large sizes exist.
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
await command('PSC-DBT-001');
await command('add 1 glucometer');
await command('we need another 3 of those');assert.equal(await request().locator('[data-ps-line-qty]').first().inputValue(),'4');
await command('strips for this');assert.match(await page.locator('.productCard').first().innerText(),/glucometer strips/i);
await command('and needles');assert.match(await page.locator('.productCard').first().innerText(),/lancet/i);
await command('we need another 3 of those');assert.equal(await request().locator('[data-ps-line-qty]').last().inputValue(),'3');
await command('remove the first one');assert.equal(await request().locator('[data-ps-line-qty]').count(),1);
await command('remove the first one');assert.equal(await request().locator('[data-ps-line-qty]').count(),0);
await command('zzznothing');assert.match(await page.locator('.psInterpretation').textContent(),/Try describing what the item is used for/i);
await page.locator('[data-catalogue-clear]').click();assert((await page.locator('.productCard').count())>10);
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
await page.screenshot({path:`test-results/intelligent-search-${width}.png`,fullPage:false});await context.close();console.log('PASS command sequence, fallback, handoff, demo safety, refresh and layout',width);
}
const context=await browser.newContext({viewport:{width:390,height:900}});
await context.addInitScript(()=>{window.__testRole='demo';window.__testAccessToken='test.jwt.token';});let calls=0,secondStarted;const secondRequest=new Promise(r=>secondStarted=r);
await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.pathname==='/api/interpret-request'){calls++;if(calls===2)secondStarted();await new Promise(r=>setTimeout(r,350));return route.fulfill({contentType:'application/json',body:JSON.stringify({action:{intent:'search',terms:'wheelchair'},rankedIds:['invented-product','PSC-MOB-001']})});}if(u.hostname==='127.0.0.1')return route.continue();if(u.hostname==='cdn.jsdelivr.net')return route.fulfill({contentType:'text/javascript',body:readFileSync('tests/mock-supabase.js','utf8')});return route.fulfill({status:200,body:''});});
const page=await context.newPage();await page.goto(base+'/#portal/catalogue');await page.locator('[data-cat-q]').waitFor();
await page.locator('[data-cat-q]').fill('unfamiliar description');await page.locator('[data-cat-q]').press('Enter');
await page.waitForFunction(()=>document.querySelector('.productCard')?.textContent.match(/wheel ?chair/i));
assert.equal(await page.locator('[data-product-view="invented-product"]').count(),0);
await page.locator('[data-cat-q]').fill('different unfamiliar description');await page.locator('[data-cat-q]').press('Enter');
await Promise.race([secondRequest,new Promise((_,reject)=>setTimeout(()=>reject(new Error('second model request did not start')),5000))]);await page.locator('[data-cat-q]').fill('gauze');await page.waitForTimeout(650);
assert.equal(await page.locator('[data-cat-q]').inputValue(),'gauze');assert.match(await page.locator('.productCard').first().innerText(),/gauze/i);assert.equal(calls,2);
assert.deepEqual(await page.evaluate(()=>window.__backendCalls.filter(c=>c.rpc||c.action!=='select')),[]);await context.close();console.log('PASS grounded asynchronous model ranking and stale-response isolation');
}finally{await browser.close();server.close();}
