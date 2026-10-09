import {PDFDocument,StandardFonts,rgb} from 'https://esm.sh/pdf-lib@1.17.1'
// Customer-facing snapshot fields only; internal costs and supplier details never enter the PDF.
export async function quotePdf(snapshot:any,account:string){
 const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 let page:any,y=0;const clean=(s:any)=>String(s??'').replace(/[^\x20-\x7E]/g,' ');
 const newPage=()=>{page=doc.addPage([595,842]);y=790};newPage();
 const line=(text:string,size=11,strong=false)=>{if(y<60)newPage();page.drawText(clean(text),{x:44,y,size,font:strong?bold:font,color:rgb(.07,.16,.17)});y-=size+9};
 const wrap=(text:string)=>{let row='';for(const word of clean(text).split(/\s+/)){if(font.widthOfTextAtSize(row+' '+word,11)>500){line(row);row=word}else row+=(row?' ':'')+word}if(row)line(row)};
 const h=snapshot.header_snapshot;line('Pharma Service Co. L.L.C.',20,true);line('QUOTATION '+h.quote_number,15,true);line('Revision '+snapshot.revision_no+' | '+account);line('Currency: '+(h.currency||'AED'));y-=12;
 for(const l of snapshot.lines_snapshot){wrap(l.line_no+'. '+l.line_description_snapshot);wrap([l.brand_model_snapshot,l.presentation_snapshot,l.pack_snapshot].filter(Boolean).join(' | '));line(`Qty ${l.quantity} | Unit ex VAT ${Number(l.unit_sell_price_ex_vat).toFixed(2)} | VAT ${l.vat_rate_pct}% | Line ex VAT ${(Number(l.quantity)*Number(l.unit_sell_price_ex_vat)).toFixed(2)}`);y-=7}
 line('Subtotal ex VAT: '+Number(h.subtotal).toFixed(2),12,true);line('VAT: '+Number(h.vat).toFixed(2),12);line('Total: '+Number(h.total).toFixed(2),14,true);y-=12;
 wrap('Payment terms: '+(h.payment_terms||'As agreed with PSC'));wrap('Delivery terms: '+(h.delivery_terms||'Subject to PSC confirmation'));wrap('Validity: '+h.validity_days+' calendar days');
 if(h.sent_at)wrap('Issued: '+String(h.sent_at).slice(0,10));if(h.expires_at)wrap('Expiry: '+String(h.expires_at).slice(0,10));if(h.customer_note)wrap(h.customer_note);
 y-=12;line('Bank transfer',12,true);wrap('Account: Pharma Service Co LLC | Bank: Abu Dhabi Commercial Bank');line('Account number: 10805403920001 | Currency: AED');line('IBAN: AE740030010805403920001 | SWIFT: ADCBAEAA');wrap('Transfer only the amount requested by PSC under the agreed payment terms. Procurement release follows verification of cleared funds.');
 return await doc.save()
}
