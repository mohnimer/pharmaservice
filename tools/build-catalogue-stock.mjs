import {readFile,writeFile} from 'node:fs/promises';
const data=JSON.parse(await readFile('data/catalogue-public.json','utf8'));
const projected={revision:data.revision,stock_date:data.stock_date,report_name:data.report_name,price_policy:data.price_policy,products:data.products.map(({sku,name,brand,pack,family_id,family_name,source_kind,acorus_managed,in_stock,mrp_aed,indicative_price_aed,availability_status,catalogue_visible})=>({sku,name,brand,pack,family_id,family_name,source_kind,acorus_managed,in_stock,mrp_aed,indicative_price_aed,availability_status,catalogue_visible}))};
await writeFile('current/behaviour/catalogue-stock-data.js',`window.PSC_CATALOGUE_CONTROL=${JSON.stringify(projected)};\n`);
console.log('Generated catalogue stock '+data.revision);
