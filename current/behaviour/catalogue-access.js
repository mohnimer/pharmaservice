(() => {
  'use strict';

  /* PS V50
     Workshop rendering is now native in app.js. This current module provides the public-catalogue access gate and product-card polish hooks.
     No Workshop DOM mutation, no Workshop history shim, no competing router. */

  const BUILD='50.0';
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[c]));
  const routeHash=()=>window.PSC_CURRENT_ROUTE();

  function softGo(route,options){
    window.PSC_NAVIGATE(route,options);
  }

  function patchCatalogueGate(){
    const route=routeHash();
    if(route.startsWith('catalogue/') && route!=='catalogue'){
      const id=route.split('/')[1]||'all';
      try{sessionStorage.setItem('pscPendingRoute',`portal/catalogue/${id}`);}catch{}
      softGo(`portal/catalogue/${id}`,{replace:true});
      return;
    }
    if(route!=='catalogue') return;

    const main=document.querySelector('main.publicCataloguePage');
    if(!main || main.dataset.v50Gate==='1') return;
    main.querySelectorAll('.publicCatalogueControls,.publicCatalogueResults,.publicCta').forEach(el=>el.remove());

    const hero=main.querySelector('.cataloguePublicHero');
    if(hero){
      const h1=hero.querySelector('h1'),p=hero.querySelector('p');
      if(h1) h1.textContent='Find the clinical area.';
      if(p) p.textContent='Browse what Pharma Service covers publicly. Exact products, brands, packs, availability and account-specific commercial detail sit inside the Clinic Portal.';
      hero.querySelectorAll('.kicker,.eyebrow').forEach(x=>x.remove());
    }

    const journey=main.querySelector('.publicCatalogueJourney16');
    if(journey){
      const head=journey.querySelector('.publicCatalogueJourneyHead16');
      if(head) head.innerHTML='<div><h2>Browse by clinical need.</h2><p>Select a category to continue into the institutional catalogue.</p></div><span class="catalogueGateNoteV45">Clinic Portal access required</span>';
      journey.querySelectorAll('[data-go^="catalogue/"],[data-v45-gated-category],[data-v49-gated-category]').forEach(btn=>{
        const id=btn.dataset.v45GatedCategory||btn.dataset.v49GatedCategory||(btn.getAttribute('data-go')||'').split('/')[1]||'all';
        btn.removeAttribute('data-go');btn.removeAttribute('data-v45-gated-category');btn.removeAttribute('data-v49-gated-category');
        btn.dataset.v50GatedCategory=id;
      });
      if(!main.querySelector('.catalogueGateBandV45')){
        const band=document.createElement('section');
        band.className='catalogueGateBandV45';
        band.innerHTML=`
          <div><h2>See the real catalogue inside your account.</h2><p>Product families, approved options, specifications, quotation requests and account history stay within the secure customer relationship.</p></div>
          <div class="catalogueGateActionsV45"><button class="button primary large" data-v50-go="login">Open Clinic Portal</button><button class="button outline large" data-v50-go="start">Send a requirement</button></div>`;
        journey.insertAdjacentElement('afterend',band);
      }
    }
    main.dataset.v50Gate='1';
  }

  function patchHomeCategoryGate(){
    document.querySelectorAll('main.publicLanding [data-go^="catalogue/"],main.publicLanding [data-v45-gated-category],main.publicLanding [data-v49-gated-category]').forEach(btn=>{
      const id=btn.dataset.v45GatedCategory||btn.dataset.v49GatedCategory||(btn.dataset.go||'').split('/')[1]||'all';
      btn.removeAttribute('data-go');btn.removeAttribute('data-v45-gated-category');btn.removeAttribute('data-v49-gated-category');
      btn.dataset.v50GatedCategory=id;
    });
  }

  function patchLoginForPendingCatalogue(){
    let pending='';
    try{pending=sessionStorage.getItem('pscPendingRoute')||'';}catch{}
    if(!pending.startsWith('portal/catalogue/')) return;
    const page=document.querySelector('main.loginPublicPage');
    const card=page?.querySelector('.loginCard');
    if(!card || page.querySelector('.cataloguePendingNoteV45')) return;
    const id=pending.split('/')[2]||'all';
    const note=document.createElement('div');
    note.className='cataloguePendingNoteV45';
    note.innerHTML=`<b>Catalogue access</b><span>Sign in to continue to ${esc(id==='all'?'the institutional catalogue':id.replace(/-/g,' '))}.</span>`;
    card.prepend(note);
  }

  function resumePendingAfterLogin(){
    if(routeHash()!=='portal/dashboard') return;
    let pending='';
    try{pending=sessionStorage.getItem('pscPendingRoute')||'';}catch{}
    if(!pending.startsWith('portal/')) return;
    try{sessionStorage.removeItem('pscPendingRoute');}catch{}
    softGo(pending);
  }

  function apply(){
    document.documentElement.dataset.pscBuild='50';
    patchCatalogueGate();
    patchHomeCategoryGate();
    patchLoginForPendingCatalogue();
  }

  document.addEventListener('click',e=>{
    const gate=e.target.closest('[data-v50-gated-category]');
    if(gate){
      e.preventDefault();e.stopImmediatePropagation();
      const id=gate.dataset.v50GatedCategory||'all';
      try{sessionStorage.setItem('pscPendingRoute',`portal/catalogue/${id}`);}catch{}
      softGo(`portal/catalogue/${id}`);
      return;
    }
    const own=e.target.closest('[data-v50-go]');
    if(own){
      e.preventDefault();e.stopImmediatePropagation();
      softGo(own.dataset.v50Go||'home');
    }
  },true);

  window.addEventListener('hashchange',()=>setTimeout(()=>{resumePendingAfterLogin();apply();},0));
  window.addEventListener('popstate',()=>setTimeout(()=>{resumePendingAfterLogin();apply();},0));
  window.addEventListener('pageshow',()=>setTimeout(apply,0));

  let queued=false;
  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;apply();});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
  const root=document.getElementById('app')||document.body;
  window.PSC_ENHANCEMENTS.createObserver(schedule).observe(root,{childList:true,subtree:true});
  [120,500].forEach(ms=>setTimeout(schedule,ms));
})();
