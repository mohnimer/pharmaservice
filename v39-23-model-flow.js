(() => {
  'use strict';

  const ROWS = [
    {
      icon:'/assets/category-vitals.webp?v=3777',
      category:'Vitals & Assessment',
      family:'Portable Pulse Oximeter',
      line:'Fingertip pulse oximeter',
      route:'Equipment source',
      note:'Model + pack confirmed'
    },
    {
      icon:'/assets/category-infection.png?v=3915',
      category:'Infection Control & PPE',
      family:'Examination Gloves',
      line:'Nitrile examination gloves',
      route:'Consumables source',
      note:'Material + size + pack confirmed'
    },
    {
      icon:'/assets/category-breathing.webp?v=3777',
      category:'Breathing & Oxygen',
      family:'Medical Oxygen',
      line:'Cylinder + regulator setup',
      route:'Qualified oxygen route',
      note:'System compatibility confirmed'
    },
    {
      icon:'/assets/category-medicines.png?v=3915',
      category:'Medicines & Symptoms',
      family:'Cetirizine',
      line:'Registered presentation / pack',
      route:'Licensed medicine route',
      note:'Presentation + pack confirmed'
    }
  ];

  function requirementRow(r,i){
    return `<article class="model23ReqRow">
      <img src="${r.icon}" alt="" aria-hidden="true">
      <div class="model23ReqCopy">
        <span>${r.category}</span>
        <b>${r.family}</b>
        <small>${r.line}</small>
      </div>
      <em>${String(i+1).padStart(2,'0')}</em>
    </article>`;
  }

  function routeRow(r){
    return `<div class="model23RouteRow"><span></span><b>${r.route}</b><i>✓</i></div>`;
  }

  function quoteRow(r){
    return `<div class="model23QuoteRow"><div><b>${r.family}</b><small>${r.note}</small></div><span>Included</span></div>`;
  }

  function replacement(){
    return `<div class="model23System" aria-label="How Pharma Service turns one requirement into one coordinated quotation">
      <section class="model23Requirement">
        <div class="model23PanelHead"><span>01 · ONE REQUIREMENT</span><h3>What the clinic needs.</h3><p>The requirement can contain completely different product types.</p></div>
        <div class="model23ReqList">${ROWS.map(requirementRow).join('')}</div>
      </section>

      <div class="model23Connector model23ConnectorIn" aria-hidden="true"><span>→</span></div>

      <section class="model23Desk">
        <div class="model23DeskBadge"><img src="/assets/psc-logo-current.png" alt="Pharma Service"></div>
        <span class="model23DeskKicker">PHARMA SERVICE</span>
        <h3>Source each line where it belongs.</h3>
        <p>Different categories can follow different supply routes while PSC keeps the commercial responsibility together.</p>
        <div class="model23RouteList">${ROWS.map(routeRow).join('')}</div>
        <div class="model23DeskRule"><b>Source per line.</b><span>Sell one solution.</span></div>
      </section>

      <div class="model23Connector model23ConnectorOut" aria-hidden="true"><span>→</span></div>

      <section class="model23Quote">
        <div class="model23QuoteTop"><div><span>02 · ONE COMMERCIAL RESPONSE</span><h3>One coordinated quotation.</h3></div><img src="/assets/ui-icons/quotes.webp" alt="" aria-hidden="true"></div>
        <div class="model23QuoteMeta"><span>PHARMA SERVICE</span><b>Institutional supply</b></div>
        <div class="model23QuoteList">${ROWS.map(quoteRow).join('')}</div>
        <div class="model23QuoteFoot"><b>One point of contact.</b><span>Specification, quotation and delivery coordination stay together.</span></div>
      </section>
    </div>`;
  }

  function apply(){
    const section=document.querySelector('.model17Source');
    const flow=section?.querySelector('.model17SupplyFlow');
    if(!section || !flow || section.dataset.v3923==='1') return;
    section.dataset.v3923='1';
    flow.outerHTML=replacement();
  }

  let scheduled=false;
  function schedule(){
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;apply();});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
  const app=document.getElementById('app');
  if(app) new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  window.addEventListener('hashchange',schedule);
  window.addEventListener('popstate',schedule);
})();
