/* Procurement planning templates, separate from the controlled product master.
   No pilot is clinically/technically approved. Exact records are candidates for quotation. */
(()=>{'use strict';
 const line=(id,sku,label,extra={})=>({id,sku,label,quantity:1,optional:false,selected:true,verification:'PENDING',evidence:null,...extra});
 window.PSC_READY_BASKET_TEMPLATES=Object.freeze([
  {id:'glucose-monitoring',name:'Glucose monitoring',purpose:'Bring the meter, testing supplies and compatibility checks into one request.',category:'vitals',status:'PREVIEW',evidence:null,lines:[
   line('meter','PSC-DBT-001','Glucose meter kit',{capital:true,setupOnly:true,note:'Kit contents need confirmation. Extra strips are not selected by default.'}),
   line('strips','PSC-DBT-002','Additional test strips',{optional:false,selected:false,note:'Confirm meter compatibility and the strips already included in the kit.',replenishmentSelected:true}),
   line('lancing',null,'Compatible lancing device and lancets',{specification:'Confirm lancing device model, compatible lancets, selling pack and existing kit contents.',optional:false,selected:false}),
   line('control','INST-0137','Compatible control solution',{optional:true,selected:false,note:'Confirm compatibility, control range and supplied pack.'})]},
  {id:'nebulizer-setup',name:'Nebulizer setup',purpose:'Equipment and the right accessories, with kit contents checked before quotation.',category:'breathing',status:'PREVIEW',evidence:null,lines:[
   line('compressor','PSC-RES-001','Compressor nebulizer',{capital:true,setupOnly:true,note:'The exact supplied kit contents require confirmation.'}),
   line('chamber','INST-0131','Chamber and tubing',{optional:false,selected:false,replenishmentSelected:true,note:'May already be included. Confirm the compressor model and connections.'}),
   line('interface',null,'Appropriate mask or mouthpiece',{optional:false,selected:false,specification:'Confirm patient interface, age/size, device compatibility and supplied kit contents.'}),
   line('filter','INST-0132','Replacement filter',{optional:true,selected:false,note:'Confirm the exact compressor model and compatible filter.'})]},
  {id:'wound-care',name:'Wound care essentials',purpose:'A practical starting point for dressings, gauze and fixation supplies.',category:'wounds',status:'PREVIEW',evidence:null,lines:[
   line('gauze','PSC-WND-002','Sterile gauze swabs',{note:'Confirm clinical specification and the requested pack quantity.'}),
   line('dressing','INST-0154','Non-adherent dressing',{note:'Dressing type, size, sterility and pack require review.'}),
   line('fixation','INST-0158','Fixation tape',{note:'Confirm width, material, skin suitability and pack.'}),
   line('other',null,'Additional dressing requirement',{optional:true,selected:false,specification:'Specify any additional dressing type, size, material or sterility requirement.'})]}
 ]);
})();
