#!/usr/bin/env python3
"""Record exact snapshot overlaps without merging IDs or approving packs/prices."""
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
        pairs.append({
            'family_id': row['family_id'], 'exact_product_name': row['exact_product_name'],
            'brand': row['brand'], 'local_product_option_id': row['product_option_id'],
            'database_product_option_id': candidate['product_option_id'], 'local_sku': row['sku'],
            'local_pack': left, 'database_pack': right,
            'identity_match_basis': 'Exact normalized family ID, full product name and brand; no fuzzy matching',
            'identity_unique_in_both_snapshots': local_counts[key(row)] == 1 and len(index[key(row)]) == 1,
            'pack_status': 'EXACT_TEXT_AGREEMENT' if same_pack else 'MISSING_DATABASE_PACK' if not right else 'DIFFERENT_PACK_TEXT_REQUIRES_REVIEW',
            'database_customer_selectable': candidate['customer_selectable'],
            'release_status': 'HOLD', 'automatic_id_merge_authorized': False,
            'hold_reason': 'Snapshot identity overlap only; validate pack and current database record, exact photograph, description and commercial evidence before reconciliation.'
        })
output = {
    'scope': '2026-10-11 retained snapshots; no fresh production database query',
    'source_files': {str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest() for path in (LOCAL, DATABASE)},
    'local_record_count': len(local), 'database_record_count': len(database),
    'exact_identity_overlap_pairs': len(pairs), 'release_status': 'HOLD', 'pairs': pairs
}
path = ROOT / 'docs/option-id-reconciliation-candidates.json'
path.write_text(json.dumps(output, indent=2, ensure_ascii=False) + '\n')
print(f'{len(local)} local / {len(database)} database snapshot records; {len(pairs)} exact identity pairs, no ID merges or release approvals.')
