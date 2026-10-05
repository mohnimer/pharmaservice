(() => {
  'use strict';

  const SECTION_HTML = `
    <section class="homeCommunitySection" aria-labelledby="home-community-title">
      <div class="homeCommunityInner">
        <div class="homeCommunityCopy">
          <span class="homeCommunityRule" aria-hidden="true"></span>
          <h2 id="home-community-title">A healthier community starts with our institutions.</h2>
          <div class="homeCommunityBody">
            <p>Pharma Service exists to make essential healthcare products, equipment and supplies easier to source, manage and trust.</p>
            <p>Since 1984, we have strived to make healthcare less fragmented, helping schools, clinics, workplaces and other organisations operate with greater readiness, consistency and confidence.</p>
          </div>
          <span class="homeCommunitySince">PHARMA SERVICE · SINCE 1984</span>
        </div>
        <figure class="homeCommunityVisual" aria-label="School children walking through a clinic corridor">
          <img class="homeCommunityCorridor" src="/assets/home-community-corridor.webp?v=3934" alt="" aria-hidden="true">
          <img class="homeCommunityPerson homeCommunityDoctor" src="/assets/home-community-doctor.webp?v=3934" alt="" aria-hidden="true">
          <img class="homeCommunityPerson homeCommunityBoy" src="/assets/home-community-boy.webp?v=3934" alt="" aria-hidden="true">
          <img class="homeCommunityPerson homeCommunityGirl" src="/assets/home-community-girl.webp?v=3934" alt="" aria-hidden="true">
        </figure>
      </div>
    </section>`;

  let observer = null;

  function observe(section){
    if(!section || section.dataset.v3934Observed === '1') return;
    section.dataset.v3934Observed = '1';

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
        threshold: .18,
        rootMargin: '0px 0px -7% 0px'
      });
    }

    observer.observe(section);
  }

  function enhanceHome(){
    const landing = document.querySelector('main.publicLanding');
    if(!landing) return;

    let section = landing.querySelector('.homeCommunitySection');
    if(!section){
      const hero = landing.querySelector('.pscInstitutionalHero');
      if(!hero) return;

      const holder = document.createElement('div');
      holder.innerHTML = SECTION_HTML.trim();
      section = holder.firstElementChild;
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
    new MutationObserver(schedule).observe(app, {
      childList:true,
      subtree:true
    });
  }

  window.addEventListener('hashchange', schedule);
})();