import json
from retrieve import ROOT,fetch
result=fetch(('local-acorus-94b60f8eaf61','https://www.lifepharmacy.com/product/braun-lens-filter-refills-for-thermoscan-lf-40/','109215'))
(ROOT/'caps-evidence.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
