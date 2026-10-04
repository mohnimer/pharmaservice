(() => {
  'use strict';
  const DHA_ICON='/assets/dha-requirement.png';
  function patchModelFlow(){
    const flow=document.querySelector('.model17SupplyFlow');
    if(!flow || flow.dataset.v3918==='1') return;
    flow.dataset.v3918='1';
    flow.innerHTML=`
      <article class="model17FlowCard category model18CategoryCard">
        <div class="model17FlowLabel">01 · CLINICAL CATEGORY</div>
        <img src="/assets/clinical-icons/vitals.png" alt="">
        <h3>Vitals &amp; Assessment</h3>
        <p>Start with the clinical need.</p>
      </article>
      <div class="model17Arrow" aria-hidden="true"><span>→</span><small>OPEN FAMILY</small></div>
      <article class="model17FlowCard family model18FamilyCard">
        <div class="model17FlowLabel">02 · PRODUCT FAMILY</div>
        <img class="model18DhaMark" src="${DHA_ICON}" alt="DHA requirement">
        <div class="model18FamilyVisual"><img src="/assets/products/pulse-oximeter.jpg" alt="Portable pulse oximeter"></div>
        <h3>Portable Pulse Oximeter</h3>
        <p><em>Common brands: Beurer, Braun</em></p>
      </article>
      <div class="model17Arrow" aria-hidden="true"><span>→</span><small>CONFIRM LINE</small></div>
      <article class="model17FlowCard line model18LineCard">
        <div class="model17FlowLabel">03 · LINE ITEM</div>
        <img class="model18DhaMark" src="${DHA_ICON}" alt="DHA requirement">
        <div class="model17LineThumb"><img src="/assets/products/pulse-oximeter.jpg" alt="Fingertip pulse oximeter"></div>
        <h3>Pulse — Fingertip Pulse Oximeter A2</h3>
        <p>Exact product, pack and commercial terms are confirmed before quotation.</p>
        <b>1 unit · Request quote</b>
      </article>`;
  }
  function schedule(){requestAnimationFrame(patchModelFlow);}
  window.addEventListener('hashchange',schedule);
  new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
  schedule();
})();
