/* Customer-facing merchandising only. No catalogue, commercial or evidence writes. */
(() => {
 'use strict';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

 const families=[
  {key:'gloves',name:'Gloves',tab:'Gloves',copy:'Choose by material, size and exact pack.',families:['PSC-SC-C05'],ids:['PSC-PPE-001','PSC-PPE-002'],tone:'sage'},
  {key:'gauze',name:'Gauze & dressings',tab:'Gauze & dressings',copy:'Explore the listed sterile gauze and dressing packs.',families:['PSC-SC-C23'],ids:['PSC-WND-002','PSC-WND-016'],tone:'sand'},
  {key:'thermometers',name:'Thermometers',tab:'Thermometers',copy:'Compare the listed models and pack details.',families:['PSC-SC-B23'],ids:['PSC-DIA-002','PS-AC-48939D08EF0A'],tone:'blue'},
  {key:'glucose-testing',name:'Glucose testing',tab:'Glucose testing',copy:'Find meters and strips by exact model and pack.',skus:['PSC-DBT-001','PSC-DBT-002','PSC-DBT-003','PSC-DBT-004','PSC-DBT-005'],ids:['PSC-DBT-003','PSC-DBT-004'],tone:'rose'},
  {key:'syringes',name:'Syringes',tab:'Syringes',copy:'Browse the listed sizes and presentations.',families:['PSC-SC-C24'],ids:['PSC-DSP-002','PSC-DSP-003'],tone:'sage'},
  {key:'oxygen-masks',name:'Oxygen masks',tab:'Oxygen masks',copy:'Adult and paediatric options, by exact pack.',families:['PSC-SC-C09'],ids:['PSC-RES-004','PSC-RES-005'],tone:'blue'},
  {key:'nebulizer-accessories',name:'Nebulizer accessories',tab:'Nebulizer accessories',copy:'Review the listed masks and tubing. Confirm device compatibility.',families:['PSC-SC-C08'],ids:['PSC-RES-003','PSC-RES-007'],tone:'sage'}
 ];
 const config=key=>families.find(f=>f.key===key)||null;
 const matches=(p,key)=>{const f=config(key);return !!f&&((f.families||[]).includes(p.catalogueParentId||p.catalogueReferenceFamilyId||'')||(f.skus||[]).includes(p.pscSku));};
 const key=()=>{const value=new URLSearchParams(location.hash.split('?')[1]||'').get('family');return config(value)?value:'';};
 function html({products,imageFor,countFor,needId='all',searching=false}){
  const selected=config(key());
  if(selected)return `<div class="shopfrontFamilyFilter" role="region" aria-label="Selected product family"><span>Browsing <b>${esc(selected.name)}</b></span><button class="button light" data-shopfront-clear>View all families</button></div>`;
  if(needId.startsWith('dha-'))return '';
  const available=families.map(b=>{const members=products.filter(p=>matches(p,b.key));const images=members.filter(p=>!p.regulated&&p.workbookDecision!=='ENQUIRY ONLY').map(p=>({p,url:imageFor(p)})).filter(x=>x.url);images.sort((a,c)=>{const rank=x=>{const i=b.ids.indexOf(x.p.pscSku);return i<0?999:i;};return rank(a)-rank(c);});return {...b,members,images:images.slice(0,2)};}).filter(b=>b.images.length).slice(0,5);
  if(!available.length)return '';
  return `<section class="shopfrontFamilies" data-shopfront-carousel role="region" aria-roledescription="carousel" aria-label="Explore product families" ${searching?'hidden':''}>
   <div class="shopfrontFamilySlides">${available.map((b,i)=>`<article class="shopfrontFamilySlide shopfrontTone-${b.tone}" id="family-slide-${b.key}" data-family-key="${b.key}" role="tabpanel" aria-labelledby="family-tab-${b.key}" ${i?'hidden':''}>
    <div class="shopfrontFamilyCopy"><h2>${esc(b.name)}</h2><p>${esc(b.copy)}</p><button class="button dark" data-shopfront-family="${b.key}" aria-label="Shop ${esc(b.name)}">Shop range</button><small>${countFor(b.members)} catalogue listing${countFor(b.members)===1?'':'s'}</small></div>
    <div class="shopfrontFamilyProducts" aria-label="${esc(b.name)} catalogue photographs">${b.images.map(({p,url})=>`<img src="${esc(url)}" alt="${esc(p.name)} — ${esc(p.cataloguePack||p.pack||'pack to confirm')}" loading="eager" decoding="async">`).join('')}</div>
   </article>`).join('')}</div>
   <div class="shopfrontFamilyControls"><div role="tablist" aria-label="Choose a product family">${available.map((b,i)=>`<button id="family-tab-${b.key}" role="tab" aria-controls="family-slide-${b.key}" aria-selected="${i?'false':'true'}" tabindex="${i?'-1':'0'}" data-shopfront-tab="${i}">${esc(b.tab||b.name)}</button>`).join('')}</div>${available.length>1?'<button class="shopfrontRotation" data-shopfront-rotation aria-label="Pause family rotation"><span aria-hidden="true">Ⅱ</span></button>':''}</div>
  </section>`;
 }
 const memory=new Map();
 let cleanup=()=>{};
 function mount(){
  cleanup();cleanup=()=>{};const root=document.querySelector('[data-shopfront-carousel]');if(!root)return;
  const tabs=[...root.querySelectorAll('[data-shopfront-tab]')],slides=[...root.querySelectorAll('.shopfrontFamilySlide')],toggle=root.querySelector('[data-shopfront-rotation]'),media=matchMedia('(prefers-reduced-motion: reduce)');
  const scope=location.hash.split('?')[0],saved=memory.get(scope);let active=saved?Math.max(0,tabs.findIndex(t=>t.textContent===saved.family)):0,paused=media.matches||!!saved?.paused,hover=false,visible=true;const controller=new AbortController(),options={signal:controller.signal};
  const updateToggle=()=>{if(!toggle)return;toggle.setAttribute('aria-label',paused?'Play family rotation':'Pause family rotation');toggle.innerHTML=paused?'<span aria-hidden="true">▷</span>':'<span aria-hidden="true">Ⅱ</span>';};
  const select=(index,focus=false)=>{active=(index+tabs.length)%tabs.length;slides.forEach((s,i)=>s.hidden=i!==active);tabs.forEach((t,i)=>{t.setAttribute('aria-selected',String(i===active));t.tabIndex=i===active?0:-1;});if(focus)tabs[active].focus();};
  tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>{paused=true;updateToggle();select(index);},options);tab.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();paused=true;updateToggle();select(e.key==='Home'?0:e.key==='End'?tabs.length-1:active+(e.key==='ArrowRight'?1:-1),true);},options);});
  root.addEventListener('mouseenter',()=>hover=true,options);root.addEventListener('mouseleave',()=>hover=false,options);root.addEventListener('focusin',e=>{if(e.target!==toggle){paused=true;updateToggle();}},options);
  toggle?.addEventListener('click',()=>{paused=!paused;updateToggle();},options);
  const motion=()=>{if(media.matches){paused=true;updateToggle();}};media.addEventListener('change',motion,options);
  const stage=root.querySelector('.shopfrontFamilySlides');
  const sizeSlides=()=>{if(root.hidden||!root.clientWidth)return;let height=0;for(const slide of slides){const hidden=slide.hidden,old=slide.getAttribute('style');slide.hidden=false;slide.style.cssText='position:absolute;visibility:hidden;inset:0 auto auto 0;width:100%;height:auto;';height=Math.max(height,Math.ceil(slide.getBoundingClientRect().height));if(old===null)slide.removeAttribute('style');else slide.setAttribute('style',old);slide.hidden=hidden;}if(height&&stage.style.height!==height+'px')stage.style.height=height+'px';};
  const resize=new ResizeObserver(sizeSlides);resize.observe(root);sizeSlides();document.fonts?.ready.then(()=>{if(root.isConnected)sizeSlides();});
  const observer=new IntersectionObserver(entries=>visible=entries[0]?.isIntersecting!==false,{threshold:0.1});observer.observe(root);
  const timer=tabs.length>1?setInterval(()=>{if(!paused&&!hover&&visible&&!document.hidden&&!root.hidden&&root.isConnected&&!document.querySelector('.modalBackdrop,.requestDrawer,[aria-modal="true"]'))select(active+1);},7000):null;
  select(active);updateToggle();cleanup=()=>{memory.set(scope,{family:tabs[active]?.textContent,paused});controller.abort();observer.disconnect();resize.disconnect();if(timer)clearInterval(timer);};
 }
 window.PSC_FAMILY_SHOPFRONT=Object.freeze({matches,key,html,mount});
})();
