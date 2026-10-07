(() => {
  'use strict';

  const MEDIA = {
    'which-glove-should-i-actually-wear': '/assets/workshop/which-glove-should-i-actually-wear.webp?v=3922',
    'aed-has-expiring-parts-too': '/assets/workshop/aed-has-expiring-parts-too.webp?v=3922',
    'oxygen-cylinder-is-not-an-oxygen-system': '/assets/workshop/oxygen-cylinder-is-not-an-oxygen-system.webp?v=3922'
  };

  const START_ROUTE_ICONS = [
    '/assets/ui-icons/quotes.webp',
    '/assets/ui-icons/search.webp',
    '/assets/ui-icons/resources.webp'
  ];

  function setWorkshopDataMedia(){
    if(!Array.isArray(window.PSC_WORKSHOP)) return;
    window.PSC_WORKSHOP.forEach(g => {
      if(MEDIA[g.slug]) g.hero_image = MEDIA[g.slug];
    });
  }

  function enhanceModel(){
    const root=document.querySelector('.model17SupplyFlow');
    if(!root) return;

    root.querySelectorAll('.model17FlowCard.family > img, .model17LineThumb img').forEach(img => {
      if(img.dataset.v3922==='1') return;
      img.src='/assets/products/pulse-oximeter-clean.png?v=3922';
      img.alt='Fingertip pulse oximeter';
      img.dataset.v3922='1';
    });

    const lineTitle=root.querySelector('.model17FlowCard.line h3');
    if(lineTitle && /Pulse\s*[—-]\s*Fingertip Pulse Oximeter A2/i.test(lineTitle.textContent||'')){
      lineTitle.textContent='Fingertip Pulse Oximeter A2';
    }
  }

  function enhanceStart(){
    const hero=document.querySelector('.start16Hero');
    if(hero && !hero.dataset.v3922){
      hero.dataset.v3922='1';
      const board=hero.querySelector('.start16RouteBoard');
      if(board){
        [...board.querySelectorAll(':scope > button')].forEach((btn,i) => {
          if(btn.querySelector('.start22RouteIcon')) return;
          const icon=document.createElement('span');
          icon.className='start22RouteIcon';
          icon.setAttribute('aria-hidden','true');
          const img=document.createElement('img');
          img.src=START_ROUTE_ICONS[i]||START_ROUTE_ICONS[0];
          img.alt='';
          icon.appendChild(img);
          const copy=btn.querySelector('div');
          if(copy) btn.insertBefore(icon,copy);
        });
      }

      const copy=hero.querySelector('.start16HeroCopy');
      if(copy && !copy.querySelector('.start22SupplyCue')){
        const cue=document.createElement('div');
        cue.className='start22SupplyCue';
        cue.innerHTML='<span><img src="/assets/ui-icons/quotes.webp" alt="">Requirement</span><i>→</i><span><img src="/assets/ui-icons/search.webp" alt="">Review</span><i>→</i><span><img src="/assets/ui-icons/delivery.webp" alt="">Quotation</span>';
        copy.appendChild(cue);
      }
    }

    const intro=document.querySelector('.start16SendIntro');
    if(intro && !intro.querySelector('.start22SendMark')){
      const mark=document.createElement('div');
      mark.className='start22SendMark';
      mark.setAttribute('aria-hidden','true');
      mark.innerHTML='<span><img src="/assets/ui-icons/quotes.webp" alt=""></span><span><img src="/assets/ui-icons/my-requests.webp" alt=""></span>';
      intro.insertBefore(mark,intro.firstChild);
    }
  }

  function enhanceWorkshopCards(){
    Object.entries(MEDIA).forEach(([slug,src]) => {
      document.querySelectorAll(`button[data-go="workshop/${slug}"]`).forEach(button => {
        const card=button.closest('.workshopGuideCard');
        if(!card || card.dataset.v3922==='1') return;
        const visual=card.querySelector('.workshopGuideCardVisual');
        if(!visual) return;
        visual.innerHTML=`<img class="workshop22PreviewImage" src="${src}" alt="" loading="lazy" decoding="async">`;
        card.classList.add('hasWorkshopMedia');
        card.dataset.v3922='1';
      });
    });
  }

  function currentWorkshopSlug(){
    const hash=String(location.hash||'').replace(/^#/,'');
    const hashMatch=hash.match(/^workshop\/(.+)$/);
    if(hashMatch) return hashMatch[1].split(/[?#]/)[0];
    const pathMatch=location.pathname.match(/\/workshop\/([^/?#]+)/);
    return pathMatch?pathMatch[1]:'';
  }

  function enhanceWorkshopArticle(){
    const slug=currentWorkshopSlug();
    const src=MEDIA[slug];
    if(!src) return;
    const article=document.querySelector('.workshopArticle');
    const header=article?.querySelector('.workshopArticleHeader');
    if(!article || !header || article.querySelector('.workshop22HeroMedia')) return;
    const figure=document.createElement('figure');
    figure.className='workshop22HeroMedia';
    const guide=(window.PSC_WORKSHOP||[]).find(g=>g.slug===slug);
    figure.innerHTML=`<img src="${src}" alt="${guide?.title||'Workshop guide'}">`;
    header.insertAdjacentElement('afterend',figure);
  }

  let scheduled=false;
  function apply(){
    scheduled=false;
    setWorkshopDataMedia();
    enhanceModel();
    enhanceStart();
    enhanceWorkshopCards();
    enhanceWorkshopArticle();
  }
  function schedule(){
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(apply);
  }

  setWorkshopDataMedia();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();

  const app=document.getElementById('app');
  if(app) window.PSC_ENHANCEMENTS.createObserver(schedule).observe(app,{childList:true,subtree:true});
  window.addEventListener('hashchange',schedule);
  window.addEventListener('popstate',schedule);
})();
