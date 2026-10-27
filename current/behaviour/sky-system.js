/* Route-level transitions only: quantity changes and live transactions never animate away. */
(() => {
 'use strict';
 let route='';let photoObservers=[];
 function apply(){
  document.documentElement.classList.add('pscOpenSky');
  photoObservers=photoObservers.filter(x=>{if(x.el.isConnected)return true;x.observer.disconnect();return false;});
  const next=window.PSC_CURRENT_ROUTE?.()||location.hash;
  if(route!==next){route=next;const page=document.querySelector('#app>main,#app>.appShell');if(page&&!matchMedia('(prefers-reduced-motion: reduce)').matches)page.classList.add('skyPageEnter');}
  document.querySelectorAll('.skyHeroSubject img').forEach(img=>{
   const fit=()=>{const frame=img.parentElement,meta=window.PSC_PHOTO_SUBJECTS?.[img.getAttribute('src')];const fit=window.PSC_PHOTO_SUBJECT_FIT?.calculate(meta,frame.clientWidth/frame.clientHeight);if(fit)img.style.transform=fit.css;};
   if(!img.dataset.skyFitted){img.dataset.skyFitted='1';img.addEventListener('load',fit,{once:true});fit();const observer=new ResizeObserver(fit);observer.observe(img.parentElement);photoObservers.push({el:img,observer});}
  });
  const mobileMenu=document.querySelector('.skyPublicMobile');
  if(mobileMenu&&!mobileMenu.dataset.skyBound){mobileMenu.dataset.skyBound='1';const summary=mobileMenu.querySelector('summary');summary.setAttribute('aria-expanded',String(mobileMenu.open));mobileMenu.addEventListener('toggle',()=>summary.setAttribute('aria-expanded',String(mobileMenu.open)));mobileMenu.addEventListener('keydown',e=>{if(e.key==='Escape'){mobileMenu.open=false;summary.focus();}});}
  const login=document.querySelector('.loginCard');if(login&&!login.querySelector('.skyLoginNote')){let pending='';try{pending=sessionStorage.getItem('pscPendingRoute')||'';}catch{}if(pending){const note=document.createElement('p');note.className='skyLoginNote';note.textContent='Sign in to prepare your quotation request. You can browse products without an account.';login.prepend(note);}}
  // Public/native markup is inserted by established enhancers; use their existing delegated actions.
  document.querySelectorAll('.skyHero [data-public-product-view]').forEach(el=>{if(el.dataset.skyBound)return;el.dataset.skyBound='1';el.addEventListener('click',()=>{const sku=el.dataset.publicProductView;const p=window.PSC_DATA?.products?.find(x=>x.pscSku===sku);if(p?.catalogueParentId&&window.PSC_OPEN_FAMILY_DETAIL)window.PSC_OPEN_FAMILY_DETAIL(p.catalogueParentId,{sku});else window.PSC_OPEN_PUBLIC_PRODUCT?.(sku);});});
 }
 document.addEventListener('click',e=>{const menu=document.querySelector('.skyPublicMobile[open]');if(menu&&(!menu.contains(e.target)||e.target.closest('[data-go]')))menu.open=false;});
 let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});};
 window.PSC_ENHANCEMENTS.createObserver(schedule).observe(document.getElementById('app'),{childList:true,subtree:true});window.addEventListener('popstate',schedule);window.addEventListener('hashchange',schedule);schedule();
})();
