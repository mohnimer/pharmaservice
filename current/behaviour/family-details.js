(() => {
  'use strict';

  const DRAFT_KEY='pscFamilyQuoteDraftV1';
  const DHA_ICON='/assets/dha-requirement.png';
  const state={familyId:'',family:null,options:[],prices:[],availability:null,optionAvailability:[],presentation:'',selectedOptionIds:[],selectedFallbackBrands:[],otherBrandActive:false,otherBrand:'',open:false,loading:false};
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[c]));
  const upper=v=>String(v||'').trim().toUpperCase();
  const aed=v=>`AED ${Number(v).toLocaleString('en-AE',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  const ASSET_RELEASE='3777';
  function familyCatalogueProducts(f){
    const rows=Array.isArray(window.PSC_DATA?.products)?window.PSC_DATA.products:[];
    // Family previews may use a controlled child line even when that child is intentionally hidden
    // from the flat product grid. The family itself remains the customer-facing catalogue entity.
    return rows.filter(p=>String(p?.catalogueParentId||'')===String(f?.family_id||''));
  }
  function catalogueProductForSku(sku){
    const rows=Array.isArray(window.PSC_DATA?.products)?window.PSC_DATA.products:[];
    return rows.find(p=>String(p?.pscSku||'')===String(sku||''))||null;
  }
  function familyIdForSku(sku){ return String(catalogueProductForSku(sku)?.catalogueParentId||'').trim(); }
  function isMedicineFamilyScaffold(p){
    if(!p?.catalogueParentId) return false;
    const tx=String(p?.catalogueTransactionId||p?.pscSku||'').trim();
    const m=tx.match(/^INST-(\d{4})$/);
    if(!m) return false;
    const n=Number(m[1]);
    return n>=207 && n<=260;
  }
  function hideMedicineFamilyScaffolds(){
    document.querySelectorAll('[data-product-view],[data-public-product-view]').forEach(el=>{
      const sku=el.dataset.productView||el.dataset.publicProductView||'';
      const product=catalogueProductForSku(sku);
      if(!isMedicineFamilyScaffold(product)) return;
      const card=el.closest('article.publicCatalogueCard,article.productCard,.publicCatalogueCard,.productCard');
      if(card) card.hidden=true;
    });
  }
  function familyProductImage(p){
    const tx=String(p?.catalogueTransactionId||p?.pscSku||'').trim().toLowerCase();
    if(/^inst-\d{4}$/.test(tx)) return `/assets/products/${tx}.webp?v=${ASSET_RELEASE}`;
    const raw=String(p?.imageUrl||p?.image_url||'').trim();
    return raw || '/assets/products/clinic-basics.jpg';
  }
  function familyPreview(f){
    const rows=familyCatalogueProducts(f), primary=rows[0]||null, image=familyProductImage(primary);
    return {image,title:String(f?.family_name||primary?.catalogueDisplayName||primary?.name||'Catalogue family'),pack:String(f?.order_pack_basis||primary?.cataloguePack||primary?.pack||'Pack / unit to confirm'),gallery:rows.slice(0,5).map(x=>({url:familyProductImage(x),alt:String(x?.catalogueDisplayName||x?.name||f?.family_name||'Catalogue preview')}))};
  }
  function fallbackFamily(id){
    const rows=window.PSC_FAMILY_CATALOGUE_V39?.families||[], r=rows.find(x=>x.familyId===id); if(!r) return null;
    return {family_id:r.familyId,clinical_need:r.clinicalNeed,family_name:r.familyName,page_type:r.pageType,dha_badge:r.dhaBadge,dha_status:r.dhaStatus,requirement_reference:r.requirementReference,brand_selector_mode:r.brandSelectorMode,default_brand_choice:r.defaultBrandChoice,prominent_brand:r.prominentBrand,common_brands_line:r.commonBrandsLine,presentations:Array.isArray(r.presentations)?r.presentations:[],website_price_treatment:r.websitePriceTreatment,availability_wording:r.availabilityWording,portal_treatment:r.portalTreatment,commercial_specification:r.commercialSpecification,order_pack_basis:r.orderPackBasis,exact_controlled_wording:r.exactControlledWording};
  }
  function familyKind(f){
    if(upper(f?.page_type)==='MEDICINE FAMILY') return 'medicine';
    if(String(f?.portal_treatment||'').toLowerCase().includes('pass-through')) return 'specialist';
    if(upper(f?.page_type)==='QUOTE-LED PRODUCT FAMILY') return 'equipment';
    const spec=String(f?.commercial_specification||'').toLowerCase();
    if(/compatib|matched to|selected (device|dispenser|thermometer|set)|replacement cartridge|probe cover/.test(spec)) return 'compatibility';
    return 'standard';
  }
  function normalizedBrand(v){ return String(v||'').replace(/^Common brands?:\s*/i,'').trim(); }
  function familyBrandFallbacks(f){
    const out=[],seen=new Set(), optionBrands=new Set((state.options||[]).map(o=>normalizedBrand(o?.brand).toLowerCase()).filter(Boolean));
    const push=v=>{const x=normalizedBrand(v);if(!x)return;const key=x.toLowerCase();if(optionBrands.has(key)||seen.has(key)||/^n\/?a$|^none$|^various$|^generic$/i.test(x))return;seen.add(key);out.push(x);};
    String(f?.common_brands_line||'').replace(/^Common brands?:\s*/i,'').split(/[,;|]+/).map(x=>x.trim()).filter(Boolean).forEach(push);
    push(f?.prominent_brand);
    return out;
  }
  function selectorAllowed(f){
    const mode=upper(f?.brand_selector_mode);
    if(familyKind(f)==='medicine') return true;
    if((state.options||[]).length || familyBrandFallbacks(f).length) return true;
    return !mode.includes('HIDDEN') && !mode.includes('NOT NEEDED');
  }
  function optionKey(o){ return String(o?.product_option_id||''); }
  function selectedOptions(){ const ids=new Set(state.selectedOptionIds); return (state.options||[]).filter(o=>ids.has(optionKey(o))); }
  function meaningfulPresentation(v){ const x=String(v||'').trim(); return x&&!/^other\s*\/\s*verify$/i.test(x)&&!/^other$/i.test(x); }
  function cleanOptionName(o){
    let name=String(o?.exact_product_name||'').trim(); const brand=normalizedBrand(o?.brand);
    if(brand){ const re=new RegExp('^'+brand.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[\\s–—:_-]*','i'); name=name.replace(re,'').trim(); }
    name=name.replace(/\s+/g,' ').replace(/\s*[-–—]\s*/g,' · ');
    return name;
  }
  function optionDescriptor(o,f){
    const parts=[]; const exact=cleanOptionName(o); const presentation=String(o?.presentation||'').trim(); const pack=String(o?.pack||'').trim();
    if(exact && exact.toLowerCase()!==String(f?.family_name||'').toLowerCase()) parts.push(exact);
    if(meaningfulPresentation(presentation) && !parts.some(x=>x.toLowerCase().includes(presentation.toLowerCase()))) parts.push(presentation);
    if(pack && !parts.some(x=>x.toLowerCase().includes(pack.toLowerCase()))) parts.push(pack);
    if(!parts.length && f?.order_pack_basis) parts.push(String(f.order_pack_basis));
    return parts.join(' · ') || 'Exact variant confirmed in quotation';
  }
  function fallbackBrandDescriptor(f){
    const presentations=(Array.isArray(f?.presentations)?f.presentations:[]).filter(meaningfulPresentation);
    if(presentations.length) return presentations.join(' · ');
    if(f?.order_pack_basis) return String(f.order_pack_basis);
    return 'Exact variant confirmed in quotation';
  }
  function presentationLabel(f,x){ return x; }
  function priceLabel(f){
    if(!String(f?.website_price_treatment||'').toLowerCase().includes('fixed')) return 'Request quote';
    const vals=(state.prices||[]).map(x=>Number(x.public_sell_price_ex_vat)).filter(Number.isFinite).sort((a,b)=>a-b);
    if(!vals.length) return 'Fixed price after approval';
    return vals.length>1&&Math.abs(vals[vals.length-1]-vals[0])>0.0001?`From ${aed(vals[0])} ex VAT`:`${aed(vals[0])} ex VAT`;
  }
  function isDhaMapped(f){ return String(f?.dha_badge||'').trim().toLowerCase()==='dha requirement' || /\bdha\b/i.test(String(f?.requirement_reference||'')); }
  function safeFallbackAvailability(f){ const raw=String(f?.availability_wording||'').trim(); if(/^quoted to order$/i.test(raw)) return 'Quoted to order'; if(/^source on request$/i.test(raw)) return 'Source on request'; return 'Availability confirmed at quotation'; }
  function familyAvailabilityLabel(f){ return state.availability?.availability_label || safeFallbackAvailability(f); }
  function fmtEvidenceDate(v){ if(!v) return ''; const d=new Date(v); if(!Number.isFinite(d.getTime())) return ''; return d.toLocaleDateString('en-AE',{day:'2-digit',month:'short',year:'numeric'}); }
  function kindCopy(f){
    const kind=familyKind(f);
    if(kind==='medicine') return {kicker:'MEDICINE FAMILY'};
    if(kind==='equipment') return {kicker:'EQUIPMENT / QUOTE-LED FAMILY'};
    if(kind==='specialist') return {kicker:'SPECIALIST / PASS-THROUGH FAMILY'};
    if(kind==='compatibility') return {kicker:'COMPATIBILITY-CONTROLLED FAMILY'};
    return {kicker:'STANDARD PRODUCT FAMILY'};
  }
  function requirementType(f){ const kind=familyKind(f); if(kind==='medicine') return 'Medicines / regulated products'; if(kind==='equipment') return 'Clinic opening / capital equipment'; if(kind==='specialist') return 'Other'; return 'Recurring consumables'; }
  function resetSelection(){ state.presentation='';state.selectedOptionIds=[];state.selectedFallbackBrands=[];state.otherBrandActive=false;state.otherBrand=''; }

  async function loadDetail(id){
    state.loading=true;state.familyId=id;state.family=null;state.options=[];state.prices=[];state.availability=null;state.optionAvailability=[];
    const sb=window.PSC_SUPABASE;
    if(sb){
      try{
        const [{data:family,error:fErr},{data:approved,error:oErr},{data:prices,error:pErr},{data:availability,error:aErr},{data:optionAvailability,error:oaErr}]=await Promise.all([
          sb.from('catalogue_family_public').select('*').eq('family_id',id).maybeSingle(),
          sb.from('catalogue_family_option_reference_public').select('product_option_id,family_id,exact_product_name,brand,presentation,pack').eq('family_id',id).order('brand').order('exact_product_name'),
          sb.from('catalogue_public_fixed_prices').select('family_id,product_option_id,exact_product_name,brand,presentation,pack,public_sell_price_ex_vat,vat_rate_pct,price_valid_to').eq('family_id',id).order('public_sell_price_ex_vat'),
          sb.from('catalogue_family_availability_public').select('family_id,availability_state,availability_label,verified_at,valid_until').eq('family_id',id).maybeSingle(),
          sb.from('catalogue_product_availability_public').select('family_id,product_option_id,availability_state,availability_label,verified_at,valid_until').eq('family_id',id)
        ]);
        if(fErr) throw fErr;if(oErr) throw oErr;if(pErr) throw pErr;if(aErr) throw aErr;if(oaErr) throw oaErr;
        if(family) state.family=family; state.options=Array.isArray(approved)?approved:[];state.prices=Array.isArray(prices)?prices:[];state.availability=availability||null;state.optionAvailability=Array.isArray(optionAvailability)?optionAvailability:[];
      }catch(e){console.warn('PS family detail load failed; using controlled fallback.',e?.message||e);}
    }
    if(!state.family) state.family=fallbackFamily(id); state.loading=false;
  }

  function preferenceSummary(){
    const parts=[];
    selectedOptions().forEach(o=>parts.push(`${normalizedBrand(o.brand)||'Product'} — ${optionDescriptor(o,state.family)}`));
    state.selectedFallbackBrands.forEach(b=>parts.push(b));
    if(state.otherBrandActive&&state.otherBrand.trim()) parts.push(`Other: ${state.otherBrand.trim()}`);
    return parts.length?parts.join(' · '):'No brand preference';
  }
  function preferenceBlock(f){
    if(!selectorAllowed(f)) return '';
    const refs=(state.options||[]).filter(o=>!state.presentation||!meaningfulPresentation(o.presentation)||String(o.presentation)===state.presentation);
    const fallbacks=familyBrandFallbacks(f), noPreference=!state.selectedOptionIds.length&&!state.selectedFallbackBrands.length&&!state.otherBrandActive;
    return `<section class="pscFamilyDetailBlock pscFamilyPreferenceBlock">
      <span class="pscFamilyDetailLabel">Product preference</span>
      <label class="pscBrandChoice pscBrandNoPreference ${noPreference?'active':''}"><input type="checkbox" data-family-no-preference ${noPreference?'checked':''}><span><b>No brand preference</b><small>PS can quote a suitable product that meets the family specification.</small></span></label>
      ${refs.length?`<div class="pscBrandTickGrid">${refs.map(o=>{const key=optionKey(o),brand=normalizedBrand(o.brand)||String(o.exact_product_name||'Product option');return `<label class="pscBrandTick ${state.selectedOptionIds.includes(key)?'active':''}"><input type="checkbox" data-family-option="${esc(key)}" ${state.selectedOptionIds.includes(key)?'checked':''}><span><b>${esc(brand)}</b><small>${esc(optionDescriptor(o,f))}</small></span></label>`;}).join('')}</div>`:''}
      ${fallbacks.length?`<div class="pscBrandTickGrid pscFallbackBrandGrid">${fallbacks.map(brand=>`<label class="pscBrandTick ${state.selectedFallbackBrands.includes(brand)?'active':''}"><input type="checkbox" data-family-fallback-brand="${esc(brand)}" ${state.selectedFallbackBrands.includes(brand)?'checked':''}><span><b>${esc(brand)}</b><small>${esc(fallbackBrandDescriptor(f))}</small></span></label>`).join('')}</div>`:''}
      <p class="pscBrandPreferenceNote">Tick one or more exact product options you are happy for PS to quote. Where more than one SKU exists under the same brand, each SKU is shown separately. Final availability and commercial terms are confirmed in the quotation.</p>
      <label class="pscBrandChoice ${state.otherBrandActive?'active':''}"><input type="checkbox" data-family-other-toggle ${state.otherBrandActive?'checked':''}><span><b>Other brand / manufacturer required</b><small>Specify another brand, manufacturer, model or pack.</small></span></label>
      ${state.otherBrandActive?`<input class="pscOtherBrandInput" data-family-other-brand value="${esc(state.otherBrand)}" placeholder="Brand, manufacturer, model or pack required">`:''}
    </section>`;
  }

  function detailHtml(){
    const f=state.family||fallbackFamily(state.familyId);if(!f) return '';
    const presentations=(Array.isArray(f.presentations)?f.presentations:[]).filter(Boolean), portalMode=location.hash.startsWith('#portal/catalogue');
    const copy=kindCopy(f),kind=familyKind(f),dha=isDhaMapped(f),preview=familyPreview(f),configurationNeeded=presentations.length||selectorAllowed(f);
    const regulatory=dha?`<details><summary><span>Requirement mapping</span><i>+</i></summary><div class="pscFamilyRegulatoryDisclosure"><div class="pscFamilyRegulatoryTitle"><img src="${DHA_ICON}" alt="DHA requirement"><strong>Mapped to DHA Standards for Clinics in Educational and Academic Settings V4.1</strong></div>${f.exact_controlled_wording?`<p>${esc(f.exact_controlled_wording)}</p>`:''}<p>${esc(f.requirement_reference||'DHA requirement')} · ${esc(f.dha_status||'Status to verify')}</p>${/conditional|required alternative/i.test(String(f.dha_status||''))?'<small>The source classification is preserved; conditional or alternative wording is not converted into an automatic mandatory purchase line.</small>':''}<p class="disclosureFinePrint">Requirement mapping only. This is not a DHA product endorsement or product approval.</p></div></details>`:'';
    const compatibility=kind==='compatibility'?'<p><strong>Compatibility comes first.</strong> PS confirms the relevant device, dispenser, holder, waste route or other fit requirement before supply.</p>':'';
    const supplyCopy=kind==='medicine'?'Licensed supply route, product registration, storage, batch/expiry and recipient authorization are confirmed before commitment. Once a specific brand or product is agreed, PS does not silently substitute it.':kind==='equipment'?'Exact model, included accessories, warranty, installation and compatibility are confirmed in the quotation before procurement.':kind==='specialist'?'PS confirms the responsible specialist route, deliverables, timing and commercial scope before acceptance.':'PS sources against the controlled family specification. Any material brand, pack or compatibility change is confirmed before commitment.';
    return `<div class="modalBackdrop fluidOverlay pscFamilyDetailBackdrop" data-family-detail-close><div class="modal productModalShell fluidProductShell pscFamilyModalShell" onclick="event.stopPropagation()"><section class="productDetailModal fluidProductDetail publicProductSheet pscFamilyProductSheet" role="dialog" aria-modal="true" aria-labelledby="pscFamilyTitle">
      <div class="modalHeader fluidProductHeader"><button class="productBackButton" type="button" data-family-detail-close aria-label="Back to catalogue">←</button><div><span class="eyebrow">${esc(copy.kicker)}</span><h2 id="pscFamilyTitle">${esc(f.family_name)}</h2><div class="smallMuted mono">${esc(f.family_id)}</div></div>${dha?`<img class="pscFamilyHeaderDha" src="${DHA_ICON}" alt="DHA requirement">`:''}</div>
      <div class="productDetailGrid fluidProductGrid"><div class="detailImagePane fluidImagePane"><div class="detailProductImageWrap pscFamilyPreview"><img src="${esc(preview.image)}" alt="${esc(preview.title)}" onerror="this.onerror=null;this.src='/assets/products/clinic-basics.jpg'"></div>${preview.gallery.length>1?`<div class="productGalleryStrip">${preview.gallery.map(x=>`<img src="${esc(x.url)}" alt="${esc(x.alt)}" loading="lazy" onerror="this.style.display='none'">`).join('')}</div>`:''}<div class="detailImageMeta"><b>${esc(preview.title)}</b><span>${esc(preview.pack)}</span>${f.common_brands_line?`<small>${esc(f.common_brands_line)}</small>`:'<small>Representative catalogue preview. Exact brand/model is confirmed in quotation.</small>'}</div></div>
      <div class="detailContentPane fluidDetailContent"><div class="productQuickFacts"><div><span>PACK / UNIT</span><b>${esc(f.order_pack_basis||'To confirm')}</b></div><div><span>SUPPLY BASIS</span><b>${esc(kind==='medicine'?'Licensed route':kind==='specialist'?'Scope confirmed at quotation':'Confirmed at quotation')}</b></div><div><span>PRICING</span><b>${esc(priceLabel(f))}</b></div><div><span>AVAILABILITY</span><b>${esc(familyAvailabilityLabel(f))}</b></div>${dha?`<div><span>REQUIREMENT</span><b>${esc(f.dha_status||'DHA mapped')}</b></div>`:''}</div>
      <div class="productDisclosureList pscFamilyDisclosureList"><details open><summary><span>Product specification</span><i>+</i></summary><div><p>${esc(f.commercial_specification||'Exact institutional specification confirmed before quotation.')}</p><small>Order / pack basis: ${esc(f.order_pack_basis||'To confirm')}</small></div></details>
      ${configurationNeeded?`<details open><summary><span>${kind==='medicine'?'Presentation & brand preference':'Brand / product preference'}</span><i>+</i></summary><div class="pscFamilyConfiguration">${presentations.length?`<div class="pscFamilyInlineSection"><span class="pscFamilyDetailLabel">${kind==='medicine'?'Available presentations':'Presentation / format'}</span><div class="pscPresentationChips">${presentations.map(x=>`<button type="button" class="${state.presentation===x?'active':''}" data-family-presentation="${esc(x)}">${esc(presentationLabel(f,x))}</button>`).join('')}</div></div>`:''}${preferenceBlock(f)}<p class="pscFamilySelectionSummary"><span>CURRENT PREFERENCE</span><b>${esc(preferenceSummary())}</b></p></div></details>`:''}
      ${regulatory}<details><summary><span>Availability & quotation</span><i>+</i></summary><div><p><strong>${esc(familyAvailabilityLabel(f))}</strong></p><p>Live stock language is shown only against dated, unexpired evidence. Otherwise PS reconfirms availability when the quotation is prepared.</p>${state.availability?.verified_at?`<small>Evidence verified ${esc(fmtEvidenceDate(state.availability.verified_at))}${state.availability?.valid_until?` · valid through ${esc(fmtEvidenceDate(state.availability.valid_until))}`:''}</small>`:''}</div></details><details><summary><span>Supply & compatibility</span><i>+</i></summary><div>${compatibility}<p>${esc(supplyCopy)}</p></div></details></div></div></div>
      <div class="productStickyBar publicProductSticky pscFamilyStickyBar"><button type="button" class="button light" data-family-detail-close>Continue browsing</button><button type="button" class="button primary" data-family-quote>${portalMode?'Add to request':'Request quotation'}</button></div>
    </section></div></div>`;
  }

  function draw(){ document.querySelector('[data-psc-family-detail-root]')?.remove(); if(!state.open) return; const root=document.createElement('div');root.dataset.pscFamilyDetailRoot='';root.innerHTML=detailHtml();document.body.appendChild(root);document.documentElement.classList.add('pscFamilyDetailOpen');bindDetail(root); }
  function close(){state.open=false;document.documentElement.classList.remove('pscFamilyDetailOpen');document.querySelector('[data-psc-family-detail-root]')?.remove();}
  async function open(id){if(!id)return;resetSelection();state.open=true;await loadDetail(id);draw();}
  function quoteSummary(){
    const f=state.family||fallbackFamily(state.familyId),kind=familyKind(f),preference=preferenceSummary(),chosen=selectedOptions();
    const brands=[...new Set([...chosen.map(o=>normalizedBrand(o.brand)).filter(Boolean),...state.selectedFallbackBrands])];
    const mode=chosen.length||state.selectedFallbackBrands.length?(state.otherBrandActive?'product_options_plus_other':'product_options'):state.otherBrandActive?'other_brand':'no_preference';
    return {familyId:f?.family_id||state.familyId,familyName:f?.family_name||state.familyId,familyPageType:f?.page_type||'',orderPackBasis:f?.order_pack_basis||'',presentation:state.presentation||'',brandPreference:preference,brandPreferenceMode:mode,requestedBrands:brands,requestedBrand:state.otherBrandActive?state.otherBrand.trim():brands.join(', '),requestedProductOptions:chosen.map(o=>({product_option_id:o.product_option_id,exact_product_name:o.exact_product_name,brand:o.brand,presentation:o.presentation,pack:o.pack})),productOption:chosen.length===1?chosen[0]:null,regulated:kind==='medicine',requirementType:requirementType(f),commercialSpecification:f?.commercial_specification||'',priceTreatment:priceLabel(f),availability:familyAvailabilityLabel(f),dhaMapped:isDhaMapped(f),requirementReference:f?.requirement_reference||'',requirementStatus:f?.dha_status||''};
  }
  function goToQuote(){
    const f=state.family||fallbackFamily(state.familyId),presentations=(Array.isArray(f?.presentations)?f.presentations:[]).filter(Boolean);
    if(presentations.length&&!state.presentation){document.querySelector('.pscPresentationChips')?.classList.add('invalid');document.querySelector('[data-family-presentation]')?.focus();return;}
    if(state.otherBrandActive&&!state.otherBrand.trim()){const input=document.querySelector('[data-family-other-brand]');input?.focus();input?.classList.add('invalid');return;}
    const draft=quoteSummary(),inPortal=location.hash.startsWith('#portal/catalogue');
    if(inPortal){window.dispatchEvent(new CustomEvent('psc:add-family-line',{detail:draft}));close();return;}
    try{sessionStorage.setItem(DRAFT_KEY,JSON.stringify(draft));}catch{} close();location.hash='contact';setTimeout(prefillContact,60);
  }
  function prefillContact(){
    let draft=null;try{draft=JSON.parse(sessionStorage.getItem(DRAFT_KEY)||'null');}catch{} if(!draft)return;
    const form=document.querySelector('[data-public-enquiry]');if(!form)return;const type=form.querySelector('[name="requirement_type"]'),req=form.querySelector('[name="requirement"]');if(type)type.value=draft.requirementType;
    if(req&&!req.value){const rows=[`PS family: ${draft.familyName} (${draft.familyId})`];if(draft.presentation)rows.push(`Presentation: ${draft.presentation}`);rows.push(`Brand preference: ${draft.brandPreference}`);if(draft.orderPackBasis)rows.push(`Order / pack basis: ${draft.orderPackBasis}`);if(draft.priceTreatment)rows.push(`Price treatment: ${draft.priceTreatment}`);if(draft.availability)rows.push(`Availability: ${draft.availability}`);if(draft.dhaMapped&&draft.requirementReference)rows.push(`Requirement mapping: DHA requirement · ${draft.requirementReference}`);rows.push('Quantity / timing: ');req.value=rows.join('\n');req.focus({preventScroll:true});}
  }
  function bindDetail(root){
    root.querySelectorAll('[data-family-detail-close]').forEach(el=>el.addEventListener('click',close));
    root.querySelectorAll('[data-family-presentation]').forEach(el=>el.addEventListener('click',()=>{state.presentation=el.dataset.familyPresentation;root.querySelector('.pscPresentationChips')?.classList.remove('invalid');draw();}));
    root.querySelector('[data-family-no-preference]')?.addEventListener('change',e=>{if(e.target.checked){state.selectedOptionIds=[];state.selectedFallbackBrands=[];state.otherBrandActive=false;state.otherBrand='';draw();}else{draw();}});
    root.querySelectorAll('[data-family-option]').forEach(el=>el.addEventListener('change',()=>{const id=el.dataset.familyOption||'';const set=new Set(state.selectedOptionIds);if(el.checked)set.add(id);else set.delete(id);state.selectedOptionIds=[...set];draw();}));
    root.querySelectorAll('[data-family-fallback-brand]').forEach(el=>el.addEventListener('change',()=>{const brand=el.dataset.familyFallbackBrand||'';const set=new Set(state.selectedFallbackBrands);if(el.checked)set.add(brand);else set.delete(brand);state.selectedFallbackBrands=[...set];draw();}));
    root.querySelector('[data-family-other-toggle]')?.addEventListener('change',e=>{state.otherBrandActive=!!e.target.checked;if(!state.otherBrandActive)state.otherBrand='';draw();});
    const other=root.querySelector('[data-family-other-brand]');if(other)other.addEventListener('input',e=>{state.otherBrand=e.target.value;e.target.classList.remove('invalid');const summary=root.querySelector('.pscFamilySelectionSummary b');if(summary)summary.textContent=preferenceSummary();});
    root.querySelector('[data-family-quote]')?.addEventListener('click',goToQuote);
  }
  window.PSC_OPEN_FAMILY_DETAIL=open;
  window.addEventListener('psc:open-family',e=>open(e.detail?.familyId||''));
  document.addEventListener('click',e=>{
    const familyTrigger=e.target.closest?.('[data-psc-family-open]');
    if(familyTrigger){
      e.preventDefault();
      e.stopImmediatePropagation();
      open(familyTrigger.dataset.pscFamilyOpen||'');
      return;
    }
    if(e.target.closest?.('[data-psc-family-detail-root]')) return;
    const productTrigger=e.target.closest?.('[data-product-view],[data-public-product-view],[data-add]');
    if(!productTrigger) return;
    const sku=productTrigger.dataset.productView||productTrigger.dataset.publicProductView||productTrigger.dataset.add||'';
    const familyId=familyIdForSku(sku);
    if(!familyId) return;
    // A product already attached to a family must enter through the family page.
    // This prevents generic presentation scaffolds such as "Cetirizine — Tablet presentation"
    // from bypassing the brand/SKU preference controls.
    e.preventDefault();
    e.stopImmediatePropagation();
    open(familyId);
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.open)close();});
  window.addEventListener('hashchange',()=>setTimeout(()=>{prefillContact();hideMedicineFamilyScaffolds();},50));
  const observer=window.PSC_ENHANCEMENTS.createObserver(()=>{prefillContact();hideMedicineFamilyScaffolds();});
  observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
  setTimeout(hideMedicineFamilyScaffolds,0);
})();
