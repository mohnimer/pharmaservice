(() => {
  'use strict';
  const sb=window.PSC_SUPABASE;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const evidenceFields=[
 ['authorization_ref','Customer PO / written approval reference'],['invoice_ref','ERPNext invoice / funding request reference'],
 ['funding_required','Required funding (AED)','number'],['funding_received','Verified receipts (AED)','number'],
 ['receipt_ref','Verified receipt / bank reconciliation reference'],['credit_approval_ref','Approved credit terms reference (if applicable)'],
 ['supplier_evidence_ref','Supplier quotation, stock, lead time & regulated route evidence'],['supplier_valid_until','Supplier confirmation valid until','date'],
 ['margin_exception_ref','Approved margin exception reference (if below 20%)'],['supplier_po_ref','Supplier PO reference'],
 ['dispatch_ref','Dispatch / delivery note reference'],['acceptance_ref','Signed delivery / customer acceptance reference']
 ];
 function evidenceForm(r){if(r.type!=='order')return '';return `<div class="commercialExports"><button class="button outline" data-commercial-export="rfq">Download supplier RFQ draft</button><button class="button outline" data-commercial-export="accounts">Download accounting handoff</button><p data-export-feedback role="status"></p></div><details class="commercialEvidence"><summary>Approval, funding & delivery evidence</summary><p>Save after reviewing the current quotation. A quotation change requires renewed evidence. Enter references to verified records; amounts do not collect money or create accounting entries. Attach supporting files through the existing request documents.</p><form data-commercial-evidence>${evidenceFields.map(([key,label,type='text'])=>`<label>${esc(label)}<input name="${key}" type="${type}" ${type==='number'?'min="0" step="0.01"':'maxlength="500"'} value="${esc(r.control?.[key]??(type==='number'?0:''))}"></label>`).join('')}<label class="commercialInboxCheck"><input name="attested" type="checkbox" required>I reviewed these references against the current quotation and source records.</label><button class="button primary" type="submit">Save verified evidence</button><p data-evidence-feedback role="status"></p></form></details>`;}
 let user=null;
  async function authorize(){
    if(window.PSC_IS_DEMO_ACCOUNT?.())return false;
    const {data,error}=await sb.auth.getSession();
    if(error)throw error;
    user=data?.session?.user;
    if(!user)return false;
    const result=await sb.from('profiles').select('is_psc_admin').eq('user_id',user.id).maybeSingle();
    if(result.error)throw result.error;
    return !!result.data?.is_psc_admin;
  }
  async function rows(table,sortKey='created_at'){
    // Paginate rather than silently omitting older requirements at the API row cap.
    const out=[];
    for(let start=0;;start+=500){
      const {data,error}=await sb.from(table).select('*').order(table==='commercial_actions'?'entity_id':sortKey,{ascending:false}).range(start,start+499);
      if(error)throw error;
      out.push(...(data||[]));if((data||[]).length<500)return out;
    }
  }
  async function mount(host){
    if(host.dataset.loading)return;
    host.dataset.loading='true';
    try{
      if(!sb||!await authorize()){host.innerHTML='<p>The commercial inbox is available to PSC administrators only.</p>';return;}
      const [orders,enquiries,custom,actions,schools,groups,controls]=await Promise.all([rows('orders'),rows('institutional_enquiries'),rows('custom_requests'),rows('commercial_actions'),rows('schools','id'),rows('account_groups','id'),rows('order_commercial_controls','order_id')]);
      if(!host.isConnected)return;
      const actionMap=new Map(actions.map(a=>[a.entity_type+':'+a.entity_id,a]));
      const siteName=r=>[groups.find(g=>g.id===r.group_id)?.name,schools.find(s=>s.id===r.school_id)?.campus_name||schools.find(s=>s.id===r.school_id)?.name].filter(Boolean).join(' · ');
      const records=[...orders.map(o=>({type:'order',id:o.id,ref:o.order_number,name:siteName(o)||'Portal request',detail:o.note||'Open the quotation builder below for product lines.',status:o.status,created:o.created_at})),
        ...enquiries.map(e=>({type:'enquiry',id:e.id,ref:'ENQ-'+e.id.slice(0,8).toUpperCase(),name:e.organization||e.name,detail:e.requirement,status:e.status,created:e.created_at,contact:[e.name,e.contact_email,e.contact_number].filter(Boolean).join(' · '),attachment:e.rfq_object_path,fileName:e.rfq_file_name,requiredBy:e.required_by})),
        ...custom.map(c=>({type:'custom',id:c.id,ref:'SRC-'+c.id.slice(0,8).toUpperCase(),name:siteName(c)||'Unlisted sourcing requirement',detail:[c.description,'Quantity: '+c.quantity,c.notes].filter(Boolean).join('\n'),status:c.status,created:c.created_at}))];
      for(const r of records){r.action=actionMap.get(r.type+':'+r.id);r.control=controls.find(c=>c.order_id===r.id&&r.type==='order');r.closed=['delivered','cancelled','archived','closed'].includes(r.status);r.overdue=!r.closed&&!r.action?.completed&&r.action?.due_date<today();}
      records.sort((a,b)=>Number(b.overdue)-Number(a.overdue)||String(b.created).localeCompare(String(a.created)));
      host.innerHTML=`<div class="panelHeader"><div><h2>Incoming requirements & follow-ups</h2><p>${records.length} requirements · ${records.filter(r=>r.overdue).length} overdue · ${records.filter(r=>!r.closed&&!r.action).length} without a next action</p></div><button class="button outline" data-inbox-refresh>Refresh</button></div><div class="commercialInboxFilters"><label>Show <select data-inbox-filter><option value="open">Open requirements</option><option value="overdue">Overdue follow-ups</option><option value="unassigned">No next action</option><option value="all">All requirements</option></select></label></div><div data-inbox-cards></div><p class="smallMuted">Completing a follow-up does not confirm payment or release procurement.</p>`;
      const cards=host.querySelector('[data-inbox-cards]');
      function paint(){
        const filter=host.querySelector('[data-inbox-filter]').value;
        const visible=records.filter(r=>filter==='all'||(filter==='overdue'?r.overdue:filter==='unassigned'?!r.closed&&!r.action:!r.closed));
        cards.innerHTML=visible.length?visible.map(r=>`<article class="commercialInboxCard ${r.overdue?'overdue':''}" data-inbox-record="${esc(r.type+':'+r.id)}"><div><span class="commercialRecordStatus">${r.type==='enquiry'?'WEBSITE ENQUIRY':r.type==='custom'?'UNLISTED REQUIREMENT':'PORTAL REQUEST'} · ${esc(r.status.replace(/_/g,' '))}</span><h3>${esc(r.ref)}</h3><p>${esc(r.name)}</p>${r.contact?`<p>${esc(r.contact)}</p>`:''}${r.requiredBy?`<p>Required by: ${esc(r.requiredBy)}</p>`:''}<details><summary>Requirement details</summary><p class="commercialRequirement">${esc(r.detail)}</p>${r.attachment?`<button class="button outline" type="button" data-inbox-attachment>${esc(r.fileName||'Open attachment')}</button>`:''}</details></div><form data-inbox-action><label>Next action<input name="next_action" maxlength="500" required value="${esc(r.action?.next_action||'')}" placeholder="Confirm pack sizes / request supplier quote"></label><div class="commercialInboxFields"><label>Owner<input name="owner_label" required maxlength="120" value="${esc(r.action?.owner_label||'Mohamed')}"></label><label>Due date (UAE)<input name="due_date" type="date" required value="${esc(r.action?.due_date||today())}"></label></div><label class="commercialInboxCheck"><input name="completed" type="checkbox" ${r.action?.completed?'checked':''}>Follow-up completed</label><button class="button primary" type="submit">Save follow-up</button><p data-inbox-feedback role="status"></p></form>${evidenceForm(r)}</article>`).join(''):'<p>No requirements in this view.</p>';
        cards.querySelectorAll('[data-inbox-action]').forEach(form=>form.addEventListener('submit',async e=>{
          e.preventDefault();const card=form.closest('[data-inbox-record]'),r=records.find(x=>x.type+':'+x.id===card.dataset.inboxRecord);
          const feedback=form.querySelector('[data-inbox-feedback]'),button=form.querySelector('button[type="submit"]');
          button.disabled=true;feedback.textContent='Saving…';
          try{
            if(!await authorize())throw new Error('PSC administrator sign-in required');
            const action={entity_type:r.type,entity_id:r.id,next_action:form.elements.next_action.value.trim(),owner_label:form.elements.owner_label.value.trim(),due_date:form.elements.due_date.value,completed:form.elements.completed.checked,updated_by:user.id,updated_at:new Date().toISOString()};
            if(!action.next_action||!action.owner_label||!action.due_date)throw new Error('Enter an action, owner and due date');
            const {data,error}=await sb.from('commercial_actions').upsert(action,{onConflict:'entity_type,entity_id'}).select().single();
            if(error)throw error;if(!data)throw new Error('Save was not acknowledged');
            r.action=data;r.overdue=!r.closed&&!data.completed&&data.due_date<today();
            feedback.textContent='Saved. This follow-up remains attached to the requirement.';
          }catch(error){feedback.textContent='Not saved: '+(error.message||'Please retry');}
          finally{button.disabled=false;}
        }));
        cards.querySelectorAll('[data-commercial-export]').forEach(button=>button.addEventListener('click',async()=>{
          const card=button.closest('[data-inbox-record]'),r=records.find(x=>x.type+':'+x.id===card.dataset.inboxRecord),feedback=card.querySelector('[data-export-feedback]');button.disabled=true;
          try{
            if(!await authorize())throw new Error('PSC administrator sign-in required');
            let matrix;
            if(button.dataset.commercialExport==='rfq'){
              const {data,error}=await sb.from('order_lines').select('*').eq('order_id',r.id).order('created_at');if(error)throw error;
              matrix=[['DRAFT RFQ — verify supplier and specifications before sending'],['Request',r.ref],['Institution',r.name],['Description','Quantity','Presentation / pack','Requested brand','Reference'],...(data||[]).map(l=>[l.line_description,l.quantity,l.requested_presentation||l.pack_snapshot,l.requested_brand||l.brand_model_snapshot,l.psc_sku_snapshot||l.family_id])];
            }else{
              const {data,error}=await sb.from('quotes').select('*').eq('order_id',r.id).maybeSingle();if(error)throw error;
              matrix=[['ACCOUNTING HANDOFF — reference export, not an invoice or payment confirmation'],['Request','Institution','Status','Quote','Currency','Quote total','ERP invoice reference','Required funding','Verified receipts','Receipt reference','Credit approval','Customer approval'],[r.ref,r.name,r.status,data?.quote_number,data?.currency||'AED',data?.total,r.control?.invoice_ref,r.control?.funding_required,r.control?.funding_received,r.control?.receipt_ref,r.control?.credit_approval_ref,r.control?.authorization_ref]];
              const bank=window.PSC_PAYMENT_INSTRUCTIONS;
              if(bank)matrix.push([],['Bank transfer instructions'],['Account name',bank.accountName],['Bank',bank.bankName],['Account number',bank.accountNumber],['Currency',bank.currency],['IBAN',bank.iban],['SWIFT',bank.swift]);
            }
            // Prevent spreadsheet formula execution in customer-entered text.
            const cell=v=>{let t=String(v??'');if(/^[=+@\-\t\r]/.test(t))t="'"+t;return '"'+t.replace(/"/g,'""')+'"';};
            const blob=new Blob(['\uFEFF'+matrix.map(row=>row.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=r.ref.replace(/[^a-z0-9-]/gi,'_')+'-'+button.dataset.commercialExport+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);feedback.textContent='Draft downloaded. Review before using or sending.';
          }catch(error){feedback.textContent='Export failed: '+(error.message||'Please retry');}finally{button.disabled=false;}
        }));
        cards.querySelectorAll('[data-commercial-evidence]').forEach(form=>form.addEventListener('submit',async e=>{
          e.preventDefault();const r=records.find(x=>x.type+':'+x.id===form.closest('[data-inbox-record]').dataset.inboxRecord);
          const feedback=form.querySelector('[data-evidence-feedback]'),button=form.querySelector('button');button.disabled=true;feedback.textContent='Saving…';
          try{
            if(!await authorize())throw new Error('PSC administrator sign-in required');
            const payload={order_id:r.id,updated_by:user.id};
            for(const [key,,type] of evidenceFields)payload[key]=type==='number'?Number(form.elements[key].value):type==='date'?(form.elements[key].value||null):form.elements[key].value.trim();
            const {data,error}=await sb.from('order_commercial_controls').upsert(payload,{onConflict:'order_id'}).select().single();
            if(error)throw error;if(!data)throw new Error('Save was not acknowledged');r.control=data;
            form.elements.attested.checked=false;feedback.textContent='Saved for the current quotation. Release checks run when you change the quotation status.';
          }catch(error){feedback.textContent='Not saved: '+(error.message||'Please retry');}
          finally{button.disabled=false;}
        }));
        cards.querySelectorAll('[data-inbox-attachment]').forEach(button=>button.addEventListener('click',async()=>{
          const r=records.find(x=>x.type+':'+x.id===button.closest('[data-inbox-record]').dataset.inboxRecord);
          button.disabled=true;
          try{
            if(!await authorize())throw new Error('PSC administrator sign-in required');
            const {data,error}=await sb.storage.from('institutional-enquiries').createSignedUrl(r.attachment,60);
            if(error)throw error;if(!data?.signedUrl)throw new Error('Attachment unavailable');
            window.open(data.signedUrl,'_blank','noopener,noreferrer');
          }catch(error){button.textContent='Could not open attachment. Retry';}
          finally{button.disabled=false;}
        }));
      }
      host.querySelector('[data-inbox-filter]').addEventListener('change',paint);
      host.querySelector('[data-inbox-refresh]').addEventListener('click',()=>{delete host.dataset.loading;host.innerHTML='<p>Refreshing…</p>';mount(host);});
      paint();
    }catch(error){
      if(host.isConnected){host.innerHTML='<p role="alert">The inbox could not load. Your saved requirements have not been changed.</p><button class="button outline" data-inbox-retry>Retry</button>';host.querySelector('[data-inbox-retry]').onclick=()=>{delete host.dataset.loading;mount(host);};}
      console.warn('Commercial inbox:',error.message);
    }
  }
  function apply(){const host=document.querySelector('[data-commercial-inbox]');if(host)mount(host);}
  const observer=window.PSC_ENHANCEMENTS.createObserver(apply);observer.observe(document.body,{childList:true,subtree:true});apply();
})();
