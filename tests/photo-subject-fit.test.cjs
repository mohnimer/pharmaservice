const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const fit=require('../current/behaviour/photo-subject-fit.js');
const context={window:{}};vm.runInNewContext(fs.readFileSync('current/behaviour/photo-subjects-data.js','utf8'),context);
test('each measured subject remains contained with consistent whitespace and no pixel edits',()=>{
 const entries=Object.entries(context.window.PSC_PHOTO_SUBJECTS);assert(entries.length>300);
 for(const [src,m] of entries){const f=fit.calculate(m);assert(f,src);const a=4/3,k=Math.min(a/m.width,1/m.height),[l,t,r,b]=m.bounds;
  const edges=[.5+(l-m.width/2)*k*f.scale/a+f.x/100,.5+(r-m.width/2)*k*f.scale/a+f.x/100,.5+(t-m.height/2)*k*f.scale+f.y/100,.5+(b-m.height/2)*k*f.scale+f.y/100];
  assert(edges.every(v=>v>=-1e-8&&v<=1+1e-8),src+' clipped');assert(Math.abs((edges[0]+edges[1])/2-.5)<1e-8);assert(Math.abs((edges[2]+edges[3])/2-.5)<1e-8);
 }
});
test('invalid bounds never produce a transform',()=>{assert.equal(fit.calculate({width:10,height:10,bounds:[-1,0,4,3]}),null);assert.equal(fit.calculate(null),null);});
test('reviewed photo viewports account for object-fit letterboxing without modifying pack pixels',()=>{
 const m={width:1200,height:1200,bounds:[400,300,800,900],displayCrop:true};
 assert.equal(fit.calculate(m).clip,'polygon(37.50000% 25.00000%, 62.50000% 25.00000%, 62.50000% 75.00000%, 37.50000% 75.00000%)');
 assert.equal(fit.calculate({...m,displayCrop:false}).clip,null);
});
