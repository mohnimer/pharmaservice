"""Additional public exact-model sources. No image transformation or full page storage."""
import concurrent.futures,hashlib,io,json,re,urllib.request
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parent
SOURCES=[
 ("local-acorus-48939d08ef0a","https://www.mumzworld.com/en/braun-irt6520-thermoscan-7-age-precision-black-qcom","https://www.mumzworld.com/media/catalog/product/t/n/tns-irt_6520b-braun-irt6520-thermoscan-7-age-precision-black-1567238330_1.jpg"),
 ("local-acorus-94b60f8eaf61","https://www.medxpharmacy.com/product/braun-thermoscan-hygiene-cap-lf-20-box-of-40/",None),
 ("local-acorus-f50a5698bd58","https://makkahpharmacy.ae/products/oral-b-vitality-100-white-criss-cross-electric-rechargeable-toothbrush-powered-by-braun",None),
]
def fetch(row):
 oid,url,img=row
 r={"local_option_id":oid,"source_url":url,"retrieval_date":"2026-10-11","images":[]}
 try:
  body=urllib.request.urlopen(url,timeout=25).read().decode()
  urls=[]
  if img: urls=[img]
  elif 'makkah' in url:
   p=json.loads(urllib.request.urlopen(url+'.js',timeout=25).read())
   r['product_facts']={k:p[k] for k in ['title','price','compare_at_price','available'] if k in p}
   urls=p['images'][:2]
  else:
   urls=list(dict.fromkeys(re.findall(r'https://cdn\.medxpharmacy\.com/[^\s"<>]+',body)))
   urls=[u for u in urls if re.search(r'braun|lf|thermoscan',u,re.I)][:3]
   for part in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',body):
    try:
     v=json.loads(part)
     for x in v.get('@graph',[v]):
      if x.get('@type')=='Product':r['product_facts']={k:x[k] for k in ['name','sku','offers'] if k in x}
    except Exception:pass
  for i,u in enumerate(urls):
   if u.startswith('//'):u='https:'+u
   u=u.replace('&amp;','&')
   try:
    raw=urllib.request.urlopen(u,timeout=25).read(); p=Image.open(io.BytesIO(raw));ext={'PNG':'png','JPEG':'jpg','WEBP':'webp','AVIF':'avif'}.get(p.format,'bin')
    f=ROOT/f'{oid}-alternate-{i}.{ext}';f.write_bytes(raw)
    r['images'].append({'source_url':u,'file':str(f.relative_to(ROOT.parent.parent.parent)),'sha256':hashlib.sha256(raw).hexdigest(),'width':p.width,'height':p.height,'unchanged':True})
   except Exception as e:r['images'].append({'source_url':u,'error':str(e)})
 except Exception as e:r['error']=str(e)
 return r
if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool: result=list(pool.map(fetch,SOURCES))
 (ROOT/'alternate-evidence.json').write_text(json.dumps(result,indent=2)+'\n'); print(json.dumps(result,indent=2))
