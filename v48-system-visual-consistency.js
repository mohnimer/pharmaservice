(() => {
  'use strict';

  const SOURCE_MARKUP = `
    <div class="h48SourceBoard" aria-label="How Pharma Service consolidates specialist sourcing">
      <div class="h48SourceRows">
        <div class="h48SourceRow"><span>01</span><div><b>Equipment</b><small>Specialist equipment source</small></div></div>
        <div class="h48SourceRow"><span>02</span><div><b>Diagnostics</b><small>Model and compatibility checked</small></div></div>
        <div class="h48SourceRow"><span>03</span><div><b>Consumables</b><small>Pack, specification and cost compared</small></div></div>
        <div class="h48SourceRow"><span>04</span><div><b>Specialist supply</b><small>Correct technical route retained</small></div></div>
        <div class="h48SourceRow"><span>05</span><div><b>Regulated lines</b><small>Handled through the applicable licensed route</small></div></div>
      </div>
      <div class="h48SourceFlow" aria-hidden="true"></div>
      <div class="h48SourceSheet">
        <div class="h48SourceSheetTop"><span>Institution receives</span><b>PSC</b></div>
        <h3>One quotation.<br>One accountable order.</h3>
        <div class="h48SourceSheetRows">
          <div><span>Specification control</span><b>Pharma Service</b></div>
          <div><span>Commercial contact</span><b>Pharma Service</b></div>
          <div><span>Delivery coordination</span><b>Pharma Service</b></div>
          <div><span>Order record & follow-up</span><b>Pharma Service</b></div>
        </div>
        <div class="h48SourceSheetFoot">Multiple sources underneath. One procurement experience in front.</div>
      </div>
    </div>`;

  function installSourceVisual(){
    const diagram=document.querySelector('.home47 .h47SourceDiagram');
    if(!diagram || diagram.dataset.v48Source==='1') return;
    diagram.innerHTML=SOURCE_MARKUP.trim();
    diagram.dataset.v48Source='1';
  }

  function install(){
    installSourceVisual();
    document.documentElement.dataset.pscVisual='v48';
  }

  let queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;install();});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();

  const app=document.getElementById('app');
  if(app) new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  window.addEventListener('hashchange',schedule);
})();
