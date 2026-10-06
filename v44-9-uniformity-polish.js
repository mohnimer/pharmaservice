
(() => {
  'use strict';

  const WORKSHOP_IMAGES = {
    'which-glove-should-i-actually-wear':'/assets/workshop/which-glove-should-i-actually-wear.webp',
    'oxygen-cylinder-is-not-an-oxygen-system':'/assets/workshop/oxygen-cylinder-is-not-an-oxygen-system.webp',
    'aed-has-expiring-parts-too':'/assets/workshop/aed-has-expiring-parts-too.webp'
  };

  let workshopCategoriesExpanded = false;

  const clean = v => String(v || '').trim();
  const lower = v => clean(v).toLowerCase();

  function isRealProductImage(url){
    const s = lower(url);
    return !!s &&
      !/\/assets\/products\/inst-\d{4}\.webp/i.test(s) &&
      !s.includes('clinic-basics.jpg') &&
      !s.includes('dha-requirement') &&
      !s.includes('pharmaservice.png') &&
      !s.includes('psc-logo');
  }

  function productRealImage(p){
    const candidates = [p?.image_url,p?.imageUrl];
    return candidates.map(clean).find(isRealProductImage) || '';
  }

  function productsForFamily(familyId){
    const rows = Array.isArray(window.PSC_DATA?.products) ? window.PSC_DATA.products : [];
    return rows.filter(p => clean(p?.catalogueParentId) === clean(familyId));
  }

  function scoreProductForText(p,text){
    const hay = lower([
      p?.brand,p?.name,p?.catalogueDisplayName,p?.pack,p?.cataloguePack,
      p?.pscOfferedSpecification,p?.spec
    ].filter(Boolean).join(' '));
    const tokens = lower(text).replace(/[^a-z0-9]+/g,' ').split(/\s+/)
      .filter(x => x.length >= 3 && !['the','and','pack','tablets','oral','product'].includes(x));
    let score = 0;
    [...new Set(tokens)].forEach(t => { if(hay.includes(t)) score += t.length >= 6 ? 2 : 1; });
    return score;
  }

  function patchFamilyPreview(){
    document.querySelectorAll('.pscFamilyProductSheet').forEach(sheet => {
      const familyId = clean(sheet.querySelector('.modalHeader .mono')?.textContent);
      if(!familyId) return;

      const products = productsForFamily(familyId)
        .map(p => ({p,url:productRealImage(p)}))
        .filter(x => x.url);

      if(!products.length) return;

      const main = sheet.querySelector('.pscFamilyPreview > img');
      if(main){
        const chosen = products[0].url;
        if(main.getAttribute('src') !== chosen){
          main.src = chosen;
          main.removeAttribute('srcset');
          main.onerror = function(){ this.onerror=null; this.style.display='none'; };
          main.style.display = '';
        }
      }

      const pane = sheet.querySelector('.detailImagePane');
      if(pane){
        let gallery = pane.querySelector('.productGalleryStrip');
        if(!gallery){
          gallery = document.createElement('div');
          gallery.className = 'productGalleryStrip v449FamilyGallery';
          pane.querySelector('.detailImageMeta')?.insertAdjacentElement('beforebegin',gallery);
        }
        const urls = [...new Set(products.map(x => x.url))];
        const signature = urls.join('|');
        if(gallery.dataset.v449Images !== signature){
          gallery.dataset.v449Images = signature;
          gallery.innerHTML = urls.map((url,i)=>`<img src="${url}" alt="Product option ${i+1}">`).join('');
        }
      }

      sheet.querySelectorAll('.pscBrandTick').forEach(label => {
        if(label.querySelector('.v449OptionThumb')) return;
        const text = label.textContent || '';
        let best = null, bestScore = 0;
        products.forEach(x => {
          const score = scoreProductForText(x.p,text);
          if(score > bestScore){ bestScore = score; best = x; }
        });
        if(best && bestScore >= 2){
          const img = document.createElement('img');
          img.className = 'v449OptionThumb';
          img.src = best.url;
          img.alt = '';
          img.onerror = ()=>img.remove();
          const span = label.querySelector(':scope > span');
          if(span) label.insertBefore(img,span);
        }
      });
    });
  }

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
    if(!section || section.querySelector('.v449CatalogueSearch')) return;

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

    const input = row.querySelector('input');
    input.addEventListener('input',()=>{
      const global = document.querySelector('.customerShell [data-global-search]');
      if(global){
        global.value = input.value;
        global.dispatchEvent(new Event('input',{bubbles:true}));
      }
    });
    input.addEventListener('keydown',e=>{
      if(e.key !== 'Enter') return;
      e.preventDefault();
      const global = document.querySelector('.customerShell [data-global-search]');
      if(global){
        global.value = input.value;
        global.dispatchEvent(new Event('input',{bubbles:true}));
        global.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true}));
      } else {
        location.hash = 'portal/catalogue/all';
      }
    });
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
    patchFamilyPreview();
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
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(schedule,0));
  [250,700,1500,3000].forEach(ms=>setTimeout(schedule,ms));
})();
