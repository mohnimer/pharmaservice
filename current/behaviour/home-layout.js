(() => {
  'use strict';

  const MARKUP = `
    <div class="home47">

      <section class="h47Hero">
        <div class="h47HeroCopy h47Reveal">
          <h1>Institutional healthcare supply.</h1>
          <p class="h47HeroLead">With intelligence, and one accountable supply partner.</p>
          <p class="h47HeroBody">Pharma Service helps institutions stay aligned with requirements, buy better and replenish with less friction.</p>
          <div class="h47HeroActions">
            <button class="button primary" data-go="start">Start with your requirement</button>
            <button class="button outline" data-go="catalogue">Explore the catalogue</button>
          </div>
        </div>

        <div class="h47HeroVisual h47Reveal" aria-hidden="true">
          <div class="h47HeroPhoto"></div>
          <div class="h47HeroPaper"></div>
          <div class="h47AccountCard">
            <div class="h47AccountTop"><span>Clinic account</span><b>PS</b></div>
            <div class="h47AccountStat"><strong>36</strong><span>approved items</span></div>
            <div class="h47AccountMini">
              <span><b>8</b> recurring lines</span>
              <span><b>2</b> replacements upcoming</span>
            </div>
          </div>
        </div>
      </section>

      <section class="h47Pillars">
        <div class="h47Shell">
          <div class="h47PillarIntro h47Reveal">
            <p>Good procurement gets clearer as the account builds.</p>
          </div>

          <div class="h47PillarCanvas h47Reveal">
            <article class="h47Pillar h47PillarNeed">
              <div class="h47PillarCopy">
                <span>01</span>
                <h2>Know what you need.</h2>
                <p>Requirements mapped, specifications checked and knowledgeable human support when something is not clear.</p>
              </div>
              <div class="h47NeedVisual">
                <div class="h47NeedHead"><span>Clinic requirement</span><b>PSC-CL-021</b></div>
                <div class="h47NeedRow"><b>BP monitor</b><span>Required</span></div>
                <div class="h47NeedRow"><b>Gauze 10 × 10</b><span>Specification confirmed</span></div>
                <div class="h47NeedRow"><b>Gloves · M</b><span>Needs verification</span></div>
                <div class="h47NeedFoot">Requirement → controlled specification</div>
              </div>
            </article>


            <article class="h47Pillar h47PillarBuy">
              <div class="h47PillarCopy">
                <span>02</span>
                <h2>Know you’re buying well.</h2>
                <p>Wholesale pricing, institutional promotions and better economics on the products your organisation buys most.</p>
              </div>
              <div class="h47BuyVisual">
                <div class="h47BuyHead"><span>Commercial review</span><b>PSC-CL-021</b></div>
                <div class="h47BuyLine"><div><b>Examination gloves</b><small>high-use line</small></div><span>Volume pricing</span></div>
                <div class="h47BuyLine"><div><b>Sterile gauze</b><small>repeat purchase</small></div><span>Supplier promo</span></div>
                <div class="h47BuyLine"><div><b>Test strips</b><small>approved specification</small></div><span>Pack compared</span></div>
              </div>
            </article>


            <article class="h47Pillar h47PillarNext">
              <div class="h47PillarCopy">
                <span>03</span>
                <h2>Know what comes next.</h2>
                <p>Purchase history, replenishment patterns, expiry and replacement visibility make repeat buying easier and more predictable.</p>
              </div>
              <div class="h47NextVisual">
                <div class="h47NextHead"><span>Account memory</span><b>PSC-CL-021</b></div>
                <div class="h47Timeline">
                  <div><i></i><b>Gloves</b><small>ordered 6×</small></div>
                  <div><i></i><b>Gauze</b><small>reorder expected</small></div>
                  <div><i></i><b>AED pads</b><small>replacement upcoming</small></div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="h47Sourcing">
        <div class="h47Shell h47SourcingGrid">
          <div class="h47SourceCopy h47Reveal">
            <h2>We handle the sourcing underneath it all.</h2>
            <p>One relationship with Pharma Service, even when the right solution comes from multiple specialist suppliers.</p>
          </div>

          <div class="h47SourceDiagram h47Reveal" aria-label="Multiple specialist sources converging into one Pharma Service relationship">
            <div class="h47SourceFragments">
              <span>Equipment</span>
              <span>Diagnostics</span>
              <span>Consumables</span>
              <span>Specialist supply</span>
              <span>Regulated lines</span>
            </div>
            <div class="h47SourceLines" aria-hidden="true">
              <i></i><i></i><i></i><i></i><i></i>
            </div>
            <div class="h47SourcePSC">
              <small>Institution sees</small>
              <b>One Pharma Service supply relationship</b>
            </div>
          </div>
        </div>
      </section>

      <section class="h47Catalogue">
        <div class="h47Shell">
          <div class="h47CatalogueHead h47Reveal">
            <div>
              <h2>Start with the requirement.</h2>
              <p>You do not need to know the supplier or exact catalogue structure. Start with what your institution needs and PS works backwards from there.</p>
            </div>
            <button class="h47TextLink" data-go="catalogue">Explore catalogue →</button>
          </div>

          <div class="h47CategoryGrid h47Reveal">
            <button class="h47Category" data-go="catalogue/wounds">
              <div><h3>Cuts &amp; Wounds</h3><p>Dressings, gauze, closure and wound protection</p></div>
              <img src="/assets/clinical-icons/wounds.png" alt="">
              <span>→</span>
            </button>

            <button class="h47Category" data-go="catalogue/breathing">
              <div><h3>Breathing &amp; Oxygen</h3><p>Nebulisation, oxygen delivery and respiratory support</p></div>
              <img src="/assets/clinical-icons/breathing.png" alt="">
              <span>→</span>
            </button>

            <button class="h47Category" data-go="catalogue/vitals">
              <div><h3>Vitals &amp; Assessment</h3><p>Blood pressure, temperature and oximetry</p></div>
              <img src="/assets/clinical-icons/vitals-assessment-exact.png?v=4700" alt="">
              <span>→</span>
            </button>

            <button class="h47Category" data-go="catalogue/infection">
              <div><h3>Infection Control &amp; PPE</h3><p>Gloves, masks, hygiene and disinfection</p></div>
              <img src="/assets/clinical-icons/infection.png" alt="">
              <span>→</span>
            </button>

            <button class="h47Category" data-go="catalogue/emergency">
              <div><h3>Emergency &amp; Response</h3><p>Resuscitation and urgent-use products</p></div>
              <img src="/assets/clinical-icons/emergency.png" alt="">
              <span>→</span>
            </button>

            <button class="h47Category" data-go="catalogue/equipment">
              <div><h3>Equipment &amp; Mobility</h3><p>Clinic furniture, mobility, storage and capital equipment</p></div>
              <img src="/assets/clinical-icons/equipment.png" alt="">
              <span>→</span>
            </button>
          </div>

          <div class="h47CatalogueFoot h47Reveal">
            <p><b>Can’t find it?</b> Send us the requirement. We source by specification, not only by what is listed.</p>
            <div>
              <button class="button primary" data-go="catalogue">Open Institutional Catalogue</button>
              <button class="button outline" data-go="start">Send a requirement</button>
            </div>
          </div>
        </div>
      </section>

      <section class="h47Workshop">
        <div class="h47Shell">
          <div class="h47WorkshopHead h47Reveal">
            <div>
              <h2>Understand what you’re buying.</h2>
              <p>Practical guidance on products, specifications and the details that affect suitability, readiness and cost.</p>
            </div>
            <button class="button outline" data-go="workshop">Enter The Workshop</button>
          </div>

          <div class="h47ArticleGrid h47Reveal">
            <a class="h47Article" href="/workshop/which-glove-should-i-actually-wear/">
              <div class="h47ArticleImage h47ArticleGlove">
                <img src="/assets/category-infection.webp" alt="">
              </div>
              <div class="h47ArticleMeta"><span>Product Basics</span><small>6 min read</small></div>
              <h3>Which Glove Should I Actually Wear?</h3>
              <p>Start with the task, exposure and procedure — not the colour of the box.</p>
            </a>

            <a class="h47Article" href="/workshop/oxygen-cylinder-is-not-an-oxygen-system/">
              <div class="h47ArticleImage h47ArticleOxygen">
                <img src="/assets/products/oxygen-cylinder.jpg" alt="">
              </div>
              <div class="h47ArticleMeta"><span>Equipment Readiness</span><small>7 min read</small></div>
              <h3>An Oxygen Cylinder Is Not an Oxygen System</h3>
              <p>Cylinder, regulator, gauge, flow control, tubing and secure storage belong to one readiness system.</p>
            </a>

            <a class="h47Article" href="/workshop/aed-has-expiring-parts-too/">
              <div class="h47ArticleImage h47ArticleAED">
                <img src="/assets/category-emergency.webp" alt="">
              </div>
              <div class="h47ArticleMeta"><span>Stock &amp; Expiry</span><small>3 min read</small></div>
              <h3>Your AED Has Expiring Parts Too</h3>
              <p>Pads, battery, accessories and the asset record all belong in the readiness check.</p>
            </a>
          </div>
        </div>
      </section>

      <section class="h47Account">
        <div class="h47Shell">
          <div class="h47AccountHead h47Reveal">
            <div>
              <h2>See what you’ve bought. Know what’s next.</h2>
              <p>PS remembers the account so procurement does not restart from zero.</p>
            </div>
            <button class="button outline" data-go="login">Open Clinic Portal</button>
          </div>

          <div class="h47AccountCanvas h47Reveal">
            <div class="h47PurchaseHistory">
              <div class="h47UiTop"><span>Purchase history</span><b>AEG Education</b></div>
              <div class="h47HistoryLine"><div><b>Examination gloves</b><small>6 orders</small></div><span>Last: Sep</span></div>
              <div class="h47HistoryLine"><div><b>Sterile gauze</b><small>4 orders</small></div><span>Last: Sep</span></div>
              <div class="h47HistoryLine"><div><b>Test strips</b><small>3 orders</small></div><span>Last: Aug</span></div>
            </div>

            <div class="h47ComingUp">
              <small>Coming up</small>
              <h3>AED pads</h3>
              <p>Replacement window approaching</p>
              <div><span>62 days</span><i></i></div>
            </div>

            <div class="h47Frequently">
              <small>Frequently ordered</small>
              <div><span>01</span><b>Examination gloves</b></div>
              <div><span>02</span><b>Sterile gauze</b></div>
              <div><span>03</span><b>Saline</b></div>
            </div>

            <div class="h47Reorder">
              <small>Repeat request</small>
              <h3>Reorder familiar lines</h3>
              <label><input type="checkbox" checked disabled> Gloves · M</label>
              <label><input type="checkbox" checked disabled> Gauze 10 × 10</label>
              <label><input type="checkbox" disabled> Saline</label>
              <button type="button" data-go="login">Review in portal →</button>
            </div>
          </div>

          <div class="h47Commercial h47Reveal">
            <div class="h47CommercialCopy">
              <h3>Better visibility creates better buying.</h3>
              <p>Once PS understands what an institution repeatedly purchases, commercial attention can focus where it matters most.</p>
            </div>
            <div class="h47CommercialLine">
              <small>Frequently purchased</small>
              <b>Examination gloves</b>
              <span>12 boxes / quarter</span>
            </div>
            <div class="h47CommercialLine h47CommercialOpportunity">
              <small>Commercial opportunity</small>
              <b>Volume pricing available</b>
              <span>Review at next quotation</span>
            </div>
          </div>
        </div>
      </section>

      <section class="h47Journey">
        <div class="h47Shell">
          <div class="h47JourneyHead h47Reveal">
            <h2>From first requirement to repeat supply.</h2>
            <p>One accountable Pharma Service relationship throughout.</p>
          </div>

          <div class="h47JourneyFlow h47Reveal">
            <div><span>01</span><b>Requirement</b></div>
            <i></i>
            <div><span>02</span><b>Specification</b></div>
            <i></i>
            <div><span>03</span><b>Quote</b></div>
            <i></i>
            <div><span>04</span><b>Supply</b></div>
            <i></i>
            <div><span>05</span><b>Record</b></div>
            <i></i>
            <div><span>06</span><b>Replenish</b></div>
          </div>

          <div class="h47JourneyActions h47Reveal">
            <button class="button primary" data-go="start">Start with your requirement</button>
            <button class="button outline" data-go="catalogue">Explore the catalogue</button>
          </div>
        </div>
      </section>

    </div>
  `;

  function install(){
    const page=document.querySelector('main.publicLanding');
    if(!page) return;

    const header=page.querySelector(':scope > .publicHeader');
    const footer=page.querySelector(':scope > .publicFooter');
    if(!header || !footer) return;

    const existing=page.querySelector(':scope > .home47');
    if(existing){
      bindReveal(existing);
      return;
    }

    [...page.children].forEach(child=>{
      if(child!==header && child!==footer) child.remove();
    });

    const holder=document.createElement('div');
    holder.innerHTML=MARKUP.trim();
    footer.insertAdjacentElement('beforebegin',holder.firstElementChild);
    page.dataset.v47Home='1';
    bindReveal(page.querySelector('.home47'));
  }

  function bindReveal(root){
    if(!root) return;
    const els=[...root.querySelectorAll('.h47Reveal')].filter(el=>!el.dataset.h47Bound);

    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      els.forEach(el=>{
        el.classList.add('in');
        el.dataset.h47Bound='1';
      });
      return;
    }

    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    },{threshold:.1,rootMargin:'0px 0px -6% 0px'});

    els.forEach((el,index)=>{
      el.dataset.h47Bound='1';
      el.style.setProperty('--h47-delay',`${Math.min(index%3,2)*45}ms`);
      const r=el.getBoundingClientRect();
      if(r.top < window.innerHeight*.9){
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