(() => {
  'use strict';
  const categories=[
    ['wounds','Cuts & wounds','Dressings, gauze & wound protection','wounds'],
    ['breathing','Breathing & oxygen','Respiratory equipment & supplies','breathing'],
    ['vitals','Vitals & assessment','Monitoring & diagnostic essentials','vitals-assessment-exact'],
    ['infection','Infection control','PPE, hygiene & disinfection','infection'],
    ['emergency','Emergency & response','Readiness & urgent care','emergency'],
    ['equipment','Equipment & mobility','Furniture, movement & support','equipment']
  ];
  function markup(){return `<div class="psExperience psHome">
    <section class="psHomeHero psPageWidth" aria-labelledby="psHomeTitle">
      <div class="psHeroCopy"><span class="psEyebrow"><i></i> Institutional healthcare supply</span>
        <h1 id="psHomeTitle">From requirement<br>to <em>replenishment.</em></h1>
        <p class="psHeroLead">All in one place.</p><p class="psHeroDescription">The products you need. One accountable partner to source, quote and supply them.</p>
        <form class="psHomeSearch" data-ps-command-form role="search"><label class="srOnly" for="psHomeCommand">Search the institutional catalogue</label><span aria-hidden="true">⌕</span><input id="psHomeCommand" type="search" data-cat-q aria-label="Search catalogue" placeholder="What do you need?" autocomplete="off" maxlength="400"><button class="button dark" type="submit">Search <span aria-hidden="true">→</span></button></form>
        <div class="psHeroSecondary"><span>Already have a list?</span><button class="psTextLink" data-go="start">Send your requirement <span aria-hidden="true">↗</span></button></div>
      </div>
      <div class="psHeroComposition" aria-label="Diagnostic equipment, wound care and respiratory supplies"><span class="psHeroEdition">PHARMA SERVICE <i>Supply, considered.</i></span><div class="psHeroStillLife"><img src="/assets/products/acorus-2026-10/retained-psc-dia-003.jpg" alt="Braun ExactFit 1 blood pressure monitor BUA 5000, cuff and pack" fetchpriority="high"></div><span class="psHeroCaption">Every detail matters.<span>Diagnostic equipment · Clinical essentials</span></span></div>
    </section>
    <section class="psHomeCategories psPageWidth" aria-labelledby="psClinicalTitle"><div class="psSectionHeading"><div><span class="psEyebrow">Start with the need</span><h2 id="psClinicalTitle">Find your clinical area.</h2></div><button class="psTextLink" data-go="catalogue">Explore the catalogue <span aria-hidden="true">↗</span></button></div><div class="psClinicalGrid">${categories.map(([id,name,copy,image])=>`<button class="psClinicalTile" data-go="catalogue/${id}"><img src="/assets/clinical-icons/${image}.png" alt="" loading="lazy"><span><h3>${name}</h3><small>${copy}</small></span><i aria-hidden="true">↗</i></button>`).join('')}</div></section>
    <section class="psHomeBaskets" aria-labelledby="psReadyTitle"><div class="psPageWidth"><div class="psSectionHeading"><div><span class="psEyebrow">PS Ready Procurement Baskets</span><h2 id="psReadyTitle">A head start on the whole task.</h2></div><button class="psTextLink" data-go="ready-baskets">Explore baskets <span aria-hidden="true">↗</span></button></div><div class="psBasketGrid">${window.PSC_READY_BASKETS?.cards()||''}</div><p class="psQuietNote">Pilot previews. Exact specifications, kit contents and compatibility are reviewed before quotation.</p></div></section>
    <section class="psHomeJourney psPageWidth" aria-labelledby="psJourneyTitle"><div class="psSectionHeading"><div><span class="psEyebrow">One connected process</span><h2 id="psJourneyTitle">Less to coordinate.<br> More taken care of.</h2></div><button class="psTextLink" data-go="our-model">How we work <span aria-hidden="true">↗</span></button></div><ol>${[['Find','Search by product or clinical need.'],['Request','Choose exact items or send your list.'],['Source & quote','Review specifications and commercial terms.'],['Deliver','Supply follows the required approval.'],['Reorder','Return to your account and order history.']].map(([title,copy],i)=>`<li><span>0${i+1}</span><h3>${title}</h3><p>${copy}</p></li>`).join('')}</ol></section>
    <section class="psHomeReturn psPageWidth" aria-label="Returning customers"><div><span class="psEyebrow">Your next order starts closer</span><h2>Welcome back to simpler purchasing.</h2><p>Requests, documents and previously supplied items, together in your account.</p></div><div><button class="button dark" data-go="portal/dashboard">Open my account <span aria-hidden="true">↗</span></button><button class="psTextLink" data-go="portal/replenish">Repeat a previous order <span aria-hidden="true">→</span></button></div></section>
  </div>`;}
  function install(){const page=document.querySelector('main.publicLanding');if(!page||page.querySelector(':scope > .psHome'))return;const header=page.querySelector(':scope > .publicHeader'),footer=page.querySelector(':scope > .publicFooter');if(!header||!footer)return;[...page.children].forEach(el=>{if(el!==header&&el!==footer)el.remove();});footer.insertAdjacentHTML('beforebegin',markup());page.dataset.psExperience='1';}
  let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;install();});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  window.PSC_ENHANCEMENTS.createObserver(schedule).observe(document.getElementById('app'),{childList:true,subtree:true});window.addEventListener('hashchange',schedule);
})();
