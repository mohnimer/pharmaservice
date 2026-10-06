(() => {
  'use strict';

  const HERO_HTML = `
    <h1>Institutional healthcare supply.</h1>
    <p class="v453HeroSub">With intelligence, and one accountable supply partner.</p>
    <p class="v453HeroBody">Procurement that helps institutions stay aligned with requirements, buy better, and replenish with less friction.</p>
    <div class="v453HeroActions">
      <button class="button v453Primary" data-go="start">Tell us what you need →</button>
      <button class="button v453Secondary" data-go="catalogue">Explore the catalogue</button>
    </div>`;

  const VITALS_SRC = '/assets/clinical-icons/vitals-assessment-exact.png?v=4540';

  function ensureHero(){
    const page = document.querySelector('main.publicLanding');
    if(!page) return;

    const scene = page.querySelector('.m445HomeHeroScene') || page.querySelector('.m44HomeHero');
    if(!scene) return;

    let host = scene.querySelector('.m445HomeHeroText');
    if(!host){
      host = document.createElement('div');
      host.className = 'm445HomeHeroText';
      scene.prepend(host);
    }

    const expected = 'Institutional healthcare supply.';
    const current = (host.querySelector('h1')?.textContent || '').trim();
    const hasPrimary = !!host.querySelector('.v453Primary');

    if(current !== expected || !hasPrimary){
      host.innerHTML = HERO_HTML;
    }
    host.dataset.v454Hero = '1';
  }

  function exactVitalsIcon(){
    const selectors = [
      '.publicClinicalCard[data-go*="vitals"] .publicClinicalArt',
      '.publicCategoryCard16[data-go*="vitals"] .publicCategoryArt16',
      '.customerShell [data-go*="/vitals"] .clinicNeedIcon',
      '.customerShell [data-go*="vitals"] .clinicNeedIcon',
      '[data-need="vitals"] .clinicNeedIcon',
      '[data-clinical-need="vitals"] .clinicNeedIcon'
    ];

    document.querySelectorAll(selectors.join(',')).forEach(host => {
      if(host.dataset.v454Vitals === '1' && host.querySelector(`img[src^="${VITALS_SRC.split('?')[0]}"]`)) return;
      host.innerHTML = `<img class="v454VitalsExact" src="${VITALS_SRC}" alt="">`;
      host.dataset.v454Vitals = '1';
    });

    // Catch a direct image already sitting inside a vitals category card.
    document.querySelectorAll(
      '.publicClinicalCard[data-go*="vitals"] img,' +
      '.publicCategoryCard16[data-go*="vitals"] img,' +
      '.customerShell [data-go*="/vitals"] img'
    ).forEach(img => {
      if(img.classList.contains('v454VitalsExact')) return;
      img.src = VITALS_SRC;
      img.removeAttribute('srcset');
      img.classList.add('v454VitalsExact');
    });
  }

  function run(){
    ensureHero();
    exactVitalsIcon();
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
    document.addEventListener('DOMContentLoaded', schedule, {once:true});
  } else {
    schedule();
  }

  const root = document.getElementById('app') || document.body;
  new MutationObserver(schedule).observe(root, {
    childList:true,
    subtree:true
  });

  window.addEventListener('hashchange', schedule);
  window.addEventListener('popstate', schedule);
  [100, 350, 800, 1600].forEach(ms => setTimeout(schedule, ms));
})();