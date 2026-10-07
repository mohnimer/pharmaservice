#!/usr/bin/env python3
"""Apply PSC V50 Workshop stability + redesign patch to the current Pharma Service repo.

Run from the repository root:
    python tools/apply_v50_workshop.py

The script refuses to continue if its expected anchors are absent.
"""
from pathlib import Path
import json, shutil, sys

ROOT=Path.cwd()
APP=ROOT/'app.js'
INDEX=ROOT/'index.html'
VERCEL=ROOT/'vercel.json'
HERE=Path(__file__).resolve().parent.parent
BLOCK=(HERE/'workshop-v50-block.txt').read_text(encoding='utf-8')
CSS=(HERE/'v50-workshop-rebuild.css').read_text(encoding='utf-8')
GATE=(HERE/'v50-workshop-gate.js').read_text(encoding='utf-8')

for f in (APP,INDEX):
    if not f.exists(): raise SystemExit(f'Missing required file: {f}')

# Backup exact pre-patch files.
backup=ROOT/'_v50_backup'
backup.mkdir(exist_ok=True)
for f in (APP,INDEX,VERCEL):
    if f.exists(): shutil.copy2(f, backup/f.name)

# ---------- app.js ----------
s=APP.read_text(encoding='utf-8')
start='  function workshopGuideBySlug(slug)'
end='  function publicCatalogueCard(p){'
if start not in s or end not in s:
    raise SystemExit('Workshop anchors not found in app.js; refusing to patch.')
a=s.index(start); b=s.index(end,a)
s=s[:a]+BLOCK+s[b:]

old_route="""  function currentRoute(){\n    if(location.hash) return location.hash.slice(1);\n    const path=location.pathname.replace(/\\/+$/,'');\n    if(path==='/start') return 'start';\n    if(path==='/workshop') return 'workshop';\n    if(path.startsWith('/workshop/')) return `workshop/${decodeURIComponent(path.split('/')[2]||'')}`;\n    return 'home';\n  }"""
new_route="""  function currentRoute(){\n    const path=location.pathname.replace(/\\/+$/,'');\n    if(path==='/start') return 'start';\n    if(path==='/workshop') return 'workshop';\n    if(path.startsWith('/workshop/')) return `workshop/${decodeURIComponent(path.split('/')[2]||'')}`;\n    if(location.hash) return location.hash.slice(1);\n    return 'home';\n  }"""
if old_route not in s:
    raise SystemExit('Expected currentRoute block not found; refusing to patch.')
s=s.replace(old_route,new_route,1)

if 'html=workshopGuidePage(slug);' not in s:
    raise SystemExit('Workshop render route anchor not found.')
s=s.replace('html=workshopGuidePage(slug);','html=workshopRoutePage(slug);',1)

old_meta="""    const workshopSlug=route.startsWith('workshop/')?route.split('/')[1]:null;\n    const workshopGuide=workshopSlug?workshopGuideBySlug(workshopSlug):null;\n    const baseRoute=route.startsWith('catalogue/')?'catalogue':route.startsWith('workshop/')?'workshop':route;\n    let item=publicMeta[baseRoute];\n    if(workshopGuide)item=[`${workshopGuide.title} | The Workshop`,workshopGuide.excerpt,`/workshop/${workshopGuide.slug}`];\n"""
new_meta="""    const workshopSlug=route.startsWith('workshop/')?route.split('/')[1]:null;\n    const workshopGuide=workshopSlug?workshopGuideBySlug(workshopSlug):null;\n    const workshopModule=workshopSlug?workshopModuleBySlug(workshopSlug):null;\n    const baseRoute=route.startsWith('catalogue/')?'catalogue':route.startsWith('workshop/')?'workshop':route;\n    let item=publicMeta[baseRoute];\n    if(workshopModule)item=[`${workshopModule.title} | The Workshop`,workshopModule.intro,`/workshop/${workshopModule.slug}`];\n    else if(workshopGuide)item=[`${workshopGuide.title} | The Workshop`,workshopGuide.excerpt,`/workshop/${workshopGuide.slug}`];\n"""
if old_meta not in s:
    raise SystemExit('Workshop metadata anchor not found.')
s=s.replace(old_meta,new_meta,1)
APP.write_text(s,encoding='utf-8')

# ---------- new V50 assets ----------
(ROOT/'v50-workshop-rebuild.css').write_text(CSS,encoding='utf-8')
(ROOT/'v50-workshop-gate.js').write_text(GATE,encoding='utf-8')

# ---------- index.html ----------
i=INDEX.read_text(encoding='utf-8')
# Remove the mutation-based V45 Workshop assets; its catalogue gate is replaced by v50-workshop-gate.js.
i='\n'.join(line for line in i.splitlines() if 'v45-workshop-modules-gate.css' not in line and 'v45-workshop-modules-gate.js' not in line)+'\n'
# Bump app cache key.
import re
i=re.sub(r"/app\\.js\\?v=[^\"']+", '/app.js?v=5000', i, count=1)
# Load V50 CSS last, after all legacy visual layers.
if '/v50-workshop-rebuild.css' not in i:
    i=i.replace('</head>','  <link rel="stylesheet" href="/v50-workshop-rebuild.css?v=5000" />\n</head>',1)
# Load V50 gate last, so catalogue gating wins without touching Workshop DOM.
if '/v50-workshop-gate.js' not in i:
    i=i.replace('</body>','  <script src="/v50-workshop-gate.js?v=5000"></script>\n</body>',1)
INDEX.write_text(i,encoding='utf-8')

# ---------- Vercel deep-route rewrites ----------
config={}
if VERCEL.exists():
    config=json.loads(VERCEL.read_text(encoding='utf-8') or '{}')
rewrites=list(config.get('rewrites') or [])
needed=[
    {'source':'/start','destination':'/index.html'},
    {'source':'/workshop','destination':'/index.html'},
    {'source':'/workshop/:path*','destination':'/index.html'},
]
keys={(r.get('source'),r.get('destination')) for r in rewrites if isinstance(r,dict)}
for r in needed:
    if (r['source'],r['destination']) not in keys: rewrites.append(r)
config['rewrites']=rewrites
VERCEL.write_text(json.dumps(config,indent=2)+"\n",encoding='utf-8')

print('PSC V50 Workshop patch applied.')
print('Changed: app.js, index.html, vercel.json')
print('Added: v50-workshop-rebuild.css, v50-workshop-gate.js')
print('Backup: _v50_backup/')
