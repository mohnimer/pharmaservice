// Direction-aware real headers and non-obstructing, privacy-safe WhatsApp contact.
import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
mkdirSync('test-results/navigation',{recursive:true});
try{for(const [width,role,motion] of [[390,'demo','no-preference'],[1440,'demo','no-preference'],[320,'demo','reduce'],[390,'anonymous','no-preference']]){
 const ctx=await browser.newContext({viewport:{width,height:850},reducedMotion:motion});
 await ctx.addInitScript(role=>window.__testRole=role,role);
 await ctx.route('**/*',r=>{const host=new URL(r.request().url()).hostname;if(host==='127.0.0.1')return r.continue();return r.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8'):''});});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/#${role==='demo'?'portal/catalogue/all':'contact'}`);
 await page.locator(role==='demo'?'.pscEditorialCard':'.v3927ContactForm').first().waitFor();
 const header=page.locator('[data-ps-scroll-header]'),contact=page.locator('.psWhatsAppShortcut');assert.equal(await header.count(),1);assert.equal(await contact.count(),1);
 const url=new URL(await contact.getAttribute('href'));assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/971553511335');assert.equal(url.searchParams.get('text'),'Hello Pharma Service, I have a question about an institutional supply enquiry.');assert.equal(await contact.getAttribute('target'),'_blank');assert((await contact.getAttribute('rel')).includes('noopener'));
 const scroll=async y=>{await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(230);};
 await scroll(1600);await page.waitForFunction(()=>document.querySelector('[data-ps-scroll-header]').classList.contains('psChromeHidden'));assert(await header.evaluate(el=>el.inert));
 const y=await page.evaluate(()=>scrollY);await scroll(y-40);
 assert.equal(await header.evaluate(el=>el.classList.contains('psChromeHidden')),false);assert.equal(await header.evaluate(el=>el.inert),false);
 const box=await header.boundingBox();assert(Math.abs(box.y)<2,'Actual header must return to viewport top, not merely animate in its off-screen original position');
 assert(Math.abs(await page.evaluate(()=>scrollY)-(y-40))<2,'Revealing navigation must not move content');
 if(motion==='reduce')assert.equal(await header.evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
 assert(await contact.isVisible());
 if(role==='demo'){
  if(width<=980){const action=page.locator('.psScopeMobileSummary');if(await action.isVisible()){const a=await action.boundingBox(),w=await contact.boundingBox();assert(w.y+w.height<=a.y-4,'WhatsApp must clear the request summary');}
   await page.locator('[data-mobile-open]').click();await page.locator('.mobileOverlay.show').waitFor();assert.equal(await contact.isVisible(),false);
   await page.locator('.sidebar [data-go="portal/wishlist"]').click();await page.locator('.customerSimpleHeader h1').waitFor();assert.equal(await page.locator('.customerSimpleHeader h1').innerText(),'Wishlist');
   await page.evaluate(()=>window.PSC_NAVIGATE('portal/catalogue/all'));await page.locator('.pscEditorialCard').first().waitFor();
  }
  const basket=page.locator(width<=980?'.mobileCartButton':'.pillBasket');await basket.click();await page.locator('.requestDrawer').waitFor();assert.equal(await contact.isVisible(),false);await page.locator('[data-close-basket]').click();await page.waitForTimeout(250);assert(await contact.isVisible());
  const search=page.locator(width<=980?'.mobileSearchInput input':'.topbarSearch input');await search.focus();if(width<=1100)assert.equal(await contact.isVisible(),false);await page.evaluate(()=>document.activeElement.blur());
 }else{await page.locator('[data-public-menu]').click();assert.equal(await contact.isVisible(),false);await page.locator('[data-public-menu]').click();}
 await page.evaluate(()=>document.activeElement.blur());await scroll(1600);await page.keyboard.press('Tab');assert.equal(await header.evaluate(el=>el.inert),false,'Tab must reveal navigation before focus moves');
 await page.evaluate(()=>document.activeElement.blur());const current=await page.evaluate(()=>scrollY);await scroll(current+100);await scroll(current+60);
 await page.screenshot({animations:'disabled',path:`test-results/navigation/${role}-${width}-${motion}.png`});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);await ctx.close();console.log(`${role}/${width}/${motion}: scroll reveal, reachable menus, stable content, safe WhatsApp, no overlap PASS`);
}}finally{await browser.close();server.close();}
