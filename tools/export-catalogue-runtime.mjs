import {Window} from 'happy-dom';
import {readFile,writeFile} from 'node:fs/promises';
const manifest=JSON.parse(await readFile('current/manifest.json','utf8'));
const window=new Window();
try{
 for(const file of manifest.javascript.slice(0,manifest.javascript.indexOf('app.js'))){
  if(['supabase.js','current/behaviour/product-knowledge-index.js'].includes(file))continue;
  window.eval(await readFile(file,'utf8'));
 }
 await writeFile('../research/catalogue-benchmarks-20261012/runtime.json',JSON.stringify({products:window.PSC_DATA.products,families:window.PSC_FAMILY_CATALOGUE_V39.families,options:window.PS_CATALOGUE_REFRESH.approvedOptions},null,2));
 console.log('Exported current identities');
}finally{await window.happyDOM.abort();}
