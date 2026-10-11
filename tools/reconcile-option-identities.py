#!/usr/bin/env python3
"""Reconcile exact snapshot overlaps with reviewed pack evidence; never merge IDs."""
import csv
import hashlib
import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCAL = ROOT / 'docs/local-catalogue-overlay-variant-audit-20261011.csv'
DATABASE = ROOT / 'docs/live-variant-audit-20261011.csv'

def norm(value):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', value).strip()).upper()

def key(row):
    return tuple(norm(row[field]) for field in ('family_id', 'exact_product_name', 'brand'))

def read(path):
    with path.open(newline='', encoding='utf-8') as stream:
        return list(csv.DictReader(stream))

REVIEW = ROOT / 'docs/imodium-zyrtec-option-evidence-20261011.json'
reviews = json.loads(REVIEW.read_text())['records']
review_index = {}
for review in reviews:
    review_key = (review['product_option_id'], review['database_product_option_id'])
    if review_key in review_index:
        raise ValueError('Duplicate reviewed ID pair')
    image = ROOT / review['image_path'].lstrip('/')
    if hashlib.sha256(image.read_bytes()).hexdigest() != review['sha256']:
        raise ValueError('Reviewed photograph checksum mismatch')
    review_index[review_key] = review
used_reviews = set()
local, database = read(LOCAL), read(DATABASE)
index = defaultdict(list)
for row in database:
    if all(key(row)):
        index[key(row)].append(row)
local_counts = defaultdict(int)
for row in local:
    local_counts[key(row)] += 1
pairs = []
for row in local:
    if not all(key(row)):
        continue
    for candidate in index[key(row)]:
        left, right = row['pack'], candidate['pack']
        same_pack = bool(left and right and norm(left) == norm(right))
        review_key = (row['product_option_id'], candidate['product_option_id'])
        review = review_index.get(review_key)
        if review:
            if (local_counts[key(row)] != 1 or len(index[key(row)]) != 1
                    or not all(norm(review[field]) == norm(row[field]) for field in ('family_id', 'brand'))
                    or norm(review['product_name']) != norm(row['exact_product_name'])
                    or norm(review['pack']) != norm(left)
                    or review['database_snapshot_pack'] != right
                    or not review['pack_identity_verified']
                    or review['automatic_id_merge_authorized']
                    or review['current_database_record_verified']):
                raise ValueError('Reviewed evidence disagrees with exact snapshot identity or authorization')
            used_reviews.add(review_key)
        pairs.append({
            'family_id': row['family_id'], 'exact_product_name': row['exact_product_name'],
            'brand': row['brand'], 'local_product_option_id': row['product_option_id'],
            'database_product_option_id': candidate['product_option_id'], 'local_sku': row['sku'],
            'local_pack': left, 'database_pack': right,
            'identity_match_basis': 'Exact normalized family ID, full product name and brand; no fuzzy matching',
            'identity_unique_in_both_snapshots': local_counts[key(row)] == 1 and len(index[key(row)]) == 1,
            'pack_status': 'EXACT_TEXT_AGREEMENT' if same_pack else 'MISSING_DATABASE_PACK' if not right else 'DIFFERENT_PACK_TEXT_REQUIRES_REVIEW',
            'database_customer_selectable': candidate['customer_selectable'],
            'pack_identity_evidence_status': 'VERIFIED_EXACT_RETAILER_PACK' if review else 'PENDING',
            'verified_pack': review['pack'] if review else None,
            'evidence_image_path': review['image_path'] if review else None,
            'evidence_image_sha256': review['sha256'] if review else None,
            'evidence_listing_url': review['listing_source_url'] if review else None,
            'image_quality_approved': review['image_quality_approved'] if review else False,
            'current_database_record_verified': False,
            'release_status': 'HOLD', 'automatic_id_merge_authorized': False,
            'hold_reason': 'Reviewed retailer pack identity; current database record and commercial approval remain unverified. Image quality holds are recorded separately.' if review else 'Snapshot identity overlap only; validate pack, photograph, description and commercial evidence.'
        })
if used_reviews != set(review_index):
    raise ValueError('Reviewed ID pair was not uniquely found in the retained snapshots')
output = {
    'scope': '2026-10-11 retained snapshots; no fresh production database query',
    'source_files': {str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest() for path in (LOCAL, DATABASE, REVIEW)},
    'local_record_count': len(local), 'database_record_count': len(database),
    'exact_identity_overlap_pairs': len(pairs), 'reviewed_pack_identity_pairs': len(used_reviews), 'release_status': 'HOLD', 'pairs': pairs
}
path = ROOT / 'docs/option-id-reconciliation-candidates.json'
path.write_text(json.dumps(output, indent=2, ensure_ascii=False) + '\n')
print(f'{len(local)} local / {len(database)} database snapshot records; {len(pairs)} exact identity pairs, no ID merges or release approvals.')
