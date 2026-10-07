import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createServer } from '../tools/serve.mjs';

const shell = readFileSync('index.html', 'utf8');
test('runtime contains one HTML shell and no historical patch or alternate entry points', () => {
  function walk(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]); }
  const files = walk('dist');
  assert.deepEqual(files.filter(f => f.endsWith('.html')), ['dist/index.html']);
  assert(!files.some(f => /history|workshop-v50-block|apply_v50|v45-workshop/.test(f)));
  assert(!shell.includes('v45-workshop-modules-gate'));
  assert(shell.includes('/current.js?v=5002'));
  const scripts = [...shell.matchAll(/<script src="([^"]+)"/g)].map(m => m[1].split('?')[0]);
  assert.equal(new Set(scripts).size, scripts.length);
  assert.equal(scripts.at(-1), '/current.js');
  assert.equal(scripts.filter(s=>s.startsWith('/')).length,1);
  assert.deepEqual(files.filter(f=>f.endsWith('.js')),['dist/current.js']);
  assert.deepEqual(files.filter(f=>f.endsWith('.css')),['dist/current.css']);
});
test('consolidated V50 application parses and builds repeatably', () => {
  execFileSync('node', ['--check', 'dist/current.js']);
  const before = ['dist/current.js', 'dist/current.css'].map(f => readFileSync(f, 'utf8'));
  execFileSync('node', ['tools/build.mjs']);
  assert.deepEqual(['dist/current.js', 'dist/current.css'].map(f => readFileSync(f, 'utf8')), before);
});
test('deep routes serve the same shell, legacy pages redirect and archived files cannot load', async () => {
  const server = createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const route of ['/', '/start', '/start/', '/workshop', '/workshop/product-basics', '/workshop/which-glove-should-i-actually-wear']) {
      const response = await fetch(base + route); assert.equal(response.status, 200); assert.equal(await response.text(), shell);
    }
    const legacy = await fetch(base + '/catalogue.html', { redirect: 'manual' });
    assert.equal(legacy.status, 308); assert.equal(legacy.headers.get('location'), '/#catalogue');
    for (const route of ['/history/entry-points/index%20(1).html', '/assets/app.js', '/v45-workshop-modules-gate.js', '/tools/apply_v50_workshop.py']) assert.equal((await fetch(base + route)).status, 404);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
