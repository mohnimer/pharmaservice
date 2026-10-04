-- PSC V39.20 — Family Architecture Cleanup
-- Applied to Supabase project ewewkojlsgqvcqarmpgr.
-- Reconstruction copy only; migration already applied.

begin;

update public.catalogue_families set presentations='{}'::text[]
where family_id in ('PSC-IS-020','PSC-IS-048','PSC-IS-053','PSC-SC-B14','PSC-SC-B15','PSC-SC-B20','PSC-SC-C19','PSC-IS-094','PSC-IS-099','PSC-IS-109','PSC-IS-110');

update public.catalogue_families set presentations=array['Nebuliser solution'] where family_id='PSC-IS-077';
update public.catalogue_families set presentations=array['Tablets','Chewable tablets'] where family_id='PSC-IS-079';
update public.catalogue_families set presentations=array['Lotion','Spray','Cream-gel','Gel','Cream'] where family_id='PSC-IS-087';
update public.catalogue_families set presentations=array['Sachets','Chewable tablets','Suspension','Tablets'] where family_id='PSC-IS-097';
update public.catalogue_families set presentations=array['Eye drops'] where family_id='PSC-IS-102';
update public.catalogue_families set presentations=array['Ear drops'] where family_id='PSC-IS-105';
update public.catalogue_families set presentations=array['IV solution'] where family_id in ('PSC-SC-D06A','PSC-SC-D06B');
update public.catalogue_families set presentations=array['Injection'] where family_id='PSC-SC-D07';

update public.catalogue_families
set commercial_specification='Prescription-dependent product; exact presentation, strength and patient-specific indication to be confirmed before supply.'
where family_id='PSC-IS-096';

update public.catalogue_product_options set presentation=null
where family_id in ('PSC-IS-020','PSC-IS-048','PSC-IS-053','PSC-SC-B15','PSC-SC-C19');

update public.catalogue_product_options set presentation='Nebuliser solution'
where family_id='PSC-IS-077' and presentation='Suspension / Nebuliser solution';

update public.catalogue_product_options set presentation='Chewable tablets'
where family_id in ('PSC-IS-079','PSC-IS-097') and presentation='Chewable tablets / Tablets';

update public.catalogue_product_options set presentation='Eye drops'
where family_id='PSC-IS-102' and presentation='Drops / Eye drops';

update public.catalogue_product_options set presentation='Ear drops'
where family_id='PSC-IS-105';

update public.catalogue_product_options set presentation='Cream-gel'
where family_id='PSC-IS-087' and presentation='Cream / Gel';

update public.catalogue_product_options set presentation='IV solution'
where family_id in ('PSC-SC-D06A','PSC-SC-D06B') and presentation='Injection / IV solution';

update public.catalogue_product_options set presentation=null where family_id='PSC-IS-110';

update public.catalogue_product_options
set psc_decision='REJECT', customer_selectable=false, preferred=false,
    review_note=trim(both ' ' from concat_ws(' ',nullif(review_note,''),'V39.20 architecture cleanup: Ventolin respiratory solution belongs to salbutamol nebuliser solution, not respirators.'))
where id='ef9a98d6-9cb3-4507-9f7b-007a5f03cd3d';

update public.catalogue_product_options
set psc_decision='REJECT', customer_selectable=false, preferred=false,
    review_note=trim(both ' ' from concat_ws(' ',nullif(review_note,''),'V39.20 architecture cleanup: liver/kidney supplement is not a kidney tray/dish.'))
where id='8f4f0c50-b0fa-4418-9008-b899864efbea';

update public.catalogue_product_options
set psc_decision='REJECT', customer_selectable=false, preferred=false,
    review_note=trim(both ' ' from concat_ws(' ',nullif(review_note,''),'V39.20 architecture cleanup: capsule product is not a sharps container.'))
where id='9ef9fef0-a031-4cc1-bfa4-006fbebf23e4';

update public.catalogue_product_options
set psc_decision='REJECT', customer_selectable=false, preferred=false,
    review_note=trim(both ' ' from concat_ws(' ',nullif(review_note,''),'V39.20 architecture cleanup: 500 ml IV infusion bag does not match the family specification for normal saline for injection ampoule/vial presentation.'))
where family_id='PSC-SC-D07';

update public.catalogue_product_options
set psc_decision='REJECT', customer_selectable=false, preferred=false,
    review_note=trim(both ' ' from concat_ws(' ',nullif(review_note,''),'V39.20 architecture cleanup: dextrose-containing IV solution does not match plain normal saline IV family.'))
where family_id='PSC-SC-D06B'
  and (lower(exact_product_name) like '%glucose%' or lower(exact_product_name) like '%dextrose%');

update public.products p
set catalogue_parent_id=f.family_id, updated_at=now()
from public.catalogue_families f
where p.active=true and p.catalogue_parent_id is null and f.active=true
  and lower(trim(p.name))=lower(trim(f.family_name));

update public.products set catalogue_parent_id='PSC-SC-A04',updated_at=now() where psc_sku='INST-0004' and active=true;
update public.products set catalogue_parent_id='PSC-SC-C05',updated_at=now() where psc_sku in ('INST-0057','INST-0058') and active=true;
update public.products set catalogue_parent_id='PSC-SC-C08',updated_at=now() where psc_sku in ('INST-0065','INST-0066') and active=true;
update public.products set catalogue_parent_id='PSC-SC-C09',updated_at=now() where psc_sku in ('INST-0067','INST-0068') and active=true;
update public.products set catalogue_parent_id='PSC-SC-C14',updated_at=now() where psc_sku in ('INST-0076','INST-0077') and active=true;
update public.products set catalogue_parent_id='PSC-SC-C15',updated_at=now() where psc_sku in ('INST-0079','INST-0080') and active=true;
update public.products set catalogue_parent_id='PSC-SC-C16',updated_at=now() where psc_sku='INST-0082' and active=true;
update public.products set catalogue_parent_id='PSC-SC-C18',updated_at=now() where psc_sku='INST-0086' and active=true;
update public.products set catalogue_parent_id='PSC-SC-C23',updated_at=now() where psc_sku in ('INST-0096','INST-0097') and active=true;
update public.products set catalogue_parent_id='PSC-SC-C24',updated_at=now() where psc_sku in ('INST-0098','INST-0099') and active=true;
update public.products set catalogue_parent_id='PSC-SC-D02',updated_at=now() where psc_sku in ('INST-0103','INST-0104') and active=true;
update public.products set catalogue_parent_id='PSC-IS-045',updated_at=now() where psc_sku='INST-0169' and active=true;
update public.products set catalogue_parent_id='PSC-IS-047',updated_at=now() where psc_sku='INST-0172' and active=true;
update public.products set catalogue_parent_id='PSC-IS-063',updated_at=now() where psc_sku='INST-0191' and active=true;
update public.products set catalogue_parent_id='PSC-IS-068',updated_at=now() where psc_sku='INST-0199' and active=true;
update public.products set catalogue_parent_id='PSC-IS-073',updated_at=now() where psc_sku='INST-0207' and active=true;
update public.products set catalogue_parent_id='PSC-IS-090',updated_at=now() where psc_sku in ('INST-0227','INST-0228') and active=true;

commit;
