"""Replay the dated read-only identity review; this does not query or mutate Supabase."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
review = json.loads((root / 'docs/current-option-identity-verification-20261011.json').read_text())
historical = json.loads((root / 'docs/imodium-zyrtec-option-evidence-20261011.json').read_text())['records']
assert review['database_writes'] == 0
assert len(review['pairs']) == 6
for pair in review['pairs']:
    old = next(r for r in historical if r['product_option_id'] == pair['local_id'])
    row = pair['current_record']
    assert old['database_product_option_id'] == pair['database_id'] == row['id']
    assert old['family_id'] == pair['family_id'] == row['family_id']
    assert old['product_name'] == pair['name'] == row['exact_product_name']
    assert old['brand'] == pair['brand'] == row['brand']
    assert old['pack'] == pair['pack']
    assert pair['current_database_identity_verified'] is True
    assert pair['commercial_approval_verified'] is False
    assert pair['automatic_id_merge_authorized'] is False
    assert pair['release_status'] == 'HOLD'
    assert row['customer_selectable'] is False
    assert row['price_evidence_status'] == 'MISSING'
    assert row['price_decision'] == 'REQUEST_QUOTE'
    assert row['psc_decision'] == 'VERIFY'
print('Six dated current database identities agree with retained local/evidence records; all commercial decisions remain HOLD, zero writes or ID merges.')
