"""Read controlled13-tab private master; write only a reviewed limited candidate.

No raw supplier quantities, acquisition costs, identity guessing or production writes.
Usage: python tools/sync-controlled-master.py private.xlsx --output candidate.json
"""
import argparse,collections,datetime,json,math,re
from pathlib import Path
import openpyxl

def number(v):return isinstance(v,(int,float)) and not isinstance(v,bool) and math.isfinite(v)
def norm(v):return re.sub(r'\s+',' ',str(v or '').strip())
def build(master,base):
    book=openpyxl.load_workbook(master,read_only=True,data_only=True)
    if not {'Products','Acorus stock','Source control'}.issubset(book.sheetnames):raise ValueError('Unsupported controlled master layout')
    sc=book['Source control'];revision=sc['B7'].value;date=sc['B8'].value
    if not isinstance(date,(datetime.datetime,datetime.date)):raise ValueError('Typed supplier date required')
    date=date.date() if isinstance(date,datetime.datetime) else date
    if date.isoformat()<base['stock_date']:raise ValueError('Older supplier report rejected')
    if not re.fullmatch(r'PSC-'+date.strftime('%Y%m%d')+r'-STOCK-\d+',str(revision)):raise ValueError('Revision must identify actual supplier date')
    data=json.loads(json.dumps(base));rows=list(book['Products'].values);h=rows[5]
    if h[0]!='PSC SKU' or h[1]!='Exact product / candidate' or h[32]!='Retail MRP reference AED':raise ValueError('Unsupported Products layout/policy')
    source={}
    for r in rows[6:]:
        if not r[0]:continue
        if r[0] in source:raise ValueError('Duplicate controlled PSC ID')
        source[r[0]]=r
    stock={}
    for r in list(book['Acorus stock'].values)[6:]:
        if r[0] is not None:
            if r[0] in stock:raise ValueError('Duplicate original source row')
            stock[int(r[0])]=r
    seen=collections.defaultdict(set);updated=0
    labels={'In stock':'in_stock','Out of stock':'out_of_stock','Availability unconfirmed':'unconfirmed'}
    for p in data['products']:
        if not p.get('acorus_managed'):continue
        if p['sku'] not in source:raise ValueError('Missing PSC ID: '+p['sku'])
        r=source[p['sku']]
        if norm(r[1])!=norm(p['name']) or norm(r[2])!=norm(p['pack']):raise ValueError('Identity/pack changed: '+p['sku'])
        status=labels.get(r[33])
        if status is None:raise ValueError('Unrecognized availability: '+p['sku'])
        refs=[int(x.strip()) for x in str(r[35] or '').split(',') if x.strip()]
        hits=[]
        for no in refs:
            s=stock.get(no)
            if not s or norm(s[2])!=norm(r[23]):raise ValueError('Source-row/name mismatch: '+p['sku'])
            seen[no].add(p['sku']);hits.append(s)
        eligible=[];unknown=False
        for s in hits:
            expiry=s[3];expiry=expiry.date() if isinstance(expiry,datetime.datetime) else expiry;qty=s[5]
            if not number(qty) or qty>0 and not isinstance(expiry,datetime.date):unknown=True
            elif qty>0 and expiry>=date:eligible.append(s)
        expected='in_stock' if eligible else 'unconfirmed' if not hits or unknown else 'out_of_stock'
        if status!=expected:raise ValueError('Availability contradicts raw report: '+p['sku'])
        prices={s[4] for s in eligible if number(s[4]) and s[4]>0}
        mrp=float(next(iter(prices))) if len(prices)==1 and all(number(s[4]) and s[4]>0 for s in eligible) else None
        if r[6]!=mrp or r[15]!=mrp:raise ValueError('MRP contradicts raw report: '+p['sku'])
        reference=r[32] if number(r[32]) else None
        if reference!=mrp:raise ValueError('Retail reference formula/cache mismatch: '+p['sku'])
        p.update(in_stock=status=='in_stock',availability_status=status,mrp_aed=mrp)
        p.pop('indicative_price_aed',None);updated+=1
    if any(len(v)>1 for v in seen.values()):raise ValueError('One source row mapped to multiple PSC IDs')
    if revision==base['revision'] and data['products']!=base['products']:raise ValueError('Changed content requires new revision')
    data.update(revision=revision,stock_date=date.isoformat())
    for r in sc.iter_rows(values_only=True):
        if len(r)>1 and str(r[0]).startswith('Supplier report ') and r[1]:data['report_name']=Path(str(r[1])).name
    data['price_policy']={'basis':'SUPPLIER_RETAIL_MRP_REFERENCE','wholesale':'CONFIRMED_IN_QUOTATION','availability':'DATED_SUPPLIER_SNAPSHOT_NOT_LIVE'}
    return data,{'updated_acorus_records':updated,'revision':revision,'stock_date':date.isoformat(),'raw_quantities_published':False,'statuses':dict(collections.Counter(p.get('availability_status') for p in data['products'] if p.get('acorus_managed')))}

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('workbook');ap.add_argument('--base',default='data/catalogue-public.json');ap.add_argument('--output',required=True);a=ap.parse_args()
    result,qa=build(a.workbook,json.loads(Path(a.base).read_text(encoding='utf-8')))
    Path(a.output).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(qa))
