(() => {
  'use strict';

  /*
    V41 uses different motion depending on the type of content.
    This is intentionally PUBLIC-SITE ONLY.
    It never decorates portal/* or admin/*.
  */

  const publicRoot = () => {
    const route = String(location.hash || '').replace(/^#\/?/, '');
    if(route.startsWith('portal/') || route.startsWith('admin/')) return null;
    return document.querySelector('main.publicPage, main.publicLanding');
  };

  const COPY = [
    '.publicPageHero',
    '.homeEditorialLead',
    '.homeEditorialCopy',
    '.publicClinicalPreviewHead',
    '.homeWorkshopIntro',
    '.homePortalTeaser>div',
    '.model17HeroCopy',
    '.model17Promise',
    '.model17SourceIntro',
    '.start16HeroCopy',
    '.start16SendIntro',
    '.workshopGuideDeckIntro'
  ].join(',');

  const MEDIA = [
    '.homeCommunitySection',
    '.model17HeroVisual',
    '.workshop22HeroMedia'
  ].join(',');

  const LEDGER = [
    '.homeDetailLedger',
    '.publicClinicalPreviewGrid',
    '.homeWorkshopCardGrid',
    '.model17Rhythm',
    '.model17SupplyFlow',
    '.start16RouteBoard',
    '.prospectContactGrid',
    '.workshopGuideDeckScroll'
  ].join(',');

  let io = null;
  const seen = new WeakSet();

  function observer(){
    if(io) return io;
    io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(!entry.isIntersecting) return;
        entry.target.classList.add('v41-in');
        io.unobserve(entry.target);
      });
    }, {threshold:.14, rootMargin:'0px 0px -7% 0px'});
    return io;
  }

  function attach(el){
    if(!el || seen.has(el)) return;
    seen.add(el);

    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      el.classList.add('v41-in');
      return;
    }

    const rect = el.getBoundingClientRect();
    if(rect.top < window.innerHeight * .88){
      requestAnimationFrame(() => el.classList.add('v41-in'));
    }else{
      observer().observe(el);
    }
  }

  function apply(){
    const root = publicRoot();
    if(!root) return;

    root.querySelectorAll(COPY).forEach(el => {
      if(el.classList.contains('homeCommunitySection')) return;
      el.classList.add('v41-copy');
      attach(el);
    });

    root.querySelectorAll(MEDIA).forEach(el => {
      // homeCommunitySection already owns its custom slow background reveal.
      if(el.classList.contains('homeCommunitySection')) return;
      el.classList.add('v41-media');
      attach(el);
    });

    root.querySelectorAll(LEDGER).forEach(el => {
      el.classList.add('v41-ledger');
      attach(el);
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

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',schedule,{once:true});
  }else{
    schedule();
  }

  const app=document.getElementById('app');
  if(app){
    new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  }

  window.addEventListener('hashchange',() => {
    if(io){io.disconnect();io=null;}
    schedule();
  });
})();