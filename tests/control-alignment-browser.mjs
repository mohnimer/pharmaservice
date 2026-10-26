import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox','--disable-dev-shm-usage']});
mkdirSync('test-results/control-alignment',{recursive:true});
try{for(const width of [390,768,980,1440]){
for(const route of ['portal/dashboard','portal/catalogue','catalogue','workshop','our-model','contact','start','admin/dashboard','admin/sales','admin/customers','admin/mail']){
const ctx=await browser.newContext({viewport:{width,height:1080}});await ctx.addInitScript(role=>window.__testRole=role,route.startsWith('admin/')?'admin':'demo');
await ctx.route('**/*',r=>{const host=new URL(r.request().url()).hostname;if(host==='127.0.0.1')return r.continue();return r.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8'):''});});
const page=await ctx.newPage();
await page.goto(`http://127.0.0.1:${server.address().port}/#${route}`);await page.waitForTimeout(700);
if(route.startsWith('admin/'))await page.locator('.adminShell').waitFor();
const report=await page.evaluate(()=>{
const visible=e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0&&getComputedStyle(e).visibility!=='hidden';
const controls=[...document.querySelectorAll('.topbarSearch input,.mobileSearchInput input,.searchInput input,.workshopSearch input')].filter(visible).map(e=>{const a=e.getBoundingClientRect(),b=e.parentElement.getBoundingClientRect(),s=getComputedStyle(e);return {border:s.borderTopWidth,contained:a.top>=b.top-1&&a.bottom<=b.bottom+1&&a.left>=b.left-1&&a.right<=b.right+1};});
const accountButton=document.querySelector('[data-account-switcher]');let account=null;
if(accountButton&&visible(accountButton)){const r=accountButton.getBoundingClientRect();account={w:r.width,h:r.height,radius:getComputedStyle(accountButton).borderTopLeftRadius,label:accountButton.getAttribute('aria-label')};}
const search=document.querySelector('.mobileSearchInput'),request=document.querySelector('.mobileCartButton');let toolbar=null;
if(search&&request&&visible(search)&&visible(request)){const a=search.getBoundingClientRect(),b=request.getBoundingClientRect();toolbar={searchHeight:a.height,requestHeight:b.height,searchRadius:getComputedStyle(search).borderRadius,requestRadius:getComputedStyle(request).borderRadius,countBackground:getComputedStyle(request.querySelector('b')).backgroundColor};}
const panels=[...document.querySelectorAll('.appShell .panel,.appShell .wsPanel')].filter(visible).map(el=>getComputedStyle(el).borderTopWidth);

const form=document.querySelector('.v3927ContactForm'),formFrame=form?{border:getComputedStyle(form).borderTopWidth,radius:getComputedStyle(form).borderRadius,shadow:getComputedStyle(form).boxShadow}:null;
return {overflow:document.documentElement.scrollWidth>innerWidth,controls,account,toolbar,panels,formFrame};});
if(report.formFrame)assert.deepEqual(report.formFrame,{border:'0px',radius:'0px',shadow:'none'},'Contact form should be an open surface');
assert.equal(report.overflow,false,`${route}/${width}: page overflow`);
for(const c of report.controls){assert.equal(c.border,'0px',`${route}/${width}: double border`);assert(c.contained,`${route}/${width}: input escaping container`);}
if(report.account){assert(report.account.w>=43&&report.account.h>=44);assert.equal(report.account.radius,'9px');assert.match(report.account.label,/^Website menu$/);}
if(report.toolbar){assert(Math.abs(report.toolbar.searchHeight-report.toolbar.requestHeight)<1,JSON.stringify(report.toolbar));assert.equal(report.toolbar.searchRadius,'8px');assert.equal(report.toolbar.requestRadius,'8px');assert.equal(report.toolbar.countBackground,'rgba(0, 0, 0, 0)');}
assert(report.panels.every(border=>border==='0px'),'Content sections should not have decorative outer borders');
await page.screenshot({animations:'disabled',path:`test-results/control-alignment/${route.replace('/','-')}-${width}.png`,fullPage:true});
console.log(`${route}/${width}: aligned controls and no overflow PASS`);
await ctx.close();}}
}finally{await browser.close();server.close();}
