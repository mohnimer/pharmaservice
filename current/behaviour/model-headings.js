(() => {
  'use strict';

  const EYEBROW_SELECTORS = [
    '.kicker',
    '.eyebrow',
    '.sectionLabel',
    '[class*="Eyebrow"]',
    '[class*="eyebrow"]',
    '[class*="Kicker"]',
    '[class*="kicker"]'
  ].join(',');

  function isHeading(el){
    return !!el && /^H[1-4]$/.test(el.tagName);
  }

  function removeEyebrows(root=document){
    root.querySelectorAll(EYEBROW_SELECTORS).forEach(el => el.remove());

    /*
      Some older sections use an unclassed uppercase <span> immediately
      before a heading. Those are presentation eyebrows too. Remove only
      that structural pattern so form labels, statuses and functional
      controls remain untouched.
    */
    root.querySelectorAll('span').forEach(span => {
      const parent = span.parentElement;
      if(!parent) return;

      const next = span.nextElementSibling;
      const directHeading = isHeading(next);

      const laterHeading = !directHeading
        ? [...parent.children].slice([...parent.children].indexOf(span)+1).find(isHeading)
        : null;

      if(!directHeading && !laterHeading) return;

      const text = String(span.textContent || '').replace(/\s+/g,' ').trim();
      if(!text || text.length > 60) return;

      const letters = text.replace(/[^A-Za-z]/g,'');
      if(!letters) return;

      const mostlyUpper = text === text.toUpperCase();
      if(mostlyUpper) span.remove();
    });
  }

  function updateOurModel(){
    const page = document.querySelector('main.model17Page');
    if(!page) return;

    const h1 = page.querySelector('.model17HeroCopy h1');
    if(h1 && h1.dataset.v3938 !== '1'){
      h1.dataset.v3938 = '1';
      h1.classList.add('model38Headline');
      h1.innerHTML = `
        <span class="model38LeadLine">Easy procurement. <em>Wholesale pricing.</em></span>
        <strong class="model38Payoff">More time for what matters</strong>
      `;
    }

    const promise = page.querySelector('.model17Promise h2');
    if(promise){
      promise.textContent = 'Procurement complexity is ours to manage.';
    }
  }

  let queued=false;
  function apply(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(() => {
      queued=false;
      const app=document.getElementById('app') || document;
      removeEyebrows(app);
      updateOurModel();
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',apply,{once:true});
  }else{
    apply();
  }

  const app=document.getElementById('app');
  if(app){
    window.PSC_ENHANCEMENTS.createObserver(apply).observe(app,{
      childList:true,
      subtree:true
    });
  }

  window.addEventListener('hashchange',apply);
})();