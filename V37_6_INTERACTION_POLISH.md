# V37.6 — Fluid catalogue and request navigation

Basis: the user-provided 59-second mobile shopping-flow screen recording. The useful pattern taken from the reference is continuity of context: fast product inspection, in-place disclosure sections, persistent action, related-product browsing, and an app-like request drawer. Payment/Apple Pay/retail checkout mechanics were explicitly excluded.

Implemented:
- Product detail opens as a fluid overlay; on mobile it becomes a bottom sheet.
- Back/close returns to the catalogue at the same scroll position.
- Product detail uses in-place disclosure rows instead of long blocks.
- Persistent Add to request / View request action bar.
- Related product rail can swap products without leaving the current browsing context.
- Public catalogue product inspection now uses the same in-place sheet with a Request quotation CTA.
- Cart language changed to Supply Request / Request across the active customer interface.
- Request basket is a right drawer on desktop and a bottom sheet on mobile.
- Search/filter rerenders preserve scroll and search focus/cursor position.
- Short, restrained overlay/drawer animations and reduced-motion support.
- No payment/checkout mechanics were added.
- No Supabase schema or write-path changes were made.
