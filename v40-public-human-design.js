(() => {
  'use strict';

  /*
    V40 motion rule:
    - public site only
    - meaningful section entrance, not every card
    - no portal/admin animations
    - no endless replay on minor DOM updates
  */

  const PUBLIC_SELECTOR = 'main.publicPage, main.publicLanding';
  const SECTIONS = [
    '.homeCommunitySection',
    '.homeEditorialIntro',
    '.homeDetailLedger',
    '.publicClinicalPreview',
    '.homeWorkshopCards',
    '.homePortalTeaser',
    '.publicPageHero',
    '.start16Hero',
    '.start16Send',
    '.model17Hero',
    '.model17Promise',
    '.model17Rhythm',
    '.model17Source',
    '.model17BottomCta',
    '.publicCatalogueJourney16',
    '.publicCatalogueControls',
    '.publicCatalogueResults',
    '.prospectContactGrid',
    '.v3927ContactSection',
    '.workshopGuideDeck',
    '.workshopHero',
    '.publicCta'
  ].join(',');

  const STAGGER_GROUPS = [
    '.homeDetailLedger',
    '.publicClinicalPreviewGrid',
    '.homeWorkshopCardGrid',
    '.model17Rhythm',
    '.publicCategoryGrid16',
    '.prospectContactGrid'
  ].join(',');

  const MEDIA = [
    '.homeCommunityVisual',
    '.model17HeroVisual',
    '.workshop22HeroMedia'
  ].join(',');

  let observer = null;
  const observed = new WeakSet();

  function allowedRoot(){
    const root = document.querySelector(PUBLIC_SELECTOR);
    if(!root) return null;

    // Login is public, but secure portal/admin shells are deliberately excluded.
    const route = String(location.hash || '').replace(/^#\/?/, '');
    if(route.startsWith('portal/') || route.startsWith('admin/')) return null;
    return root;
  }

  function getObserver(){
    if(observer) return observer;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(!entry.isIntersecting) return;
        entry.target.classList.add('v40-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold:.13,
      rootMargin:'0px 0px -6% 0px'
    });
    return observer;
  }

  function revealImmediately(el){
    el.classList.add('v40-visible');
  }

  function observe(el){
    if(!el || observed.has(el)) return;
    observed.add(el);

    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      revealImmediately(el);
      return;
    }

    const rect = el.getBoundingClientRect();
    if(rect.top < window.innerHeight * .88){
      // Avoid a blank flash for content already visible on page load.
      requestAnimationFrame(() => revealImmediately(el));
      return;
    }

    getObserver().observe(el);
  }

  function apply(){
    const root = allowedRoot();
    if(!root) return;

    root.querySelectorAll(SECTIONS).forEach(el => {
      if(el.classList.contains('homeCommunitySection')) return; // keeps its custom slower reveal
      el.classList.add('v40-reveal');
      observe(el);
    });

    root.querySelectorAll(STAGGER_GROUPS).forEach(el => {
      el.classList.add('v40-stagger');
      observe(el);
    });

    root.querySelectorAll(MEDIA).forEach(el => {
      el.classList.add('v40-reveal-media');
      observe(el);
    });
  }

  let queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(() => {
      queued=false;
      apply();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', schedule, {once:true});
  }else{
    schedule();
  }

  const app = document.getElementById('app');
  if(app){
    new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  }

  window.addEventListener('hashchange', () => {
    // Disconnect old page nodes; new page gets one clean entrance.
    if(observer){
      observer.disconnect();
      observer=null;
    }
    schedule();
  });
})();