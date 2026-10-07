# PSC V49 — Workshop Stability + Design Rebuild

## What this patch fixes

1. Direct Workshop URLs no longer 404 on Vercel.
   - `/workshop`
   - `/workshop/<module>`
   - `/workshop/<guide>`

2. Internal navigation no longer unnecessarily hard-reloads the site first.
   - Workshop and catalogue-gate clicks use History API first.
   - A full navigation is only used as a fallback if the underlying SPA does not react.
   - `pageshow`, `popstate`, and mutation repair keep the current UI layer reapplied after browser back/forward or BFCache restores.

3. The Workshop has been visually rethought.
   - Four-column / two-column / one-column Module grid instead of seven narrow tall cards.
   - Shorter editorial guide cards.
   - Smaller, balanced article headlines.
   - Compact Module navigation.
   - Reduced dead space.
   - The giant “Useful product knowledge…” panel is reduced to an editorial rule/statement.
   - Module and article pages use consistent widths and spacing.

4. Product cards
   - Removes the separator above `Details` / `Request`.
   - Adds breathing room around those buttons.

## Files

- `v45-workshop-modules-gate.js`
  Replace the existing file with this one. The filename is intentionally unchanged so the current index continues to load it.

- `v45-workshop-modules-gate.css`
  Replace the existing file with this one.

- `vercel.json`
  Add this at project root. If a `vercel.json` already exists, MERGE the two Workshop rewrite rules into its existing `rewrites` array instead of replacing unrelated settings.

## Cache note

The current index references the Workshop files with a `?v=4501` cache key. If you control the current index, bump both references to `?v=4900` after deploying this patch:

`/v45-workshop-modules-gate.css?v=4900`
`/v45-workshop-modules-gate.js?v=4900`

Do not replace the whole current index with an older file just to change the version query.

## Scope

This patch does not alter Supabase write paths, quote/order logic, demo write protections, catalogue product data, or account data.
