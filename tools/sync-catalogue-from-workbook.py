"""Read the private controlled workbook and emit only authorized public listing fields.

Usage: python3 tools/sync-catalogue-from-workbook.py /absolute/private/workbook.xlsx
The workbook must first be refreshed and validated against the uploaded stock report.
"""
import sys,json,datetime,math,collections
from pathlib import Path
import openpyxl

path=Path(sys.argv[1]);base=Path('data/catalogue-public.json')
data=json.loads(base.read_text());book=openpyxl.load_workbook(path,data_only=True)
sheet=book['Products'];date=sheet['I4'].value
if not isinstance(date,datetime.datetime):raise ValueError('A typed supplier stock date is required in Products!I4')
date=date.date().isoformat()
if date<data['stock_date']:raise ValueError('An older stock report cannot replace the current supplier snapshot')
if sheet['B4'].value!=data['revision']:raise ValueError('Workbook and public dataset revisions differ; create the next shared revision before release')
rows={};duplicates=[]
for values in list(sheet.values)[8:]:
 if not values[12]:continue
 if values[12] in rows:duplicates.append(values[12])
 rows[values[12]]=values
if duplicates:raise ValueError('Duplicate controlled product IDs')
raw=collections.defaultdict(list)
for values in list(book['Daily Stock'].values)[6:]:
 if values[1]:raw[values[1]].append(values)
updated=0
for product in data['products']:
 if not product.get('acorus_managed'):continue
 line=rows.get(product['sku'])
 if line is None:raise ValueError('Missing Acorus-managed product from private workbook: '+product['sku'])
 if line[1]!=product['name'] or line[2]!=product['pack']:raise ValueError('Product identity or pack changed; explicit reviewed remapping is required: '+product['sku'])
 matches=raw.get(line[13],[]) if line[13] else []
 matched=matches[0] if len(matches)==1 else None
 quantity=matched[4] if matched else None;expiry=matched[2] if matched else None;mrp=matched[3] if matched else None
 valid=isinstance(quantity,(int,float)) and math.isfinite(quantity) and quantity>0 and (not isinstance(expiry,datetime.datetime) or expiry.date().isoformat()>=date)
 product['in_stock']=valid
 product['mrp_aed']=float(mrp) if valid and isinstance(mrp,(int,float)) and math.isfinite(mrp) and mrp>0 else None
 updated+=1
data['stock_date']=date
base.write_text(json.dumps(data,indent=2)+'\n')
print(json.dumps({'revision':data['revision'],'stock_date':date,'updated_acorus_records':updated,'raw_quantities_published':False}))
