// Revised shared shapes, account context and immediate feedback in the real bundle.
import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
mkdirSync('test-results/cohesion',{recursive:true});
try{for(const [width,role,reducedMotion] of [[320,'demo','no-preference'],[768,'demo','no-preference'],[1440,'demo','no-preference'],[320,'school','reduce']]){
 const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion});
 await ctx.addInitScript(role=>window.__testRole=role,role);
 await ctx.route('**/*',r=>{const host=new URL(r.request().url()).hostname;if(host==='127.0.0.1')return r.continue();const mock=readFileSync('tests/mock-supabase.js','utf8')+(role==='school'?";window.__tables.memberships[0].school_id='s1';window.__tables.memberships[0].role='clinic_user';":"");return r.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?mock:''});});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=`http://127.0.0.1:${server.address().port}`;
 await page.goto(base+'/#portal/dashboard');await page.locator('.psPortalWelcome').waitFor();
 const account=page.locator('[data-account-switcher]');assert.equal(await account.getAttribute('aria-label'),'Account navigation');
 assert.equal(await page.locator('.mobileAccountDot').count(),0);
 const before=await account.boundingBox();await account.click();await page.locator('#psAccountMenu').waitFor();
 const after=await account.boundingBox();assert(Math.abs(after.width-before.width)<1&&Math.abs(after.height-before.height)<1,'Opening menu must not resize the control');
 assert((await page.locator('.masterAccountContext').innerText()).includes('Test Group'));
 if(role==='school'){assert.equal(await page.locator('#psAccountMenu [data-school-select]').count(),0);assert((await page.locator('.masterAccountContext').innerText()).includes('Site One'));}
 else{await page.locator('[data-school-select="s2"]').click();await account.click();assert((await page.locator('.masterAccountContext').innerText()).includes('Site Two'));}
 await page.keyboard.press('Escape');await page.waitForFunction(()=>document.querySelector('[data-account-switcher]').getAttribute('aria-expanded')==='false');assert.equal(await account.getAttribute('aria-expanded'),'false');assert(await account.evaluate(el=>document.activeElement===el));
 await page.screenshot({animations:'disabled',path:`test-results/cohesion/${role}-${width}-dashboard.png`});
 await page.evaluate(()=>window.PSC_NAVIGATE('portal/catalogue/sports'));await page.locator('.pscEditorialCard').first().waitFor();
 assert(await page.locator('.pillBasket').isVisible());assert.equal(await page.locator('.mobileCartButton:visible').count(),0);

 const card=page.locator('.pscEditorialCard').first();await card.scrollIntoViewIfNeeded();
 const framing=await card.evaluate(el=>({card:getComputedStyle(el).borderTopWidth,image:getComputedStyle(el.querySelector('.productVisual')).borderTopWidth,inset:getComputedStyle(el.querySelector('.productVisual'),'::before').display}));assert.deepEqual(framing,{card:'1px',image:'1px',inset:'none'});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({animations:'disabled',path:`test-results/cohesion/${role}-${width}-catalogue.png`});
 // Save outside the image, retain identity after reload, and isolate clinic preferences.
 const heart=card.locator('[data-wishlist-toggle]'),savedKey=await heart.getAttribute('data-wishlist-toggle');
 const badge=card.locator('.cardDhaIcon');
 const detailsBox=await card.locator('.canvaDetails').boundingBox(),heartBox=await heart.boundingBox();assert(Math.abs(detailsBox.y-heartBox.y)<1,'Save and View details share one aligned action row');
 assert.equal(await heart.evaluate(el=>!!el.closest('.productVisual')),false,'Heart must never sit over the photograph/DHA mark');
 if(await badge.count()){const h=await heart.boundingBox(),d=await badge.boundingBox();assert(h.y>=d.y+d.height||h.x>=d.x+d.width||h.x+h.width<=d.x||h.y+h.height<=d.y,'DHA mark cannot overlap the save control');}
 await heart.click();assert.equal(await heart.getAttribute('aria-pressed'),'true');
 const requestBefore=await page.locator('.mobileCartButton b').innerText();
 await page.evaluate(()=>window.PSC_NAVIGATE('portal/wishlist'));await page.locator('.wishlistGrid').waitFor();
 assert.equal(await page.locator('[data-wishlist-toggle]').count(),1);assert.equal(await page.locator('[data-wishlist-toggle]').getAttribute('data-wishlist-toggle'),savedKey);
 await page.reload();await page.locator('[data-account-switcher]').waitFor();
 // Demo clinic selection intentionally resets on refresh; saved preferences stay scoped.
 if(role==='demo'){assert.equal(await page.locator('.wishlistGrid').count(),0);await page.locator('[data-account-switcher]').click();await page.locator('[data-school-select="s2"]').click();}
 await page.locator('.wishlistGrid').waitFor();assert.equal(await page.locator('[data-wishlist-toggle]').getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('.mobileCartButton b').innerText(),requestBefore,'Saving never adds an order line');
 if(role==='demo'){
   await page.locator('[data-account-switcher]').click();await page.locator('[data-school-select="s1"]').click();
   await page.locator('.wishlistGrid').waitFor({state:'detached'});assert.equal(await page.locator('.wishlistGrid').count(),0,'Another clinic must not inherit saved products');
   await page.locator('[data-account-switcher]').click();await page.locator('[data-school-select="s2"]').click();await page.locator('.wishlistGrid').waitFor();
 }
 await page.screenshot({animations:'disabled',path:`test-results/cohesion/${role}-${width}-wishlist.png`});
 await page.locator('[data-wishlist-toggle]').click();assert.equal(await page.locator('.wishlistGrid').count(),0);
 await page.evaluate(()=>window.PSC_NAVIGATE('portal/catalogue/sports'));await page.locator('.pscEditorialCard').first().waitFor();
 // Feedback fixture: pending work must preserve the label and physical width.
 await page.evaluate(()=>{const b=document.createElement('button');b.type='button';b.className='button primary';b.dataset.mailTest='';b.textContent='Pending action fixture';b.id='pendingFeedbackFixture';document.querySelector('.contentWrap').prepend(b);});
 const pending=page.locator('#pendingFeedbackFixture'),size=await pending.boundingBox();await pending.click();assert.equal(await pending.getAttribute('aria-busy'),'true');assert.equal(await pending.innerText(),'Pending action fixture');
 const pendingStyle=await pending.evaluate(el=>({width:el.getBoundingClientRect().width,animation:getComputedStyle(el,'::after').animationName}));assert.equal(pendingStyle.width,size.width);assert.equal(pendingStyle.animation,'ux32Spin');
 await page.evaluate(()=>{const t=document.createElement('div');t.className='toast';t.textContent='Fixture completion';document.getElementById('app').appendChild(t);});await page.waitForFunction(()=>!document.getElementById('pendingFeedbackFixture').hasAttribute('aria-busy'));
 assert.deepEqual(errors,[]);await ctx.close();console.log(`${role}/${width}/${reducedMotion}: labelled account, correct site permissions, stable response/loading glyphs, shared toolbar geometry, revised card framing PASS`);
}}finally{await browser.close();server.close();}
