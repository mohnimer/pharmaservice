(() => {
  'use strict';

  const CONTACT_COPY = 'For a single product, a recurring supply list, capital equipment, clinic setup or a broader RFQ. You can also attach the customer list or RFQ file.';

  function route(){
    return String(location.hash || '').replace(/^#/, '').replace(/^\//, '');
  }

  function fixContact(){
    if(route() !== 'contact') return;
    const page = document.querySelector('main.publicPage');
    if(!page) return;

    const hero = page.querySelector('.publicPageHero');
    const title = hero?.querySelector('h1');
    const lead = hero?.querySelector('p');
    if(title) title.textContent = "Let's get to work.";
    if(lead) lead.textContent = CONTACT_COPY;

    // V39.26 intentionally removed this duplicate intro. Keep it removed.
    page.querySelector('.prospectSection .prospectIntro')?.remove();

    const section = page.querySelector('.prospectSection');
    if(section) section.classList.add('v3927ContactSection');

    const form = page.querySelector('.v37ProspectForm');
    if(form) form.classList.add('v3927ContactForm');
  }

  let queued = false;
  function schedule(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fixContact();
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, {once:true});
  else schedule();

  const app = document.getElementById('app');
  if(app) new MutationObserver(schedule).observe(app, {childList:true, subtree:true});
  window.addEventListener('hashchange', schedule);
})();
