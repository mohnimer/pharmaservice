/* Admin presentation only. Reuses existing artwork and line icons; no event,
   request, permission, commercial or publication behavior is replaced. */
(() => {
 'use strict';
 const routes={dashboard:['news-updates','home'],sales:['deals','reports'],mail:['messages','mail'],requests:['quotes','checklist'],customers:['my-account','users'],tasks:['schedule','calendar'],onboarding:['team-access','users'],resources:['resources','boxes'],settings:['settings','settings'],products:['shop','boxes'],storefront:['shop','edit'],'family-options':['categories','checklist'],fulfilment:['delivery','rules'],'supplier-feed':['reports','reports']};
 const rules=[['[data-ws-refresh],[data-sync-mail]','repeat'],['[data-new-opportunity],[data-contact-opportunity]','request'],['[data-new-customer],[data-review-school],[data-school-invitations],[data-contact-from]','users'],['[data-task-edit],[data-edit-opportunity]','edit'],['[data-calendar],[data-export-calendar],[data-request-task],[data-customer-task],[data-care-task],[data-row-task]','calendar'],['[data-opportunity-email],[data-contact-email],[data-compose-email],[data-row-reply],[data-row-reply-all],[data-row-forward]','mail'],['[data-open-builder],[data-admin-request],[data-draft-source]','request'],['[data-cms-save],[data-cms-primary]','approved'],['[data-cms-publish]','boxes'],['[data-cms-delete-media]','close'],['[data-cms-image-save]','assets'],['[data-mail-view="incoming"]','mail'],['[data-mail-view="sent"]','mail'],['[data-mail-view="drafts"]','edit'],['[data-mail-view="scheduled"]','calendar']];
 const sectionIcons={'Next step':'checklist','Customer requirement':'request','Contact details':'users','Activity & next actions':'calendar','Operations':'rules','Business emails':'mail','Core product':'boxes','Supply & commercial evidence':'reports','Product images':'assets','Storefront presentation':'edit','Institutional storefront':'boxes','Wholesale storefront':'boxes','Add a task':'calendar','Mailbox connection':'mail','Ingestion controls':'checklist','Required feed fields':'reports'};
 const excluded='.navLink,.iconBtn,.adminBrand,.pscInboxOpen,.wsCustomer,.wsResource,.wsRequest,.actionCard,.cmsStorefrontCard';
 const image=name=>{const img=document.createElement('img');img.src='/assets/ui-icons/'+name+'.webp';img.alt='';img.width=48;img.height=48;return img;};
 function glyph(name,cls){const html=window.PSC_UI_ICON?.(name);if(!html)return null;const span=document.createElement('span');span.className=cls;span.setAttribute('aria-hidden','true');span.innerHTML=html;return span;}
 function decorate(){
  const shell=document.querySelector('#app .adminShell');if(!shell)return;
  const key=location.hash.split('/')[1]?.split('?')[0]||'dashboard';
  const roots=[shell,...document.querySelectorAll('body>.wsDialog,body>.modalBackdrop')];
  for(const root of roots){
   for(const b of root.querySelectorAll('button')){
    if(b.matches(excluded)||b.closest('.wsStats,.wsWeek,.iconNav,.sidebarFooter')||b.matches('[data-dialog-close],[data-close]')||b.getAttribute('aria-label')==='Close')continue;
    if(!b.classList.contains('adminCommand'))b.classList.add('adminCommand');
    if(b.querySelector('.adminActionIcon')||b.querySelector('svg'))continue;
    let name=b.dataset.adminIcon||rules.find(([selector])=>b.matches(selector))?.[1];
    const route=b.dataset.wsRoute||b.dataset.go;
    if(!name&&route?.startsWith('admin/'))name=route.startsWith('admin/products/')?'edit':routes[route.split('/')[1]]?.[1];
    if(!name&&b.closest('form')&&(!b.type||b.type==='submit'))name='approved';
    if(name){const icon=glyph(name,'adminActionIcon');if(icon)b.prepend(icon);}
   }
   for(const h of root.querySelectorAll('h2')){
    const name=sectionIcons[h.textContent.trim()];if(name&&!h.querySelector('.adminHeadingIcon')&&!h.closest('.adminSectionTitle')){const icon=glyph(name,'adminHeadingIcon');if(icon)h.prepend(icon);}
   }
  }
  const h=shell.querySelector('.contentWrap h1');
  if(h&&!h.querySelector('.adminPageArt')){const span=document.createElement('span');span.className='adminPageArt';span.setAttribute('aria-hidden','true');span.append(image(routes[key]?.[0]||'resources'));h.prepend(span);}
  for(const input of shell.querySelectorAll('.wsToolbar input[data-ws-search],input[data-mail-search]')){
   if(input.parentElement.classList.contains('adminSearchField'))continue;
   const focused=document.activeElement===input,start=input.selectionStart,end=input.selectionEnd;const wrap=document.createElement('span');wrap.className='adminSearchField';input.before(wrap);const icon=glyph('search','adminInlineIcon');if(icon)wrap.append(icon);wrap.append(input);if(focused){input.focus({preventScroll:true});if(Number.isInteger(start)&&input.setSelectionRange)input.setSelectionRange(start,end);}
  }
 }
 let queued=false;
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate();});}
 window.PSC_ENHANCEMENTS.createObserver(schedule).observe(document.body,{childList:true,subtree:true});
 window.addEventListener('hashchange',schedule);schedule();
})();
