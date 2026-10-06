
(() => {
  'use strict';

  /*
    The core app currently rerenders the entire catalogue on every single
    data-cat-q input event. On some browsers that replacement steals the
    active input between keystrokes, producing the "one character at a time"
    behaviour.

    This capture-phase controller lets the user type normally, then hands the
    complete value back to the existing app listener after a short pause.
    No catalogue filtering logic is duplicated here.
  */

  let timer = null;
  const ALLOWED = Symbol('pscAllowedCatalogueInput');

  function toggleSearchState(input){
    const value = String(input?.value || '').trim();

    const publicPage = input?.closest('.publicCataloguePage');
    if(publicPage){
      publicPage.classList.toggle('v44102Searching', !!value);
    }

    const portalLanding = document.querySelector('.customerShell .v26CatalogueLanding');
    const prominent = document.querySelector('.customerShell .v449CatalogueSearch input');
    if(portalLanding && prominent){
      portalLanding.classList.toggle('v44102Searching', !!String(prominent.value || '').trim());
    }
  }

  document.addEventListener('input', e => {
    const input = e.target;
    if(!(input instanceof HTMLInputElement)) return;

    /* Core/public + portal category search. */
    if(input.matches('[data-cat-q]')){
      if(e[ALLOWED]){
        toggleSearchState(input);
        return;
      }

      /* Stop the core listener from destroying/rebuilding the input on this
         literal keypress. */
      e.stopImmediatePropagation();
      toggleSearchState(input);

      const value = input.value;
      const cursor = input.selectionStart ?? value.length;

      clearTimeout(timer);
      timer = setTimeout(() => {
        const live = document.querySelector('[data-cat-q]');
        if(!live) return;

        live.value = value;
        try{
          live.setSelectionRange(cursor,cursor);
        }catch(_){}

        const commit = new Event('input',{bubbles:true});
        commit[ALLOWED] = true;
        live.dispatchEvent(commit);
      }, 220);

      return;
    }

    /* The prominent portal-catalogue landing search should visually enter a
       search state as soon as the user starts typing. */
    if(input.closest('.v449CatalogueSearch')){
      toggleSearchState(input);
    }
  }, true);

  function rescan(){
    const input = document.querySelector('[data-cat-q]');
    if(input) toggleSearchState(input);

    const prominent = document.querySelector('.customerShell .v449CatalogueSearch input');
    if(prominent) toggleSearchState(prominent);
  }

  let queued = false;
  function schedule(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      rescan();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',schedule,{once:true});
  }else{
    schedule();
  }

  const app = document.getElementById('app');
  if(app){
    new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  }
  window.addEventListener('hashchange',schedule);
})();
