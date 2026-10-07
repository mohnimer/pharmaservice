(() => {
  'use strict';

  function hero(){
    const page=document.querySelector('main.publicLanding');
    if(!page) return;
    const host=page.querySelector('.m445HomeHeroText');
    if(!host) return;

    host.innerHTML=`
      <h1>Institutional healthcare supply.</h1>
      <p class="v453HeroSub">With intelligence, and one accountable supply partner.</p>
      <p class="v453HeroBody">Procurement that helps institutions stay aligned with requirements, buy better, and replenish with less friction.</p>
      <div class="v453HeroActions">
        <button class="button v453Primary" data-go="start">Tell us what you need →</button>
        <button class="button v453Secondary" data-go="catalogue">Explore the catalogue</button>
      </div>`;
  }

  function intelligence(){
    const section=document.querySelector('main.publicLanding .v452Intelligence');
    if(!section) return;

    section.querySelector('.v452IntelligenceHead')?.remove();

    let grid=section.querySelector('.v452IntelligenceGrid');
    if(!grid) return;

    const cards=[...grid.querySelectorAll('article')];
    const copy=[
      {
        title:'Know what you need.',
        body:"We map requirements, check specifications and help teams understand what is actually appropriate for their institution."
      },
      {
        title:"Know you’re buying well.",
        body:"Wholesale pricing, institutional promotions and sharper pricing on the products you buy most."
      },
      {
        title:"Know what comes next.",
        body:"Purchase history, recurring demand, expiry and replacement visibility make replenishment easier and more predictable."
      }
    ];

    cards.forEach((card,i)=>{
      const c=copy[i];
      if(!c) return;
      const h=card.querySelector('h3');
      const p=card.querySelector('p');
      if(h) h.textContent=c.title;
      if(p) p.textContent=c.body;
    });

    const strip=document.querySelector('main.publicLanding .v452SourceStrip');
    if(strip){
      strip.innerHTML=`
        <div>
          <h2>We handle the sourcing underneath it all.</h2>
          <p>One relationship with PSC, even when the best solution comes from multiple specialist suppliers.</p>
        </div>`;
    }
  }

  function catalogue(){
    const section=document.querySelector('main.publicLanding .publicClinicalPreview');
    if(!section) return;

    const head=section.querySelector('.publicClinicalPreviewHead');
    if(head){
      head.querySelector('.kicker')?.remove();
      const h=head.querySelector('h2');
      const p=head.querySelector('p');
      if(h) h.textContent='Start with the requirement.';
      if(p) p.textContent='You do not need to know where it comes from or which supplier carries it. Start with what your clinic or institution needs. We work backwards from there.';
    }
  }

  function workshop(){
    const intro=document.querySelector('main.publicLanding .homeWorkshopIntro');
    if(!intro) return;

    const h=intro.querySelector('h2');
    const p=intro.querySelector('p');
    if(h) h.textContent='Understand what you’re buying.';
    if(p) p.textContent='Practical guidance on products, specifications and the small details that can affect readiness, compliance and cost.';
    const b=intro.querySelector('button');
    if(b) b.textContent='Enter The Workshop';
  }

  function memory(){
    const section=document.querySelector('main.publicLanding .v452Memory');
    if(!section) return;

    const copy=section.querySelector('.v452MemoryCopy');
    if(copy){
      copy.innerHTML=`
        <h2>See what you’ve bought. Know what’s next.</h2>
        <p>Your purchasing history becomes useful: faster repeat orders, clearer spending patterns and better visibility on upcoming replenishment and replacement needs.</p>`;
    }

    const button=section.querySelector('button');
    if(button) button.textContent='See the Clinic Portal';
  }

  function process(){
    const section=document.querySelector('main.publicLanding .demoTeaser');
    if(!section) return;

    section.querySelector('.kicker')?.remove();
    const h=section.querySelector('h2');
    const p=section.querySelector('p');
    if(h) h.textContent='From first requirement to repeat supply.';
    if(p) p.innerHTML='Request. Quote. Supply. Record. Replenish.<br><strong>One accountable partner throughout.</strong>';
  }

  function run(){
    hero();
    intelligence();
    catalogue();
    workshop();
    memory();
    process();
  }

  let queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{
      queued=false;
      run();
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',schedule,{once:true});
  } else {
    schedule();
  }

  const root=document.getElementById('app')||document.body;
  window.PSC_ENHANCEMENTS.createObserver(schedule).observe(root,{childList:true,subtree:true});
  window.addEventListener('hashchange',schedule);
})();