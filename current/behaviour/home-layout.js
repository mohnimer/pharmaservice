(() => {
  'use strict';

  const MARKUP = `
    <div class="home47 h47Compact">
      <section class="h47Hero">
        <div class="h47HeroCopy h47Reveal">
          <h1><em>Shop</em> the catalogue, review quotations, track orders &amp; replenish items, with compliance checks every step of the way.</h1>
          <div class="h47HeroActions">
            <button class="button primary" data-go="our-model">Explore our model</button>
            <button class="button outline" data-go="contact">Reach out</button>
          </div>
        </div>
        <div class="h47HeroVisual" aria-hidden="true"><div class="h47HeroPhoto"></div></div>
      </section>
      <section class="h47Catalogue">
        <div class="h47Shell">
          <section class="psIntelligentSearch h47Discovery h47Reveal" aria-label="Find clinic supplies">
            <h2>Search</h2>
            <label class="h47SearchLabel" for="psHomeCommand">Search the catalogue</label>
            <form data-ps-command-form><input id="psHomeCommand" type="search" data-cat-q aria-label="Search catalogue" placeholder="big sterile gauze, a wheelchair, a BP monitor…" autocomplete="off" maxlength="400"><button class="button dark" type="submit">Search</button></form>
          </section>

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

      <section class="h47Journey">
        <div class="h47Shell">
          <div class="h47JourneyHead h47Reveal">
            <h2>From first requirement to repeat supply.</h2>
            <p>The first order solves today’s requirement. A good account makes the next one easier.</p>
          </div>

          <div class="h47JourneyFlow h47Reveal">
            <div><span>01</span><b>First requirement</b></div>
            <i></i>
            <div><span>02</span><b>Clarify</b></div>
            <i></i>
            <div><span>03</span><b>Quote</b></div>
            <i></i>
            <div><span>04</span><b>Supply</b></div>
            <i></i>
            <div><span>05</span><b>Account history</b></div>
            <i></i>
            <div><span>06</span><b>Repeat requirement</b></div>
          </div>

        </div>
      </section>
      <section class="h47Visibility"><div class="h47Shell">
          <div class="h47Commercial h47Reveal">
            <div class="h47CommercialCopy">
              <h3>Better visibility creates better buying.</h3>
              <p>Knowing what you buy regularly helps us review the packs, quantities and pricing that matter to your account.</p>
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
      </div></section>
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
