(() => {
  'use strict';

  const HEADING = 'The specifics matter.';
  const P1 = 'Even the simplest items can create compliance issues, wasted time and unnecessary cost when the details are wrong.';
  const P2 = 'We pay close attention to the specification, helping ensure what you procure is appropriate for your institution and aligned with applicable local requirements.';

  function normalise(value){
    return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function updateCopy(){
    const lead = document.querySelector('.homeEditorialIntro .homeEditorialLead');
    const copy = document.querySelector('.homeEditorialIntro .homeEditorialCopy');

    if(lead && copy){
      const heading = lead.querySelector('h2');
      const paragraphs = [...copy.querySelectorAll('p')];

      if(heading) heading.textContent = HEADING;
      if(paragraphs[0]) paragraphs[0].textContent = P1;
      if(paragraphs[1]) paragraphs[1].textContent = P2;

      paragraphs.slice(2).forEach(p => {
        if(
          p.classList.contains('homeEditorialStrong') ||
          normalise(p.textContent).includes('the aim is simple')
        ){
          p.remove();
        }
      });
      return;
    }

    // Defensive fallback for older render variants.
    const blocks = [...document.querySelectorAll('section, article, div')];
    for(const block of blocks){
      const text = normalise(block.textContent);
      if(
        !text.includes('a clinic can ask for something perfectly ordinary') ||
        !text.includes('the aim is simple')
      ) continue;

      const heading = block.querySelector('h1,h2,h3,h4');
      const paragraphs = [...block.querySelectorAll('p')];
      if(heading) heading.textContent = HEADING;
      if(paragraphs[0]) paragraphs[0].textContent = P1;
      if(paragraphs[1]) paragraphs[1].textContent = P2;
      paragraphs.slice(2).forEach(p => p.remove());
      break;
    }
  }

  let queued = false;
  function schedule(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      updateCopy();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', schedule, { once:true });
  }else{
    schedule();
  }

  const app = document.getElementById('app');
  if(app){
    new MutationObserver(schedule).observe(app, { childList:true, subtree:true });
  }
  window.addEventListener('hashchange', schedule);
})();
