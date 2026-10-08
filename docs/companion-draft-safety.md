# Procurement companion — reversible drafts

This release adds the next safety layer, not completion of the full procurement companion programme.

## Implemented

- Up to ten reversible draft changes per signed-in user and site, held in session memory.
- Undo button in the search area and request drawer; ordinary-language “undo” / “undo that”.
- Draft basket and request scope restored together, including units, quantities, unlisted wording and existing/retain lines.
- Search-only interactions do not create Undo entries.
- Submission clears the history. Undo never changes a submitted request or creates a backend write.
- Switching sites retains separate draft histories and clears stale interpretation/async search state.
- “Remove the second one” resolves to the actual second draft line.
- Navigation clears the visible old interpretation without discarding the site's draft.

Undo history intentionally does not survive refresh. Saved live draft persistence is unchanged; demo mode remains local and resets on refresh. No new clinical facts, prices, availability or compatibility assertions are introduced.

## Website refinement priorities

1. Hero typography: “Made easier” adds two short lines in the current desktop text column. Refine breaks/available width without rebuilding the hero composition.
2. Portal hierarchy: retain the welcome search as the main starting point; make the compact header search a secondary quick action. Avoid two equally prominent instructions.
3. Catalogue presentation: distinguish exact products from generic presentation/family records; improve missing imagery and uniform framing without inventing product details.
4. Account truthfulness: show supplied history and repeat actions from real account data. Do not promote simulated expiry/replacement examples as enabled live capabilities.
5. First-use handoff: clearly explain the existing catalogue sign-in step and preserve the original search; keep “send a requirement” accessible for customers arriving with a list.

These are recommendations, not a redesign or a claim that each is implemented in this release.

## Remaining companion work

Source-approved metadata completion, more robust mixed multi-line requirements, explicit site-copy/quantity confirmations, meaningful pilot feedback, privacy-safe durable learning and physical iPhone Safari testing. Compatibility must continue to come from verified relationships. A real test-account submission requires a separately controlled acceptance exercise; none is performed by this release.

## Verification scope

Local isolated Chromium tests at 390 and 1440 exercise quantity commands, location, retained items, manual quantity changes, removals, typed Undo, second-line references, site isolation, drawer Undo and the demo submission boundary. All external transport is mocked/blocked. Existing command and search regressions are rerun before release. Live acceptance stages a temporary draft only, then restores it; no order is submitted.
