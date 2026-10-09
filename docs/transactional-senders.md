# PSC outgoing addresses

Supplier RFQs, including intake RFQs: procurement@pharmaservice.ae.
Customer quotations, quotation-ready notifications and customer follow-ups: sales@pharmaservice.ae.
Marketing remains outreach@pharmaservice.ae. Internal website notifications and connection tests remain info@pharmaservice.ae.

Create sales and procurement as aliases of the connected info account in Google Workspace, then add/verify each in Gmail Send mail as. Leave info as the account default. Settings → mailbox → Check sales & procurement aliases verifies both through the existing Gmail connection. No additional OAuth client or scopes are introduced.

Both From and Reply-To are selected server-side from the workflow. Unknown workflows are rejected. An absent/unverified alias blocks before claiming a draft or consuming a send attempt; there is no fallback to info. Approved sends record the actual sender in correspondence. Draft review displays the sender. Existing approval, quotation revision, demo isolation and unsubscribe rules remain intact. Replies arrive in the same connected mailbox; apply PSC-Procurement to import them.

Validation: isolated security tests cover sender routing, MIME headers, missing/pending aliases, no claim/send on missing supplier alias, authorization and existing email controls. Browser checks cover customer draft sender and approval on mobile/desktop. Actual Google alias readiness and recipient delivery require owner setup and a controlled approved test; no real email was sent during implementation.
