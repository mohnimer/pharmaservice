# Cohesive interface refinement — 16 October 2026

Branch: `feature/cohesive-interface-20261016`, based on production release `6fcfcdf69dbb97f20d6d3c78073e14a243024f92`.

The user approved the catalogue direction and requested a coherent treatment of the rest of the application: fewer outlines and nested boxes, consistent controls, readable account context and small in-button progress circles. This work is a preview for review; it does not authorize another production release.

- Shared panel and workspace rules use open sections and whitespace. Interactive dashboard and Workshop modules use restrained surfaces and one 8 px corner convention. Inputs and operational table rules remain visually distinct; statuses retain their meaning.
- Mobile search and Request share a 48 px height and 8 px corners. Counts are plain text. Menu controls use 44 px targets without decorative outlined containers.
- The unexplained two-character account abbreviation was derived from the account group name. A labelled Account control now exposes full account/site context, existing authorized site switching, and sign-out. Single-site users receive a context menu without unauthorized switch options. Escape restores focus.
- The revised photograph standard is one border around the white photograph area and one around the complete listing card; details use one photograph border. The inset photo border is removed. Exact photo identity, containment, whitespace, DHA marks and source evidence remain unchanged. AGENTS.md records the user's revised instruction.
- Pending asynchronous actions use a small circular glyph without replacing their label or resizing the button. Instant navigation/request actions receive a brief decorative response glyph with no artificial delay or fake busy state. Quantity changes and rapid ordering remain immediate. Reduced-motion preferences remain enforced.

No product research, product-data synchronization, pricing, stock, schema or procurement change is included. Homepage/Workshop copy, structure and routes are retained; shared presentation is refined.

Verification: existing shell, DOM, account/site isolation, request submission, catalogue/variant/photography, portal-layout and control-alignment checks; new bundled-browser coverage for Account menus, response/loading geometry, single-site permissions, mobile toolbar alignment and revised card framing. Screenshots cover public pages, portal and admin routes through the existing control-alignment workflow.
