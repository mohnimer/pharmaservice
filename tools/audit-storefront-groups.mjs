import {readFile,writeFile,mkdir} from 'node:fs/promises';
import api from '../current/behaviour/storefront-groups.js';
const output=process.argv[2];if(!output)throw Error('Supply a private output directory');await mkdir(output,{recursive:true});
const control=JSON.parse(await readFile('data/catalogue-public.json','utf8')),products=control.products.filter(r=>r.source_kind==='product');
const groups=api.groups(products,p=>p,rows=>rows[0]),families=new Map();
for(const p of products){if(!families.has(p.family_id))families.set(p.family_id,[]);families.get(p.family_id).push(p);}
const review=[],automatic=[];
for(const [id,rows]of families){if(rows.length<2)continue;
 const listings=groups.filter(g=>g._familyGroup.parentFamilyId===id),brands=[...new Set(rows.map(p=>p.brand))];
 automatic.push({familyId:id,familyName:rows[0].family_name,skuCount:rows.length,listingCount:listings.length,brands,packGroups:listings.filter(g=>g._familyGroup.members.length>1).map(g=>({name:g._familyGroup.name,skus:g._familyGroup.members.map(m=>m.sku)}))});
 const uncertain=rows.filter(p=>api.identity(p).rule==='pack-unconfirmed');
 if(uncertain.length&&brands.some(b=>api.realBrand(b)))review.push({familyId:id,type:'UNCONFIRMED_PACK',action:'Kept as separate exact listings. Review only if a pack consolidation is wanted.',skus:uncertain.map(p=>p.sku)});
 if(brands.filter(api.realBrand).length>3)review.push({familyId:id,type:'BRAND_CURATION_SCOPE',action:'Define exact competing specification/form/strength first; review up to three suitable brands. Broad family membership is not equivalence or a quality score.',skus:rows.map(p=>p.sku),brands});
}
const summary={products:products.length,productListings:groups.length,packGroups:groups.filter(g=>g._familyGroup.members.length>1).length,requirements:control.products.filter(r=>r.source_kind==='requirement').length,multiProductFamilies:automatic.length,unconfirmedPackReviewFamilies:review.filter(r=>r.type==='UNCONFIRMED_PACK').length,broadFamiliesOverThreeBrands:review.filter(r=>r.type==='BRAND_CURATION_SCOPE').length,approvedBrandShortlists:0,productionChanges:false};
await writeFile(output+'/Storefront_Grouping_Audit.json',JSON.stringify({summary,automatic,review},null,2)+'\n');
const csv=v=>'"'+String(v??'').replaceAll('"','""')+'"';
await writeFile(output+'/Storefront_Exceptions.csv','\uFEFF'+[['Family ID','Review type','Next action','Original SKU IDs','Recorded brand labels'],...review.map(r=>[r.familyId,r.type,r.action,r.skus.join('; '),(r.brands||[]).join('; ')])].map(r=>r.map(csv).join(',')).join('\r\n'));
console.log(JSON.stringify(summary));
