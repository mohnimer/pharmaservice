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
  let customerLoadVersion=0;
  const buyerView={groupRows:null,groupLoading:false,groupError:'',groupOpen:false,documentType:'',dateFrom:'',campusFilter:'',requestsError:''};

  let state = load();
  const draftHistory=new Map();
  const draftKey=()=>`${session?.user?.id||'anonymous'}:${state.activeSchoolId||'draft'}`;
  const draftSnapshot=()=>JSON.parse(JSON.stringify({basket:state.basket||[],scope:state.scopesBySchool?.[state.activeSchoolId||'draft']||{institution:'',location:'',sites:null,orderType:'',retained:[],quantityConfirmation:false}}));
  function draftCheckpoint(){
    const key=draftKey();if(!draftHistory.has(key))draftHistory.set(key,{current:draftSnapshot(),undo:[]});
    return draftHistory.get(key);
  }
  function trackDraftChange(){
    const history=draftCheckpoint(),next=draftSnapshot();
    if(JSON.stringify(history.current)===JSON.stringify(next))return;
    history.undo.push(history.current);history.undo=history.undo.slice(-10);history.current=next;
  }
  function clearDraftUndo(){draftHistory.set(draftKey(),{current:draftSnapshot(),undo:[]});}
  function draftUndoControl(){
    return draftCheckpoint().undo.length?'<div class="psDraftUndo"><span>Draft changes can be reversed.</span><button type="button" class="textAction" data-ps-undo>Undo last change</button></div>':'';
  }
  function undoDraftChange(){
    const history=draftCheckpoint(),previous=history.undo.pop();if(!previous)return;
    state.basket=JSON.parse(JSON.stringify(previous.basket));state.scopesBySchool=state.scopesBySchool||{};
    if(previous.scope)state.scopesBySchool[state.activeSchoolId||'draft']=JSON.parse(JSON.stringify(previous.scope));
    else delete state.scopesBySchool[state.activeSchoolId||'draft'];
    history.current=draftSnapshot();
    resetIntelligentSearch();const memory=productSearchMemory();memory.selectedSku=state.basket.at(-1)?.sku||state.basket.at(-1)?.familyId||'';memory.terms='';memory.size='';memory.resultIds=[];
    ui.catalogueQuery='';ui.globalSearch='';save();renderUi({preserveScroll:true,transition:false});toast('<strong>Last draft change undone.</strong><br>No submitted order was changed.');
  }
  const demoSession = {initialized:false, requestsBySchool:{}};
  let ui = { mobile:false, publicMenu:false, basket:false, modal:null, accountMenu:false, globalSearch:'', catalogueQuery:'', catalogueNeed:'all', catalogueCat:'All product types', catalogueFilter:'All lines', productQuery:'', productCat:'All', evidence:'All', cmsChannel:'institutional', cmsSearch:'', wholesaleQuery:'', wholesaleCat:'All', workshopQuery:'', workshopCategory:'All', tourStep:0, overlayScroll:0, mailTab:'sales', mailSearch:'', mailRole:'All', mailInstitution:'All', mailTemplate:'workshop', mailGuideSlug:'aed-has-expiring-parts-too', mailSelectedContacts:[], mailDraftSubject:'', mailDraftIntro:'', mailDraftCta:'Read the guide', optionSearch:'', optionDecision:'All', optionFamily:'all' };

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
    senderEmail:'mohamed@pharmaservice.ae'
  };


  const optionDesk = {
    loaded:false,
    loading:false,
    families:[],
    options:[]
  };

  const INSTITUTIONAL_CATALOGUE_TEMPLATE = {
    id:'institutional-catalogue-v1',
    name:'PS Institutional Catalogue',
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
  const DHA_ESSENTIAL_CATEGORIES = [
    {id:'dha-medicines',label:'DHA-required medicines',icon:'medicines',bg:'#F7A7B8',ink:'#5A2030'},
    {id:'dha-equipment',label:'DHA-required equipment',icon:'equipment',bg:'#DDBA9B',ink:'#4A3323'},
    {id:'dha-consumables',label:'DHA-required consumables',icon:'procedures',bg:'#AEC1F7',ink:'#233D72'}
  ].map(c=>({...c,note:'Products mapped to DHA educational clinic requirements in the PSC catalogue. Conditional requirements and alternatives apply where indicated.'}));
  function dhaEssentialGroup(p){
    if(!p.dhaMapped) return null;
    const section=String(p.dhaReference||p.dhaSection||'').match(/Appendix\s*3\s*([A-D])/i)?.[1]?.toUpperCase();
    if(section==='D'||(!section&&p.productType==='Medicines')) return 'dha-medicines';
    if(['A','B'].includes(section)||(!section&&['Equipment & Furniture','Diagnostics & Devices','Devices & Accessories'].includes(p.productType))) return 'dha-equipment';
    return 'dha-consumables';
  }
  function clinicalNeedMatches(p,id){ return id.startsWith('dha-') ? dhaEssentialGroup(p)===id : id==='all' || clinicalNeedIds(p).includes(id); }
  function clinicalNeedMeta(id){ return DHA_ESSENTIAL_CATEGORIES.find(c=>c.id===id)||INSTITUTIONAL_CATALOGUE_TEMPLATE.categories.find(c=>c.id===id)||INSTITUTIONAL_CATALOGUE_TEMPLATE.categories.at(-1); }
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
      sports:'/assets/category-sports.png?v=3915',
      breathing:'/assets/category-breathing.webp?v=3777',
      vitals:'/assets/category-vitals.webp?v=3777',
      screening:'/assets/category-screening.png?v=3915',
      diabetes:'/assets/category-diabetes.png?v=3915',
      medicines:'/assets/category-medicines.png?v=3915',
      allergy:'/assets/category-allergy.png?v=3915',
      patient:'/assets/category-patient-care.png?v=3915',
      'patient-care':'/assets/category-patient-care.png?v=3915',
      infection:'/assets/category-infection.png?v=3915',
      procedures:'/assets/category-procedures.png?v=3915',
      emergency:'/assets/category-emergency.webp?v=3777',
      equipment:'/assets/category-equipment.webp?v=3777'
    };
    return m[id] ? `<img src="${m[id]}" alt="" loading="lazy" decoding="async">` : clinicalNeedIcon(id);
  }

  function load(){
    try { const raw = JSON.parse(localStorage.getItem(STORAGE)||'null'); return raw&&!raw.ownerUserId&&!raw.accountEmail ? {...JSON.parse(JSON.stringify(seed)),...raw} : JSON.parse(JSON.stringify(seed)); }
    catch { return JSON.parse(JSON.stringify(seed)); }
  }
  function save(){
    trackDraftChange();
    if(isDemoAccount()){
      if(state.activeSchoolId){
        state.basketsBySchool[state.activeSchoolId]=state.basket||[];
        demoSession.requestsBySchool[state.activeSchoolId]=JSON.parse(JSON.stringify(state.requests));
      }
      return; // Simulated state never overwrites persisted live-account state.
    }
    try{
      if(state.activeSchoolId){
        state.basketsBySchool=state.basketsBySchool||{};
        state.basketsBySchool[state.activeSchoolId]=state.basket||[];
      }
      if(session?.user?.id)state.ownerUserId=session.user.id;
      localStorage.setItem(session?.user?.id?STORAGE+':'+session.user.id:STORAGE, JSON.stringify(state));
    }catch{}
  }
  function esc(v=''){ return String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[c])); }
  function money(n){ return Number.isFinite(Number(n)) ? `AED ${Number(n).toFixed(2)}` : '—'; }
  function date(v){ if(!v||!Number.isFinite(Date.parse(v)))return 'Date not recorded';return new Date(v).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }
  function friendlyStatus(status){
    return ({Drafting:'Under Review',Sent:'Quote Sent',Authorized:'Confirmed',Procurement:'Under Process',Delivery:'Under Process',Accepted:'Delivered',Cancelled:'Cancelled'})[status] || status;
  }
  function customerStatusPill(status){ const label=authContext&&!authContext.isPscAdmin&&!isDemoAccount()?window.PSC_BUYER_JOURNEY.statusLabel(status):friendlyStatus(status); const k=label.toLowerCase().replace(/\s+/g,'-'); return `<span class="statusPill status-${k}">${esc(label)}</span>`; }
  function expectedDeliveryLabel(r){
    if(r?.expectedDeliveryDate) return `Expected delivery · ${date(r.expectedDeliveryDate)}`;
    if(r?.status==='Delivery') return 'Out for delivery · arrival time not recorded';
    if(['Authorized','Procurement'].includes(r?.status)) return 'Delivery timing will be confirmed by PS';
    return '';
  }
  function addDaysLabel(v,days){ const d=new Date(v); d.setDate(d.getDate()+days); return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }
  function isArchived(r){ return r.databaseStatus==='archived'||r.status==='Cancelled' && r.cancelledAt && ((Date.now()-new Date(r.cancelledAt).getTime())/(1000*60*60*24) >= 30); }
  function customerAccountRequests(){return state.requests.filter(r=>r.schoolId?r.schoolId===state.activeSchoolId:r.campus===state.campus);}
  function customerVisibleRequests(){ return customerAccountRequests().filter(r=>!isArchived(r)); }
  function accountEmailLabel(){ return state.accountEmail || 'your registered account email'; }
  function schoolLabel(s){
    if(!s) return 'Institutional account';
    return [s.name,s.campus_name].filter(Boolean).join(' — ');
  }
  function availableSchools(){ return (authContext?.schools||[]).filter(Boolean); }
  function canSwitchSchools(){ return !authContext?.isPscAdmin && availableSchools().length>1; }
  function isDemoAccount(){ return authContext?.group?.slug==='psc-demo-group'; }
  window.PSC_IS_DEMO_ACCOUNT=isDemoAccount;

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
      if(!sku || seen.has(sku) || p.localCatalogueRefresh) return;
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

    (D.products||[]).forEach(p=>{ if(!p.localCatalogueRefresh) p.catalogueVisible=false; });
    // Prefer the authoritative institutional line over an old PS wholesale/master alias.
    const ordered=[...rows].sort((a,b)=>Number(b.psc_sku.startsWith('INST-'))-Number(a.psc_sku.startsWith('INST-')));
    ordered.forEach(r=>{
      let item=byCatalogueId.get(r.psc_sku)||bySku.get(r.psc_sku);
      if(item?.catalogueTransactionId!==r.psc_sku && item?.catalogueTransactionId && preferredIds.has(item.catalogueTransactionId)) return;
      if(item?.localCatalogueRefresh) { item.storefrontDbId=r.product_id; return; }
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
      toast('<strong>Could not load family options.</strong><br>Check the PS admin connection and database permissions.');
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
        <div><span>ACORUS LISTED MRP</span><b>${mrp}</b><small>Internal retail benchmark only — never PS selling price</small></div>
      </div>
      <div class="familyOptionControlGrid">
        <label><span>PS decision</span><select data-option-field="decision"><option ${o.psc_decision==='VERIFY'?'selected':''}>VERIFY</option><option ${o.psc_decision==='APPROVE'?'selected':''}>APPROVE</option><option ${o.psc_decision==='HOLD'?'selected':''}>HOLD</option><option ${o.psc_decision==='REJECT'?'selected':''}>REJECT</option></select></label>
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
          <label><span>PS sell ex VAT</span><input data-option-field="sell-price" type="number" min="0.01" step="0.01" value="${o.public_sell_price_ex_vat===null?'':esc(o.public_sell_price_ex_vat)}" placeholder="AED"></label>
          <label><span>Verified VAT %</span><input data-option-field="vat-rate" type="number" min="0" max="100" step="0.01" value="${o.vat_rate_pct===null?'':esc(o.vat_rate_pct)}" placeholder="0 or 5 when verified"></label>
          <label><span>Supplier quote date</span><input data-option-field="price-quote-date" type="date" value="${esc(o.price_quote_date||'')}"></label>
          <label><span>Price valid to</span><input data-option-field="price-valid-to" type="date" value="${esc(o.price_valid_to||'')}"></label>
          <label class="familyPricingWide"><span>Price source / reference</span><input data-option-field="price-source" value="${esc(o.price_source_reference||'')}" placeholder="Supplier quote / written confirmation reference"></label>
          <label class="familyPricingWide"><span>VAT evidence note</span><input data-option-field="vat-evidence" value="${esc(o.vat_evidence_note||'')}" placeholder="Verified treatment and evidence source"></label>
          <label class="familyPricingWide"><span>Margin override reason</span><input data-option-field="margin-override" value="${esc(o.margin_override_reason||'')}" placeholder="Required only when live GM is below target"></label>
          <label class="familyPricingWide"><span>Pricing note</span><textarea data-option-field="pricing-note" rows="2">${esc(o.pricing_note||'')}</textarea></label>
        </div>
        <p class="familyPricingRule">Publication gate: complete acquisition + direct-cost inputs, current verified price evidence, VAT evidence, valid dates, APPROVE + customer-selectable option, and target margin or a recorded override. Acorus MRP is never used in this calculation.</p>
      </details>`:`<div class="familyOptionQuoteOnly"><b>Request-quote family</b><span>${esc(family.website_price_treatment||'Request quote')} · Supplier MRP and internal benchmarks cannot become a public PS price.</span></div>`}

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
    if(customerSelectable && decision!=='APPROVE'){ toast('<strong>Cannot publish this option yet.</strong><br>Customer-selectable requires PS Decision = APPROVE.'); return; }
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
      const numericFields=[['freight / delivery cost',freight],['install / labour cost',install],['FOC / other direct cost',other],['target GM',targetPct],['PS sell price',sell],['VAT rate',vatRate]];
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
        if(sell.value===null || sell.value<=0){ toast('<strong>PS selling price is required.</strong><br>Enter the approved ex-VAT selling price.'); return; }
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


  let mailPreviousRoute='',mailRefreshInFlight=false;
  window.PSC_REFRESH_MAIL=async()=>{if(mailRefreshInFlight)return;mailRefreshInFlight=true;try{await loadAdminMail();if(currentRoute()==='admin/mail')render();}finally{mailRefreshInFlight=false}};
  window.addEventListener('psc-contacts-changed',()=>{mailDesk.loaded=false;window.PSC_REFRESH_MAIL()});
  window.PSC_MAIL_ADD_CONTACT=()=>{
    const d=document.createElement('dialog');d.className='wsDialog';
    d.innerHTML='<div class="wsDialogHead"><h2>Add contact</h2><button type="button" data-close aria-label="Close">×</button></div><p>Save the contact once and use it for your business emails.</p>'+new DOMParser().parseFromString(adminMailContacts(),'text/html').querySelector('form').outerHTML+'<p role="status" data-contact-error></p>';
    document.body.append(d);d.querySelector('[data-close]').onclick=()=>d.close();d.onclose=()=>d.remove();
    d.querySelector('form').onsubmit=async e=>{e.preventDefault();const b=d.querySelector('[type=submit]');b.disabled=true;try{if(await addMailContact(e.target,true))d.close();}finally{if(b.isConnected)b.disabled=false}};d.showModal();
  };
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
  function mailEligibleContact(c){ return c.status==='active' && !c.unsubscribed_at && ['manual_permission','requested_updates'].includes(c.marketing_basis); }
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
    if(ui.mailTemplate==='custom') return 'One contact for your clinic supplies';
    if(ui.mailTemplate==='supply-note') return 'A quick supply note from Pharma Service';
    return g?.title||'From Pharma Service';
  }
  function mailCampaignIntro(){
    const g=mailGuide();
    if((ui.mailDraftIntro||'').trim()) return ui.mailDraftIntro.trim();
    if(ui.mailTemplate==='custom') return 'Hello,\n\nI’m Mohamed from Pharma Service in Dubai. We help schools, clinics and institutions organise their medical supplies through one point of contact. Send us your clinic list, replenishment needs or an existing specification, and we’ll review the requirement, source suitable options and prepare one clear quotation.\n\nWould you be the right person to speak with about clinic purchasing, or could you point me to the colleague who handles it?\n\nMohamed Hassan Al Nimer\nManaging Director | Pharma Service Co. L.L.C.\ninfo@pharmaservice.ae';
    if(ui.mailTemplate==='clinic-check') return g?.excerpt||'A practical check worth adding to the clinic routine.';
    if(ui.mailTemplate==='supply-note') return 'A short note from Pharma Service on the products, replacements and small supply details worth keeping visible.';
    return g?.excerpt||'Practical product intelligence from The Workshop.';
  }
  function mailCampaignCta(){ return (ui.mailDraftCta||'').trim() || (ui.mailTemplate==='custom'?'See how Pharma Service works':ui.mailTemplate==='supply-note'?'Browse the institutional catalogue':'Read the guide'); }
  function mailCampaignUrl(){
    const g=mailGuide();
    if(ui.mailTemplate==='custom') return 'https://pharmaservice.ae/#our-model';
    if(ui.mailTemplate==='supply-note') return 'https://pharmaservice.ae/catalogue.html';
    return g?`https://pharmaservice.ae/workshop/${g.slug}`:'https://pharmaservice.ae/workshop';
  }
  function mailCampaignSnapshot(){
    const g=mailGuide();
    return {template:ui.mailTemplate,workshop_slug:['custom','supply-note'].includes(ui.mailTemplate)?null:g?.slug||null,workshop_title:['custom','supply-note'].includes(ui.mailTemplate)?null:g?.title||null,subject:mailCampaignSubject(),intro:mailCampaignIntro(),cta_label:mailCampaignCta(),cta_url:mailCampaignUrl()};
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
    const kicker=['custom','supply-note'].includes(ui.mailTemplate)?'INSTITUTIONAL SUPPLY':'THE WORKSHOP';
    const meta=g&&!['supply-note','custom'].includes(ui.mailTemplate)?`${esc(g.category)} · ${esc(g.read_time||'')}`:'Pharma Service Co. L.L.C.';
    return `<div class="mailPreviewChrome"><div class="mailPreviewTop"><span>From</span><b>Pharma Service &lt;${esc(mailDesk.senderEmail)}&gt;</b></div><div class="mailPreviewSubject"><span>Subject</span><b>${esc(snap.subject)}</b></div><div class="mailEmailCanvas"><div class="mailEmailBrand"><img src="${PSC_LOGO}" alt="Pharma Service"><span>${kicker}</span></div><div class="mailEmailRule"></div><small>${meta}</small><h2>${esc(['custom','supply-note'].includes(ui.mailTemplate)?snap.subject:g?.title||snap.subject)}</h2><p>${esc(snap.intro)}</p>${g?.subtitle&&!['supply-note','custom'].includes(ui.mailTemplate)?`<blockquote>${esc(g.subtitle)}</blockquote>`:''}<a href="${esc(snap.cta_url)}" class="mailEmailCta">${esc(snap.cta_label)}</a><div class="mailEmailFooter"><b>Pharma Service Co. L.L.C.</b><span>Institutional healthcare supply · Dubai, UAE</span><span>Sent from ${esc(mailDesk.senderEmail)}</span><small>Recipients can opt out of future PS marketing emails at any time.</small></div></div></div>`;
  }

  function adminMailCompose(){
    const guides=mailPublishedGuides(); const contacts=mailFilteredContacts(); const selected=new Set(ui.mailSelectedContacts||[]);
    const guideSelect=guides.map(g=>`<option value="${esc(g.slug)}" ${g.slug===mailGuide()?.slug?'selected':''}>${esc(g.title)}</option>`).join('');
    const contactRows=contacts.map(c=>`<label class="mailContactPick ${!mailEligibleContact(c)?'disabled':''}"><input type="checkbox" data-mail-contact-select="${c.id}" ${selected.has(c.id)?'checked':''} ${!mailEligibleContact(c)?'disabled':''}><span><b>${esc([c.first_name,c.last_name].filter(Boolean).join(' ')||c.email)}</b><small>${esc(c.organization||'No organization')} · ${esc(c.role||'Role not set')}</small></span><em>${mailEligibleContact(c)?'Eligible':c.unsubscribed_at||c.status==='unsubscribed'?'Unsubscribed':c.status==='bounced'?'Bounced':c.status==='paused'?'Marketing paused':'Not subscribed · use Sales outreach'}</em></label>`).join('');
    return `<div class="mailComposeGrid"><section class="panel mailComposer"><div class="mailSectionHead"><div><span class="eyebrow">COMPOSE</span><h2>Write your email.</h2></div><span class="mailSenderBadge">FROM · ${esc(mailDesk.senderEmail)}</span></div>
      <div class="mailTemplateRow"><button class="mailTemplateCard" data-mail-tab="sales"><small>SALES</small><b>New prospect</b><span>Open Sales outreach — no marketing subscription needed.</span></button><button class="mailTemplateCard ${ui.mailTemplate==='workshop'?'active':''}" data-mail-template="workshop"><small>01</small><b>Workshop newsletter</b><span>One useful guide, one reason to read it.</span></button><button class="mailTemplateCard ${ui.mailTemplate==='clinic-check'?'active':''}" data-mail-template="clinic-check"><small>02</small><b>Clinic check</b><span>Fast readiness or stock check.</span></button><button class="mailTemplateCard ${ui.mailTemplate==='supply-note'?'active':''}" data-mail-template="supply-note"><small>03</small><b>Supply note</b><span>Replenishment, replacement or catalogue update.</span></button></div>
      ${!['supply-note','custom'].includes(ui.mailTemplate)?`<label class="fieldLabel">Workshop guide</label><select class="input mailFull" data-mail-guide>${guideSelect}</select>`:''}
      <label class="fieldLabel">Subject</label><input class="input mailFull" data-mail-subject value="${esc(mailCampaignSubject())}" maxlength="160">
      <label class="fieldLabel">Opening note</label><textarea class="textarea mailFull" data-mail-intro rows="4" maxlength="1200">${esc(mailCampaignIntro())}</textarea>
      <label class="fieldLabel">CTA label</label><input class="input mailFull" data-mail-cta value="${esc(mailCampaignCta())}" maxlength="80">
      <div class="mailAudienceHead"><div><span class="eyebrow">TO</span><h3>${esc(mailAudienceSummary())}</h3></div><button class="button outline" type="button" data-add-outreach-contact>Add contact</button><button class="textAction" data-mail-select-filtered>Select subscribed people shown</button></div>
      <div class="mailAudienceFilters"><input class="input" placeholder="Search contacts…" value="${esc(ui.mailSearch)}" data-mail-search><select class="input" data-mail-role>${mailRoleOptions().map(x=>`<option ${x===ui.mailRole?'selected':''}>${esc(x)}</option>`).join('')}</select><select class="input" data-mail-institution>${mailInstitutionOptions().map(x=>`<option ${x===ui.mailInstitution?'selected':''}>${esc(x)}</option>`).join('')}</select></div>
      <div class="mailContactPicker">${contactRows||`<div class="emptyState"><h3>No contacts yet.</h3><p>Use Add contact above. Contacts saved under Customers appear here too.</p></div>`}</div>
      <p class="wsNotice">Marketing is sent from outreach@pharmaservice.ae. Select subscribed contacts, then review and approve the exact campaign. Each recipient receives a private copy with an unsubscribe link. Initial limit: 100 attempts per rolling 24 hours, paced at one per minute.</p><div class="mailComposerActions"><button class="button light" data-mail-save-draft ${!mailDesk.backendReady?'disabled':''}>Save draft</button><button class="button primary" data-outreach-save-review ${!mailDesk.backendReady||!mailSelectedEligibleContacts().length?'disabled':''}>Save & review campaign</button></div>
      ${!mailDesk.backendReady?`<div class="mailBackendNotice"><b>Campaign records unavailable.</b><span>Refresh and sign in again. Your existing campaigns are not changed.</span></div>`:''}
    </section><aside class="mailPreviewPane"><div class="mailPreviewLabel"><span>EMAIL PREVIEW</span><small>Responsive HTML · no tracking pixels</small></div>${mailPreview()}</aside></div>`;
  }

  function adminMailContacts(){
    const rows=mailDesk.contacts.map(c=>`<tr><td><b>${esc([c.first_name,c.last_name].filter(Boolean).join(' ')||'—')}</b><div class="sub">${esc(c.email)}</div></td><td>${esc(c.organization||'—')}</td><td>${esc(c.role||'—')}</td><td>${esc(c.institution_type||'—')}</td><td><select class="mailInlineSelect" data-mail-contact-status="${c.id}"><option value="active" ${c.status==='active'?'selected':''}>Active</option><option value="paused" ${c.status==='paused'?'selected':''}>Paused</option><option value="unsubscribed" ${c.status==='unsubscribed'?'selected':''}>Unsubscribed</option><option value="bounced" ${c.status==='bounced'?'selected':''}>Bounced</option></select></td></tr>`).join('');
    return `<div class="mailContactsLayout"><section class="panel mailAddContact"><span class="eyebrow">ADD CONTACT</span><h2>Add a person</h2><p class="smallMuted">These are the same people shown under Customers & contacts. A company can have several contacts. Choose a contact in Write email to start a conversation.</p><form data-mail-contact-form><div class="twoCol"><div><label class="fieldLabel">First name</label><input class="input mailFull" name="first_name"></div><div><label class="fieldLabel">Last name</label><input class="input mailFull" name="last_name"></div></div><label class="fieldLabel">Email</label><input class="input mailFull" type="email" name="email" required><label class="fieldLabel">Organization</label><input class="input mailFull" name="organization"><div class="twoCol"><div><label class="fieldLabel">Role</label><select class="input mailFull" name="role">${mailRoleOptions().filter(x=>x!=='All').map(x=>`<option>${esc(x)}</option>`).join('')}</select></div><div><label class="fieldLabel">Institution type</label><select class="input mailFull" name="institution_type">${mailInstitutionOptions().filter(x=>x!=='All').map(x=>`<option>${esc(x)}</option>`).join('')}</select></div></div><label class="fieldLabel">Source / note</label><input class="input mailFull" name="source_note" placeholder="Visit, referral, customer account, event…"><button class="button dark full" type="submit" ${!mailDesk.backendReady?'disabled':''}>Add contact</button></form></section><section class="panel"><div class="panelHeader"><div><h2>Contacts</h2><p>${mailDesk.contacts.length} shared contact${mailDesk.contacts.length===1?'':'s'}</p></div></div><div class="tableWrap"><table class="dataTable"><thead><tr><th>CONTACT</th><th>ORGANIZATION</th><th>ROLE</th><th>TYPE</th><th>STATUS</th></tr></thead><tbody>${rows||'<tr><td colspan="6">No contacts added yet.</td></tr>'}</tbody></table></div></section></div>`;
  }

  function adminMailHistory(){
    const rows=mailDesk.campaigns.map(c=>{const rs=mailDesk.recipients.filter(r=>r.campaign_id===c.id);const sent=c.approved_at?c.sent_count:rs.filter(r=>r.status==='sent').length;const failed=c.approved_at?c.failed_count:rs.filter(r=>['failed','uncertain'].includes(r.status)).length;return `<tr><td><b>${esc(c.subject)}</b><div class="sub">${esc(c.template||'campaign')}</div>${c.status==='draft'&&c.sender_email==='outreach@pharmaservice.ae'?`<button class="button primary" data-outreach-review="${esc(c.id)}">Review & approve</button>`:''}${c.status==='sending'?`<button class="button outline" data-outreach-stop="${esc(c.id)}">Stop remaining emails</button>`:''}<button class="button outline" data-mail-copy="${esc(c.id)}">Open as editable copy</button></td><td>${date(c.created_at)}</td><td>${mailStatusPill(c.status)}</td><td>${c.approved_at?c.recipient_count:rs.length}</td><td>${sent}</td><td>${failed}</td></tr>`}).join('');
    return `<section class="panel"><div class="panelHeader"><div><h2>Drafts & sent</h2><button class="button outline" data-outreach-history-refresh>Update now</button><p>Accepted by Gmail does not confirm inbox delivery. Progress updates automatically every 30 seconds; uncertain sends are held for review.</p></div></div><div class="tableWrap"><table class="dataTable"><thead><tr><th>CAMPAIGN</th><th>CREATED</th><th>STATUS</th><th>RECIPIENTS</th><th>ACCEPTED BY GMAIL</th><th>FAILED / HELD</th></tr></thead><tbody>${rows||'<tr><td colspan="6">No saved campaigns yet.</td></tr>'}</tbody></table></div></section>`;
  }

  function adminMailSettings(){
    return `<section class="panel"><h2>Email sender</h2><p>All outgoing emails use <strong>mohamed@pharmaservice.ae</strong>. Replies go to the same address.</p><button class="button outline" data-email-sender-check>Check sender</button><p data-email-sender-result role="status"></p><button class="button outline" data-go="admin/settings">Open mailbox connection</button></section>`;
  }

  function adminMail(){
    return shell(`<div class="pageHeader mailDeskHeader"><div><span class="eyebrow">EMAIL</span><h1>Inbox</h1><p>Read, reply, write an email or turn a message into a task.</p></div></div><div data-inbox-workspace></div>`,true);
  }

  async function addMailContact(form,selectNew=false){
    if(!sb||!authContext?.isPscAdmin||!mailDesk.backendReady) return;
    const fd=new FormData(form); const email=String(fd.get('email')||'').trim().toLowerCase();
    if(!/^\S+@\S+\.\S+$/.test(email)){toast('<strong>Check the email address.</strong>');return;}
    const payload={first_name:cleanNullable(fd.get('first_name')),last_name:cleanNullable(fd.get('last_name')),email,organization:cleanNullable(fd.get('organization')),role:cleanNullable(fd.get('role')),institution_type:cleanNullable(fd.get('institution_type')),marketing_basis:String(fd.get('marketing_basis')||'not_set'),source_note:cleanNullable(fd.get('source_note')),status:'active',created_by:session?.user?.id||null};
    const existing=mailDesk.contacts.find(c=>c.email.toLowerCase()===email);
    if(existing){const message='This email already exists in the shared contact list. No duplicate was created.';const out=form.closest('dialog')?.querySelector('[data-contact-error]');if(out)out.textContent=message;else toast(message);return false;}
    const {data:added,error}=await sb.from('mail_contacts').insert(payload).select('*').single(); if(error){const out=form.closest('dialog')?.querySelector('[data-contact-error]');const message=error.code==='23505'?'This email already exists. Open the existing contact instead.':'Could not save this contact. Please try again.';if(out)out.textContent=message;else toast(message);return false;}
    await loadAdminMail();if(added)window.dispatchEvent(new CustomEvent('psc-contact-added',{detail:{id:added.id}}));if(selectNew&&added&&mailEligibleContact(added))ui.mailSelectedContacts=[...new Set([...ui.mailSelectedContacts,added.id])];render();toast('<strong>Contact saved in Customers and Outreach.</strong>');return true;
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
    if(status!=='draft'){toast('Campaign delivery is paused. Save the draft for review.');return;}
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
    if(status==='draft'){ await loadAdminMail(); render(); toast('<strong>Draft saved.</strong>'); return campaign.id; }
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

    const review=document.querySelector(`[data-cms-image-review="${productId}"]`);
    if(!review||!Array.from(review.querySelectorAll('input[type=checkbox]')).every(x=>x.checked)){toast('<strong>Review the photograph first.</strong><br>Confirm the exact product and a clean background with no supplier logo.');return;}
    try{await window.PSC_IMAGE_POLICY.checkFile(file);}catch(error){toast(`<strong>Image not accepted.</strong><br>${esc(error.message)}`);return;}
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
    if(primaryUrl && !document.querySelector('[data-cms-publish-image-review]')?.checked)throw new Error('Review the primary photograph and confirm exact identity and no supplier branding before publication.');
    if(primaryUrl && window.PSC_IMAGE_POLICY?.isBlocked(primaryUrl))throw new Error('This supplier-branded photograph is blocked from customer publication.');
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
    // New gallery images become visible only in the channel explicitly published by PS.
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
    if(raw && !window.PSC_IMAGE_POLICY?.isBlocked(raw)){
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
    if(window.PSC_DHA_FAMILY_PHOTOS?.isMixedPhoto(p)) return null;
    if(/^REFERENCE TILE/i.test(p?.imageStatus||'')) return null;
    if(p?.currentImageUrl) return window.PSC_IMAGE_POLICY?.resolve(p.currentImageUrl)||(!window.PSC_IMAGE_POLICY?p.currentImageUrl:null);
    if(p?.localCatalogueRefresh) return null;
    const sku=institutionalImageSku(p);
    if(sku) return `/assets/products/${sku.toLowerCase()}.webp?v=${PRODUCT_ASSET_RELEASE}`;
    const raw=(p?.imageUrl||'').trim();
    if(!raw) return null;
    const lower=raw.toLowerCase();
    const looksLikeStandaloneDhaAsset = lower.includes('dha-requirement') || lower.endsWith('/pharmaservice.png') || lower.endsWith('pharmaservice.png');
    if(p?.dhaMapped && looksLikeStandaloneDhaAsset) return null;
    return window.PSC_IMAGE_POLICY?window.PSC_IMAGE_POLICY.resolve(raw):raw;
  }
  function catalogueImageNote(p){
    if(!p?.localCatalogueRefresh) return '';
    const label=p.workbookDecision==='ENQUIRY ONLY'?'Enquiry only · exact product and pack to verify':!p.currentImageUrl?'':'';
    return label?`<small class="catalogueImageNote">${esc(label)}</small>`:'';
  }
  function controlledProductImageUrl(p){
    if(window.PSC_DHA_FAMILY_PHOTOS?.isMixedPhoto(p)) return null;
    if(/^REFERENCE TILE/i.test(p?.imageStatus||'')) return null;
    if(p?.currentImageUrl) return window.PSC_IMAGE_POLICY?.resolve(p.currentImageUrl)||(!window.PSC_IMAGE_POLICY?p.currentImageUrl:null);
    if(p?.localCatalogueRefresh) return null;
    const sku=institutionalImageSku(p);
    if(sku) return `/assets/products/${sku.toLowerCase()}.webp?v=${PRODUCT_ASSET_RELEASE}`;
    return window.PSC_IMAGE_POLICY?.resolve((p?.image_url||p?.imageUrl||'').trim())||(!window.PSC_IMAGE_POLICY?(p?.image_url||p?.imageUrl||'').trim():null);
  }
  function products(){ return D.products.map(p=>product(p.pscSku)); }
  function currentRoute(){
    const path=location.pathname.replace(/\/+$/,'');
    if(location.hash && location.hash!=='#home') return location.hash.slice(1).split('?')[0];
    if(path==='/start') return 'start';
    if(path==='/workshop') return 'workshop';
    if(path.startsWith('/workshop/')) return `workshop/${decodeURIComponent(path.split('/')[2]||'')}`;
    if(location.hash) return location.hash.slice(1).split('?')[0];
    return 'home';
  }
  let catalogueSearchRoute = null;
  function go(route,{replace=false,searchQuery=null}={}){
    ui.mobile=false; ui.publicMenu=false; ui.modal=null; ui.basket=false; ui.accountMenu=false;
    if(route.startsWith('portal/catalogue/dha-')&&route!==currentRoute()){ui.catalogueCat='All product types';ui.catalogueFilter='All lines';}
    if(route!==currentRoute()){ resetIntelligentSearch();ui.globalSearch=''; ui.catalogueQuery=''; }
    if(searchQuery!==null){ ui.catalogueQuery=String(searchQuery).trim(); ui.globalSearch=ui.catalogueQuery; }
    catalogueSearchRoute=route;
    const target=route==='start'?'/start':route==='workshop'?'/workshop':route.startsWith('workshop/')?`/workshop/${encodeURIComponent(route.split('/')[1]||'')}`:`/#${route}`;
    history[replace?'replaceState':'pushState']({pscRoute:route},'',target);
    window.scrollTo({top:0,behavior:'instant'});
    render();
    // Retained behavioural layers consume route events as well as DOM updates.
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
  window.PSC_NAVIGATE=go;
  window.PSC_OPEN_SCHOOL_COLLECTION=openSchoolCollection;
  window.PSC_CURRENT_ROUTE=currentRoute;
  window.PS_SEARCH_CATALOGUE=query=>{
    go('portal/catalogue/all',{searchQuery:query});
    const input=document.querySelector('[data-cat-q]');
    if(input){ input.focus({preventScroll:true}); input.setSelectionRange(input.value.length,input.value.length); }
  };
  function renderUi({preserveScroll=true,focusSelector=null,cursor=null,transition=true}={}){
    const y=window.scrollY;
    const motionState=window.PSC_MOTION?.capture();
    const draw=()=>{
      render();
      window.PSC_MOTION?.restore(motionState);
      // Restore focus synchronously: a keystroke before the next animation frame
      // must not land on a detached input or lose the editing caret.
      if(preserveScroll) window.scrollTo({top:y,behavior:'instant'});
      if(focusSelector){
        const target=document.querySelector(focusSelector);
        if(target){ target.focus({preventScroll:true}); if(Number.isInteger(cursor)&&target.setSelectionRange) target.setSelectionRange(cursor,cursor); }
      }
    };
    draw();
  }
  let overlayOpener=null;
  function rememberOverlayOpener(){if(!document.activeElement?.closest('.fluidOverlay,.requestDrawerBackdrop'))overlayOpener=window.PSC_MOTION?.capture()?.focus;}
  function restoreOverlayOpener(){if(overlayOpener)window.PSC_MOTION?.restore({focus:overlayOpener,scroll:[],overlays:[]});}
  function openProductOverlay(sku,publicMode=false){
    window.PSC_MOTION?.finishExits();
    rememberOverlayOpener();
    if(!publicMode)productSearchMemory().selectedSku=sku;
    ui.overlayScroll=window.scrollY;
    ui.modal={type:publicMode?'public-product':'product',sku};
    renderUi({preserveScroll:true});
  }
  function closeModalOverlay(){
    const y=Number.isFinite(ui.overlayScroll)?ui.overlayScroll:window.scrollY;
    window.PSC_MOTION?.exit(document.querySelector('.fluidOverlay'));
    ui.modal=null;
    render();restoreOverlayOpener();
    requestAnimationFrame(()=>window.scrollTo({top:y,behavior:'instant'}));
  }
  function openBasketOverlay(){
    window.PSC_MOTION?.finishExits();
    rememberOverlayOpener();
    ui.overlayScroll=window.scrollY;
    ui.modal=null;
    ui.basket=true;
    renderUi({preserveScroll:true});
  }
  function closeBasketOverlay(){
    const y=Number.isFinite(ui.overlayScroll)?ui.overlayScroll:window.scrollY;
    window.PSC_MOTION?.exit(document.querySelector('.requestDrawerBackdrop'));
    ui.basket=false;
    render();restoreOverlayOpener();
    requestAnimationFrame(()=>window.scrollTo({top:y,behavior:'instant'}));
  }

  function audit(action, detail){ state.audit.unshift({at:new Date().toISOString(),actor:'Demo user',action,detail}); state.audit=state.audit.slice(0,50); save(); }
  function toast(msg){ const old=document.querySelector('.toast'); if(old)old.remove(); const d=document.createElement('div');d.className='toast';d.setAttribute('role','status');d.setAttribute('aria-live','polite');d.innerHTML=msg;$app.appendChild(d);setTimeout(()=>d.remove(),2800); }

  function brand(landing=false){ return landing
    ? `<button class="brand brandButton ${landing?'landingBrand':''}" data-go="home" aria-label="Pharma Service home"><img class="brandImage brandImageLight" src="${PSC_LOGO}" alt="Pharma Service"><span class="brandMeta"><b>INSTITUTIONAL HEALTHCARE SUPPLY</b><small>Dubai, United Arab Emirates</small></span></button>`
    : `<div class="sidebarBrand sidebarBrandEmpty" aria-hidden="true"></div>`; }
  function statusPill(status){ const k=String(status).toLowerCase().replace(/\s+/g,'-'); return `<span class="statusPill status-${k}">${esc(status)}</span>`; }
  function badge(text,tone=''){ return `<span class="badge ${tone}">${esc(text)}</span>`; }
  function icon(name){
    const map={
      users:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/></svg>`,
      calendar:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 11h18M7 15h3M14 15h3"/></svg>`,
      heart:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z"/></svg>`,
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

  window.PSC_UI_ICON=icon;
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
    ['portal/catalogue','Catalogue','boxes'],
    ['portal/baskets','Ready baskets','checklist'],
    ['portal/wishlist','Wishlist','heart'],
    ['portal/requests','Orders & Requests','edit'],
    ['portal/replenish','Reorder','repeat'],
    ['portal/documents','Documents','resource'],
    ['portal/stock','Stock & expiry','stock'],
    ['portal/assets','Clinic assets','assets']
  ];
  const adminNav=[['admin/dashboard','Today','home'],['admin/sales','Sales','reports'],['admin/mail','Inbox','mail'],['admin/requests','Orders & quotations','checklist'],['admin/customers','Accounts','users'],['admin/tasks','Tasks','calendar'],['admin/resources','Products & suppliers','boxes'],['admin/settings','Settings','settings'],['admin/onboarding','Account setup','users']];

  function masterNavigator(){
    const route=currentRoute(),signed=!!(session?.user&&authContext),admin=!!authContext?.isPscAdmin;
    const browse=[['home','Home','home'],[signed?'portal/catalogue':'catalogue','Catalogue','boxes'],[signed?'portal/baskets':'ready-baskets','Ready baskets','checklist'],['start','Send a requirement','edit'],['our-model','How we work','reports'],['workshop','The Workshop','resource'],['contact','Contact Pharma Service','mail']];
    const account=signed?(admin?[...adminNav,['portal/dashboard','Customer portal','home']]:schoolNav.filter(([href])=>isDemoAccount()||!['portal/stock','portal/assets'].includes(href))):[['portal/dashboard','Sign in to your account','users']];
    const link=([href,label,ico])=>`<button class="masterNavLink ${route===href||href==='portal/catalogue'&&route.startsWith('portal/catalogue/')?'is-current':''}" data-go="${href}" ${route===href?'aria-current="page"':''}><span class="masterNavIcon">${icon(ico)}</span><span>${esc(label)}</span></button>`;
    return `<nav class="masterSiteNav" aria-label="Master navigation"><details class="masterDropdown" name="psc-master-navigation"><summary aria-label="Browse website" aria-controls="psBrowseMenu" aria-expanded="false" title="Browse website"><span class="masterTriggerIcon">${icon('boxes')}</span><span class="masterChevron" aria-hidden="true">⌄</span></summary><div class="masterNavPanel" id="psBrowseMenu"><h2>Explore Pharma Service</h2>${browse.map(link).join('')}</div></details><details class="masterDropdown" name="psc-master-navigation"><summary data-account-switcher aria-label="${admin?'Workspace':'Account'} navigation" aria-controls="psAccountMenu" aria-expanded="false" title="${admin?'Workspace':'My account'}"><span class="masterTriggerIcon">${icon('users')}</span><span class="masterChevron" aria-hidden="true">⌄</span></summary><div class="masterNavPanel" id="psAccountMenu"><h2>${signed?admin?'Your workspace':'Your account':'Account access'}</h2>${signed&&!admin?`<div class="masterAccountContext"><b>${esc(state.groupName)}</b><span>${esc(schoolLabel(authContext.school)||state.campus)}</span></div>`:''}${account.map(link).join('')}${signed&&!admin&&canSwitchSchools()?`<section class="masterCampusChoices"><h3>Switch campus</h3>${availableSchools().map(sc=>`<button class="masterCampusOption ${sc.id===authContext.school?.id?'is-current':''}" data-school-select="${esc(sc.id)}"><span>${esc(schoolLabel(sc))}</span>${sc.id===authContext.school?.id?'<small>Current</small>':''}</button>`).join('')}</section>`:''}${signed?`<button class="masterNavLink masterSignOut" data-signout><span class="masterNavIcon">${icon('logout')}</span><span>Sign out</span></button>`:'<p class="masterNavNote">View your quotations, documents and previous requests.</p>'}</div></details></nav>`;
  }
  let masterNavigationEvents=null;
  function bindMasterNavigator(){
    masterNavigationEvents?.abort();masterNavigationEvents=new AbortController();const options={signal:masterNavigationEvents.signal},nav=document.querySelector('.masterSiteNav');if(!nav)return;
    const menus=[...nav.querySelectorAll('details')];menus.forEach(menu=>menu.addEventListener('toggle',()=>{menu.querySelector('summary').setAttribute('aria-expanded',String(menu.open));if(menu.open)menus.filter(m=>m!==menu).forEach(m=>m.open=false);},options));
    document.addEventListener('click',e=>{if(!nav.contains(e.target))menus.forEach(m=>m.open=false);},options);
    document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const open=menus.find(m=>m.open);if(open){e.preventDefault();e.stopImmediatePropagation();open.open=false;open.querySelector('summary').focus();}}, {...options,capture:true});
  }
  function shell(content, admin=false){
    const route=currentRoute();
    const resourceRoutes=['admin/products','admin/family-options','admin/supplier-feed','admin/storefront'];
    if(admin&&resourceRoutes.includes(route))content=`<button class="button outline" data-go="admin/resources">← Products & suppliers</button>`+content;
    if(admin&&route==='admin/fulfilment')content=`<button class="button outline" data-go="admin/settings">← Settings</button>`+content;
    if(!admin&&buyerView.requestsError&&['portal/dashboard','portal/requests','portal/documents','portal/replenish','portal/archive'].includes(route))content=`<section class="emptyState buyerLoadError" role="alert"><h1>Account activity could not be loaded.</h1><p>Your draft is saved on this device. We have not shown cached records as current activity.</p><button class="button primary" data-buyer-retry>Try again</button><button class="button light" data-go="portal/catalogue">Continue browsing</button></section>`;
    const liveCustomerNav=schoolNav.filter(([href])=>isDemoAccount() || !['portal/stock','portal/assets'].includes(href));
    const links=admin?adminNav.filter(([href])=>!['admin/resources','admin/settings','admin/onboarding'].includes(href)):liveCustomerNav;
    const searchValue=esc(ui.globalSearch||'');
    return `<div class="appShell v4Shell v7Shell v7bShell v26Shell v37Shell v38Shell v381Shell pscOperatingShell ${admin?'adminShell':'customerShell'} ${!admin&&route==='portal/dashboard'?'psPortalHomeShell':''}">
      <main class="mainArea v7MainArea v7bMainArea">
        <div class="psAdaptiveHeader masterPortalHeader" data-ps-scroll-header>
        <header class="topbar sleekTopbar v7Topbar v7bTopbar portalHeaderBar">
          <button class="masterSiteBrand" data-go="home" aria-label="Pharma Service home"><img src="${PSC_LOGO}" alt="Pharma Service"></button>
          ${!admin?`<div class="topbarSearch"><span class="searchIcon">${icon('search')}</span><input data-global-search value="${searchValue}" placeholder="Search institutional catalogue…" aria-label="Search institutional catalogue"></div>`:`<div class="topbarAdminTitle"><span>PS</span><b>${esc(adminNav.find(x=>x[0]===route)?.[1]||'Workspace')}</b></div>`}
          <div class="topbarActions topbarActionsV4 masterHeaderActions">${!admin?`<div class="masterCurrentCampus campusPillMain"><small>${esc(state.groupName)}</small><b>${esc(schoolLabel(authContext?.school)||state.campus)}</b></div><button class="button dark pillBasket" data-basket aria-label="Supply Request, ${basketQty()} requested units">Request <b>${basketQty()}</b></button>`:''}${masterNavigator()}</div>
        </header>
        ${!admin?`<div class="mobileSearchRow"><div class="mobileSearchInput"><span class="searchIcon">${icon('search')}</span><input data-global-search value="${searchValue}" placeholder="Search catalogue…" aria-label="Search institutional catalogue"></div><button class="mobileCartButton" data-basket aria-label="Supply Request, ${basketQty()} requested units">Request <b>${basketQty()}</b></button></div>`:''}
        </div>
        ${!admin&&isDemoAccount()?`<div class="demoAccountBanner"><b>DEMO ACCOUNT</b><span>Sample institutional data · Explore freely · Actions are simulated and reset on refresh.</span></div>`:''}
        <div class="contentWrap v7ContentWrap">${content}</div>
      </main>
      ${ui.basket?basketDrawer():''}
      ${ui.modal?modalHtml(ui.modal):''}
    </div>`;
  }


  const publicNav=[
    ['catalogue','Catalogue'],
    ['ready-baskets','Ready baskets'],
    ['our-model','How we work']
  ];
  function publicHeader(active='home'){
    return `<header class="publicHeader v37PublicHeader masterPublicHeader" data-ps-scroll-header><button class="publicLogo" data-go="home" aria-label="Pharma Service home"><img src="${PSC_LOGO}" alt="Pharma Service"></button>${masterNavigator()}</header>`;
  }
  function publicFooter(){ return `<footer class="publicFooter v37PublicFooter"><div><img src="${PSC_LOGO}" alt="Pharma Service"><p>Institutional healthcare supply.<br>One accountable partner.</p></div><div class="publicFooterLinks"><button data-go="start">Send a requirement</button><button data-go="workshop">The Workshop</button><button data-go="contact">Contact</button><button data-go="about">About</button><button data-go="careers">Careers</button><button data-go="media">Media & resources</button></div><div><span>Dubai, United Arab Emirates</span><a href="tel:+97143377004">+971 4 337 7004</a><a href="mailto:info@pharmaservice.ae">info@pharmaservice.ae</a></div></footer>`; }
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
            <img class="publicClinicalArt" src="/assets/category-infection.png?v=3915" alt="" aria-hidden="true">
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
      {n:'03',label:'PS CONTROL',title:'We validate before we quote.',text:'PS checks the exact product, source, current commercial evidence, applicable supply route and delivery before issuing the quotation.',outcome:'The customer gets simplicity. PS keeps control of the complexity behind it.',visual:'control'},
      {n:'04',label:'QUOTE & DELIVERY',title:'A clear decision and a visible next step.',text:'The quotation is sent to the registered account. The school confirms or cancels it, then follows the order through processing and delivery.',outcome:'No WhatsApp archaeology. The commercial history remains attached to the account.',visual:'delivery'},
      {n:'05',label:'REPLENISH',title:'The second order should be easier than the first.',text:'Delivered consumables automatically become available for repeat request, while previously supplied equipment stays visible for reference or another-unit requests.',outcome:'Every completed transaction makes the account easier to service next time.',visual:'repeat'}
    ];
    const i=Math.max(0,Math.min(steps.length-1,ui.tourStep||0)),st=steps[i];
    const visual={
      shop:`<div class="demoMachine shopMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>Curated Clinic Supply</b></div><div class="demoProductGrid"><article><div class="demoPack">GAUZE</div><span>Sterile Gauze</span><small>Requirement mapped</small><button>+</button></article><article><div class="demoPack diag">BP</div><span>BP Monitor</span><small>Exact spec shown</small><button>+</button></article><article><div class="demoPack saline">NaCl</div><span>Sterile Saline</span><small>Clinic consumable</small><button>+</button></article></div><div class="demoCursor cursorOne"></div></div>`,
      request:`<div class="demoMachine requestMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>Supply Request</b></div><div class="requestDemoLines"><div><i>01</i><span><b>Sterile Gauze</b><small>100 swabs</small></span><strong>6</strong></div><div><i>02</i><span><b>Sterile Saline</b><small>2.5 ml</small></span><strong>10</strong></div><div class="customDemo"><span>Can’t find it?</span><b>Paediatric nebulizer masks…</b><em>Custom request</em></div></div><button class="demoSubmit">Place order for review</button></div>`,
      control:`<div class="demoMachine controlMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>PS Review</b></div><div class="controlTrack"><span class="trackLine"></span><div class="trackDot done">✓<small>SPEC</small></div><div class="trackDot done">✓<small>SOURCE</small></div><div class="trackDot active">●<small>ROUTE</small></div><div class="trackDot">4<small>QUOTE</small></div></div><div class="controlCards"><article><span>PRODUCT</span><b>Exact specification</b><small>Matched to controlled line</small></article><article><span>SUPPLY</span><b>Current evidence</b><small>Price / stock checked</small></article><article><span>ROUTE</span><b>Appropriate channel</b><small>Validated before commitment</small></article></div></div>`,
      delivery:`<div class="demoMachine deliveryMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>Order & Quotation</b></div><div class="quoteDemo"><div><span>PSC-Q-2026-1042</span><b>Quotation ready</b><small>Sent to registered account email</small></div><div class="quoteActions"><button>Cancel</button><button class="confirm">Confirm quote</button></div></div><div class="deliveryTrack"><div class="deliveryVan">▰</div><span></span><div class="deliveryPin">✓</div></div><div class="deliveryPromiseDemo"><small>NEXT</small><b>Delivery timing confirmed by PS</b></div></div>`,
      repeat:`<div class="demoMachine repeatMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>Replenish</b></div><div class="repeatCards"><article><div class="repeatThumb">GAUZE</div><div><span>Previously delivered</span><b>Sterile Gauze</b><small>Last qty · 6</small></div><button>Replenish 6</button></article><article><div class="repeatThumb saline">NaCl</div><div><span>Previously delivered</span><b>Sterile Saline</b><small>Last qty · 10</small></div><button>Replenish 10</button></article></div><div class="repeatLoop">↻ <span>Order history becomes the next order shortcut.</span></div></div>`
    }[st.visual];
    return `<main class="publicPage publicDemoPage">${publicHeader('')}<section class="demoPublicHero"><div><span class="kicker">GUIDED DEMONSTRATION</span><h1>See the supply relationship<br>work from end to end.</h1><p>See how Pharma Service takes an institutional customer from product selection and quotation through order management, delivery and repeat purchasing — while keeping the sourcing complexity behind the scenes.</p></div><div class="demoHeroFlow"><div><b>01</b><span>SELECT</span></div><i></i><div><b>02</b><span>REQUEST</span></div><i></i><div><b>03</b><span>CONTROL</span></div><i></i><div><b>04</b><span>DELIVER</span></div><i></i><div><b>05</b><span>REPEAT</span></div><span class="flowRunner"></span></div></section><section class="publicDemoBody"><div class="publicDemoStepper">${steps.map((x,j)=>`<button class="demoStepButton ${j===i?'active':j<i?'done':''}" data-tour-jump="${j}"><span>${x.n}</span><b>${x.label}</b></button>`).join('')}</div><div class="publicDemoStage"><div class="publicDemoCopy"><span class="kicker">${st.label}</span><h2>${st.title}</h2><p>${st.text}</p><div class="demoOutcome"><span>WHAT THIS ACHIEVES</span><b>${st.outcome}</b></div><div class="tourNav"><button class="button outline" data-tour-prev ${i===0?'disabled':''}>Previous</button>${i<steps.length-1?'<button class="button primary" data-tour-next>Next</button>':'<button class="button primary" data-go="login">Open Clinic Portal</button>'}</div></div><div class="publicDemoVisual">${visual}</div></div><div class="demoDisclosure"><b>Demonstration scope</b><span>The animation illustrates the live customer workflow and planned presentation layer. Actual products, prices, availability, regulatory route and delivery dates remain account- and transaction-specific.</span></div></section>${publicFooter()}</main>`;
  }


  function aboutPage(){ return publicPage('about','ABOUT PHARMA SERVICE','Built for accountable healthcare supply.','Pharma Service Co. L.L.C. is a UAE healthcare supplier focused on helping institutions source, organize and receive the products they need through one accountable commercial relationship.',`<section class="publicSection twoPublicCols"><div><span class="kicker">OUR ROLE</span><h2>Source per line. Deliver one solution.</h2><p>Institutions should not need to coordinate a different supplier for every requirement. Pharma Service combines category-specific sourcing with one commercial and operating point of accountability.</p></div><div class="publicFeatureStack"><article><b>Institutional supply</b><p>School clinics, healthcare facilities and institutional accounts.</p></article><article><b>Controlled specifications</b><p>Product selection is mapped to the relevant requirement and confirmed before commitment.</p></article><article><b>Recurring account service</b><p>Order history, replenishment and consistent follow-through over time.</p></article></div></section>`); }

  function servicesPage(){ return publicPage('services','SERVICES','Clinic procurement, made easier.','Pharma Service makes it easy for institutional customers to shop, request quotations, manage orders, repeat previous purchases and optimize procurement costs across pharmaceuticals, medical disposables and medical equipment.',`<section class="publicSection twoPublicCols"><div><span class="kicker">PROCUREMENT COST CONTROL</span><h2>Buy through the right supply channel, not the retail shelf.</h2><p>Pharma Service sources through suitable wholesale and specialist suppliers, then consolidates the commercial process for the institutional customer. The objective is straightforward: optimize procurement costs across pharmaceuticals, medical disposables and medical equipment without pushing sourcing complexity onto the clinic team.</p></div><div class="publicFeatureStack"><article><b>Shop & request</b><p>Browse controlled institutional lines or submit a custom sourcing request.</p></article><article><b>Quote & manage</b><p>Receive the formal quotation, confirm the order and keep the transaction history attached to the account.</p></article><article><b>Repeat efficiently</b><p>Reorder previously supplied items without restarting the procurement process from zero.</p></article></div></section><section class="publicSection procurementFlow"><article><b>SHOP</b><span>01</span><p>Browse the Pharma Service institutional product master.</p></article><article><b>QUOTE</b><span>02</span><p>PS sources, reviews and sends the formal quotation.</p></article><article><b>MANAGE</b><span>03</span><p>Confirm, cancel or follow the order from the account.</p></article><article><b>REPEAT</b><span>04</span><p>Repeat previously supplied items from the same account history.</p></article></section><section class="publicCta"><div><span class="kicker">SEE IT WORK</span><h2>Take a guided tour of Pharma Service.</h2></div><div class="publicCtaActions"><button class="button outline large" data-go="demo">Take guided tour</button><button class="button primary large" data-go="login">Open Clinic Portal</button></div></section>`); }


  function ourModelPage(){
    return `<main class="publicPage model17Page">
      ${publicHeader('our-model')}

      <section class="model17Hero">
        <div class="model17HeroCopy">
          <span class="kicker">OUR MODEL</span>
          <h1>The Institutional Way</h1>
          <p>We source the right products, bring them into one quotation, coordinate the order and stay accountable through delivery.</p>
          <div class="model17Principle">Source per line. Sell one solution.</div>
        </div>
        <div class="model17HeroVisual" aria-hidden="true">
          <div class="model17PaperCard cardA"><img src="/assets/model-icons/understand.png" alt=""><span>REQUIREMENT</span></div>
          <div class="model17PaperCard cardB"><img src="/assets/model-icons/source.png" alt=""><span>SOURCING</span></div>
          <div class="model17PaperCard cardC"><img src="/assets/model-icons/deliver-repeat.png" alt=""><span>ONE SUPPLY</span></div>
        </div>
      </section>

      <section class="model17Promise publicSection">
        <div>
          <span class="kicker">ONE COMMERCIAL RELATIONSHIP</span>
          <h2>That complexity is ours to manage — not yours.</h2>
        </div>
        <p>You receive one commercial point of contact and one coordinated supply.</p>
      </section>

      <section class="model17Rhythm publicSection">
        <article class="model17RhythmCard setup">
          <div>
            <span>OPENING / CAPITAL</span>
            <h2>Set up the clinic.</h2>
            <p>Beds, furniture, diagnostics, emergency equipment and the other items needed to get a clinic ready.</p>
          </div>
          <img src="/assets/model-icons/opening.png" alt="" aria-hidden="true">
        </article>
        <article class="model17RhythmCard running">
          <div>
            <span>RECURRING SUPPLY</span>
            <h2>Keep it running.</h2>
            <p>Consumables, dressings, gloves, testing supplies, respiratory products, medicines and the things that need replacing again and again.</p>
          </div>
          <img src="/assets/model-icons/recurring.png" alt="" aria-hidden="true">
        </article>
      </section>

      <section class="model17Source publicSection">
        <div class="model17SourceIntro">
          <span class="kicker">HOW THE CATALOGUE WORKS</span>
          <h2>The right source for the right product.</h2>
          <p>Different products need different expertise. We source each part of the requirement through the route that makes sense, then bring it together for you.</p>
        </div>

        <div class="model17SupplyFlow" aria-label="Example of the catalogue hierarchy from category to product family to exact line item">
          <article class="model17FlowCard category">
            <div class="model17FlowLabel">01 · CLINICAL CATEGORY</div>
            <img src="/assets/clinical-icons/vitals.png" alt="">
            <h3>Vitals &amp; Assessment</h3>
            <p>Start with the clinical need.</p>
          </article>
          <div class="model17Arrow" aria-hidden="true"><span>→</span><small>OPEN FAMILY</small></div>
          <article class="model17FlowCard family">
            <div class="model17FlowLabel">02 · PRODUCT FAMILY</div>
            <img src="/assets/products/inst-0019.webp" alt="Portable pulse oximeter">
            <h3>Portable Pulse Oximeter</h3>
            <p>Define what the institution needs.</p>
          </article>
          <div class="model17Arrow" aria-hidden="true"><span>→</span><small>CONFIRM LINE</small></div>
          <article class="model17FlowCard line">
            <div class="model17FlowLabel">03 · LINE ITEM</div>
            <div class="model17LineThumb"><img src="/assets/products/inst-0019.webp" alt=""></div>
            <h3>Pulse — Fingertip Pulse Oximeter A2</h3>
            <p>Exact product, pack and commercial terms are confirmed before quotation.</p>
            <b>1 unit · Request quote</b>
          </article>
        </div>
      </section>

      <section class="model17BottomCta">
        <div>
          <span>READY WHEN YOU ARE</span>
          <h2>Send us the requirement.<br>We’ll work out how to supply it.</h2>
        </div>
        <div class="model17BottomActions">
          <button class="button primary large" data-go="start">Send a requirement</button>
          <button class="button outline large" data-go="catalogue">Browse catalogue</button>
        </div>
      </section>

      ${publicFooter()}
    </main>`;
  }


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

  const WORKSHOP_MODULES = [
    {n:'01', slug:'product-basics', title:'Product Basics', tone:'wsTone1', icon:'products',
      short:'Understand the product before you order it.',
      intro:'Understand what the product actually is, which details matter and what else may be required around it.',
      meta:'Product selection · Clinic supply'},
    {n:'02', slug:'whats-the-difference', title:"What's the Difference?", tone:'wsTone2', icon:'repeat',
      short:'Understand what looks similar but is not necessarily interchangeable.',
      intro:'Clear comparisons for products that appear similar but should not automatically be treated as interchangeable.',
      meta:'Product comparison · Specifications'},
    {n:'03', slug:'clinic-checks', title:'Clinic Checks', tone:'wsTone3', icon:'checklist',
      short:'Quick practical checks staff can perform in their own clinic.',
      intro:'Short checks that take the reader out of the screen and into the actual clinic.',
      meta:'Practical checks · Clinic readiness'},
    {n:'04', slug:'equipment-readiness', title:'Equipment Readiness', tone:'wsTone4', icon:'assets',
      short:'Make sure the complete equipment system — not just the main device — is ready.',
      intro:'Owning the main device does not mean the system is ready. Check the accessories, consumables, compatibility and replacement requirements around it.',
      meta:'Equipment systems · Readiness'},
    {n:'05', slug:'stock-expiry', title:'Stock & Expiry', tone:'wsTone5', icon:'inventory',
      short:'Know what to use first, what needs attention and what should actually be reordered.',
      intro:'Understand what is on hand, what needs attention and what should actually be reordered.',
      meta:'Stock control · Expiry'},
    {n:'06', slug:'school-clinic', title:'School Clinic', tone:'wsTone6', icon:'home',
      short:'Practical guidance for the realities of operating healthcare inside a school.',
      intro:'Practical supply guidance built around the specific operational realities of school clinics.',
      meta:'School health · Clinic operations'},
    {n:'07', slug:'ordering-specifications', title:'Ordering & Specifications', tone:'wsTone7', icon:'edit',
      short:'Turn vague requests into controlled, sourceable product specifications.',
      intro:'Turn vague product requests into specifications suppliers can actually quote correctly.',
      meta:'RFQs · Product specifications'}
  ];

  const WORKSHOP_MODULE_CROSS_LINKS = {
    'school-clinic':['ten-minute-school-clinic-stock-expiry-walk'],
    'equipment-readiness':['aed-has-expiring-parts-too']
  };

  function workshopGuideBySlug(slug){ return WORKSHOP.find(g=>g.slug===slug && g.status==='published') || null; }
  function workshopModuleBySlug(slug){ return WORKSHOP_MODULES.find(m=>m.slug===slug) || null; }
  function workshopModuleForGuide(g){ return WORKSHOP_MODULES.find(m=>m.title===g?.category) || WORKSHOP_MODULES[0]; }
  function workshopSaved(){ try{return new Set(JSON.parse(localStorage.getItem(WORKSHOP_SAVE_KEY)||'[]'))}catch{return new Set()} }
  function workshopProductMatches(g,p){
    if(!g||!p)return false;
    return (g.related_product_ids||[]).map(String).includes(String(p.pscSku||''));
  }
  function workshopForProduct(p,limit=2){ return WORKSHOP.filter(g=>g.status==='published'&&workshopProductMatches(g,p)).slice(0,limit); }
  function workshopRelatedProducts(g,limit=4){
    const ids=new Set((g?.related_product_ids||[]).map(String));
    return products().filter(p=>ids.has(String(p.pscSku||''))).slice(0,limit);
  }
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
  function workshopModuleGuides(m){
    const primary=WORKSHOP.filter(g=>g.status==='published'&&g.category===m.title);
    const cross=(WORKSHOP_MODULE_CROSS_LINKS[m.slug]||[]).map(workshopGuideBySlug).filter(Boolean);
    return [...primary,...cross.filter(g=>!primary.some(p=>p.slug===g.slug))];
  }
  function workshopModuleCard(m){
    const count=workshopModuleGuides(m).length;
    return `<button class="workshopModuleCardV50 ${m.tone}" data-go="workshop/${esc(m.slug)}">
      <span class="workshopModuleTopV50"><b>MODULE ${esc(m.n)}</b><i aria-hidden="true">${icon(m.icon)}</i></span>
      <span class="workshopModuleCopyV50"><strong>${esc(m.title)}</strong><small>${esc(m.short)}</small></span>
      <span class="workshopModuleFootV50">${count} ${count===1?'guide':'guides'} <i>→</i></span>
    </button>`;
  }
  function workshopModuleNav(active=''){
    return `<nav class="workshopModuleNavV50" aria-label="Workshop modules">${WORKSHOP_MODULES.map(m=>`<button class="${m.slug===active?'active':''}" data-go="workshop/${esc(m.slug)}"><span>${esc(m.n)}</span>${esc(m.title.replace("What's the Difference?",'Differences').replace('Equipment Readiness','Equipment').replace('Ordering & Specifications','Ordering'))}</button>`).join('')}</nav>`;
  }
  function workshopGuideCard(g){
    const m=workshopModuleForGuide(g);
    return `<article class="workshopGuideCardV50 ${m.tone}">
      <button data-go="workshop/${esc(g.slug)}" aria-label="Open ${esc(g.title)}">
        <span class="workshopGuideMetaV50"><b>${esc(workshopFormatLabel(g.format))}</b><small>${esc(g.read_time)} read</small></span>
        <h3>${esc(g.title)}</h3>
        <p>${esc(g.excerpt)}</p>
        <span class="workshopGuideFootV50"><span>${esc(g.category)}</span><i aria-hidden="true">${icon(m.icon)}</i></span>
      </button>
    </article>`;
  }
  function workshopFiltered(){
    const q=(ui.workshopQuery||'').trim().toLowerCase();
    return WORKSHOP.filter(g=>{
      if(g.status!=='published')return false;
      if(!q)return true;
      const hay=[g.title,g.subtitle,g.excerpt,g.category,g.format,...(g.tags||[]),...(g.product_match_terms||[]),...(g.clinic_check_topics||[])].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }
  function workshopLandingPage(){
    const filtered=workshopFiltered();
    const searching=!!(ui.workshopQuery||'').trim();
    const featuredSlugs=['which-glove-should-i-actually-wear','oxygen-cylinder-is-not-an-oxygen-system','aed-has-expiring-parts-too'];
    const featured=searching?filtered:featuredSlugs.map(workshopGuideBySlug).filter(Boolean);
    const rest=searching?[]:filtered.filter(g=>!featured.some(f=>f.slug===g.slug));
    return `<main class="publicPage workshopPage workshopHubV50">${publicHeader('workshop')}
      <section class="workshopHeroV50">
        <div class="workshopHeroRuleV50"><span>THE WORKSHOP</span><i></i><small>PRODUCT INTELLIGENCE · FIELD MANUAL</small></div>
        <div class="workshopHeroGridV50">
          <div><h1>Practical product intelligence.</h1></div>
          <div><h2>For people who run clinics.</h2><p>The product details, compatibility questions, readiness checks and ordering specifications that are easy to miss — until they matter.</p></div>
        </div>
      </section>

      <section class="workshopModuleIndexV50">
        <div class="workshopSectionHeadV50"><div><span>07 MODULES</span><h2>Start with what you need to figure out.</h2></div><p>No courses. No progress bars. Just practical guidance organised around the decisions clinics and buyers actually make.</p></div>
        <div class="workshopModuleGridV50">${WORKSHOP_MODULES.map(workshopModuleCard).join('')}</div>
      </section>

      <section class="workshopGuideIndexV50">
        <div class="workshopSearchStripV50"><div class="workshopSearchV50"><span>${icon('search')}</span><input data-workshop-q value="${esc(ui.workshopQuery)}" placeholder="Search a product, question or clinic check…" aria-label="Search The Workshop"></div><div><span>${searching?'SEARCH RESULTS':'PUBLISHED GUIDES'}</span><b>${filtered.length}</b>${searching?'<button data-workshop-clear>Clear</button>':''}</div></div>
        <div class="workshopSectionHeadV50 workshopGuidesHeadV50"><div><span>${searching?'MATCHING GUIDES':'ON THE BENCH NOW'}</span><h2>${searching?'What matches your search.':'Useful things to know before the next order.'}</h2></div><p>${searching?'Search works across titles, products, questions and clinic-check topics.':'Three strong guides up front. Open the full index only when you want it.'}</p></div>
        ${filtered.length?`<div class="workshopGuideGridV50">${featured.map(workshopGuideCard).join('')}</div>${rest.length?`<details class="workshopAllGuidesV50"><summary><span>View all guides</span><b>${filtered.length} published</b></summary><div class="workshopGuideGridV50 workshopGuideGridRestV50">${rest.map(workshopGuideCard).join('')}</div></details>`:''}`:`<div class="workshopEmptyV50"><b>Nothing on the bench for that search yet.</b><p>Try a product name, a broader term or one of the seven Modules above.</p><button class="button outline" data-workshop-clear>Clear search</button></div>`}
      </section>

      <section class="workshopPrincipleV50"><h2>Useful product knowledge belongs next to the product.</h2><p>The Workshop exists to make specifications, compatibility, readiness and replenishment easier to understand before the next order. Education first; commerce second.</p></section>
      ${publicFooter()}
    </main>`;
  }

  function workshopModulePage(slug){
    const m=workshopModuleBySlug(slug);
    if(!m)return workshopGuidePage(slug);
    const guides=workshopModuleGuides(m);
    return `<main class="publicPage workshopPage workshopModulePageV50 ${m.tone}">${publicHeader('workshop')}
      <section class="workshopModuleHeroV50">
        <div class="workshopModuleLabelV50"><button data-go="workshop">THE WORKSHOP</button><i></i><span>MODULE ${esc(m.n)}</span></div>
        <div class="workshopModuleHeroGridV50"><div><h1>${esc(m.title)}</h1><h2>${esc(m.short)}</h2></div><div><p>${esc(m.intro)}</p><small>${guides.length} ${guides.length===1?'guide':'guides'} · ${esc(m.meta)}</small></div></div>
      </section>
      ${workshopModuleNav(m.slug)}
      <section class="workshopModuleGuidesV50">
        <div class="workshopSectionHeadV50"><div><span>MODULE ${esc(m.n)}</span><h2>Guides in ${esc(m.title)}</h2></div><p>Built to change the next check, handover, RFQ or reorder — not to create another training dashboard.</p></div>
        ${guides.length?`<div class="workshopGuideGridV50">${guides.map(workshopGuideCard).join('')}</div>`:`<div class="workshopEmptyV50 compact"><b>No published guides in this Module yet.</b><p>The Module is ready for additional Workshop content without placeholder cards or empty filler.</p></div>`}
      </section>
      ${publicFooter()}
    </main>`;
  }

  function workshopSectionHtml(section){
    if(section.comparison) return `<section class="workshopArticleSection workshopComparisonSectionV50"><h2>${esc(section.title)}</h2><div class="workshopComparisonV50">${section.comparison.map(x=>`<article><span>${esc(x.label)}</span><p>${esc(x.text)}</p></article>`).join('')}</div></section>`;
    if(section.spec_example){ const x=section.spec_example; return `<section class="workshopArticleSection workshopSpecLessonV50"><h2>${esc(section.title)}</h2><div class="workshopSpecGridV50"><div class="badSpecV50"><span>DON'T ORDER IT LIKE THIS</span><strong>${esc(x.bad)}</strong></div><div class="missingSpecV50"><span>WHAT'S MISSING?</span>${x.missing.map(v=>`<b>${esc(v)}</b>`).join('')}</div><div class="goodSpecV50"><span>ORDER IT LIKE THIS</span><p>${esc(x.good)}</p></div></div></section>`; }
    if(section.checklist) return `<section class="workshopArticleSection workshopChecklistV50"><h2>${esc(section.title)}</h2><ol>${section.checklist.map((v,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><p>${esc(v)}</p></li>`).join('')}</ol></section>`;
    if(section.bullets) return `<section class="workshopArticleSection"><h2>${esc(section.title)}</h2><ul class="workshopBulletsV50">${section.bullets.map(v=>`<li>${esc(v)}</li>`).join('')}</ul></section>`;
    return `<section class="workshopArticleSection"><h2>${esc(section.title)}</h2><p>${esc(section.text||'')}</p></section>`;
  }
  function workshopGuidePage(slug){
    const g=workshopGuideBySlug(slug);
    if(!g)return `<main class="publicPage workshopPage">${publicHeader('workshop')}<section class="workshopNotFoundV50"><span>THE WORKSHOP</span><h1>Guide not found.</h1><p>The guide may have moved or is not published.</p><button class="button primary" data-go="workshop">Back to The Workshop</button></section>${publicFooter()}</main>`;
    const m=workshopModuleForGuide(g);
    const saved=workshopSaved().has(g.slug);
    const related=workshopRelatedProducts(g,4);
    const isEquipment=m.slug==='equipment-readiness';
    return `<main class="publicPage workshopPage workshopArticlePage workshopArticlePageV50 ${m.tone}">${publicHeader('workshop')}
      <article class="workshopArticleV50 ${g.format==='CHECK THIS'?'workshopPrintCheck':''}">
        <header class="workshopArticleHeaderV50">
          <div class="workshopArticleToplineV50"><button data-go="workshop">THE WORKSHOP</button><i></i><button data-go="workshop/${esc(m.slug)}">MODULE ${esc(m.n)} · ${esc(m.title)}</button><b>${esc(workshopFormatLabel(g.format))}</b></div>
          <div class="workshopArticleLeadV50"><div><h1>${esc(g.title)}</h1><p>${esc(g.subtitle)}</p></div><aside><span>${esc(g.read_time)} read</span><span>Reviewed ${esc(g.last_reviewed)}</span><div class="workshopArticleActions"><button data-workshop-save="${esc(g.slug)}" aria-pressed="${saved?'true':'false'}">${saved?'Saved':'Save'}</button><button data-workshop-print>Print</button><button data-workshop-share="${esc(g.slug)}">Share</button></div></aside></div>
        </header>
        ${workshopModuleNav(m.slug)}
        ${g.format==='CHECK THIS'?'<div class="workshopDoNowV50">DO THIS NOW · TAKE THE GUIDE INTO THE CLINIC</div>':''}
        ${isEquipment?'<section class="workshopReadinessChainV50"><span>THE READINESS CHAIN</span><div><b>Equipment</b><i>→</i><b>Accessory</b><i>→</i><b>Consumable</b><i>→</i><b>Replacement / expiry</b><i>→</i><b>Record</b></div></section>':''}
        <div class="workshopArticleLayoutV50">
          <div class="workshopArticleBody">${(g.body_sections||[]).map(workshopSectionHtml).join('')}</div>
          <aside class="workshopArticleRailV50"><span>THIS GUIDE</span><b>${esc(g.category)}</b><p>${esc(g.excerpt)}</p><button data-go="workshop/${esc(m.slug)}">More in ${esc(m.title)}</button></aside>
        </div>
        <section class="workshopSignature workshopSignatureV50">
          <article><span>Use it right</span><p>${esc(g.use_it_right)}</p></article>
          <article><span>Check your stock</span><p>${esc(g.check_your_stock)}</p></article>
          <article><span>When ordering</span><p>${esc(g.when_ordering)}</p></article>
        </section>
        ${related.length?`<section class="workshopRelated workshopRelatedV50"><div class="workshopRelatedHead"><span>PRODUCTS USED IN THIS GUIDE</span><p>Only catalogue lines deliberately linked to this guide are shown.</p></div><div class="workshopRelatedList">${related.map(p=>{const n=clinicalNeedMeta(clinicalNeedIds(p)[0]||'all');return `<button data-go="catalogue/${n.id}"><span>${esc(p.pscSku||'PS')}</span><b>${esc(p.catalogueDisplayName||p.name)}</b><small>${esc(p.cataloguePack||p.pack||'Pack to confirm')}</small></button>`}).join('')}</div></section>`:''}
        <footer class="workshopMedicalNote">Workshop guides provide general product and supply information. Clinical decisions should follow product instructions, institutional procedures and applicable professional or regulatory requirements.</footer>
      </article>${publicFooter()}
    </main>`;
  }
  function workshopRoutePage(slug){ return workshopModuleBySlug(slug)?workshopModulePage(slug):workshopGuidePage(slug); }
  function workshopTeaser(){
    const slugs=['which-glove-should-i-actually-wear','oxygen-cylinder-is-not-an-oxygen-system','aed-has-expiring-parts-too'];
    const items=slugs.map(workshopGuideBySlug).filter(Boolean);
    return `<section class="homeWorkshop homeWorkshopCards"><div class="homeWorkshopIntro"><span class="kicker">THE WORKSHOP</span><h2>Know what you're working with.</h2><p>Practical guides to the products, equipment and small details that keep clinics ready.</p><button class="button outline" data-go="workshop">Enter The Workshop</button></div><div class="homeWorkshopCardGrid">${items.map(workshopGuideCard).join('')}</div></section>`;
  }
  function schoolWorkshopStrip(){
    const slugs=['ten-minute-school-clinic-stock-expiry-walk','aed-has-expiring-parts-too','oxygen-cylinder-is-not-an-oxygen-system'];
    return `<section class="schoolWorkshopStrip"><div><span class="kicker">USEFUL IN YOUR CLINIC</span><h2>The Workshop</h2></div><div>${slugs.map(slug=>{const g=workshopGuideBySlug(slug);return g?`<button data-go="workshop/${g.slug}"><span>${esc(workshopFormatLabel(g.format))}</span><b>${esc(g.title)}</b></button>`:''}).join('')}</div></section>`;
  }

  function catalogueCardRows(rows){ return window.PS_CATALOGUE_STOCK?.groups(rows)||rows; }
  function catalogueFamilyVariants(p){
    const group=p._familyGroup;if(!group)return '';
    return `<details class="pscFamilyVariantList"><summary>${group.members.length} product ${group.members.length===1?'option':'options'}</summary><ul>${group.members.map(member=>{
      const record=window.PS_CATALOGUE_STOCK?.forProduct(member),price=record?.acorus_managed?window.PS_CATALOGUE_STOCK.price(record):null;
      return `<li><button type="button" data-product-view="${esc(member.pscSku)}"><b>${esc(member.name)}</b><br><small>${esc(member.cataloguePack||member.pack||'Exact pack to confirm')}</small></button><span class="pscVariantPrice">${price?`${money(price)}<small class="pscFamilyStockMeta">Retail MRP · in stock</small>`:'Request quotation'}</span></li>`;
    }).join('')}</ul></details>`;
  }
  function publicCatalogueCard(p){
    const need=clinicalNeedMeta(clinicalNeedIds(p)[0]||'all');
    const displayName=p._familyGroup?.name||p.catalogueDisplayName||p.name;
    const pack=p.cataloguePack||p.pack||'Pack / unit to confirm';
    const familyPhoto=window.PSC_DHA_FAMILY_PHOTOS?.forListing(p);
    const imageUrl=familyPhoto?.path||(p._familyGroup&&!window.PS_CATALOGUE_STOCK?.realPhoto(p)?null:productDisplayImageUrl(p));
    const workshop=workshopForProduct(p,1)[0];
    return `<article class="publicCatalogueCard ${p._familyGroup?'pscFamilyCard':''} ${!imageUrl?'pscFamilyNoPhoto':''}" data-family-listing="${esc(p._familyGroup?.id||'')}">
      <button class="publicCatalogueVisual publicProductView" style="--need-bg:${need.bg};--need-ink:${need.ink}" data-public-product-view="${p.pscSku}" aria-label="View ${esc(displayName)} details">${imageUrl?`<img data-family-example="${familyPhoto?'true':'false'}" src="${esc(imageUrl)}" alt="${esc(familyPhoto?.label||displayName)}" loading="lazy" onerror="this.onerror=null;this.src='${esc(legacyProductImageUrl(p))}'">`:`<span>${esc(need.label)}</span>`}${p.dhaMapped?`<img class="publicDhaMark" src="${DHA_ICON}" alt="DHA requirement mapping">`:''}</button>
      <div class="publicCatalogueBody"><small>${esc(need.label)}</small><small class="catalogueBrandCount">${esc(window.PSC_STOREFRONT_GROUPS?.realBrand(p.brand)?p.brand:"Request by specification")}</small><button class="publicProductTitle" data-public-product-view="${p.pscSku}"><h3>${esc(displayName)}</h3></button><p>${esc(p._familyGroup?.members.length>1?p._familyGroup.members.length+" pack options":pack)}</p>${cataloguePricePreview(p)}${p.pscOfferedSpecification?`<div class="publicSpec">${esc(p.pscOfferedSpecification)}</div>`:''}${p.dhaMapped?'<div class="publicMappingNote">Mapped to the applicable DHA clinic requirement.</div>':''}${workshop?`<button class="catalogueWorkshopLink" data-go="workshop/${esc(workshop.slug)}"><span>FROM THE WORKSHOP</span><b>${esc(workshop.title)}</b></button>`:''}</div>
      <button class="button outline full" data-public-product-view="${p.pscSku}">View details</button>
    </article>`;
  }

  function publicCataloguePage(needId='all'){
    const meta=clinicalNeedMeta(needId);
    const {filtered,types}=catalogueFilterProducts(needId);
    const categories=INSTITUTIONAL_CATALOGUE_TEMPLATE.categories.filter(c=>c.id!=='all');
    const categoryCards=categories.map(c=>`<button class="publicCategoryCard16 ${c.id===needId?'active':''}" style="--need-bg:${c.bg};--need-ink:${c.ink}" data-go="catalogue/${c.id}">
      <span class="publicCategoryArt16" aria-hidden="true">${clinicalNeedIllustration(c.id)}</span>
      <span class="publicCategoryCopy16"><b>${esc(c.label)}</b><small>${esc(c.note)}</small></span>
    </button>`).join('');
    const heroTitle=needId==='all'?'Start with the clinical area.':esc(meta.label);
    const heroLead=needId==='all'?'Choose a category or search for a product, brand, model or pack.':`Browse products and sourcing requirements for ${esc(meta.label)}.`;
    return `<main class="publicPage publicCataloguePage catalogue16Page">${publicHeader('catalogue')}
      <section class="publicPageHero cataloguePublicHero catalogue16Hero"><span class="kicker">INSTITUTIONAL CATALOGUE</span><h1>${heroTitle}</h1><p>${heroLead}</p></section>
      ${schoolBasketSection()}
      <section class="publicSection publicCatalogueJourney16">
        <div class="publicCatalogueJourneyHead16"><div><span class="kicker">CLINICAL NEEDS</span><h2>Where do you want to start?</h2></div>${needId!=='all'?'<button class="textAction" data-go="catalogue">View all categories</button>':''}</div>
        <div class="publicCategoryGrid16">${categoryCards}</div>
      </section>
      <section class="publicSection publicCatalogueControls catalogue16Controls">
        <div class="filterBar"><div class="searchInput"><span>${icon('search')}</span><input type="search" aria-label="Search catalogue" data-cat-q value="${esc(ui.catalogueQuery)}" placeholder="Search products, brands, packs or specifications…">${ui.catalogueQuery?'<button type="button" class="catalogueSearchClear" data-catalogue-clear aria-label="Clear search">×</button>':''}</div><select data-cat-filter="category"><option>All product types</option>${types.map(t=>`<option ${ui.catalogueCat===t?'selected':''}>${esc(t)}</option>`).join('')}</select></div>
      </section>
      <section class="publicSection publicCatalogueResults catalogue16Results">${catalogueRetailPriceNotice()}<div class="publicCatalogueCount"><b>${catalogueCardRows(filtered).length}</b><span>${needId==='all'?'product listings':'listings in this category'}</span></div>${filtered.length?`<div class="publicCatalogueGrid">${catalogueCardRows(filtered).map(publicCatalogueCard).join('')}</div>`:'<div class="emptyState"><h3>No matching published lines</h3><p>Try another clinical need or send the requirement to Pharma Service.</p><button class="button primary" data-go="contact">Request sourcing</button></div>'}</section>
      <section class="publicCta"><div><span class="kicker">HAVE A LIST ALREADY?</span><h2>Send the requirement instead of rebuilding it here.</h2></div><div class="publicCtaActions"><button class="button outline large" data-go="start">Send a list / RFQ</button><button class="button primary large" data-go="login">Open Clinic Portal</button></div></section>
      ${publicFooter()}
    </main>`;
  }

  function careersPage(){ return publicPage('careers','CAREERS','Build practical healthcare supply with us.','We are interested in people who value accuracy, follow-through and institutional customer service.',`<section class="publicSection simplePublicPanel"><h2>Current opportunities</h2><p>Roles will be posted here as the institutional-supply business expands. For now, career enquiries can be directed through the Contact page.</p><button class="button outline" data-go="contact">Contact Pharma Service</button></section>`); }

  function mediaPage(){ return publicPage('media','MEDIA','Updates, resources and institutional supply notes.','A public space for Pharma Service company updates and practical institutional healthcare-supply resources.',`<section class="publicSection publicMediaGrid"><article><span>SCHOOL CLINICS</span><h3>Building a cleaner replenishment process</h3><p>Why repeat ordering should get easier after the first completed supply cycle.</p></article><article><span>PRODUCT CONTROL</span><h3>Requirement-mapped specifications</h3><p>How PS separates regulatory requirements from exact commercial product specifications.</p></article><article><span>PS UPDATE</span><h3>Institutional Supply Portal</h3><p>The first MVP brings ordering, quotations and replenishment into one customer account.</p></article></section>`); }

  function unsubscribePage(){
    const token=new URLSearchParams(location.search).get('token')||'';
    return `<main class="publicPage unsubscribePage">${publicHeader('')}<section class="unsubscribeCard"><span class="kicker">PHARMA SERVICE MAIL</span><h1>Email preferences</h1><div data-unsubscribe-state>${token?'<p>Updating your email preference…</p>':'<p>This unsubscribe link is missing its contact token.</p>'}</div><p class="unsubscribeFine">This only stops PS marketing/outreach emails. It does not affect transactional messages about active quotations, orders, deliveries, invoices or service matters.</p><button class="button light" data-go="home">Back to Pharma Service</button></section>${publicFooter()}</main>`;
  }

  async function processMailUnsubscribe(){
    const host=document.querySelector('[data-unsubscribe-state]'); if(!host) return;
    const token=new URLSearchParams(location.search).get('token')||'';
    if(!token){host.innerHTML='<p>This unsubscribe link is incomplete. Please email info@pharmaservice.ae if you want us to update your preferences.</p>';return;}
    if(!sb){host.innerHTML='<p>We could not update this preference automatically. Please email info@pharmaservice.ae and we will update it.</p>';return;}
    try{
      const {data,error}=await sb.functions.invoke('mail-unsubscribe',{body:{token}}); if(error)throw error; if(data?.error)throw new Error(data.error);
      host.innerHTML='<div class="unsubscribeDone"><b>You are unsubscribed.</b><p>PS will no longer send marketing/outreach emails to this contact record.</p></div>';
    }catch(e){console.error(e);host.innerHTML='<p>We could not update this preference automatically. Please email <b>info@pharmaservice.ae</b> and we will update it.</p>';}
  }

  function startPage(){
    return `<main class="publicPage startPage start16Page">
      ${publicHeader('')}
      <section class="start16Hero">
        <div class="start16HeroCopy">
          <span class="kicker">START HERE</span>
          <h1>Start with the requirement you already have.</h1>
          <p>Send a product list, browse by clinical need, or see how the supply process works. PS will check your specification, quantities and timing before preparing a quotation.</p>
          <div class="start16HeroActions"><button class="button primary large" data-start-scroll="send">Send a list / RFQ</button><button class="button outline large" data-go="catalogue">Browse catalogue</button></div>
        </div>
        <div class="start16RouteBoard" aria-label="Three ways to start">
          <button data-start-scroll="send"><span>01</span><div><b>I already have a list.</b><small>Send it as it is.</small></div><i>→</i></button>
          <button data-go="catalogue"><span>02</span><div><b>I need to find the product.</b><small>Browse by clinical need.</small></div><i>→</i></button>
          <button data-go="our-model"><span>03</span><div><b>I want to understand the process.</b><small>See how PS handles the supply work.</small></div><i>→</i></button>
        </div>
      </section>

      <section class="start16Brief publicSection">
        <div class="start16BriefHead"><span class="kicker">WHAT HELPS</span><h2>Three details make a request much easier to quote.</h2></div>
        <div class="start16BriefGrid"><article><b>What</b><p>Product, specification, current brand or whatever description you have.</p></article><article><b>How much</b><p>Quantity, pack basis and number of sites if it is a multi-site requirement.</p></article><article><b>When</b><p>Required date, delivery window or whether this is routine replenishment.</p></article></div>
      </section>

      <section class="startSendSection start16Send" id="start-send">
        <div class="startSendIntro start16SendIntro">
          <span class="kicker">SEND THE REQUIREMENT</span>
          <h2>It does not need to be cleaned up first.</h2>
          <p>Tell us what you need, how much, and when. Paste your list below and add the original file if helpful. If you only have a file, write a short summary in the requirement field.</p>
          <p>Next, PS reviews your enquiry, clarifies any missing details, and confirms the available supply and quotation basis with you.</p>
          <p class="start16Fine">No automatic stock, compliance or delivery promise is created by sending the enquiry. Those points are confirmed before commitment.</p>
          <div class="startContactActions" aria-label="Other ways to get started">
            <a class="button outline" href="tel:+971504252641"><svg class="startContactIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.09 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.79a2 2 0 0 1-.45 2.11L9.06 10.9a16 16 0 0 0 4.04 4.04l1.28-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.7A2 2 0 0 1 22 16.92Z"/></svg><span>Call us now</span></a>
            <a class="button outline" href="https://wa.me/971553511335" target="_blank" rel="noopener noreferrer"><svg class="startContactIcon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.52 3.48A11.9 11.9 0 0 0 12.04 0C5.43 0 .05 5.38.05 11.99c0 2.11.55 4.17 1.6 5.99L0 24l6.16-1.62a11.98 11.98 0 0 0 5.87 1.5h.01C18.65 23.88 24 18.5 24 11.89c0-3.2-1.24-6.21-3.48-8.41ZM12.04 21.86a9.91 9.91 0 0 1-5.05-1.38l-.36-.21-3.65.96.98-3.56-.24-.37a9.94 9.94 0 1 1 8.32 4.56Zm5.45-7.44c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.3 1.27.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.77-.73 2.02-1.44.25-.7.25-1.3.17-1.43-.07-.12-.27-.2-.57-.35Z"/></svg><span>WhatsApp</span></a>
            <button class="button light" data-go="login">Open Clinic Portal</button>
          </div>
        </div>
        <form class="prospectForm startProspectForm start16Form" data-public-enquiry data-source-page="business_card_start_v39_16" novalidate>
          <div class="prospectField"><label for="startOrganization">Organization</label><input id="startOrganization" name="organization" type="text" maxlength="180" placeholder="School group, clinic or company" required></div>
          <div class="prospectField"><label for="startInstitutionType">Institution type</label><select id="startInstitutionType" name="institution_type" required><option value="">Select</option><option>School / education</option><option>Healthcare facility</option><option>Corporate / workplace health</option><option>Government / public institution</option><option>Hospitality / other institution</option><option>Other</option></select></div>
          <div class="prospectField"><label for="startName">Name</label><input id="startName" name="name" type="text" autocomplete="name" maxlength="120" placeholder="Your name" required></div>
          <div class="prospectField"><label for="startPhone">Contact number</label><input id="startPhone" name="contact_number" type="tel" autocomplete="tel" maxlength="40" placeholder="+971" required></div>
          <div class="prospectField prospectFieldWide"><label for="startEmail">Contact email</label><input id="startEmail" name="contact_email" type="email" autocomplete="email" maxlength="254" placeholder="name@organization.ae" required></div>
          <div class="prospectField prospectFieldWide"><label for="startRequirement">Requirement</label><textarea id="startRequirement" name="requirement" rows="5" maxlength="4000" placeholder="Paste the list, quantities, specification or anything else you already know." required></textarea></div>
          <div class="prospectField prospectFieldWide rfqUploadField"><label for="startRfq">Attach a list or RFQ <span>optional · PDF, Word, Excel or CSV · max 10 MB</span></label><input id="startRfq" name="rfq_file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,application/pdf,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"></div>
          <div class="prospectHoneypot" aria-hidden="true"><label for="startWebsite">Website</label><input id="startWebsite" name="website" type="text" tabindex="-1" autocomplete="off"></div>
          <div class="prospectSubmitRow"><p>We will use this to contact you about this institutional requirement.</p><button class="button primary semanticPrimary" type="submit" data-public-enquiry-submit>Send requirement</button></div>
        </form>
      </section>

      <section class="start16Bottom publicSection"><div><span class="kicker">NOT READY TO SEND?</span><h2>Browse first, or read one useful guide.</h2></div><div><button class="button outline" data-go="catalogue">Institutional catalogue</button><button class="button light" data-go="workshop">The Workshop</button></div></section>
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
      <div class="contactCard"><span>PHONE</span><b><a href="tel:+97143377004">+971 4 337 7004</a></b></div>
      <div class="contactCard"><span>MOBILE</span><b><a href="tel:+971504252641">+971 50 425 2641</a></b></div>
      <div class="contactCard"><span>WHATSAPP</span><b><a href="https://wa.me/971553511335" target="_blank" rel="noopener noreferrer">+971 55 351 1335</a></b></div>
      <div class="contactCard"><span>EMAIL</span><b><a href="mailto:info@pharmaservice.ae">info@pharmaservice.ae</a></b></div>
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
          <div class="wholesaleAction">${r.price_display_mode==='show_price'&&r.display_price!==null?`<b>${money(r.display_price)}</b>`:`<b>${r.price_display_mode==='contact'?'Contact PS':'Request quote'}</b>`}<button class="button primary" data-go="contact">Enquire</button></div>
        </article>`).join('')}</div>`:`<div class="emptyState wholesaleEmpty"><h3>Wholesale catalogue is being prepared.</h3><p>Contact Pharma Service for trade pricing and product availability.</p><button class="button primary" data-go="contact">Contact Pharma Service</button></div>`}
      </section>
      ${publicFooter()}
    </main>`;
  }

  function loginPage(){ return `<main class="publicPage loginPublicPage v26LoginPage">${publicHeader('')}<section class="loginWrap v26LoginWrap"><div class="loginIntro v26LoginIntro"><span class="kicker">CLINIC PORTAL ACCESS</span><h1>Institutional procurement,<br>connected.</h1><p>Shop the catalogue, review quotations, track orders and repeat previously supplied items through one secure Pharma Service account.</p><div class="v26LoginFlow"><span>Source</span><span>Quote</span><span>Supply</span><span>Repeat</span></div><div class="loginSupport">Need access? <button data-go="contact">Contact Pharma Service</button> <span>·</span> <button data-go="demo">View guided demo</button></div></div><div class="loginCard v26LoginCard"><img src="${PSC_LOGO}" alt="Pharma Service"><span class="loginLabel">ACCOUNT ACCESS</span><h2>Clinic Portal</h2><label>Email</label><input class="input" id="mvpLoginEmail" type="email" autocomplete="email" placeholder="name@organization.ae"><label>Password</label><input class="input" id="mvpLoginPassword" type="password" autocomplete="current-password" placeholder="••••••••"><button class="button primary full" data-mvp-login>Continue to Clinic Portal</button><p class="loginNote">Your organization and account permissions are determined automatically after sign-in.</p></div></section>${publicFooter()}</main>`; }

  function portalDashboard(){
    const visible=customerVisibleRequests();
    const active=visible.filter(r=>!['Accepted','Cancelled'].includes(r.status));
    const awaiting=active.filter(r=>r.status==='Sent'&&!r.quote?.management_decision);
    const delivered=visible.filter(r=>r.status==='Accepted');
    const documentCount=customerAccountRequests().reduce((n,r)=>n+(r.documents||[]).length,0);
    const priority=r=>r.status==='Sent'&&!r.quote?.management_decision?0:r.status==='Delivery'?1:['Authorized','Procurement'].includes(r.status)?2:3;
    const recent=[...active].sort((a,b)=>priority(a)-priority(b)||(new Date(b.createdAt).getTime()||0)-(new Date(a.createdAt).getTime()||0)).slice(0,3);
    const clinicalStarts=[['wounds'],['breathing'],['vitals']];
    const essentialStarts=[['dha-medicines','Medicines','Medicines mapped to the clinic requirements'],['dha-equipment','Equipment','Required equipment, diagnostics & furniture'],['dha-consumables','Consumables','Required disposables, wound care & PPE']];
    const homeArt={wounds:'wounds',breathing:'breathing',vitals:'vitals-assessment-exact','dha-medicines':'medicines','dha-equipment':'equipment','dha-consumables':'infection'};
    const homeCategory=(id,label)=>{const c=clinicalNeedMeta(id);return `<button class="pscHomeCategory" style="--category-tint:${c.bg}" data-go="portal/catalogue/${id}" aria-describedby="psc-home-note-${id}"><span class="pscHomeCategoryArt"><span class="pscHomeCategoryIcon" aria-hidden="true"><img src="/assets/clinical-icons/${homeArt[id]}.png" alt="" loading="lazy" decoding="async"></span>${id.startsWith('dha-')?`<img class="pscHomeDha" src="${DHA_ICON}" alt="DHA requirement mapping">`:''}</span><span><b>${esc(label||c.label)}</b></span></button>`;};
    const guide=items=>`<details class="pscHomeCategoryGuide psDisclosure"><summary>About these categories</summary><dl>${items.map(([id,label,note])=>{const c=clinicalNeedMeta(id);return `<dt>${esc(label||c.label)}</dt><dd id="psc-home-note-${id}">${esc(note||c.note)}</dd>`;}).join('')}</dl></details>`;
    const row=r=>`<button class="psPortalActivity" data-request-view="${esc(r.id)}"><span><b>${esc(r.quoteRef||r.id)}</b><small>${date(r.createdAt)} · ${r.lines.length} request line${r.lines.length===1?'':'s'}</small></span><span>${customerStatusPill(r.status)}<small class="psPortalRowAction">${r.status==='Sent'?(r.quote?.management_decision?'View recorded decision':'Review quotation'):['Authorized','Procurement','Delivery'].includes(r.status)?'View progress':'View request'}</small></span></button>`;
    const draft=state.basket;
    return shell(`<div class="psExperience psPortalHome buyerWorkspace">
      <section class="psPortalWelcome" aria-labelledby="psPortalTitle">
        <div class="psPortalSearchCopy"><h1 id="psPortalTitle">Your clinic. Ready for what’s next.</h1><p class="buyerCampus">${esc(state.campus)}</p><p>Find the right products. Build your request. We’ll take care of the sourcing.</p>
          <form class="psPortalSearch" data-ps-command-form role="search"><label class="srOnly" for="psPortalCommand">Search your institutional catalogue</label><span aria-hidden="true"><img class="psPortalUtilityArt" src="/assets/ui-icons/search.webp" alt=""></span><input id="psPortalCommand" data-cat-q type="search" aria-label="Search catalogue" placeholder="Product, brand or describe what you need…" autocomplete="off" maxlength="400"><button class="button dark" type="submit">Search</button></form>
          <div class="psPortalSearchExamples"><span>Try</span>${['Sterile gauze','Digital thermometer','Examination gloves'].map(q=>`<button type="button" data-portal-query="${esc(q)}">${esc(q)}</button>`).join('')}</div>
          <button class="psTextLink" data-go="portal/catalogue">Browse the catalogue</button>
        </div>
        <div class="psPortalDraft ${draft.length?'hasDraft':''}" aria-label="${draft.length?'Saved supply request':'Send an existing list'}">${draft.length?`<h2>Pick up where you left off.</h2><p>${draft.length} request line${draft.length===1?'':'s'} · ${basketQty()} requested units</p><ul>${draft.slice(0,2).map(l=>{const p=l.sku?product(l.sku):null;return `<li><span>${esc(p?.name||lineDisplayName(l,p))}</span><small>${l.qty} × ${esc(linePackLabel(l,p))}</small></li>`;}).join('')}</ul>${draft.length>2?`<small>+ ${draft.length-2} more line${draft.length===3?'':'s'}</small>`:''}<button class="button dark" data-basket>Continue your request</button><small>Saved for this site. Review before submitting.</small>`:`<span class="psPortalListIcon" aria-hidden="true"><img class="psPortalUtilityArt" src="/assets/ui-icons/my-requests.webp" alt=""></span><h2>Already have a list?</h2><p>Send your RFQ, spreadsheet or existing product list. Start with what you have.</p><button class="button outline" data-go="start">Upload your list</button>`}</div>
      </section>
      <section class="buyerActionHub" aria-labelledby="buyerActionTitle">
        <div class="buyerHubHeading"><h2 id="buyerActionTitle">Get the next thing done.</h2><p>One place for your clinic’s supply requests.</p></div>
        <div class="buyerActionGrid">
          <button class="buyerAction buyerActionPrimary" data-go="portal/replenish"><img src="/assets/ui-icons/orders.webp" alt=""><span><h3>Order again</h3><p>Previous supplies. New quantities. A fresh quotation.</p></span><span class="buyerActionLabel">Choose previous items</span></button>
          <button class="buyerAction" data-buyer-list><img src="/assets/ui-icons/my-requests.webp" alt=""><span><h3>Start with your list</h3><p>Paste what you need, including items you can’t find.</p></span><span class="buyerActionLabel">Prepare a request</span></button>
          <button class="buyerAction" ${awaiting[0]?`data-request-view="${esc(awaiting[0].id)}"`:'data-go="portal/requests"'}><img src="/assets/ui-icons/my-requests.webp" alt=""><span><h3>${awaiting.length?`${awaiting.length} quotation${awaiting.length===1?'':'s'} to review`:'Requests & quotations'}</h3><p>${awaiting.length?'Check exact items, prices and terms before authorization.':'Follow your requests from submission to supply.'}</p></span><span class="buyerActionLabel">${awaiting.length?'Review quotation':'View your requests'}</span></button>
          <button class="buyerAction" data-go="portal/documents"><img src="/assets/ui-icons/downloads.webp" alt=""><span><h3>Your paperwork</h3><p>${documentCount?`${documentCount} attached document${documentCount===1?'':'s'}, organized by request.`:'Quotations and delivery records, together by request.'}</p></span><span class="buyerActionLabel">Find a document</span></button>
        </div>
      </section>
      ${delivered.length?`<section class="buyerRecentSupply" aria-labelledby="buyerRecentTitle"><div class="buyerHubHeading"><h2 id="buyerRecentTitle">Need the same supplies?</h2><button class="psTextLink" data-go="portal/requests">All previous requests</button></div><div class="buyerRepeatTableWrap"><table class="buyerRepeatTable"><thead><tr><th scope="col">Request</th><th scope="col">Requested</th><th scope="col">Items</th><th scope="col">Repeat</th></tr></thead><tbody>${[...delivered].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,3).map(r=>`<tr><td data-label="Request"><button class="buyerReferenceLink" data-request-view="${esc(r.id)}">${esc(r.id)}</button></td><td data-label="Requested">${date(r.createdAt)}</td><td data-label="Items"><button class="buyerHistoryItemsButton" data-buyer-history-items aria-expanded="false" aria-controls="request-items-${encodeURIComponent(r.id)}">${r.lines.length} item${r.lines.length===1?'':'s'}</button></td><td data-label="Repeat"><button class="button light" data-reorder-order="${esc(r.id)}">Repeat request</button></td></tr><tr class="buyerHistoryDetailRow" id="request-items-${encodeURIComponent(r.id)}" hidden><td colspan="4"><table class="buyerHistoryLineTable"><caption>Items in request ${esc(r.id)}</caption><thead><tr><th scope="col">Product</th><th scope="col">Recorded pack</th><th scope="col">Quantity</th></tr></thead><tbody>${r.lines.map(l=>`<tr><td>${esc(lineDisplayName(l,l.sku?product(l.sku):null))}</td><td>${esc(l.lineSnapshot?.pack||l.orderPackBasis||l.requestUnit||l.productOptionSnapshot?.pack||'Pack not recorded')}</td><td>${l.qty}</td></tr>`).join('')}</tbody></table></td></tr>`).join('')}</tbody></table></div><p class="buyerRepeatNote">Review quantities and exact packs before submitting. Prices and availability are confirmed in a new quotation.</p></section>`:''}
      <div class="buyerTaskLinks"><button class="button light" data-go="start">Upload an RFQ or spreadsheet</button><button class="button light" data-go="portal/wishlist">Saved products</button></div>
      <div class="psPortalWork">
        <section class="psPortalAttention" aria-labelledby="psPortalActivityTitle"><div class="psPortalSectionHead"><div><h2 id="psPortalActivityTitle">${awaiting.length?'Your quotations are ready.':'Your requests, moving forward.'}</h2><p>${awaiting.length?`${awaiting.length} quotation${awaiting.length===1?'':'s'} available to review.`:active.length?`${active.length} request${active.length===1?'':'s'} in progress.`:'A clear view of what happens after you request.'}</p></div><button class="psTextLink" data-go="portal/requests">View all</button></div><div class="psPortalActivityList">${recent.map(row).join('')||`<div class="psPortalNoActivity"><span aria-hidden="true"><img class="psPortalUtilityArt" src="/assets/ui-icons/my-requests.webp" alt=""></span><div><h3>No requests in progress.</h3><p>${delivered.length?'Your previous orders are ready to revisit whenever you need them.':'Your quotations and order updates will appear here after your first request.'}</p></div></div>`}</div></section>

      </div>
      <section class="psPortalBaskets" aria-labelledby="psPortalBasketsTitle"><div class="psPortalSectionHead"><div><h2 id="psPortalBasketsTitle">Start with the whole task.</h2><p>Opening, restocking or refilling? Review a basket preview.</p></div><button class="psTextLink" data-go="portal/baskets">All ready baskets</button></div><div class="psPortalBasketGrid">${window.PSC_READY_BASKETS?.compactCards()||'<button class="button outline" data-go="portal/baskets">Explore basket previews</button>'}</div></section>
      <div class="pscHomeBrowse pscHomeBrowseSeparated"><div class="pscHomeCategoryColumns"><section class="pscClinicalBrowse" aria-labelledby="psc-browse-title"><div class="psPortalSectionHead"><div><h2 id="psc-browse-title">Browse by clinical need</h2><p>Find products for the task in front of you.</p></div><button class="psTextLink" data-go="portal/catalogue">All categories</button></div><div class="pscHomeCategoryGrid" role="group" aria-label="By clinical need">${clinicalStarts.map(args=>homeCategory(...args)).join('')}</div>${guide(clinicalStarts)}</section><section class="pscRequirementBrowse" aria-labelledby="psc-requirement-title"><div class="psPortalSectionHead"><div><h2 id="psc-requirement-title">Clinic requirement mapping</h2><p>Explore the mapped medicines, equipment and consumables.</p></div></div><div class="pscHomeCategoryGrid" role="group" aria-label="Clinic essentials">${essentialStarts.map(args=>homeCategory(...args)).join('')}</div>${guide(essentialStarts)}<small class="pscHomeScopeNote">DHA educational clinic mapping. Required alternatives and conditional items retain their original conditions; suitability is checked before quotation.</small></section></div></div>
      <section class="psPortalHelp" aria-label="Product and purchasing guidance"><div><h2>A little clarity before you order.</h2><p>Practical product and specification guidance from The Workshop.</p></div><div><button class="psTextLink" data-go="workshop/product-basics">Product basics</button><button class="psTextLink" data-go="workshop/ordering-specifications">Preparing a specification</button><button class="psTextLink" data-go="workshop">All guides</button></div></section><p class="psPortalApprovalNote">Submitting a request does not place a purchase order. Final approvals follow your organisation’s agreed process.</p>
    </div>`);
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
    return shell(`<div class="pageHeader"><div><span class="eyebrow">MULTI-SITE SCHOOL VIEW</span><h1>School Clinics</h1><p>Show each school or campus as its own managed clinic account with a clear source route, request history and readiness context.</p></div><div class="headerActions"><button class="button light" data-go="portal/demo">Run navigator demo</button><button class="button primary" data-go="portal/catalogue">Browse catalogue</button></div></div><div class="schoolHeroStrip"><div><b>2</b><span>Managed school clinics</span></div><div><b>1</b><span>Primary supply partner</span></div><div><b>1</b><span>Backup route per site</span></div><div><b>100%</b><span>School-specific visibility</span></div></div><div class="schoolGridV7">${cards}</div><section class="panel" style="margin-top:18px"><div class="panelHeader"><h2>How to position it</h2></div><div class="v5PositionGrid"><div><span class="eyebrow">FOR THE SCHOOL</span><h3>One simple interface</h3><p class="smallMuted">Each clinic sees only what matters: approved essentials, quick refill workflows, reports and equipment records.</p></div><div><span class="eyebrow">FOR PS</span><h3>Controlled account structure</h3><p class="smallMuted">Every site can still map to specific routing logic, supplier decisions, commercial rules and delivery controls behind the scenes.</p></div><div><span class="eyebrow">FOR ACORUS / MED7</span><h3>Repeatable fulfilment</h3><p class="smallMuted">Orders can be grouped by school, campus and nearest fulfilment logic once the proper partner feed is connected.</p></div></div></section>`);
  }

  function guidedDemo(){
    const steps=[
      {n:'01',label:'SELECT THE SCHOOL',title:'Start with the clinic, not the catalogue.',text:'Choose a school or campus and immediately present a controlled clinic workspace instead of a generic consumer-pharmacy storefront.',outcome:'The school sees its own clinic account, not thousands of irrelevant lines.',visual:'school'},
      {n:'02',label:'BUILD THE REQUEST',title:'Refill the clinic in minutes.',text:'Use approved items, previous purchases and fast quantity entry to create one clean request for PS review.',outcome:'The nurse or doctor spends less time chasing products and more time managing the clinic.',visual:'request'},
      {n:'03',label:'PS CONTROLS THE COMPLEXITY',title:'Behind the scenes, PS does the hard part.',text:'PS validates route, supplier evidence, tax, stock and delivery before a quotation is issued and before procurement is released.',outcome:'The school experiences simplicity while PS protects quality, compliance, margin and execution.',visual:'control'},
      {n:'04',label:'END WITH REPORTING',title:'Turn supply into visibility.',text:'Close the story with inventory readiness, stock alerts, expiring items, asset actions and the next steps the school should take.',outcome:'You are no longer just supplying items — you are helping the school manage readiness.',visual:'report'}
    ];
    const i=Math.max(0,Math.min(steps.length-1,ui.tourStep||0)), st=steps[i];
    const talkTracks=[
      '"Each school gets its own clinic workspace and approved supply view."',
      '"This is how a nurse can build a refill request in just a few clicks."',
      '"PS keeps the sourcing and control complexity behind the curtain."',
      '"The portal ends with a report the school can act on immediately."'
    ];
    const visual={
      school:`<div class="demoShotV7"><div class="shotHeader"><span>School clinics</span><b>${esc(state.groupName||'School Group')}</b></div><div class="shotBody schoolSelector"><article class="schoolMini active"><b>${esc(state.campus||'Main Campus Clinic')}</b><small>Your authorized clinic account</small><span>Account ready</span></article><article class="schoolMini"><b>Additional campus</b><small>Available when assigned</small><span>Group access</span></article></div><div class="shotFoot">Every campus gets its own request history, inventory view and asset register.</div></div>`,
      request:`<div class="demoShotV7"><div class="shotHeader"><span>Approved clinic list</span><b>Fast refill request</b></div><div class="shotBody requestStack"><div class="reqRow"><div><b>Gauze Swab 5 × 5 cm</b><small>First aid / wound care</small></div><span>6</span></div><div class="reqRow"><div><b>Instant Cold Pack</b><small>Sports day refill</small></div><span>8</span></div><div class="reqRow"><div><b>Antiseptic Liquid 125 ml</b><small>Clinic essentials</small></div><span>3</span></div><button class="button primary full">Send supply request</button></div><div class="shotFoot">The school builds one request; PS handles the commercial route.</div></div>`,
      control:`<div class="demoShotV7"><div class="shotHeader"><span>PS release gate</span><b>Quote before procurement</b></div><div class="shotBody controlGrid"><div class="controlChip ok"><b>Exact SKU</b><small>Mapped and approved</small></div><div class="controlChip ok"><b>Stock</b><small>Current source verified</small></div><div class="controlChip warn"><b>VAT</b><small>Evidence checked</small></div><div class="controlChip ok"><b>Delivery</b><small>Campus route matched</small></div><div class="controlChip warn"><b>Licensed route</b><small>Controlled if needed</small></div><div class="controlChip block"><b>Funding</b><small>Release before supplier PO</small></div></div><div class="shotFoot">PS stays accountable even when products come from multiple underlying vendors.</div></div>`,
      report:`<div class="demoShotV7"><div class="shotHeader"><span>Clinic account</span><b>${esc(state.campus||'School clinic')} overview</b></div><div class="shotBody reportStack"><div class="reportBig"><b>72%</b><span>Readiness</span></div><div class="reportBars"><div><label>Wound care</label><i style="width:81%"></i></div><div><label>PPE</label><i style="width:66%"></i></div><div><label>Clinical disposables</label><i style="width:54%"></i></div><div><label>Respiratory</label><i style="width:38%"></i></div></div><div class="reportActionsMini"><span>Replenish 4 low-stock lines</span><span>Review 5 watch items</span><span>Check 1 asset action</span></div></div><div class="shotFoot">Finish the demo by showing clear actions, not just data.</div></div>`
    }[st.visual];
    return shell(`<div class="pageHeader demoHeader"><div><span class="eyebrow">GUIDED EXPLAINER / NAVIGATOR</span><h1>Four-step school demo</h1><p>A tighter, cleaner walk-through you can present live to a school nurse, doctor, administrator or procurement lead.</p></div><button class="button outline" data-go="portal/insights">Jump to report</button></div>
      <div class="tourProgress tourProgressV7">${steps.map((x,j)=>`<button class="tourDot ${j===i?'active':j<i?'done':''}" data-tour-jump="${j}"><b>${x.n}</b><span>${x.title}</span></button>`).join('')}</div>
      <section class="tourStage tourStageV7"><div class="tourNarrative"><span class="kicker">${st.label}</span><h2>${st.title}</h2><p>${st.text}</p><div class="demoOutcome"><span>What the school understands</span><b>${st.outcome}</b></div><div class="demoTalkTrack"><span>Suggested presenter line</span><strong>${talkTracks[i]}</strong></div><div class="tourNav"><button class="button outline" data-tour-prev ${i===0?'disabled':''}>Previous</button>${i<steps.length-1?'<button class="button primary" data-tour-next>Next</button>':'<button class="button primary" data-go="portal/insights">Open full report →</button>'}</div></div><div class="tourVisual tourVisualV7">${visual}</div></section>
      <section class="panel" style="margin-top:18px"><div class="panelHeader"><h2>Why this demo works</h2></div><div class="v5PositionGrid"><div><span class="eyebrow">SIMPLE</span><h3>Less AI, less clutter</h3><p class="smallMuted">The story is shorter, more visual and easier to walk through live.</p></div><div><span class="eyebrow">COMMERCIAL</span><h3>Shows PS's role clearly</h3><p class="smallMuted">It communicates that PS is not merely a product list — it is the accountable operating partner.</p></div><div><span class="eyebrow">ACTIONABLE</span><h3>Ends with insight</h3><p class="smallMuted">Schools see that the portal can lead to concrete inventory actions, not just another order screen.</p></div></div></section>`);
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


  const searchSessions=new Map();
  let searchTypingTimer;
  function productSearchMemory(){const key=state.activeSchoolId||'draft';if(!searchSessions.has(key))searchSessions.set(key,{terms:'',size:'',selectedSku:'',resultIds:[],searches:[]});return searchSessions.get(key);}
  function searchProductForLine(line){
    if(line.kind==='unlisted')return null;
    if(line.sku)return product(line.sku);
    const options=[line.productOptionSnapshot,...(line.requestedProductOptions||[])].filter(Boolean);
    const option=options.at(-1),name=option?.exact_product_name;
    if(name){const exact=products().find(p=>window.PS_PRODUCT_KNOWLEDGE.norm(p.name)===window.PS_PRODUCT_KNOWLEDGE.norm(name));if(exact)return exact;}
    return line.familyId?{pscSku:line.familyId,name:name||line.familyName,brand:option?.brand||line.requestedBrand||'',spec:line.commercialSpecification||'',pack:option?.pack||line.orderPackBasis||''}:null;
  }
  function productSearchContext(){
    const memory=productSearchMemory(),selected=state.basket.map(searchProductForLine).filter(Boolean);
    const focus=memory.selectedSku?(product(memory.selectedSku)||searchProductForLine(state.basket.find(l=>l.familyId===memory.selectedSku)||{})):null;
    if(focus&&!selected.some(p=>p.pscSku===focus.pscSku))selected.push(focus);
    return {terms:memory.terms,size:memory.size,selectedProducts:selected,previousSearches:memory.searches.slice(-5),category:currentRoute().split('/')[2]||'all',institutionType:authContext?.school?'school':'',orderType:scopeDraft().orderType,location:scopeDraft().location};
  }
  const intelligent = {choices:[],confirmed:'',confidence:'possible',action:null, said:'', message:'', selected:'', pending:null, sheet:false, sequence:0};
  const emptyScope=()=>({institution:'',location:'',sites:null,orderType:'',retained:[],quantityConfirmation:false});
  function scopeDraft(){
    state.scopesBySchool=state.scopesBySchool||{};
    const key=state.activeSchoolId||'draft';
    return state.scopesBySchool[key]||(state.scopesBySchool[key]=emptyScope());
  }
  function scopeNote(){
    const scope=scopeDraft(),basketReviews=[...new Set(state.basket.flatMap(l=>l.readyBasketReviews||[]))];
    if(!basketReviews.length&&!scope.location&&!scope.sites&&!scope.retained.length&&!scope.orderType&&!scope.institution&&!state.basket.some(l=>l.requestUnit))return '';
    return ['PS request scope',...basketReviews,scope.institution&&`Institution / site: ${scope.institution}`,scope.location&&`Delivery location: ${scope.location}`,scope.sites&&`Sites: ${scope.sites} — ${scope.quantityConfirmation?'quantities require confirmation':'quantities are totals across all sites'}`,scope.orderType&&`Order type: ${scope.orderType}`,state.basket.some(l=>l.requestUnit)&&`Requested units: ${state.basket.filter(l=>l.requestUnit).map(l=>`${lineDisplayName(l,l.sku?product(l.sku):null)} × ${l.qty} ${l.requestUnit}`).join('; ')} — pack basis needs PS verification`,scope.retained.length&&`Existing / retain (excluded from supply): ${scope.retained.map(l=>`${lineDisplayName(l,l.sku?product(l.sku):null)} × ${l.qty}`).join('; ')}`,'Specifications, availability, pack basis and commercial terms need PS verification.'].filter(Boolean).join('\n');
  }
  function intelligentSearchField(){
    return `<section class="psIntelligentSearch">${draftUndoControl()}<span class="sectionLabel">Search the catalogue</span><h2>Tell us what you need</h2><p>the way you’d normally say it</p><label for="psCommand">${state.basket.length?'Change this scope in plain language':'Search the catalogue'}</label><form data-ps-command-form><input id="psCommand" type="search" data-cat-q aria-label="Search catalogue" value="${esc(ui.catalogueQuery)}" placeholder="We need a wheelchair…" autocomplete="off" maxlength="400"><button class="button dark" type="submit">Apply</button><button class="button outline" type="button" data-catalogue-clear ${!ui.catalogueQuery&&!intelligent.action?'disabled':''}>Clear</button></form>${intelligent.said?`<div class="psInterpretation" role="status"><span>You said: “${esc(intelligent.said)}”</span><b>PS understood: ${esc(intelligent.message)}</b></div>`:''}${intelligent.choices.length?`<div class="psClarification"><b>Which catalogue line should we add?</b>${intelligent.choices.map(p=>`<button type="button" class="button outline" data-ps-select-sku="${esc(p.pscSku)}">${esc(p.catalogueDisplayName||p.name)}</button>`).join('')}</div>`:''}${intelligent.pending?.kind==='product_type'?`<div class="psClarification"><b>Which type of mask did you mean?</b>${['nebulizer mask','oxygen mask','face mask'].map(q=>`<button type="button" class="button outline" data-ps-clarify-type="${q}">${q}</button>`).join('')}</div>`:''}${intelligent.pending&&intelligent.pending.kind!=='product_type'?`<div class="psClarification"><b>Which size did you mean?</b>${intelligent.pending.sizes.map(size=>`<button class="button outline" data-ps-clarify="${esc(size)}">${esc(size.replace('x',' × '))} cm</button>`).join('')}<button class="button outline" data-ps-clarify="both">Show both</button></div>`:''}</section>`;
  }
  function requestScopePanel(){
    const scope=scopeDraft(),lines=state.basket;const missing=[!lines.length&&'Items',!state.groupName&&!scope.institution&&'Institution name',!scope.location&&'Delivery location',scope.quantityConfirmation&&'Quantities per site / total',lines.some(l=>!l.requestUnit)&&'Pack / unit confirmation'].filter(Boolean);
    const done=[lines.length>0,!!(state.groupName||scope.institution),!!scope.location,!!scope.sites].filter(Boolean).length;
    return `<aside class="psLiveRequest ${intelligent.sheet?'isOpen':''}" aria-label="Your Request"><div class="psScopeHeader"><h2>Your Request</h2><button class="iconBtn" data-ps-sheet-close aria-label="Close request sheet">×</button></div><dl><div><dt>Institution / site</dt><dd>${state.groupName?`${esc(state.groupName)}${state.campus?` · ${esc(state.campus)}`:''}`:`<input aria-label="Institution / site" data-ps-scope="institution" value="${esc(scope.institution||'')}" placeholder="Not provided yet" maxlength="160">`}</dd></div><div><dt>Delivery location</dt><dd><input aria-label="Delivery location" data-ps-scope="location" value="${esc(scope.location)}" placeholder="Not provided yet" maxlength="160"></dd></div><div><dt>Sites</dt><dd><input aria-label="Number of sites" data-ps-scope="sites" type="number" min="1" max="10000" value="${scope.sites||''}" placeholder="Not provided yet"></dd></div><div><dt>Order type</dt><dd><select aria-label="Order type" data-ps-scope="orderType"><option value="">Not provided yet</option>${['Opening clinic supply','Replenishment','Equipment requirement'].map(x=>`<option ${scope.orderType===x?'selected':''}>${x}</option>`).join('')}</select></dd></div></dl><div class="psScopeItems">${lines.length?lines.map((l,i)=>`<div class="psScopeLine"><b>${esc(lineDisplayName(l,l.sku?product(l.sku):null))}</b><div><label>Qty <input aria-label="Quantity for ${esc(lineDisplayName(l,l.sku?product(l.sku):null))}" data-ps-line-qty="${i}" type="number" min="1" max="10000" value="${l.qty}"></label><span>${esc(l.requestUnit||linePackLabel(l,l.sku?product(l.sku):null))}</span><button class="textAction" data-ps-line-remove="${i}">Remove</button></div></div>`).join(''):'<p>Add products while you browse.</p>'}</div>${scope.retained.length?`<div class="psRetained"><b>Existing / retain</b>${scope.retained.map(l=>`<p>${esc(lineDisplayName(l,l.sku?product(l.sku):null))} × ${l.qty}</p>`).join('')}<small>Excluded from active supply quantities.</small></div>`:''}<div class="psScopeTotals"><span>Lines: <b>${lines.length}</b></span><span>Total quantity: <b>${basketQty()}</b></span></div>${scope.quantityConfirmation?'<button class="textAction psQuantityConfirm" data-ps-confirm-totals>Quantities are totals across all sites</button>':''}<progress aria-label="Request completeness" max="4" value="${done}"></progress><p class="psScopeMissing">Still needed: ${esc(missing.join(', ')||'PS verification')}</p><small>Needs PS verification. Quantities are requested pack counts; no stock or price commitment.</small><button class="button primary full" data-ps-prepare ${!lines.length?'disabled':''}>Prepare Request</button></aside><button class="psScopeMobileSummary button dark" data-ps-sheet-open>Your Request · ${lines.length} ${lines.length===1?'item':'items'}</button>`;
  }
  function resetIntelligentSearch(){clearTimeout(searchTypingTimer);intelligent.sequence++;intelligent.action=null;intelligent.pending=null;intelligent.choices=[];intelligent.confirmed='';intelligent.said='';intelligent.message='';intelligent.sheet=false;}
  async function applyIntelligentCommand(text){
    if(!String(text).trim())return;
    if(/^(?:undo|undo (?:that|last change|the last change))\s*[.!]?$/i.test(String(text).trim())){undoDraftChange();return;}
    if(currentRoute()==='home'&&!session){
      try{sessionStorage.setItem('pscPendingRoute','portal/catalogue/all');sessionStorage.setItem('pscPendingSearch',String(text).slice(0,400));}catch{}
      go('login');return;
    }
    // The browse landing is an entry point, not a separate search surface.
    // Submit into the same full-catalogue workspace used by category searches.
    // Do this before capturing the route/sequence so async ranking stays valid.
    if(['portal/catalogue','portal/dashboard','home'].includes(currentRoute())){
      ui.catalogueCat='All product types';ui.catalogueFilter='All lines';
      go('portal/catalogue/all',{searchQuery:text});
    }
    clearTimeout(searchTypingTimer);const seq=++intelligent.sequence,route=currentRoute(),context=productSearchContext();
    let action=window.PS_INTELLIGENT_SEARCH.interpret(text,context);
    if(seq!==intelligent.sequence||route!==currentRoute())return;
    if(!action)return;
    if(action.invalidQuantity&&['add','quantity','sites'].includes(action.intent)){intelligent.said=String(text).slice(0,400);intelligent.message='Enter a whole quantity between 1 and 10,000; your request is unchanged';ui.catalogueQuery='';ui.globalSearch='';renderUi({preserveScroll:true,transition:false});return;}
    intelligent.said=String(text).slice(0,400);intelligent.message='Matching catalogue records';intelligent.pending=null;intelligent.choices=[];
    window.PS_SEARCH_ANALYTICS?.record('search',{query:text,intent:action.intent,resultIds:window.PS_INTELLIGENT_SEARCH.rank(catalogueProducts(),action,context).slice(0,12).map(p=>p.pscSku),clarification:action.ambiguous});
    const scope=scopeDraft();
    if(action.intent==='location'){scope.location=action.location;intelligent.message=`Delivery location: ${action.location}`;}
    else if(action.intent==='sites'){scope.sites=action.quantity;scope.quantityConfirmation=true;intelligent.message=`${action.quantity} sites — confirm quantities; items have not been multiplied`;}
    else if(action.intent==='filter'){intelligent.action=action;intelligent.message=action.filter==='all'?'All catalogue lines':`Showing ${action.filter}; your request is unchanged`;}
    else{
      const matches=window.PS_INTELLIGENT_SEARCH.rank(catalogueProducts(),action,context);
      const memory=productSearchMemory();if(matches.length){memory.terms=action.terms;memory.size=action.size;memory.resultIds=matches.slice(0,12).map(p=>p.pscSku);memory.searches.push(String(text).slice(0,400));memory.searches=memory.searches.slice(-12);}
      intelligent.confidence=action.ambiguous?'clarification':matches.some(p=>p.pscSku.toLowerCase()===action.terms.toLowerCase())?'exact':matches.length?'strong':'possible';
      intelligent.action=action;
      if(action.clarificationField==='product_type'){intelligent.message='Which type of mask did you mean?';intelligent.pending={kind:'product_type',sizes:[]};}
      if(action.ambiguous&&action.terms==='gauze'){
        const sizes=[...new Set(matches.flatMap(p=>[...(String([p.catalogueDisplayName||p.name,p.cataloguePack||p.pack].join(' '))).matchAll(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/gi)].map(m=>`${m[1]}x${m[2]}`)))].filter(v=>Number(v.split('x')[0])>=10).slice(0,4);
        if(sizes.length>1){intelligent.pending={sizes};intelligent.message='Gauze — choose a size before adding';}
      }
      if(action.budget)intelligent.message='Matching products — PS must verify pricing before comparison';
      let matchingLines=state.basket.filter(l=>window.PS_INTELLIGENT_SEARCH.rank([{pscSku:l.sku||l.familyId,name:lineDisplayName(l,l.sku?product(l.sku):null),pack:linePackLabel(l,l.sku?product(l.sku):null)}],action).length);
      if(action.reference){const line=action.reference==='first'?state.basket[0]:action.reference==='second'?state.basket[1]:action.reference==='last'?state.basket.at(-1):state.basket.find(l=>(l.sku||l.familyId)===memory.selectedSku);matchingLines=line?[line]:[];}
      if(['remove','retain'].includes(action.intent)){
        if(action.intent==='retain')scope.retained.push(...matchingLines.map(l=>({...l,scopeStatus:'existing',retainedAt:new Date().toISOString()})));
        state.basket=state.basket.filter(l=>!matchingLines.includes(l));intelligent.message=matchingLines.length?`${matchingLines.length} ${action.intent==='retain'?'lines marked existing / retain':'lines removed'}`:'No matching items in your request';
      }else if(action.intent==='quantity'){
        if(matchingLines.length===1&&action.quantity){matchingLines[0].qty=action.quantity;if(action.unit)matchingLines[0].requestUnit=action.unit;intelligent.message='Requested quantity updated';}
        else intelligent.message='Choose one request line and set its quantity';
      }else if(action.intent==='add'&&!intelligent.pending){
        const referenceLine=action.reference==='first'?state.basket[0]:action.reference==='second'?state.basket[1]:action.reference==='last'?state.basket.at(-1):state.basket.find(l=>(l.sku||l.familyId)===memory.selectedSku);
        const referenceSku=referenceLine?.sku||memory.selectedSku;
        if(action.reference&&referenceLine?.familyId){const total=referenceLine.qty+(action.quantity||1);if(total<=10000){referenceLine.qty=total;intelligent.message=`${referenceLine.familyName} × ${action.quantity||1} added to your request`;}else intelligent.message='Keep requested quantity at or below 10,000';ui.catalogueQuery='';ui.globalSearch='';save();renderUi({preserveScroll:true,transition:false});return;}
        const selected=action.reference?catalogueProducts().find(p=>p.pscSku===referenceSku):matches.find(p=>p.pscSku===intelligent.selected)||matches[0];
        if(matches.length>1&&!action.reference&&!matches.some(p=>p.pscSku===intelligent.confirmed)){intelligent.choices=matches.slice(0,12);intelligent.message='Choose an existing catalogue line before adding';save();ui.catalogueQuery='';ui.globalSearch='';renderUi({preserveScroll:true,transition:false});return;}
        intelligent.confirmed='';
        if(selected){const prior=state.basket.find(l=>lineKey(l)===selected.pscSku);if((prior?.qty||0)+(action.quantity||1)>10000){intelligent.message='Keep requested quantity at or below 10,000';ui.catalogueQuery='';ui.globalSearch='';save();renderUi({preserveScroll:true,transition:false});return;}const l=state.basket.find(l=>lineKey(l)===selected.pscSku);if(l){l.qty+=action.quantity||1;if(action.unit)l.requestUnit=action.unit;}else state.basket.push({sku:selected.pscSku,qty:action.quantity||1,requestUnit:action.unit});window.PS_SEARCH_ANALYTICS?.record('added',{query:text,productId:selected.pscSku,intent:action.intent});intelligent.selected=selected.pscSku;memory.selectedSku=selected.pscSku;intelligent.message=`${selected.catalogueDisplayName||selected.name} × ${action.quantity||1} — needs PS verification`;}
        else intelligent.message=window.PS_INTELLIGENT_SEARCH.outcome(action,matches).message;
      }else if(action.intent==='replace')intelligent.message='Choose the replacement product, then remove the old line; no items changed';
      else if(!matches.length)intelligent.message=window.PS_INTELLIGENT_SEARCH.outcome(action,matches).message;
      else if(!intelligent.pending&&!action.budget&&action.intent==='search'){intelligent.selected=matches[0].pscSku;if(matches.length===1)memory.selectedSku=matches[0].pscSku;intelligent.message=action.size?`${action.terms} · ${action.size}${/x/.test(action.size)?' cm':''}`:action.terms;}
    }
    if(['search','compare'].includes(action.intent)&&/strips|lancet|mask/.test(action.terms)&&context.selectedProducts.length){const matches=window.PS_INTELLIGENT_SEARCH.retrieve(catalogueProducts(),action,context);intelligent.message+=matches[0]?.verifiedCompatibility?' · verified compatible catalogue match':' · model / compatibility needs PS verification';}
    ui.catalogueQuery='';ui.globalSearch='';save();renderUi({preserveScroll:true,transition:false});
    if(action.intent==='search'&&!intelligent.pending)enhanceProductSearch(text,context,seq,route,action);
  }
  async function enhanceProductSearch(text,context,seq,route,localAction){
    if(intelligent.confidence==='exact')return;
    const token=session?.access_token;if(!token)return;
    try{
      const response=await fetch('/api/interpret-request',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({text:String(text).slice(0,400),context:{...context,selectedProducts:undefined,selectedIds:context.selectedProducts.map(p=>p.pscSku)}}),signal:AbortSignal.timeout(5500)});
      if(!response.ok)return;const data=await response.json();
      if(seq!==intelligent.sequence||route!==currentRoute()||ui.catalogueQuery)return;
      const action=window.PS_INTELLIGENT_SEARCH.validate({...data.action,rankedIds:data.rankedIds});if(!action||!['search','compare'].includes(action.intent))return;
      const ids=new Set(catalogueProducts().map(p=>p.pscSku));const knownMedical=window.PS_MEDICINE_KNOWLEDGE.query(localAction.terms)||window.PS_MEDICINE_KNOWLEDGE.ingredients.some(x=>new RegExp('\\b'+x+'\\b').test(localAction.terms));const permitted=knownMedical?new Set(window.PS_INTELLIGENT_SEARCH.rank(catalogueProducts(),localAction,context).map(p=>p.pscSku)):null;action.rankedIds=action.rankedIds.filter(id=>ids.has(id)&&(!permitted||permitted.has(id)));if(knownMedical){action.terms=localAction.terms;action.size=localAction.size;}action.pediatric=localAction.pediatric||action.pediatric;action.large=localAction.large||action.large;
      if(!action.rankedIds.length&&!window.PS_INTELLIGENT_SEARCH.rank(catalogueProducts(),action,context).length)return;
      intelligent.action={...localAction,...action};intelligent.message=action.terms||localAction.terms;
      const memory=productSearchMemory();memory.terms=action.terms||memory.terms;memory.resultIds=action.rankedIds;
      updateCatalogueResults();const label=document.querySelector('.psInterpretation b');if(label)label.textContent=`PS understood: ${intelligent.message}`;
    }catch{}
  }

  function catalogueProducts(){
    return products().filter(p=>{
      const controlled=window.PS_CATALOGUE_STOCK?.forProduct(p);
      return controlled?controlled.catalogue_visible:p.catalogueVisible!==false;
    });
  }

  function catalogueFilterProducts(needId='all'){
    const q=ui.catalogueQuery.trim(),types=(D.productTypes||[]).filter(Boolean),allProducts=catalogueProducts(),context=productSearchContext();
    const action=q?window.PS_INTELLIGENT_SEARCH.interpret(q,context):intelligent.action;
    const retrieval=window.PS_INTELLIGENT_SEARCH.candidates(allProducts,action,context);
    const searching=!!(q||action&&action.intent!=='filter');
    const crossCategory=searching; // Searching the whole range must not dead-end in the previous category.
    const filtered=retrieval.filter(p=>{
      const lineMatch=ui.catalogueFilter==='All lines'||(ui.catalogueFilter==='DHA requirement'&&p.dhaMapped)||(ui.catalogueFilter==='Licensed / controlled'&&p.regulated)||(ui.catalogueFilter==='Specification-led'&&p.institutionalProvisional);
      const viewMatch=!action||action.intent!=='filter'||action.filter==='all'||(action.filter==='equipment'?clinicalNeedIds(p).includes('equipment'):!clinicalNeedIds(p).includes('equipment')&&!clinicalNeedIds(p).includes('medicines'));
      return (!window.PSC_FAMILY_SHOPFRONT.key()||window.PSC_FAMILY_SHOPFRONT.matches(p,window.PSC_FAMILY_SHOPFRONT.key()))&&viewMatch&&((crossCategory&&!needId.startsWith('dha-'))||clinicalNeedMatches(p,needId))&&(ui.catalogueCat==='All product types'||p.productType===ui.catalogueCat)&&lineMatch;
    });
    return {allProducts,filtered,types,searching};
  }
  function catalogueRetailPriceNotice(){
    return '<p class="pscRetailPriceNotice" role="note"><span>Retail prices shown are for reference.</span> <strong>Wholesale prices are provided in your quotation.</strong></p>';
  }
  window.PSC_RETAIL_PRICE_NOTICE_HTML=catalogueRetailPriceNotice;

  function catalogueSearchResults(needId='all',landing=false){
    const {filtered,searching}=catalogueFilterProducts(needId);const visible=!landing||ui.catalogueQuery||intelligent.action;
    return `<section class="psSearchResults" data-ps-search-results ${visible?'':'hidden'}><div class="catalogueMeta"><span data-ps-result-count role="status" aria-live="polite" aria-atomic="true">${catalogueCardRows(filtered).length} ${searching?'matching listings':'listings'}</span></div>${filtered.some(p=>p.dhaMapped)?`<p class="pscDhaLegend"><img src="${DHA_ICON}" alt="DHA requirement mapping"><span>The DHA logo at the top right identifies a product mapped to a DHA clinic requirement. Conditional requirements and alternatives apply; exact specifications and suitability are checked before quotation.</span></p>`:''}${catalogueRetailPriceNotice()}<div class="productGrid v25ProductGrid">${visible?catalogueCardRows(filtered).map(productCard).join(''):''}</div><p class="psSearchEmpty" ${filtered.length?'hidden':''}>${esc(window.PS_INTELLIGENT_SEARCH.outcome(window.PS_INTELLIGENT_SEARCH.interpret(ui.catalogueQuery||intelligent.said||'' ,productSearchContext())||{terms:''},filtered).message)} Can’t see the exact item? PS can source an unlisted requirement. <button type="button" class="button outline" data-ps-unlisted>Add unlisted requirement</button></p></section>`;
  }
  function updateCatalogueResults(){
    const area=document.querySelector('[data-ps-search-results]');if(!area)return;
    const route=currentRoute(),landing=route==='portal/catalogue',need=route.split('/')[2]||'all';
    if(landing&&ui.catalogueQuery){ui.catalogueCat='All product types';ui.catalogueFilter='All lines';}
    const {filtered,searching}=catalogueFilterProducts(need);
    area.hidden=landing&&!ui.catalogueQuery&&!intelligent.action;
    const brandBanner=document.querySelector('[data-shopfront-carousel]');if(brandBanner)brandBanner.hidden=!!(ui.catalogueQuery||intelligent.action);
    const grid=area.querySelector('.productGrid');grid.innerHTML=area.hidden?'':catalogueCardRows(filtered).map(productCard).join('');
    area.querySelector('[data-ps-result-count]').textContent=`${catalogueCardRows(filtered).length} ${searching?'matching listings':'listings'}`;
    const heroCount=document.querySelector('.categoryHeroCount b');if(heroCount)heroCount.textContent=catalogueCardRows(filtered).length;
    const heroLabel=document.querySelector('.categoryHeroCount span');if(heroLabel)heroLabel.textContent=searching?'matching listings':'listings';
    const empty=area.querySelector('.psSearchEmpty');empty.hidden=filtered.length>0;const action=window.PS_INTELLIGENT_SEARCH.interpret(ui.catalogueQuery||intelligent.said||'',productSearchContext())||{terms:''};empty.innerHTML=esc(window.PS_INTELLIGENT_SEARCH.outcome(action,filtered).message)+' Can’t see the exact item? PS can source an unlisted requirement. <button type="button" class="button outline" data-ps-unlisted>Add unlisted requirement</button>';bindUnlistedRequirement(empty);
    // Bind only newly rendered cards. Never replace or refocus the command input while typing.
    bindCatalogueResultCards(grid);
    const clear=document.querySelector('[data-ps-command-form] [data-catalogue-clear]');if(clear)clear.disabled=!ui.catalogueQuery&&!intelligent.action;
    window.dispatchEvent(new Event('ps:search-results-updated'));
  }
  function bindUnlistedRequirement(root){root.querySelectorAll('[data-ps-unlisted]').forEach(button=>button.addEventListener('click',()=>{const description=String(ui.catalogueQuery||intelligent.said||'').trim().slice(0,400);if(!description)return;state.basket.push({kind:'unlisted',requestId:'unlisted-'+crypto.randomUUID(),description,qty:1});window.PS_SEARCH_ANALYTICS?.record('unlisted',{query:description});ui.catalogueQuery='';intelligent.said='';intelligent.message='Unlisted item — requires PS review';save();renderUi({preserveScroll:true,transition:false});}));}
  function bindCatalogueResultCards(root){
    root.querySelectorAll('[data-product-view]').forEach(el=>el.addEventListener('click',()=>{window.PS_SEARCH_ANALYTICS?.record('clicked',{productId:el.dataset.productView});productSearchMemory().selectedSku=el.dataset.productView;openProductOverlay(el.dataset.productView,false);}));
    root.querySelectorAll('[data-add]').forEach(el=>el.addEventListener('click',()=>addBasket(el.dataset.add,el.closest('.productDetailModal')?.querySelector('[data-request-quantity]')?.value||1)));
    root.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.go)));
  }

  function clinicalNeedRibbon(activeId='all'){
    const home=`<button class="needRibbonHome" data-go="portal/catalogue" aria-label="Catalogue home"><span>Catalogue home</span></button>`;
    const items=INSTITUTIONAL_CATALOGUE_TEMPLATE.categories.map(c=>`<button class="needRibbonChip ${activeId===c.id?'active':''}" style="--need-bg:${c.bg};--need-ink:${c.ink}" data-go="portal/catalogue/${c.id}" aria-current="${activeId===c.id?'page':'false'}"><b>${esc(c.label)}</b></button>`).join('');
    return `<nav class="needRibbon" aria-label="Clinical needs">${home}<div class="needRibbonTrack">${items}</div></nav>`;
  }

  function openSchoolCollection(id){
    if(!['opening','replenishment','kits'].includes(id))return;
    ui.schoolCollection=id;
    if(!/^catalogue(?:\/|$)/.test(currentRoute())&&!currentRoute().startsWith('portal/catalogue'))go('catalogue');
    else renderUi({preserveScroll:true,transition:false});
  }

  function schoolBasketSection(){
  const b=window.PS_SCHOOL_BASKETS;
  if(!b) return '';
  const selected=ui.schoolCollection||'';
  const isPortal=currentRoute().startsWith('portal/');
  const available=catalogueProducts();
  const match=id=>available.find(p=>p.pscSku===id)||available.find(p=>p.catalogueTransactionId===id)||null;
  const view=(p)=>p?`<button type="button" ${isPortal?'data-product-view':'data-public-product-view'}="${esc(p.pscSku)}">View details</button>`:'<span class="psSchoolSourceNote">Source on request</span>';
  const row=(label,p,pack='')=>`<li><span class="psSchoolLineLabel">${esc(label)}${pack?`<small class="psSchoolLinePack">${esc(pack)}</small>`:''}</span>${view(p)}</li>`;
  const options=[['opening','Complete clinic setup','Furniture, emergency equipment & opening stock'],['replenishment','Clinic refills','Wound care, hygiene, testing & disposables'],['kits','First-aid points','Gym, laboratory, canteen, trips & campus']];
  let content='';
  if(selected==='opening'){
    content=`<h3>Complete clinic opening and setup</h3><p>A grouped starting specification for a new clinic. Existing facilities and technical approval determine the final site quantities. Site works and medicines remain separate.</p><div class="psSchoolGroupGrid">`+b.opening.map(g=>`<details class="psSchoolGroup"><summary>${esc(g.title)} <span>${g.scopeChecklist?.length||g.transactions.length} ${g.scopeChecklist?'site checks':'requirement lines'}</span></summary><p>${esc(g.description)}</p><ul class="psSchoolLines">${g.transactions.map(id=>{const p=match(id);return row(p?.catalogueDisplayName||p?.name||id,p)}).join('')+(g.scopeChecklist||[]).map(item=>row(item,null)).join('')}</ul></details>`).join('')+`</div><div class="psSchoolPanelActions">${isPortal?'<button class="button dark" type="button" data-school-opening-request>Prepare complete setup request</button>':'<button class="button dark" type="button" data-go="start">Request a clinic setup quotation</button>'}</div><p class="psSchoolFinePrint">DHA version 4.1 Appendix 3 reference for DHA-licensed Dubai educational clinics. The site plan, treatment/isolation rooms, water and waste facilities, professional authorization and local authority are checked separately. A listed catalogue line is not a verified compliant model.</p>`;
  }else if(selected==='replenishment'){
    content=`<h3>Clinic consumables & replenishment</h3><p>Practical clinic-sized packs where offered, instead of a wholesaler-size cart by default. Only actual quoted unit packs and observed school needs determine quantities.</p><div class="psSchoolGroupGrid">`+b.replenishment.map(g=>{const selections=g.skus.map(match).filter(p=>p&&!p.regulated);return `<details class="psSchoolGroup"><summary>${esc(g.title)} <span>${selections.length} selections</span></summary><p>${esc(g.description)}</p><ul class="psSchoolLines">${selections.map(p=>row(p.catalogueDisplayName||p.name,p,p.cataloguePack||p.pack||'Pack to confirm')).join('')}</ul></details>`;}).join('')+`</div><p class="psSchoolFinePrint">Select exact sizes, brands and device-compatible test strips after reviewing Details. Refill quantities are requested, not auto-purchased. Check pack sizes, expiry and current supplier availability before quotation.</p>`;
  }else if(selected==='kits'){
    const kit=b.kits.find(k=>k.id===ui.schoolKit)||b.kits[0];
    content=`<h3>Location-specific first-aid points</h3><p>Packaged kit concepts with independently refillable components. The school's nurse and safety lead approve the final contents, quantity, site and custody.</p><div class="psSchoolKitSelector">${b.kits.map(k=>`<button type="button" data-school-kit="${esc(k.id)}" aria-pressed="${k.id===kit.id?'true':'false'}">${esc(k.accent)}</button>`).join('')}</div><div class="psSchoolKitBody"><h3>${esc(kit.title)}</h3><p><span class="psSchoolKitLocation">${esc(kit.where)}</span> · ${esc(kit.details)}</p><ul class="psSchoolLines">${kit.contents.map(([label,id,pack])=>row(label,id?match(id):null,'Proposed quantity: '+pack)).join('')}</ul><div class="psSchoolPanelActions">${isPortal?`<button type="button" class="button dark" data-school-kit-request="${esc(kit.id)}">Add this kit to request</button>`:'<button type="button" class="button dark" data-go="start">Enquire about this kit</button>'}</div></div><p class="psSchoolFinePrint">PS-designed kit contents are a risk-informed commercial proposal, not a prescribed DHA first-aid kit bill of materials. Dedicated laboratory emergency eyewash and safety facilities must be evaluated independently. Medicines and injectable treatments are not included in general-access kits.</p>`;
  }
  const label=`<div class="psSchoolHead"><div><h2>School clinic supply collections</h2><p>From opening a clinic to refilling first-aid points across campus.</p></div></div>`;
  return `<section class="psSchoolBaskets" aria-label="School clinic supply collections">${label}<div class="psSchoolCollectionGrid">${options.map(([id,title,subtitle])=>`<button type="button" class="psSchoolCollectionTile" data-school-collection="${id}" aria-pressed="${selected===id?'true':'false'}"><strong>${title}</strong><span>${subtitle}</span></button>`).join('')}</div>${selected?`<div class="psSchoolCollectionPanel">${content}</div>`:''}</section>`;
}

  function catalogue(){
    const allProducts=catalogueProducts();
    const dhaCount=allProducts.filter(p=>p.dhaMapped).length;
    const needCards=INSTITUTIONAL_CATALOGUE_TEMPLATE.categories.map(c=>`<button class="clinicNeedCard clinicNeedCardIllustrated" style="--need-bg:${c.bg};--need-ink:${c.ink}" data-go="portal/catalogue/${c.id}">
        <span class="clinicNeedIcon" aria-hidden="true">${clinicalNeedIllustration(c.id)}</span>
        <span class="clinicNeedCopy"><b>${esc(c.label)}</b><small>${esc(c.note)}</small></span>
        <span class="clinicNeedArrow" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 18 18 6M6 6h12v12"/></svg></span>
      </button>`).join('');

    const sf=storefrontConfig('institutional');
    return shell(`
      <div class="psCatalogueWorkspace psCatalogueLandingWorkspace"><div class="psCatalogueMain">${intelligentSearchField()}${window.PSC_FAMILY_SHOPFRONT.html({products:allProducts,imageFor:productDisplayImageUrl,countFor:items=>catalogueCardRows(items).length,searching:!!(ui.catalogueQuery||intelligent.action)})}${catalogueSearchResults('all',true)}
      <div class="pageHeader institutionalCatalogueHeader v26CatalogueLandingHeader">
        <div><span class="eyebrow">INSTITUTIONAL CATALOGUE</span><h1>${esc(sf?.headline||'Browse by clinical need.')}</h1><p>${esc(sf?.subheadline||'Start with the situation, task or area of care. The catalogue keeps sourcing complexity behind the scenes while giving clinical teams a faster route to the right products.')}</p></div>
        <div class="catalogueDepthPill"><b>${allProducts.length}</b><span>catalogue lines</span><small>${dhaCount} lines mapped to DHA requirements</small></div>
      </div>

      ${schoolBasketSection()}
      <section class="clinicNeedSection v25NeedJourney v26CatalogueLanding">
        <div class="clinicNeedHeading"><div><span class="eyebrow">CLINICAL NEEDS</span><h2>Where do you want to start?</h2><p>Choose the clinical context first. Once inside, use the product and requirement filters to narrow the catalogue.</p></div></div>
        <div class="clinicNeedRail">${needCards}</div>
      </section>

      <section class="catalogueLandingShortcuts">
        <button class="catalogueShortcut warm" data-go="portal/catalogue/all"><span>${clinicalNeedIcon('all')}</span><div><b>View all supplies</b><small>Browse the complete institutional catalogue</small></div></button>
        <button class="catalogueShortcut blue" data-go="portal/replenish"><span>${icon('repeat')}</span><div><b>Repeat a previous order</b><small>Replenish from account history</small></div></button>
        <button class="catalogueShortcut mint" data-go="portal/requests"><span>${icon('request')}</span><div><b>Orders & quotations</b><small>Review active and historical requests</small></div></button>
      </section>
      </div>${requestScopePanel()}</div>
    `);
  }

  function catalogueCategory(needId='all'){
    const selected=clinicalNeedMeta(needId);
    const {allProducts,filtered,types}=catalogueFilterProducts(selected.id);

    return shell(`
      <section class="categoryHero" style="--need-bg:${selected.bg};--need-ink:${selected.ink}">
        <div class="categoryHeroCopy"><span class="eyebrow">INSTITUTIONAL CATALOGUE</span><h1>${esc(selected.label)}</h1><p>${esc(selected.note)}</p></div>
        <div class="categoryHeroCount"><b>${catalogueCardRows(filtered).length}</b><span>listings</span></div>
      </section>

      ${selected.id.startsWith('dha-')?`<nav class="needRibbon" aria-label="DHA clinic essentials">${DHA_ESSENTIAL_CATEGORIES.map(c=>`<button class="needRibbonChip ${c.id===selected.id?'active':''}" style="--need-bg:${c.bg};--need-ink:${c.ink}" data-go="portal/catalogue/${c.id}" aria-current="${c.id===selected.id?'page':'false'}"><b>${esc(c.label)}</b></button>`).join('')}<button class="needRibbonChip" data-go="portal/catalogue">Full catalogue</button></nav>`:clinicalNeedRibbon(selected.id)}

      <div class="notice shopNotice compactInstitutionalNotice"><strong>One accountable supply relationship.</strong> PS reviews specification, availability and commercial terms before quotation. Regulated lines remain subject to the applicable licensed supply route and professional controls.</div>

      <div class="psCatalogueWorkspace"><div class="psCatalogueMain">
      ${intelligentSearchField()}
      ${window.PSC_FAMILY_SHOPFRONT.html({products:allProducts.filter(p=>clinicalNeedMatches(p,selected.id)),imageFor:productDisplayImageUrl,countFor:items=>catalogueCardRows(items).length,needId:selected.id,searching:!!(ui.catalogueQuery||intelligent.action)})}
      <div class="filterBar shopFilterBar v25FilterBar v26FilterBar">
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

      ${catalogueSearchResults(selected.id)}

      <section class="customRequestPanel v25CustomRequest v26CustomRequest">
        <div><span class="eyebrow">CAN'T FIND IT?</span><h2>Request something else.</h2><p>Describe the product, brand, size or specification. PS will review it as an account-specific product request.</p></div>
        <div class="customRequestForm"><textarea id="customRequestText" class="textarea" placeholder="Example: paediatric nebulizer masks compatible with our existing unit…"></textarea><div class="customRequestActions"><label>Qty <input id="customRequestQty" type="number" min="1" value="1"></label><button class="button dark semanticPrimary" data-submit-custom>Send custom request →</button></div></div>
      </section>
      </div>${requestScopePanel()}</div>
    `);
  }

  function catalogueBrandCount(p){
    const realBrand=value=>{
      const brand=String(value||'').trim().toLowerCase();
      return brand && !/^(specification-led|institutional range|needs verification|generic|unbranded|various|none|n\/?a|PS|PSC)$/i.test(brand) ? brand : '';
    };
    // A named product is one brand, even when its category/family has alternatives.
    if(realBrand(p?.brand)) return 1;
    const familyId=p?.catalogueParentId||p?.pscSku;
    if(!familyId) return 0;
    const brands=new Set();
    const add=value=>{const brand=realBrand(value);if(brand)brands.add(brand);};
    for(const item of D.products){
      if(item.catalogueParentId===familyId && item.workbookDecision!=='ENQUIRY ONLY') add(item.brand);
    }
    const options=window.PS_FAMILY_BRAND_OPTIONS?.()||window.PS_CATALOGUE_REFRESH?.approvedOptions||[];
    for(const option of options){if(option.family_id===familyId)add(option.brand);}
    return brands.size;
  }
  window.addEventListener('ps:catalogue-brands-ready',()=>{
    document.querySelectorAll('[data-catalogue-brand-sku]').forEach(label=>{
      const p=product(label.dataset.catalogueBrandSku);
      if(p)label.textContent=`Brands Available: ${catalogueBrandCount(p)}`;
    });
    document.querySelectorAll('[data-brand-row]').forEach(row=>{const p=product(row.dataset.brandRow);if(p)row.outerHTML=catalogueBrandChoices(p);});
  });
  function cataloguePricePreview(p){
    const stock=window.PS_CATALOGUE_STOCK?.forProduct(p);
    if(stock?.acorus_managed){
      const mrp=window.PS_CATALOGUE_STOCK.price(stock);
      return mrp?`<div class="pscPricePreview"><b>${money(mrp)}</b><span>Retail MRP${p._familyGroup?.members.length>1?" · "+esc(p.cataloguePack||p.pack||"pictured pack"):""}</span><small>In stock · stock report ${esc(window.PS_CATALOGUE_STOCK.stockDate)} · wholesale quotation separate</small></div>`:'<div class="pscPricePreview"><b>Request quotation</b><small>Current stocked retail MRP not confirmed</small></div>';
    }
    if(stock?.source_kind==='product'&&p.storefrontPriceMode!=='show_price')return '<div class="pscPricePreview"><b>Request quotation</b><small>Supplier availability and quotation to confirm</small></div>';

    const evidence=window.PSC_VARIANT_EVIDENCE_FOR?.({
      product_option_id:p.product_option_id,exact_product_name:p.name,brand:p.brand,pack:p.pack
    },p.catalogueParentId||p.catalogueReferenceFamilyId||p.pscSku);
    if(evidence) return `<div class="pscPricePreview"><b>${money(Number(evidence.price_aed))}</b><span>${evidence.price_type==='PUBLIC_RETAIL_BENCHMARK'?'UAE retail benchmark':'PSC customer price'}</span><small>${esc(evidence.price_unit)} · ${esc(evidence.price_vat_basis||'VAT confirmed in quotation')}<br>Source checked ${esc(evidence.price_checked_at)}${evidence.price_note?' · '+esc(evidence.price_note):''} · final quotation confirms</small></div>`;
    const saved=window.PSC_RECORDED_PRICES?.[p.pscSku]||{};
    const packKey=v=>String(v||'').toLowerCase().replace(/\s+/g,'');
    const record=packKey(saved.pack)===packKey(p.cataloguePack||p.pack)?saved:{};
    const indicative=p.storefrontPriceMode==='show_price'&&Number(p.contractPrice)>0?Number(p.contractPrice):record.indicative;
    const retail=record.retail;
    if(!indicative&&!retail) return '<div class="pscPricePreview"><b>Request quotation</b></div>';
    return `<div class="pscPricePreview">${indicative?`<b>${money(indicative)}</b><span>Indicative PSC price</span>`:`<b>${money(retail)}</b><span>Recorded retail benchmark</span>`}${indicative&&retail?`<small>Retail benchmark: ${money(retail)}</small>`:''}<small>Reference only · final price & VAT confirmed in quotation${record.checked?`<br>Record checked ${esc(record.checked)}`:''}</small></div>`;
  }
  function catalogueBrandChoices(p){
    const familyId=p.catalogueParentId||p.catalogueReferenceFamilyId||p.pscSku;
    const options=window.PS_FAMILY_BRAND_OPTIONS?.()||window.PS_CATALOGUE_REFRESH?.approvedOptions||[];
    const real=b=>b&&!/^(specification-led|institutional range|needs verification|generic|unbranded|various|none|n\/?a|PS|PSC)$/i.test(b);
    const familyBrands=options.filter(o=>o.family_id===familyId).map(o=>o.brand).filter(real);
    const exactBrand=p.localCatalogueRefresh?p.brand:(window.PSC_RECORDED_PRICES?.[p.pscSku]?.brand||p.brand);
    const brands=[...new Set((familyBrands.length&&!p.localCatalogueRefresh?familyBrands:[exactBrand,...familyBrands]).filter(real))];
    return brands.length?`<div class="pscBrandChoices" data-brand-row="${esc(p.pscSku)}" aria-label="Brand options">${brands.map(b=>p.localCatalogueRefresh&&b===exactBrand?`<button type="button" class="selected" data-product-view="${esc(p.pscSku)}" aria-label="View ${esc(b)} product">${esc(b)}</button>`:`<button type="button" data-psc-family-open="${esc(familyId)}" aria-label="Review ${esc(b)} options and specifications">${esc(b)}</button>`).join('')}</div>`:`<div class="pscBrandChoices" data-brand-row="${esc(p.pscSku)}"><small>Brand confirmed at quotation</small></div>`;
  }
  // Browser-local preferences only: no catalogue copies, new schema or order writes.
  function wishlistStorageKey(){
    return session?.user?.id&&authContext?.school?.id
      ? `psc-wishlist-v1:${encodeURIComponent(session.user.id)}:${encodeURIComponent(authContext.school.id)}` : null;
  }
  function wishlistKeys(){
    try{const value=JSON.parse(localStorage.getItem(wishlistStorageKey())||'[]');return new Set(Array.isArray(value)?value.filter(v=>typeof v==='string'&&/^(family|sku):/.test(v)).slice(0,1000):[]);}catch{return new Set();}
  }
  function wishlistProductKey(p){return p._savedWishlistKey||(p._familyGroup?`family:${p._familyGroup.id}`:`sku:${p.pscSku}`);}
  function wishlistControl(p){
    if(!wishlistStorageKey())return '';
    const key=wishlistProductKey(p),saved=wishlistKeys().has(key),name=p._familyGroup?.name||p.catalogueDisplayName||p.name;
    return `<button type="button" class="wishlistToggle" data-wishlist-toggle="${esc(key)}" aria-pressed="${saved}" aria-label="${saved?'Remove':'Save'} ${esc(name)} ${saved?'from':'to'} Wishlist" title="${saved?'Remove from Wishlist':'Save to Wishlist'}">${icon('heart')}<span class="wishlistLabel">${saved?'Saved':'Save'}</span></button>`;
  }
  function wishlistPage(){
    const all=catalogueProducts(),groups=catalogueCardRows(all),saved=[...wishlistKeys()];
    // Old broad-family bookmarks expand to their current product listings; none silently pick one brand.
    const rows=saved.flatMap(key=>{
      if(!key.startsWith('family:'))return [{p:all.find(p=>`sku:${p.pscSku}`===key),key}];
      const exact=groups.find(p=>p._familyGroup&&wishlistProductKey(p)===key);if(exact)return [{p:exact,key}];
      const legacy=groups.filter(p=>p._familyGroup?.parentFamilyId===key.slice(7));
      return legacy.length?legacy.map(p=>({p:{...p,_savedWishlistKey:key},key})): [{p:null,key}];
    });
    return shell(`<div class="pageHeader customerSimpleHeader"><div><h1>Wishlist</h1><p>Keep useful products together for your next requirement.</p><small class="smallMuted">Saved on this device for this signed-in user and clinic. Review the exact product and pack in Details before adding to your Supply Request.</small></div><button class="button primary" data-go="portal/catalogue">Browse catalogue</button></div>${saved.length?`<div class="v25ProductGrid wishlistGrid">${rows.map(({p,key})=>p?productCard(p):`<article class="wishlistUnavailable"><h3>Saved listing unavailable</h3><p>This listing is no longer in the current catalogue.</p><button type="button" class="button outline" data-wishlist-toggle="${esc(key)}">Remove saved listing</button></article>`).join('')}</div>`:'<div class="emptyState"><h2>Your Wishlist is ready</h2><p>Use the heart beside View details to save a product. Saving does not add it to a request.</p></div>'}`);
  }
  function toggleWishlist(control){
    const storageKey=wishlistStorageKey();if(!storageKey)return;
    const key=control.dataset.wishlistToggle,saved=wishlistKeys(),removing=saved.has(key);
    if(removing)saved.delete(key);else{if(saved.size>=1000){toast('<strong>Wishlist is full.</strong><br>Remove a saved item first.');return;}saved.add(key);}
    try{localStorage.setItem(storageKey,JSON.stringify([...saved]));}catch{toast('<strong>Could not save Wishlist.</strong><br>Device storage is unavailable.');return;}
    if(currentRoute()==='portal/wishlist')renderUi({focusSelector:'[data-wishlist-toggle], [data-go="portal/catalogue"]',transition:false});
    else document.querySelectorAll('[data-wishlist-toggle]').forEach(button=>{if(button.dataset.wishlistToggle!==key)return;button.setAttribute('aria-pressed',String(!removing));const label=button.querySelector('.wishlistLabel');if(label)label.textContent=removing?'Save':'Saved';button.setAttribute('aria-label',button.getAttribute('aria-label').replace(/^(Save|Remove) /,removing?'Save ':'Remove ').replace(/ (to|from) Wishlist$/,removing?' to Wishlist':' from Wishlist'));button.title=removing?'Save to Wishlist':'Remove from Wishlist';});
    toast(removing?'<strong>Removed from Wishlist.</strong>':'<strong>Saved to Wishlist.</strong>');
  }

  function productCard(p){
    const needId=clinicalNeedIds(p)[0]||'all';
    const need=clinicalNeedMeta(needId);
    const displayName=p._familyGroup?.name||p.catalogueDisplayName||p.name;
    const pack=p.cataloguePack||p.pack||'Pack / unit to confirm';
    const fallback=legacyProductImageUrl(p);
    const dhaMark=p.dhaMapped?`<span class="pscRequirementBadge" title="Mapped DHA clinic requirement"><img class="dhaRequirementIcon cardDhaIcon" src="${DHA_ICON}" alt="Mapped DHA clinic requirement"></span>`:'';
    const familyPhoto=window.PSC_DHA_FAMILY_PHOTOS?.forListing(p);
    const displayImage=familyPhoto?.path||(p._familyGroup&&!window.PS_CATALOGUE_STOCK?.realPhoto(p)?null:productDisplayImageUrl(p));
    const visual=displayImage
      ? `<button class="productVisual productPhoto productVisualButton" data-product-view="${p.pscSku}" aria-label="View ${esc(displayName)} details"><img class="productMainImage" data-family-example="${familyPhoto?'true':'false'}" src="${esc(displayImage)}" alt="${esc(familyPhoto?.label||(p.imageRole==='SPECIFICATION_REFERENCE_ONLY'?p.imageReferenceLabel+' · illustrative product; exact model and compatibility confirmed in quotation':p.name))}" loading="lazy" onerror="this.onerror=null;this.style.visibility='hidden'">${dhaMark}</button>`
      : `<button class="productVisual productNeedVisual productVisualButton" style="--need-bg:${need.bg};--need-ink:${need.ink}" data-product-view="${p.pscSku}" aria-label="View ${esc(displayName)}">${dhaMark}</button>`;

    return `<article data-matching-skus="${esc(JSON.stringify((p._familyGroup?.members||[p]).map(member=>member.pscSku)))}" data-family-listing="${esc(p._familyGroup?.id||'')}" class="productCard ${p._familyGroup?'pscFamilyCard':''} ${!displayImage?'pscFamilyNoPhoto':''} v25ProductCard v261ProductCard v262ProductCard canvaProductCard exactCanvaCard pscEditorialCard">
      ${visual}
      <div class="catalogueIdentityLine">${esc(p._familyGroup?.members.length>1?`${p._familyGroup.members.length} packs`:window.PSC_STOREFRONT_GROUPS?.realBrand(p.brand)?p.brand:'Request by specification')}</div>
      <div class="canvaCardBody exactCanvaBody">
        <button class="productTitleButton" data-product-view="${p.pscSku}"><h3>${esc(displayName)}</h3></button>
        ${p._familyGroup?.members.length>1?'':`<p class="pack">${esc(pack)}</p>`}${catalogueImageNote(p)||'<small class="catalogueImageNote catalogueImageNoteEmpty" aria-hidden="true"></small>'}

        ${cataloguePricePreview(p)}
        ${currentRoute().startsWith('portal/catalogue/dha-')&&p.dhaMapped?`<small class="pscDhaStatus">${esc(p.dhaStatus==='Strict'?'Required category':p.dhaStatus||'Mapped requirement')}${p.dhaReference?` · ${esc(p.dhaReference)}`:''}${p.dhaStatus==='Conditional'&&p.dhaCondition?`<br>${esc(p.dhaCondition)}`:''}</small>`:''}
      </div>
      <div class="canvaCardActions exactCanvaActions">
        <button class="canvaDetails" data-product-view="${p.pscSku}">View details</button>${wishlistControl(p)}
      </div>
    </article>`;
  }

  function replenishPage(){
    const delivered=customerVisibleRequests().filter(r=>r.status==='Accepted'),map=new Map();
    for(const r of delivered)r.lines.forEach((l,index)=>{const key=lineKey(l),basis=r.deliveredAt||r.createdAt,old=map.get(key);if(!old||new Date(basis)>new Date(old.basis))map.set(key,{l,index,r,basis});});
    const cards=[...map.values()].map(({l,index,r})=>{
      const p=l.sku?product(l.sku):null,repeat=window.PSC_BUYER_JOURNEY.repeatLine(l,p,r.id),name=lineDisplayName(l,p),pack=linePackLabel(l,p);
      const sourcing=repeat.kind==='unlisted'||!p,photo=!sourcing&&p?productDisplayImageUrl(p):'';
      return `<article class="replenishCard"><div class="replenishVisual">${photo?`<img src="${esc(photo)}" alt="${esc(name)}">`:'<span>PS</span>'}</div><div class="replenishBody"><span class="sku">${esc(l.sku||l.familyId||'Sourcing reference')}</span><h3>${esc(name)}</h3><p>${esc(pack)}</p><div class="replenishMeta"><div><span>Last requested qty</span><b>${l.qty}</b></div><div><span>Delivered</span><b>${r.deliveredAt?date(r.deliveredAt):'Date not recorded'}</b></div></div><p class="smallMuted">${sourcing?'Exact requirement retained for sourcing review. No replacement is selected.':'Previous supply is historical. Current price and availability require a new quotation.'}</p><button class="button dark full" ${!sourcing?`data-replenish="${esc(l.sku)}|${l.qty}"`:''} data-buyer-repeat-line="${esc(encodeURIComponent(r.id))}|${index}">${sourcing?'Review sourcing requirement':p&&isCapitalProduct(p)?'Request another':`Replenish ${l.qty}`}</button></div></article>`;
    }).join('');
    return shell(`<div class="pageHeader customerSimpleHeader"><div><h1>Order again</h1><p>${esc(state.campus)} · Previously supplied requirements, with original descriptions and packs. Every repeat starts a new request.</p></div><button class="button dark" data-basket>Open request</button></div>${cards?`<div class="replenishGrid">${cards}</div>`:'<div class="emptyState"><h3>No delivered items yet</h3><p>You can still repeat a previous request from Orders & Requests.</p><button class="button light" data-go="portal/requests">View request history</button></div>'}`);
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
      <div class="orderDocumentList">${docs.length?docs.map(d=>`<button class="orderDocumentRow" data-document-open="${esc(d.object_path)}"><span class="documentIcon">▤</span><span><b>${esc(d.title||documentTypeLabel(d.document_type))}</b><small>${esc(d.file_name||'Document')} · ${date(d.created_at)}</small></span><em>Open file</em></button>`).join(''):'<div class="orderDocumentEmpty">No documents attached to this order yet.</div>'}</div>
      ${r.dbId?`<div class="orderDocumentUpload"><select data-document-type="${r.id}">${options.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select><label class="button outline documentUploadButton">Attach document<input type="file" hidden data-document-upload="${r.id}" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"></label></div>`:`<div class="orderDocumentEmpty">Documents become available on live account orders.</div>`}
    </section>`;
  }

  function documentsPage(){
    const groups=customerAccountRequests().map(r=>({r,docs:(r.documents||[]).filter(d=>!buyerView.documentType||d.document_type===buyerView.documentType)})).filter(x=>x.docs.length);
    const types=[...new Set(customerAccountRequests().flatMap(r=>(r.documents||[]).map(d=>d.document_type)))];
    return shell(`<div class="pageHeader customerSimpleHeader"><div><h1>Documents</h1><p>${esc(state.campus)} · Find issued files by request. Only available account documents are shown.</p></div><label>Document type<select class="input" data-buyer-document-type><option value="">All documents</option>${types.map(t=>`<option value="${esc(t)}" ${buyerView.documentType===t?'selected':''}>${esc(documentTypeLabel(t))}</option>`).join('')}</select></label></div><div class="buyerDocumentGroups documentsIndexPanel">${groups.map(({r,docs})=>`<section class="panel"><div class="panelHeader"><div><h2>${esc(r.quoteRef||r.id)}</h2><p>${esc(r.campus)} · ${date(r.createdAt)}</p></div><button class="button light" data-request-view="${esc(r.id)}">View request</button></div><div class="documentsIndex">${docs.map(d=>`<button class="documentIndexRow" data-document-open="${esc(d.object_path)}"><span><small>${esc(documentTypeLabel(d.document_type))}</small><b>${esc(d.title||d.file_name||'Document')}</b><em>${esc(d.file_name||'')} · ${date(d.created_at)}</em></span><span class="button light">Open file</span></button>`).join('')}</div></section>`).join('')||'<div class="emptyState"><h3>No matching documents</h3><p>Files appear when attached to an authorized request. Nothing has been generated or issued by opening this page.</p><button class="button light" data-go="portal/requests">View requests</button></div>'}</div>`);
  }

  async function openOrderDocument(path){
    if(!sb || !path) return;
    if(!customerAccountRequests().some(r=>(r.documents||[]).some(d=>d.object_path===path)&&r.dbId&&path.startsWith(r.dbId+'/'))&&!authContext?.isPscAdmin){toast('This file is not available for the current campus.');return;}
    const preview=window.open('about:blank','_blank');
    try{
      const {data,error}=await sb.storage.from('order-documents').createSignedUrl(path,60);
      if(error) throw error;
      if(!data?.signedUrl)throw new Error('Signed document link was not returned');
      if(data.signedUrl){
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
  async function loadBuyerActivity(){
    if(!window.PSC_BUYER_JOURNEY.groupScope(authContext)||buyerView.groupLoading)return;
    buyerView.groupLoading=true;buyerView.groupError='';const user=session.user.id,group=authContext.group.id;
    render();
    try{
      const ids=authContext.schools.map(s=>s.id);
      const {data,error}=await sb.from('orders').select('id,order_number,school_id,status,created_at,quote_ref').in('school_id',ids).eq('group_id',group).order('created_at',{ascending:false}).limit(100);
      if(error)throw error;
      if(session?.user?.id!==user||authContext?.group?.id!==group)return;
      buyerView.groupRows=(data||[]).filter(r=>ids.includes(r.school_id));
    }catch(e){if(session?.user?.id===user&&authContext?.group?.id===group)buyerView.groupError='Activity could not be loaded. Try again; no records were changed.';}
    finally{if(session?.user?.id===user&&authContext?.group?.id===group){buyerView.groupLoading=false;render();}}
  }
  function buyerActivityPanel(){
    if(!window.PSC_BUYER_JOURNEY.groupScope(authContext))return '';
    const rows=(buyerView.groupRows||[]).filter(r=>(!buyerView.dateFrom||String(r.created_at).slice(0,10)>=buyerView.dateFrom)&&(!buyerView.campusFilter||r.school_id===buyerView.campusFilter));
    return `<section class="panel buyerGroupActivity"><div class="panelHeader"><div><h2>Across your authorized campuses</h2><p>Read-only purchasing activity. Your active request stays with ${esc(state.campus)}.</p></div><button class="button light" data-buyer-group ${buyerView.groupLoading?'disabled':''}>${buyerView.groupOpen?'Refresh activity':'View campus activity'}</button></div>${buyerView.groupOpen?`<div class="buyerGroupFilters"><label>Campus<select class="input" data-buyer-campus-filter><option value="">All authorized campuses</option>${authContext.schools.map(s=>`<option value="${esc(s.id)}" ${buyerView.campusFilter===s.id?'selected':''}>${esc(schoolLabel(s))}</option>`).join('')}</select></label><label>From date<input class="input" type="date" data-buyer-date value="${esc(buyerView.dateFrom)}"></label></div>${buyerView.groupLoading?'<p role="status">Loading authorized activity…</p>':buyerView.groupError?`<p role="alert">${esc(buyerView.groupError)}</p>`:`<div class="tableWrap"><table class="buyerCampusTable"><thead><tr><th>Campus</th><th>Request</th><th>Recorded status</th><th>Created</th><th></th></tr></thead><tbody>${rows.map(r=>`<tr><td data-label="Campus">${esc(schoolLabel(authContext.schools.find(s=>s.id===r.school_id)))}</td><td data-label="Request">${esc(r.order_number)}</td><td data-label="Status">${esc(window.PSC_BUYER_JOURNEY.statusLabel(DB_TO_UI_STATUS[r.status]))}</td><td data-label="Created">${date(r.created_at)}</td><td><button class="button light" data-buyer-campus-request="${esc(r.school_id)}|${esc(r.id)}">${r.school_id===authContext.school.id?'Open request':'Switch campus & open'}</button></td></tr>`).join('')}</tbody></table></div>${!rows.length?'<p>No matching activity in your authorized sites. Adjust the filters or refresh.</p>':''}<small>Up to 100 recent requests. Opening another campus explicitly switches your account context; the current draft stays saved to its original site. Quoted values are not expenditure, invoices or collections.</small>`}`:''}</section>`;
  }
  function requestsPage(){
    const visible=customerVisibleRequests();
    const active=visible.filter(r=>!['Accepted','Cancelled'].includes(r.status));
    const delivered=visible.filter(r=>r.status==='Accepted');
    const cancelled=visible.filter(r=>r.status==='Cancelled');
    const archiveCount=state.requests.filter(r=>r.campus===state.campus&&isArchived(r)).length;
    return shell(`<div class="pageHeader customerSimpleHeader"><div><span class="eyebrow">YOUR ACCOUNT HISTORY</span><h1>Orders & Requests</h1><p>Every order, quotation and status between your clinic and Pharma Service in one place.</p></div><button class="button light" data-go="portal/archive">Archive (${archiveCount})</button></div>${buyerActivityPanel()}
      <section class="orderSection"><div class="orderSectionHead"><h2>Current</h2><span>${active.length}</span></div><div class="orderCardGrid">${active.map(r=>customerOrderCard(r)).join('')||'<div class="emptyState"><h3>No active orders</h3></div>'}</div></section>
      <section class="orderSection"><div class="orderSectionHead"><h2>Delivered</h2><span>${delivered.length}</span></div><div class="orderCardGrid compact">${delivered.map(r=>customerOrderCard(r)).join('')||'<div class="emptyState"><h3>No delivered orders yet</h3></div>'}</div></section>
      ${cancelled.length?`<section class="orderSection"><div class="orderSectionHead"><h2>Cancelled</h2><span>${cancelled.length}</span></div><div class="orderCardGrid compact">${cancelled.map(r=>customerOrderCard(r)).join('')}</div></section>`:''}`);
  }
  function customerOrderCard(r){
    const q=calcQuote(r), label=friendlyStatus(r.status), first=r.lines[0]||null, p=first?.sku?product(first.sku):null, extra=Math.max(0,r.lines.length-1);
    const delivery=['Authorized','Procurement','Delivery'].includes(r.status)?expectedDeliveryLabel(r):'';
    const archiveDate=r.status==='Cancelled'&&r.cancelledAt?addDaysLabel(r.cancelledAt,30):'';
    return `<article class="customerOrderCard statusCard-${r.status.toLowerCase()}"><div class="orderCardHead"><div><span class="eyebrow">${esc(r.quoteRef||'ORDER UNDER REVIEW')}</span><h3 class="mono">${r.id}</h3><p>${date(r.createdAt)} · ${r.lines.length} lines</p></div>${customerStatusPill(r.status)}</div><div class="orderCardProduct"><div><b>${first?`${first.qty} × ${esc(lineDisplayName(first,p))}`:'Order items'}</b>${extra?`<span>+ ${extra} more line${extra>1?'s':''}</span>`:''}</div>${q.hasSell&&r.quoteRef?`<strong>${isDemoAccount()?money(q.total):/^[A-Z]{3}$/.test(r.quote?.issued?.currency||'')?esc(r.quote.issued.currency)+' '+Number(q.total).toFixed(2):'Amount in issued quotation'}</strong>`:''}</div>${r.status==='Drafting'?`<div class="orderMessage">${authContext?.group?.slug==='aeg-education'?'Under review. PS prepares the formal quotation for the agreed AEG Management approval process.':`Under review. Your quotation will be sent to <strong>${esc(accountEmailLabel())}</strong>.`}</div>`:''}${r.quote?.management_decision?`<div class="orderMessage">Management decision: ${esc(r.quote.management_decision)}. Customer PO and PSC release checks remain separate.</div>`:''}${r.status==='Sent'?`<div class="orderMessage quoteReady">${authContext?.group?.slug==='aeg-education'?(r.quote?.management_decision?'Management decision recorded. Customer PO and PS commercial release checks remain required.':'Quotation issued for AEG Management review. An authorized approver must record the decision.'):`Quotation sent to <strong>${esc(accountEmailLabel())}</strong>. Review the quotation and follow your agreed authorization process.`}</div>`:''}${delivery?`<div class="deliveryPromise"><span>TRACK</span><b>${delivery}</b></div>`:''}${r.status==='Accepted'?`<div class="orderMessage deliveredMsg">${r.deliveredAt?'Delivered '+date(r.deliveredAt)+'.':'Delivery recorded; delivery date not recorded.'} These items are now available on Replenish.</div>`:''}${r.status==='Cancelled'?`<div class="orderMessage cancelledMsg">Cancelled. This will move to Archive after ${archiveDate}.</div>`:''}<div class="orderCardActions"><button class="button light small" data-request-view="${r.id}">${['Authorized','Procurement','Delivery'].includes(r.status)?'View progress':'View request'}</button>${r.status==='Sent'&&isDemoAccount()?`<button class="button primary small" data-confirm-quote="${r.id}">Confirm quote</button><button class="button quietDanger small" data-cancel-quote="${r.id}">Cancel</button>`:''}${r.status!=='Cancelled'?`<button class="button dark small" data-reorder-order="${r.id}">Repeat request</button>`:''}</div></article>`;
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
  function exactSkuForLine(l){
    if(!isFamilyLine(l))return l?.sku||'';
    const o=l.productOptionSnapshot;
    if(!o?.sku||!o.pack||!o.exact_product_name)return '';
    const p=product(o.sku);
    if(!p||p.name!==o.exact_product_name||String(p.brand||'')!==String(o.brand||'')||String(p.pack||'')!==String(o.pack))return '';
    return (p.catalogueParentId||p.catalogueReferenceFamilyId||p.pscSku)===l.familyId?p.pscSku:'';
  }
  function lineKey(l){
    if(l?.kind==='unlisted')return l.requestId;
    const exactSku=exactSkuForLine(l);if(exactSku)return exactSku;
    if(isFamilyLine(l)){
      const mode=l.brandPreferenceMode||'no_preference';
      const choice=mode==='specific_option'?(l.productOptionId||''):mode==='other_brand'?String(l.requestedBrand||'').trim().toLowerCase():'no-preference';
      const refs=(l.requestedProductOptions||[]).map(o=>o.product_option_id||o.local_product_option_id||o.reference_product_option_id||'').sort().join('|');
      const safe=v=>encodeURIComponent(String(v||''));
      return `family:${safe(l.familyId)}:${safe(l.presentation||'')}:${mode}:${safe(choice)}:${safe(refs)}${l.requirementSnapshot?.sku?':requirement:'+safe(l.requirementSnapshot.sku):''}`;
    }
    return l?.sku||'';
  }
  function lineDisplayName(l,p=null){ if(l?.kind==='unlisted')return l.description;return isFamilyLine(l)?(l.productOptionSnapshot?.exact_product_name||l.requirementSnapshot?.name||l.familyName||l.familyId||'Catalogue family'):(l?.lineSnapshot?.name||p?.catalogueDisplayName||p?.name||l?.sku||'Order item'); }
  function lineReference(l){ if(l?.kind==='unlisted')return 'Unlisted item — requires PS review';return isFamilyLine(l)?l.requirementSnapshot?.sku||l.familyId:(l?.sku||''); }
  function linePackLabel(l,p=null){
    if(l?.kind==='unlisted')return l.requestUnit||'Unit to confirm';
    if(isFamilyLine(l)) return l.productOptionSnapshot?.exact_product_name?(l.productOptionSnapshot.pack||'Pack / unit to confirm'):(l.requirementSnapshot?.pack||l.orderPackBasis||'Pack / scope to confirm');
    return l?.lineSnapshot?(l.lineSnapshot.pack||'Historical pack not recorded; confirm'):p?.cataloguePack||p?.pack||'Pack to confirm';
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
      localFamily:detail?.localFamily===true,
      familyId:String(detail?.familyId||'').trim(),
      familyName:String(detail?.familyName||detail?.familyId||'').trim(),
      familyPageType:String(detail?.familyPageType||'').trim(),
      presentation:String(detail?.presentation||'').trim(),
      orderPackBasis:String(detail?.orderPackBasis||'').trim(),
      brandPreferenceMode:mode,
      requestedBrand:mode==='other_brand'?String(detail?.requestedBrand||'').trim():(mode==='specific_option'?String(option?.brand||'').trim():''),
      productOptionId:mode==='specific_option'?String(option?.product_option_id||'').trim():'',
      // Quotation-reference snapshots are not purchase-option foreign keys.
      requestedProductOptions:Array.isArray(detail?.requestedProductOptions)?structuredClone(detail.requestedProductOptions):[],
      productOptionSnapshot:option?structuredClone(option):null,
      requirementSnapshot:detail?.requirementSnapshot?structuredClone(detail.requirementSnapshot):null,
      regulated:!!detail?.regulated,
      qty:window.PSC_PRODUCT_PRESENTATION.quantity(detail?.qty)
    };
  }
  function addFamilyBasketLine(detail){
    const line=normalizeFamilyRequestLine(detail);
    if(!line.familyId||!line.familyName) return false;
    if(line.brandPreferenceMode==='specific_option' && !line.productOptionId) return false;
    if(line.brandPreferenceMode==='other_brand' && !line.requestedBrand) return false;
    productSearchMemory().selectedSku=line.familyId;
    const key=lineKey(line);
    const existing=state.basket.find(x=>lineKey(x)===key);
    if(existing&&existing.qty+line.qty>10000){toast('Keep requested quantity at or below 10,000 per line');return false;}
    if(existing){const qty=existing.qty+line.qty;Object.assign(existing,line,{qty});}
    else state.basket.push(line);
    save();
    renderUi({preserveScroll:true,transition:false});
    toast(`<strong>${line.qty} × ${esc(lineDisplayName(line))}</strong> added · ${basketQty()} units in Supply Request`);
    document.dispatchEvent(new CustomEvent('psc:request-added',{detail:{qty:line.qty,total:basketQty()}}));
    return true;
  }
  window.addEventListener('psc:view-request',openBasketOverlay);
  window.addEventListener('psc:add-family-line',e=>{ try{ addFamilyBasketLine(e.detail||{}); }catch(err){ console.error('Family request add failed',err); } });

  function basketQty(){ return state.basket.reduce((a,b)=>a+Number(b.qty||0),0); }
  function addBasket(sku,qty=1){
    const p=product(sku);if(!p)return;
    qty=window.PSC_PRODUCT_PRESENTATION.quantity(qty);
    window.PS_SEARCH_ANALYTICS?.record('added',{productId:sku});productSearchMemory().selectedSku=sku;
    const f=state.basket.find(x=>lineKey(x)===sku);const prior=Number(f?.qty||0);
    if(prior+qty>10000){toast('Keep requested quantity at or below 10,000 per line');return;}
    if(f)f.qty+=qty;else state.basket.push({sku,qty,lineSnapshot:{name:p.name,pack:p.pack||'',brand:p.brand||''}});
    save();renderUi({preserveScroll:true,transition:false});
    document.dispatchEvent(new CustomEvent('psc:request-added',{detail:{sku,qty,total:basketQty()}}));
    toast(`<strong>${qty} × ${esc(p.catalogueDisplayName||p.name)}</strong> added · ${prior+qty} of this product in request`);
  }
  // Validate the whole selection before one existing-draft mutation. No bundle SKU or order is created.
  window.PSC_ADD_READY_SELECTION=function(selection){
    if(!session||!currentRoute().startsWith('portal/'))return {ok:false,message:'Open your account before adding a basket.'};
    const template=window.PSC_READY_BASKET_TEMPLATES?.find(t=>t.id===selection?.templateId);
    if(!template||!['setup','replenishment'].includes(selection.mode)||!Array.isArray(selection.lines)||!selection.lines.length||new Set(selection.lines.map(l=>l.id)).size!==selection.lines.length)return {ok:false,message:'Select at least one component.'};
    const next=structuredClone(state.basket);
    const preview=!window.PSC_READY_BASKETS?.verified(template);
    const review=`${template.name} · ${selection.mode==='replenishment'?'replenishment':'setup'} — ${preview?'planning preview; compatibility, kit contents and exact specifications require PS review before quotation':'approved template; availability and commercial terms require quotation'}.`;
    for(const item of selection.lines){
      const definition=template.lines.find(l=>l.id===item.id);
      const qty=Number(item.quantity),p=item.sku?product(item.sku):null;
      const variant=definition?.variants?.find(v=>v.sku===item.sku);
      if(!definition||(selection.mode==='replenishment'&&definition.setupOnly)||(!p&&item.sku)||(!Number.isInteger(qty)||qty<1||qty>10000)||
        (item.sku!==definition.sku&&!(variant&&window.PSC_READY_BASKETS?.compatible(variant,Object.fromEntries(selection.lines.map(l=>[l.id,{sku:l.sku}]))))))return {ok:false,message:'A component changed. Reopen the basket and review the exact selection.'};
      if(p&&(p.catalogueVisible===false||p.regulated||window.PSC_PRODUCT_PRESENTATION.profile(p)?.kind==='pharmaceuticals'))return {ok:false,message:'This component needs a separate authorized request.'};
      let line;
      if(!p){
        if(!definition.specification)return {ok:false,message:'Add an exact specification before requesting this component.'};
        line={kind:'unlisted',requestId:`unlisted-ready-${template.id}-${definition.id}`,description:definition.specification,qty};
      }else if(window.PS_CATALOGUE_STOCK?.forProduct(p)?.source_kind==='requirement'){
        line=normalizeFamilyRequestLine({localFamily:true,familyId:p.catalogueParentId||p.catalogueReferenceFamilyId||p.pscSku,familyName:p.name,
          orderPackBasis:p.pack,qty,requirementSnapshot:{sku:p.pscSku,name:p.name,pack:p.pack,reference:p.dhaReference||'',status:p.dhaStatus||'',condition:p.dhaCondition||''}});
      }else line={sku:p.pscSku,qty};
      const key=lineKey(line),existing=next.find(l=>lineKey(l)===key);
      if(existing&&Number(existing.qty)+qty>10000)return {ok:false,message:'Keep the combined quantity at or below 10,000 per line.'};
      const notes=[...new Set([...(existing?.readyBasketReviews||[]),review])];
      if(existing){Object.assign(existing,line,{qty:Number(existing.qty)+qty,readyBasketReviews:notes});}
      else next.push({...line,readyBasketReviews:notes});
    }
    draftCheckpoint();state.basket=next;save();renderUi({preserveScroll:true,transition:false});
    document.dispatchEvent(new CustomEvent('psc:request-added',{detail:{total:basketQty()}}));
    toast(`<strong>${selection.lines.length} components added to Supply Request.</strong><br>Review your request before submitting.`);
    return {ok:true};
  };
  function reorderRequest(id,onlyIndex=null){
    const r=customerAccountRequests().find(x=>x.id===id); if(!r||requestSubmitting)return;
    const selected=Number.isInteger(onlyIndex)?r.lines.filter((_,i)=>i===onlyIndex):r.lines;
    const next=selected.map(l=>window.PSC_BUYER_JOURNEY.repeatLine(l,l.sku?product(l.sku):null,r.id));
    for(const l of next){const key=lineKey(l),f=state.basket.find(x=>lineKey(x)===key);if(f&&f.qty+l.qty>10000){toast('Review quantities: a request line cannot exceed 10,000.');return;}}
    next.forEach(l=>{const key=lineKey(l),f=state.basket.find(x=>lineKey(x)===key);if(f)f.qty+=l.qty;else state.basket.push(l)});
    save();ui.modal=null;ui.basket=true;render();toast('<strong>New request draft.</strong><br>Review products, quantities and campus. The original request is unchanged.');
  }
  function basketDrawer(){
    const lines=state.basket.map((l,index)=>({l,p:l.sku?product(l.sku):null,index})).filter(x=>x.p||isFamilyLine(x.l)||x.l.kind==='unlisted');
    const indicative=lines.reduce((sum,x)=>sum+(x.l.repeatSource?0:((x.p?.contractPrice)||0))*x.l.qty,0);
    return `<div class="drawerBackdrop requestDrawerBackdrop" data-close-basket><aside class="drawer requestDrawer" onclick="event.stopPropagation()"><div class="drawerHandle" aria-hidden="true"></div><div class="drawerHeader"><div><span class="eyebrow">PHARMA SERVICE</span><h2>Supply Request</h2><p class="buyerCampus">${esc(state.campus||'Select an authorized campus before submitting')}</p><small>${lines.length?`${lines.length} line${lines.length===1?'':'s'} · ${basketQty()} item${basketQty()===1?'':'s'}`:'Build a request while you browse'}</small></div><button class="iconBtn" data-close-basket aria-label="Close request">×</button></div><div class="drawerBody">${draftUndoControl()}${lines.length?lines.map(({l,p,index})=>{
      if(l.kind==='unlisted')return `<div class="basketLine requestLine"><div class="basketInfo"><b>${esc(l.description)}</b><span>${esc(l.requestUnit||'Unit to confirm')} · Sourcing request</span>${l.repeatNotice?`<small>${esc(l.repeatNotice)}</small>`:''}</div><div class="qty"><button data-family-basket-delta="${index}|-1" aria-label="Reduce quantity">−</button><span>${l.qty}</span><button data-family-basket-delta="${index}|1" aria-label="Increase quantity">+</button></div><button class="removeLink" data-family-basket-remove="${index}">Remove</button></div>`;
      if(isFamilyLine(l)){
        return `<div class="basketLine requestLine"><div class="productGlyph small">${l.regulated?'Rx':'PS'}</div><div class="basketInfo"><b>${esc(lineDisplayName(l,p))}</b><span>${esc(linePackLabel(l,p))} · ${esc(lineReference(l))}</span><small>${esc(lineBrandPreferenceLabel(l))} · Price confirmed in quotation</small></div><div class="qty"><button data-family-basket-delta="${index}|-1" aria-label="Reduce quantity">−</button><span>${l.qty}</span><button data-family-basket-delta="${index}|1" aria-label="Increase quantity">+</button></div><button class="removeLink" data-family-basket-remove="${index}">Remove</button></div>`;
      }
      const imageUrl=productDisplayImageUrl(p);return `<div class="basketLine requestLine">${imageUrl?`<div class="requestLineImage"><img src="${esc(imageUrl)}" alt="" onerror="this.onerror=null;this.src='${esc(legacyProductImageUrl(p))}'"></div>`:`<div class="productGlyph small">${esc((p.brand||'PS').slice(0,2).toUpperCase())}</div>`}<div class="basketInfo"><b>${esc(lineDisplayName(l,p))}</b><span>${esc(linePackLabel(l,p))} · ${p.pscSku}</span><small>${l.repeatSource?'New quotation required':p.contractPrice?money(p.contractPrice)+' indicative account price':'Price confirmed in quotation'}</small>${l.repeatNotice?`<small>${esc(l.repeatNotice)}</small>`:''}</div><div class="qty"><button data-basket-delta="${p.pscSku}|-1" aria-label="Reduce quantity">−</button><span>${l.qty}</span><button data-basket-delta="${p.pscSku}|1" aria-label="Increase quantity">+</button></div><button class="removeLink" data-basket-remove="${p.pscSku}">Remove</button></div>`
    }).join(''):`<div class="emptyState requestEmpty"><h3>Your request is empty</h3><p>Browse the catalogue and add the products you want PS to quote.</p><button class="button dark" data-go="portal/catalogue">Browse catalogue</button></div>`}${scopeNote()?`<div class="psRequestScopeReview"><b>Request scope</b><p>${esc(scopeNote()).replace(/\n/g,'<br>')}</p></div>`:''}</div>${lines.length?`<div class="drawerFooter requestDrawerFooter"><label class="fieldLabel">Request note <span>optional</span></label><textarea class="textarea" id="basketNote" data-buyer-note placeholder="Delivery timing, preferred brand, clinic note…">${esc(state.notesBySchool?.[state.activeSchoolId]||'')}</textarea><div class="totals"><span>Indicative priced lines</span><b>${indicative?money(indicative):'Request quotation'}</b></div><div class="checkoutPromise requestNextStep"><span>WHAT HAPPENS NEXT</span><p>${authContext?.group?.slug==='aeg-education'?'PS reviews the request and prepares the formal quotation for AEG Management review. Customer PO and PS commercial release checks remain required.':`PS reviews the request and sends the formal quotation to <strong>${esc(accountEmailLabel())}</strong>. Nothing is procured until the required customer approval is in place.`}</p></div><button class="button primary full submitRequestButton" data-submit-request>Submit request</button></div>`:''}</aside></div>`;
  }


  function bankTransferInstructions(r){
    const b=window.PSC_PAYMENT_INSTRUCTIONS;
    if(!b||!r.quoteRef||['Drafting','Cancelled'].includes(r.status))return '';
    const fields=[['Account name',b.accountName],['Bank',b.bankName],['Account number',b.accountNumber],['Currency',b.currency],['IBAN',b.iban],['SWIFT',b.swift]];
    return `<section class="quoteStatePanel bankTransferInstructions" data-bank-transfer><h3>Bank transfer details</h3><p>Transfer only the amount requested by Pharma Service under the agreed payment terms. Please use your invoice reference, or quotation reference if no invoice has been issued, and send us the transfer confirmation.</p><dl>${fields.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><p>Payment is confirmed after PSC verifies the funds received in its bank account. A transfer confirmation alone does not release procurement.</p></section>`;
  }

  function requestModal(id, admin=false){
    const r=(admin?state.requests:customerAccountRequests()).find(x=>x.id===id); if(!r)return '';
    const quote=calcQuote(r);
    const canApprove=r.status==='Sent' && quote.taxResolved && quote.hasSell;
    return `<div><div class="modalHeader"><div><span class="eyebrow">${admin?'PS REQUEST CONTROL':'REQUEST / QUOTATION'}</span><h2 class="mono">${r.id}</h2><div class="smallMuted">${esc(r.groupName||state.groupName||'Institutional account')} · ${esc(r.campus)} · ${date(r.createdAt)}</div></div><button class="iconBtn" data-modal-close>×</button></div>
      ${!admin&&!isDemoAccount()?buyerJourneyHtml(r):''}${admin?adminQuoteBuilder(r,quote):schoolQuote(r,quote,canApprove)}${!admin&&!isDemoAccount()&&bankTransferInstructions(r)?`<details class="buyerPaymentDetails"><summary>Bank transfer details</summary>${bankTransferInstructions(r)}</details>`:bankTransferInstructions(r)}${orderDocumentsSection(r,admin)}</div>`;
  }

  function calcQuote(r){
    if(r.dbId&&!authContext?.isPscAdmin&&!isDemoAccount()){
      const v=window.PSC_BUYER_JOURNEY.quoteView(r.quote?.issued,r.quote?.issuedLines);
      return {rows:v.rows,subtotal:v.subtotal,cost:0,vat:v.vat,total:v.total,hasSell:v.complete,taxResolved:v.complete,costComplete:false,gp:null,gm:null};
    }
    let subtotal=0,cost=0,vat=0,hasSell=true,costComplete=true,taxResolved=true;
    const rows=r.lines.map(l=>{const p=l.sku?product(l.sku):null;const key=lineKey(l);const q=(r.quote&&r.quote.lines&&r.quote.lines[key])||{};const sell=Number.isFinite(Number(q.sell))?Number(q.sell):(Number.isFinite(Number(p?.contractPrice))?Number(p.contractPrice):null);const c=Number.isFinite(Number(q.cost))?Number(q.cost):(Number.isFinite(Number(p?.supplierCost))?Number(p.supplierCost):null);const vr=q.vat===0||q.vat===5?Number(q.vat):null;if(sell===null)hasSell=false;else subtotal+=sell*l.qty;if(c===null)costComplete=false;else cost+=c*l.qty;if(vr===null){taxResolved=false}else if(sell!==null){vat += sell*l.qty*vr/100;}return {l,p,key,q,sell,cost:c,vatRate:vr};});
    const gp=hasSell&&costComplete?subtotal-cost:null;const gm=gp!==null&&subtotal>0?gp/subtotal*100:null;
    return {rows,subtotal,cost,vat,total:subtotal+vat,gp,gm,hasSell,costComplete,taxResolved};
  }

  function demoSchoolQuote(r,q,canApprove){
    const delivery=['Authorized','Procurement','Delivery'].includes(r.status)?expectedDeliveryLabel(r):'';
    return `<div class="schoolQuoteBox"><div class="quoteCustomerTop"><div><span class="eyebrow">${r.quoteRef||'ORDER UNDER REVIEW'}</span><h3>${friendlyStatus(r.status)}</h3></div>${customerStatusPill(r.status)}</div>${r.status==='Drafting'?`<div class="quoteStatePanel"><b>PS is reviewing this order.</b><p>${authContext?.group?.slug==='aeg-education'?'Your formal quotation will follow the agreed AEG Management approval process.':`Your formal quotation will be sent to ${esc(accountEmailLabel())}.`}</p></div>`:''}${r.quoteRef?`<div class="tableWrap"><table class="dataTable"><thead><tr><th>ITEM</th><th>PACK</th><th>QTY</th><th>UNIT EX VAT</th><th>LINE EX VAT</th><th>VAT</th></tr></thead><tbody>${q.rows.map(x=>`<tr><td><b>${esc(lineDisplayName(x.l,x.p))}</b><div class="sub mono">${esc(lineReference(x.l))}</div>${isFamilyLine(x.l)?`<div class="sub">${esc(lineBrandPreferenceLabel(x.l))}</div>`:''}</td><td>${esc(linePackLabel(x.l,x.p))}</td><td>${x.l.qty}</td><td>${x.sell!==null?money(x.sell):'Pending'}</td><td>${x.sell!==null?money(x.sell*x.l.qty):'Pending'}</td><td>${x.vatRate===null?'Review':x.vatRate+'%'}</td></tr>`).join('')}</tbody></table></div><div class="quoteSummary"><div><span>SUBTOTAL EX VAT</span><b>${q.hasSell?money(q.subtotal):'Pending'}</b></div><div><span>VAT</span><b>${q.taxResolved?money(q.vat):'Review'}</b></div><div><span>TOTAL</span><b>${q.hasSell&&q.taxResolved?money(q.total):'Pending'}</b></div><div><span>VALIDITY</span><b>${esc(r.quote?.validity||'Pending')}</b></div></div>`:''}${r.status==='Sent'?`<div class="modalQuoteActions"><button class="button primary" data-confirm-quote="${r.id}">Confirm quotation</button><button class="button quietDanger" data-cancel-quote="${r.id}">Cancel quotation</button></div>`:''}${delivery?`<div class="deliveryPromise large"><span>TRACK ORDER</span><b>${delivery}</b><small>Delivery timing is shown only when PS has recorded it for this order.</small></div>`:''}${r.status==='Accepted'?`<div class="quoteStatePanel delivered"><b>Delivered.</b><p>This order is now part of your purchase history and its items can be repeated from Replenish.</p></div>`:''}${r.status==='Cancelled'?`<div class="quoteStatePanel cancelled"><b>Cancelled.</b><p>${isArchived(r)?'This quotation is now in Archive.':`It will move to Archive on ${addDaysLabel(r.cancelledAt||r.createdAt,30)}.`}</p></div>`:''}</div>`;
  }


  function schoolQuote(r,q,canApprove){
    if(isDemoAccount())return demoSchoolQuote(r,q,canApprove);
    const issued=r.quote?.issued,v=window.PSC_BUYER_JOURNEY.quoteView(issued,r.quote?.issuedLines),show=window.PSC_BUYER_JOURNEY.issued(issued),decision=window.PSC_BUYER_JOURNEY.decisionGate(authContext,r);
    const quoteMoney=value=>window.PSC_BUYER_JOURNEY.numeric(value)===null?'Pending':/^[A-Z]{3}$/.test(issued?.currency||'')?`${esc(issued.currency)} ${Number(value).toFixed(2)}`:`${Number(value).toFixed(2)} (currency not recorded)`;
    const terms=(label,value)=>`<div><dt>${label}</dt><dd>${esc(value||'Not recorded; confirm with PSC')}</dd></div>`;
    return `<div class="schoolQuoteBox buyerQuote"><div class="quoteCustomerTop"><div><h3>${esc(r.quoteRef||'Request under review')}</h3><p>${esc(r.groupName)} · ${esc(r.campus)}</p></div>${customerStatusPill(r.status)}</div>${show?`
      <dl class="buyerQuoteFacts">${terms('Revision',issued.current_revision==null?'':String(issued.current_revision))}${terms('Issued',issued.sent_at?date(issued.sent_at):'')}${terms('Currency',issued.currency)}${terms('Valid until',issued.expires_at?date(issued.expires_at):r.quote.validity)}</dl>
      ${v.rows.length?`<div class="tableWrap"><table class="buyerQuoteTable"><thead><tr><th>Product / specification</th><th>Pack / unit</th><th>Qty</th><th>Unit ex VAT</th><th>Line ex VAT</th><th>VAT</th></tr></thead><tbody>${v.rows.map(x=>`<tr><td data-label="Product"><b>${esc(x.name)}</b>${x.brand?`<div>${esc(x.brand)}</div>`:''}${x.spec?`<div class="sub">${esc(x.spec)}</div>`:''}${x.note?`<div class="sub">${esc(x.note)}</div>`:''}<small>${esc(x.sku)}</small></td><td data-label="Pack / unit">${esc(x.pack)}</td><td data-label="Quantity">${x.qty??'Pending'}</td><td data-label="Unit ex VAT">${x.sell===null?'Pending':quoteMoney(x.sell)}</td><td data-label="Line ex VAT">${x.sell===null||x.qty===null?'Pending':quoteMoney(x.qty*x.sell)}</td><td data-label="VAT">${x.vat===null?'Pending':x.vat+'%'}</td></tr>`).join('')}</tbody></table></div>`:'<p>Structured quotation lines are not available. Use the issued document below or contact PSC; catalogue prices are not substituted.</p>'}
      <div class="quoteSummary"><div><span>Subtotal ex VAT</span><b>${v.complete?quoteMoney(v.subtotal):'Pending'}</b></div><div><span>VAT</span><b>${v.complete?quoteMoney(v.vat):'Pending'}</b></div><div><span>Total incl. VAT</span><b>${v.complete?quoteMoney(v.total):'Pending'}</b></div></div>
      <dl class="buyerQuoteFacts">${terms('Delivery / lead time',issued.delivery_terms)}${terms('Payment terms',issued.payment_terms)}${terms('Conditions',issued.customer_note)}</dl><p class="smallMuted">Purchasing legal entity, warranty, FOC items and exclusions follow the issued quotation document; missing terms require confirmation.</p>
      ${decision.ok?`<div class="modalQuoteActions"><button class="button primary" data-confirm-quote="${esc(r.id)}">Approve revision ${esc(String(issued.current_revision))}</button><button class="button quietDanger" data-cancel-quote="${esc(r.id)}">Decline quotation</button></div>`:`<p class="buyerAuthorization">${r.quote?.management_decision?'Management decision: '+esc(r.quote.management_decision)+'. ':''}Use your institution’s agreed PO or written authorization process. Viewing this quotation does not place an order or release procurement.${window.PSC_BUYER_JOURNEY.canDecide(authContext)&&!decision.ok?` ${esc(decision.reason)}`:''}</p>`}
    `:'<p>Your requirement is under review. A formal quotation will appear when issued; no purchase has been authorized.</p>'}<div class="buyerRequestLines"><h4>Original request</h4>${r.lines.map(l=>`<p>${l.qty} × ${esc(lineDisplayName(l,l.sku?product(l.sku):null))} · ${esc(linePackLabel(l,l.sku?product(l.sku):null))}</p>`).join('')}<button class="button light" data-reorder-order="${esc(r.id)}">Repeat as a new request</button></div></div>`;
  }

  function adminQuoteBuilder(r,q){
    const target=20;
    return `<div class="notice"><strong>Quote builder.</strong> Supplier cost and tax must be supported by current evidence before live issue. Values labelled “Demo planning assumption” are not supplier quotations.</div><div class="tableWrap"><table class="dataTable"><thead><tr><th>ITEM</th><th>QTY</th><th>DIRECT COST / UNIT</th><th>SELL / UNIT</th><th>VAT</th><th>LINE GM</th></tr></thead><tbody>${q.rows.map(x=>{const gm=x.sell!==null&&x.cost!==null&&x.sell>0?((x.sell-x.cost)/x.sell*100):null;return `<tr><td><b>${esc(lineDisplayName(x.l,x.p))}</b><div class="sub mono">${esc(lineReference(x.l))}</div>${isFamilyLine(x.l)?`<div class="sub">${esc(lineBrandPreferenceLabel(x.l))}</div>`:''}${x.q.costEvidence?`<div class="quoteLineWarning">${esc(x.q.costEvidence)}</div>`:''}</td><td>${x.l.qty}</td><td><input class="moneyInput" type="number" step="0.01" value="${x.cost===null?'':x.cost}" data-quote-field="${r.id}|${x.key}|cost"></td><td><input class="moneyInput" type="number" step="0.01" value="${x.sell===null?'':x.sell}" data-quote-field="${r.id}|${x.key}|sell"></td><td><select class="selectInput" data-quote-field="${r.id}|${x.key}|vat"><option value="" ${x.vatRate===null?'selected':''}>Review</option><option value="0" ${x.vatRate===0?'selected':''}>0%</option><option value="5" ${x.vatRate===5?'selected':''}>5%</option></select></td><td>${gm===null?'—':`<b class="${gm<target?'dangerText':'successText'}">${gm.toFixed(1)}%</b>`}</td></tr>`}).join('')}</tbody></table></div><div class="quoteSummary"><div><span>DIRECT COST</span><b>${q.costComplete?money(q.cost):'Incomplete'}</b></div><div><span>SELL EX VAT</span><b>${q.hasSell?money(q.subtotal):'Incomplete'}</b></div><div><span>GROSS PROFIT</span><b>${q.gp===null?'Blocked':money(q.gp)}</b></div><div><span>TRUE GM</span><b class="${q.gm!==null&&q.gm<target?'dangerText':''}">${q.gm===null?'Blocked':q.gm.toFixed(1)+'%'}</b></div></div><div class="twoCol"><div><label class="fieldLabel">Delivery</label><input class="input" style="width:100%" value="${esc(r.quote?.delivery||'')}" data-quote-meta="${r.id}|delivery"><label class="fieldLabel" style="margin-top:10px">Terms</label><input class="input" style="width:100%" value="${esc(r.quote?.terms||'')}" data-quote-meta="${r.id}|terms"></div><div><label class="fieldLabel">Quotation status</label><select class="input" style="width:100%" data-request-status="${r.id}">${workflow.map(s=>`<option ${r.status===s?'selected':''}>${s}</option>`).join('')}</select><label class="fieldLabel" style="margin-top:10px">Quotation reference</label><input class="input" style="width:100%" value="${esc(r.quoteRef||'')}" data-quote-ref="${r.id}" placeholder="PSC-Q-YYYY-####"></div></div><div class="gateList" style="margin-top:16px"><div class="gate ${q.costComplete?'ok':'block'}"><span>All direct costs present</span><i></i></div><div class="gate ${q.taxResolved?'ok':'block'}"><span>VAT reviewed by line</span><i></i></div><div class="gate ${q.gm!==null&&q.gm>=20?'ok':'warn'}"><span>Target GM ≥ 20%</span><i></i></div><div class="gate warn"><span>Supplier stock / lead time requires current confirmation</span><i></i></div><div class="gate ${q.rows.some(x=>lineIsRegulated(x.l,x.p))?'warn':'ok'}"><span>Regulated route check</span><i></i></div><div class="gate block"><span>Funding / customer PO evidence: save in the commercial inbox</span><i></i></div></div>`;
  }

  function workspacePage(view){return shell(`<section data-psc-workspace="${view}" aria-live="polite"><p>Opening your workspace…</p></section>`,true);}
  window.PSC_WORKSPACE_OPEN_REQUEST=(id)=>{const r=state.requests.find(x=>x.dbId===id||x.id===id);if(!r){toast('Refresh the workspace to load this request.');return;}ui.modal={type:'request',id:r.id,admin:true};render();};
  function adminDashboard(){
    const open=state.requests.filter(r=>!['Accepted','Cancelled'].includes(r.status)).length;
    const activeQuotes=state.requests.filter(r=>['Sent','Authorized','Procurement','Delivery'].includes(r.status));
    const qvals=activeQuotes.map(calcQuote);const quoted=qvals.reduce((s,q)=>s+(q.hasSell?q.subtotal:0),0);const gp=qvals.reduce((s,q)=>s+(q.gp||0),0);const gm=quoted?gp/quoted*100:0;
    return shell(`<div class="pageHeader"><div><span class="eyebrow">PS DEAL DESK</span><h1>Institutional supply control</h1><p>One desk for requests, quote economics, supplier evidence, release gates and fulfilment. Demo figures are illustrative unless backed by an identified evidence source.</p></div></div><div class="adminStatRow"><div class="adminStat"><span>OPEN REQUESTS</span><b>${open}</b></div><div class="adminStat"><span>QUOTED EX VAT</span><b>${money(quoted)}</b></div><div class="adminStat"><span>AUTHORIZED</span><b>${state.requests.filter(r=>r.status==='Authorized').length}</b></div><div class="adminStat"><span>EST. TRUE GP</span><b>${money(gp)}</b></div><div class="adminStat"><span>EST. GM</span><b>${gm.toFixed(1)}%</b></div><div class="adminStat"><span>PRODUCT MASTER</span><b>${cms.products.filter(p=>p.active).length||D.products.length}</b></div></div><div class="actionGrid"><button class="actionCard" data-go="admin/requests"><div class="actionIcon">${icon('checklist')}</div><div><b>Request queue</b><span>Convert needs into controlled quotes</span></div></button><button class="actionCard" data-go="admin/mail"><div class="actionIcon">${icon('mail')}</div><div><b>Mail Desk</b><span>Business emails from mohamed@pharmaservice.ae</span></div></button><button class="actionCard" data-go="admin/storefront"><div class="actionIcon">${icon('edit')}</div><div><b>Storefront manager</b><span>Institutional + wholesale publishing</span></div></button><button class="actionCard" data-go="admin/products"><div class="actionIcon">${icon('boxes')}</div><div><b>Product master</b><span>Product, media and commercial control</span></div></button><button class="actionCard" data-go="admin/family-options"><div class="actionIcon">${icon('checklist')}</div><div><b>Family options</b><span>Approve, hold or reject supplier candidates</span></div></button><button class="actionCard" data-go="admin/fulfilment"><div class="actionIcon">${icon('repeat')}</div><div><b>Fulfilment rules</b><span>Route by site and source</span></div></button><button class="actionCard" data-go="admin/supplier-feed"><div class="actionIcon">${icon('reports')}</div><div><b>Supplier feed</b><span>Acorus / Med7 data ingestion</span></div></button></div><div class="twoCol"><section class="panel"><div class="panelHeader"><h2>Requests needing attention</h2><button data-go="admin/requests">Open queue →</button></div><div class="tableWrap"><table class="dataTable"><thead><tr><th>REQUEST</th><th>ACCOUNT / SITE</th><th>LINES</th><th>STATUS</th><th>NEXT ACTION</th></tr></thead><tbody>${state.requests.filter(r=>r.status!=='Accepted').map(r=>`<tr class="clickable" data-admin-request="${r.id}"><td><b class="mono">${r.id}</b></td><td>${esc(r.groupName||state.groupName||'Institutional account')}<div class="sub">${esc(r.campus)}</div></td><td>${r.lines.length}</td><td>${statusPill(r.status)}</td><td>${r.status==='Drafting'?'Validate stock + price':r.status==='Sent'?'Resolve school decision':'Check procurement release'}</td></tr>`).join('')}</tbody></table></div></section><div style="display:grid;gap:14px"><div class="marginBox"><h3>Deal economics · active quoted demo</h3><div class="marginGrid"><div><span>DIRECT COST</span><b>${money(qvals.reduce((s,q)=>s+(q.costComplete?q.cost:0),0))}</b></div><div><span>SELL</span><b>${money(quoted)}</b></div><div><span>TRUE GM</span><b>${gm.toFixed(1)}%</b></div><div><span>FOC</span><b>AED 0</b></div><div><span>DELIVERY</span><b>Per quote</b></div><div><span>TARGET</span><b>20%</b></div></div></div><section class="panel"><div class="panelHeader"><h2>Release gate</h2></div><div class="gateList"><div class="gate ok"><span>Exact specification mapped</span><i></i></div><div class="gate warn"><span>Supplier stock current</span><i></i></div><div class="gate warn"><span>VAT / tax evidence by line</span><i></i></div><div class="gate ok"><span>Margin incl. direct costs</span><i></i></div><div class="gate block"><span>Customer funding / PO</span><i></i></div><div class="gate warn"><span>Regulated route validated</span><i></i></div></div></section></div></div><div class="notice" style="margin-top:18px"><strong>Control:</strong> a supplier PO is not released merely because a customer approved a quote. Funding, current supplier evidence, tax treatment, regulated route and delivery must pass the release gate.</div>`,true);
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
        <div><span class="eyebrow">PS STOREFRONT CONTROL</span><h1>Storefront manager</h1><p>One controlled product master, two customer-facing presentations. Institutional and wholesale can use different copy, categories, visibility and commercial display without duplicating the SKU.</p></div>
        <button class="button light" data-go="${channel==='institutional'?'portal/catalogue':'wholesale'}">${channel==='institutional'?'Open institutional catalogue':'Open wholesale storefront'}</button>
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
        <div class="panelHeader"><div><span class="eyebrow">LIVE PREVIEW</span><h2>${esc(sf.display_name||'Storefront')}</h2></div><button data-go="admin/products">Manage products</button></div>
        ${preview.length?`<div class="cmsPreviewGrid">${preview.map(r=>`<article><div class="cmsPreviewImage">${controlledProductImageUrl(r)?`<img src="${esc(controlledProductImageUrl(r))}" alt="">`:'<span>NO IMAGE</span>'}</div><small>${esc(r.brand||r.category||'')}</small><b>${esc(r.name)}</b><p>${esc(r.short_description||r.pack||'')}</p></article>`).join('')}</div>`:`<div class="emptyState"><h3>No published products yet</h3><p>${channel==='wholesale'?'Open Product Master, switch to Wholesale and publish the lines you want trade customers to see.':'The institutional catalogue will appear here after the current master is initialised.'}</p></div>`}
      </section>
    `,true);
  }

  function adminProducts(){
    if(!cms.loaded){
      return shell(`<div class="pageHeader"><div><span class="eyebrow">CONTROLLED PRODUCT MASTER</span><h1>Product master</h1><p>Loading the database-backed catalogue…</p></div></div><section class="panel"><div class="emptyState"><h3>Preparing the master</h3><p>PS is moving the live catalogue from static code into the controlled database.</p></div></section>`,true);
    }
    const q=(ui.cmsSearch||'').toLowerCase().trim();
    const activeMaster=cms.products.filter(p=>p.active);
    const rows=activeMaster.filter(p=>`${p.psc_sku} ${p.name||''} ${p.brand||''} ${p.category||''} ${p.supplier_name||''}`.toLowerCase().includes(q));
    return shell(`
      <div class="pageHeader cmsPageHeader">
        <div><span class="eyebrow">CONTROLLED PRODUCT MASTER</span><h1>Products & media</h1><p>Edit the controlled SKU once, then publish a separate Institutional or Wholesale presentation. Supplier, cost, evidence and internal notes remain restricted to PS admin.</p></div>
        <button class="button light" data-go="admin/storefront">Storefront manager</button>
      </div>

      <div class="filterBar cmsMasterFilter"><div class="searchInput"><span>⌕</span><input data-cms-search value="${esc(ui.cmsSearch)}" placeholder="Search product, PS SKU, brand, supplier or category…"></div><div class="cmsMasterCount">${rows.length} / ${activeMaster.length}</div></div>

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
            <div class="panelHeader"><div><span class="eyebrow">INTERNAL ONLY</span><h2>Supply & commercial evidence</h2></div><span class="cmsPrivateLabel">PS ADMIN</span></div>
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
              <label><span>Price display</span><select class="input" id="cmsPriceMode"><option value="request_quote" ${cv('price_display_mode',s.price_display_mode)==='request_quote'?'selected':''}>Request quote</option><option value="show_price" ${cv('price_display_mode',s.price_display_mode)==='show_price'?'selected':''}>Show price</option><option value="contact" ${cv('price_display_mode',s.price_display_mode)==='contact'?'selected':''}>Contact PS</option></select></label>
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
            <div class="cmsImageReview" data-cms-image-review="${p.id}"><p><b>Product photo standard</b><br>Use a clear product-only photo on white or transparent background. No Acorus logo, supplier backdrop or watermark.</p><label><input type="checkbox">I checked the exact brand, model, strength and pack.</label><label><input type="checkbox">I checked that the background has no supplier branding and the product is clear.</label></div><label class="cmsUploadDrop"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" data-cms-image-upload="${p.id}"><b>Choose photograph</b><small>Preview and review before upload · JPG, PNG or WebP · max 10 MB</small></label><div class="cmsPhotoDraft" data-cms-photo-draft="${p.id}" hidden><div class="detailProductImageWrap"><img alt="Selected product photograph preview"></div><button class="button outline" type="button" data-cms-image-save="${p.id}">Upload reviewed photo as draft</button></div>
            <label class="cmsImageReview"><span><input type="checkbox" data-cms-publish-image-review> I visually approve the primary photo: exact product, clean background, no supplier branding.</span></label><div class="cmsMediaGrid">${media.length?media.map(m=>`<article class="${m.is_primary?'primary':''}"><img src="${esc(m.public_url)}" alt="${esc(m.alt_text||'Product image')}"><div><span>${m.is_primary?'PRIMARY':'GALLERY'}</span><div><button data-cms-primary="${p.id}|${m.id}">Set primary</button><button class="danger" data-cms-delete-media="${p.id}|${m.id}">Remove</button></div></div></article>`).join(''):'<div class="cmsNoMedia">No uploaded media yet.</div>'}</div>
          </section>

          <section class="panel cmsPublishPanel">
            <span class="eyebrow">PUBLISH</span>
            <h2>${channel==='institutional'?'Institutional':'Wholesale'} storefront</h2>
            <p>Save Draft preserves the currently published channel. Publish applies this channel's presentation and approved images to the customer storefront.</p>
            <button class="button light full" data-cms-save="${p.id}">Save draft</button>
            <button class="button primary full" data-cms-publish="${p.id}">Publish to ${channel}</button>
            <button class="textAction" data-go="${channel==='institutional'?'portal/catalogue':'wholesale'}">Open storefront preview</button>
          </section>
        </aside>
      </div>
    `,true);
  }

  function adminFamilyOptions(){
    if(!optionDesk.loaded){
      if(!optionDesk.loading) setTimeout(loadAdminFamilyOptions,0);
      return shell(`<div class="pageHeader"><div><span class="eyebrow">FAMILY + SUPPLIER CONTROL</span><h1>Supplier option review</h1><p>Loading the controlled Acorus candidate workbench…</p></div></div><section class="panel"><div class="emptyState"><h3>Preparing 719 source-list candidates</h3><p>No candidate becomes customer-selectable until PS explicitly approves it and records current verification evidence.</p></div></section>`,true);
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
      <div class="pageHeader familyOptionPageHeader"><div><span class="eyebrow">FAMILY + SUPPLIER CONTROL</span><h1>Supplier option review</h1><p>The Acorus source list is a candidate universe, not a live catalogue. PS explicitly decides fit, records commercial evidence and controls what may become customer-selectable.</p></div>${selectedFamily?`<button class="button light" data-option-family-open="all">← All families</button>`:''}</div>
      <div class="adminStatRow familyOptionStats"><div class="adminStat"><span>CANDIDATES</span><b>${options.length}</b></div><div class="adminStat"><span>FAMILIES</span><b>${new Set(options.map(o=>o.family_id)).size}</b></div><div class="adminStat"><span>VERIFIED</span><b>${verified}</b></div><div class="adminStat"><span>APPROVED</span><b>${approved}</b></div><div class="adminStat"><span>CUSTOMER SELECTABLE</span><b>${selectable}</b></div><div class="adminStat"><span>LIVE FIXED PRICES</span><b>${liveFixed}</b></div></div>
      <div class="notice familyOptionGuard"><strong>Release rule:</strong> APPROVE controls product identity. Fixed-price publication is a separate commercial release: verified acquisition cost + every direct-cost component, verified VAT, current price evidence and validity, plus the family must explicitly permit fixed pricing. Target GM defaults to 20%. Acorus MRP remains an internal retail benchmark only.</div>
      <div class="filterBar familyOptionFilter"><div class="searchInput"><span>${icon('search')}</span><input data-option-search value="${esc(ui.optionSearch)}" placeholder="Search family, brand, Acorus product, supplier or reference…"></div><select data-option-decision><option ${ui.optionDecision==='All'?'selected':''}>All</option><option ${ui.optionDecision==='VERIFY'?'selected':''}>VERIFY</option><option ${ui.optionDecision==='APPROVE'?'selected':''}>APPROVE</option><option ${ui.optionDecision==='HOLD'?'selected':''}>HOLD</option><option ${ui.optionDecision==='REJECT'?'selected':''}>REJECT</option></select></div>
      ${selectedFamily?`<section class="familyOptionFamilyIntro"><div><span class="eyebrow">${esc(selectedFamily.family_id)}</span><h2>${esc(selectedFamily.family_name)}</h2>${selectedFamily.common_brands_line?`<p><em>${esc(selectedFamily.common_brands_line)}</em></p>`:''}<p>${esc(selectedFamily.clinical_need||'')} · ${esc(selectedFamily.page_type||'Product family')}</p></div><div><b>${selectedOptions.length}</b><span>matching candidate${selectedOptions.length===1?'':'s'}</span></div></section><div class="familyOptionCards">${selectedOptions.length?selectedOptions.map(adminFamilyOptionCard).join(''):`<div class="emptyState"><h3>No candidates match this filter.</h3><p>Clear the search or decision filter to see this family's source-list candidates.</p></div>`}</div>`:`<section class="panel familyOptionFamilyTable"><div class="panelHeader"><div><h2>Families with supplier candidates</h2><p class="smallMuted">${familyGroups.length} families match the current filter. Families without a source-list candidate remain source-on-request.</p></div></div><div class="tableWrap"><table class="dataTable"><thead><tr><th>FAMILY</th><th>CLINICAL NEED</th><th>CANDIDATES</th><th>DECISION STATE</th><th></th></tr></thead><tbody>${familyRows||`<tr><td colspan="5"><div class="emptyState"><h3>No families match.</h3></div></td></tr>`}</tbody></table></div></section>`}
    `,true);
  }

  function adminRequests(){
    return shell(`<div class="pageHeader"><div><span class="eyebrow">REQUEST → QUOTE → RELEASE</span><h1>Request queue</h1><p>Validate scope before pricing. Authorization advances the customer decision state; it does not automatically release procurement.</p></div></div><section data-commercial-inbox aria-live="polite"><p>Loading incoming requirements…</p></section><section class="panel"><div class="panelHeader"><h2>Portal quotation builders</h2></div><div class="tableWrap"><table class="dataTable"><thead><tr><th>REQUEST</th><th>ACCOUNT / SITE</th><th>LINES</th><th>STATUS</th><th>QUOTE</th><th>ACTION</th></tr></thead><tbody>${state.requests.map(r=>{const q=calcQuote(r);return `<tr><td><b class="mono">${r.id}</b><div class="sub">${date(r.createdAt)}</div></td><td>${esc(r.groupName||state.groupName||'Institutional account')}<div class="sub">${esc(r.campus)}</div></td><td>${r.lines.length}</td><td>${statusPill(r.status)}</td><td>${r.quoteRef?`<b>${esc(r.quoteRef)}</b>`:'Pending'}<div class="sub">${q.hasSell?money(q.subtotal)+' ex VAT':'Pricing incomplete'}</div></td><td><button class="button dark" data-admin-request="${r.id}">Open builder</button></td></tr>`}).join('')}</tbody></table></div></section>`,true);
  }

  function adminFulfilment(){
    return shell(`<div class="pageHeader"><div><span class="eyebrow">SITE ROUTING</span><h1>Fulfilment rules</h1><p>Map each campus to a preferred source and backup. Geography helps, but stock, licensed route, terms and delivery capability determine the actual source.</p></div></div><div class="notice"><strong>Demo routing only.</strong> No real Med7 branch address is invented here. Replace partner hubs with Acorus/Med7-confirmed fulfilment locations, contacts and SLAs.</div><div class="threeCol">${D.campuses.map(c=>`<article class="fulfilCard"><div class="fulfilTop"><div><span class="eyebrow">${c.emirate.toUpperCase()}</span><h3>${esc(c.name)}</h3></div>${badge('Active','green')}</div><div class="routeLine"><span>Clinic code</span><b class="mono">${esc(c.clinicCode)}</b></div><div class="routeLine"><span>Preferred source</span><b>${esc(c.preferredSource)}</b></div><div class="routeLine"><span>Partner hub</span><b>${esc(c.hub)}</b></div><div class="routeLine"><span>Backup</span><b>${esc(c.backup)}</b></div><div class="routeLine"><span>SLA</span><b>${esc(c.sla)}</b></div></article>`).join('')}</div><section class="panel" style="margin-top:18px"><div class="panelHeader"><h2>Routing decision order</h2></div><div class="threeCol"><div><span class="eyebrow">01</span><h3 style="font-size:14px">Permitted route</h3><p class="smallMuted">Can the supplier and recipient lawfully transact the line?</p></div><div><span class="eyebrow">02</span><h3 style="font-size:14px">Stock + exact SKU</h3><p class="smallMuted">Current availability, model, pack, batch/expiry and substitute controls.</p></div><div><span class="eyebrow">03</span><h3 style="font-size:14px">Commercial fulfilment</h3><p class="smallMuted">Landed cost, terms, delivery window and backup source.</p></div></div></section>`,true);
  }

  function adminFeed(){
    return shell(`<div class="pageHeader"><div><span class="eyebrow">ACORUS / MED7 INTEGRATION</span><h1>Supplier feed</h1><p>The production portal should ingest a B2B supplier master rather than scrape a retail storefront. CSV, SFTP or API can all map into the same controlled PS product master.</p></div></div><div class="feedDiagram"><div class="feedNode"><div style="font-size:23px;color:#ff5a1f">▤</div><h3>Acorus / Med7 source</h3><p>Supplier SKU, barcode, brand, pack, B2B cost, stock, batch/expiry, VAT evidence, product authorization, image/media permission.</p></div><div class="feedArrow">→</div><div class="feedNode"><div style="font-size:23px;color:#ff5a1f">▦</div><h3>PS product master</h3><p>Map supplier records to PS SKU, school-approved status, requirement status, backup source, margin rules and evidence date.</p></div><div class="feedArrow">→</div><div class="feedNode"><div style="font-size:23px;color:#ff5a1f">⌁</div><h3>School portal</h3><p>Expose only approved customer-facing fields. Never show internal supplier cost or routing logic to the clinic.</p></div></div><div class="twoCol"><section class="panel"><div class="panelHeader"><h2>Required feed fields</h2></div><div class="codeBlock">supplier_sku<br>barcode<br>brand<br>product_name<br>pack_size<br>category<br>b2b_unit_cost<br>vat_status_or_evidence<br>stock_qty_or_status<br>lead_time<br>batch_tracking_required<br>expiry_tracking_required<br>regulated_flag<br>registration_reference<br>image_url_or_asset_id<br>media_usage_permission<br>last_updated_at</div></section><section class="panel"><div class="panelHeader"><h2>Ingestion controls</h2></div><div class="gateList"><div class="gate ok"><span>Supplier SKU uniqueness</span><i></i></div><div class="gate ok"><span>Public benchmark kept separate</span><i></i></div><div class="gate warn"><span>Tax evidence expiry alert</span><i></i></div><div class="gate warn"><span>Product image permission</span><i></i></div><div class="gate block"><span>No silent substitute mapping</span><i></i></div><div class="gate ok"><span>Audit every manual cost change</span><i></i></div></div></section></div><div class="notice" style="margin-top:18px"><strong>Recommended commercial ask to Acorus:</strong> B2B price file + product master + live/periodic stock feed + permitted product media + agreed fulfilment rules. Once supplied, this page becomes the connector rather than a manual upload screen.</div>`,true);
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

  function productVariantSelector(p){
    const id=p.catalogueParentId||p.catalogueReferenceFamilyId||p.pscSku;
    const variants=catalogueProducts().filter(x=>(x.catalogueParentId||x.catalogueReferenceFamilyId||x.pscSku)===id);
    if(variants.length<2)return '';
    return `<div class="professionalSelector"><label for="productExactVariant">Exact product & pack</label><select id="productExactVariant" data-detail-variant>${variants.map(x=>`<option value="${esc(x.pscSku)}" ${x.pscSku===p.pscSku?'selected':''}>${esc(x.catalogueDisplayName||x.name)} · ${esc(x.cataloguePack||x.pack||'Pack to confirm')}</option>`).join('')}</select><p class="professionalSelectionNote">Each option keeps its own identity, photograph and pricing evidence.</p></div>`;
  }

  function buyerJourneyHtml(r){
    return `<section class="buyerJourney" aria-label="Purchasing record"><div class="buyerJourneyLead"><span>${esc(window.PSC_BUYER_JOURNEY.statusLabel(r.status))}</span><button class="button light" data-buyer-jump=".orderDocumentsPanel">Documents (${(r.documents||[]).length})</button><button class="button light" data-buyer-refresh>Refresh</button></div><details class="buyerRecordDisclosure"><summary>Request & authorization record</summary><ol>${window.PSC_BUYER_JOURNEY.journey(r).map(step=>`<li><b>${esc(step.label)}</b><span>${esc(step.detail)}</span></li>`).join('')}</ol><p>Recorded facts, not automatic release gates. Attached approvals still require PSC verification; an order confirmation is not proof of payment.</p></details></section>`;
  }
  function buyerProductConfidence(p){
    if(!currentRoute().startsWith('portal/'))return '';
    const info=window.PSC_PRODUCT_PRESENTATION.profile(p).info;
    const reference=p.workbookDecision==='ENQUIRY ONLY'||p.brand==='Specification-led'||String(p.pscSku).startsWith('INST-');
    const verified=info&&(info.verifiedFields||[]).length>0;
    const docs=(info?.documents||[]).filter(d=>d.verified&&d.source&&/^https:\/\//i.test(d.url||''));
    return `<section class="buyerConfidence" aria-label="Product confidence"><h4>${reference?'Sourcing reference':'Catalogue product'}</h4><p>${reference?'This describes a requirement. The exact brand, model and commercial pack must be agreed in quotation.':verified?'Only the specifically approved fields below have supporting verification. This is not blanket product or regulatory approval.':'The recorded product and pack identify your request. Technical specifications and suitability still need confirmation; this listing is not a verification certificate.'}</p>${!docs.length?'<p class="smallMuted">No approved manufacturer document is attached to this listing. Ask PSC for the exact model or pack documentation with your quotation.</p>':''}</section>`;
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
    const inRequest=state.basket.find(x=>lineKey(x)===p.pscSku)?.qty||0;

    return `<div class="productDetailModal fluidProductDetail professionalProductDetail" role="dialog" aria-modal="true" aria-label="${esc(displayName)}" data-product-experience="${window.PSC_PRODUCT_PRESENTATION.profile(p).kind}">
      <div class="modalHeader fluidProductHeader"><button class="productBackButton" data-modal-close aria-label="Back to catalogue">←</button><div><span class="eyebrow">${esc(primary.label)}</span><h2>${esc(displayName)}</h2><div class="smallMuted mono">${esc(p.pscSku)}</div></div><span class="productRequestCount">${inRequest?`${inRequest} in request`:''}</span></div>
      <div class="productDetailGrid fluidProductGrid">
        <div class="detailImagePane fluidImagePane">${image}${Array.isArray(p.storefrontMedia)&&p.storefrontMedia.length>1?`<div class="productGalleryStrip">${p.storefrontMedia.slice(0,5).filter(m=>(window.PSC_IMAGE_POLICY?window.PSC_IMAGE_POLICY.resolve(m.url):m.url)).map(m=>`<img src="${esc((window.PSC_IMAGE_POLICY?window.PSC_IMAGE_POLICY.resolve(m.url):m.url))}" alt="${esc(m.alt||displayName)}">`).join('')}</div>`:''}<div class="detailImageMeta">${p.brand&&p.brand!=='Specification-led'&&p.brand!=='Institutional range'?`<b>${esc(p.brand)}</b>`:''}<span>${esc(pack)}</span>${catalogueImageNote(p)}</div><div class="modalNeedChips">${needTags}</div></div>
        <div class="detailContentPane fluidDetailContent">
          <div class="professionalPurchaseIdentity"><h3>${esc(displayName)}</h3><p>${esc(pack)}</p></div>${wishlistControl(p)}${productVariantSelector(p)}${cataloguePricePreview(p)}${catalogueRetailPriceNotice()}${window.PSC_PRODUCT_PRESENTATION.whatsappHtml(p)}${window.PSC_READY_BASKETS?.entryHtml(p.pscSku)||''}
          ${buyerProductConfidence(p)}${window.PSC_PRODUCT_PRESENTATION.documentsHtml(p)}<div class="productQuickFacts"><div><span>PACK / UNIT</span><b>${esc(pack)}</b></div><div><span>SUPPLY BASIS</span><b>${p.regulated?'Licensed route':'Confirmed at quotation'}</b></div>${mapped?`<div><span>REQUIREMENT</span><b>Mapped to the applicable DHA clinic requirement.</b></div>`:''}</div>
          <div class="productDisclosureList">
            <details open><summary><span>Details</span><i>+</i></summary><div>${window.PSC_PRODUCT_PRESENTATION.factsHtml(p,{heading:false})}<p>${esc(p.pscOfferedSpecification||p.spec||'Exact commercial specification will be confirmed with the quotation.')}</p></div></details>
            ${mapped?`<details><summary><span>Requirement mapping</span><i>+</i></summary><div><p><strong>${esc(p.dhaRequirement||'Mapped requirement')}</strong></p><p>${esc(p.dhaReference||'DHA requirement')} · ${esc(p.dhaStatus||'Status to verify')}</p>${p.dhaCondition?`<small>${esc(p.dhaCondition)}</small>`:''}<p class="disclosureFinePrint">Mapped to the applicable DHA clinic requirement. This is not a DHA product endorsement or product approval.</p></div></details>`:''}
            <details><summary><span>Supply & compatibility</span><i>+</i></summary><div><p>${p.regulated?'Availability and supply remain subject to applicable UAE licensing, recipient authorization, product registration, storage, batch/expiry and professional controls.':'PS confirms the exact specification, current availability and commercial terms before quotation.'}</p></div></details>
            ${workshop?`<details><summary><span>From The Workshop</span><i>+</i></summary><div><button class="productWorkshopInline" data-go="workshop/${esc(workshop.slug)}"><small>${esc(workshopFormatLabel(workshop.format))}</small><b>${esc(workshop.title)}</b></button></div></details>`:''}
          </div>
        </div>
      </div>
      ${related.length?`<section class="productRelatedSection"><div class="productRelatedHead"><span>Related clinic supplies</span><small>Same clinical area or product family</small></div><div class="productRelatedRail">${related.map(x=>relatedProductRailCard(x,false)).join('')}</div></section>`:''}
      <div class="productStickyBar professionalRequestBar"><button class="button light requestViewButton" data-basket>View request <b>${basketQty()}</b></button>${window.PSC_PRODUCT_PRESENTATION.quantityHtml(1,pack)}<button class="button primary requestAddButton" data-add="${p.pscSku}">Add to Supply Request</button></div>
    </div>`;
  }

  function publicProductModal(sku){ return productModal(sku); }

  function modalHtml(meta){
    const body=meta.type==='request'?requestModal(meta.id,!!meta.admin):meta.type==='product'?productModal(meta.sku):meta.type==='public-product'?publicProductModal(meta.sku):'';
    return `<div class="modalBackdrop fluidOverlay" data-modal-close><div class="modal ${['product','public-product'].includes(meta.type)?'productModalShell fluidProductShell':''}" onclick="event.stopPropagation()">${body}</div></div>`;
  }


  async function submitCustomRequest(){
    const el=document.getElementById('customRequestText');
    const qtyEl=document.getElementById('customRequestQty');
    if(ui.buyerListMode){
      const description=el?.value.trim()||'',qty=Number(qtyEl?.value||1);
      if(!description||description.length>2000||!Number.isInteger(qty)||qty<1||qty>10000){toast('Enter a requirement of up to 2,000 characters and a positive quantity. You can attach the original file after submission.');return;}
      state.basket.push({kind:'unlisted',requestId:'list-'+crypto.randomUUID(),description,requestUnit:'Original list / sourcing requirement; line quantities need review',qty});
      ui.buyerListMode=false;save();ui.basket=true;render();return;
    }
    const text=(el?.value||'').trim();
    const qty=Math.max(1,Number(qtyEl?.value||1));
    if(!text){ toast('<strong>Add a description first.</strong>'); return; }

    if(isDemoAccount()){
      audit('Demo custom request',`${qty} × ${text}`);
      toast('<strong>Demo request received.</strong><br>This action is simulated and has not been sent to PS.');
      if(el) el.value='';
      return;
    }

    try{
      await persistCustomRequest(text,qty);
      toast(`<strong>Custom request received.</strong><br>PS will review it and contact ${esc(accountEmailLabel())}.`);
      if(el) el.value='';
    }catch(e){ console.error(e); toast('<strong>Could not send custom request.</strong>'); }
  }

  let requestSubmitting=false;
  let pendingSubmission=null;
  let pendingSubmissions={};
  async function submitRequest(){
    if(!state.basket.length || requestSubmitting)return;
    const note=[(document.getElementById('basketNote')||{}).value||'',scopeNote()].filter(Boolean).join('\n\n');
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
      state.basket=[]; state.scopesBySchool[state.activeSchoolId||'draft']=emptyScope(); if(state.notesBySchool)delete state.notesBySchool[state.activeSchoolId]; ui.basket=false;
      clearDraftUndo();
      save(); render();
      toast(`<strong>Demo order created.</strong><br>${esc(orderNumber)} is a simulated request and will reset on refresh.`);
      return;
    }

    requestSubmitting=true;
    document.querySelectorAll('[data-submit-request]').forEach(b=>{b.disabled=true;});
    try{
      const orderNumber=await persistNewOrder(lines,note);
      delete pendingSubmissions[pendingSubmission?.fingerprint];
      pendingSubmission=null;
      try{if(Object.keys(pendingSubmissions).length)sessionStorage.setItem('psc-pending-submission',JSON.stringify(pendingSubmissions));else sessionStorage.removeItem('psc-pending-submission');}catch{}
      state.basket=[]; state.scopesBySchool[state.activeSchoolId||'draft']=emptyScope(); if(state.notesBySchool)delete state.notesBySchool[state.activeSchoolId]; ui.basket=false;
      clearDraftUndo();
      save();
      try{await loadOrdersFromDatabase();}catch(e){console.warn('Request saved; history refresh failed:',e);}
      render();
      toast(`<strong>Request received.</strong><br>${esc(orderNumber)} is under review. PS will check the requirement before quoting.`);
    }catch(e){ console.error(e); toast('<strong>Request not confirmed.</strong><br>Your draft is retained. Retry this same requirement safely or contact Pharma Service.'); }
    finally{requestSubmitting=false;document.querySelectorAll('[data-submit-request]').forEach(b=>{b.disabled=false;});}
  }

  const DB_TO_UI_STATUS = {
    under_review:'Drafting', quote_sent:'Sent', confirmed:'Authorized', under_process:'Procurement',
    out_for_delivery:'Delivery', delivered:'Accepted', cancelled:'Cancelled', archived:'Cancelled'
  };

  function protectedRoute(route){ return route.startsWith('portal/') || route.startsWith('admin/'); }

  async function hydrateAccount(){
    if(!sb || !session?.user) return;
    const uid=session.user.id;
    if(state.ownerUserId!==uid){
      let owned=null,legacy=null;try{owned=JSON.parse(localStorage.getItem(STORAGE+':'+uid)||'null');legacy=JSON.parse(localStorage.getItem(STORAGE)||'null');}catch{}
      if(legacy&&(legacy.ownerUserId===uid||!legacy.ownerUserId&&legacy.accountEmail&&legacy.accountEmail.toLowerCase()===(session.user.email||'').toLowerCase()))state={...JSON.parse(JSON.stringify(seed)),...legacy};
      const legacyOwner=state.ownerUserId===uid||(!state.ownerUserId&&state.accountEmail&&state.accountEmail.toLowerCase()===(session.user.email||'').toLowerCase());
      const anonymousDraft=!state.ownerUserId&&!state.activeSchoolId&&!state.accountEmail;
      state=owned?.ownerUserId===uid?{...JSON.parse(JSON.stringify(seed)),...owned}:legacyOwner||anonymousDraft?state:JSON.parse(JSON.stringify(seed));
      state.ownerUserId=uid;buyerView.groupRows=null;buyerView.groupOpen=false;buyerView.documentType='';buyerView.groupError='';buyerView.requestsError='';buyerView.campusFilter='';
    }
    const [{data:profile,error:profileError},{data:memberships,error:membershipError}] = await Promise.all([
      sb.from('profiles').select('full_name,is_psc_admin').eq('user_id',uid).maybeSingle(),
      sb.from('memberships').select('role,group_id,school_id').eq('user_id',uid)
    ]);
    if(profileError) console.warn('Profile lookup:',profileError.message);
    if(membershipError) throw membershipError;

    const verified=!!session.user.email_confirmed_at;
    const isPscAdmin=!!profile?.is_psc_admin;
    if(!isPscAdmin&&!verified)throw new Error('Verify your account email before opening the portal.');
    const membership=(memberships||[])[0]||null;
    let group=null, school=null, schools=[];

    if(membership?.group_id){
      const {data:g,error:e}=await sb.from('account_groups').select('id,name,slug').eq('id',membership.group_id).single();
      if(e) throw e;
      group=g;

      const scope=(memberships||[]).filter(m=>m.group_id===membership.group_id);
      const groupWide=scope.some(m=>!m.school_id&&['group_admin','psc_admin'].includes(m.role));
      const ids=[...new Set(scope.map(m=>m.school_id).filter(Boolean))];
      let query=sb.from('schools').select('id,name,campus_name,group_id,active').eq('group_id',membership.group_id).eq('active',true);
      if(!groupWide)query=query.in('id',ids);
      const {data:scs,error:se}=await query.order('name',{ascending:true}).order('campus_name',{ascending:true});
      if(se)throw se;schools=scs||[];

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
      memberships:memberships||[],
      role:membership?.role||(isPscAdmin?'psc_admin':''),
      group,
      school,
      schools
    };

    if(isDemoAccount() && !demoSession.initialized){
      state=JSON.parse(JSON.stringify(seed));
      demoSession.initialized=true;
    }
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
    if(requestSubmitting){toast('<strong>Please wait for the request acknowledgement before switching sites.</strong>');return;}
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
    resetIntelligentSearch();ui.catalogueQuery='';ui.globalSearch='';
    ui.accountMenu=false;
    ui.basket=false;
    ui.modal=null;

    try{
      const loaded=await loadOrdersFromDatabase();
      save();
      render();
      if(!loaded){toast('Campus selected. Account activity could not be loaded; retry without losing your draft.');return;}
      toast(`<strong>Account switched.</strong><br>${esc(schoolLabel(next))}`);
    }catch(e){
      console.error(e);
      toast('<strong>Could not switch account.</strong><br>Please try again.');
    }
  }

  async function loadOrdersFromDatabase(){
    const user=session?.user?.id,school=authContext?.school?.id;
    try{await readOrdersFromDatabase();if(session?.user?.id===user&&authContext?.school?.id===school)buyerView.requestsError='';return true;}
    catch(e){if(authContext?.isPscAdmin)throw e;if(session?.user?.id===user&&authContext?.school?.id===school){state.requests=[];buyerView.requestsError='Account activity unavailable';}return false;}
  }
  async function readOrdersFromDatabase(){
    if(!sb || !session?.user) return;
    const version=++customerLoadVersion,requestUser=session.user.id,requestSchool=authContext?.school?.id;
    const stale=()=>version!==customerLoadVersion||session?.user?.id!==requestUser||(!authContext?.isPscAdmin&&authContext?.school?.id!==requestSchool);
    if(isDemoAccount() && demoSession.requestsBySchool[authContext?.school?.id]){
      state.requests=JSON.parse(JSON.stringify(demoSession.requestsBySchool[authContext.school.id]));
      return;
    }
    let query=sb.from('orders').select('*').order('created_at',{ascending:false});
    if(!authContext?.isPscAdmin){
      if(!authContext?.school?.id){ state.requests=[]; return; }
      query=query.eq('school_id',authContext.school.id);
    }
    const {data:orders,error}=await query;
    if(error) throw error;
    if(stale())return;
    const ids=(orders||[]).map(o=>o.id);
    if(!ids.length){ state.requests=[]; return; }
    const [{data:lines,error:lineError},{data:quotes,error:quoteError},{data:documents,error:documentError},{data:schools,error:schoolError},{data:groups,error:groupError}] = await Promise.all([
      sb.from('order_lines').select('*').in('order_id',ids),
      authContext?.isPscAdmin||isDemoAccount()?sb.from('quotes').select('*').in('order_id',ids):sb.rpc('psc_buyer_issued_quotes',{p_school:requestSchool}),
      sb.from('order_documents').select('*').in('order_id',ids).order('created_at',{ascending:false}),
      authContext?.isPscAdmin ? sb.from('schools').select('id,name,campus_name,group_id') : Promise.resolve({data:[authContext.school],error:null}),
      authContext?.isPscAdmin ? sb.from('account_groups').select('id,name') : Promise.resolve({data:authContext.group?[authContext.group]:[],error:null})
    ]);
    if(lineError) throw lineError; if(quoteError) throw quoteError; if(documentError) throw documentError; if(schoolError) throw schoolError; if(groupError) throw groupError;
    const issuedIds=(quotes||[]).filter(window.PSC_BUYER_JOURNEY.issued).map(q=>q.id);
    if(!authContext?.isPscAdmin&&!isDemoAccount()&&(!Array.isArray(quotes)||(quotes||[]).some(q=>!Array.isArray(q.issued_lines))))throw new Error('Invalid issued quotation response');
    const quoted=!authContext?.isPscAdmin&&!isDemoAccount()?{data:(quotes||[]).flatMap(q=>q.issued_lines),error:null}:issuedIds.length?await sb.from('quote_lines').select('id,quote_id,order_line_id,line_no,psc_sku_snapshot,line_description_snapshot,brand_model_snapshot,pack_snapshot,specification_snapshot,quantity,unit_sell_price_ex_vat,vat_rate_pct,customer_note').in('quote_id',issuedIds):{data:[],error:null};
    if(quoted.error)throw quoted.error;
    if(stale())return;
    const schoolMap=Object.fromEntries((schools||[]).filter(Boolean).map(x=>[x.id,x]));
    const groupMap=Object.fromEntries((groups||[]).filter(Boolean).map(x=>[x.id,x]));
    const quoteMap=Object.fromEntries(ids.map(id=>[id,window.PSC_BUYER_JOURNEY.latestQuote(quotes,id)]));
    let managementDecisions=[];if(authContext?.group?.slug==='aeg-education'&&(quotes||[]).length){const decisions=await sb.from('psc_management_decisions').select('*').in('quote_id',quotes.map(q=>q.id));if(decisions.error)throw decisions.error;managementDecisions=decisions.data||[];}
    const docsByOrder=(documents||[]).reduce((acc,d)=>{ (acc[d.order_id]||(acc[d.order_id]=[])).push(d); return acc; },{});
    state.requests=(orders||[]).map(o=>{
      const sc=schoolMap[o.school_id]||authContext?.school||{};
      const gp=groupMap[o.group_id]||authContext?.group||{};
      const orderLines=(lines||[]).filter(l=>l.order_id===o.id);
      const q=quoteMap[o.id];
      const qLines={};
      const mappedLines=orderLines.map(l=>{
        const mapped=l.family_id||l.family_name_snapshot?{
          type:'family', localFamily:!l.family_id, familyId:l.family_id||l.product_option_snapshot?.requested_family_id||(window.PSC_FAMILY_CATALOGUE_V39?.families||[]).find(f=>f.familyName===l.family_name_snapshot)?.familyId||l.family_name_snapshot, familyName:l.family_name_snapshot||l.line_description||l.family_id,
          presentation:l.requested_presentation||'', orderPackBasis:l.pack_snapshot||'', brandPreferenceMode:l.brand_preference_mode||'no_preference',
          requestedBrand:l.requested_brand||'', productOptionId:l.product_option_id||'', productOptionSnapshot:l.product_option_snapshot||null,
          requestedProductOptions:l.product_option_snapshot?.requested_product_options||[],requirementSnapshot:l.product_option_snapshot?.requested_requirement||null,
          familyPageType:l.product_option_snapshot?.requested_family_page_type||'',
          regulated:l.product_option_snapshot?.regulated??true, qty:Number(l.quantity)
        }:!l.psc_sku_snapshot&&!l.product_id&&l.line_description?{kind:'unlisted',requestId:'unlisted-'+l.id,description:l.line_description,requestUnit:l.pack_snapshot==='Unlisted item — requires PS review'?'':l.pack_snapshot||'',qty:Number(l.quantity),historicalSku:l.product_option_snapshot?.repeat_reference?.sku||''}:{sku:l.psc_sku_snapshot||'',qty:Number(l.quantity),lineSnapshot:{name:l.line_description||'Historical product reference '+(l.psc_sku_snapshot||''),pack:l.pack_snapshot||'',brand:l.brand_model_snapshot||''}};
        const key=lineKey(mapped);
        if(key) qLines[key]={sell:l.unit_price===null?undefined:Number(l.unit_price),vat:l.vat_rate===null?undefined:Number(l.vat_rate)};
        return mapped;
      });
      return {
        dbId:o.id,
        schoolId:o.school_id,
        id:o.order_number,
        groupName:gp.name||'',
        campus:schoolLabel(sc)||state.campus||'Clinic',
        requester:'Clinic account',
        createdAt:o.created_at,
        deliveredAt:o.delivered_at,
        cancelledAt:o.cancelled_at,
        expectedDeliveryDate:o.expected_delivery_date||null,
        documents:docsByOrder[o.id]||[],
        databaseStatus:o.status,
        status:DB_TO_UI_STATUS[o.status]||o.status,
        quoteRef:o.quote_ref||q?.quote_number||'',
        note:o.note||'',
        lines:mappedLines,
        quote:q?{issued:q,issuedLines:quoted.data||[],management_decision:managementDecisions.find(d=>d.quote_id===q.id&&d.revision===q.current_revision)?.decision||null,validity:q.validity_days?`${q.validity_days} calendar days`:'',delivery:q.delivery_terms||'',terms:q.payment_terms||'',lines:qLines}:{lines:qLines}
      };
    });
  }

  window.PSC_REFRESH_ACCOUNT=async()=>{const r=await sb.auth.getSession();session=r.data?.session||null;if(session)await hydrateAccount();render();};
  window.PSC_ACCOUNT_CONTEXT=()=>authContext;
  window.PSC_CUSTOMER_REQUESTS=()=>state.requests;

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
    searchSessions.clear();resetIntelligentSearch();
    const wasDemo=isDemoAccount();
    if(sb) await sb.auth.signOut();
    session=null; authContext=null;
    state={...JSON.parse(JSON.stringify(seed)),basket:[]};
    demoSession.initialized=false; demoSession.requestsBySchool={};
    if(!wasDemo){ try{ localStorage.removeItem(STORAGE); }catch{} }
    go('login');
  }

  async function bootstrapAuth(){
    if(!sb){ authReady=true; render(); return; }
    try{ await loadPublicStorefronts(); }catch(e){ console.warn('Public storefront load:',e); }
    const {data,error}=await sb.auth.getSession();
    if(error) console.warn(error.message);
    session=data?.session||null;
    if(session){ try{ await hydrateAccount(); }catch(e){ console.error('Account hydration failed',e);authContext=null;state.requests=[]; } }
    authReady=true;
    render();
    sb.auth.onAuthStateChange((_event,newSession)=>{
      session=newSession;
      if(_event==='PASSWORD_RECOVERY')location.hash='reset-password';
      setTimeout(async()=>{if(session){try{await hydrateAccount();}catch(e){console.error(e);authContext=null;state.requests=[];}}else authContext=null;if(!['activate-account','reset-password'].includes(currentRoute()))render();},0);
    });
  }

  async function persistNewOrder(lines,note=''){
    if(isDemoAccount()) throw new Error('Demo orders must remain local.');
    if(!sb || !session?.user || !authContext?.school?.id || !authContext?.group?.id) throw new Error('Account context is missing.');
    const dbLines=lines.map(l=>{
      if(l.kind==='unlisted')return {product_id:null,psc_sku_snapshot:null,line_description:l.description,brand_model_snapshot:null,pack_snapshot:l.requestUnit||'Unlisted item — requires PS review',quantity:l.qty,product_option_snapshot:l.historicalSku?{repeat_reference:{sku:l.historicalSku,request:l.repeatSource||'',notice:l.repeatNotice||''}}:null};
      if(isFamilyLine(l)){
        const snapshot={...(l.productOptionSnapshot||{}),requested_family_id:l.familyId,
          requested_family_page_type:l.familyPageType||'',regulated:!!l.regulated,
          requested_product_options:l.requestedProductOptions||[],requested_requirement:l.requirementSnapshot||null};
        return {
          product_id:null, psc_sku_snapshot:exactSkuForLine(l)||null,
          family_id:l.localFamily?null:l.familyId, family_name_snapshot:l.familyName,
          line_description:l.familyName||l.familyId,
          brand_model_snapshot:l.brandPreferenceMode==='specific_option'?(l.productOptionSnapshot?.exact_product_name||l.requestedBrand||null):(l.brandPreferenceMode==='other_brand'?l.requestedBrand:'No preference'),
          pack_snapshot:l.productOptionSnapshot?.pack||l.orderPackBasis||l.presentation||null, quantity:l.qty,
          product_option_id:l.brandPreferenceMode==='specific_option'?(l.productOptionId||null):null,
          requested_presentation:l.presentation||null,
          brand_preference_mode:l.brandPreferenceMode||'no_preference',
          requested_brand:l.brandPreferenceMode==='other_brand'?(l.requestedBrand||null):(l.brandPreferenceMode==='specific_option'?(l.productOptionSnapshot?.brand||l.requestedBrand||null):null),
          product_option_snapshot:snapshot
        };
      }
      const p=product(l.sku);
      return {product_id:null,psc_sku_snapshot:l.sku,line_description:l.lineSnapshot?.name||p?.name||l.sku,brand_model_snapshot:l.lineSnapshot?.brand||p?.brand||null,pack_snapshot:l.lineSnapshot?.pack||p?.pack||null,quantity:l.qty};
    });
    const payloadBytes=new TextEncoder().encode(JSON.stringify({user:session.user.id,school:authContext.school.id,lines:dbLines,note}));
    const fingerprint=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',payloadBytes)),b=>b.toString(16).padStart(2,'0')).join('');
    try{pendingSubmissions=JSON.parse(sessionStorage.getItem('psc-pending-submission')||'{}');}catch{}
    if(!pendingSubmissions||typeof pendingSubmissions!=='object'||Array.isArray(pendingSubmissions))pendingSubmissions={};
    pendingSubmission=pendingSubmissions[fingerprint]||{fingerprint,key:crypto.randomUUID()};
    pendingSubmissions[fingerprint]=pendingSubmission;
    try{sessionStorage.setItem('psc-pending-submission',JSON.stringify(pendingSubmissions));}catch{}
    const {data,error}=await sb.rpc('psc_submit_institutional_request',{
      p_school_id:authContext.school.id,p_submission_key:pendingSubmission.key,p_lines:dbLines,p_note:note
    });
    if(error) throw error;
    if(!data?.order_number)throw new Error('Submission acknowledgement missing');
    return data.order_number;
  }

  async function persistCustomRequest(description,quantity){
    if(isDemoAccount()) throw new Error('Demo custom requests must remain local.');
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
    if(!window.PSC_BUYER_JOURNEY.canDecide(authContext))throw new Error('Use the agreed formal authorization route. Portal purchasing authority is not established for this account.');
    if(authContext?.group?.slug==='aeg-education'){
      const canApprove=authContext.memberships?.some(m=>m.school_id===authContext.school?.id&&m.role==='management_approver');
      if(!canApprove)throw new Error('AEG management approval is required.');
      const gate=window.PSC_BUYER_JOURNEY.decisionGate(authContext,r);
      if(!gate.ok)throw new Error(gate.reason);
      // Submit only the revision actually rendered and reviewed. The server rejects stale revisions.
      const decision=await sb.rpc('psc_record_management_decision',{p_quote:gate.quoteId,p_revision:gate.revision,p_decision:action==='confirm'?'approved':'rejected',p_note:''});if(decision.error)throw decision.error;
      await loadOrdersFromDatabase();save();render();return;
    }
    throw new Error('Use the agreed PO or written authorization route for this account.');
  }


  // Shared scroll controller extends the original public-header listener to the portal.
  function syncPublicHeader(){ window.PSC_NAVIGATION_CHROME?.sync(); }
  function onPublicHeaderScroll(){ window.PSC_NAVIGATION_CHROME?.onScroll(); }

  function syncRouteMeta(route){
    const publicMeta={
      home:['Pharma Service | Institutional Healthcare Supply UAE','Institutional healthcare supply for schools and organizations in the UAE: controlled specifications, sourcing, quotation, delivery and replenishment.','/'],
      'our-model':['Our Model | Pharma Service','How Pharma Service handles institutional healthcare supply: careful specifications, category-appropriate sourcing, regulated routes and repeat account service.','/our-model.html'],
      'who-we-supply':['Our Model | Pharma Service','How Pharma Service handles institutional healthcare supply: careful specifications, category-appropriate sourcing, regulated routes and repeat account service.','/our-model.html'],
      'what-we-supply':['Our Model | Pharma Service','How Pharma Service handles institutional healthcare supply: careful specifications, category-appropriate sourcing, regulated routes and repeat account service.','/our-model.html'],
      'how-it-works':['Our Model | Pharma Service','How Pharma Service handles institutional healthcare supply: careful specifications, category-appropriate sourcing, regulated routes and repeat account service.','/our-model.html'],
      'ready-baskets':['Ready Procurement Baskets | Pharma Service','Explore preview procurement baskets for glucose monitoring, nebulizer setup and wound care. Specifications and compatibility require quotation review.','/#ready-baskets'],
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
    const workshopModule=workshopSlug?workshopModuleBySlug(workshopSlug):null;
    const baseRoute=route.startsWith('catalogue/')?'catalogue':route.startsWith('workshop/')?'workshop':route;
    let item=publicMeta[baseRoute];
    if(workshopModule)item=[`${workshopModule.title} | The Workshop`,workshopModule.intro,`/workshop/${workshopModule.slug}`];
    else if(workshopGuide)item=[`${workshopGuide.title} | The Workshop`,workshopGuide.excerpt,`/workshop/${workshopGuide.slug}`];
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
    draftCheckpoint();
    const r=currentRoute();
    if(r!==mailPreviousRoute){mailPreviousRoute=r;if(r==='admin/mail'&&authContext?.isPscAdmin&&!mailDesk.loading)window.PSC_REFRESH_MAIL();}
    if(catalogueSearchRoute!==r){ resetIntelligentSearch(); ui.globalSearch=''; ui.catalogueQuery=''; ui.modal=null; ui.basket=false; ui.accountMenu=false; ui.mobile=false; ui.publicMenu=false; catalogueSearchRoute=r; }
    if(protectedRoute(r)){
      if(!authReady){ $app.innerHTML='<main class="publicPage"><section class="publicPageHero"><span class="kicker">PHARMA SERVICE</span><h1>Opening secure account…</h1></section></main>'; return; }
      if(!session){ if(r!=='login') location.hash='login'; return; }
      if(r.startsWith('portal/')&&!authContext?.isPscAdmin&&!authContext?.school?.id){location.hash='login';return;}
      if(r.startsWith('admin/') && (!authContext?.isPscAdmin || isDemoAccount())){ location.hash='portal/dashboard'; return; }
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
      html=workshopRoutePage(slug);
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
      case 'ready-baskets': html=`<main class="publicPage psReadyPublic">${publicHeader('ready-baskets')}<div data-ready-baskets-gallery></div>${publicFooter()}</main>`;break;
      case 'workshop': html=workshopLandingPage();break;
      case 'wholesale': html=wholesalePage();break;
      case 'max': location.hash='services'; return;
      case 'demo': html=publicDemoPage();break;
      case 'careers': html=careersPage();break;
      case 'media': html=mediaPage();break;
      case 'contact': html=contactPage();break;
      case 'activate-account': html='<main class="publicPage"><section class="loginWrap"><div class="loginCard" data-customer-activation></div></section></main>';break;
      case 'reset-password': html='<main class="publicPage"><section class="loginWrap"><div class="loginCard" data-customer-password-reset></div></section></main>';break;
      case 'login': html=loginPage();break;
      case 'portal/dashboard': html=portalDashboard();break;
      case 'portal/catalogue': html=catalogue();break;
      case 'portal/baskets': html=shell('<div data-ready-baskets-gallery></div>');break;
      case 'portal/wishlist': html=wishlistPage();break;
      case 'portal/requests': html=requestsPage();break;
      case 'portal/replenish': html=replenishPage();break;
      case 'portal/documents': html=documentsPage();break;
      case 'portal/stock': html=isDemoAccount()?stockPage():shell(`<div class="pageHeader customerSimpleHeader"><div><span class="eyebrow">ACCOUNT MODULE</span><h1>Stock & expiry</h1><p>This module is not enabled for this live account yet. PS will only activate it when the account has real stock and expiry records to display.</p></div></div><section class="panel"><div class="emptyState"><h3>No simulated stock on a live account.</h3><p>Use Orders, Replenish and Documents for current live account activity.</p><button class="button primary" data-go="portal/dashboard">Back to Home</button></div></section>`);break;
      case 'portal/assets': html=isDemoAccount()?assetsPage():shell(`<div class="pageHeader customerSimpleHeader"><div><span class="eyebrow">ACCOUNT MODULE</span><h1>Clinic assets</h1><p>This module is not enabled for this live account yet. PS will only activate it when verified model, serial, warranty and service records have been loaded.</p></div></div><section class="panel"><div class="emptyState"><h3>No simulated assets on a live account.</h3><p>Verified asset records will appear here after onboarding.</p><button class="button primary" data-go="portal/dashboard">Back to Home</button></div></section>`);break;
      case 'portal/insights': html=insightsPage();break;
      case 'portal/archive': html=archivePage();break;
      case 'admin/dashboard': html=workspacePage('today');break;
      case 'admin/sales': html=workspacePage('sales');break;
      case 'admin/onboarding': html=workspacePage('onboarding');break;
      case 'admin/customers': html=workspacePage('customers');break;
      case 'admin/tasks': html=workspacePage('tasks');break;
      case 'admin/resources': html=workspacePage('resources');break;
      case 'admin/settings': html=workspacePage('settings');break;
      case 'admin/mail': html=adminMail();break;
      case 'admin/storefront': html=adminStorefront();break;
      case 'admin/products': html=adminProducts();break;
      case 'admin/family-options': html=adminFamilyOptions();break;
      case 'admin/requests': html=workspacePage('requests');break;
      case 'admin/legacy-requests': html=adminRequests();break;
      case 'admin/fulfilment': html=adminFulfilment();break;
      case 'admin/supplier-feed': html=adminFeed();break;
      default: html=landing();
    }
    $app.innerHTML=html + (ui.modal?.type==='public-product'?modalHtml(ui.modal):''); syncRouteMeta(r); bind(); syncPublicHeader();
  }

  async function submitPublicEnquiry(event){
    event.preventDefault();
    if(isDemoAccount()){ toast('<strong>Demo enquiry received.</strong><br>This action is simulated and has not been sent to PS.'); return; }
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


  // Delegation includes current feature content inserted after the shell render.
  document.addEventListener('click',event=>{
    const saved=event.target.closest?.('[data-wishlist-toggle]');
    if(saved&&document.getElementById('app')?.contains(saved)){event.preventDefault();toggleWishlist(saved);return;}
    const control=event.target.closest?.('[data-go]');
    if(!control || event.defaultPrevented || control.disabled || !document.getElementById('app')?.contains(control)) return;
    event.preventDefault();
    go(control.dataset.go);
  });

  document.addEventListener('submit',async event=>{
    const form=event.target.closest?.('[data-ps-command-form]');
    if(!form || !document.getElementById('app')?.contains(form))return;
    event.preventDefault();
    await applyIntelligentCommand(form.querySelector('[data-cat-q]').value);
  });

  function bind(){
    bindMasterNavigator();
    document.querySelectorAll('[data-buyer-history-items]').forEach(el=>el.addEventListener('click',()=>{const row=document.getElementById(el.getAttribute('aria-controls'));if(!row)return;row.hidden=!row.hidden;el.setAttribute('aria-expanded',String(!row.hidden));}));
    window.PSC_FAMILY_SHOPFRONT.mount();
    document.querySelectorAll('[data-shopfront-family]').forEach(el=>el.addEventListener('click',()=>{ui.catalogueCat='All product types';ui.catalogueFilter='All lines';go('portal/catalogue/all?family='+encodeURIComponent(el.dataset.shopfrontFamily));}));
    document.querySelector('[data-shopfront-clear]')?.addEventListener('click',()=>{ui.catalogueCat='All product types';ui.catalogueFilter='All lines';go('portal/catalogue/all');});
    document.querySelectorAll('[data-ps-undo]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();undoDraftChange();}));
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
      el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();window.PS_SEARCH_CATALOGUE(e.target.value);}});
    });
    document.querySelectorAll('[data-portal-query]').forEach(el=>el.addEventListener('click',()=>applyIntelligentCommand(el.dataset.portalQuery)));
    document.querySelectorAll('[data-tour-next]').forEach(el=>el.addEventListener('click',()=>{ui.tourStep=Math.min(5,(ui.tourStep||0)+1);render()}));
    document.querySelectorAll('[data-tour-prev]').forEach(el=>el.addEventListener('click',()=>{ui.tourStep=Math.max(0,(ui.tourStep||0)-1);render()}));
    document.querySelectorAll('[data-tour-jump]').forEach(el=>el.addEventListener('click',()=>{ui.tourStep=Number(el.dataset.tourJump)||0;render()}));
    document.querySelectorAll('[data-mobile-open]').forEach(el=>el.addEventListener('click',()=>{ui.mobile=true;render()}));
    document.querySelectorAll('[data-mobile-close]').forEach(el=>el.addEventListener('click',()=>{ui.mobile=false;render()}));
    document.querySelectorAll('[data-campus]').forEach(el=>el.addEventListener('change',e=>{state.campus=e.target.value;save();render()}));
    document.querySelectorAll('[data-school-select]').forEach(el=>el.addEventListener('click',async()=>{await switchInstitutionAccount(el.dataset.schoolSelect)}));
    document.querySelectorAll('[data-basket]').forEach(el=>el.addEventListener('click',openBasketOverlay));
    document.querySelectorAll('[data-close-basket]').forEach(el=>el.addEventListener('click',e=>{if(el.tagName==='BUTTON'||e.target===el)closeBasketOverlay();}));
    document.querySelectorAll('[data-product-view]').forEach(el=>el.addEventListener('click',()=>openProductOverlay(el.dataset.productView,false)));
    document.querySelectorAll('[data-public-product-view]').forEach(el=>el.addEventListener('click',()=>openProductOverlay(el.dataset.publicProductView,true)));
    document.querySelectorAll('[data-detail-variant]').forEach(el=>el.addEventListener('change',()=>openProductOverlay(el.value,false)));
    document.querySelectorAll('.productDetailModal').forEach(root=>window.PSC_PRODUCT_PRESENTATION.bindQuantity(root));
    document.querySelectorAll('[data-add]').forEach(el=>el.addEventListener('click',()=>addBasket(el.dataset.add,el.closest('.productDetailModal')?.querySelector('[data-request-quantity]')?.value||1)));
    document.querySelectorAll('[data-basket-delta]').forEach(el=>el.addEventListener('click',()=>{const [sku,d]=el.dataset.basketDelta.split('|');const line=state.basket.find(x=>x.sku===sku);if(!line)return;line.qty=window.PSC_PRODUCT_PRESENTATION.quantity(line.qty+Number(d));save();renderUi({preserveScroll:true,transition:false})}));
    document.querySelectorAll('[data-basket-remove]').forEach(el=>el.addEventListener('click',()=>{state.basket=state.basket.filter(x=>x.sku!==el.dataset.basketRemove);save();renderUi({preserveScroll:true,transition:false})}));
    document.querySelectorAll('[data-family-basket-delta]').forEach(el=>el.addEventListener('click',()=>{const[i,d]=el.dataset.familyBasketDelta.split('|');const line=state.basket[Number(i)];if(!line||!(isFamilyLine(line)||line.kind==='unlisted'))return;line.qty=window.PSC_PRODUCT_PRESENTATION.quantity(line.qty+Number(d));save();renderUi({preserveScroll:true,transition:false})}));
    document.querySelectorAll('[data-family-basket-remove]').forEach(el=>el.addEventListener('click',()=>{const i=Number(el.dataset.familyBasketRemove);if(Number.isInteger(i)&&state.basket[i]&&(isFamilyLine(state.basket[i])||state.basket[i].kind==='unlisted'))state.basket.splice(i,1);save();renderUi({preserveScroll:true,transition:false})}));
    document.querySelectorAll('[data-submit-request]').forEach(el=>el.addEventListener('click',submitRequest));
    document.querySelectorAll('[data-submit-custom]').forEach(el=>el.addEventListener('click',submitCustomRequest));
    document.querySelectorAll('[data-mail-tab]').forEach(el=>el.addEventListener('click',()=>{ui.mailTab=el.dataset.mailTab;render()}));
    document.querySelectorAll('[data-outreach-history-refresh]').forEach(el=>el.addEventListener('click',async()=>{el.disabled=true;await loadAdminMail();render()}));
    document.querySelectorAll('[data-outreach-save-review]').forEach(el=>el.addEventListener('click',async()=>{el.disabled=true;try{const id=await saveMailCampaign();if(id)window.PSC_OUTREACH_REVIEW?.(id)}finally{if(el.isConnected)el.disabled=false}}));
    document.querySelectorAll('[data-mail-copy]').forEach(el=>el.addEventListener('click',()=>{const c=mailDesk.campaigns.find(c=>c.id===el.dataset.mailCopy);if(!c)return;ui.mailTemplate=c.template;ui.mailGuideSlug=c.workshop_slug||ui.mailGuideSlug;ui.mailDraftSubject=c.subject;ui.mailDraftIntro=c.intro;ui.mailDraftCta=c.cta_label;ui.mailSelectedContacts=mailDesk.recipients.filter(r=>r.campaign_id===c.id).map(r=>r.contact_id);ui.mailTab='compose';render();toast('Editable copy opened. Saving creates a new draft; nothing is sent.')}));
    document.querySelectorAll('[data-mail-template]').forEach(el=>el.addEventListener('click',()=>{ui.mailTemplate=el.dataset.mailTemplate;ui.mailDraftSubject='';ui.mailDraftIntro='';ui.mailDraftCta=ui.mailTemplate==='custom'?'See how Pharma Service works':ui.mailTemplate==='supply-note'?'Browse catalogue':'Read the guide';render()}));
    document.querySelectorAll('[data-mail-guide]').forEach(el=>el.addEventListener('change',e=>{ui.mailGuideSlug=e.target.value;ui.mailDraftSubject='';ui.mailDraftIntro='';render()}));
    document.querySelectorAll('[data-mail-subject]').forEach(el=>el.addEventListener('input',e=>{ui.mailDraftSubject=e.target.value;const preview=document.querySelector('.mailPreviewPane');if(preview)preview.innerHTML=`<div class="mailPreviewLabel"><span>EMAIL PREVIEW</span><small>Responsive HTML · no tracking pixels</small></div>${mailPreview()}`;}));
    document.querySelectorAll('[data-mail-intro]').forEach(el=>el.addEventListener('input',e=>{ui.mailDraftIntro=e.target.value;const preview=document.querySelector('.mailPreviewPane');if(preview)preview.innerHTML=`<div class="mailPreviewLabel"><span>EMAIL PREVIEW</span><small>Responsive HTML · no tracking pixels</small></div>${mailPreview()}`;}));
    document.querySelectorAll('[data-mail-cta]').forEach(el=>el.addEventListener('input',e=>{ui.mailDraftCta=e.target.value;const preview=document.querySelector('.mailPreviewPane');if(preview)preview.innerHTML=`<div class="mailPreviewLabel"><span>EMAIL PREVIEW</span><small>Responsive HTML · no tracking pixels</small></div>${mailPreview()}`;}));
    document.querySelectorAll('[data-mail-search]').forEach(el=>el.addEventListener('input',e=>{ui.mailSearch=e.target.value;renderUi({preserveScroll:true,focusSelector:'[data-mail-search]',cursor:e.target.selectionStart,transition:false})}));
    document.querySelectorAll('[data-mail-role]').forEach(el=>el.addEventListener('change',e=>{ui.mailRole=e.target.value;render()}));
    document.querySelectorAll('[data-mail-institution]').forEach(el=>el.addEventListener('change',e=>{ui.mailInstitution=e.target.value;render()}));
    document.querySelectorAll('[data-mail-contact-select]').forEach(el=>el.addEventListener('change',()=>{const set=new Set(ui.mailSelectedContacts||[]);el.checked?set.add(el.dataset.mailContactSelect):set.delete(el.dataset.mailContactSelect);ui.mailSelectedContacts=[...set];const h=document.querySelector('.mailAudienceHead h3');if(h)h.textContent=mailAudienceSummary();const send=document.querySelector('[data-outreach-save-review]');if(send)send.disabled=!mailDesk.backendReady||!mailSelectedEligibleContacts().length;}));
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
    document.querySelector('[data-buyer-refresh]')?.addEventListener('click',async()=>{await loadOrdersFromDatabase();render();});
    document.querySelector('[data-buyer-retry]')?.addEventListener('click',async()=>{await loadOrdersFromDatabase();render();});
    document.querySelectorAll('[data-buyer-jump]').forEach(el=>el.addEventListener('click',()=>document.querySelector('.modal '+el.dataset.buyerJump)?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})));
    document.querySelector('[data-buyer-campus-filter]')?.addEventListener('change',e=>{buyerView.campusFilter=e.target.value;render();});
    document.querySelectorAll('[data-buyer-campus-request]').forEach(el=>el.addEventListener('click',async()=>{const [school,id]=el.dataset.buyerCampusRequest.split('|');if(requestSubmitting){toast('Wait for the request acknowledgement before changing campus.');return;}if(!authContext.schools.some(s=>s.id===school))return;if(authContext.school.id!==school)await switchInstitutionAccount(school);if(authContext.school.id!==school||buyerView.requestsError)return;const r=customerAccountRequests().find(r=>r.dbId===id);if(!r){toast('This request is no longer available. Refresh campus activity.');return;}ui.modal={type:'request',id:r.id};render();}));
    document.querySelector('[data-buyer-list]')?.addEventListener('click',()=>{ui.buyerListMode=true;go('portal/catalogue/all');setTimeout(()=>{const field=document.getElementById('customRequestText'),button=document.querySelector('[data-submit-custom]');if(button)button.textContent='Review in Supply Request';if(field){field.insertAdjacentHTML('beforebegin','<p class="smallMuted">Paste the original descriptions. Unresolved specifications remain for PSC review. After submitting the RFQ, attach your original Excel or PDF in the request’s Documents section.</p>');field.scrollIntoView({block:'center'});field.focus();}},0);});
    document.querySelector('[data-buyer-note]')?.addEventListener('input',e=>{state.notesBySchool=state.notesBySchool||{};state.notesBySchool[state.activeSchoolId]=e.target.value;save();});
    document.querySelector('[data-buyer-document-type]')?.addEventListener('change',e=>{buyerView.documentType=e.target.value;render();});
    document.querySelector('[data-buyer-group]')?.addEventListener('click',()=>{buyerView.groupOpen=true;loadBuyerActivity();});
    document.querySelector('[data-buyer-date]')?.addEventListener('change',e=>{buyerView.dateFrom=e.target.value;render();});
    document.querySelectorAll('[data-request-reorder]').forEach(el=>el.addEventListener('click',()=>reorderRequest(el.dataset.requestReorder)));

    document.querySelectorAll('[data-replenish]:not([data-buyer-repeat-line])').forEach(el=>el.addEventListener('click',()=>{const [sku,q]=el.dataset.replenish.split('|');addBasket(sku,Math.max(1,Number(q)||1));toast('<strong>Added to request.</strong><br>Previous delivered quantity restored.')}));
    document.querySelectorAll('[data-buyer-repeat-line]').forEach(el=>el.addEventListener('click',()=>{const [id,index]=el.dataset.buyerRepeatLine.split('|');reorderRequest(decodeURIComponent(id),Number(index));}));
    document.querySelectorAll('[data-reorder-order]').forEach(el=>el.addEventListener('click',()=>reorderRequest(el.dataset.reorderOrder)));
    document.querySelectorAll('[data-confirm-quote]').forEach(el=>el.addEventListener('click',async()=>{try{await updateCustomerQuote(el.dataset.confirmQuote,'confirm');toast(authContext?.group?.slug==='aeg-education'?'<strong>Management approval recorded.</strong><br>Customer PO and PSC commercial release checks remain required.':'<strong>Quotation confirmed.</strong><br>PS will confirm the fulfilment and delivery timing for this order.')}catch(e){console.error(e);toast('<strong>Decision not recorded.</strong><br>'+esc(e.message||'Refresh the request and review the latest quotation.'))}}));
    document.querySelectorAll('[data-cancel-quote]').forEach(el=>el.addEventListener('click',async()=>{try{await updateCustomerQuote(el.dataset.cancelQuote,'cancel');toast(authContext?.group?.slug==='aeg-education'?'<strong>Management rejection recorded.</strong><br>PS can review and revise the quotation.':'<strong>Quotation cancelled.</strong><br>It will remain visible for 30 days before moving to Archive.')}catch(e){console.error(e);toast('<strong>Decision not recorded.</strong><br>'+esc(e.message||'Refresh the request and review the latest quotation.'))}}));
    document.querySelectorAll('[data-reorder-last]').forEach(el=>el.addEventListener('click',()=>{const r=state.requests.find(x=>x.campus===state.campus);if(r)reorderRequest(r.id)}));
    document.querySelectorAll('[data-request-view]').forEach(el=>el.addEventListener('click',()=>{ui.modal={type:'request',id:el.dataset.requestView,admin:false};render()}));
    document.querySelectorAll('[data-admin-request]').forEach(el=>el.addEventListener('click',()=>{ui.modal={type:'request',id:el.dataset.adminRequest,admin:true};render()}));
    document.querySelectorAll('[data-modal-close]').forEach(el=>el.addEventListener('click',e=>{if(el.tagName==='BUTTON'||e.target===el)closeModalOverlay();}));
    document.querySelectorAll('[data-document-open]').forEach(el=>el.addEventListener('click',()=>openOrderDocument(el.dataset.documentOpen)));
    document.querySelectorAll('[data-document-upload]').forEach(el=>el.addEventListener('change',async e=>{const file=e.target.files?.[0];if(file)await uploadOrderDocument(el.dataset.documentUpload,file);}));
    bindUnlistedRequirement(document);
    document.querySelectorAll('[data-ps-select-sku]').forEach(el=>el.addEventListener('click',()=>{intelligent.selected=el.dataset.psSelectSku;intelligent.confirmed=intelligent.selected;applyIntelligentCommand(intelligent.said);}));
    document.querySelectorAll('[data-ps-clarify-type]').forEach(el=>el.addEventListener('click',()=>applyIntelligentCommand(el.dataset.psClarifyType)));
    document.querySelectorAll('[data-ps-clarify]').forEach(el=>el.addEventListener('click',()=>{window.PS_SEARCH_ANALYTICS?.record('clarification_selected',{query:intelligent.said});return applyIntelligentCommand(el.dataset.psClarify==='both'?'gauze':`gauze ${el.dataset.psClarify}`);}));
    document.querySelectorAll('[data-ps-sheet-open]').forEach(el=>el.addEventListener('click',()=>{intelligent.sheet=true;renderUi({preserveScroll:true,transition:false});document.querySelector('[data-ps-sheet-close]')?.focus();}));
    document.querySelectorAll('[data-ps-sheet-close]').forEach(el=>el.addEventListener('click',()=>{intelligent.sheet=false;renderUi({preserveScroll:true,transition:false});document.querySelector('[data-ps-sheet-open]')?.focus();}));
    document.querySelectorAll('[data-ps-scope]').forEach(el=>el.addEventListener('change',()=>{if(el.dataset.psCommittedValue===el.value)return;el.dataset.psCommittedValue=el.value;const scope=scopeDraft();const field=el.dataset.psScope;if(field==='sites'){const n=Number(el.value);scope.sites=Number.isInteger(n)&&n>=1&&n<=10000?n:null;scope.quantityConfirmation=!!scope.sites;}else scope[field]=el.value.slice(0,160);save();renderUi({preserveScroll:true,transition:false});}));
    document.querySelectorAll('[data-ps-confirm-totals]').forEach(el=>el.addEventListener('click',()=>{scopeDraft().quantityConfirmation=false;save();renderUi({preserveScroll:true,transition:false});}));
    document.querySelectorAll('[data-ps-line-qty]').forEach(el=>el.addEventListener('change',()=>{if(el.dataset.psCommittedValue===el.value)return;el.dataset.psCommittedValue=el.value;const n=Number(el.value),line=state.basket[Number(el.dataset.psLineQty)];if(line&&Number.isInteger(n)&&n>=1&&n<=10000)line.qty=n;save();renderUi({preserveScroll:true,transition:false});}));
    document.querySelectorAll('[data-ps-line-remove]').forEach(el=>el.addEventListener('click',()=>{state.basket.splice(Number(el.dataset.psLineRemove),1);save();renderUi({preserveScroll:true,transition:false});}));
    document.querySelectorAll('[data-ps-prepare]').forEach(el=>el.addEventListener('click',()=>{intelligent.sheet=false;ui.basket=true;renderUi({preserveScroll:true,transition:false});}));
    document.querySelectorAll('[data-catalogue-clear]').forEach(button=>button.addEventListener('click',()=>{
      resetIntelligentSearch();ui.catalogueQuery='';ui.globalSearch='';
      renderUi({preserveScroll:true,focusSelector:'[data-cat-q]',cursor:0,transition:false});
    }));
    const cq=document.querySelector('[data-cat-q]'); if(cq)cq.addEventListener('input',e=>{intelligent.sequence++;ui.catalogueQuery=e.target.value;ui.globalSearch=e.target.value;clearTimeout(searchTypingTimer);if(!e.target.value){resetIntelligentSearch();updateCatalogueResults();return;}searchTypingTimer=setTimeout(updateCatalogueResults,140);});
    document.querySelectorAll('[data-school-collection]').forEach(el=>el.addEventListener('click',()=>{
      openSchoolCollection(el.dataset.schoolCollection);
    }));
    document.querySelectorAll('[data-school-kit]').forEach(el=>el.addEventListener('click',()=>{
      ui.schoolKit=el.dataset.schoolKit;renderUi({preserveScroll:true,transition:false});
    }));
    document.querySelectorAll('[data-school-opening-request]').forEach(el=>el.addEventListener('click',()=>{
      state.basket.push({kind:'unlisted',requestId:'unlisted-'+crypto.randomUUID(),description:'Complete new school clinic setup quotation: room furniture, diagnostics, emergency equipment and opening consumables. Site population and authority requirements to confirm. Medicines and facilities need separate approved scopes.',qty:1});
      save();ui.basket=true;renderUi({preserveScroll:true,transition:false});
    }));
    document.querySelectorAll('[data-school-kit-request]').forEach(el=>el.addEventListener('click',()=>{
      const kit=window.PS_SCHOOL_BASKETS?.kits?.find(k=>k.id===el.dataset.schoolKitRequest);
      if(!kit)return;
      const contents=kit.contents.map(([label,id,pack])=>`${label}${id?' ['+id+']':''} — ${pack}`).join('; ');
      state.basket.push({kind:'unlisted',requestId:'unlisted-'+crypto.randomUUID(),description:kit.title+' | location: '+kit.where+' | PS proposed contents to be reviewed with the school nurse and site risk lead. Request a fully itemized kit quotation and practical refill packs. Proposed contents snapshot ('+window.PS_SCHOOL_BASKETS.version+'): '+contents,qty:1});
      save();ui.basket=true;renderUi({preserveScroll:true,transition:false});
    }));
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
    document.querySelectorAll('[data-request-status]').forEach(el=>el.addEventListener('change',e=>{if(!window.PSC_IS_DEMO_ACCOUNT?.())return;const r=state.requests.find(x=>x.id===el.dataset.requestStatus);r.status=e.target.value;if(r.status==='Sent'&&!r.quoteRef)r.quoteRef=`PSC-Q-${new Date().getFullYear()}-${String(state.requests.indexOf(r)+1001).padStart(4,'0')}`;audit('Request status changed',`${r.id} → ${r.status}`);save();render()}));
    document.querySelectorAll('[data-quote-ref]').forEach(el=>el.addEventListener('change',e=>{const r=state.requests.find(x=>x.id===el.dataset.quoteRef);r.quoteRef=e.target.value;audit('Quote reference updated',r.id);save()}));
    document.querySelectorAll('[data-approve-quote]').forEach(el=>el.addEventListener('click',()=>{const r=state.requests.find(x=>x.id===el.dataset.approveQuote);r.status='Authorized';audit('Quotation confirmed by demo account user',r.id);save();render();toast(authContext?.group?.slug==='aeg-education'?'<strong>Management approval recorded.</strong><br>Customer PO and PSC commercial release checks remain required.':'<strong>Quotation confirmed.</strong><br>PS will confirm the fulfilment and delivery timing for this order.')}));
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
    document.querySelectorAll('[data-cms-image-upload]').forEach(el=>el.addEventListener('change',e=>{const draft=document.querySelector(`[data-cms-photo-draft="${el.dataset.cmsImageUpload}"]`),file=e.target.files?.[0];if(!draft)return;const img=draft.querySelector('img');if(img.dataset.previewUrl)URL.revokeObjectURL(img.dataset.previewUrl);draft.hidden=!file;if(file){const url=URL.createObjectURL(file);img.src=url;img.dataset.previewUrl=url;}document.querySelector(`[data-cms-image-review="${el.dataset.cmsImageUpload}"]`)?.querySelectorAll('input').forEach(x=>x.checked=false);}));
    document.querySelectorAll('[data-cms-image-save]').forEach(el=>el.addEventListener('click',async()=>{try{const input=document.querySelector(`[data-cms-image-upload="${el.dataset.cmsImageSave}"]`),file=input?.files?.[0];if(file)await uploadCmsImage(el.dataset.cmsImageSave,file);}catch(err){console.error(err);toast('<strong>Image upload failed.</strong>')}}));
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

  window.addEventListener('click',e=>{const target=e.target.closest?.('[data-product-view]');if(target&&product(target.dataset.productView))productSearchMemory().selectedSku=target.dataset.productView;},true);
  window.addEventListener('scroll',onPublicHeaderScroll,{passive:true});
  window.addEventListener('hashchange',render);
  window.addEventListener('psc-commercial-status-saved',async()=>{try{await loadOrdersFromDatabase();save();render();}catch(error){toast('<strong>Status saved.</strong><br>Refresh the request list to see the latest status.');console.warn('Status saved; list refresh failed:',error);}});
  window.addEventListener('popstate',render);
  // Clean Workshop and Start URLs are owned by currentRoute; do not inject #home.
  if(!location.hash && location.pathname==='/') history.replaceState(history.state,'','/#home');
  bootstrapAuth();
})();
