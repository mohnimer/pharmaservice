import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';

const server=createServer();
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
mkdirSync('test-results/category-grid',{recursive:true});
try {
  for(const width of [320,390,430,768,1440]) {
    const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:width===320?'reduce':'no-preference'});
    await context.addInitScript(()=>window.__testRole='school');
    await context.route('**/*',route=>{
      const host=new URL(route.request().url()).hostname;
      if(host==='127.0.0.1')return route.continue();
      return route.fulfill({contentType:host==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:host==='cdn.jsdelivr.net'?readFileSync('tests/mock-supabase.js','utf8')+";window.__tables.memberships[0].school_id='s1';window.__tables.memberships[0].role='clinic_user';":''});
    });
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/#portal/catalogue`);
    const grid=page.locator('.clinicNeedRail');
    await grid.waitFor();
    const layout=await grid.evaluate(element=>({
      columns:getComputedStyle(element).gridTemplateColumns.split(' ').length,
      cards:[...element.querySelectorAll('.clinicNeedCard')].map(card=>{
        const bounds=card.getBoundingClientRect(),label=card.querySelector('b').getBoundingClientRect(),art=card.querySelector('.clinicNeedIcon').getBoundingClientRect();
        return {x:bounds.x,y:bounds.y,height:bounds.height,width:bounds.width,labelBottom:label.bottom,bottom:bounds.bottom,labelTop:label.top,artBottom:art.bottom,overflow:card.scrollWidth>card.clientWidth+1};
      })
    }));
    assert.equal(layout.columns,3,`${width}px: three category columns`);
    assert.equal(layout.cards.length,14,'All existing destinations remain available');
    assert.equal(layout.cards[0].y,layout.cards[2].y);
    assert(layout.cards[3].y>layout.cards[0].y);
    for(const card of layout.cards) {
      assert(card.width>=44&&card.height>=44,'Touch target remains usable');
      assert(card.height<=160,'Categories remain compact');
      assert(card.labelBottom<=card.bottom&&card.labelTop>=card.artBottom,'Full labels stay inside tiles, below artwork');
      assert.equal(card.overflow,false,'No clipped category content');
    }
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await grid.scrollIntoViewIfNeeded();
    await page.screenshot({path:`test-results/category-grid/${width}.png`,animations:'disabled'});
    const first=grid.locator('[data-go]').first(),destination=await first.getAttribute('data-go');
    await first.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(destination=>location.hash==='#'+destination,destination);
    await page.locator('.pscEditorialCard').first().waitFor();
    assert.deepEqual(errors,[]);
    await context.close();
    console.log(`${width}px: compact three-column categories, complete labels and keyboard navigation PASS`);
  }
} finally {await browser.close();server.close();}
