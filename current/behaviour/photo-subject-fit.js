(function(root){
 'use strict';
 // Fit the photographed subject, retaining every measured edge and the original pixels.
 function calculate(meta,ratio=4/3){
  if(!meta||!Number.isFinite(ratio)||ratio<=0)return null;
  const {width:w,height:h,bounds:b}=meta;if(!(w>0&&h>0)||!Array.isArray(b)||b.length!==4)return null;
  const [l,t,r,d]=b;if(l<0||t<0||r>w||d>h||r<=l||d<=t)return null;
  const fit=Math.min(ratio/w,1/h),scale=Math.min(ratio/(r-l),1/(d-t))/fit;
  const x=-((l+r)/2-w/2)*fit*scale/ratio*100,y=-((t+d)/2-h/2)*fit*scale*100;
  // CSS clips only the reviewed outer photo setup. All pack pixels stay unchanged.
  const px=v=>(50+(v-w/2)*fit/ratio*100).toFixed(5)+'%',py=v=>(50+(v-h/2)*fit*100).toFixed(5)+'%';
  const clip=meta.displayCrop?`polygon(${px(l)} ${py(t)}, ${px(r)} ${py(t)}, ${px(r)} ${py(d)}, ${px(l)} ${py(d)})`:null;
  return {scale,x,y,clip,css:`translate(${x.toFixed(5)}%, ${y.toFixed(5)}%) scale(${scale.toFixed(5)})`};
 }
 const api=Object.freeze({calculate});if(typeof module!=='undefined')module.exports=api;root.PSC_PHOTO_SUBJECT_FIT=api;
})(typeof window==='undefined'?globalThis:window);
