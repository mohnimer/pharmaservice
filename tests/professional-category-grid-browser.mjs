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
    assert.equal(await grid.locator('[data-go$="/vitals"] .clinicNeedIcon').evaluate(element=>getComputedStyle(element).visibility),'visible','Approved Vitals artwork stays visible in its compact slot');
    const layout=await grid.evaluate(element=>({
      columns:getComputedStyle(element).gridTemplateColumns.split(' ').length,
      cards:[...element.querySelectorAll('.clinicNeedCard')].map(card=>{
        const bounds=card.getBoundingClientRect(),label=card.querySelector('b').getBoundingClientRect(),art=card.querySelector('.clinicNeedIcon').getBoundingClientRect();
        return {x:bounds.x,y:bounds.y,height:bounds.height,width:bounds.width,labelBottom:label.bottom,bottom:bounds.bottom,labelTop:label.top,artBottom:art.bottom,overflow:card.scrollWidth>card.clientWidth+1};
      })
    }));
    await grid.scrollIntoViewIfNeeded();
    await page.screenshot({path:`test-results/category-grid/${width}.png`,animations:'disabled'});
    assert.equal(layout.columns,3,`${width}px: three category columns`);
    assert.equal(layout.cards.length,14,'All existing destinations remain available');
    assert.equal(layout.cards[0].y,layout.cards[2].y);
    assert(layout.cards[3].y>layout.cards[0].y);
    for(const card of layout.cards) {
      assert(card.width>=44&&card.height>=44,'Touch target remains usable');
      assert(card.height<=160,`${width}px: categories remain compact (${card.height}px)`);
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
    await page.goto(`http://127.0.0.1:${server.address().port}/#portal/dashboard`);
    await page.locator('.pscHomeCategoryGrid').first().waitFor();
    assert.equal(await page.locator('.psPortalWelcome aside').count(),0,'Redundant supply explainer removed');
    assert.match(await page.locator('.psPortalApprovalNote').innerText(),/Submitting a request does not place a purchase order/,'Purchase approval safeguard preserved');
    const dashboardGrids=page.locator('.pscHomeCategoryGrid');
    assert.equal(await dashboardGrids.count(),2);
    for(const tiles of await dashboardGrids.all()) {
      const geometry=await tiles.evaluate(element=>({columns:getComputedStyle(element).gridTemplateColumns.split(' ').length,cards:[...element.children].map(card=>{const b=card.getBoundingClientRect(),text=card.querySelector('b').getBoundingClientRect(),art=card.querySelector('.pscHomeCategoryArt').getBoundingClientRect();return {y:b.y,height:b.height,width:b.width,contained:text.bottom<=b.bottom&&text.left>=b.left&&text.right<=b.right&&art.left>=b.left&&art.right<=b.right,overflow:card.scrollWidth>card.clientWidth+1};})}));
      assert.equal(geometry.columns,3,'Dashboard shortcuts also use three columns');
      assert.equal(geometry.cards.length,3);
      assert.equal(geometry.cards[0].y,geometry.cards[2].y);
      for(const card of geometry.cards){assert(card.height<=150&&card.width>=44,'Compact dashboard tap targets');assert(card.contained&&!card.overflow,'Full label and artwork fit the tile');}
    }
    const marks=page.locator('.pscHomeCategoryGrid .pscHomeDha');
    assert.equal(await marks.count(),3,'All three Clinic essentials DHA marks retained');
    for(const mark of await marks.all()) {
      assert(await mark.isVisible(),'DHA mark remains visible');
      assert.equal(await mark.getAttribute('alt'),'DHA requirement mapping');
      const b=await mark.boundingBox();assert(b.width>=28&&b.height>=28);
    }
    const guides=page.locator('.pscHomeCategoryGuide');
    assert.equal(await guides.count(),2);
    assert.equal(await guides.locator('dd').count(),6,'All original category descriptions preserved');
    await guides.first().locator('summary').focus();await page.keyboard.press('Enter');
    assert.equal(await guides.first().getAttribute('open'),'');
    assert(await guides.first().getByText('Dressings, antiseptics, gauze, closure and wound protection',{exact:true}).isVisible());
    assert.equal(await guides.first().locator('summary .psDisclosurePlus').innerText(),'+','Reuse existing disclosure response');
    await guides.first().locator('summary').click();
    assert.equal(await guides.first().getAttribute('open'),null);
    await page.locator('.pscHomeBrowse').scrollIntoViewIfNeeded();
    await page.screenshot({path:`test-results/category-grid/${width}-dashboard.png`,animations:'disabled',fullPage:true});
    const destinations=await page.locator('.pscHomeCategoryGrid [data-go]').evaluateAll(nodes=>nodes.map(node=>node.dataset.go));
    assert.deepEqual(destinations,['portal/catalogue/wounds','portal/catalogue/breathing','portal/catalogue/vitals','portal/catalogue/dha-medicines','portal/catalogue/dha-equipment','portal/catalogue/dha-consumables']);
    for(const target of destinations){await page.goto(`http://127.0.0.1:${server.address().port}/#portal/dashboard`);await page.locator(`.pscHomeCategoryGrid [data-go="${target}"]`).click();await page.waitForFunction(target=>location.hash==='#'+target,target);}
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert.deepEqual(errors,[]);
    await context.close();
    console.log(`${width}px: compact three-column categories, complete labels and keyboard navigation PASS`);
  }
} finally {await browser.close();server.close();}
