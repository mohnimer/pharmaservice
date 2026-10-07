
(() => {
  'use strict';

  const WORKSHOP_IMAGES = {
    'which-glove-should-i-actually-wear':'/assets/workshop/which-glove-should-i-actually-wear.webp',
    'oxygen-cylinder-is-not-an-oxygen-system':'/assets/workshop/oxygen-cylinder-is-not-an-oxygen-system.webp',
    'aed-has-expiring-parts-too':'/assets/workshop/aed-has-expiring-parts-too.webp'
  };

  let workshopCategoriesExpanded = false;

  const clean = v => String(v || '').trim();

  // Exact option images and family galleries are rendered by family-details.js.
  // Do not infer a different pack photograph from shared brand/name tokens.

  function patchHomeHero(){
    const heroText = document.querySelector('.publicLanding .m445HomeHeroText');
    if(!heroText) return;

    let h1 = heroText.querySelector('h1');
    let p = heroText.querySelector('p');
    if(!h1 || !p) return;

    const title = 'Healthcare procurement, for institutions.';
    const sub = 'Standing supply, automatic replenishment and replacement of health products for hospitals, clinics and pharmacies. MOHAP-licensed. Dubai since 1984.';

    if(h1.textContent !== title) h1.textContent = title;
    if(p.textContent !== sub) p.textContent = sub;
  }

  function patchHomeWorkshop(){
    const section = document.querySelector('.publicLanding .homeWorkshopCards');
    if(!section) return;

    section.querySelectorAll('.homeWorkshopCardGrid .workshopGuideCard').forEach(card => {
      const btn = card.querySelector('[data-go^="workshop/"]');
      if(!btn) return;
      const slug = clean(btn.dataset.go).replace(/^workshop\//,'');
      const src = WORKSHOP_IMAGES[slug];
      if(!src) return;

      let visual = card.querySelector('.workshopGuideCardVisual');
      if(!visual){
        visual = document.createElement('span');
        visual.className = 'workshopGuideCardVisual';
        btn.appendChild(visual);
      }
      if(!visual.querySelector('img')){
        visual.innerHTML = `<img src="${src}" alt="">`;
      }
    });
  }

  function patchPortalCatalogueSearch(){
    const section = document.querySelector('.customerShell .v26CatalogueLanding');
    if(!section || document.querySelector('.psIntelligentSearch') || section.querySelector('.v449CatalogueSearch')) return;

    const row = document.createElement('div');
    row.className = 'v449CatalogueSearch';
    row.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.6"></circle>
        <path d="M16 16l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>
      </svg>
      <input type="search" placeholder="Search product, brand, specification or clinical need…" aria-label="Search institutional catalogue">
    `;

    const head = section.querySelector('.clinicNeedHeading');
    if(head) head.insertAdjacentElement('afterend',row);
    else section.prepend(row);

  }

  function patchWorkshopPage(){
    const page = document.querySelector('main.workshopPage:not(.workshopArticlePage)');
    if(!page) return;

    const heroH1 = page.querySelector('.workshopHero h1');
    const heroH2 = page.querySelector('.workshopHero h2');
    const heroRight = page.querySelector('.workshopHeroCopy p');
    if(heroH1 && heroH1.textContent !== 'The Workshop') heroH1.textContent = 'The Workshop';
    if(heroH2 && heroH2.textContent !== 'Plain guides for people who run clinics.') heroH2.textContent = 'Plain guides for people who run clinics.';
    if(heroRight && heroRight.textContent !== 'What to check before you buy, and how to avoid ordering the wrong thing twice.') heroRight.textContent = 'What to check before you buy, and how to avoid ordering the wrong thing twice.';

    const catSection = page.querySelector('.workshopCategorySection');
    if(catSection){
      const h2 = catSection.querySelector('.workshopCategoryHead h2');
      const p = catSection.querySelector('.workshopCategoryHead p');
      if(h2 && h2.textContent !== 'Find your product.') h2.textContent = 'Find your product.';
      if(p && p.textContent !== 'Pick a category to jump straight to the guide.') p.textContent = 'Pick a category to jump straight to the guide.';

      catSection.classList.toggle('v449Expanded',workshopCategoriesExpanded);

      const oldBtn = catSection.querySelector('.workshopCategoryHead > button');
      if(oldBtn && !oldBtn.dataset.v449Expander){
        const btn = oldBtn.cloneNode(false);
        btn.removeAttribute('data-workshop-category');
        btn.removeAttribute('class');
        btn.className = 'v449WorkshopExpand';
        btn.dataset.v449Expander = '1';
        btn.textContent = workshopCategoriesExpanded ? 'Show fewer' : 'See all guides';
        btn.addEventListener('click',e=>{
          e.preventDefault();
          e.stopPropagation();
          workshopCategoriesExpanded = !workshopCategoriesExpanded;
          catSection.classList.toggle('v449Expanded',workshopCategoriesExpanded);
          btn.textContent = workshopCategoriesExpanded ? 'Show fewer' : 'See all guides';
        });
        oldBtn.replaceWith(btn);
      } else if(oldBtn && oldBtn.dataset.v449Expander){
        oldBtn.textContent = workshopCategoriesExpanded ? 'Show fewer' : 'See all guides';
      }
    }

    const deckIntro = page.querySelector('.workshopGuideDeckIntro');
    if(deckIntro){
      const h2 = deckIntro.querySelector('h2');
      const p = deckIntro.querySelector('p');
      const title = 'Read this before you reorder.';
      const sub = 'Short guides on what to check when buying for a clinic: sizes, specs, expiry, storage, the mistakes people make.';
      if(h2 && h2.textContent !== title) h2.textContent = title;
      if(p && p.textContent !== sub) p.textContent = sub;
    }
  }

  function cleanContactType(){
    document.querySelectorAll('.prospectContactGrid .contactCard b').forEach(el=>{
      el.style.fontWeight = '400';
    });
  }

  function apply(){
    patchHomeHero();
    patchHomeWorkshop();
    patchPortalCatalogueSearch();
    patchWorkshopPage();
    cleanContactType();
  }

  let queued = false;
  function schedule(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(()=>{
      queued = false;
      apply();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',schedule,{once:true});
  } else {
    schedule();
  }

  const root = document.getElementById('app') || document.body;
  window.PSC_ENHANCEMENTS.createObserver(schedule).observe(root,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(schedule,0));
  [250,700,1500,3000].forEach(ms=>setTimeout(schedule,ms));
})();
