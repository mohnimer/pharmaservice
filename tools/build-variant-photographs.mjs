import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const data=JSON.parse(await readFile('data/variant-photographs.json','utf8'));
const keys=new Set();
for(const r of data.records){
 const key=r.family_id+'|'+r.product_option_id;
 if(keys.has(key))throw Error('Duplicate photo binding '+key);keys.add(key);
 if(!r.reviewed||!r.exact_product_name||!r.image_url?.startsWith('/assets/products/'))throw Error('Unreviewed photo '+key);
 const bytes=await readFile('.'+r.image_url);
 if(createHash('sha256').update(bytes).digest('hex')!==r.sha256)throw Error('Photo bytes changed '+key);
}
await writeFile('current/behaviour/variant-photographs-data.js','// Reviewed image-only identities. Commercial fields stay in their existing authority.\nwindow.PSC_VARIANT_PHOTOGRAPHS='+JSON.stringify(data)+';\n');
console.log('Generated '+data.records.length+' reviewed photograph bindings');
