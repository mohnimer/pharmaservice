(() => {
  'use strict';

  const DRAFT_KEY='pscFamilyQuoteDraftV1';
  const DHA_ICON='/assets/dha-requirement.png';
  const state={familyId:'',family:null,options:[],prices:[],availability:null,optionAvailability:[],presentation:'',selectedOptionIds:[],selectedFallbackBrands:[],otherBrandActive:false,otherBrand:'',listingPreview:null,listingSku:'',qty:1,open:false,loading:false};
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[c]));
  const upper=v=>String(v||'').trim().toUpperCase();
  const aed=v=>`AED ${Number(v).toLocaleString('en-AE',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  const ASSET_RELEASE='3777';
  function familyCatalogueProducts(f){
    const rows=Array.isArray(window.PSC_DATA?.products)?window.PSC_DATA.products:[];
    // Family previews may use a controlled child line even when that child is intentionally hidden
    // from the flat product grid. The family itself remains the customer-facing catalogue entity.
    return rows.filter(p=>String(p?.catalogueParentId||p?.catalogueReferenceFamilyId||'')===String(f?.family_id||''));
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
    if(p?.currentImageUrl) return window.PSC_IMAGE_POLICY?.resolve(p.currentImageUrl)||(!window.PSC_IMAGE_POLICY?p.currentImageUrl:'');
    if(p?.localCatalogueRefresh) return '';
    const tx=String(p?.catalogueTransactionId||p?.pscSku||'').trim().toLowerCase();
    if(/^inst-\d{4}$/.test(tx)) return `/assets/products/${tx}.webp?v=${ASSET_RELEASE}`;
    const raw=String(p?.imageUrl||p?.image_url||'').trim();
    return window.PSC_IMAGE_POLICY?.resolve(raw)||(!window.PSC_IMAGE_POLICY?raw:'');
  }
  function familyPreview(f){
    const rows=familyCatalogueProducts(f), primary=window.PS_CATALOGUE_STOCK?.representative(rows)||rows[0]||null;
    const example=window.PSC_DHA_FAMILY_PHOTOS?.forListing({...primary,dhaMapped:isDhaMapped(f),_familyGroup:{id:f.family_id}});
    const photo=example?.path||(primary&&window.PS_CATALOGUE_STOCK&&!window.PS_CATALOGUE_STOCK.realPhoto(primary)?'':familyProductImage(primary));
    const image=state.listingPreview&&Object.hasOwn(state.listingPreview,'image')?state.listingPreview.image:photo;
    return {image,title:state.listingPreview?.title||example?.label||String(primary?.name||f?.family_name||'Catalogue family'),reference:state.listingPreview?.imageReference||primary?.imageRole==='SPECIFICATION_REFERENCE_ONLY',pack:String(f?.order_pack_basis||primary?.cataloguePack||primary?.pack||'Pack / unit to confirm'),gallery:[]};
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
    if(state.listingSku)return [];
    if(state.listingPreview?.specificationRequest)return [];
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
    if(o?.verified_description) return String(o.verified_description);
    const parts=[]; const exact=cleanOptionName(o); const presentation=String(o?.presentation||'').trim(); const pack=String(o?.pack||'').trim();
    if(exact && exact.toLowerCase()!==String(f?.family_name||'').toLowerCase()) parts.push(exact);
    if(meaningfulPresentation(presentation) && !parts.some(x=>x.toLowerCase().includes(presentation.toLowerCase()))) parts.push(presentation);
    if(pack && !parts.some(x=>x.toLowerCase().includes(pack.toLowerCase()))) parts.push(pack);
    if(!parts.length && f?.order_pack_basis) parts.push(String(f.order_pack_basis));
    return parts.join(' · ') || 'Exact variant confirmed in quotation';
  }
  function optionPrice(o){
    const stock=window.PS_CATALOGUE_STOCK?.forOption(o,state.familyId);
    if(stock?.acorus_managed){
      const api=window.PS_CATALOGUE_STOCK,mrp=api.price(stock),value=api.indicativePrice(stock);
      return value?`<span class="pscOptionPrice">${api.hasDiscount?`<s class="pscOriginalMrp">MRP ${esc(aed(mrp))}</s>`:''}<b>${esc(aed(value))}</b><small>${esc(api.priceLabel)} · ${esc(api.statusLabel(stock))} · report ${esc(api.stockDate)}<br>Final price and VAT confirmed in quotation</small></span>`:`<span class="pscOptionPrice"><b>Request quotation</b><small class="pscAvailability" data-stock-status="${api.status(stock)}">${esc(api.statusLabel(stock))} · report ${esc(api.stockDate)}</small></span>`;
    }

    // Price must be keyed by the selected option ID, not a family or brand.
    const verified=window.PSC_VARIANT_EVIDENCE_FOR?.(o,state.familyId);
    if(verified){
      const basis=verified.price_type==='PUBLIC_RETAIL_BENCHMARK'?'UAE retail benchmark':'PSC customer price';
      return `<span class="pscOptionPrice"><b>${esc(aed(Number(verified.price_aed)))}</b><small>${esc(basis)} · ${esc(verified.price_unit)} · ${esc(verified.price_vat_basis||'VAT basis not supplied')} · checked ${esc(verified.price_checked_at)}${verified.price_note?' · '+esc(verified.price_note):''}</small></span>`;
    }
    const fixed=(state.prices||[]).find(p=>p.product_option_id && String(p.product_option_id)===String(o.product_option_id) && (!p.price_valid_to || Date.parse(p.price_valid_to)>=Date.now()));
    if(Number(fixed?.public_sell_price_ex_vat)>0) return `<span class="pscOptionPrice"><b>${esc(aed(Number(fixed.public_sell_price_ex_vat)))}</b><small>PSC price · ex VAT · quotation confirms</small></span>`;
    return '<span class="pscOptionPrice"><b>Request quotation</b></span>';
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
  function familyAvailabilityLabel(f){
    const selected=selectedOptions();
    if(selected.length===1){
      const stock=window.PS_CATALOGUE_STOCK?.forOption(selected[0],state.familyId);
      if(stock?.acorus_managed) return `${window.PS_CATALOGUE_STOCK.statusLabel(stock)} · supplier report ${window.PS_CATALOGUE_STOCK.stockDate} · reconfirmed in quotation`;
      const row=state.optionAvailability.find(x=>x.product_option_id===selected[0].product_option_id);
      return row?.verified_at&&row?.valid_until&&Date.parse(row.valid_until)>=Date.now()?row.availability_label:'Availability confirmed at quotation';
    }
    return 'Availability confirmed at quotation';
  }
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
  function resetSelection(){ state.qty=1;state.presentation='';state.selectedOptionIds=[];state.selectedFallbackBrands=[];state.otherBrandActive=false;state.otherBrand=''; }

  async function loadDetail(id){
    const version=(state.loadVersion||0)+1;state.loadVersion=version;
    state.loading=true;state.familyId=id;state.family=null;state.options=[];state.prices=[];state.availability=null;state.optionAvailability=[];
    state.familyInDatabase=false;
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
        if(version!==state.loadVersion)return;
        if(fErr) throw fErr;if(oErr) throw oErr;if(pErr) throw pErr;if(aErr) throw aErr;if(oaErr) throw oaErr;
        if(family) {state.family=family;state.familyInDatabase=true;} state.options=Array.isArray(approved)?approved.map(o=>({...o,reference_only:true,reference_source:'catalogue_family_option_reference_public'})):[];state.prices=Array.isArray(prices)?prices:[];state.availability=availability||null;state.optionAvailability=Array.isArray(optionAvailability)?optionAvailability:[];
      }catch(e){console.warn('PS family detail load failed; using controlled fallback.',e?.message||e);}
    }
    if(version!==state.loadVersion)return;
    if(!state.family) state.family=fallbackFamily(id);
    state.options=window.PS_CATALOGUE_REFRESH?.mergeOptions(state.options,id)||state.options;
    state.options=window.PSC_VARIANT_APPLY_OPTIONS?.(state.options,id)||state.options;
    state.options=window.PS_CATALOGUE_STOCK?.optionsForFamily(state.options,id)||state.options;
    if(state.listingSku){
      const product=catalogueProductForSku(state.listingSku),group=product&&window.PS_CATALOGUE_STOCK?.groupForProduct(product);
      const allowed=new Set((group?._familyGroup.members||[product]).filter(Boolean).map(p=>p.pscSku));
      state.options=state.options.filter(o=>allowed.has(window.PS_CATALOGUE_STOCK?.forOption(o,id)?.sku));
    }
    if(state.listingPreview?.specificationRequest){
      // A requirement is a request to PSC, not an invitation to browse all historical supplier options.
      const decision=(window.PSC_STOREFRONT_BRAND_CHOICES||[]).find(d=>d.familyId===id&&d.requirementKey===state.listingPreview.requirementSku);
      const allowed=new Set(window.PSC_STOREFRONT_GROUPS.shortlist(window.PSC_DATA.products,decision&&{...decision,strict:decision.strict||state.family?.dha_status==='Strict'}).map(p=>p.pscSku));
      state.options=state.options.filter(o=>allowed.has(window.PS_CATALOGUE_STOCK?.forOption(o,id)?.sku));
    }
    // Controlled local/reference descriptors can carry a more exact presentation
    // than the family's generic scaffold. Keep those choices reachable without
    // rewriting their identities or relaxing incompatible-selection clearing.
    if(state.family?.presentations?.some(Boolean)) state.family={...state.family,presentations:[...new Set([
      ...(Array.isArray(state.family.presentations)?state.family.presentations:[]),
      ...state.options.map(o=>o.presentation).filter(meaningfulPresentation)
    ])]};
    state.loading=false;
  }

  function preferenceSummary(){
    const parts=[];
    selectedOptions().forEach(o=>parts.push(`${normalizedBrand(o.brand)||'Product'} — ${optionDescriptor(o,state.family)}`));
    state.selectedFallbackBrands.forEach(b=>parts.push(b));
    if(state.otherBrandActive&&state.otherBrand.trim()) parts.push(`Other: ${state.otherBrand.trim()}`);
    return parts.length?parts.join(' · '):'No brand preference';
  }
  function selectionLabel(o){
    const exact=String(o.exact_product_name||''),brand=normalizedBrand(o.brand);
    return [brand&&!exact.toLowerCase().includes(brand.toLowerCase())?brand:'',exact,
      o.presentation&&!exact.toLowerCase().includes(String(o.presentation).toLowerCase())?o.presentation:'',o.pack].filter(Boolean).join(' · ');
  }
  function preferenceBlock(f){
    const chosen=selectedOptions()[0], fallback=state.selectedFallbackBrands[0];
    if(state.listingSku)return `<section class="pscFamilyPreferenceBlock professionalSelector">${state.options.length>1?`<label for="professionalVariant">Select pack</label><select id="professionalVariant" data-family-variant>${state.options.map(o=>`<option value="${esc(optionKey(o))}" ${chosen&&optionKey(chosen)===optionKey(o)?'selected':''}>${esc(selectionLabel(o))}</option>`).join('')}</select>`:''}<p class="professionalSelectionNote">This exact product and pack are retained in your request. Availability and supply approval are confirmed in quotation.</p></section>`;
    return `<section class="pscFamilyPreferenceBlock professionalSelector">
      <label for="professionalVariant">${state.options.length?'Select exact product & pack':'Product specification'}</label>
      <select id="professionalVariant" data-family-variant>
        <option value="" ${!chosen&&!fallback&&!state.otherBrandActive?'selected':''}>No brand preference — request by specification</option>
        ${state.options.length?`<optgroup label="Exact catalogue options">${state.options.map(o=>`<option value="${esc(optionKey(o))}" ${chosen&&optionKey(chosen)===optionKey(o)?'selected':''}>${esc(selectionLabel(o))}${o.reference_only||o.local_reference?' · quotation reference':''}</option>`).join('')}</optgroup>`:''}
        ${familyBrandFallbacks(f).length?`<optgroup label="Sourcing preferences — exact SKU to confirm">${familyBrandFallbacks(f).map(brand=>`<option value="brand:${esc(brand)}" ${fallback===brand?'selected':''}>${esc(brand)} — specification to confirm</option>`).join('')}</optgroup>`:''}
        <option value="other" ${state.otherBrandActive?'selected':''}>Specify another exact requirement</option>
      </select>
      ${!chosen&&(f.presentations||[]).length?`<label for="professionalPresentation">Presentation / format</label><select id="professionalPresentation" data-family-format><option value="">Confirm in quotation</option>${f.presentations.filter(meaningfulPresentation).map(x=>`<option ${state.presentation===x?'selected':''}>${esc(x)}</option>`).join('')}</select>`:''}
      ${state.otherBrandActive?`<label for="professionalSpecification">Exact requirement</label><textarea id="professionalSpecification" class="pscOtherBrandInput" data-family-other-brand placeholder="Brand, strength, form, model, pack or configuration required" maxlength="1000">${esc(state.otherBrand)}</textarea>`:''}
      <p class="professionalSelectionNote">${chosen?'This exact selection is retained in your request. Availability and supply approval are confirmed in quotation.':'Request by specification. PS confirms the exact product before supply.'}</p>
    </section>`;
  }

  function variantPreview(f){
    const chosen=selectedOptions();
    if(chosen.length===1){
      const o={...chosen[0],image_url:(window.PSC_IMAGE_POLICY?window.PSC_IMAGE_POLICY.resolve(chosen[0].image_url):chosen[0].image_url)}, verified=window.PSC_VARIANT_PHOTO_FOR?.(o,state.familyId)||window.PSC_VARIANT_EVIDENCE_FOR?.(o,state.familyId);
      const bound=window.PS_CATALOGUE_STOCK?.forOption(o,state.familyId),exact=bound&&catalogueProductForSku(bound.sku);
      const retained=exact&&window.PS_CATALOGUE_STOCK.realPhoto(exact)?familyProductImage(exact):'';
      return {image:verified?String(window.PSC_IMAGE_POLICY?window.PSC_IMAGE_POLICY.resolve(verified.image_url||o.image_url)||'':verified.image_url||o.image_url||''):retained,title:String(o.exact_product_name||'Selected product'),
        pack:String(o.pack||'Pack / unit to confirm'),gallery:[],
        description:String(o.verified_description||optionDescriptor(o,f)),
        reference:exact?.imageRole==='SPECIFICATION_REFERENCE_ONLY',
        evidence:exact?.imageRole==='SPECIFICATION_REFERENCE_ONLY'?'Illustrative product; exact model and compatibility confirmed in quotation':verified?(verified.pack_confirmed===false?'Verified product photograph · exact pack to confirm':'Verified variant photograph'):retained?'Existing product photograph · exact pack subject to label confirmation':'Variant image / pack requires verification',
        pricing:optionPrice(o),selected:true,multiple:false};
    }
    if(chosen.length>1){
      return {image:'',title:`${chosen.length} variants selected`,pack:'Each product is quoted separately',
        gallery:chosen.map(o=>({url:String((window.PSC_IMAGE_POLICY?window.PSC_IMAGE_POLICY.resolve(o.image_url):o.image_url)||''),alt:String(o.exact_product_name||'Selected product'),
          pack:String(o.pack||'Pack to confirm'),price:optionPrice(o)})),
        description:'Review each selected variant below. No single family photograph represents all selected products.',
        evidence:'Exact product photos and prices are shown per variant where available',
        pricing:'',selected:true,multiple:true};
    }
    const base=familyPreview(f);
    return {...base,description:'Choose an exact product variant to view its image, description and price.',
      evidence:'Representative family preview only — not a selected variant',pricing:'',selected:false,multiple:false};
  }

  function detailHtml(){
    const f=state.family||fallbackFamily(state.familyId);if(!f)return '';
    const selected=selectedOptions()[0], preview=variantPreview(f), dha=isDhaMapped(f), kind=familyKind(f), availability=familyAvailabilityLabel(f);
    const pack=selected?(selected.pack||'Pack / unit to confirm'):(f.order_pack_basis||'Pack / unit to confirm');
    const exactRecord=selected?.sku?catalogueProductForSku(selected.sku):null;
    const factRecord=selected?{...exactRecord,...selected,name:selected.exact_product_name,catalogueDisplayName:selected.exact_product_name,cataloguePack:selected.pack,page_type:f.page_type,professionalInformation:selected.professionalInformation||exactRecord?.professionalInformation}:{name:f.family_name,family_id:f.family_id,page_type:f.page_type,pack:f.order_pack_basis};
    return `<div class="modalBackdrop fluidOverlay pscFamilyDetailBackdrop" data-family-detail-close><div class="modal productModalShell fluidProductShell pscFamilyModalShell" onclick="event.stopPropagation()"><section class="productDetailModal fluidProductDetail professionalProductDetail publicProductSheet pscFamilyProductSheet" role="dialog" aria-modal="true" aria-labelledby="pscFamilyTitle">
      <div class="modalHeader fluidProductHeader"><button class="productBackButton" type="button" data-family-detail-close aria-label="Back to catalogue">←</button><div><span class="eyebrow">${state.listingSku?'Product':'Product specification'}</span><h2 id="pscFamilyTitle">${esc(state.listingSku?selected?.exact_product_name||catalogueProductForSku(state.listingSku)?.name:f.family_name)}</h2><div class="smallMuted mono">${esc(state.listingSku||f.family_id)}</div></div>${dha?`<img class="pscFamilyHeaderDha" src="${DHA_ICON}" alt="DHA requirement mapping">`:''}</div>
      <div class="productDetailGrid fluidProductGrid">
        <div class="detailImagePane fluidImagePane" data-psc-preview-mode="${selected?'single':'family'}"><div class="detailProductImageWrap pscFamilyPreview">${preview.image?`<img src="${esc(preview.image)}" alt="${esc(preview.title)} · ${esc(preview.evidence)}" onerror="this.style.display='none'">`:`<span class="catalogueImageEmpty">${selected?'Exact variant photograph pending verification':'Select an exact product to view its photograph'}</span>`}</div><div class="detailImageMeta"><b>${esc(preview.title)}</b>${preview.reference?'<p class="smallMuted">Illustrative product. Exact model and compatibility confirmed in quotation.</p>':''}</div></div>
        <div class="detailContentPane fluidDetailContent">
          <div class="professionalPurchaseIdentity"><h3>${esc(selected?.exact_product_name||f.family_name)}</h3><p>${esc(pack)}</p></div>
          ${preferenceBlock(f)}${window.PSC_READY_BASKETS?.entryHtml(selected?.sku||state.listingSku)||''}
          <div class="professionalCommercial">${selected?optionPrice(selected):''}${selected&&availability!=='Availability confirmed at quotation'?`<p class="professionalAvailability">${esc(availability)}</p>`:''}${window.PSC_RETAIL_PRICE_NOTICE_HTML?.()||''}</div>
          ${window.PSC_PRODUCT_PRESENTATION.whatsappHtml(factRecord)}
          ${window.PSC_PRODUCT_PRESENTATION.documentsHtml(factRecord)}
          <div class="productDisclosureList pscFamilyDisclosureList">
            <details><summary><span>Details</span><i>+</i></summary><div>${window.PSC_PRODUCT_PRESENTATION.factsHtml(factRecord,{heading:false})}${selected?.verified_description?`<p>${esc(selected.verified_description)}</p>`:''}<p>${esc(f.commercial_specification||'Exact specification confirmed in quotation.')}</p><small>Family specification; the selected exact product and pack remain separate.</small><p class="smallMuted">${esc(preview.evidence)}</p></div></details>
            ${dha?`<details><summary><span>Requirement mapping</span><i>+</i></summary><div class="pscFamilyRegulatoryDisclosure"><div class="pscFamilyRegulatoryTitle"><img src="${DHA_ICON}" alt="DHA requirement"><strong>Mapped to the applicable DHA clinic requirement.</strong></div><p>${esc(f.requirement_reference||'DHA requirement')} · ${esc(f.dha_status||'Status to verify')}</p>${f.exact_controlled_wording?`<p>${esc(f.exact_controlled_wording)}</p>`:''}<small>Conditional requirements and alternatives retain their source conditions. Requirement mapping is not DHA product approval.</small></div></details>`:''}
            <details><summary><span>Supply & documentation</span><i>+</i></summary><div>${availability==='Availability confirmed at quotation'?`<p>${!selected?'Request quotation · ':''}${esc(availability)}</p>`:''}<p>${kind==='medicine'?'Licensed supply route, registration, storage, batch/expiry and recipient authorization are confirmed before commitment.':'Exact specification, included components, compatibility, delivery and applicable warranty are confirmed in quotation.'}</p><p>Manufacturer documentation is provided when verified for the selected exact product.</p></div></details>
          </div>
        </div>
      </div>
      <div class="productStickyBar publicProductSticky pscFamilyStickyBar professionalRequestBar"><button type="button" class="button light" data-family-view-request>View request</button>${window.PSC_PRODUCT_PRESENTATION.quantityHtml(state.qty,pack)}<button type="button" class="button primary" data-family-quote>Add to Supply Request</button></div>
    </section></div></div>`;
  }

  let familyOpener=null;
  function draw(){
    if(!state.open)return;
    let root=document.querySelector('[data-psc-family-detail-root]');
    const saved=window.PSC_MOTION?.capture();
    const existing=!!root;
    const expanded=[...(root?.querySelectorAll('details')||[])].map(el=>el.open);
    if(!root){root=document.createElement('div');root.dataset.pscFamilyDetailRoot='';document.body.appendChild(root);}
    if(existing&&root.querySelector('.pscFamilyModalShell')&&!root.querySelector('.pscProductLoading')){
      const template=document.createElement('template');template.innerHTML=detailHtml();
      root.querySelector('.pscFamilyModalShell').replaceChildren(...template.content.querySelector('.pscFamilyModalShell').childNodes);
    }else root.innerHTML=detailHtml();
    document.documentElement.classList.add('pscFamilyDetailOpen');bindDetail(root);window.PSC_DISCLOSURES?.enhance(root);
    if(existing){
      root.querySelectorAll('details').forEach((el,i)=>el.open=!!expanded[i]);
      window.PSC_MOTION?.restore(saved);
      const image=root.querySelector('.pscFamilyPreview img');
      if(image){const src=image.src;const reveal=()=>{if(image.isConnected&&image.src===src)window.PSC_MOTION?.animate(image,[{opacity:.35},{opacity:1}],180);};if(image.complete)reveal();else image.addEventListener('load',reveal,{once:true});}
      window.PSC_MOTION?.animate(root.querySelector('.professionalPurchaseIdentity'),[{opacity:.5},{opacity:1}],180);
    }else root.querySelector('.productBackButton')?.focus({preventScroll:true});
  }
  function close(){
    state.open=false;state.openToken=null;state.loadVersion=(state.loadVersion||0)+1;
    const root=document.querySelector('[data-psc-family-detail-root]');
    window.PSC_MOTION?.exit(root?.firstElementChild);
    document.documentElement.classList.remove('pscFamilyDetailOpen');root?.remove();
    if(familyOpener)window.PSC_MOTION?.restore({focus:familyOpener,scroll:[],overlays:[]});
  }
  async function open(id,listingPreview=null){
    if(!id)return;
    window.PSC_MOTION?.finishExits();
    familyOpener=window.PSC_MOTION?.capture()?.focus;
    state.listingPreview=listingPreview;state.listingSku=listingPreview?.sku||'';resetSelection();state.open=true;state.openRoute=window.PSC_CURRENT_ROUTE();
    const opening=Symbol();state.openToken=opening;
    const loading=loadDetail(id);
    // A delayed placeholder avoids a flash on cache hits, while making slow reads visible.
    const loadingTimer=setTimeout(()=>{
      if(!state.open||state.openToken!==opening||state.familyId!==id||!state.loading)return;
      document.querySelector('[data-psc-family-detail-root]')?.remove();
      const root=document.createElement('div');root.dataset.pscFamilyDetailRoot='';
      root.innerHTML='<div class="modalBackdrop fluidOverlay pscFamilyDetailBackdrop" data-family-detail-close><div class="modal productModalShell fluidProductShell pscFamilyModalShell" onclick="event.stopPropagation()" role="dialog" aria-modal="true" aria-label="Loading product"><button class="productBackButton" data-family-detail-close aria-label="Back to catalogue">←</button><div class="pscProductLoading" role="status" aria-busy="true"><span>Loading product details…</span><div class="pscSkeletonImage"></div><div class="pscSkeletonLine"></div><div class="pscSkeletonLine"></div></div></div></div>';
      document.body.appendChild(root);document.documentElement.classList.add('pscFamilyDetailOpen');
      root.querySelectorAll('[data-family-detail-close]').forEach(el=>{el.onclick=event=>{if(el.tagName==='BUTTON'||event.target===el)close();};});root.querySelector('button').focus({preventScroll:true});
    },180);
    await loading;clearTimeout(loadingTimer);
    if(state.openToken!==opening||state.familyId!==id||!state.open)return;
    const only=state.options.length===1?state.options[0]:null;
    if(state.listingSku){
      const exact=state.options.find(o=>o.sku===state.listingSku)||state.options.find(o=>window.PS_CATALOGUE_STOCK?.forOption(o,id)?.sku===state.listingSku);
      if(exact){state.selectedOptionIds=[optionKey(exact)];state.presentation=exact.presentation||'';}
    }
    if(only&&(window.PSC_VARIANT_PHOTO_FOR?.(only,id)||window.PSC_VARIANT_EVIDENCE_FOR?.(only,id))){state.selectedOptionIds=[optionKey(only)];state.presentation=only.presentation||'';}
    draw();
  }
  function quoteSummary(){
    const f=state.family||fallbackFamily(state.familyId),kind=familyKind(f),preference=preferenceSummary(),chosen=selectedOptions();
    const requirement=catalogueProductForSku(state.listingPreview?.requirementSku);
    const requirementSnapshot=requirement?{sku:requirement.pscSku,name:requirement.name,pack:requirement.pack,reference:requirement.dhaReference||'',status:requirement.dhaStatus||'',condition:requirement.dhaCondition||''}:null;
    const brands=[...new Set([...chosen.map(o=>normalizedBrand(o.brand)).filter(Boolean),...state.selectedFallbackBrands])];
    const specific=chosen.length===1&&!chosen[0].local_reference&&!chosen[0].reference_only&&!state.selectedFallbackBrands.length&&!state.otherBrandActive;
    const mode=specific?'specific_option':chosen.length||state.selectedFallbackBrands.length||state.otherBrandActive?'other_brand':'no_preference';
    const snapshots=chosen.map(o=>({...o,
      local_product_option_id:o.local_reference?o.product_option_id:null,
      reference_product_option_id:o.reference_only?o.product_option_id:null,
      product_option_id:o.local_reference||o.reference_only?null:o.product_option_id}));
    return {qty:state.qty,requirementSnapshot,localFamily:!state.familyInDatabase,familyId:f?.family_id||state.familyId,familyName:f?.family_name||state.familyId,familyPageType:f?.page_type||'',orderPackBasis:f?.order_pack_basis||'',presentation:state.presentation||'',brandPreference:preference,brandPreferenceMode:mode,requestedBrands:brands,requestedBrand:mode==='other_brand'?preference:brands.join(', '),requestedProductOptions:snapshots,productOption:snapshots.length===1?snapshots[0]:null,regulated:kind==='medicine',requirementType:requirementType(f),commercialSpecification:f?.commercial_specification||'',priceTreatment:priceLabel(f),availability:familyAvailabilityLabel(f),dhaMapped:isDhaMapped(f),requirementReference:f?.requirement_reference||'',requirementStatus:f?.dha_status||''};
  }
  function goToQuote(){
    if(state.otherBrandActive&&!state.otherBrand.trim()){const input=document.querySelector('[data-family-other-brand]');input?.focus();input?.classList.add('invalid');return;}
    window.dispatchEvent(new CustomEvent('psc:add-family-line',{detail:quoteSummary()}));close();
  }
  function prefillContact(){
    let draft=null;try{draft=JSON.parse(sessionStorage.getItem(DRAFT_KEY)||'null');}catch{} if(!draft)return;
    const form=document.querySelector('[data-public-enquiry]');if(!form)return;const type=form.querySelector('[name="requirement_type"]'),req=form.querySelector('[name="requirement"]');if(type)type.value=draft.requirementType;
    if(req&&!req.value){const rows=[`PS family: ${draft.familyName} (${draft.familyId})`];if(draft.presentation)rows.push(`Presentation: ${draft.presentation}`);rows.push(`Brand preference: ${draft.brandPreference}`);if(draft.orderPackBasis)rows.push(`Order / pack basis: ${draft.orderPackBasis}`);if(draft.priceTreatment)rows.push(`Price treatment: ${draft.priceTreatment}`);if(draft.availability)rows.push(`Availability: ${draft.availability}`);if(draft.dhaMapped&&draft.requirementReference)rows.push(`Requirement mapping: DHA requirement · ${draft.requirementReference}`);rows.push('Quantity / timing: ');req.value=rows.join('\n');req.focus({preventScroll:true});}
  }
  function bindDetail(root){
    const selector=root.querySelector('[data-family-variant]');
    if(selector)selector.value=state.selectedOptionIds[0]||(state.otherBrandActive?'other':state.selectedFallbackBrands[0]?'brand:'+state.selectedFallbackBrands[0]:'');
    root.querySelectorAll('[data-family-detail-close]').forEach(el=>{el.onclick=event=>{if(el.tagName==='BUTTON'||event.target===el)close();};});
    root.querySelector('[data-family-variant]')?.addEventListener('change',e=>{
      const value=e.target.value;state.selectedOptionIds=[];state.selectedFallbackBrands=[];state.otherBrandActive=false;state.otherBrand='';state.presentation='';
      if(value==='other')state.otherBrandActive=true;
      else if(value.startsWith('brand:'))state.selectedFallbackBrands=[value.slice(6)];
      else if(value){state.selectedOptionIds=[value];state.presentation=selectedOptions()[0]?.presentation||'';}
      draw();root=document.querySelector('[data-psc-family-detail-root]');root?.querySelector('[data-family-variant]')?.focus();
    });
    root.querySelector('[data-family-format]')?.addEventListener('change',e=>{state.presentation=e.target.value;draw();});
    root.querySelector('[data-family-other-brand]')?.addEventListener('input',e=>{state.otherBrand=e.target.value;e.target.classList.remove('invalid');});
    window.PSC_PRODUCT_PRESENTATION.bindQuantity(root,value=>state.qty=value);
    root.querySelector('[data-family-quote]')?.addEventListener('click',goToQuote);
    root.querySelector('[data-family-view-request]')?.addEventListener('click',()=>{close();window.dispatchEvent(new Event('psc:view-request'));});
  }
  window.PSC_OPEN_FAMILY_DETAIL=open;
  window.addEventListener('psc:open-family',e=>open(e.detail?.familyId||''));
  document.addEventListener('click',e=>{
    const familyTrigger=e.target.closest?.('[data-psc-family-open]');
    if(familyTrigger){
      e.preventDefault();
      e.stopImmediatePropagation();
      const card=familyTrigger.closest('article,.productCard,.publicCatalogueCard'),img=card?.querySelector('.productMainImage,.publicCatalogueVisual>img:not(.publicDhaMark)');
      open(familyTrigger.dataset.pscFamilyOpen||'',img?{image:(window.PSC_IMAGE_POLICY?window.PSC_IMAGE_POLICY.resolve(img.getAttribute('src')):img.getAttribute('src')),title:img.alt}:null);
      return;
    }
    if(e.target.closest?.('[data-psc-family-detail-root]')) return;
    const productTrigger=e.target.closest?.('[data-product-view],[data-public-product-view],[data-add]');
    if(!productTrigger) return;
    const sku=productTrigger.dataset.productView||productTrigger.dataset.publicProductView||productTrigger.dataset.add||'';
    const familyId=familyIdForSku(sku);
    if(!familyId) return;
    // Reuse the existing detail surface while restricting named products to their storefront identity.
    e.preventDefault();
    e.stopImmediatePropagation();
    const card=productTrigger.closest('article,.productCard,.publicCatalogueCard'),img=card?.querySelector('.productMainImage,.publicCatalogueVisual>img:not(.publicDhaMark)');
    const exact=window.PS_CATALOGUE_STOCK?.forProduct(sku)?.source_kind==='product';
    open(familyId,{image:img?(window.PSC_IMAGE_POLICY?window.PSC_IMAGE_POLICY.resolve(img.getAttribute('src')):img.getAttribute('src')):'',title:img?.alt||catalogueProductForSku(sku)?.name||'',imageReference:catalogueProductForSku(sku)?.imageRole==='SPECIFICATION_REFERENCE_ONLY',...(exact?{sku}:{specificationRequest:true,requirementSku:sku})});
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.open)close();});
  const closeOnNavigation=()=>{if(state.open&&state.openRoute!==window.PSC_CURRENT_ROUTE())close();};
  window.addEventListener('popstate',closeOnNavigation);
  window.addEventListener('hashchange',closeOnNavigation);
  window.addEventListener('hashchange',()=>setTimeout(()=>{prefillContact();hideMedicineFamilyScaffolds();},50));
  const observer=window.PSC_ENHANCEMENTS.createObserver(()=>{prefillContact();hideMedicineFamilyScaffolds();});
  observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
  setTimeout(hideMedicineFamilyScaffolds,0);
})();
