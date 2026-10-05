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
    '[data-approve-quote]'
  ].join(',');

  const BUSY_LABELS = new Map([
    ['data-submit-request','Submitting…'],
    ['data-submit-custom','Sending…'],
    ['data-confirm-quote','Confirming…'],
    ['data-cancel-quote','Cancelling…'],
    ['data-mvp-login','Signing in…'],
    ['data-mail-save-draft','Saving…'],
    ['data-mail-test','Sending test…'],
    ['data-mail-send','Sending…'],
    ['data-cms-save','Saving…'],
    ['data-cms-publish','Publishing…'],
    ['data-cms-delete-media','Removing…'],
    ['data-option-save','Saving…'],
    ['data-option-review','Updating…'],
    ['data-save-storefront','Saving…'],
    ['data-workshop-save','Saving…'],
    ['data-approve-quote','Approving…']
  ]);

  const CONFIRM_SELECTORS = [
    '[data-add]',
    '[data-quick-add]',
    '[data-replenish]'
  ].join(',');

  function nearestAction(target){
    if(!(target instanceof Element)) return null;
    return target.closest('button,.button,[role="button"]');
  }

  function loadingLabel(button){
    for(const [attr,label] of BUSY_LABELS){
      if(button.hasAttribute(attr)) return label;
    }
    return null;
  }

  function startBusy(button){
    if(!button || button.classList.contains('ux32-loading')) return;
    button.classList.add('ux32-loading');
    button.setAttribute('aria-busy','true');
    button.dataset.ux32Started = String(Date.now());

    const label = loadingLabel(button);
    if(label && !button.dataset.ux32OriginalHtml){
      button.dataset.ux32OriginalHtml = button.innerHTML;
      button.dataset.ux32BusyLabel = label;
      button.textContent = label;
    }

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

  function flashConfirmed(button, label='Added'){
    if(!button || !button.isConnected) return;
    const original = button.innerHTML;
    button.classList.add('ux32-confirmed');
    button.innerHTML = `<span class="ux32-check" aria-hidden="true">✓</span><span>${label}</span>`;
    window.setTimeout(() => {
      if(!button.isConnected) return;
      button.classList.remove('ux32-confirmed');
      button.innerHTML = original;
    }, 900);
  }

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
    }

    const confirm = button.closest(CONFIRM_SELECTORS);
    if(confirm){
      window.setTimeout(() => flashConfirmed(confirm, 'Added'), 70);
    }
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

  /* Actual route changes get a tiny fade/settle. Search/filter rerenders do not. */
  let routeEntrancePending = false;
  window.addEventListener('hashchange', () => {
    routeEntrancePending = true;
    clearBusyOnFeedback();
  });

  function applyRouteEntrance(){
    if(!routeEntrancePending) return;
    const app = document.getElementById('app');
    const page = app?.firstElementChild;
    if(!page) return;
    routeEntrancePending = false;
    page.classList.remove('ux32-page-enter');
    void page.offsetWidth;
    page.classList.add('ux32-page-enter');
    window.setTimeout(() => page.classList.remove('ux32-page-enter'), 360);
  }

  let feedbackCount = 0;
  function inspectFeedback(){
    enhanceDisabledBusyStates();
    applyRouteEntrance();

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
    new MutationObserver(schedule).observe(app,{
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:['disabled','aria-disabled','class']
    });
  }
})();