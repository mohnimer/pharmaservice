(() => {
  'use strict';
  // Typing stays on the catalogue landing. Enter submits once through the router.
  // No session-storage replay, observer, delayed navigation or mirrored inputs.
  document.addEventListener('keydown', event => {
    const input = event.target;
    if (!input?.matches?.('.v449CatalogueSearch input') || event.key !== 'Enter') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.PS_SEARCH_CATALOGUE(input.value);
  }, true);
  sessionStorage.removeItem('pscPortalPendingCatalogueQuery');
})();
