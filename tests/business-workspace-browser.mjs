import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox','--disable-dev-shm-usage']});
const extension=`(()=>{const t=window.__tables;t.mail_contacts=[{id:'c1',first_name:'Test Buyer',organization:'Test School',email:'buyer@example.invalid'}];t.psc_sales_opportunities=[];t.psc_crm_tasks=[];t.psc_mail_messages=[];t.psc_customer_invitations=[];t.account_groups.push({id:'demo-g',slug:'psc-demo-group',name:'Demo'});t.schools.push({id:'demo-s',group_id:'demo-g',name:'Demo campus',active:true});t.orders.push({id:'demo-o',school_id:'demo-s',group_id:'demo-g',order_number:'DEMO-HIDDEN',status:'quote_sent'});window.supabase.createClient().functions={invoke:async()=>({data:{senders:[{address:'mohamed@pharmaservice.ae',ready:true}]}})};})();`;
mkdirSync('test-results/business-workspace',{recursive:true});
const errors=[];
try{for(const width of [390,1440]){
 const ctx=await browser.newContext({viewport:{width,height:1000}});await ctx.addInitScript(()=>window.__testRole='admin');
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname==='cdn.jsdelivr.net')return r.fulfill({contentType:'text/javascript',body:readFileSync('tests/mock-supabase.js','utf8')+extension});return r.fulfill({status:200,body:''});});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'/#admin/dashboard');await p.getByRole('heading',{name:'Today',exact:true}).waitFor();assert.equal(await p.getByText('DEMO-HIDDEN',{exact:false}).count(),0);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:`test-results/business-workspace/${width}-today.png`,fullPage:true});
 await p.goto(base+'/#admin/sales');await p.getByRole('heading',{name:'Sales',exact:true}).waitFor();await p.locator('[data-new-opportunity]').first().click();
 const f=p.locator('dialog form');await f.locator('[name=title]').fill('Term clinic consumables');await f.locator('[name=contact_id]').selectOption('c1');await f.locator('[name=estimated_value_ex_vat]').fill('1500');await f.locator('[name=next_action]').fill('Ask for required pack sizes');await f.getByRole('button',{name:'Save opportunity',exact:true}).click();await p.getByRole('heading',{name:'Term clinic consumables',exact:true}).waitFor();assert.equal(await p.evaluate(()=>window.__tables.psc_sales_opportunities[0].estimated_value_ex_vat),1500);assert.equal(await p.evaluate(()=>window.__tables.orders.length),3);assert.equal(await p.evaluate(()=>window.__backendCalls.filter(x=>['orders','quotes','order_commercial_controls'].includes(x.table)&&x.action!=='select').length),0);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:`test-results/business-workspace/${width}-sales.png`,fullPage:true});
 await p.goto(base+'/#admin/customers');await p.getByRole('heading',{name:'Accounts',exact:true}).waitFor();await p.getByRole('button',{name:'Account setup',exact:true}).click();await p.getByRole('heading',{name:'Account setup',exact:true}).waitFor();assert.equal(await p.getByText('Demo campus',{exact:true}).count(),0);
 await p.goto(base+'/#portal/dashboard');await p.getByRole('heading',{name:'What does your clinic need?',exact:true}).waitFor();assert(await p.getByRole('button',{name:'Browse & prepare a request',exact:true}).count());assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:`test-results/business-workspace/${width}-customer-home.png`,fullPage:true});
 await ctx.close();console.log(`${width}px: Today, demo isolation, explicit opportunity save without order changes, account setup link and customer dashboard PASS`);
}assert.deepEqual(errors,[]);}finally{await browser.close();server.close();}
