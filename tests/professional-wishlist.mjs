// Actual bundled wishlist flow: exact identities, unavailable records and no order writes.
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
const w=new Window({url:'http://localhost/#portal/catalogue/sports',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableComputedStyleRendering:true}});
w.document.body.innerHTML='<div id="app"></div>';w.structuredClone=structuredClone;w.__testRole='demo';
w.eval(readFileSync('tests/mock-supabase.js','utf8'));w.eval(readFileSync('dist/current.js','utf8'));w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
const pause=()=>new Promise(r=>setTimeout(r,100));
async function ready(selector){for(let i=0;i<100;i++){const el=w.document.querySelector(selector);if(el)return el;await pause();}throw Error('Missing '+selector);}
async function refreshWishlist(){w.PSC_NAVIGATE('portal/dashboard');await ready('.psPortalWelcome');w.PSC_NAVIGATE('portal/wishlist');await ready('.wishlistGrid');}
try{
 const heart=await ready('.pscEditorialCard [data-wishlist-toggle]'),key=heart.dataset.wishlistToggle;heart.click();await pause();assert.equal(heart.getAttribute('aria-pressed'),'true');
 w.PSC_NAVIGATE('portal/wishlist');await ready('.wishlistGrid');assert.equal(w.document.querySelectorAll('.wishlistGrid [data-wishlist-toggle]').length,1);assert.equal(w.document.querySelector('[data-wishlist-toggle]').dataset.wishlistToggle,key);
 const storedKey=Object.keys(w.localStorage).find(k=>k.startsWith('psc-wishlist-'));assert(storedKey);
 const data=w.PSC_DATA.products,a=data.find(p=>p.catalogueParentId&&data.some(x=>x.pscSku!==p.pscSku&&x.catalogueParentId===p.catalogueParentId)),b=data.find(x=>x.pscSku!==a.pscSku&&x.catalogueParentId===a.catalogueParentId);assert(b);
 w.localStorage.setItem(storedKey,JSON.stringify(['sku:'+a.pscSku,'sku:'+b.pscSku]));await refreshWishlist();
 const controls=[...w.document.querySelectorAll('.wishlistGrid [data-wishlist-toggle]')];assert.deepEqual(controls.map(x=>x.dataset.wishlistToggle),['sku:'+a.pscSku,'sku:'+b.pscSku]);controls[0].click();await pause();assert.equal(w.document.querySelectorAll('.wishlistGrid [data-wishlist-toggle]').length,1);assert.equal(w.document.querySelector('.wishlistGrid [data-wishlist-toggle]').dataset.wishlistToggle,'sku:'+b.pscSku);
 w.localStorage.setItem(storedKey,JSON.stringify(['sku:UNAVAILABLE-TEST-ID']));await refreshWishlist();assert(w.document.querySelector('.wishlistUnavailable'));assert.equal(w.document.querySelector('[data-product-view]'),null,'Removed identity cannot silently become a substitute product');w.document.querySelector('[data-wishlist-toggle]').click();await pause();assert.equal(w.document.querySelector('.wishlistGrid'),null);
 assert.deepEqual(JSON.parse(w.localStorage.getItem(storedKey)),[]);
 console.log('Wishlist saved family, distinct exact variants, precise removal and unavailable identity handling PASS');
}finally{await w.happyDOM.close();}
