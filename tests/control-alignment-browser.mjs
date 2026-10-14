import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox','--disable-dev-shm-usage']});
mkdirSync('test-results/control-alignment',{recursive:true});
try{for(const width of [390,768,980,1440]){
const ctx=await browser.newContext({viewport:{width,height:1080}});await ctx.addInitScript(()=>window.__testRole=location.hash.startsWith('#admin/')?'admin':'demo');
await ctx.route('**/*',r=>{const host=new URL(r.request().url()).hostname;if(host==='127.0.0.1')return r.continue();return r.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8'):''});});
const page=await ctx.newPage();
for(const route of ['portal/dashboard','portal/catalogue','catalogue','workshop','our-model','contact','start','admin/dashboard','admin/sales','admin/accounts','admin/inbox']){
await page.goto(`http://127.0.0.1:${server.address().port}/#${route}`);await page.waitForTimeout(500);
const report=await page.evaluate(()=>{
const visible=e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0&&getComputedStyle(e).visibility!=='hidden';
const controls=[...document.querySelectorAll('.topbarSearch input,.mobileSearchInput input,.searchInput input,.workshopSearch input')].filter(visible).map(e=>{const a=e.getBoundingClientRect(),b=e.parentElement.getBoundingClientRect(),s=getComputedStyle(e);return {border:s.borderTopWidth,contained:a.top>=b.top-1&&a.bottom<=b.bottom+1&&a.left>=b.left-1&&a.right<=b.right+1};});
const badge=document.querySelector('.mobileAccountDot');let account=null;if(badge&&visible(badge)){const a=badge.getBoundingClientRect(),b=badge.parentElement.getBoundingClientRect();account={w:b.width,h:b.height,dx:Math.abs(a.x+a.width/2-b.x-b.width/2),dy:Math.abs(a.y+a.height/2-b.y-b.height/2)};}
return {overflow:document.documentElement.scrollWidth>innerWidth,controls,account};});
assert.equal(report.overflow,false,`${route}/${width}: page overflow`);
for(const c of report.controls){assert.equal(c.border,'0px',`${route}/${width}: double border`);assert(c.contained,`${route}/${width}: input escaping container`);}
if(report.account){assert.equal(report.account.w,report.account.h);assert(report.account.dx<1&&report.account.dy<1,`account badge not centred: ${JSON.stringify(report.account)}`);}
await page.screenshot({path:`test-results/control-alignment/${route.replace('/','-')}-${width}.png`,fullPage:true});
console.log(`${route}/${width}: aligned controls and no overflow PASS`);
}await ctx.close();}
}finally{await browser.close();server.close();}
