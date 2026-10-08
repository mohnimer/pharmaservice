(() => {
  'use strict';

  const MARKUP = `
    <div class="model46">

      <section class="m46Hero">
        <div class="m46Shell m46HeroGrid">
          <div class="m46HeroCopy m46Reveal">
            <h1>One supply relationship.</h1>
            <p>A clinic requirement may involve ten products from five different places. You shouldn’t have to manage five suppliers to buy them.</p>
            <p>Pharma Service brings the requirement together and stays accountable for the supply.</p>
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
                <span class="m46PscMark">PS</span>
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
            <h2>Start with what you need.</h2>
            <p>Send us the list, search in your own words or describe the requirement as you understand it. It doesn’t need to be translated into supplier language first.</p>
          </div>

          <div class="m46Frame m46Intake m46Reveal">
            <div class="m46InputStack">
              <div class="m46InputCard m46TiltB">
                <span>RFQ list</span>
                <b>“BP monitor x2<br>gloves M x5”</b>
              </div>
              <div class="m46InputCard">
                <span>Message</span>
                <b>“big sterile gauze<br>antihistamine”</b>
              </div>
              <div class="m46InputCard m46TiltA">
                <span>Opening list</span>
                <b>clinic opening list.xlsx</b>
              </div>
            </div>

            <div class="m46Merge">→</div>

            <div class="m46IntakeCard">
              <small>Incoming requirement</small>
              <h3>PS intake</h3>
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
            <h2>We make the detail clear.</h2>
            <p>We match the requirement to actual products and clarify the things that change what should be supplied: size, pack, model, quantity or compatibility.</p>
          </div>

          <div class="m46Frame m46Clarify m46Reveal">
            <div class="m46CompareHead">
              <span>What arrives</span>
              <span>What we confirm</span>
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
            <p>The best source for a BP monitor may not be the best source for dressings, furniture or medicines. We source each line where it makes sense and bring it back together commercially.</p>
          </div>

          <div class="m46Frame m46SourceVisual m46Reveal">
            <div class="m46Basket">
              <small>Requirement basket</small>
              <b>4 product lines</b>
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
            <h2>You manage one order.</h2>
            <p>One quotation. One point of contact. One coordinated supply, even when the products underneath come through different routes.</p>
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
                <small>Previous product</small>
                <b>AED pads · pack recorded</b>
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
            <h2>And the next order starts further ahead.</h2>
            <p>What was supplied becomes useful account history. Repeat lines are easier to find, existing products don’t need to be rediscovered and your purchasing record becomes clearer over time.</p>
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
            <h2>Set it up. Keep it running.</h2>
            <p>Opening a clinic and keeping it supplied are different jobs. We help with both.</p>
          </div>

          <div class="m46Frame m46Commercial m46Reveal">
            <div class="m46CommercialTop">
              <small>Opening and repeat supply</small>
              <b>One supply relationship</b>
            </div>
            <div class="m46CommercialRow">
              <div><b>Set it up.</b><small>Beds, diagnostics, emergency equipment and clinic furniture.</small></div>
              <span>Opening requirements</span>
            </div>
            <div class="m46CommercialRow">
              <div><b>Keep it running.</b><small>Gloves, gauze, testing supplies, respiratory products and medicines.</small></div>
              <span>Repeat requirements</span>
            </div>
            <div class="m46CommercialRow">
              <div><b>Refills and replacements.</b><small>Start with the product already in use and confirm what fits.</small></div>
              <span>Confirm the detail</span>
            </div>
            <div class="m46CommercialNote">From the opening list to the next refill.</div>
          </div>
        </div>
      </section>

      <section class="m46Section">
        <div class="m46Shell">
          <div class="m46SectionCopy m46SectionCopyWide m46Reveal">
            <h2>That’s how supply becomes a partnership.</h2>
            <p>The first order solves today’s requirement. Keeping the record together makes the next one easier.</p>
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
            <h2>Tell us what you need. We’ll make it easier to buy.</h2>
            <p>One product, a rough list, an old order or a clinic opening. Start with what you have.</p>
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
  if(app) window.PSC_ENHANCEMENTS.createObserver(schedule).observe(app,{childList:true,subtree:true});
  window.addEventListener('hashchange',schedule);
})();
