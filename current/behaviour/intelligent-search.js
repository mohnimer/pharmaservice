(function(root){
  'use strict';
  const knowledge=root.PS_PRODUCT_KNOWLEDGE||(typeof require!=='undefined'?require('./product-knowledge.js'):null);
  const normalize=knowledge.norm;
  const allowed=['search','add','remove','quantity','retain','location','sites','filter','replace','compare'];
  function validate(value){
    if(!value||!allowed.includes(value.intent)) return null;
    const str=v=>typeof v==='string'?v.trim().slice(0,160):'';
    const quantity=Number(value.quantity);
    return {rankedIds:Array.isArray(value.rankedIds)?[...new Set(value.rankedIds.filter(id=>typeof id==='string'))].slice(0,12):[],invalidQuantity:value.quantity!==null&&value.quantity!==undefined&&(!Number.isInteger(quantity)||quantity<1||quantity>10000),intent:value.intent,terms:str(value.terms),size:str(value.size),brand:str(value.brand),unit:['box','pack','piece'].includes(value.unit)?value.unit:'',quantity:Number.isInteger(quantity)&&quantity>=1&&quantity<=10000?quantity:null,location:str(value.location),filter:['consumables','equipment','all'].includes(value.filter)?value.filter:'all',ambiguous:!!value.ambiguous,budget:!!value.budget,large:!!value.large,pediatric:!!value.pediatric,reference:['first','last','selected'].includes(value.reference)?value.reference:''};
  }
  function interpret(text,context={}){
    const t=knowledge.clean(text);if(!t)return null;
    const sku=String(text).match(/\bPS(?:C)?-[A-Z0-9]+(?:-[A-Z0-9]+)+\b/i);if(sku&&!/\b(add|remove|delete|set)\b/.test(t))return validate({intent:'search',terms:sku[0]});
    const number=text.match(/-?\d+(?:\.\d+)?/);const quantity=number?Number(number[0]):null;
    const unit=/\bbox(?:es)?\b/.test(t)?'box':/\bpacks?\b/.test(t)?'pack':/\bpieces?\b/.test(t)?'piece':'';
    const location=t.match(/\b(?:deliver(?:y)?(?: this| it)?(?: to)?|location(?: is)?|ship(?: this| it)? to)\s+(.+)/)?.[1];
    if(location)return validate({intent:'location',location});
    if(/\b(?:clinics?|sites?|campuses|schools?)\b/.test(t)&&quantity)return validate({intent:'sites',quantity});
    if(/\b(?:only show|show only|filter|show all)\b/.test(t))return validate({intent:'filter',filter:/consumable/.test(t)?'consumables':/equipment/.test(t)?'equipment':'all'});
    let intent=/\b(?:already have|retain|keep existing)\b/.test(t)?'retain':/\b(?:remove|delete|take out)\b/.test(t)?'remove':/\b(?:replace|swap)\b/.test(t)?'replace':/\b(?:change|set|make)\b/.test(t)&&quantity?'quantity':/\b(?:add|another|more)\b/.test(t)?'add':/\bcompare\b/.test(t)?'compare':'search';
    let size=t.match(/\b\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?\b/)?.[0]||'';
    let terms=t.replace(/\b(?:we|i|need|needs|a|an|the|some|something|for|our|to|this|it|please|want|of|add|remove|delete|already|have|retain|keep|existing|change|set|make|quantity|compare|show|me|cheaper|budget|boxes|box|packs|pack|pieces|piece)\b/g,' ').replace(size?new RegExp(size.replace(/\s*x\s*/,'\\s*x\\s*')):/$^/,' ').replace(/\s+/g,' ').trim();
    if(['add','quantity','remove','retain'].includes(intent))terms=terms.replace(/\b\d+\b/g,' ').replace(/\s+/g,' ').trim();
    if(size) terms=terms.replace(/\bx\b/g,'').trim();
    if(/wheelchair/.test(t))terms='wheelchair';
    else if(/gauze/.test(t))terms='gauze';
    else if(/blood pressure|\bbp\b/.test(t))terms='blood pressure';
    else if(/gloves?/.test(t)){terms='gloves';size=t.match(/\b(?:small|medium|large)\b/)?.[0]||size;}
    else if(/beds?/.test(t))terms='bed';
    else if(/oxygen.*(?:meter|regulator|flow)/.test(t))terms='oxygen regulator';
    else if(/machine.*(?:check|measure).*pressure/.test(t))terms='blood pressure';
    else if(/sugar machine|blood sugar|glucose meter|glucometer/.test(t))terms='glucose meter';
    else if(/nebulizer/.test(t))terms=/mask|kit|accessor/.test(t)?'nebulizer mask':'nebulizer';
    else if(/stethoscope/.test(t))terms='stethoscope';
    const selected=context.selectedProducts||[];const active=selected.at(-1);
    const diabetes=active&&knowledge.enrich(active).concepts.some(c=>['glucose-meter','glucose-strips','lancet'].includes(c))||/glucose|glucometer/.test(context.terms||'');
    if(/\bstrips?\b/.test(t)&&diabetes)terms='glucose strips';
    if(/\bneedles?\b/.test(t)&&diabetes)terms='lancet';
    const reference=/\bfirst(?: one| item)?\b/.test(t)?'first':/\blast(?: one| item)?\b/.test(t)?'last':/\b(?:those|this one|that one|with this|for this|large one|you know|cheaper version)\b/.test(t)?'selected':'';
    if(reference&&!/strips?|needles?|lancet|mask|filter|tubing/.test(t)){terms=context.terms||knowledge.enrich(active||{}).displayName||terms;size=size||context.size||'';}
    if(/big|large one/.test(t)&&context.terms&&!/gauze|wheelchair|gloves|oxygen|nebulizer/.test(t))terms=context.terms;
    terms=terms.replace(/\b(?:big|large|first|last|one|another|more|those|version|you know)\b/g,' ').replace(/\s+/g,' ').trim();
    if(!terms&&(size||intent==='add'||intent==='quantity'||intent==='remove')){terms=context.terms||'';size=size||context.size||'';}
    return validate({intent,terms,size,quantity:size&&!/\badd\b/.test(t)?null:quantity,unit,reference,large:/\bbig\b|\blarge\b/.test(t),pediatric:/kids|child|pediatric|paediatric/.test(t),ambiguous:/big|large gauze/.test(t),budget:/cheaper|budget|lowest price/.test(t)});
  }
  function rank(items,action,context={}){return knowledge.retrieve(items,action,context).map(x=>x.product);}
  const api={normalize,validate,interpret,rank,retrieve:knowledge.retrieve};
  if(typeof module!=='undefined')module.exports=api;
  root.PS_INTELLIGENT_SEARCH=api;
})(typeof window==='undefined'?globalThis:window);
