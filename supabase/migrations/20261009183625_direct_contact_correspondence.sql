-- Reuse the approved draft/send pipeline and shared CRM address book.
alter table public.psc_mail_drafts
 add column contact_id uuid references public.mail_contacts(id),
 add column communication_purpose text check(communication_purpose in ('request_response','account_followup')),
 add constraint mail_direct_context check(contact_id is null or (communication_purpose is not null and kind in ('rfq','followup') and order_id is null and attachment_path is null));
create index mail_drafts_contact on public.psc_mail_drafts(contact_id);
-- Existing admin SELECT RLS and service-only writes remain unchanged.
