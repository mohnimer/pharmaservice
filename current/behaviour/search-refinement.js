
(() => {
  'use strict';

  const WORKSHOP_IMAGES = {
    'which-glove-should-i-actually-wear':'/assets/workshop/which-glove-should-i-actually-wear.webp',
    'oxygen-cylinder-is-not-an-oxygen-system':'/assets/workshop/oxygen-cylinder-is-not-an-oxygen-system.webp',
    'aed-has-expiring-parts-too':'/assets/workshop/aed-has-expiring-parts-too.webp'
  };

  const clean = value => String(value || '').trim();

  function route(){
    return location.hash ? location.hash.slice(1) : location.pathname.replace(/^\/+|\/+$/g,'');
  }

  function workshopSlug(card){
    const btn = card.querySelector('[data-go^="workshop/"]');
    return clean(btn?.getAttribute('data-go')).replace(/^workshop\//,'');
  }

  function addWorkshopImage(card){
    const slug = workshopSlug(card);
    const src = WORKSHOP_IMAGES[slug];
    if(!src) return;

    let visual = card.querySelector('.workshopGuideCardVisual');
    if(!visual) return;

    if(visual.querySelector('img')) return;
    visual.innerHTML = `<img src="${src}" alt="">`;
  }

  function fixWorkshopHierarchy(){
    if(route() !== 'workshop') return;

    const page = document.querySelector('main.workshopPage:not(.workshopArticlePage)');
    if(!page) return;

    const hero = page.querySelector('.workshopHero');
    const principle = page.querySelector('.workshopPrinciple');
    const categories = page.querySelector('.workshopCategorySection');

    /* The principle belongs directly after the title block. */
    if(hero && principle && hero.nextElementSibling !== principle){
      hero.insertAdjacentElement('afterend', principle);
    }

    if(principle){
      const h2 = principle.querySelector('h2');
      const p = principle.querySelector('p');
      if(h2) h2.textContent = 'Useful product knowledge belongs next to the product.';
      if(p){
        p.textContent = 'The Workshop is there to make specifications, compatibility, readiness and replenishment easier to understand before the next order, not to turn education into a sales pitch.';
      }
    }

    if(categories){
      const h2 = categories.querySelector('.workshopCategoryHead h2');
      const p = categories.querySelector('.workshopCategoryHead p');
      if(h2) h2.textContent = '';
      if(p) p.textContent = 'Pick a category to jump straight to the guide.';
    }

    /* Keep the approved hero wording from V44.9. */
    const heroH1 = page.querySelector('.workshopHero h1');
    const heroH2 = page.querySelector('.workshopHero h2');
    const heroRight = page.querySelector('.workshopHeroCopy p');
    if(heroH1) heroH1.textContent = 'The Workshop';
    if(heroH2) heroH2.textContent = 'Plain guides for people who run clinics.';
    if(heroRight) heroRight.textContent = 'What to check before you buy, and how to avoid ordering the wrong thing twice.';

    const deckIntro = page.querySelector('.workshopGuideDeckIntro');
    if(deckIntro){
      const title = deckIntro.querySelector('h2');
      const sub = deckIntro.querySelector('p');
      if(title && !title.textContent.trim()) title.textContent = 'Read this before you reorder.';
      if(title && /Useful things to know before the next order/i.test(title.textContent)){
        title.textContent = 'Read this before you reorder.';
      }
      if(sub && /Short, practical guides/i.test(sub.textContent)){
        sub.textContent = 'Short guides on what to check when buying for a clinic: sizes, specs, expiry, storage, the mistakes people make.';
      }
    }
  }

  function groupWorkshopCards(){
    if(route() !== 'workshop') return;

    const scroll = document.querySelector('.workshopPage:not(.workshopArticlePage) .workshopGuideDeckScroll');
    if(!scroll) return;

    /* The application re-renders this node when filters/search change.
       Only rebuild when direct cards are present. */
    const directCards = [...scroll.children].filter(el => el.classList?.contains('workshopGuideCard'));
    if(!directCards.length) return;

    const groups = new Map();
    directCards.forEach(card => {
      addWorkshopImage(card);
      const category = clean(card.querySelector('.workshopGuideCardMeta b')?.textContent) || 'Guides';
      if(!groups.has(category)) groups.set(category,[]);
      groups.get(category).push(card);
    });

    const host = document.createElement('div');
    host.className = 'v4410WorkshopGroups';

    groups.forEach((cards,category) => {
      const section = document.createElement('section');
      section.className = 'v4410WorkshopGroup';

      const head = document.createElement('div');
      head.className = 'v4410WorkshopGroupHead';
      head.innerHTML = `<h3>${category}</h3><span>${cards.length} ${cards.length === 1 ? 'guide' : 'guides'}</span>`;

      const grid = document.createElement('div');
      grid.className = 'v4410WorkshopGroupGrid';
      cards.forEach(card => grid.appendChild(card));

      section.append(head,grid);
      host.appendChild(section);
    });

    scroll.replaceChildren(host);
  }

  function keepWorkshopImages(){
    document.querySelectorAll('.workshopPage:not(.workshopArticlePage) .workshopGuideCard').forEach(addWorkshopImage);
  }

  function syncPortalCatalogueSearch(){
    const prominent = document.querySelector('.customerShell .v449CatalogueSearch input');
    const global = document.querySelector('.customerShell [data-global-search]');
    if(!prominent || !global) return;

    if(document.activeElement !== prominent && prominent.value !== global.value){
      prominent.value = global.value || '';
    }
  }

  function run(){
    fixWorkshopHierarchy();
    groupWorkshopCards();
    keepWorkshopImages();
    syncPortalCatalogueSearch();
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
    document.addEventListener('DOMContentLoaded',schedule,{once:true});
  } else {
    schedule();
  }

  const app = document.getElementById('app');
  if(app){
    window.PSC_ENHANCEMENTS.createObserver(schedule).observe(app,{childList:true,subtree:true});
  }

  window.addEventListener('hashchange',schedule);
  window.addEventListener('popstate',schedule);
})();
