(function(root){
  'use strict';
  // Search-only factual supplements. No registration, availability, price or
  // supplier claims. Foreign regulator evidence validates formula, not UAE approval.
  const rows=[
    ['PS-AC-70BCF2EF8CA0','claritine','10mg',['loratadine'],'10 mg','tablet','https://www.claritine.me/en/products/claritine-medicine'],
    ['PS-AC-7789FFECC541','telfast','120mg',['fexofenadine'],'120 mg','tablet','https://www.telfast.com/en-ae/products/telfast-tablets-120-mg',['non-drowsy']],
    ['PS-AC-286239754589','telfast','180mg',['fexofenadine'],'180 mg','tablet','https://www.telfast.com/en-ae/products/telfast-tablets-180-mg',['non-drowsy']],
    ['PS-AC-CF2A59100FF8','finallerg','10mg',['cetirizine'],'10 mg','tablet','https://www.sfda.gov.sa/ar/details_data?id=0603233335&nid=17582&page=131'],
    ['PS-AC-3E7CD6BDAB3C','finallerg','10mg',['cetirizine'],'10 mg','tablet','https://www.sfda.gov.sa/ar/details_data?id=0603233335&nid=17582&page=131'],
    ['PS-AC-89836E13CEAE','finallerg','1mg/ml',['cetirizine'],'1 mg/ml','oral solution','https://www.sfda.gov.sa/ar/details_data?id=0406245390&nid=17582&page=131'],
    ['PS-AC-8D861823242C','lohist','10mg',['loratadine'],'10 mg','tablet','https://sfda.gov.sa/en/details_data?id=0801256550&nid=17582&page=23'],
    ['PS-AC-A9F14BB5E5C6','lohist','5mg/5ml',['loratadine'],'5 mg/5 ml','syrup','https://sfda.gov.sa/en/details_data?id=0801256549&nid=17582&page=23'],
    ['PS-AC-B5F68F0EEF03','glotrizine','5mg/5ml',['cetirizine'],'5 mg/5 ml','syrup','https://www.globalpharma.ae/medicines/allergy/'],
    ['PSC-MED-126','panadol night','',['paracetamol','diphenhydramine'],'500 mg + 25 mg','tablet','https://www.haleonhealthpartner-gne.com/content/dam/cf-consumer-healthcare/health-professionals/en_AE/pdf/PIL-Panadol-Night.pdf',[],true]
  ];
  function lookup(p){const row=rows.find(r=>r[0]===p.pscSku);if(!row)return null;const name=String(p.name||p.catalogueDisplayName||'').toLowerCase().replace(/\s/g,'');if(!name.includes(row[1].replace(/\s/g,''))||(row[2]&&!name.includes(row[2])))return null;return {activeIngredients:row[3],strength:row[4],dosageForm:row[5],route:'oral',evidence:row[6],claims:row[7]||[],combination:!!row[8],reviewedAt:'2026-10-08',scope:'Ingredient/strength/form only; controlled pack and regulatory status unchanged'};}
  const api={lookup};if(typeof module!=='undefined')module.exports=api;root.PS_MEDICINE_EVIDENCE=api;
})(typeof window==='undefined'?globalThis:window);
