(() => {
  'use strict';

  function fixHeroCopy(){
    const host=document.querySelector('main.publicLanding .m445HomeHeroText');
    if(!host) return;

    const h1=host.querySelector('h1');
    const sub=host.querySelector('.v453HeroSub');

    if(h1 && h1.textContent.trim()!=='Institutional healthcare supply'){
      h1.textContent='Institutional healthcare supply';
    }
    if(sub && sub.textContent.trim()!=='with intelligence, and one accountable supply partner.'){
      sub.textContent='with intelligence, and one accountable supply partner.';
    }
  }

  function run(){
    fixHeroCopy();
  }

  let queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;run();});
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',schedule,{once:true});
  }else{
    schedule();
  }

  const root=document.getElementById('app')||document.body;
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true,characterData:true});
  window.addEventListener('hashchange',schedule);
  [100,400,1000].forEach(ms=>setTimeout(schedule,ms));
})();