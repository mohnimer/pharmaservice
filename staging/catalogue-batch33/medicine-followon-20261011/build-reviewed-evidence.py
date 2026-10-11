"""Combine manually reviewed exact identities with downloaded factual metadata.
Only private staging. No image transformations, runtime changes, or commercial approval.
"""
import csv,hashlib,json,pathlib
from PIL import Image
root=pathlib.Path(__file__).parent
rows=json.loads((root/'review-candidates.json').read_text())
with open('docs/local-catalogue-overlay-variant-audit-20261011.csv') as f:
    local_audit=list(csv.reader(f))
for row in rows:
    evidence=next(r for r in json.loads((root/row['selected_retrieval']).read_text()) if r['local_option_id']==row['local_option_id'])
    selected=evidence['images'][row['image_index']]
    image_path=pathlib.Path(selected['file'])
    content=image_path.read_bytes()
    assert hashlib.sha256(content).hexdigest()==selected['sha256']
    row.update(source_url=evidence['source_url'],source_name=evidence['source_name'],source_sku=evidence['source_sku'],
               checked_at=evidence['checked_at'],price=float(evidence['offer']['price']),currency='AED',
               price_type='UAE_RETAIL_BENCHMARK',price_unit='One '+row['pack_size']+' pack',
               price_discount_note='No product-specific markdown shown; general coupon banners are not applied.',
               price_decision='ACCEPT_EXACT_RETAIL_BENCHMARK_NOT_PSC_SELLING_PRICE',stock_approval=False,
               image_file=selected['file'],image_source=selected['source_url'],image_sha256=selected['sha256'],
               image_bytes=len(content),image_dimensions=list(Image.open(image_path).size),
               catalogue_release='CANDIDATE_PENDING_PARENT_RUNTIME_AND_BROWSER_QA')
    local=next(r for r in local_audit if r[0]==row['local_option_id'])
    row.update(family_id=row['family_code'],product_option_id=row['local_option_id'],psc_sku=local[6],
               exact_product_name=local[2],product_name=local[2],pack=row['pack_size'],
               image_source_url=row['image_source'],sha256=row['image_sha256'],dimensions=row['image_dimensions'],
               listing_source_url=row['source_url'],price_aed=row['price'],price_type='PUBLIC_RETAIL_BENCHMARK',
               price_unit=row['pack_size'],price_source_url=row['source_url'],vat_basis=row['price_vat_basis'],
               price_note=row['price_discount_note'],description_source=row['source_url'],
               browser_route='#portal/catalogue/medicines',image_identity_verified=True,image_quality_approved=True,
               description_verified=True,psc_sell_price_approved=False,overall_release_status='HOLD',
               variant_evidence_status='VERIFIED_PREVIEW_CANDIDATE',
               source_availability_note='Cached visible listing and structured availability may disagree. Evidence does not approve availability or PSC stock.')
(root/'reviewed-evidence.json').write_text(json.dumps(rows,indent=2)+'\n')
print('Reviewed exact candidates:',len(rows))
