// Reproducible local runtime evidence inventory, not a live database query.
import {Window} from 'happy-dom';
import {readFile,writeFile} from 'node:fs/promises';
const manifest=JSON.parse(await readFile('current/manifest.json','utf8'));
const register=JSON.parse(await readFile('docs/verified-preview-variant-register.json','utf8'));
const window=new Window();
try {
 for(const file of manifest.javascript.slice(0,manifest.javascript.indexOf('app.js'))){
  if(file==='supabase.js'||file==='current/behaviour/product-knowledge-index.js')continue;
  window.eval(await readFile(file,'utf8'));
 }
 const cards=window.PSC_DATA.products.filter(p=>p.catalogueVisible!==false).map(p=>{
  const evidence=register.find(r=>r.psc_sku===p.pscSku);
  const gaps=[];
  if(!evidence){gaps.push('EXACT_IMAGE_EVIDENCE','EXACT_DESCRIPTION_EVIDENCE','EXACT_PACK_EVIDENCE','DATED_UAE_RETAIL_EVIDENCE');}
  else {
   if(p.currentImageUrl!==evidence.image_path)gaps.push('RUNTIME_IMAGE_MISMATCH');
   if(p.pack!==evidence.pack)gaps.push('RUNTIME_PACK_MISMATCH');
   if(p.verified_description!==evidence.description&&evidence.description)gaps.push('RUNTIME_DESCRIPTION_MISMATCH');
  }
  return {sku:p.pscSku,name:p.name,family_id:p.catalogueParentId||null,
   image:p.currentImageUrl||p.imageUrl||null,image_status:p.imageStatus||null,
   evidence_option_id:evidence?.product_option_id||null,
   status:gaps.length?'HOLD':'VERIFIED_PREVIEW_CANDIDATE',gaps};
 });
 const options=window.PS_CATALOGUE_REFRESH.approvedOptions.map(o=>({
  local_option_id:o.product_option_id,family_id:o.family_id,name:o.exact_product_name,
  status:register.some(r=>r.product_option_id===o.product_option_id)?'VERIFIED_PREVIEW_CANDIDATE':'HOLD',
 }));
 const report={scope:'Local checked-in runtime cards and local options only; database reference inventory is separate. No identities merged.',
  whole_catalogue_release:'HOLD',production_changed:false,
  counts:{cards:cards.length,verified_cards:cards.filter(c=>!c.gaps.length).length,
   cards_pending:cards.filter(c=>c.gaps.length).length,local_options:options.length,
   verified_local_options:options.filter(o=>o.status==='VERIFIED_PREVIEW_CANDIDATE').length},cards,options};
 const content=JSON.stringify(report,null,2)+'\n';
 if(process.argv.includes('--check')){
  if(await readFile('docs/catalogue-listing-evidence-gap-register.json','utf8')!==content)
   throw Error('Evidence gap register is stale; rerun node tools/audit-listing-evidence.mjs');
 }else await writeFile('docs/catalogue-listing-evidence-gap-register.json',content);
 console.log(JSON.stringify(report.counts));
}finally{await window.happyDOM.abort();}
