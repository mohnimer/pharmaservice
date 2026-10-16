import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox','--disable-dev-shm-usage']});
mkdirSync('test-results/sports-photos',{recursive:true});
try{for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:1000}});await context.addInitScript(()=>window.__testRole='demo');
 await context.route('**/*',r=>{const host=new URL(r.request().url()).hostname;if(host==='127.0.0.1')return r.continue();return r.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8'):''});});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=`http://127.0.0.1:${server.address().port}/#portal/catalogue/sports`;
 await page.goto(url);await page.locator('[data-family-listing="PSC-IS-039"] .productMainImage').waitFor();await page.waitForTimeout(300);
 await page.locator('.productMainImage').evaluateAll(async images=>{await Promise.all(images.map(async img=>{img.loading='eager';await img.decode();}));});
 const checks=await page.locator('.productCard[data-family-listing]').evaluateAll(es=>es.map(e=>{const v=e.querySelector('.productVisual'),i=v.querySelector('.productMainImage'),b=getComputedStyle(v,'::before'),r=v.getBoundingClientRect();return {id:e.dataset.familyListing,loaded:i?.complete&&i?.naturalWidth>=200,hidden:getComputedStyle(v).display==='none',innerWidth:parseFloat(b.width),innerHeight:parseFloat(b.height),width:r.width,height:r.height,blocked:i&&window.PSC_IMAGE_POLICY.isBlocked(i.src)};}));
 console.log(width,JSON.stringify(checks));assert(checks.length>=7);assert(checks.filter(c=>c.loaded).length>=6);assert(checks.every(c=>c.hidden||(c.loaded&&!c.blocked&&Math.abs(c.innerWidth-(c.width-18))<2&&Math.abs(c.innerHeight-(c.height-18))<2)));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.locator('[data-family-listing="PSC-IS-039"]').scrollIntoViewIfNeeded();await page.screenshot({path:`test-results/sports-photos/${width}-cards.png`});
 for(const id of ['PSC-IS-039','PSC-IS-041','PSC-IS-043']){
 await page.goto(url);const card=page.locator(`[data-family-listing="${id}"]`);await card.waitFor();const src=await card.locator('.productMainImage').getAttribute('src');await card.locator('[data-product-view]').first().click();
 const detail=page.locator('[data-psc-family-detail-root]');await detail.locator('.pscFamilyProductSheet').waitFor();const photo=detail.locator('.pscFamilyPreview>img');await photo.waitFor();assert.equal(await photo.getAttribute('src'),src);await page.waitForTimeout(150);assert(await photo.evaluate(i=>i.complete&&i.naturalWidth>=200));await page.keyboard.press('Escape');await detail.waitFor({state:'detached'});
 }
 assert.deepEqual(errors,[]);await context.close();console.log(`${width}px sports photos, full inset frames and detail continuity PASS`);
}}finally{await browser.close();server.close();}
