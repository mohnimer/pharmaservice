(() => {
  'use strict';
  // The application owns query state, filtering and focus; Escape clears it.
  document.addEventListener('keydown', event => {
    const input = event.target;
    if (!input?.matches?.('[data-cat-q]') || event.key !== 'Escape') return;
    event.preventDefault();
    input.value = '';
    input.dispatchEvent(new Event('input', {bubbles:true}));
  });
})();
