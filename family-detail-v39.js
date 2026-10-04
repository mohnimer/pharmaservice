(() => {
  'use strict';

  const DRAFT_KEY='pscFamilyQuoteDraftV1';
  const state={familyId:'',family:null,options:[],prices:[],availability:null,optionAvailability:[],presentation:'',brandMode:'no-preference',optionId:'',otherBrand:'',open:false,loading:false};
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[c]));
  const upper=v=>String(v||'').trim().toUpperCase();
  const aed=v=>`AED ${Number(v).toLocaleString('en-AE',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  const ASSET_RELEASE='3777';
  function familyCatalogueProducts(f){
    const rows=Array.isArray(window.PSC_DATA?.products)?window.PSC_DATA.products:[];
    return rows.filter(p=>String(p?.catalogueParentId||'')===String(f?.family_id||'') && p?.catalogueVisible!==false);
  }
  function familyProductImage(p){
    const tx=String(p?.catalogueTransactionId||p?.pscSku||'').trim().toLowerCase();
    if(/^inst-\d{4}$/.test(tx)) return `/assets/products/${tx}.webp?v=${ASSET_RELEASE}`;
    const raw=String(p?.imageUrl||p?.image_url||'').trim();
    return raw || '/assets/products/clinic-basics.jpg';
  }
  function familyPreview(f){
    const rows=familyCatalogueProducts(f);
    const primary=rows[0]||null;
    const image=familyProductImage(primary);
    return {
      image,
      title:String(primary?.catalogueDisplayName||primary?.name||f?.family_name||'Catalogue family'),
      pack:String(primary?.cataloguePack||primary?.pack||f?.order_pack_basis||'Pack / unit to confirm'),
      gallery:rows.slice(0,5).map(x=>({url:familyProductImage(x),alt:String(x?.catalogueDisplayName||x?.name||f?.family_name||'Catalogue preview')}))
    };
  }

  function fallbackFamily(id){
    const rows=window.PSC_FAMILY_CATALOGUE_V39?.families||[];
    const r=rows.find(x=>x.familyId===id);
    if(!r) return null;
    return {
      family_id:r.familyId,clinical_need:r.clinicalNeed,family_name:r.familyName,page_type:r.pageType,
      dha_badge:r.dhaBadge,dha_status:r.dhaStatus,requirement_reference:r.requirementReference,
      brand_selector_mode:r.brandSelectorMode,default_brand_choice:r.defaultBrandChoice,
      prominent_brand:r.prominentBrand,common_brands_line:r.commonBrandsLine,
      presentations:Array.isArray(r.presentations)?r.presentations:[],website_price_treatment:r.websitePriceTreatment,
      availability_wording:r.availabilityWording,portal_treatment:r.portalTreatment,
      commercial_specification:r.commercialSpecification,order_pack_basis:r.orderPackBasis,
      exact_controlled_wording:r.exactControlledWording
    };
  }

  function familyKind(f){
    if(upper(f?.page_type)==='MEDICINE FAMILY') return 'medicine';
    if(String(f?.portal_treatment||'').toLowerCase().includes('pass-through')) return 'specialist';
    if(upper(f?.page_type)==='QUOTE-LED PRODUCT FAMILY') return 'equipment';
    const spec=String(f?.commercial_specification||'').toLowerCase();
    if(/compatib|matched to|selected (device|dispenser|thermometer|set)|replacement cartridge|probe cover/.test(spec)) return 'compatibility';
    return 'standard';
  }

  function selectorAllowed(f){
    const mode=upper(f?.brand_selector_mode);
    if(familyKind(f)==='medicine') return true;
    return !mode.includes('HIDDEN') && !mode.includes('NOT NEEDED');
  }

  function presentationLabel(f,x){
    if(f?.family_id==='PSC-IS-073') return ({'Tablets':'10 mg tablets','Drops':'Oral drops','Oral solution':'Oral solution'})[x]||x;
    return x;
  }

  function optionPrice(o){
    return state.prices.find(p=>p.product_option_id===o.product_option_id)||null;
  }

  function optionLabel(o,f){
    const kind=familyKind(f);
    const price=optionPrice(o);
    const priceTxt=price?` · ${aed(price.public_sell_price_ex_vat)} ex VAT`:'';
    if(kind==='medicine'){
      const pack=o.pack?` — ${o.pack}`:'';
      return `${o.brand||'Approved option'} ${presentationLabel(f,o.presentation||'')}${pack}${priceTxt}`.trim();
    }
    const pack=o.pack?` · ${o.pack}`:'';
    return `${o.exact_product_name||o.brand||'Approved option'}${pack}${priceTxt}`;
  }

  function optionsForPresentation(){
    const approved=Array.isArray(state.options)?state.options:[];
    if(!state.presentation) return approved;
    return approved.filter(o=>!o.presentation || String(o.presentation)===state.presentation);
  }

  function selectedOption(){ return (state.options||[]).find(o=>o.product_option_id===state.optionId)||null; }

  function priceLabel(f){
    if(!String(f?.website_price_treatment||'').toLowerCase().includes('fixed')) return 'Request quote';
    const vals=(state.prices||[]).map(x=>Number(x.public_sell_price_ex_vat)).filter(Number.isFinite).sort((a,b)=>a-b);
    if(!vals.length) return 'Fixed price after approval';
    return vals.length>1 && Math.abs(vals[vals.length-1]-vals[0])>0.0001 ? `From ${aed(vals[0])} ex VAT` : `${aed(vals[0])} ex VAT`;
  }

  function isDhaMapped(f){
    return String(f?.dha_badge||'').trim().toLowerCase()==='dha requirement' || /\bdha\b/i.test(String(f?.requirement_reference||''));
  }
  function safeFallbackAvailability(f){
    const raw=String(f?.availability_wording||'').trim();
    if(/^quoted to order$/i.test(raw)) return 'Quoted to order';
    if(/^source on request$/i.test(raw)) return 'Source on request';
    return 'Availability confirmed at quotation';
  }
  function familyAvailabilityLabel(f){
    return state.availability?.availability_label || safeFallbackAvailability(f);
  }
  function fmtEvidenceDate(v){
    if(!v) return '';
    const d=new Date(v); if(!Number.isFinite(d.getTime())) return '';
    return d.toLocaleDateString('en-AE',{day:'2-digit',month:'short',year:'numeric'});
  }
  function optionAvailability(o){ return (state.optionAvailability||[]).find(x=>x.product_option_id===o.product_option_id)||null; }
  function optionAvailabilityText(o){
    const a=optionAvailability(o); if(!a || a.availability_state==='CHECK_AT_QUOTE') return 'Availability confirmed at quotation';
    const d=fmtEvidenceDate(a.verified_at);
    return d?`${a.availability_label} · verified ${d}`:a.availability_label;
  }
  function regulatoryBlock(f){
    if(!isDhaMapped(f)) return '';
    const exact=String(f.exact_controlled_wording||'').trim();
    const ref=String(f.requirement_reference||'').trim();
    const status=String(f.dha_status||'').trim();
    return `<section class="pscFamilyRegulatoryPanel">
      <div class="pscFamilyRegulatoryHead"><span class="pscFamilyDhaBadge">DHA requirement</span><div><b>Mapped to DHA Standards for Clinics in Educational and Academic Settings V4.1</b><small>This maps the family to the requirement; it is not a product approval claim.</small></div></div>
      <div class="pscFamilyRegulatoryGrid">
        ${status?`<div><span>SOURCE CLASSIFICATION</span><b>${esc(status)}</b></div>`:''}
        ${ref?`<div><span>REFERENCE</span><b>${esc(ref)}</b></div>`:''}
      </div>
      ${exact?`<div class="pscFamilyRequirementWording"><span>CONTROLLED REQUIREMENT WORDING</span><p>${esc(exact)}</p></div>`:''}
      ${/conditional|required alternative/i.test(status)?'<p class="pscFamilyRegulatoryControl">The source classification is preserved. Conditional or alternative wording is not converted into an automatic mandatory purchase line.</p>':''}
    </section>`;
  }
  function availabilityBlock(f){
    const a=state.availability;
    const label=familyAvailabilityLabel(f);
    const live=a && a.availability_state && a.availability_state!=='CHECK_AT_QUOTE';
    const verified=live?fmtEvidenceDate(a.verified_at):'';
    const valid=live?fmtEvidenceDate(a.valid_until):'';
    const tone=live?String(a.availability_state||'').toLowerCase().replaceAll('_','-'):'check-at-quote';
    return `<section class="pscFamilyAvailabilityPanel ${esc(tone)}"><div><span class="pscFamilyDetailLabel">Availability</span><b>${esc(label)}</b>${verified?`<small>Evidence verified ${esc(verified)}${valid?` · status valid through ${esc(valid)}`:''}</small>`:'<small>PSC confirms availability when the quotation is prepared.</small>'}</div><p>Live stock wording appears only when PSC has a dated availability status with an unexpired evidence window.</p></section>`;
  }

  function kindCopy(f){
    const kind=familyKind(f);
    if(kind==='medicine') return {kicker:'MEDICINE FAMILY',role:`${f.clinical_need||'Clinical need'} · Licensed / controlled route`,footer:'Licensed medicine family'};
    if(kind==='equipment') return {kicker:'EQUIPMENT / QUOTE-LED FAMILY',role:`${f.clinical_need||'Clinic setup'} · Specification-led quotation`,footer:'Equipment / capital family'};
    if(kind==='specialist') return {kicker:'SPECIALIST / PASS-THROUGH FAMILY',role:`${f.clinical_need||'Institutional support'} · Scope confirmed at quotation`,footer:'Specialist / coordinated scope'};
    if(kind==='compatibility') return {kicker:'COMPATIBILITY-CONTROLLED FAMILY',role:`${f.clinical_need||'Clinical consumable'} · Exact fit confirmed before supply`,footer:'Compatibility-controlled consumable'};
    return {kicker:'STANDARD PRODUCT FAMILY',role:`${f.clinical_need||'Clinical consumable'} · Controlled institutional supply`,footer:'Standard institutional family'};
  }

  function requirementType(f){
    const kind=familyKind(f);
    if(kind==='medicine') return 'Medicines / regulated products';
    if(kind==='equipment') return 'Clinic opening / capital equipment';
    if(kind==='specialist') return 'Other';
    return 'Recurring consumables';
  }

  function resetSelection(){
    state.presentation='';state.brandMode='no-preference';state.optionId='';state.otherBrand='';
  }

  async function loadDetail(id){
    state.loading=true;
    state.familyId=id;
    state.family=null;state.options=[];state.prices=[];state.availability=null;state.optionAvailability=[];
    const sb=window.PSC_SUPABASE;
    if(sb){
      try{
        const [{data:family,error:fErr},{data:approved,error:oErr},{data:prices,error:pErr},{data:availability,error:aErr},{data:optionAvailability,error:oaErr}]=await Promise.all([
          sb.from('catalogue_family_public').select('*').eq('family_id',id).maybeSingle(),
          sb.from('catalogue_product_option_public').select('product_option_id,family_id,exact_product_name,brand,presentation,pack').eq('family_id',id).order('presentation').order('exact_product_name'),
          sb.from('catalogue_public_fixed_prices').select('family_id,product_option_id,exact_product_name,brand,presentation,pack,public_sell_price_ex_vat,vat_rate_pct,price_valid_to').eq('family_id',id).order('public_sell_price_ex_vat'),
          sb.from('catalogue_family_availability_public').select('family_id,availability_state,availability_label,verified_at,valid_until').eq('family_id',id).maybeSingle(),
          sb.from('catalogue_product_availability_public').select('family_id,product_option_id,availability_state,availability_label,verified_at,valid_until').eq('family_id',id)
        ]);
        if(fErr) throw fErr;if(oErr) throw oErr;if(pErr) throw pErr;if(aErr) throw aErr;if(oaErr) throw oaErr;
        if(family) state.family=family;
        state.options=Array.isArray(approved)?approved:[];
        state.prices=Array.isArray(prices)?prices:[];
        state.availability=availability||null;
        state.optionAvailability=Array.isArray(optionAvailability)?optionAvailability:[];
      }catch(e){ console.warn('PSC family detail load failed; using controlled fallback.',e?.message||e); }
    }
    if(!state.family) state.family=fallbackFamily(id);
    if(!selectorAllowed(state.family)){state.brandMode='no-preference';state.optionId='';state.otherBrand='';}
    state.loading=false;
  }

  function preferenceBlock(f){
    if(!selectorAllowed(f)) return '';
    const kind=familyKind(f), approved=optionsForPresentation(), approvedTotal=(state.options||[]).length;
    const label=kind==='medicine'?'Brand preference':'Product preference';
    const defaultTitle=kind==='medicine'?'No preference':'PSC to select against the specification';
    const defaultCopy=kind==='medicine'?'PSC may quote a suitable approved option.':'PSC may use a suitable approved product option that matches the controlled specification.';
    const otherTitle=kind==='medicine'?'Other brand required':'Other brand / manufacturer required';
    const otherCopy=kind==='medicine'?'Specify a brand, manufacturer or pack for PSC to source.':'Specify the exact brand, manufacturer, model or pack required.';
    return `<section class="pscFamilyDetailBlock pscFamilyPreferenceBlock">
      <span class="pscFamilyDetailLabel">${esc(label)}</span>
      <label class="pscBrandChoice ${state.brandMode==='no-preference'?'active':''}"><input type="radio" name="psc-brand-choice" value="no-preference" ${state.brandMode==='no-preference'?'checked':''}><span><b>${esc(defaultTitle)}</b><small>${esc(defaultCopy)}</small></span></label>
      ${approved.map(o=>`<label class="pscBrandChoice pscBrandChoiceOption ${state.brandMode==='option'&&state.optionId===o.product_option_id?'active':''}"><input type="radio" name="psc-brand-choice" value="option:${esc(o.product_option_id)}" ${state.brandMode==='option'&&state.optionId===o.product_option_id?'checked':''}><span><b>${esc(optionLabel(o,f))}</b><small>${esc(optionAvailabilityText(o))}</small></span></label>`).join('')}
      ${approvedTotal===0?'<p class="pscBrandGateNote">Named options appear only after PSC has approved them for customer selection. The family can still be requested against the controlled specification.</p>':state.presentation&&approved.length===0?'<p class="pscBrandGateNote">No named approved option is currently published for this presentation. PSC can still source against the family specification.</p>':''}
      <label class="pscBrandChoice ${state.brandMode==='other'?'active':''}"><input type="radio" name="psc-brand-choice" value="other" ${state.brandMode==='other'?'checked':''}><span><b>${esc(otherTitle)}</b><small>${esc(otherCopy)}</small></span></label>
      ${state.brandMode==='other'?`<input class="pscOtherBrandInput" data-family-other-brand value="${esc(state.otherBrand)}" placeholder="Brand, manufacturer, model or pack required">`:''}
    </section>`;
  }

  function detailHtml(){
    const f=state.family||fallbackFamily(state.familyId);if(!f) return '';
    const presentations=(Array.isArray(f.presentations)?f.presentations:[]).filter(Boolean);
    const portalMode=location.hash.startsWith('#portal/catalogue');
    const copy=kindCopy(f),kind=familyKind(f),dha=isDhaMapped(f),preview=familyPreview(f);
    const selected=selectedOption();
    const selectedText=selected?optionLabel(selected,f):(kind==='medicine'?'No preference':'PSC to select against specification');
    const configurationNeeded=presentations.length||selectorAllowed(f);
    const regulatory=`${dha?`<details><summary><span>Requirement mapping</span><i>+</i></summary><div><p><strong>Mapped to DHA Standards for Clinics in Educational and Academic Settings V4.1</strong></p>${f.exact_controlled_wording?`<p>${esc(f.exact_controlled_wording)}</p>`:''}<p>${esc(f.requirement_reference||'DHA requirement')} · ${esc(f.dha_status||'Status to verify')}</p>${/conditional|required alternative/i.test(String(f.dha_status||''))?'<small>The source classification is preserved; conditional or alternative wording is not converted into an automatic mandatory purchase line.</small>':''}<p class="disclosureFinePrint">Requirement mapping only. This is not a DHA product endorsement or product approval.</p></div></details>`:''}`;
    const compatibility=kind==='compatibility'?'<p><strong>Compatibility comes first.</strong> PSC confirms the relevant device, dispenser, holder, waste route or other fit requirement before supply.</p>':'';
    const supplyCopy=kind==='medicine'
      ? 'Licensed supply route, product registration, storage, batch/expiry and recipient authorization are confirmed before commitment. Once a specific brand or product is agreed, PSC does not silently substitute it.'
      : kind==='equipment'
        ? 'Exact model, included accessories, warranty, installation and compatibility are confirmed in the quotation before procurement.'
        : kind==='specialist'
          ? 'PSC confirms the responsible specialist route, deliverables, timing and commercial scope before acceptance.'
          : 'PSC sources against the controlled family specification. Any material brand, pack or compatibility change is confirmed before commitment.';

    return `<div class="modalBackdrop fluidOverlay pscFamilyDetailBackdrop" data-family-detail-close>
      <div class="modal productModalShell fluidProductShell pscFamilyModalShell" onclick="event.stopPropagation()">
        <section class="productDetailModal fluidProductDetail publicProductSheet pscFamilyProductSheet" role="dialog" aria-modal="true" aria-labelledby="pscFamilyTitle">
          <div class="modalHeader fluidProductHeader">
            <button class="productBackButton" type="button" data-family-detail-close aria-label="Back to catalogue">←</button>
            <div><span class="eyebrow">${esc(copy.kicker)}</span><h2 id="pscFamilyTitle">${esc(f.family_name)}</h2><div class="smallMuted mono">${esc(f.family_id)}</div></div>
            ${dha?'<span class="pscFamilyHeaderBadge">DHA requirement</span>':''}
          </div>

          <div class="productDetailGrid fluidProductGrid">
            <div class="detailImagePane fluidImagePane">
              <div class="detailProductImageWrap pscFamilyPreview"><img src="${esc(preview.image)}" alt="${esc(preview.title)}" onerror="this.onerror=null;this.src='/assets/products/clinic-basics.jpg'"></div>
              ${preview.gallery.length>1?`<div class="productGalleryStrip">${preview.gallery.map(x=>`<img src="${esc(x.url)}" alt="${esc(x.alt)}" loading="lazy" onerror="this.style.display='none'">`).join('')}</div>`:''}
              <div class="detailImageMeta"><b>${esc(preview.title)}</b><span>${esc(preview.pack)}</span>${f.common_brands_line?`<small>${esc(f.common_brands_line)}</small>`:'<small>Representative catalogue preview. Exact brand/model is controlled at selection or quotation.</small>'}</div>
            </div>

            <div class="detailContentPane fluidDetailContent">
              <div class="productQuickFacts">
                <div><span>PACK / UNIT</span><b>${esc(f.order_pack_basis||'To confirm')}</b></div>
                <div><span>SUPPLY BASIS</span><b>${esc(kind==='medicine'?'Licensed route':kind==='specialist'?'Scope confirmed at quotation':'Confirmed at quotation')}</b></div>
                <div><span>PRICING</span><b>${esc(priceLabel(f))}</b></div>
                <div><span>AVAILABILITY</span><b>${esc(familyAvailabilityLabel(f))}</b></div>
                ${dha?`<div><span>REQUIREMENT</span><b>${esc(f.dha_status||'DHA mapped')}</b></div>`:''}
              </div>

              <div class="productDisclosureList pscFamilyDisclosureList">
                <details open><summary><span>Product specification</span><i>+</i></summary><div><p>${esc(f.commercial_specification||'Exact institutional specification confirmed before quotation.')}</p><small>Order / pack basis: ${esc(f.order_pack_basis||'To confirm')}</small></div></details>

                ${configurationNeeded?`<details open><summary><span>${kind==='medicine'?'Presentation & brand preference':'Product preference'}</span><i>+</i></summary><div class="pscFamilyConfiguration">${presentations.length?`<div class="pscFamilyInlineSection"><span class="pscFamilyDetailLabel">${kind==='medicine'?'Available presentations':'Presentation / format'}</span><div class="pscPresentationChips">${presentations.map(x=>`<button type="button" class="${state.presentation===x?'active':''}" data-family-presentation="${esc(x)}">${esc(presentationLabel(f,x))}</button>`).join('')}</div></div>`:''}${preferenceBlock(f)}<p class="pscFamilySelectionSummary"><span>CURRENT SELECTION</span><b>${esc(selectedText)}</b></p></div></details>`:''}

                ${regulatory}
                <details><summary><span>Availability & quotation</span><i>+</i></summary><div><p><strong>${esc(familyAvailabilityLabel(f))}</strong></p><p>Live stock language is shown only against dated, unexpired evidence. Otherwise PSC reconfirms availability when the quotation is prepared.</p>${state.availability?.verified_at?`<small>Evidence verified ${esc(fmtEvidenceDate(state.availability.verified_at))}${state.availability?.valid_until?` · valid through ${esc(fmtEvidenceDate(state.availability.valid_until))}`:''}</small>`:''}</div></details>
                <details><summary><span>Supply & compatibility</span><i>+</i></summary><div>${compatibility}<p>${esc(supplyCopy)}</p></div></details>
              </div>
            </div>
          </div>

          <div class="productStickyBar publicProductSticky pscFamilyStickyBar"><button type="button" class="button light" data-family-detail-close>Continue browsing</button><button type="button" class="button primary" data-family-quote>${portalMode?'Add to request':'Request quotation'}</button></div>
        </section>
      </div>
    </div>`;
  }

  function draw(){
    document.querySelector('[data-psc-family-detail-root]')?.remove();
    if(!state.open) return;
    const root=document.createElement('div');root.dataset.pscFamilyDetailRoot='';root.innerHTML=detailHtml();document.body.appendChild(root);
    document.documentElement.classList.add('pscFamilyDetailOpen');bindDetail(root);
  }

  function close(){state.open=false;document.documentElement.classList.remove('pscFamilyDetailOpen');document.querySelector('[data-psc-family-detail-root]')?.remove();}

  async function open(id){
    if(!id) return;resetSelection();state.open=true;await loadDetail(id);draw();
  }

  function quoteSummary(){
    const f=state.family||fallbackFamily(state.familyId), option=selectedOption(), kind=familyKind(f);
    const brand=state.brandMode==='no-preference'?(kind==='medicine'?'No preference — PSC may quote a suitable approved option':'PSC to select against the controlled specification'):state.brandMode==='option'?(option?optionLabel(option,f):'Specific approved option'):state.otherBrand||'Other brand / model required';
    return {
      familyId:f?.family_id||state.familyId,
      familyName:f?.family_name||state.familyId,
      familyPageType:f?.page_type||'',
      orderPackBasis:f?.order_pack_basis||'',
      presentation:state.presentation||'',
      brandPreference:brand,
      brandPreferenceMode:state.brandMode==='option'?'specific_option':state.brandMode==='other'?'other_brand':'no_preference',
      requestedBrand:state.brandMode==='other'?state.otherBrand.trim():(state.brandMode==='option'?(option?.brand||''):''),
      productOption:state.brandMode==='option'&&option?{product_option_id:option.product_option_id,exact_product_name:option.exact_product_name,brand:option.brand,presentation:option.presentation,pack:option.pack}:null,
      regulated:kind==='medicine',
      requirementType:requirementType(f),
      commercialSpecification:f?.commercial_specification||'',
      priceTreatment:priceLabel(f),
      availability:familyAvailabilityLabel(f),
      dhaMapped:isDhaMapped(f),
      requirementReference:f?.requirement_reference||'',
      requirementStatus:f?.dha_status||''
    };
  }

  function goToQuote(){
    const f=state.family||fallbackFamily(state.familyId), presentations=(Array.isArray(f?.presentations)?f.presentations:[]).filter(Boolean);
    if(presentations.length && !state.presentation){document.querySelector('.pscPresentationChips')?.classList.add('invalid');document.querySelector('[data-family-presentation]')?.focus();return;}
    if(state.brandMode==='other' && !state.otherBrand.trim()){const input=document.querySelector('[data-family-other-brand]');input?.focus();input?.classList.add('invalid');return;}
    if(state.brandMode==='option' && !selectedOption()){state.brandMode='no-preference';state.optionId='';draw();return;}
    const draft=quoteSummary(), inPortal=location.hash.startsWith('#portal/catalogue');
    if(inPortal){window.dispatchEvent(new CustomEvent('psc:add-family-line',{detail:draft}));close();return;}
    try{sessionStorage.setItem(DRAFT_KEY,JSON.stringify(draft));}catch{}
    close();location.hash='contact';setTimeout(prefillContact,60);
  }

  function prefillContact(){
    let draft=null;try{draft=JSON.parse(sessionStorage.getItem(DRAFT_KEY)||'null');}catch{}
    if(!draft) return;
    const form=document.querySelector('[data-public-enquiry]');if(!form) return;
    const type=form.querySelector('[name="requirement_type"]'), req=form.querySelector('[name="requirement"]');
    if(type) type.value=draft.requirementType;
    if(req && !req.value){
      const rows=[`PSC family: ${draft.familyName} (${draft.familyId})`];
      if(draft.presentation) rows.push(`Presentation: ${draft.presentation}`);
      rows.push(`Preference: ${draft.brandPreference}`);
      if(draft.orderPackBasis) rows.push(`Order / pack basis: ${draft.orderPackBasis}`);
      if(draft.priceTreatment) rows.push(`Price treatment: ${draft.priceTreatment}`);
      if(draft.availability) rows.push(`Availability: ${draft.availability}`);
      if(draft.dhaMapped && draft.requirementReference) rows.push(`Requirement mapping: DHA requirement · ${draft.requirementReference}`);
      rows.push('Quantity / timing: ');
      req.value=rows.join('\n');req.focus({preventScroll:true});
    }
  }

  function bindDetail(root){
    root.querySelectorAll('[data-family-detail-close]').forEach(el=>el.addEventListener('click',close));
    root.querySelectorAll('[data-family-presentation]').forEach(el=>el.addEventListener('click',()=>{
      const next=el.dataset.familyPresentation;state.presentation=next;root.querySelector('.pscPresentationChips')?.classList.remove('invalid');
      const option=selectedOption();if(option&&option.presentation&&String(option.presentation)!==next){state.brandMode='no-preference';state.optionId='';}draw();
    }));
    root.querySelectorAll('input[name="psc-brand-choice"]').forEach(el=>el.addEventListener('change',()=>{
      if(el.value==='no-preference'){state.brandMode='no-preference';state.optionId='';}
      else if(el.value==='other'){state.brandMode='other';state.optionId='';}
      else if(el.value.startsWith('option:')){state.brandMode='option';state.optionId=el.value.slice(7);const option=selectedOption();if(option?.presentation) state.presentation=option.presentation;}
      draw();
    }));
    const other=root.querySelector('[data-family-other-brand]');if(other) other.addEventListener('input',e=>{state.otherBrand=e.target.value;e.target.classList.remove('invalid');});
    root.querySelector('[data-family-quote]')?.addEventListener('click',goToQuote);
  }

  document.addEventListener('click',e=>{const trigger=e.target.closest?.('[data-psc-family-open]');if(trigger){e.preventDefault();open(trigger.dataset.pscFamilyOpen||'');}},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.open) close();});
  window.addEventListener('hashchange',()=>setTimeout(prefillContact,50));
  new MutationObserver(()=>prefillContact()).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
})();
