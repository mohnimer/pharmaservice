(() => {
  'use strict';

  const VERSION = 'v39.16-family-hierarchy';
  const familyState = { rows: [], approvedOptions: [], fixedPrices: [], availability: [], loaded: false, source: 'none' };
  const NEED_MAP = {
    'Cuts, Wounds & Burns': 'wounds',
    'Sports Injuries & Musculoskeletal': 'sports',
    'Breathing, Allergy & Oxygen': 'breathing',
    'Vitals & Clinical Assessment': 'vitals',
    'Eyes, Ears & Screening': 'screening',
    'Diabetes & Blood Glucose': 'diabetes',
    'Fever, Pain & Common Symptoms': 'medicines',
    'Skin, Bites & Topical Care': 'allergy',
    'Stomach, Nausea & Hydration': 'patient-care',
    'Patient Care & Hygiene': 'patient-care',
    'Infection Prevention & PPE': 'infection',
    'Procedures & Clinical Consumables': 'procedures',
    'Emergency & Resuscitation': 'emergency',
    'Equipment, Mobility & Clinic Setup': 'equipment'
  };
  const NEED_ART = {
    wounds:'/assets/category-wounds.webp?v=3777', sports:'/assets/category-sports.png?v=3915', breathing:'/assets/category-breathing.webp?v=3777', vitals:'/assets/category-vitals.webp?v=3777',
    screening:'/assets/category-screening.png?v=3915', diabetes:'/assets/category-diabetes.png?v=3915', medicines:'/assets/category-medicines.png?v=3915', allergy:'/assets/category-allergy.png?v=3915',
    'patient-care':'/assets/category-patient-care.png?v=3915', infection:'/assets/category-infection.png?v=3915', procedures:'/assets/category-procedures.png?v=3915', emergency:'/assets/category-emergency.webp?v=3777', equipment:'/assets/category-equipment.webp?v=3777'
  };
  const NEED_STYLE = {
    wounds: ['#FF8B7B','#53221B'], sports: ['#9180F4','#211A5C'], breathing: ['#9EB8F7','#173D70'],
    vitals: ['#FFB17E','#5A2A10'], screening: ['#F6CB75','#4B3A08'], diabetes: ['#9DDAC7','#174B3C'],
    medicines: ['#F7A7B8','#5A2030'], allergy: ['#CDBAF7','#39245E'], 'patient-care': ['#FFD28F','#53350E'],
    infection: ['#8FD8D3','#104D49'], procedures: ['#AEC1F7','#233D72'], emergency: ['#FFA08B','#5B2118'],
    equipment: ['#DDBA9B','#4A3323'], all: ['#F5D37E','#45350A']
  };

  const esc = (v='') => String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[c]));
  const route = () => location.hash ? location.hash.slice(1) : location.pathname.replace(/^\/+|\/+$/g,'');
  const needIdFor = row => row.clinical_need_id || NEED_MAP[String(row.clinical_need||'').trim()] || 'all';
  const approvedSearchTerms = familyId => familyState.approvedOptions.filter(o=>o.family_id===familyId).flatMap(o=>[o.brand,o.exact_product_name,o.presentation,o.pack]).filter(Boolean);
  const familySearch = row => [row.family_id,row.family_name,row.clinical_need,row.page_type,row.availability_wording,row.website_price_treatment,row.common_brands_line,row.prominent_brand,...(Array.isArray(row.presentations)?row.presentations:[]),...approvedSearchTerms(row.family_id)].filter(Boolean).join(' ').toLowerCase();
  const isMedicine = row => String(row.page_type||'').toUpperCase() === 'MEDICINE FAMILY';
  const familyPrice = row => familyState.fixedPrices.find(x=>x.family_id===row.family_id)||null;
  const aed = value => `AED ${Number(value).toLocaleString('en-AE',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const safePriceLabel = row => {
    if(isMedicine(row) || !String(row.website_price_treatment||'').toLowerCase().includes('fixed')) return 'Request quote';
    const price=familyPrice(row);
    if(!price || price.min_price_ex_vat===null) return 'Fixed price after approval';
    const min=Number(price.min_price_ex_vat), max=Number(price.max_price_ex_vat);
    if(Number.isFinite(min) && Number.isFinite(max) && Math.abs(max-min)>0.0001) return `From ${aed(min)} ex VAT`;
    return `${aed(min)} ex VAT`;
  };
  const neutralRequirement = row => String(row.dha_badge||'').trim().toLowerCase()==='dha requirement' || /\bdha\b/i.test(String(row.requirement_reference||''));
  const familyAvailability = row => familyState.availability.find(x=>x.family_id===row.family_id)||null;
  const safeFallbackAvailability = row => {
    const raw=String(row.availability_wording||'').trim();
    if(/^quoted to order$/i.test(raw)) return 'Quoted to order';
    if(/^source on request$/i.test(raw)) return 'Source on request';
    return 'Availability confirmed at quotation';
  };
  const safeAvailabilityLabel = row => familyAvailability(row)?.availability_label || safeFallbackAvailability(row);

  function normalizeSupabaseRow(r){
    return {
      family_id:r.family_id,
      clinical_need:r.clinical_need,
      family_name:r.family_name,
      page_type:r.page_type,
      dha_badge:r.dha_badge,
      dha_status:r.dha_status,
      requirement_reference:r.requirement_reference,
      brand_selector_mode:r.brand_selector_mode,
      default_brand_choice:r.default_brand_choice,
      prominent_brand:r.prominent_brand,
      common_brands_line:r.common_brands_line,
      presentations:Array.isArray(r.presentations)?r.presentations:[],
      website_price_treatment:r.website_price_treatment,
      availability_wording:r.availability_wording,
      portal_treatment:r.portal_treatment,
      commercial_specification:r.commercial_specification,
      order_pack_basis:r.order_pack_basis,
      exact_controlled_wording:r.exact_controlled_wording
    };
  }

  function normalizeFallbackRow(r){
    return {
      family_id:r.familyId,
      clinical_need:r.clinicalNeed,
      clinical_need_id:r.clinicalNeedId,
      family_name:r.familyName,
      page_type:r.pageType,
      dha_badge:r.dhaBadge,
      dha_status:r.dhaStatus,
      requirement_reference:r.requirementReference,
      brand_selector_mode:r.brandSelectorMode,
      default_brand_choice:r.defaultBrandChoice,
      prominent_brand:r.prominentBrand,
      common_brands_line:r.commonBrandsLine,
      presentations:Array.isArray(r.presentations)?r.presentations:[],
      website_price_treatment:r.websitePriceTreatment,
      availability_wording:r.availabilityWording,
      portal_treatment:r.portalTreatment,
      commercial_specification:r.commercialSpecification,
      order_pack_basis:r.orderPackBasis,
      exact_controlled_wording:r.exactControlledWording
    };
  }

  async function loadFamilies(){
    const sb=window.PSC_SUPABASE;
    if(sb){
      try{
        const [{data,error},{data:approved,error:optionError},{data:fixedPrices,error:priceError},{data:availability,error:availabilityError}]=await Promise.all([
          sb.from('catalogue_family_public').select('family_id,clinical_need,family_name,page_type,dha_badge,dha_status,requirement_reference,brand_selector_mode,default_brand_choice,prominent_brand,common_brands_line,presentations,website_price_treatment,availability_wording,portal_treatment,commercial_specification,order_pack_basis,exact_controlled_wording').order('clinical_need').order('family_name'),
          // Search aliases come ONLY from the approval-gated public option view.
          sb.from('catalogue_product_option_public').select('family_id,exact_product_name,brand,presentation,pack'),
          // Fixed prices come ONLY from the commercial release-gated public view. No supplier cost or MRP is exposed.
          sb.from('catalogue_family_price_public').select('family_id,min_price_ex_vat,max_price_ex_vat,priced_option_count,earliest_valid_to'),
          // Availability comes from a derived public view. Raw supplier stock/evidence remains internal.
          sb.from('catalogue_family_availability_public').select('family_id,availability_state,availability_label,verified_at,valid_until')
        ]);
        if(error) throw error;
        if(optionError) throw optionError;
        if(priceError) throw priceError;
        if(availabilityError) throw availabilityError;
        if(Array.isArray(data) && data.length){
          familyState.rows=data.map(normalizeSupabaseRow);
          familyState.approvedOptions=Array.isArray(approved)?approved:[];
          familyState.fixedPrices=Array.isArray(fixedPrices)?fixedPrices:[];
          familyState.availability=Array.isArray(availability)?availability:[];
          familyState.loaded=true;
          familyState.source='supabase';
          return;
        }
      }catch(e){ console.warn('PSC family catalogue Supabase load failed; using frozen fallback.',e?.message||e); }
    }
    const fallback=window.PSC_FAMILY_CATALOGUE_V39?.families;
    familyState.rows=Array.isArray(fallback)?fallback.map(normalizeFallbackRow):[];
    familyState.approvedOptions=[];
    familyState.fixedPrices=[];
    familyState.availability=[];
    familyState.loaded=true;
    familyState.source=familyState.rows.length?'frozen-fallback':'none';
  }

  function currentNeed(){
    const r=route();
    if(r.startsWith('portal/catalogue/')) return r.split('/')[2]||'all';
    if(r.startsWith('catalogue/')) return r.split('/')[1]||'all';
    if(r==='catalogue') return 'all';
    return null;
  }

  function familyCard(row){
    const need=needIdFor(row), [bg,ink]=NEED_STYLE[need]||NEED_STYLE.all;
    const type=isMedicine(row)?'Medicine family':'Product family';
    const publishedPrice=familyPrice(row);
    const priceLabel=safePriceLabel(row);
    const art=NEED_ART[need]||'';
    const sub=row.order_pack_basis || row.common_brands_line || safeAvailabilityLabel(row);
    return `<button type="button" class="pscFamilyReadCard pscFamilyReadCardReady" style="--family-bg:${bg};--family-ink:${ink}" data-psc-family-card data-psc-family-open="${esc(row.family_id)}" data-search="${esc(familySearch(row))}">
      <span class="pscFamilyCardArt" aria-hidden="true">${art?`<img src="${art}" alt="" loading="lazy" decoding="async">`:''}</span>
      <span class="pscFamilyCardType">${esc(type)}</span>
      <span class="pscFamilyCardTitle">${esc(row.family_name)}</span>
      ${sub?`<span class="pscFamilyCardSub">${esc(sub)}</span>`:''}
      <span class="pscFamilyCardFoot"><b class="${publishedPrice?'pscFamilyLivePrice':''}">${esc(priceLabel)}</b><i>Open family →</i></span>
      ${neutralRequirement(row)?'<small class="pscFamilyDhaMini">DHA requirement</small>':''}
    </button>`;
  }

  function familyLayer(need){
    const rows=familyState.rows.filter(r=>need==='all'||needIdFor(r)===need);
    if(!rows.length) return '';
    const first=rows[0];
    return `<section class="pscFamilyReadLayer" data-psc-family-layer data-version="${VERSION}">
      <div class="pscFamilyReadHead"><div><span class="eyebrow">PRODUCT FAMILIES</span><h2>${esc(first?.clinical_need||'Controlled product families')}</h2><p>Choose the family first. Exact brand, model or presentation is handled inside the family where it matters.</p></div><div class="pscFamilyReadCount"><b data-psc-family-count>${rows.length}</b><span>families</span></div></div>
      <div class="pscFamilyReadGrid">${rows.map(familyCard).join('')}</div>
      <div class="pscFamilyReadEmpty" data-psc-family-empty hidden>No product families match that search.</div>
    </section>`;
  }

  function install(){
    if(!familyState.loaded) return;
    const need=currentNeed();
    if(need===null || need==='all') return;
    const existing=document.querySelector('[data-psc-family-layer]');
    if(existing) return;
    const html=familyLayer(need);
    if(!html) return;
    const publicAnchor=document.querySelector('.publicCatalogueResults');
    const portalAnchor=document.querySelector('.shopNotice.compactInstitutionalNotice');
    const anchor=publicAnchor||portalAnchor;
    if(!anchor) return;
    anchor.insertAdjacentHTML('beforebegin',html);
    const search=document.querySelector('[data-cat-q]')||document.querySelector('[data-global-search]');
    filterFamilies(search?.value||'');
  }

  function filterFamilies(query){
    const term=String(query||'').trim().toLowerCase();
    let visible=0;
    document.querySelectorAll('[data-psc-family-card]').forEach(card=>{
      const hit=!term || (card.dataset.search||'').includes(term);
      card.hidden=!hit;
      if(hit) visible++;
    });
    const count=document.querySelector('[data-psc-family-count]'); if(count) count.textContent=visible;
    const empty=document.querySelector('[data-psc-family-empty]'); if(empty) empty.hidden=visible!==0;
  }

  let raf=0;
  function schedule(){
    if(raf) return;
    raf=requestAnimationFrame(()=>{raf=0;install();});
  }

  document.addEventListener('input',e=>{
    if(e.target?.matches?.('[data-cat-q],[data-global-search]')) filterFamilies(e.target.value);
  },true);
  window.addEventListener('hashchange',schedule);
  window.addEventListener('popstate',schedule);
  new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});

  loadFamilies().finally(schedule);
})();
