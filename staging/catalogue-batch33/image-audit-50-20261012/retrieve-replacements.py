import concurrent.futures,hashlib,io,json,re,urllib.request
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parent
SOURCES=[(1,'https://www.lifepharmacy.com/product/acure-gripe-water-130ml'),(2,'https://www.myaster.com/en/online-pharmacy/p/aldomet-250mg-tablets-pack-of-30-s/1000422'),(4,'https://medononline.com/product/zenith-b-vitamin-b-complex-energy-support-softgels-30s-4728'),(5,'https://medononline.com/product/zenith-beauty-plus-skin-hair-and-nails-supplement-softgels-30s-4729'),(6,'https://www.myaster.com/en/online-pharmacy/p/bepanthen-moisturizing-cream-for-dry-damaged-irritated-skin-30g/1001138'),(7,'https://www.lifepharmacy.com/product/blink-intensive-eye-drops-10ml'),(38,'https://800pharmacy.ae/?c=products&id=36370&m=productdetails'),(39,'https://800pharmacy.ae/?c=products&id=37322&m=productdetails')]
def retrieve(item):
 index,url=item;r={'batch_index':index,'source_url':url,'checked_at':'2026-10-12','images':[],'release_status':'HOLD'}
 try:
  with urllib.request.urlopen(url,timeout=20) as response: raw=response.read();r['final_url']=response.url
  text=raw.decode('utf8',errors='replace');(ROOT/f'source-{index}.html').write_bytes(raw)
  values=[]
  for value in re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',text,re.S):
   try:
    p=json.loads(value);values.extend(p if isinstance(p,list) else p.get('@graph',[p]))
   except Exception:pass
  product=next((x for x in values if x.get('@type')=='Product'),{})
  r['product_facts']={k:product[k] for k in ['name','sku','brand','offers'] if k in product}
  images=product.get('image',[]);images=[images] if isinstance(images,str) else images
  if isinstance(images,dict):images=[images.get('url')]
  images=[x.get('url') if isinstance(x,dict) else x for x in images]
  if not images:
   images=re.findall(r'<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)',text)
  for n,u in enumerate(list(dict.fromkeys(x for x in images if isinstance(x,str)))[:2]):
   try:
    with urllib.request.urlopen(u.replace('&amp;','&'),timeout=15) as response: image_raw=response.read()
    im=Image.open(io.BytesIO(image_raw));ext={'JPEG':'jpg','PNG':'png','WEBP':'webp','AVIF':'avif'}.get(im.format,'bin');path=ROOT/f'replacement-{index}-{n}.{ext}';path.write_bytes(image_raw)
    r['images'].append({'file':path.name,'source_url':u,'dimensions':list(im.size),'sha256':hashlib.sha256(image_raw).hexdigest(),'unchanged':True,'image_identity_verified':False,'image_quality_approved':False})
   except Exception as e:r['images'].append({'source_url':u,'error':str(e)})
 except Exception as e:r['error']=str(e)
 return r
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:results=list(pool.map(retrieve,SOURCES))
(ROOT/'replacement-evidence.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps([{'index':r['batch_index'],'images':len(r['images']),'error':r.get('error')} for r in results]))
