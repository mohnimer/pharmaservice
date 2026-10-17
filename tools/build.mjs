import './build-catalogue-stock.mjs';
import './build-variant-photographs.mjs';
import {createHash} from 'node:crypto';
import {buildProductIndex} from './build-product-index.mjs';
import { readFile, writeFile, mkdir, rm, copyFile, cp, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

await buildProductIndex();
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const shell = await readFile(path.join(root, 'index.html'), 'utf8');
const imagePolicy=JSON.parse(await readFile(path.join(root,'data/catalogue-image-policy.json'),'utf8'));
const rejectedImagePaths=new Set(imagePolicy.blocked_paths.map(p=>p.replace(/^\//,'')));
const rejectedImageHashes=new Set(imagePolicy.blocked_sha256);
const manifest = JSON.parse(await readFile(path.join(root, 'current/manifest.json'), 'utf8'));
// The shell is the runtime manifest. Preserve script and stylesheet execution order.
const files = new Set(['index.html', 'robots.txt', 'sitemap.xml']);
for (const match of shell.matchAll(/(?:src|href)="(\/[^"?#]+)(?:[?#][^"]*)?"/g)) {
  files.add(match[1].slice(1));
}
const previewUrl=process.env.PS_PREVIEW_SUPABASE_URL;
const previewKey=process.env.PS_PREVIEW_SUPABASE_PUBLISHABLE_KEY;
if(Boolean(previewUrl)!==Boolean(previewKey))throw new Error('Both isolated preview Supabase settings are required');
if(previewUrl&&(process.env.VERCEL_ENV==='production'||!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(previewUrl)||!/^sb_publishable_[A-Za-z0-9_-]+$/.test(previewKey)))throw new Error('Invalid isolated preview database configuration');
const runtimePrefix=previewUrl?'window.PSC_RUNTIME_SUPABASE='+JSON.stringify({url:previewUrl,key:previewKey})+';\n':'';
const assetVersions={};
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const [type, name] of [['javascript', 'current.js'], ['stylesheets', 'current.css']]) {
  const sources = await Promise.all(manifest[type].map(file => readFile(path.join(root, file), 'utf8')));
  const content = (type==='javascript'?runtimePrefix:'')+sources.join(type === 'javascript' ? '\n;\n' : '\n');
  await writeFile(path.join(output, name), content);
  assetVersions[name]=createHash('sha256').update(content).digest('hex').slice(0,16);
}
for (const name of files) {
  if (name === 'current.js' || name === 'current.css') continue;
  await mkdir(path.dirname(path.join(output, name)), { recursive: true });
  await copyFile(path.join(root, name), path.join(output, name));
}
await writeFile(path.join(output,'index.html'),shell.replace(/(\/current\.(?:js|css))\?v=[^"']+/g,(_,asset)=>asset+'?v='+assetVersions[asset.slice(1)]));
// Product images and other dynamically referenced visual assets remain available.
// Historical scripts in assets are deliberately excluded from the published tree.
await cp(path.join(root, 'assets'), path.join(output, 'assets'), {
  recursive: true, filter: async source => {
    if(/\.(?:html|js|css|txt|md)$/i.test(source)||rejectedImagePaths.has(path.relative(root,source)))return false;
    if(/\.(?:png|webp|jpg|jpeg|gif)$/i.test(source)){const hash=createHash('sha256').update(await readFile(source)).digest('hex');if(rejectedImageHashes.has(hash))return false;}
    return true;
  }
});
for (const name of await readdir(root)) {
  if (/\.(?:png|webp|jpg|jpeg|svg|gif|ico|woff2?)$/i.test(name)) {
    await copyFile(path.join(root, name), path.join(output, name));
  }
}
console.log(`Built one application shell with ${files.size - 1} referenced/runtime support files.`);
