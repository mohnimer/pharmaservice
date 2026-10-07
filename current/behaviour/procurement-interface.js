(() => {
  'use strict';

  const MARKUP = `
    <div class="model43">

      <section class="m43Hero">
        <div class="m43HeroShell">
          <div class="m43HeroCopy m43Reveal">
            <h1>
              <span>Easy procurement.</span>
              <em>Wholesale pricing.</em>
              <strong>More time for what matters.</strong>
            </h1>
            <p>Pharma Service turns an institutional requirement into the right specification, the right source and one coordinated commercial decision.</p>
            <div class="m43HeroActions">
              <button class="button primary" data-go="catalogue">Browse catalogue</button>
              <button class="button outline" data-go="start">Send a requirement</button>
            </div>
          </div>

          <div class="m43Desk" aria-label="Example school clinic requirement">
            <div class="m43PaperTab">Ready for quotation</div>
            <div class="m43Paper m43Reveal">
              <div class="m43PaperTop">
                <div>
                  <b>Clinic requirement · October</b>
                  <small>4 lines · mixed equipment and consumables</small>
                </div>
                <div class="m43DocMark">PSC</div>
              </div>

              <div class="m43TableHead">
                <span>#</span><span>Requirement</span><span>Pack</span><span>Status</span>
              </div>

              <div class="m43ReqRows">
                <div class="m43TableRow">
                  <div class="m43LineNo">01</div>
                  <div class="m43LineCopy"><b>Blood pressure monitor</b><small>Automatic upper-arm · adult cuff · exact model controlled</small></div>
                  <span>1 unit</span><span class="m43Status">MATCHED</span>
                </div>
                <div class="m43TableRow">
                  <div class="m43LineNo">02</div>
                  <div class="m43LineCopy"><b>Sterile gauze</b><small>10 × 10 cm · 8 ply · sterile pack</small></div>
                  <span>100 pcs</span><span class="m43Status">CHECKED</span>
                </div>
                <div class="m43TableRow">
                  <div class="m43LineNo">03</div>
                  <div class="m43LineCopy"><b>Examination gloves</b><small>Nitrile · powder-free · medium</small></div>
                  <span>100 / box</span><span class="m43Status">SOURCED</span>
                </div>
                <div class="m43TableRow">
                  <div class="m43LineNo">04</div>
                  <div class="m43LineCopy"><b>Glucose test strips</b><small>Compatibility confirmed before supply</small></div>
                  <span>50 / pack</span><span class="m43Status">READY</span>
                </div>
              </div>

              <div class="m43PaperFoot">
                <span>Specification · sourcing · commercial review</span>
                <b>One Pharma Service quotation</b>
              </div>
            </div>

            <div class="m43FloatNote m43Reveal">
              <small>The useful bit</small>
              <b>The institution doesn't need to manage four different sourcing problems.</b>
            </div>
          </div>
        </div>
      </section>

      <section class="m43Statement">
        <div class="m43StatementGrid m43Reveal">
          <h2>Procurement complexity is ours to manage.</h2>
          <p>Different lines can require different suppliers, evidence and routes. <strong>You keep one accountable commercial relationship.</strong></p>
        </div>
      </section>

      <section class="m43Transform">
        <div class="m43TransformShell m43Reveal">
          <div class="m43TransformHead">
            <h2>Watch the requirement become something you can actually buy.</h2>
            <p>The interface should show the work PSC performs — not hide it behind generic “solutions” language.</p>
          </div>

          <div class="m43StageTabs" role="tablist" aria-label="Procurement stages">
            <button type="button" class="active" data-m43-stage="incoming" aria-selected="true">1 · Incoming requirement</button>
            <button type="button" data-m43-stage="source" aria-selected="false">2 · Source per line</button>
            <button type="button" data-m43-stage="exact" aria-selected="false">3 · Confirm exact line</button>
            <button type="button" data-m43-stage="memory" aria-selected="false">4 · Keep account memory</button>
          </div>

          <div class="m43StageCanvas">

            <div class="m43Stage active" data-m43-panel="incoming">
              <div class="m43Incoming">
                <div class="m43RequestSource">
                  <h3>What arrives</h3>
                  <p>A normal customer list is often commercially incomplete. That is fine — it is the starting point.</p>
                  <div class="m43LooseList">
                    <div><b>BP monitor</b><span>Qty 2</span></div>
                    <div><b>Gauze 10×10</b><span>Qty 10</span></div>
                    <div><b>Gloves M</b><span>Qty 5</span></div>
                    <div><b>Test strips</b><span>Qty 4</span></div>
                  </div>
                </div>

                <div class="m43Controlled">
                  <h3>What PSC controls</h3>
                  <p>Before a line is commercially committed, the details that change what actually gets supplied are made explicit.</p>
                  <div class="m43ControlRows">
                    <div><span>BP monitor</span><b>Automatic upper-arm · cuff range · exact model · validation · warranty</b><i>CONTROLLED</i></div>
                    <div><span>Gauze</span><b>10 × 10 cm · sterile · ply · pack basis</b><i>CONTROLLED</i></div>
                    <div><span>Gloves</span><b>Nitrile · powder-free · medium · box quantity</b><i>CONTROLLED</i></div>
                    <div><span>Test strips</span><b>Meter compatibility · pack · expiry · availability</b><i>CONTROLLED</i></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="m43Stage" data-m43-panel="source">
              <div class="m43SourceGrid">
                <div class="m43SourceList">
                  <div class="m43Supplier">
                    <div class="m43SupplierIcon">◎</div>
                    <div><b>Diagnostic equipment source</b><small>Model · cuff · warranty · current availability</small></div>
                    <span>BP monitor</span>
                  </div>
                  <div class="m43Supplier">
                    <div class="m43SupplierIcon">✚</div>
                    <div><b>Medical consumables source</b><small>Sterile status · pack · expiry · landed cost</small></div>
                    <span>Gauze & gloves</span>
                  </div>
                  <div class="m43Supplier">
                    <div class="m43SupplierIcon">⌁</div>
                    <div><b>Compatible diagnostic consumable</b><small>Meter match · pack · expiry · availability</small></div>
                    <span>Test strips</span>
                  </div>
                </div>

                <div class="m43Converge"><div>→</div></div>

                <div class="m43QuoteCard">
                  <div class="m43QuoteTop"><b>Pharma Service quotation</b><span>One commercial decision</span></div>
                  <div class="m43QuoteLines">
                    <div class="m43QuoteLine"><div><b>Blood pressure monitor</b><small>Exact model attached</small></div><span>2 units</span></div>
                    <div class="m43QuoteLine"><div><b>Sterile gauze 10 × 10 cm</b><small>Pack basis confirmed</small></div><span>10 packs</span></div>
                    <div class="m43QuoteLine"><div><b>Nitrile gloves · M</b><small>100 / box</small></div><span>5 boxes</span></div>
                    <div class="m43QuoteLine"><div><b>Compatible glucose test strips</b><small>Meter match confirmed</small></div><span>4 packs</span></div>
                  </div>
                  <div class="m43QuoteBottom"><span>Different sources behind the scenes</span><b>One PSC relationship</b></div>
                </div>
              </div>
            </div>

            <div class="m43Stage" data-m43-panel="exact">
              <div class="m43Exact">
                <div class="m43ExactImage">
                  <img src="/assets/products/bp-monitor.jpg" alt="Blood pressure monitor">
                </div>
                <div class="m43ExactSheet">
                  <div class="m43CodeRow"><span>PSC-DIA-003</span><span>1 unit</span></div>
                  <h3>Braun ExactFit 1 Blood Pressure Monitor BUA 5000</h3>
                  <p>Automatic upper-arm BP monitor. Cuff range, validation evidence, current availability and warranty are confirmed before commitment.</p>
                  <div class="m43Spec">
                    <div><span>Use</span><b>Institutional clinic</b></div>
                    <div><span>Type</span><b>Automatic upper-arm</b></div>
                    <div><span>Pack / unit</span><b>1 unit</b></div>
                    <div><span>Selection control</span><b>Exact model retained on quotation</b></div>
                    <div><span>Availability</span><b>Confirmed at request</b></div>
                  </div>
                  <div class="m43ExactActions">
                    <button class="button primary" data-go="catalogue/vitals">View catalogue family</button>
                    <button class="button outline" data-go="start">Request this line</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="m43Stage" data-m43-panel="memory">
              <div class="m43MemoryView">
                <div class="m43Activity">
                  <div class="m43ActivityTop"><b>Account history</b><span>Previous commercial records</span></div>
                  <div class="m43ActivityRow">
                    <div><b>Clinic consumables</b><small>12 lines · 2 sites</small></div>
                    <span>Quotation</span><span>Awaiting approval</span><button type="button" data-go="login">Review →</button>
                  </div>
                  <div class="m43ActivityRow">
                    <div><b>Blood pressure monitors</b><small>4 units · exact model retained</small></div>
                    <span>Delivered</span><span>Previous supply</span><button type="button" data-go="login">Repeat →</button>
                  </div>
                  <div class="m43ActivityRow">
                    <div><b>Wound-care replenishment</b><small>8 recurring lines</small></div>
                    <span>Accepted</span><span>Documents stored</span><button type="button" data-go="login">Open →</button>
                  </div>
                </div>

                <div class="m43MemorySide">
                  <article>
                    <small>Previously supplied</small>
                    <b>Your usual BP monitor stays visible.</b>
                    <p>The next request can start from the exact line already supplied instead of reconstructing the order.</p>
                  </article>
                  <article>
                    <small>Documents</small>
                    <b>Quote, delivery and acceptance remain attached.</b>
                    <p>The commercial history should help the purchaser, not disappear into email.</p>
                  </article>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section class="m43Rhythm">
        <div class="m43RhythmShell">
          <article class="m43RhythmFeature m43Reveal">
            <div>
              <h2>Set up the clinic once. Keep it ready repeatedly.</h2>
              <p>The opening basket and recurring basket behave differently commercially, so the buying experience should make that distinction obvious.</p>
            </div>
            <div class="m43RhythmImage"><img src="/assets/category-equipment.webp" alt="Clinic equipment"></div>
          </article>

          <div class="m43RhythmStack">
            <article class="m43RhythmSmall recurring m43Reveal">
              <small>Recurring supply</small>
              <h3>Keep it running.</h3>
              <p>Dressings, gloves, test consumables, respiratory items and other lines that return again and again.</p>
              <img src="/assets/category-infection.png" alt="">
            </article>
            <article class="m43RhythmSmall specialist m43Reveal">
              <small>Specialist supply</small>
              <h3>Use the right route.</h3>
              <p>Products with additional licensing, professional or handling requirements stay inside the correct supply pathway.</p>
              <img src="/assets/category-breathing.webp" alt="">
            </article>
          </div>
        </div>
      </section>

      <section class="m43Final">
        <div class="m43FinalInner m43Reveal">
          <div>
            <h2>Send the requirement. We’ll turn it into something you can buy with confidence.</h2>
            <p>One product, a recurring list, capital equipment, a clinic opening or a broader institutional RFQ.</p>
          </div>
          <div class="m43FinalActions">
            <button class="button primary" data-go="start">Send a requirement</button>
            <button class="button outline" data-go="catalogue">Browse catalogue</button>
          </div>
        </div>
      </section>

    </div>
  `;

  function install(){
    const page=document.querySelector('main.model17Page');
    if(!page || page.dataset.v43==='1') return;

    const header=page.querySelector(':scope > .publicHeader');
    const footer=page.querySelector(':scope > .publicFooter');
    if(!header || !footer) return;

    [...page.children].forEach(child=>{
      if(child!==header && child!==footer) child.remove();
    });

    footer.insertAdjacentHTML('beforebegin',MARKUP);
    page.dataset.v43='1';
    bindStages(page);
    bindReveal(page);
  }

  function bindStages(root){
    root.querySelectorAll('[data-m43-stage]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const key=btn.dataset.m43Stage;
        root.querySelectorAll('[data-m43-stage]').forEach(x=>{
          const active=x===btn;
          x.classList.toggle('active',active);
          x.setAttribute('aria-selected',String(active));
        });
        root.querySelectorAll('[data-m43-panel]').forEach(panel=>{
          panel.classList.toggle('active',panel.dataset.m43Panel===key);
        });
      });
    });
  }

  function bindReveal(root){
    const els=[...root.querySelectorAll('.m43Reveal')];
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
      const rect=el.getBoundingClientRect();
      if(rect.top<window.innerHeight*.9){
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
      install();
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',schedule,{once:true});
  }else{
    schedule();
  }

  const app=document.getElementById('app');
  if(app) window.PSC_ENHANCEMENTS.createObserver(schedule).observe(app,{childList:true,subtree:true});

  window.addEventListener('hashchange',schedule);
})();