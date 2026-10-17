import {readFileSync,writeFileSync} from 'node:fs';
import {Window} from 'happy-dom';
const w=new Window({url:'http://localhost/',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
w.document.body.innerHTML='<div id="app"></div>';w.structuredClone=structuredClone;
w.eval(readFileSync('tests/mock-supabase.js','utf8'));w.eval(readFileSync('dist/current.js','utf8'));
const selected=[['PSC-WND-001',['firstaid']],['PSC-WND-002',['firstaid']],['PSC-PPE-001',['gloves']],['PSC-PPE-002',['gloves']]];
const quote=s=>"'"+String(s).replaceAll("'","''")+"'";
const rows=selected.map(([sku,questions])=>{
 const p=w.PSC_DATA.products.find(p=>p.pscSku===sku);
 if(!p||p.regulated!==false)throw Error('Missing or restricted exact mapping '+sku);
 return {sku:p.pscSku,family_id:null,name:p.name,brand:p.brand||'',pack:'Pack / selling unit to confirm',question_ids:questions,regulated:false,active:true,exact_verified:false,source_revision:'PSC-20261012-STOCK-002'};
});
writeFileSync('current/workshop/mapping-register.json',JSON.stringify(rows,null,2)+'\n');
const sql=rows.map(r=>'insert into public.ps_readiness_catalogue(sku,family_id,name,brand,pack,question_ids,regulated,active,exact_verified,source_revision) values('+[quote(r.sku),'null',quote(r.name),quote(r.brand),quote(r.pack),'array['+r.question_ids.map(quote).join(',')+']','false','true','false',quote(r.source_revision)].join(',')+');').join('\n');
const path='supabase/migrations/20261017104154_workshop_report_card.sql';
let s=readFileSync(path,'utf8');const before=s.split('-- Exact source-backed recommendation mappings')[0],after=s.split('-- End recommendation mappings')[1]||'';writeFileSync(path,before+'\n-- Exact source-backed recommendation mappings\n'+sql+'\n-- End recommendation mappings\n'+after);
await w.happyDOM.close();console.log('Bound four existing catalogue requirements provisionally; no exact SKU, pack, price or stock claim is inferred.');
