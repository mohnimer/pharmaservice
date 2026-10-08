(function(root){
  'use strict';
  const links=[{left:'PSC-DBT-001',leftName:'ACCU-CHEK Guide Kit + Strips 50s',right:'PSC-DBT-002',rightName:'ACCU-CHEK Guide Test Strips 50s',type:'compatible_consumable',source:'https://www.accu-chek.com/products/strips/guide',reviewedAt:'2026-10-08'}];
  const norm=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  function forProduct(p){return links.filter(r=>(p.pscSku===r.left&&norm(p.name)===norm(r.leftName))||(p.pscSku===r.right&&norm(p.name)===norm(r.rightName))).map(r=>({targetId:p.pscSku===r.left?r.right:r.left,targetName:p.pscSku===r.left?r.rightName:r.leftName,type:r.type,source:r.source,reviewedAt:r.reviewedAt}));}
  const api={forProduct,norm};if(typeof module!=='undefined')module.exports=api;root.PS_PRODUCT_RELATIONSHIPS=api;
})(typeof window==='undefined'?globalThis:window);
