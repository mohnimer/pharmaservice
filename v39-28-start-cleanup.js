(() => {
  'use strict';

  function route(){
    return String(location.hash || '').replace(/^#/, '').replace(/^\//, '');
  }

  function cleanStartPage(){
    if(route() !== 'start') return;

    const page = document.querySelector('main.startPage, main.start16Page, main.publicPage');
    if(!page) return;

    // Current Start-page helper sections.
    page.querySelector('.start16Brief')?.remove();
    page.querySelector('.start16Bottom')?.remove();

    // Defensive cleanup for older rendered variants of the same block.
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
  } else {
    schedule();
  }

  const app = document.getElementById('app');
  if(app) new MutationObserver(schedule).observe(app, {childList:true, subtree:true});
  window.addEventListener('hashchange', schedule);
})();