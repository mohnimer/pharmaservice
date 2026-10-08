import {buildProductIndex} from './build-product-index.mjs';
import { readFile, writeFile, mkdir, rm, copyFile, cp, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

await buildProductIndex();
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const shell = await readFile(path.join(root, 'index.html'), 'utf8');
const manifest = JSON.parse(await readFile(path.join(root, 'current/manifest.json'), 'utf8'));
// The shell is the runtime manifest. Preserve script and stylesheet execution order.
const files = new Set(['index.html', 'robots.txt', 'sitemap.xml']);
for (const match of shell.matchAll(/(?:src|href)="(\/[^"?#]+)(?:[?#][^"]*)?"/g)) {
  files.add(match[1].slice(1));
}
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const [type, name] of [['javascript', 'current.js'], ['stylesheets', 'current.css']]) {
  const sources = await Promise.all(manifest[type].map(file => readFile(path.join(root, file), 'utf8')));
  const content = sources.join(type === 'javascript' ? '\n;\n' : '\n');
  await writeFile(path.join(output, name), content);
}
for (const name of files) {
  if (name === 'current.js' || name === 'current.css') continue;
  await mkdir(path.dirname(path.join(output, name)), { recursive: true });
  await copyFile(path.join(root, name), path.join(output, name));
}
// Product images and other dynamically referenced visual assets remain available.
// Historical scripts in assets are deliberately excluded from the published tree.
await cp(path.join(root, 'assets'), path.join(output, 'assets'), {
  recursive: true, filter: source => !/\.(?:html|js|css|txt|md)$/i.test(source)
});
for (const name of await readdir(root)) {
  if (/\.(?:png|webp|jpg|jpeg|svg|gif|ico|woff2?)$/i.test(name)) {
    await copyFile(path.join(root, name), path.join(output, name));
  }
}
console.log(`Built one application shell with ${files.size - 1} referenced/runtime support files.`);
