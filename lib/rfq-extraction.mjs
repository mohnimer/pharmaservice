export function extractLines(text){
 const result=[];const unit='(?:boxes|box|packs|pack|pieces|piece|pcs|units|unit|bottles|bottle|rolls|roll|sets|set|pairs|pair|cartons|carton|each)';
 const end=new RegExp('^(.+?)\\s*[|,;\\t ]+([0-9]+(?:\\.[0-9]+)?)\\s*('+unit+')\\s*$','i');
 const start=new RegExp('^(?:[-•]\\s*)?([0-9]+(?:\\.[0-9]+)?)\\s*('+unit+')\\s+(?:of\\s+)?(.+)$','i');
 for(const raw of String(text).split(/\r?\n/)){
 const line=raw.trim();if(!line||line.length>2000)continue;
 let m=line.match(end),description,quantity,u;
 if(m){description=m[1];quantity=Number(m[2]);u=m[3]}else{m=line.match(start);if(m){quantity=Number(m[1]);u=m[2];description=m[3]}}
 if(!m){const q=line.match(/^(.+?)\s+(?:qty|quantity)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(\w*)$/i);if(q){description=q[1];quantity=Number(q[2]);u=q[3]||''}}
 if(!description||!quantity||quantity>1000000)continue;
 description=description.replace(/^\d+[.)]\s*/,'').trim();
 result.push({id:'line-'+(result.length+1),original:line,description,quantity,unit:u,specification:'',sku:'',product_name:'',decision:'pending'});
 if(result.length===100)break;
 }
 return result;
}
export async function pdfText(bytes){
 const {getDocument}=await import('pdfjs-dist/legacy/build/pdf.mjs');
 const doc=await getDocument({data:new Uint8Array(bytes),isEvalSupported:false,useSystemFonts:true,disableFontFace:true}).promise;
 try{if(doc.numPages>30)throw new Error('pdf_page_limit');const pages=[];for(let n=1;n<=doc.numPages;n++){
 const content=await(await doc.getPage(n)).getTextContent();const rows=[];
 for(const item of content.items){if(!('str'in item)||!item.str.trim())continue;const y=item.transform[5];let row=rows.find(r=>Math.abs(r.y-y)<3);if(!row){row={y,items:[]};rows.push(row)}row.items.push({x:item.transform[4],s:item.str})}
 pages.push(rows.sort((a,b)=>b.y-a.y).map(r=>r.items.sort((a,b)=>a.x-b.x).map(i=>i.s).join(' ')).join('\n'));
 }return pages.join('\n').slice(0,100000)}finally{await doc.destroy()}
}
