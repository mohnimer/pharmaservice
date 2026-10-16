(() => {
  'use strict';
  // Presentation only. Never enrich, infer, persist or synchronize product records.
  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const quantity=v=>Number.isFinite(Number(v))?Math.min(10000,Math.max(1,Math.floor(Number(v)||1))):1;
  const profiles={
    pharmaceuticals:{label:'Pharmaceuticals',fields:[['activeIngredients','Active ingredients'],['strength','Strength / concentration'],['dosageForm','Dosage form'],['presentation','Presentation'],['route','Route'],['pack','Pack / presentation'],['manufacturer','Manufacturer']]},
    supplements:{label:'Supplements & wellness',fields:[['composition','Composition'],['strengthPerServing','Per serving'],['form','Product form'],['servingSize','Serving size'],['pack','Pack / net content'],['manufacturer','Manufacturer']]},
    consumables:{label:'Consumables & disposables',fields:[['material','Material'],['size','Size'],['dimensions','Dimensions'],['sterility','Sterility'],['pack','Pack / selling unit'],['unitsPerBox','Units per box'],['unitsPerCarton','Units per carton']]},
    devices:{label:'Devices & diagnostics',fields:[['model','Model'],['capabilities','Measurements / capabilities'],['technicalSpecifications','Technical specifications'],['includedComponents','Included components'],['pack','Selling unit'],['warranty','Warranty']]},
    capital:{label:'Equipment & infrastructure',fields:[['model','Model / configuration'],['dimensions','Dimensions'],['capacity','Capacity'],['includedComponents','Included accessories'],['installation','Installation'],['delivery','Delivery considerations'],['warranty','Warranty / support'],['pack','Selling unit']]},
    generic:{label:'Product details',fields:[['model','Model'],['presentation','Presentation'],['pack','Pack / selling unit']]}
  };
  const categoryMap={'Medicines':'pharmaceuticals','Pharmaceuticals':'pharmaceuticals','Supplements':'supplements','Supplements & Wellness':'supplements','Consumables & Disposables':'consumables','Medical Disposables':'consumables','Diagnostics & Monitoring':'devices','Devices & Diagnostics':'devices','Furniture & Mobility':'capital','Capital Equipment':'capital'};
  function profile(p={}){
    const info=p.professionalInformation;
    const verified=info?.status==='VERIFIED'&&info?.source?info:null;
    // Broad/ambiguous source categories deliberately stay generic.
    const kind=verified&&profiles[verified.category]?verified.category:categoryMap[p.category]||(p.page_type==='MEDICINE FAMILY'?'pharmaceuticals':'generic');
    return {kind,...profiles[kind],info:verified};
  }
  function facts(p={}){
    const view=profile(p), out=[];
    const values={model:p.model,...(view.info?.fields||{}),brand:p.brand,pack:p.cataloguePack||p.pack};
    if(values.brand&&!/^(specification-led|institutional range|generic|unbranded|various|none|n\/?a|PS|PSC)$/i.test(values.brand))out.push(['Brand',values.brand]);
    for(const [key,label] of view.fields){
      let value=values[key];
      // Newly supplied structured fields need explicit field-level source verification.
      if(view.info?.fields?.[key]!==undefined&&!(view.info.verifiedFields||[]).includes(key))value=key==='pack'?(p.cataloguePack||p.pack):key==='model'?p.model:null;
      if(Array.isArray(value)&&value.every(x=>typeof x==='string'))value=value.join(key==='activeIngredients'?' + ':'; ');
      if(value===null||value===undefined||value===''||typeof value==='object')continue;
      out.push([label,String(value)]);
    }
    return {kind:view.kind,label:view.label,rows:out};
  }
  function factsHtml(p){
    const f=facts(p);
    return `<section class="professionalFacts" data-product-experience="${f.kind}" aria-label="${esc(f.label)}"><h3>${esc(f.label)}</h3><dl>${f.rows.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>`;
  }
  function documentsHtml(p){
    const info=profile(p).info;
    const documents=(info?.documents||[]).filter(d=>d.verified===true&&d.source&&/^https:\/\//i.test(d.url||''));
    if(!documents.length)return '';
    return `<details class="professionalDocuments"><summary>Manufacturer documentation</summary><ul>${documents.map(d=>`<li><a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">${esc(d.label||'Manufacturer document')}</a></li>`).join('')}</ul></details>`;
  }
  function quantityHtml(value=1,unit='Pack / unit to confirm'){
    return `<div class="requestQuantity"><label>Quantity <small>Per requested unit: ${esc(unit)}</small><span class="quantityStepper"><button type="button" data-quantity-delta="-1" aria-label="Decrease requested quantity">−</button><input type="number" data-request-quantity aria-label="Requested quantity" min="1" max="10000" step="1" inputmode="numeric" value="${quantity(value)}"><button type="button" data-quantity-delta="1" aria-label="Increase requested quantity">+</button></span></label></div>`;
  }
  function bindQuantity(root,onChange=()=>{}){
    const input=root.querySelector('[data-request-quantity]');if(!input)return;
    const update=v=>{input.value=quantity(v);onChange(Number(input.value));};
    input.addEventListener('input',()=>onChange(quantity(input.value)));
    input.addEventListener('change',()=>update(input.value));
    root.querySelectorAll('[data-quantity-delta]').forEach(b=>b.addEventListener('click',()=>update(quantity(input.value)+Number(b.dataset.quantityDelta))));
  }
  window.PSC_PRODUCT_PRESENTATION=Object.freeze({profile,facts,factsHtml,documentsHtml,quantity,quantityHtml,bindQuantity});
})();
