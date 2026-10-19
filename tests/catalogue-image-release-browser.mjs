import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from '../tools/serve.mjs';
const records=JSON.parse(readFileSync('docs/catalogue-image-release-20261019.json','utf8')).records;
const snapshot=process.env.PSC_IMAGE_CMS_SNAPSHOT?JSON.parse(readFileSync(process.env.PSC_IMAGE_CMS_SNAPSHOT,'utf8')):null;
const output=process.env.PSC_IMAGE_QA_OUTPUT||'test-results/image-release';mkdirSync(output,{recursive:true});
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox']});const results=[];
try{for(const width of [390,1440]){
 const ctx=await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce'});await ctx.addInitScript(()=>window.__testRole='demo');
 const transport=readFileSync('tests/mock-supabase.js','utf8')+(snapshot?'\nwindow.__tables.storefronts='+JSON.stringify(snapshot.storefronts)+';window.__tables.published_storefront_catalogue='+JSON.stringify(snapshot.published)+';':'');
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1'||(r.request().method()==='GET'&&u.hostname==='ewewkojlsgqvcqarmpgr.supabase.co'&&u.pathname.startsWith('/storage/v1/object/public/product-media/')))return r.continue();return r.fulfill({contentType:u.hostname==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:u.hostname==='cdn.jsdelivr.net'?transport:''});});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/#portal/catalogue/all`);await page.locator('.productCard').first().waitFor();
 if(snapshot)await page.waitForFunction(()=>window.__backendCalls.filter(c=>c.table==='published_storefront_catalogue').length>=2);
 const active=await page.evaluate(()=>Object.fromEntries(window.PSC_DATA.products.map(p=>[p.pscSku,p.currentImageUrl])));
 for(const r of records)assert.equal(active[r.sku],r.image_url,r.sku+' final image authority');
 const inventory=await page.evaluate(()=>[...document.querySelectorAll('.productGrid .productCard')].map(c=>({sku:c.querySelector('[data-product-view]')?.dataset.productView,ids:JSON.parse(c.dataset.matchingSkus),src:c.querySelector('.productMainImage')?.getAttribute('src')||null})));
 let checked=0;const framed=[];
 const expected=new Map(records.map(r=>[r.sku,r]));
 for(const item of inventory){
  const meta=await page.evaluate(sku=>{const p=window.PSC_DATA.products.find(p=>p.pscSku===sku),source=window.PSC_PHOTO_SUBJECTS?.[p?.currentImageUrl];return {crop:!!source?.displayCrop};},item.sku);
  if(process.env.PSC_IMAGE_FRAMING_ONLY&&!meta.crop)continue;
  if(!expected.has(item.sku)&&!meta.crop)continue;
  const record=expected.get(item.sku);if(record)assert.equal(item.src,record.image_url,item.sku+' binding');
  const card=page.locator('.productGrid .productCard').filter({has:page.locator('[data-product-view="'+item.sku+'"]')});
  const image=card.locator('.productMainImage');await image.evaluate(async i=>{i.loading='eager';await i.decode();});
  const cardClip=await image.evaluate(i=>getComputedStyle(i).clipPath);if(meta.crop)assert.notEqual(cardClip,'none',item.sku+' crop');
  writeFileSync(path.join(output,'current-case.json'),JSON.stringify({width,sku:item.sku,checked}));
  await card.locator('.canvaDetails').click();await page.locator('.pscFamilyProductSheet,.productDetailModal').first().waitFor();
  const legacy=await page.locator('[data-psc-family-detail-root]').count()===0;
  const detail=legacy?page.locator('.productDetailModal'):page.locator('[data-psc-family-detail-root]');
  const preview=detail.locator(legacy?'.detailProductImageWrap>img:not(.detailDhaIcon)':'.pscFamilyPreview>img');await preview.waitFor();await preview.evaluate(async i=>i.decode());
  assert.equal(await preview.getAttribute('src'),item.src,item.sku+' Details continuity');
  const uncovered=await preview.evaluate(i=>{const frame=i.parentElement,r=frame.getBoundingClientRect();return [.1,.9].every(f=>{const hit=document.elementFromPoint(r.left+r.width*f,r.top+r.height*.5);return !!hit&&frame.contains(hit);});});
  assert(uncovered,item.sku+' photo frame covered by another panel');
  await page.waitForFunction(({src,clip,legacy})=>{const i=document.querySelector(legacy?'.productDetailModal .detailProductImageWrap>img:not(.detailDhaIcon)':'.pscFamilyPreview>img');return i?.getAttribute('src')===src&&getComputedStyle(i).clipPath===clip;},{src:item.src,clip:cardClip,legacy});
  if(record?.role==='SPECIFICATION_REFERENCE_ONLY')assert.match(await detail.innerText(),/Illustrative product[.;] Exact model and compatibility confirmed in quotation/i);
  if(meta.crop){await page.screenshot({path:path.join(output,width+'-'+item.sku+'-detail.png')});framed.push(item.sku);}
  if(legacy)await detail.locator('button[data-modal-close]').click();else await page.keyboard.press('Escape');checked++;if(checked%25===0)console.log('Checked image/details',width,checked);
 }
 for(const sku of ['PS-AC-A1C278062616','PSC-WND-014']){
  const card=page.locator('.productGrid .productCard').filter({has:page.locator('[data-product-view="'+sku+'"]')});
  if(!await card.count())continue;
  assert.equal(await card.locator('.productMainImage').count(),0,sku+' rejected photo remains withheld');
  await card.locator('.canvaDetails').click();await page.locator('.pscFamilyProductSheet,.productDetailModal').first().waitFor();
  const legacy=await page.locator('[data-psc-family-detail-root]').count()===0;
  const detail=legacy?page.locator('.productDetailModal'):page.locator('[data-psc-family-detail-root]');
  assert.equal(await detail.locator('.detailProductImageWrap>img:not(.detailDhaIcon)').count(),0,sku+' never borrows another photo in Details');
  if(legacy)await detail.locator('button[data-modal-close]').click();else await page.keyboard.press('Escape');
 }
 assert.equal(checked,process.env.PSC_IMAGE_FRAMING_ONLY?framed.length:inventory.filter(i=>expected.has(i.sku)).length+framed.filter(s=>!expected.has(s)).length);
 assert.equal(new Set(inventory.flatMap(i=>i.ids)).size,inventory.flatMap(i=>i.ids).length,'Exact identities retained once');
 assert.deepEqual(await page.evaluate(()=>window.__backendCalls.filter(c=>c.rpc||c.action!=='select')),[]);assert.deepEqual(errors,[]);
 results.push({width,listings:inventory.length,checked,framed,missing:inventory.filter(i=>!i.src).length,passed:true});await ctx.close();console.log('PASS all reviewed image bindings, decoded photos, exact card/Details continuity, reference labels and no writes',width,checked);
}writeFileSync(path.join(output,'qa.json'),JSON.stringify(results,null,2)+'\n');}finally{await browser.close();server.close();}
