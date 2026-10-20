(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 globalThis.PSC_EMAIL_ESC=esc;
 globalThis.PSC_BUSINESS_EMAIL_TEXT=text=>String(text||'').replace(/\n\nPharma Service Co\. L\.L\.C\. · Dubai, UAE\nIf you would prefer no further sales emails, reply to let us know\.(?:\nStop sales and marketing emails: https:\/\/pharmaservice\.ae\/\?token=[0-9a-f-]+#unsubscribe)?$/i,'');
 globalThis.PSC_BUSINESS_EMAIL_SIGNED_TEXT=text=>{
  let s=globalThis.PSC_BUSINESS_EMAIL_TEXT(text).trim();
  s=s.replace(/\n\nRegards,\nPharma Service Co\. L\.L\.C\.(?:\nsales@pharmaservice\.ae)?$/,'');
  return (/Mohamed (?:Hassan Al Nimer|Al Nimer)/.test(s))?s:s+'\n\nKind regards,\n\nMohamed Hassan Al Nimer\nManaging Director | Pharma Service Co. L.L.C.\nDubai, UAE';
 };
 globalThis.PSC_BUSINESS_EMAIL_HTML=text=>{
  const body=globalThis.PSC_BUSINESS_EMAIL_SIGNED_TEXT(text).split(/\n\s*\n/).map(p=>'<p style="margin:0 0 20px;font-size:16px;line-height:1.7">'+esc(p).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')+'</p>').join('');
  return globalThis.PSC_BUSINESS_EMAIL_FRAME(body);
 };
 globalThis.PSC_BUSINESS_EMAIL_FRAME=body=>{
  // Match only the existing closing signature; keep message/links and plain text unchanged.
  const paragraphs=[...body.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi)];
  const nameIndex=paragraphs.findLastIndex(p=>/Mohamed (?:Hassan Al Nimer|Al Nimer)/.test(p[0]));
  let content=body;
  if(nameIndex>=0){
   const previous=paragraphs[nameIndex-1],greeting=previous&&/^\s*(?:Kind regards|Best regards|Regards),?\s*$/i.test(previous[0].replace(/<[^>]*>/g,''));
   const start=paragraphs[greeting?nameIndex-1:nameIndex].index,end=paragraphs[nameIndex].index+paragraphs[nameIndex][0].length;
   const signature=body.slice(start,end);
   content=body.slice(0,start)+`<table class="pscEmailSignature" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td class="pscEmailSignatureLogo" width="120" valign="middle" style="width:120px;padding:0 20px 0 0;vertical-align:middle"><img src="https://pharmaservice.ae/assets/psc-logo-current.png" width="120" alt="Pharma Service" style="display:block;width:120px;height:auto"></td><td class="pscEmailSignatureText" valign="middle" style="padding:0 0 0 20px;border-left:1px solid #e2dfd5;vertical-align:middle">${signature}</td></tr></table>`+body.slice(end);
  }else{
   content=`<img src="https://pharmaservice.ae/assets/psc-logo-current.png" width="140" alt="Pharma Service" style="display:block;width:140px;height:auto;margin-bottom:26px"><div style="border-top:1px solid #e2dfd5;padding-top:26px">${body}</div>`;
  }
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>@media(max-width:480px){.pscEmailContent{padding:22px 18px!important}.pscEmailCta td{display:block!important;padding:5px 0!important}.pscEmailSignatureLogo{width:76px!important;padding-right:12px!important}.pscEmailSignatureLogo img{width:76px!important}.pscEmailSignatureText{padding-left:12px!important}.pscEmailSignatureText p{font-size:14px!important;line-height:1.6!important}}</style><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"></head><body style="margin:0;background:#fbfaf6;color:#122f31;font-family:'DM Sans',Arial,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:24px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:auto;background:#fff;border:1px solid #e2dfd5;border-radius:16px"><tr><td class="pscEmailContent" style="padding:30px 28px">${content}<table class="pscEmailCta" role="presentation" cellpadding="0" cellspacing="0"><tr><td style="padding:4px 12px 4px 0"><a href="https://pharmaservice.ae/#our-model" style="display:inline-block;background:#122f31;color:#fff;font-size:15px;font-weight:700;padding:14px 20px;border-radius:12px;text-decoration:none">Explore our model</a></td><td style="padding:4px 0"><a href="mailto:mohamed@pharmaservice.ae" style="display:inline-block;border:1px solid #c8c9bf;color:#122f31;font-size:15px;font-weight:700;padding:13px 20px;border-radius:12px;text-decoration:none">Reach out</a></td></tr></table></td></tr></table></td></tr></table></body></html>`;
 };
})();
