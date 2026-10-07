(() => {
  'use strict';

  const VITALS_ICON='/assets/clinical-icons/vitals-reference.svg';
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[c]));

  function homeHero(){
    const page=document.querySelector('main.publicLanding');
    if(!page) return;
    const scene=page.querySelector('.m445HomeHeroScene')||page.querySelector('.m44HomeHero');
    if(!scene||scene.dataset.v452Hero==='1') return;
    let host=scene.querySelector('.m445HomeHeroText');
    if(!host){ host=document.createElement('div');host.className='m445HomeHeroText';scene.prepend(host); }
    host.innerHTML=`
      <h1>Healthcare procurement<br>that gets smarter<br>over time.</h1>
      <p class="v452HeroLead">Stay compliant. Buy better. Replenish easier.</p>
      <p class="v452HeroBody">Pharma Service combines institutional healthcare supply with the intelligence behind it — requirements, specifications, pricing, purchasing history and replenishment — all through one accountable supply partner.</p>
      <div class="v452HeroActions"><button class="button primary" data-go="catalogue">Explore the Catalogue</button><button class="button outline" data-go="login">Open Clinic Portal</button></div>`;
    scene.dataset.v452Hero='1';
  }

  function homeIntelligence(){
    const page=document.querySelector('main.publicLanding');
    const category=page?.querySelector('.publicClinicalPreview');
    if(!page||!category) return;
    page.querySelector('.homeEditorialIntro')?.remove();
    page.querySelector('.homeDetailLedger')?.remove();
    if(!page.querySelector('.v452Intelligence')){
      const section=document.createElement('section');
      section.className='v452Intelligence';
      section.innerHTML=`
        <div class="v452IntelligenceHead">
          <h2>More than supply.<br><strong>A smarter way to procure.</strong></h2>
          <p>Every purchase creates information: what your institution requires, what you buy, what you pay, how often you need it and what needs attention next.</p>
          <p>PS turns that information into a simpler procurement system.</p>
        </div>
        <div class="v452IntelligenceGrid">
          <article><span>01</span><h3>Know what you need</h3><p>Requirements mapped against applicable standards, specifications checked and knowledgeable human support when something isn't clear.</p></article>
          <article><span>02</span><h3>Know you're buying well</h3><p>Wholesale pricing, relevant institutional promotions and better commercial options on the products your organisation buys most.</p></article>
          <article><span>03</span><h3>Know what's coming next</h3><p>Purchase history, replenishment patterns, expiry and replacement visibility — so repeat purchasing becomes faster and more predictable.</p></article>
        </div>`;
      category.insertAdjacentElement('beforebegin',section);
    }
    if(!page.querySelector('.v452SourceStrip')){
      const strip=document.createElement('section');
      strip.className='v452SourceStrip';
      strip.innerHTML=`<div><h2>We handle the sourcing underneath it all.</h2><p>You don't need to manage a different supplier for every category.</p><p>PS sources across suitable specialist suppliers while remaining your single commercial point of contact.</p></div><strong>One relationship. Multiple sources. One procurement experience.</strong>`;
      category.insertAdjacentElement('beforebegin',strip);
    }
  }

  function homeCategoryCopy(){
    const section=document.querySelector('main.publicLanding .publicClinicalPreview');
    if(!section) return;
    const head=section.querySelector('.publicClinicalPreviewHead');
    head?.querySelector('.kicker')?.remove();
    const h2=head?.querySelector('h2'); if(h2) h2.textContent='Start with what your institution needs.';
    const p=head?.querySelector('p'); if(p) p.textContent="You don't need to know our catalogue or which supplier carries what. Start with the requirement, product or problem in front of you. We'll work backwards from there.";
    const foot=section.querySelector('.publicClinicalPreviewFoot');
    const note=foot?.querySelector('span'); if(note) note.textContent="Can't find it? Send us the requirement. We source by specification, not just by what's already listed in our catalogue.";
    const b=foot?.querySelector('button'); if(b) b.textContent='Open Institutional Catalogue';
  }

  function homeWorkshopCopy(){
    const intro=document.querySelector('main.publicLanding .homeWorkshopIntro');
    if(!intro) return;
    const h2=intro.querySelector('h2'); if(h2) h2.textContent="Know what you're working with.";
    const p=intro.querySelector('p'); if(p) p.innerHTML=`Procurement gets easier when the people making the decisions understand the products behind them.<br><br><strong>The Workshop</strong> turns specifications, standards and commonly misunderstood products into practical guidance for clinic, procurement and operations teams.<br><br>No jargon for the sake of jargon. Just enough knowledge to buy correctly, use the right specification and understand what needs maintaining or replacing.`;
    const b=intro.querySelector('button'); if(b) b.textContent='Enter The Workshop';
  }

  function homeMemory(){
    const page=document.querySelector('main.publicLanding');
    const demo=page?.querySelector('.demoTeaser');
    if(!page||!demo) return;
    if(!page.querySelector('.v452Memory')){
      const section=document.createElement('section');
      section.className='v452Memory';
      section.innerHTML=`<div class="v452MemoryCopy"><h2>And it remembers what you buy.</h2><p>Every completed order builds a clearer picture of your institution's purchasing.</p><p>See previous purchases. Reorder familiar lines faster. Understand which products are bought most often. Keep upcoming expiries, replacement needs and recurring purchases visible.</p><p>Over time, procurement becomes less reactive and more predictable.</p><strong>Purchase history <i>→</i> usage patterns <i>→</i> smarter replenishment</strong></div><button class="button outline large" data-go="login">See the Clinic Portal</button>`;
      demo.insertAdjacentElement('beforebegin',section);
    }
    demo.querySelector('.kicker')?.remove();
    const h2=demo.querySelector('h2'); if(h2) h2.textContent='From requirement to replenishment.';
    const p=demo.querySelector('p'); if(p) p.textContent='Find what you need. Request it. Receive one clear quotation. Follow the order. Keep the purchasing record. Reorder when you need it. PS stays accountable throughout.';
    const b=demo.querySelector('button'); if(b) b.textContent='View the guided tour';
  }

  function fixVitals(){
    document.querySelectorAll('.publicClinicalCard[data-go="catalogue/vitals"] .publicClinicalArt,.publicCategoryCard16[data-go="catalogue/vitals"] .publicCategoryArt16 img,.customerShell .clinicNeedCard[data-go$="/vitals"] .clinicNeedIcon img').forEach(img=>{
      if(img.tagName==='IMG'){img.src=VITALS_ICON;img.removeAttribute('srcset');img.removeAttribute('onerror');}
    });
  }

  function productCards(){
    document.querySelectorAll('.customerShell .productCard').forEach(card=>{
      card.classList.add('v452ProductCard');
      card.querySelector('.productVisual')?.classList.add('v452ProductVisual');
      card.querySelector('.productMainImage')?.classList.add('v452ProductImage');
    });
  }

  function normalizeBrand(v=''){return String(v).toLowerCase().replace(/^common brands?:\s*/,'').replace(/[^a-z0-9]+/g,' ').trim();}
  function primaryBrand(familyId){
    const rows=Array.isArray(window.PSC_DATA?.products)?window.PSC_DATA.products:[];
    const p=rows.find(x=>String(x?.catalogueParentId||'')===String(familyId||''));
    return normalizeBrand(p?.brand||'');
  }

  function familyImageRule(){
    const root=document.querySelector('[data-psc-family-detail-root]');
    if(!root) return;
    const grid=root.querySelector('.fluidProductGrid'), pane=root.querySelector('.detailImagePane');
    if(!grid||!pane) return;
    const familyId=(root.querySelector('.fluidProductHeader .mono')?.textContent||'').trim();
    const brand=primaryBrand(familyId);
    const selected=[...root.querySelectorAll('.pscBrandTick.active b')].map(x=>normalizeBrand(x.textContent)).filter(Boolean);
    const noPreference=!!root.querySelector('.pscBrandNoPreference.active');
    const other=!!root.querySelector('[data-family-other-toggle]:checked');
    const keep=!noPreference&&!other&&brand&&selected.length===1&&(selected[0]===brand||selected[0].includes(brand)||brand.includes(selected[0]));
    pane.hidden=!keep;
    grid.classList.toggle('v452NoBrandImage',!keep);
    if(keep){ const meta=pane.querySelector('.detailImageMeta small'); if(meta) meta.textContent='Image shown for the selected brand.'; }
  }

  function run(){
    homeHero();homeIntelligence();homeCategoryCopy();homeWorkshopCopy();homeMemory();fixVitals();productCards();familyImageRule();
  }
  let queued=false;
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;run();});}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule,{once:true}); else schedule();
  window.PSC_ENHANCEMENTS.createObserver(schedule).observe(document.getElementById('app')||document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  window.addEventListener('hashchange',schedule);window.addEventListener('popstate',schedule);[250,700,1400].forEach(ms=>setTimeout(schedule,ms));
})();
