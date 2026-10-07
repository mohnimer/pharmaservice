(function(root){
  'use strict';
  const normalize=v=>String(v||'').toLowerCase().replace(/[×*]/g,'x').replace(/[^a-z0-9.]+/g,' ').trim().replace(/wheel chairs?/g,'wheelchair');
  const allowed=['search','add','remove','quantity','retain','location','sites','filter','replace','compare'];
  function validate(value){
    if(!value||!allowed.includes(value.intent)) return null;
    const str=v=>typeof v==='string'?v.trim().slice(0,160):'';
    const quantity=Number(value.quantity);
    return {invalidQuantity:value.quantity!==null&&value.quantity!==undefined&&(!Number.isInteger(quantity)||quantity<1||quantity>10000),intent:value.intent,terms:str(value.terms),size:str(value.size),brand:str(value.brand),unit:['box','pack','piece'].includes(value.unit)?value.unit:'',quantity:Number.isInteger(quantity)&&quantity>=1&&quantity<=10000?quantity:null,location:str(value.location),filter:['consumables','equipment','all'].includes(value.filter)?value.filter:'all',ambiguous:!!value.ambiguous,budget:!!value.budget};
  }
  function interpret(text,context={}){
    const t=normalize(text);if(!t)return null;
    const number=text.match(/-?\d+(?:\.\d+)?/);const quantity=number?Number(number[0]):null;
    const unit=/\bbox(?:es)?\b/.test(t)?'box':/\bpacks?\b/.test(t)?'pack':/\bpieces?\b/.test(t)?'piece':'';
    const location=t.match(/\b(?:deliver(?:y)?(?: this| it)?(?: to)?|location(?: is)?|ship(?: this| it)? to)\s+(.+)/)?.[1];
    if(location)return validate({intent:'location',location});
    if(/\b(?:clinics?|sites?|campuses|schools?)\b/.test(t)&&quantity)return validate({intent:'sites',quantity});
    if(/\b(?:only show|show only|filter|show all)\b/.test(t))return validate({intent:'filter',filter:/consumable/.test(t)?'consumables':/equipment/.test(t)?'equipment':'all'});
    let intent=/\b(?:already have|retain|keep existing)\b/.test(t)?'retain':/\b(?:remove|delete|take out)\b/.test(t)?'remove':/\b(?:replace|swap)\b/.test(t)?'replace':/\b(?:change|set|make)\b/.test(t)&&quantity?'quantity':/\badd\b/.test(t)?'add':/\bcompare\b/.test(t)?'compare':'search';
    let size=t.match(/\b\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?\b/)?.[0]||'';
    let terms=t.replace(/\b(?:we|i|need|needs|a|an|the|some|something|for|our|to|this|it|please|want|of|add|remove|delete|already|have|retain|keep|existing|change|set|make|quantity|compare|show|me|cheaper|budget|boxes|box|packs|pack|pieces|piece)\b/g,' ').replace(/\b\d+\b/g,' ').replace(/\s+/g,' ').trim();
    if(size) terms=terms.replace(/\bx\b/g,'').trim();
    if(/wheelchair/.test(t))terms='wheelchair';
    else if(/gauze/.test(t))terms='gauze';
    else if(/blood pressure|\bbp\b/.test(t))terms='blood pressure';
    else if(/gloves?/.test(t)){terms='gloves';size=t.match(/\b(?:small|medium|large)\b/)?.[0]||size;}
    else if(/beds?/.test(t))terms='bed';
    if(!terms&&(size||intent==='add'||intent==='quantity')){terms=context.terms||'';size=size||context.size||'';}
    return validate({intent,terms,size,quantity:size&&!/\badd\b/.test(t)?null:quantity,unit,ambiguous:/big|large gauze/.test(t),budget:/cheaper|budget|lowest price/.test(t)});
  }
  function rank(items,action){
    const terms=normalize(action.terms).replace(/wheelchairs/g,'wheelchair').replace(/gloves/g,'glove').split(' ').filter(Boolean);
    const size=normalize(action.size).replace(/\s/g,'');
    return items.map(p=>{
      const name=normalize(p.catalogueDisplayName||p.name);const hay=normalize([name,p.name,p.brand,p.pscSku,p.pack,p.cataloguePack,p.spec,p.pscOfferedSpecification].join(' '));
      const stem=hay.replace(/wheelchairs/g,'wheelchair').replace(/gloves/g,'glove');
      const match=terms.length&&terms.every(w=>stem.includes(w));
      const bp=action.terms==='blood pressure'&&/blood pressure|\bbp\b|sphygmomanometer/.test(hay);
      if(!match&&!bp)return {p,score:0};
      const displayedSize=name.match(/\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?/);
      const sizeSource=displayedSize||/^(small|medium|large)$/.test(size)?name:hay;
      if(size&&!sizeSource.replace(/\s/g,'').includes(size))return {p,score:0};
      if(action.brand&&!hay.includes(normalize(action.brand)))return {p,score:0};
      return {p,score:10+terms.filter(w=>name.includes(w)).length*3+(/sterile gauze/.test(name)?3:0)+(p.localCatalogueRefresh?0:1)};
    }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.p);
  }
  const api={normalize,validate,interpret,rank};
  if(typeof module!=='undefined')module.exports=api;
  root.PS_INTELLIGENT_SEARCH=api;
})(typeof window==='undefined'?globalThis:window);
