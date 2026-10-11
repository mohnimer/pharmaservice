#!/usr/bin/env python3
"""Retrieve factual public product/offer metadata and original photographs.

Input: JSON list of {local_option_id, source_url}. Writes private evidence only.
No automatic identity, image-quality or commercial approval.
"""
import concurrent.futures
import datetime
import hashlib
import html
import io
import json
import pathlib
import re
import sys
import urllib.parse
import urllib.request
from PIL import Image

destination = pathlib.Path(sys.argv[2])
destination.mkdir(parents=True, exist_ok=True)

def retrieve(row):
    result = dict(row, checked_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                  release_status='HOLD', image_verified=False, price_verified=False)
    try:
        req = urllib.request.Request(row['source_url'], headers={'User-Agent':'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as response:
            page = response.read().decode('utf-8')
            result['retrieved_url'] = response.url
        result['page_sha256'] = hashlib.sha256(page.encode()).hexdigest()
        products = []
        for block in re.findall(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>',page,re.S):
            data = json.loads(html.unescape(block))
            entries = data.get('@graph',[data]) if isinstance(data,dict) else data
            products.extend(x for x in entries if x.get('@type')=='Product')
        if len(products)!=1:
            raise ValueError('Expected one primary structured product, found '+str(len(products)))
        product=products[0]
        result['source_name']=product.get('name')
        result['source_sku']=product.get('sku')
        result['source_brand']=product.get('brand')
        result['offer']=product.get('offers')
        result['vat_inclusive_text_present']='Inclusive of VAT' in page
        images=product.get('image',[])
        if isinstance(images,str): images=[images]
        result['images']=[]
        for index,url in enumerate(images[:4]):
            try:
                with urllib.request.urlopen(url,timeout=25) as response: content=response.read()
                picture=Image.open(io.BytesIO(content))
                suffix={ 'JPEG':'.jpg','PNG':'.png','WEBP':'.webp','AVIF':'.avif' }.get(picture.format)
                if not suffix: raise ValueError('Unsupported image type')
                filename=row['local_option_id']+'-'+str(index)+suffix
                (destination/filename).write_bytes(content)
                result['images'].append({'source_url':url,'file':str(destination/filename),
                    'sha256':hashlib.sha256(content).hexdigest(),'dimensions':list(picture.size)})
            except Exception as error: result['images'].append({'source_url':url,'error':str(error)})
    except Exception as error: result['retrieval_error']=str(error)
    return result

rows=json.loads(pathlib.Path(sys.argv[1]).read_text())
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    results=[]
    for result in executor.map(retrieve,rows):
        results.append(result)
        (destination/'retrieved-evidence.json').write_text(json.dumps(results,indent=2)+'\n')
        print(result['local_option_id'],result.get('source_name'),result.get('retrieval_error',''),flush=True)
(destination/'retrieved-evidence.json').write_text(json.dumps(results,indent=2)+'\n')
for result in results:
    print(result['local_option_id'],result.get('source_name'),result.get('offer',{}).get('price')
          if isinstance(result.get('offer'),dict) else '',
          [image.get('dimensions',image.get('error')) for image in result.get('images',[])],
          result.get('retrieval_error',''))
