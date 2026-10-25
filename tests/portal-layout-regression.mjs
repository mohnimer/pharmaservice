import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox','--disable-dev-shm-usage']});
mkdirSync('test-results/portal-layout',{recursive:true});
try{for(const role of ['school','group_admin','demo','admin'])for(const width of [390,980,1440,1920]){
 const ctx=await browser.newContext({viewport:{width,height:1080}});await ctx.addInitScript(r=>window.__testRole=r,role);
 await ctx.route('**/*',r=>{if(new URL(r.request().url()).hostname==='127.0.0.1')return r.continue();if(new URL(r.request().url()).hostname==='cdn.jsdelivr.net')return r.fulfill({contentType:'text/javascript',body:readFileSync('tests/mock-supabase.js','utf8')+(role==='school'?";window.__tables.memberships[0].school_id='s1';window.__tables.memberships[0].role='clinic_user';":"")});return r.fulfill({status:200,body:''});});
 const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(`http://127.0.0.1:${server.address().port}/#portal/dashboard`);await p.getByRole('heading',{name:'Your clinic. Ready for what’s next.',exact:true}).waitFor();
 const layout=await p.evaluate(()=>{const main=document.querySelector('.mainArea').getBoundingClientRect(),sidebar=document.querySelector('.sidebar').getBoundingClientRect(),heading=document.querySelector('.psPortalWelcome h1').getBoundingClientRect();return {mainTop:main.top,mainLeft:main.left,sidebarWidth:sidebar.width,headingTop:heading.top,headingBottom:heading.bottom,overflow:document.documentElement.scrollWidth>innerWidth};});
 assert(layout.mainTop<100,`${role}/${width}: dashboard pushed below viewport ${JSON.stringify(layout)}`);assert(layout.headingTop>=0&&layout.headingBottom<1080,`${role}/${width}: heading not visible`);assert.equal(layout.overflow,false,`${role}/${width}: horizontal overflow`);
 if(width>980){assert.equal(layout.sidebarWidth,224);assert.equal(layout.mainLeft,224);}else{assert.equal(layout.mainLeft,0);await p.getByRole('button',{name:'Open menu',exact:true}).click();await p.getByRole('button',{name:'Catalogue',exact:true}).waitFor();assert(await p.getByRole('button',{name:'Catalogue',exact:true}).isVisible());await p.getByRole('button',{name:'Close menu',exact:true}).click();}
 await p.getByRole('button',{name:'Browse the catalogue',exact:true}).click();await p.waitForURL('**/#portal/catalogue');assert((await p.locator('.mainArea').boundingBox()).y<100);assert.deepEqual(errors,[]);
 await p.goto(`http://127.0.0.1:${server.address().port}/#portal/dashboard`);await p.getByRole('heading',{name:'Your clinic. Ready for what’s next.',exact:true}).waitFor();await p.screenshot({path:`test-results/portal-layout/${role}-${width}.png`,fullPage:true});await ctx.close();console.log(`${role}/${width}: dashboard in viewport, navigation and no JS errors PASS`);
}}finally{await browser.close();server.close();}
