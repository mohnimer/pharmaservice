(() => {
  'use strict';
  const D = window.PSC_DATA;
  const C = window.PSC_COPY || {};
  const PSC_LOGO = './assets/psc-logo-cropped.png';
  const DHA_ICON = './assets/dha-requirement.png';
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
  let ui = { mobile:false, publicMenu:false, basket:false, modal:null, accountMenu:false, globalSearch:'', catalogueQuery:'', catalogueNeed:'all', catalogueCat:'All product types', catalogueFilter:'All lines', productQuery:'', productCat:'All', evidence:'All', cmsChannel:'institutional', cmsSearch:'', wholesaleQuery:'', wholesaleCat:'All', tourStep:0 };

  const cms = {
    loaded:false,
    loading:false,
    products:[],
    settings:[],
    media:[],
    storefronts:[],
    publicRows:{institutional:[],wholesale:[]}
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
  function productDisplayImageUrl(p){
    const raw=(p?.imageUrl||'').trim();
    if(!raw) return null;
    const lower=raw.toLowerCase();
    const looksLikeStandaloneDhaAsset = lower.includes('dha-requirement') || lower.endsWith('/pharmaservice.png') || lower.endsWith('pharmaservice.png');
    if(p?.dhaMapped && looksLikeStandaloneDhaAsset) return null;
    return raw;
  }
  function products(){ return D.products.map(p=>product(p.pscSku)); }
  function currentRoute(){ return (location.hash || '#home').slice(1); }
  function go(route){ location.hash = route; ui.mobile=false; ui.publicMenu=false; ui.modal=null; window.scrollTo({top:0,behavior:'instant'}); render(); }
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
      help:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.8 9.1a2.5 2.5 0 1 1 3.9 2c-.9.6-1.7 1.2-1.7 2.5"/><path d="M12 17.6h.01"/></svg>`
    };
    return map[name]||'';
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
  const adminNav=[['admin/dashboard','Deal Desk','dashboard'],['admin/storefront','Storefront','edit'],['admin/products','Product Master','boxes'],['admin/requests','Request Queue','checklist'],['admin/fulfilment','Fulfilment Rules','repeat'],['admin/supplier-feed','Supplier Feed','reports']];

  function shell(content, admin=false){
    const route=currentRoute();
    const liveCustomerNav=schoolNav.filter(([href])=>isDemoAccount() || !['portal/stock','portal/assets'].includes(href));
    const links=admin?adminNav:liveCustomerNav;
    const searchValue=esc(ui.globalSearch||'');
    return `<div class="appShell v4Shell v7Shell v7bShell v26Shell v37Shell ${admin?'adminShell':'customerShell'}">
      <div class="mobileOverlay ${ui.mobile?'show':''}" data-mobile-close></div>
      <aside class="sidebar ${ui.mobile?'sidebarOpen':''}">
        <div class="sidebarTop">${brand()}<button class="iconBtn mobileClose" data-mobile-close aria-label="Close menu">${icon('close')}</button></div>
        <nav class="iconNav">${links.map(([href,label,ico])=>`<button class="navLink iconOnly ${(route===href || (href==='portal/catalogue' && route.startsWith('portal/catalogue/')))?'active':''}" data-go="${href}" aria-label="${label}"><span class="navIcon">${icon(ico)}</span><span class="navLabel">${label}</span></button>`).join('')}</nav>
        <div class="sidebarFooter compactFooter">
          ${admin?`<button class="navLink iconOnly" data-go="portal/dashboard" aria-label="Client portal"><span class="navIcon">${icon('home')}</span><span class="navLabel">Client portal</span></button>`:(authContext?.isPscAdmin?`<button class="navLink iconOnly" data-go="admin/dashboard" aria-label="PSC admin"><span class="navIcon">${icon('home')}</span><span class="navLabel">PSC admin</span></button>`:'')}
          <button class="navLink iconOnly" data-signout aria-label="Sign out"><span class="navIcon">${icon('logout')}</span><span class="navLabel">Sign out</span></button>
        </div>
      </aside>
      <main class="mainArea v7MainArea v7bMainArea">
        <header class="topbar sleekTopbar v7Topbar v7bTopbar portalHeaderBar">
          <button class="iconBtn mobileMenu" data-mobile-open aria-label="Open menu">${icon('menu')}</button>
          <div class="topbarBrandSlot plainLogo"><img src="${PSC_LOGO}" alt="Pharma Service"></div>
          ${!admin?`<div class="topbarSearch"><span class="searchIcon">${icon('search')}</span><input data-global-search value="${searchValue}" placeholder="Search institutional catalogue…" aria-label="Search institutional catalogue"></div>`:'<div class="topbarAdminTitle"><span>PSC</span><b>Deal Desk</b></div>'}
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
            <button class="button dark pillBasket" data-basket>Cart <b>${basketQty()}</b></button>`}
          </div>
        </header>
        ${!admin?`<div class="mobileSearchRow"><div class="mobileSearchInput"><span class="searchIcon">${icon('search')}</span><input data-global-search value="${searchValue}" placeholder="Search catalogue…" aria-label="Search institutional catalogue"></div><button class="mobileCartButton" data-basket>Cart <b>${basketQty()}</b></button></div>`:''}
        ${!admin&&isDemoAccount()?`<div class="demoAccountBanner"><b>DEMO ACCOUNT</b><span>Sample institutional data · Explore freely · Actions are simulated and reset on refresh.</span></div>`:''}
        <div class="contentWrap v7ContentWrap">${content}</div>
      </main>
      ${ui.basket?basketDrawer():''}
      ${ui.modal?modalHtml(ui.modal):''}
    </div>`;
  }


  const publicNav=[
    ['who-we-supply','Who We Supply'],
    ['what-we-supply','What We Supply'],
    ['how-it-works','How It Works'],
    ['catalogue','Institutional Catalogue'],
    ['contact','Contact / Request Supply']
  ];
  function publicHeader(active='home'){
    return `<header class="publicHeader v37PublicHeader">
      <button class="publicLogo" data-go="home" aria-label="Pharma Service home"><img src="${PSC_LOGO}" alt="Pharma Service"></button>
      <button class="publicMenuButton" data-public-menu aria-label="Open website menu" aria-expanded="${ui.publicMenu?'true':'false'}">${ui.publicMenu?icon('close'):icon('menu')}</button>
      <nav class="publicNav ${ui.publicMenu?'open':''}">${publicNav.map(([r,l])=>`<button class="publicNavLink ${active===r?'active':''}" data-go="${r}">${l}</button>`).join('')}</nav>
      <button class="button primary publicPortalBtn" data-go="login">Clinic Portal →</button>
    </header>`;
  }
  function publicFooter(){ return `<footer class="publicFooter v37PublicFooter"><div><img src="${PSC_LOGO}" alt="Pharma Service"><p>Institutional healthcare supply with one accountable Pharma Service relationship.</p></div><div class="publicFooterLinks"><button data-go="about">About</button><button data-go="careers">Careers</button><button data-go="media">Media & resources</button></div><div><span>Dubai, United Arab Emirates</span><a href="tel:+97143377004">+971 4 337 7004</a><a href="mailto:info@pharmaservice.ae">info@pharmaservice.ae</a></div></footer>`; }
  function publicPage(active,kicker,title,lead,body){ return `<main class="publicPage">${publicHeader(active)}<section class="publicPageHero"><span class="kicker">${kicker}</span><h1>${title}</h1><p>${lead}</p></section>${body}${publicFooter()}</main>`; }


  function landing(){
    const approved=products().filter(p=>p.schoolApproved).length;
    return `<main class="landingPage publicLanding">
      ${publicHeader('home')}
      <section class="landingHero">
        <div class="landingCopy">
          <h1 class="institutionalHero"><span>${esc(C.home?.heroTitlePrefix || 'Institutional')}</span><em>${esc(C.home?.heroTitleAccent || 'Supply')}</em></h1>
          <p class="lead heroStatement"><span>${esc(C.home?.heroLine1 || 'Easy procurement.')} <em>${esc(C.home?.heroLine1Accent || 'Institutional pricing.')}</em></span><strong>${esc(C.home?.heroLine2 || 'More time for what matters')}</strong></p>
          <div class="landingActions"><button class="button primary large" data-go="login">Open Clinic Portal →</button><button class="button outline large demoCta" data-go="demo">Take guided demo <span class="playDot">▶</span></button></div>
        </div>
        <div class="procurementHeroCard" aria-label="Clinic procurement workflow">
          <div class="procurementCardTop">
            <div class="procurementCardHeadline">
              <span>Consumer health products catered to institutions and organizations.</span>
            </div>
            <img class="procurementQr" src="./assets/pharmaservice-qr.png" alt="QR code to pharmaservice.ae">
          </div>
          <div class="procurementFlowPanel">
            <div class="procurementStageGrid">
              <article class="procurementStage">
                <span class="stageNumber">01</span>
                <h4>SHOP</h4>
                <p>pharmaceuticals,<br>medical disposables,<br>and devices.</p>
              </article>
              <article class="procurementStage">
                <span class="stageNumber">02</span>
                <h4>QUOTE</h4>
                <p>institutional pricing,<br>with supply-route and<br>requirement checks.</p>
              </article>
              <article class="procurementStage">
                <span class="stageNumber">03</span>
                <h4>MANAGE</h4>
                <p>orders, invoices, and<br>various historical reports.</p>
              </article>
              <article class="procurementStage">
                <span class="stageNumber">04</span>
                <h4>REPEAT</h4>
                <p>easily repeat previously<br>ordered items from the<br>same account.</p>
              </article>
            </div>
          </div>
          <div class="procurementBarcode" aria-hidden="true"></div>
          <div class="procurementFoot">PHARMA SERVICE <i>•</i> INSTITUTIONAL SUPPLY</div>
        </div>
      </section>
      <section class="beliefSection operationsBelief"><div class="beliefRule"></div><div class="beliefGrid"><div><span class="kicker">WHY THIS EXISTS</span><h2>Unlike individuals, institutions have structured, recurring and cost-sensitive healthcare needs.</h2></div><div><p>Pharma Service exists to make those needs easier to manage. This includes identifying what is required, sourcing each line intelligently, consolidating supply through one accountable partner, and staying ahead of replenishment, replacement and changing requirements.</p><p class="beliefStrong">Our mission is to help institutions spend better, stay reliably supplied, and make healthcare procurement simpler.</p></div></div></section>
      <section class="publicProofSection">
        <div class="publicProofHead"><span class="kicker">HOW WE CONTROL THE WORK</span><h2>Procurement discipline before marketing promises.</h2><p>Pharma Service is building the institutional service around documented requirements, comparable sourcing, clear commercial evidence and accountable follow-through.</p></div>
        <div class="publicProofGrid">
          <article><span>01</span><b>Requirement-led specification</b><p>We separate the institution's requirement from the exact commercial product offered.</p></article>
          <article><span>02</span><b>Source per line</b><p>Products can come from different suitable suppliers while the customer keeps one commercial relationship.</p></article>
          <article><span>03</span><b>Licensed-route discipline</b><p>Regulated products and specialist services remain subject to the appropriate UAE supply route and professional controls.</p></article>
          <article><span>04</span><b>Account history</b><p>Quotations, decisions, deliveries and repeat requirements stay tied to the institutional account.</p></article>
        </div>
      </section>
      <section class="publicClinicalPreview">
        <div class="publicClinicalPreviewHead">
          <div>
            <span class="kicker">BROWSE BY CLINICAL NEED</span>
            <h2>Find products the way healthcare teams actually think.</h2>
            <p>Start with the clinical need, then move directly into the relevant medicines, consumables, devices and equipment.</p>
          </div>
          <button class="textAction" data-go="catalogue">Explore catalogue →</button>
        </div>

        <div class="publicClinicalPreviewGrid">
          <button class="publicClinicalCard coral" data-go="catalogue/wounds">
            <span>Cuts &amp; Wounds</span>
            <small>Dressings, antiseptics, gauze, closure and wound protection</small>
          </button>

          <button class="publicClinicalCard blue" data-go="catalogue/breathing">
            <span>Breathing &amp; Oxygen</span>
            <small>Nebulisation, oxygen delivery, airway and respiratory support</small>
          </button>

          <button class="publicClinicalCard orange" data-go="catalogue/vitals">
            <span>Vitals &amp; Assessment</span>
            <small>Blood pressure, temperature, oximetry and clinical assessment</small>
          </button>

          <button class="publicClinicalCard mint" data-go="catalogue/infection">
            <span>Infection Control &amp; PPE</span>
            <small>PPE, hand hygiene, disinfection and waste control</small>
          </button>

          <button class="publicClinicalCard rose" data-go="catalogue/emergency">
            <span>Emergency &amp; Response</span>
            <small>Resuscitation, first response and urgent-use products</small>
          </button>

          <button class="publicClinicalCard sand" data-go="catalogue/equipment">
            <span>Equipment &amp; Mobility</span>
            <small>Clinical furniture, mobility, storage and capital equipment</small>
          </button>
        </div>

        <div class="publicClinicalPreviewFoot">
          <span>Plus medicines &amp; symptoms, diabetes &amp; testing, procedures &amp; consumables, allergy &amp; skin, patient care, screening and more.</span>
          <button class="button primary semanticPrimary" data-go="catalogue">Open Institutional Catalogue →</button>
        </div>
      </section>
      <section class="demoTeaser"><div><span class="kicker">SEE HOW IT WORKS</span><h2>Take a guided tour of Pharma Service.</h2><p>See the institutional customer journey from product selection and quotation through order management, delivery and repeat purchasing.</p></div><button class="button dark large semanticPrimary" data-go="demo">Take guided tour →</button></section>
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
      request:`<div class="demoMachine requestMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>Supply Request</b></div><div class="requestDemoLines"><div><i>01</i><span><b>Sterile Gauze</b><small>100 swabs</small></span><strong>6</strong></div><div><i>02</i><span><b>Sterile Saline</b><small>2.5 ml</small></span><strong>10</strong></div><div class="customDemo"><span>Can’t find it?</span><b>Paediatric nebulizer masks…</b><em>Custom request</em></div></div><button class="demoSubmit">Place order for review <span>→</span></button></div>`,
      control:`<div class="demoMachine controlMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>PSC Review</b></div><div class="controlTrack"><span class="trackLine"></span><div class="trackDot done">✓<small>SPEC</small></div><div class="trackDot done">✓<small>SOURCE</small></div><div class="trackDot active">●<small>ROUTE</small></div><div class="trackDot">4<small>QUOTE</small></div></div><div class="controlCards"><article><span>PRODUCT</span><b>Exact specification</b><small>Matched to controlled line</small></article><article><span>SUPPLY</span><b>Current evidence</b><small>Price / stock checked</small></article><article><span>ROUTE</span><b>Appropriate channel</b><small>Validated before commitment</small></article></div></div>`,
      delivery:`<div class="demoMachine deliveryMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>Order & Quotation</b></div><div class="quoteDemo"><div><span>PSC-Q-2026-1042</span><b>Quotation ready</b><small>Sent to registered account email</small></div><div class="quoteActions"><button>Cancel</button><button class="confirm">Confirm quote</button></div></div><div class="deliveryTrack"><div class="deliveryVan">▰</div><span></span><div class="deliveryPin">✓</div></div><div class="deliveryPromiseDemo"><small>NEXT</small><b>Delivery timing confirmed by PSC</b></div></div>`,
      repeat:`<div class="demoMachine repeatMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>Replenish</b></div><div class="repeatCards"><article><div class="repeatThumb">GAUZE</div><div><span>Previously delivered</span><b>Sterile Gauze</b><small>Last qty · 6</small></div><button>Replenish 6 →</button></article><article><div class="repeatThumb saline">NaCl</div><div><span>Previously delivered</span><b>Sterile Saline</b><small>Last qty · 10</small></div><button>Replenish 10 →</button></article></div><div class="repeatLoop">↻ <span>Order history becomes the next order shortcut.</span></div></div>`
    }[st.visual];
    return `<main class="publicPage publicDemoPage">${publicHeader('')}<section class="demoPublicHero"><div><span class="kicker">GUIDED DEMONSTRATION</span><h1>See the supply relationship<br>work from end to end.</h1><p>See how Pharma Service takes an institutional customer from product selection and quotation through order management, delivery and repeat purchasing — while keeping the sourcing complexity behind the scenes.</p></div><div class="demoHeroFlow"><div><b>01</b><span>SELECT</span></div><i></i><div><b>02</b><span>REQUEST</span></div><i></i><div><b>03</b><span>CONTROL</span></div><i></i><div><b>04</b><span>DELIVER</span></div><i></i><div><b>05</b><span>REPEAT</span></div><span class="flowRunner"></span></div></section><section class="publicDemoBody"><div class="publicDemoStepper">${steps.map((x,j)=>`<button class="demoStepButton ${j===i?'active':j<i?'done':''}" data-tour-jump="${j}"><span>${x.n}</span><b>${x.label}</b></button>`).join('')}</div><div class="publicDemoStage"><div class="publicDemoCopy"><span class="kicker">${st.label}</span><h2>${st.title}</h2><p>${st.text}</p><div class="demoOutcome"><span>WHAT THIS ACHIEVES</span><b>${st.outcome}</b></div><div class="tourNav"><button class="button outline" data-tour-prev ${i===0?'disabled':''}>← Previous</button>${i<steps.length-1?'<button class="button primary" data-tour-next>Next →</button>':'<button class="button primary" data-go="login">Open Clinic Portal →</button>'}</div></div><div class="publicDemoVisual">${visual}</div></div><div class="demoDisclosure"><b>Demonstration scope</b><span>The animation illustrates the live customer workflow and planned presentation layer. Actual products, prices, availability, regulatory route and delivery dates remain account- and transaction-specific.</span></div></section>${publicFooter()}</main>`;
  }


  function aboutPage(){ return publicPage('about','ABOUT PHARMA SERVICE','Built for accountable healthcare supply.','Pharma Service Co. L.L.C. is a UAE healthcare supplier focused on helping institutions source, organize and receive the products they need through one accountable commercial relationship.',`<section class="publicSection twoPublicCols"><div><span class="kicker">OUR ROLE</span><h2>Source per line. Deliver one solution.</h2><p>Institutions should not need to coordinate a different supplier for every requirement. Pharma Service combines category-specific sourcing with one commercial and operating point of accountability.</p></div><div class="publicFeatureStack"><article><b>Institutional supply</b><p>School clinics, healthcare facilities and institutional accounts.</p></article><article><b>Controlled specifications</b><p>Product selection is mapped to the relevant requirement and confirmed before commitment.</p></article><article><b>Recurring account service</b><p>Order history, replenishment and consistent follow-through over time.</p></article></div></section>`); }

  function servicesPage(){ return publicPage('services','SERVICES','Clinic procurement, made easier.','Pharma Service makes it easy for institutional customers to shop, request quotations, manage orders, repeat previous purchases and optimize procurement costs across pharmaceuticals, medical disposables and medical equipment.',`<section class="publicSection twoPublicCols"><div><span class="kicker">PROCUREMENT COST CONTROL</span><h2>Buy through the right supply channel, not the retail shelf.</h2><p>Pharma Service sources through suitable wholesale and specialist suppliers, then consolidates the commercial process for the institutional customer. The objective is straightforward: optimize procurement costs across pharmaceuticals, medical disposables and medical equipment without pushing sourcing complexity onto the clinic team.</p></div><div class="publicFeatureStack"><article><b>Shop & request</b><p>Browse controlled institutional lines or submit a custom sourcing request.</p></article><article><b>Quote & manage</b><p>Receive the formal quotation, confirm the order and keep the transaction history attached to the account.</p></article><article><b>Repeat efficiently</b><p>Reorder previously supplied items without restarting the procurement process from zero.</p></article></div></section><section class="publicSection procurementFlow"><article><b>SHOP</b><span>01</span><p>Browse the Pharma Service institutional product master.</p></article><article><b>QUOTE</b><span>02</span><p>PSC sources, reviews and sends the formal quotation.</p></article><article><b>MANAGE</b><span>03</span><p>Confirm, cancel or follow the order from the account.</p></article><article><b>REPEAT</b><span>04</span><p>Repeat previously supplied items from the same account history.</p></article></section><section class="publicCta"><div><span class="kicker">SEE IT WORK</span><h2>Take a guided tour of Pharma Service.</h2></div><div class="publicCtaActions"><button class="button outline large" data-go="demo">Take guided tour</button><button class="button primary large" data-go="login">Open Clinic Portal →</button></div></section>`); }


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
    <section class="publicCta"><div><span class="kicker">YOUR REQUIREMENT</span><h2>Tell us what the institution needs, not what shelf to shop.</h2></div><button class="button primary large" data-go="contact">Request supply →</button></section>`
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
    <section class="publicCta"><div><span class="kicker">BROWSE</span><h2>See the institutional product master without logging in.</h2></div><button class="button primary large" data-go="catalogue">Open catalogue →</button></section>`
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

  function publicCatalogueCard(p){
    const need=clinicalNeedMeta(clinicalNeedIds(p)[0]||'all');
    const displayName=p.catalogueDisplayName||p.name;
    const pack=p.cataloguePack||p.pack||'Pack / unit to confirm';
    const imageUrl=productDisplayImageUrl(p);
    return `<article class="publicCatalogueCard">
      <div class="publicCatalogueVisual" style="--need-bg:${need.bg};--need-ink:${need.ink}">${imageUrl?`<img src="${esc(imageUrl)}" alt="${esc(displayName)}" loading="lazy">`:`<span>${esc(need.label)}</span>`}${p.dhaMapped?`<img class="publicDhaMark" src="${DHA_ICON}" alt="DHA requirement mapping">`:''}</div>
      <div class="publicCatalogueBody"><small>${esc(need.label)}</small><h3>${esc(displayName)}</h3><p>${esc(pack)}</p>${p.pscOfferedSpecification?`<div class="publicSpec">${esc(p.pscOfferedSpecification)}</div>`:''}${p.dhaMapped?'<div class="publicMappingNote">Mapped to the applicable DHA clinic requirement.</div>':''}</div>
      <button class="button outline full" data-go="contact">Request institutional quote →</button>
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
      <section class="publicSection publicCatalogueResults"><div class="publicCatalogueCount"><b>${filtered.length}</b><span>published institutional lines</span></div>${filtered.length?`<div class="publicCatalogueGrid">${filtered.map(publicCatalogueCard).join('')}</div>`:'<div class="emptyState"><h3>No matching published lines</h3><p>Try another clinical need or send the requirement to Pharma Service.</p><button class="button primary" data-go="contact">Request sourcing →</button></div>'}</section>
      <section class="publicCta"><div><span class="kicker">ACCOUNT PRICING</span><h2>Need a quotation or customer-specific product list?</h2></div><div class="publicCtaActions"><button class="button outline large" data-go="contact">Request supply</button><button class="button primary large" data-go="login">Open Clinic Portal →</button></div></section>
      ${publicFooter()}
    </main>`;
  }

  function careersPage(){ return publicPage('careers','CAREERS','Build practical healthcare supply with us.','We are interested in people who value accuracy, follow-through and institutional customer service.',`<section class="publicSection simplePublicPanel"><h2>Current opportunities</h2><p>Roles will be posted here as the institutional-supply business expands. For now, career enquiries can be directed through the Contact page.</p><button class="button outline" data-go="contact">Contact Pharma Service →</button></section>`); }

  function mediaPage(){ return publicPage('media','MEDIA','Updates, resources and institutional supply notes.','A public space for Pharma Service company updates and practical institutional healthcare-supply resources.',`<section class="publicSection publicMediaGrid"><article><span>SCHOOL CLINICS</span><h3>Building a cleaner replenishment process</h3><p>Why repeat ordering should get easier after the first completed supply cycle.</p></article><article><span>PRODUCT CONTROL</span><h3>Requirement-mapped specifications</h3><p>How PSC separates regulatory requirements from exact commercial product specifications.</p></article><article><span>PSC UPDATE</span><h3>Institutional Supply Portal</h3><p>The first MVP brings ordering, quotations and replenishment into one customer account.</p></article></section>`); }

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
      <div class="contactCard"><span>CLINIC PORTAL</span><button class="button primary" data-go="login">Open account access →</button></div>
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

  function loginPage(){ return `<main class="publicPage loginPublicPage v26LoginPage">${publicHeader('')}<section class="loginWrap v26LoginWrap"><div class="loginIntro v26LoginIntro"><span class="kicker">CLINIC PORTAL ACCESS</span><h1>Institutional procurement,<br>connected.</h1><p>Shop the catalogue, review quotations, track orders and repeat previously supplied items through one secure Pharma Service account.</p><div class="v26LoginFlow"><span>Source</span><span>Quote</span><span>Supply</span><span>Repeat</span></div><div class="loginSupport">Need access? <button data-go="contact">Contact Pharma Service</button> <span>·</span> <button data-go="demo">View guided demo</button></div></div><div class="loginCard v26LoginCard"><img src="${PSC_LOGO}" alt="Pharma Service"><span class="loginLabel">ACCOUNT ACCESS</span><h2>Clinic Portal</h2><label>Email</label><input class="input" id="mvpLoginEmail" type="email" autocomplete="email" placeholder="name@organization.ae"><label>Password</label><input class="input" id="mvpLoginPassword" type="password" autocomplete="current-password" placeholder="••••••••"><button class="button primary full" data-mvp-login>Continue to Clinic Portal →</button><p class="loginNote">Your organization and account permissions are determined automatically after sign-in.</p></div></section>${publicFooter()}</main>`; }

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
      <section class="tourStage tourStageV7"><div class="tourNarrative"><span class="kicker">${st.label}</span><h2>${st.title}</h2><p>${st.text}</p><div class="demoOutcome"><span>What the school understands</span><b>${st.outcome}</b></div><div class="demoTalkTrack"><span>Suggested presenter line</span><strong>${talkTracks[i]}</strong></div><div class="tourNav"><button class="button outline" data-tour-prev ${i===0?'disabled':''}>← Previous</button>${i<steps.length-1?'<button class="button primary" data-tour-next>Next →</button>':'<button class="button primary" data-go="portal/insights">Open full report →</button>'}</div></div><div class="tourVisual tourVisualV7">${visual}</div></section>
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
    const needCards=INSTITUTIONAL_CATALOGUE_TEMPLATE.categories.map(c=>`<button class="clinicNeedCard" style="--need-bg:${c.bg};--need-ink:${c.ink}" data-go="portal/catalogue/${c.id}">
        <span class="clinicNeedIcon">${clinicalNeedIcon(c.icon)}</span>
        <span class="clinicNeedCopy"><b>${esc(c.label)}</b><small>${esc(c.note)}</small></span>
        <span class="clinicNeedArrow">↗</span>
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
    const fallback=p.fallbackAsset||'./assets/products/clinic-basics.jpg';
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
    return shell(`<div class="pageHeader customerSimpleHeader"><div><span class="eyebrow">PREVIOUSLY DELIVERED</span><h1>Replenish</h1><p>Repeat products already supplied to this clinic. Consumables can go straight to cart; capital equipment can be requested again for PSC review.</p></div><button class="button dark" data-basket>Open cart</button></div>${body}`);
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
    const q=calcQuote(r), label=friendlyStatus(r.status), p=r.lines[0]?product(r.lines[0].sku):null, extra=Math.max(0,r.lines.length-1);
    const delivery=['Authorized','Procurement','Delivery'].includes(r.status)?expectedDeliveryLabel(r):'';
    const archiveDate=r.status==='Cancelled'&&r.cancelledAt?addDaysLabel(r.cancelledAt,30):'';
    return `<article class="customerOrderCard statusCard-${r.status.toLowerCase()}"><div class="orderCardHead"><div><span class="eyebrow">${esc(r.quoteRef||'ORDER UNDER REVIEW')}</span><h3 class="mono">${r.id}</h3><p>${date(r.createdAt)} · ${r.lines.length} lines</p></div>${customerStatusPill(r.status)}</div><div class="orderCardProduct"><div><b>${p?`${r.lines[0].qty} × ${esc(p.name)}`:'Order items'}</b>${extra?`<span>+ ${extra} more line${extra>1?'s':''}</span>`:''}</div>${q.hasSell&&r.quoteRef?`<strong>${money(q.total)}</strong>`:''}</div>${r.status==='Drafting'?`<div class="orderMessage">Under review. Your quotation will be sent to <strong>${esc(accountEmailLabel())}</strong>.</div>`:''}${r.status==='Sent'?`<div class="orderMessage quoteReady">Quotation sent to <strong>${esc(accountEmailLabel())}</strong>. Confirm or cancel below.</div>`:''}${delivery?`<div class="deliveryPromise"><span>TRACK</span><b>${delivery}</b></div>`:''}${r.status==='Accepted'?`<div class="orderMessage deliveredMsg">Delivered ${date(r.deliveredAt||r.createdAt)}. These items are now available on Replenish.</div>`:''}${r.status==='Cancelled'?`<div class="orderMessage cancelledMsg">Cancelled. This will move to Archive after ${archiveDate}.</div>`:''}<div class="orderCardActions"><button class="button light small" data-request-view="${r.id}">View</button>${r.status==='Sent'?`<button class="button primary small" data-confirm-quote="${r.id}">Confirm quote</button><button class="button quietDanger small" data-cancel-quote="${r.id}">Cancel</button>`:''}${['Authorized','Procurement','Delivery'].includes(r.status)?`<button class="button dark small" data-request-view="${r.id}">Track</button>`:''}${r.status==='Accepted'?`<button class="button dark small" data-reorder-order="${r.id}">Replenish order</button>`:''}</div></article>`;
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

  function basketQty(){ return state.basket.reduce((a,b)=>a+b.qty,0); }
  function addBasket(sku,qty=1){ const f=state.basket.find(x=>x.sku===sku); if(f)f.qty+=qty; else state.basket.push({sku,qty}); save(); render(); toast(`<strong>Added</strong> to Supply Request`); }
  function reorderRequest(id){ const r=state.requests.find(x=>x.id===id); if(!r)return; r.lines.forEach(l=>{const f=state.basket.find(x=>x.sku===l.sku);if(f)f.qty+=l.qty;else state.basket.push({...l})});save();render();toast(`<strong>${r.lines.length} lines</strong> added to Supply Request`); }
  function basketDrawer(){
    const lines=state.basket.map(l=>({l,p:product(l.sku)})).filter(x=>x.p);
    const indicative=lines.reduce((s,x)=>s+(x.p.contractPrice||0)*x.l.qty,0);
    return `<div class="drawerBackdrop" data-close-basket><aside class="drawer" onclick="event.stopPropagation()"><div class="drawerHeader"><div><span class="eyebrow">PHARMA SERVICE</span><h2>Your Cart</h2></div><button class="iconBtn" data-close-basket>×</button></div><div class="drawerBody">${lines.length?lines.map(({l,p})=>`<div class="basketLine"><div class="productGlyph small">${esc(p.brand.slice(0,2).toUpperCase())}</div><div class="basketInfo"><b>${esc(p.name)}</b><span>${esc(p.pack)} · ${p.pscSku}</span><small>${p.contractPrice?money(p.contractPrice)+' indicative account price':'Price confirmed in quotation'}</small></div><div class="qty"><button data-basket-delta="${p.pscSku}|-1">−</button><span>${l.qty}</span><button data-basket-delta="${p.pscSku}|1">+</button></div><button class="removeLink" data-basket-remove="${p.pscSku}">Remove</button></div>`).join(''):`<div class="emptyState"><div style="font-size:30px">▣</div><h3>Your cart is empty</h3><p>Add school-clinic items from Shop or Replenish.</p></div>`}</div>${lines.length?`<div class="drawerFooter"><label class="fieldLabel">Order note <span>optional</span></label><textarea class="textarea" id="basketNote" placeholder="Delivery timing or clinic note…"></textarea><div class="totals"><span>Indicative priced lines</span><b>${money(indicative)}</b></div><div class="checkoutPromise"><span>AFTER YOU PLACE THE ORDER</span><p>PSC reviews the order and sends the formal quotation to <strong>${esc(accountEmailLabel())}</strong>. The order only moves forward after the quotation is confirmed.</p></div><button class="button primary full" data-submit-request>Place order</button></div>`:''}</aside></div>`;
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
    const rows=r.lines.map(l=>{const p=product(l.sku);const q=(r.quote&&r.quote.lines&&r.quote.lines[l.sku])||{};const sell=Number.isFinite(Number(q.sell))?Number(q.sell):(Number.isFinite(Number(p?.contractPrice))?Number(p.contractPrice):null);const c=Number.isFinite(Number(q.cost))?Number(q.cost):(Number.isFinite(Number(p?.supplierCost))?Number(p.supplierCost):null);const vr=q.vat===0||q.vat===5?Number(q.vat):null;if(sell===null)hasSell=false;else subtotal+=sell*l.qty;if(c===null)costComplete=false;else cost+=c*l.qty;if(vr===null){taxResolved=false}else if(sell!==null){vat += sell*l.qty*vr/100;}return {l,p,q,sell,cost:c,vatRate:vr};});
    const gp=hasSell&&costComplete?subtotal-cost:null;const gm=gp!==null&&subtotal>0?gp/subtotal*100:null;
    return {rows,subtotal,cost,vat,total:subtotal+vat,gp,gm,hasSell,costComplete,taxResolved};
  }

  function schoolQuote(r,q,canApprove){
    const delivery=['Authorized','Procurement','Delivery'].includes(r.status)?expectedDeliveryLabel(r):'';
    return `<div class="schoolQuoteBox"><div class="quoteCustomerTop"><div><span class="eyebrow">${r.quoteRef||'ORDER UNDER REVIEW'}</span><h3>${friendlyStatus(r.status)}</h3></div>${customerStatusPill(r.status)}</div>${r.status==='Drafting'?`<div class="quoteStatePanel"><b>PSC is reviewing this order.</b><p>Your formal quotation will be sent to ${esc(accountEmailLabel())}.</p></div>`:''}${r.quoteRef?`<div class="tableWrap"><table class="dataTable"><thead><tr><th>ITEM</th><th>PACK</th><th>QTY</th><th>UNIT EX VAT</th><th>LINE EX VAT</th><th>VAT</th></tr></thead><tbody>${q.rows.map(x=>`<tr><td><b>${esc(x.p?.name||x.l.sku)}</b><div class="sub mono">${x.l.sku}</div></td><td>${esc(x.p?.pack||'')}</td><td>${x.l.qty}</td><td>${x.sell!==null?money(x.sell):'Pending'}</td><td>${x.sell!==null?money(x.sell*x.l.qty):'Pending'}</td><td>${x.vatRate===null?'Review':x.vatRate+'%'}</td></tr>`).join('')}</tbody></table></div><div class="quoteSummary"><div><span>SUBTOTAL EX VAT</span><b>${q.hasSell?money(q.subtotal):'Pending'}</b></div><div><span>VAT</span><b>${q.taxResolved?money(q.vat):'Review'}</b></div><div><span>TOTAL</span><b>${q.hasSell&&q.taxResolved?money(q.total):'Pending'}</b></div><div><span>VALIDITY</span><b>${esc(r.quote?.validity||'Pending')}</b></div></div>`:''}${r.status==='Sent'?`<div class="modalQuoteActions"><button class="button primary" data-confirm-quote="${r.id}">Confirm quotation</button><button class="button quietDanger" data-cancel-quote="${r.id}">Cancel quotation</button></div>`:''}${delivery?`<div class="deliveryPromise large"><span>TRACK ORDER</span><b>${delivery}</b><small>Delivery timing is shown only when PSC has recorded it for this order.</small></div>`:''}${r.status==='Accepted'?`<div class="quoteStatePanel delivered"><b>Delivered.</b><p>This order is now part of your purchase history and its items can be repeated from Replenish.</p></div>`:''}${r.status==='Cancelled'?`<div class="quoteStatePanel cancelled"><b>Cancelled.</b><p>${isArchived(r)?'This quotation is now in Archive.':`It will move to Archive on ${addDaysLabel(r.cancelledAt||r.createdAt,30)}.`}</p></div>`:''}</div>`;
  }

  function adminQuoteBuilder(r,q){
    const target=20;
    return `<div class="notice"><strong>Quote builder.</strong> Supplier cost and tax must be supported by current evidence before live issue. Values labelled “Demo planning assumption” are not supplier quotations.</div><div class="tableWrap"><table class="dataTable"><thead><tr><th>ITEM</th><th>QTY</th><th>DIRECT COST / UNIT</th><th>SELL / UNIT</th><th>VAT</th><th>LINE GM</th></tr></thead><tbody>${q.rows.map(x=>{const gm=x.sell!==null&&x.cost!==null&&x.sell>0?((x.sell-x.cost)/x.sell*100):null;return `<tr><td><b>${esc(x.p?.name||x.l.sku)}</b><div class="sub mono">${x.l.sku}</div>${x.q.costEvidence?`<div class="quoteLineWarning">${esc(x.q.costEvidence)}</div>`:''}</td><td>${x.l.qty}</td><td><input class="moneyInput" type="number" step="0.01" value="${x.cost===null?'':x.cost}" data-quote-field="${r.id}|${x.l.sku}|cost"></td><td><input class="moneyInput" type="number" step="0.01" value="${x.sell===null?'':x.sell}" data-quote-field="${r.id}|${x.l.sku}|sell"></td><td><select class="selectInput" data-quote-field="${r.id}|${x.l.sku}|vat"><option value="" ${x.vatRate===null?'selected':''}>Review</option><option value="0" ${x.vatRate===0?'selected':''}>0%</option><option value="5" ${x.vatRate===5?'selected':''}>5%</option></select></td><td>${gm===null?'—':`<b class="${gm<target?'dangerText':'successText'}">${gm.toFixed(1)}%</b>`}</td></tr>`}).join('')}</tbody></table></div><div class="quoteSummary"><div><span>DIRECT COST</span><b>${q.costComplete?money(q.cost):'Incomplete'}</b></div><div><span>SELL EX VAT</span><b>${q.hasSell?money(q.subtotal):'Incomplete'}</b></div><div><span>GROSS PROFIT</span><b>${q.gp===null?'Blocked':money(q.gp)}</b></div><div><span>TRUE GM</span><b class="${q.gm!==null&&q.gm<target?'dangerText':''}">${q.gm===null?'Blocked':q.gm.toFixed(1)+'%'}</b></div></div><div class="twoCol"><div><label class="fieldLabel">Delivery</label><input class="input" style="width:100%" value="${esc(r.quote?.delivery||'')}" data-quote-meta="${r.id}|delivery"><label class="fieldLabel" style="margin-top:10px">Terms</label><input class="input" style="width:100%" value="${esc(r.quote?.terms||'')}" data-quote-meta="${r.id}|terms"></div><div><label class="fieldLabel">Quotation status</label><select class="input" style="width:100%" data-request-status="${r.id}">${workflow.map(s=>`<option ${r.status===s?'selected':''}>${s}</option>`).join('')}</select><label class="fieldLabel" style="margin-top:10px">Quotation reference</label><input class="input" style="width:100%" value="${esc(r.quoteRef||'')}" data-quote-ref="${r.id}" placeholder="PSC-Q-YYYY-####"></div></div><div class="gateList" style="margin-top:16px"><div class="gate ${q.costComplete?'ok':'block'}"><span>All direct costs present</span><i></i></div><div class="gate ${q.taxResolved?'ok':'block'}"><span>VAT reviewed by line</span><i></i></div><div class="gate ${q.gm!==null&&q.gm>=20?'ok':'warn'}"><span>Target GM ≥ 20%</span><i></i></div><div class="gate warn"><span>Supplier stock / lead time requires current confirmation</span><i></i></div><div class="gate ${q.rows.some(x=>x.p?.regulated)?'warn':'ok'}"><span>Regulated route check</span><i></i></div><div class="gate block"><span>Funding / customer PO evidence not integrated in prototype</span><i></i></div></div>`;
  }

  function adminDashboard(){
    const open=state.requests.filter(r=>!['Accepted','Cancelled'].includes(r.status)).length;
    const activeQuotes=state.requests.filter(r=>['Sent','Authorized','Procurement','Delivery'].includes(r.status));
    const qvals=activeQuotes.map(calcQuote);const quoted=qvals.reduce((s,q)=>s+(q.hasSell?q.subtotal:0),0);const gp=qvals.reduce((s,q)=>s+(q.gp||0),0);const gm=quoted?gp/quoted*100:0;
    return shell(`<div class="pageHeader"><div><span class="eyebrow">PSC DEAL DESK</span><h1>Institutional supply control</h1><p>One desk for requests, quote economics, supplier evidence, release gates and fulfilment. Demo figures are illustrative unless backed by an identified evidence source.</p></div></div><div class="adminStatRow"><div class="adminStat"><span>OPEN REQUESTS</span><b>${open}</b></div><div class="adminStat"><span>QUOTED EX VAT</span><b>${money(quoted)}</b></div><div class="adminStat"><span>AUTHORIZED</span><b>${state.requests.filter(r=>r.status==='Authorized').length}</b></div><div class="adminStat"><span>EST. TRUE GP</span><b>${money(gp)}</b></div><div class="adminStat"><span>EST. GM</span><b>${gm.toFixed(1)}%</b></div><div class="adminStat"><span>PRODUCT MASTER</span><b>${cms.products.filter(p=>p.active).length||D.products.length}</b></div></div><div class="actionGrid"><button class="actionCard" data-go="admin/requests"><div class="actionIcon">${icon('checklist')}</div><div><b>Request queue</b><span>Convert needs into controlled quotes</span></div></button><button class="actionCard" data-go="admin/storefront"><div class="actionIcon">${icon('edit')}</div><div><b>Storefront manager</b><span>Institutional + wholesale publishing</span></div></button><button class="actionCard" data-go="admin/products"><div class="actionIcon">${icon('boxes')}</div><div><b>Product master</b><span>Product, media and commercial control</span></div></button><button class="actionCard" data-go="admin/fulfilment"><div class="actionIcon">${icon('repeat')}</div><div><b>Fulfilment rules</b><span>Route by site and source</span></div></button><button class="actionCard" data-go="admin/supplier-feed"><div class="actionIcon">${icon('reports')}</div><div><b>Supplier feed</b><span>Acorus / Med7 data ingestion</span></div></button></div><div class="twoCol"><section class="panel"><div class="panelHeader"><h2>Requests needing attention</h2><button data-go="admin/requests">Open queue →</button></div><div class="tableWrap"><table class="dataTable"><thead><tr><th>REQUEST</th><th>ACCOUNT / SITE</th><th>LINES</th><th>STATUS</th><th>NEXT ACTION</th></tr></thead><tbody>${state.requests.filter(r=>r.status!=='Accepted').map(r=>`<tr class="clickable" data-admin-request="${r.id}"><td><b class="mono">${r.id}</b></td><td>${esc(r.groupName||state.groupName||'Institutional account')}<div class="sub">${esc(r.campus)}</div></td><td>${r.lines.length}</td><td>${statusPill(r.status)}</td><td>${r.status==='Drafting'?'Validate stock + price':r.status==='Sent'?'Resolve school decision':'Check procurement release'}</td></tr>`).join('')}</tbody></table></div></section><div style="display:grid;gap:14px"><div class="marginBox"><h3>Deal economics · active quoted demo</h3><div class="marginGrid"><div><span>DIRECT COST</span><b>${money(qvals.reduce((s,q)=>s+(q.costComplete?q.cost:0),0))}</b></div><div><span>SELL</span><b>${money(quoted)}</b></div><div><span>TRUE GM</span><b>${gm.toFixed(1)}%</b></div><div><span>FOC</span><b>AED 0</b></div><div><span>DELIVERY</span><b>Per quote</b></div><div><span>TARGET</span><b>20%</b></div></div></div><section class="panel"><div class="panelHeader"><h2>Release gate</h2></div><div class="gateList"><div class="gate ok"><span>Exact specification mapped</span><i></i></div><div class="gate warn"><span>Supplier stock current</span><i></i></div><div class="gate warn"><span>VAT / tax evidence by line</span><i></i></div><div class="gate ok"><span>Margin incl. direct costs</span><i></i></div><div class="gate block"><span>Customer funding / PO</span><i></i></div><div class="gate warn"><span>Regulated route validated</span><i></i></div></div></section></div></div><div class="notice" style="margin-top:18px"><strong>Control:</strong> a supplier PO is not released merely because a customer approved a quote. Funding, current supplier evidence, tax treatment, regulated route and delivery must pass the release gate.</div>`,true);
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
        ${preview.length?`<div class="cmsPreviewGrid">${preview.map(r=>`<article><div class="cmsPreviewImage">${r.image_url?`<img src="${esc(r.image_url)}" alt="">`:'<span>NO IMAGE</span>'}</div><small>${esc(r.brand||r.category||'')}</small><b>${esc(r.name)}</b><p>${esc(r.short_description||r.pack||'')}</p></article>`).join('')}</div>`:`<div class="emptyState"><h3>No published products yet</h3><p>${channel==='wholesale'?'Open Product Master, switch to Wholesale and publish the lines you want trade customers to see.':'The institutional catalogue will appear here after the current master is initialised.'}</p></div>`}
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
              <td><div class="cmsMasterProduct"><div class="cmsMasterThumb">${p.image_url?`<img src="${esc(p.image_url)}" alt="">`:'<span>—</span>'}</div><div><b>${esc(p.name)}</b><small>${esc(p.psc_sku)}${p.brand?` · ${esc(p.brand)}`:''}</small><em>${esc(p.category||p.product_type||'Uncategorised')}</em></div></div></td>
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

  function adminRequests(){
    return shell(`<div class="pageHeader"><div><span class="eyebrow">REQUEST → QUOTE → RELEASE</span><h1>Request queue</h1><p>Validate scope before pricing. Authorization advances the customer decision state; it does not automatically release procurement.</p></div></div><section class="panel"><div class="tableWrap"><table class="dataTable"><thead><tr><th>REQUEST</th><th>ACCOUNT / SITE</th><th>LINES</th><th>STATUS</th><th>QUOTE</th><th>ACTION</th></tr></thead><tbody>${state.requests.map(r=>{const q=calcQuote(r);return `<tr><td><b class="mono">${r.id}</b><div class="sub">${date(r.createdAt)}</div></td><td>${esc(r.groupName||state.groupName||'Institutional account')}<div class="sub">${esc(r.campus)}</div></td><td>${r.lines.length}</td><td>${statusPill(r.status)}</td><td>${r.quoteRef?`<b>${esc(r.quoteRef)}</b>`:'Pending'}<div class="sub">${q.hasSell?money(q.subtotal)+' ex VAT':'Pricing incomplete'}</div></td><td><button class="button dark" data-admin-request="${r.id}">Open builder</button></td></tr>`}).join('')}</tbody></table></div></section>`,true);
  }

  function adminFulfilment(){
    return shell(`<div class="pageHeader"><div><span class="eyebrow">SITE ROUTING</span><h1>Fulfilment rules</h1><p>Map each campus to a preferred source and backup. Geography helps, but stock, licensed route, terms and delivery capability determine the actual source.</p></div></div><div class="notice"><strong>Demo routing only.</strong> No real Med7 branch address is invented here. Replace partner hubs with Acorus/Med7-confirmed fulfilment locations, contacts and SLAs.</div><div class="threeCol">${D.campuses.map(c=>`<article class="fulfilCard"><div class="fulfilTop"><div><span class="eyebrow">${c.emirate.toUpperCase()}</span><h3>${esc(c.name)}</h3></div>${badge('Active','green')}</div><div class="routeLine"><span>Clinic code</span><b class="mono">${esc(c.clinicCode)}</b></div><div class="routeLine"><span>Preferred source</span><b>${esc(c.preferredSource)}</b></div><div class="routeLine"><span>Partner hub</span><b>${esc(c.hub)}</b></div><div class="routeLine"><span>Backup</span><b>${esc(c.backup)}</b></div><div class="routeLine"><span>SLA</span><b>${esc(c.sla)}</b></div></article>`).join('')}</div><section class="panel" style="margin-top:18px"><div class="panelHeader"><h2>Routing decision order</h2></div><div class="threeCol"><div><span class="eyebrow">01</span><h3 style="font-size:14px">Permitted route</h3><p class="smallMuted">Can the supplier and recipient lawfully transact the line?</p></div><div><span class="eyebrow">02</span><h3 style="font-size:14px">Stock + exact SKU</h3><p class="smallMuted">Current availability, model, pack, batch/expiry and substitute controls.</p></div><div><span class="eyebrow">03</span><h3 style="font-size:14px">Commercial fulfilment</h3><p class="smallMuted">Landed cost, terms, delivery window and backup source.</p></div></div></section>`,true);
  }

  function adminFeed(){
    return shell(`<div class="pageHeader"><div><span class="eyebrow">ACORUS / MED7 INTEGRATION</span><h1>Supplier feed</h1><p>The production portal should ingest a B2B supplier master rather than scrape a retail storefront. CSV, SFTP or API can all map into the same controlled PSC product master.</p></div></div><div class="feedDiagram"><div class="feedNode"><div style="font-size:23px;color:#ff5a1f">▤</div><h3>Acorus / Med7 source</h3><p>Supplier SKU, barcode, brand, pack, B2B cost, stock, batch/expiry, VAT evidence, product authorization, image/media permission.</p></div><div class="feedArrow">→</div><div class="feedNode"><div style="font-size:23px;color:#ff5a1f">▦</div><h3>PSC product master</h3><p>Map supplier records to PSC SKU, school-approved status, requirement status, backup source, margin rules and evidence date.</p></div><div class="feedArrow">→</div><div class="feedNode"><div style="font-size:23px;color:#ff5a1f">⌁</div><h3>School portal</h3><p>Expose only approved customer-facing fields. Never show internal supplier cost or routing logic to the clinic.</p></div></div><div class="twoCol"><section class="panel"><div class="panelHeader"><h2>Required feed fields</h2></div><div class="codeBlock">supplier_sku<br>barcode<br>brand<br>product_name<br>pack_size<br>category<br>b2b_unit_cost<br>vat_status_or_evidence<br>stock_qty_or_status<br>lead_time<br>batch_tracking_required<br>expiry_tracking_required<br>regulated_flag<br>registration_reference<br>image_url_or_asset_id<br>media_usage_permission<br>last_updated_at</div></section><section class="panel"><div class="panelHeader"><h2>Ingestion controls</h2></div><div class="gateList"><div class="gate ok"><span>Supplier SKU uniqueness</span><i></i></div><div class="gate ok"><span>Public benchmark kept separate</span><i></i></div><div class="gate warn"><span>Tax evidence expiry alert</span><i></i></div><div class="gate warn"><span>Product image permission</span><i></i></div><div class="gate block"><span>No silent substitute mapping</span><i></i></div><div class="gate ok"><span>Audit every manual cost change</span><i></i></div></div></section></div><div class="notice" style="margin-top:18px"><strong>Recommended commercial ask to Acorus:</strong> B2B price file + product master + live/periodic stock feed + permitted product media + agreed fulfilment rules. Once supplied, this page becomes the connector rather than a manual upload screen.</div>`,true);
  }

  function productModal(sku){
    const p=product(sku); if(!p)return '';
    const mapped=!!p.dhaMapped;
    const displayName=p.catalogueDisplayName||p.name;
    const pack=p.cataloguePack||p.pack||'Pack / unit to confirm';
    const needs=clinicalNeedIds(p);
    const primary=clinicalNeedMeta(needs[0]||'all');
    const fallback=p.fallbackAsset||'./assets/products/clinic-basics.jpg';
    const needTags=needs.map(id=>`<span class="modalNeedChip" style="--chip-bg:${clinicalNeedMeta(id).bg};--chip-ink:${clinicalNeedMeta(id).ink}">${esc(clinicalNeedMeta(id).label)}</span>`).join('');
    const detailDhaMark=mapped?`<img class="dhaRequirementIcon detailDhaIcon" src="${DHA_ICON}" alt="DHA requirement">`:'';
    const displayImage=productDisplayImageUrl(p);
    const image=displayImage
      ? `<div class="detailProductImageWrap"><img src="${esc(displayImage)}" alt="${esc(displayName)}" onerror="this.onerror=null;this.src='${esc(fallback)}'">${detailDhaMark}</div>`
      : `<div class="detailProductImageWrap"><div class="detailNeedVisual" style="--need-bg:${primary.bg};--need-ink:${primary.ink}"></div>${detailDhaMark}</div>`;

    return `<div class="productDetailModal">
      <div class="modalHeader"><div><span class="eyebrow">${esc(primary.label)}</span><h2>${esc(displayName)}</h2><div class="smallMuted mono">${esc(p.pscSku)}</div></div><button class="iconBtn" data-modal-close>×</button></div>
      <div class="productDetailGrid">
        <div class="detailImagePane">${image}${Array.isArray(p.storefrontMedia)&&p.storefrontMedia.length>1?`<div class="productGalleryStrip">${p.storefrontMedia.slice(0,5).map(m=>`<img src="${esc(m.url)}" alt="${esc(m.alt||displayName)}">`).join('')}</div>`:''}<div class="detailImageMeta">${p.brand&&p.brand!=='Specification-led'&&p.brand!=='Institutional range'?`<b>${esc(p.brand)}</b>`:''}<span>${esc(pack)}</span></div><div class="modalNeedChips">${needTags}</div></div>
        <div class="detailContentPane">
          ${mapped?`<div class="regulatoryHero mapped v25DhaHero"><div class="dhaModalBadge"><span>DHA</span><b>Mapped requirement</b></div><h3>${esc(p.dhaRequirement||'Mapped requirement')}</h3><p>${esc(p.dhaReference||'DHA requirement')} · ${esc(p.dhaStatus||'Status to verify')}</p></div>`:`<div class="regulatoryHero support"><span>INSTITUTIONAL CATALOGUE</span><h3>${esc(p.productType||'Institutional supply')}</h3><p>Product specification is reviewed before quotation.</p></div>`}
          <div class="specBlocks">
            ${mapped?`<section><span class="specLabel">DHA REQUIREMENT</span><p>${esc(p.dhaRequirement)}</p></section><section><span class="specLabel">REFERENCE & STATUS</span><p><strong>${esc(p.dhaReference||'—')}</strong> · ${esc(p.dhaStatus||'Needs verification')}</p>${p.dhaCondition?`<small>${esc(p.dhaCondition)}</small>`:''}</section>`:''}
            <section><span class="specLabel">PRODUCT SPECIFICATION</span><p>${esc(p.pscOfferedSpecification||p.spec||'Exact commercial specification will be confirmed with the quotation.')}</p></section>
          </div>
          ${mapped?`<div class="mappingDisclosure"><b>Regulatory clarity</b><p>Mapped to the applicable DHA clinic requirement. This is not a DHA product endorsement or product approval. Exact model suitability remains subject to specification verification.</p></div>`:''}
          ${p.regulated?'<div class="licensedNotice"><b>Licensed supply route</b><p>Availability and supply remain subject to applicable UAE licensing, recipient authorization, product registration, storage, batch/expiry and professional controls.</p></div>':''}
          <div class="detailActions productPageActions"><button class="button light productCloseAction" data-modal-close>Close</button><button class="button primary productRequestAction" data-add="${p.pscSku}">Request</button></div>
        </div>
      </div>
    </div>`;
  }

  function modalHtml(meta){ const body=meta.type==='request'?requestModal(meta.id,!!meta.admin):meta.type==='product'?productModal(meta.sku):''; return `<div class="modalBackdrop" data-modal-close><div class="modal ${meta.type==='product'?'productModalShell':''}" onclick="event.stopPropagation()">${body}</div></div>`; }


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
    if(isPscAdmin) await loadAdminCms();
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
      orderLines.forEach(l=>{ if(l.psc_sku_snapshot) qLines[l.psc_sku_snapshot]={sell:l.unit_price===null?undefined:Number(l.unit_price),vat:l.vat_rate===null?undefined:Number(l.vat_rate)}; });
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
        lines:orderLines.map(l=>({sku:l.psc_sku_snapshot||'',qty:Number(l.quantity)})),
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
    const dbLines=lines.map(l=>{ const p=product(l.sku); return {order_id:o.id,product_id:null,psc_sku_snapshot:l.sku,line_description:p?.name||l.sku,brand_model_snapshot:p?.brand||null,pack_snapshot:p?.pack||null,quantity:l.qty}; });
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
      'who-we-supply':['Who We Supply | Pharma Service','Institutional healthcare supply designed for schools, multi-site groups, workplace health facilities and professional procurement teams.','/who-we-supply.html'],
      'what-we-supply':['What We Supply | Pharma Service','Opening equipment, recurring clinic consumables, diagnostics, emergency products and appropriate regulated supply routes.','/what-we-supply.html'],
      'how-it-works':['How Institutional Supply Works | Pharma Service','See how Pharma Service captures requirements, normalizes specifications, sources per line, quotes, delivers and supports repeat supply.','/how-it-works.html'],
      catalogue:['Institutional Healthcare Catalogue | Pharma Service','Browse the public read-only Pharma Service institutional healthcare catalogue by clinical need.','/catalogue.html'],
      contact:['Request Institutional Supply | Pharma Service','Send Pharma Service an institutional healthcare requirement or RFQ for sourcing and quotation.','/contact.html'],
      about:['About Pharma Service','Dubai healthcare supply business developing a controlled institutional supply service for schools and organizations.','/about.html'],
      careers:['Careers | Pharma Service','Career information from Pharma Service.','/careers.html'],
      media:['Media & Resources | Pharma Service','Pharma Service company updates and institutional healthcare supply resources.','/media.html']
    };
    const baseRoute=route.startsWith('catalogue/')?'catalogue':route;
    const item=publicMeta[baseRoute];
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
    } else if(r.startsWith('admin/products/')){
      html=adminProductEditor(r.split('/')[2]);
    } else switch(r){
      case 'home': html=landing();break;
      case 'about': html=aboutPage();break;
      case 'services': html=servicesPage();break;
      case 'who-we-supply': html=whoWeSupplyPage();break;
      case 'what-we-supply': html=whatWeSupplyPage();break;
      case 'how-it-works': html=howItWorksPage();break;
      case 'catalogue': html=publicCataloguePage('all');break;
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
      case 'admin/storefront': html=adminStorefront();break;
      case 'admin/products': html=adminProducts();break;
      case 'admin/requests': html=adminRequests();break;
      case 'admin/fulfilment': html=adminFulfilment();break;
      case 'admin/supplier-feed': html=adminFeed();break;
      default: html=landing();
    }
    $app.innerHTML=html; syncRouteMeta(r); bind(); syncPublicHeader();
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
        source_page:'public_contact_v37'
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
    document.querySelectorAll('[data-basket]').forEach(el=>el.addEventListener('click',()=>{ui.basket=true;render()}));
    document.querySelectorAll('[data-close-basket]').forEach(el=>el.addEventListener('click',()=>{ui.basket=false;render()}));
    document.querySelectorAll('[data-product-view]').forEach(el=>el.addEventListener('click',()=>{ui.modal={type:'product',sku:el.dataset.productView};render()}));
    document.querySelectorAll('[data-add]').forEach(el=>el.addEventListener('click',()=>addBasket(el.dataset.add,1)));
    document.querySelectorAll('[data-basket-delta]').forEach(el=>el.addEventListener('click',()=>{const [sku,d]=el.dataset.basketDelta.split('|');const line=state.basket.find(x=>x.sku===sku);if(!line)return;line.qty+=Number(d);if(line.qty<=0)state.basket=state.basket.filter(x=>x.sku!==sku);save();render()}));
    document.querySelectorAll('[data-basket-remove]').forEach(el=>el.addEventListener('click',()=>{state.basket=state.basket.filter(x=>x.sku!==el.dataset.basketRemove);save();render()}));
    document.querySelectorAll('[data-submit-request]').forEach(el=>el.addEventListener('click',submitRequest));
    document.querySelectorAll('[data-submit-custom]').forEach(el=>el.addEventListener('click',submitCustomRequest));
    document.querySelectorAll('[data-public-enquiry]').forEach(el=>el.addEventListener('submit',submitPublicEnquiry));
    document.querySelectorAll('[data-mvp-login]').forEach(el=>el.addEventListener('click',signIn));
    document.querySelectorAll('[data-signout]').forEach(el=>el.addEventListener('click',signOut));
    document.querySelectorAll('[data-template]').forEach(el=>el.addEventListener('click',()=>applyTemplate(el.dataset.template)));
    document.querySelectorAll('[data-quick-add]').forEach(el=>el.addEventListener('click',()=>{const sku=el.dataset.quickAdd;const input=document.querySelector(`[data-quick-qty="${sku}"]`);addBasket(sku,Math.max(1,Number(input.value||1)))}));
    document.querySelectorAll('[data-request-reorder]').forEach(el=>el.addEventListener('click',()=>reorderRequest(el.dataset.requestReorder)));

    document.querySelectorAll('[data-replenish]').forEach(el=>el.addEventListener('click',()=>{const [sku,q]=el.dataset.replenish.split('|');addBasket(sku,Math.max(1,Number(q)||1));toast('<strong>Added to cart.</strong><br>Previous delivered quantity restored.')}));
    document.querySelectorAll('[data-reorder-order]').forEach(el=>el.addEventListener('click',()=>reorderRequest(el.dataset.reorderOrder)));
    document.querySelectorAll('[data-confirm-quote]').forEach(el=>el.addEventListener('click',async()=>{try{await updateCustomerQuote(el.dataset.confirmQuote,'confirm');toast('<strong>Quotation confirmed.</strong><br>PSC will confirm the fulfilment and delivery timing for this order.')}catch(e){console.error(e);toast('<strong>Could not confirm quotation.</strong>')}}));
    document.querySelectorAll('[data-cancel-quote]').forEach(el=>el.addEventListener('click',async()=>{try{await updateCustomerQuote(el.dataset.cancelQuote,'cancel');toast('<strong>Quotation cancelled.</strong><br>It will remain visible for 30 days before moving to Archive.')}catch(e){console.error(e);toast('<strong>Could not cancel quotation.</strong>')}}));
    document.querySelectorAll('[data-reorder-last]').forEach(el=>el.addEventListener('click',()=>{const r=state.requests.find(x=>x.campus===state.campus);if(r)reorderRequest(r.id)}));
    document.querySelectorAll('[data-request-view]').forEach(el=>el.addEventListener('click',()=>{ui.modal={type:'request',id:el.dataset.requestView,admin:false};render()}));
    document.querySelectorAll('[data-admin-request]').forEach(el=>el.addEventListener('click',()=>{ui.modal={type:'request',id:el.dataset.adminRequest,admin:true};render()}));
    document.querySelectorAll('[data-modal-close]').forEach(el=>el.addEventListener('click',()=>{ui.modal=null;render()}));
    document.querySelectorAll('[data-document-open]').forEach(el=>el.addEventListener('click',()=>openOrderDocument(el.dataset.documentOpen)));
    document.querySelectorAll('[data-document-upload]').forEach(el=>el.addEventListener('change',async e=>{const file=e.target.files?.[0];if(file)await uploadOrderDocument(el.dataset.documentUpload,file);}));
    const cq=document.querySelector('[data-cat-q]'); if(cq)cq.addEventListener('input',e=>{ui.catalogueQuery=e.target.value;render()});
    document.querySelectorAll('[data-clinic-need]').forEach(el=>el.addEventListener('click',()=>{ui.catalogueNeed=el.dataset.clinicNeed||'all';render()}));
    document.querySelectorAll('[data-cat-filter]').forEach(el=>el.addEventListener('change',e=>{if(el.dataset.catFilter==='category')ui.catalogueCat=e.target.value;else ui.catalogueFilter=e.target.value;render()}));
    const pq=document.querySelector('[data-prod-q]'); if(pq)pq.addEventListener('input',e=>{ui.productQuery=e.target.value;render()});
    document.querySelectorAll('[data-prod-filter]').forEach(el=>el.addEventListener('change',e=>{if(el.dataset.prodFilter==='category')ui.productCat=e.target.value;else ui.evidence=e.target.value;render()}));
    document.querySelectorAll('[data-stock-count]').forEach(el=>el.addEventListener('change',e=>{const i=Number(el.dataset.stockCount);state.stock[i].onHand=Number(e.target.value);state.stock[i].status=state.stock[i].onHand<=state.stock[i].reorderAt?'Reorder candidate':state.stock[i].status==='Reorder candidate'?'Good':state.stock[i].status;save();render()}));
    document.querySelectorAll('[data-stock-expiry]').forEach(el=>el.addEventListener('change',e=>{state.stock[Number(el.dataset.stockExpiry)].expiry=e.target.value;save()}));
    document.querySelectorAll('[data-stock-save]').forEach(el=>el.addEventListener('click',()=>{audit('Stock counts saved',state.campus);toast('<strong>Saved.</strong> Demo stock register updated.')}));
    document.querySelectorAll('[data-product-field]').forEach(el=>el.addEventListener('change',e=>{const[sku,field]=el.dataset.productField.split('|');state.productOverrides[sku]=state.productOverrides[sku]||{};const val=e.target.value.trim();state.productOverrides[sku][field]=val===''?undefined:Number(val);audit('Product master updated',`${sku} ${field}`);save();render();toast(`<strong>${sku}</strong> updated locally`)}));
    document.querySelectorAll('[data-quote-field]').forEach(el=>el.addEventListener('change',e=>{const[id,sku,field]=el.dataset.quoteField.split('|');const r=state.requests.find(x=>x.id===id);r.quote=r.quote||{lines:{}};r.quote.lines=r.quote.lines||{};r.quote.lines[sku]=r.quote.lines[sku]||{};const val=e.target.value;r.quote.lines[sku][field]=val===''?undefined:Number(val);if(field==='cost')r.quote.lines[sku].costEvidence='Manual entry — evidence required';audit('Quote line updated',`${id} ${sku} ${field}`);save();render()}));
    document.querySelectorAll('[data-quote-meta]').forEach(el=>el.addEventListener('change',e=>{const[id,field]=el.dataset.quoteMeta.split('|');const r=state.requests.find(x=>x.id===id);r.quote=r.quote||{lines:{}};r.quote[field]=e.target.value;audit('Quote terms updated',`${id} ${field}`);save()}));
    document.querySelectorAll('[data-request-status]').forEach(el=>el.addEventListener('change',e=>{const r=state.requests.find(x=>x.id===el.dataset.requestStatus);r.status=e.target.value;if(r.status==='Sent'&&!r.quoteRef)r.quoteRef=`PSC-Q-${new Date().getFullYear()}-${String(state.requests.indexOf(r)+1001).padStart(4,'0')}`;audit('Request status changed',`${r.id} → ${r.status}`);save();render()}));
    document.querySelectorAll('[data-quote-ref]').forEach(el=>el.addEventListener('change',e=>{const r=state.requests.find(x=>x.id===el.dataset.quoteRef);r.quoteRef=e.target.value;audit('Quote reference updated',r.id);save()}));
    document.querySelectorAll('[data-approve-quote]').forEach(el=>el.addEventListener('click',()=>{const r=state.requests.find(x=>x.id===el.dataset.approveQuote);r.status='Authorized';audit('Quotation confirmed by demo account user',r.id);save();render();toast('<strong>Quotation confirmed.</strong><br>PSC will confirm the fulfilment and delivery timing for this order.')}));
    document.querySelectorAll('[data-export-products]').forEach(el=>el.addEventListener('click',exportProducts));

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
  if(!location.hash) location.hash='home';
  bootstrapAuth();
})();
