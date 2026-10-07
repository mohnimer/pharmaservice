import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const { Window } = await import(process.env.PSC_HAPPY_DOM || 'happy-dom');
const shell = readFileSync('index.html', 'utf8');
const scripts = [...shell.matchAll(/<script src="(\/[^"?]+)(?:[^"]*)"/g)].map(m => m[1].slice(1));
const report = [], errors = [];
const pause = () => new Promise(resolve => setTimeout(resolve, 80));
async function setup(path = '/', role = 'anonymous', storage = null) {
  const w = new Window({ url: `http://localhost${path}`, settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true, disableComputedStyleRendering: true } });
  w.document.body.innerHTML = '<div id="app"></div>';
  w.structuredClone = structuredClone; w.__testRole = role; w.print = () => { w.__printed = true; };
  w.navigator.share = async value => { w.__shared = value; };
  w.fetch = () => { throw new Error('External fetch forbidden in tests'); };
  w.addEventListener('error', event => errors.push(event.message));
  if (storage) w.localStorage.setItem('pscClinicPortalStateV12_1', storage);
  w.eval(readFileSync('tests/mock-supabase.js', 'utf8'));
  for (const script of scripts) w.eval(readFileSync('dist/'+script, 'utf8'));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  await pause(); return w;
}
const text = w => w.document.body.textContent;
async function route(w, value) { w.history.pushState({}, '', value); w.dispatchEvent(new w.PopStateEvent('popstate')); await pause(); }
async function click(w, selector) { let e = w.document.querySelector(selector); for(let n=0;!e && n<20;n++){await pause();e=w.document.querySelector(selector);} assert(e, `Missing ${selector} at ${w.location.href}; errors: ${errors.join('; ')}`); e.click(); await pause(); }
async function fill(w, selector, value) { const e = w.document.querySelector(selector); assert(e, `Missing ${selector}`); e.value = value; e.dispatchEvent(new w.Event('input', { bubbles: true })); await pause(); }
let w;
try {
  w = await setup('/workshop');
  assert.equal(w.document.querySelectorAll('.workshopModuleCardV50').length, 7);
  assert.equal(w.document.querySelector('.workshopGuideGridV50').children.length, 3);
  await fill(w, '[data-workshop-q]', 'zzzznotfound'); assert(w.document.querySelector('.workshopEmptyV50'));
  await click(w, '[data-workshop-clear]'); await fill(w, '[data-workshop-q]', 'Which Glove Should I Actually Wear?');
  assert.equal(w.document.querySelectorAll('.workshopGuideGridV50 article').length, 1);
  await click(w, '[data-workshop-clear]'); await click(w, '.workshopModuleCardV50');
  assert(w.document.querySelector('.workshopModulePageV50')); assert.match(w.document.title, /Product Basics/);
  await click(w, '.workshopGuideGridV50 [data-go]'); assert(w.document.querySelector('.workshopArticleV50'));
  await click(w, '[data-workshop-save]'); assert.equal(w.document.querySelector('[data-workshop-save]').getAttribute('aria-pressed'), 'true');
  await click(w, '[data-workshop-print]'); assert.equal(w.__printed, true);
  await click(w, '[data-workshop-share]'); assert.match(w.__shared.url, /\/workshop\//);
  w.history.back(); await pause(); assert(w.document.querySelector('.workshopModulePageV50'));
  w.history.forward(); await pause(); assert(w.document.querySelector('.workshopArticleV50'));
  await route(w, '/workshop/not-found'); assert.match(text(w), /Guide not found/);
  await w.happyDOM.close(); report.push('Workshop native hub/modules/articles, search/no-results/clear, save, print, share, history and unknown guide');

  for (const [path, selector] of [
    ['/', '.publicLanding'], ['/start', '.start16Page'], ['/start/', '.start16Page'],
    ['/#about', 'main'], ['/#our-model', 'main'], ['/#contact', 'main'], ['/#login', '.loginPublicPage'],
    ['/workshop/', '.workshopHubV50'], ['/workshop/stock-expiry', '.workshopModulePageV50'],
    ['/workshop/aed-has-expiring-parts-too/', '.workshopArticleV50']
  ]) {
    w = await setup(path); assert(w.document.querySelector(selector), `${path} missing ${selector}`);
    assert(text(w).trim().length > 100); await w.happyDOM.close();
  }
  report.push('Homepage, Start and trailing slash, About, Our Model, Contact, login and direct Workshop deep routes render actual shell scripts');
  // The current home body is installed after bind(); exercise its actual CTAs.
  for(const [selector,destination] of [
    ['.h47Hero [data-go="start"]','/start'],
    ['.h47CatalogueFoot [data-go="catalogue"]','#catalogue'],
    ['.h47CatalogueFoot [data-go="start"]','/start'],
    ['.home47 [data-go="workshop"]','/workshop'],
    ['.home47 [data-go="login"]','#login']
  ]){
    w=await setup('/');
    assert.equal(w.document.querySelectorAll('.h47PillarLink').length,0);
    await click(w,selector);
    assert.equal(destination.startsWith('#')?w.location.hash:w.location.pathname,destination);
    assert(!w.document.querySelector('.home47'),'CTA opens destination rather than leaving homepage visible');
    await w.happyDOM.close();
  }
  w=await setup('/#contact');
  assert(w.document.querySelector('.prospectContactGrid a[href="tel:+97143377004"]'));
  assert(w.document.querySelector('.prospectContactGrid a[href="tel:+971504252641"]'));
  assert(w.document.querySelector('.prospectContactGrid a[href="https://wa.me/971553511335"]'));
  assert(w.document.querySelector('.prospectContactGrid a[href="mailto:info@pharmaservice.ae"]'));
  await w.happyDOM.close();
  for(const path of ['/', '/#our-model','/start','/#start','/#contact','/#catalogue']){
    w=await setup(path);
    assert(!/\bPSC\b(?![-_])/.test(text(w)),`${path} uses PS branding`);
    if(path.includes('start')){
      assert(w.document.querySelector('#startRequirement[required]'));
      assert(w.document.querySelector('.startContactActions a[href="tel:+971504252641"]'));
      let scrolled=false;
      w.document.querySelector('#start-send').scrollIntoView=()=>{scrolled=true;};
      await click(w,'.start16RouteBoard [data-start-scroll="send"]');
      assert(scrolled,'Start list action reaches requirement form');
      await click(w,'.start16RouteBoard [data-go="catalogue"]');
      assert.equal(w.location.hash,'#catalogue');
      await route(w,'/start');
      await click(w,'.startContactActions [data-go="login"]');
      assert(w.document.querySelector('.loginPublicPage'));
    }
    await w.happyDOM.close();
  }
  w=await setup('/workshop/whats-the-difference');
  assert(w.document.querySelector('.workshopGuideCardV50'));
  assert.equal(w.document.querySelectorAll('.workshopGuideCard').length,0,'V50 guide cards do not inherit old layout selectors');
  await w.happyDOM.close();
  report.push('Inserted homepage CTAs open Start/catalogue/Workshop/login; decorative connectors removed; contact phone/email links; native Workshop cards isolated from historical CSS');
  w = await setup('/#catalogue'); assert(w.document.querySelector('[data-v50-gated-category]'));
  assert.equal(w.document.querySelectorAll('.publicCatalogueResults').length, 0);
  await click(w, '[data-v50-gated-category]'); assert.equal(w.location.hash, '#login');
  assert(w.document.querySelector('.cataloguePendingNoteV45'));
  await fill(w,'#mvpLoginEmail','test@example.invalid'); await fill(w,'#mvpLoginPassword','test-only');
  await click(w,'[data-mvp-login]');
  assert(w.location.hash.startsWith('#portal/catalogue/'),'Login resumes requested category through current router');

  await w.happyDOM.close(); report.push('Public category access gates to login and retains pending category');

  const liveStorage=JSON.stringify({groupName:'Preserved live account',activeSchoolId:'live-site',basket:[{sku:'PSC-PPE-001',qty:3}],requests:[]});
  w = await setup('/#portal/dashboard', 'demo',liveStorage);
  await click(w, '[data-account-switcher]'); await click(w, '[data-school-select="s2"]'); assert.match(text(w), /Site Two/);
  await route(w, '/#portal/catalogue/all'); assert(w.document.querySelector('[data-add]'));
  await click(w, '[data-add="PSC-DIA-001"]');
  assert(w.document.querySelector('[data-psc-family-detail-root]'));
  await click(w, '[data-family-quote]');
  await click(w, '[data-basket]');
  await click(w, '[data-submit-request]');
  await route(w, '/#portal/requests');
  assert(w.document.querySelector('[data-request-view^="DEMO-SIM-"]'),'Simulated order appears in request list');
  const quote = w.document.querySelector('[data-request-view="TEST-QUOTE-1"]'); assert(quote); quote.click(); await pause();
  await click(w, '[data-confirm-quote]');
  await pause();
  assert.equal(w.__tables.orders.find(o=>o.id==='o1').status,'quote_sent');
  await route(w, '/#portal/dashboard');
  await click(w, '[data-account-switcher]'); await click(w, '[data-school-select="s1"]');
  await route(w, '/#portal/requests'); await click(w, '[data-request-view="TEST-QUOTE-0"]'); await click(w, '[data-cancel-quote]');
  await route(w, '/#portal/dashboard'); await click(w, '[data-account-switcher]'); await click(w, '[data-school-select="s2"]');
  await route(w, '/#portal/requests'); assert(w.document.querySelector('[data-request-view^="DEMO-SIM-"]'));
  assert(text(w).includes('Confirmed'),'Demo confirmation survives switching away and back');
  assert.equal(w.localStorage.getItem('pscClinicPortalStateV12_1'),liveStorage);

  await route(w, '/#portal/catalogue/all'); await fill(w, '#customRequestText', 'Compatible test accessory'); await click(w, '[data-submit-custom]');
  assert.equal(w.document.querySelector('#customRequestText').value,'','Simulated custom request clears after submission');
  assert.equal(w.__backendCalls.filter(c => c.rpc || c.action !== 'select').length,0);
  await route(w,'/#contact');
  const enquiry=w.document.querySelector('[data-public-enquiry]'); assert(enquiry);
  enquiry.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true})); await pause();
  await new Promise(resolve=>setTimeout(resolve,500));
  assert.equal(w.__backendCalls.filter(c=>c.rpc||c.action!=='select').length,0);
  await route(w,'/start');
  w.document.querySelector('[data-public-enquiry]').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  await pause();
  assert.equal(w.__backendCalls.filter(c=>c.rpc||c.action!=='select').length,0,'Start demo enquiry cannot write backend records');
  await w.happyDOM.close();
  w=await setup('/#portal/requests','demo',liveStorage);
  assert(!w.document.querySelector('[data-request-view^="DEMO-SIM-"]'));
  assert(text(w).includes('Quote Sent'),'Refresh resets simulated confirmation/cancellation');
  assert.equal(w.localStorage.getItem('pscClinicPortalStateV12_1'),liveStorage);
  await route(w,'/#admin/dashboard'); assert.equal(w.location.hash,'#portal/dashboard');
  await click(w,'[data-mobile-open]'); assert(w.document.querySelector('.sidebar.mobileOpen,.sidebar.open,.mobileOverlay.show'));
  await click(w,'[data-mobile-close]'); assert(!w.document.querySelector('.mobileOverlay.show'));
  for(const page of ['portal/catalogue','portal/replenish','portal/documents','portal/stock','portal/assets']){
    await route(w,'/#'+page); assert(w.document.querySelector('.sidebar'),'Portal navigation keeps current shell');
  }

  await w.happyDOM.close(); report.push('Demo switch isolation, category/product detail/family request, simulated order, quote confirm/cancel, custom/public requests, refresh reset, live storage preservation, admin denial, mobile menu controls; zero backend writes');

  w=await setup('/#home'); await click(w,'[data-public-menu]');
  assert.equal(w.document.querySelector('[data-public-menu]').getAttribute('aria-expanded'),'true');
  w.PSC_NAVIGATE('start'); await pause(); assert.equal(w.location.pathname,'/start');
  assert.equal(w.document.querySelector('[data-public-menu]').getAttribute('aria-expanded'),'false');
  await w.happyDOM.close(); report.push('Mock login resumes selected category; all portal sections and public/mobile menu navigation use current shell');
  assert.deepEqual(errors, []);
  mkdirSync('test-results', { recursive: true });
  writeFileSync('test-results/dom-results.json', JSON.stringify({ method: 'Actual shell scripts in Happy DOM; mocked Supabase; no visual layout verification', report, errors }, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { if (w) await w.happyDOM.close(); }
