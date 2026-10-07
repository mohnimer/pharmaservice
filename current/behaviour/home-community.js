(() => {
  'use strict';

  const SECTION_HTML = `
    <section class="homeCommunitySection" data-v3935="1" aria-labelledby="home-community-title">
      <div class="homeCommunityInner">
        <div class="homeCommunityCopy">
          <h2 id="home-community-title">
            <span>Better community health</span>
            <span>starts with our Institutions.</span>
          </h2>

          <div class="homeCommunityBody">
            <p>Pharma Service exists to make essential healthcare products, equipment and supplies easier to source, manage and trust.</p>
            <p>Since 1984, we have strived to make healthcare less fragmented, helping schools, clinics, workplaces and other organisations operate with greater readiness, consistency and confidence.</p>
          </div>
        </div>
      </div>
    </section>`;

  let observer = null;

  function makeSection(){
    const holder = document.createElement('div');
    holder.innerHTML = SECTION_HTML.trim();
    return holder.firstElementChild;
  }

  function observe(section){
    if(!section || section.dataset.v3935Observed === '1') return;
    section.dataset.v3935Observed = '1';

    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      section.classList.add('is-visible');
      return;
    }

    if(!('IntersectionObserver' in window)){
      section.classList.add('is-visible');
      return;
    }

    if(!observer){
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold:.18,
        rootMargin:'0px 0px -7% 0px'
      });
    }

    observer.observe(section);
  }

  function enhanceHome(){
    const landing = document.querySelector('main.publicLanding');
    if(!landing) return;

    const hero = landing.querySelector('.pscInstitutionalHero');
    if(!hero) return;

    let section = landing.querySelector('.homeCommunitySection');

    // Replace the earlier V39.34 implementation in-place so stale reconstructed
    // image layers can never survive after this patch loads.
    if(section && section.dataset.v3935 !== '1'){
      const replacement = makeSection();
      section.replaceWith(replacement);
      section = replacement;
    }

    if(!section){
      section = makeSection();
      hero.insertAdjacentElement('afterend', section);
    }

    observe(section);
  }

  let queued = false;
  function schedule(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      enhanceHome();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', schedule, {once:true});
  }else{
    schedule();
  }

  const app = document.getElementById('app');
  if(app){
    window.PSC_ENHANCEMENTS.createObserver(schedule).observe(app,{
      childList:true,
      subtree:true
    });
  }

  window.addEventListener('hashchange',schedule);
})();