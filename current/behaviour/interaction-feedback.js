(() => {
  'use strict';

  const ASYNC_CLICK_SELECTORS = [
    '[data-submit-request]',
    '[data-submit-custom]',
    '[data-confirm-quote]',
    '[data-cancel-quote]',
    '[data-mvp-login]',
    '[data-mail-save-draft]',
    '[data-mail-test]',
    '[data-mail-send]',
    '[data-cms-save]',
    '[data-cms-publish]',
    '[data-cms-delete-media]',
    '[data-option-save]',
    '[data-option-review]',
    '[data-save-storefront]',
    '[data-workshop-save]',
    '[data-approve-quote]',
    '[data-signout]',
    '[data-school-select]'
  ].join(',');

  // Motion never schedules a business action. All state changes remain synchronous.
  const motionPreference=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const reduced = () => !!motionPreference?.matches;
  motionPreference?.addEventListener('change',event=>{if(event.matches){document.getAnimations?.().forEach(animation=>animation.cancel());document.querySelectorAll('[data-motion-ghost]').forEach(el=>el.remove());}});
  const ease = 'cubic-bezier(.22,.75,.2,1)';
  const running = new WeakMap();
  function animate(node, frames, duration=200){
    if(!node || reduced() || !node.animate) return null;
    running.get(node)?.cancel();
    const animation=node.animate(frames,{duration,easing:ease});
    running.set(node,animation);
    animation.finished.catch(()=>{});
    return animation;
  }
  const surfaces='.requestDrawer,.fluidProductShell,.professionalProductDetail,.drawerBody';
  function capture(){
    const active=document.activeElement;
    const attr=active?.getAttributeNames?.().find(n=>n.startsWith('data-')&&!n.startsWith('data-ux'));
    return {quantity:document.querySelector('[data-request-quantity]')?.value,focus:attr?{attr,value:active.getAttribute(attr)}:null,
      scroll:[...document.querySelectorAll(surfaces)].filter(el=>!el.closest('[data-motion-ghost]')).map(el=>({selector:['requestDrawer','fluidProductShell','professionalProductDetail','drawerBody'].filter(name=>el.classList.contains(name)).map(name=>'.'+name).join(''),top:el.scrollTop})),
      overlays:[...document.querySelectorAll('.fluidOverlay,.requestDrawerBackdrop')].filter(el=>!el.closest('[data-motion-ghost]')).map(el=>el.className)};
  }
  function restore(saved){
    if(!saved)return;
    const quantity=document.querySelector('[data-request-quantity]');
    if(quantity&&saved.quantity&&saved.overlays.length)quantity.value=saved.quantity;
    for(const item of saved.scroll){const el=document.querySelector(item.selector);if(el)el.scrollTop=item.top;}
    for(const el of document.querySelectorAll('.fluidOverlay,.requestDrawerBackdrop')){
      if(saved.overlays.includes(el.className)){
        el.style.animation='none';el.querySelectorAll(surfaces).forEach(n=>n.style.animation='none');
      }
    }
    const opened=document.querySelector('#app .requestDrawer,#app .fluidProductShell,[data-psc-family-detail-root] .fluidProductShell');
    if(opened&&!saved.overlays.length){opened.querySelector('button')?.focus({preventScroll:true});return;}
    if(saved.focus){const {attr,value}=saved.focus;const el=[...document.querySelectorAll('['+attr+']')].find(n=>n.getAttribute(attr)===value);el?.focus({preventScroll:true});}
  }
  // Exit snapshots are inert and never delay removal, focus restoration or a rapid reopen.
  function exit(node){
    if(!node || reduced() || !node.animate)return;
    const rect=node.getBoundingClientRect(),ghost=node.cloneNode(true);
    const appearance=getComputedStyle(node);
    // Exit artwork must not keep the live document's :has() scroll lock active.
    Object.assign(ghost.style,{background:appearance.background,backdropFilter:appearance.backdropFilter});
    ghost.classList.remove('fluidOverlay','requestDrawerBackdrop');
    ghost.inert=true;ghost.setAttribute('aria-hidden','true');ghost.dataset.motionGhost='';
    ghost.querySelectorAll('*').forEach(el=>{for(const attr of el.getAttributeNames())if(attr.startsWith('data-')||attr==='role'||attr.startsWith('on'))el.removeAttribute(attr);});
    ghost.removeAttribute('id');ghost.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
    Object.assign(ghost.style,{position:'fixed',inset:'auto',left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',margin:'0',pointerEvents:'none',zIndex:'10001',animation:'none'});
    ghost.querySelectorAll('*').forEach(el=>el.style.animation='none');
    for(const property of ['display','padding','box-sizing','align-items','justify-content'])ghost.style.setProperty(property,appearance.getPropertyValue(property),'important');
    document.body.appendChild(ghost);
    const originalNodes=[node,...node.querySelectorAll('*')],clones=[ghost,...ghost.querySelectorAll('*')];
    clones.forEach((el,i)=>{el.scrollTop=originalNodes[i].scrollTop;el.scrollLeft=originalNodes[i].scrollLeft;});
    const panel=ghost.querySelector(surfaces);
    if(panel)animate(panel,[{transform:'translate(0,0)'},{transform:panel.matches('.requestDrawer')&&innerWidth>720?'translateX(10px)':'translateY(6px)'}],160);
    const animation=animate(ghost,[{opacity:1},{opacity:0}],160);
    animation?.finished.then(()=>ghost.remove(),()=>ghost.remove());
    if(!animation)ghost.remove();
  }
  const finishExits=()=>document.querySelectorAll('[data-motion-ghost]').forEach(el=>el.remove());
  window.PSC_MOTION={animate,capture,restore,exit,reduced,finishExits};

  function nearestAction(target){
    if(!(target instanceof Element)) return null;
    return target.closest('button,.button,[role="button"]');
  }

  // A brief response glyph acknowledges instant actions without holding them up.
  // aria-busy is reserved for real asynchronous work, below.
  let response=null;
  const responseAttributes=['data-go','data-basket','data-add','data-family-quote','data-product-view','data-public-product-view','data-account-switcher','data-ps-prepare'];
  function applyActionResponse(){
    if(!response||Date.now()>response.until)return;
    const current=[...document.querySelectorAll('['+response.attr+']')].find(el=>el.getAttribute(response.attr)===response.value&&!el.disabled&&el.getClientRects().length);
    current?.classList.add('ux32-responding');
  }
  function respond(button){
    const attr=responseAttributes.find(name=>button.hasAttribute(name));if(!attr)return;
    const next={attr,value:button.getAttribute(attr),until:Date.now()+240};response=next;
    button.classList.add('ux32-responding');
    requestAnimationFrame(applyActionResponse);
    setTimeout(()=>{if(response!==next)return;response=null;document.querySelectorAll('.ux32-responding').forEach(el=>el.classList.remove('ux32-responding'));},260);
  }

  function startBusy(button){
    if(!button || button.classList.contains('ux32-loading')) return;
    button.classList.add('ux32-loading');
    button.setAttribute('aria-busy','true');
    button.dataset.ux32Started = String(Date.now());

    window.setTimeout(() => stopBusy(button), 14000);
  }

  function stopBusy(button){
    if(!button || !button.isConnected) return;
    button.classList.remove('ux32-loading');
    button.removeAttribute('aria-busy');
    if(button.dataset.ux32OriginalHtml){
      button.innerHTML = button.dataset.ux32OriginalHtml;
    }
    delete button.dataset.ux32OriginalHtml;
    delete button.dataset.ux32BusyLabel;
    delete button.dataset.ux32Started;
  }

  document.addEventListener('psc:request-added',event=>{
    const sku=event.detail?.sku;
    const button=[...document.querySelectorAll('[data-add]')].find(n=>n.dataset.add===sku);
    if(button){
      button.classList.add('ux32-confirmed');
      // Keep the label and width stable; repeated additions remain available.
      animate(button,[{boxShadow:'0 0 0 0 rgba(22,166,157,.2)'},{boxShadow:'0 0 0 5px rgba(22,166,157,0)'}],260);
      setTimeout(()=>button.classList.remove('ux32-confirmed'),650);
    }
    document.querySelectorAll('[data-basket] b').forEach(node=>animate(node,[{opacity:.4,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}]));
  });

  function enhanceDisabledBusyStates(){
    const candidates = document.querySelectorAll('button:disabled,.button[aria-disabled="true"]');
    candidates.forEach(button => {
      if(!(button instanceof HTMLElement)) return;
      const txt = (button.textContent || '').trim().toLowerCase();
      const looksBusy = /(sending|saving|uploading|signing|submitting|confirming|cancelling|publishing|updating|loading|approving)/.test(txt);
      button.classList.toggle('ux32-native-loading', looksBusy);
    });
  }

  function markFormBusy(form){
    if(!(form instanceof HTMLFormElement)) return;
    const submit = form.querySelector('button[type="submit"],input[type="submit"],[data-public-enquiry-submit]');
    if(submit instanceof HTMLElement) startBusy(submit);
  }

  function clearBusyOnFeedback(){
    document.querySelectorAll('.ux32-loading').forEach(stopBusy);
  }

  document.addEventListener('click', event => {
    const button = nearestAction(event.target);
    if(!button || button.hasAttribute('disabled') || button.getAttribute('aria-disabled') === 'true') return;

    if(button.matches(ASYNC_CLICK_SELECTORS)){
      startBusy(button);
    }else{respond(button);}

  }, true);

  document.addEventListener('submit', event => {
    const form = event.target;
    if(!(form instanceof HTMLFormElement)) return;
    if(
      form.matches('[data-public-enquiry],[data-mail-contact-form]') ||
      form.querySelector('[data-public-enquiry-submit]')
    ){
      markFormBusy(form);
    }
  }, true);

  /* File uploads: give their visible label a temporary busy state. */
  document.addEventListener('change', event => {
    const input = event.target;
    if(!(input instanceof HTMLInputElement) || input.type !== 'file' || !input.files?.length) return;
    if(input.matches('[data-document-upload],[data-cms-image-upload]')){
      const label = input.closest('label');
      if(label instanceof HTMLElement){
        startBusy(label);
        window.setTimeout(() => stopBusy(label), 5000);
      }
    }
  }, true);

  /* pushState navigation and browser back/forward share one route response. */
  let lastRoute=window.PSC_CURRENT_ROUTE?.();
  function applyRouteEntrance(){
    const route=window.PSC_CURRENT_ROUTE?.();
    if(route===lastRoute)return;
    lastRoute=route;clearBusyOnFeedback();
    const page=document.querySelector('#app main,#app .mainContent,#app .publicPage');
    animate(page,[{opacity:.65,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],220);
  }
  // Native disclosure semantics remain authoritative. Previews contain existing text only.
  function enhanceDisclosures(root){
    root?.querySelectorAll('details').forEach(detail=>{
      if(detail.classList.contains('masterDropdown'))return;
      const summary=detail.querySelector(':scope > summary');if(!summary)return;
      if(!detail.classList.contains('psDisclosure'))detail.classList.add('psDisclosure');
      if(!summary.querySelector(':scope > i,:scope > .psDisclosurePlus')){const plus=document.createElement('i');plus.className='psDisclosurePlus';plus.textContent='+';plus.setAttribute('aria-hidden','true');summary.appendChild(plus);}
      const text=[...detail.children].filter(el=>el!==summary).map(el=>el.textContent.trim()).join(' ').replace(/\s+/g,' ').slice(0,110);
      let preview=summary.querySelector(':scope > .psDisclosurePreview');
      if(text&&!preview){preview=document.createElement('span');preview.className='psDisclosurePreview';preview.setAttribute('aria-hidden','true');summary.appendChild(preview);}
      if(preview&&preview.textContent!==text)preview.textContent=text;
    });
  }
  window.PSC_DISCLOSURES={enhance:enhanceDisclosures};
  // Animate actual content, not a duplicate or the summary. State changes never wait.
  document.addEventListener('toggle',event=>{
    if(!event.target.matches?.('details.psDisclosure[open]'))return;
    [...event.target.children].filter(el=>el.tagName!=='SUMMARY').forEach(el=>animate(el,[{opacity:.15,filter:'blur(3px)',transform:'translateY(4px)'},{opacity:1,filter:'blur(0px)',transform:'translateY(0)'}],280));
  },true);
  window.addEventListener('ps:search-results-updated',()=>{
    animate(document.querySelector('.v25ProductGrid'),[{opacity:.7},{opacity:1}],160);
  });
  // Keep Tab inside the active sheet; exiting snapshots cannot receive focus.
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){const account=document.querySelector('[data-account-switcher][aria-expanded="true"]');if(account){account.click();return;}document.querySelector('#app [data-close-basket],#app button[data-modal-close]')?.click();return;}
    if(event.key!=='Tab')return;
    const panel=document.querySelector('[data-psc-family-detail-root] [role="dialog"],#app .requestDrawer,#app .fluidProductShell');
    if(!panel)return;
    const items=[...panel.querySelectorAll('button,a[href],input,select,textarea,summary,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
    const first=items[0],last=items.at(-1);if(!first)return;
    if(event.shiftKey&&(document.activeElement===first||!panel.contains(document.activeElement))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&(document.activeElement===last||!panel.contains(document.activeElement))){event.preventDefault();first.focus();}
  });

  let feedbackCount = 0;
  // One real header, kept in document flow. No duplicated menus or scroll jumps.
  let chrome=null, chromeRoute=null, lastY=Math.max(0,window.scrollY), direction=0, travel=0, scrollFrame=0;
  function revealChrome(){
    chrome?.classList.remove('psChromeHidden');
    if(chrome)chrome.inert=false;
  }
  function syncChrome(){
    const next=document.querySelector('#app [data-ps-scroll-header]'),route=window.PSC_CURRENT_ROUTE?.();
    if(next!==chrome){chrome=next;if(route!==chromeRoute)revealChrome();chromeRoute=route;lastY=Math.max(0,window.scrollY);travel=0;direction=0;}
    if(chrome?.querySelector('[aria-expanded="true"],.publicNav.open')||document.querySelector('.mobileOverlay.show')||chrome?.querySelector(':focus-visible,input:focus,textarea:focus,select:focus'))revealChrome();
  }
  function scrollChrome(){
    scrollFrame=0;
    const y=Math.max(0,Math.min(window.scrollY,document.documentElement.scrollHeight-window.innerHeight)),delta=y-lastY;lastY=y;
    if(!chrome||Math.abs(delta)<2)return;
    const nextDirection=delta>0?1:-1;
    if(nextDirection!==direction){travel=0;direction=nextDirection;}
    travel+=Math.abs(delta);
    const pinned=chrome.querySelector(':focus-visible,input:focus,textarea:focus,select:focus')||chrome.querySelector('[aria-expanded="true"],.publicNav.open')||document.querySelector('.mobileOverlay.show');
    if(y<chrome.offsetHeight+40||pinned||(direction<0&&travel>=12))revealChrome();
    else if(direction>0&&travel>=24){chrome.classList.add('psChromeHidden');chrome.inert=true;}
  }
  window.PSC_NAVIGATION_CHROME={sync:syncChrome,onScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(scrollChrome);}};
  document.addEventListener('keydown',event=>{if(event.key==='Tab')revealChrome();},true);
  document.addEventListener('focusin',event=>{if(chrome?.contains(event.target))revealChrome();});
  window.addEventListener('resize',()=>{lastY=Math.max(0,window.scrollY);travel=0;revealChrome();},{passive:true});
  function inspectFeedback(){
    syncChrome();
    enhanceDisclosures(document.getElementById('app'));
    enhanceDisabledBusyStates();
    applyRouteEntrance();
    applyActionResponse();

    const toasts = document.querySelectorAll('.toast');
    if(toasts.length > feedbackCount){
      clearBusyOnFeedback();
    }
    feedbackCount = toasts.length;
  }

  let queued = false;
  function schedule(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      inspectFeedback();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', schedule, {once:true});
  }else{
    schedule();
  }

  const app = document.getElementById('app');
  if(app){
    window.PSC_ENHANCEMENTS.createObserver(schedule).observe(app,{
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:['disabled','aria-disabled','class']
    });
  }
})();
