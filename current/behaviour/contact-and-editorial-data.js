(() => {
  'use strict';

  const CONTACT_COPY = 'For a single product, a recurring supply list, capital equipment, clinic setup or a broader RFQ. You can also attach the customer list or RFQ file.';
  const UPDATED = '05 Oct 2026';

  function esc(v=''){
    return String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[c]));
  }

  function mkGuide(id, slug, title, category, format, excerpt, problem, quick, good, ordering, next, related=[], tags=[]){
    return {
      id,
      slug,
      title,
      subtitle: excerpt,
      format,
      category,
      excerpt,
      hero_image: null,
      read_time: quick && quick.length >= 6 ? '5 min' : '4 min',
      last_reviewed: UPDATED,
      author_or_review_status: 'PSC operational guide',
      status: 'published',
      tags,
      body_sections: [
        {title:'THE PROBLEM', text:problem},
        {title:'CHECK IT NOW', checklist:quick},
        {title:'WHAT GOOD LOOKS LIKE', text:good},
        {title:'WHEN ORDERING', text:ordering},
        {title:'NEXT ACTION', text:next}
      ],
      use_it_right: good,
      check_your_stock: quick.join(' · '),
      when_ordering: ordering,
      next_action: next,
      quick_check: quick,
      related_skus: related
    };
  }

  const EXTRA_GUIDES = [
    mkGuide('ws-011','first-aid-kit-is-a-container-not-a-specification','A First-Aid Kit Is a Container, Not a Specification','Product Basics','ON THE BENCH','Two kits can carry the same label and still contain very different stock.','A kit name does not tell you the quantities, sizes, sterile items, expiry profile or whether the contents are practical to refill.',[
      'Open the kit and compare the contents with the requirement.','Count the lines that have already been used.','Check sterile packs and visible expiry dates.','Note missing sizes or formats.','Check whether refills can be ordered as individual lines.'
    ],'A useful kit has a known contents list, intact stock and a clear refill route.','Ask for the contents list, quantities, sizes, sterile status where relevant, expiry-sensitive lines and refill basis.','Record the gaps. Refill the missing lines rather than treating the closed case as the product.', ['PSC-FAK-001'], ['first aid','kit','refill']),

    mkGuide('ws-012','five-minute-first-aid-kit-reset','The 5-Minute First-Aid Kit Reset','Clinic Checks','CHECK THIS','Open the kit before the missing item matters.','First-aid kits are easy to ignore because the case still looks complete from the outside.',[
      'Check the case and seal condition.','Compare the contents with the approved list.','Identify used or missing lines.','Check missing sizes or formats.','Review sterile packs and expiry dates.','Write down the refill quantity for each gap.'
    ],'The kit can be opened, checked and replenished without guessing what belongs inside.','Order the missing refill lines by exact product, size, sterile status and quantity.','Record the reset date and request only the lines that are genuinely missing.', ['PSC-FAK-001','PSC-WND-001','PSC-WND-002','PSC-WND-005','PSC-PPE-001'], ['first aid','check','refill']),

    mkGuide('ws-013','nebulizer-whole-system','Your Nebulizer Is Working. Do You Have the Whole System?','Equipment Readiness','CHECK THIS','The compressor can work perfectly while the usable system is still incomplete.','A nebulizer is a device plus the compatible chamber, tubing, mask or mouthpiece and replacement parts needed to use it.',[
      'Confirm the machine is present and identified.','Check the chamber or medication cup.','Check tubing condition and compatibility.','Check adult interface stock where required.','Check paediatric interface stock where required.','Check the filter or other replaceable parts listed by the manufacturer.'
    ],'The machine and its compatible accessories can be identified as one usable system.','Start with the exact machine model, then specify chamber, tubing, interface size and any model-specific replacement parts.','Replace the missing component; do not reorder the machine simply because an accessory is missing.', ['PSC-RES-001','PSC-RES-007'], ['nebulizer','respiratory','compatibility']),

    mkGuide('ws-014','dressing-trolley-reset','The Dressing-Trolley Reset','Clinic Checks','CHECK THIS','A trolley can look stocked while the useful lines are duplicated, depleted or in the wrong sizes.','The fastest way to understand a dressing trolley is to inspect the actual lines instead of assuming the trolley itself represents readiness.',[
      'Check dressings and sterile gauze.','Check plasters and tapes.','Check bandages and sizes.','Check scissors and trays.','Check glove stock.','Check antiseptic products.','Separate duplicates from genuinely low lines.'
    ],'The trolley has the required line types, sensible quantities and no obvious low-stock gap hidden behind duplicate items.','Order each depleted line by exact size, format, sterile status and pack quantity.','Record the low lines and replenish them as individual products.', ['PSC-WND-001','PSC-WND-002','PSC-WND-003','PSC-PPE-001','PSC-INF-001'], ['dressings','trolley','check']),

    mkGuide('ws-015','gauze-bandage-vs-elastic-vs-cohesive','Gauze Bandage vs Elastic vs Cohesive','What\'s the Difference?',"WHAT'S THE DIFFERENCE?",'These are not three names for the same roll.','Bandages can differ in material, stretch, self-adherence, intended product function, width and pack configuration.',[
      'Read the product name on the pack.','Check the material or construction.','Check whether it stretches.','Check whether it self-adheres.','Record the width and roll length.','Record pieces or rolls per pack.'
    ],'The procurement description makes it obvious which bandage type is being requested.','State bandage type, material or construction, width, length and pack quantity.','If the RFQ only says “bandage,” clarify it before quoting.', ['PSC-WND-003','PSC-WND-004'], ['bandage','comparison','specification']),

    mkGuide('ws-016','room-thermometer-vs-clinical-thermometer','Room Thermometer vs Clinical Thermometer','What\'s the Difference?',"WHAT'S THE DIFFERENCE?",'Both measure temperature, but they are not the same procurement line.','A clinical thermometer is selected for patient temperature measurement. A room or refrigerator monitoring device has a different job and specification.',[
      'Identify what is being measured.','Check the stated intended use.','Record the measurement range.','Check the display or min/max function required.','Check whether probes or covers are part of the system.'
    ],'The product type follows the measurement job rather than the generic word “thermometer.”','State intended use, measurement method, required range, display/recording features and compatible consumables where relevant.','Split the RFQ into separate lines when the clinic needs both patient and environmental temperature equipment.', ['PSC-DIA-002','PSC-BAS-003'], ['thermometer','comparison','monitoring']),

    mkGuide('ws-017','expiry-isnt-only-a-medicine-problem','Expiry Isn\'t Only a Medicine Problem','Stock & Expiry','CHECK THIS','Expiry-controlled stock is spread across more of the clinic than the medicine cabinet.','Sterile products, test strips, solutions, first-aid contents and replacement components may all carry dates that affect readiness.',[
      'Scan medicines and solutions.','Check sterile dressings and procedure stock.','Check diagnostic strips or test consumables.','Check first-aid kit contents.','Check emergency replacement components with dated labels.','List anything approaching the clinic review threshold.'
    ],'Expiry control covers every dated line that matters to the clinic, not just medicines.','Ask suppliers for usable remaining shelf life where it matters and record expiry-driven lines on receipt.','Create one action list for the dated products that need use, replacement or verification.', ['PSC-WND-002','PSC-DBT-004'], ['expiry','stock','sterile']),

    mkGuide('ws-018','opened-is-a-date-too','Opened Is a Date Too','Stock & Expiry','WHY DOES THIS MATTER?','Some products acquire a second date once the pack is opened.','Where the manufacturer specifies an after-opening limit, the opening event becomes part of the product record. There is no universal period.',[
      'Identify opened multi-use products.','Check the manufacturer instructions for any after-opening limit.','Confirm whether the opening date is recorded.','Check whether the container remains identifiable.','Remove assumptions that use the same period for every product.'
    ],'Where an after-opening limit applies, the clinic can tell when the item was opened and what instruction governs the usable period.','Do not invent a generic after-opening duration; retain the specific product instructions and pack identification.','Record the opening date where the product instructions require it, or verify the rule before continuing use.', [], ['opened date','expiry','record']),

    mkGuide('ws-019','tomorrow-is-sports-day','Tomorrow Is Sports Day. What Leaves the Clinic?','School Clinic','CHECK THIS','Events temporarily move useful stock away from the clinic and can create gaps in both places.','Sports-day preparation is an inventory movement problem as much as a packing problem.',[
      'List the approved stock that needs to travel.','Record the quantities leaving the clinic.','Check expiry-sensitive items.','Identify reusable equipment separately.','Leave required clinic stock behind.','Plan the return and reconciliation after the event.'
    ],'The event kit is prepared against the school protocol without unintentionally emptying the clinic.','Build the event requirement from exact catalogue lines and quantities approved by the school.','Issue the kit, record what left, then reconcile used, opened, returned and damaged items afterwards.', ['PSC-WND-005','PSC-PPE-001','PSC-DIA-001'], ['school','sports day','event kit']),

    mkGuide('ws-020','field-trip-medical-bag','The Field-Trip Medical Bag','School Clinic','CHECK THIS','A trip bag should not be treated as a smaller copy of the clinic cupboard.','The travelling requirement depends on the school protocol, destination, duration, student-specific requirements and what must remain at school.',[
      'Confirm the approved trip stock list.','Record quantities packed.','Check expiry-sensitive items.','Separate student-specific supplies.','Identify reusable equipment.','Record what returns after the trip.'
    ],'The bag has a documented contents list and the clinic can reconcile what left and what came back.','Quote exact lines and quantities rather than a generic “trip bag” unless a controlled contents list is attached.','Reconcile used, opened, missing and reusable items after the trip, then refill only what changed.', ['PSC-FAK-001','PSC-WND-005','PSC-PPE-001'], ['school','field trip','bag']),

    mkGuide('ws-021','one-school-four-first-aid-locations','One School, Four First-Aid Locations','School Clinic','WHY DOES THIS MATTER?','Clinic, PE area, bus and activity space do not automatically need identical stock.','A generic kit copied into every location can create both gaps and unnecessary duplication.',[
      'List every first-aid location.','Record what each location currently holds.','Compare the contents with the school requirement or protocol.','Identify lines that are duplicated without purpose.','Identify locations missing required stock.'
    ],'Each location has a defined contents list that fits its role and can be refilled deliberately.','Quote by location or kit type when the contents differ; do not hide the differences inside one generic kit line.','Create a simple location-by-location refill list.', ['PSC-FAK-001'], ['school','first aid','locations']),

    mkGuide('ws-022','dont-ask-for-a-wheelchair','Don\'t Ask for “a Wheelchair”','Ordering & Specifications',"DON'T ORDER IT LIKE THIS",'A wheelchair is not a complete institutional specification.','Seat size, load rating, frame, folding format, brakes, footrests and intended institutional use can all change the product being quoted.',[
      'Confirm the intended institutional use.','Record required seat width.','Record load requirement.','Check folding or storage requirement.','Check brakes and footrests.','Confirm warranty and model at quotation.'
    ],'The RFQ gives suppliers enough information to quote comparable models instead of whichever wheelchair happens to be available.','State seat width, load rating, folding requirement, brakes, footrests, intended use and any required accessories.','Clarify the specification before comparing prices.', ['PSC-EQP-006'], ['wheelchair','RFQ','specification']),

    mkGuide('ws-023','pack-piece-box-bag-or-set','Pack, Piece, Box, Bag or Set?','Ordering & Specifications',"DON'T ORDER IT LIKE THIS",'The smallest unit word in an RFQ can change the quantity dramatically.','One “box” may contain 10, 50 or 100 pieces. A “set” can mean a defined collection rather than a countable piece.',[
      'Find the supplier selling unit.','Record pieces per pack or box.','Check whether the RFQ quantity means pieces or packs.','For sets, record what the set contains.','Check the conversion before pricing.'
    ],'Requested quantity, selling unit and pack conversion are all explicit.','Use product + pack/unit + units per pack + required quantity.','Resolve the unit conversion before the quote leaves PSC.', ['PSC-WND-001','PSC-PPE-001','PSC-DBT-004'], ['pack','unit','RFQ']),

    mkGuide('ws-024','otoscope-uses-consumables-too','Your Otoscope Uses Consumables Too','Product Basics','ON THE BENCH','The reusable instrument is only part of the supply requirement.','Otoscope use can depend on compatible specula, batteries or charging arrangements and model-specific replacement parts.',[
      'Identify the exact otoscope model.','Check the specula type used with it.','Check reusable versus single-use specula policy.','Check battery or charging setup.','Record the replacement route for compatible parts.'
    ],'The clinic can identify the device and obtain the compatible items it needs without guessing.','Start with the exact model, then specify compatible specula and power/charging requirements.','Add the compatible consumable line to the replenishment list where relevant.', ['PSC-DIA-007'], ['otoscope','ENT','consumables']),

    mkGuide('ws-025','open-your-spill-kit','Open Your Spill Kit Before You Need It','Clinic Checks','CHECK THIS','A sealed-looking spill kit can still be incomplete after one item has been removed.','Readiness depends on location, contents and a clear replacement route.',[
      'Confirm where the kit is stored.','Open it and compare contents with its list.','Check whether any line has been removed.','Check dated contents where applicable.','Identify who is responsible for replacement.'
    ],'The kit location is known, contents are complete and missing items have a defined refill route.','Quote the controlled kit contents or exact refill lines; do not assume every spill kit contains the same components.','Replace the missing component and record the reset.', ['PSC-WST-004','PSC-PPE-001'], ['spill kit','check','infection control']),

    mkGuide('ws-026','friday-clinic-reset','The Friday Clinic Reset','Clinic Checks','CHECK THIS','A short recurring check can catch small supply problems before they become Monday problems.','The value is not a giant audit. It is a repeatable ten-minute habit focused on the things most likely to change during the week.',[
      'Check used first-aid stock.','Check low recurring consumables.','Scan expiry-driven lines due for action.','Confirm emergency equipment is present and complete.','Review refrigerator or temperature records where applicable.','Look ahead to next week’s activities or events.'
    ],'The clinic finishes the week with a short action list rather than an unexplained pile of low stock.','Turn only the identified gaps into replenishment lines and keep unusual requirements separate.','Record replenish / verify / replace / no action against each exception.', ['PSC-PPE-001','PSC-WND-001','PSC-WND-005'], ['weekly check','school clinic','replenishment']),

    mkGuide('ws-027','school-holidays-change-the-reorder-point','School Holidays Change the Reorder Point','Stock & Expiry','WHY DOES THIS MATTER?','A reorder point that works during term can create unnecessary stock before a long closure.','Usage, inbound stock, pack quantity, lead time and the school calendar belong in the same replenishment decision.',[
      'Check current on-hand quantity.','Review recent consumption.','Check existing inbound orders.','Note supplier lead time.','Check the next closure or holiday period.','Review expiry before increasing cover.'
    ],'Replenishment reflects actual timing instead of automatically replacing every low-looking box.','Order against quantity, pack size, lead time and the period the clinic must cover.','Adjust the replenishment decision before long closures rather than after the order is placed.', [], ['school holidays','reorder','stock']),

    mkGuide('ws-028','back-to-school-clinic-reset','The Back-to-School Clinic Reset','School Clinic','CHECK THIS','A long closure can hide expired, depleted or incomplete clinic stock until the first busy week of term.','The reset is a structured exception check before students return.',[
      'Scan expiry-sensitive stock.','Check recurring consumables.','Check first-aid locations and refills.','Check emergency equipment and replacement parts.','Check student-specific supplies under the school process.','Check stock damaged or depleted over closure.'
    ],'The clinic opens term with a known list of exceptions and replenishment actions.','Keep capital replacements, recurring consumables and regulated lines separate so each can follow the right supply route.','Complete the reset early enough to source exceptions before the first high-demand week.', ['PSC-FAK-001','PSC-PPE-001','PSC-WND-002'], ['school','back to school','reset']),

    mkGuide('ws-029','syringe-isnt-just-five-ml','A Syringe Isn\'t Just “5 mL”','Product Basics','ON THE BENCH','Capacity is only one field on the line.','Sterile status, luer type, needle/no needle, graduation and pack quantity can all change what is actually supplied.',[
      'Confirm nominal capacity.','Check sterile single-use status.','Identify the tip or luer type.','Confirm whether a needle is included.','Record graduation requirements where relevant.','Record units per box.'
    ],'The syringe line can be compared like-for-like because the configuration is explicit.','State capacity, sterile status, tip type, needle inclusion and pack quantity.','Clarify any missing field before accepting an “equivalent” product.', ['PSC-DSP-002','PSC-DSP-003'], ['syringe','disposable','specification']),

    mkGuide('ws-030','fefo-in-one-shelf','FEFO in One Shelf','Stock & Expiry','CHECK THIS','The same product can have several expiry dates on the same shelf.','First-expiry-first-out is easiest to understand as a physical shelf habit: the earliest usable expiry should be the easiest stock to take first.',[
      'Pick one repeated product line.','Read the expiry date on each pack.','Separate damaged or unusable packs.','Place the earlier usable expiry in front.','Keep later expiry behind it.','Repeat the check when new stock arrives.'
    ],'The shelf order makes the next pack to use obvious without needing a spreadsheet for every movement.','On receipt, record expiry-sensitive batches where needed and avoid mixing new stock in front of earlier usable stock.','Reorder the shelf and flag any near-expiry stock that needs a separate action.', [], ['FEFO','expiry','stock rotation'])
  ];

  const EXISTING_PATCHES = {
    'which-glove-should-i-actually-wear': {related_skus:['PSC-PPE-001','PSC-PPE-002'], next_action:'Confirm the task, material, size and pack before replenishing.', quick_check:['Check the glove material.','Check the size mix actually used.','Check sterile versus non-sterile status.','Check box quantity.','Check stock by size, not only total boxes.']},
    'disinfectant-contact-time-trap': {related_skus:['PSC-INF-001','PSC-BAS-005'], next_action:'Verify the exact product instructions and keep the correct contact-time information with the product.'},
    'sterile-vs-non-sterile-not-quality-grades': {related_skus:['PSC-WND-001','PSC-WND-002'], next_action:'Keep sterile and non-sterile lines separate in the RFQ.'},
    'three-ply-mask-isnt-a-specification': {related_skus:['PSC-PPE-003'], next_action:'Clarify the mask specification before comparing prices.'},
    'pulse-oximeter-number-can-mislead': {related_skus:['PSC-DIA-001'], next_action:'Verify the device, signal conditions and model requirements before replacing it.'},
    'bp-monitor-check-the-cuff': {related_skus:['PSC-DIA-003'], next_action:'Record the cuff requirement with the monitor model before reordering.'},
    'oxygen-cylinder-is-not-an-oxygen-system': {related_skus:['PSC-OXY-001','PSC-RES-004','PSC-RES-005'], next_action:'Check the whole oxygen setup, then request only the missing or unsuitable component.', quick_check:['Cylinder identified and secured.','Regulator / flow control identified.','Tubing and interface available.','Adult / paediatric provision checked where required.','Fill or refill status known.']},
    'forgotten-glucose-meter-test-control-solution': {related_skus:['PSC-DBT-001','PSC-DBT-004'], next_action:'Keep the meter, strips and compatible control material tied to the same system.'},
    'aed-has-expiring-parts-too': {related_skus:[], next_action:'Record the replacement status for dated components and request the exact compatible part.', quick_check:['Device present in the expected location.','Pad status recorded.','Battery replacement status recorded.','Accessories present.','Status indicator checked.','Next replacement or review dates recorded.']},
    'ten-minute-school-clinic-stock-expiry-walk': {related_skus:[], next_action:'Turn exceptions into a short replenish / replace / verify list.', quick_check:['Emergency items present.','Sterile and expiry-driven stock checked.','Testing consumables checked.','Recurring consumables checked.','Next action written down.']}
  };

  function patchWorkshopData(){
    const arr = Array.isArray(window.PSC_WORKSHOP) ? window.PSC_WORKSHOP : null;
    if(!arr || arr.__v3926Patched) return false;
    arr.__v3926Patched = true;

    for(const g of arr){
      const patch = EXISTING_PATCHES[g.slug];
      if(patch) Object.assign(g, patch);
    }
    const existing = new Set(arr.map(g=>g.slug));
    for(const g of EXTRA_GUIDES){
      if(!existing.has(g.slug)) arr.push(g);
    }
    return true;
  }

  function route(){ return String(location.hash||'').replace(/^#/,'').replace(/^\//,''); }

  function simplifyContact(){
    if(route()!=='contact') return;
    const page = document.querySelector('main.publicPage');
    if(!page || page.dataset.v3926Contact==='1') return;
    page.dataset.v3926Contact='1';
    const lead = page.querySelector('.publicPageHero > p');
    if(lead) lead.textContent = CONTACT_COPY;
    const intro = page.querySelector('.prospectSection .prospectIntro');
    if(intro) intro.remove();
  }

  function guideFromRoute(){
    const r=route();
    if(!r.startsWith('workshop/')) return null;
    const slug=decodeURIComponent(r.slice('workshop/'.length));
    return (window.PSC_WORKSHOP||[]).find(g=>g.slug===slug)||null;
  }

  function productBySku(sku){
    const list=window.PSC_DATA?.products||[];
    return list.find(p=>p.pscSku===sku)||null;
  }

  function strictRelatedHtml(g){
    const skus=Array.isArray(g.related_skus)?g.related_skus.filter(Boolean):[];
    const products=skus.map(productBySku).filter(Boolean).slice(0,6);
    if(!products.length) return '';
    return `<section class="workshopRelated v3926StrictRelated"><div class="workshopRelatedHead"><span>PRODUCTS USED IN THIS CHECK</span><p>Only catalogue lines directly involved in this guide are shown here.</p></div><div class="workshopRelatedList">${products.map(p=>`<button data-public-product-view="${esc(p.pscSku)}"><span>${esc(p.pscSku)}</span><b>${esc(p.catalogueDisplayName||p.name)}</b><small>${esc(p.cataloguePack||p.pack||'Pack to confirm')}</small></button>`).join('')}</div></section>`;
  }

  function actionViewHtml(g){
    const check = g.check_your_stock || (Array.isArray(g.quick_check)?g.quick_check.join(' · '):'Physically check the item, its stock and the exact product details before the next order.');
    const good = g.use_it_right || 'The clinic can identify the product, its purpose and the details that make it usable.';
    const ordering = g.when_ordering || 'Use the exact product specification, pack or unit and compatibility information that applies.';
    const next = g.next_action || 'Record the exception, then replenish, replace, verify or take no action as appropriate.';
    return `<section class="v3926ActionView" aria-label="Workshop action view">
      <article><span>THE PROBLEM</span><p>${esc(g.excerpt||g.subtitle||'')}</p></article>
      <article><span>CHECK IT NOW</span><p>${esc(check)}</p></article>
      <article><span>WHAT GOOD LOOKS LIKE</span><p>${esc(good)}</p></article>
      <article><span>WHEN ORDERING</span><p>${esc(ordering)}</p></article>
      <article><span>NEXT ACTION</span><p>${esc(next)}</p></article>
    </section>`;
  }

  function quickCheckHtml(g){
    const items=Array.isArray(g.quick_check)?g.quick_check.filter(Boolean):[];
    if(!items.length) return '';
    return `<section class="v3926QuickCheck" hidden><div class="v3926QuickCheckHead"><span>DO THIS NOW</span><h2>${esc(g.title)}</h2><p>${items.length} quick checks. This is a readiness / procurement check, not clinical instruction.</p></div><div class="v3926CheckList">${items.map((x,i)=>`<label><input type="checkbox"><span><b>${String(i+1).padStart(2,'0')}</b>${esc(x)}</span></label>`).join('')}</div><div class="v3926QuickCheckFoot"><b>Anything missing?</b><span>Record it, replenish it, replace it or verify it before the next order.</span></div></section>`;
  }

  function enhanceWorkshopArticle(){
    const g=guideFromRoute();
    const article=document.querySelector('.workshopArticlePage .workshopArticle');
    if(!g || !article) return;

    const meta=article.querySelector('.workshopArticleMeta');
    if(meta){
      const spans=[...meta.querySelectorAll('span')];
      if(spans[1]) spans[1].textContent=`Updated ${g.last_reviewed||UPDATED}`;
      if(spans[2] && /source\/review|record to be completed|editorial first version/i.test(spans[2].textContent)) spans[2].remove();
    }

    if(!article.querySelector('.v3926ActionView')){
      const header=article.querySelector('.workshopArticleHeader');
      if(header) header.insertAdjacentHTML('afterend', actionViewHtml(g));
    }

    const oldRelated=article.querySelector('.workshopRelated');
    if(oldRelated && !oldRelated.classList.contains('v3926StrictRelated')) oldRelated.remove();
    if(!article.querySelector('.v3926StrictRelated')){
      const note=article.querySelector('.workshopMedicalNote');
      const html=strictRelatedHtml(g);
      if(note && html) note.insertAdjacentHTML('beforebegin',html);
    }

    const actions=article.querySelector('.workshopArticleActions');
    if(actions && Array.isArray(g.quick_check) && g.quick_check.length && !actions.querySelector('[data-v3926-run-check]')){
      actions.insertAdjacentHTML('beforeend','<button class="v3926RunCheck" data-v3926-run-check>Run this check</button>');
    }
    if(Array.isArray(g.quick_check) && g.quick_check.length && !article.querySelector('.v3926QuickCheck')){
      const actionView=article.querySelector('.v3926ActionView');
      if(actionView) actionView.insertAdjacentHTML('afterend',quickCheckHtml(g));
    }

    const mail=article.querySelector('.workshopMailAction');
    if(mail){
      if(g.category==='Equipment Readiness') mail.textContent='Email this equipment check';
      else if(g.category==='Ordering & Specifications') mail.textContent='Send as RFQ prompt';
      else if(g.category==='Clinic Checks'||g.category==='Stock & Expiry') mail.textContent='Email this action list';
      else mail.textContent='Create email from guide';
    }
  }

  function enhanceWorkshopLanding(){
    if(route()!=='workshop') return;
    const page=document.querySelector('.workshopPage:not(.workshopArticlePage)');
    if(!page) return;
    const heroCopy=page.querySelector('.workshopHeroCopy p');
    if(heroCopy) heroCopy.textContent='Small, practical guides that help you check something, choose between things, specify a line properly or decide what needs action.';
    const principle=page.querySelector('.workshopPrinciple p');
    if(principle) principle.textContent='Every guide should change an action: check it, choose it, specify it, replenish it or verify it. If it cannot do that, it does not belong here.';
  }

  function bind(){
    document.addEventListener('click',e=>{
      const btn=e.target.closest('[data-v3926-run-check]');
      if(!btn) return;
      const article=btn.closest('.workshopArticle');
      const panel=article?.querySelector('.v3926QuickCheck');
      if(!panel) return;
      const open=panel.hasAttribute('hidden');
      if(open){ panel.removeAttribute('hidden'); btn.textContent='Hide check'; panel.scrollIntoView({behavior:'smooth',block:'start'}); }
      else{ panel.setAttribute('hidden',''); btn.textContent='Run this check'; }
    });
  }

  let queued=false;
  function apply(){
    queued=false;
    simplifyContact();
    enhanceWorkshopLanding();
    enhanceWorkshopArticle();
  }
  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(apply);
  }

  patchWorkshopData();
  bind();

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{
    patchWorkshopData();
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    schedule();
  },{once:true});
  else{
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    schedule();
  }

  const app=document.getElementById('app');
  if(app) window.PSC_ENHANCEMENTS.createObserver(schedule).observe(app,{childList:true,subtree:true});
  window.addEventListener('hashchange',schedule);
})();
