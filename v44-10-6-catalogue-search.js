(() => {
  'use strict';

  const clean = value => String(value ?? '').trim();
  const norm = value => clean(value).toLowerCase().replace(/\s+/g,' ');

  function productMap(){
    const map = new Map();
    const products = Array.isArray(window.PSC_DATA?.products) ? window.PSC_DATA.products : [];
    products.forEach(p => {
      const sku = clean(p.pscSku || p.psc_sku).toUpperCase();
      if(!sku) return;
      const haystack = [
        p.pscSku,p.psc_sku,p.supplierSku,p.supplier_sku,p.brand,p.name,
        p.catalogueDisplayName,p.pack,p.cataloguePack,p.category,p.productType,
        p.spec,p.pscOfferedSpecification,p.supplier,
        ...(Array.isArray(p.clinicalNeeds) ? p.clinicalNeeds : [])
      ].filter(Boolean).join(' ');
      map.set(sku,norm(haystack));
    });
    return map;
  }

  function skuFromCard(card){
    const trigger =
      card.querySelector('[data-product-view]') ||
      card.querySelector('[data-public-product-view]') ||
      card.querySelector('[data-add]');
    return clean(
      trigger?.getAttribute('data-product-view') ||
      trigger?.getAttribute('data-public-product-view') ||
      trigger?.getAttribute('data-add')
    ).toUpperCase();
  }

  function tokenMatch(haystack,query){
    const tokens=norm(query).split(' ').filter(Boolean);
    return !tokens.length || tokens.every(t=>haystack.includes(t));
  }

  function applySearch(input){
    const q=clean(input.value);
    const map=productMap();
    const cards=[...document.querySelectorAll('.customerShell .productGrid .productCard, .publicCataloguePage .publicCatalogueGrid .publicCatalogueCard')];
    let visible=0;
    cards.forEach(card=>{
      const sku=skuFromCard(card);
      const hay=`${map.get(sku)||''} ${norm(card.textContent)}`;
      const match=tokenMatch(hay,q);
      card.hidden=!match;
      if(match) visible++;
    });

    document.querySelectorAll('.customerShell [data-global-search]').forEach(g=>{
      if(document.activeElement!==g) g.value=q;
    });

    const page=document.querySelector('.publicCataloguePage');
    if(page) page.classList.toggle('v44106Searching',!!q);
  }

  document.addEventListener('input',e=>{
    const input=e.target;
    if(!(input instanceof HTMLInputElement)) return;
    if(!input.matches('[data-cat-q]')) return;

    // Crucial: stop the legacy listener from replacing the input on each key.
    e.stopImmediatePropagation();
    applySearch(input);
  },true);

  document.addEventListener('keydown',e=>{
    const input=e.target;
    if(!(input instanceof HTMLInputElement)) return;
    if(!input.matches('[data-cat-q]')) return;
    if(e.key==='Escape'){
      input.value='';
      applySearch(input);
    }
  },true);
})();