"""Reproducible, file-only catalogue import. Never connects to the database.

Usage: python tools/import-acorus.py WORKBOOK ZIP SNAPSHOT_JSON
SNAPSHOT_JSON is PSC_DATA captured before the catalogue refresh source executes.
Dependencies: openpyxl, Pillow. Supplier commercial values are not exported.
"""
import csv, hashlib, io, json, re, shutil, sys, urllib.request, zipfile
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps
import openpyxl

repo=Path(__file__).resolve().parents[1]
workbook, archive, snapshot=map(Path,sys.argv[1:4])
wb=openpyxl.load_workbook(workbook,data_only=True,read_only=True)
w={s.title:list(s.iter_rows(values_only=True)) for s in wb}
products=json.loads(snapshot.read_text())['products']
def key(value): return re.sub(r'[^a-z0-9]','',str(value or '').lower())
def text(value): return str(value or '').strip()
def public(value): return re.sub(r'\bPSC\b(?![-_])','PS',text(value))
def digest(value): return hashlib.sha256(key(value).encode()).hexdigest()[:12].upper()
z=zipfile.ZipFile(archive)
index_name=next(n for n in z.namelist() if n.endswith('product-image-index.csv'))
images=list(csv.DictReader(io.StringIO(z.read(index_name).decode('utf-8-sig'))))
asset_dir=repo/'assets/products/acorus-2026-10'
asset_dir.mkdir(parents=True,exist_ok=True)
for image in images:
 name=next(n for n in z.namelist() if n.endswith('/images/'+image['filename']))
 (asset_dir/image['filename']).write_bytes(z.read(name))
 image['url']='/assets/products/acorus-2026-10/'+image['filename']

# Only workbook-provided reconciliation aliases may link different product names.
# Do not fuzzy-match brands, strengths, forms or pack counts.
parents={}
def root(value):
 value=key(value);parents.setdefault(value,value)
 if parents[value]!=value: parents[value]=root(parents[value])
 return parents[value]
def link(a,b):
 if a and b: parents[root(b)]=root(a)
for r in w['Image Batch 33 Reconciliation'][4:]:
 if not r[0]:continue
 link(r[0],r[2])
 for image in images:
  if image['source_image']==r[11]:link(r[0],image['product'])

# Reviewed Churn 001 links to existing local SKUs; identifiers remain unchanged.
churn_skus=['PSC-HYG-101','PSC-MED-101','PSC-MED-102','PSC-MED-103','PSC-MED-104','PSC-MED-003','PSC-HYG-102','PSC-HYG-103','PSC-MED-105','PSC-MED-106','PSC-MED-107','PSC-MED-108','PSC-MED-109','PSC-MED-110','PSC-MED-111','PSC-MED-112','PSC-MED-113','PSC-WND-101','PSC-MED-114','PSC-MED-115','PSC-MED-116','PSC-MED-117','PSC-MED-118','PSC-MED-119','PSC-MED-120','PSC-MED-121','PSC-MED-122','PSC-WND-102','PSC-MED-123','PSC-HYG-104','PSC-MED-130','PSC-MED-131','PSC-MED-132','PSC-WND-103','PSC-HYG-105','PSC-HYG-106','PSC-MED-133','PSC-MED-134','PSC-HYG-107','PSC-MED-135','PSC-MED-124','PSC-MED-125','PSC-MED-126','PSC-MED-127','PSC-MED-128','PSC-MED-129']
existing_by_sku={p['pscSku']:p for p in products}
existing_identity={}
for r,sku in zip([r for r in w['Acorus Churn 2026-10-05'][4:] if r and r[0]],churn_skus):
 assert sku in existing_by_sku,sku
 existing_identity[root(r[1])]=sku
 # First six Brand Option titles retain older source-list spelling.
legacy_aliases={'ZYRTEC 10MG TAB 20\'S':5,'ZYRTEC 10MG/ML ORAL DROPS 10ML':4,'ZYRTEC 1MG/ML ORAL SOLUTION 75ML':2,'IMODIUM 2MG CAP 6\'S':30,'IMODIUM 2MG CAP 60\'S':31,'IMODIUM INSTANT 2MG TAB 6\'S':18}
churn=[r for r in w['Acorus Churn 2026-10-05'][4:] if r and r[0]]
for name,n in legacy_aliases.items():link(churn[n][1],name)
existing_identity={root(k):v for k,v in existing_identity.items()}
for p in products:
 existing_identity.setdefault(root(p['name']),p['pscSku'])
 existing_identity.setdefault(root(text(p.get('brand'))+' '+p['name']+' '+text(p.get('pack'))),p['pscSku'])
image_by_key={root(i['product']):i for i in images}
approved=[r for r in w['Brand Options'][4:] if r[3] and r[17]=='APPROVE' and r[16]=='YES']
approved_by_key={root(r[3]):r for r in approved}
master=[r for r in w['Acorus Master'][1:] if r[1]]
master_by_key={root(r[1]):r for r in master}

need_map={'Cuts, Wounds & Burns':'wounds','Sports Injuries & Musculoskeletal':'sports','Breathing, Allergy & Oxygen':'breathing','Vitals & Clinical Assessment':'vitals','Eyes, Ears & Screening':'screening','Diabetes & Blood Glucose':'diabetes','Fever, Pain & Common Symptoms':'medicines','Skin, Bites & Topical Care':'allergy','Stomach, Nausea & Hydration':'patient-care','Patient Care & Hygiene':'patient-care','Infection Prevention & PPE':'infection','Procedures & Clinical Consumables':'procedures','Emergency & Resuscitation':'emergency','Equipment, Mobility & Clinic Setup':'equipment','Medicines & Specialist Therapy':'medicines','Chronic Care & Cardiometabolic':'medicines','Nutrition & Infant Care':'patient-care',"Women's Health & Intimate Care":'patient-care','Oral Care & Dental':'patient-care','Occupational Health & Smoking Cessation':'patient-care','Personal Care & Wellness':'patient-care','Needs Verification':'medicines'}
family_fields={0:'familyId',1:'clinicalNeed',2:'familyName',3:'pageType',4:'dhaBadge',5:'dhaStatus',6:'requirementReference',7:'brandSelectorMode',8:'defaultBrandChoice',14:'websitePriceTreatment',15:'availabilityWording',19:'portalTreatment',20:'supplyRoute',21:'basketType',22:'priority',23:'websiteStatus',24:'commercialSpecification',25:'orderPackBasis',26:'exactControlledWording'}
families=[]
for r in w['Family Catalogue'][4:]:
 if not r[0]:continue
 f={field:public(r[n]) if n else text(r[n]) for n,field in family_fields.items()}
 f['clinicalNeedId']=need_map.get(r[1],'all')
 f['presentations']=[public(v.strip()) for v in text(r[11]).split(';') if v.strip()]
 refs=[a for a in approved if a[0]==r[0]]
 brands=list(dict.fromkeys(text(a[4]) for a in refs if a[4]))
 f['commonBrandsLine']='Common brands: '+', '.join(brands) if brands else ''
 f['prominentBrand']=brands[0] if brands else ''
 families.append(f)

incoming=[]; options=[]; reconciliation=[]; retained=[]; warnings=[]
identities=list(dict.fromkeys([root(r[1]) for r in master]+[root(r[3]) for r in approved]))
for identity in identities:
 m=master_by_key.get(identity); a=approved_by_key.get(identity); image=image_by_key.get(identity)
 name=text(a[3] if a else m[1]); sku=existing_identity.get(identity) or 'PS-AC-'+digest(identity)
 family_id=text(a[0] if a else m[12])
 need=text(a[2] if a else m[14]); medicine=text(a[1] if a else m[15])=='MEDICINE FAMILY' or (a and any(f['familyId']==family_id and f['pageType']=='MEDICINE FAMILY' for f in families))
 pack=text(a[5]) if a and key(a[5])!=key(name) else 'Exact pack to confirm'
 row={'pscSku':sku,'name':public(name),'catalogueDisplayName':public(name),'brand':text(a[4]) if a else name.split(' ')[0].title(),'catalogueVisible':True,'localCatalogueRefresh':True,'workbookDecision':'APPROVE' if a else 'ENQUIRY ONLY','catalogueParentId':family_id if a else None,'cataloguePack':public(pack),'pack':public(pack),'clinicalNeeds':[need_map.get(need,'medicines')],'productType':'Medicines' if medicine else 'Consumables','category':'Medicines' if medicine else 'Consumables','regulated':bool(medicine),'institutionalProvisional':True,'supplier':'Needs verification','stock':'Needs verification','leadTime':'Needs verification','taxStatus':'Needs verification','batchExpiry':True,'schoolApproved':False,'evidenceStatus':'Product identity only; commercial evidence pending','source':'Acorus workbook consolidation; enquiry only until quotation checks','imageStatus':image['status'] if image else 'VERIFIED PHOTOGRAPH NEEDED','currentImageUrl':image['url'] if image else None,'imageSource':image['source_class'] if image else None,'imageVerification':image['verification'] if image else None,'sourceProductName':text(m[1] if m else name)}
 row['pscOfferedSpecification']=public(name)+'. '+('Approved product identity. ' if a else 'Provisional supplier listing; identity, classification and exact pack require verification. ')+'Current stock, price, VAT, batch/expiry and supply route are confirmed in quotation.'
 if sku not in existing_by_sku:row['spec']=row['pscOfferedSpecification']
 if sku in existing_by_sku:
  # Existing commercial and regulated fields are not changed by image reconciliation.
  old=existing_by_sku[sku]
  for f in ['pack','cataloguePack','regulated','category','productType','pscOfferedSpecification','spec','stock','leadTime','supplier','taxStatus','batchExpiry','schoolApproved','institutionalProvisional']:
   if f in old:row[f]=old[f]
 row['catalogueReferenceFamilyId']=family_id
 incoming.append(row)
 if a:
  options.append({'product_option_id':'local-acorus-'+digest(identity).lower(),'family_id':family_id,'exact_product_name':public(name),'brand':text(a[4]),'presentation':public(a[5]),'pack':row['pack'],'local_reference':True,'sku':sku,'image_url':row['currentImageUrl'],'image_status':row['imageStatus']})
 reconciliation.append({'sku':sku,'product':name,'source_product':row['sourceProductName'],'family_id':family_id,'decision':row['workbookDecision'],'existing_sku':sku in existing_by_sku,'zip_image':image['filename'] if image else '', 'image_status':row['imageStatus']})

# Existing photographs without a ZIP match receive the same 1200px square canvas.
# Failed downloads retain their original URL rather than assigning another product's photo.
incoming_by_sku={r['pscSku']:r for r in incoming}
def normalize_existing(p):
 row=incoming_by_sku.get(p['pscSku'])
 if row and row['currentImageUrl']:return
 url=text(p.get('image_url') or p.get('imageUrl'))
 if not url or re.search(r'inst-\d{4}\.webp|clinic-basics|dha-requirement|psc-logo|pharmaservice\.png',url,re.I):return
 dest=asset_dir/('retained-'+p['pscSku'].lower()+'.jpg')
 try:
  if not dest.exists():
   if url.startswith('http'):
    request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
    data=urllib.request.urlopen(request,timeout=20).read()
   else:data=(repo/url.lstrip('/').split('?')[0]).read_bytes()
   im=ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert('RGBA')
   im.thumbnail((1080,1080),Image.Resampling.LANCZOS)
   canvas=Image.new('RGB',(1200,1200),'white');canvas.paste(im,((1200-im.width)//2,(1200-im.height)//2),im)
   canvas.save(dest,'JPEG',quality=90,optimize=True)
  retained.append({'pscSku':p['pscSku'],'currentImageUrl':'/assets/products/acorus-2026-10/'+dest.name,'imageStatus':'EXISTING PRODUCT PHOTOGRAPH','originalImageUrl':url})
 except Exception as e: warnings.append({'sku':p['pscSku'],'url':url,'reason':str(e)[:160]})
with ThreadPoolExecutor(max_workers=8) as executor:list(executor.map(normalize_existing,products))
retained.sort(key=lambda r:r['pscSku']);warnings.sort(key=lambda r:r['sku'])
for r in retained:
 if r['pscSku'] in incoming_by_sku:incoming_by_sku[r['pscSku']].update(r)
for r in reconciliation:
 match=incoming_by_sku[r['sku']];r['image_status']=match['imageStatus'];r['image_url']=match['currentImageUrl'] or ''

payload={'version':'acorus-2026-10-07','sourceWorkbookSha256':hashlib.sha256(workbook.read_bytes()).hexdigest(),'sourceZipSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'products':incoming,'families':families,'approvedOptions':options,'retainedImages':retained}
target=repo/'current/behaviour/catalogue-refresh-data.js'
target.write_text('// Generated by tools/import-acorus.py. No supplier MRP, cost or offer dates are exported.\nwindow.PS_CATALOGUE_REFRESH = '+json.dumps(payload,ensure_ascii=False,separators=(',',':'))+';\n')
reports=repo/'docs/catalogue-import';reports.mkdir(parents=True,exist_ok=True)
def write_csv(filename,rows):
 with (reports/filename).open('w',newline='') as f:
  writer=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator='\n');writer.writeheader();writer.writerows(rows)
write_csv('products.csv',reconciliation)
write_csv('image-index.csv',[{k:i[k] for k in ['id','product','filename','status','source_class','verification','source_page','source_image']} for i in images])
write_csv('unapproved-brand-options.csv',[{'family_id':r[0],'product':r[3],'decision':r[17],'customer_selectable':r[16]} for r in w['Brand Options'][4:] if r[3] and r[17]!='APPROVE'])
if warnings:write_csv('image-download-failures.csv',warnings)
summary={'masterRows':len(master),'brandOptions':len([r for r in w['Brand Options'][4:] if r[3]]),'approvedOptions':len(options),'uniqueImportedIdentities':len(incoming),'existingMatched':sum(r['existing_sku'] for r in reconciliation),'newProducts':sum(not r['existing_sku'] for r in reconciliation),'families':len(families),'zipImages':len(images),'zipPhotographs':sum(i['status']=='PRODUCT IMAGE' for i in images),'referenceTiles':sum(i['status']!='PRODUCT IMAGE' for i in images),'normalizedExisting':len(retained),'failedExistingDownloads':len(warnings),'importedWithoutImage':sum(not r['currentImageUrl'] for r in incoming)}
(reports/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
