(() => {
  'use strict';

  const SOURCE_MARKUP = `
    <figure class="pscOrderDiagram" aria-label="Diagnostic equipment, consumables, clinic furniture and medicines brought together in one Pharma Service order">
      <div class="pscOrderCategories">
        <span>Diagnostic equipment</span><span>Consumables</span><span>Clinic furniture</span><span>Medicines</span>
      </div>
      <svg class="pscOrderConnections" viewBox="0 0 100 240" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 H55 Q100 30 100 65 M0 90 H100 M0 150 H100 M0 210 H55 Q100 210 100 175"/></svg>
      <div class="pscOrderInvoice">
        <header><img src="/assets/psc-logo-current.png" alt="Pharma Service"><div><small>Illustrative order</small><h3>Invoice</h3></div></header>
        <div class="pscOrderColumns"><span>Product / specification</span><span>Qty · AED amount</span></div>
        <div class="pscOrderInvoiceBody">
          <div class="pscOrderInvoiceLines"><div>Adrenaline injection · 2 ampoules</div><div>Hydrocortisone injection · 2 vials</div><div>Fingertip pulse oximeter · A2</div><div>Automatic upper-arm BP monitor · BUA 5000</div></div>
          <div class="pscOrderWholesale">Wholesale<br>prices</div>
        </div>
        <footer><span>VAT &amp; total</span><span>Confirmed for your order</span></footer>
      </div>
      <figcaption>However many sources sit underneath it, you deal with Pharma Service.<small>Source per line. Sell one solution.</small></figcaption>
    </figure>`;

  function installSourceVisual(){
    const diagram=document.querySelector('.home47 .h47SourceDiagram');
    if(!diagram || diagram.dataset.v48Source==='1') return;
    diagram.innerHTML=SOURCE_MARKUP.trim();
    diagram.dataset.v48Source='1';
  }

  function install(){
    installSourceVisual();
    document.documentElement.dataset.pscVisual='v48';
  }

  let queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;install();});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();

  const app=document.getElementById('app');
  if(app) window.PSC_ENHANCEMENTS.createObserver(schedule).observe(app,{childList:true,subtree:true});
  window.addEventListener('hashchange',schedule);
})();
