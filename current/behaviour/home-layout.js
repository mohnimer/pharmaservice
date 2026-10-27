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
  const escape=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function workshop(){
    const slugs=['which-glove-should-i-actually-wear','oxygen-cylinder-is-not-an-oxygen-system','aed-has-expiring-parts-too'];
    const guides=slugs.map(slug=>(window.PSC_WORKSHOP||[]).find(g=>g.slug===slug&&g.status==='published')).filter(Boolean);
    if(!guides.length)return '';
    return `<section class="psHomeWorkshop psPageWidth" aria-labelledby="psWorkshopTitle"><div class="psSectionHeading"><div><h2 id="psWorkshopTitle">The Workshop</h2><p>Practical guidance on products, specifications and the details that keep your clinic ready.</p></div><button class="psTextLink" data-go="workshop">Explore The Workshop</button></div><div class="psHomeGuideGrid">${guides.map(g=>`<article><button class="psHomeGuide" data-go="workshop/${escape(g.slug)}"><img src="/assets/workshop/${escape(g.slug)}.webp" width="1800" height="960" loading="lazy" decoding="async" alt=""><span><h3>${escape(g.title)}</h3><p>${escape(g.excerpt)}</p></span></button></article>`).join('')}</div></section>`;
  }
  function heroProducts(){
    // Category examples only: these photographs do not establish an exact offer or approval.
    return [
      ['dha-medicines','Medicines','/assets/products/dha-2026-10/psc-sc-d07.png','Sodium chloride ampoules and carton — medicines category example'],
      ['dha-equipment','Clinical equipment','/assets/products/pulse-oximeter-clean.png','Fingertip pulse oximeter — equipment category example'],
      ['dha-consumables','Everyday consumables','/assets/products/verified-20261019/b9747c9c8b117df78832.png','Examination gloves — consumables category example']
    ].map(([category,label,src,alt],i)=>`<button class="skyHeroProduct skyHeroProduct${i+1}" data-go="catalogue/${category}" aria-label="Browse ${label}"><span class="skyHeroSubject"><img src="${src}" alt="${alt}" decoding="async"></span></button>`).join('');
  }
  function markup(){return `<div class="psExperience psHome">
    <section class="skyHero" aria-labelledby="psHomeTitle">
      <div class="skyHeroCopy"><h1 id="psHomeTitle">From requirement<br>to replenishment.</h1><p>Healthcare supplies for institutions. Find the right products, build one request and keep every order connected.</p>
      <section class="psHomeFind" aria-label="Find products or send a requirement"><form class="psHomeSearch" data-ps-command-form role="search"><label class="srOnly" for="psHomeCommand">Search the institutional catalogue</label><span aria-hidden="true">⌕</span><input id="psHomeCommand" type="search" data-cat-q aria-label="Search catalogue" placeholder="What does your clinic need?" autocomplete="off" maxlength="400"><button class="button dark" type="submit">Search</button></form><div class="psHeroSecondary"><button class="button outline" data-go="catalogue">Browse the catalogue</button><button class="psTextLink" data-go="start">Send your requirement</button></div></section>
      </div><div class="skyProductStage" aria-label="Explore catalogue products">${heroProducts()}<span class="skyStageCaption">Everyday essentials. One accountable partner.</span></div>
    </section>
    <section class="psHomeCategories psPageWidth" aria-labelledby="psClinicalTitle"><div class="psSectionHeading"><div><h2 id="psClinicalTitle">Find your clinical area.</h2></div><button class="psTextLink" data-go="catalogue">Explore the catalogue</button></div><div class="psClinicalGrid">${categories.map(([id,name,copy,image])=>`<button class="psClinicalTile" data-go="catalogue/${id}"><img src="/assets/clinical-icons/${image}.png" alt="" loading="lazy"><span><h3>${name}</h3><small>${copy}</small></span></button>`).join('')}</div></section>
    <section class="psHomeJourney psPageWidth" aria-labelledby="psJourneyTitle"><div class="psSectionHeading"><div><h2 id="psJourneyTitle">Less to coordinate.<br> More taken care of.</h2></div><button class="psTextLink" data-go="our-model">How we work</button></div><ol>${[['Find','Search by product or clinical need.'],['Request','Choose exact items or send your list.'],['Source & quote','Review specifications and commercial terms.'],['Deliver','Supply follows the required approval.'],['Reorder','Return to your account and order history.']].map(([title,copy],i)=>`<li><span>0${i+1}</span><h3>${title}</h3><p>${copy}</p></li>`).join('')}</ol></section>
    ${workshop()}
    <section class="psHomeReturn psPageWidth" aria-label="Returning customers"><div><h2>Welcome back to simpler purchasing.</h2><p>Requests, documents and previously supplied items, together in your account.</p></div><div><button class="button dark" data-go="portal/dashboard">Open my account</button><button class="psTextLink" data-go="portal/replenish">Repeat a previous order</button></div></section>
  </div>`;}
  function install(){const page=document.querySelector('main.publicLanding');if(!page||page.querySelector(':scope > .psHome'))return;const header=page.querySelector(':scope > .publicHeader'),footer=page.querySelector(':scope > .publicFooter');if(!header||!footer)return;[...page.children].forEach(el=>{if(el!==header&&el!==footer)el.remove();});footer.insertAdjacentHTML('beforebegin',markup());page.dataset.psExperience='1';}
  let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;install();});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  window.PSC_ENHANCEMENTS.createObserver(schedule).observe(document.getElementById('app'),{childList:true,subtree:true});window.addEventListener('hashchange',schedule);
})();
