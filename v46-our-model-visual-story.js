(() => {
  'use strict';

  const MARKUP = `
    <div class="model46">

      <section class="m46Hero">
        <div class="m46Shell m46HeroGrid">
          <div class="m46HeroCopy m46Reveal">
            <h1>One supply relationship.</h1>
            <p>Send the requirement. PSC turns it into something clear, controlled and purchasable.</p>
            <div class="m46Actions">
              <button class="button primary" data-go="start">Tell us what you need</button>
              <button class="button outline" data-go="catalogue">Explore the catalogue</button>
            </div>
          </div>

          <div class="m46Frame m46HeroVisual m46Reveal" aria-label="Requirement becoming a controlled Pharma Service quotation">
            <div class="m46RoughCard m46TiltA">
              <div class="m46CardLabel">Clinic requirement</div>
              <div class="m46LooseRow"><span>BP monitor</span><b>2</b></div>
              <div class="m46LooseRow"><span>Gauze 10×10</span><b>10</b></div>
              <div class="m46LooseRow"><span>Gloves M</span><b>5</b></div>
              <div class="m46LooseRow"><span>Test strips</span><b>4</b></div>
            </div>

            <div class="m46FlowCue">↓</div>

            <div class="m46ReviewStrip">
              <span>Specification</span>
              <span>Sourcing</span>
              <span>Commercial review</span>
            </div>

            <div class="m46QuoteCard">
              <div class="m46QuoteTop">
                <div><b>Pharma Service quotation</b><small>One commercial relationship</small></div>
                <span class="m46PscMark">PSC</span>
              </div>
              <div class="m46QuoteRow"><span>01</span><b>Blood pressure monitor</b><i>MATCHED</i></div>
              <div class="m46QuoteRow"><span>02</span><b>Sterile gauze</b><i>CHECKED</i></div>
              <div class="m46QuoteRow"><span>03</span><b>Examination gloves</b><i>SOURCED</i></div>
              <div class="m46QuoteRow"><span>04</span><b>Glucose test strips</b><i>READY</i></div>
            </div>
          </div>
        </div>
      </section>

      <section class="m46Section">
        <div class="m46Shell m46Split">
          <div class="m46SectionCopy m46Reveal">
            <h2>Start with the requirement.</h2>
            <p>The customer does not need to know the exact SKU. A rough list, recurring need or single product request is enough to start.</p>
          </div>

          <div class="m46Frame m46Intake m46Reveal">
            <div class="m46InputStack">
              <div class="m46InputCard m46TiltB">
                <span>RFQ list</span>
                <b>“BP monitor x2<br>gloves M x5”</b>
              </div>
              <div class="m46InputCard">
                <span>Message</span>
                <b>“Need gauze + strips for school clinic”</b>
              </div>
              <div class="m46InputCard m46TiltA">
                <span>Recurring list</span>
                <b>Dressings · gloves · saline</b>
              </div>
            </div>

            <div class="m46Merge">→</div>

            <div class="m46IntakeCard">
              <small>Incoming requirement</small>
              <h3>PSC intake</h3>
              <div><span>Need</span><b>Captured</b></div>
              <div><span>Quantity</span><b>Captured</b></div>
              <div><span>Missing detail</span><b>Flagged</b></div>
              <div><span>Next action</span><b>Clarify & source</b></div>
            </div>
          </div>
        </div>
      </section>

      <section class="m46Section m46Soft">
        <div class="m46Shell">
          <div class="m46SectionCopy m46SectionCopyWide m46Reveal">
            <h2>We make the details clear.</h2>
            <p>Before PSC quotes anything, the supply details that can change what gets delivered are made explicit.</p>
          </div>

          <div class="m46Frame m46Clarify m46Reveal">
            <div class="m46CompareHead">
              <span>What arrives</span>
              <span>What PSC controls</span>
            </div>

            <div class="m46CompareRow">
              <div class="m46Need">
                <img src="/assets/clinical-icons/vitals-assessment-exact.png?v=4600" alt="">
                <b>BP monitor</b>
              </div>
              <div class="m46ControlledLine">
                <span>Cuff range</span><span>Exact model</span><span>Validation</span><span>Warranty</span>
              </div>
            </div>

            <div class="m46CompareRow">
              <div class="m46Need">
                <img src="/assets/clinical-icons/wounds.png" alt="">
                <b>Gauze</b>
              </div>
              <div class="m46ControlledLine">
                <span>Size</span><span>Ply</span><span>Sterile status</span><span>Pack basis</span>
              </div>
            </div>

            <div class="m46CompareRow">
              <div class="m46Need">
                <img src="/assets/clinical-icons/infection.png" alt="">
                <b>Gloves</b>
              </div>
              <div class="m46ControlledLine">
                <span>Nitrile</span><span>Powder-free</span><span>Size</span><span>Box quantity</span>
              </div>
            </div>

            <div class="m46CompareRow">
              <div class="m46Need">
                <img src="/assets/clinical-icons/diabetes.png" alt="">
                <b>Test strips</b>
              </div>
              <div class="m46ControlledLine">
                <span>Meter compatibility</span><span>Pack</span><span>Expiry</span><span>Availability</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="m46Section">
        <div class="m46Shell m46Split">
          <div class="m46SectionCopy m46Reveal">
            <h2>Then we source each line properly.</h2>
            <p>Different lines can take different routes underneath. The institution still deals with one accountable supplier.</p>
          </div>

          <div class="m46Frame m46SourceVisual m46Reveal">
            <div class="m46Basket">
              <small>Requirement basket</small>
              <b>4 controlled lines</b>
            </div>

            <div class="m46SourceLanes">
              <div class="m46Lane"><img src="/assets/clinical-icons/vitals-assessment-exact.png?v=4600" alt=""><span>Diagnostics</span><b>BP monitor</b></div>
              <div class="m46Lane"><img src="/assets/clinical-icons/wounds.png" alt=""><span>Consumables</span><b>Gauze</b></div>
              <div class="m46Lane"><img src="/assets/clinical-icons/infection.png" alt=""><span>PPE</span><b>Gloves</b></div>
              <div class="m46Lane"><img src="/assets/clinical-icons/diabetes.png" alt=""><span>Compatible line</span><b>Test strips</b></div>
            </div>

            <div class="m46Reconverge">↓</div>

            <div class="m46OneQuote">
              <span>Source per line.</span>
              <b>Sell one solution.</b>
              <small>One Pharma Service quotation</small>
            </div>
          </div>
        </div>
      </section>

      <section class="m46Section m46Soft">
        <div class="m46Shell m46Split m46SplitReverse">
          <div class="m46SectionCopy m46Reveal">
            <h2>Every order builds intelligence.</h2>
            <p>The relationship becomes smarter because the purchasing record stays useful.</p>
          </div>

          <div class="m46Frame m46Memory m46Reveal">
            <div class="m46HistoryCard">
              <div class="m46CardLabel">Purchase history</div>
              <div class="m46HistoryRow"><b>Wound-care refill</b><span>Delivered</span><small>28 Sep</small></div>
              <div class="m46HistoryRow"><b>BP monitors</b><span>Delivered</span><small>03 Sep</small></div>
              <div class="m46HistoryRow"><b>Clinic consumables</b><span>Quoted</span><small>21 Aug</small></div>
            </div>

            <div class="m46MemoryGrid">
              <article>
                <small>Frequently ordered</small>
                <b>Gloves · Gauze · Saline</b>
              </article>
              <article>
                <small>Recurring supply</small>
                <b>Monthly pattern visible</b>
              </article>
              <article>
                <small>Upcoming replacement</small>
                <b>AED pads · 62 days</b>
              </article>
              <article>
                <small>Approved specification</small>
                <b>Exact BP model retained</b>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="m46Section">
        <div class="m46Shell m46Split">
          <div class="m46SectionCopy m46Reveal">
            <h2>So the next purchase gets easier.</h2>
            <p>PSC does not restart from zero every time. Previous supply becomes the starting point for the next requirement.</p>
          </div>

          <div class="m46Frame m46Repeat m46Reveal">
            <div class="m46RepeatStep">
              <span>01</span>
              <small>Previous order</small>
              <b>12 supplied lines</b>
            </div>
            <div class="m46RepeatArrow">→</div>
            <div class="m46RepeatStep">
              <span>02</span>
              <small>Approved list</small>
              <b>Exact lines retained</b>
            </div>
            <div class="m46RepeatArrow">→</div>
            <div class="m46RepeatStep m46RepeatStepFinal">
              <span>03</span>
              <small>Repeat / replenish</small>
              <b>Faster next order</b>
            </div>

            <div class="m46RepeatObjects">
              <img src="/assets/clinical-icons/infection.png" alt="">
              <img src="/assets/clinical-icons/wounds.png" alt="">
              <img src="/assets/clinical-icons/diabetes.png" alt="">
              <img src="/assets/clinical-icons/breathing.png" alt="">
            </div>
          </div>
        </div>
      </section>

      <section class="m46Section m46Soft">
        <div class="m46Shell m46Split m46SplitReverse">
          <div class="m46SectionCopy m46Reveal">
            <h2>And better buying becomes possible.</h2>
            <p>Once purchasing is visible, PSC can focus commercial attention where it actually matters.</p>
          </div>

          <div class="m46Frame m46Commercial m46Reveal">
            <div class="m46CommercialTop">
              <small>Commercial review</small>
              <b>High-use lines</b>
            </div>
            <div class="m46CommercialRow">
              <div><b>Nitrile gloves · M</b><small>12-month repeat pattern</small></div>
              <span>Volume opportunity</span>
            </div>
            <div class="m46CommercialRow">
              <div><b>Sterile gauze 10 × 10</b><small>Frequently replenished</small></div>
              <span>Relevant promotion</span>
            </div>
            <div class="m46CommercialRow">
              <div><b>Compatible test strips</b><small>Repeat line with stable spec</small></div>
              <span>Sharper repeat pricing</span>
            </div>
            <div class="m46CommercialNote">Better economics on the lines the institution actually buys.</div>
          </div>
        </div>
      </section>

      <section class="m46Section">
        <div class="m46Shell">
          <div class="m46SectionCopy m46SectionCopyWide m46Reveal">
            <h2>That’s how supply becomes a partnership.</h2>
            <p>Not a one-off quote. A supply relationship that becomes clearer, easier to repeat and more useful over time.</p>
          </div>

          <div class="m46Frame m46Partnership m46Reveal">
            <div class="m46PartNode"><span>01</span><b>Requirement</b><small>What is actually needed</small></div>
            <div class="m46PartLink"></div>
            <div class="m46PartNode"><span>02</span><b>Specification</b><small>What the line must be</small></div>
            <div class="m46PartLink"></div>
            <div class="m46PartNode"><span>03</span><b>Sourcing</b><small>Best suitable route</small></div>
            <div class="m46PartLink"></div>
            <div class="m46PartNode"><span>04</span><b>Account memory</b><small>What was bought before</small></div>
            <div class="m46PartLink"></div>
            <div class="m46PartNode"><span>05</span><b>Repeat supply</b><small>What comes next</small></div>
          </div>

          <div class="m46PartnershipFoot m46Reveal">
            <span>One accountable Pharma Service relationship</span>
            <b>Clearer with every order.</b>
          </div>
        </div>
      </section>

      <section class="m46Final">
        <div class="m46Shell m46FinalGrid m46Reveal">
          <div>
            <h2>Send the requirement. We’ll take it from there.</h2>
            <p>One product, a recurring list, a clinic opening or a broader institutional RFQ.</p>
          </div>

          <div class="m46FinalCard">
            <small>Start with what you have</small>
            <div class="m46FinalOptions">
              <span>One product</span>
              <span>Recurring list</span>
              <span>Opening clinic</span>
              <span>Broader RFQ</span>
            </div>
            <button class="button primary" data-go="start">Tell us what you need</button>
          </div>
        </div>
      </section>

    </div>
  `;

  function install(){
    const page=document.querySelector('main.model17Page');
    if(!page) return;

    const header=page.querySelector(':scope > .publicHeader');
    const footer=page.querySelector(':scope > .publicFooter');
    if(!header || !footer) return;

    let existing=page.querySelector(':scope > .model46');
    if(existing) {
      bindReveal(existing);
      return;
    }

    page.querySelectorAll(':scope > .model43').forEach(el=>el.remove());

    const holder=document.createElement('div');
    holder.innerHTML=MARKUP.trim();
    const model=holder.firstElementChild;
    footer.insertAdjacentElement('beforebegin',model);
    bindReveal(model);
  }

  function bindReveal(root){
    const els=[...root.querySelectorAll('.m46Reveal')].filter(el=>!el.dataset.m46Bound);
    if(!els.length) return;

    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      els.forEach(el=>{
        el.classList.add('in');
        el.dataset.m46Bound='1';
      });
      return;
    }

    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    },{threshold:.12,rootMargin:'0px 0px -7% 0px'});

    els.forEach((el,index)=>{
      el.dataset.m46Bound='1';
      el.style.setProperty('--m46-delay',`${Math.min(index%4,3)*45}ms`);
      const r=el.getBoundingClientRect();
      if(r.top < window.innerHeight*.92){
        requestAnimationFrame(()=>el.classList.add('in'));
      } else {
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
  } else {
    schedule();
  }

  const app=document.getElementById('app');
  if(app) new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  window.addEventListener('hashchange',schedule);
})();