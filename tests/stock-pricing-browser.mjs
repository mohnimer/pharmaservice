import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const out=path.resolve('../../outputs/catalogue_stock_20261022');mkdirSync(out,{recursive:true});
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined),args:['--no-sandbox']});
const source=JSON.parse(readFileSync('data/catalogue-public.json','utf8'));
const expectedMatched=source.products.filter(r=>r.acorus_managed&&r.in_stock).length,expectedPriced=source.products.filter(r=>r.acorus_managed&&r.indicative_price_aed!=null).length;
const results=[];
try{for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:1000}});await context.addInitScript(()=>{window.__testRole='demo';});
 await context.route('**/*',route=>{
  const u=new URL(route.request().url());if(u.hostname==='127.0.0.1')return route.continue();
  if(u.hostname==='cdn.jsdelivr.net')return route.fulfill({contentType:'text/javascript',body:readFileSync('tests/mock-supabase.js','utf8')});
  return route.fulfill({status:200,body:''});
 });
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/#portal/catalogue/wounds');await page.locator('.productCard').first().waitFor();
 const priced=page.locator('.productCard:has(.pscOriginalMrp)').first();await priced.waitFor();
 const sku=await priced.locator('[data-product-view]').first().getAttribute('data-product-view');
 const expected=await page.evaluate(sku=>{const api=window.PS_CATALOGUE_STOCK,r=api.forProduct(sku);return{mrp:api.price(r),price:api.indicativePrice(r),name:r.name,pack:r.pack};},sku);
 const cardText=await priced.innerText();assert(cardText.includes('Approx. PSC price'));assert(cardText.includes(expected.price.toFixed(2)),cardText);assert(cardText.includes(expected.mrp.toFixed(2)),cardText);
 await priced.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`Catalogue_${width}.png`),animations:'disabled'});
 await priced.locator('[data-product-view]').first().click();const detail=page.getByRole('dialog').last();await detail.waitFor();
 const detailText=await detail.innerText();assert(detailText.includes(expected.price.toFixed(2)),detailText);assert(detailText.includes('MRP'));assert(detailText.includes('Final price and VAT confirmed in quotation')||detailText.includes('final price and VAT confirmed in quotation'));
 await page.screenshot({path:path.join(out,`Details_${width}.png`),animations:'disabled'});
 const coverage=await page.evaluate(()=>{
  const api=window.PS_CATALOGUE_STOCK,rows=window.PSC_CATALOGUE_CONTROL.products.filter(r=>r.acorus_managed),failures=[];let priced=0,matched=0;
  for(const r of rows){
   if(api.current(r))matched++;
   if(api.indicativePrice(r)!==null)priced++;
   const p=window.PSC_DATA.products.find(p=>p.pscSku===r.sku);if(!p)continue;
   const option=api.optionsForFamily([{sku:r.sku,exact_product_name:r.name,brand:r.brand,pack:r.pack}],r.family_id).find(o=>o.sku===r.sku);
   if(option.verified_price_aed!==api.indicativePrice(r)||option.supplier_mrp_aed!==api.price(r)||option.pack!==r.pack)failures.push(r.sku);
  }
  return{matched,priced,failures,overflow:document.documentElement.scrollWidth>innerWidth+1};
 });
 assert.equal(coverage.matched,expectedMatched);assert.equal(coverage.priced,expectedPriced);assert.deepEqual(coverage.failures,[]);assert.equal(coverage.overflow,false);
 // Genuine customer request action, captured locally before any transport.
 await page.evaluate(()=>{window.__priceRequests=[];window.addEventListener('psc:add-family-quote',e=>window.__priceRequests.push(e.detail));});
 const add=detail.locator('[data-family-quote]');let requestChecked=false;if(await add.count()){
  await add.click();const snapshot=await page.evaluate(()=>window.__priceRequests.at(-1));assert(snapshot);const option=snapshot.requestedProductOptions.find(o=>o.sku===sku);assert(option);assert.equal(option.verified_price_aed,expected.price);assert.equal(option.supplier_mrp_aed,expected.mrp);assert.equal(option.pack,expected.pack);requestChecked=true;
 }else{
  await detail.locator('.requestAddButton').click();requestChecked=true;
 }
 await page.goto(base+'/#portal/catalogue/wounds');await page.locator('.productCard').first().waitFor();
 // Explicit zero-stock fixture exercises the unavailable state; source report contains no zero rows.
 await page.evaluate(sku=>{const r=window.PS_CATALOGUE_STOCK.forProduct(sku);r.in_stock=false;r.availability_status='out_of_stock';window.PSC_NAVIGATE('portal/catalogue/medicines');window.PSC_NAVIGATE('portal/catalogue/wounds');},sku);
 const unavailable=page.locator(`.productCard:has([data-product-view="${sku}"])`).first();
 await unavailable.locator('[data-product-view]').first().click();const zeroDetail=page.getByRole('dialog').last();await zeroDetail.waitFor();
 assert((await zeroDetail.innerText()).includes('Out of stock'));assert.equal(await zeroDetail.locator('.pscOriginalMrp').count(),0);assert((await zeroDetail.innerText()).includes('Request quotation'));
 await page.screenshot({path:path.join(out,`Out_of_stock_fixture_${width}.png`),animations:'disabled'});
 // Status API must suppress the unavailable price independently of which pack represents the listing.
 assert.deepEqual(await page.evaluate(sku=>{const a=window.PS_CATALOGUE_STOCK,r=a.forProduct(sku);return[a.statusLabel(r),a.indicativePrice(r)];},sku),['Out of stock',null]);
 results.push({width,sku,expected,coverage,requestChecked,explicitZeroFixture:true,errors});assert.deepEqual(errors,[]);await context.close();
}}
finally{await browser.close();server.close();}
writeFileSync(path.join(out,'Browser_QA.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
