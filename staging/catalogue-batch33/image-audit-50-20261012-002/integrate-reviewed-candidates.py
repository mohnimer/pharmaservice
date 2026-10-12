"""Integrate individually reviewed exact photographs; does not complete the 50-live batch."""
import gzip, hashlib, json, re, shutil
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
BATCH = Path(__file__).resolve().parent
audit = json.loads((BATCH / 'audit.json').read_text())['records']
sources = {}
for folder in ['continuation-20261012', 'continuation-retry-20261012', 'continuation-final-sources-20261012']:
    for row in json.loads((BATCH / folder / 'retrieved-evidence.json').read_text()):
        if row.get('images') and 'file' in row['images'][0]:
            sources[row['batch_index']] = row

specifications = {
    1: ('10 capsules', 'Moven meloxicam 15 mg hard gelatin capsules, pack of 10.', 'medicines'),
    3: ('800 g', 'Nestle NAN Comfort 1 powdered infant formula, 800 g tin.', 'patient-care'),
    4: ('400 g', 'Nestle NAN Comfort 2 powdered follow-on formula, 400 g tin.', 'patient-care'),
    5: ('800 g', 'Nestle NAN Comfort 2 powdered follow-on formula, 800 g tin.', 'patient-care'),
    6: ('800 g', 'Nestle NAN Comfort 3 powdered growing-up formula, 800 g tin.', 'patient-care'),
    7: ('400 g', 'Nestle NAN Lactose Free powdered infant formula, 400 g tin.', 'patient-care'),
    8: ('400 g', 'Nestle NAN Optipro stage 3 powdered growing-up formula, 400 g tin.', 'patient-care'),
    9: ('400 g', 'Nestle NAN SupremePro stage 2 powdered follow-on formula, 400 g tin.', 'patient-care'),
    10: ('800 g', 'Nestle NAN SupremePro stage 3 powdered growing-up formula, 800 g tin.', 'patient-care'),
    13: ('30 tablets', 'Nolvadex tamoxifen 10 mg tablets, pack of 30 tablets.', 'medicines'),
    14: ('30 tablets', 'Nolvadex-D tamoxifen 20 mg tablets, pack of 30 tablets.', 'medicines'),
    16: ('1 prefilled pen, 1.5 ml, with 4 needles', 'Ozempic semaglutide 0.5 mg prefilled injection pen, 1.5 ml, supplied with 4 disposable needles.', 'diabetes'),
    17: ('1 prefilled pen, 3 ml, with 4 needles', 'Ozempic semaglutide 1 mg prefilled injection pen, 3 ml, supplied with 4 disposable needles.', 'diabetes'),
    19: ('30 softgels', 'Zenith ProLifer supplement containing prebiotic, probiotic and L-glutamate, pack of 30 softgels.', 'patient-care'),
    21: ('30 hard gelatin capsules', 'ProRise capsules containing omeprazole 40 mg and sodium bicarbonate 1100 mg, pack of 30 hard gelatin capsules.', 'patient-care'),
    22: ('30 film-coated tablets', 'Ruset rosuvastatin 20 mg and ezetimibe 10 mg film-coated tablets, pack of 30.', 'medicines'),
    23: ('30 film-coated tablets', 'Ruset rosuvastatin 5 mg and ezetimibe 10 mg film-coated tablets, pack of 30.', 'medicines'),
}
notes = 'Dated public UAE retail reference, not a regulatory MRP or PSC approved selling price. Retailer availability does not establish PSC stock; quotation confirms supply and commercial terms.'
runtime = []
register = json.loads((ROOT / 'docs/verified-preview-variant-register.json').read_text())
destination = ROOT / 'assets/products/verified-20261012'
destination.mkdir(exist_ok=True)
for index, (pack, description, route) in specifications.items():
    identity = audit[index - 1]
    option_id = identity['local_option_ids'][0]
    brand = identity['source_name'].split()[0]
    vat = 'Inclusive of VAT as displayed by retailer'
    if index == 4:
        gallery = next(r for r in json.loads((BATCH / 'gallery-evidence.json').read_text()) if r['batch_index'] == 4)
        photo = {**gallery, 'file': str(BATCH.relative_to(ROOT) / gallery['file'])}
        source_url = 'https://medicinaonline.ae/products/nan-comfort-2-400-gm-dubai-uae'
        text = gzip.open(BATCH / 'continuation-20261012/comfort400-current.html.gz').read().decode()
        products = []
        for block in re.findall(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', text, re.S):
            try:
                data = json.loads(block)
                if data.get('@type') == 'Product': products.append(data)
            except (ValueError, AttributeError): pass
        assert len(products) == 1 and '400' in products[0]['name']
        price = float(products[0]['offers']['price'])
        vat = 'VAT basis not specified in retrieved retailer evidence'
    elif index == 19:
        folder = BATCH / 'continuation-prolifer-20261012'
        native = json.loads((folder / 'native-image.json').read_text())
        product = json.loads((folder / 'shopify-product.json').read_text())
        assert '30 Softgels' in product['title']
        photo = {'file': str((folder / 'original.jpg').relative_to(ROOT)), 'source_url': native['url'], 'sha256': native['sha256'], 'dimensions': native['dimensions']}
        source_url = 'https://alhadipharmacy.ae/products/zenith-prolifer-proliferates-intestinal-flora-softgels-30-softgels'
        price = product['price'] / 100
        vat = 'VAT basis not specified in retrieved retailer evidence'
    else:
        source = sources[index]
        photo = source['images'][0]
        source_url = source['source_url']
        assert source['offer']['priceCurrency'] == 'AED'
        price = float(source['offer']['price'])
        if not source['vat_inclusive_text_present']:
            vat = 'VAT basis not specified in retrieved retailer evidence'
    native_path = ROOT / photo['file']
    content = native_path.read_bytes()
    assert hashlib.sha256(content).hexdigest() == photo['sha256']
    image = Image.open(native_path)
    suffix = {'JPEG': '.jpg', 'PNG': '.png', 'WEBP': '.webp', 'AVIF': '.avif'}[image.format]
    target = destination / (option_id + suffix)
    shutil.copyfile(native_path, target)
    asset = '/' + str(target.relative_to(ROOT))
    sku = 'PS-AC-' + option_id.removeprefix('local-acorus-').upper()
    record = dict(family_id=identity['family_id'], product_option_id=option_id, psc_sku=sku,
        exact_product_name=identity['source_name'], brand=brand, pack=pack, description=description,
        description_source=source_url, image_url=asset, image_source=photo['source_url'],
        image_verified=True, description_verified=True, price_verified=True,
        price_aed=price, price_type='PUBLIC_RETAIL_BENCHMARK', price_unit=pack,
        price_vat_basis=vat, price_source=source_url, price_checked_at='2026-10-12',
        price_note=notes, release_status='APPROVED')
    runtime.append(record)
    review = 'Unchanged native retailer photograph visually reviewed against exact local name and source pack; product area readable. Supplier originals, historical holds and rejected alternatives retained. No enlargement, cropping, background removal or generation.'
    register_row = dict(family_id=identity['family_id'], product_option_id=option_id, psc_sku=sku,
        product_name=identity['source_name'], brand=brand, pack=pack, image_path=asset,
        sha256=photo['sha256'], dimensions=photo['dimensions'], image_source_url=photo['source_url'],
        listing_source_url=source_url, checked_at='2026-10-12', price_aed=price,
        price_type='PUBLIC_RETAIL_BENCHMARK', price_unit=pack, vat_basis=vat,
        description=description, description_source=source_url, image_identity_verified=True,
        image_quality_approved=True, description_verified=True, psc_sell_price_approved=False,
        overall_release_status='HOLD', variant_evidence_status='VERIFIED_PREVIEW_CANDIDATE',
        browser_route=route, quality_review=review, price_note=notes)
    existing = [r for r in register if r['product_option_id'] == option_id]
    assert not existing, 'Already integrated: run once, or restore before regeneration'
    register.append(register_row)

script_path = ROOT / 'current/behaviour/verified-variant-records.js'
script = script_path.read_text()
assert script.count('  ];') == 1
script_path.write_text(script.replace('  ];', ',\n' + ',\n'.join(json.dumps(r, indent=2) for r in runtime) + '\n  ];'))
(ROOT / 'docs/verified-preview-variant-register.json').write_text(json.dumps(register, indent=2) + '\n')
(BATCH / 'reviewed-runtime-candidates-20261012.json').write_text(json.dumps(runtime, indent=2) + '\n')
print('Integrated', len(runtime), 'reviewed candidates; live batch remains incomplete until actual deployment verification.')
