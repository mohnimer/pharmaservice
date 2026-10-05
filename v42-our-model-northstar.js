(() => {
  'use strict';

  const MARKUP = `
    <div class="model42Experience">
      <section class="model42Hero">
        <div class="model42HeroFrame">
          <div class="model42HeroCopy model42Reveal">
            <h1>
              <span>Easy procurement.</span>
              <em>Wholesale pricing.</em>
              <strong>More time for what matters.</strong>
            </h1>
            <p>We source the right products, consolidate them into one quotation, coordinate the order and stay accountable through delivery.</p>
            <div class="model42HeroActions">
              <button class="button primary" data-go="catalogue">Browse catalogue</button>
              <button class="button model42QuietAction" data-go="start">Send a requirement</button>
            </div>
          </div>

          <div class="model42Workbench model42Reveal" aria-label="Example institutional requirement being prepared for quotation">
            <div class="model42WorkbenchTop">
              <b>Clinic requirement</b>
              <span>4 lines · one quotation</span>
            </div>
            <div class="model42ReqRows">
              <div class="model42ReqRow">
                <div class="model42ReqNum">01</div>
                <div class="model42ReqCopy"><b>Blood pressure monitor</b><small>Upper arm · adult cuff · exact model to confirm</small></div>
                <div class="model42ReqState">MATCHED</div>
              </div>
              <div class="model42ReqRow">
                <div class="model42ReqNum">02</div>
                <div class="model42ReqCopy"><b>Sterile gauze</b><small>10 × 10 cm · 8 ply · sterile pack</small></div>
                <div class="model42ReqState">CHECKED</div>
              </div>
              <div class="model42ReqRow">
                <div class="model42ReqNum">03</div>
                <div class="model42ReqCopy"><b>Examination gloves</b><small>Nitrile · powder-free · medium</small></div>
                <div class="model42ReqState">SOURCED</div>
              </div>
              <div class="model42ReqRow">
                <div class="model42ReqNum">04</div>
                <div class="model42ReqCopy"><b>Glucose test strips</b><small>Compatible meter confirmed before supply</small></div>
                <div class="model42ReqState">READY</div>
              </div>
            </div>
            <div class="model42WorkbenchFoot">
              <span>Specification → sourcing → commercial review</span>
              <b>PSC coordinates the whole basket</b>
            </div>
          </div>
        </div>
      </section>

      <section class="model42Complexity">
        <div class="model42ComplexityHead model42Reveal">
          <h2>Procurement complexity is ours to manage.</h2>
          <p>Different products need different suppliers, checks and commercial routes. <strong>You keep one accountable Pharma Service relationship.</strong></p>
        </div>

        <div class="model42Chain model42Reveal">
          <article>
            <small>01</small>
            <b>Get the specification right.</b>
            <p>Model, size, pack, compatibility, expiry and accessories where they matter.</p>
          </article>
          <article>
            <small>02</small>
            <b>Source each line properly.</b>
            <p>The best suitable route may differ by equipment, consumable or regulated line.</p>
          </article>
          <article>
            <small>03</small>
            <b>Bring it into one decision.</b>
            <p>One coordinated quotation with the relevant commercial terms made clear.</p>
          </article>
          <article>
            <small>04</small>
            <b>Make the next order easier.</b>
            <p>What was supplied, quoted and documented should remain useful to the account.</p>
          </article>
        </div>
      </section>

      <section class="model42Supply">
        <div class="model42SupplyInner">
          <div class="model42SupplyHead model42Reveal">
            <h2>Institutions buy in different rhythms.</h2>
            <p>Some requirements establish the clinic. Others return every month, every term or whenever stock and expiry say they should.</p>
          </div>

          <div class="model42CaseGrid">
            <article class="model42Case model42CaseLarge model42Reveal">
              <div>
                <small>Opening supply</small>
                <h3>Set up the clinic properly.</h3>
                <p>Furniture, diagnostics, monitoring, emergency equipment and the other capital items needed to make the room operational.</p>
              </div>
              <div class="model42CaseVisual">
                <img src="/assets/category-equipment.webp" alt="Clinical equipment and mobility supplies">
              </div>
            </article>

            <div class="model42CaseStack">
              <article class="model42Case recurring model42Reveal">
                <small>Recurring supply</small>
                <h3>Keep it ready.</h3>
                <p>Dressings, gloves, test consumables, respiratory items, hygiene products and replacements.</p>
                <div class="model42CaseMiniVisual"><img src="/assets/category-infection.webp" alt=""></div>
              </article>

              <article class="model42Case regulated model42Reveal">
                <small>Specialist & regulated lines</small>
                <h3>Use the right route.</h3>
                <p>Medicines, oxygen-related products and other controlled lines are handled through the appropriate licensed and professional route.</p>
                <div class="model42CaseMiniVisual"><img src="/assets/category-medicines.webp" alt=""></div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="model42Catalogue">
        <div class="model42CatalogueFrame model42Reveal">
          <div class="model42CatalogueHead">
            <div>
              <h2>From a requirement to the exact line.</h2>
              <p>The catalogue starts broad, then gets precise. Choose the clinical need, narrow to the family, then confirm the actual line that should be quoted.</p>
            </div>
            <button class="button outline" data-go="catalogue">Open catalogue</button>
          </div>

          <div class="model42StageTabs" role="tablist" aria-label="Catalogue hierarchy">
            <button type="button" class="active" data-model42-stage="category" aria-selected="true">1 · Clinical need</button>
            <button type="button" data-model42-stage="family" aria-selected="false">2 · Product family</button>
            <button type="button" data-model42-stage="line" aria-selected="false">3 · Exact line</button>
          </div>

          <div class="model42StageViewport">
            <div class="model42Stage active" data-model42-panel="category">
              <div class="model42CategoryDemo">
                <article class="model42CategoryTile main">
                  <strong>Vitals &amp; Assessment</strong>
                  <p>Blood pressure, temperature, oximetry and clinical assessment.</p>
                  <img src="/assets/category-vitals.webp" alt="">
                </article>
                <article class="model42CategoryTile breathing">
                  <strong>Breathing &amp; Oxygen</strong>
                  <p>Respiratory support and delivery.</p>
                  <img src="/assets/category-breathing.webp" alt="">
                </article>
                <article class="model42CategoryTile wounds">
                  <strong>Cuts &amp; Wounds</strong>
                  <p>Dressings and wound protection.</p>
                  <img src="/assets/category-wounds.webp" alt="">
                </article>
                <article class="model42CategoryTile testing">
                  <strong>Diabetes &amp; Testing</strong>
                  <p>Meters, strips and related testing.</p>
                  <img src="/assets/category-diabetes.webp" alt="">
                </article>
              </div>
            </div>

            <div class="model42Stage" data-model42-panel="family">
              <div class="model42FamilyDemo">
                <div class="model42FamilyImage">
                  <img src="/assets/products/bp-monitor.jpg" alt="Blood pressure monitor">
                </div>
                <div class="model42FamilySheet">
                  <h3>Blood Pressure Monitoring</h3>
                  <p>The purchaser starts with the requirement, not an arbitrary brand. The family keeps comparable options together until the exact model is selected.</p>
                  <div class="model42SpecRows">
                    <div><span>Use</span><b>Institutional / clinic</b></div>
                    <div><span>Type</span><b>Automatic upper-arm</b></div>
                    <div><span>Cuff</span><b>Adult range to be confirmed</b></div>
                    <div><span>What matters next</span><b>Model · validation · warranty · availability</b></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="model42Stage" data-model42-panel="line">
              <div class="model42LineDemo">
                <div class="model42LineImage">
                  <img src="/assets/products/bp-monitor.jpg" alt="Braun ExactFit 1 blood pressure monitor">
                </div>
                <div class="model42LineSheet">
                  <div class="model42LineCode"><span>PSC-DIA-003</span><span>1 unit</span></div>
                  <h3>Braun ExactFit 1 Blood Pressure Monitor BUA 5000</h3>
                  <p>Automatic upper-arm BP monitor. Cuff range, validation evidence, current availability and warranty are confirmed before commitment.</p>
                  <div class="model42SpecRows">
                    <div><span>Specification</span><b>Automatic upper-arm BP monitor</b></div>
                    <div><span>Pack / unit</span><b>1 unit</b></div>
                    <div><span>Commercial basis</span><b>Quotation before commitment</b></div>
                    <div><span>Availability</span><b>Confirmed at request</b></div>
                    <div><span>Selection control</span><b>Exact model and cuff requirement retained on quote</b></div>
                  </div>
                  <div class="model42LineActions">
                    <button class="button primary" data-go="catalogue/vitals">View in catalogue</button>
                    <button class="button outline" data-go="start">Request this line</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="model42Memory">
        <div class="model42MemoryHead model42Reveal">
          <h2>The second order should be easier than the first.</h2>
          <p>Previous supply is useful information. Products, quotations and documents should make replenishment faster rather than disappear into inboxes.</p>
        </div>

        <div class="model42MemoryBoard">
          <div class="model42History model42Reveal">
            <div class="model42HistoryTitle"><b>Account history</b><span>Illustrative buyer view</span></div>
            <div class="model42HistoryRow">
              <div><b>Clinic consumables</b><small>12 lines · 2 sites</small></div>
              <span>Quotation</span><span>Awaiting approval</span><button type="button" data-go="login">Review →</button>
            </div>
            <div class="model42HistoryRow">
              <div><b>Blood pressure monitors</b><small>4 units · exact model retained</small></div>
              <span>Delivered</span><span>Previous supply</span><button type="button" data-go="login">Repeat →</button>
            </div>
            <div class="model42HistoryRow">
              <div><b>Wound-care replenishment</b><small>8 recurring lines</small></div>
              <span>Accepted</span><span>Documents stored</span><button type="button" data-go="login">Open →</button>
            </div>
          </div>

          <div class="model42Useful">
            <article class="model42Reveal">
              <small>Purchaser shortcut</small>
              <b>Your usual line should stay visible.</b>
              <p>Previously supplied products can become the starting point for the next request.</p>
            </article>
            <article class="model42Reveal">
              <small>Need something different?</small>
              <b>Send the requirement as it is.</b>
              <p>RFQ, spreadsheet, PDF or rough list — the sourcing work begins from what you already have.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="model42Final">
        <div class="model42FinalInner model42Reveal">
          <div>
            <h2>Give us the requirement. We’ll work out how to supply it.</h2>
            <p>One product, a recurring list, capital equipment, a clinic opening or a broader institutional RFQ.</p>
          </div>
          <div class="model42FinalActions">
            <button class="button primary" data-go="start">Send a requirement</button>
            <button class="button outline" data-go="catalogue">Browse catalogue</button>
          </div>
        </div>
      </section>
    </div>
  `;

  function rebuild(){
    const page=document.querySelector('main.model17Page');
    if(!page || page.dataset.v42==='1') return;

    const header=page.querySelector(':scope > .publicHeader');
    const footer=page.querySelector(':scope > .publicFooter');
    if(!header || !footer) return;

    [...page.children].forEach(child=>{
      if(child!==header && child!==footer) child.remove();
    });

    footer.insertAdjacentHTML('beforebegin',MARKUP);
    page.dataset.v42='1';
    setupTabs(page);
    setupReveal(page);
  }

  function setupTabs(root){
    root.querySelectorAll('[data-model42-stage]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const name=btn.dataset.model42Stage;
        root.querySelectorAll('[data-model42-stage]').forEach(x=>{
          const on=x===btn;
          x.classList.toggle('active',on);
          x.setAttribute('aria-selected',String(on));
        });
        root.querySelectorAll('[data-model42-panel]').forEach(panel=>{
          panel.classList.toggle('active',panel.dataset.model42Panel===name);
        });
      });
    });
  }

  function setupReveal(root){
    const els=[...root.querySelectorAll('.model42Reveal')];
    if(!els.length) return;

    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      els.forEach(el=>el.classList.add('in'));
      return;
    }

    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    },{threshold:.12,rootMargin:'0px 0px -5% 0px'});

    els.forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.top<window.innerHeight*.9){
        requestAnimationFrame(()=>el.classList.add('in'));
      }else{
        io.observe(el);
      }
    });
  }

  let queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{
      queued=false;
      rebuild();
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',schedule,{once:true});
  }else{
    schedule();
  }

  const app=document.getElementById('app');
  if(app){
    new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  }

  window.addEventListener('hashchange',schedule);
})();