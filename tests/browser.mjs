import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createServer } from '../tools/serve.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PSC_PLAYWRIGHT || 'playwright');
const server = createServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.PSC_CHROME || undefined, args: ['--no-sandbox'] });
const errors = [], results = [];
mkdirSync('test-results', { recursive: true });
async function setup(role = 'anonymous', mobile = false) {
  const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 } });
  await context.addInitScript(role => { window.__testRole = role; window.print = () => { window.__printed = true; }; navigator.share = async value => { window.__shared = value; }; }, role);
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') return route.continue();
    if (url.hostname === 'cdn.jsdelivr.net') return route.fulfill({ contentType: 'text/javascript', body: readFileSync('tests/mock-supabase.js', 'utf8') });
    return route.fulfill({ status: 200, body: '' }); // Block all external transport, including production Supabase.
  });
  const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
  return { context, page };
}
try {
  let { context, page } = await setup();
  await page.goto(base + '/workshop');
  await page.locator('.workshopModuleCardV50').first().waitFor();
  assert.equal(await page.locator('.workshopModuleCardV50').count(), 7);
  assert.equal(await page.locator('.workshopGuideGridV50').first().locator('article').count(), 3);
  await page.locator('[data-workshop-q]').fill('zzzznotfound');
  await page.locator('.workshopEmptyV50').waitFor();
  await page.locator('[data-workshop-clear]').first().click();
  await page.locator('[data-workshop-q]').fill('Which Glove Should I Actually Wear?');
  assert.equal(await page.locator('.workshopGuideGridV50 article').count(), 1);
  await page.locator('[data-workshop-clear]').first().click();
  await page.locator('.workshopModuleCardV50').first().click();
  await page.locator('.workshopModulePageV50').waitFor();
  assert.match(await page.title(), /Product Basics/);
  await page.locator('.workshopGuideGridV50 [data-go]').first().click();
  await page.locator('.workshopArticleV50').waitFor();
  await page.locator('[data-workshop-save]').click();
  assert.equal(await page.locator('[data-workshop-save]').getAttribute('aria-pressed'), 'true');
  await page.locator('[data-workshop-print]').click(); assert.equal(await page.evaluate(() => window.__printed), true);
  await page.locator('[data-workshop-share]').click(); assert.match(await page.evaluate(() => window.__shared.url), /\/workshop\//);
  await page.reload(); await page.locator('.workshopArticleV50').waitFor();
  assert.equal(await page.locator('[data-workshop-save]').getAttribute('aria-pressed'), 'true');
  await page.goBack(); await page.locator('.workshopModulePageV50').waitFor();
  await page.goForward(); await page.locator('.workshopArticleV50').waitFor();
  await page.goto(base + '/workshop/not-a-guide'); await page.getByRole('heading', { name: 'Guide not found.' }).waitFor();
  for (const path of ['/workshop/', '/workshop/clinic-checks/', '/start/']) {
    await page.goto(base + path); await page.locator('main').waitFor(); assert(!await page.locator('body').innerText().then(t => t.includes('Guide not found.')));
  }
  await page.goto(base + '/catalogue.html'); await page.locator('[data-v50-gated-category]').first().waitFor();
  assert.equal(await page.locator('.publicCatalogueResults').count(), 0);
  await page.locator('[data-v50-gated-category]').first().click(); await page.locator('.loginPublicPage').waitFor();
  await page.locator('.cataloguePendingNoteV45').waitFor();
  await context.close(); results.push('Workshop modules, search/empty/clear, guide save/reload, print/share, back/forward, deep routes, catalogue login gate');

  ({ context, page } = await setup('anonymous', true));
  for (const path of ['/workshop', '/workshop/product-basics', '/workshop/which-glove-should-i-actually-wear', '/start']) {
    await page.goto(base + path); await page.locator('main').waitFor();
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Mobile overflow at ${path}`);
  }
  await page.screenshot({ path: 'test-results/start-mobile.png', fullPage: true });
  await context.close(); results.push('390px mobile Workshop hub/module/article and Start without horizontal overflow');

  ({ context, page } = await setup('demo'));
  await page.goto(base + '/#portal/dashboard'); await page.locator('[data-account-switcher]').waitFor();
  await page.locator('[data-account-switcher]').click(); await page.locator('[data-school-select="s2"]').click();
  assert.match(await page.locator('body').innerText(), /Site Two/);
  await page.goto(base + '/#portal/catalogue/all'); await page.locator('[data-add]').first().waitFor();
  await page.locator('[data-add="PSC-DIA-001"]').click(); await page.locator('[data-family-quote]').click(); await page.locator('[data-basket]').first().click();
  await page.locator('[data-submit-request]').click();
  assert.match(await page.locator('body').innerText(), /Demo order created/);
  await page.goto(base + '/#portal/requests'); await page.locator('[data-request-view]').first().click();
  await page.locator('[data-confirm-quote]').first().click();
  await page.goto(base + '/#portal/catalogue/all'); await page.locator('#customRequestText').fill('Test compatible accessory');
  await page.locator('[data-submit-custom]').click();
  assert.match(await page.locator('body').innerText(), /Demo request received/);
  assert.deepEqual(await page.evaluate(() => window.__backendCalls.filter(c => c.rpc || c.action !== 'select')), []);
  await context.close(); results.push('Mock demo site switching, catalogue request, quote confirmation and custom request with zero backend writes');
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ results, pageErrors: errors }, null, 2));
} finally {
  await browser.close(); await new Promise(resolve => server.close(resolve));
}
