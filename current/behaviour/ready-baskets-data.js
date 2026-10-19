/* Institutional procurement scopes, separate from the controlled master.
   Planning previews: quantities are editable request units, never a compliant clinic checklist. */
(()=>{'use strict';
 const line=(id,sku,label,extra={})=>({id,sku,label,quantity:1,optional:false,selected:true,verification:'PENDING',evidence:null,...extra});
 window.PSC_READY_BASKET_TEMPLATES=Object.freeze([
  {id:'clinic-opening',name:'Clinic opening & fit-out',purpose:'Bring furniture, examination equipment and opening consumables into one coordinated request.',scope:['Examination space','Clinical storage','Opening consumables'],category:'equipment',status:'PREVIEW',evidence:null,lines:[
   line('couch','INST-0011','Examination couch',{capital:true,setupOnly:true,note:'Confirm room dimensions, adjustment, mattress and paper-roll provision.'}),
   line('screen','PSC-EQP-002','Privacy screen',{capital:true,setupOnly:true,note:'Confirm dimensions, panel material and cleaning requirements.'}),
   line('trolley','PSC-EQP-005','Instrument trolley',{capital:true,setupOnly:true,note:'Confirm shelf dimensions, load and cleaning requirements.'}),
   line('cabinet','INST-0002','Lockable clinical storage',{capital:true,setupOnly:true,note:'Confirm storage needs, dimensions and lock arrangement.'}),
   line('stethoscope','PSC-DIA-008','Clinical stethoscope',{capital:true,setupOnly:true,note:'Confirm intended users and exact model.'}),
   line('gloves','PSC-PPE-001','Examination gloves',{note:'Select required sizes and confirm material and selling pack.'}),
   line('couch-roll','PSC-BAS-001','Couch roll',{note:'Confirm dispenser fit, width and rolls per case.'}),
   line('sharps','PSC-WST-001','Sharps container',{note:'Confirm capacity, mounting and waste arrangements.'}),
   line('site-list',null,'Site-specific equipment and requirements',{selected:false,optional:true,specification:'Supply the site list, room layout and applicable clinical requirements. Identify additional diagnostics, emergency equipment, installation and handover needs.'})]},
  {id:'clinic-restock',name:'Clinical consumables restock',purpose:'Review everyday examination, dressing and waste supplies together, then adjust quantities to your actual stock gaps.',scope:['Examination supplies','Dressings & fixation','Waste consumables'],category:'infection',status:'PREVIEW',evidence:null,lines:[
   line('gloves','PSC-PPE-001','Examination gloves',{note:'Confirm material, size split and exact selling pack.'}),
   line('gauze','PSC-WND-002','Sterile gauze swabs',{note:'Confirm dimensions, ply, sterility and requested pack quantity.'}),
   line('bandage','PSC-WND-003','Conforming bandage',{note:'Retain the exact size and pack; change quantities to match your stock check.'}),
   line('fixation','INST-0158','Fixation tape',{note:'Confirm width, material, skin suitability and pack.'}),
   line('couch-roll','PSC-BAS-001','Couch roll',{note:'Confirm roll width and case quantity.'}),
   line('sharps','PSC-WST-001','Sharps container',{note:'Confirm capacity and local disposal arrangements.'}),
   line('waste-bags','PSC-WST-003','Clinical waste bags',{note:'Confirm dimensions, waste stream and rolls per case.'}),
   line('stock-list',null,'Additional stock gaps',{selected:false,optional:true,specification:'List additional consumables, exact sizes/packs and requested quantities from your stock check. No usage forecast is assumed.'})]},
  {id:'first-aid-rollout',name:'First-aid points & refills',purpose:'Equip first-aid points across your sites, or replenish existing supplies without buying the containers again.',scope:['First-aid storage','Dressings & bandages','Site-by-site refills'],category:'emergency',status:'PREVIEW',evidence:null,lines:[
   line('container','PSC-EQP-007','First-aid storage',{capital:true,setupOnly:true,note:'Confirm box or bag, capacity, mounting and whether any contents are included. Loose refill lines are selectable separately.'}),
   line('gauze','PSC-WND-002','Sterile gauze swabs',{selected:false,replenishmentSelected:true,note:'Select after checking existing contents, quantities and expiry.'}),
   line('bandages','PSC-WND-006','Adhesive bandages',{selected:false,replenishmentSelected:true,note:'Confirm exact size/pack and the refills missing at each point.'}),
   line('conforming','PSC-WND-003','Conforming bandage',{selected:false,replenishmentSelected:true,note:'Confirm needed quantities and existing contents before adding.'}),
   line('triangular','INST-0157','Triangular bandages',{selected:false,replenishmentSelected:true,note:'Confirm material, size, pack and contents already held.'}),
   line('scissors','INST-0028','Bandage scissors',{selected:false,optional:true,note:'Check existing kits before adding. Confirm size and material.'}),
   line('site-schedule',null,'Site and refill schedule',{selected:false,optional:true,specification:'Specify the number and location of first-aid points, existing kit contents and missing or expired items. Final scope depends on site risks and applicable requirements.'})]}
 ]);
})();
