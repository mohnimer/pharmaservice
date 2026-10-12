"""Read-only verification that live frontend and exact image bytes match the tested build."""
import argparse
import concurrent.futures
import datetime
import hashlib
import json
from pathlib import Path
import urllib.request

parser = argparse.ArgumentParser()
parser.add_argument('--origin', default='https://pharmaservice.ae')
parser.add_argument('--output', required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
origin = args.origin.rstrip('/')
assert origin.startswith('https://')
register = json.loads((root / 'docs/verified-preview-variant-register.json').read_text())
assets = [{'path': r['image_path'], 'expected_sha256': r['sha256'],
           'product_option_id': r['product_option_id']} for r in register]
for name in ['index.html', 'current.js', 'current.css']:
    assets.append({'path': '/' if name == 'index.html' else '/' + name,
                   'expected_sha256': hashlib.sha256((root / 'dist' / name).read_bytes()).hexdigest()})

def verify(row):
    result = dict(row)
    try:
        request = urllib.request.Request(origin + row['path'], headers={'Cache-Control': 'no-cache'})
        with urllib.request.urlopen(request, timeout=30) as response:
            content = response.read()
            result.update(status=response.status, final_url=response.url,
                          content_type=response.headers.get('Content-Type'), bytes=len(content))
        result['actual_sha256'] = hashlib.sha256(content).hexdigest()
        result['match'] = result['actual_sha256'] == row['expected_sha256']
    except Exception as error:
        result.update(match=False, error=str(error))
    return result

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    results = list(executor.map(verify, assets))
output = {'origin': origin, 'checked_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'verified_variant_count': len(register), 'checks': results,
          'matches': sum(r['match'] for r in results), 'total': len(results)}
path = root / args.output
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(output, indent=2) + '\n')
print(json.dumps({key: output[key] for key in ['origin', 'verified_variant_count', 'matches', 'total']}))
raise SystemExit(0 if output['matches'] == output['total'] else 1)
