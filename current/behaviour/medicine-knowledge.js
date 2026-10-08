(function(root){
  'use strict';
  const evidence=root.PS_MEDICINE_EVIDENCE||(typeof require!=='undefined'?require('./medicine-evidence.js'):null);
  const source=code=>'https://atcddd.fhi.no/atc_ddd_index/?code='+code;
  // Ingredient classifications checked against the WHO ATC index, 2026-10-08.
  // These mappings never infer a brand's ingredient or a product's suitability.
  const groups=[
    ['antihistamine','Antihistamines','R06AE',{'cetirizine':'R06AE07','levocetirizine':'R06AE09'}],
    ['antihistamine','Antihistamines','R06AX',{'loratadine':'R06AX13','fexofenadine':'R06AX26','desloratadine':'R06AX27','bilastine':'R06AX29','rupatadine':'R06AX28'}],
    ['antihistamine','Antihistamines','R06AA',{'diphenhydramine':'R06AA02','doxylamine':'R06AA09','dimenhydrinate':'R06AA11'}],
    ['antihistamine','Antihistamines','R06AB',{'chlorphenamine':'R06AB04'}],
    ['nsaid','Non-steroidal anti-inflammatory medicines','M01AE',{'ibuprofen':'M01AE01','naproxen':'M01AE02','ketoprofen':'M01AE03','dexketoprofen':'M01AE17'}],
    ['proton-pump-inhibitor','Proton pump inhibitors','A02BC',{'omeprazole':'A02BC01','pantoprazole':'A02BC02','lansoprazole':'A02BC03','rabeprazole':'A02BC04','esomeprazole':'A02BC05','dexlansoprazole':'A02BC06'}],
    ['analgesic-antipyretic','Analgesics and antipyretics','N02BE',{'paracetamol':'N02BE01'}]
  ];
  const vocabulary='aciclovir amoxicillin azithromycin cefuroxime cefixime ceftriaxone cefalexin ciprofloxacin clarithromycin clindamycin doxycycline metronidazole levofloxacin moxifloxacin fluconazole itraconazole terbinafine ketoconazole clotrimazole diclofenac celecoxib etoricoxib meloxicam prednisolone prednisone dexamethasone hydrocortisone betamethasone mometasone budesonide fluticasone salbutamol montelukast metformin glimepiride gliclazide sitagliptin dapagliflozin empagliflozin semaglutide liraglutide tirzepatide insulin pregabalin gabapentin levothyroxine atorvastatin rosuvastatin simvastatin amlodipine losartan valsartan telmisartan bisoprolol atenolol perindopril ramipril aspirin clopidogrel rivaroxaban apixaban warfarin loperamide domperidone ondansetron lactulose senna bisacodyl macrogol mesalazine carbocisteine ambroxol bromhexine dextromethorphan pseudoephedrine phenylephrine ketotifen'.split(' ');
  const ingredients=[...new Set([...groups.flatMap(g=>Object.keys(g[3])),...vocabulary,'clavulanic acid','mefenamic acid'])];
  const norm=v=>String(v||'').toLowerCase().replace(/[^a-z0-9.%/]+/g,' ').trim();
  const has=(text,word)=>new RegExp('\\b'+word.replace(/ /g,'\\s+')+'\\b').test(text);
  const aliases={antihistamine:['antihistamine','anti histamine','anti histamin','antihistamin','antihistamines','allergy medicine','allergy tablets','something for allergies'],nsaid:['nsaid','nsaids','anti inflammatory','anti-inflammatory','non steroidal anti inflammatory'], 'proton-pump-inhibitor':['ppi','proton pump inhibitors','proton pump inhibitor'], 'analgesic-antipyretic':['analgesic','analgesics','antipyretic','pain relief medicine']};
  function query(text){const t=norm(text);return groups.map(g=>g[0]).filter((id,i,a)=>a.indexOf(id)===i).find(id=>aliases[id].some(a=>has(t,norm(a))))||'';}
  function enrich(p){
    if(!/medicin/i.test(p.category||p.productType||''))return null;
    const factual=[p.name,p.catalogueDisplayName,p.pscOfferedSpecification,p.spec].filter(Boolean).join(' '),t=norm(factual);
    const provisional=p.workbookDecision==='ENQUIRY ONLY'||/provisional supplier listing|identity.*require verification/i.test(factual);
    const verified=p.verifiedMedicine?.evidence?p.verifiedMedicine:evidence.lookup(p);const approved=verified?.evidence;
    const activeIngredients=approved&&Array.isArray(verified.activeIngredients)?verified.activeIngredients.filter(x=>typeof x==='string'):provisional?[]:ingredients.filter(x=>has(t,x));
    const mapped=groups.flatMap(([id,label,code,values])=>activeIngredients.filter(x=>values[x]).map(ingredient=>({id,label,ingredient,ingredientAtcCode:values[ingredient],source:source(code)})));
    const dosageForm=approved&&verified.dosageForm||(!provisional&&[/oral drops/i,/oral solution/i,/syrup/i,/suspension/i,/tablets?|\btab\b/i,/capsules?|\bcap\b/i,/injection|\binj\b/i,/gel/i,/cream/i,/ointment/i,/spray/i,/prefilled pen/i].map((r,i)=>r.test(factual)?['oral drops','oral solution','syrup','suspension','tablet','capsule','injection','gel','cream','ointment','spray','prefilled pen'][i]:null).find(Boolean))||null;
    const strength=approved&&verified.strength||(!provisional&&factual.match(/\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|iu)(?:\s*\/\s*\d*(?:\.\d+)?\s*(?:ml|g))?|\b\d+(?:\.\d+)?\s*%/i)?.[0])||null;
    const missing=[];if(!activeIngredients.length)missing.push('activeIngredients');if(!dosageForm)missing.push('dosageForm');if(!strength)missing.push('strength');if(!mapped.length)missing.push('therapeuticClass');
    const route=approved&&verified.route||(!provisional&&has(t,'oral')?'oral':null);if(!route)missing.push('route');
    return {combination:!!verified?.combination,activeIngredients,genericName:activeIngredients.join(' + ')||null,innNames:activeIngredients,strength,concentration:strength&&strength.includes('/')?strength:null,dosageForm,route,therapeuticClasses:[...new Set(mapped.map(x=>x.id))],classifications:mapped,productAtcCode:approved&&verified.atcCode||null,claims:approved&&Array.isArray(verified.claims)?verified.claims:[],missing,status:missing.length?'SEARCH_METADATA_INCOMPLETE':'SEARCH_METADATA_COMPLETE',provenance:{identity:approved?verified.evidence:'Existing controlled PSC record; explicit name/specification only',classification:'WHO ATC ingredient mapping; not product registration or product ATC assignment',reviewedAt:'2026-10-08'}};
  }
  const api={enrich,query,aliases,ingredients};if(typeof module!=='undefined')module.exports=api;root.PS_MEDICINE_KNOWLEDGE=api;
})(typeof window==='undefined'?globalThis:window);
