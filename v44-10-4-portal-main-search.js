
(() => {
  'use strict';

  /*
    V44.10.4 — PORTAL MAIN CATALOGUE SEARCH

    Problem:
    The large search field on #portal/catalogue only mirrored text into the
    persistent header search. It did not actually open the searchable product
    result route, so the user saw the category landing disappear but no results.

    Behaviour now:
    - type normally in the large main catalogue search;
    - after a short pause, move to #portal/catalogue/all;
    - apply the complete query to the real catalogue filter;
    - keep the matching product results visible.
  */

  let routeTimer = null;
  let pendingQuery = '';

  function currentRoute(){
    return (location.hash || '').replace(/^#\/?/,'');
  }

  function isMainCatalogueRoute(){
    return currentRoute() === 'portal/catalogue';
  }

  function applyPendingQuery(){
    if(!pendingQuery) return false;

    const queryInput = document.querySelector('.customerShell [data-cat-q]');
    if(!queryInput) return false;

    if(queryInput.value !== pendingQuery){
      queryInput.value = pendingQuery;
    }

    /*
      Use the application's own catalogue input event so all existing filtering,
      counts and result rendering remain authoritative.
    */
    queryInput.dispatchEvent(new Event('input',{bubbles:true}));
    return true;
  }

  function openResults(query){
    pendingQuery = String(query || '').trim();
    if(!pendingQuery) return;

    sessionStorage.setItem('pscPortalPendingCatalogueQuery', pendingQuery);

    if(isMainCatalogueRoute()){
      location.hash = '#portal/catalogue/all';
    } else {
      applyPendingQuery();
    }
  }

  document.addEventListener('input', e => {
    const input = e.target;
    if(!(input instanceof HTMLInputElement)) return;

    const mainSearch = input.closest('.customerShell .v449CatalogueSearch');
    if(!mainSearch) return;

    const query = input.value;

    clearTimeout(routeTimer);

    if(!query.trim()){
      pendingQuery = '';
      sessionStorage.removeItem('pscPortalPendingCatalogueQuery');
      return;
    }

    routeTimer = setTimeout(() => openResults(query), 260);
  }, true);

  document.addEventListener('keydown', e => {
    const input = e.target;
    if(!(input instanceof HTMLInputElement)) return;
    if(!input.closest('.customerShell .v449CatalogueSearch')) return;
    if(e.key !== 'Enter') return;

    e.preventDefault();
    clearTimeout(routeTimer);
    openResults(input.value);
  }, true);

  function restorePending(){
    const stored = sessionStorage.getItem('pscPortalPendingCatalogueQuery');
    if(stored) pendingQuery = stored;

    if(currentRoute() !== 'portal/catalogue/all' || !pendingQuery) return;

    let tries = 0;
    const tick = () => {
      tries += 1;

      const input = document.querySelector('.customerShell [data-cat-q]');
      if(input){
        input.value = pendingQuery;
        input.dispatchEvent(new Event('input',{bubbles:true}));

        /*
          Keep the persistent header search visually in sync without depending
          on it for filtering.
        */
        document.querySelectorAll('.customerShell [data-global-search]').forEach(global => {
          global.value = pendingQuery;
          global.dispatchEvent(new Event('input',{bubbles:true}));
        });

        sessionStorage.removeItem('pscPortalPendingCatalogueQuery');
        return;
      }

      if(tries < 20) setTimeout(tick,50);
    };

    setTimeout(tick,0);
  }

  window.addEventListener('hashchange', restorePending);

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',restorePending,{once:true});
  } else {
    restorePending();
  }

  const app = document.getElementById('app');
  if(app){
    let queued = false;
    new MutationObserver(() => {
      if(queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        restorePending();
      });
    }).observe(app,{childList:true,subtree:true});
  }
})();
