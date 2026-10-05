(() => {
  'use strict';

  function route(){
    return String(location.hash || '')
      .replace(/^#/, '')
      .replace(/^\//, '')
      .split(/[?&]/)[0];
  }

  function cleanStartPage(){
    if(route() !== 'start') return;

    const page = document.querySelector('main.startPage, main.start16Page, main.publicPage');
    if(!page) return;

    /*
      These are intentionally removed from /start:
      1) the duplicate hero CTA pair ("Send a list / RFQ" + "Browse catalogue")
      2) the injected Requirement → Review → Quotation cue
      The three-route board below remains.
    */
    page.querySelector('.start16HeroActions')?.remove();
    page.querySelector('.start22SupplyCue')?.remove();

    // Previously approved Start-page cleanup.
    page.querySelector('.start16Brief')?.remove();
    page.querySelector('.start16Bottom')?.remove();

    // Defensive cleanup for older variants of the previously removed helper blocks.
    [...page.querySelectorAll('section, article, aside')].forEach(el => {
      const txt = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if(
        txt.includes('operational brief') ||
        txt.includes('what we need before we quote') ||
        txt.includes('three details make a request much easier to quote')
      ){
        el.remove();
      }
    });

    /*
      V39.22 can inject the three-pill cue after a route render.
      Remove only that exact cue if an older classless variant ever appears.
      Do NOT touch .start16RouteBoard.
    */
    [...page.querySelectorAll('.start16HeroCopy > div')].forEach(el => {
      if(el.classList.contains('start16RouteBoard')) return;
      const txt = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if(
        txt === 'requirement → review → quotation' ||
        (txt.includes('requirement') && txt.includes('review') && txt.includes('quotation') && el.children.length <= 7)
      ){
        el.remove();
      }
    });
  }

  let queued = false;
  function schedule(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      cleanStartPage();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', schedule, {once:true});
  }else{
    schedule();
  }

  const app = document.getElementById('app');
  if(app){
    new MutationObserver(schedule).observe(app, {
      childList:true,
      subtree:true
    });
  }

  window.addEventListener('hashchange', schedule);
})();