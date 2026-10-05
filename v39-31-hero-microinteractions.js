(() => {
  'use strict';

  const HERO_IMAGE = '/assets/hero-school-corridor.webp?v=3931';
  const HERO_LOGO = '/assets/hero-pharmaservice-logo.webp?v=3931';

  function route(){
    return String(location.hash || '').replace(/^#/, '').replace(/^\//, '').split(/[?&]/)[0];
  }

  function isHome(){
    const r = route();
    return !r || r === 'home';
  }

  function enhanceHero(){
    if(!isHome()) return;
    const hero = document.querySelector('.publicLanding .pscInstitutionalHero');
    if(!hero || hero.dataset.v3931 === '1') return;

    hero.dataset.v3931 = '1';
    hero.classList.add('v3931Hero');
    hero.setAttribute('aria-label', 'Pharma Service institutional healthcare supply');
    hero.innerHTML = `
      <h1 class="v3931SrOnly">Pharma Service institutional healthcare supply</h1>
      <div class="v3931HeroMedia" aria-hidden="true">
        <img src="${HERO_IMAGE}" alt="" decoding="async" fetchpriority="high">
      </div>
      <div class="v3931HeroBrand" aria-hidden="true">
        <img src="${HERO_LOGO}" alt="">
      </div>
    `;
  }

  function nearestButton(target){
    if(!(target instanceof Element)) return null;
    return target.closest('button,.button,[role="button"]');
  }

  function markBusy(button, label){
    if(!button || button.classList.contains('ux-is-loading')) return;
    button.classList.add('ux-is-loading');
    button.setAttribute('aria-busy', 'true');
    if(!button.dataset.uxOriginalHtml) button.dataset.uxOriginalHtml = button.innerHTML;
    if(label){
      button.dataset.uxBusyLabel = label;
      button.textContent = label;
    }
    window.setTimeout(() => clearBusy(button), 12000);
  }

  function clearBusy(button){
    if(!button || !button.isConnected) return;
    button.classList.remove('ux-is-loading');
    button.removeAttribute('aria-busy');
    if(button.dataset.uxBusyLabel && button.dataset.uxOriginalHtml){
      button.innerHTML = button.dataset.uxOriginalHtml;
    }
    delete button.dataset.uxBusyLabel;
    delete button.dataset.uxOriginalHtml;
  }

  function flashConfirmed(selector, label='Added ✓'){
    window.setTimeout(() => {
      document.querySelectorAll(selector).forEach(btn => {
        if(!(btn instanceof HTMLElement)) return;
        const original = btn.innerHTML;
        btn.classList.add('ux-confirmed');
        btn.innerHTML = `<span class="ux-confirmMark" aria-hidden="true">✓</span><span>${label.replace(/\s*✓\s*$/,'')}</span>`;
        window.setTimeout(() => {
          if(!btn.isConnected) return;
          btn.classList.remove('ux-confirmed');
          btn.innerHTML = original;
        }, 850);
      });
    }, 70);
  }

  function enhanceNativeBusyStates(){
    // Existing app code already disables these while awaiting network responses.
    document.querySelectorAll('[data-public-enquiry-submit]:disabled,[data-mail-test]:disabled,[data-mail-send]:disabled').forEach(btn => {
      if(btn instanceof HTMLElement) btn.classList.add('ux-native-busy');
    });
    document.querySelectorAll('[data-public-enquiry-submit]:not(:disabled),[data-mail-test]:not(:disabled),[data-mail-send]:not(:disabled)').forEach(btn => {
      if(btn instanceof HTMLElement) btn.classList.remove('ux-native-busy');
    });
  }

  document.addEventListener('click', event => {
    const button = nearestButton(event.target);
    if(!button || button.hasAttribute('disabled')) return;

    if(button.matches('[data-submit-request]')) markBusy(button, 'Submitting…');
    else if(button.matches('[data-submit-custom]')) markBusy(button, 'Sending…');
    else if(button.matches('[data-confirm-quote]')) markBusy(button, 'Confirming…');
    else if(button.matches('[data-cancel-quote]')) markBusy(button, 'Cancelling…');
    else if(button.matches('[data-mvp-login]')) markBusy(button, 'Signing in…');

    if(button.matches('[data-add]')){
      const sku = CSS.escape(button.getAttribute('data-add') || '');
      if(sku) flashConfirmed(`[data-add="${sku}"]`);
    }
    if(button.matches('[data-quick-add]')){
      const sku = CSS.escape(button.getAttribute('data-quick-add') || '');
      if(sku) flashConfirmed(`[data-quick-add="${sku}"]`);
    }
    if(button.matches('[data-replenish]')){
      const token = CSS.escape(button.getAttribute('data-replenish') || '');
      if(token) flashConfirmed(`[data-replenish="${token}"]`, 'Added');
    }
  }, true);

  let queued = false;
  function apply(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      enhanceHero();
      enhanceNativeBusyStates();
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, {once:true});
  else apply();

  const app = document.getElementById('app');
  if(app) new MutationObserver(apply).observe(app, {childList:true, subtree:true, attributes:true, attributeFilter:['disabled']});
  window.addEventListener('hashchange', apply);
})();
