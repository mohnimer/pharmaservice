-- Sales introductions use the individual, explicitly approved draft/send pipeline.
-- Marketing eligibility and existing contact subscriptions remain unchanged.
alter table public.psc_mail_drafts
 drop constraint psc_mail_drafts_communication_purpose_check,
 add constraint psc_mail_drafts_communication_purpose_check
 check (communication_purpose in ('request_response','account_followup','sales_introduction')),
 add constraint mail_sales_context check
 (communication_purpose is distinct from 'sales_introduction' or
  (contact_id is not null and kind='followup' and order_id is null and attachment_path is null
   and onboarding_id is null and intake_message_id is null));
