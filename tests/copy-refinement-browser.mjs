import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox']});
mkdirSync('test-results',{recursive:true});
try{
 for(const width of [320,390,768,1440]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  await context.addInitScript(()=>{window.__testRole='demo';});
  await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1'&&u.pathname!='/api/interpret-request')return route.continue();if(u.hostname==='cdn.jsdelivr.net')return route.fulfill({contentType:'text/javascript',body:readFileSync('tests/mock-supabase.js','utf8')});return route.fulfill({status:503,body:''});});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const route of ['home','our-model','portal/dashboard']){
   await page.goto(`${base}/#${route}`);
   await page.locator(route==='home'?'.home47':route==='our-model'?'.model46':'.v26HomeHero').waitFor();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} overflow ${width}`);
   if(route==='home')assert.match(await page.locator('.h47Hero h1').innerText(),/Made easier/);
   if(route==='our-model')assert.match(await page.locator('.model46').innerText(),/You manage one order/);
   if(route==='portal/dashboard'){assert.equal(await page.locator('.v26HomeHero h1').innerText(),'Start');assert.equal(await page.locator('.v26HomeStatus').count(),0);}
   await page.screenshot({path:`test-results/copy-${route.replace('/','-')}-${width}.png`,fullPage:true});
   if(route!=='our-model'){
    const input=page.locator('[data-ps-command-form] [data-cat-q]');await input.fill('whelchair');await input.press('Enter');
    await page.locator('.productGrid .productCard').waitFor();
    assert.equal(await page.locator('.productGrid .productCard').count(),1);
    assert.match(await page.locator('.productGrid').innerText(),/wheel chair/i);
   }
  }
  assert.deepEqual(errors,[]);await context.close();console.log(`Copy, layout and search entry ${width}: PASS`);
 }
 const context=await browser.newContext();await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname==='cdn.jsdelivr.net')return r.fulfill({contentType:'text/javascript',body:readFileSync('tests/mock-supabase.js','utf8')});return r.fulfill({status:503,body:''});});
 const page=await context.newPage();await page.goto(base+'/#home');await page.locator('#psHomeCommand').fill('antihistamine');await page.locator('#psHomeCommand').press('Enter');await page.locator('.loginCard').waitFor();assert.equal(await page.evaluate(()=>sessionStorage.getItem('pscPendingSearch')),'antihistamine');await context.close();console.log('Anonymous catalogue gate preserves search: PASS');
}finally{await browser.close();server.close();}
