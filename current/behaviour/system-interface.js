(() => {
  'use strict';

  function rebuildHome(){
    const page=document.querySelector('main.publicLanding');
    if(!page || page.dataset.v44Home==='1') return;

    const oldHero=page.querySelector('.pscInstitutionalHero');
    if(!oldHero) return;

    const hero=document.createElement('section');
    hero.className='m44HomeHero';
    hero.innerHTML=`
      <div class="m44HomeHeroShell">
        <div class="m44HomeHeroCopy m44Reveal">
          <h1><span>Institutional</span><strong>Supply.</strong></h1>
          <p>Healthcare products, equipment and recurring clinic supply — sourced with the specification, commercial detail and accountability an institution needs.</p>
          <div class="m44HeroActions">
            <button class="button primary" data-go="start">Send a requirement</button>
            <button class="button outline" data-go="catalogue">Browse catalogue</button>
          </div>
        </div>

        <div class="m44HomeDesk">
          <div class="m44Requirement m44ObjectReveal" aria-label="Example institutional supply requirement">
            <div class="m44ReqHead">
              <div><b>School clinic requirement</b><small>Opening + recurring supply · 4 lines shown</small></div>
              <div class="m44ReqMark">PS</div>
            </div>
            <div class="m44ReqHeader"><span>#</span><span>Requirement</span><span>Status</span></div>
            <div class="m44ReqLine"><div class="m44ReqNo">01</div><div><b>Blood pressure monitor</b><small>Automatic upper-arm · exact model controlled</small></div><span class="m44ReqStatus">MATCHED</span></div>
            <div class="m44ReqLine"><div class="m44ReqNo">02</div><div><b>Sterile gauze</b><small>10 × 10 cm · 8 ply · sterile pack</small></div><span class="m44ReqStatus">CHECKED</span></div>
            <div class="m44ReqLine"><div class="m44ReqNo">03</div><div><b>Examination gloves</b><small>Nitrile · powder-free · medium</small></div><span class="m44ReqStatus">SOURCED</span></div>
            <div class="m44ReqLine"><div class="m44ReqNo">04</div><div><b>Glucose test strips</b><small>Compatibility confirmed before supply</small></div><span class="m44ReqStatus">READY</span></div>
            <div class="m44ReqFoot"><span>Different requirements behind the scenes</span><b>One Pharma Service quotation</b></div>
          </div>
          <div class="m44HeroNote m44ObjectReveal"><small>Source per line.</small><b>Sell one solution.</b></div>
        </div>
      </div>
    `;
    oldHero.replaceWith(hero);
    page.dataset.v44Home='1';
  }

  function enhanceStart(){
    const page=document.querySelector('main.start16Page');
    if(!page || page.dataset.v44Start==='1') return;
    const board=page.querySelector('.start16RouteBoard');
    if(board && !board.querySelector('.m44StartPaper')){
      const note=document.createElement('div');
      note.className='m44StartPaper';
      note.innerHTML='<b>You do not need to prepare a perfect RFQ.</b> Send the original file, spreadsheet, PDF or rough list and PS will qualify the lines that need clarification.';
      board.insertAdjacentElement('afterend',note);
    }
    page.dataset.v44Start='1';
  }

  function enhanceCatalogue(){
    const page=document.querySelector('main.publicCataloguePage');
    if(!page || page.dataset.v44Catalogue==='1') return;

    const hero=page.querySelector('.catalogue16Hero');
    const controls=page.querySelector('.catalogue16Controls');
    const journey=page.querySelector('.publicCatalogueJourney16');

    // Search comes before browsing categories: purchaser-first.
    if(hero && controls){
      hero.insertAdjacentElement('afterend',controls);
    }
    if(journey){
      const h=journey.querySelector('h2');
      if(h && /Where do you want to start/i.test(h.textContent||'')){
        h.textContent='Browse by clinical need.';
      }
    }
    page.dataset.v44Catalogue='1';
  }

  function enhanceContact(){
    const page=document.querySelector('main.publicPage');
    const form=page?.querySelector('.v37ProspectForm');
    if(!page || !form || page.dataset.v44Contact==='1') return;

    const hero=page.querySelector('.publicPageHero');
    const h1=hero?.querySelector('h1');
    const p=hero?.querySelector('p');
    if(h1) h1.textContent='Let’s get to work.';
    if(p) p.textContent='For a single product, a recurring supply list, capital equipment, clinic setup or a broader RFQ. You can also attach the customer list or RFQ file.';

    page.dataset.v44Contact='1';
  }

  function enhanceLogin(){
    const page=document.querySelector('main.loginPublicPage');
    if(!page || page.dataset.v44Login==='1') return;
    const intro=page.querySelector('.loginIntro');
    if(intro && !intro.querySelector('.m44LoginNote')){
      const n=document.createElement('div');
      n.className='m44StartPaper m44LoginNote';
      n.innerHTML='<b>Built for the purchaser.</b> Search the catalogue, review quotations, follow orders and repeat previously supplied lines from the same account history.';
      const support=intro.querySelector('.loginSupport');
      if(support) support.insertAdjacentElement('beforebegin',n);
      else intro.appendChild(n);
    }
    page.dataset.v44Login='1';
  }

  function markPortal(){
    const shell=document.querySelector('.customerShell');
    if(!shell || shell.dataset.v44Portal==='1') return;
    shell.dataset.v44Portal='1';
  }

  function markAdmin(){
    const shell=document.querySelector('.adminShell');
    if(!shell || shell.dataset.v44Admin==='1') return;
    shell.dataset.v44Admin='1';
  }

  function bindReveal(){
    const root=document.getElementById('app')||document;
    const els=[...root.querySelectorAll('.m44Reveal,.m44ObjectReveal')].filter(el=>!el.dataset.v44RevealBound);
    if(!els.length) return;

    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      els.forEach(el=>{el.classList.add('in');el.dataset.v44RevealBound='1';});
      return;
    }

    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    },{threshold:.12,rootMargin:'0px 0px -5% 0px'});

    els.forEach(el=>{
      el.dataset.v44RevealBound='1';
      const r=el.getBoundingClientRect();
      if(r.top<window.innerHeight*.9) requestAnimationFrame(()=>el.classList.add('in'));
      else io.observe(el);
    });
  }

  function apply(){
    rebuildHome();
    enhanceStart();
    enhanceCatalogue();
    enhanceContact();
    enhanceLogin();
    markPortal();
    markAdmin();
    bindReveal();
  }

  let queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{
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
  if(app) window.PSC_ENHANCEMENTS.createObserver(schedule).observe(app,{childList:true,subtree:true});

  window.addEventListener('hashchange',schedule);
})();

/* =========================================================
   V44.3 — clean clinical icons
   Replace the old collage category art with the existing clean
   /assets/clinical-icons/*.png set. No data / workflow changes.
   ========================================================= */
(() => {
  'use strict';

  const valid = new Set([
    'all','wounds','breathing','vitals','infection','emergency','equipment',
    'diabetes','medicines','allergy','patient-care','procedures','screening','sports'
  ]);

  function routeId(el){
    const route=(el.getAttribute('data-go')||'').split('/').filter(Boolean);
    const id=route[route.length-1]||'';
    return valid.has(id)?id:null;
  }

  function cleanIcon(id){
    const img=document.createElement('img');
    img.src=`/assets/clinical-icons/${id}.png`;
    img.alt='';
    img.setAttribute('aria-hidden','true');
    return img;
  }

  function applyHome(){
    document.querySelectorAll('.publicLanding .publicClinicalCard').forEach(card=>{
      const id=routeId(card);
      if(!id) return;
      const current=card.querySelector('.publicClinicalArt');
      if(current && current.tagName==='IMG'){
        const wanted=`/assets/clinical-icons/${id}.png`;
        if(current.getAttribute('src')!==wanted) current.setAttribute('src',wanted);
        current.removeAttribute('srcset');
        current.removeAttribute('onerror');
      }
    });
  }

  function applyPublicCatalogue(){
    document.querySelectorAll('.publicCategoryCard16').forEach(card=>{
      const id=routeId(card);
      if(!id) return;
      const host=card.querySelector('.publicCategoryArt16');
      if(!host || host.dataset.v443Clean==='1') return;
      host.replaceChildren(cleanIcon(id));
      host.dataset.v443Clean='1';
    });
  }

  function applyPortalCatalogue(){
    document.querySelectorAll('.customerShell .clinicNeedCard').forEach(card=>{
      const id=routeId(card);
      if(!id) return;
      const host=card.querySelector('.clinicNeedIcon');
      if(!host || host.dataset.v443Clean==='1') return;
      host.replaceChildren(cleanIcon(id));
      host.dataset.v443Clean='1';
    });
  }

  function run(){
    applyHome();
    applyPublicCatalogue();
    applyPortalCatalogue();
  }

  let queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{ queued=false; run(); });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',schedule,{once:true});
  }else{
    schedule();
  }

  const app=document.getElementById('app');
  if(app) window.PSC_ENHANCEMENTS.createObserver(schedule).observe(app,{childList:true,subtree:true});
  window.addEventListener('hashchange',schedule);
})();

/* =========================================================
   V44.5 — HOME HERO HOTFIX
   Robust replacement: works whether the original hero or V44 hero
   exists when this script runs. Also removes the old community section.
   ========================================================= */
(() => {
  'use strict';

  const HERO_HTML = `
    <div class="m445HomeHeroScene m44Reveal" aria-label="Pharma Service institutional healthcare supply">
      <div class="m445HomeHeroText">
        <p>Offering open supply,<br>replenishment &amp; replacement of<br>health products to institutions</p>
        <h1>where better community health begins.</h1>
      </div>
    </div>
  `;

  function applyHomeHero(){
    const page = document.querySelector('main.publicLanding');
    if(!page) return;

    // Remove the separate old community-health section completely.
    page.querySelectorAll('.homeCommunitySection').forEach(el => el.remove());

    // If V44's intermediate hero exists, convert it to the final image hero.
    const v44Hero = page.querySelector('.m44HomeHero');
    if(v44Hero){
      if(v44Hero.dataset.v445Hero !== '1'){
        v44Hero.innerHTML = HERO_HTML;
        v44Hero.dataset.v445Hero = '1';
      }
      return;
    }

    // If the original institutional hero is present, replace it directly.
    const originalHero = page.querySelector('.pscInstitutionalHero');
    if(originalHero){
      const replacement = document.createElement('section');
      replacement.className = 'm44HomeHero';
      replacement.dataset.v445Hero = '1';
      replacement.innerHTML = HERO_HTML;
      originalHero.replaceWith(replacement);
    }
  }

  function run(){
    applyHomeHero();
  }

  let queued = false;
  function schedule(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      run();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', schedule, { once:true });
  } else {
    schedule();
  }

  const app = document.getElementById('app');
  if(app){
    window.PSC_ENHANCEMENTS.createObserver(schedule).observe(app, { childList:true, subtree:true });
  }
  window.addEventListener('hashchange', schedule);
})();


/* =========================================================
   V44.6 — VITALS ICON HARD FIX
   Uses a clean waveform/monitor SVG instead of the oversized
   category-vitals illustration.
   ========================================================= */
(() => {
  'use strict';

  const vitalsSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
      <rect x="8" y="11" width="48" height="42" rx="9" stroke="#151817" stroke-width="3.2"/>
      <path d="M13 33h10l5-11 8 22 6-13h9" stroke="#151817" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="18" cy="18" r="2.2" fill="#159b91"/>
      <circle cx="25" cy="18" r="2.2" fill="#159b91"/>
    </svg>
  `;
  const vitalsData = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(vitalsSvg);

  function fixImg(img){
    if(!img) return;
    if(img.getAttribute('src') !== vitalsData){
      img.setAttribute('src', vitalsData);
      img.removeAttribute('srcset');
      img.removeAttribute('onerror');
    }
  }

  function apply(){
    // Home card.
    document.querySelectorAll('.publicClinicalCard[data-go="catalogue/vitals"] .publicClinicalArt')
      .forEach(fixImg);

    // Public catalogue card.
    document.querySelectorAll('.publicCategoryCard16[data-go="catalogue/vitals"] .publicCategoryArt16 img')
      .forEach(fixImg);

    // Portal clinical category.
    document.querySelectorAll('.customerShell .clinicNeedCard[data-go$="/vitals"] .clinicNeedIcon img')
      .forEach(fixImg);
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
  } else {
    schedule();
  }

  const app=document.getElementById('app');
  if(app){
    window.PSC_ENHANCEMENTS.createObserver(schedule).observe(app,{childList:true,subtree:true});
  }
  window.addEventListener('hashchange', schedule);
})();


/* V44.7 — keep the supplied-reference vitals icon persistent after rerenders. */
(() => {
  'use strict';
  const src = '/assets/clinical-icons/vitals-reference.svg';

  function apply(){
    document.querySelectorAll('.publicClinicalCard[data-go="catalogue/vitals"] .publicClinicalArt').forEach(img => {
      if(img.tagName === 'IMG'){
        img.src = src;
        img.removeAttribute('srcset');
        img.removeAttribute('onerror');
      }
    });
    document.querySelectorAll('.publicCategoryCard16[data-go="catalogue/vitals"] .publicCategoryArt16 img').forEach(img => {
      img.src = src;
      img.removeAttribute('srcset');
      img.removeAttribute('onerror');
    });
    document.querySelectorAll('.customerShell .clinicNeedCard[data-go$="/vitals"] .clinicNeedIcon img').forEach(img => {
      img.src = src;
      img.removeAttribute('srcset');
      img.removeAttribute('onerror');
    });
  }

  let queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{ queued=false; apply(); });
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',schedule,{once:true});
  } else schedule();
  const app=document.getElementById('app');
  if(app) window.PSC_ENHANCEMENTS.createObserver(schedule).observe(app,{childList:true,subtree:true});
  window.addEventListener('hashchange',schedule);
})();
