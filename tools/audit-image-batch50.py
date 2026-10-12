"""Prepare immutable-source image audit sheets; never edits catalogue photographs."""
import hashlib,json,sys
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageChops
ROOT=Path(__file__).resolve().parents[1]
REG=ROOT/'staging/catalogue-batch33/candidate-image-register.json'
batch_name=sys.argv[1] if len(sys.argv)>1 else 'image-audit-50-20261012'
assert batch_name.startswith('image-audit-50-') and '/' not in batch_name and '..' not in batch_name
DEST=ROOT/'staging/catalogue-batch33'/batch_name
QA=Path('/workspace/scratch/01150efddb9c/catalogue_work')/batch_name
if (DEST/'audit.json').exists():
 print('Batch already completed; supply a new batch directory name for the next 50.');sys.exit(0)
verified={x['product_option_id'] for x in json.loads((ROOT/'docs/verified-preview-variant-register.json').read_text())}
previous=set()
for p in (ROOT/'staging/catalogue-batch33').glob('image-audit-50-*/audit.json'):
 for x in json.loads(p.read_text()).get('records',[]):previous.add(x['file'])
selected=[x for x in json.loads(REG.read_text()) if x['file'] not in previous and not any(i in verified for i in x['local_option_ids'])][:50]
assert len(selected)==50
DEST.mkdir(exist_ok=True);QA.mkdir(parents=True,exist_ok=True)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
records=[]
for index,row in enumerate(selected,1):
 raw=(ROOT/row['file']).read_bytes();im=Image.open(ROOT/row['file']).convert('RGB')
 assert hashlib.sha256(raw).hexdigest()==row['sha256']
 white=Image.new('RGB',im.size,'white');diff=ImageChops.difference(im,white);box=diff.point(lambda x:255 if x>35 else 0).getbbox()
 records.append({**row,'batch_index':index,'original_checksum_verified':True,'actual_dimensions':list(im.size),'foreground_bbox':box,'visual_review':'PENDING','image_identity_verified':False,'image_quality_approved':False,'release_status':'HOLD','audit_date':'2026-10-12'})
for group in range(5):
 page=Image.new('RGB',(1200,1750),'white');draw=ImageDraw.Draw(page)
 for position,r in enumerate(records[group*10:group*10+10]):
  x=(position%2)*600;y=(position//2)*350
  im=Image.open(ROOT/r['file']).convert('RGB').crop(r['foreground_bbox']);im.thumbnail((560,300))
  page.paste(im,(x+(600-im.width)//2,y+36+(300-im.height)//2))
  label=str(r['batch_index'])+' '+r['source_name'];draw.text((x+8,y+5),label[:68],fill='black',font=font)
  if len(label)>68:draw.text((x+8,y+23),label[68:],fill='black',font=font)
 page.save(QA/f'review-{group+1}.jpg',quality=96)
(DEST/'selection.json').write_text(json.dumps({'batch_size':50,'records':records},indent=2)+'\n')
print(QA)
