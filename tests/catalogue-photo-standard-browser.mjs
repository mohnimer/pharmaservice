import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox','--disable-dev-shm-usage']});
mkdirSync('test-results/photo-standard',{recursive:true});
try{for(const width of [390,768,1440]){
 const context=await browser.newContext({viewport:{width,height:1000}});await context.addInitScript(()=>window.__testRole='demo');
 await context.route('**/*',r=>{const host=new URL(r.request().url()).hostname;if(host==='127.0.0.1')return r.continue();return r.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8'):''});});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const area of ['equipment','consumables','medicines']){
 await page.goto(`http://127.0.0.1:${server.address().port}/#portal/catalogue/dha-${area}`);await page.locator('.productMainImage').first().waitFor();await page.waitForTimeout(250);
 assert.equal(await page.locator('.pscFamilyRepresentative').count(),0);
 const checks=await page.locator('.productVisual:has(.productMainImage)').evaluateAll(elements=>elements.map(e=>{const style=getComputedStyle(e),before=getComputedStyle(e,'::before'),r=e.getBoundingClientRect(),i=e.querySelector('.productMainImage'),ir=i.getBoundingClientRect();return {white:style.backgroundColor==='rgb(255, 255, 255)',border:style.borderTopWidth,inner:before.borderTopWidth,innerVisible:before.display!=='none',cardBorder:getComputedStyle(e.closest('.productCard')).borderTopWidth,space:parseFloat(getComputedStyle(i).left)>r.width*.1,noBrand:!window.PSC_IMAGE_POLICY.isBlocked(i.src)};}));
 assert(checks.length);assert(checks.every(c=>c.white&&c.border==='1px'&&!c.innerVisible&&c.cardBorder==='1px'&&c.space&&c.noBrand),JSON.stringify(checks));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.locator('.productCard[data-family-listing]').first().scrollIntoViewIfNeeded();await page.screenshot({path:`test-results/photo-standard/${width}-${area}.png`,fullPage:false});
 }
 const card=page.locator('[data-family-listing="PSC-SC-D04"]');await card.waitFor();const src=await card.locator('.productMainImage').getAttribute('src');
 await card.locator('[data-product-view]').first().click();const detail=page.locator('[data-psc-family-detail-root]');await detail.waitFor({state:'attached'});await detail.locator('.pscFamilyProductSheet').waitFor();await page.waitForTimeout(300);
 assert(await detail.locator('.detailImagePane').isVisible());assert.equal(await detail.locator('.pscFamilyPreview>img').getAttribute('src'),src);
 await detail.locator('.pscFamilyPreview>img').evaluate(img=>{if(!img.complete||img.naturalWidth<200)throw Error('Detail photo did not load');});
 await page.screenshot({path:`test-results/photo-standard/${width}-glucagon-detail.png`,fullPage:false});
 assert.deepEqual(errors,[]);await context.close();console.log(`${width}px: single photograph border plus card border, padding, no supplier branding, no card captions and Glucagon photo continuity PASS`);
}}finally{await browser.close();server.close();}
