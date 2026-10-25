const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),{webcrypto}=require('node:crypto');
function model(){const window={};vm.runInNewContext(fs.readFileSync('current/behaviour/buyer-journey.js','utf8'),{window,crypto:webcrypto});return window.PSC_BUYER_JOURNEY;}
test('repeat retains exact original facts and strips obsolete commercial values without changing history',()=>{
 const a=model(),l={sku:'A',qty:3,lineSnapshot:{name:'Gauze',pack:'5 sterile pieces',brand:'B'},supplier_stock_status:'In stock',verified_price_aed:5};
 const original=JSON.stringify(l),next=a.repeatLine(l,{name:'Gauze',pack:'5 sterile pieces'},'OLD');assert.equal(JSON.stringify(l),original);assert.equal(next.qty,3);assert.equal(next.lineSnapshot.pack,l.lineSnapshot.pack);assert.equal(next.verified_price_aed,undefined);assert.equal(next.supplier_stock_status,undefined);
});
test('missing, hidden and changed packs become sourcing requirements with original reference, never a replacement SKU',()=>{
 const a=model(),l={sku:'OLD',qty:2,lineSnapshot:{name:'Strip X',pack:'50 strips'}};
 for(const p of [null,{name:'Strip X',pack:'25 strips'},{name:'Strip X',pack:'50 strips',catalogueVisible:false}]){const n=a.repeatLine(l,p,'R1');assert.equal(n.kind,'unlisted');assert.equal(n.sku,undefined);assert.equal(n.historicalSku,'OLD');assert.equal(n.requestUnit,'50 strips');}
});
test('historical database options remain references, not automatically reauthorized IDs',()=>{
 const a=model(),n=a.repeatLine({familyId:'F',productOptionId:'old-option',productOptionSnapshot:{exact_product_name:'Original device',verified_price_aed:100},qty:1},null,'R');assert.equal(n.productOptionId,'');assert.equal(n.historicalOptionId,'old-option');assert.equal(n.productOptionSnapshot.verified_price_aed,undefined);
});
test('legacy history without a recorded pack never borrows the current catalogue pack',()=>{const n=model().repeatLine({sku:'LEGACY',qty:1},{name:'Current product',pack:'New pack'},'R');assert.equal(n.kind,'unlisted');assert.equal(n.requestUnit,'');assert.equal(n.description,'LEGACY');});
test('issued quotation uses its own exact quantities, prices and tax, including zero and incomplete fields',()=>{
 const a=model(),q={id:'Q',status:'sent'},rows=[{quote_id:'Q',line_description_snapshot:'Issued gauze',pack_snapshot:'20',quantity:2,unit_sell_price_ex_vat:10,vat_rate_pct:5}];
 const r=a.quoteView(q,rows);assert.equal(r.total,21);assert.equal(r.rows[0].pack,'20');assert.equal(a.quoteView({...q,status:'draft'},rows).rows.length,0);
 assert.equal(a.quoteView(q,[{...rows[0],unit_sell_price_ex_vat:null}]).complete,false);assert.equal(a.quoteView(q,[{...rows[0],unit_sell_price_ex_vat:0}]).total,0);assert.equal(a.quoteView(q,[]).total,null);
});
test('group visibility never becomes purchasing authority',()=>{
 const a=model(),c={group:{id:'G',slug:'generic'},school:{id:'S1'},schools:[{id:'S1'},{id:'S2'}],memberships:[{group_id:'G',school_id:null,role:'group_admin'}]};assert(a.groupScope(c));assert(!a.canDecide(c));assert(!a.groupScope({...c,memberships:[{group_id:'G',school_id:'S1',role:'school_user'}]}));
 assert(a.canDecide({...c,group:{id:'G',slug:'aeg-education'},memberships:[{group_id:'G',school_id:'S1',role:'management_approver'}]}));
});
test('purchasing decisions use the displayed revision and reject expired, missing and incomplete quotes',()=>{
 const a=model(),c={group:{slug:'aeg-education'},school:{id:'S'},memberships:[{school_id:'S',role:'management_approver'}]},q={id:'Q',status:'sent',current_revision:3,expires_at:'2026-10-25'},l={quote_id:'Q',line_description_snapshot:'Exact gauze',pack_snapshot:'20 packs',quantity:1,unit_sell_price_ex_vat:10,vat_rate_pct:5},r={status:'Sent',quote:{issued:q,issuedLines:[l]}};
 const now=Date.parse('2026-10-25T19:59:59Z');assert.equal(a.decisionGate(c,r,now).revision,3);assert.equal(a.decisionGate(c,r,Date.parse('2026-10-25T20:00:00Z')).ok,false);
 for(const change of [{expires_at:null},{status:'draft'},{status:'expired'},{current_revision:null}])assert.equal(a.decisionGate(c,{...r,quote:{issued:{...q,...change},issuedLines:[l]}},now).ok,false);
 assert.equal(a.decisionGate(c,{...r,quote:{issued:q,issuedLines:[{...l,pack_snapshot:''}]}},now).ok,false);
});
test('latest issued quotation cannot be replaced by a draft or older unordered row',()=>{
 const a=model(),base={order_id:'O',status:'sent'},old={...base,id:'old',current_revision:2,sent_at:'2026-10-20'},latest={...base,id:'new',current_revision:3,sent_at:'2026-10-24'};
 assert.equal(a.latestQuote([latest,{...base,id:'draft',status:'draft',sent_at:'2026-10-26'},old],'O').id,'new');assert.equal(a.latestQuote([latest],'OTHER'),null);
});
test('journey never infers authorization or payment from quote, delivery status or an attached PO',()=>{
 const a=model(),r={id:'R',status:'Accepted',documents:[{document_type:'customer_po'}],quote:{issued:{status:'sent',current_revision:2}}},steps=a.journey(r);
 assert.equal(steps[2].detail,'Document attached; PSC verification required');assert.equal(steps[3].detail,'Delivered');assert.equal(a.journey({status:'Procurement'})[3].detail,'Procurement in progress');assert.equal(a.journey({status:'Delivery'})[3].detail,'Out for delivery');
});
