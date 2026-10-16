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
 const account=page.locator('[data-account-switcher]');assert.equal(await account.locator('.accountControlLabel').innerText(),'Account');
 assert.equal(await page.locator('.mobileAccountDot').count(),0);
 assert((await account.getAttribute('aria-label')).includes('Test Group'));
 const before=await account.boundingBox();await account.click();await page.locator('#psAccountMenu').waitFor();
 await page.waitForFunction(()=>document.querySelector('[data-account-switcher]').classList.contains('ux32-responding'));
 const response=await account.evaluate(el=>{const style=getComputedStyle(el,'::after'),r=el.getBoundingClientRect();return {width:r.width,height:r.height,content:style.content,radius:style.borderRadius,animation:style.animationName,busy:el.getAttribute('aria-busy')};});
 assert(Math.abs(response.width-before.width)<1&&Math.abs(response.height-before.height)<1,'Acknowledgment must not resize its control');assert.equal(response.radius,'50%');assert.equal(response.animation,'ux32Spin');assert.equal(response.busy,null,'Instant actions do not pretend to await a network request');
 if(role==='school'){assert.equal(await page.locator('#psAccountMenu [data-school-select]').count(),0);assert((await page.locator('.accountCurrentSite').innerText()).includes('Site One'));}
 else{await page.locator('[data-school-select="s2"]').click();await page.waitForFunction(()=>document.querySelector('.accountSwitcherButton').textContent.includes('Site Two'));await account.click();}
 await page.keyboard.press('Escape');assert.equal(await account.getAttribute('aria-expanded'),'false');assert(await account.evaluate(el=>document.activeElement===el));
 await page.screenshot({animations:'disabled',path:`test-results/cohesion/${role}-${width}-dashboard.png`});
 await page.evaluate(()=>window.PSC_NAVIGATE('portal/catalogue/sports'));await page.locator('.pscEditorialCard').first().waitFor();
 if(width<=980){const bar=await page.evaluate(()=>{const a=document.querySelector('.mobileSearchInput'),b=document.querySelector('.mobileCartButton');return {a:a.getBoundingClientRect().height,b:b.getBoundingClientRect().height,ar:getComputedStyle(a).borderRadius,br:getComputedStyle(b).borderRadius,count:getComputedStyle(b.querySelector('b')).backgroundColor};});assert.equal(bar.a,48);assert.equal(bar.b,48);assert.equal(bar.ar,'8px');assert.equal(bar.br,'8px');assert.equal(bar.count,'rgba(0, 0, 0, 0)');}
 const card=page.locator('.pscEditorialCard').first();await card.scrollIntoViewIfNeeded();
 const framing=await card.evaluate(el=>({card:getComputedStyle(el).borderTopWidth,image:getComputedStyle(el.querySelector('.productVisual')).borderTopWidth,inset:getComputedStyle(el.querySelector('.productVisual'),'::before').display}));assert.deepEqual(framing,{card:'1px',image:'1px',inset:'none'});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({animations:'disabled',path:`test-results/cohesion/${role}-${width}-catalogue.png`});
 // Feedback fixture: pending work must preserve the label and physical width.
 await page.evaluate(()=>{const b=document.createElement('button');b.type='button';b.className='button primary';b.dataset.mailTest='';b.textContent='Pending action fixture';b.id='pendingFeedbackFixture';document.getElementById('app').appendChild(b);});
 const pending=page.locator('#pendingFeedbackFixture'),size=await pending.boundingBox();await pending.click();assert.equal(await pending.getAttribute('aria-busy'),'true');assert.equal(await pending.innerText(),'Pending action fixture');
 const pendingStyle=await pending.evaluate(el=>({width:el.getBoundingClientRect().width,animation:getComputedStyle(el,'::after').animationName}));assert.equal(pendingStyle.width,size.width);assert.equal(pendingStyle.animation,'ux32Spin');
 await page.evaluate(()=>{const t=document.createElement('div');t.className='toast';t.textContent='Fixture completion';document.getElementById('app').appendChild(t);});await page.waitForFunction(()=>!document.getElementById('pendingFeedbackFixture').hasAttribute('aria-busy'));
 assert.deepEqual(errors,[]);await ctx.close();console.log(`${role}/${width}/${reducedMotion}: labelled account, correct site permissions, stable response/loading glyphs, shared toolbar geometry, revised card framing PASS`);
}}finally{await browser.close();server.close();}
