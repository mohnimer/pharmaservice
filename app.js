(() => {
  'use strict';
  const D = window.PSC_DATA;
  const C = window.PSC_COPY || {};
  const PSC_LOGO = './assets/psc-logo-cropped.png';
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
  let ui = { mobile:false, basket:false, modal:null, accountMenu:false, catalogueQuery:'', catalogueNeed:'all', catalogueCat:'All product types', catalogueFilter:'All lines', productQuery:'', productCat:'All', evidence:'All' };

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
  function tomorrowDelivery(){ const d=new Date(); d.setDate(d.getDate()+1); const day=d.toLocaleDateString('en-GB',{weekday:'long'}); const ds=d.toLocaleDateString('en-GB',{day:'2-digit',month:'2-digit',year:'numeric'}); return `Will be delivered on ${day} ${ds}`; }
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
  function isCapitalProduct(p){ return !!p && ['Furniture & Mobility','Diagnostics & Monitoring','Emergency & Oxygen'].includes(p.category); }
  function product(sku){
    const base = D.products.find(p=>p.pscSku===sku) || (state.customProducts||{})[sku];
    if(!base) return null;
    return {...base,...(state.productOverrides[sku]||{})};
  }
  function products(){ return D.products.map(p=>product(p.pscSku)); }
  function currentRoute(){ return (location.hash || '#home').slice(1); }
  function go(route){ location.hash = route; ui.mobile=false; ui.modal=null; window.scrollTo({top:0,behavior:'instant'}); render(); }
  function audit(action, detail){ state.audit.unshift({at:new Date().toISOString(),actor:'Demo user',action,detail}); state.audit=state.audit.slice(0,50); save(); }
  function toast(msg){ const old=document.querySelector('.toast'); if(old)old.remove(); const d=document.createElement('div');d.className='toast';d.innerHTML=msg;$app.appendChild(d);setTimeout(()=>d.remove(),2800); }

  function brand(landing=false){ return landing
    ? `<button class="brand brandButton ${landing?'landingBrand':''}" data-go="home" aria-label="Pharma Service home"><img class="brandImage brandImageLight" src="${PSC_LOGO}" alt="Pharma Service"><span class="brandMeta"><b>INSTITUTIONAL HEALTHCARE SUPPLY</b><small>Dubai, United Arab Emirates · EST. 1984</small></span></button>`
    : `<div class="sidebarBrand sidebarBrandEmpty" aria-hidden="true"></div>`; }
  function statusPill(status){ const k=String(status).toLowerCase().replace(/\s+/g,'-'); return `<span class="statusPill status-${k}">${esc(status)}</span>`; }
  function badge(text,tone=''){ return `<span class="badge ${tone}">${esc(text)}</span>`; }
  function icon(name){ const map={
    overview:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg>`,
    clinics:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V8a1 1 0 0 1 1-1h5v-3h4v3h5a1 1 0 0 1 1 1v12M9 20v-5h6v5M8 11h2M14 11h2"/></svg>`,
    request:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8M9 3h6v3H9zM6 7h12a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM12 10v6M9 13h6"/></svg>`,
    inventory:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 7v10l8 4 8-4V7zM4 7l8 4 8-4M12 11v10"/></svg>`,
    reports:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V11M12 20V4M19 20v-7"/></svg>`,
    approved:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 20v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 20v-2a4 4 0 0 0-3-3.87M14 4.13a3 3 0 0 1 0 5.74"/></svg>`,
    stock:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v6M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>`,
    assets:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.7 6.3 3 3M4 20l4.5-1 9.2-9.2a2.1 2.1 0 0 0-3-3L5.5 16 4 20z"/></svg>`,
    admin:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>`,
    products:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 7v10l8 4 8-4V7zM4 7l8 4 8-4M12 11v10"/></svg>`,
    queue:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>`,
    rules:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 3h5v5M8 21H3v-5M21 8a9 9 0 0 0-15.5-4.5L3 6M3 16a9 9 0 0 0 15.5 4.5L21 18"/></svg>`,
    feed:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>`,
    repeat:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7h-9a5 5 0 0 0-5 5v1M4 17h9a5 5 0 0 0 5-5v-1M17 4l3 3-3 3M7 14l-3 3 3 3"/></svg>`,
    resource:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM8 8h7M8 12h7M8 16h4"/></svg>`,
    logout:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5M14 8l4 4-4 4M8 12h10"/></svg>`,
    settings:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V21a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1.03-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.64 8.4a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.03a1.7 1.7 0 0 0 1.03-1.55V2a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.88c.25.64.87 1.07 1.55 1.03H21a2 2 0 1 1 0 4h-.09c-.68-.04-1.3.39-1.55 1.03z"/></svg>`,
    help:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.1 9a3 3 0 1 1 5.8 1c-.34.88-1 1.2-1.67 1.74-.52.42-.9.92-.9 1.76M12 17h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z"/></svg>`,
    search:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"/></svg>`,
    bell:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 17H5l1.4-1.4A2 2 0 0 0 7 14.2V11a5 5 0 1 1 10 0v3.2a2 2 0 0 0 .6 1.4L19 17h-4M10 17a2 2 0 0 0 4 0"/></svg>`
  }; return map[name]||''; }

  const schoolNav=[['portal/dashboard','Home','overview'],['portal/catalogue','Shop','inventory'],['portal/requests','Orders & Requests','request'],['portal/replenish','Replenish','repeat'],['portal/insights','Resources & Updates','resource']];
  const adminNav=[['admin/dashboard','Deal Desk','admin'],['admin/products','Product Master','products'],['admin/requests','Request Queue','queue'],['admin/fulfilment','Fulfilment Rules','rules'],['admin/supplier-feed','Supplier Feed','feed']];

  function shell(content, admin=false){
    const route=currentRoute(), links=admin?adminNav:schoolNav;
    return `<div class="appShell v4Shell v7Shell v7bShell v26Shell">
      <div class="mobileOverlay ${ui.mobile?'show':''}" data-mobile-close></div>
      <aside class="sidebar ${ui.mobile?'sidebarOpen':''}">
        <div class="sidebarTop">${brand()}<button class="iconBtn mobileClose" data-mobile-close>×</button></div>
        <nav class="iconNav">${links.map(([href,label,ico])=>`<button class="navLink iconOnly ${(route===href || (href==='portal/catalogue' && route.startsWith('portal/catalogue/')))?'active':''}" data-go="${href}" aria-label="${label}"><span class="navIcon">${icon(ico)}</span><span class="navLabel">${label}</span></button>`).join('')}</nav>
        <div class="sidebarFooter compactFooter">
          ${admin?`<button class="navLink iconOnly" data-go="portal/dashboard" aria-label="Client portal"><span class="navIcon">${icon('overview')}</span><span class="navLabel">Client portal</span></button>`:(authContext?.isPscAdmin?`<button class="navLink iconOnly" data-go="admin/dashboard" aria-label="PSC admin"><span class="navIcon">${icon('admin')}</span><span class="navLabel">PSC admin</span></button>`:'')}
          <button class="navLink iconOnly" data-signout aria-label="Sign out"><span class="navIcon">${icon('logout')}</span><span class="navLabel">Sign out</span></button>
        </div>
      </aside>
      <main class="mainArea v7MainArea v7bMainArea">
        <header class="topbar sleekTopbar v7Topbar v7bTopbar">
          <button class="iconBtn mobileMenu" data-mobile-open>☰</button>
          <div class="topbarBrandSlot"><img src="${PSC_LOGO}" alt="Pharma Service"></div>
          <div class="topbarSearch"><span class="searchIcon">${icon('search')}</span><input placeholder="Search supplies, equipment, or requests..." aria-label="Search"></div>
          <div class="topbarActions topbarActionsV4">
            ${admin?'<button class="iconShell" aria-label="Notifications">'+icon('bell')+'</button><span class="userPill"><span class="avatarDot">MH</span><span><b>Mohamed</b><small>PSC admin</small></span></span>':`<button class="iconShell" aria-label="Notifications">${icon('bell')}</button>
            <div class="accountSwitcherWrap">
              <button class="campusPill accountSwitcherButton ${canSwitchSchools()?'switchable':''}" ${canSwitchSchools()?'data-account-switcher':''} aria-expanded="${ui.accountMenu?'true':'false'}">
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
        <div class="contentWrap v7ContentWrap">${content}</div>
      </main>
      ${ui.basket?basketDrawer():''}
      ${ui.modal?modalHtml(ui.modal):''}
    </div>`;
  }


  const publicNav=[['home','Home'],['about','About Us'],['services','Services'],['careers','Careers'],['media','Media'],['contact','Contact']];
  function publicHeader(active='home'){
    return `<header class="publicHeader"><button class="publicLogo" data-go="home"><img src="${PSC_LOGO}" alt="Pharma Service"></button><nav class="publicNav">${publicNav.map(([r,l])=>`<button class="publicNavLink ${active===r?'active':''}" data-go="${r}">${l}</button>`).join('')}</nav><button class="button primary publicPortalBtn" data-go="login">Clinic Portal →</button></header>`;
  }
  function publicFooter(){ return `<footer class="publicFooter"><div><img src="${PSC_LOGO}" alt="Pharma Service"><p>Institutional healthcare supply with one accountable Pharma Service relationship.</p></div><div><span>Dubai, United Arab Emirates</span><a href="tel:+97143377004">+971 4 337 7004</a><a href="mailto:info@pharmaservice.ae">info@pharmaservice.ae</a></div></footer>`; }
  function publicPage(active,kicker,title,lead,body){ return `<main class="publicPage">${publicHeader(active)}<section class="publicPageHero"><span class="kicker">${kicker}</span><h1>${title}</h1><p>${lead}</p></section>${body}${publicFooter()}</main>`; }

  function landing(){
    const approved=products().filter(p=>p.schoolApproved).length;
    return `<main class="landingPage publicLanding">
      ${publicHeader('home')}
      <section class="landingHero">
        <div class="landingCopy">
          <h1 class="institutionalHero"><span>${esc(C.home?.heroTitlePrefix || 'Institutional')}</span><em>${esc(C.home?.heroTitleAccent || 'Supply')}</em></h1>
          <p class="lead heroStatement"><span>${esc(C.home?.heroLine1 || 'Easy procurement.')} <em>${esc(C.home?.heroLine1Accent || 'Wholesale pricing.')}</em></span><strong>${esc(C.home?.heroLine2 || 'More time for what matters')}</strong></p>
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
                <p>wholesale prices, while<br>ensuring alignment to<br>regulatory guidelines.</p>
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
      <section class="publicClinicalPreview">
        <div class="publicClinicalPreviewHead">
          <div>
            <span class="kicker">BROWSE BY CLINICAL NEED</span>
            <h2>Find products the way healthcare teams actually think.</h2>
            <p>Start with the clinical need, then move directly into the relevant medicines, consumables, devices and equipment.</p>
          </div>
          <button class="textAction" data-go="portal/catalogue">Explore catalogue →</button>
        </div>

        <div class="publicClinicalPreviewGrid">
          <button class="publicClinicalCard coral" data-go="portal/catalogue/wounds">
            <span>Cuts &amp; Wounds</span>
            <small>Dressings, antiseptics, gauze, closure and wound protection</small>
            <i>↗</i>
          </button>

          <button class="publicClinicalCard blue" data-go="portal/catalogue/breathing">
            <span>Breathing &amp; Oxygen</span>
            <small>Nebulisation, oxygen delivery, airway and respiratory support</small>
            <i>↗</i>
          </button>

          <button class="publicClinicalCard orange" data-go="portal/catalogue/vitals">
            <span>Vitals &amp; Assessment</span>
            <small>Blood pressure, temperature, oximetry and clinical assessment</small>
            <i>↗</i>
          </button>

          <button class="publicClinicalCard mint" data-go="portal/catalogue/infection">
            <span>Infection Control &amp; PPE</span>
            <small>PPE, hand hygiene, disinfection and waste control</small>
            <i>↗</i>
          </button>

          <button class="publicClinicalCard rose" data-go="portal/catalogue/emergency">
            <span>Emergency &amp; Response</span>
            <small>Resuscitation, first response and urgent-use products</small>
            <i>↗</i>
          </button>

          <button class="publicClinicalCard sand" data-go="portal/catalogue/equipment">
            <span>Equipment &amp; Mobility</span>
            <small>Clinical furniture, mobility, storage and capital equipment</small>
            <i>↗</i>
          </button>
        </div>

        <div class="publicClinicalPreviewFoot">
          <span>Plus medicines &amp; symptoms, diabetes &amp; testing, procedures &amp; consumables, allergy &amp; skin, patient care, screening and more.</span>
          <button class="button primary semanticPrimary" data-go="portal/catalogue">Open Institutional Catalogue →</button>
        </div>
      </section>
      <section class="demoTeaser"><div><span class="kicker">SEE HOW IT WORKS</span><h2>Take a guided tour of Pharma Service.</h2><p>See the institutional customer journey from product selection and quotation through order management, delivery and repeat purchasing.</p></div><button class="button dark large semanticPrimary" data-go="demo">Take guided tour →</button></section>
      ${publicFooter()}
    </main>`;
  }

  function publicDemoPage(){
    const steps=[
      {n:'01',label:'APPROVED SUPPLY',title:'Start with the right product.',text:'The clinic browses a curated institutional catalogue instead of searching through thousands of consumer listings.',outcome:'Clear products, packs and specifications built around the clinic environment.',visual:'shop'},
      {n:'02',label:'BUILD THE REQUEST',title:'Order what the clinic actually needs.',text:'Approved lines go into one basket. If something is missing, the clinic can submit a custom sourcing request without leaving the portal.',outcome:'One request reaches Pharma Service with the school, user, lines and quantities already attached.',visual:'request'},
      {n:'03',label:'PSC CONTROL',title:'We validate before we quote.',text:'PSC checks the exact product, source, current commercial evidence, applicable supply route and delivery before issuing the quotation.',outcome:'The customer gets simplicity. PSC keeps control of the complexity behind it.',visual:'control'},
      {n:'04',label:'QUOTE & DELIVERY',title:'A clear decision and a visible next step.',text:'The quotation is sent to the registered account. The school confirms or cancels it, then follows the order through processing and delivery.',outcome:'No WhatsApp archaeology. The commercial history remains attached to the account.',visual:'delivery'},
      {n:'05',label:'REPLENISH',title:'The second order should be easier than the first.',text:'Delivered consumables automatically become available for repeat request, while previously supplied equipment stays visible for reference or another-unit requests.',outcome:'Every completed transaction makes the account easier to service next time.',visual:'repeat'}
    ];
    const i=Math.max(0,Math.min(steps.length-1,ui.tourStep||0)),st=steps[i];
    const visual={
      shop:`<div class="demoMachine shopMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>Approved Clinic Supply</b></div><div class="demoProductGrid"><article><div class="demoPack">GAUZE</div><span>Sterile Gauze</span><small>Requirement mapped</small><button>+</button></article><article><div class="demoPack diag">BP</div><span>BP Monitor</span><small>Exact spec shown</small><button>+</button></article><article><div class="demoPack saline">NaCl</div><span>Sterile Saline</span><small>Clinic consumable</small><button>+</button></article></div><div class="demoCursor cursorOne"></div></div>`,
      request:`<div class="demoMachine requestMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>Supply Request</b></div><div class="requestDemoLines"><div><i>01</i><span><b>Sterile Gauze</b><small>100 swabs</small></span><strong>6</strong></div><div><i>02</i><span><b>Sterile Saline</b><small>2.5 ml</small></span><strong>10</strong></div><div class="customDemo"><span>Can’t find it?</span><b>Paediatric nebulizer masks…</b><em>Custom request</em></div></div><button class="demoSubmit">Place order for review <span>→</span></button></div>`,
      control:`<div class="demoMachine controlMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>PSC Review</b></div><div class="controlTrack"><span class="trackLine"></span><div class="trackDot done">✓<small>SPEC</small></div><div class="trackDot done">✓<small>SOURCE</small></div><div class="trackDot active">●<small>ROUTE</small></div><div class="trackDot">4<small>QUOTE</small></div></div><div class="controlCards"><article><span>PRODUCT</span><b>Exact specification</b><small>Matched to controlled line</small></article><article><span>SUPPLY</span><b>Current evidence</b><small>Price / stock checked</small></article><article><span>ROUTE</span><b>Appropriate channel</b><small>Validated before commitment</small></article></div></div>`,
      delivery:`<div class="demoMachine deliveryMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>Order & Quotation</b></div><div class="quoteDemo"><div><span>PSC-Q-2026-1042</span><b>Quotation ready</b><small>Sent to registered account email</small></div><div class="quoteActions"><button>Cancel</button><button class="confirm">Confirm quote</button></div></div><div class="deliveryTrack"><div class="deliveryVan">▰</div><span></span><div class="deliveryPin">✓</div></div><div class="deliveryPromiseDemo"><small>NEXT</small><b>Will be delivered tomorrow</b></div></div>`,
      repeat:`<div class="demoMachine repeatMachine"><div class="demoMachineBar"><span></span><span></span><span></span><b>Replenish</b></div><div class="repeatCards"><article><div class="repeatThumb">GAUZE</div><div><span>Previously delivered</span><b>Sterile Gauze</b><small>Last qty · 6</small></div><button>Replenish 6 →</button></article><article><div class="repeatThumb saline">NaCl</div><div><span>Previously delivered</span><b>Sterile Saline</b><small>Last qty · 10</small></div><button>Replenish 10 →</button></article></div><div class="repeatLoop">↻ <span>Order history becomes the next order shortcut.</span></div></div>`
    }[st.visual];
    return `<main class="publicPage publicDemoPage">${publicHeader('')}<section class="demoPublicHero"><div><span class="kicker">GUIDED DEMONSTRATION</span><h1>See the supply relationship<br>work from end to end.</h1><p>See how Pharma Service takes an institutional customer from product selection and quotation through order management, delivery and repeat purchasing — while keeping the sourcing complexity behind the scenes.</p></div><div class="demoHeroFlow"><div><b>01</b><span>SELECT</span></div><i></i><div><b>02</b><span>REQUEST</span></div><i></i><div><b>03</b><span>CONTROL</span></div><i></i><div><b>04</b><span>DELIVER</span></div><i></i><div><b>05</b><span>REPEAT</span></div><span class="flowRunner"></span></div></section><section class="publicDemoBody"><div class="publicDemoStepper">${steps.map((x,j)=>`<button class="demoStepButton ${j===i?'active':j<i?'done':''}" data-tour-jump="${j}"><span>${x.n}</span><b>${x.label}</b></button>`).join('')}</div><div class="publicDemoStage"><div class="publicDemoCopy"><span class="kicker">${st.label}</span><h2>${st.title}</h2><p>${st.text}</p><div class="demoOutcome"><span>WHAT THIS ACHIEVES</span><b>${st.outcome}</b></div><div class="tourNav"><button class="button outline" data-tour-prev ${i===0?'disabled':''}>← Previous</button>${i<steps.length-1?'<button class="button primary" data-tour-next>Next →</button>':'<button class="button primary" data-go="login">Open Clinic Portal →</button>'}</div></div><div class="publicDemoVisual">${visual}</div></div><div class="demoDisclosure"><b>Demonstration scope</b><span>The animation illustrates the live customer workflow and planned presentation layer. Actual products, prices, availability, regulatory route and delivery dates remain account- and transaction-specific.</span></div></section>${publicFooter()}</main>`;
  }


  function aboutPage(){ return publicPage('about','ABOUT PHARMA SERVICE','Built for accountable healthcare supply.','Pharma Service Co. L.L.C. is a UAE healthcare supplier focused on helping institutions source, organize and receive the products they need through one accountable commercial relationship.',`<section class="publicSection twoPublicCols"><div><span class="kicker">OUR ROLE</span><h2>Source per line. Deliver one solution.</h2><p>Institutions should not need to coordinate a different supplier for every requirement. Pharma Service combines category-specific sourcing with one commercial and operating point of accountability.</p></div><div class="publicFeatureStack"><article><b>Institutional supply</b><p>School clinics, healthcare facilities and institutional accounts.</p></article><article><b>Controlled specifications</b><p>Product selection is mapped to the relevant requirement and confirmed before commitment.</p></article><article><b>Recurring account service</b><p>Order history, replenishment and consistent follow-through over time.</p></article></div></section>`); }

  function servicesPage(){ return publicPage('services','SERVICES','Clinic procurement, made easier.','Pharma Service makes it easy for institutional customers to shop, request quotations, manage orders, repeat previous purchases and optimize procurement costs across pharmaceuticals, medical disposables and medical equipment.',`<section class="publicSection twoPublicCols"><div><span class="kicker">PROCUREMENT COST CONTROL</span><h2>Buy through the right supply channel, not the retail shelf.</h2><p>Pharma Service sources through suitable wholesale and specialist suppliers, then consolidates the commercial process for the institutional customer. The objective is straightforward: optimize procurement costs across pharmaceuticals, medical disposables and medical equipment without pushing sourcing complexity onto the clinic team.</p></div><div class="publicFeatureStack"><article><b>Shop & request</b><p>Browse controlled institutional lines or submit a custom sourcing request.</p></article><article><b>Quote & manage</b><p>Receive the formal quotation, confirm the order and keep the transaction history attached to the account.</p></article><article><b>Repeat efficiently</b><p>Reorder previously supplied items without restarting the procurement process from zero.</p></article></div></section><section class="publicSection procurementFlow"><article><b>SHOP</b><span>01</span><p>Browse the Pharma Service institutional product master.</p></article><article><b>QUOTE</b><span>02</span><p>PSC sources, reviews and sends the formal quotation.</p></article><article><b>MANAGE</b><span>03</span><p>Confirm, cancel or follow the order from the account.</p></article><article><b>REPEAT</b><span>04</span><p>Repeat previously supplied items from the same account history.</p></article></section><section class="publicCta"><div><span class="kicker">SEE IT WORK</span><h2>Take a guided tour of Pharma Service.</h2></div><div class="publicCtaActions"><button class="button outline large" data-go="demo">Take guided tour</button><button class="button primary large" data-go="login">Open Clinic Portal →</button></div></section>`); }

  function careersPage(){ return publicPage('careers','CAREERS','Build practical healthcare supply with us.','We are interested in people who value accuracy, follow-through and institutional customer service.',`<section class="publicSection simplePublicPanel"><h2>Current opportunities</h2><p>Roles will be posted here as the institutional-supply business expands. For now, career enquiries can be directed through the Contact page.</p><button class="button outline" data-go="contact">Contact Pharma Service →</button></section>`); }

  function mediaPage(){ return publicPage('media','MEDIA','Updates, resources and institutional supply notes.','A public space for Pharma Service company updates and practical institutional healthcare-supply resources.',`<section class="publicSection publicMediaGrid"><article><span>SCHOOL CLINICS</span><h3>Building a cleaner replenishment process</h3><p>Why repeat ordering should get easier after the first completed supply cycle.</p></article><article><span>PRODUCT CONTROL</span><h3>Requirement-mapped specifications</h3><p>How PSC separates regulatory requirements from exact commercial product specifications.</p></article><article><span>PSC UPDATE</span><h3>Institutional Supply Portal</h3><p>The first MVP brings ordering, quotations and replenishment into one customer account.</p></article></section>`); }

  function contactPage(){ return publicPage('contact','CONTACT','Talk to Pharma Service.','For institutional supply, school-clinic enquiries and account setup, contact Pharma Service in Dubai.',`<section class="publicSection contactGrid"><div class="contactCard"><span>PHONE</span><b>+971 4 337 7004</b></div><div class="contactCard"><span>EMAIL</span><b>info@pharmaservice.ae</b></div><div class="contactCard"><span>LOCATION</span><b>Dubai, United Arab Emirates</b></div><div class="contactCard"><span>CLINIC PORTAL</span><button class="button primary" data-go="login">Open account access →</button></div></section>`); }

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
        <div><span class="eyebrow">YOUR PHARMA SERVICE ACCOUNT</span><h1>What do you need today?</h1><p>Shop, repeat, review and request through one accountable institutional supply relationship.</p></div>
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
        <div><span>IN PROCESS</span><b>${processing}</b><small>${processing?tomorrowDelivery():'No deliveries due'}</small></div>
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
    return `<button class="homeActivityRow" data-request-view="${r.id}"><div><b>${esc(r.quoteRef||r.id)}</b><span>${p?esc(p.name):r.lines.length+' lines'}${r.lines.length>1?` +${r.lines.length-1} more`:''}</span></div><div>${customerStatusPill(r.status)}${['Authorized','Procurement','Delivery'].includes(r.status)?`<small>${tomorrowDelivery()}</small>`:''}</div></button>`;
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
      {type:'Clinic Operations',date:'27 Sep 2026',title:'Term-opening clinic readiness checklist',summary:'A simple review of what to confirm before students return: approved supply list, emergency essentials, equipment checks and current contact routes.',cta:'Read resource'},
      {type:'Replenishment',date:'25 Sep 2026',title:'How to keep recurring clinic orders simple',summary:'Use the same approved lines, repeat known quantities and change only what is different. The portal keeps the order history in one place.',cta:'Read article'},
      {type:'Product Update',date:'23 Sep 2026',title:'New school-clinic catalogue additions',summary:'Recently added diagnostic, wound-care and respiratory lines are being added to the curated PSC school-clinic catalogue as supplier evidence is confirmed.',cta:'View update'},
      {type:'PSC Update',date:'20 Sep 2026',title:'What happens after you place an order',summary:'PSC reviews the basket, validates the supply route and sends the quotation to the registered clinic email before the order moves forward.',cta:'How it works'},
      {type:'Equipment',date:'18 Sep 2026',title:'Clinic equipment: what to keep on record',summary:'Keep purchase, model, serial and warranty details available for the equipment you rely on. PSC can help keep the supply history organized.',cta:'Read resource'},
      {type:'Supply Planning',date:'15 Sep 2026',title:'Build one approved clinic list and repeat from it',summary:'A consistent approved list reduces rework, simplifies quotation and makes recurring supply more predictable for both the school and PSC.',cta:'Read article'}
    ];
    return shell(`<div class="pageHeader customerSimpleHeader"><div><span class="eyebrow">PSC RESOURCES</span><h1>Reports & Insights</h1><p>A periodically updated space for useful clinic-supply resources, product updates and Pharma Service account information.</p></div></div><div class="resourceHero"><div><span class="eyebrow">LATEST</span><h2>Useful information — without another dashboard.</h2><p>This page is intentionally editorial. We will keep adding practical resources and updates that help school clinics purchase and manage supplies more consistently.</p></div><div class="resourceHeroMark">PSC<br><span>UPDATE</span></div></div><div class="resourceGrid">${resources.map((x,i)=>`<article class="resourceCard ${i===0?'featured':''}"><div class="resourceMeta"><span>${x.type}</span><small>${x.date}</small></div><h3>${x.title}</h3><p>${x.summary}</p><button class="resourceLink">${x.cta} →</button></article>`).join('')}</div>`);
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

    return shell(`
      <div class="pageHeader institutionalCatalogueHeader v26CatalogueLandingHeader">
        <div><span class="eyebrow">INSTITUTIONAL CATALOGUE</span><h1>Browse by clinical need.</h1><p>Start with the situation, task or area of care. The catalogue keeps sourcing complexity behind the scenes while giving clinical teams a faster route to the right products.</p></div>
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
    const visual=p.imageUrl
      ? `<button class="productVisual productPhoto productVisualButton" data-product-view="${p.pscSku}" aria-label="View ${esc(displayName)} details"><img src="${esc(p.imageUrl)}" alt="${esc(displayName)}" loading="lazy" onerror="this.onerror=null;this.src='${esc(fallback)}'"><span class="imageSourceTag">${p.imageMatchStatus&&p.imageMatchStatus.startsWith('Exact')?'Product image':'Product visual'}</span></button>`
      : `<button class="productVisual productNeedVisual productVisualButton" style="--need-bg:${need.bg};--need-ink:${need.ink}" data-product-view="${p.pscSku}" aria-label="View ${esc(displayName)}"><span class="productNeedText">${esc(need.label)}</span></button>`;

    const needText=clinicalNeedIds(p).slice(0,2).map(id=>esc(clinicalNeedMeta(id).label)).join(' · ');
    const hasRealBrand=p.brand && p.brand!=='Specification-led' && p.brand!=='Institutional range';
    const hasPrice=p.contractPrice!==null && p.contractPrice!==undefined && p.contractPrice!=='' && Number.isFinite(Number(p.contractPrice)) && Number(p.contractPrice)>0;

    return `<article class="productCard v25ProductCard v261ProductCard v262ProductCard">
      ${visual}
      ${(p.dhaMapped||p.regulated)?`<div class="productStatusText">${p.dhaMapped?'<span>DHA requirement</span>':''}${p.regulated?'<span>Licensed route</span>':''}</div>`:''}
      ${hasRealBrand?`<div class="productBrand">${esc(p.brand)}</div>`:''}
      <button class="productTitleButton" data-product-view="${p.pscSku}"><h3>${esc(displayName)}</h3></button>
      <p class="pack">${esc(pack)}</p>
      ${needText?`<div class="productNeedTags">${needText}</div>`:''}
      <div class="productBottom">
        <div class="priceBlock">${hasPrice?`<b>${money(p.contractPrice)}</b>`:'<b>Request quote</b>'}</div>
        <div class="productCardActions"><button class="specLink" data-product-view="${p.pscSku}">Details</button><button class="squareAdd semanticPrimary" data-add="${p.pscSku}" aria-label="Add to request">Add</button></div>
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
      const visual=x.p.imageUrl?`<img src="${esc(x.p.imageUrl)}" alt="${esc(x.p.name)}">`:`<span>${esc(x.p.brand.slice(0,2).toUpperCase())}</span>`;
      const deliveredLabel=x.deliveredAt?date(x.deliveredAt):'Date to be confirmed';
      const actionLabel=capital?'Request another':`Replenish ${x.qty}`;
      return `<article class="replenishCard"><div class="replenishVisual">${visual}</div><div class="replenishBody"><span class="sku">${x.p.pscSku}</span><h3>${esc(x.p.name)}</h3><p>${esc(x.p.pack)}</p><div class="replenishMeta"><div><span>LAST QTY</span><b>${x.qty}</b></div><div><span>LAST DELIVERED</span><b>${deliveredLabel}</b></div></div><button class="button ${capital?'dark':'primary'} full semanticPrimary" data-replenish="${x.p.pscSku}|${x.qty}">${actionLabel} →</button></div></article>`;
    }).join('');
    const body=items.length?`<div class="replenishGrid">${cards}</div>`:'<div class="emptyState"><h3>No delivered items yet</h3><p>Products will appear here after their first completed order.</p></div>';
    return shell(`<div class="pageHeader customerSimpleHeader"><div><span class="eyebrow">PREVIOUSLY DELIVERED</span><h1>Replenish</h1><p>Repeat products already supplied to this clinic. Consumables can go straight to cart; capital equipment can be requested again for PSC review.</p></div><button class="button dark" data-basket>Open cart</button></div>${body}`);
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
    const delivery=['Authorized','Procurement','Delivery'].includes(r.status)?tomorrowDelivery():'';
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
      ${admin?adminQuoteBuilder(r,quote):schoolQuote(r,quote,canApprove)}</div>`;
  }

  function calcQuote(r){
    let subtotal=0,cost=0,vat=0,hasSell=true,costComplete=true,taxResolved=true;
    const rows=r.lines.map(l=>{const p=product(l.sku);const q=(r.quote&&r.quote.lines&&r.quote.lines[l.sku])||{};const sell=Number.isFinite(Number(q.sell))?Number(q.sell):(Number.isFinite(Number(p?.contractPrice))?Number(p.contractPrice):null);const c=Number.isFinite(Number(q.cost))?Number(q.cost):(Number.isFinite(Number(p?.supplierCost))?Number(p.supplierCost):null);const vr=q.vat===0||q.vat===5?Number(q.vat):null;if(sell===null)hasSell=false;else subtotal+=sell*l.qty;if(c===null)costComplete=false;else cost+=c*l.qty;if(vr===null){taxResolved=false}else if(sell!==null){vat += sell*l.qty*vr/100;}return {l,p,q,sell,cost:c,vatRate:vr};});
    const gp=hasSell&&costComplete?subtotal-cost:null;const gm=gp!==null&&subtotal>0?gp/subtotal*100:null;
    return {rows,subtotal,cost,vat,total:subtotal+vat,gp,gm,hasSell,costComplete,taxResolved};
  }

  function schoolQuote(r,q,canApprove){
    const delivery=['Authorized','Procurement','Delivery'].includes(r.status)?tomorrowDelivery():'';
    return `<div class="schoolQuoteBox"><div class="quoteCustomerTop"><div><span class="eyebrow">${r.quoteRef||'ORDER UNDER REVIEW'}</span><h3>${friendlyStatus(r.status)}</h3></div>${customerStatusPill(r.status)}</div>${r.status==='Drafting'?`<div class="quoteStatePanel"><b>PSC is reviewing this order.</b><p>Your formal quotation will be sent to ${esc(accountEmailLabel())}.</p></div>`:''}${r.quoteRef?`<div class="tableWrap"><table class="dataTable"><thead><tr><th>ITEM</th><th>PACK</th><th>QTY</th><th>UNIT EX VAT</th><th>LINE EX VAT</th><th>VAT</th></tr></thead><tbody>${q.rows.map(x=>`<tr><td><b>${esc(x.p?.name||x.l.sku)}</b><div class="sub mono">${x.l.sku}</div></td><td>${esc(x.p?.pack||'')}</td><td>${x.l.qty}</td><td>${x.sell!==null?money(x.sell):'Pending'}</td><td>${x.sell!==null?money(x.sell*x.l.qty):'Pending'}</td><td>${x.vatRate===null?'Review':x.vatRate+'%'}</td></tr>`).join('')}</tbody></table></div><div class="quoteSummary"><div><span>SUBTOTAL EX VAT</span><b>${q.hasSell?money(q.subtotal):'Pending'}</b></div><div><span>VAT</span><b>${q.taxResolved?money(q.vat):'Review'}</b></div><div><span>TOTAL</span><b>${q.hasSell&&q.taxResolved?money(q.total):'Pending'}</b></div><div><span>VALIDITY</span><b>${esc(r.quote?.validity||'Pending')}</b></div></div>`:''}${r.status==='Sent'?`<div class="modalQuoteActions"><button class="button primary" data-confirm-quote="${r.id}">Confirm quotation</button><button class="button quietDanger" data-cancel-quote="${r.id}">Cancel quotation</button></div>`:''}${delivery?`<div class="deliveryPromise large"><span>TRACK ORDER</span><b>${delivery}</b><small>Delivery date is shown as the next calendar day for this prototype.</small></div>`:''}${r.status==='Accepted'?`<div class="quoteStatePanel delivered"><b>Delivered.</b><p>This order is now part of your purchase history and its items can be repeated from Replenish.</p></div>`:''}${r.status==='Cancelled'?`<div class="quoteStatePanel cancelled"><b>Cancelled.</b><p>${isArchived(r)?'This quotation is now in Archive.':`It will move to Archive on ${addDaysLabel(r.cancelledAt||r.createdAt,30)}.`}</p></div>`:''}</div>`;
  }

  function adminQuoteBuilder(r,q){
    const target=20;
    return `<div class="notice"><strong>Quote builder.</strong> Supplier cost and tax must be supported by current evidence before live issue. Values labelled “Demo planning assumption” are not supplier quotations.</div><div class="tableWrap"><table class="dataTable"><thead><tr><th>ITEM</th><th>QTY</th><th>DIRECT COST / UNIT</th><th>SELL / UNIT</th><th>VAT</th><th>LINE GM</th></tr></thead><tbody>${q.rows.map(x=>{const gm=x.sell!==null&&x.cost!==null&&x.sell>0?((x.sell-x.cost)/x.sell*100):null;return `<tr><td><b>${esc(x.p?.name||x.l.sku)}</b><div class="sub mono">${x.l.sku}</div>${x.q.costEvidence?`<div class="quoteLineWarning">${esc(x.q.costEvidence)}</div>`:''}</td><td>${x.l.qty}</td><td><input class="moneyInput" type="number" step="0.01" value="${x.cost===null?'':x.cost}" data-quote-field="${r.id}|${x.l.sku}|cost"></td><td><input class="moneyInput" type="number" step="0.01" value="${x.sell===null?'':x.sell}" data-quote-field="${r.id}|${x.l.sku}|sell"></td><td><select class="selectInput" data-quote-field="${r.id}|${x.l.sku}|vat"><option value="" ${x.vatRate===null?'selected':''}>Review</option><option value="0" ${x.vatRate===0?'selected':''}>0%</option><option value="5" ${x.vatRate===5?'selected':''}>5%</option></select></td><td>${gm===null?'—':`<b class="${gm<target?'dangerText':'successText'}">${gm.toFixed(1)}%</b>`}</td></tr>`}).join('')}</tbody></table></div><div class="quoteSummary"><div><span>DIRECT COST</span><b>${q.costComplete?money(q.cost):'Incomplete'}</b></div><div><span>SELL EX VAT</span><b>${q.hasSell?money(q.subtotal):'Incomplete'}</b></div><div><span>GROSS PROFIT</span><b>${q.gp===null?'Blocked':money(q.gp)}</b></div><div><span>TRUE GM</span><b class="${q.gm!==null&&q.gm<target?'dangerText':''}">${q.gm===null?'Blocked':q.gm.toFixed(1)+'%'}</b></div></div><div class="twoCol"><div><label class="fieldLabel">Delivery</label><input class="input" style="width:100%" value="${esc(r.quote?.delivery||'')}" data-quote-meta="${r.id}|delivery"><label class="fieldLabel" style="margin-top:10px">Terms</label><input class="input" style="width:100%" value="${esc(r.quote?.terms||'')}" data-quote-meta="${r.id}|terms"></div><div><label class="fieldLabel">Quotation status</label><select class="input" style="width:100%" data-request-status="${r.id}">${workflow.map(s=>`<option ${r.status===s?'selected':''}>${s}</option>`).join('')}</select><label class="fieldLabel" style="margin-top:10px">Quotation reference</label><input class="input" style="width:100%" value="${esc(r.quoteRef||'')}" data-quote-ref="${r.id}" placeholder="PSC-Q-YYYY-####"></div></div><div class="gateList" style="margin-top:16px"><div class="gate ${q.costComplete?'ok':'block'}"><span>All direct costs present</span><i></i></div><div class="gate ${q.taxResolved?'ok':'block'}"><span>VAT reviewed by line</span><i></i></div><div class="gate ${q.gm!==null&&q.gm>=20?'ok':'warn'}"><span>Target GM ≥ 20%</span><i></i></div><div class="gate warn"><span>Supplier stock / lead time requires current confirmation</span><i></i></div><div class="gate ${q.rows.some(x=>x.p?.regulated)?'warn':'ok'}"><span>Regulated route check</span><i></i></div><div class="gate block"><span>Funding / customer PO evidence not integrated in prototype</span><i></i></div></div>`;
  }

  function adminDashboard(){
    const open=state.requests.filter(r=>!['Accepted','Cancelled'].includes(r.status)).length;
    const activeQuotes=state.requests.filter(r=>['Sent','Authorized','Procurement','Delivery'].includes(r.status));
    const qvals=activeQuotes.map(calcQuote);const quoted=qvals.reduce((s,q)=>s+(q.hasSell?q.subtotal:0),0);const gp=qvals.reduce((s,q)=>s+(q.gp||0),0);const gm=quoted?gp/quoted*100:0;
    return shell(`<div class="pageHeader"><div><span class="eyebrow">PSC DEAL DESK</span><h1>Institutional supply control</h1><p>One desk for requests, quote economics, supplier evidence, release gates and fulfilment. Demo figures are illustrative unless backed by an identified evidence source.</p></div></div><div class="adminStatRow"><div class="adminStat"><span>OPEN REQUESTS</span><b>${open}</b></div><div class="adminStat"><span>QUOTED EX VAT</span><b>${money(quoted)}</b></div><div class="adminStat"><span>AUTHORIZED</span><b>${state.requests.filter(r=>r.status==='Authorized').length}</b></div><div class="adminStat"><span>EST. TRUE GP</span><b>${money(gp)}</b></div><div class="adminStat"><span>EST. GM</span><b>${gm.toFixed(1)}%</b></div><div class="adminStat"><span>PRODUCT MASTER</span><b>${D.products.length}</b></div></div><div class="actionGrid"><button class="actionCard" data-go="admin/requests"><div class="actionIcon">☷</div><div><b>Request queue</b><span>Convert needs into controlled quotes</span></div></button><button class="actionCard" data-go="admin/products"><div class="actionIcon">✚</div><div><b>Product master</b><span>Evidence, price and approvals</span></div></button><button class="actionCard" data-go="admin/fulfilment"><div class="actionIcon">⇄</div><div><b>Fulfilment rules</b><span>Route by site and source</span></div></button><button class="actionCard" data-go="admin/supplier-feed"><div class="actionIcon">⌁</div><div><b>Supplier feed</b><span>Acorus / Med7 data ingestion</span></div></button></div><div class="twoCol"><section class="panel"><div class="panelHeader"><h2>Requests needing attention</h2><button data-go="admin/requests">Open queue →</button></div><div class="tableWrap"><table class="dataTable"><thead><tr><th>REQUEST</th><th>ACCOUNT / SITE</th><th>LINES</th><th>STATUS</th><th>NEXT ACTION</th></tr></thead><tbody>${state.requests.filter(r=>r.status!=='Accepted').map(r=>`<tr class="clickable" data-admin-request="${r.id}"><td><b class="mono">${r.id}</b></td><td>${esc(r.groupName||state.groupName||'Institutional account')}<div class="sub">${esc(r.campus)}</div></td><td>${r.lines.length}</td><td>${statusPill(r.status)}</td><td>${r.status==='Drafting'?'Validate stock + price':r.status==='Sent'?'Resolve school decision':'Check procurement release'}</td></tr>`).join('')}</tbody></table></div></section><div style="display:grid;gap:14px"><div class="marginBox"><h3>Deal economics · active quoted demo</h3><div class="marginGrid"><div><span>DIRECT COST</span><b>${money(qvals.reduce((s,q)=>s+(q.costComplete?q.cost:0),0))}</b></div><div><span>SELL</span><b>${money(quoted)}</b></div><div><span>TRUE GM</span><b>${gm.toFixed(1)}%</b></div><div><span>FOC</span><b>AED 0</b></div><div><span>DELIVERY</span><b>Per quote</b></div><div><span>TARGET</span><b>20%</b></div></div></div><section class="panel"><div class="panelHeader"><h2>Release gate</h2></div><div class="gateList"><div class="gate ok"><span>Exact specification mapped</span><i></i></div><div class="gate warn"><span>Supplier stock current</span><i></i></div><div class="gate warn"><span>VAT / tax evidence by line</span><i></i></div><div class="gate ok"><span>Margin incl. direct costs</span><i></i></div><div class="gate block"><span>Customer funding / PO</span><i></i></div><div class="gate warn"><span>Regulated route validated</span><i></i></div></div></section></div></div><div class="notice" style="margin-top:18px"><strong>Control:</strong> a supplier PO is not released merely because a customer approved a quote. Funding, current supplier evidence, tax treatment, regulated route and delivery must pass the release gate.</div>`,true);
  }

  function adminProducts(){
    const q=ui.productQuery.toLowerCase();
    const rows=products().filter(p=>`${p.pscSku} ${p.name} ${p.brand}`.toLowerCase().includes(q)&&(ui.productCat==='All'||p.category===ui.productCat)&&(ui.evidence==='All'||p.evidenceStatus===ui.evidence));
    return shell(`<div class="pageHeader"><div><span class="eyebrow">CONTROLLED SKU REGISTER</span><h1>Product master</h1><p>Retail benchmarks, supplier costs and institutional prices are deliberately separate. Public Med7 references never populate acquisition cost.</p></div><button class="button light" data-export-products>Export CSV</button></div><div class="filterBar"><div class="searchInput"><span>⌕</span><input data-prod-q value="${esc(ui.productQuery)}" placeholder="Search PSC SKU, product or brand…"></div><select data-prod-filter="category"><option>All</option>${D.categories.map(c=>`<option ${c===ui.productCat?'selected':''}>${esc(c)}</option>`).join('')}</select><select data-prod-filter="evidence"><option>All</option><option ${ui.evidence==='Public benchmark'?'selected':''}>Public benchmark</option><option ${ui.evidence==='PSC project evidence'?'selected':''}>PSC project evidence</option><option ${ui.evidence==='Needs supplier feed'?'selected':''}>Needs supplier feed</option></select></div><section class="panel"><div class="tableWrap"><table class="dataTable"><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>SUPPLIER</th><th>SUPPLIER COST</th><th>PUBLIC BENCHMARK</th><th>ACCOUNT PRICE</th><th>EVIDENCE</th><th>FLAGS</th></tr></thead><tbody>${rows.map(p=>`<tr><td><div class="adminProductTitle"><div class="miniGlyph">${esc(p.brand.slice(0,2).toUpperCase())}</div><div><b>${esc(p.name)}</b><div class="sub mono">${p.pscSku}${p.supplierSku?` · SUP ${p.supplierSku}`:''}</div></div></div></td><td>${esc(p.category)}</td><td>${esc(p.supplier)}<div class="sourceNote">${esc(p.source)}</div></td><td><input class="adminCostInput ${Number.isFinite(Number(p.supplierCost))?'':'missing'}" type="number" step="0.01" placeholder="Missing" value="${Number.isFinite(Number(p.supplierCost))?p.supplierCost:''}" data-product-field="${p.pscSku}|supplierCost"><div class="sub">Must be verified before live use</div></td><td>${p.retailBenchmark?money(p.retailBenchmark):'—'}<div class="sub">Orientation only</div></td><td><input class="adminCostInput" type="number" step="0.01" placeholder="Quote" value="${Number.isFinite(Number(p.contractPrice))?p.contractPrice:''}" data-product-field="${p.pscSku}|contractPrice"></td><td>${badge(p.evidenceStatus,p.evidenceStatus==='Public benchmark'?'orange':p.evidenceStatus==='PSC project evidence'?'green':'')}<div class="sub">${p.lastVerified}</div></td><td><div style="display:flex;gap:4px;flex-wrap:wrap">${p.schoolApproved?badge('School list','green'):''}${p.regulated?badge('Controlled','red'):''}${badge(p.requirementStatus)}</div></td></tr>`).join('')}</tbody></table></div></section><div class="footerNote">Editing supplier cost or account price in this prototype creates a local audit entry. It does not convert a public benchmark or planning input into commercial evidence.</div>`,true);
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
    const image=p.imageUrl
      ? `<img src="${esc(p.imageUrl)}" alt="${esc(displayName)}" onerror="this.onerror=null;this.src='${esc(fallback)}'">`
      : `<div class="detailNeedVisual" style="--need-bg:${primary.bg};--need-ink:${primary.ink}"><b>${esc(primary.label)}</b></div>`;

    return `<div class="productDetailModal">
      <div class="modalHeader"><div><span class="eyebrow">${esc(primary.label)}</span><h2>${esc(displayName)}</h2><div class="smallMuted mono">${esc(p.pscSku)}</div></div><button class="iconBtn" data-modal-close>×</button></div>
      <div class="productDetailGrid">
        <div class="detailImagePane">${image}<div class="detailImageMeta">${p.brand&&p.brand!=='Specification-led'&&p.brand!=='Institutional range'?`<b>${esc(p.brand)}</b>`:''}<span>${esc(pack)}</span></div><div class="modalNeedChips">${needTags}</div></div>
        <div class="detailContentPane">
          ${mapped?`<div class="regulatoryHero mapped v25DhaHero"><div class="dhaModalBadge"><span>DHA</span><b>Mapped requirement</b></div><h3>${esc(p.dhaRequirement||'Mapped requirement')}</h3><p>${esc(p.dhaReference||'DHA requirement')} · ${esc(p.dhaStatus||'Status to verify')}</p></div>`:`<div class="regulatoryHero support"><span>INSTITUTIONAL CATALOGUE</span><h3>${esc(p.productType||'Institutional supply')}</h3><p>Product specification is reviewed before quotation.</p></div>`}
          <div class="specBlocks">
            ${mapped?`<section><span class="specLabel">DHA REQUIREMENT</span><p>${esc(p.dhaRequirement)}</p></section><section><span class="specLabel">REFERENCE & STATUS</span><p><strong>${esc(p.dhaReference||'—')}</strong> · ${esc(p.dhaStatus||'Needs verification')}</p>${p.dhaCondition?`<small>${esc(p.dhaCondition)}</small>`:''}</section>`:''}
            <section><span class="specLabel">PRODUCT SPECIFICATION</span><p>${esc(p.pscOfferedSpecification||p.spec||'Exact commercial specification will be confirmed with the quotation.')}</p></section>
          </div>
          ${mapped?`<div class="mappingDisclosure"><b>Regulatory clarity</b><p>Mapped to the applicable DHA clinic requirement. This is not a DHA product endorsement or product approval. Exact model suitability remains subject to specification verification.</p></div>`:''}
          ${p.regulated?'<div class="licensedNotice"><b>Licensed supply route</b><p>Availability and supply remain subject to applicable UAE licensing, recipient authorization, product registration, storage, batch/expiry and professional controls.</p></div>':''}
          <div class="detailActions"><button class="button light" data-modal-close>Close</button><button class="button primary" data-add="${p.pscSku}">Add to request</button></div>
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
    const [{data:lines,error:lineError},{data:quotes,error:quoteError},{data:schools,error:schoolError},{data:groups,error:groupError}] = await Promise.all([
      sb.from('order_lines').select('*').in('order_id',ids),
      sb.from('quotes').select('*').in('order_id',ids),
      authContext?.isPscAdmin ? sb.from('schools').select('id,name,campus_name,group_id') : Promise.resolve({data:[authContext.school],error:null}),
      authContext?.isPscAdmin ? sb.from('account_groups').select('id,name') : Promise.resolve({data:authContext.group?[authContext.group]:[],error:null})
    ]);
    if(lineError) throw lineError; if(quoteError) throw quoteError; if(schoolError) throw schoolError; if(groupError) throw groupError;
    const schoolMap=Object.fromEntries((schools||[]).filter(Boolean).map(x=>[x.id,x]));
    const groupMap=Object.fromEntries((groups||[]).filter(Boolean).map(x=>[x.id,x]));
    const quoteMap=Object.fromEntries((quotes||[]).map(q=>[q.order_id,q]));
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
    const r=state.requests.find(x=>x.id===id); if(!r?.dbId) return;
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
    } else switch(r){
      case 'home': html=landing();break;
      case 'about': html=aboutPage();break;
      case 'services': html=servicesPage();break;
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
      case 'portal/insights': html=insightsPage();break;
      case 'portal/archive': html=archivePage();break;
      case 'admin/dashboard': html=adminDashboard();break;
      case 'admin/products': html=adminProducts();break;
      case 'admin/requests': html=adminRequests();break;
      case 'admin/fulfilment': html=adminFulfilment();break;
      case 'admin/supplier-feed': html=adminFeed();break;
      default: html=landing();
    }
    $app.innerHTML=html; bind(); syncPublicHeader();
  }

  function bind(){
    document.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.go)));
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
    document.querySelectorAll('[data-mvp-login]').forEach(el=>el.addEventListener('click',signIn));
    document.querySelectorAll('[data-signout]').forEach(el=>el.addEventListener('click',signOut));
    document.querySelectorAll('[data-template]').forEach(el=>el.addEventListener('click',()=>applyTemplate(el.dataset.template)));
    document.querySelectorAll('[data-quick-add]').forEach(el=>el.addEventListener('click',()=>{const sku=el.dataset.quickAdd;const input=document.querySelector(`[data-quick-qty="${sku}"]`);addBasket(sku,Math.max(1,Number(input.value||1)))}));
    document.querySelectorAll('[data-request-reorder]').forEach(el=>el.addEventListener('click',()=>reorderRequest(el.dataset.requestReorder)));

    document.querySelectorAll('[data-replenish]').forEach(el=>el.addEventListener('click',()=>{const [sku,q]=el.dataset.replenish.split('|');addBasket(sku,Math.max(1,Number(q)||1));toast('<strong>Added to cart.</strong><br>Previous delivered quantity restored.')}));
    document.querySelectorAll('[data-reorder-order]').forEach(el=>el.addEventListener('click',()=>reorderRequest(el.dataset.reorderOrder)));
    document.querySelectorAll('[data-confirm-quote]').forEach(el=>el.addEventListener('click',async()=>{try{await updateCustomerQuote(el.dataset.confirmQuote,'confirm');toast(`<strong>Quotation confirmed.</strong><br>${tomorrowDelivery()}.`)}catch(e){console.error(e);toast('<strong>Could not confirm quotation.</strong>')}}));
    document.querySelectorAll('[data-cancel-quote]').forEach(el=>el.addEventListener('click',async()=>{try{await updateCustomerQuote(el.dataset.cancelQuote,'cancel');toast('<strong>Quotation cancelled.</strong><br>It will remain visible for 30 days before moving to Archive.')}catch(e){console.error(e);toast('<strong>Could not cancel quotation.</strong>')}}));
    document.querySelectorAll('[data-reorder-last]').forEach(el=>el.addEventListener('click',()=>{const r=state.requests.find(x=>x.campus===state.campus);if(r)reorderRequest(r.id)}));
    document.querySelectorAll('[data-request-view]').forEach(el=>el.addEventListener('click',()=>{ui.modal={type:'request',id:el.dataset.requestView,admin:false};render()}));
    document.querySelectorAll('[data-admin-request]').forEach(el=>el.addEventListener('click',()=>{ui.modal={type:'request',id:el.dataset.adminRequest,admin:true};render()}));
    document.querySelectorAll('[data-modal-close]').forEach(el=>el.addEventListener('click',()=>{ui.modal=null;render()}));
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
    document.querySelectorAll('[data-approve-quote]').forEach(el=>el.addEventListener('click',()=>{const r=state.requests.find(x=>x.id===el.dataset.approveQuote);r.status='Authorized';audit('Quotation confirmed by demo account user',r.id);save();render();toast(`<strong>Quotation confirmed.</strong><br>${tomorrowDelivery()}.`)}));
    document.querySelectorAll('[data-export-products]').forEach(el=>el.addEventListener('click',exportProducts));
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
