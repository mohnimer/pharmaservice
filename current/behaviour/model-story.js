/* Customer guide. Native catalogue, collection and account behavior remain authoritative. */
(() => {
  'use strict';
  const steps=[
    ['Find','Search by product, brand or clinical need. Choose the exact item and pack.'],
    ['Request','Build a supply request, start from a collection or send your existing list.'],
    ['Source & quote','We confirm the items, availability and terms. You review the quotation.'],
    ['Deliver','Supply follows the required approval and agreed payment arrangements.'],
    ['Reorder','Return to previously supplied products and choose your next quantities.']
  ];
  const collections=[
    ['opening','Complete clinic setup','Furniture, diagnostics, emergency equipment and opening supplies.','clinic-opening','Explore setup','Illustrative clinic setup with a Braun thermometer; brand and configuration examples'],
    ['replenishment','Clinic refills','Wound care, hygiene, testing and everyday disposables.','clinic-restock','Explore refills','Illustrative consumables scene with WOLAID gauze packaging; exact items and packs are listed in the collection'],
    ['kits','First-aid points','Supplies for the gym, laboratory, canteen, trips and campus.','first-aid-rollout','Explore first-aid points','Illustrative first-aid station with a 3M Nexcare pack; brand example, not a fixed kit specification']
  ];
  const MARKUP=`<div class="model46" data-model-version="20261021">
    <section class="m46Hero" aria-labelledby="m46Title"><div class="m46Shell m46HeroGrid">
      <div class="m46HeroCopy"><h1 id="m46Title">One supply relationship.</h1><p>Find the products you need or send us your list. We source across suitable suppliers, bring the requirement into one quotation and stay accountable through delivery.</p><div class="m46Actions"><button class="button primary" data-go="start">Send a requirement</button><button class="button outline" data-go="catalogue">Browse products</button></div></div>
      <figure class="m46HeroVisual">
        <div class="m46RoughCard"><p>Your list</p><div><span>BP monitors</span><span>2</span></div><div><span>Gauze 10 × 10</span><span>10</span></div><div><span>Gloves, size M</span><span>5</span></div></div>
        <div class="m46QuoteCard"><div class="m46QuoteTop"><p>One Pharma Service quotation</p><img src="/assets/psc-logo-current.png" width="84" height="64" alt="Pharma Service"></div><div class="m46QuoteRow"><span>Blood pressure monitors</span><small>Exact model and cuff range</small></div><div class="m46QuoteRow"><span>Wound-care supplies</span><small>Size, material and pack</small></div><div class="m46QuoteRow"><span>Examination gloves</span><small>Size and box quantity</small></div></div>
        <figcaption>An example of one requirement brought together.</figcaption>
      </figure>
    </div></section>
    <section class="m46Journey m46Shell" aria-labelledby="m46JourneyTitle"><div class="m46SectionHead"><h2 id="m46JourneyTitle">From requirement<br>to replenishment.</h2><p>One product or a mixed list. The same clear process, with you in control of the order.</p></div><ol>${steps.map(([title,copy],i)=>`<li><span class="m46StepNumber" aria-hidden="true">0${i+1}</span><h3>${title}</h3><p>${copy}</p></li>`).join('')}</ol><p class="m46JourneyNote">Already have an RFQ, spreadsheet or previous order? Send it as it is. We’ll clarify the details with you.</p></section>
    <section class="m46Collections" aria-labelledby="m46CollectionTitle"><div class="m46Shell">
      <div class="m46SectionHead"><div><h2 id="m46CollectionTitle">Set it up.<br>Keep it running.</h2><p>School clinic supply collections give you a starting point for setup and regular supplies.</p></div><p>Buying for another healthcare facility or institutional setting? <button class="button outline" data-go="start">Send us your requirements</button></p></div>
      <div class="m46CollectionGrid">${collections.map(([id,title,copy,scene,label,alt])=>`<article class="m46CollectionCard"><img src="/assets/baskets/${scene}-scene-brands-v2.webp" width="1536" height="1024" loading="lazy" decoding="async" alt="${alt}"><div><h3>${title}</h3><p>${copy}</p><button class="button outline" data-model-collection="${id}">${label}</button></div></article>`).join('')}</div>
      <p class="m46QuietNote">Scenes are illustrative. Collections are starting scopes; final items and quantities depend on your facility and the applicable requirements.</p>
    </div></section>
    <section class="m46Account m46Shell" aria-labelledby="m46AccountTitle">
      <div class="m46AccountCopy"><h2 id="m46AccountTitle">The next order<br>starts here.</h2><p>Keep your requests, quotations and available documents together. Return to the products supplied before and build your next request from there.</p><button class="button primary" data-go="portal/dashboard">Open my account</button><p class="m46QuietNote">Sign in to view your institution’s records.</p></div>
      <nav class="m46Memory" aria-label="Your account">
        <button class="m46HistoryRow" data-go="portal/requests"><img src="/assets/ui-icons/my-requests.webp" width="52" height="52" alt=""><span><strong>Orders & requests</strong><small>Follow your requests and quotations.</small></span></button>
        <button class="m46HistoryRow" data-go="portal/documents"><img src="/assets/ui-icons/downloads.webp" width="52" height="52" alt=""><span><strong>Your documents</strong><small>Find available quotation and delivery records.</small></span></button>
        <button class="m46HistoryRow" data-go="portal/replenish"><img src="/assets/ui-icons/orders.webp" width="52" height="52" alt=""><span><strong>Order again</strong><small>Choose from previously supplied products.</small></span></button>
      </nav>
    </section>
    <section class="m46Practical" aria-labelledby="m46PracticalTitle"><div class="m46Shell">
      <div class="m46PracticalGrid"><h2 id="m46PracticalTitle">A few practical<br>details.</h2><div class="m46Faq">
        <details><summary>Are catalogue prices wholesale prices?</summary><p>Retail prices shown in the catalogue are references. Your institutional quotation confirms the wholesale selling price, availability, VAT and delivery terms.</p></details>
        <details><summary>Can I send a list without choosing products?</summary><p>Yes. Use Send a requirement to upload an RFQ or spreadsheet, or describe what you need. Include quantities, your facility and timing where known. We’ll clarify anything missing.</p></details>
        <details><summary>What is confirmed before supply?</summary><p>The exact products, packs, quantities, current availability and commercial terms are confirmed in quotation. Procurement follows the required approval and agreed payment arrangements.</p><p>Requirement mappings help identify relevant lines. They do not establish product approval or suitability; conditional requirements retain their conditions.</p></details>
      </div></div>
      <div class="m46Final"><div><h3>Start with what you have.</h3><p>One product, an existing list or your next replenishment.</p></div><button class="button primary" data-go="start">Send a requirement</button></div>
    </div></section>
  </div>`;
  function install(){
    const page=document.querySelector('main.model17Page');
    if(!page||page.querySelector(':scope > .model46'))return;
    const header=page.querySelector(':scope > .publicHeader'),footer=page.querySelector(':scope > .publicFooter');
    if(!header||!footer)return;
    page.querySelectorAll(':scope > .model43').forEach(el=>el.remove());
    footer.insertAdjacentHTML('beforebegin',MARKUP);
    const root=page.querySelector(':scope > .model46');
    root.addEventListener('click',event=>{
      const button=event.target.closest('button[data-model-collection],button[data-go]');
      if(!button||!root.contains(button))return;
      event.preventDefault();event.stopPropagation();
      if(button.dataset.modelCollection){
        const id=button.dataset.modelCollection;
        window.PSC_OPEN_SCHOOL_COLLECTION(id);
        requestAnimationFrame(()=>{
          const selected=document.querySelector(`.psSchoolBaskets [data-school-collection="${id}"]`);
          selected?.focus({preventScroll:true});
          document.querySelector('.psSchoolBaskets')?.scrollIntoView({block:'start',behavior:'instant'});
        });
      }else{
        const route=button.dataset.go;
        if(route.startsWith('portal/')&&!window.PSC_ACCOUNT_CONTEXT?.()){
          try{sessionStorage.setItem('pscPendingRoute',route);}catch{}
        }
        window.PSC_NAVIGATE(route);
      }
    });
  }
  let queued=false;
  const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;install();});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  const app=document.getElementById('app');
  if(app)window.PSC_ENHANCEMENTS.createObserver(schedule).observe(app,{childList:true,subtree:true});
  window.addEventListener('hashchange',schedule);
})();
