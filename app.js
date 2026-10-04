(() => {
  'use strict';
  const D = window.PSC_DATA;
  const C = window.PSC_COPY || {};
  const PSC_LOGO = '/assets/psc-logo-current.png';
  const DHA_ICON = '/assets/dha-requirement.png';
  const WORKSHOP = Array.isArray(window.PSC_WORKSHOP) ? window.PSC_WORKSHOP : [];
  const WORKSHOP_CATEGORIES = ['All','Product Basics',"What's the Difference?",'Clinic Checks','Equipment Readiness','Stock & Expiry','School Clinic','Ordering & Specifications'];
  const WORKSHOP_SAVE_KEY = 'pscWorkshopSavedV1';
  const $app = document.getElementById('app');
  const STORAGE = 'pscClinicPortalStateV12_1';

  const seed = {
    groupName: '',
    campus: '',
    activeSchoolId: '',
    basketsBySchool: {},
    accountEmail: '',
    basket: [],
    customProducts: {},
    requests: [],
    stock: JSON.parse(JSON.stringify(D.demoStock)),
    productOverrides: {},
    audit: []
  };

  const sb = window.PSC_SUPABASE || null;
  let session = null;
  let authContext = null;
  let authReady = false;

  let state = load();
  let ui = { mobile:false, publicMenu:false, basket:false, modal:null, accountMenu:false, globalSearch:'', catalogueQuery:'', catalogueNeed:'all', catalogueCat:'All product types', catalogueFilter:'All lines', productQuery:'', productCat:'All', evidence:'All', cmsChannel:'institutional', cmsSearch:'', wholesaleQuery:'', wholesaleCat:'All', workshopQuery:'', workshopCategory:'All', tourStep:0, overlayScroll:0, mailTab:'compose', mailSearch:'', mailRole:'All', mailInstitution:'All', mailTemplate:'workshop', mailGuideSlug:'aed-has-expiring-parts-too', mailSelectedContacts:[], mailDraftSubject:'', mailDraftIntro:'', mailDraftCta:'Read the guide', optionSearch:'', optionDecision:'All', optionFamily:'all' };

  const cms = {
    loaded:false,
    loading:false,
    products:[],
    settings:[],
    media:[],
    storefronts:[],
    publicRows:{institutional:[],wholesale:[]}
  };

  const mailDesk = {
    loaded:false,
    loading:false,
    backendReady:false,
    contacts:[],
    campaigns:[],
    recipients:[],
    senderName:'Pharma Service',
    senderEmail:'info@pharmaservice.ae'
  };


  const optionDesk = {
    loaded:false,
    loading:false,
    families:[],
    options:[]
  };

  const INSTITUTIONAL_CATALOGUE_TEMPLATE = {
    id:'institutional-catalogue-v1',
    name:'PSC Institutional Catalogue',
    version:'1.0',
    categories:[
      {id:'wounds',label:'Cuts & Wounds',note:'Dressings, antiseptics, gauze, closure and wound protection',icon:'wounds',bg:'#FF8B7B',ink:'#53221B'},
      {id:'sports',label:'Sports Injuries',note:'Cold therapy, compression, support and immobilisation',icon:'sports',bg:'#9180F4',ink:'#211A5C'},
      {id:'breathing',label:'Breathing & Oxygen',note:'Nebulisation, oxygen delivery, airway and respiratory support',icon:'breathing',bg:'#9EB8F7',ink:'#173D70'},
      {id:'vitals',label:'Vitals & Assessment',note:'Blood pressure, temperature, oximetry and clinical assessment',icon:'vitals',bg:'#FFB17E',ink:'#5A2A10'},
      {id:'screening',label:'Eyes, Ears & Screening',note:'Vision, ENT and screening equipment and accessories',icon:'screening',bg:'#F6CB75',ink:'#4B3A08'},
      {id:'diabetes',label:'Diabetes & Testing',note:'Glucose monitoring, strips, lancets and related testing',icon:'diabetes',bg:'#9DDAC7',ink:'#174B3C'},
      {id:'medicines',label:'Medicines & Symptoms',note:'Licensed medicines and symptom-support products',icon:'medicines',bg:'#F7A7B8',ink:'#5A2030'},
      {id:'allergy',label:'Allergy, Skin & Bites',note:'Allergy, topical, bite and skin-support products',icon:'allergy',bg:'#CDBAF7',ink:'#39245E'},
      {id:'patient-care',label:'Nausea & Patient Care',note:'Emesis, dosing, hygiene and patient-comfort supplies',icon:'patient',bg:'#FFD28F',ink:'#53350E'},
      {id:'infection',label:'Infection Control & PPE',note:'PPE, hand hygiene, disinfection and waste control',icon:'infection',bg:'#8FD8D3',ink:'#104D49'},
      {id:'procedures',label:'Procedures & Consumables',note:'General clinical disposables and procedure-support items',icon:'procedures',bg:'#AEC1F7',ink:'#233D72'},
      {id:'emergency',label:'Emergency & Response',note:'Resuscitation, first response and urgent-use products',icon:'emergency',bg:'#FFA08B',ink:'#5B2118'},
      {id:'equipment',label:'Equipment & Mobility',note:'Clinical furniture, mobility, storage and capital equipment',icon:'equipment',bg:'#DDBA9B',ink:'#4A3323'},
      {id:'all',label:'All Supplies',note:'Browse the complete institutional catalogue',icon:'all',bg:'#F5D37E',ink:'#45350A'}
    ]
  };
  window.PSC_INSTITUTIONAL_CATALOGUE_TEMPLATE = INSTITUTIONAL_CATALOGUE_TEMPLATE;

  function clinicalNeedIds(p){
    if(Array.isArray(p.clinicalNeeds) && p.clinicalNeeds.length) return p.clinicalNeeds;
    const cat=p.category||'';
    if(cat==='First Aid & Wound Care') return ['wounds'];
    if(cat==='PPE & Infection Control') return ['infection'];
    if(cat==='Diagnostics & Monitoring') return ['vitals'];
    if(cat==='Respiratory') return ['breathing'];
    if(cat==='Diabetes & Testing') return ['diabetes'];
    if(cat==='Medicines') return ['medicines'];
    if(cat==='Emergency & Oxygen') return ['emergency'];
    if(cat==='Furniture & Mobility') return ['equipment'];
    if(cat==='Hygiene & Student Care') return ['patient-care'];
    return ['procedures'];
  }
  function clinicalNeedMatches(p,id){ return id==='all' || clinicalNeedIds(p).includes(id); }
  function clinicalNeedMeta(id){ return INSTITUTIONAL_CATALOGUE_TEMPLATE.categories.find(c=>c.id===id)||INSTITUTIONAL_CATALOGUE_TEMPLATE.categories.at(-1); }
  function clinicalNeedIcon(id){
    const m={
      all:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></svg>',
      wounds:'<svg viewBox="0 0 24 24"><rect x="5" y="7" width="14" height="10" rx="4"/><path d="m8 7 8 10M16 7 8 17M12 9.5v5M9.5 12h5"/></svg>',
      sports:'<svg viewBox="0 0 24 24"><path d="M7 4c2.5 1.6 3 4.3 2 7-1.1 3-.6 6.4 2.5 9M17 4c-2.5 1.6-3 4.3-2 7 1.1 3 .6 6.4-2.5 9M8.5 11h7"/></svg>',
      breathing:'<svg viewBox="0 0 24 24"><path d="M12 4v7M11 11c-2-3-5-5-7-3-2 2-1 8 3 10 2 1 4 0 4-3M13 11c2-3 5-5 7-3 2 2 1 8-3 10-2 1-4 0-4-3"/></svg>',
      vitals:'<svg viewBox="0 0 24 24"><path d="M3 12h4l2-5 4 10 2-5h6"/><path d="M4 5h16v14H4z"/></svg>',
      screening:'<svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/></svg>',
      diabetes:'<svg viewBox="0 0 24 24"><path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11z"/><path d="M9.5 15h5"/></svg>',
      medicines:'<svg viewBox="0 0 24 24"><path d="M8 5a4 4 0 0 1 5.7 0l5.3 5.3a4 4 0 0 1-5.7 5.7L8 10.7A4 4 0 0 1 8 5z"/><path d="m10.7 13.3 5.6-5.6"/></svg>',
      allergy:'<svg viewBox="0 0 24 24"><path d="M19 4c-7 0-12 3-12 8 0 3 2 5 5 5 5 0 7-6 7-13z"/><path d="M5 20c2-5 5-8 10-11M18 14l1 1M20 12h1M16 16v1"/></svg>',
      patient:'<svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2M8 15h8"/></svg>',
      infection:'<svg viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z"/><path d="m9 12 2 2 4-4"/></svg>',
      procedures:'<svg viewBox="0 0 24 24"><path d="m14 5 5 5M13 6l5 5M4 20l6-6M8 16l-2-2 8-8 4 4-8 8z"/></svg>',
      emergency:'<svg viewBox="0 0 24 24"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/></svg>',
      equipment:'<svg viewBox="0 0 24 24"><path d="M4 18V8h16v10M4 14h16M7 18v3M17 18v3M7 8V5h5v3"/></svg>'
    };
    return m[id]||m.all;
  }

  function clinicalNeedIllustration(id){
    const m={
      wounds:'/assets/category-wounds.webp?v=3777',
      sports:'/assets/category-sports.webp?v=3777',
      breathing:'/assets/category-breathing.webp?v=3777',
      vitals:'/assets/category-vitals.webp?v=3777',
      screening:'/assets/category-screening.webp?v=3777',
      diabetes:'/assets/category-diabetes.webp?v=3777',
      medicines:'/assets/category-medicines.webp?v=3777',
      allergy:'/assets/category-allergy.webp?v=3777',
      patient:'/assets/category-patient-care.webp?v=3777',
      'patient-care':'/assets/category-patient-care.webp?v=3777',
      infection:'/assets/category-infection.webp?v=3777',
      procedures:'/assets/category-procedures.webp?v=3777',
      emergency:'/assets/category-emergency.webp?v=3777',
      equipment:'/assets/category-equipment.webp?v=3777'
    };
    return m[id] ? `<img src="${m[id]}" alt="" loading="lazy" decoding="async">` : clinicalNeedIcon(id);
  }

  function load(){
    try { const raw = localStorage.getItem(STORAGE); return raw ? {...seed,...JSON.parse(raw)} : JSON.parse(JSON.stringify(seed)); }
    catch { return JSON.parse(JSON.stringify(seed)); }
  }
  function save(){
    try{
      if(state.activeSchoolId){
        state.basketsBySchool=state.basketsBySchool||{};
        state.basketsBySchool[state.activeSchoolId]=state.basket||[];
      }
      localStorage.setItem(STORAGE, JSON.stringify(state));
    }catch{}
  }
  function esc(v=''){ return String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[c])); }
  function money(n){ return Number.isFinite(Number(n)) ? `AED ${Number(n).toFixed(2)}` : '—'; }
  function date(v){ try{return new Date(v).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}catch{return v} }
  function friendlyStatus(status){
    return ({Drafting:'Under Review',Sent:'Quote Sent',Authorized:'Confirmed',Procurement:'Under Process',Delivery:'Under Process',Accepted:'Delivered',Cancelled:'Cancelled'})[status] || status;
  }
  function customerStatusPill(status){ const label=friendlyStatus(status); const k=label.toLowerCase().replace(/\s+/g,'-'); return `<span class="statusPill status-${k}">${esc(label)}</span>`; }
  function expectedDeliveryLabel(r){
    if(r?.expectedDeliveryDate) return `Expected delivery · ${date(r.expectedDeliveryDate)}`;
    if(r?.status==='Delivery') return 'Out for delivery · timing confirmed by PSC';
    if(['Authorized','Procurement'].includes(r?.status)) return 'Delivery timing will be confirmed by PSC';
    return '';
  }
  function addDaysLabel(v,days){ const d=new Date(v); d.setDate(d.getDate()+days); return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }
  function isArchived(r){ return r.status==='Cancelled' && r.cancelledAt && ((Date.now()-new Date(r.cancelledAt).getTime())/(1000*60*60*24) >= 30); }
  function customerVisibleRequests(){ return state.requests.filter(r=>r.campus===state.campus && !isArchived(r)); }
  function accountEmailLabel(){ return state.accountEmail || 'your registered account email'; }
  function schoolLabel(s){
    if(!s) return 'Institutional account';
    return [s.name,s.campus_name].filter(Boolean).join(' — ');
  }
  function availableSchools(){ return (authContext?.schools||[]).filter(Boolean); }
  function canSwitchSchools(){ return !authContext?.isPscAdmin && availableSchools().length>1; }
  function isDemoAccount(){ return authContext?.group?.slug==='psc-demo-group'; }

  function storefrontConfig(channel){
    return cms.storefronts.find(x=>x.channel===channel) || null;
  }

  function cleanNullable(v){
    const s=String(v??'').trim();
    return s===''?null:s;
  }

  function cleanNumber(v){
    const s=String(v??'').trim();
    if(s==='') return null;
    const n=Number(s);
    return Number.isFinite(n)?n:null;
  }

  function cleanBrand(v){
    const s=String(v||'').trim();
    return ['Specification-led','Institutional range'].includes(s)?null:(s||null);
  }

  function localCatalogueSeedRows(){
    const seen=new Set();
    const rows=[];
    (D.products||[]).forEach(p=>{
      const sku=p.pscSku;
      if(!sku || seen.has(sku)) return;
      seen.add(sku);
      const reg=p.dhaMapped
        ? [p.dhaReference,p.dhaRequirement,p.dhaCondition].filter(Boolean).join(' · ')
        : (p.regulatoryMapping||null);
      rows.push({
        psc_sku:sku,
        name:p.name||p.catalogueDisplayName||sku,
        brand:cleanBrand(p.brand),
        pack:p.cataloguePack||p.pack||null,
        category:p.productType||p.category||null,
        image_url:p.imageUrl||null,
        commercial_specification:p.pscOfferedSpecification||p.spec||null,
        requirement_status:p.dhaStatus||p.requirementStatus||null,
        regulatory_mapping:reg,
        regulated:!!p.regulated,
        dha_mapped:!!p.dhaMapped,
        dha_reference:p.dhaReference||null,
        dha_requirement:p.dhaRequirement||null,
        dha_condition:p.dhaCondition||null,
        active:true,
        catalogue_parent_id:p.catalogueParentId||null,
        clinical_needs:Array.isArray(p.clinicalNeeds)?p.clinicalNeeds:[],
        product_type:p.productType||p.category||null,
        short_description:null,
        long_description:null,
        supplier_name:p.institutionalProvisional?null:cleanNullable(p.supplier),
        supplier_sku:cleanNullable(p.supplierSku),
        buy_cost:null, // Static catalogue carries planning numbers, never verified supplier acquisition cost.
        landed_cost:null,
        vat_status:cleanNullable(p.taxStatus),
        stock_status:cleanNullable(p.stock),
        lead_time:cleanNullable(p.leadTime),
        evidence_status:cleanNullable(p.catalogueEvidence||p.evidenceStatus),
        internal_notes:p.institutionalProvisional?'Migrated catalogue planning line. Independently verify actual supplier cost, model/spec, VAT, stock, lead time and regulatory route.':null
      });
    });
    return rows;
  }

  async function ensureCmsProductSeed(){
    if(!sb || !authContext?.isPscAdmin) return;
    const allLocal=localCatalogueSeedRows();
    if(!allLocal.length) return;

    const {data:existing,error:lookupError}=await sb.from('products').select('psc_sku').range(0,1999);
    if(lookupError) throw lookupError;
    const known=new Set((existing||[]).map(x=>x.psc_sku));
    const missing=allLocal.filter(x=>!known.has(x.psc_sku));

    // Ignore duplicate IDs if two admin sessions perform the first import concurrently.
    for(let i=0;i<missing.length;i+=60){
      const {error}=await sb.from('products').upsert(missing.slice(i,i+60),{
        onConflict:'psc_sku',ignoreDuplicates:true
      });
      if(error) throw error;
    }
  }

  async function loadPublicStorefronts(){
    if(!sb) return;
    const [{data:storefronts,error:sfError},{data:institutional,error:iError},{data:wholesale,error:wError}] = await Promise.all([
      sb.from('storefronts').select('channel,display_name,headline,subheadline,active,catalogue_initialized').order('channel'),
      sb.from('published_storefront_catalogue').select('*').eq('channel','institutional').order('display_order').order('name'),
      sb.from('published_storefront_catalogue').select('*').eq('channel','wholesale').order('display_order').order('name')
    ]);
    if(sfError) console.warn('Storefront copy:',sfError.message);
    if(iError) console.warn('Institutional storefront:',iError.message);
    if(wError) console.warn('Wholesale storefront:',wError.message);

    if(storefronts) cms.storefronts=storefronts;
    cms.publicRows.institutional=institutional||[];
    cms.publicRows.wholesale=wholesale||[];
    applyInstitutionalCmsOverlay();
  }

  function applyInstitutionalCmsOverlay(){
    const sf=storefrontConfig('institutional');
    // Until the full institutional migration succeeds, the existing 260-line static master remains in place.
    if(!sf?.catalogue_initialized) return;
    const rows=cms.publicRows.institutional||[];
    const byCatalogueId=new Map((D.products||[]).filter(p=>p.catalogueTransactionId).map(p=>[p.catalogueTransactionId,p]));
    const bySku=new Map((D.products||[]).map(p=>[p.pscSku,p]));
    const preferredIds=new Set(rows.filter(r=>r.psc_sku.startsWith('INST-')).map(r=>r.psc_sku));

    (D.products||[]).forEach(p=>{ p.catalogueVisible=false; });
    // Prefer the authoritative institutional line over an old PSC wholesale/master alias.
    const ordered=[...rows].sort((a,b)=>Number(b.psc_sku.startsWith('INST-'))-Number(a.psc_sku.startsWith('INST-')));
    ordered.forEach(r=>{
      let item=byCatalogueId.get(r.psc_sku)||bySku.get(r.psc_sku);
      if(item?.catalogueTransactionId!==r.psc_sku && item?.catalogueTransactionId && preferredIds.has(item.catalogueTransactionId)) return;
      if(!item){
        item={pscSku:r.psc_sku,name:r.name||r.psc_sku,category:r.category||'Institutional Supplies',pack:r.pack||'',brand:r.brand||'',institutionalProvisional:false};
        D.products.push(item);
        bySku.set(item.pscSku,item);
      }
      item.catalogueVisible=true;
      item.storefrontDbId=r.product_id;
      item.catalogueDisplayName=r.name||item.name;
      item.brand=r.brand||'';
      item.cataloguePack=r.pack||item.pack||'';
      item.productType=r.product_type||r.category||item.productType||'Institutional Supplies';
      item.clinicalNeeds=Array.isArray(r.clinical_needs)?r.clinical_needs:[];
      item.imageUrl=r.image_url||null;
      item.pscOfferedSpecification=r.commercial_specification||'';
      item.storefrontMedia=Array.isArray(r.media_urls)?r.media_urls:[];
      item.storefrontShortDescription=r.short_description||'';
      item.storefrontLongDescription=r.long_description||'';
      item.storefrontPriceMode=r.price_display_mode||'request_quote';
      item.storefrontMoq=r.moq;
      item.regulated=!!r.regulated;
      item.dhaMapped=!!r.dha_mapped;
      item.dhaReference=r.dha_reference||'';
      item.dhaRequirement=r.dha_requirement||'';
      item.dhaCondition=r.dha_condition||'';
      item.dhaStatus=r.requirement_status||'';
      item.contractPrice=(r.price_display_mode==='show_price' && r.display_price!==null) ? Number(r.display_price):null;
    });
  }

  async function loadAdminCms(){
    if(!sb || !authContext?.isPscAdmin) return;
    cms.loading=true;
    try{
      await ensureCmsProductSeed();
      const [{data:products,error:pError},{data:settings,error:sError},{data:media,error:mError},{data:storefronts,error:sfError}] = await Promise.all([
        sb.from('products').select('*').order('psc_sku'),
        sb.from('storefront_product_settings').select('*').order('display_order'),
        sb.from('product_media').select('*').order('display_order'),
        sb.from('storefronts').select('*').order('channel')
      ]);
      if(pError) throw pError;
      if(sError) throw sError;
      if(mError) throw mError;
      if(sfError) throw sfError;
      cms.products=products||[];
      cms.settings=settings||[];
      cms.media=media||[];
      cms.storefronts=storefronts||[];
      cms.loaded=true;
      await loadPublicStorefronts();
    } finally {
      cms.loading=false;
    }
  }

  async function loadAdminFamilyOptions(){
    if(!sb || !authContext?.isPscAdmin || optionDesk.loading) return;
    optionDesk.loading=true;
    try{
      const [{data:families,error:fError},{data:options,error:oError}] = await Promise.all([
        sb.from('catalogue_families').select('family_id,family_name,clinical_need,page_type,common_brands_line,presentations,website_price_treatment,availability_wording').eq('active',true).order('clinical_need').order('family_name'),
        sb.from('catalogue_product_options').select('*').eq('active',true).order('family_id').order('exact_product_name')
      ]);
      if(fError) throw fError;
      if(oError) throw oError;
      optionDesk.families=families||[];
      optionDesk.options=options||[];
      optionDesk.loaded=true;
    }catch(e){
      console.error('Family option control load failed',e);
      toast('<strong>Could not load family options.</strong><br>Check the PSC admin connection and database permissions.');
    }finally{
      optionDesk.loading=false;
      if(currentRoute()==='admin/family-options') render();
    }
  }

  function optionFamilyMeta(id){ return optionDesk.families.find(f=>f.family_id===id)||null; }
  function optionEvidenceReady(o){
    return !!(o?.verification_date && o?.supplier_name && o?.source_key);
  }
  function optionPreferredReady(o){
    return !!(optionEvidenceReady(o) && o?.b2b_cost!==null && o?.b2b_cost!=='' && o?.stock && String(o.stock).toUpperCase()!=='UNKNOWN');
  }
  function optionFixedPriceEligible(o){
    const f=optionFamilyMeta(o?.family_id)||{};
    return String(f.website_price_treatment||'')==='Fixed price when approved';
  }
  function optionPricingMetrics(o){
    const values=[o?.b2b_cost,o?.freight_delivery_cost,o?.install_labour_cost,o?.foc_other_direct_cost];
    const complete=values.every(v=>v!==null&&v!==''&&Number.isFinite(Number(v)));
    const landed=complete?values.reduce((sum,v)=>sum+Number(v),0):null;
    const target=Number.isFinite(Number(o?.target_gm))?Number(o.target_gm):0.20;
    const targetSell=landed!==null&&target<1?landed/(1-target):null;
    const sell=o?.public_sell_price_ex_vat!==null&&o?.public_sell_price_ex_vat!==''&&Number.isFinite(Number(o.public_sell_price_ex_vat))?Number(o.public_sell_price_ex_vat):null;
    const gm=landed!==null&&sell>0?(sell-landed)/sell:null;
    return {complete,landed,target,targetSell,sell,gm};
  }
  function optionFixedPriceLive(o){
    if(!optionFixedPriceEligible(o) || o?.price_decision!=='APPROVED_FIXED' || !o?.public_sell_price_ex_vat) return false;
    if(!o?.price_valid_to) return false;
    const end=new Date(`${o.price_valid_to}T23:59:59`);
    return Number.isFinite(end.getTime()) && end.getTime()>=Date.now();
  }
  function optionPricePill(o){
    if(!optionFixedPriceEligible(o)) return badge('REQUEST QUOTE','');
    if(optionFixedPriceLive(o)) return badge('FIXED PRICE LIVE','ok');
    if(o?.price_decision==='DRAFT_FIXED') return badge('PRICE DRAFT','warn');
    if(o?.price_decision==='HOLD') return badge('PRICE HOLD','danger');
    return badge('NO LIVE PRICE','');
  }
  function optionAvailabilityPill(o){
    const status=o?.availability_status||'UNVERIFIED';
    const valid=o?.availability_valid_until?new Date(o.availability_valid_until):null;
    const current=valid&&Number.isFinite(valid.getTime())&&valid.getTime()>=Date.now();
    if(status==='IN_STOCK'&&current) return badge('IN STOCK VERIFIED','ok');
    if(status==='LIMITED'&&current) return badge('LIMITED STOCK','warn');
    if(status==='OUT_OF_STOCK'&&current) return badge('OUT OF STOCK','danger');
    if(status!=='UNVERIFIED') return badge('STOCK EVIDENCE EXPIRED','warn');
    return badge('AVAILABILITY UNVERIFIED','');
  }
  function optionSearchText(o){
    const f=optionFamilyMeta(o.family_id)||{};
    return [o.family_id,f.family_name,f.clinical_need,o.exact_product_name,o.brand,o.presentation,o.pack,o.supplier_name,o.supplier_reference,o.source_key,o.company_mah].filter(Boolean).join(' ').toLowerCase();
  }
  function optionFamiliesWithCandidates(){
    const q=(ui.optionSearch||'').trim().toLowerCase();
    const decision=ui.optionDecision||'All';
    const byFamily=new Map();
    optionDesk.options.forEach(o=>{
      if(decision!=='All' && o.psc_decision!==decision) return;
      if(q && !optionSearchText(o).includes(q)) return;
      const arr=byFamily.get(o.family_id)||[]; arr.push(o); byFamily.set(o.family_id,arr);
    });
    return [...byFamily.entries()].map(([familyId,options])=>({family:optionFamilyMeta(familyId)||{family_id:familyId,family_name:familyId,clinical_need:''},options})).sort((a,b)=>String(a.family.family_name).localeCompare(String(b.family.family_name)));
  }
  function optionDecisionPill(decision){
    const tone=decision==='APPROVE'?'ok':decision==='VERIFY'?'warn':decision==='HOLD'?'':'danger';
    return badge(decision||'VERIFY',tone);
  }
  function adminFamilyOptionCard(o){
    const verified=optionEvidenceReady(o);
    const preferredReady=optionPreferredReady(o);
    const mrp=o.listed_mrp!==null&&o.listed_mrp!==''?money(Number(o.listed_mrp)):'—';
    const updated=o.decision_updated_at?date(o.decision_updated_at):'No decision change yet';
    const family=optionFamilyMeta(o.family_id)||{};
    const familyPresentations=Array.isArray(family.presentations)?family.presentations.filter(Boolean):[];
    const presentationOptions=[...new Set([o.presentation,...familyPresentations].filter(Boolean))];
    const fixedEligible=optionFixedPriceEligible(o);
    const pm=optionPricingMetrics(o);
    const gmLabel=pm.gm===null?'—':`${(pm.gm*100).toFixed(1)}%`;
    const targetLabel=`${(pm.target*100).toFixed(1)}%`;
    const priceUpdated=o.price_verified_at?date(o.price_verified_at):'Not price-approved';
    return `<article class="familyOptionCard" data-option-review="${esc(o.id)}">
      <div class="familyOptionCardHead"><div><span class="eyebrow">${esc(o.source_key||'SOURCE')}</span><h3>${esc(o.exact_product_name)}</h3><p>${esc([o.brand,o.presentation,o.pack].filter(Boolean).join(' · ')||'Presentation / pack to verify')}</p></div><div class="familyOptionCardStatus">${optionDecisionPill(o.psc_decision)}${optionPricePill(o)}${optionAvailabilityPill(o)}<small>${verified?'Evidence reviewed':'Evidence incomplete'}</small></div></div>
      <div class="familyOptionSourceGrid">
        <div><span>SUPPLIER</span><b>${esc(o.supplier_name||'Missing')}</b><small>${esc(o.supplier_reference||'No supplier reference')}</small></div>
        <div><span>COMPANY / MAH</span><b>${esc(o.company_mah||'Not captured')}</b><small>${esc(o.supplier_listing_evidence||'Source-list evidence not recorded')}</small></div>
        <div><span>ACORUS LISTED MRP</span><b>${mrp}</b><small>Internal retail benchmark only — never PSC selling price</small></div>
      </div>
      <div class="familyOptionControlGrid">
        <label><span>PSC decision</span><select data-option-field="decision"><option ${o.psc_decision==='VERIFY'?'selected':''}>VERIFY</option><option ${o.psc_decision==='APPROVE'?'selected':''}>APPROVE</option><option ${o.psc_decision==='HOLD'?'selected':''}>HOLD</option><option ${o.psc_decision==='REJECT'?'selected':''}>REJECT</option></select></label>
        <label><span>Confirmed brand</span><input data-option-field="brand" value="${esc(o.brand||'')}" placeholder="Verify brand"></label>
        <label><span>Controlled presentation</span>${presentationOptions.length?`<select data-option-field="presentation">${presentationOptions.map(x=>`<option ${x===o.presentation?'selected':''}>${esc(x)}</option>`).join('')}</select>`:`<input data-option-field="presentation" value="${esc(o.presentation||'')}" placeholder="Verify presentation">`}</label>
        <label><span>Exact pack</span><input data-option-field="pack" value="${esc(o.pack||'')}" placeholder="Pack / unit"></label>
        <label><span>B2B cost ex VAT</span><input data-option-field="cost" type="number" min="0" step="0.01" value="${o.b2b_cost===null?'':esc(o.b2b_cost)}" placeholder="AED"></label>
        <label><span>VAT evidence / legacy note</span><input data-option-field="vat" value="${esc(o.vat||'')}" placeholder="Legacy evidence note"></label>
        <label><span>Current stock evidence</span><input data-option-field="stock" value="${esc(o.stock||'UNKNOWN')}" placeholder="UNKNOWN"></label>
        <label><span>Expiry / batch</span><input data-option-field="expiry" value="${esc(o.expiry_batch||'')}" placeholder="If applicable"></label>
        <label><span>Verified on</span><input data-option-field="verified" type="date" value="${esc(o.verification_date||'')}"></label>
      </div>
      <div class="familyOptionFlags">
        <label><input type="checkbox" data-option-field="selectable" ${o.customer_selectable?'checked':''}><span><b>Customer selectable</b><small>Requires APPROVE + verification date.</small></span></label>
        <label><input type="checkbox" data-option-field="preferred" ${o.preferred?'checked':''}><span><b>Internal preferred source</b><small>${preferredReady?'Commercial evidence present.':'Requires APPROVE + verified cost + current stock.'}</small></span></label>
      </div>

      <details class="familyOptionAvailability" ${o.availability_status&&o.availability_status!=='UNVERIFIED'?'open':''}>
        <summary><span><b>Availability evidence</b><small>Public stock language is released only from a dated, unexpired evidence window.</small></span><em>${optionAvailabilityPill(o)}</em></summary>
        <div class="familyAvailabilityGrid">
          <label><span>Public availability state</span><select data-option-field="availability-status"><option value="UNVERIFIED" ${(!o.availability_status||o.availability_status==='UNVERIFIED')?'selected':''}>UNVERIFIED</option><option value="IN_STOCK" ${o.availability_status==='IN_STOCK'?'selected':''}>IN STOCK</option><option value="LIMITED" ${o.availability_status==='LIMITED'?'selected':''}>LIMITED</option><option value="OUT_OF_STOCK" ${o.availability_status==='OUT_OF_STOCK'?'selected':''}>OUT OF STOCK</option></select></label>
          <label><span>Evidence verified at</span><input data-option-field="availability-verified" type="datetime-local" value="${o.availability_verified_at?esc(new Date(o.availability_verified_at).toISOString().slice(0,16)):''}"></label>
          <label><span>Evidence valid until</span><input data-option-field="availability-valid-until" type="datetime-local" value="${o.availability_valid_until?esc(new Date(o.availability_valid_until).toISOString().slice(0,16)):''}"></label>
          <label class="familyAvailabilityEvidence"><span>Evidence reference</span><input data-option-field="availability-evidence" value="${esc(o.availability_evidence_reference||'')}" placeholder="Supplier stock confirmation / quote / written evidence"></label>
        </div>
        <p class="familyOptionControlNote">Do not use IN STOCK from memory, MRP, an old supplier list or a generic product listing. Set a live state only against current evidence with a defined validity window. When the window expires, the customer view automatically falls back to quotation-stage confirmation.</p>
      </details>

      ${fixedEligible?`<details class="familyOptionPricing" ${o.price_decision==='APPROVED_FIXED'||o.price_decision==='DRAFT_FIXED'?'open':''}>
        <summary><span><b>Fixed-price control</b><small>Family permits a fixed price only after evidence + margin release.</small></span><em>${optionPricePill(o)}</em></summary>
        <div class="familyPricingMetrics">
          <div><span>LANDED COST</span><b>${pm.landed===null?'Missing inputs':money(pm.landed)}</b></div>
          <div><span>TARGET SELL @ ${targetLabel} GM</span><b>${pm.targetSell===null?'—':money(pm.targetSell)}</b></div>
          <div class="${pm.gm!==null&&pm.gm<pm.target?'belowTarget':''}"><span>ACTUAL GM</span><b>${gmLabel}</b></div>
          <div><span>PRICE VERIFIED</span><b>${esc(priceUpdated)}</b></div>
        </div>
        <div class="familyPricingGrid">
          <label><span>Price decision</span><select data-option-field="price-decision"><option value="REQUEST_QUOTE" ${o.price_decision==='REQUEST_QUOTE'?'selected':''}>REQUEST QUOTE</option><option value="DRAFT_FIXED" ${o.price_decision==='DRAFT_FIXED'?'selected':''}>DRAFT FIXED</option><option value="APPROVED_FIXED" ${o.price_decision==='APPROVED_FIXED'?'selected':''}>APPROVED FIXED</option><option value="HOLD" ${o.price_decision==='HOLD'?'selected':''}>HOLD</option></select></label>
          <label><span>Price evidence</span><select data-option-field="price-evidence"><option value="MISSING" ${o.price_evidence_status==='MISSING'?'selected':''}>MISSING</option><option value="PLANNING" ${o.price_evidence_status==='PLANNING'?'selected':''}>PLANNING</option><option value="PUBLIC_BENCHMARK" ${o.price_evidence_status==='PUBLIC_BENCHMARK'?'selected':''}>PUBLIC BENCHMARK</option><option value="SUPPLIER_EVIDENCE" ${o.price_evidence_status==='SUPPLIER_EVIDENCE'?'selected':''}>SUPPLIER EVIDENCE</option><option value="VERIFIED_CURRENT" ${o.price_evidence_status==='VERIFIED_CURRENT'?'selected':''}>VERIFIED CURRENT</option></select></label>
          <label><span>Freight / delivery direct cost</span><input data-option-field="freight-cost" type="number" min="0" step="0.01" value="${o.freight_delivery_cost===null?'':esc(o.freight_delivery_cost)}" placeholder="Enter 0 if verified none"></label>
          <label><span>Install / labour direct cost</span><input data-option-field="install-cost" type="number" min="0" step="0.01" value="${o.install_labour_cost===null?'':esc(o.install_labour_cost)}" placeholder="Enter 0 if verified none"></label>
          <label><span>FOC / other direct cost</span><input data-option-field="other-cost" type="number" min="0" step="0.01" value="${o.foc_other_direct_cost===null?'':esc(o.foc_other_direct_cost)}" placeholder="Enter 0 if verified none"></label>
          <label><span>Target GM %</span><input data-option-field="target-gm" type="number" min="0" max="99" step="0.1" value="${esc((pm.target*100).toFixed(1))}"></label>
          <label><span>PSC sell ex VAT</span><input data-option-field="sell-price" type="number" min="0.01" step="0.01" value="${o.public_sell_price_ex_vat===null?'':esc(o.public_sell_price_ex_vat)}" placeholder="AED"></label>
          <label><span>Verified VAT %</span><input data-option-field="vat-rate" type="number" min="0" max="100" step="0.01" value="${o.vat_rate_pct===null?'':esc(o.vat_rate_pct)}" placeholder="0 or 5 when verified"></label>
          <label><span>Supplier quote date</span><input data-option-field="price-quote-date" type="date" value="${esc(o.price_quote_date||'')}"></label>
          <label><span>Price valid to</span><input data-option-field="price-valid-to" type="date" value="${esc(o.price_valid_to||'')}"></label>
          <label class="familyPricingWide"><span>Price source / reference</span><input data-option-field="price-source" value="${esc(o.price_source_reference||'')}" placeholder="Supplier quote / written confirmation reference"></label>
          <label class="familyPricingWide"><span>VAT evidence note</span><input data-option-field="vat-evidence" value="${esc(o.vat_evidence_note||'')}" placeholder="Verified treatment and evidence source"></label>
          <label class="familyPricingWide"><span>Margin override reason</span><input data-option-field="margin-override" value="${esc(o.margin_override_reason||'')}" placeholder="Required only when live GM is below target"></label>
          <label class="familyPricingWide"><span>Pricing note</span><textarea data-option-field="pricing-note" rows="2">${esc(o.pricing_note||'')}</textarea></label>
        </div>
        <p class="familyPricingRule">Publication gate: complete acquisition + direct-cost inputs, current verified price evidence, VAT evidence, valid dates, APPROVE + customer-selectable option, and target margin or a recorded override. Acorus MRP is never used in this calculation.</p>
      </details>`:`<div class="familyOptionQuoteOnly"><b>Request-quote family</b><span>${esc(family.website_price_treatment||'Request quote')} · Supplier MRP and internal benchmarks cannot become a public PSC price.</span></div>`}

      <label class="familyOptionReviewNote"><span>Review note</span><textarea data-option-field="note" rows="3">${esc(o.review_note||'')}</textarea></label>
      <div class="familyOptionCardFoot"><small>${esc(updated)} · Decision and price history are retained in Supabase.</small><button class="button primary" data-option-save="${esc(o.id)}">Save review</button></div>
    </article>`;
  }

  async function saveFamilyOptionReview(id){
    const o=optionDesk.options.find(x=>x.id===id); if(!o) return;
    const card=document.querySelector(`[data-option-review="${CSS.escape(id)}"]`); if(!card) return;
    const field=name=>card.querySelector(`[data-option-field="${name}"]`);
    const decision=field('decision')?.value||'VERIFY';
    const customerSelectable=!!field('selectable')?.checked;
    const preferred=!!field('preferred')?.checked;
    const verificationDate=field('verified')?.value||null;
    const stock=(field('stock')?.value||'').trim()||'UNKNOWN';
    const availabilityStatus=field('availability-status')?.value||'UNVERIFIED';
    const availabilityVerifiedRaw=field('availability-verified')?.value||'';
    const availabilityValidRaw=field('availability-valid-until')?.value||'';
    const availabilityEvidence=(field('availability-evidence')?.value||'').trim();
    const availabilityVerifiedAt=availabilityVerifiedRaw?new Date(availabilityVerifiedRaw).toISOString():null;
    const availabilityValidUntil=availabilityValidRaw?new Date(availabilityValidRaw).toISOString():null;
    const numberField=name=>{
      const raw=(field(name)?.value||'').trim();
      if(raw==='') return {raw,value:null};
      const value=Number(raw);
      return {raw,value};
    };
    const costEntry=numberField('cost');
    const cost=costEntry.value;
    const brand=(field('brand')?.value||'').trim();
    const presentation=(field('presentation')?.value||'').trim();
    const pack=(field('pack')?.value||'').trim()||null;
    const family=optionFamilyMeta(o.family_id)||{};
    const familyPresentations=Array.isArray(family.presentations)?family.presentations.filter(Boolean):[];
    if(costEntry.raw!=='' && !Number.isFinite(cost)){ toast('<strong>Check the B2B cost.</strong><br>Enter a valid numeric acquisition cost or leave it blank.'); return; }
    if(customerSelectable && decision!=='APPROVE'){ toast('<strong>Cannot publish this option yet.</strong><br>Customer-selectable requires PSC Decision = APPROVE.'); return; }
    if(customerSelectable && !verificationDate){ toast('<strong>Verification date required.</strong><br>Confirm the current sourcing route before customer selection is enabled.'); return; }
    if(customerSelectable && (!brand || !presentation)){ toast('<strong>Brand and presentation must be confirmed.</strong><br>Do not publish draft parsing as an approved customer option.'); return; }
    if(customerSelectable && familyPresentations.length && !familyPresentations.includes(presentation)){ toast('<strong>Presentation does not match the family.</strong><br>Choose one of the controlled family presentations before publishing this option.'); return; }
    if(preferred && (decision!=='APPROVE' || !verificationDate || cost===null || !Number.isFinite(cost) || stock.toUpperCase()==='UNKNOWN')){
      toast('<strong>Preferred source is not ready.</strong><br>Approve it and record current verification date, B2B cost and stock evidence first.'); return;
    }
    if(availabilityStatus!=='UNVERIFIED'){
      if(!availabilityVerifiedAt || !availabilityValidUntil || !availabilityEvidence){ toast('<strong>Availability evidence is incomplete.</strong><br>Record the verified time, valid-until time and evidence reference before publishing a stock state.'); return; }
      if(new Date(availabilityValidUntil).getTime()<new Date(availabilityVerifiedAt).getTime()){ toast('<strong>Check the availability validity.</strong><br>The valid-until time cannot be earlier than the verification time.'); return; }
    }

    const payload={
      psc_decision:decision,
      customer_selectable:customerSelectable,
      preferred,
      brand,
      presentation,
      pack,
      b2b_cost:cost,
      vat:(field('vat')?.value||'').trim()||null,
      stock,
      expiry_batch:(field('expiry')?.value||'').trim()||null,
      verification_date:verificationDate,
      availability_status:availabilityStatus,
      availability_verified_at:availabilityStatus==='UNVERIFIED'?null:availabilityVerifiedAt,
      availability_valid_until:availabilityStatus==='UNVERIFIED'?null:availabilityValidUntil,
      availability_evidence_reference:availabilityStatus==='UNVERIFIED'?null:availabilityEvidence,
      review_note:(field('note')?.value||'').trim()||null
    };

    if(optionFixedPriceEligible(o)){
      const freight=numberField('freight-cost');
      const install=numberField('install-cost');
      const other=numberField('other-cost');
      const targetPct=numberField('target-gm');
      const sell=numberField('sell-price');
      const vatRate=numberField('vat-rate');
      const priceDecision=field('price-decision')?.value||'REQUEST_QUOTE';
      const priceEvidence=field('price-evidence')?.value||'MISSING';
      const quoteDate=field('price-quote-date')?.value||null;
      const validTo=field('price-valid-to')?.value||null;
      const priceSource=(field('price-source')?.value||'').trim()||null;
      const vatEvidence=(field('vat-evidence')?.value||'').trim()||null;
      const override=(field('margin-override')?.value||'').trim()||null;
      const pricingNote=(field('pricing-note')?.value||'').trim()||null;
      const numericFields=[['freight / delivery cost',freight],['install / labour cost',install],['FOC / other direct cost',other],['target GM',targetPct],['PSC sell price',sell],['VAT rate',vatRate]];
      for(const [label,entry] of numericFields){
        if(entry.raw!=='' && !Number.isFinite(entry.value)){ toast(`<strong>Check ${esc(label)}.</strong><br>Enter a valid number or leave it blank.`); return; }
      }
      const targetGm=targetPct.value===null?0.20:targetPct.value/100;
      if(targetGm<0 || targetGm>=1){ toast('<strong>Check target GM.</strong><br>Enter a percentage from 0 to below 100.'); return; }
      if(vatRate.value!==null && (vatRate.value<0 || vatRate.value>100)){ toast('<strong>Check VAT rate.</strong><br>Enter a verified percentage from 0 to 100.'); return; }

      if(priceDecision==='APPROVED_FIXED'){
        const completeCosts=[cost,freight.value,install.value,other.value].every(v=>v!==null&&Number.isFinite(v));
        if(decision!=='APPROVE' || !customerSelectable){ toast('<strong>Fixed price cannot go live yet.</strong><br>The product option must first be APPROVE + Customer selectable.'); return; }
        if(!verificationDate){ toast('<strong>Option verification is required.</strong><br>Record the current verification date before fixed-price publication.'); return; }
        if(!completeCosts){ toast('<strong>Complete landed-cost inputs.</strong><br>B2B cost, freight/delivery, install/labour and FOC/other direct cost must all be entered. Use 0 explicitly when a component has been verified as no cost.'); return; }
        if(sell.value===null || sell.value<=0){ toast('<strong>PSC selling price is required.</strong><br>Enter the approved ex-VAT selling price.'); return; }
        if(vatRate.value===null || !vatEvidence){ toast('<strong>VAT evidence is incomplete.</strong><br>Record the verified VAT rate and evidence note.'); return; }
        if(priceEvidence!=='VERIFIED_CURRENT'){ toast('<strong>Current price evidence required.</strong><br>Set Price evidence to VERIFIED CURRENT only after checking the current source.'); return; }
        if(!quoteDate || !validTo){ toast('<strong>Price validity is incomplete.</strong><br>Record the source quote date and valid-to date.'); return; }
        const landed=cost+freight.value+install.value+other.value;
        const gm=(sell.value-landed)/sell.value;
        if(gm<targetGm && !override){ toast(`<strong>Margin is below target.</strong><br>Current GM is ${(gm*100).toFixed(1)}% versus ${(targetGm*100).toFixed(1)}%. Record an explicit override reason or revise price/cost.`); return; }
      }

      Object.assign(payload,{
        freight_delivery_cost:freight.value,
        install_labour_cost:install.value,
        foc_other_direct_cost:other.value,
        target_gm:targetGm,
        public_sell_price_ex_vat:sell.value,
        vat_rate_pct:vatRate.value,
        vat_evidence_note:vatEvidence,
        price_evidence_status:priceEvidence,
        price_source_reference:priceSource,
        price_quote_date:quoteDate,
        price_valid_to:validTo,
        price_decision:priceDecision,
        margin_override_reason:override,
        pricing_note:pricingNote
      });
    }

    const button=card.querySelector('[data-option-save]'); if(button){button.disabled=true;button.textContent='Saving…';}
    try{
      const {data,error}=await sb.from('catalogue_product_options').update(payload).eq('id',id).select('*').single();
      if(error) throw error;
      const i=optionDesk.options.findIndex(x=>x.id===id); if(i>=0) optionDesk.options[i]=data;
      render();
      const priceMessage=optionFixedPriceLive(data)?` Live fixed price: ${money(Number(data.public_sell_price_ex_vat))} ex VAT.`:'';
      const availabilityMessage=data.availability_status&&data.availability_status!=='UNVERIFIED'?` Availability: ${esc(data.availability_status.replaceAll('_',' '))}.`:'';
      toast(`<strong>${esc(data.psc_decision)} saved.</strong><br>${data.customer_selectable?'This option is customer-selectable.':'This option remains internal only.'}${priceMessage}${availabilityMessage}`);
    }catch(e){
      console.error(e);
      if(button){button.disabled=false;button.textContent='Save review';}
      toast(`<strong>Could not save option review.</strong><br>${esc(e?.message||'Check the evidence fields and try again.')}`);
    }
  }


  async function loadAdminMail(){
    if(!sb || !authContext?.isPscAdmin) return;
    mailDesk.loading=true;
    try{
      const [{data:contacts,error:cError},{data:campaigns,error:caError},{data:recipients,error:rError}] = await Promise.all([
        sb.from('mail_contacts').select('*').order('organization').order('email'),
        sb.from('mail_campaigns').select('*').order('created_at',{ascending:false}).limit(100),
        sb.from('mail_campaign_recipients').select('*').order('created_at',{ascending:false}).limit(1000)
      ]);
      if(cError || caError || rError){
        const err=cError||caError||rError;
        console.warn('Mail Desk schema not ready:',err?.message||err);
        mailDesk.backendReady=false;
        mailDesk.contacts=[]; mailDesk.campaigns=[]; mailDesk.recipients=[];
      } else {
        mailDesk.contacts=contacts||[];
        mailDesk.campaigns=campaigns||[];
        mailDesk.recipients=recipients||[];
        mailDesk.backendReady=true;
      }
      mailDesk.loaded=true;
    } catch(e){
      console.warn('Mail Desk load failed:',e);
      mailDesk.backendReady=false;
      mailDesk.loaded=true;
    } finally { mailDesk.loading=false; }
  }

  function mailPublishedGuides(){ return WORKSHOP.filter(g=>g.status==='published'); }
  function mailGuide(){ return mailPublishedGuides().find(g=>g.slug===ui.mailGuideSlug) || mailPublishedGuides()[0] || null; }
  function mailRoleOptions(){ return ['All','Nurse / clinic lead','Procurement','Operations / administration','Finance','Management / owner','Other']; }
  function mailInstitutionOptions(){ return ['All','School / education','Healthcare facility','Corporate / workplace health','Government / public institution','Hospitality / other institution','Other']; }
  function mailEligibleContact(c){ return c.status==='active' && c.marketing_basis && c.marketing_basis!=='not_set'; }
  function mailFilteredContacts(){
    const q=(ui.mailSearch||'').trim().toLowerCase();
    return mailDesk.contacts.filter(c=>{
      if(ui.mailRole!=='All' && c.role!==ui.mailRole) return false;
      if(ui.mailInstitution!=='All' && c.institution_type!==ui.mailInstitution) return false;
      if(q && ![c.first_name,c.last_name,c.email,c.organization,c.role,c.institution_type,(c.tags||[]).join(' ')].join(' ').toLowerCase().includes(q)) return false;
      return true;
    });
  }
  function mailSelectedEligibleContacts(){
    const ids=new Set(ui.mailSelectedContacts||[]);
    return mailDesk.contacts.filter(c=>ids.has(c.id)&&mailEligibleContact(c));
  }
  function mailCampaignSubject(){
    const g=mailGuide();
    if((ui.mailDraftSubject||'').trim()) return ui.mailDraftSubject.trim();
    if(ui.mailTemplate==='workshop' && g) return g.title;
    if(ui.mailTemplate==='clinic-check' && g) return `Clinic check: ${g.title}`;
    if(ui.mailTemplate==='supply-note') return 'A quick supply note from Pharma Service';
    return g?.title||'From Pharma Service';
  }
  function mailCampaignIntro(){
    const g=mailGuide();
    if((ui.mailDraftIntro||'').trim()) return ui.mailDraftIntro.trim();
    if(ui.mailTemplate==='clinic-check') return g?.excerpt||'A practical check worth adding to the clinic routine.';
    if(ui.mailTemplate==='supply-note') return 'A short note from Pharma Service on the products, replacements and small supply details worth keeping visible.';
    return g?.excerpt||'Practical product intelligence from The Workshop.';
  }
  function mailCampaignCta(){ return (ui.mailDraftCta||'').trim() || (ui.mailTemplate==='supply-note'?'Browse the institutional catalogue':'Read the guide'); }
  function mailCampaignUrl(){
    const g=mailGuide();
    if(ui.mailTemplate==='supply-note') return 'https://pharmaservice.ae/catalogue.html';
    return g?`https://pharmaservice.ae/workshop/${g.slug}`:'https://pharmaservice.ae/workshop';
  }
  function mailCampaignSnapshot(){
    const g=mailGuide();
    return {template:ui.mailTemplate,workshop_slug:g?.slug||null,workshop_title:g?.title||null,subject:mailCampaignSubject(),intro:mailCampaignIntro(),cta_label:mailCampaignCta(),cta_url:mailCampaignUrl()};
  }
  function mailStatusPill(status){ const tone=({sent:'ok',sending:'warn',draft:'',failed:'danger',partial:'warn'})[status]||''; return badge(String(status||'draft').replace('_',' '),tone); }
  function mailAudienceSummary(){
    const chosen=mailSelectedEligibleContacts();
    if(chosen.length) return `${chosen.length} selected contact${chosen.length===1?'':'s'}`;
    const filtered=mailFilteredContacts().filter(mailEligibleContact);
    return filtered.length?`${filtered.length} eligible contact${filtered.length===1?'':'s'} in current filter`:'No eligible contacts selected';
  }
  function mailPreview(){
    const g=mailGuide(); const snap=mailCampaignSnapshot();
    const kicker=ui.mailTemplate==='supply-note'?'INSTITUTIONAL SUPPLY':'THE WORKSHOP';
    const meta=g&&ui.mailTemplate!=='supply-note'?`${esc(g.category)} · ${esc(g.read_time||'')}`:'Pharma Service Co. L.L.C.';
    return `<div class="mailPreviewChrome"><div class="mailPreviewTop"><span>From</span><b>Pharma Service &lt;${esc(mailDesk.senderEmail)}&gt;</b></div><div class="mailPreviewSubject"><span>Subject</span><b>${esc(snap.subject)}</b></div><div class="mailEmailCanvas"><div class="mailEmailBrand"><img src="${PSC_LOGO}" alt="Pharma Service"><span>${kicker}</span></div><div class="mailEmailRule"></div><small>${meta}</small><h2>${esc(g?.title||snap.subject)}</h2><p>${esc(snap.intro)}</p>${g?.subtitle&&ui.mailTemplate!=='supply-note'?`<blockquote>${esc(g.subtitle)}</blockquote>`:''}<a href="${esc(snap.cta_url)}" class="mailEmailCta">${esc(snap.cta_label)}</a><div class="mailEmailFooter"><b>Pharma Service Co. L.L.C.</b><span>Institutional healthcare supply · Dubai, UAE</span><span>Sent from ${esc(mailDesk.senderEmail)}</span><small>Recipients can opt out of future PSC marketing emails at any time.</small></div></div></div>`;
  }

  function adminMailCompose(){
    const guides=mailPublishedGuides(); const contacts=mailFilteredContacts(); const selected=new Set(ui.mailSelectedContacts||[]);
    const guideSelect=guides.map(g=>`<option value="${esc(g.slug)}" ${g.slug===mailGuide()?.slug?'selected':''}>${esc(g.title)}</option>`).join('');
    const contactRows=contacts.map(c=>`<label class="mailContactPick ${!mailEligibleContact(c)?'disabled':''}"><input type="checkbox" data-mail-contact-select="${c.id}" ${selected.has(c.id)?'checked':''} ${!mailEligibleContact(c)?'disabled':''}><span><b>${esc([c.first_name,c.last_name].filter(Boolean).join(' ')||c.email)}</b><small>${esc(c.organization||'No organization')} · ${esc(c.role||'Role not set')}</small></span><em>${mailEligibleContact(c)?'Eligible':c.status==='unsubscribed'?'Opted out':'Basis required'}</em></label>`).join('');
    return `<div class="mailComposeGrid"><section class="panel mailComposer"><div class="mailSectionHead"><div><span class="eyebrow">COMPOSE</span><h2>Turn PSC content into a useful email.</h2></div><span class="mailSenderBadge">FROM · ${esc(mailDesk.senderEmail)}</span></div>
      <div class="mailTemplateRow"><button class="mailTemplateCard ${ui.mailTemplate==='workshop'?'active':''}" data-mail-template="workshop"><small>01</small><b>Workshop note</b><span>One useful guide, one reason to read it.</span></button><button class="mailTemplateCard ${ui.mailTemplate==='clinic-check'?'active':''}" data-mail-template="clinic-check"><small>02</small><b>Clinic check</b><span>Fast readiness or stock check.</span></button><button class="mailTemplateCard ${ui.mailTemplate==='supply-note'?'active':''}" data-mail-template="supply-note"><small>03</small><b>Supply note</b><span>Replenishment, replacement or catalogue update.</span></button></div>
      ${ui.mailTemplate!=='supply-note'?`<label class="fieldLabel">Workshop guide</label><select class="input mailFull" data-mail-guide>${guideSelect}</select>`:''}
      <label class="fieldLabel">Subject</label><input class="input mailFull" data-mail-subject value="${esc(mailCampaignSubject())}" maxlength="160">
      <label class="fieldLabel">Opening note</label><textarea class="textarea mailFull" data-mail-intro rows="4" maxlength="1200">${esc(mailCampaignIntro())}</textarea>
      <label class="fieldLabel">CTA label</label><input class="input mailFull" data-mail-cta value="${esc(mailCampaignCta())}" maxlength="80">
      <div class="mailAudienceHead"><div><span class="eyebrow">AUDIENCE</span><h3>${esc(mailAudienceSummary())}</h3></div><button class="textAction" data-mail-select-filtered>Select eligible shown</button></div>
      <div class="mailAudienceFilters"><input class="input" placeholder="Search contacts…" value="${esc(ui.mailSearch)}" data-mail-search><select class="input" data-mail-role>${mailRoleOptions().map(x=>`<option ${x===ui.mailRole?'selected':''}>${esc(x)}</option>`).join('')}</select><select class="input" data-mail-institution>${mailInstitutionOptions().map(x=>`<option ${x===ui.mailInstitution?'selected':''}>${esc(x)}</option>`).join('')}</select></div>
      <div class="mailContactPicker">${contactRows||`<div class="emptyState"><h3>No contacts yet.</h3><p>Add controlled business contacts under Contacts before sending.</p></div>`}</div>
      <div class="mailComposerActions"><button class="button light" data-mail-save-draft ${!mailDesk.backendReady?'disabled':''}>Save draft</button><button class="button outline" data-mail-test ${!mailDesk.backendReady?'disabled':''}>Send test to info@</button><button class="button dark" data-mail-send ${!mailDesk.backendReady||!mailSelectedEligibleContacts().length?'disabled':''}>Approve & send</button></div>
      ${!mailDesk.backendReady?`<div class="mailBackendNotice"><b>Mail data layer not deployed yet.</b><span>The interface is ready. Apply the included V37.7.1 migration and deploy the mail Edge Functions before live sending.</span></div>`:''}
    </section><aside class="mailPreviewPane"><div class="mailPreviewLabel"><span>EMAIL PREVIEW</span><small>Responsive HTML · no tracking pixels</small></div>${mailPreview()}</aside></div>`;
  }

  function adminMailContacts(){
    const rows=mailDesk.contacts.map(c=>`<tr><td><b>${esc([c.first_name,c.last_name].filter(Boolean).join(' ')||'—')}</b><div class="sub">${esc(c.email)}</div></td><td>${esc(c.organization||'—')}</td><td>${esc(c.role||'—')}</td><td>${esc(c.institution_type||'—')}</td><td><select class="mailInlineSelect" data-mail-contact-status="${c.id}"><option value="active" ${c.status==='active'?'selected':''}>Active</option><option value="paused" ${c.status==='paused'?'selected':''}>Paused</option><option value="unsubscribed" ${c.status==='unsubscribed'?'selected':''}>Unsubscribed</option><option value="bounced" ${c.status==='bounced'?'selected':''}>Bounced</option></select></td><td><select class="mailInlineSelect" data-mail-contact-basis="${c.id}"><option value="not_set" ${c.marketing_basis==='not_set'?'selected':''}>Not reviewed</option><option value="existing_customer" ${c.marketing_basis==='existing_customer'?'selected':''}>Existing customer</option><option value="requested_updates" ${c.marketing_basis==='requested_updates'?'selected':''}>Requested updates</option><option value="manual_permission" ${c.marketing_basis==='manual_permission'?'selected':''}>Permission recorded</option><option value="legitimate_interest_reviewed" ${c.marketing_basis==='legitimate_interest_reviewed'?'selected':''}>Legitimate interest reviewed</option></select></td></tr>`).join('');
    return `<div class="mailContactsLayout"><section class="panel mailAddContact"><span class="eyebrow">ADD CONTACT</span><h2>Business contact record</h2><p class="smallMuted">A contact only becomes send-eligible when its email status is active and the marketing basis has been reviewed.</p><form data-mail-contact-form><div class="twoCol"><div><label class="fieldLabel">First name</label><input class="input mailFull" name="first_name"></div><div><label class="fieldLabel">Last name</label><input class="input mailFull" name="last_name"></div></div><label class="fieldLabel">Email</label><input class="input mailFull" type="email" name="email" required><label class="fieldLabel">Organization</label><input class="input mailFull" name="organization"><div class="twoCol"><div><label class="fieldLabel">Role</label><select class="input mailFull" name="role">${mailRoleOptions().filter(x=>x!=='All').map(x=>`<option>${esc(x)}</option>`).join('')}</select></div><div><label class="fieldLabel">Institution type</label><select class="input mailFull" name="institution_type">${mailInstitutionOptions().filter(x=>x!=='All').map(x=>`<option>${esc(x)}</option>`).join('')}</select></div></div><label class="fieldLabel">Marketing basis</label><select class="input mailFull" name="marketing_basis"><option value="not_set">Not reviewed — cannot send</option><option value="existing_customer">Existing customer relationship</option><option value="requested_updates">Requested updates</option><option value="manual_permission">Explicit permission recorded</option><option value="legitimate_interest_reviewed">Legitimate interest reviewed</option></select><label class="fieldLabel">Source / note</label><input class="input mailFull" name="source_note" placeholder="Visit, referral, customer account, event…"><button class="button dark full" type="submit" ${!mailDesk.backendReady?'disabled':''}>Add contact</button></form></section><section class="panel"><div class="panelHeader"><div><h2>Contacts</h2><p>${mailDesk.contacts.length} controlled contact${mailDesk.contacts.length===1?'':'s'}</p></div></div><div class="tableWrap"><table class="dataTable"><thead><tr><th>CONTACT</th><th>ORGANIZATION</th><th>ROLE</th><th>TYPE</th><th>STATUS</th><th>BASIS</th></tr></thead><tbody>${rows||'<tr><td colspan="6">No contacts added yet.</td></tr>'}</tbody></table></div></section></div>`;
  }

  function adminMailHistory(){
    const rows=mailDesk.campaigns.map(c=>{const rs=mailDesk.recipients.filter(r=>r.campaign_id===c.id);const sent=rs.filter(r=>r.status==='sent').length;const failed=rs.filter(r=>r.status==='failed').length;return `<tr><td><b>${esc(c.subject)}</b><div class="sub">${esc(c.template||'campaign')}</div></td><td>${date(c.created_at)}</td><td>${mailStatusPill(c.status)}</td><td>${rs.length}</td><td>${sent}</td><td>${failed}</td></tr>`}).join('');
    return `<section class="panel"><div class="panelHeader"><div><h2>Send history</h2><p>Delivery history only. Opens and clicks are deliberately not fabricated.</p></div></div><div class="tableWrap"><table class="dataTable"><thead><tr><th>CAMPAIGN</th><th>CREATED</th><th>STATUS</th><th>RECIPIENTS</th><th>SENT</th><th>FAILED</th></tr></thead><tbody>${rows||'<tr><td colspan="6">No campaigns sent yet.</td></tr>'}</tbody></table></div></section>`;
  }

  function adminMailSettings(){
    return `<div class="twoCol"><section class="panel"><span class="eyebrow">SENDER IDENTITY</span><h2>Pharma Service</h2><div class="mailSettingRows"><div><span>From</span><b>${esc(mailDesk.senderEmail)}</b></div><div><span>Reply-to</span><b>${esc(mailDesk.senderEmail)}</b></div><div><span>Display name</span><b>${esc(mailDesk.senderName)}</b></div><div><span>Delivery</span><b>Google Workspace Gmail API via delegated PSC service account</b></div></div></section><section class="panel"><span class="eyebrow">CONTROL</span><h2>Human approval first.</h2><p class="smallMuted">Mail Desk does not auto-send marketing. A PSC admin chooses content, recipients and explicitly approves each send. Contacts marked unsubscribed, paused or without a reviewed marketing basis are excluded.</p><div class="gateList" style="margin-top:18px"><div class="gate ${mailDesk.backendReady?'ok':'warn'}"><span>Mail database tables</span><i></i></div><div class="gate warn"><span>Google delegated service-account connection verified at send time</span><i></i></div><div class="gate ok"><span>Sender locked to info@pharmaservice.ae</span><i></i></div><div class="gate ok"><span>No tracking pixels in V37.7</span><i></i></div></div></section></div>`;
  }

  function adminMail(){
    const tabs=[['compose','Compose'],['contacts','Contacts'],['history','History'],['settings','Settings']];
    const body=ui.mailTab==='contacts'?adminMailContacts():ui.mailTab==='history'?adminMailHistory():ui.mailTab==='settings'?adminMailSettings():adminMailCompose();
    return shell(`<div class="pageHeader mailDeskHeader"><div><span class="eyebrow">PSC MAIL DESK</span><h1>Useful emails, from the same system.</h1><p>Turn Workshop guides and institutional supply updates into controlled outreach from <b>${esc(mailDesk.senderEmail)}</b>.</p></div><div class="mailIdentityCard"><span>${icon('mail')}</span><div><small>SENDING MAILBOX</small><b>${esc(mailDesk.senderEmail)}</b></div></div></div><div class="mailTabs">${tabs.map(([id,label])=>`<button class="${ui.mailTab===id?'active':''}" data-mail-tab="${id}">${label}</button>`).join('')}</div>${body}`,true);
  }

  async function addMailContact(form){
    if(!sb||!authContext?.isPscAdmin||!mailDesk.backendReady) return;
    const fd=new FormData(form); const email=String(fd.get('email')||'').trim().toLowerCase();
    if(!/^\S+@\S+\.\S+$/.test(email)){toast('<strong>Check the email address.</strong>');return;}
    const payload={first_name:cleanNullable(fd.get('first_name')),last_name:cleanNullable(fd.get('last_name')),email,organization:cleanNullable(fd.get('organization')),role:cleanNullable(fd.get('role')),institution_type:cleanNullable(fd.get('institution_type')),marketing_basis:String(fd.get('marketing_basis')||'not_set'),source_note:cleanNullable(fd.get('source_note')),status:'active',created_by:session?.user?.id||null};
    const {error}=await sb.from('mail_contacts').insert(payload); if(error){console.error(error);toast(`<strong>Could not add contact.</strong><br>${esc(error.message)}`);return;}
    await loadAdminMail(); render(); toast('<strong>Contact added.</strong>');
  }

  async function updateMailContactField(id,field,value){
    if(!sb||!authContext?.isPscAdmin||!mailDesk.backendReady) return;
    if(!['status','marketing_basis'].includes(field)) return;
    const payload={[field]:value};
    if(field==='status'&&value==='unsubscribed') payload.unsubscribed_at=new Date().toISOString();
    if(field==='status'&&value!=='unsubscribed') payload.unsubscribed_at=null;
    const {error}=await sb.from('mail_contacts').update(payload).eq('id',id);
    if(error){console.error(error);toast(`<strong>Could not update contact.</strong><br>${esc(error.message)}`);return;}
    await loadAdminMail(); render(); toast('<strong>Contact updated.</strong>');
  }

  async function saveMailCampaign(status='draft',testMode=false){
    if(!sb||!authContext?.isPscAdmin||!mailDesk.backendReady) return;
    const snap=mailCampaignSnapshot();
    const contacts=mailSelectedEligibleContacts();
    if(status!=='draft'&&!testMode&&!contacts.length){toast('<strong>Select at least one eligible contact.</strong>');return;}
    const payload={template:snap.template,workshop_slug:snap.workshop_slug,workshop_title:snap.workshop_title,subject:snap.subject,preview_text:snap.intro.slice(0,240),intro:snap.intro,cta_label:snap.cta_label,cta_url:snap.cta_url,sender_name:mailDesk.senderName,sender_email:mailDesk.senderEmail,status:'draft',created_by:session?.user?.id||null};
    const {data:campaign,error}=await sb.from('mail_campaigns').insert(payload).select('*').single();
    if(error){console.error(error);toast(`<strong>Could not save campaign.</strong><br>${esc(error.message)}`);return;}
    if(contacts.length){
      const recipients=contacts.map(c=>({campaign_id:campaign.id,contact_id:c.id,email_snapshot:c.email,name_snapshot:[c.first_name,c.last_name].filter(Boolean).join(' ')||null,organization_snapshot:c.organization||null,status:'queued'}));
      const {error:rError}=await sb.from('mail_campaign_recipients').insert(recipients); if(rError){console.error(rError);toast(`<strong>Campaign saved, but recipients failed.</strong><br>${esc(rError.message)}`);return;}
    }
    if(status==='draft'){ await loadAdminMail(); render(); toast('<strong>Draft saved.</strong>'); return; }
    const button=document.querySelector(testMode?'[data-mail-test]':'[data-mail-send]'); const original=button?.textContent||''; if(button){button.disabled=true;button.textContent=testMode?'Sending test…':'Sending…';}
    try{
      const {data,error:invokeError}=await sb.functions.invoke('send-mail-campaign',{body:{campaign_id:campaign.id,test_mode:testMode,test_to:testMode?mailDesk.senderEmail:null}});
      if(invokeError) throw invokeError;
      if(data?.error) throw new Error(data.error);
      await loadAdminMail(); render();
      toast(testMode?'<strong>Test email sent.</strong><br>Check info@pharmaservice.ae.':'<strong>Campaign sent.</strong><br>Delivery results are recorded in Mail Desk.');
    } catch(e){
      console.error('Mail send failed',e);
      await loadAdminMail(); render();
      toast(`<strong>Mail was not sent.</strong><br>${esc(e?.message||'Check the Google service-account / Edge Function connection.')}`);
    } finally { if(button){button.disabled=false;button.textContent=original;} }
  }

  function cmsSetting(productId,channel=ui.cmsChannel){
    return cms.settings.find(x=>x.product_id===productId && x.channel===channel) || null;
  }

  function cmsProduct(productId){
    return cms.products.find(x=>x.id===productId) || null;
  }

  function cmsProductMedia(productId){
    return cms.media.filter(x=>x.product_id===productId);
  }

  function cmsStatusText(productId,channel){
    const s=cmsSetting(productId,channel);
    if(!s) return 'Not configured';
    if(s.status!=='published') return s.draft_data?'Draft saved':'Draft';
    if(s.draft_data) return s.visible?'Published · draft saved':'Hidden · draft saved';
    return s.visible?'Published':'Hidden';
  }

  function safeFileName(name){
    return String(name||'image').toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'')||'image';
  }

  async function uploadCmsImage(productId,file){
    if(!sb || !authContext?.isPscAdmin || !file) return;
    if(!/^image\//.test(file.type)){ toast('<strong>Image files only.</strong>'); return; }
    if(file.size>10*1024*1024){ toast('<strong>Image too large.</strong><br>Maximum 10 MB.'); return; }

    const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
    if(!['jpg','jpeg','png','webp','gif'].includes(ext)){ toast('<strong>Unsupported image type.</strong>'); return; }
    const path=`${productId}/${Date.now()}-${safeFileName(file.name.replace(/\.[^.]+$/,''))}.${ext}`;
    const {error:uploadError}=await sb.storage.from('product-media').upload(path,file,{cacheControl:'3600',upsert:false});
    if(uploadError) throw uploadError;
    const {data:urlData}=sb.storage.from('product-media').getPublicUrl(path);
    const publicUrl=urlData?.publicUrl;
    if(!publicUrl) throw new Error('Could not resolve image URL.');

    const existing=cmsProductMedia(productId);
    const isPrimary=existing.length===0;
    const {error:mediaError}=await sb.from('product_media').insert({
      product_id:productId,
      object_path:path,
      public_url:publicUrl,
      alt_text:file.name,
      is_primary:isPrimary,
      display_order:existing.length*10,
      published:false,
      published_institutional:false,
      published_wholesale:false,
      created_by:session?.user?.id||null
    });
    if(mediaError) throw mediaError;

    // Upload and primary selection are staged. A channel-specific Publish exposes them.
    await loadAdminCms();
    render();
    toast('<strong>Image uploaded.</strong>');
  }

  async function setCmsPrimaryImage(productId,mediaId){
    const media=cms.media.find(x=>x.id===mediaId && x.product_id===productId);
    if(!media) return;
    const {error:e1}=await sb.from('product_media').update({is_primary:false}).eq('product_id',productId);
    if(e1) throw e1;
    const {error:e2}=await sb.from('product_media').update({is_primary:true}).eq('id',mediaId);
    if(e2) throw e2;
    await loadAdminCms(); render();
    toast('<strong>Primary image staged.</strong><br>Publish the storefront to make it live.');
  }

  async function deleteCmsImage(productId,mediaId){
    const media=cms.media.find(x=>x.id===mediaId && x.product_id===productId);
    if(!media) return;
    const remaining=cmsProductMedia(productId).filter(x=>x.id!==mediaId);
    const nextPrimary=remaining.find(x=>x.is_primary)||remaining[0]||null;

    // Update published channel snapshots before removing the underlying object to avoid broken cards.
    const affected=cms.settings.filter(x=>x.product_id===productId && x.primary_image_url===media.public_url);
    for(const setting of affected){
      const {error:e}=await sb.from('storefront_product_settings').update({
        primary_image_url:nextPrimary?.public_url||null,
        updated_at:new Date().toISOString()
      }).eq('id',setting.id);
      if(e) throw e;
    }
    const {error:rowError}=await sb.from('product_media').delete().eq('id',mediaId);
    if(rowError) throw rowError;
    if(media.is_primary && nextPrimary){
      const {error:e}=await sb.from('product_media').update({is_primary:true}).eq('id',nextPrimary.id);
      if(e) throw e;
    }
    const {error:productError}=await sb.from('products').update({
      image_url:nextPrimary?.public_url||null,updated_at:new Date().toISOString()
    }).eq('id',productId);
    if(productError) throw productError;
    const {error:storageError}=await sb.storage.from('product-media').remove([media.object_path]);
    if(storageError) console.warn('Orphaned storage object:',storageError.message);

    await loadAdminCms(); render();
    toast('<strong>Image removed.</strong>');
  }

  async function saveCmsProduct(productId,publish=false){
    const p=cmsProduct(productId);
    if(!p || !authContext?.isPscAdmin) return;
    const channel=ui.cmsChannel;
    const setting=cmsSetting(productId,channel);
    const productPayload={
      name:(document.getElementById('cmsName')?.value||p.name).trim(),
      brand:cleanNullable(document.getElementById('cmsBrand')?.value),
      pack:cleanNullable(document.getElementById('cmsPack')?.value),
      category:cleanNullable(document.getElementById('cmsMasterCategory')?.value),
      product_type:cleanNullable(document.getElementById('cmsProductType')?.value),
      clinical_needs:Array.from(document.querySelectorAll('[data-cms-need]:checked')).map(el=>el.value),
      commercial_specification:cleanNullable(document.getElementById('cmsSpec')?.value),
      supplier_name:cleanNullable(document.getElementById('cmsSupplier')?.value),
      supplier_sku:cleanNullable(document.getElementById('cmsSupplierSku')?.value),
      buy_cost:cleanNumber(document.getElementById('cmsBuyCost')?.value),
      landed_cost:cleanNumber(document.getElementById('cmsLandedCost')?.value),
      vat_status:cleanNullable(document.getElementById('cmsVat')?.value),
      stock_status:cleanNullable(document.getElementById('cmsStock')?.value),
      lead_time:cleanNullable(document.getElementById('cmsLead')?.value),
      evidence_status:cleanNullable(document.getElementById('cmsEvidence')?.value),
      internal_notes:cleanNullable(document.getElementById('cmsInternalNotes')?.value),
      active:publish ? !!document.getElementById('cmsActive')?.checked : p.active,
      updated_at:new Date().toISOString()
    };
    if(!productPayload.name) throw new Error('Product name is required.');

    const draft={
      display_name:cleanNullable(document.getElementById('cmsDisplayName')?.value)||productPayload.name,
      short_description:cleanNullable(document.getElementById('cmsShort')?.value),
      long_description:cleanNullable(document.getElementById('cmsLong')?.value),
      category:cleanNullable(document.getElementById('cmsChannelCategory')?.value)||productPayload.category,
      pack_label:cleanNullable(document.getElementById('cmsPackLabel')?.value)||productPayload.pack,
      price_display_mode:document.getElementById('cmsPriceMode')?.value||'request_quote',
      display_price:cleanNumber(document.getElementById('cmsDisplayPrice')?.value),
      moq:cleanNumber(document.getElementById('cmsMoq')?.value),
      visible:!!document.getElementById('cmsVisible')?.checked,
      featured:!!document.getElementById('cmsFeatured')?.checked,
      display_order:Math.round(cleanNumber(document.getElementById('cmsOrder')?.value)??1000),
      clinical_needs:productPayload.clinical_needs
    };
    if(draft.price_display_mode==='show_price' && !(draft.display_price>0))
      throw new Error('A positive display price is required before publishing a visible price.');

    // Core procurement records are editable now; public fields stay frozen in channel snapshots until Publish.
    const {error:pError}=await sb.from('products').update(productPayload).eq('id',productId);
    if(pError) throw pError;

    const meta={updated_at:new Date().toISOString(),updated_by:session?.user?.id||null};
    if(!publish){
      const {error:e}=await sb.from('storefront_product_settings').upsert({
        product_id:productId,channel,draft_data:draft,...meta
      },{onConflict:'product_id,channel'});
      if(e) throw e;
      await loadAdminCms();render();
      toast('<strong>Draft saved.</strong><br>Published storefront presentation was not changed.');
      return;
    }

    const primary=cmsProductMedia(productId).find(x=>x.is_primary)||null;
    const primaryUrl=primary?.public_url || p.image_url || null;
    const payload={
      ...meta,
      ...Object.fromEntries(Object.entries(draft).filter(([key])=>key!=='clinical_needs')),
      product_id:productId,channel,
      status:'published',
      brand_display:productPayload.brand,
      specification_display:productPayload.commercial_specification,
      product_type_display:productPayload.product_type,
      clinical_needs_display:productPayload.clinical_needs,
      regulated_display:!!p.regulated,
      requirement_status_display:p.requirement_status||null,
      regulatory_mapping_display:p.regulatory_mapping||null,
      primary_image_url:primaryUrl,
      draft_data:null
    };
    const {error:sError}=await sb.from('storefront_product_settings').upsert(payload,{onConflict:'product_id,channel'});
    if(sError) throw sError;

    if(primary){
      const {error:pe}=await sb.from('products').update({image_url:primaryUrl}).eq('id',productId);
      if(pe) throw pe;
    }
    // New gallery images become visible only in the channel explicitly published by PSC.
    const mediaPublish={published:true,[`published_${channel}`]:true};
    const {error:mediaError}=await sb.from('product_media').update(mediaPublish).eq('product_id',productId);
    if(mediaError) throw mediaError;

    await loadAdminCms();render();
    toast('<strong>Published.</strong><br>The selected storefront is now updated.');
  }

  async function saveStorefrontConfig(channel){
    const payload={
      headline:(document.getElementById('cmsStorefrontHeadline')?.value||'').trim(),
      subheadline:cleanNullable(document.getElementById('cmsStorefrontSubheadline')?.value),
      active:!!document.getElementById('cmsStorefrontActive')?.checked,
      updated_at:new Date().toISOString(),
      updated_by:session?.user?.id||null
    };
    const {error}=await sb.from('storefronts').update(payload).eq('channel',channel);
    if(error) throw error;
    await loadAdminCms(); render();
    toast('<strong>Storefront updated.</strong>');
  }
  function isCapitalProduct(p){ return !!p && ['Furniture & Mobility','Diagnostics & Monitoring','Emergency & Oxygen'].includes(p.category); }
  function product(sku){
    const base = D.products.find(p=>p.pscSku===sku) || (state.customProducts||{})[sku];
    if(!base) return null;
    return {...base,...(state.productOverrides[sku]||{})};
  }
  function institutionalImageSku(p){
    const direct=String(p?.catalogueTransactionId||p?.catalogue_transaction_id||'').trim().toUpperCase();
    if(/^INST-\d{4}$/.test(direct)) return direct;
    const commercialSku=String(p?.pscSku||p?.psc_sku||'').trim().toUpperCase();
    if(/^INST-\d{4}$/.test(commercialSku)) return commercialSku;
    if(commercialSku){
      const mapped=D.products.find(x=>String(x?.pscSku||'').trim().toUpperCase()===commercialSku);
      const mappedId=String(mapped?.catalogueTransactionId||'').trim().toUpperCase();
      if(/^INST-\d{4}$/.test(mappedId)) return mappedId;
    }
    return '';
  }
  const PRODUCT_ASSET_RELEASE='3777';
  function legacyProductImageUrl(p){
    const raw=(p?.imageUrl||p?.image_url||'').trim();
    if(raw){
      const lower=raw.toLowerCase();
      const genericBrandAsset =
        lower.includes('dha-requirement') ||
        lower.endsWith('/pharmaservice.png') ||
        lower.endsWith('pharmaservice.png') ||
        lower.endsWith('/psc-logo.png') ||
        lower.endsWith('/psc-logo-current.png') ||
        lower.endsWith('/clinic-basics.jpg');
      if(!genericBrandAsset) return raw;
    }
    const fallback=(p?.fallbackAsset||'').trim();
    if(fallback && !fallback.toLowerCase().endsWith('/clinic-basics.jpg')) return fallback;
    return '/assets/products/clinic-basics.jpg';
  }
  function productDisplayImageUrl(p){
    const sku=institutionalImageSku(p);
    if(sku) return `/assets/products/${sku.toLowerCase()}.webp?v=${PRODUCT_ASSET_RELEASE}`;
    const raw=(p?.imageUrl||'').trim();
    if(!raw) return null;
    const lower=raw.toLowerCase();
    const looksLikeStandaloneDhaAsset = lower.includes('dha-requirement') || lower.endsWith('/pharmaservice.png') || lower.endsWith('pharmaservice.png');
    if(p?.dhaMapped && looksLikeStandaloneDhaAsset) return null;
    return raw;
  }
  function controlledProductImageUrl(p){
    const sku=institutionalImageSku(p);
    if(sku) return `/assets/products/${sku.toLowerCase()}.webp?v=${PRODUCT_ASSET_RELEASE}`;
    return (p?.image_url||p?.imageUrl||'').trim() || null;
  }
  function products(){ return D.products.map(p=>product(p.pscSku)); }
  function currentRoute(){
    if(location.hash) return location.hash.slice(1);
    const path=location.pathname.replace(/\/+$/,'');
    if(path==='/start') return 'start';
    if(path==='/workshop') return 'workshop';
    if(path.startsWith('/workshop/')) return `workshop/${decodeURIComponent(path.split('/')[2]||'')}`;
    return 'home';
  }
  function go(route){
    ui.mobile=false; ui.publicMenu=false; ui.modal=null;
    if(route==='start' || route==='workshop' || route.startsWith('workshop/')){
      const target=route==='start'?'/start':route==='workshop'?'/workshop':`/workshop/${encodeURIComponent(route.split('/')[1]||'')}`;
      history.pushState({pscRoute:route},'',target);
      window.scrollTo({top:0,behavior:'instant'}); render();
      return;
    }
    const target=`/#${route}`;
    if(location.pathname!=='/' || !location.hash){ location.href=target; return; }
    location.hash=route; window.scrollTo({top:0,behavior:'instant'}); render();
  }
  function renderUi({preserveScroll=true,focusSelector=null,cursor=null,transition=true}={}){
    const y=window.scrollY;
    const draw=()=>{
      render();
      requestAnimationFrame(()=>{
        if(preserveScroll) window.scrollTo({top:y,behavior:'instant'});
        if(focusSelector){
          const target=document.querySelector(focusSelector);
          if(target){ target.focus({preventScroll:true}); if(Number.isInteger(cursor)&&target.setSelectionRange) target.setSelectionRange(cursor,cursor); }
        }
      });
    };
    if(transition && !focusSelector && document.startViewTransition){
      try{ document.startViewTransition(draw); return; }catch{}
    }
    draw();
  }
  function openProductOverlay(sku,publicMode=false){
    ui.overlayScroll=window.scrollY;
    ui.modal={type:publicMode?'public-product':'product',sku};
    renderUi({preserveScroll:true});
  }
  function closeModalOverlay(){
    const y=Number.isFinite(ui.overlayScroll)?ui.overlayScroll:window.scrollY;
    ui.modal=null;
    render();
    requestAnimationFrame(()=>window.scrollTo({top:y,behavior:'instant'}));
  }
  function openBasketOverlay(){
    ui.overlayScroll=window.scrollY;
    ui.modal=null;
    ui.basket=true;
    renderUi({preserveScroll:true});
  }
  function closeBasketOverlay(){
    const y=Number.isFinite(ui.overlayScroll)?ui.overlayScroll:window.scrollY;
    ui.basket=false;
    render();
    requestAnimationFrame(()=>window.scrollTo({top:y,behavior:'instant'}));
  }

  function audit(action, detail){ state.audit.unshift({at:new Date().toISOString(),actor:'Demo user',action,detail}); state.audit=state.audit.slice(0,50); save(); }
  function toast(msg){ const old=document.querySelector('.toast'); if(old)old.remove(); const d=document.createElement('div');d.className='toast';d.innerHTML=msg;$app.appendChild(d);setTimeout(()=>d.remove(),2800); }

  function brand(landing=false){ return landing
    ? `<button class="brand brandButton ${landing?'landingBrand':''}" data-go="home" aria-label="Pharma Service home"><img class="brandImage brandImageLight" src="${PSC_LOGO}" alt="Pharma Service"><span class="brandMeta"><b>INSTITUTIONAL HEALTHCARE SUPPLY</b><small>Dubai, United Arab Emirates</small></span></button>`
    : `<div class="sidebarBrand sidebarBrandEmpty" aria-hidden="true"></div>`; }
  function statusPill(status){ const k=String(status).toLowerCase().replace(/\s+/g,'-'); return `<span class="statusPill status-${k}">${esc(status)}</span>`; }
  function badge(text,tone=''){ return `<span class="badge ${tone}">${esc(text)}</span>`; }
  function icon(name){
    const map={
      dashboard:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="8" rx="1.5"/><rect x="14" y="3" width="7" height="6" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/></svg>`,
      overview:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="8" rx="1.5"/><rect x="14" y="3" width="7" height="6" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/></svg>`,
      home:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5"/><path d="M6.5 9.5V20h4.5v-5h2v5h4.5V9.5"/></svg>`,
      edit:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7"/><path d="M14 4h5v5"/><path d="m10 14 7.5-7.5a1.8 1.8 0 1 1 2.5 2.5L12.5 16.5 9 17z"/></svg>`,
      request:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7"/><path d="M14 4h5v5"/><path d="m10 14 7.5-7.5a1.8 1.8 0 1 1 2.5 2.5L12.5 16.5 9 17z"/></svg>`,
      boxes:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 7 5.5 12 8l5-2.5Z"/><path d="M7 5.5V11l5 2.5V8"/><path d="M17 5.5V11l-5 2.5"/><path d="M5 12.5 2.5 14 5 15.5 7.5 14Z"/><path d="M5 15.5V20l2.5-1.5V14"/><path d="M19 12.5 16.5 14 19 15.5 21.5 14Z"/><path d="M19 15.5V20l2.5-1.5V14"/></svg>`,
      inventory:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 7 5.5 12 8l5-2.5Z"/><path d="M7 5.5V11l5 2.5V8"/><path d="M17 5.5V11l-5 2.5"/><path d="M5 12.5 2.5 14 5 15.5 7.5 14Z"/><path d="M5 15.5V20l2.5-1.5V14"/><path d="M19 12.5 16.5 14 19 15.5 21.5 14Z"/><path d="M19 15.5V20l2.5-1.5V14"/></svg>`,
      products:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 7 5.5 12 8l5-2.5Z"/><path d="M7 5.5V11l5 2.5V8"/><path d="M17 5.5V11l-5 2.5"/><path d="M5 12.5 2.5 14 5 15.5 7.5 14Z"/><path d="M5 15.5V20l2.5-1.5V14"/><path d="M19 12.5 16.5 14 19 15.5 21.5 14Z"/><path d="M19 15.5V20l2.5-1.5V14"/></svg>`,
      checklist:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 6 1.8 1.8L8.8 4.8"/><path d="M11 6h9"/><path d="m4 12 1.8 1.8 3-3"/><path d="M11 12h9"/><circle cx="5.8" cy="18" r="1.6"/><path d="M11 18h9"/></svg>`,
      queue:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 6 1.8 1.8L8.8 4.8"/><path d="M11 6h9"/><path d="m4 12 1.8 1.8 3-3"/><path d="M11 12h9"/><circle cx="5.8" cy="18" r="1.6"/><path d="M11 18h9"/></svg>`,
      resource:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 6 1.8 1.8L8.8 4.8"/><path d="M11 6h9"/><path d="m4 12 1.8 1.8 3-3"/><path d="M11 12h9"/><circle cx="5.8" cy="18" r="1.6"/><path d="M11 18h9"/></svg>`,
      repeat:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 7H7a4 4 0 0 0-4 4"/><path d="m17 7-2.5-2.5"/><path d="M17 7l-2.5 2.5"/><path d="M7 17h10a4 4 0 0 0 4-4"/><path d="m7 17 2.5 2.5"/><path d="M7 17l2.5-2.5"/></svg>`,
      rules:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 7H7a4 4 0 0 0-4 4"/><path d="m17 7-2.5-2.5"/><path d="M17 7l-2.5 2.5"/><path d="M7 17h10a4 4 0 0 0 4-4"/><path d="m7 17 2.5 2.5"/><path d="M7 17l2.5-2.5"/></svg>`,
      reports:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V12"/><path d="M12 20V8"/><path d="M19 20V4"/><path d="M3 20h18"/></svg>`,
      feed:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V12"/><path d="M12 20V8"/><path d="M19 20V4"/><path d="M3 20h18"/></svg>`,
      assets:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7"/><path d="M14 4h5v5"/><path d="m10 14 7.5-7.5a1.8 1.8 0 1 1 2.5 2.5L12.5 16.5 9 17z"/></svg>`,
      admin:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="8" rx="1.5"/><rect x="14" y="3" width="7" height="6" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/></svg>`,
      clinics:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V8h16v12"/><path d="M9 8V4h6v4"/><path d="M12 10v6"/><path d="M9 13h6"/></svg>`,
      approved:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12.5 3.2 3.2L18 7"/></svg>`,
      stock:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v8"/><path d="M12 16v.1"/><path d="M4 20h16L12 4Z"/></svg>`,
      search:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.8"/><path d="m15 15 4.5 4.5"/></svg>`,
      bell:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16v-4.2a6 6 0 1 1 12 0V16"/><path d="M4 17h16"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>`,
      logout:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><path d="M14 8l5 4-5 4"/><path d="M9 12h10"/></svg>`,
      menu:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>`,
      close:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12"/><path d="M18 6 6 18"/></svg>`,
      settings:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.2"/><path d="M12 19.3v2.2"/><path d="m4.9 4.9 1.6 1.6"/><path d="m17.5 17.5 1.6 1.6"/><path d="M2.5 12h2.2"/><path d="M19.3 12h2.2"/><path d="m4.9 19.1 1.6-1.6"/><path d="m17.5 6.5 1.6-1.6"/></svg>`,
      mail:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>`,
      help:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.8 9.1a2.5 2.5 0 1 1 3.9 2c-.9.6-1.7 1.2-1.7 2.5"/><path d="M12 17.6h.01"/></svg>`
    };
    return map[name]||'';
  }

  function portalSidebarIcon(href, fallbackIcon){
    const map={
      'portal/dashboard':'my-account',
      'portal/catalogue':'shop',
      'portal/requests':'my-requests',
      'portal/replenish':'orders',
      'portal/documents':'downloads',
      'portal/stock':'clinic-supplies',
      'portal/assets':'mobility-equipment'
    };
    const key=map[href];
    return key
      ? `<img class="portalSideIcon" src="/assets/ui-icons/${key}.webp?v=3810" alt="" aria-hidden="true">`
      : icon(fallbackIcon);
  }
  function portalUtilityIcon(name){
    const map={logout:'logout'};
    const key=map[name];
    return key
      ? `<img class="portalSideIcon" src="/assets/ui-icons/${key}.webp?v=3810" alt="" aria-hidden="true">`
      : icon(name);
  }

  const schoolNav=[
    ['portal/dashboard','Home','dashboard'],
    ['portal/catalogue','Shop','boxes'],
    ['portal/requests','Orders & Requests','edit'],
    ['portal/replenish','Replenish','repeat'],
    ['portal/documents','Documents','resource'],
    ['portal/stock','Stock & expiry','stock'],
    ['portal/assets','Clinic assets','assets']
  ];
  const adminNav=[['admin/dashboard','Deal Desk','dashboard'],['admin/mail','Mail','mail'],['admin/storefront','Storefront','edit'],['admin/products','Product Master','boxes'],['admin/family-options','Family Options','checklist'],['admin/requests','Request Queue','checklist'],['admin/fulfilment','Fulfilment Rules','repeat'],['admin/supplier-feed','Supplier Feed','reports']];

  function shell(content, admin=false){
    const route=currentRoute();
    const liveCustomerNav=schoolNav.filter(([href])=>isDemoAccount() || !['portal/stock','portal/assets'].includes(href));
    const links=admin?adminNav:liveCustomerNav;
    const searchValue=esc(ui.globalSearch||'');
    return `<div class="appShell v4Shell v7Shell v7bShell v26Shell v37Shell v38Shell v381Shell ${admin?'adminShell':'customerShell'}">
      <div class="mobileOverlay ${ui.mobile?'show':''}" data-mobile-close></div>
      <aside class="sidebar ${ui.mobile?'sidebarOpen':''}">
        <div class="sidebarTop">${brand()}<button class="iconBtn mobileClose" data-mobile-close aria-label="Close menu">${icon('close')}</button></div>
        <nav class="iconNav">${links.map(([href,label,ico])=>`<button class="navLink iconOnly ${(route===href || (href==='portal/catalogue' && route.startsWith('portal/catalogue/')))?'active':''}" data-go="${href}" aria-label="${label}"><span class="navIcon">${admin?icon(ico):portalSidebarIcon(href,ico)}</span><span class="navLabel">${label}</span></button>`).join('')}</nav>
        <div class="sidebarFooter compactFooter">
          ${admin?`<button class="navLink iconOnly" data-go="portal/dashboard" aria-label="Client portal"><span class="navIcon">${icon('home')}</span><span class="navLabel">Client portal</span></button>`:(authContext?.isPscAdmin?`<button class="navLink iconOnly" data-go="admin/dashboard" aria-label="PSC admin"><span class="navIcon">${icon('home')}</span><span class="navLabel">PSC admin</span></button>`:'')}
          <button class="navLink iconOnly" data-signout aria-label="Sign out"><span class="navIcon">${admin?icon('logout'):portalUtilityIcon('logout')}</span><span class="navLabel">Sign out</span></button>
        </div>
      </aside>
      <main class="mainArea v7MainArea v7bMainArea">
        <header class="topbar sleekTopbar v7Topbar v7bTopbar portalHeaderBar">
          <button class="iconBtn mobileMenu" data-mobile-open aria-label="Open menu">${icon('menu')}</button>
          <div class="topbarBrandSlot plainLogo"><img src="${PSC_LOGO}" alt="Pharma Service"></div>
          ${!admin?`<div class="topbarSearch"><span class="searchIcon">${icon('search')}</span><input data-global-search value="${searchValue}" placeholder="Search institutional catalogue…" aria-label="Search institutional catalogue"></div>`:`<div class="topbarAdminTitle"><span>PSC</span><b>${route==='admin/mail'?'Mail Desk':'Deal Desk'}</b></div>`}
          <div class="topbarActions topbarActionsV4">
            ${admin?`<span class="userPill compactUser"><span class="avatarDot">MH</span><span><b>Mohamed</b><small>PSC admin</small></span></span>`:`
            <div class="accountSwitcherWrap">
              <button class="campusPill accountSwitcherButton ${canSwitchSchools()?'switchable':''}" ${canSwitchSchools()?'data-account-switcher':''} aria-expanded="${ui.accountMenu?'true':'false'}">
                <span class="mobileAccountDot" aria-hidden="true">${esc((state.groupName||'A').slice(0,2).toUpperCase())}</span>
                <span class="campusPillMain">
                  <small class="accountGroupName">${esc(state.groupName||'Institutional account')}</small>
                  <b>${esc(schoolLabel(authContext?.school)||state.campus)}</b>
                </span>
                ${canSwitchSchools()?'<span class="accountChevron">⌄</span>':''}
              </button>
              ${ui.accountMenu&&canSwitchSchools()?`<div class="accountSwitcherMenu">
                <div class="accountMenuHead"><span>SWITCH ACCOUNT</span><b>${esc(state.groupName||'Account group')}</b></div>
                <div class="accountMenuList">${availableSchools().map(sc=>`<button class="accountSchoolOption ${sc.id===authContext?.school?.id?'active':''}" data-school-select="${sc.id}">
                  <span><b>${esc(sc.name)}</b><small>${esc(sc.campus_name||'Main account')}</small></span>
                  ${sc.id===authContext?.school?.id?'<em>Current</em>':''}
                </button>`).join('')}</div>
              </div>`:''}
            </div>
            <button class="button dark pillBasket" data-basket>Request <b>${basketQty()}</b></button>`}
          </div>
        </header>
        ${!admin?`<div class="mobileSearchRow"><div class="mobileSearchInput"><span class="searchIcon">${icon('search')}</span><input data-global-search value="${searchValue}" placeholder="Search catalogue…" aria-label="Search institutional catalogue"></div><button class="mobileCartButton" data-basket>Request <b>${basketQty()}</b></button></div>`:''}
        ${!admin&&isDemoAccount()?`<div class="demoAccountBanner"><b>DEMO ACCOUNT</b><span>Sample institutional data · Explore freely · Actions are simulated and reset on refresh.</span></div>`:''}
        <div class="contentWrap v7ContentWrap">${content}</div>
      </main>
      ${ui.basket?basketDrawer():''}
      ${ui.modal?modalHtml(ui.modal):''}
    </div>`;
  }


  const publicNav=[
    ['our-model','Our Model'],
    ['catalogue','Catalogue'],
    ['workshop','The Workshop'],
    ['contact','Contact']
  ];
  function publicHeader(active='home'){
    return `<header class="publicHeader v37PublicHeader">
      <button class="publicLogo" data-go="home" aria-label="Pharma Service home"><img src="${PSC_LOGO}" alt="Pharma Service"></button>
      <button class="publicMenuButton" data-public-menu aria-label="Open website menu" aria-expanded="${ui.publicMenu?'true':'false'}">${ui.publicMenu?icon('close'):icon('menu')}</button>
      <nav class="publicNav ${ui.publicMenu?'open':''}">${publicNav.map(([r,l])=>`<button class="publicNavLink ${active===r?'active':''}" data-go="${r}">${l}</button>`).join('')}<button class="publicNavLink mobileClinicPortalLink" data-go="login"><span>Clinic Portal</span><b>→</b></button></nav>
      <button class="button primary publicPortalBtn" data-go="login">Clinic Portal</button>
    </header>`;
  }
  function publicFooter(){ return `<footer class="publicFooter v37PublicFooter"><div><img src="${PSC_LOGO}" alt="Pharma Service"><p>Institutional healthcare supply with one accountable Pharma Service relationship.</p></div><div class="publicFooterLinks"><button data-go="about">About</button><button data-go="careers">Careers</button><button data-go="media">Media & resources</button></div><div><span>Dubai, United Arab Emirates</span><a href="tel:+97143377004">+971 4 337 7004</a><a href="mailto:info@pharmaservice.ae">info@pharmaservice.ae</a></div></footer>`; }
  function publicPage(active,kicker,title,lead,body){ return `<main class="publicPage">${publicHeader(active)}<section class="publicPageHero"><span class="kicker">${kicker}</span><h1>${title}</h1><p>${lead}</p></section>${body}${publicFooter()}</main>`; }


  function landing(){
    const approved=products().filter(p=>p.schoolApproved).length;
    return `<main class="landingPage publicLanding">
      ${publicHeader('home')}
      <section class="pscInstitutionalHero" aria-label="Institutional Supply">
        <div class="pscHeroLeft">
          <h1><span>Institutional</span><strong>Supply</strong></h1>
          <div class="pscHeroOffer">
            <i aria-hidden="true"></i>
            <p><b>Opening supply · Replenishment · Replacement</b><span>Equipment · Consumables · Pharmaceuticals</span></p>
          </div>
          <p class="pscHeroAudience">For schools, nurseries, and educational institutions.</p>
        </div>
        <div class="pscHeroProcess pscHeroIllustrationShell" aria-label="The institutional way">
          <figure class="pscHeroIllustrationWrap">
            <img class="pscHeroIllustration" src="/assets/psc-home-hero-supply-book.webp" alt="Pharma Service institutional supply illustration showing documents, medical products, delivery, replenishment and first-aid supplies">
            <figcaption class="pscHeroBoardLabel">PS–I–001 · THE INSTITUTIONAL WAY</figcaption>
          </figure>
        </div>
      </section>
      <section class="homeEditorialIntro">
        <div class="homeEditorialLead">
          <span class="kicker">INSTITUTIONAL SUPPLY</span>
          <h2>Good supply is mostly a details job.</h2>
        </div>
        <div class="homeEditorialCopy">
          <p>A clinic can ask for something perfectly ordinary — gauze, gloves, a BP monitor, test strips — and still end up with the wrong product if the specification is loose.</p>
          <p>That is the part we pay attention to: the exact model, size, sterile status, compatible consumable, pack, expiry, accessories and supply route that make the item right for the institution using it.</p>
          <p class="homeEditorialStrong">The aim is simple: get the right thing there, keep the record straight, and make the next order easier.</p>
        </div>
      </section>
      <section class="homeDetailLedger" aria-label="What Pharma Service checks">
        <article><span>Consumables</span><b>Material · size · sterile status · pack · expiry</b><p>Two boxes with the same short description can still be very different products.</p></article>
        <article><span>Diagnostics</span><b>Exact model · intended use · compatible consumables</b><p>A meter, cuff or strip only helps if the pieces belong together.</p></article>
        <article><span>Emergency equipment</span><b>Model · accessories · consumables · service</b><p>The equipment is only part of the system that has to stay ready.</p></article>
        <article><span>Regulated lines</span><b>Product · recipient · storage · appropriate route</b><p>Medicines, oxygen and specialist items need the right licensed and professional controls.</p></article>
      </section>
      <section class="publicClinicalPreview">
        <div class="publicClinicalPreviewHead">
          <div>
            <span class="kicker">BROWSE BY CLINICAL NEED</span>
            <h2>Start with what the clinic needs.</h2>
            <p>You do not need to know how we file the catalogue. Pick the job in front of you and work from there.</p>
          </div>
          <button class="textAction" data-go="catalogue">Explore catalogue</button>
        </div>

        <div class="publicClinicalPreviewGrid">
          <button class="publicClinicalCard coral" data-go="catalogue/wounds">
            <img class="publicClinicalArt" src="/assets/category-wounds.webp?v=3777" alt="" aria-hidden="true">
            <span>Cuts &amp; Wounds</span>
            <small>Dressings, antiseptics, gauze, closure and wound protection</small>
          </button>

          <button class="publicClinicalCard blue" data-go="catalogue/breathing">
            <img class="publicClinicalArt" src="/assets/category-breathing.webp?v=3777" alt="" aria-hidden="true">
            <span>Breathing &amp; Oxygen</span>
            <small>Nebulisation, oxygen delivery, airway and respiratory support</small>
          </button>

          <button class="publicClinicalCard orange" data-go="catalogue/vitals">
            <img class="publicClinicalArt" src="/assets/category-vitals.webp?v=3777" alt="" aria-hidden="true">
            <span>Vitals &amp; Assessment</span>
            <small>Blood pressure, temperature, oximetry and clinical assessment</small>
          </button>

          <button class="publicClinicalCard mint" data-go="catalogue/infection">
            <img class="publicClinicalArt" src="/assets/category-infection.webp?v=3777" alt="" aria-hidden="true">
            <span>Infection Control &amp; PPE</span>
            <small>PPE, hand hygiene, disinfection and waste control</small>
          </button>

          <button class="publicClinicalCard rose" data-go="catalogue/emergency">
            <img class="publicClinicalArt" src="/assets/category-emergency.webp?v=3777" alt="" aria-hidden="true">
            <span>Emergency &amp; Response</span>
            <small>Resuscitation, first response and urgent-use products</small>
          </button>

          <button class="publicClinicalCard sand" data-go="catalogue/equipment">
            <img class="publicClinicalArt" src="/assets/category-equipment.webp?v=3777" alt="" aria-hidden="true">
            <span>Equipment &amp; Mobility</span>
            <small>Clinical furniture, mobility, storage and capital equipment</small>
          </button>
        </div>

        <div class="publicClinicalPreviewFoot">
          <span>Plus medicines &amp; symptoms, diabetes &amp; testing, procedures &amp; consumables, allergy &amp; skin, patient care, screening and more.</span>
          <button class="button primary semanticPrimary" data-go="catalogue">Open Institutional Catalogue</button>
        </div>
      </section>
      ${workshopTeaser()}
      <section class="demoTeaser homePortalTeaser"><div><span class="kicker">THE ACCOUNT SIDE</span><h2>Want to see what happens after you find the product?</h2><p>The guided tour shows the practical bit: building a request, receiving the quotation, following the order and coming back to the same history when it is time to replenish.</p></div><button class="button outline large semanticPrimary" data-go="demo">View the guided tour</button></section>
      ${publicFooter()}
    </main>`;
  }

  function publicDemoPage(){
    const steps=[
      {n:'01',label:'CURATED SUPPLY',title:'Start with the right product.',text:'The clinic browses a curated institutional catalogue instead of searching through thousands of consumer listings.',outcome:'Clear products, packs and specifications built around the clinic environment.',visual:'shop'},
      {n:'02',label:'BUILD THE REQUEST',title:'Order what the clinic actually needs.',text:'Approved lines go into one basket. If something is missing, the clinic can submit a custom sourcing request without leaving the portal.',outcome:'One request reaches Pharma Service with the school, user, lines and quantities already attached.',visual:'request'},
      {n:'03',label:'PSC CONTROL',title:'We validate before we quote.',text:'PSC checks the exact product, source, current commercial evidence, applicable supply route and delivery before issuing the quotation.',outcome:'The customer gets simplicity. PSC keeps control of the complexity behind it.',visual:'control'},
      {n:'04',label:'QUOTE & DELIVERY',title:'A clear decision and a visible next step.',text:'The quotation is sent to the registered account. The school confirms or cancels it, then follows the order through processing and delivery.',outcome:'No WhatsApp archaeology. The commercial history remains attached to the account.',visual:'delivery'},
      {n:'05',label:'REPLENISH',title:'The second order should be easier than the first.',text:'Delivered consumables automatically become available for repeat request, while previously supplied equipment stays visible for reference or another-unit requests.',outcome:'Every completed transaction makes the account easier to service next time.',visual:'repeat'}
    ];
    const i=Math.max(0,Math.min(steps.length-1,ui.tourStep||0)),st=steps[i];
    const visual={
      shop:`<div class="demoMachine shopMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>Curated Clinic Supply</b></div><div class="demoProductGrid"><article><div class="demoPack">GAUZE</div><span>Sterile Gauze</span><small>Requirement mapped</small><button>+</button></article><article><div class="demoPack diag">BP</div><span>BP Monitor</span><small>Exact spec shown</small><button>+</button></article><article><div class="demoPack saline">NaCl</div><span>Sterile Saline</span><small>Clinic consumable</small><button>+</button></article></div><div class="demoCursor cursorOne"></div></div>`,
      request:`<div class="demoMachine requestMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>Supply Request</b></div><div class="requestDemoLines"><div><i>01</i><span><b>Sterile Gauze</b><small>100 swabs</small></span><strong>6</strong></div><div><i>02</i><span><b>Sterile Saline</b><small>2.5 ml</small></span><strong>10</strong></div><div class="customDemo"><span>Can’t find it?</span><b>Paediatric nebulizer masks…</b><em>Custom request</em></div></div><button class="demoSubmit">Place order for review</button></div>`,
      control:`<div class="demoMachine controlMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>PSC Review</b></div><div class="controlTrack"><span class="trackLine"></span><div class="trackDot done">✓<small>SPEC</small></div><div class="trackDot done">✓<small>SOURCE</small></div><div class="trackDot active">●<small>ROUTE</small></div><div class="trackDot">4<small>QUOTE</small></div></div><div class="controlCards"><article><span>PRODUCT</span><b>Exact specification</b><small>Matched to controlled line</small></article><article><span>SUPPLY</span><b>Current evidence</b><small>Price / stock checked</small></article><article><span>ROUTE</span><b>Appropriate channel</b><small>Validated before commitment</small></article></div></div>`,
      delivery:`<div class="demoMachine deliveryMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>Order & Quotation</b></div><div class="quoteDemo"><div><span>PSC-Q-2026-1042</span><b>Quotation ready</b><small>Sent to registered account email</small></div><div class="quoteActions"><button>Cancel</button><button class="confirm">Confirm quote</button></div></div><div class="deliveryTrack"><div class="deliveryVan">▰</div><span></span><div class="deliveryPin">✓</div></div><div class="deliveryPromiseDemo"><small>NEXT</small><b>Delivery timing confirmed by PSC</b></div></div>`,
      repeat:`<div class="demoMachine repeatMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>Replenish</b></div><div class="repeatCards"><article><div class="repeatThumb">GAUZE</div><div><span>Previously delivered</span><b>Sterile Gauze</b><small>Last qty · 6</small></div><button>Replenish 6</button></article><article><div class="repeatThumb saline">NaCl</div><div><span>Previously delivered</span><b>Sterile Saline</b><small>Last qty · 10</small></div><button>Replenish 10</button></article></div><div class="repeatLoop">↻ <span>Order history becomes the next order shortcut.</span></div></div>`
    }[st.visual];
    return `<main class="publicPage publicDemoPage">${publicHeader('')}<section class="demoPublicHero"><div><span class="kicker">GUIDED DEMONSTRATION</span><h1>See the supply relationship<br>work from end to end.</h1><p>See how Pharma Service takes an institutional customer from product selection and quotation through order management, delivery and repeat purchasing — while keeping the sourcing complexity behind the scenes.</p></div><div class="demoHeroFlow"><div><b>01</b><span>SELECT</span></div><i></i><div><b>02</b><span>REQUEST</span></div><i></i><div><b>03</b><span>CONTROL</span></div><i></i><div><b>04</b><span>DELIVER</span></div><i></i><div><b>05</b><span>REPEAT</span></div><span class="flowRunner"></span></div></section><section class="publicDemoBody"><div class="publicDemoStepper">${steps.map((x,j)=>`<button class="demoStepButton ${j===i?'active':j<i?'done':''}" data-tour-jump="${j}"><span>${x.n}</span><b>${x.label}</b></button>`).join('')}</div><div class="publicDemoStage"><div class="publicDemoCopy"><span class="kicker">${st.label}</span><h2>${st.title}</h2><p>${st.text}</p><div class="demoOutcome"><span>WHAT THIS ACHIEVES</span><b>${st.outcome}</b></div><div class="tourNav"><button class="button outline" data-tour-prev ${i===0?'disabled':''}>Previous</button>${i<steps.length-1?'<button class="button primary" data-tour-next>Next</button>':'<button class="button primary" data-go="login">Open Clinic Portal</button>'}</div></div><div class="publicDemoVisual">${visual}</div></div><div class="demoDisclosure"><b>Demonstration scope</b><span>The animation illustrates the live customer workflow and planned presentation layer. Actual products, prices, availability, regulatory route and delivery dates remain account- and transaction-specific.</span></div></section>${publicFooter()}</main>`;
  }


  function aboutPage(){ return publicPage('about','ABOUT PHARMA SERVICE','Built for accountable healthcare supply.','Pharma Service Co. L.L.C. is a UAE healthcare supplier focused on helping institutions source, organize and receive the products they need through one accountable commercial relationship.',`<section class="publicSection twoPublicCols"><div><span class="kicker">OUR ROLE</span><h2>Source per line. Deliver one solution.</h2><p>Institutions should not need to coordinate a different supplier for every requirement. Pharma Service combines category-specific sourcing with one commercial and operating point of accountability.</p></div><div class="publicFeatureStack"><article><b>Institutional supply</b><p>School clinics, healthcare facilities and institutional accounts.</p></article><article><b>Controlled specifications</b><p>Product selection is mapped to the relevant requirement and confirmed before commitment.</p></article><article><b>Recurring account service</b><p>Order history, replenishment and consistent follow-through over time.</p></article></div></section>`); }

  function servicesPage(){ return publicPage('services','SERVICES','Clinic procurement, made easier.','Pharma Service makes it easy for institutional customers to shop, request quotations, manage orders, repeat previous purchases and optimize procurement costs across pharmaceuticals, medical disposables and medical equipment.',`<section class="publicSection twoPublicCols"><div><span class="kicker">PROCUREMENT COST CONTROL</span><h2>Buy through the right supply channel, not the retail shelf.</h2><p>Pharma Service sources through suitable wholesale and specialist suppliers, then consolidates the commercial process for the institutional customer. The objective is straightforward: optimize procurement costs across pharmaceuticals, medical disposables and medical equipment without pushing sourcing complexity onto the clinic team.</p></div><div class="publicFeatureStack"><article><b>Shop & request</b><p>Browse controlled institutional lines or submit a custom sourcing request.</p></article><article><b>Quote & manage</b><p>Receive the formal quotation, confirm the order and keep the transaction history attached to the account.</p></article><article><b>Repeat efficiently</b><p>Reorder previously supplied items without restarting the procurement process from zero.</p></article></div></section><section class="publicSection procurementFlow"><article><b>SHOP</b><span>01</span><p>Browse the Pharma Service institutional product master.</p></article><article><b>QUOTE</b><span>02</span><p>PSC sources, reviews and sends the formal quotation.</p></article><article><b>MANAGE</b><span>03</span><p>Confirm, cancel or follow the order from the account.</p></article><article><b>REPEAT</b><span>04</span><p>Repeat previously supplied items from the same account history.</p></article></section><section class="publicCta"><div><span class="kicker">SEE IT WORK</span><h2>Take a guided tour of Pharma Service.</h2></div><div class="publicCtaActions"><button class="button outline large" data-go="demo">Take guided tour</button><button class="button primary large" data-go="login">Open Clinic Portal</button></div></section>`); }


  function ourModelPage(){ return publicPage(
    'our-model',
    'Our model',
    'Supplying a clinic is mostly about getting the small things right.',
    'We supply healthcare products to institutions. The job is not complicated for the sake of being complicated — it just needs a more careful eye than ordinary retail. The exact product, the right pack, the compatible accessory, the expiry and the correct supply route all matter.',
    `<section class="publicSection modelQuietIntro">
      <div class="modelQuietLead">
        <h2>We start with the list you actually have.</h2>
        <p>Sometimes it is beautifully specified. Sometimes it says “gauze 10 × 10 — 5 boxes.” Both are fine as a starting point.</p>
        <p>Our job is to work out what the clinic really needs before we turn that line into a quotation. Sterile or non-sterile? Which material? How many pieces are actually in the pack? Does the device need a particular cuff, strip, mask, regulator or accessory? Is there an expiry issue we should care about?</p>
        <p>The point is not to slow the order down. It is to avoid sending the wrong thing quickly.</p>
      </div>
      <aside class="modelQuietAside"><p><strong>A list tells us what to look for.</strong><br>The specification tells us what to buy.</p></aside>
    </section>

    <section class="publicSection modelQuietExamples">
      <div class="modelQuietHead"><h2>A few examples of the details we mean.</h2><p>They are not dramatic. They are just the things that make a product useful once it reaches the clinic.</p></div>
      <div class="modelQuietExampleRows">
        <article><h3>Blood-pressure monitors</h3><p>A good monitor with the wrong cuff size is still the wrong setup for the people using it.</p></article>
        <article><h3>Glucose meters</h3><p>The meter, strips and control solution have to belong together. “Compatible enough” is not a specification.</p></article>
        <article><h3>Gauze and dressings</h3><p>Size is only part of the description. Sterility, material, ply and pack conversion can change what is actually being supplied.</p></article>
        <article><h3>AEDs and emergency equipment</h3><p>The main device is only part of readiness. Pads, battery status, accessories, expiry and service support matter too.</p></article>
      </div>
    </section>

    <section class="publicSection modelQuietCommercial">
      <div class="modelQuietHead"><h2>Then we do the commercial work properly.</h2><p>Once the requirement is clear, the rest is fairly practical.</p></div>
      <div class="modelQuietCommercialRows">
        <article><h3>We source the line where it belongs.</h3><p>Furniture, diagnostics, disposables, emergency equipment, oxygen and medicines do not all belong to the same supplier or the same route. We use category-appropriate sources rather than forcing the whole basket through one channel.</p></article>
        <article><h3>We compare like with like.</h3><p>Brand and price matter, but so do model, pack, stock, lead time, VAT treatment, warranty, delivery and the conditions attached to the offer. A cheaper non-matching line is not a saving.</p></article>
        <article><h3>We check before we promise.</h3><p>Availability changes. Supplier quotations expire. Regulated products have their own controls. We would rather verify the point that matters than make a confident promise we cannot support.</p></article>
        <article><h3>We keep enough of the record to make the next order easier.</h3><p>Quotation, delivery, model, serial or warranty information, and batch or expiry where relevant. The second order should not need everyone to remember what happened the first time.</p></article>
      </div>
    </section>

    <section class="publicSection modelQuietCategories">
      <div class="modelQuietHead"><h2>Different categories need a different eye.</h2><p>This is the part of institutional supply that is easy to miss if everything is treated like normal retail.</p></div>
      <div class="modelQuietCategoryGrid">
        <article><h3>Diagnostics</h3><p>Exact model, intended use, accuracy information and compatible consumables.</p></article>
        <article><h3>Consumables</h3><p>Material, size, sterile status, pack conversion and expiry.</p></article>
        <article><h3>Emergency equipment</h3><p>Model, accessories, consumables, service scope and readiness after handover.</p></article>
        <article><h3>Oxygen</h3><p>Medical-grade supply, cylinder and regulator compatibility, handling and the appropriate qualified route.</p></article>
        <article><h3>Medicines</h3><p>The correct licensed procurement route, permitted recipient and traceability. Convenience does not replace those controls.</p></article>
      </div>
    </section>

    <section class="publicSection modelQuietAftercare">
      <div><h2>The first delivery is not the whole job.</h2><p>An examination couch may be bought once. Gloves, dressings, swabs and test strips come back. AED pads expire. Batteries age. Equipment needs compatible consumables. Warranties and serials become useful only when someone can find them later.</p><p>That is why we think about replenishment, expiry, replacement and records from the beginning — especially for multi-site institutions and school clinics.</p></div>
      <div class="modelQuietAftercareList"><div><strong>Opening items</strong><span>Furniture, diagnostics, monitoring, emergency equipment and setup.</span></div><div><strong>Recurring items</strong><span>Dressings, PPE, testing consumables, respiratory items, hygiene and permitted medicines.</span></div><div><strong>Easy to forget</strong><span>Accessories, expiry, replacements, warranty and handover records.</span></div></div>
    </section>

    <section class="publicSection modelQuietSchool">
      <div><h2>School clinics bring all of this together.</h2><p>They have capital equipment, day-to-day consumables, emergency readiness, medicines through the appropriate route, expiry, replenishment and records — all in a small clinical environment that needs to stay ready.</p><p>We would rather become familiar with how the clinic actually runs than simply keep sending boxes at it.</p></div>
      <button class="button outline large" data-go="catalogue">Browse the institutional catalogue</button>
    </section>
    ${schoolWorkshopStrip()}

    <section class="publicSection modelQuietRegulated">
      <h2>Some lines simply need a different route.</h2>
      <p>Medicines, oxygen, specialist services and other regulated products remain subject to the applicable UAE licensing, recipient, storage, batch/expiry and professional controls. If a line needs a specialist or licensed route, we treat it that way.</p>
    </section>

    <section class="publicCta modelQuietCta"><div><h2>Send us the list you have.</h2><p>If something is vague, we will tighten it. If something needs a different route, we will tell you. Then we can quote the requirement on a basis that actually makes sense.</p></div><div class="publicCtaActions"><button class="button outline large" data-go="catalogue">Browse catalogue</button><button class="button primary large" data-go="contact">Send a requirement</button></div></section>`
  ); }

  function whoWeSupplyPage(){ return publicPage(
    'who-we-supply',
    'WHO WE SUPPLY',
    'Built for institutions with healthcare responsibilities.',
    'Pharma Service is designed for organizations that need repeatable purchasing, clear specifications and accountable follow-through — not a consumer checkout experience.',
    `<section class="publicSection publicAudienceGrid">
      <article><span>SCHOOLS & EDUCATION</span><h3>School clinics and campus health rooms</h3><p>Opening equipment, recurring clinic consumables, medicines through the appropriate route, replenishment and replacement planning.</p></article>
      <article><span>MULTI-SITE GROUPS</span><h3>Groups managing more than one location</h3><p>One commercial relationship with site-level ordering, delivery history and account-specific requirements.</p></article>
      <article><span>WORKPLACE & INSTITUTIONAL HEALTH</span><h3>Organizations operating first-aid or healthcare facilities</h3><p>Requirement-led equipment, consumables and recurring supply where the receiving route is appropriate.</p></article>
      <article><span>HEALTHCARE BUYERS</span><h3>Professional procurement teams</h3><p>Comparable specifications, quotation control and consolidated sourcing across suitable suppliers.</p></article>
    </section>
    <section class="publicCta"><div><span class="kicker">YOUR REQUIREMENT</span><h2>Tell us what the institution needs, not what shelf to shop.</h2></div><button class="button primary large" data-go="contact">Request supply</button></section>`
  ); }

  function whatWeSupplyPage(){ return publicPage(
    'what-we-supply',
    'WHAT WE SUPPLY',
    'Opening baskets, recurring baskets and specialist lines.',
    'The offer is organized around how institutions actually buy: capital items that establish the facility, recurring items that keep it ready, and regulated or specialist lines that require the correct route.',
    `<section class="publicSection supplyBasketGrid">
      <article class="supplyBasketCard capital"><span>OPENING / CAPITAL BASKET</span><h2>Set up the facility.</h2><p>Clinical furniture, diagnostics, monitoring, emergency equipment, mobility, oxygen-related equipment and other setup requirements.</p><b>Purchased episodically · specification and warranty matter.</b></article>
      <article class="supplyBasketCard recurring"><span>RECURRING BASKET</span><h2>Keep it supplied.</h2><p>Dressings, PPE, disposables, testing consumables, respiratory items, hygiene products, medicines where permitted, and expiry-driven replacements.</p><b>Repeated demand · pack, expiry, stock and replenishment matter.</b></article>
    </section>
    <section class="publicSection publicCategoryCloud"><span>WOUND CARE</span><span>INFECTION CONTROL & PPE</span><span>DIAGNOSTICS</span><span>RESPIRATORY</span><span>DIABETES & TESTING</span><span>EMERGENCY RESPONSE</span><span>FURNITURE & MOBILITY</span><span>STUDENT CARE</span><span>PROCEDURE CONSUMABLES</span><span>MEDICINES — APPROPRIATE LICENSED ROUTE</span></section>
    <section class="publicCta"><div><span class="kicker">BROWSE</span><h2>See the institutional product master without logging in.</h2></div><button class="button primary large" data-go="catalogue">Open catalogue</button></section>`
  ); }

  function howItWorksPage(){ return publicPage(
    'how-it-works',
    'HOW IT WORKS',
    'Source per line. Sell one solution.',
    'Pharma Service keeps the institutional customer-facing process simple while controlling specification, sourcing, commercial evidence and fulfilment behind it.',
    `<section class="publicSection publicWorkflowGrid">
      <article><b>01</b><h3>Capture</h3><p>Account, site, need, quantities, deadline and decision path.</p></article>
      <article><b>02</b><h3>Normalize</h3><p>Translate the requirement into controlled specifications and comparable lines.</p></article>
      <article><b>03</b><h3>Source</h3><p>Request comparable supply evidence from suitable category suppliers.</p></article>
      <article><b>04</b><h3>Compare</h3><p>Specification, model, cost, VAT, stock, delivery, warranty and terms.</p></article>
      <article><b>05</b><h3>Quote</h3><p>One clean institutional quotation with the relevant commercial terms.</p></article>
      <article><b>06</b><h3>Authorize</h3><p>The order moves only after the customer's required approval or PO route.</p></article>
      <article><b>07</b><h3>Deliver & document</h3><p>Receive, inspect, deliver and retain the transaction record.</p></article>
      <article><b>08</b><h3>Repeat intelligently</h3><p>Use the completed supply history to make replenishment and replacement easier.</p></article>
    </section>
    <section class="publicSection controlCallout"><span class="kicker">REGULATED LINES</span><h2>Commercial convenience does not replace authorization.</h2><p>Medicines, oxygen, specialist services and other regulated products remain subject to the applicable UAE licensing, recipient, storage, batch/expiry and professional controls.</p></section>`
  ); }

  function workshopGuideBySlug(slug){ return WORKSHOP.find(g=>g.slug===slug && g.status==='published') || null; }
  function workshopSaved(){ try{return new Set(JSON.parse(localStorage.getItem(WORKSHOP_SAVE_KEY)||'[]'))}catch{return new Set()} }
  function workshopProductMatches(g,p){
    if(!g||!p)return false;
    const sku=String(p.pscSku||'');
    if((g.related_product_ids||[]).includes(sku))return true;
    const hay=[p.name,p.catalogueDisplayName,p.pscOfferedSpecification,p.spec].filter(Boolean).join(' ').toLowerCase();
    return (g.product_match_terms||[]).some(t=>hay.includes(String(t).toLowerCase()));
  }
  function workshopForProduct(p,limit=2){ return WORKSHOP.filter(g=>g.status==='published'&&workshopProductMatches(g,p)).slice(0,limit); }
  function workshopRelatedProducts(g,limit=4){ return products().filter(p=>workshopProductMatches(g,p)).slice(0,limit); }
  function workshopFormatCode(format){
    return ({'ON THE BENCH':'BENCH',"WHAT'S THE DIFFERENCE?":'COMPARE','CHECK THIS':'CHECK','WHY DOES THIS MATTER?':'WHY',"DON'T ORDER IT LIKE THIS":'SPEC'})[format]||'GUIDE';
  }
  function workshopFormatLabel(format){
    return ({
      'ON THE BENCH':'On the bench',
      "WHAT'S THE DIFFERENCE?":"What's the difference?",
      'CHECK THIS':'Check this',
      'WHY DOES THIS MATTER?':'Why does this matter?',
      "DON'T ORDER IT LIKE THIS":"Don't order it like this"
    })[format]||'Guide';
  }
  function workshopCategoryMeta(category){
    return ({
      'Product Basics':{tone:'wsTone1',icon:'products',desc:'What the product is, how it differs and the details that matter.'},
      "What's the Difference?":{tone:'wsTone2',icon:'repeat',desc:'Clear comparisons when two options look almost the same.'},
      'Clinic Checks':{tone:'wsTone3',icon:'checklist',desc:'Fast checks for a clinic that needs to stay ready.'},
      'Equipment Readiness':{tone:'wsTone4',icon:'assets',desc:'Setup, compatibility, maintenance and replacement.'},
      'Stock & Expiry':{tone:'wsTone5',icon:'inventory',desc:'What to inspect before stock becomes a problem.'},
      'School Clinic':{tone:'wsTone6',icon:'home',desc:'Practical guidance for school and student health rooms.'},
      'Ordering & Specifications':{tone:'wsTone7',icon:'edit',desc:'Turn vague requests into controlled specifications.'}
    })[category]||{tone:'wsTone1',icon:'resource',desc:'Practical product guidance for institutional clinics.'};
  }
  function workshopCategoryCard(category){
    const m=workshopCategoryMeta(category);
    const count=WORKSHOP.filter(g=>g.status==='published'&&g.category===category).length;
    return `<button class="workshopCategoryCard ${m.tone} ${ui.workshopCategory===category?'active':''}" data-workshop-category="${esc(category)}">
      <span class="workshopCategoryVisual" aria-hidden="true">${icon(m.icon)}</span>
      <span class="workshopCategoryCopy"><b>${esc(category)}</b><small>${esc(m.desc)}</small></span>
      <i>${count} ${count===1?'guide':'guides'}</i>
    </button>`;
  }
  function workshopGuideCard(g){
    const meta=workshopCategoryMeta(g.category);
    return `<article class="workshopGuideCard ${meta.tone}">
      <button data-go="workshop/${esc(g.slug)}" aria-label="Open ${esc(g.title)}">
        <span class="workshopGuideCardCopy">
          <span class="workshopGuideCardMeta"><b>${esc(g.category)}</b><small>${esc(g.read_time)} read</small></span>
          <h3>${esc(g.title)}</h3>
          <p>${esc(g.excerpt)}</p>
        </span>
        <span class="workshopGuideCardVisual" aria-hidden="true"><i>${icon(meta.icon)}</i></span>
      </button>
    </article>`;
  }

  function workshopIndexRow(g,i=0){
    const tone=workshopCategoryMeta(g.category).tone;
    return `<article class="workshopIndexRow ${tone}">
      <div class="workshopIndexNo">${String(i+1).padStart(2,'0')}</div>
      <div class="workshopIndexMeta"><span>${esc(workshopFormatLabel(g.format))}</span><small>${esc(g.category)}</small></div>
      <button class="workshopIndexTitle" data-go="workshop/${esc(g.slug)}"><h2>${esc(g.title)}</h2><p>${esc(g.excerpt)}</p></button>
      <div class="workshopIndexRead"><span>${esc(g.read_time)}</span><small>${esc(g.last_reviewed)}</small></div>
    </article>`;
  }
  function workshopFiltered(){
    const q=(ui.workshopQuery||'').trim().toLowerCase();
    return WORKSHOP.filter(g=>{
      if(g.status!=='published')return false;
      if(ui.workshopCategory!=='All' && g.category!==ui.workshopCategory)return false;
      if(!q)return true;
      const hay=[g.title,g.subtitle,g.excerpt,g.category,g.format,...(g.tags||[])].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }
  function workshopLandingPage(){
    const filtered=workshopFiltered();
    const categories=WORKSHOP_CATEGORIES.filter(c=>c!=='All');
    const resultLabel=ui.workshopCategory==='All'?'All guides':ui.workshopCategory;
    return `<main class="publicPage workshopPage">${publicHeader('workshop')}
      <section class="workshopHero">
        <div class="workshopHeroGrid">
          <div><h1>The Workshop</h1><h2>Practical product intelligence for people who run clinics.</h2></div>
          <div class="workshopHeroCopy"><p>The small details that make medical products safer to choose, easier to use and simpler to manage.</p></div>
        </div>
      </section>
      <section class="workshopCategorySection">
        <div class="workshopCategoryHead"><div><h2>Start with what you need to figure out.</h2><p>The categories are here to get you to the useful bit quickly.</p></div><button class="${ui.workshopCategory==='All'?'active':''}" data-workshop-category="All">View all guides</button></div>
        <div class="workshopCategoryGrid">${categories.map(workshopCategoryCard).join('')}</div>
      </section>
      <section class="workshopTools">
        <div class="workshopSearch"><span>${icon('search')}</span><input data-workshop-q value="${esc(ui.workshopQuery)}" placeholder="Search product, question or clinic check…" aria-label="Search The Workshop"></div>
        <div class="workshopResultContext"><span>${esc(resultLabel)}</span><b>${filtered.length} ${filtered.length===1?'guide':'guides'}</b>${(ui.workshopCategory!=='All'||ui.workshopQuery)?'<button data-workshop-clear>Reset</button>':''}</div>
      </section>
      ${filtered.length?`<section class="workshopGuideDeck">
        <div class="workshopGuideDeckIntro"><h2>${ui.workshopCategory==='All'&&!ui.workshopQuery?'Useful things to know before the next order.':esc(resultLabel)}</h2><p>${ui.workshopCategory==='All'&&!ui.workshopQuery?'Short, practical guides about the products, checks and specifications that tend to matter in real clinics.':'Guides matching the category or search you selected.'}</p></div>
        <div class="workshopGuideDeckScroll">${filtered.map(workshopGuideCard).join('')}</div>
      </section>`:`<section class="workshopEmpty"><h2>Nothing on the bench for that search yet.</h2><p>Try a product name, category or broader term.</p><button class="button outline" data-workshop-clear>Clear search</button></section>`}
      <section class="workshopPrinciple"><div><h2>Useful product knowledge belongs next to the product.</h2></div><p>The Workshop is there to make specifications, compatibility, readiness and replenishment easier to understand before the next order — not to turn education into a sales pitch.</p></section>
      ${publicFooter()}
    </main>`;
  }

  function workshopSectionHtml(section){
    if(section.comparison) return `<section class="workshopArticleSection"><h2>${esc(section.title)}</h2><div class="workshopComparison">${section.comparison.map(x=>`<article><span>${esc(x.label)}</span><p>${esc(x.text)}</p></article>`).join('')}</div></section>`;
    if(section.spec_example){ const x=section.spec_example; return `<section class="workshopArticleSection workshopSpecLesson"><h2>${esc(section.title)}</h2><div class="badSpec"><span>VAGUE RFQ</span><strong>${esc(x.bad)}</strong></div><div class="missingSpec"><span>WHAT'S MISSING?</span>${x.missing.map(v=>`<b>${esc(v)}</b>`).join('')}</div><div class="goodSpec"><span>ORDER IT LIKE THIS</span><p>${esc(x.good)}</p></div></section>`; }
    if(section.checklist) return `<section class="workshopArticleSection workshopChecklist"><h2>${esc(section.title)}</h2><ol>${section.checklist.map((v,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><p>${esc(v)}</p></li>`).join('')}</ol></section>`;
    if(section.bullets) return `<section class="workshopArticleSection"><h2>${esc(section.title)}</h2><ul class="workshopBullets">${section.bullets.map(v=>`<li>${esc(v)}</li>`).join('')}</ul></section>`;
    return `<section class="workshopArticleSection"><h2>${esc(section.title)}</h2><p>${esc(section.text||'')}</p></section>`;
  }
  function workshopGuidePage(slug){
    const g=workshopGuideBySlug(slug);
    if(!g)return `<main class="publicPage workshopPage">${publicHeader('workshop')}<section class="workshopNotFound"><span>THE WORKSHOP</span><h1>Guide not found.</h1><p>The guide may have moved or is not published.</p><button class="button primary" data-go="workshop">Back to The Workshop</button></section>${publicFooter()}</main>`;
    const saved=workshopSaved().has(g.slug);
    const related=workshopRelatedProducts(g,4);
    return `<main class="publicPage workshopPage workshopArticlePage">${publicHeader('workshop')}
      <article class="workshopArticle ${g.format==='CHECK THIS'?'workshopPrintCheck':''}">
        <header class="workshopArticleHeader">
          <div class="workshopArticleTopline"><button data-go="workshop">THE WORKSHOP</button><i></i><span>${esc(g.category)}</span><b>${esc(workshopFormatLabel(g.format))}</b></div>
          <h1>${esc(g.title)}</h1><p class="workshopDeck">${esc(g.subtitle)}</p>
          <div class="workshopArticleMeta"><span>${esc(g.read_time)} read</span><span>Last reviewed ${esc(g.last_reviewed)}</span><span>${esc(g.author_or_review_status)}</span></div>
          <div class="workshopArticleActions"><button data-workshop-save="${esc(g.slug)}" aria-pressed="${saved?'true':'false'}">${saved?'Saved':'Save'}</button><button data-workshop-print>Print</button><button data-workshop-share="${esc(g.slug)}">Share</button>${authContext?.isPscAdmin?`<button class="workshopMailAction" data-mail-from-guide="${esc(g.slug)}">Create email</button>`:''}</div>
        </header>
        <div class="workshopArticleBody">${(g.body_sections||[]).map(workshopSectionHtml).join('')}</div>
        <section class="workshopSignature">
          <article><span>USE IT RIGHT</span><p>${esc(g.use_it_right)}</p></article>
          <article><span>CHECK YOUR STOCK</span><p>${esc(g.check_your_stock)}</p></article>
          <article><span>WHEN ORDERING</span><p>${esc(g.when_ordering)}</p></article>
        </section>
        ${related.length?`<section class="workshopRelated"><div class="workshopRelatedHead"><span>RELATED CLINIC SUPPLIES</span><p>Relevant catalogue lines are shown after the product guidance — education first, commerce second.</p></div><div class="workshopRelatedList">${related.map(p=>{const n=clinicalNeedMeta(clinicalNeedIds(p)[0]||'all');return `<button data-go="catalogue/${n.id}"><span>${esc(p.pscSku||'PSC')}</span><b>${esc(p.catalogueDisplayName||p.name)}</b><small>${esc(p.cataloguePack||p.pack||'Pack to confirm')}</small></button>`}).join('')}</div></section>`:''}
        <footer class="workshopMedicalNote">Workshop guides provide general product and supply information. Clinical decisions should follow the product instructions, institutional procedures and applicable professional or regulatory requirements.</footer>
      </article>${publicFooter()}
    </main>`;
  }
  function workshopTeaser(){
    const slugs=['which-glove-should-i-actually-wear','oxygen-cylinder-is-not-an-oxygen-system','aed-has-expiring-parts-too'];
    const items=slugs.map(workshopGuideBySlug).filter(Boolean);
    return `<section class="homeWorkshop homeWorkshopCards"><div class="homeWorkshopIntro"><span class="kicker">THE WORKSHOP</span><h2>Know what you're working with.</h2><p>Practical guides to the products, equipment and small details that keep clinics ready.</p><button class="button outline" data-go="workshop">Enter The Workshop</button></div><div class="homeWorkshopCardGrid">${items.map(workshopGuideCard).join('')}</div></section>`;
  }
  function schoolWorkshopStrip(){
    const slugs=['ten-minute-school-clinic-stock-expiry-walk','aed-has-expiring-parts-too','oxygen-cylinder-is-not-an-oxygen-system'];
    return `<section class="schoolWorkshopStrip"><div><span class="kicker">USEFUL IN YOUR CLINIC</span><h2>The Workshop</h2></div><div>${slugs.map(slug=>{const g=workshopGuideBySlug(slug);return g?`<button data-go="workshop/${g.slug}"><span>${esc(workshopFormatLabel(g.format))}</span><b>${esc(g.title)}</b></button>`:''}).join('')}</div></section>`;
  }

  function publicCatalogueCard(p){
    const need=clinicalNeedMeta(clinicalNeedIds(p)[0]||'all');
    const displayName=p.catalogueDisplayName||p.name;
    const pack=p.cataloguePack||p.pack||'Pack / unit to confirm';
    const imageUrl=productDisplayImageUrl(p);
    const workshop=workshopForProduct(p,1)[0];
    return `<article class="publicCatalogueCard">
      <button class="publicCatalogueVisual publicProductView" style="--need-bg:${need.bg};--need-ink:${need.ink}" data-public-product-view="${p.pscSku}" aria-label="View ${esc(displayName)} details">${imageUrl?`<img src="${esc(imageUrl)}" alt="${esc(displayName)}" loading="lazy" onerror="this.onerror=null;this.src='${esc(legacyProductImageUrl(p))}'">`:`<span>${esc(need.label)}</span>`}${p.dhaMapped?`<img class="publicDhaMark" src="${DHA_ICON}" alt="DHA requirement mapping">`:''}</button>
      <div class="publicCatalogueBody"><small>${esc(need.label)}</small><button class="publicProductTitle" data-public-product-view="${p.pscSku}"><h3>${esc(displayName)}</h3></button><p>${esc(pack)}</p>${p.pscOfferedSpecification?`<div class="publicSpec">${esc(p.pscOfferedSpecification)}</div>`:''}${p.dhaMapped?'<div class="publicMappingNote">Mapped to the applicable DHA clinic requirement.</div>':''}${workshop?`<button class="catalogueWorkshopLink" data-go="workshop/${esc(workshop.slug)}"><span>FROM THE WORKSHOP</span><b>${esc(workshop.title)}</b></button>`:''}</div>
      <button class="button outline full" data-go="contact">Request institutional quote</button>
    </article>`;
  }

  function publicCataloguePage(needId='all'){
    const meta=clinicalNeedMeta(needId);
    const {filtered,types}=catalogueFilterProducts(needId);
    const categories=INSTITUTIONAL_CATALOGUE_TEMPLATE.categories;
    return `<main class="publicPage publicCataloguePage">${publicHeader('catalogue')}
      <section class="publicPageHero cataloguePublicHero"><span class="kicker">INSTITUTIONAL CATALOGUE</span><h1>${needId==='all'?'Browse the controlled product master.':esc(meta.label)}</h1><p>Read-only public catalogue. Product availability, exact commercial specification, pricing and regulated supply route are confirmed for the account and transaction before commitment.</p></section>
      <section class="publicSection publicCatalogueControls">
        <div class="publicNeedRibbon">${categories.map(c=>`<button class="${c.id===needId?'active':''}" style="--need-bg:${c.bg};--need-ink:${c.ink}" data-go="catalogue/${c.id}">${esc(c.label)}</button>`).join('')}</div>
        <div class="filterBar"><div class="searchInput"><span>${icon('search')}</span><input data-cat-q value="${esc(ui.catalogueQuery)}" placeholder="Search product, pack or specification…"></div><select data-cat-filter="category"><option>All product types</option>${types.map(t=>`<option ${ui.catalogueCat===t?'selected':''}>${esc(t)}</option>`).join('')}</select></div>
      </section>
      <section class="publicSection publicCatalogueResults"><div class="publicCatalogueCount"><b>${filtered.length}</b><span>published institutional lines</span></div>${filtered.length?`<div class="publicCatalogueGrid">${filtered.map(publicCatalogueCard).join('')}</div>`:'<div class="emptyState"><h3>No matching published lines</h3><p>Try another clinical need or send the requirement to Pharma Service.</p><button class="button primary" data-go="contact">Request sourcing</button></div>'}</section>
      <section class="publicCta"><div><span class="kicker">ACCOUNT PRICING</span><h2>Need a quotation or customer-specific product list?</h2></div><div class="publicCtaActions"><button class="button outline large" data-go="contact">Request supply</button><button class="button primary large" data-go="login">Open Clinic Portal</button></div></section>
      ${publicFooter()}
    </main>`;
  }

  function careersPage(){ return publicPage('careers','CAREERS','Build practical healthcare supply with us.','We are interested in people who value accuracy, follow-through and institutional customer service.',`<section class="publicSection simplePublicPanel"><h2>Current opportunities</h2><p>Roles will be posted here as the institutional-supply business expands. For now, career enquiries can be directed through the Contact page.</p><button class="button outline" data-go="contact">Contact Pharma Service</button></section>`); }

  function mediaPage(){ return publicPage('media','MEDIA','Updates, resources and institutional supply notes.','A public space for Pharma Service company updates and practical institutional healthcare-supply resources.',`<section class="publicSection publicMediaGrid"><article><span>SCHOOL CLINICS</span><h3>Building a cleaner replenishment process</h3><p>Why repeat ordering should get easier after the first completed supply cycle.</p></article><article><span>PRODUCT CONTROL</span><h3>Requirement-mapped specifications</h3><p>How PSC separates regulatory requirements from exact commercial product specifications.</p></article><article><span>PSC UPDATE</span><h3>Institutional Supply Portal</h3><p>The first MVP brings ordering, quotations and replenishment into one customer account.</p></article></section>`); }

  function unsubscribePage(){
    const token=new URLSearchParams(location.search).get('token')||'';
    return `<main class="publicPage unsubscribePage">${publicHeader('')}<section class="unsubscribeCard"><span class="kicker">PHARMA SERVICE MAIL</span><h1>Email preferences</h1><div data-unsubscribe-state>${token?'<p>Updating your email preference…</p>':'<p>This unsubscribe link is missing its contact token.</p>'}</div><p class="unsubscribeFine">This only stops PSC marketing/outreach emails. It does not affect transactional messages about active quotations, orders, deliveries, invoices or service matters.</p><button class="button light" data-go="home">Back to Pharma Service</button></section>${publicFooter()}</main>`;
  }

  async function processMailUnsubscribe(){
    const host=document.querySelector('[data-unsubscribe-state]'); if(!host) return;
    const token=new URLSearchParams(location.search).get('token')||'';
    if(!token){host.innerHTML='<p>This unsubscribe link is incomplete. Please email info@pharmaservice.ae if you want us to update your preferences.</p>';return;}
    if(!sb){host.innerHTML='<p>We could not update this preference automatically. Please email info@pharmaservice.ae and we will update it.</p>';return;}
    try{
      const {data,error}=await sb.functions.invoke('mail-unsubscribe',{body:{token}}); if(error)throw error; if(data?.error)throw new Error(data.error);
      host.innerHTML='<div class="unsubscribeDone"><b>You are unsubscribed.</b><p>PSC will no longer send marketing/outreach emails to this contact record.</p></div>';
    }catch(e){console.error(e);host.innerHTML='<p>We could not update this preference automatically. Please email <b>info@pharmaservice.ae</b> and we will update it.</p>';}
  }

  function startPage(){
    return `<main class="publicPage startPage">
      ${publicHeader('')}
      <section class="startHero">
        <div class="startHeroCopy">
          <span class="kicker">PHARMA SERVICE · INSTITUTIONAL SUPPLY</span>
          <h1>Start with what you have.</h1>
          <p>Looking for something specific? Browse the catalogue. Already have an RFQ or product list? Send it over. If you just want to understand how Pharma Service works, that is here too.</p>
          <div class="startScope"><b>Opening supply · Replenishment · Replacement</b><span>Equipment · Consumables · Pharmaceuticals</span></div>
          <div class="startCredential"><span>Pharma Service Co. L.L.C.</span><span>Dubai, United Arab Emirates</span><span>MOHAP Drug Store Reg. #1505</span></div>
        </div>
        <div class="startChoices" aria-label="Choose how to start">
          <article class="startChoice startChoiceCatalogue">
            <span>01</span><h2>Browse the catalogue</h2><p>See the institutional range by clinical need and product category.</p><button class="button light" data-go="catalogue">Browse catalogue</button>
          </article>
          <article class="startChoice startChoiceSend">
            <span>02</span><h2>Send us what you have</h2><p>RFQ, Excel sheet, PDF or a written list. We can clarify the missing details before quoting.</p><button class="button primary" data-start-scroll="send">Send your list</button>
          </article>
          <article class="startChoice startChoiceModel">
            <span>03</span><h2>See how we work</h2><p>A quick look at how we handle specifications, sourcing, regulated lines and repeat supply.</p><button class="button dark" data-go="our-model">Our model</button>
          </article>
        </div>
      </section>

      <section class="startWorkshopStrip">
        <div><span class="kicker">THE WORKSHOP</span><h2>Not sure what the product actually needs to be?</h2><p>Practical guides to products, compatibility, readiness, expiry and ordering details.</p></div>
        <button class="button outline" data-go="workshop">Open The Workshop</button>
      </section>

      <section class="startSendSection" id="start-send">
        <div class="startSendIntro">
          <span class="kicker">HAVE A LIST?</span>
          <h2>Send us what you have.</h2>
          <p>It does not need to be perfectly specified. Send the requirement as it stands and we will clarify what matters before we quote it.</p>
          <div class="startSendAside"><b>No list yet?</b><button class="textAction" data-go="catalogue">Browse the catalogue</button></div>
        </div>
        <form class="prospectForm startProspectForm" data-public-enquiry data-source-page="business_card_start_v37_5_8" novalidate>
          <div class="prospectField">
            <label for="startOrganization">Organization</label>
            <input id="startOrganization" name="organization" type="text" maxlength="180" placeholder="School group, clinic or company" required>
          </div>
          <div class="prospectField">
            <label for="startInstitutionType">Institution type</label>
            <select id="startInstitutionType" name="institution_type" required><option value="">Select</option><option>School / education</option><option>Healthcare facility</option><option>Corporate / workplace health</option><option>Government / public institution</option><option>Hospitality / other institution</option><option>Other</option></select>
          </div>
          <div class="prospectField">
            <label for="startName">Name</label>
            <input id="startName" name="name" type="text" autocomplete="name" maxlength="120" placeholder="Your name" required>
          </div>
          <div class="prospectField">
            <label for="startPhone">Contact number</label>
            <input id="startPhone" name="contact_number" type="tel" autocomplete="tel" maxlength="40" placeholder="+971" required>
          </div>
          <div class="prospectField prospectFieldWide">
            <label for="startEmail">Contact email</label>
            <input id="startEmail" name="contact_email" type="email" autocomplete="email" maxlength="254" placeholder="name@organization.ae" required>
          </div>
          <div class="prospectField prospectFieldWide">
            <label for="startRequirement">What do you need?</label>
            <textarea id="startRequirement" name="requirement" rows="5" maxlength="4000" placeholder="Paste the list, describe the item, quantities or anything else you already know." required></textarea>
          </div>
          <div class="prospectField prospectFieldWide rfqUploadField">
            <label for="startRfq">Attach a list or RFQ <span>optional · PDF, Word, Excel or CSV · max 10 MB</span></label>
            <input id="startRfq" name="rfq_file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,application/pdf,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
          </div>
          <div class="prospectHoneypot" aria-hidden="true"><label for="startWebsite">Website</label><input id="startWebsite" name="website" type="text" tabindex="-1" autocomplete="off"></div>
          <div class="prospectSubmitRow"><p>We will use this to come back to you about the institutional requirement.</p><button class="button primary semanticPrimary" type="submit" data-public-enquiry-submit>Send request</button></div>
        </form>
      </section>
      ${publicFooter()}
    </main>`;
  }

  function contactPage(){ return publicPage(
    'contact',
    'CONTACT / REQUEST SUPPLY',
    'Tell Pharma Service what the institution needs.',
    'A better first enquiry gives us enough information to qualify the requirement, prepare comparable sourcing and come back with the right next step.',
    `<section class="publicSection prospectSection">
      <div class="prospectIntro">
        <span class="kicker">CAPTURE THE REQUIREMENT</span>
        <h2>Start with the institution, sites and timing.</h2>
        <p>Use this for a single product, a recurring supply list, capital equipment, clinic setup or a broader RFQ. You can also attach the customer list or RFQ file.</p>
      </div>

      <form class="prospectForm v37ProspectForm" data-public-enquiry novalidate>
        <div class="prospectField">
          <label for="prospectOrganization">Organization</label>
          <input id="prospectOrganization" name="organization" type="text" maxlength="180" placeholder="School group, clinic or company" required>
        </div>
        <div class="prospectField">
          <label for="prospectInstitutionType">Institution type</label>
          <select id="prospectInstitutionType" name="institution_type" required><option value="">Select</option><option>School / education</option><option>Healthcare facility</option><option>Corporate / workplace health</option><option>Government / public institution</option><option>Hospitality / other institution</option><option>Other</option></select>
        </div>
        <div class="prospectField">
          <label for="prospectSites">Number of sites <span>optional</span></label>
          <input id="prospectSites" name="site_count" type="number" min="1" max="10000" placeholder="e.g. 4">
        </div>
        <div class="prospectField">
          <label for="prospectEmirate">Emirate</label>
          <select id="prospectEmirate" name="emirate"><option value="">Select</option><option>Dubai</option><option>Abu Dhabi</option><option>Sharjah</option><option>Ajman</option><option>Ras Al Khaimah</option><option>Fujairah</option><option>Umm Al Quwain</option><option>Multiple Emirates</option></select>
        </div>
        <div class="prospectField">
          <label for="prospectRequirementType">Requirement type</label>
          <select id="prospectRequirementType" name="requirement_type"><option value="">Select</option><option>Recurring consumables</option><option>Clinic opening / capital equipment</option><option>Medicines / regulated products</option><option>Equipment replacement</option><option>Full RFQ / tender list</option><option>Single product</option><option>Other</option></select>
        </div>
        <div class="prospectField">
          <label for="prospectRequiredBy">Required by <span>optional</span></label>
          <input id="prospectRequiredBy" name="required_by" type="date">
        </div>
        <div class="prospectField prospectFieldWide">
          <label for="prospectRequirement">Requirement</label>
          <textarea id="prospectRequirement" name="requirement" rows="6" maxlength="4000" placeholder="Products, quantities, current specification, delivery timing, account requirements or anything else we should know." required></textarea>
        </div>
        <div class="prospectField">
          <label for="prospectName">Name</label>
          <input id="prospectName" name="name" type="text" autocomplete="name" maxlength="120" placeholder="Your name" required>
        </div>
        <div class="prospectField">
          <label for="prospectPhone">Contact number</label>
          <input id="prospectPhone" name="contact_number" type="tel" autocomplete="tel" maxlength="40" placeholder="+971" required>
        </div>
        <div class="prospectField prospectFieldWide">
          <label for="prospectEmail">Contact email</label>
          <input id="prospectEmail" name="contact_email" type="email" autocomplete="email" maxlength="254" placeholder="name@organization.ae" required>
        </div>
        <div class="prospectField prospectFieldWide rfqUploadField">
          <label for="prospectRfq">Attach RFQ or product list <span>optional · PDF, Word, Excel or CSV · max 10 MB</span></label>
          <input id="prospectRfq" name="rfq_file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,application/pdf,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
        </div>

        <div class="prospectHoneypot" aria-hidden="true"><label for="prospectWebsite">Website</label><input id="prospectWebsite" name="website" type="text" tabindex="-1" autocomplete="off"></div>
        <div class="prospectSubmitRow"><p>By submitting, you’re asking Pharma Service to contact you about this institutional requirement.</p><button class="button primary semanticPrimary" type="submit" data-public-enquiry-submit>Send enquiry</button></div>
      </form>
    </section>

    <section class="publicSection contactGrid prospectContactGrid">
      <div class="contactCard"><span>PHONE</span><b>+971 4 337 7004</b></div>
      <div class="contactCard"><span>EMAIL</span><b>info@pharmaservice.ae</b></div>
      <div class="contactCard"><span>LOCATION</span><b>Dubai, United Arab Emirates</b></div>
      <div class="contactCard"><span>CLINIC PORTAL</span><button class="button primary" data-go="login">Open account access</button></div>
    </section>`
  ); }


  function wholesalePage(){
    const sf=storefrontConfig('wholesale')||{};
    const rows=cms.publicRows.wholesale||[];
    const cats=['All',...Array.from(new Set(rows.map(x=>x.category).filter(Boolean))).sort()];
    const q=(ui.wholesaleQuery||'').toLowerCase().trim();
    const filtered=rows.filter(r=>{
      const hay=`${r.name||''} ${r.brand||''} ${r.psc_sku||''} ${r.category||''}`.toLowerCase();
      return hay.includes(q) && (ui.wholesaleCat==='All'||r.category===ui.wholesaleCat);
    });

    return `<main class="publicPage wholesalePublicPage">
      ${publicHeader('')}
      <section class="publicPageHero wholesaleHero">
        <span class="kicker">PHARMA SERVICE · WHOLESALE</span>
        <h1>${esc(sf.headline||'Consumer health products for professional buyers.')}</h1>
        <p>${esc(sf.subheadline||'Browse medicines, consumables, devices and equipment, then request trade pricing from Pharma Service.')}</p>
      </section>
      <section class="publicSection wholesaleStorefront">
        <div class="filterBar wholesaleFilter"><div class="searchInput"><span>⌕</span><input data-wholesale-q value="${esc(ui.wholesaleQuery)}" placeholder="Search product, brand or category…"></div><select data-wholesale-cat>${cats.map(c=>`<option ${ui.wholesaleCat===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
        ${filtered.length?`<div class="wholesaleGrid">${filtered.map(r=>`<article class="wholesaleCard">
          <div class="wholesaleImage">${r.image_url?`<img src="${esc(r.image_url)}" alt="${esc(r.name)}">`:'<span>PRODUCT</span>'}</div>
          ${r.brand?`<small>${esc(r.brand)}</small>`:''}
          <h3>${esc(r.name)}</h3>
          <p>${esc(r.short_description||r.pack||'')}</p>
          <div class="wholesaleMeta">${r.pack?`<span>${esc(r.pack)}</span>`:''}${r.moq?`<span>MOQ ${esc(r.moq)}</span>`:''}</div>
          <div class="wholesaleAction">${r.price_display_mode==='show_price'&&r.display_price!==null?`<b>${money(r.display_price)}</b>`:`<b>${r.price_display_mode==='contact'?'Contact PSC':'Request quote'}</b>`}<button class="button primary" data-go="contact">Enquire</button></div>
        </article>`).join('')}</div>`:`<div class="emptyState wholesaleEmpty"><h3>Wholesale catalogue is being prepared.</h3><p>Contact Pharma Service for trade pricing and product availability.</p><button class="button primary" data-go="contact">Contact Pharma Service</button></div>`}
      </section>
      ${publicFooter()}
    </main>`;
  }

  function loginPage(){ return `<main class="publicPage loginPublicPage v26LoginPage">${publicHeader('')}<section class="loginWrap v26LoginWrap"><div class="loginIntro v26LoginIntro"><span class="kicker">CLINIC PORTAL ACCESS</span><h1>Institutional procurement,<br>connected.</h1><p>Shop the catalogue, review quotations, track orders and repeat previously supplied items through one secure Pharma Service account.</p><div class="v26LoginFlow"><span>Source</span><span>Quote</span><span>Supply</span><span>Repeat</span></div><div class="loginSupport">Need access? <button data-go="contact">Contact Pharma Service</button> <span>·</span> <button data-go="demo">View guided demo</button></div></div><div class="loginCard v26LoginCard"><img src="${PSC_LOGO}" alt="Pharma Service"><span class="loginLabel">ACCOUNT ACCESS</span><h2>Clinic Portal</h2><label>Email</label><input class="input" id="mvpLoginEmail" type="email" autocomplete="email" placeholder="name@organization.ae"><label>Password</label><input class="input" id="mvpLoginPassword" type="password" autocomplete="current-password" placeholder="••••••••"><button class="button primary full" data-mvp-login>Continue to Clinic Portal</button><p class="loginNote">Your organization and account permissions are determined automatically after sign-in.</p></div></section>${publicFooter()}</main>`; }

  function portalDashboard(){
    const visible=customerVisibleRequests();
    const active=visible.filter(r=>!['Accepted','Cancelled'].includes(r.status));
    const awaiting=visible.filter(r=>r.status==='Sent').length;
    const processing=visible.filter(r=>['Authorized','Procurement','Delivery'].includes(r.status)).length;
    const delivered=state.requests.filter(r=>r.campus===state.campus&&r.status==='Accepted');
    const deliveredSkus=new Set(delivered.flatMap(r=>r.lines.map(l=>l.sku)));
    const quickNeeds=INSTITUTIONAL_CATALOGUE_TEMPLATE.categories.filter(c=>!['all'].includes(c.id)).slice(0,7);
    const resources=[
      {tag:'PROCUREMENT',title:'Building a cleaner institutional replenishment cycle',date:'Updated 28 Sep 2026'},
      {tag:'CATALOGUE',title:'Clinical-need navigation is now available',date:'Updated 28 Sep 2026'},
      {tag:'ACCOUNT',title:'Keep quotations, orders and repeats in one supply history',date:'Updated 27 Sep 2026'}
    ];

    return shell(`
      <section class="v26HomeHero">
        <div><span class="eyebrow">${isDemoAccount()?'PHARMA SERVICE DEMO':'YOUR PHARMA SERVICE ACCOUNT'}</span><h1>${isDemoAccount()?'Explore the institutional workflow.':'What do you need today?'}</h1><p>${isDemoAccount()?'Browse the catalogue, switch sites, review sample quotations, repeat supplied items and simulate new requests.':'Shop, repeat, review and request through one accountable institutional supply relationship.'}</p></div>
        <div class="v26HomeStatus"><span>ACCOUNT</span><b>${esc(state.campus||'Institutional account')}</b><small>${active.length} active · ${awaiting} quote ready</small></div>
      </section>

      <section class="v26QuickActions">
        <button class="v26ActionCard coral" data-go="portal/catalogue"><span class="v26ActionIcon">${icon('inventory')}</span><small>01</small><h2>Shop catalogue</h2><p>Browse by clinical need and find the right institutional products faster.</p><i>→</i></button>
        <button class="v26ActionCard blue" data-go="portal/replenish"><span class="v26ActionIcon">${icon('repeat')}</span><small>02</small><h2>Repeat an order</h2><p>Restore previously supplied items from the same account history.</p><i>→</i></button>
        <button class="v26ActionCard mint" data-go="portal/requests"><span class="v26ActionIcon">${icon('request')}</span><small>03</small><h2>Orders & quotations</h2><p>Follow requests, quotation decisions, delivery and completed orders.</p><i>→</i></button>
        <button class="v26ActionCard sand" data-go="portal/catalogue/all"><span class="v26ActionIcon">${icon('search')}</span><small>04</small><h2>Find anything</h2><p>Search the full institutional catalogue or submit a sourcing request.</p><i>→</i></button>
      </section>

      <section class="v26NeedPreview">
        <div class="v26SectionHead"><div><span class="eyebrow">CONTINUE BY CLINICAL NEED</span><h2>Start where the clinical work starts.</h2></div><button data-go="portal/catalogue">View all needs →</button></div>
        <div class="v26NeedStrip">${quickNeeds.map(c=>`<button class="v26MiniNeed" style="--need-bg:${c.bg};--need-ink:${c.ink}" data-go="portal/catalogue/${c.id}"><b>${esc(c.label)}</b></button>`).join('')}</div>
      </section>

      <div class="v26OperationsStrip">
        <div><span>ACTIVE</span><b>${active.length}</b><small>Orders & requests</small></div>
        <div><span>QUOTE READY</span><b>${awaiting}</b><small>Awaiting your decision</small></div>
        <div><span>IN PROCESS</span><b>${processing}</b><small>${processing?'Open order for delivery timing':'No deliveries due'}</small></div>
        <div><span>REPLENISH</span><b>${deliveredSkus.size}</b><small>Previously delivered items</small></div>
      </div>

      <div class="customerHomeGrid v26HomeGrid">
        <section class="panel v26ActivityPanel"><div class="panelHeader"><h2>Current activity</h2><button data-go="portal/requests">View all →</button></div><div class="homeActivity">${active.slice(0,4).map(r=>orderMiniRow(r)).join('')||'<div class="emptyState"><h3>No active orders</h3><p>New requests and quotations will appear here.</p></div>'}</div></section>
        <section class="customerActionPanel v26RepeatPanel"><span class="eyebrow">QUICK REPEAT</span><h2>Need the same items again?</h2><p>Replenish from products already supplied to this account.</p><button class="button dark" data-go="portal/replenish">Open Replenish →</button></section>
      </div>

      <section class="panel resourcePreview v26Resources"><div class="panelHeader"><h2>Latest resources & updates</h2><button data-go="portal/insights">Open page →</button></div><div class="resourcePreviewGrid">${resources.map(x=>`<article><span>${x.tag}</span><h3>${x.title}</h3><small>${x.date}</small></article>`).join('')}</div></section>
    `);
  }

  function orderMiniRow(r){
    const p=r.lines[0]?product(r.lines[0].sku):null;
    return `<button class="homeActivityRow" data-request-view="${r.id}"><div><b>${esc(r.quoteRef||r.id)}</b><span>${p?esc(p.name):r.lines.length+' lines'}${r.lines.length>1?` +${r.lines.length-1} more`:''}</span></div><div>${customerStatusPill(r.status)}${['Authorized','Procurement','Delivery'].includes(r.status)?`<small>${esc(expectedDeliveryLabel(r))}</small>`:''}</div></button>`;
  }

  function schoolClinicsPage(){
    const cards=D.campuses.map((c,idx)=>{
      const siteRequests=state.requests.filter(r=>r.campus===c.name).length;
      const siteAssets=D.demoAssets.filter(a=>a.campus===c.name).length;
      const lastReq=state.requests.filter(r=>r.campus===c.name).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))[0];
      const score=idx===0?88:76;
      return `<article class="schoolCardV7 ${idx===0?'featured':''}"><div class="schoolCardHead"><div><span class="eyebrow">${esc(c.emirate.toUpperCase())}</span><h3>${esc(c.name)}</h3></div><span class="campusScore">${score}%</span></div><p>${esc(c.clinicCode)} · Preferred source: ${esc(c.preferredSource)}</p><div class="schoolStats"><div><b>${siteRequests}</b><span>Requests</span></div><div><b>${siteAssets}</b><span>Tracked assets</span></div><div><b>${esc(c.sla)}</b><span>SLA</span></div></div><div class="schoolMetaRows"><div><span>Partner hub</span><b>${esc(c.hub)}</b></div><div><span>Backup route</span><b>${esc(c.backup)}</b></div><div><span>Last activity</span><b>${lastReq?esc(lastReq.id):'No request yet'}</b></div></div><div class="schoolCardActions"><button class="button dark" data-go="portal/clinic-list">Open clinic list</button><button class="button light" data-go="portal/requests">View requests</button></div></article>`;
    }).join('');
    return shell(`<div class="pageHeader"><div><span class="eyebrow">MULTI-SITE SCHOOL VIEW</span><h1>School Clinics</h1><p>Show each school or campus as its own managed clinic account with a clear source route, request history and readiness context.</p></div><div class="headerActions"><button class="button light" data-go="portal/demo">Run navigator demo</button><button class="button primary" data-go="portal/catalogue">Browse catalogue</button></div></div><div class="schoolHeroStrip"><div><b>2</b><span>Managed school clinics</span></div><div><b>1</b><span>Primary supply partner</span></div><div><b>1</b><span>Backup route per site</span></div><div><b>100%</b><span>School-specific visibility</span></div></div><div class="schoolGridV7">${cards}</div><section class="panel" style="margin-top:18px"><div class="panelHeader"><h2>How to position it</h2></div><div class="v5PositionGrid"><div><span class="eyebrow">FOR THE SCHOOL</span><h3>One simple interface</h3><p class="smallMuted">Each clinic sees only what matters: approved essentials, quick refill workflows, reports and equipment records.</p></div><div><span class="eyebrow">FOR PSC</span><h3>Controlled account structure</h3><p class="smallMuted">Every site can still map to specific routing logic, supplier decisions, commercial rules and delivery controls behind the scenes.</p></div><div><span class="eyebrow">FOR ACORUS / MED7</span><h3>Repeatable fulfilment</h3><p class="smallMuted">Orders can be grouped by school, campus and nearest fulfilment logic once the proper partner feed is connected.</p></div></div></section>`);
  }

  function guidedDemo(){
    const steps=[
      {n:'01',label:'SELECT THE SCHOOL',title:'Start with the clinic, not the catalogue.',text:'Choose a school or campus and immediately present a controlled clinic workspace instead of a generic consumer-pharmacy storefront.',outcome:'The school sees its own clinic account, not thousands of irrelevant lines.',visual:'school'},
      {n:'02',label:'BUILD THE REQUEST',title:'Refill the clinic in minutes.',text:'Use approved items, previous purchases and fast quantity entry to create one clean request for PSC review.',outcome:'The nurse or doctor spends less time chasing products and more time managing the clinic.',visual:'request'},
      {n:'03',label:'PSC CONTROLS THE COMPLEXITY',title:'Behind the scenes, PSC does the hard part.',text:'PSC validates route, supplier evidence, tax, stock and delivery before a quotation is issued and before procurement is released.',outcome:'The school experiences simplicity while PSC protects quality, compliance, margin and execution.',visual:'control'},
      {n:'04',label:'END WITH REPORTING',title:'Turn supply into visibility.',text:'Close the story with inventory readiness, stock alerts, expiring items, asset actions and the next steps the school should take.',outcome:'You are no longer just supplying items — you are helping the school manage readiness.',visual:'report'}
    ];
    const i=Math.max(0,Math.min(steps.length-1,ui.tourStep||0)), st=steps[i];
    const talkTracks=[
      '"Each school gets its own clinic workspace and approved supply view."',
      '"This is how a nurse can build a refill request in just a few clicks."',
      '"PSC keeps the sourcing and control complexity behind the curtain."',
      '"The portal ends with a report the school can act on immediately."'
    ];
    const visual={
      school:`<div class="demoShotV7"><div class="shotHeader"><span>School clinics</span><b>${esc(state.groupName||'School Group')}</b></div><div class="shotBody schoolSelector"><article class="schoolMini active"><b>${esc(state.campus||'Main Campus Clinic')}</b><small>Your authorized clinic account</small><span>Account ready</span></article><article class="schoolMini"><b>Additional campus</b><small>Available when assigned</small><span>Group access</span></article></div><div class="shotFoot">Every campus gets its own request history, inventory view and asset register.</div></div>`,
      request:`<div class="demoShotV7"><div class="shotHeader"><span>Approved clinic list</span><b>Fast refill request</b></div><div class="shotBody requestStack"><div class="reqRow"><div><b>Gauze Swab 5 × 5 cm</b><small>First aid / wound care</small></div><span>6</span></div><div class="reqRow"><div><b>Instant Cold Pack</b><small>Sports day refill</small></div><span>8</span></div><div class="reqRow"><div><b>Antiseptic Liquid 125 ml</b><small>Clinic essentials</small></div><span>3</span></div><button class="button primary full">Send supply request</button></div><div class="shotFoot">The school builds one request; PSC handles the commercial route.</div></div>`,
      control:`<div class="demoShotV7"><div class="shotHeader"><span>PSC release gate</span><b>Quote before procurement</b></div><div class="shotBody controlGrid"><div class="controlChip ok"><b>Exact SKU</b><small>Mapped and approved</small></div><div class="controlChip ok"><b>Stock</b><small>Current source verified</small></div><div class="controlChip warn"><b>VAT</b><small>Evidence checked</small></div><div class="controlChip ok"><b>Delivery</b><small>Campus route matched</small></div><div class="controlChip warn"><b>Licensed route</b><small>Controlled if needed</small></div><div class="controlChip block"><b>Funding</b><small>Release before supplier PO</small></div></div><div class="shotFoot">PSC stays accountable even when products come from multiple underlying vendors.</div></div>`,
      report:`<div class="demoShotV7"><div class="shotHeader"><span>Clinic account</span><b>${esc(state.campus||'School clinic')} overview</b></div><div class="shotBody reportStack"><div class="reportBig"><b>72%</b><span>Readiness</span></div><div class="reportBars"><div><label>Wound care</label><i style="width:81%"></i></div><div><label>PPE</label><i style="width:66%"></i></div><div><label>Clinical disposables</label><i style="width:54%"></i></div><div><label>Respiratory</label><i style="width:38%"></i></div></div><div class="reportActionsMini"><span>Replenish 4 low-stock lines</span><span>Review 5 watch items</span><span>Check 1 asset action</span></div></div><div class="shotFoot">Finish the demo by showing clear actions, not just data.</div></div>`
    }[st.visual];
    return shell(`<div class="pageHeader demoHeader"><div><span class="eyebrow">GUIDED EXPLAINER / NAVIGATOR</span><h1>Four-step school demo</h1><p>A tighter, cleaner walk-through you can present live to a school nurse, doctor, administrator or procurement lead.</p></div><button class="button outline" data-go="portal/insights">Jump to report</button></div>
      <div class="tourProgress tourProgressV7">${steps.map((x,j)=>`<button class="tourDot ${j===i?'active':j<i?'done':''}" data-tour-jump="${j}"><b>${x.n}</b><span>${x.title}</span></button>`).join('')}</div>
      <section class="tourStage tourStageV7"><div class="tourNarrative"><span class="kicker">${st.label}</span><h2>${st.title}</h2><p>${st.text}</p><div class="demoOutcome"><span>What the school understands</span><b>${st.outcome}</b></div><div class="demoTalkTrack"><span>Suggested presenter line</span><strong>${talkTracks[i]}</strong></div><div class="tourNav"><button class="button outline" data-tour-prev ${i===0?'disabled':''}>Previous</button>${i<steps.length-1?'<button class="button primary" data-tour-next>Next</button>':'<button class="button primary" data-go="portal/insights">Open full report →</button>'}</div></div><div class="tourVisual tourVisualV7">${visual}</div></section>
      <section class="panel" style="margin-top:18px"><div class="panelHeader"><h2>Why this demo works</h2></div><div class="v5PositionGrid"><div><span class="eyebrow">SIMPLE</span><h3>Less AI, less clutter</h3><p class="smallMuted">The story is shorter, more visual and easier to walk through live.</p></div><div><span class="eyebrow">COMMERCIAL</span><h3>Shows PSC's role clearly</h3><p class="smallMuted">It communicates that PSC is not merely a product list — it is the accountable operating partner.</p></div><div><span class="eyebrow">ACTIONABLE</span><h3>Ends with insight</h3><p class="smallMuted">Schools see that the portal can lead to concrete inventory actions, not just another order screen.</p></div></div></section>`);
  }

  function insightsPage(){
    const resources=[
      {type:'Clinic Operations',title:'Stock & expiry register',summary:'Review usable on-hand quantity, expiry dates and replenishment candidates for this clinic.',cta:'Open register',go:'portal/stock'},
      {type:'Replenishment',title:'Repeat previously supplied items',summary:'Use delivered account history to build the next request without starting from zero.',cta:'Open Replenish',go:'portal/replenish'},
      {type:'Product Master',title:'Browse the institutional catalogue',summary:'Find products by clinical need, pack and specification, then add them to the current request.',cta:'Open catalogue',go:'portal/catalogue'},
      {type:'Account Record',title:'Order and quotation history',summary:'Keep current requests, quotation decisions, delivery states and completed orders attached to the account.',cta:'Open orders',go:'portal/requests'},
      {type:'Equipment',title:'Clinic asset records',summary:'Keep model, serial, warranty and service prompts visible for supplied capital equipment.',cta:'Open assets',go:'portal/assets'},
      {type:'Documents',title:'Commercial documents',summary:'Open quotations, approvals, invoices, delivery notes and other order records in one place.',cta:'Open documents',go:'portal/documents'}
    ];
    return shell(`<div class="pageHeader customerSimpleHeader"><div><span class="eyebrow">ACCOUNT TOOLS</span><h1>Resources & account tools</h1><p>Every card below now opens a working account module rather than a placeholder article.</p></div></div><div class="resourceGrid">${resources.map((x,i)=>`<article class="resourceCard ${i===0?'featured':''}"><div class="resourceMeta"><span>${x.type}</span></div><h3>${x.title}</h3><p>${x.summary}</p><button class="resourceLink" data-go="${x.go}">${x.cta} →</button></article>`).join('')}</div>`);
  }


  function catalogueProducts(){
    return products().filter(p=>p.catalogueVisible!==false);
  }

  function catalogueFilterProducts(needId='all'){
    const q=ui.catalogueQuery.toLowerCase().trim();
    const types=(D.productTypes||[]).filter(Boolean);
    const allProducts=catalogueProducts();
    const filtered=allProducts.filter(p=>{
      const needLabels=clinicalNeedIds(p).map(id=>clinicalNeedMeta(id).label).join(' ');
      const hay=`${p.catalogueDisplayName||p.name} ${p.name||''} ${p.brand||''} ${p.pscSku} ${p.supplierSku||''} ${p.productType||''} ${needLabels}`.toLowerCase();
      const lineMatch=
        ui.catalogueFilter==='All lines' ||
        (ui.catalogueFilter==='DHA requirement'&&p.dhaMapped) ||
        (ui.catalogueFilter==='Licensed / controlled'&&p.regulated) ||
        (ui.catalogueFilter==='Specification-led'&&p.institutionalProvisional);
      return hay.includes(q)
        && clinicalNeedMatches(p,needId)
        && (ui.catalogueCat==='All product types'||p.productType===ui.catalogueCat)
        && lineMatch;
    });
    return {allProducts,filtered,types};
  }

  function clinicalNeedRibbon(activeId='all'){
    const home=`<button class="needRibbonHome" data-go="portal/catalogue" aria-label="Catalogue home"><span>Catalogue home</span></button>`;
    const items=INSTITUTIONAL_CATALOGUE_TEMPLATE.categories.map(c=>`<button class="needRibbonChip ${activeId===c.id?'active':''}" style="--need-bg:${c.bg};--need-ink:${c.ink}" data-go="portal/catalogue/${c.id}" aria-current="${activeId===c.id?'page':'false'}"><b>${esc(c.label)}</b></button>`).join('');
    return `<nav class="needRibbon" aria-label="Clinical needs">${home}<div class="needRibbonTrack">${items}</div></nav>`;
  }

  function catalogue(){
    const allProducts=catalogueProducts();
    const dhaCount=allProducts.filter(p=>p.dhaMapped).length;
    const needCards=INSTITUTIONAL_CATALOGUE_TEMPLATE.categories.map(c=>`<button class="clinicNeedCard clinicNeedCardIllustrated" style="--need-bg:${c.bg};--need-ink:${c.ink}" data-go="portal/catalogue/${c.id}">
        <span class="clinicNeedIcon" aria-hidden="true">${clinicalNeedIllustration(c.id)}</span>
        <span class="clinicNeedCopy"><b>${esc(c.label)}</b><small>${esc(c.note)}</small></span>
        <span class="clinicNeedArrow" aria-hidden="true">↗</span>
      </button>`).join('');

    const sf=storefrontConfig('institutional');
    return shell(`
      <div class="pageHeader institutionalCatalogueHeader v26CatalogueLandingHeader">
        <div><span class="eyebrow">INSTITUTIONAL CATALOGUE</span><h1>${esc(sf?.headline||'Browse by clinical need.')}</h1><p>${esc(sf?.subheadline||'Start with the situation, task or area of care. The catalogue keeps sourcing complexity behind the scenes while giving clinical teams a faster route to the right products.')}</p></div>
        <div class="catalogueDepthPill"><b>${allProducts.length}</b><span>catalogue lines</span><small>${dhaCount} lines mapped to DHA requirements</small></div>
      </div>

      <section class="clinicNeedSection v25NeedJourney v26CatalogueLanding">
        <div class="clinicNeedHeading"><div><span class="eyebrow">CLINICAL NEEDS</span><h2>Where do you want to start?</h2><p>Choose the clinical context first. Once inside, use the product and requirement filters to narrow the catalogue.</p></div></div>
        <div class="clinicNeedRail">${needCards}</div>
      </section>

      <section class="catalogueLandingShortcuts">
        <button class="catalogueShortcut warm" data-go="portal/catalogue/all"><span>${clinicalNeedIcon('all')}</span><div><b>View all supplies</b><small>Browse the complete institutional catalogue</small></div><i>→</i></button>
        <button class="catalogueShortcut blue" data-go="portal/replenish"><span>${icon('repeat')}</span><div><b>Repeat a previous order</b><small>Replenish from account history</small></div><i>→</i></button>
        <button class="catalogueShortcut mint" data-go="portal/requests"><span>${icon('request')}</span><div><b>Orders & quotations</b><small>Review active and historical requests</small></div><i>→</i></button>
      </section>
    `);
  }

  function catalogueCategory(needId='all'){
    const selected=INSTITUTIONAL_CATALOGUE_TEMPLATE.categories.find(c=>c.id===needId)||INSTITUTIONAL_CATALOGUE_TEMPLATE.categories.find(c=>c.id==='all');
    const {allProducts,filtered,types}=catalogueFilterProducts(selected.id);

    return shell(`
      <section class="categoryHero" style="--need-bg:${selected.bg};--need-ink:${selected.ink}">
        <div class="categoryHeroCopy"><span class="eyebrow">INSTITUTIONAL CATALOGUE</span><h1>${esc(selected.label)}</h1><p>${esc(selected.note)}</p></div>
        <div class="categoryHeroCount"><b>${filtered.length}</b><span>products</span></div>
      </section>

      ${clinicalNeedRibbon(selected.id)}

      <div class="notice shopNotice compactInstitutionalNotice"><strong>One accountable supply relationship.</strong> PSC reviews specification, availability and commercial terms before quotation. Regulated lines remain subject to the applicable licensed supply route and professional controls.</div>

      <div class="filterBar shopFilterBar v25FilterBar v26FilterBar">
        <div class="searchInput"><span>⌕</span><input data-cat-q value="${esc(ui.catalogueQuery)}" placeholder="Search product, brand, PSC SKU, supplier SKU or clinical need…"></div>
        <select data-cat-filter="category" aria-label="Product type"><option>All product types</option>${types.map(c=>`<option ${c===ui.catalogueCat?'selected':''}>${esc(c)}</option>`).join('')}</select>
        <select data-cat-filter="approval" aria-label="Catalogue status">
          <option>All lines</option>
          <option ${ui.catalogueFilter==='DHA requirement'?'selected':''}>DHA requirement</option>
          <option ${ui.catalogueFilter==='Licensed / controlled'?'selected':''}>Licensed / controlled</option>
          <option ${ui.catalogueFilter==='Specification-led'?'selected':''}>Specification-led</option>
        </select>
      </div>

      <div class="catalogueMeta clinicCatalogueMeta v26CatalogueMeta">
        <div><div class="sectionLabel">${filtered.length} PRODUCTS</div><span>${esc(selected.note)}</span></div>
        <button class="textAction" data-go="portal/catalogue">Clinical needs ↑</button>
      </div>

      <div class="productGrid v25ProductGrid">${filtered.map(productCard).join('')}</div>

      <section class="customRequestPanel v25CustomRequest v26CustomRequest">
        <div><span class="eyebrow">CAN'T FIND IT?</span><h2>Request something else.</h2><p>Describe the product, brand, size or specification. PSC will review it as an account-specific product request.</p></div>
        <div class="customRequestForm"><textarea id="customRequestText" class="textarea" placeholder="Example: paediatric nebulizer masks compatible with our existing unit…"></textarea><div class="customRequestActions"><label>Qty <input id="customRequestQty" type="number" min="1" value="1"></label><button class="button dark semanticPrimary" data-submit-custom>Send custom request →</button></div></div>
      </section>
    `);
  }

  function productCard(p){
    const needId=clinicalNeedIds(p)[0]||'all';
    const need=clinicalNeedMeta(needId);
    const displayName=p.catalogueDisplayName||p.name;
    const pack=p.cataloguePack||p.pack||'Pack / unit to confirm';
    const fallback=legacyProductImageUrl(p);
    const dhaMark=p.dhaMapped?`<img class="dhaRequirementIcon cardDhaIcon" src="${DHA_ICON}" alt="DHA requirement">`:'';
    const displayImage=productDisplayImageUrl(p);
    const visual=displayImage
      ? `<button class="productVisual productPhoto productVisualButton" data-product-view="${p.pscSku}" aria-label="View ${esc(displayName)} details"><img class="productMainImage" src="${esc(displayImage)}" alt="${esc(displayName)}" loading="lazy" onerror="this.onerror=null;this.src='${esc(fallback)}'">${dhaMark}</button>`
      : `<button class="productVisual productNeedVisual productVisualButton" style="--need-bg:${need.bg};--need-ink:${need.ink}" data-product-view="${p.pscSku}" aria-label="View ${esc(displayName)}">${dhaMark}</button>`;

    return `<article class="productCard v25ProductCard v261ProductCard v262ProductCard canvaProductCard exactCanvaCard">
      ${visual}
      <div class="canvaCardBody exactCanvaBody">
        <button class="productTitleButton" data-product-view="${p.pscSku}"><h3>${esc(displayName)}</h3></button>
        <p class="pack">${esc(pack)}</p>
        <div class="productNeedTags">${esc(need.label)}</div>
      </div>
      <div class="canvaCardActions exactCanvaActions">
        <button class="canvaDetails" data-product-view="${p.pscSku}">Details</button>
        <button class="canvaRequest" data-add="${p.pscSku}" aria-label="Request ${esc(displayName)}">Request</button>
      </div>
    </article>`;
  }

  function replenishPage(){
    const delivered=state.requests.filter(r=>r.campus===state.campus&&r.status==='Accepted');
    const map=new Map();
    delivered.forEach(r=>r.lines.forEach(l=>{
      const prev=map.get(l.sku);
      const basis=r.deliveredAt||r.createdAt;
      if(!prev || new Date(basis)>new Date(prev.sortDate)) map.set(l.sku,{...l,deliveredAt:r.deliveredAt||null,sortDate:basis,requestId:r.id});
    }));
    const items=[...map.values()].map(x=>({...x,p:product(x.sku)})).filter(x=>x.p);
    const cards=items.map(x=>{
      const capital=isCapitalProduct(x.p);
      const replenImage=productDisplayImageUrl(x.p); const visual=replenImage?`<img src="${esc(replenImage)}" alt="${esc(x.p.name)}">`:`<span>${esc(x.p.brand.slice(0,2).toUpperCase())}</span>`;
      const deliveredLabel=x.deliveredAt?date(x.deliveredAt):'Date to be confirmed';
      const actionLabel=capital?'Request another':`Replenish ${x.qty}`;
      return `<article class="replenishCard"><div class="replenishVisual">${visual}</div><div class="replenishBody"><span class="sku">${x.p.pscSku}</span><h3>${esc(x.p.name)}</h3><p>${esc(x.p.pack)}</p><div class="replenishMeta"><div><span>LAST QTY</span><b>${x.qty}</b></div><div><span>LAST DELIVERED</span><b>${deliveredLabel}</b></div></div><button class="button ${capital?'dark':'primary'} full semanticPrimary" data-replenish="${x.p.pscSku}|${x.qty}">${actionLabel} →</button></div></article>`;
    }).join('');
    const body=items.length?`<div class="replenishGrid">${cards}</div>`:'<div class="emptyState"><h3>No delivered items yet</h3><p>Products will appear here after their first completed order.</p></div>';
    return shell(`<div class="pageHeader customerSimpleHeader"><div><span class="eyebrow">PREVIOUSLY DELIVERED</span><h1>Replenish</h1><p>Repeat products already supplied to this clinic. Consumables can go straight to the request; capital equipment can be requested again for PSC review.</p></div><button class="button dark" data-basket>Open request</button></div>${body}`);
  }


  function documentTypeLabel(type){
    return ({quotation:'Quotation',customer_po:'Customer PO',approval:'Approval',invoice:'Invoice',delivery_note:'Delivery note',acceptance:'Acceptance',warranty:'Warranty / serial record',service_report:'Service report',other:'Other document'})[type]||'Document';
  }

  function orderDocumentsSection(r,admin=false){
    const docs=r.documents||[];
    const options=admin
      ? [['quotation','Quotation'],['customer_po','Customer PO'],['approval','Approval'],['invoice','Invoice'],['delivery_note','Delivery note'],['acceptance','Acceptance'],['warranty','Warranty / serial record'],['service_report','Service report'],['other','Other document']]
      : [['customer_po','Customer PO'],['approval','Approval'],['acceptance','Acceptance'],['other','Other document']];
    return `<section class="orderDocumentsPanel">
      <div class="orderDocumentsHead"><div><span class="eyebrow">COMMERCIAL RECORD</span><h3>Documents</h3></div><span>${docs.length} file${docs.length===1?'':'s'}</span></div>
      <div class="orderDocumentList">${docs.length?docs.map(d=>`<button class="orderDocumentRow" data-document-open="${esc(d.object_path)}"><span class="documentIcon">▤</span><span><b>${esc(d.title||documentTypeLabel(d.document_type))}</b><small>${esc(d.file_name||'Document')} · ${date(d.created_at)}</small></span><em>Open →</em></button>`).join(''):'<div class="orderDocumentEmpty">No documents attached to this order yet.</div>'}</div>
      ${r.dbId?`<div class="orderDocumentUpload"><select data-document-type="${r.id}">${options.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select><label class="button outline documentUploadButton">Attach document<input type="file" hidden data-document-upload="${r.id}" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"></label></div>`:`<div class="orderDocumentEmpty">Documents become available on live account orders.</div>`}
    </section>`;
  }

  function documentsPage(){
    const rows=customerVisibleRequests().flatMap(r=>(r.documents||[]).map(d=>({r,d}))).sort((a,b)=>new Date(b.d.created_at)-new Date(a.d.created_at));
    return shell(`<div class="pageHeader customerSimpleHeader"><div><span class="eyebrow">ACCOUNT RECORD</span><h1>Documents</h1><p>Quotations, customer approvals, invoices, delivery notes, acceptance records and equipment documents tied to this account.</p></div></div>
      <section class="panel documentsIndexPanel">${rows.length?`<div class="documentsIndex">${rows.map(({r,d})=>`<button class="documentIndexRow" data-document-open="${esc(d.object_path)}"><span><small>${documentTypeLabel(d.document_type)}</small><b>${esc(d.title||d.file_name||'Document')}</b><em>${esc(r.id)} · ${date(d.created_at)}</em></span><strong>Open →</strong></button>`).join('')}</div>`:'<div class="emptyState"><h3>No account documents yet</h3><p>Documents will appear here as they are attached to live orders. Open an order to upload a PO, approval or acceptance record.</p></div>'}</section>`);
  }

  async function openOrderDocument(path){
    if(!sb || !path) return;
    const preview=window.open('about:blank','_blank');
    try{
      const {data,error}=await sb.storage.from('order-documents').createSignedUrl(path,60);
      if(error) throw error;
      if(data?.signedUrl){
        if(preview){ preview.opener=null; preview.location=data.signedUrl; }
        else window.location.href=data.signedUrl;
      }
    }catch(e){ if(preview) preview.close(); console.error(e); toast('<strong>Could not open document.</strong>'); }
  }

  async function uploadOrderDocument(requestId,file){
    const r=state.requests.find(x=>x.id===requestId);
    if(!r || !r.dbId || !file) return;
    if(isDemoAccount()){ toast('<strong>Demo account.</strong><br>Document uploads are disabled in the sandbox.'); return; }
    if(file.size>15*1024*1024){ toast('<strong>File too large.</strong><br>Maximum 15 MB.'); return; }
    const type=document.querySelector(`[data-document-type="${CSS.escape(requestId)}"]`)?.value||'other';
    const allowedCustomer=['customer_po','approval','acceptance','other'];
    const allowedAdmin=['quotation','customer_po','approval','invoice','delivery_note','acceptance','warranty','service_report','other'];
    const allowed=authContext?.isPscAdmin?allowedAdmin:allowedCustomer;
    if(!allowed.includes(type)){ toast('<strong>Document type is not permitted.</strong>'); return; }
    const objectPath=`${r.dbId}/${Date.now()}-${safeFileName(file.name)}`;
    try{
      const {error:uploadError}=await sb.storage.from('order-documents').upload(objectPath,file,{cacheControl:'3600',upsert:false});
      if(uploadError) throw uploadError;
      const {error:metaError}=await sb.from('order_documents').insert({order_id:r.dbId,document_type:type,title:documentTypeLabel(type),file_name:file.name,object_path:objectPath,mime_type:file.type||null,file_size:file.size,created_by:session?.user?.id||null});
      if(metaError) throw metaError;
      await loadOrdersFromDatabase();
      render();
      toast('<strong>Document attached.</strong>');
    }catch(e){ console.error(e); toast(`<strong>Could not attach document.</strong><br>${esc(e?.message||'Please try again.')}`); }
  }

  const workflow=['Drafting','Sent','Authorized','Procurement','Delivery','Accepted','Cancelled'];
  function requestsPage(){
    const visible=customerVisibleRequests();
    const active=visible.filter(r=>!['Accepted','Cancelled'].includes(r.status));
    const delivered=visible.filter(r=>r.status==='Accepted');
    const cancelled=visible.filter(r=>r.status==='Cancelled');
    const archiveCount=state.requests.filter(r=>r.campus===state.campus&&isArchived(r)).length;
    return shell(`<div class="pageHeader customerSimpleHeader"><div><span class="eyebrow">YOUR ACCOUNT HISTORY</span><h1>Orders & Requests</h1><p>Every order, quotation and status between your clinic and Pharma Service in one place.</p></div><button class="button light" data-go="portal/archive">Archive (${archiveCount})</button></div>
      <section class="orderSection"><div class="orderSectionHead"><h2>Current</h2><span>${active.length}</span></div><div class="orderCardGrid">${active.map(r=>customerOrderCard(r)).join('')||'<div class="emptyState"><h3>No active orders</h3></div>'}</div></section>
      <section class="orderSection"><div class="orderSectionHead"><h2>Delivered</h2><span>${delivered.length}</span></div><div class="orderCardGrid compact">${delivered.map(r=>customerOrderCard(r)).join('')||'<div class="emptyState"><h3>No delivered orders yet</h3></div>'}</div></section>
      ${cancelled.length?`<section class="orderSection"><div class="orderSectionHead"><h2>Cancelled</h2><span>${cancelled.length}</span></div><div class="orderCardGrid compact">${cancelled.map(r=>customerOrderCard(r)).join('')}</div></section>`:''}`);
  }
  function customerOrderCard(r){
    const q=calcQuote(r), label=friendlyStatus(r.status), first=r.lines[0]||null, p=first?.sku?product(first.sku):null, extra=Math.max(0,r.lines.length-1);
    const delivery=['Authorized','Procurement','Delivery'].includes(r.status)?expectedDeliveryLabel(r):'';
    const archiveDate=r.status==='Cancelled'&&r.cancelledAt?addDaysLabel(r.cancelledAt,30):'';
    return `<article class="customerOrderCard statusCard-${r.status.toLowerCase()}"><div class="orderCardHead"><div><span class="eyebrow">${esc(r.quoteRef||'ORDER UNDER REVIEW')}</span><h3 class="mono">${r.id}</h3><p>${date(r.createdAt)} · ${r.lines.length} lines</p></div>${customerStatusPill(r.status)}</div><div class="orderCardProduct"><div><b>${first?`${first.qty} × ${esc(lineDisplayName(first,p))}`:'Order items'}</b>${extra?`<span>+ ${extra} more line${extra>1?'s':''}</span>`:''}</div>${q.hasSell&&r.quoteRef?`<strong>${money(q.total)}</strong>`:''}</div>${r.status==='Drafting'?`<div class="orderMessage">Under review. Your quotation will be sent to <strong>${esc(accountEmailLabel())}</strong>.</div>`:''}${r.status==='Sent'?`<div class="orderMessage quoteReady">Quotation sent to <strong>${esc(accountEmailLabel())}</strong>. Confirm or cancel below.</div>`:''}${delivery?`<div class="deliveryPromise"><span>TRACK</span><b>${delivery}</b></div>`:''}${r.status==='Accepted'?`<div class="orderMessage deliveredMsg">Delivered ${date(r.deliveredAt||r.createdAt)}. These items are now available on Replenish.</div>`:''}${r.status==='Cancelled'?`<div class="orderMessage cancelledMsg">Cancelled. This will move to Archive after ${archiveDate}.</div>`:''}<div class="orderCardActions"><button class="button light small" data-request-view="${r.id}">View</button>${r.status==='Sent'?`<button class="button primary small" data-confirm-quote="${r.id}">Confirm quote</button><button class="button quietDanger small" data-cancel-quote="${r.id}">Cancel</button>`:''}${['Authorized','Procurement','Delivery'].includes(r.status)?`<button class="button dark small" data-request-view="${r.id}">Track</button>`:''}${r.status==='Accepted'?`<button class="button dark small" data-reorder-order="${r.id}">Replenish order</button>`:''}</div></article>`;
  }

  function archivePage(){
    const archived=state.requests.filter(r=>r.campus===state.campus&&isArchived(r));
    return shell(`<div class="pageHeader customerSimpleHeader"><div><span class="eyebrow">HISTORICAL RECORD</span><h1>Archive</h1><p>Cancelled quotations move here automatically after 30 days and remain available for historical reference.</p></div><button class="button light" data-go="portal/requests">← Orders & Requests</button></div><div class="orderCardGrid compact">${archived.map(r=>customerOrderCard(r)).join('')||'<div class="emptyState"><h3>Archive is empty</h3></div>'}</div>`);
  }

  function stockPage(){
    return shell(`<div class="pageHeader"><div><span class="eyebrow">READINESS REGISTER</span><h1>Stock & expiry</h1><p>Record usable on-hand quantity and actual expiry dates. The portal flags candidates for review; it never auto-orders medicines or clinical consumables.</p></div><button class="button dark" data-stock-save>Save demo counts</button></div><section class="panel"><div class="tableWrap"><table class="dataTable"><thead><tr><th>ITEM</th><th>ON HAND</th><th>REORDER REVIEW AT</th><th>EXPIRY</th><th>READINESS</th></tr></thead><tbody>${state.stock.map((x,i)=>`<tr><td><b>${esc(x.item)}</b><div class="sub mono">${x.sku}</div></td><td><div class="stockEdit"><input type="number" value="${x.onHand}" data-stock-count="${i}"><span>units/packs</span></div></td><td>${x.reorderAt}</td><td><div class="stockEdit"><input style="width:100px" value="${esc(x.expiry)}" data-stock-expiry="${i}"></div></td><td>${statusPill(x.status)}</td></tr>`).join('')}</tbody></table></div></section><div class="notice" style="margin-top:16px"><strong>Planning logic only.</strong> Replenishment should be approved against actual counts, lead time, school calendar, expiry and clinical need. A stock sheet is not a purchase order.</div>`);
  }

  function assetsPage(){
    return shell(`<div class="pageHeader"><div><span class="eyebrow">EQUIPMENT RECORD</span><h1>Clinic assets</h1><p>Serials, warranty dates and service prompts stay tied to the campus. Technical service intervals should come from manufacturer or qualified provider evidence.</p></div></div><div class="threeCol">${D.demoAssets.map(a=>`<article class="assetCard"><div class="assetIcon">⚙</div>${statusPill(a.status)}<h3 style="margin-top:10px">${esc(a.asset)}</h3><div class="serial">${esc(a.serial)} · ${esc(a.pscSku)}</div><div class="assetDetails"><div><span>CAMPUS</span><b>${esc(a.campus)}</b></div><div><span>WARRANTY END</span><b>${esc(a.warrantyEnd)}</b></div><div style="grid-column:1/3"><span>NEXT ACTION</span><b>${esc(a.nextService)}</b></div></div></article>`).join('')}</div>`);
  }

  function isFamilyLine(l){ return !!(l&&l.familyId); }
  function lineKey(l){
    if(isFamilyLine(l)){
      const mode=l.brandPreferenceMode||'no_preference';
      const choice=mode==='specific_option'?(l.productOptionId||''):mode==='other_brand'?String(l.requestedBrand||'').trim().toLowerCase():'no-preference';
      const safe=v=>encodeURIComponent(String(v||''));
      return `family:${safe(l.familyId)}:${safe(l.presentation||'')}:${mode}:${safe(choice)}`;
    }
    return l?.sku||'';
  }
  function lineDisplayName(l,p=null){ return isFamilyLine(l)?(l.familyName||l.familyId||'Catalogue family'):(p?.catalogueDisplayName||p?.name||l?.sku||'Order item'); }
  function lineReference(l){ return isFamilyLine(l)?l.familyId:(l?.sku||''); }
  function linePackLabel(l,p=null){
    if(isFamilyLine(l)) return l.productOptionSnapshot?.pack||l.presentation||l.orderPackBasis||'Pack / scope to confirm';
    return p?.cataloguePack||p?.pack||'Pack to confirm';
  }
  function lineBrandPreferenceLabel(l){
    if(!isFamilyLine(l)) return '';
    if(l.brandPreferenceMode==='specific_option') return l.productOptionSnapshot?.exact_product_name||l.requestedBrand||'Specific approved option';
    if(l.brandPreferenceMode==='other_brand') return l.requestedBrand?`Requested: ${l.requestedBrand}`:'Other brand required';
    return 'No brand preference';
  }
  function lineIsRegulated(l,p=null){ return !!p?.regulated || !!l?.regulated || (isFamilyLine(l)&&String(l.familyPageType||'').toUpperCase()==='MEDICINE FAMILY'); }
  function normalizeFamilyRequestLine(detail){
    const option=detail?.productOption||null;
    const mode=detail?.brandPreferenceMode||'no_preference';
    return {
      type:'family',
      familyId:String(detail?.familyId||'').trim(),
      familyName:String(detail?.familyName||detail?.familyId||'').trim(),
      familyPageType:String(detail?.familyPageType||'').trim(),
      presentation:String(detail?.presentation||'').trim(),
      orderPackBasis:String(detail?.orderPackBasis||'').trim(),
      brandPreferenceMode:mode,
      requestedBrand:mode==='other_brand'?String(detail?.requestedBrand||'').trim():(mode==='specific_option'?String(option?.brand||'').trim():''),
      productOptionId:mode==='specific_option'?String(option?.product_option_id||'').trim():'',
      productOptionSnapshot:mode==='specific_option'&&option?{
        product_option_id:option.product_option_id,
        exact_product_name:option.exact_product_name,
        brand:option.brand,
        presentation:option.presentation,
        pack:option.pack
      }:null,
      regulated:!!detail?.regulated,
      qty:Math.max(1,Number(detail?.qty||1))
    };
  }
  function addFamilyBasketLine(detail){
    const line=normalizeFamilyRequestLine(detail);
    if(!line.familyId||!line.familyName) return false;
    if(line.brandPreferenceMode==='specific_option' && !line.productOptionId) return false;
    if(line.brandPreferenceMode==='other_brand' && !line.requestedBrand) return false;
    const key=lineKey(line);
    const existing=state.basket.find(x=>lineKey(x)===key);
    if(existing) existing.qty+=line.qty;
    else state.basket.push(line);
    save();
    renderUi({preserveScroll:true,transition:false});
    toast(`<strong>${esc(line.familyName)}</strong> added to Supply Request`);
    return true;
  }
  window.addEventListener('psc:add-family-line',e=>{ try{ addFamilyBasketLine(e.detail||{}); }catch(err){ console.error('Family request add failed',err); } });

  function basketQty(){ return state.basket.reduce((a,b)=>a+Number(b.qty||0),0); }
  function addBasket(sku,qty=1){ const f=state.basket.find(x=>x.sku===sku); if(f)f.qty+=qty; else state.basket.push({sku,qty}); save(); renderUi({preserveScroll:true,transition:false}); toast(`<strong>Added</strong> to Supply Request`); }
  function reorderRequest(id){
    const r=state.requests.find(x=>x.id===id); if(!r)return;
    r.lines.forEach(l=>{const key=lineKey(l);const f=state.basket.find(x=>lineKey(x)===key);if(f)f.qty+=l.qty;else state.basket.push(JSON.parse(JSON.stringify(l)))});
    save();render();toast(`<strong>${r.lines.length} lines</strong> added to Supply Request`);
  }
  function basketDrawer(){
    const lines=state.basket.map((l,index)=>({l,p:l.sku?product(l.sku):null,index})).filter(x=>x.p||isFamilyLine(x.l));
    const indicative=lines.reduce((sum,x)=>sum+((x.p?.contractPrice)||0)*x.l.qty,0);
    return `<div class="drawerBackdrop requestDrawerBackdrop" data-close-basket><aside class="drawer requestDrawer" onclick="event.stopPropagation()"><div class="drawerHandle" aria-hidden="true"></div><div class="drawerHeader"><div><span class="eyebrow">PHARMA SERVICE</span><h2>Supply Request</h2><small>${lines.length?`${lines.length} line${lines.length===1?'':'s'} · ${basketQty()} item${basketQty()===1?'':'s'}`:'Build a request while you browse'}</small></div><button class="iconBtn" data-close-basket aria-label="Close request">×</button></div><div class="drawerBody">${lines.length?lines.map(({l,p,index})=>{
      if(isFamilyLine(l)){
        return `<div class="basketLine requestLine"><div class="productGlyph small">Rx</div><div class="basketInfo"><b>${esc(lineDisplayName(l,p))}</b><span>${esc(linePackLabel(l,p))} · ${esc(lineReference(l))}</span><small>${esc(lineBrandPreferenceLabel(l))} · Price confirmed in quotation</small></div><div class="qty"><button data-family-basket-delta="${index}|-1" aria-label="Reduce quantity">−</button><span>${l.qty}</span><button data-family-basket-delta="${index}|1" aria-label="Increase quantity">+</button></div><button class="removeLink" data-family-basket-remove="${index}">Remove</button></div>`;
      }
      const imageUrl=productDisplayImageUrl(p);return `<div class="basketLine requestLine">${imageUrl?`<div class="requestLineImage"><img src="${esc(imageUrl)}" alt="" onerror="this.onerror=null;this.src='${esc(legacyProductImageUrl(p))}'"></div>`:`<div class="productGlyph small">${esc((p.brand||'PS').slice(0,2).toUpperCase())}</div>`}<div class="basketInfo"><b>${esc(p.catalogueDisplayName||p.name)}</b><span>${esc(p.cataloguePack||p.pack||'Pack to confirm')} · ${p.pscSku}</span><small>${p.contractPrice?money(p.contractPrice)+' indicative account price':'Price confirmed in quotation'}</small></div><div class="qty"><button data-basket-delta="${p.pscSku}|-1" aria-label="Reduce quantity">−</button><span>${l.qty}</span><button data-basket-delta="${p.pscSku}|1" aria-label="Increase quantity">+</button></div><button class="removeLink" data-basket-remove="${p.pscSku}">Remove</button></div>`
    }).join(''):`<div class="emptyState requestEmpty"><h3>Your request is empty</h3><p>Browse the catalogue and add the products you want PSC to quote.</p><button class="button dark" data-go="portal/catalogue">Browse catalogue</button></div>`}</div>${lines.length?`<div class="drawerFooter requestDrawerFooter"><label class="fieldLabel">Request note <span>optional</span></label><textarea class="textarea" id="basketNote" placeholder="Delivery timing, preferred brand, clinic note…"></textarea><div class="totals"><span>Indicative priced lines</span><b>${money(indicative)}</b></div><div class="checkoutPromise requestNextStep"><span>WHAT HAPPENS NEXT</span><p>PSC reviews the request and sends the formal quotation to <strong>${esc(accountEmailLabel())}</strong>. Nothing is procured until the required customer approval is in place.</p></div><button class="button primary full submitRequestButton" data-submit-request>Submit request</button></div>`:''}</aside></div>`;
  }


  function requestModal(id, admin=false){
    const r=state.requests.find(x=>x.id===id); if(!r)return '';
    const quote=calcQuote(r);
    const canApprove=r.status==='Sent' && quote.taxResolved && quote.hasSell;
    return `<div><div class="modalHeader"><div><span class="eyebrow">${admin?'PSC REQUEST CONTROL':'REQUEST / QUOTATION'}</span><h2 class="mono">${r.id}</h2><div class="smallMuted">${esc(r.groupName||state.groupName||'Institutional account')} · ${esc(r.campus)} · ${date(r.createdAt)}</div></div><button class="iconBtn" data-modal-close>×</button></div>
      ${admin?adminQuoteBuilder(r,quote):schoolQuote(r,quote,canApprove)}${orderDocumentsSection(r,admin)}</div>`;
  }

  function calcQuote(r){
    let subtotal=0,cost=0,vat=0,hasSell=true,costComplete=true,taxResolved=true;
    const rows=r.lines.map(l=>{const p=l.sku?product(l.sku):null;const key=lineKey(l);const q=(r.quote&&r.quote.lines&&r.quote.lines[key])||{};const sell=Number.isFinite(Number(q.sell))?Number(q.sell):(Number.isFinite(Number(p?.contractPrice))?Number(p.contractPrice):null);const c=Number.isFinite(Number(q.cost))?Number(q.cost):(Number.isFinite(Number(p?.supplierCost))?Number(p.supplierCost):null);const vr=q.vat===0||q.vat===5?Number(q.vat):null;if(sell===null)hasSell=false;else subtotal+=sell*l.qty;if(c===null)costComplete=false;else cost+=c*l.qty;if(vr===null){taxResolved=false}else if(sell!==null){vat += sell*l.qty*vr/100;}return {l,p,key,q,sell,cost:c,vatRate:vr};});
    const gp=hasSell&&costComplete?subtotal-cost:null;const gm=gp!==null&&subtotal>0?gp/subtotal*100:null;
    return {rows,subtotal,cost,vat,total:subtotal+vat,gp,gm,hasSell,costComplete,taxResolved};
  }

  function schoolQuote(r,q,canApprove){
    const delivery=['Authorized','Procurement','Delivery'].includes(r.status)?expectedDeliveryLabel(r):'';
    return `<div class="schoolQuoteBox"><div class="quoteCustomerTop"><div><span class="eyebrow">${r.quoteRef||'ORDER UNDER REVIEW'}</span><h3>${friendlyStatus(r.status)}</h3></div>${customerStatusPill(r.status)}</div>${r.status==='Drafting'?`<div class="quoteStatePanel"><b>PSC is reviewing this order.</b><p>Your formal quotation will be sent to ${esc(accountEmailLabel())}.</p></div>`:''}${r.quoteRef?`<div class="tableWrap"><table class="dataTable"><thead><tr><th>ITEM</th><th>PACK</th><th>QTY</th><th>UNIT EX VAT</th><th>LINE EX VAT</th><th>VAT</th></tr></thead><tbody>${q.rows.map(x=>`<tr><td><b>${esc(lineDisplayName(x.l,x.p))}</b><div class="sub mono">${esc(lineReference(x.l))}</div>${isFamilyLine(x.l)?`<div class="sub">${esc(lineBrandPreferenceLabel(x.l))}</div>`:''}</td><td>${esc(linePackLabel(x.l,x.p))}</td><td>${x.l.qty}</td><td>${x.sell!==null?money(x.sell):'Pending'}</td><td>${x.sell!==null?money(x.sell*x.l.qty):'Pending'}</td><td>${x.vatRate===null?'Review':x.vatRate+'%'}</td></tr>`).join('')}</tbody></table></div><div class="quoteSummary"><div><span>SUBTOTAL EX VAT</span><b>${q.hasSell?money(q.subtotal):'Pending'}</b></div><div><span>VAT</span><b>${q.taxResolved?money(q.vat):'Review'}</b></div><div><span>TOTAL</span><b>${q.hasSell&&q.taxResolved?money(q.total):'Pending'}</b></div><div><span>VALIDITY</span><b>${esc(r.quote?.validity||'Pending')}</b></div></div>`:''}${r.status==='Sent'?`<div class="modalQuoteActions"><button class="button primary" data-confirm-quote="${r.id}">Confirm quotation</button><button class="button quietDanger" data-cancel-quote="${r.id}">Cancel quotation</button></div>`:''}${delivery?`<div class="deliveryPromise large"><span>TRACK ORDER</span><b>${delivery}</b><small>Delivery timing is shown only when PSC has recorded it for this order.</small></div>`:''}${r.status==='Accepted'?`<div class="quoteStatePanel delivered"><b>Delivered.</b><p>This order is now part of your purchase history and its items can be repeated from Replenish.</p></div>`:''}${r.status==='Cancelled'?`<div class="quoteStatePanel cancelled"><b>Cancelled.</b><p>${isArchived(r)?'This quotation is now in Archive.':`It will move to Archive on ${addDaysLabel(r.cancelledAt||r.createdAt,30)}.`}</p></div>`:''}</div>`;
  }

  function adminQuoteBuilder(r,q){
    const target=20;
    return `<div class="notice"><strong>Quote builder.</strong> Supplier cost and tax must be supported by current evidence before live issue. Values labelled “Demo planning assumption” are not supplier quotations.</div><div class="tableWrap"><table class="dataTable"><thead><tr><th>ITEM</th><th>QTY</th><th>DIRECT COST / UNIT</th><th>SELL / UNIT</th><th>VAT</th><th>LINE GM</th></tr></thead><tbody>${q.rows.map(x=>{const gm=x.sell!==null&&x.cost!==null&&x.sell>0?((x.sell-x.cost)/x.sell*100):null;return `<tr><td><b>${esc(lineDisplayName(x.l,x.p))}</b><div class="sub mono">${esc(lineReference(x.l))}</div>${isFamilyLine(x.l)?`<div class="sub">${esc(lineBrandPreferenceLabel(x.l))}</div>`:''}${x.q.costEvidence?`<div class="quoteLineWarning">${esc(x.q.costEvidence)}</div>`:''}</td><td>${x.l.qty}</td><td><input class="moneyInput" type="number" step="0.01" value="${x.cost===null?'':x.cost}" data-quote-field="${r.id}|${x.key}|cost"></td><td><input class="moneyInput" type="number" step="0.01" value="${x.sell===null?'':x.sell}" data-quote-field="${r.id}|${x.key}|sell"></td><td><select class="selectInput" data-quote-field="${r.id}|${x.key}|vat"><option value="" ${x.vatRate===null?'selected':''}>Review</option><option value="0" ${x.vatRate===0?'selected':''}>0%</option><option value="5" ${x.vatRate===5?'selected':''}>5%</option></select></td><td>${gm===null?'—':`<b class="${gm<target?'dangerText':'successText'}">${gm.toFixed(1)}%</b>`}</td></tr>`}).join('')}</tbody></table></div><div class="quoteSummary"><div><span>DIRECT COST</span><b>${q.costComplete?money(q.cost):'Incomplete'}</b></div><div><span>SELL EX VAT</span><b>${q.hasSell?money(q.subtotal):'Incomplete'}</b></div><div><span>GROSS PROFIT</span><b>${q.gp===null?'Blocked':money(q.gp)}</b></div><div><span>TRUE GM</span><b class="${q.gm!==null&&q.gm<target?'dangerText':''}">${q.gm===null?'Blocked':q.gm.toFixed(1)+'%'}</b></div></div><div class="twoCol"><div><label class="fieldLabel">Delivery</label><input class="input" style="width:100%" value="${esc(r.quote?.delivery||'')}" data-quote-meta="${r.id}|delivery"><label class="fieldLabel" style="margin-top:10px">Terms</label><input class="input" style="width:100%" value="${esc(r.quote?.terms||'')}" data-quote-meta="${r.id}|terms"></div><div><label class="fieldLabel">Quotation status</label><select class="input" style="width:100%" data-request-status="${r.id}">${workflow.map(s=>`<option ${r.status===s?'selected':''}>${s}</option>`).join('')}</select><label class="fieldLabel" style="margin-top:10px">Quotation reference</label><input class="input" style="width:100%" value="${esc(r.quoteRef||'')}" data-quote-ref="${r.id}" placeholder="PSC-Q-YYYY-####"></div></div><div class="gateList" style="margin-top:16px"><div class="gate ${q.costComplete?'ok':'block'}"><span>All direct costs present</span><i></i></div><div class="gate ${q.taxResolved?'ok':'block'}"><span>VAT reviewed by line</span><i></i></div><div class="gate ${q.gm!==null&&q.gm>=20?'ok':'warn'}"><span>Target GM ≥ 20%</span><i></i></div><div class="gate warn"><span>Supplier stock / lead time requires current confirmation</span><i></i></div><div class="gate ${q.rows.some(x=>lineIsRegulated(x.l,x.p))?'warn':'ok'}"><span>Regulated route check</span><i></i></div><div class="gate block"><span>Funding / customer PO evidence not integrated in prototype</span><i></i></div></div>`;
  }

  function adminDashboard(){
    const open=state.requests.filter(r=>!['Accepted','Cancelled'].includes(r.status)).length;
    const activeQuotes=state.requests.filter(r=>['Sent','Authorized','Procurement','Delivery'].includes(r.status));
    const qvals=activeQuotes.map(calcQuote);const quoted=qvals.reduce((s,q)=>s+(q.hasSell?q.subtotal:0),0);const gp=qvals.reduce((s,q)=>s+(q.gp||0),0);const gm=quoted?gp/quoted*100:0;
    return shell(`<div class="pageHeader"><div><span class="eyebrow">PSC DEAL DESK</span><h1>Institutional supply control</h1><p>One desk for requests, quote economics, supplier evidence, release gates and fulfilment. Demo figures are illustrative unless backed by an identified evidence source.</p></div></div><div class="adminStatRow"><div class="adminStat"><span>OPEN REQUESTS</span><b>${open}</b></div><div class="adminStat"><span>QUOTED EX VAT</span><b>${money(quoted)}</b></div><div class="adminStat"><span>AUTHORIZED</span><b>${state.requests.filter(r=>r.status==='Authorized').length}</b></div><div class="adminStat"><span>EST. TRUE GP</span><b>${money(gp)}</b></div><div class="adminStat"><span>EST. GM</span><b>${gm.toFixed(1)}%</b></div><div class="adminStat"><span>PRODUCT MASTER</span><b>${cms.products.filter(p=>p.active).length||D.products.length}</b></div></div><div class="actionGrid"><button class="actionCard" data-go="admin/requests"><div class="actionIcon">${icon('checklist')}</div><div><b>Request queue</b><span>Convert needs into controlled quotes</span></div></button><button class="actionCard" data-go="admin/mail"><div class="actionIcon">${icon('mail')}</div><div><b>Mail Desk</b><span>Workshop + account outreach from info@pharmaservice.ae</span></div></button><button class="actionCard" data-go="admin/storefront"><div class="actionIcon">${icon('edit')}</div><div><b>Storefront manager</b><span>Institutional + wholesale publishing</span></div></button><button class="actionCard" data-go="admin/products"><div class="actionIcon">${icon('boxes')}</div><div><b>Product master</b><span>Product, media and commercial control</span></div></button><button class="actionCard" data-go="admin/family-options"><div class="actionIcon">${icon('checklist')}</div><div><b>Family options</b><span>Approve, hold or reject supplier candidates</span></div></button><button class="actionCard" data-go="admin/fulfilment"><div class="actionIcon">${icon('repeat')}</div><div><b>Fulfilment rules</b><span>Route by site and source</span></div></button><button class="actionCard" data-go="admin/supplier-feed"><div class="actionIcon">${icon('reports')}</div><div><b>Supplier feed</b><span>Acorus / Med7 data ingestion</span></div></button></div><div class="twoCol"><section class="panel"><div class="panelHeader"><h2>Requests needing attention</h2><button data-go="admin/requests">Open queue →</button></div><div class="tableWrap"><table class="dataTable"><thead><tr><th>REQUEST</th><th>ACCOUNT / SITE</th><th>LINES</th><th>STATUS</th><th>NEXT ACTION</th></tr></thead><tbody>${state.requests.filter(r=>r.status!=='Accepted').map(r=>`<tr class="clickable" data-admin-request="${r.id}"><td><b class="mono">${r.id}</b></td><td>${esc(r.groupName||state.groupName||'Institutional account')}<div class="sub">${esc(r.campus)}</div></td><td>${r.lines.length}</td><td>${statusPill(r.status)}</td><td>${r.status==='Drafting'?'Validate stock + price':r.status==='Sent'?'Resolve school decision':'Check procurement release'}</td></tr>`).join('')}</tbody></table></div></section><div style="display:grid;gap:14px"><div class="marginBox"><h3>Deal economics · active quoted demo</h3><div class="marginGrid"><div><span>DIRECT COST</span><b>${money(qvals.reduce((s,q)=>s+(q.costComplete?q.cost:0),0))}</b></div><div><span>SELL</span><b>${money(quoted)}</b></div><div><span>TRUE GM</span><b>${gm.toFixed(1)}%</b></div><div><span>FOC</span><b>AED 0</b></div><div><span>DELIVERY</span><b>Per quote</b></div><div><span>TARGET</span><b>20%</b></div></div></div><section class="panel"><div class="panelHeader"><h2>Release gate</h2></div><div class="gateList"><div class="gate ok"><span>Exact specification mapped</span><i></i></div><div class="gate warn"><span>Supplier stock current</span><i></i></div><div class="gate warn"><span>VAT / tax evidence by line</span><i></i></div><div class="gate ok"><span>Margin incl. direct costs</span><i></i></div><div class="gate block"><span>Customer funding / PO</span><i></i></div><div class="gate warn"><span>Regulated route validated</span><i></i></div></div></section></div></div><div class="notice" style="margin-top:18px"><strong>Control:</strong> a supplier PO is not released merely because a customer approved a quote. Funding, current supplier evidence, tax treatment, regulated route and delivery must pass the release gate.</div>`,true);
  }

  function adminStorefront(){
    if(!cms.loaded){
      return shell(`<div class="pageHeader"><div><span class="eyebrow">STOREFRONT</span><h1>Storefront manager</h1><p>Loading the controlled product master and publishing state…</p></div></div><section class="panel"><div class="emptyState"><h3>Loading storefront data</h3><p>The first admin load may also initialise the current institutional catalogue in Supabase.</p></div></section>`,true);
    }
    const channel=ui.cmsChannel;
    const sf=storefrontConfig(channel)||{};
    const channelSettings=cms.settings.filter(x=>x.channel===channel);
    const published=channelSettings.filter(x=>x.status==='published'&&x.visible).length;
    const drafts=channelSettings.filter(x=>x.status==='draft').length;
    const featured=channelSettings.filter(x=>x.featured&&x.status==='published'&&x.visible).length;
    const preview=(cms.publicRows[channel]||[]).slice(0,8);

    return shell(`
      <div class="pageHeader cmsPageHeader">
        <div><span class="eyebrow">PSC STOREFRONT CONTROL</span><h1>Storefront manager</h1><p>One controlled product master, two customer-facing presentations. Institutional and wholesale can use different copy, categories, visibility and commercial display without duplicating the SKU.</p></div>
        <button class="button light" data-go="${channel==='institutional'?'portal/catalogue':'wholesale'}">${channel==='institutional'?'Open institutional catalogue':'Open wholesale storefront'} →</button>
      </div>

      <div class="cmsChannelTabs">
        <button class="${channel==='institutional'?'active':''}" data-cms-channel="institutional">Institutional</button>
        <button class="${channel==='wholesale'?'active':''}" data-cms-channel="wholesale">Wholesale</button>
      </div>

      <div class="cmsStorefrontGrid">
        <section class="panel cmsStorefrontForm">
          <div class="panelHeader"><div><span class="eyebrow">${channel.toUpperCase()}</span><h2>${esc(sf.display_name||channel)}</h2></div></div>
          <label class="fieldLabel">Headline</label>
          <input class="input" id="cmsStorefrontHeadline" value="${esc(sf.headline||'')}">
          <label class="fieldLabel">Supporting copy</label>
          <textarea class="textarea cmsTextareaSmall" id="cmsStorefrontSubheadline">${esc(sf.subheadline||'')}</textarea>
          <label class="cmsToggleRow"><input type="checkbox" id="cmsStorefrontActive" ${sf.active!==false?'checked':''}><span><b>Storefront active</b><small>Turn the entire channel on or off.</small></span></label>
          <div class="cmsFormActions"><button class="button primary" data-save-storefront="${channel}">Save storefront</button></div>
        </section>

        <section class="cmsMetricStack">
          <div class="cmsMetric"><span>PUBLISHED</span><b>${published}</b><small>visible products</small></div>
          <div class="cmsMetric"><span>DRAFT</span><b>${drafts}</b><small>products awaiting publish</small></div>
          <div class="cmsMetric"><span>FEATURED</span><b>${featured}</b><small>published featured lines</small></div>
          <div class="cmsMetric"><span>MASTER</span><b>${cms.products.filter(p=>p.active).length}</b><small>active controlled products</small></div>
        </section>
      </div>

      <section class="panel cmsPreviewPanel">
        <div class="panelHeader"><div><span class="eyebrow">LIVE PREVIEW</span><h2>${esc(sf.display_name||'Storefront')}</h2></div><button data-go="admin/products">Manage products →</button></div>
        ${preview.length?`<div class="cmsPreviewGrid">${preview.map(r=>`<article><div class="cmsPreviewImage">${controlledProductImageUrl(r)?`<img src="${esc(controlledProductImageUrl(r))}" alt="">`:'<span>NO IMAGE</span>'}</div><small>${esc(r.brand||r.category||'')}</small><b>${esc(r.name)}</b><p>${esc(r.short_description||r.pack||'')}</p></article>`).join('')}</div>`:`<div class="emptyState"><h3>No published products yet</h3><p>${channel==='wholesale'?'Open Product Master, switch to Wholesale and publish the lines you want trade customers to see.':'The institutional catalogue will appear here after the current master is initialised.'}</p></div>`}
      </section>
    `,true);
  }

  function adminProducts(){
    if(!cms.loaded){
      return shell(`<div class="pageHeader"><div><span class="eyebrow">CONTROLLED PRODUCT MASTER</span><h1>Product master</h1><p>Loading the database-backed catalogue…</p></div></div><section class="panel"><div class="emptyState"><h3>Preparing the master</h3><p>PSC is moving the live catalogue from static code into the controlled database.</p></div></section>`,true);
    }
    const q=(ui.cmsSearch||'').toLowerCase().trim();
    const activeMaster=cms.products.filter(p=>p.active);
    const rows=activeMaster.filter(p=>`${p.psc_sku} ${p.name||''} ${p.brand||''} ${p.category||''} ${p.supplier_name||''}`.toLowerCase().includes(q));
    return shell(`
      <div class="pageHeader cmsPageHeader">
        <div><span class="eyebrow">CONTROLLED PRODUCT MASTER</span><h1>Products & media</h1><p>Edit the controlled SKU once, then publish a separate Institutional or Wholesale presentation. Supplier, cost, evidence and internal notes remain restricted to PSC admin.</p></div>
        <button class="button light" data-go="admin/storefront">Storefront manager →</button>
      </div>

      <div class="filterBar cmsMasterFilter"><div class="searchInput"><span>⌕</span><input data-cms-search value="${esc(ui.cmsSearch)}" placeholder="Search product, PSC SKU, brand, supplier or category…"></div><div class="cmsMasterCount">${rows.length} / ${activeMaster.length}</div></div>

      <section class="panel cmsProductMasterPanel">
        <div class="tableWrap"><table class="dataTable cmsMasterTable">
          <thead><tr><th>PRODUCT</th><th>SUPPLY</th><th>INSTITUTIONAL</th><th>WHOLESALE</th><th>MEDIA</th><th></th></tr></thead>
          <tbody>${rows.map(p=>{
            const i=cmsSetting(p.id,'institutional'),w=cmsSetting(p.id,'wholesale'),media=cmsProductMedia(p.id);
            return `<tr>
              <td><div class="cmsMasterProduct"><div class="cmsMasterThumb">${controlledProductImageUrl(p)?`<img src="${esc(controlledProductImageUrl(p))}" alt="">`:'<span>—</span>'}</div><div><b>${esc(p.name)}</b><small>${esc(p.psc_sku)}${p.brand?` · ${esc(p.brand)}`:''}</small><em>${esc(p.category||p.product_type||'Uncategorised')}</em></div></div></td>
              <td><b>${esc(p.supplier_name||'Not set')}</b><small>${p.buy_cost!==null?`Buy ${money(p.buy_cost)}`:'Buy cost missing'}${p.stock_status?` · ${esc(p.stock_status)}`:''}</small></td>
              <td><span class="cmsState ${i?.status==='published'&&i?.visible?'live':'draft'}">${esc(cmsStatusText(p.id,'institutional'))}</span><small>${esc(i?.category||p.category||'')}</small></td>
              <td><span class="cmsState ${w?.status==='published'&&w?.visible?'live':'draft'}">${esc(cmsStatusText(p.id,'wholesale'))}</span><small>${esc(w?.category||p.category||'')}</small></td>
              <td>${media.length}<small>${media.some(x=>x.is_primary)?'Primary set':'No primary'}</small></td>
              <td><button class="button light" data-go="admin/products/${p.id}">Edit</button></td>
            </tr>`;
          }).join('')}</tbody>
        </table></div>
      </section>
    `,true);
  }

  function adminProductEditor(productId){
    const p=cmsProduct(productId);
    if(!p) return shell(`<div class="pageHeader"><div><span class="eyebrow">PRODUCT MASTER</span><h1>Product not found</h1></div></div>`,true);
    const channel=ui.cmsChannel;
    const s=cmsSetting(productId,channel)||{};
    const d=s.draft_data||{};
    const cv=(key,fallback)=>d[key]!==undefined?d[key]:fallback;
    const selectedNeeds=Array.isArray(cv('clinical_needs',p.clinical_needs))?cv('clinical_needs',p.clinical_needs):[];
    const media=cmsProductMedia(productId);
    const previewPrice=cv('display_price',s.display_price);
    const gm=(p.landed_cost!==null && previewPrice!==null && Number(previewPrice)>0)
      ? ((Number(previewPrice)-Number(p.landed_cost))/Number(previewPrice)*100)
      : null;

    return shell(`
      <div class="pageHeader cmsPageHeader">
        <div><button class="cmsBack" data-go="admin/products">← Product master</button><span class="eyebrow">${esc(p.psc_sku)}</span><h1>${esc(p.name)}</h1><p>Core product information is shared. Storefront presentation is channel-specific.</p></div>
        <div class="cmsEditorStatus"><span>${p.active?'ACTIVE':'INACTIVE'}</span><b>${media.length} image${media.length===1?'':'s'}</b></div>
      </div>

      <div class="cmsChannelTabs">
        <button class="${channel==='institutional'?'active':''}" data-cms-channel="institutional">Institutional storefront</button>
        <button class="${channel==='wholesale'?'active':''}" data-cms-channel="wholesale">Wholesale storefront</button>
      </div>

      <div class="cmsEditorLayout">
        <div class="cmsEditorMain">
          <section class="panel cmsFormSection">
            <div class="panelHeader"><div><span class="eyebrow">PRODUCT MASTER</span><h2>Core product</h2></div></div>
            <div class="cmsFieldGrid">
              <label><span>Product name</span><input class="input" id="cmsName" value="${esc(p.name||'')}"></label>
              <label><span>Brand</span><input class="input" id="cmsBrand" value="${esc(p.brand||'')}" placeholder="Brand / manufacturer"></label>
              <label><span>Pack / unit</span><input class="input" id="cmsPack" value="${esc(p.pack||'')}"></label>
              <label><span>Master category</span><input class="input" id="cmsMasterCategory" value="${esc(p.category||'')}"></label>
              <label><span>Product type</span><input class="input" id="cmsProductType" value="${esc(p.product_type||'')}"></label>
              <div class="wide cmsClinicalNeeds"><span>Clinical navigation (institutional)</span><div class="cmsNeedOptions">${INSTITUTIONAL_CATALOGUE_TEMPLATE.categories.filter(c=>c.id!=='all').map(c=>`<label><input type="checkbox" data-cms-need value="${c.id}" ${selectedNeeds.includes(c.id)?'checked':''}><b>${esc(c.label)}</b></label>`).join('')}</div></div>
              <label class="cmsCheckboxLabel"><input type="checkbox" id="cmsActive" ${p.active?'checked':''}><span>Active product</span></label>
              <label class="wide"><span>Commercial specification</span><textarea class="textarea" id="cmsSpec">${esc(p.commercial_specification||'')}</textarea></label>
            </div>
          </section>

          <section class="panel cmsFormSection">
            <div class="panelHeader"><div><span class="eyebrow">INTERNAL ONLY</span><h2>Supply & commercial evidence</h2></div><span class="cmsPrivateLabel">PSC ADMIN</span></div>
            <div class="cmsFieldGrid">
              <label><span>Supplier</span><input class="input" id="cmsSupplier" value="${esc(p.supplier_name||'')}"></label>
              <label><span>Supplier SKU</span><input class="input" id="cmsSupplierSku" value="${esc(p.supplier_sku||'')}"></label>
              <label><span>Buy cost</span><input class="input" id="cmsBuyCost" type="number" step="0.01" value="${p.buy_cost??''}"></label>
              <label><span>Landed cost</span><input class="input" id="cmsLandedCost" type="number" step="0.01" value="${p.landed_cost??''}"></label>
              <label><span>VAT status</span><input class="input" id="cmsVat" value="${esc(p.vat_status||'')}"></label>
              <label><span>Stock status</span><input class="input" id="cmsStock" value="${esc(p.stock_status||'')}"></label>
              <label><span>Lead time</span><input class="input" id="cmsLead" value="${esc(p.lead_time||'')}"></label>
              <label><span>Evidence status</span><input class="input" id="cmsEvidence" value="${esc(p.evidence_status||'')}"></label>
              <label class="wide"><span>Internal notes</span><textarea class="textarea" id="cmsInternalNotes">${esc(p.internal_notes||'')}</textarea></label>
            </div>
          </section>

          <section class="panel cmsFormSection">
            <div class="panelHeader"><div><span class="eyebrow">${channel.toUpperCase()}</span><h2>Storefront presentation${s.draft_data?' · Unpublished changes':''}</h2></div><span class="cmsState ${s.status==='published'&&s.visible?'live':'draft'}">${esc(cmsStatusText(productId,channel))}</span></div>
            <div class="cmsFieldGrid">
              <label><span>Display name</span><input class="input" id="cmsDisplayName" value="${esc(cv('display_name',s.display_name)||'')}" placeholder="${esc(p.name)}"></label>
              <label><span>Storefront category</span><input class="input" id="cmsChannelCategory" value="${esc(cv('category',s.category)||p.category||'')}"></label>
              <label><span>Pack label</span><input class="input" id="cmsPackLabel" value="${esc(cv('pack_label',s.pack_label)||'')}" placeholder="${esc(p.pack||'')}"></label>
              <label><span>Display order</span><input class="input" id="cmsOrder" type="number" value="${cv('display_order',s.display_order)??1000}"></label>
              <label><span>Price display</span><select class="input" id="cmsPriceMode"><option value="request_quote" ${cv('price_display_mode',s.price_display_mode)==='request_quote'?'selected':''}>Request quote</option><option value="show_price" ${cv('price_display_mode',s.price_display_mode)==='show_price'?'selected':''}>Show price</option><option value="contact" ${cv('price_display_mode',s.price_display_mode)==='contact'?'selected':''}>Contact PSC</option></select></label>
              <label><span>Display price</span><input class="input" id="cmsDisplayPrice" type="number" step="0.01" value="${cv('display_price',s.display_price)??''}"></label>
              <label><span>MOQ</span><input class="input" id="cmsMoq" type="number" step="1" value="${cv('moq',s.moq)??''}"></label>
              <div class="cmsToggleGroup">
                <label class="cmsToggleRow"><input type="checkbox" id="cmsVisible" ${cv('visible',s.visible)!==false?'checked':''}><span><b>Visible</b><small>Show when published</small></span></label>
                <label class="cmsToggleRow"><input type="checkbox" id="cmsFeatured" ${cv('featured',s.featured)?'checked':''}><span><b>Featured</b><small>Prioritise in merchandising</small></span></label>
              </div>
              <label class="wide"><span>Short description</span><textarea class="textarea cmsTextareaSmall" id="cmsShort">${esc(cv('short_description',s.short_description)||p.short_description||'')}</textarea></label>
              <label class="wide"><span>Long description</span><textarea class="textarea" id="cmsLong">${esc(cv('long_description',s.long_description)||p.long_description||'')}</textarea></label>
            </div>
            ${gm!==null?`<div class="cmsMarginPreview"><span>CHANNEL GM USING DISPLAY PRICE / LANDED COST</span><b class="${gm<20?'dangerText':'successText'}">${gm.toFixed(1)}%</b><small>Planning indicator only. Release still requires current direct-cost evidence.</small></div>`:''}
          </section>
        </div>

        <aside class="cmsEditorSide">
          <section class="panel cmsMediaPanel">
            <div class="panelHeader"><div><span class="eyebrow">MEDIA</span><h2>Product images</h2></div></div>
            <label class="cmsUploadDrop"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" data-cms-image-upload="${p.id}"><b>Upload image</b><small>JPG, PNG, WebP or GIF · max 10 MB · publish to go live</small></label>
            <div class="cmsMediaGrid">${media.length?media.map(m=>`<article class="${m.is_primary?'primary':''}"><img src="${esc(m.public_url)}" alt="${esc(m.alt_text||'Product image')}"><div><span>${m.is_primary?'PRIMARY':'GALLERY'}</span><div><button data-cms-primary="${p.id}|${m.id}">Set primary</button><button class="danger" data-cms-delete-media="${p.id}|${m.id}">Remove</button></div></div></article>`).join(''):'<div class="cmsNoMedia">No uploaded media yet.</div>'}</div>
          </section>

          <section class="panel cmsPublishPanel">
            <span class="eyebrow">PUBLISH</span>
            <h2>${channel==='institutional'?'Institutional':'Wholesale'} storefront</h2>
            <p>Save Draft preserves the currently published channel. Publish applies this channel's presentation and approved images to the customer storefront.</p>
            <button class="button light full" data-cms-save="${p.id}">Save draft</button>
            <button class="button primary full" data-cms-publish="${p.id}">Publish to ${channel}</button>
            <button class="textAction" data-go="${channel==='institutional'?'portal/catalogue':'wholesale'}">Open storefront preview →</button>
          </section>
        </aside>
      </div>
    `,true);
  }

  function adminFamilyOptions(){
    if(!optionDesk.loaded){
      if(!optionDesk.loading) setTimeout(loadAdminFamilyOptions,0);
      return shell(`<div class="pageHeader"><div><span class="eyebrow">FAMILY + SUPPLIER CONTROL</span><h1>Supplier option review</h1><p>Loading the controlled Acorus candidate workbench…</p></div></div><section class="panel"><div class="emptyState"><h3>Preparing 719 source-list candidates</h3><p>No candidate becomes customer-selectable until PSC explicitly approves it and records current verification evidence.</p></div></section>`,true);
    }
    const options=optionDesk.options;
    const approved=options.filter(o=>o.psc_decision==='APPROVE').length;
    const selectable=options.filter(o=>o.customer_selectable).length;
    const verified=options.filter(optionEvidenceReady).length;
    const liveFixed=options.filter(optionFixedPriceLive).length;
    const familyGroups=optionFamiliesWithCandidates();
    const selectedId=ui.optionFamily==='all'?'':ui.optionFamily;
    const selectedFamily=selectedId?optionFamilyMeta(selectedId):null;
    const selectedOptions=selectedId?options.filter(o=>o.family_id===selectedId && (ui.optionDecision==='All'||o.psc_decision===ui.optionDecision) && (!(ui.optionSearch||'').trim()||optionSearchText(o).includes((ui.optionSearch||'').trim().toLowerCase()))):[];
    const familyRows=familyGroups.map(g=>{
      const a=g.options.filter(o=>o.psc_decision==='APPROVE').length;
      const c=g.options.filter(o=>o.customer_selectable).length;
      const v=g.options.filter(optionEvidenceReady).length;
      return `<tr><td><b>${esc(g.family.family_name)}</b><div class="sub mono">${esc(g.family.family_id)}</div></td><td>${esc(g.family.clinical_need||'')}</td><td><b>${g.options.length}</b><div class="sub">${v} verified</div></td><td>${a} approved<div class="sub">${c} customer-selectable</div></td><td><button class="button light" data-option-family-open="${esc(g.family.family_id)}">Review</button></td></tr>`;
    }).join('');
    return shell(`
      <div class="pageHeader familyOptionPageHeader"><div><span class="eyebrow">FAMILY + SUPPLIER CONTROL</span><h1>Supplier option review</h1><p>The Acorus source list is a candidate universe, not a live catalogue. PSC explicitly decides fit, records commercial evidence and controls what may become customer-selectable.</p></div>${selectedFamily?`<button class="button light" data-option-family-open="all">← All families</button>`:''}</div>
      <div class="adminStatRow familyOptionStats"><div class="adminStat"><span>CANDIDATES</span><b>${options.length}</b></div><div class="adminStat"><span>FAMILIES</span><b>${new Set(options.map(o=>o.family_id)).size}</b></div><div class="adminStat"><span>VERIFIED</span><b>${verified}</b></div><div class="adminStat"><span>APPROVED</span><b>${approved}</b></div><div class="adminStat"><span>CUSTOMER SELECTABLE</span><b>${selectable}</b></div><div class="adminStat"><span>LIVE FIXED PRICES</span><b>${liveFixed}</b></div></div>
      <div class="notice familyOptionGuard"><strong>Release rule:</strong> APPROVE controls product identity. Fixed-price publication is a separate commercial release: verified acquisition cost + every direct-cost component, verified VAT, current price evidence and validity, plus the family must explicitly permit fixed pricing. Target GM defaults to 20%. Acorus MRP remains an internal retail benchmark only.</div>
      <div class="filterBar familyOptionFilter"><div class="searchInput"><span>${icon('search')}</span><input data-option-search value="${esc(ui.optionSearch)}" placeholder="Search family, brand, Acorus product, supplier or reference…"></div><select data-option-decision><option ${ui.optionDecision==='All'?'selected':''}>All</option><option ${ui.optionDecision==='VERIFY'?'selected':''}>VERIFY</option><option ${ui.optionDecision==='APPROVE'?'selected':''}>APPROVE</option><option ${ui.optionDecision==='HOLD'?'selected':''}>HOLD</option><option ${ui.optionDecision==='REJECT'?'selected':''}>REJECT</option></select></div>
      ${selectedFamily?`<section class="familyOptionFamilyIntro"><div><span class="eyebrow">${esc(selectedFamily.family_id)}</span><h2>${esc(selectedFamily.family_name)}</h2>${selectedFamily.common_brands_line?`<p><em>${esc(selectedFamily.common_brands_line)}</em></p>`:''}<p>${esc(selectedFamily.clinical_need||'')} · ${esc(selectedFamily.page_type||'Product family')}</p></div><div><b>${selectedOptions.length}</b><span>matching candidate${selectedOptions.length===1?'':'s'}</span></div></section><div class="familyOptionCards">${selectedOptions.length?selectedOptions.map(adminFamilyOptionCard).join(''):`<div class="emptyState"><h3>No candidates match this filter.</h3><p>Clear the search or decision filter to see this family's source-list candidates.</p></div>`}</div>`:`<section class="panel familyOptionFamilyTable"><div class="panelHeader"><div><h2>Families with supplier candidates</h2><p class="smallMuted">${familyGroups.length} families match the current filter. Families without a source-list candidate remain source-on-request.</p></div></div><div class="tableWrap"><table class="dataTable"><thead><tr><th>FAMILY</th><th>CLINICAL NEED</th><th>CANDIDATES</th><th>DECISION STATE</th><th></th></tr></thead><tbody>${familyRows||`<tr><td colspan="5"><div class="emptyState"><h3>No families match.</h3></div></td></tr>`}</tbody></table></div></section>`}
    `,true);
  }

  function adminRequests(){
    return shell(`<div class="pageHeader"><div><span class="eyebrow">REQUEST → QUOTE → RELEASE</span><h1>Request queue</h1><p>Validate scope before pricing. Authorization advances the customer decision state; it does not automatically release procurement.</p></div></div><section class="panel"><div class="tableWrap"><table class="dataTable"><thead><tr><th>REQUEST</th><th>ACCOUNT / SITE</th><th>LINES</th><th>STATUS</th><th>QUOTE</th><th>ACTION</th></tr></thead><tbody>${state.requests.map(r=>{const q=calcQuote(r);return `<tr><td><b class="mono">${r.id}</b><div class="sub">${date(r.createdAt)}</div></td><td>${esc(r.groupName||state.groupName||'Institutional account')}<div class="sub">${esc(r.campus)}</div></td><td>${r.lines.length}</td><td>${statusPill(r.status)}</td><td>${r.quoteRef?`<b>${esc(r.quoteRef)}</b>`:'Pending'}<div class="sub">${q.hasSell?money(q.subtotal)+' ex VAT':'Pricing incomplete'}</div></td><td><button class="button dark" data-admin-request="${r.id}">Open builder</button></td></tr>`}).join('')}</tbody></table></div></section>`,true);
  }

  function adminFulfilment(){
    return shell(`<div class="pageHeader"><div><span class="eyebrow">SITE ROUTING</span><h1>Fulfilment rules</h1><p>Map each campus to a preferred source and backup. Geography helps, but stock, licensed route, terms and delivery capability determine the actual source.</p></div></div><div class="notice"><strong>Demo routing only.</strong> No real Med7 branch address is invented here. Replace partner hubs with Acorus/Med7-confirmed fulfilment locations, contacts and SLAs.</div><div class="threeCol">${D.campuses.map(c=>`<article class="fulfilCard"><div class="fulfilTop"><div><span class="eyebrow">${c.emirate.toUpperCase()}</span><h3>${esc(c.name)}</h3></div>${badge('Active','green')}</div><div class="routeLine"><span>Clinic code</span><b class="mono">${esc(c.clinicCode)}</b></div><div class="routeLine"><span>Preferred source</span><b>${esc(c.preferredSource)}</b></div><div class="routeLine"><span>Partner hub</span><b>${esc(c.hub)}</b></div><div class="routeLine"><span>Backup</span><b>${esc(c.backup)}</b></div><div class="routeLine"><span>SLA</span><b>${esc(c.sla)}</b></div></article>`).join('')}</div><section class="panel" style="margin-top:18px"><div class="panelHeader"><h2>Routing decision order</h2></div><div class="threeCol"><div><span class="eyebrow">01</span><h3 style="font-size:14px">Permitted route</h3><p class="smallMuted">Can the supplier and recipient lawfully transact the line?</p></div><div><span class="eyebrow">02</span><h3 style="font-size:14px">Stock + exact SKU</h3><p class="smallMuted">Current availability, model, pack, batch/expiry and substitute controls.</p></div><div><span class="eyebrow">03</span><h3 style="font-size:14px">Commercial fulfilment</h3><p class="smallMuted">Landed cost, terms, delivery window and backup source.</p></div></div></section>`,true);
  }

  function adminFeed(){
    return shell(`<div class="pageHeader"><div><span class="eyebrow">ACORUS / MED7 INTEGRATION</span><h1>Supplier feed</h1><p>The production portal should ingest a B2B supplier master rather than scrape a retail storefront. CSV, SFTP or API can all map into the same controlled PSC product master.</p></div></div><div class="feedDiagram"><div class="feedNode"><div style="font-size:23px;color:#ff5a1f">▤</div><h3>Acorus / Med7 source</h3><p>Supplier SKU, barcode, brand, pack, B2B cost, stock, batch/expiry, VAT evidence, product authorization, image/media permission.</p></div><div class="feedArrow">→</div><div class="feedNode"><div style="font-size:23px;color:#ff5a1f">▦</div><h3>PSC product master</h3><p>Map supplier records to PSC SKU, school-approved status, requirement status, backup source, margin rules and evidence date.</p></div><div class="feedArrow">→</div><div class="feedNode"><div style="font-size:23px;color:#ff5a1f">⌁</div><h3>School portal</h3><p>Expose only approved customer-facing fields. Never show internal supplier cost or routing logic to the clinic.</p></div></div><div class="twoCol"><section class="panel"><div class="panelHeader"><h2>Required feed fields</h2></div><div class="codeBlock">supplier_sku<br>barcode<br>brand<br>product_name<br>pack_size<br>category<br>b2b_unit_cost<br>vat_status_or_evidence<br>stock_qty_or_status<br>lead_time<br>batch_tracking_required<br>expiry_tracking_required<br>regulated_flag<br>registration_reference<br>image_url_or_asset_id<br>media_usage_permission<br>last_updated_at</div></section><section class="panel"><div class="panelHeader"><h2>Ingestion controls</h2></div><div class="gateList"><div class="gate ok"><span>Supplier SKU uniqueness</span><i></i></div><div class="gate ok"><span>Public benchmark kept separate</span><i></i></div><div class="gate warn"><span>Tax evidence expiry alert</span><i></i></div><div class="gate warn"><span>Product image permission</span><i></i></div><div class="gate block"><span>No silent substitute mapping</span><i></i></div><div class="gate ok"><span>Audit every manual cost change</span><i></i></div></div></section></div><div class="notice" style="margin-top:18px"><strong>Recommended commercial ask to Acorus:</strong> B2B price file + product master + live/periodic stock feed + permitted product media + agreed fulfilment rules. Once supplied, this page becomes the connector rather than a manual upload screen.</div>`,true);
  }

  function relatedProductsFor(p,limit=6){
    if(!p) return [];
    const needSet=new Set(clinicalNeedIds(p));
    return catalogueProducts()
      .filter(x=>x.pscSku!==p.pscSku)
      .map(x=>{
        let score=0;
        if(x.productType&&p.productType&&x.productType===p.productType) score+=4;
        if(x.category&&p.category&&x.category===p.category) score+=3;
        clinicalNeedIds(x).forEach(id=>{ if(needSet.has(id)) score+=2; });
        return {x,score};
      })
      .filter(r=>r.score>0)
      .sort((a,b)=>b.score-a.score)
      .slice(0,limit)
      .map(r=>r.x);
  }

  function relatedProductRailCard(p,publicMode=false){
    const need=clinicalNeedMeta(clinicalNeedIds(p)[0]||'all');
    const displayName=p.catalogueDisplayName||p.name;
    const imageUrl=productDisplayImageUrl(p);
    const attr=publicMode?'data-public-product-view':'data-product-view';
    return `<button class="relatedProductMini" ${attr}="${p.pscSku}"><span class="relatedProductVisual" style="--need-bg:${need.bg};--need-ink:${need.ink}">${imageUrl?`<img src="${esc(imageUrl)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${esc(legacyProductImageUrl(p))}'">`:`<i>${esc((p.brand||need.label||'PS').slice(0,2).toUpperCase())}</i>`}</span><span class="relatedProductCopy"><small>${esc(need.label)}</small><b>${esc(displayName)}</b><em>${esc(p.cataloguePack||p.pack||'Pack to confirm')}</em></span></button>`;
  }

  function productModal(sku){
    const p=product(sku); if(!p)return '';
    const mapped=!!p.dhaMapped;
    const displayName=p.catalogueDisplayName||p.name;
    const pack=p.cataloguePack||p.pack||'Pack / unit to confirm';
    const needs=clinicalNeedIds(p);
    const primary=clinicalNeedMeta(needs[0]||'all');
    const fallback=legacyProductImageUrl(p);
    const needTags=needs.map(id=>`<span class="modalNeedChip" style="--chip-bg:${clinicalNeedMeta(id).bg};--chip-ink:${clinicalNeedMeta(id).ink}">${esc(clinicalNeedMeta(id).label)}</span>`).join('');
    const detailDhaMark=mapped?`<img class="dhaRequirementIcon detailDhaIcon" src="${DHA_ICON}" alt="DHA requirement">`:'';
    const displayImage=productDisplayImageUrl(p);
    const image=displayImage
      ? `<div class="detailProductImageWrap"><img src="${esc(displayImage)}" alt="${esc(displayName)}" onerror="this.onerror=null;this.src='${esc(fallback)}'">${detailDhaMark}</div>`
      : `<div class="detailProductImageWrap"><div class="detailNeedVisual" style="--need-bg:${primary.bg};--need-ink:${primary.ink}"></div>${detailDhaMark}</div>`;
    const workshop=workshopForProduct(p,1)[0];
    const related=relatedProductsFor(p,6);
    const inRequest=state.basket.find(x=>x.sku===p.pscSku)?.qty||0;

    return `<div class="productDetailModal fluidProductDetail">
      <div class="modalHeader fluidProductHeader"><button class="productBackButton" data-modal-close aria-label="Back to catalogue">←</button><div><span class="eyebrow">${esc(primary.label)}</span><h2>${esc(displayName)}</h2><div class="smallMuted mono">${esc(p.pscSku)}</div></div><span class="productRequestCount">${inRequest?`${inRequest} in request`:''}</span></div>
      <div class="productDetailGrid fluidProductGrid">
        <div class="detailImagePane fluidImagePane">${image}${Array.isArray(p.storefrontMedia)&&p.storefrontMedia.length>1?`<div class="productGalleryStrip">${p.storefrontMedia.slice(0,5).map(m=>`<img src="${esc(m.url)}" alt="${esc(m.alt||displayName)}">`).join('')}</div>`:''}<div class="detailImageMeta">${p.brand&&p.brand!=='Specification-led'&&p.brand!=='Institutional range'?`<b>${esc(p.brand)}</b>`:''}<span>${esc(pack)}</span></div><div class="modalNeedChips">${needTags}</div></div>
        <div class="detailContentPane fluidDetailContent">
          <div class="productQuickFacts"><div><span>PACK / UNIT</span><b>${esc(pack)}</b></div><div><span>SUPPLY BASIS</span><b>${p.regulated?'Licensed route':'Confirmed at quotation'}</b></div>${mapped?`<div><span>REQUIREMENT</span><b>Mapped to DHA clinic requirement</b></div>`:''}</div>
          <div class="productDisclosureList">
            <details open><summary><span>Specification</span><i>+</i></summary><div><p>${esc(p.pscOfferedSpecification||p.spec||'Exact commercial specification will be confirmed with the quotation.')}</p></div></details>
            ${mapped?`<details><summary><span>Requirement mapping</span><i>+</i></summary><div><p><strong>${esc(p.dhaRequirement||'Mapped requirement')}</strong></p><p>${esc(p.dhaReference||'DHA requirement')} · ${esc(p.dhaStatus||'Status to verify')}</p>${p.dhaCondition?`<small>${esc(p.dhaCondition)}</small>`:''}<p class="disclosureFinePrint">Mapped to the applicable DHA clinic requirement. This is not a DHA product endorsement or product approval.</p></div></details>`:''}
            <details><summary><span>Supply & compatibility</span><i>+</i></summary><div><p>${p.regulated?'Availability and supply remain subject to applicable UAE licensing, recipient authorization, product registration, storage, batch/expiry and professional controls.':'PSC confirms the exact specification, current availability and commercial terms before quotation.'}</p></div></details>
            ${workshop?`<details><summary><span>From The Workshop</span><i>+</i></summary><div><button class="productWorkshopInline" data-go="workshop/${esc(workshop.slug)}"><small>${esc(workshopFormatLabel(workshop.format))}</small><b>${esc(workshop.title)}</b></button></div></details>`:''}
          </div>
        </div>
      </div>
      ${related.length?`<section class="productRelatedSection"><div class="productRelatedHead"><span>Related clinic supplies</span><small>Same clinical area or product family</small></div><div class="productRelatedRail">${related.map(x=>relatedProductRailCard(x,false)).join('')}</div></section>`:''}
      <div class="productStickyBar"><button class="button light requestViewButton" data-basket>View request <b>${basketQty()}</b></button><button class="button primary requestAddButton" data-add="${p.pscSku}">${inRequest?'Add another':'Add to request'}</button></div>
    </div>`;
  }

  function publicProductModal(sku){
    const p=product(sku); if(!p)return '';
    const displayName=p.catalogueDisplayName||p.name;
    const pack=p.cataloguePack||p.pack||'Pack / unit to confirm';
    const needs=clinicalNeedIds(p);
    const primary=clinicalNeedMeta(needs[0]||'all');
    const imageUrl=productDisplayImageUrl(p);
    const fallback=legacyProductImageUrl(p);
    const workshop=workshopForProduct(p,1)[0];
    const related=relatedProductsFor(p,5);
    return `<div class="productDetailModal fluidProductDetail publicProductSheet">
      <div class="modalHeader fluidProductHeader"><button class="productBackButton" data-modal-close aria-label="Back to catalogue">←</button><div><span class="eyebrow">${esc(primary.label)}</span><h2>${esc(displayName)}</h2><div class="smallMuted mono">${esc(p.pscSku)}</div></div></div>
      <div class="productDetailGrid fluidProductGrid">
        <div class="detailImagePane fluidImagePane">${imageUrl?`<div class="detailProductImageWrap"><img src="${esc(imageUrl)}" alt="${esc(displayName)}" onerror="this.onerror=null;this.src='${esc(fallback)}'"></div>`:`<div class="detailProductImageWrap"><div class="detailNeedVisual" style="--need-bg:${primary.bg};--need-ink:${primary.ink}"></div></div>`}<div class="detailImageMeta"><b>${esc(displayName)}</b><span>${esc(pack)}</span></div></div>
        <div class="detailContentPane fluidDetailContent">
          <div class="productDisclosureList publicProductDisclosure">
            <details open><summary><span>Product specification</span><i>+</i></summary><div><p>${esc(p.pscOfferedSpecification||p.spec||'Exact commercial specification will be confirmed with the quotation.')}</p></div></details>
            ${p.dhaMapped?`<details><summary><span>Requirement mapping</span><i>+</i></summary><div><p>Mapped to the applicable DHA clinic requirement. Exact model suitability remains subject to specification verification.</p></div></details>`:''}
            <details><summary><span>Availability & quotation</span><i>+</i></summary><div><p>Availability, current commercial terms and any regulated supply route are confirmed for the account and transaction before commitment.</p></div></details>
            ${workshop?`<details><summary><span>From The Workshop</span><i>+</i></summary><div><button class="productWorkshopInline" data-go="workshop/${esc(workshop.slug)}"><small>${esc(workshopFormatLabel(workshop.format))}</small><b>${esc(workshop.title)}</b></button></div></details>`:''}
          </div>
        </div>
      </div>
      ${related.length?`<section class="productRelatedSection"><div class="productRelatedHead"><span>Related clinic supplies</span><small>Browse without losing your place</small></div><div class="productRelatedRail">${related.map(x=>relatedProductRailCard(x,true)).join('')}</div></section>`:''}
      <div class="productStickyBar publicProductSticky"><button class="button light" data-modal-close>Continue browsing</button><button class="button primary" data-go="contact">Request quotation</button></div>
    </div>`;
  }

  function modalHtml(meta){
    const body=meta.type==='request'?requestModal(meta.id,!!meta.admin):meta.type==='product'?productModal(meta.sku):meta.type==='public-product'?publicProductModal(meta.sku):'';
    return `<div class="modalBackdrop fluidOverlay" data-modal-close><div class="modal ${['product','public-product'].includes(meta.type)?'productModalShell fluidProductShell':''}" onclick="event.stopPropagation()">${body}</div></div>`;
  }


  async function submitCustomRequest(){
    const el=document.getElementById('customRequestText');
    const qtyEl=document.getElementById('customRequestQty');
    const text=(el?.value||'').trim();
    const qty=Math.max(1,Number(qtyEl?.value||1));
    if(!text){ toast('<strong>Add a description first.</strong>'); return; }

    if(isDemoAccount()){
      audit('Demo custom request',`${qty} × ${text}`);
      toast('<strong>Demo request received.</strong><br>This action is simulated and has not been sent to PSC.');
      if(el) el.value='';
      return;
    }

    try{
      await persistCustomRequest(text,qty);
      toast(`<strong>Custom request received.</strong><br>PSC will review it and contact ${esc(accountEmailLabel())}.`);
      if(el) el.value='';
    }catch(e){ console.error(e); toast('<strong>Could not send custom request.</strong>'); }
  }

  async function submitRequest(){
    if(!state.basket.length)return;
    const note=(document.getElementById('basketNote')||{}).value||'';
    const lines=JSON.parse(JSON.stringify(state.basket));

    if(isDemoAccount()){
      const orderNumber=`DEMO-SIM-${String(Date.now()).slice(-5)}`;
      state.requests.unshift({
        id:orderNumber,
        groupName:state.groupName||'Demo Organisation',
        campus:state.campus,
        requester:'Demo account',
        createdAt:new Date().toISOString(),
        status:'Drafting',
        quoteRef:'',
        note:note||'Simulated demo request.',
        lines,
        quote:{lines:{}},
        demoLocal:true
      });
      state.basket=[]; ui.basket=false;
      save(); render();
      toast(`<strong>Demo order created.</strong><br>${esc(orderNumber)} is a simulated request and will reset on refresh.`);
      return;
    }

    try{
      const orderNumber=await persistNewOrder(lines,note);
      state.basket=[]; ui.basket=false;
      await loadOrdersFromDatabase(); save(); render();
      toast(`<strong>Order placed.</strong><br>${esc(orderNumber)} is under review. Your quotation will be sent to ${esc(accountEmailLabel())}.`);
    }catch(e){ console.error(e); toast('<strong>Could not place the order.</strong><br>Please try again or contact Pharma Service.'); }
  }

  const DB_TO_UI_STATUS = {
    under_review:'Drafting', quote_sent:'Sent', confirmed:'Authorized', under_process:'Procurement',
    out_for_delivery:'Delivery', delivered:'Accepted', cancelled:'Cancelled', archived:'Cancelled'
  };

  function protectedRoute(route){ return route.startsWith('portal/') || route.startsWith('admin/'); }

  async function hydrateAccount(){
    if(!sb || !session?.user) return;
    const uid=session.user.id;
    const [{data:profile,error:profileError},{data:memberships,error:membershipError}] = await Promise.all([
      sb.from('profiles').select('full_name,is_psc_admin').eq('user_id',uid).maybeSingle(),
      sb.from('memberships').select('role,group_id,school_id').eq('user_id',uid)
    ]);
    if(profileError) console.warn('Profile lookup:',profileError.message);
    if(membershipError) throw membershipError;

    const isPscAdmin=!!profile?.is_psc_admin;
    const membership=(memberships||[])[0]||null;
    let group=null, school=null, schools=[];

    if(membership?.group_id){
      const {data:g,error:e}=await sb.from('account_groups').select('id,name,slug').eq('id',membership.group_id).single();
      if(e) throw e;
      group=g;

      if(membership.school_id){
        const {data:sc,error:se}=await sb.from('schools')
          .select('id,name,campus_name,group_id,active')
          .eq('id',membership.school_id)
          .eq('active',true)
          .single();
        if(se) throw se;
        schools=sc?[sc]:[];
      } else {
        const {data:scs,error:se}=await sb.from('schools')
          .select('id,name,campus_name,group_id,active')
          .eq('group_id',membership.group_id)
          .eq('active',true)
          .order('name',{ascending:true})
          .order('campus_name',{ascending:true});
        if(se) throw se;
        schools=scs||[];
      }

      school=schools.find(sc=>sc.id===state.activeSchoolId)
        || schools.find(sc=>schoolLabel(sc)===state.campus)
        || schools[0]
        || null;
    }

    authContext={
      userId:uid,
      email:session.user.email||'',
      fullName:profile?.full_name||'',
      isPscAdmin,
      role:membership?.role||(isPscAdmin?'psc_admin':''),
      group,
      school,
      schools
    };

    state.accountEmail=session.user.email||'';
    if(group) state.groupName=group.name;

    if(school){
      const previousId=state.activeSchoolId;
      if(previousId && previousId!==school.id){
        state.basketsBySchool=state.basketsBySchool||{};
        state.basketsBySchool[previousId]=state.basket||[];
      }
      state.activeSchoolId=school.id;
      state.campus=schoolLabel(school);
      state.basketsBySchool=state.basketsBySchool||{};
      if(state.basketsBySchool[school.id]) state.basket=state.basketsBySchool[school.id];
      else state.basketsBySchool[school.id]=state.basket||[];
    }

    await loadOrdersFromDatabase();
    if(isPscAdmin){ await loadAdminCms(); await loadAdminMail(); }
    else await loadPublicStorefronts();
    save();
  }

  async function switchInstitutionAccount(schoolId){
    if(!authContext || authContext.isPscAdmin) return;
    const schools=availableSchools();
    const next=schools.find(sc=>sc.id===schoolId);
    if(!next || next.id===authContext?.school?.id){
      ui.accountMenu=false;
      render();
      return;
    }

    state.basketsBySchool=state.basketsBySchool||{};
    if(authContext?.school?.id){
      state.basketsBySchool[authContext.school.id]=JSON.parse(JSON.stringify(state.basket||[]));
    }

    authContext.school=next;
    state.activeSchoolId=next.id;
    state.campus=schoolLabel(next);
    state.basket=JSON.parse(JSON.stringify(state.basketsBySchool[next.id]||[]));
    ui.accountMenu=false;
    ui.basket=false;
    ui.modal=null;

    try{
      await loadOrdersFromDatabase();
      save();
      render();
      toast(`<strong>Account switched.</strong><br>${esc(schoolLabel(next))}`);
    }catch(e){
      console.error(e);
      toast('<strong>Could not switch account.</strong><br>Please try again.');
    }
  }

  async function loadOrdersFromDatabase(){
    if(!sb || !session?.user) return;
    let query=sb.from('orders').select('*').order('created_at',{ascending:false});
    if(!authContext?.isPscAdmin){
      if(!authContext?.school?.id){ state.requests=[]; return; }
      query=query.eq('school_id',authContext.school.id);
    }
    const {data:orders,error}=await query;
    if(error) throw error;
    const ids=(orders||[]).map(o=>o.id);
    if(!ids.length){ state.requests=[]; return; }
    const [{data:lines,error:lineError},{data:quotes,error:quoteError},{data:documents,error:documentError},{data:schools,error:schoolError},{data:groups,error:groupError}] = await Promise.all([
      sb.from('order_lines').select('*').in('order_id',ids),
      sb.from('quotes').select('*').in('order_id',ids),
      sb.from('order_documents').select('*').in('order_id',ids).order('created_at',{ascending:false}),
      authContext?.isPscAdmin ? sb.from('schools').select('id,name,campus_name,group_id') : Promise.resolve({data:[authContext.school],error:null}),
      authContext?.isPscAdmin ? sb.from('account_groups').select('id,name') : Promise.resolve({data:authContext.group?[authContext.group]:[],error:null})
    ]);
    if(lineError) throw lineError; if(quoteError) throw quoteError; if(documentError) throw documentError; if(schoolError) throw schoolError; if(groupError) throw groupError;
    const schoolMap=Object.fromEntries((schools||[]).filter(Boolean).map(x=>[x.id,x]));
    const groupMap=Object.fromEntries((groups||[]).filter(Boolean).map(x=>[x.id,x]));
    const quoteMap=Object.fromEntries((quotes||[]).map(q=>[q.order_id,q]));
    const docsByOrder=(documents||[]).reduce((acc,d)=>{ (acc[d.order_id]||(acc[d.order_id]=[])).push(d); return acc; },{});
    state.requests=(orders||[]).map(o=>{
      const sc=schoolMap[o.school_id]||authContext?.school||{};
      const gp=groupMap[o.group_id]||authContext?.group||{};
      const orderLines=(lines||[]).filter(l=>l.order_id===o.id);
      const q=quoteMap[o.id];
      const qLines={};
      const mappedLines=orderLines.map(l=>{
        const mapped=l.family_id?{
          type:'family', familyId:l.family_id, familyName:l.family_name_snapshot||l.line_description||l.family_id,
          presentation:l.requested_presentation||'', orderPackBasis:l.pack_snapshot||'', brandPreferenceMode:l.brand_preference_mode||'no_preference',
          requestedBrand:l.requested_brand||'', productOptionId:l.product_option_id||'', productOptionSnapshot:l.product_option_snapshot||null,
          regulated:true, qty:Number(l.quantity)
        }:{sku:l.psc_sku_snapshot||'',qty:Number(l.quantity)};
        const key=lineKey(mapped);
        if(key) qLines[key]={sell:l.unit_price===null?undefined:Number(l.unit_price),vat:l.vat_rate===null?undefined:Number(l.vat_rate)};
        return mapped;
      });
      return {
        dbId:o.id,
        id:o.order_number,
        groupName:gp.name||'',
        campus:schoolLabel(sc)||state.campus||'Clinic',
        requester:'Clinic account',
        createdAt:o.created_at,
        deliveredAt:o.delivered_at,
        cancelledAt:o.cancelled_at,
        expectedDeliveryDate:o.expected_delivery_date||null,
        documents:docsByOrder[o.id]||[],
        status:DB_TO_UI_STATUS[o.status]||o.status,
        quoteRef:o.quote_ref||q?.quote_number||'',
        note:o.note||'',
        lines:mappedLines,
        quote:q?{validity:q.validity_days?`${q.validity_days} calendar days`:'',delivery:q.delivery_terms||'',terms:q.payment_terms||'',lines:qLines}:{lines:qLines}
      };
    });
  }

  async function signIn(){
    if(!sb){ toast('<strong>Login unavailable.</strong><br>Supabase did not load.'); return; }
    const email=(document.getElementById('mvpLoginEmail')?.value||'').trim();
    const password=document.getElementById('mvpLoginPassword')?.value||'';
    if(!email||!password){ toast('<strong>Enter your email and password.</strong>'); return; }
    const {data,error}=await sb.auth.signInWithPassword({email,password});
    if(error){ toast(`<strong>Unable to sign in.</strong><br>${esc(error.message)}`); return; }
    session=data.session;
    try{
      await hydrateAccount();
      go(authContext?.isPscAdmin?'admin/dashboard':'portal/dashboard');
    }catch(e){ console.error(e); await sb.auth.signOut(); session=null; authContext=null; toast('<strong>Account access is not configured yet.</strong><br>Contact Pharma Service.'); }
  }

  async function signOut(){
    if(sb) await sb.auth.signOut();
    session=null; authContext=null;
    state={...JSON.parse(JSON.stringify(seed)),basket:[]};
    try{ localStorage.removeItem(STORAGE); }catch{}
    location.hash='login'; render();
  }

  async function bootstrapAuth(){
    if(!sb){ authReady=true; render(); return; }
    try{ await loadPublicStorefronts(); }catch(e){ console.warn('Public storefront load:',e); }
    const {data,error}=await sb.auth.getSession();
    if(error) console.warn(error.message);
    session=data?.session||null;
    if(session){ try{ await hydrateAccount(); }catch(e){ console.error('Account hydration failed',e); } }
    authReady=true;
    render();
    sb.auth.onAuthStateChange(async (_event,newSession)=>{
      session=newSession;
      if(session){ try{ await hydrateAccount(); }catch(e){ console.error(e); } }
      else { authContext=null; }
      render();
    });
  }

  async function persistNewOrder(lines,note=''){
    if(!sb || !session?.user || !authContext?.school?.id || !authContext?.group?.id) throw new Error('Account context is missing.');
    const now=new Date();
    const orderNumber=`PSC-REQ-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getTime()).slice(-6)}`;
    const {data:o,error}=await sb.from('orders').insert({
      order_number:orderNumber, group_id:authContext.group.id, school_id:authContext.school.id,
      requested_by:session.user.id, status:'under_review', note
    }).select('id,order_number').single();
    if(error) throw error;
    const dbLines=lines.map(l=>{
      if(isFamilyLine(l)){
        return {
          order_id:o.id, product_id:null, psc_sku_snapshot:null,
          family_id:l.familyId, family_name_snapshot:l.familyName,
          line_description:l.familyName||l.familyId,
          brand_model_snapshot:l.brandPreferenceMode==='specific_option'?(l.productOptionSnapshot?.exact_product_name||l.requestedBrand||null):(l.brandPreferenceMode==='other_brand'?l.requestedBrand:'No preference'),
          pack_snapshot:l.productOptionSnapshot?.pack||l.orderPackBasis||l.presentation||null, quantity:l.qty,
          product_option_id:l.brandPreferenceMode==='specific_option'?(l.productOptionId||null):null,
          requested_presentation:l.presentation||null,
          brand_preference_mode:l.brandPreferenceMode||'no_preference',
          requested_brand:l.brandPreferenceMode==='other_brand'?(l.requestedBrand||null):(l.brandPreferenceMode==='specific_option'?(l.productOptionSnapshot?.brand||l.requestedBrand||null):null),
          product_option_snapshot:l.brandPreferenceMode==='specific_option'?(l.productOptionSnapshot||null):null
        };
      }
      const p=product(l.sku);
      return {order_id:o.id,product_id:null,psc_sku_snapshot:l.sku,line_description:p?.name||l.sku,brand_model_snapshot:p?.brand||null,pack_snapshot:p?.pack||null,quantity:l.qty};
    });
    const {error:le}=await sb.from('order_lines').insert(dbLines); if(le) throw le;
    return o.order_number;
  }

  async function persistCustomRequest(description,quantity){
    if(!sb || !session?.user || !authContext?.school?.id || !authContext?.group?.id) throw new Error('Account context is missing.');
    const {error}=await sb.from('custom_requests').insert({group_id:authContext.group.id,school_id:authContext.school.id,requested_by:session.user.id,description,quantity,status:'under_review'});
    if(error) throw error;
  }

  async function updateCustomerQuote(id,action){
    const r=state.requests.find(x=>x.id===id); if(!r) return;

    if(isDemoAccount()){
      r.status=action==='confirm'?'Authorized':'Cancelled';
      if(action==='cancel') r.cancelledAt=new Date().toISOString();
      audit(action==='confirm'?'Demo quotation confirmed':'Demo quotation cancelled',id);
      save(); render();
      toast(action==='confirm'
        ? '<strong>Demo quotation confirmed.</strong><br>The workflow has advanced locally for this browser.'
        : '<strong>Demo quotation cancelled.</strong><br>The workflow change is simulated.');
      return;
    }

    if(!r.dbId) return;
    const dbStatus=action==='confirm'?'confirmed':'cancelled';
    const update={status:dbStatus}; if(action==='cancel') update.cancelled_at=new Date().toISOString();
    const {error}=await sb.from('orders').update(update).eq('id',r.dbId); if(error) throw error;
    await loadOrdersFromDatabase(); save(); render();
  }


  let publicHeaderLastY = 0;
  let publicHeaderRaf = 0;
  function syncPublicHeader(){
    const header = document.querySelector('.publicHeader');
    const y = Math.max(0, window.scrollY || window.pageYOffset || 0);
    if(!header){ publicHeaderLastY = y; return; }

    if(y <= 18){
      header.classList.remove('headerHidden','headerScrolled');
      publicHeaderLastY = y;
      return;
    }

    header.classList.add('headerScrolled');
    const delta = y - publicHeaderLastY;
    if(delta > 5) header.classList.add('headerHidden');
    else if(delta < -5) header.classList.remove('headerHidden');
    publicHeaderLastY = y;
  }
  function onPublicHeaderScroll(){
    if(publicHeaderRaf) return;
    publicHeaderRaf = requestAnimationFrame(()=>{
      publicHeaderRaf = 0;
      syncPublicHeader();
    });
  }


  function syncRouteMeta(route){
    const publicMeta={
      home:['Pharma Service | Institutional Healthcare Supply UAE','Institutional healthcare supply for schools and organizations in the UAE: controlled specifications, sourcing, quotation, delivery and replenishment.','/'],
      'our-model':['Our Model | Pharma Service','How Pharma Service handles institutional healthcare supply: careful specifications, category-appropriate sourcing, regulated routes and repeat account service.','/our-model.html'],
      'who-we-supply':['Our Model | Pharma Service','How Pharma Service handles institutional healthcare supply: careful specifications, category-appropriate sourcing, regulated routes and repeat account service.','/our-model.html'],
      'what-we-supply':['Our Model | Pharma Service','How Pharma Service handles institutional healthcare supply: careful specifications, category-appropriate sourcing, regulated routes and repeat account service.','/our-model.html'],
      'how-it-works':['Our Model | Pharma Service','How Pharma Service handles institutional healthcare supply: careful specifications, category-appropriate sourcing, regulated routes and repeat account service.','/our-model.html'],
      catalogue:['Institutional Healthcare Catalogue | Pharma Service','Browse the public read-only Pharma Service institutional healthcare catalogue by clinical need.','/catalogue.html'],
      contact:['Request Institutional Supply | Pharma Service','Send Pharma Service an institutional healthcare requirement or RFQ for sourcing and quotation.','/contact.html'],
      start:['Start Here | Pharma Service','Browse the Pharma Service institutional catalogue, send an RFQ or product list, or see how our institutional supply model works.','/start'],
      about:['About Pharma Service','Dubai healthcare supply business developing a controlled institutional supply service for schools and organizations.','/about.html'],
      careers:['Careers | Pharma Service','Career information from Pharma Service.','/careers.html'],
      media:['Media & Resources | Pharma Service','Pharma Service company updates and institutional healthcare supply resources.','/media.html'],
      workshop:['The Workshop | Pharma Service','Practical product intelligence for people who run clinics: specifications, compatibility, readiness, stock and ordering details.','/workshop']
    };
    const workshopSlug=route.startsWith('workshop/')?route.split('/')[1]:null;
    const workshopGuide=workshopSlug?workshopGuideBySlug(workshopSlug):null;
    const baseRoute=route.startsWith('catalogue/')?'catalogue':route.startsWith('workshop/')?'workshop':route;
    let item=publicMeta[baseRoute];
    if(workshopGuide)item=[`${workshopGuide.title} | The Workshop`,workshopGuide.excerpt,`/workshop/${workshopGuide.slug}`];
    if(!item) return;
    document.title=item[0];
    let description=document.querySelector('meta[name="description"]');
    if(!description){ description=document.createElement('meta'); description.name='description'; document.head.appendChild(description); }
    description.content=item[1];
    let canonical=document.querySelector('link[rel="canonical"]');
    if(!canonical){ canonical=document.createElement('link'); canonical.rel='canonical'; document.head.appendChild(canonical); }
    canonical.href=`https://pharmaservice.ae${item[2]}`;
    const og={ 'og:title':item[0], 'og:description':item[1], 'og:url':canonical.href, 'og:type':'website' };
    Object.entries(og).forEach(([property,content])=>{ let el=document.querySelector(`meta[property="${property}"]`); if(!el){el=document.createElement('meta');el.setAttribute('property',property);document.head.appendChild(el);} el.content=content; });
  }

  function render(){
    const r=currentRoute();
    if(protectedRoute(r)){
      if(!authReady){ $app.innerHTML='<main class="publicPage"><section class="publicPageHero"><span class="kicker">PHARMA SERVICE</span><h1>Opening secure account…</h1></section></main>'; return; }
      if(!session){ if(r!=='login') location.hash='login'; return; }
      if(r.startsWith('admin/') && !authContext?.isPscAdmin){ location.hash='portal/dashboard'; return; }
    }
    let html;
    if(r.startsWith('portal/catalogue/')){
      const needId=r.split('/')[2]||'all';
      html=catalogueCategory(needId);
    } else if(r.startsWith('catalogue/')){
      const needId=r.split('/')[1]||'all';
      html=publicCataloguePage(needId);
    } else if(r.startsWith('workshop/')){
      const slug=r.split('/')[1]||'';
      html=workshopGuidePage(slug);
    } else if(r.startsWith('admin/products/')){
      html=adminProductEditor(r.split('/')[2]);
    } else switch(r){
      case 'home': html=landing();break;
      case 'start': html=startPage();break;
      case 'unsubscribe': html=unsubscribePage();break;
      case 'about': html=aboutPage();break;
      case 'services': html=servicesPage();break;
      case 'our-model': html=ourModelPage();break;
      case 'who-we-supply': html=ourModelPage();break;
      case 'what-we-supply': html=ourModelPage();break;
      case 'how-it-works': html=ourModelPage();break;
      case 'catalogue': html=publicCataloguePage('all');break;
      case 'workshop': html=workshopLandingPage();break;
      case 'wholesale': html=wholesalePage();break;
      case 'max': location.hash='services'; return;
      case 'demo': html=publicDemoPage();break;
      case 'careers': html=careersPage();break;
      case 'media': html=mediaPage();break;
      case 'contact': html=contactPage();break;
      case 'login': html=loginPage();break;
      case 'portal/dashboard': html=portalDashboard();break;
      case 'portal/catalogue': html=catalogue();break;
      case 'portal/requests': html=requestsPage();break;
      case 'portal/replenish': html=replenishPage();break;
      case 'portal/documents': html=documentsPage();break;
      case 'portal/stock': html=isDemoAccount()?stockPage():shell(`<div class="pageHeader customerSimpleHeader"><div><span class="eyebrow">ACCOUNT MODULE</span><h1>Stock & expiry</h1><p>This module is not enabled for this live account yet. PSC will only activate it when the account has real stock and expiry records to display.</p></div></div><section class="panel"><div class="emptyState"><h3>No simulated stock on a live account.</h3><p>Use Orders, Replenish and Documents for current live account activity.</p><button class="button primary" data-go="portal/dashboard">Back to Home</button></div></section>`);break;
      case 'portal/assets': html=isDemoAccount()?assetsPage():shell(`<div class="pageHeader customerSimpleHeader"><div><span class="eyebrow">ACCOUNT MODULE</span><h1>Clinic assets</h1><p>This module is not enabled for this live account yet. PSC will only activate it when verified model, serial, warranty and service records have been loaded.</p></div></div><section class="panel"><div class="emptyState"><h3>No simulated assets on a live account.</h3><p>Verified asset records will appear here after onboarding.</p><button class="button primary" data-go="portal/dashboard">Back to Home</button></div></section>`);break;
      case 'portal/insights': html=insightsPage();break;
      case 'portal/archive': html=archivePage();break;
      case 'admin/dashboard': html=adminDashboard();break;
      case 'admin/mail': html=adminMail();break;
      case 'admin/storefront': html=adminStorefront();break;
      case 'admin/products': html=adminProducts();break;
      case 'admin/family-options': html=adminFamilyOptions();break;
      case 'admin/requests': html=adminRequests();break;
      case 'admin/fulfilment': html=adminFulfilment();break;
      case 'admin/supplier-feed': html=adminFeed();break;
      default: html=landing();
    }
    $app.innerHTML=html + (ui.modal?.type==='public-product'?modalHtml(ui.modal):''); syncRouteMeta(r); bind(); syncPublicHeader();
  }


  async function submitPublicEnquiry(event){
    event.preventDefault();
    const form=event.currentTarget;
    const button=form.querySelector('[data-public-enquiry-submit]');
    const field=n=>(form.querySelector(`[name="${n}"]`)?.value||'').trim();
    const requirement=field('requirement');
    const name=field('name');
    const contact_number=field('contact_number');
    const contact_email=field('contact_email');
    const organization=field('organization');
    const institution_type=field('institution_type');
    const emirate=field('emirate')||null;
    const requirement_type=field('requirement_type')||null;
    const required_by=field('required_by')||null;
    const siteRaw=field('site_count');
    const site_count=siteRaw?Number(siteRaw):null;
    const website=field('website');
    const rfqFile=form.querySelector('[name="rfq_file"]')?.files?.[0]||null;

    if(website) return;
    if(organization.length<2){ toast('<strong>Please add the organization.</strong>'); form.querySelector('[name="organization"]')?.focus(); return; }
    if(institution_type.length<2){ toast('<strong>Please select the institution type.</strong>'); form.querySelector('[name="institution_type"]')?.focus(); return; }
    if(name.length<2){ toast('<strong>Please add your name.</strong>'); form.querySelector('[name="name"]')?.focus(); return; }
    if(contact_number.length<5){ toast('<strong>Please add a contact number.</strong>'); form.querySelector('[name="contact_number"]')?.focus(); return; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)){ toast('<strong>Please enter a valid email address.</strong>'); form.querySelector('[name="contact_email"]')?.focus(); return; }
    if(requirement.length<10){ toast('<strong>Please tell us a little more about the requirement.</strong>'); form.querySelector('[name="requirement"]')?.focus(); return; }
    if(site_count!==null && (!Number.isInteger(site_count) || site_count<1 || site_count>10000)){ toast('<strong>Please check the number of sites.</strong>'); return; }
    if(rfqFile && rfqFile.size>10*1024*1024){ toast('<strong>Attachment too large.</strong><br>Maximum file size is 10 MB.'); return; }
    if(!sb){ toast('<strong>Could not send the enquiry.</strong><br>Please email info@pharmaservice.ae.'); return; }

    const original=button?.textContent||'Send enquiry';
    if(button){ button.disabled=true; button.textContent='Sending…'; }

    let rfq_object_path=null;
    let rfq_file_name=null;
    try{
      if(rfqFile){
        const allowed=['application/pdf','text/csv','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if(!allowed.includes(rfqFile.type)){ throw new Error('Unsupported RFQ attachment type.'); }
        const token=(crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`);
        rfq_object_path=`public/${token}-${safeFileName(rfqFile.name)}`;
        const {error:uploadError}=await sb.storage.from('institutional-enquiries').upload(rfq_object_path,rfqFile,{cacheControl:'3600',upsert:false});
        if(uploadError) throw uploadError;
        rfq_file_name=rfqFile.name;
      }

      const {error}=await sb.from('institutional_enquiries').insert({
        name, contact_number, contact_email, organization, institution_type,
        site_count, emirate, requirement_type, required_by, requirement,
        rfq_object_path, rfq_file_name,
        source_page:form.dataset.sourcePage||'public_contact_v37'
      });
      if(error) throw error;

      form.reset();
      toast('<strong>Thank you.</strong><br>Your institutional requirement has been received.');
    }catch(e){
      console.error('Public enquiry submission failed:',e);
      toast(`<strong>Could not send the enquiry.</strong><br>${esc(e?.message||'Please email info@pharmaservice.ae.')}`);
    }finally{
      if(button){ button.disabled=false; button.textContent=original; }
    }
  }


  function bind(){
    document.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.go)));
    document.querySelectorAll('[data-start-scroll]').forEach(el=>el.addEventListener('click',()=>document.getElementById('start-send')?.scrollIntoView({behavior:'smooth',block:'start'})));
    if(document.querySelector('[data-unsubscribe-state]')) processMailUnsubscribe();
    const wSearch=document.querySelector('[data-workshop-q]'); if(wSearch)wSearch.addEventListener('input',e=>{ui.workshopQuery=e.target.value;const pos=e.target.selectionStart||ui.workshopQuery.length;render();requestAnimationFrame(()=>{const n=document.querySelector('[data-workshop-q]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch{}}});});
    document.querySelectorAll('[data-workshop-category]').forEach(el=>el.addEventListener('click',()=>{ui.workshopCategory=el.dataset.workshopCategory;render()}));
    document.querySelectorAll('[data-workshop-clear]').forEach(el=>el.addEventListener('click',()=>{ui.workshopQuery='';ui.workshopCategory='All';render()}));
    document.querySelectorAll('[data-workshop-save]').forEach(el=>el.addEventListener('click',()=>{const slug=el.dataset.workshopSave;const saved=workshopSaved();saved.has(slug)?saved.delete(slug):saved.add(slug);localStorage.setItem(WORKSHOP_SAVE_KEY,JSON.stringify([...saved]));render()}));
    document.querySelectorAll('[data-workshop-print]').forEach(el=>el.addEventListener('click',()=>window.print()));
    document.querySelectorAll('[data-workshop-share]').forEach(el=>el.addEventListener('click',async()=>{const g=workshopGuideBySlug(el.dataset.workshopShare);if(!g)return;const url=`https://pharmaservice.ae/workshop/${g.slug}`;try{if(navigator.share)await navigator.share({title:g.title,text:g.excerpt,url});else if(navigator.clipboard){await navigator.clipboard.writeText(url);toast('<strong>Link copied.</strong>');}else toast(`<strong>Share link</strong><br>${esc(url)}`);}catch(e){if(e?.name!=='AbortError')console.warn(e);}}));
    document.querySelectorAll('[data-mail-from-guide]').forEach(el=>el.addEventListener('click',()=>{ui.mailGuideSlug=el.dataset.mailFromGuide;ui.mailTemplate=workshopGuideBySlug(ui.mailGuideSlug)?.format==='CHECK THIS'?'clinic-check':'workshop';ui.mailDraftSubject='';ui.mailDraftIntro='';ui.mailDraftCta='Read the guide';ui.mailTab='compose';go('admin/mail')}));
    document.querySelectorAll('[data-public-menu]').forEach(el=>el.addEventListener('click',()=>{ui.publicMenu=!ui.publicMenu;render()}));
    document.querySelectorAll('[data-global-search]').forEach(el=>{
      el.addEventListener('input',e=>{ui.globalSearch=e.target.value;});
      el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ui.catalogueQuery=e.target.value.trim();go('portal/catalogue/all');}});
    });
    document.querySelectorAll('[data-tour-next]').forEach(el=>el.addEventListener('click',()=>{ui.tourStep=Math.min(5,(ui.tourStep||0)+1);render()}));
    document.querySelectorAll('[data-tour-prev]').forEach(el=>el.addEventListener('click',()=>{ui.tourStep=Math.max(0,(ui.tourStep||0)-1);render()}));
    document.querySelectorAll('[data-tour-jump]').forEach(el=>el.addEventListener('click',()=>{ui.tourStep=Number(el.dataset.tourJump)||0;render()}));
    document.querySelectorAll('[data-mobile-open]').forEach(el=>el.addEventListener('click',()=>{ui.mobile=true;render()}));
    document.querySelectorAll('[data-mobile-close]').forEach(el=>el.addEventListener('click',()=>{ui.mobile=false;render()}));
    document.querySelectorAll('[data-campus]').forEach(el=>el.addEventListener('change',e=>{state.campus=e.target.value;save();render()}));
    document.querySelectorAll('[data-account-switcher]').forEach(el=>el.addEventListener('click',()=>{ui.accountMenu=!ui.accountMenu;render()}));
    document.querySelectorAll('[data-school-select]').forEach(el=>el.addEventListener('click',async()=>{await switchInstitutionAccount(el.dataset.schoolSelect)}));
    document.querySelectorAll('[data-basket]').forEach(el=>el.addEventListener('click',openBasketOverlay));
    document.querySelectorAll('[data-close-basket]').forEach(el=>el.addEventListener('click',closeBasketOverlay));
    document.querySelectorAll('[data-product-view]').forEach(el=>el.addEventListener('click',()=>openProductOverlay(el.dataset.productView,false)));
    document.querySelectorAll('[data-public-product-view]').forEach(el=>el.addEventListener('click',()=>openProductOverlay(el.dataset.publicProductView,true)));
    document.querySelectorAll('[data-add]').forEach(el=>el.addEventListener('click',()=>addBasket(el.dataset.add,1)));
    document.querySelectorAll('[data-basket-delta]').forEach(el=>el.addEventListener('click',()=>{const [sku,d]=el.dataset.basketDelta.split('|');const line=state.basket.find(x=>x.sku===sku);if(!line)return;line.qty+=Number(d);if(line.qty<=0)state.basket=state.basket.filter(x=>x.sku!==sku);save();renderUi({preserveScroll:true,transition:false})}));
    document.querySelectorAll('[data-basket-remove]').forEach(el=>el.addEventListener('click',()=>{state.basket=state.basket.filter(x=>x.sku!==el.dataset.basketRemove);save();renderUi({preserveScroll:true,transition:false})}));
    document.querySelectorAll('[data-family-basket-delta]').forEach(el=>el.addEventListener('click',()=>{const[i,d]=el.dataset.familyBasketDelta.split('|');const line=state.basket[Number(i)];if(!line||!isFamilyLine(line))return;line.qty+=Number(d);if(line.qty<=0)state.basket.splice(Number(i),1);save();renderUi({preserveScroll:true,transition:false})}));
    document.querySelectorAll('[data-family-basket-remove]').forEach(el=>el.addEventListener('click',()=>{const i=Number(el.dataset.familyBasketRemove);if(Number.isInteger(i)&&state.basket[i]&&isFamilyLine(state.basket[i]))state.basket.splice(i,1);save();renderUi({preserveScroll:true,transition:false})}));
    document.querySelectorAll('[data-submit-request]').forEach(el=>el.addEventListener('click',submitRequest));
    document.querySelectorAll('[data-submit-custom]').forEach(el=>el.addEventListener('click',submitCustomRequest));
    document.querySelectorAll('[data-mail-tab]').forEach(el=>el.addEventListener('click',()=>{ui.mailTab=el.dataset.mailTab;render()}));
    document.querySelectorAll('[data-mail-template]').forEach(el=>el.addEventListener('click',()=>{ui.mailTemplate=el.dataset.mailTemplate;ui.mailDraftSubject='';ui.mailDraftIntro='';ui.mailDraftCta=ui.mailTemplate==='supply-note'?'Browse catalogue':'Read the guide';render()}));
    document.querySelectorAll('[data-mail-guide]').forEach(el=>el.addEventListener('change',e=>{ui.mailGuideSlug=e.target.value;ui.mailDraftSubject='';ui.mailDraftIntro='';render()}));
    document.querySelectorAll('[data-mail-subject]').forEach(el=>el.addEventListener('input',e=>{ui.mailDraftSubject=e.target.value;const preview=document.querySelector('.mailPreviewPane');if(preview)preview.innerHTML=`<div class="mailPreviewLabel"><span>EMAIL PREVIEW</span><small>Responsive HTML · no tracking pixels</small></div>${mailPreview()}`;}));
    document.querySelectorAll('[data-mail-intro]').forEach(el=>el.addEventListener('input',e=>{ui.mailDraftIntro=e.target.value;const preview=document.querySelector('.mailPreviewPane');if(preview)preview.innerHTML=`<div class="mailPreviewLabel"><span>EMAIL PREVIEW</span><small>Responsive HTML · no tracking pixels</small></div>${mailPreview()}`;}));
    document.querySelectorAll('[data-mail-cta]').forEach(el=>el.addEventListener('input',e=>{ui.mailDraftCta=e.target.value;const preview=document.querySelector('.mailPreviewPane');if(preview)preview.innerHTML=`<div class="mailPreviewLabel"><span>EMAIL PREVIEW</span><small>Responsive HTML · no tracking pixels</small></div>${mailPreview()}`;}));
    document.querySelectorAll('[data-mail-search]').forEach(el=>el.addEventListener('input',e=>{ui.mailSearch=e.target.value;renderUi({preserveScroll:true,focusSelector:'[data-mail-search]',cursor:e.target.selectionStart,transition:false})}));
    document.querySelectorAll('[data-mail-role]').forEach(el=>el.addEventListener('change',e=>{ui.mailRole=e.target.value;render()}));
    document.querySelectorAll('[data-mail-institution]').forEach(el=>el.addEventListener('change',e=>{ui.mailInstitution=e.target.value;render()}));
    document.querySelectorAll('[data-mail-contact-select]').forEach(el=>el.addEventListener('change',()=>{const set=new Set(ui.mailSelectedContacts||[]);el.checked?set.add(el.dataset.mailContactSelect):set.delete(el.dataset.mailContactSelect);ui.mailSelectedContacts=[...set];const h=document.querySelector('.mailAudienceHead h3');if(h)h.textContent=mailAudienceSummary();const send=document.querySelector('[data-mail-send]');if(send)send.disabled=!mailDesk.backendReady||!mailSelectedEligibleContacts().length;}));
    document.querySelectorAll('[data-mail-select-filtered]').forEach(el=>el.addEventListener('click',()=>{const set=new Set(ui.mailSelectedContacts||[]);mailFilteredContacts().filter(mailEligibleContact).forEach(c=>set.add(c.id));ui.mailSelectedContacts=[...set];render()}));
    document.querySelectorAll('[data-mail-contact-form]').forEach(el=>el.addEventListener('submit',e=>{e.preventDefault();addMailContact(el)}));
    document.querySelectorAll('[data-mail-contact-status]').forEach(el=>el.addEventListener('change',()=>updateMailContactField(el.dataset.mailContactStatus,'status',el.value)));
    document.querySelectorAll('[data-mail-contact-basis]').forEach(el=>el.addEventListener('change',()=>updateMailContactField(el.dataset.mailContactBasis,'marketing_basis',el.value)));
    document.querySelectorAll('[data-mail-save-draft]').forEach(el=>el.addEventListener('click',()=>saveMailCampaign('draft',false)));
    document.querySelectorAll('[data-mail-test]').forEach(el=>el.addEventListener('click',()=>saveMailCampaign('send',true)));
    document.querySelectorAll('[data-mail-send]').forEach(el=>el.addEventListener('click',()=>{if(confirm(`Send this email to ${mailSelectedEligibleContacts().length} eligible contact${mailSelectedEligibleContacts().length===1?'':'s'} from info@pharmaservice.ae?`))saveMailCampaign('send',false)}));
    document.querySelectorAll('[data-public-enquiry]').forEach(el=>el.addEventListener('submit',submitPublicEnquiry));
    document.querySelectorAll('[data-mvp-login]').forEach(el=>el.addEventListener('click',signIn));
    document.querySelectorAll('[data-signout]').forEach(el=>el.addEventListener('click',signOut));
    document.querySelectorAll('[data-template]').forEach(el=>el.addEventListener('click',()=>applyTemplate(el.dataset.template)));
    document.querySelectorAll('[data-quick-add]').forEach(el=>el.addEventListener('click',()=>{const sku=el.dataset.quickAdd;const input=document.querySelector(`[data-quick-qty="${sku}"]`);addBasket(sku,Math.max(1,Number(input.value||1)))}));
    document.querySelectorAll('[data-request-reorder]').forEach(el=>el.addEventListener('click',()=>reorderRequest(el.dataset.requestReorder)));

    document.querySelectorAll('[data-replenish]').forEach(el=>el.addEventListener('click',()=>{const [sku,q]=el.dataset.replenish.split('|');addBasket(sku,Math.max(1,Number(q)||1));toast('<strong>Added to request.</strong><br>Previous delivered quantity restored.')}));
    document.querySelectorAll('[data-reorder-order]').forEach(el=>el.addEventListener('click',()=>reorderRequest(el.dataset.reorderOrder)));
    document.querySelectorAll('[data-confirm-quote]').forEach(el=>el.addEventListener('click',async()=>{try{await updateCustomerQuote(el.dataset.confirmQuote,'confirm');toast('<strong>Quotation confirmed.</strong><br>PSC will confirm the fulfilment and delivery timing for this order.')}catch(e){console.error(e);toast('<strong>Could not confirm quotation.</strong>')}}));
    document.querySelectorAll('[data-cancel-quote]').forEach(el=>el.addEventListener('click',async()=>{try{await updateCustomerQuote(el.dataset.cancelQuote,'cancel');toast('<strong>Quotation cancelled.</strong><br>It will remain visible for 30 days before moving to Archive.')}catch(e){console.error(e);toast('<strong>Could not cancel quotation.</strong>')}}));
    document.querySelectorAll('[data-reorder-last]').forEach(el=>el.addEventListener('click',()=>{const r=state.requests.find(x=>x.campus===state.campus);if(r)reorderRequest(r.id)}));
    document.querySelectorAll('[data-request-view]').forEach(el=>el.addEventListener('click',()=>{ui.modal={type:'request',id:el.dataset.requestView,admin:false};render()}));
    document.querySelectorAll('[data-admin-request]').forEach(el=>el.addEventListener('click',()=>{ui.modal={type:'request',id:el.dataset.adminRequest,admin:true};render()}));
    document.querySelectorAll('[data-modal-close]').forEach(el=>el.addEventListener('click',closeModalOverlay));
    document.querySelectorAll('[data-document-open]').forEach(el=>el.addEventListener('click',()=>openOrderDocument(el.dataset.documentOpen)));
    document.querySelectorAll('[data-document-upload]').forEach(el=>el.addEventListener('change',async e=>{const file=e.target.files?.[0];if(file)await uploadOrderDocument(el.dataset.documentUpload,file);}));
    const cq=document.querySelector('[data-cat-q]'); if(cq)cq.addEventListener('input',e=>{ui.catalogueQuery=e.target.value;renderUi({preserveScroll:true,focusSelector:'[data-cat-q]',cursor:e.target.selectionStart,transition:false})});
    document.querySelectorAll('[data-clinic-need]').forEach(el=>el.addEventListener('click',()=>{ui.catalogueNeed=el.dataset.clinicNeed||'all';render()}));
    document.querySelectorAll('[data-cat-filter]').forEach(el=>el.addEventListener('change',e=>{if(el.dataset.catFilter==='category')ui.catalogueCat=e.target.value;else ui.catalogueFilter=e.target.value;renderUi({preserveScroll:true,transition:false})}));
    const pq=document.querySelector('[data-prod-q]'); if(pq)pq.addEventListener('input',e=>{ui.productQuery=e.target.value;render()});
    document.querySelectorAll('[data-prod-filter]').forEach(el=>el.addEventListener('change',e=>{if(el.dataset.prodFilter==='category')ui.productCat=e.target.value;else ui.evidence=e.target.value;render()}));
    document.querySelectorAll('[data-stock-count]').forEach(el=>el.addEventListener('change',e=>{const i=Number(el.dataset.stockCount);state.stock[i].onHand=Number(e.target.value);state.stock[i].status=state.stock[i].onHand<=state.stock[i].reorderAt?'Reorder candidate':state.stock[i].status==='Reorder candidate'?'Good':state.stock[i].status;save();render()}));
    document.querySelectorAll('[data-stock-expiry]').forEach(el=>el.addEventListener('change',e=>{state.stock[Number(el.dataset.stockExpiry)].expiry=e.target.value;save()}));
    document.querySelectorAll('[data-stock-save]').forEach(el=>el.addEventListener('click',()=>{audit('Stock counts saved',state.campus);toast('<strong>Saved.</strong> Demo stock register updated.')}));
    document.querySelectorAll('[data-product-field]').forEach(el=>el.addEventListener('change',e=>{const[sku,field]=el.dataset.productField.split('|');state.productOverrides[sku]=state.productOverrides[sku]||{};const val=e.target.value.trim();state.productOverrides[sku][field]=val===''?undefined:Number(val);audit('Product master updated',`${sku} ${field}`);save();render();toast(`<strong>${sku}</strong> updated locally`)}));
    document.querySelectorAll('[data-quote-field]').forEach(el=>el.addEventListener('change',e=>{const[id,key,field]=el.dataset.quoteField.split('|');const r=state.requests.find(x=>x.id===id);r.quote=r.quote||{lines:{}};r.quote.lines=r.quote.lines||{};r.quote.lines[key]=r.quote.lines[key]||{};const val=e.target.value;r.quote.lines[key][field]=val===''?undefined:Number(val);if(field==='cost')r.quote.lines[key].costEvidence='Manual entry — evidence required';audit('Quote line updated',`${id} ${key} ${field}`);save();render()}));
    document.querySelectorAll('[data-quote-meta]').forEach(el=>el.addEventListener('change',e=>{const[id,field]=el.dataset.quoteMeta.split('|');const r=state.requests.find(x=>x.id===id);r.quote=r.quote||{lines:{}};r.quote[field]=e.target.value;audit('Quote terms updated',`${id} ${field}`);save()}));
    document.querySelectorAll('[data-request-status]').forEach(el=>el.addEventListener('change',e=>{const r=state.requests.find(x=>x.id===el.dataset.requestStatus);r.status=e.target.value;if(r.status==='Sent'&&!r.quoteRef)r.quoteRef=`PSC-Q-${new Date().getFullYear()}-${String(state.requests.indexOf(r)+1001).padStart(4,'0')}`;audit('Request status changed',`${r.id} → ${r.status}`);save();render()}));
    document.querySelectorAll('[data-quote-ref]').forEach(el=>el.addEventListener('change',e=>{const r=state.requests.find(x=>x.id===el.dataset.quoteRef);r.quoteRef=e.target.value;audit('Quote reference updated',r.id);save()}));
    document.querySelectorAll('[data-approve-quote]').forEach(el=>el.addEventListener('click',()=>{const r=state.requests.find(x=>x.id===el.dataset.approveQuote);r.status='Authorized';audit('Quotation confirmed by demo account user',r.id);save();render();toast('<strong>Quotation confirmed.</strong><br>PSC will confirm the fulfilment and delivery timing for this order.')}));
    document.querySelectorAll('[data-export-products]').forEach(el=>el.addEventListener('click',exportProducts));

    const optionSearch=document.querySelector('[data-option-search]'); if(optionSearch)optionSearch.addEventListener('input',e=>{ui.optionSearch=e.target.value;renderUi({preserveScroll:true,focusSelector:'[data-option-search]',cursor:e.target.selectionStart,transition:false})});
    const optionDecision=document.querySelector('[data-option-decision]'); if(optionDecision)optionDecision.addEventListener('change',e=>{ui.optionDecision=e.target.value;renderUi({preserveScroll:true,transition:false})});
    document.querySelectorAll('[data-option-family-open]').forEach(el=>el.addEventListener('click',()=>{ui.optionFamily=el.dataset.optionFamilyOpen||'all';ui.optionSearch='';ui.optionDecision='All';render()}));
    document.querySelectorAll('[data-option-save]').forEach(el=>el.addEventListener('click',async()=>{await saveFamilyOptionReview(el.dataset.optionSave)}));
    document.querySelectorAll('[data-option-field="decision"]').forEach(el=>el.addEventListener('change',()=>{const card=el.closest('[data-option-review]');if(!card)return;const active=el.value==='APPROVE';const sel=card.querySelector('[data-option-field="selectable"]');const pref=card.querySelector('[data-option-field="preferred"]');if(!active){if(sel){sel.checked=false;sel.disabled=true;}if(pref){pref.checked=false;pref.disabled=true;}}else{if(sel)sel.disabled=false;if(pref)pref.disabled=false;}}));

    document.querySelectorAll('[data-cms-channel]').forEach(el=>el.addEventListener('click',()=>{ui.cmsChannel=el.dataset.cmsChannel;render()}));
    const cmsSearch=document.querySelector('[data-cms-search]'); if(cmsSearch)cmsSearch.addEventListener('input',e=>{ui.cmsSearch=e.target.value;render()});
    document.querySelectorAll('[data-save-storefront]').forEach(el=>el.addEventListener('click',async()=>{try{await saveStorefrontConfig(el.dataset.saveStorefront)}catch(e){console.error(e);toast('<strong>Could not save storefront.</strong>')}}));
    document.querySelectorAll('[data-cms-save]').forEach(el=>el.addEventListener('click',async()=>{try{await saveCmsProduct(el.dataset.cmsSave,false)}catch(e){console.error(e);toast('<strong>Could not save product.</strong>')}}));
    document.querySelectorAll('[data-cms-publish]').forEach(el=>el.addEventListener('click',async()=>{try{await saveCmsProduct(el.dataset.cmsPublish,true)}catch(e){console.error(e);toast('<strong>Could not publish product.</strong>')}}));
    document.querySelectorAll('[data-cms-image-upload]').forEach(el=>el.addEventListener('change',async e=>{try{const file=e.target.files?.[0];if(file)await uploadCmsImage(el.dataset.cmsImageUpload,file)}catch(err){console.error(err);toast('<strong>Image upload failed.</strong>')}}));
    document.querySelectorAll('[data-cms-primary]').forEach(el=>el.addEventListener('click',async()=>{try{const[p,m]=el.dataset.cmsPrimary.split('|');await setCmsPrimaryImage(p,m)}catch(err){console.error(err);toast('<strong>Could not update image.</strong>')}}));
    document.querySelectorAll('[data-cms-delete-media]').forEach(el=>el.addEventListener('click',async()=>{try{const[p,m]=el.dataset.cmsDeleteMedia.split('|');await deleteCmsImage(p,m)}catch(err){console.error(err);toast('<strong>Could not remove image.</strong>')}}));

    const wq=document.querySelector('[data-wholesale-q]'); if(wq)wq.addEventListener('input',e=>{ui.wholesaleQuery=e.target.value;render()});
    document.querySelectorAll('[data-wholesale-cat]').forEach(el=>el.addEventListener('change',e=>{ui.wholesaleCat=e.target.value;render()}));
  }

  function applyTemplate(name){
    const map={
      'Monthly Refill':['PSC-WND-001','PSC-WND-002','PSC-WND-003','PSC-WND-005','PSC-DSP-001'],
      'First Aid Refill':['PSC-WND-001','PSC-WND-002','PSC-WND-005','PSC-WND-006','PSC-INF-001'],
      'New Term Restock':['PSC-WND-001','PSC-WND-003','PSC-DIA-003','PSC-RES-001','PSC-DSP-001'],
      'Sports Day Kit':['PSC-WND-005','PSC-WND-006','PSC-DSP-001','PSC-INF-001']
    };
    (map[name]||[]).forEach(s=>{const f=state.basket.find(x=>x.sku===s);if(f)f.qty+=2;else state.basket.push({sku:s,qty:2})});save();render();toast(`<strong>${esc(name)}</strong> added to request`);
  }

  function exportProducts(){
    const headers=['psc_sku','supplier_sku','brand','product_name','pack','category','supplier','supplier_cost','public_retail_benchmark','account_price','evidence_status','regulated','school_approved','last_verified'];
    const rows=products().map(p=>headers.map(h=>({psc_sku:p.pscSku,supplier_sku:p.supplierSku||'',brand:p.brand,product_name:p.name,pack:p.pack,category:p.category,supplier:p.supplier,supplier_cost:Number.isFinite(Number(p.supplierCost))?p.supplierCost:'',public_retail_benchmark:p.retailBenchmark||'',account_price:Number.isFinite(Number(p.contractPrice))?p.contractPrice:'',evidence_status:p.evidenceStatus,regulated:p.regulated,school_approved:p.schoolApproved,last_verified:p.lastVerified}[h])));
    const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='PSC_Product_Master_Demo.csv';a.click();URL.revokeObjectURL(url);toast('<strong>Exported.</strong> Product master CSV downloaded.');
  }

  window.addEventListener('scroll',onPublicHeaderScroll,{passive:true});
  window.addEventListener('hashchange',render);
  window.addEventListener('popstate',render);
  if(!location.hash && !location.pathname.startsWith('/workshop')) location.hash='home';
  bootstrapAuth();
})();
