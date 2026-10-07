(() => {
  'use strict';

  /*
    PS V44.8 — PRODUCT IMAGE RECOVERY

    Why this exists:
    - The production CMS overlay can replace a valid local product image with null.
    - The app's image selector can prefer generated INST-xxxx art over a real product photograph.
    - V44.7 correctly hides generated INST art, which then leaves a blank card.

    This hotfix keeps the current product/family architecture intact and restores only
    real product photography already present in PSC_DATA.
  */

  const D = window.PSC_DATA;
  if (!D || !Array.isArray(D.products)) return;

  const realImages = new Map();
  const controlledLocalSkus = new Set();

  const clean = value => String(value || '').trim();

  function isGeneratedOrGeneric(url) {
    const s = clean(url).toLowerCase();
    if (!s) return true;
    return (
      /\/assets\/products\/inst-\d{4}\.webp(?:\?|$)/i.test(s) ||
      s.includes('clinic-basics.jpg') ||
      s.includes('dha-requirement') ||
      s.endsWith('/pharmaservice.png') ||
      s.endsWith('pharmaservice.png') ||
      s.endsWith('/psc-logo.png') ||
      s.endsWith('/psc-logo-current.png')
    );
  }

  function rememberProduct(p) {
    if (!p) return;
    const sku = clean(p.pscSku || p.psc_sku).toUpperCase();
    if (!sku) return;

    const candidate = clean(p.currentImageUrl || p.image_url || p.imageUrl);
    if (candidate && !isGeneratedOrGeneric(candidate)) {
      realImages.set(sku, candidate);
    }

    const source = clean(p.source).toLowerCase();
    if (
      p.localCatalogueRefresh === true || p.localCatalogueOverride === true ||
      source.includes('user-supplied catalogue pack image')
    ) {
      controlledLocalSkus.add(sku);
    }
  }

  D.products.forEach(rememberProduct);

  // Expose only for debugging / QA in DevTools.
  window.PSC_V448_IMAGE_CONTROL = {
    realImages,
    controlledLocalSkus
  };

  let rerenderWakeups = 0;
  let wakeTimer = null;

  function restoreData() {
    let visibilityChanged = false;

    D.products.forEach(p => {
      const sku = clean(p.pscSku || p.psc_sku).toUpperCase();
      if (!sku) return;

      const remembered = realImages.get(sku);
      const current = clean(p.image_url || p.imageUrl);

      // If Supabase/CMS blanked the local image or replaced it with generated artwork,
      // put the real product photo back on the runtime object.
      if (remembered && (!current || isGeneratedOrGeneric(current))) {
        p.imageUrl = remembered;
      }

      // V44.7 user-supplied catalogue additions are intentionally approved for this
      // local catalogue layer. Do not let the CMS "hide all static rows" pass erase them.
      if (controlledLocalSkus.has(sku) && p.catalogueVisible === false) {
        p.catalogueVisible = true;
        visibilityChanged = true;
      }
    });

    // The app render function is private. Its hashchange listener is the safest
    // non-invasive way to ask it to draw again after async CMS hydration.
    if (visibilityChanged && rerenderWakeups < 3) {
      clearTimeout(wakeTimer);
      wakeTimer = setTimeout(() => {
        rerenderWakeups += 1;
        window.dispatchEvent(new Event('hashchange'));
      }, 40);
    }
  }

  function imageForSku(sku) {
    return realImages.get(clean(sku).toUpperCase()) || '';
  }

  function setRealImage(img, sku) {
    const real = imageForSku(sku);
    if (!img || !real) return;

    const current = clean(img.getAttribute('src'));
    if (current === real) return;

    img.setAttribute('src', real);
    img.removeAttribute('srcset');

    // Keep a failed real image from bouncing back to the generated INST placeholder.
    img.onerror = function () {
      this.onerror = null;
      this.style.display = 'none';
    };
  }

  function patchProductTrigger(el, attr) {
    const sku = clean(el.getAttribute(attr));
    if (!sku) return;

    const imgs = el.querySelectorAll(
      'img.productMainImage, .publicCatalogueVisual > img:not(.publicDhaMark), .relatedProductVisual img'
    );
    imgs.forEach(img => setRealImage(img, sku));
  }

  function scan() {
    restoreData();

    document.querySelectorAll('[data-product-view]').forEach(el => {
      patchProductTrigger(el, 'data-product-view');
    });

    document.querySelectorAll('[data-public-product-view]').forEach(el => {
      patchProductTrigger(el, 'data-public-product-view');
    });

    // Product detail sheet/modal: the SKU is printed in the header.
    document.querySelectorAll('.productDetailModal').forEach(modal => {
      const sku = clean(modal.querySelector('.mono')?.textContent);
      if (!sku) return;
      modal.querySelectorAll('.detailProductImageWrap > img:not(.detailDhaIcon)').forEach(img => {
        setRealImage(img, sku);
      });
    });

    // Supply request drawer.
    document.querySelectorAll('.requestLine').forEach(line => {
      const sku =
        clean(line.querySelector('[data-basket-remove]')?.getAttribute('data-basket-remove')) ||
        clean(line.querySelector('[data-basket-delta]')?.getAttribute('data-basket-delta')).split('|')[0];
      if (!sku) return;
      line.querySelectorAll('.requestLineImage img').forEach(img => setRealImage(img, sku));
    });

    // Replenishment / miscellaneous product cards that expose a SKU action.
    document.querySelectorAll('[data-add]').forEach(action => {
      const sku = clean(action.getAttribute('data-add'));
      const card = action.closest('.productCard, .replenishCard, .productDetailModal, article, section');
      if (!card || !sku) return;
      card.querySelectorAll('.productMainImage, .replenishVisual img, .detailProductImageWrap > img:not(.detailDhaIcon)').forEach(img => {
        setRealImage(img, sku);
      });
    });
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      scan();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
  } else {
    schedule();
  }

  const observer = window.PSC_ENHANCEMENTS.createObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('hashchange', schedule);
  window.addEventListener('popstate', schedule);

  // Async storefront hydration can finish after the first render.
  [250, 750, 1500, 3000].forEach(ms => setTimeout(schedule, ms));
})();
