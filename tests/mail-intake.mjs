import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {extractLines,pdfText} from '../lib/rfq-extraction.mjs';
import handler from '../api/extract-rfq.mjs';
function samplePdf(){
 const content='BT /F1 12 Tf 50 750 Td (Disposable examination gloves 10 boxes) Tj 0 -25 Td (Sterile gauze swabs 5 packs) Tj 0 -25 Td (Digital thermometer 2 units) Tj 0 -25 Td (Hand sanitiser, 500 ml 6 bottles) Tj ET';
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>','<< /Length '+content.length+' >>\nstream\n'+content+'\nendstream'];
 let pdf='%PDF-1.4\n',offsets=[0];for(let i=0;i<objects.length;i++){offsets.push(pdf.length);pdf+=(i+1)+' 0 obj\n'+objects[i]+'\nendobj\n'}const offset=pdf.length;pdf+='xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(x=>String(x).padStart(10,'0')+' 00000 n ').join('\n')+'\ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n'+offset+'\n%%EOF';return Buffer.from(pdf);
}
const pdf=process.argv[2]?readFileSync(process.argv[2]):samplePdf();
const text=await pdfText(pdf),lines=extractLines(text);assert.deepEqual(lines.map(x=>x.quantity),[10,5,2,6]);assert(lines[3].description.includes('500 ml'));assert(lines.every(x=>x.decision==='pending'&&!x.sku));
assert.equal(extractLines('Paracetamol 500 mg\nGloves 100 per box\nReference: 2026').length,0);
assert.equal(extractLines('10 boxes of examination gloves')[0].quantity,10);
const original=global.fetch;let fetched=0;
function response(){return {code:200,setHeader(){},status(n){this.code=n;return this},json(v){this.body=v;return this}}}
try{
 global.fetch=async()=>{fetched++;throw Error('unexpected network')};let r=response();await handler({method:'POST',headers:{},body:{}},r);assert.equal(r.code,401);assert.equal(fetched,0);
 global.fetch=async()=>new Response('{}',{status:403});r=response();await handler({method:'POST',headers:{authorization:'Bearer fake'},body:{message_id:'84343e57-f59e-4a1a-824c-08c1fedacd4c'}},r);assert.equal(r.code,403);
 global.fetch=async(url)=>String(url).includes('/functions/')?Response.json({body_text:'',attachments:[{mime_type:'application/pdf',file_name:'RFQ.pdf',size:pdf.length,url:'https://ewewkojlsgqvcqarmpgr.supabase.co/storage/v1/object/sign/psc-correspondence/test'}]}):new Response(pdf);
 r=response();await handler({method:'POST',headers:{authorization:'Bearer fake'},body:{message_id:'84343e57-f59e-4a1a-824c-08c1fedacd4c'}},r);assert.equal(r.code,200);assert.equal(r.body.lines.length,4);
 console.log('Real PDF extraction, preserved strength, missing quantities and API auth: PASS');
}finally{global.fetch=original}
