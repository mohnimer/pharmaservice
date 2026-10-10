import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox']});
try{for(const width of [390,1440]){
 const ctx=await browser.newContext({viewport:{width,height:950}});
 await ctx.addInitScript(()=>window.__testRole='customer');
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname==='cdn.jsdelivr.net')return r.fulfill({contentType:'text/javascript',body:readFileSync('tests/mock-supabase.js','utf8')});return r.fulfill({status:503,body:''})});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/#portal/dashboard');await page.locator('.pscHomeCategory').first().waitFor();
 assert.equal(await page.locator('.pscHomeCategory').count(),6);
 assert.equal(await page.locator('.pscHomeGuide').count(),2);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:`test-results/portal-home-${width}.png`,fullPage:true});
 for(const id of ['wounds','breathing','vitals','medicines','equipment','procedures']){
  await page.locator(`.pscHomeCategory[data-go="portal/catalogue/${id}"]`).click();
  await page.waitForURL('**/#portal/catalogue/'+id);
  assert(await page.locator('[data-ps-search-results]').count());
  await page.evaluate(()=>PSC_NAVIGATE('portal/dashboard'));
 }
 const target=await page.locator('.pscHomeGuide').first().getAttribute('data-go');
 await page.locator('.pscHomeGuide').first().click();await page.waitForURL('**/'+target);
 assert(!(await page.locator('body').innerText()).includes('Guide not found'));
 assert.deepEqual(errors,[]);await ctx.close();console.log(`Portal home: six category routes, published guide, no overflow, ${width}: PASS`);
}}finally{await browser.close();server.close()}
