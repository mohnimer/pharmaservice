import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from './serve.mjs';
const out=process.argv[2];assert(out&&path.isAbsolute(out),'Supply an absolute private output directory');mkdirSync(out,{recursive:true});
const snapshot=process.argv[3]?JSON.parse(readFileSync(process.argv[3],'utf8')):null;
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.PSC_CHROME,args:['--no-sandbox']});
try{
 const ctx=await browser.newContext({viewport:{width:1440,height:1100}});await ctx.addInitScript(()=>window.__testRole='demo');
 const transport=readFileSync('tests/mock-supabase.js','utf8')+(snapshot?'\nwindow.__tables.storefronts='+JSON.stringify(snapshot.storefronts)+';window.__tables.published_storefront_catalogue='+JSON.stringify(snapshot.published)+';':'');
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1'||(r.request().method()==='GET'&&u.hostname==='ewewkojlsgqvcqarmpgr.supabase.co'&&u.pathname.startsWith('/storage/v1/object/public/product-media/')))return r.continue();return r.fulfill({contentType:u.hostname==='cdn.jsdelivr.net'?'text/javascript':'text/plain',body:u.hostname==='cdn.jsdelivr.net'?transport:''});});
 const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/#portal/catalogue/all`);await page.locator('.productCard').first().waitFor();
 if(snapshot)await page.waitForFunction(()=>window.__backendCalls.filter(c=>c.table==='published_storefront_catalogue').length>=2);
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 await page.locator('.productMainImage').evaluateAll(async images=>Promise.all(images.map(async i=>{i.loading='eager';try{await i.decode();}catch{}})));
 const audit=await page.evaluate(()=>{
  const api=window.PS_CATALOGUE_STOCK;
  const products=window.PSC_DATA.products.map(p=>({sku:p.pscSku,name:p.name,displayName:p.catalogueDisplayName,brand:p.brand,pack:p.pack,category:p.category,family:p.catalogueParentId||p.catalogueReferenceFamilyId,visible:p.catalogueVisible!==false,image:p.currentImageUrl,imageStatus:p.imageStatus,imageIdentityReviewed:p.imageIdentityReviewed,sourceKind:api.forProduct(p)?.source_kind,resolved:window.PSC_IMAGE_POLICY.resolve(p.currentImageUrl),realPhoto:api.realPhoto(p)}));
  const cards=[...document.querySelectorAll('.productGrid .productCard')].map(c=>{const i=c.querySelector('.productMainImage'),v=c.querySelector('.productVisual'),r=v?.getBoundingClientRect();return {sku:c.querySelector('[data-product-view]')?.dataset.productView,ids:JSON.parse(c.dataset.matchingSkus),key:c.dataset.familyListing,title:c.querySelector('h3')?.textContent,src:i?.getAttribute('src')||null,alt:i?.alt||'',example:i?.dataset.familyExample==='true',loaded:!!(i?.complete&&i.naturalWidth),dimensions:i?[i.naturalWidth,i.naturalHeight]:null,visibility:i?getComputedStyle(i).visibility:null,frame:r?[r.width,r.height]:null,transform:i?getComputedStyle(i).transform:null};});
  const releaseInputs=window.PS_CATALOGUE_REFRESH.products.map(p=>({sku:p.pscSku,name:p.name,family_id:String(p.catalogueParentId||p.catalogueReferenceFamilyId||'')}));
  return {products,cards,releaseInputs,framing:window.PS_PHOTO_FRAMING,counts:{products:products.length,visible:products.filter(p=>p.visible).length,cards:cards.length,missing:cards.filter(c=>!c.src).length,broken:cards.filter(c=>c.src&&!c.loaded).length}};
 });audit.pageErrors=errors;writeFileSync(path.join(out,'listing-image-audit.json'),JSON.stringify(audit,null,2)+'\n');console.log(JSON.stringify(audit.counts));console.log('Page errors',errors);
 await ctx.close();
}finally{await browser.close();server.close();}
