"""Retrieve unchanged public equipment images; record factual product evidence only."""
import concurrent.futures, hashlib, io, json, re, urllib.request
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
SOURCES = [
    ("local-acorus-48939d08ef0a", "https://www.lifepharmacy.com/product/braun-thermoscan-7-age-precision-ear-thermometer/", "109214"),
    ("local-acorus-e0a3afba003e", "https://www.lifepharmacy.com/product/brn-nasal-aspirator-1-clears-stuffy-noses-gently-bna050eu", "135904"),
    ("local-acorus-f50a5698bd58", "https://www.lifepharmacy.com/product/braun-oral-b-vitality-100-cross-action-rechargeable-toothbrush-d100-413-1", "131055"),
    ("local-acorus-19495a4b8eb2", "https://www.lifepharmacy.com/product/braun-oral-b-vitality-100-3d-white-rechargeable-toothbrush-d100-413-1-pink", "131057"),
    ("local-acorus-94b60f8eaf61", "https://www.myaster.com/en/online-pharmacy/p/braun-thermoscan-probe-covers-lf40/1001888", "1001888"),
]

def fetch(row):
    option_id, url, sku = row
    record = {"local_option_id": option_id, "source_url": url, "retrieval_date": "2026-10-11", "source_sku": sku, "images": []}
    try:
        with urllib.request.urlopen(url, timeout=40) as response:
            body = response.read().decode()
            record["retrieved_url"] = response.url
        data = []
        for part in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', body):
            value = json.loads(part)
            data.extend(value.get("@graph", [value]))
        products = [x for x in data if x.get("@type") == "Product"]
        if products:
            p = products[0]
            record["product_facts"] = {k:p[k] for k in ("name", "sku", "brand", "offers") if k in p}
        if "lifepharmacy" in url:
            urls = list(dict.fromkeys(re.findall(r'https://(?:cdn\.lifepharmacy\.com|lifeadmin-store\.s3\.ap-south-1\.amazonaws\.com)/products/[^\s"<>]+/'+sku+r'-[^\s"<>]+', body)))
        else:
            urls = list(dict.fromkeys(re.findall(r'https://media\.myaster\.com/[^\s"<>]+', body)))
            urls = [x for x in urls if sku in x]
        for i, image_url in enumerate(urls[:3]):
            image_url = image_url.replace("&amp;", "&")
            try:
                with urllib.request.urlopen(image_url, timeout=40) as response:
                    raw = response.read()
                picture = Image.open(io.BytesIO(raw))
                ext = {"JPEG":"jpg", "PNG":"png", "WEBP":"webp", "AVIF":"avif"}.get(picture.format, "bin")
                path = ROOT / f"{option_id}-{i}.{ext}"
                path.write_bytes(raw)
                record["images"].append({"source_url": image_url, "file": str(path.relative_to(ROOT.parent.parent.parent)), "sha256": hashlib.sha256(raw).hexdigest(), "width": picture.width, "height": picture.height, "byte_count":len(raw), "unchanged":True})
            except Exception as error:
                record["images"].append({"source_url":image_url,"error":str(error)})
    except Exception as error:
        record["error"] = str(error)
    return record

if __name__ == "__main__":
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        records = list(pool.map(fetch, SOURCES))
    (ROOT / "retrieved-evidence.json").write_text(json.dumps(records,indent=2)+"\n")
    print(json.dumps(records,indent=2))
