(() => {
  'use strict';

  const MODULES = [
    {n:'01', slug:'product-basics', title:'Product Basics', tone:'wsTone1', icon:'products',
      short:'Understand the product before you order it.',
      intro:'Understand what the product actually is, which details matter and what else may be required around it.',
      meta:'Product selection · Clinic supply'},
    {n:'02', slug:'whats-the-difference', title:"What's the Difference?", tone:'wsTone2', icon:'repeat',
      short:'Understand what looks similar but is not necessarily interchangeable.',
      intro:'Clear comparisons for products that appear similar but should not automatically be treated as interchangeable.',
      meta:'Product comparison · Specifications'},
    {n:'03', slug:'clinic-checks', title:'Clinic Checks', tone:'wsTone3', icon:'checklist',
      short:'Quick practical checks staff can perform in their own clinic.',
      intro:'Short checks that take the reader out of the screen and into the actual clinic.',
      meta:'Practical checks · Clinic readiness'},
    {n:'04', slug:'equipment-readiness', title:'Equipment Readiness', tone:'wsTone4', icon:'assets',
      short:'Make sure the complete equipment system — not just the main device — is ready.',
      intro:'Owning the main device does not mean the system is ready. Check the accessories, consumables, compatibility and replacement requirements around it.',
      meta:'Equipment systems · Readiness'},
    {n:'05', slug:'stock-expiry', title:'Stock & Expiry', tone:'wsTone5', icon:'inventory',
      short:'Know what to use first, what needs attention and what should actually be reordered.',
      intro:'Understand what is on hand, what needs attention and what should actually be reordered.',
      meta:'Stock control · Expiry'},
    {n:'06', slug:'school-clinic', title:'School Clinic', tone:'wsTone6', icon:'home',
      short:'Practical guidance for the realities of operating healthcare inside a school.',
      intro:'Practical supply guidance built around the specific operational realities of school clinics.',
      meta:'School health · Clinic operations'},
    {n:'07', slug:'ordering-specifications', title:'Ordering & Specifications', tone:'wsTone7', icon:'edit',
      short:'Turn vague requests into controlled, sourceable product specifications.',
      intro:'Turn vague product requests into specifications suppliers can actually quote correctly.',
      meta:'RFQs · Product specifications'}
  ];

  const MODULE_BY_SLUG = new Map(MODULES.map(m => [m.slug, m]));
  const MODULE_BY_TITLE = new Map(MODULES.map(m => [m.title, m]));
  const CROSS_LINKS = {
    'school-clinic':['ten-minute-school-clinic-stock-expiry-walk'],
    'equipment-readiness':['aed-has-expiring-parts-too']
  };

  const iconSvg = {
    products:'<svg viewBox="0 0 24 24"><path d="M12 3 7 5.5 12 8l5-2.5Z"/><path d="M7 5.5V11l5 2.5V8"/><path d="M17 5.5V11l-5 2.5"/><path d="M5 12.5 2.5 14 5 15.5 7.5 14Z"/><path d="M5 15.5V20l2.5-1.5V14"/><path d="M19 12.5 16.5 14 19 15.5 21.5 14Z"/><path d="M19 15.5V20l2.5-1.5V14"/></svg>',
    repeat:'<svg viewBox="0 0 24 24"><path d="M17 7H7a4 4 0 0 0-4 4"/><path d="m17 7-2.5-2.5"/><path d="M17 7l-2.5 2.5"/><path d="M7 17h10a4 4 0 0 0 4-4"/><path d="m7 17 2.5 2.5"/><path d="M7 17l2.5-2.5"/></svg>',
    checklist:'<svg viewBox="0 0 24 24"><path d="m4 6 1.8 1.8L8.8 4.8"/><path d="M11 6h9"/><path d="m4 12 1.8 1.8 3-3"/><path d="M11 12h9"/><circle cx="5.8" cy="18" r="1.6"/><path d="M11 18h9"/></svg>',
    assets:'<svg viewBox="0 0 24 24"><path d="M12 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7"/><path d="M14 4h5v5"/><path d="m10 14 7.5-7.5a1.8 1.8 0 1 1 2.5 2.5L12.5 16.5 9 17z"/></svg>',
    inventory:'<svg viewBox="0 0 24 24"><path d="M12 3 7 5.5 12 8l5-2.5Z"/><path d="M7 5.5V11l5 2.5V8"/><path d="M17 5.5V11l-5 2.5"/><path d="M5 12.5 2.5 14 5 15.5 7.5 14Z"/><path d="M5 15.5V20l2.5-1.5V14"/><path d="M19 12.5 16.5 14 19 15.5 21.5 14Z"/><path d="M19 15.5V20l2.5-1.5V14"/></svg>',
    home:'<svg viewBox="0 0 24 24"><path d="M4 10.5 12 4l8 6.5"/><path d="M6.5 9.5V20h4.5v-5h2v5h4.5V9.5"/></svg>',
    edit:'<svg viewBox="0 0 24 24"><path d="M12 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7"/><path d="M14 4h5v5"/><path d="m10 14 7.5-7.5a1.8 1.8 0 1 1 2.5 2.5L12.5 16.5 9 17z"/></svg>'
  };

  function esc(v=''){
    return String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[c]));
  }

  function guides(){
    return Array.isArray(window.PSC_WORKSHOP) ? window.PSC_WORKSHOP.filter(g=>g && g.status==='published') : [];
  }

  function productBySku(sku){
    return (window.PSC_DATA?.products||[]).find(p=>String(p.pscSku||'')===String(sku||'')) || null;
  }

  function manualSkuIds(g){
    return [...new Set([...(g?.related_product_ids||[]), ...(g?.related_skus||[])].filter(Boolean).map(String))];
  }

  function enrichWorkshopSearch(){
    guides().forEach(g=>{
      const productTerms = manualSkuIds(g).flatMap(sku=>{
        const p=productBySku(sku);
        return p ? [sku,p.name,p.catalogueDisplayName,p.brand,p.cataloguePack,p.pack] : [sku];
      }).filter(Boolean);
      g.tags = [...new Set([...(g.tags||[]), ...(g.product_match_terms||[]), ...(g.clinic_check_topics||[]), ...productTerms])];
    });
  }

  function moduleGuides(m){
    const primary = guides().filter(g=>g.category===m.title);
    const cross = (CROSS_LINKS[m.slug]||[]).map(slug=>guides().find(g=>g.slug===slug)).filter(Boolean);
    return [...primary, ...cross.filter(g=>!primary.some(p=>p.slug===g.slug))];
  }

  function routeTo(target){
    if(target==='workshop') return '/workshop';
    if(target.startsWith('workshop/')) return `/workshop/${encodeURIComponent(target.slice('workshop/'.length))}`;
    return `/#${target}`;
  }

  function navigate(target){
    location.href = routeTo(target);
  }

  function shortTitle(m){
    return ({
      'Product Basics':'Basics',
      "What's the Difference?":'Differences',
      'Clinic Checks':'Checks',
      'Equipment Readiness':'Equipment',
      'Stock & Expiry':'Stock',
      'School Clinic':'School',
      'Ordering & Specifications':'Ordering'
    })[m.title] || m.title;
  }

  function moduleNav(active=''){
    const nav=document.createElement('nav');
    nav.className='workshopModuleNavV45';
    nav.setAttribute('aria-label','Workshop modules');
    nav.innerHTML=MODULES.map(m=>`<button class="${m.slug===active?'active':''}" data-v45-go="workshop/${m.slug}"><span>${m.n}</span>${esc(shortTitle(m))}</button>`).join('');
    return nav;
  }

  function guideCard(g){
    const m=MODULE_BY_TITLE.get(g.category)||MODULES[0];
    const article=document.createElement('article');
    article.className=`workshopGuideCard ${m.tone} workshopGuideCardV45`;
    article.innerHTML=`
      <button data-v45-go="workshop/${esc(g.slug)}" aria-label="Open ${esc(g.title)}">
        <span class="workshopGuideCardCopy">
          <span class="workshopGuideCardMeta"><b>${esc(g.category)}</b><small>${esc(g.read_time||'4 min')} read</small></span>
          <h3>${esc(g.title)}</h3>
          <p>${esc(g.excerpt||g.subtitle||'')}</p>
        </span>
        <span class="workshopGuideCardVisual" aria-hidden="true"><i>${iconSvg[m.icon]||''}</i></span>
      </button>`;
    return article;
  }

  function renderModulePage(m){
    const main=document.querySelector('main.workshopPage');
    if(!main || main.dataset.v45Module===m.slug) return;

    const header=main.querySelector(':scope > header');
    const footer=main.querySelector(':scope > footer');
    [...main.children].forEach(el=>{
      if(el!==header && el!==footer) el.remove();
    });

    const wrap=document.createElement('div');
    wrap.className=`workshopModuleBodyV45 ${m.tone}`;
    const list=moduleGuides(m);
    wrap.innerHTML=`
      <section class="workshopModuleHeroV45">
        <div class="workshopModuleHeroCopyV45">
          <button class="workshopModuleBackV45" data-v45-go="workshop">THE WORKSHOP · MODULE ${m.n}</button>
          <h1>${esc(m.title)}</h1>
          <h2>${esc(m.short)}</h2>
          <p>${esc(m.intro)}</p>
          <div class="workshopModuleMetaV45">${list.length} ${list.length===1?'guide':'guides'} · ${esc(m.meta)}</div>
        </div>
        <div class="workshopModuleHeroIconV45" aria-hidden="true">${iconSvg[m.icon]||''}</div>
      </section>
      <div data-v45-module-nav></div>
      <section class="workshopModuleGuidesV45">
        <div class="workshopModuleGuidesHeadV45">
          <h2>Guides in this Module</h2>
          <p>Practical, short and designed to change an action in the clinic.</p>
        </div>
        <div class="workshopModuleGuideGridV45"></div>
      </section>`;

    (footer||null) ? main.insertBefore(wrap,footer) : main.appendChild(wrap);
    wrap.querySelector('[data-v45-module-nav]').replaceWith(moduleNav(m.slug));
    const grid=wrap.querySelector('.workshopModuleGuideGridV45');
    list.forEach(g=>grid.appendChild(guideCard(g)));
    main.dataset.v45Module=m.slug;
    main.classList.add('workshopModulePageV45');
    document.title=`${m.title} | The Workshop | Pharma Service`;
  }

  function patchWorkshopHub(){
    const main=document.querySelector('main.workshopPage:not(.workshopArticlePage)');
    if(!main || location.pathname!=='/workshop') return;

    const section=main.querySelector('.workshopCategorySection');
    if(section && !section.dataset.v45Modules){
      const head=section.querySelector('.workshopCategoryHead');
      if(head){
        head.innerHTML='<div><h2>Explore the Workshop by Module</h2><p>Start with what you need to figure out. Each Module groups practical guides around a real clinic task.</p></div>';
      }
      const grid=section.querySelector('.workshopCategoryGrid');
      if(grid){
        grid.innerHTML='';
        MODULES.forEach(m=>{
          const count=moduleGuides(m).length;
          const b=document.createElement('button');
          b.className=`workshopCategoryCard ${m.tone} workshopModuleCardV45`;
          b.setAttribute('data-v45-go',`workshop/${m.slug}`);
          b.innerHTML=`
            <span class="workshopModuleNumberV45">MODULE ${m.n}</span>
            <span class="workshopCategoryVisual" aria-hidden="true">${iconSvg[m.icon]||''}</span>
            <span class="workshopCategoryCopy"><b>${esc(m.title)}</b><small>${esc(m.short)}</small></span>
            <i>${count} ${count===1?'guide':'guides'} · Open module →</i>`;
          grid.appendChild(b);
        });
      }
      section.dataset.v45Modules='1';
    }

    if(!main.querySelector('.workshopModuleNavV45')){
      const hero=main.querySelector('.workshopHero');
      if(hero) hero.insertAdjacentElement('afterend',moduleNav(''));
    }

    const principle=main.querySelector('.workshopPrinciple p');
    if(principle) principle.textContent='The Workshop is there to make specifications, compatibility, readiness and replenishment easier to understand before the next order, not to turn education into a sales pitch.';

    const deck=main.querySelector('.workshopGuideDeck');
    const query=main.querySelector('[data-workshop-q]')?.value?.trim()||'';
    if(deck && !query){
      const cards=[...deck.querySelectorAll('.workshopGuideCard')];
      cards.forEach((card,i)=>{ card.hidden=i>=6; });
    }
  }

  function patchGuidePage(){
    const main=document.querySelector('main.workshopArticlePage');
    if(!main) return;
    const slug=location.pathname.split('/').filter(Boolean)[1]||'';
    const g=guides().find(x=>x.slug===slug);
    if(!g) return;
    const m=MODULE_BY_TITLE.get(g.category);
    if(!m) return;

    const top=main.querySelector('.workshopArticleTopline');
    if(top && !top.dataset.v45Breadcrumb){
      top.innerHTML=`
        <button data-v45-go="workshop">THE WORKSHOP</button><i></i>
        <button data-v45-go="workshop/${m.slug}">MODULE ${m.n} · ${esc(m.title)}</button>
        <b>${esc(g.format||'GUIDE')}</b>`;
      top.dataset.v45Breadcrumb='1';
    }

    const articleHeader=main.querySelector('.workshopArticleHeader');
    if(articleHeader && !main.querySelector('.workshopModuleNavV45')){
      articleHeader.insertAdjacentElement('afterend',moduleNav(m.slug));
    }

    if(g.format==='CHECK THIS' && !main.querySelector('.workshopDoNowV45')){
      const body=main.querySelector('.workshopArticleBody');
      if(body) body.insertAdjacentHTML('beforebegin','<div class="workshopDoNowV45">DO THIS NOW</div>');
    }

    if(m.slug==='equipment-readiness' && !main.querySelector('.workshopReadinessChainV45')){
      const body=main.querySelector('.workshopArticleBody');
      if(body) body.insertAdjacentHTML('beforebegin',`
        <section class="workshopReadinessChainV45">
          <span>THE READINESS CHAIN</span>
          <div><b>Equipment</b><i>↓</i><b>Accessory</b><i>↓</i><b>Consumable</b><i>↓</i><b>Replacement / expiry</b><i>↓</i><b>Record</b></div>
        </section>`);
    }

    const related=main.querySelector('.workshopRelated');
    if(related){
      const ids=new Set(manualSkuIds(g));
      [...related.querySelectorAll('.workshopRelatedList > button')].forEach(btn=>{
        const sku=(btn.querySelector('span')?.textContent||'').trim();
        if(!ids.has(sku)) btn.remove();
        else {
          const product=productBySku(sku);
          const need=(product?.clinicalNeeds||[])[0] || 'all';
          btn.removeAttribute('data-go');
          btn.setAttribute('data-v45-go',`portal/catalogue/${need}`);
        }
      });
      const remaining=related.querySelectorAll('.workshopRelatedList > button').length;
      if(!remaining) related.remove();
      else {
        const label=related.querySelector('.workshopRelatedHead span');
        const copy=related.querySelector('.workshopRelatedHead p');
        if(label) label.textContent='PRODUCTS USED IN THIS GUIDE';
        if(copy) copy.textContent='Only catalogue lines deliberately linked to this guide are shown here.';
      }
    }

    const sig=main.querySelector('.workshopSignature');
    if(sig && !sig.dataset.v45Standardized){
      const blocks=[...sig.querySelectorAll('article')];
      const labels=['WHAT GOOD LOOKS LIKE','CHECK IT NOW','WHEN ORDERING'];
      blocks.forEach((b,i)=>{ const s=b.querySelector('span'); if(s && labels[i]) s.textContent=labels[i]; });
      if(g.next_action){
        const a=document.createElement('article');
        a.innerHTML=`<span>NEXT ACTION</span><p>${esc(g.next_action)}</p>`;
        sig.appendChild(a);
      }
      sig.dataset.v45Standardized='1';
    }
  }

  function patchCatalogueGate(){
    const route=(location.hash||'').replace(/^#/,'');
    if(route.startsWith('catalogue/') && route!=='catalogue'){
      const id=route.split('/')[1]||'all';
      try{ sessionStorage.setItem('pscPendingRoute',`portal/catalogue/${id}`); }catch{}
      location.hash=`portal/catalogue/${id}`;
      return;
    }

    if(route!=='catalogue') return;
    const main=document.querySelector('main.publicCataloguePage');
    if(!main || main.dataset.v45Gate==='1') return;

    main.querySelectorAll('.publicCatalogueControls,.publicCatalogueResults,.publicCta').forEach(el=>el.remove());

    const hero=main.querySelector('.cataloguePublicHero');
    if(hero){
      const h1=hero.querySelector('h1');
      const p=hero.querySelector('p');
      if(h1) h1.textContent='Find the clinical area.';
      if(p) p.textContent='Browse what Pharma Service covers publicly. Exact products, brands, packs, availability and account-specific commercial detail sit inside the Clinic Portal.';
      hero.querySelectorAll('.kicker,.eyebrow').forEach(x=>x.remove());
    }

    const journey=main.querySelector('.publicCatalogueJourney16');
    if(journey){
      const head=journey.querySelector('.publicCatalogueJourneyHead16');
      if(head) head.innerHTML='<div><h2>Browse by clinical need.</h2><p>Select a category to continue into the institutional catalogue.</p></div><span class="catalogueGateNoteV45">Clinic Portal access required</span>';
      journey.querySelectorAll('[data-go^="catalogue/"]').forEach(btn=>{
        const id=(btn.getAttribute('data-go')||'').split('/')[1]||'all';
        const clone=btn.cloneNode(true);
        clone.removeAttribute('data-go');
        clone.setAttribute('data-v45-gated-category',id);
        btn.replaceWith(clone);
      });
    }

    if(journey && !main.querySelector('.catalogueGateBandV45')){
      const band=document.createElement('section');
      band.className='catalogueGateBandV45';
      band.innerHTML=`
        <div><h2>See the real catalogue inside your account.</h2><p>Product families, approved options, specifications, quotation requests and account history stay within the secure customer relationship.</p></div>
        <div class="catalogueGateActionsV45"><button class="button primary large" data-v45-go="login">Open Clinic Portal</button><button class="button outline large" data-v45-go="start">Send a requirement</button></div>`;
      journey.insertAdjacentElement('afterend',band);
    }
    main.dataset.v45Gate='1';
  }

  function patchHomeCategoryGate(){
    document.querySelectorAll('main.publicLanding [data-go^="catalogue/"]').forEach(btn=>{
      if(btn.dataset.v45GateBound) return;
      const id=(btn.dataset.go||'').split('/')[1]||'all';
      const clone=btn.cloneNode(true);
      clone.removeAttribute('data-go');
      clone.dataset.v45GatedCategory=id;
      btn.replaceWith(clone);
    });
  }

  function patchLoginForPendingCatalogue(){
    const pending=(()=>{try{return sessionStorage.getItem('pscPendingRoute')||''}catch{return ''}})();
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
    const route=(location.hash||'').replace(/^#/,'');
    if(route!=='portal/dashboard') return;
    let pending='';
    try{ pending=sessionStorage.getItem('pscPendingRoute')||''; }catch{}
    if(!pending.startsWith('portal/')) return;
    try{ sessionStorage.removeItem('pscPendingRoute'); }catch{}
    location.hash=pending;
  }

  function apply(){
    enrichWorkshopSearch();
    const path=location.pathname.replace(/\/+$/,'');
    if(path==='/workshop') patchWorkshopHub();
    else if(path.startsWith('/workshop/')){
      const slug=decodeURIComponent(path.split('/')[2]||'');
      const m=MODULE_BY_SLUG.get(slug);
      if(m) renderModulePage(m);
      else patchGuidePage();
    }
    patchCatalogueGate();
    patchHomeCategoryGate();
    patchLoginForPendingCatalogue();
  }

  document.addEventListener('click',e=>{
    const gate=e.target.closest('[data-v45-gated-category]');
    if(gate){
      e.preventDefault(); e.stopImmediatePropagation();
      const id=gate.dataset.v45GatedCategory||'all';
      try{ sessionStorage.setItem('pscPendingRoute',`portal/catalogue/${id}`); }catch{}
      navigate(`portal/catalogue/${id}`);
      return;
    }
    const go=e.target.closest('[data-v45-go]');
    if(go){
      e.preventDefault(); e.stopImmediatePropagation();
      navigate(go.dataset.v45Go);
    }
  },true);

  window.addEventListener('hashchange',()=>{ setTimeout(()=>{resumePendingAfterLogin();apply();},0); });
  window.addEventListener('popstate',()=>setTimeout(apply,0));

  let queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{ queued=false; apply(); });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();

  const root=document.getElementById('app')||document.body;
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  [250,800,1600].forEach(ms=>setTimeout(schedule,ms));
})();