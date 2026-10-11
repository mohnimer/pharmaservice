#!/usr/bin/env node
// Imports Batch 33 source photographs into a PRIVATE, NON-PUBLISHED repository
// staging directory. Run from the PSC repository root with the extracted
// psc_batch33_release folder as the argument. Does not modify site runtime.
import {readFile, readdir, mkdir, copyFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const bundle=path.resolve(process.argv[2]||'');
const source=path.join(bundle,'assets/acorus-batch-33');
const destination=path.resolve('staging/catalogue-batch33/assets');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const fail=m=>{throw Error('Batch 33: '+m);};
const rows=JSON.parse(await readFile(path.join(source,'catalogue-image-QA.json'),'utf8'));
const names=(await readdir(source)).filter(f=>f.endsWith('.webp'));
if(rows.length!==150||names.length!==150)fail('must contain exactly 150 QA entries and image files');
const seenFiles=new Set(), seenImages=new Set();
const outcome=[];
for(const row of rows){
  const publicPath=String(row.website_image_path||'');
  if(!/^[a-z0-9_]+[.]webp$/.test(path.basename(publicPath)) || publicPath!=='/assets/acorus-batch-33/'+path.basename(publicPath))
    fail('unsafe or noncanonical image path for '+row.product_name);
  const name=path.basename(publicPath);
  if(seenFiles.has(name)||!names.includes(name))fail('missing or duplicate '+name);
  const bytes=await readFile(path.join(source,name));
  if(sha(bytes)!==row.image_sha256)fail('SHA-256 mismatch '+name);
  if(bytes.subarray(8,12).toString()!=='WEBP')fail('not WebP '+name);
  if(seenImages.has(row.image_sha256))fail('duplicate image content '+name);
  seenFiles.add(name);seenImages.add(row.image_sha256);
  outcome.push({
    family_id:row.psc_family_id,source_name:row.product_name,
    existing_master_product:row.existing_master_product||null,
    file:name,sha256:row.image_sha256,
    source_identity_claim:row.photo_identity_status,
    pack_claim:row.pack_spec_status,
    price_status:'MISSING',
    release_status:'HOLD',
    reason:'Exact live option ID, pack, description, price and photograph approval pending'
  });
}
await mkdir(destination,{recursive:true});
for(const name of names)await copyFile(path.join(source,name),path.join(destination,name));
await writeFile(path.resolve('staging/catalogue-batch33/candidate-image-register.json'),
  JSON.stringify(outcome,null,2)+'\n');
console.log('Staged 150 checksum-verified source photographs; zero released.');
console.log('Production assets, product prices, runtime manifest and Supabase unchanged.');
