import {Window} from 'happy-dom';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export async function buildProductIndex(){
 const manifest=JSON.parse(await readFile('current/manifest.json','utf8')),window=new Window();
 try{
  for(const file of manifest.javascript.slice(0,manifest.javascript.indexOf('app.js'))){if(file==='supabase.js'||file==='current/behaviour/product-knowledge-index.js')continue;window.eval(await readFile(file,'utf8'));}
  const records=window.PSC_DATA.products.map(window.PS_PRODUCT_KNOWLEDGE.enrich);
  for(const record of records){const primary=record.concepts.filter(c=>!['large','small','medium','adult','pediatric','sterile'].includes(c));record.alternatives=records.filter(r=>r.id!==record.id&&r.visible&&primary.some(c=>r.concepts.includes(c))).slice(0,4).map(r=>r.id);}
  const index={version:1,vectorType:'PS domain-concept cosine vectors',catalogueHash:createHash('sha256').update(JSON.stringify(records)).digest('hex'),records};
  await writeFile('current/behaviour/product-knowledge-index.js',`(function(root){const index=${JSON.stringify(index)};if(typeof module!=='undefined')module.exports=index;root.PS_PRODUCT_KNOWLEDGE_INDEX=index;})(typeof window==='undefined'?globalThis:window);\n`);
  return index;
 }finally{await window.happyDOM.abort();}
}
