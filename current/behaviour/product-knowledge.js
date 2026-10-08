(function(root){
  'use strict';
  const norm=v=>String(v||'').toLowerCase().replace(/[×*]/g,'x').replace(/[^a-z0-9.]+/g,' ').trim().replace(/wheel chairs?/g,'wheelchair').replace(/nebuliser/g,'nebulizer');
  // Domain concepts describe retrieval intent, never clinical suitability or commercial facts.
  const concepts=[
    ['wheelchair',/wheelchair/,/wheelchair|mobility chair|chair with wheels/,['wheel chair','whelchair','wheelchiar','mobility chair','chair with wheels','cannot walk','transport patient']],
    ['gauze',/gauze|wound pad|absorbent.*dressing/,/gauze|gaws|guaze|gauz|wound dressing/,['guaze','gaws','gauz','wound dressing','absorbent pad','big gauze','large wound pad']],
    ['oxygen-regulator',/oxygen regulator|regulator.*flow.*meter/,/oxgen regulater|oxygen.*(?:meter|regulator|flow)|regulator.*oxygen/,['oxygen thing with meter','oxgen regulater','oxygen gauge','oxygen flowmeter','flow meter','oxygen control']],
    ['bp-monitor',/blood pressure|sphygmomanometer|\bbp\b/,/blood pressure|\bbp\b|machine.*(?:check|measure).*pressure|sphygmomanometer/,['machine to check pressure','measure blood pressure','blood pressure machine','bp monitor','sphygmomanometer']],
    ['glucose-meter',/glucometer|glucose (?:monitor|meter)|guide kit/,/sugar machine|glucose meter|glucometer|blood sugar|diabetes machine/,['sugar machine','check sugar','blood sugar monitor','glucose meter','glucometer','diabetes machine']],
    ['glucose-strips',/(?:glucose|glucometer|accu chek).*strips|guide test strips|instant test strips/,/glucose strips|glucometer strips|sugar strips/,['sugar strips','glucose strips','diabetes strips','meter test strips']],
    ['lancet',/lancet/,/lancet|finger prick/,['finger prick','lancing needles','blood sugar needles','lancets']],
    ['nebulizer-mask',/nebulizer.*(?:mask|kit|accessor)|(?:adult|paediatric) nebulizer kit/,/nebulizer.*mask|mask.*nebulizer|kids mask.*nebulizer/,['kids mask for nebuliser','child nebulizer mask','nebulizer mask','nebulisation accessory']],
    ['nebulizer',/nebulizer/,/nebulizer|breathing machine|nebulization/,['nebuliser','nebulizer','breathing machine','nebulisation','nebulization']],
    ['stethoscope',/stethoscope/,/stethoscope|stethscope|listen.*(?:chest|heart)/,['stethscope','stethoscope','listen to chest','listen to heart']],
    ['glove',/glove/,/gloves?|hand protection/,['gloves','exam gloves','hand protection','examination gloves']],
    ['bed',/bed|examination couch/,/beds?|examination couch/,['clinic bed','patient bed','examination couch','exam table']],
    ['thermometer',/thermometer/,/thermometer|check.*temperature|fever machine/,['temperature checker','fever machine','temperature gun','thermometer']],
    ['oximeter',/oximeter|spo2/,/oximeter|oxygen.*finger|finger.*oxygen|spo2/,['finger oxygen checker','oxygen level finger','pulse ox','spo2','oximeter']],
    ['oxygen-mask',/oxygen.*mask/,/oxygen.*mask/,['oxygen mask','oxygen face mask']],
    ['bandage',/bandage|cohesive|elastic.*roll/,/bandage|wrap.*(?:wound|ankle)/,['bandage','compression wrap','wrap for ankle','wound wrap']],
    ['antiseptic',/antiseptic|povidone|chlorhexidine/,/antiseptic|clean.*wound/,['clean wound','wound cleaner','antiseptic']],
    ['syringe',/syringe/,/syringe|injection/,['syringe','injection syringe']],
    ['needle',/needle/,/needles?/,['needles','injection needles']],
    ['aed',/defibrillator|\baed\b/,/defibrillator|\baed\b|heart.*shock/,['aed','defibrillator','heart shock machine']],
    ['crutch',/crutch/,/crutch|walking support/,['crutches','walking support']],
    ['cold-pack',/cold pack|ice pack/,/cold pack|ice pack|swelling pack/,['ice pack','swelling pack','cold pack']],
    ['sharps',/sharps/,/sharps|needle.*bin/,['needle bin','sharps box','sharps disposal']],
    ['first-aid',/first aid/,/first aid/,['first aid kit','emergency kit']],
    ['pediatric',/paediatric|pediatric|child|kids/,/paediatric|pediatric|child|kids|children/,['kids','child','pediatric','paediatric']],
    ['adult',/adult/,/adult/,['adult']],
    ['large',/large|10 x 10|10 x 20|20 x 20/,/large|\bbig\b/,['large','big','large format']],
    ['small',/small|5 x 5/,/small/,['small']],
    ['medium',/medium/,/medium/,['medium']],
    ['sterile',/sterile/,/sterile/,['sterile']]
  ].map(([id,record,query,aliases])=>({id,record,query,aliases}));
  const repairs={whelchair:'wheelchair',wheelchiar:'wheelchair',guaze:'gauze',gaws:'gauze',gauz:'gauze',stethscope:'stethoscope',oxgen:'oxygen',regulater:'regulator',nebuliser:'nebulizer'};
  const clean=v=>norm(v).split(' ').map(t=>repairs[t]||t).join(' ');
  function vector(text,record=false){const t=clean(text);return concepts.map(c=>(record?c.record:c.query).test(t)?1:0);}
  function cosine(a,b){let dot=0,aa=0,bb=0;for(let i=0;i<a.length;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i];}return aa&&bb?dot/Math.sqrt(aa*bb):0;}
  function distance(a,b){const rows=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=0;j<=b.length;j++)rows[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){rows[i][j]=Math.min(rows[i-1][j]+1,rows[i][j-1]+1,rows[i-1][j-1]+(a[i-1]===b[j-1]?0:1));if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])rows[i][j]=Math.min(rows[i][j],rows[i-2][j-2]+1);}return rows[a.length][b.length];}
  const fingerprint=p=>JSON.stringify([p.catalogueDisplayName,p.name,p.brand,p.model,p.category,p.productType,p.cataloguePack,p.pack,p.pscOfferedSpecification,p.spec,p.verifiedCompatibleSkus]);
  function enrich(p){
    const name=p.catalogueDisplayName||p.name||'',officialName=p.name||name;
    const primary=clean(name+' '+officialName);let v=vector(primary,true);
    // A strip containing "meter" in its specification is not itself a meter.
    if(!/strips/.test(clean(name))&&/glucometer|glucose (?:meter|monitor)/.test(clean(name)))v[concepts.findIndex(c=>c.id==='glucose-strips')]=0;
    if(/strips/.test(clean(name))){v[concepts.findIndex(c=>c.id==='glucose-meter')]=0;}
    if(/mask|tubing|filter|chamber|kit/.test(clean(name))&&!/compressor|^nebulizer$/.test(clean(name)))v[concepts.findIndex(c=>c.id==='nebulizer')]=0;
    const ids=concepts.filter((_,i)=>v[i]).map(c=>c.id),aliases=concepts.filter((_,i)=>v[i]).flatMap(c=>c.aliases);
    const specifications=p.pscOfferedSpecification||p.spec||'';
    const model=p.model||[primary.match(/accu chek (?:guide|instant|performa)/)?.[0],primary.match(/pro \d+/)?.[0]].filter(Boolean).join(' ');
    return {id:p.pscSku,visible:p.catalogueVisible!==false,officialName,displayName:name,category:p.category||'',subcategory:p.productType||'',brand:p.brand||'',model,specifications,pack:p.cataloguePack||p.pack||'',concepts:ids,descriptions:aliases,abbreviations:aliases.filter(a=>a.length<5),misspellings:Object.keys(repairs).filter(a=>aliases.includes(a)),intendedUse:aliases[0]||'',institutionContext:p.schoolApproved?'Institutional / school clinic requirement':'Institutional supply enquiry',compatibleIds:Array.isArray(p.verifiedCompatibleSkus)?p.verifiedCompatibleSkus.filter(x=>typeof x==='string'):[],alternatives:[],vector:v,fingerprint:fingerprint(p)};
  }
  const stop=new Set('we i need needs a an the some something for our to this it please want of add remove delete already have retain keep existing change set make quantity compare show me cheaper budget boxes box packs pack pieces piece you know another those and one that called with'.split(' '));
  function tokens(text){return clean(text).split(' ').filter(t=>t&&!stop.has(t)&&!/^\d+$/.test(t));}
  function retrieve(items,action,context={}){
    const persisted=root.PS_PRODUCT_KNOWLEDGE_INDEX?.records||[];const byId=new Map(persisted.map(r=>[r.id,r]));
    const entries=items.map(p=>{const known=byId.get(p.pscSku);return {p,k:known?.fingerprint===fingerprint(p)?known:enrich(p)};});
    const query=clean(action.terms),qt=tokens(query),qv=vector(query);if(qv[concepts.findIndex(c=>c.id==='nebulizer-mask')])qv[concepts.findIndex(c=>c.id==='nebulizer')]=0;const strong=concepts.filter((c,i)=>qv[i]&&!['large','small','medium','sterile','adult','pediatric'].includes(c.id)).map(c=>c.id);
    const selected=(context.selectedProducts||[]).map(enrich),active=selected.at(-1);const size=norm(action.size).replace(/\s/g,'');
    const frequency=new Map();for(const {k}of entries)for(const w of new Set(tokens([k.displayName,k.officialName,k.brand,k.specifications,...k.descriptions].join(' '))))frequency.set(w,(frequency.get(w)||0)+1);
    return entries.map(({p,k})=>{
      const name=clean(k.displayName),hay=clean([k.displayName,k.officialName,k.id,k.category,k.subcategory,k.brand,k.model,k.specifications,k.pack,...k.descriptions].join(' '));const words=[...new Set(tokens(hay))];
      const exact=query&&[clean(k.id),name,clean(k.officialName)].includes(query);let lexical=0,hits=0;
      for(const q of qt){let best=0;for(const w of words){const similarity=w===q?1:q.length>=3&&w.startsWith(q)?0.8:q.length>=4&&Math.abs(q.length-w.length)<=Math.max(1,Math.floor(q.length/4))&&distance(q,w)<=Math.max(1,Math.floor(q.length/4))?0.7:0;if(similarity>best)best=similarity;}if(best){hits++;lexical+=best*Math.log(2+entries.length/(frequency.get(q)||1));}}
      const semantic=cosine(qv,k.vector);const conceptMatch=strong.length&&strong.some(id=>k.concepts.includes(id));
      if(!exact&&!conceptMatch&&(!qt.length||hits/qt.length<0.65))return null;
      if(strong.length&&!conceptMatch&&!exact)return null;
      const displayedSize=name.match(/\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?/);const sizeSource=displayedSize||/^(small|medium|large)$/.test(size)?name:hay;
      if(size&&!sizeSource.replace(/\s/g,'').includes(size))return null;
      if(action.brand&&!hay.includes(clean(action.brand)))return null;
      let score=(exact?100:0)+lexical*2+semantic*30+(conceptMatch?20:0)+(name.startsWith(query)?12:0);
      if(action.large&&strong.includes('gauze')&&/sterile gauze|sterile.*dressing/.test(name))score+=18;
      if(action.large){score+=k.concepts.includes('large')?22:0;if(k.concepts.includes('small'))score-=18;}
      if(action.pediatric){if(k.concepts.includes('adult'))score-=35;if(k.concepts.includes('pediatric'))score+=30;}
      if(action.terms==='nebulizer mask'&&k.concepts.includes('nebulizer-mask'))score+=20;
      if(context.category&&Array.isArray(p.clinicalNeeds)&&p.clinicalNeeds.includes(context.category))score+=2;
      if(context.institutionType==='school'&&p.schoolApproved)score+=1;
      let verifiedCompatibility=false;
      for(const source of selected){if(source.compatibleIds.includes(k.id)||k.compatibleIds.includes(source.id)){score+=90;verifiedCompatibility=true;}else if(source.model&&source.model===k.model)score+=18;}
      if(active&&active.concepts.some(c=>['glucose-meter','glucose-strips','lancet'].includes(c))&&k.concepts.includes('lancet')&&/lancet/.test(query))score+=16;
      return {product:p,knowledge:k,score,confidence:exact?'exact':conceptMatch||hits===qt.length?'strong':'possible',verifiedCompatibility};
    }).filter(Boolean).sort((a,b)=>b.score-a.score);
  }
  const api={norm,clean,concepts:concepts.map(c=>({id:c.id,aliases:c.aliases})),vector,cosine,distance,enrich,retrieve,tokens};
  if(typeof module!=='undefined')module.exports=api;root.PS_PRODUCT_KNOWLEDGE=api;
})(typeof window==='undefined'?globalThis:window);
