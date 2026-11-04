import importlib.util,unittest,datetime
from pathlib import Path
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('sync',Path(__file__).parents[1]/'tools/sync-controlled-master.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class Cell:
 def __init__(self,value):self.value=value
class Sheet:
 def __init__(self,rows=None,cells=None):self.values=rows or [];self.cells=cells or {}
 def __getitem__(self,key):return Cell(self.cells[key])
 def iter_rows(self,**kw):return iter(self.values)
class Book(dict):
 @property
 def sheetnames(self):return list(self)
def case(status='In stock',qty=10,expiry=datetime.datetime(2027,1,1),mrp=12):
 row=[None]*36;row[0:3]=['SKU','Exact name','10 pieces'];row[6]=row[15]=row[32]=mrp;row[23]='EXACT SOURCE NAME';row[33]=status;row[35]='7'
 header=[None]*36;header[0]='PSC SKU';header[1]='Exact product / candidate';header[32]='Retail MRP reference AED'
 book=Book({'Products':Sheet([[],[],[],[],[],header,row]),'Acorus stock':Sheet([[],[],[],[],[],[],[7,1,'EXACT SOURCE NAME',expiry,mrp,qty]]),'Source control':Sheet(cells={'B7':'PSC-20261022-STOCK-002','B8':datetime.datetime(2026,10,22)})})
 base={'revision':'PSC-20261012-STOCK-002','stock_date':'2026-10-12','report_name':'Synthetic report','products':[{'sku':'SKU','name':'Exact name','pack':'10 pieces','acorus_managed':True,'in_stock':False,'mrp_aed':None,'private_field_not_generated':'unchanged'}]}
 return book,base,row
class ControlledMaster(unittest.TestCase):
 def run_case(self,b,base):
  with patch.object(m.openpyxl,'load_workbook',return_value=b):return m.build('synthetic.xlsx',base)
 def test_exact_retail_and_no_raw_quantity(self):
  b,base,r=case();d,qa=self.run_case(b,base);self.assertEqual(d['products'][0]['mrp_aed'],12);self.assertEqual(d['products'][0]['availability_status'],'in_stock');self.assertNotIn('quantity',d['products'][0]);self.assertNotIn('indicative_price_aed',d['products'][0]);self.assertEqual(qa['updated_acorus_records'],1)
 def test_zero_and_absence_are_distinct(self):
  b,base,r=case('Out of stock',0);r[6]=r[15]=r[32]=None;d,_=self.run_case(b,base);self.assertEqual(d['products'][0]['availability_status'],'out_of_stock');self.assertIsNone(d['products'][0]['mrp_aed'])
  r[33]='Availability unconfirmed';r[35]=None;d,_=self.run_case(b,base);self.assertEqual(d['products'][0]['availability_status'],'unconfirmed')
 def test_missing_expiry_does_not_establish_stock(self):
  b,base,r=case('Availability unconfirmed',10,None);r[6]=r[15]=r[32]=None;d,_=self.run_case(b,base);self.assertFalse(d['products'][0]['in_stock'])
 def test_public_decisions_survive_refresh_and_legacy_master_cannot_erase_them(self):
  b,base,r=case();base['products'][0]['catalogue_visible']=True;b['Products'].values[5].append('Public catalogue visibility');r.append(False)
  d,_=self.run_case(b,base);self.assertFalse(d['products'][0]['public_catalogue_visible']);self.assertEqual(d['products'][0]['mrp_aed'],12)
  b['Products'].values[5].pop();base['products'][0]['public_catalogue_visible']=False
  with self.assertRaises(ValueError):self.run_case(b,base)
 def test_pack_source_price_and_revision_rejections(self):
  for kind in ['pack','source','price','revision','duplicate','status']:
   b,base,r=case()
   if kind=='pack':r[2]='20 pieces'
   elif kind=='source':r[35]='99'
   elif kind=='price':r[6]=9
   elif kind=='revision':b['Source control'].cells['B7']=base['revision']
   elif kind=='duplicate':b['Products'].values.append(r[:])
   else:r[33]='Out of stock'
   with self.subTest(kind=kind),self.assertRaises(ValueError):self.run_case(b,base)
if __name__=='__main__':unittest.main()
