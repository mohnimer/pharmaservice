(() => {
  'use strict';

  function replacement(){
    return `<div class="model24Walkthrough" aria-label="How the Pharma Service catalogue is organised">
      <article class="model24Step model24CategoryStep">
        <div class="model24StepCopy">
          <span class="model24Number">01 · CATEGORY</span>
          <h3>Start with the right clinical category.</h3>
          <p>The category split keeps the catalogue practical: wounds, breathing, vitals, screening, medicines, infection control, emergency, equipment and the other areas of care are separated by what the clinic is actually trying to do.</p>
        </div>
        <div class="model24CategoryVisual">
          <img src="/assets/model-walkthrough/category-vitals.webp?v=3924" alt="Vitals and Assessment category card">
        </div>
      </article>

      <div class="model24Down" aria-hidden="true"><span>↓</span></div>

      <article class="model24Step model24FamilyStep">
        <div class="model24StepCopy">
          <span class="model24Number">02 · PRODUCT FAMILY</span>
          <h3>Then narrow it to the product family.</h3>
          <p>Families group the same requirement together before an exact brand, model, presentation or pack is chosen. That keeps the catalogue useful without pretending every request starts with a specific SKU.</p>
        </div>
        <div class="model24FamilyVisual">
          <img src="/assets/model-walkthrough/family-selector.webp?v=3924" alt="Product family selector showing several family options">
        </div>
      </article>

      <div class="model24Down" aria-hidden="true"><span>↓</span></div>

      <article class="model24Step model24LineStep">
        <div class="model24StepCopy">
          <span class="model24Number">03 · EXACT LINE</span>
          <h3>Then confirm the line itself.</h3>
          <p>The line page carries the detail that actually matters when buying: specification, pack or unit, supply basis, pricing or quote status, availability, requirement mapping and brand or product preference where relevant.</p>
        </div>
        <div class="model24LineVisual">
          <img src="/assets/model-walkthrough/line-detail.webp?v=3924" alt="Example product family line detail page for an electronic blood pressure apparatus">
        </div>
      </article>
    </div>`;
  }

  function apply(){
    const section=document.querySelector('.model17Source');
    if(!section || section.dataset.v3924==='1') return;
    const old=section.querySelector('.model23System') || section.querySelector('.model17SupplyFlow');
    if(!old) return;
    section.dataset.v3924='1';
    old.outerHTML=replacement();
    const intro=section.querySelector('.model17SourceIntro');
    if(intro){
      const p=intro.querySelector('p');
      if(p) p.textContent='The catalogue is organised from broad clinical need to exact product detail: choose the category, choose the family, then confirm the line.';
    }
  }

  let pending=false;
  function schedule(){
    if(pending) return;
    pending=true;
    requestAnimationFrame(()=>{pending=false;apply();});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
  const app=document.getElementById('app');
  if(app) window.PSC_ENHANCEMENTS.createObserver(schedule).observe(app,{childList:true,subtree:true});
  window.addEventListener('hashchange',schedule);
  window.addEventListener('popstate',schedule);
})();
