import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox']});
mkdirSync('test-results',{recursive:true});
try{for(const width of [390,1440]){
 const ctx=await browser.newContext({viewport:{width,height:950}});
 await ctx.addInitScript(()=>window.__testRole='customer');
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname==='cdn.jsdelivr.net')return r.fulfill({contentType:'text/javascript',body:readFileSync('tests/mock-supabase.js','utf8')+`;Object.assign(window.__tables,{catalogue_family_public:[{family_id:'PSC-SC-D06C',family_name:'Distilled water for oxygen humidifier'}],catalogue_family_option_reference_public:[{family_id:'PSC-SC-D06C',brand:'Oxygenizer',exact_product_name:'OXYGENIZER WATER 350ML'},{family_id:'PSC-SC-D02',brand:'Betadine',exact_product_name:'BETADINE ANTISEPTIC SLN 120ML'},{family_id:'PSC-SC-D02',brand:'Sepadine',exact_product_name:'SEPADINE ANTISEPTIC SOLUTION 100ML'}]});`});return r.fulfill({status:503,body:''})});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/#portal/dashboard');await page.locator('.pscHomeCategory').first().waitFor();
 assert.equal(await page.locator('.pscHomeCategory').count(),6);
 assert.equal(await page.locator('.pscHomeGuide').count(),2);
 assert.equal(await page.locator('.pscHomeDha').count(),3);
 assert(!(await page.locator('.pscHomeCategoryColumns').innerText()).includes('↗'));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:`test-results/portal-home-${width}.png`,fullPage:true});
 const collected=[];
 for(const id of ['wounds','breathing','vitals','dha-medicines','dha-equipment','dha-consumables']){
  await page.locator(`.pscHomeCategory[data-go="portal/catalogue/${id}"]`).click();
  await page.waitForURL('**/#portal/catalogue/'+id);
  assert(await page.locator('[data-ps-search-results]').count());
  if(id.startsWith('dha-')){
   const card=page.locator('.pscEditorialCard').first();
   assert.equal(await card.evaluate(el=>getComputedStyle(el).borderTopWidth),'0px');
   assert.equal(await card.locator('.exactCanvaBody').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
   assert.equal(await page.locator('.v25ProductGrid').first().evaluate(el=>getComputedStyle(el).columnGap),'0px');
   assert(await card.locator('.pscPricePreview').count());
   if(id==='dha-medicines'){
    const water=page.locator('.pscEditorialCard').filter({has:page.locator('[data-add="INST-0110"]')});
    assert((await water.locator('.pscBrandChoices').innerText()).includes('Oxygenizer'));
    await water.locator('.pscBrandChoices button').click();await page.locator('.pscFamilyProductSheet').waitFor();
    await page.keyboard.press('Escape');
    await page.evaluate(()=>PSC_NAVIGATE('portal/catalogue/dha-medicines'));
    const iodine=page.locator('.pscEditorialCard').filter({has:page.locator('[data-add="PSC-INF-001"]')});
    assert((await iodine.locator('.pscBrandChoices').innerText()).includes('Betadine'));
    assert(!(await iodine.locator('.pscBrandChoices').innerText()).includes('Dettol'));
    assert((await iodine.locator('.productMainImage').getAttribute('src')).includes('inst-0104.webp'));
   }
   if(id==='dha-equipment'){
    const pulse=page.locator('.pscEditorialCard').filter({has:page.locator('[data-add="PSC-DIA-001"]')});
    assert((await pulse.innerText()).includes('45.00'));
    assert((await pulse.innerText()).includes('49.00'));
    assert((await pulse.innerText()).includes('final price & VAT confirmed'));
    assert(await pulse.locator('.pscBrandChoices').isVisible(),'brand row is visible');
    assert(await pulse.locator('.pscBrandChoices button').first().isVisible(),'brand choice is visible');
    assert(await pulse.evaluate(el=>{const b=el.querySelector('.pscBrandChoices').getBoundingClientRect(),c=el.querySelector('.exactCanvaBody').getBoundingClientRect();return b.bottom<=c.top+1}),'brand row precedes product information');
    await pulse.screenshot({path:`test-results/card-editorial-${width}.png`});
    await page.screenshot({path:`test-results/catalogue-editorial-${width}.png`,fullPage:true});
   }
   const skus=await page.locator('[data-ps-search-results] [data-add]').evaluateAll(els=>els.map(e=>e.dataset.add));
   assert(skus.length>0,'mapped category must contain products');collected.push(...skus);
   assert(await page.evaluate(skus=>skus.every(sku=>PSC_DATA.products.find(p=>p.pscSku===sku)?.dhaMapped),skus));
   assert((await page.locator('.categoryHero h1').innerText()).startsWith('DHA-required'));
   await page.locator('[data-cat-q]').fill('gauze');
   await page.waitForTimeout(500);
   const searchSkus=await page.locator('[data-ps-search-results] [data-add]').evaluateAll(els=>els.map(e=>e.dataset.add));
   assert(searchSkus.every(sku=>skus.includes(sku)),'search cannot escape DHA group');
  }
  await page.evaluate(()=>PSC_NAVIGATE('portal/dashboard'));
 }
 const expected=await page.evaluate(()=>PSC_DATA.products.filter(p=>p.catalogueVisible!==false&&p.dhaMapped).map(p=>p.pscSku).sort());
 assert.deepEqual([...collected].sort(),expected,'every mapped product appears exactly once across essentials');
 const target=await page.locator('.pscHomeGuide').first().getAttribute('data-go');
 await page.locator('.pscHomeGuide').first().click();await page.waitForURL('**/'+target);
 assert(!(await page.locator('body').innerText()).includes('Guide not found'));
 assert.deepEqual(errors,[]);await ctx.close();console.log(`Portal home: six category routes, published guide, no overflow, ${width}: PASS`);
}}finally{await browser.close();server.close()}
