(() => {
  'use strict';

  function route(){
    return String(location.hash || '').replace(/^#/, '').replace(/^\//, '');
  }

  function cleanStartPage(){
    if(route() !== 'start') return;

    const page = document.querySelector('main.startPage, main.start16Page, main.publicPage');
    if(!page) return;

    // Remove the duplicated hero CTAs circled in the mobile screenshot.
    page.querySelector('.start16HeroActions')?.remove();

    // Remove the Requirement → Review → Quotation cue.
    page.querySelector('.start22SupplyCue')?.remove();

    // Preserve earlier Start-page cleanup.
    page.querySelector('.start16Brief')?.remove();
    page.querySelector('.start16Bottom')?.remove();
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