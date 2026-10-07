(() => {
  'use strict';

  // V39.20 fallback architecture normalization. The Supabase migration is authoritative;
  // these corrections keep the offline/static fallback aligned with the live family model.
  const familyFixes={
    'PSC-IS-020':[], 'PSC-IS-048':[], 'PSC-IS-053':[],
    'PSC-SC-B14':[], 'PSC-SC-B15':[], 'PSC-SC-B20':[], 'PSC-SC-C19':[],
    'PSC-IS-077':['Nebuliser solution'],
    'PSC-IS-079':['Tablets','Chewable tablets'],
    'PSC-IS-087':['Lotion','Spray','Cream-gel','Gel','Cream'],
    'PSC-IS-094':[],
    'PSC-IS-097':['Sachets','Chewable tablets','Suspension','Tablets'],
    'PSC-IS-099':[],
    'PSC-IS-102':['Eye drops'],
    'PSC-IS-105':['Ear drops'],
    'PSC-IS-109':[], 'PSC-IS-110':[],
    'PSC-SC-D06A':['IV solution'], 'PSC-SC-D06B':['IV solution'], 'PSC-SC-D07':['Injection']
  };
  const familyRows=window.PSC_FAMILY_CATALOGUE_V39?.families;
  if(Array.isArray(familyRows)){
    familyRows.forEach(f=>{
      if(Object.prototype.hasOwnProperty.call(familyFixes,f.familyId)) f.presentations=[...familyFixes[f.familyId]];
      if(f.familyId==='PSC-IS-096') f.commercialSpecification='Prescription-dependent product; exact presentation, strength and patient-specific indication to be confirmed before supply.';
    });
  }

  // Repair known exact product -> family relationships in the static fallback catalogue.
  const parents={
    'INST-0004':'PSC-SC-A04',
    'INST-0057':'PSC-SC-C05','INST-0058':'PSC-SC-C05',
    'INST-0065':'PSC-SC-C08','INST-0066':'PSC-SC-C08',
    'INST-0067':'PSC-SC-C09','INST-0068':'PSC-SC-C09',
    'INST-0076':'PSC-SC-C14','INST-0077':'PSC-SC-C14',
    'INST-0079':'PSC-SC-C15','INST-0080':'PSC-SC-C15',
    'INST-0082':'PSC-SC-C16','INST-0086':'PSC-SC-C18',
    'INST-0096':'PSC-SC-C23','INST-0097':'PSC-SC-C23',
    'INST-0098':'PSC-SC-C24','INST-0099':'PSC-SC-C24',
    'INST-0103':'PSC-SC-D02','INST-0104':'PSC-SC-D02',
    'INST-0169':'PSC-IS-045','INST-0172':'PSC-IS-047',
    'INST-0191':'PSC-IS-063','INST-0199':'PSC-IS-068',
    'INST-0207':'PSC-IS-073','INST-0227':'PSC-IS-090','INST-0228':'PSC-IS-090'
  };
  const products=window.PSC_DATA?.products;
  if(Array.isArray(products)){
    products.forEach(p=>{
      const sku=String(p.pscSku||'');
      if(parents[sku]) p.catalogueParentId=parents[sku];
      // Generic medicine/presentation scaffolding is a family child, not an exact SKU line card.
      // Exact SKU/brand choices are now shown inside the family preference panel.
      const m=sku.match(/^INST-(\d{4})$/);
      if(m){
        const n=Number(m[1]);
        if(n>=207 && n<=260) p.catalogueVisible=false;
      }
    });
  }
})();
