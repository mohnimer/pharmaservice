# Contact search and email preview repair — 13 October 2026

Replaced the contact dropdown with debounced server search across first name, last name, email and organization, limited to 20 matches per query. Selecting a result records the exact contact ID and shows the selected address. Existing opt-outs and bounced-address handling remain respected.

Preview now renders immediately inline without requiring draft creation, network availability or a native dialog. Send saves a draft and uses its ID before dispatching. The backend checks the current contact address and locks accepted/uncertain sends to prevent duplicates.

Updated the Intro starter with the supplied two-ways-to-work-with-us copy, members/demo-login explanation and Kind regards closing. The supplied product-range claim is retained; it is not a stock or availability guarantee.

Preview and actual email share one escaped HTML renderer with the PS logo, colours, DM Sans plus email-client fallback, paragraph spacing, bold section leads and two CTA buttons. Individual drafts receive no automatic marketing footer. Previously appended legacy footers are stripped from preview and outgoing content without editing stored history.

Validated: contact search/preview/send DOM regression; 31 isolated backend tests; three application shell tests; production build. Desktop (1440px) and mobile (390px) Chromium fixture tests also passed for search, recipient selection, immediate preview and mocked send, with no page errors or horizontal overflow. No external prospect email was sent.
