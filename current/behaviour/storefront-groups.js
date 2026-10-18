(function(root){
 'use strict';
 // Presentation identity only. Never rewrite the catalogue, its evidence or its family keys.
 const norm=v=>String(v||'').normalize('NFKC').toUpperCase().replace(/[’‘]/g,"'").replace(/[–—]/g,'-').replace(/\s+/g,' ').trim();
 const family=p=>p?.catalogueParentId||p?.catalogueReferenceFamilyId||p?.family_id||p?.pscSku||p?.sku;
 const sku=p=>p?.pscSku||p?.sku;
 const realBrand=v=>!!norm(v)&&! /^(SPECIFICATION-LED|GENERIC|UNBRANDED|VARIOUS|NONE|N\/?A|PSC?|INSTITUTIONAL RANGE|NEEDS VERIFICATION)$/.test(norm(v));
 const knownPack=v=>!!norm(v)&&! /CONFIRM|VERIFY|PENDING|UNKNOWN|REGISTERED PACK/.test(norm(v));
 const canonical=v=>norm(v).replace(/(\d)\s*(MG|MCG|ML|GM|G|KG|IU)\b/g,'$1 $2').replace(/\bGM\b/g,'G').replace(/\b(?:TABLETS?|TABS?)\b/g,'TABLET').replace(/\b(?:CAPSULES?|CAPS?)\b/g,'CAPSULE').replace(/\s+-\s+/g,' ').replace(/\s+/g,' ').trim();
 function identity(p,record=p){
  const exactSku=sku(p),brand=record?.brand??p?.brand,name=record?.name??p?.name,pack=record?.pack??p?.pack;
  const base={familyId:family(p),sku:exactSku,name,brand,pack,sourceKind:record?.source_kind||'product'};
  if(base.sourceKind!=='product')return {...base,key:'requirement:'+exactSku,stem:name,rule:'requirement'};
  if(!realBrand(brand)||!knownPack(pack))return {...base,key:'sku:'+exactSku,stem:name,rule:!realBrand(brand)?'generic-exact-record':'pack-unconfirmed'};
  let stem=canonical(name),removed=false;
  // Remove only a terminal quantity corroborated by this record's controlled pack.
  // Strengths, model numbers, stages, actives, routes and formulations remain in the identity.
  const count=norm(pack).match(/^(\d+)\s+(TABLETS?|CAPSULES?|LOZENGES?|OVULES?|PIECES?|CONDOMS?)\b/);
  if(count){
   const n=count[1],form=canonical(count[2]);
   const full=new RegExp('\\b'+n+' '+form+'$'),short=new RegExp('\\b'+form+' '+n+" ?'S$");
   if(full.test(stem)){stem=stem.replace(full,form);removed=true;}
   else if(short.test(stem)){stem=stem.replace(short,form);removed=true;}
  }
  const fill=canonical(pack).match(/^(\d+(?:\.\d+)?) (G|ML|KG)(?: (?:TUBE|BOTTLE|JAR|DISPENSER))?$/);
  if(fill){
   const amount=new RegExp('(?:^| )'+fill[1].replace('.','\\.')+' '+fill[2]+'$');
   // A concentration denominator must never become a removable pack quantity.
   if(amount.test(stem)&&! /\/$/.test(stem.replace(amount,''))){stem=stem.replace(amount,'').trim();removed=true;}
  }
  return {...base,key:removed?['product',family(p),norm(brand),stem].join(':' ):'sku:'+exactSku,stem,rule:removed?'controlled-pack-only':'exact-record'};
 }
 function groups(rows,recordFor,representative){
  const map=new Map();
  for(const p of rows||[]){const i=identity(p,recordFor(p)||p);if(!map.has(i.key))map.set(i.key,{identity:i,members:[]});map.get(i.key).members.push(p);}
  return [...map].map(([key,{identity:i,members}])=>{
   const hero=representative(members),name=members.length>1?i.stem:hero.name;
   return {...hero,_familyGroup:{id:key,parentFamilyId:i.familyId,name,members,representativeSku:sku(hero),identityRule:i.rule,storefront:true,sourceKind:i.sourceKind}};
  });
 }
 // Approval records describe a curated presentation decision, not new technical facts.
 // Strict requirements need explicit compliance evidence; neither stock nor MRP is a quality score.
 function shortlist(candidates,decision){
  if(decision?.status!=='APPROVED'||!decision.requirementKey||!decision.reviewer||!decision.reviewedAt)return [];
  const choices=decision.choices||[];
  if(choices.length>3||choices.length<1)return [];
  const wanted=new Set(),selected=[];
  for(const c of choices){
   const brand=norm(c.brand);if(!brand||wanted.has(brand)||!c.rationale||!c.evidence||(decision.strict&&c.requirementFit!=='CONFIRMED'))return [];
   const matches=candidates.filter(p=>norm(p.brand)===brand&&c.skus?.includes(sku(p)));if(!matches.length)return [];
   wanted.add(brand);selected.push(...matches);
  }
  return selected;
 }
 function curate(rows=[],decisions=[]){
  const remove=new Set(),used=new Set();
  for(const decision of decisions){
   const scope=new Set(decision.candidateSkus||[]);if(!scope.size||[...scope].some(id=>used.has(id)))continue;
   const candidates=rows.filter(p=>scope.has(sku(p))),chosen=shortlist(candidates,decision);
   // A partial search result must not invalidate an approved shortlist or replace an exact match.
   if(candidates.length!==scope.size||!chosen.length)continue;
   const keep=new Set(chosen.map(sku));for(const p of candidates)if(!keep.has(sku(p)))remove.add(sku(p));
   for(const id of scope)used.add(id);
  }
  return rows.filter(p=>!remove.has(sku(p)));
 }
 const api=Object.freeze({identity,groups,shortlist,curate,realBrand,norm});
 if(typeof module!=='undefined')module.exports=api;root.PSC_STOREFRONT_GROUPS=api;
})(typeof window==='undefined'?globalThis:window);
