PSC V44.5 — HOME HERO HOTFIX

WHAT HAPPENED
V44.4 contained a JavaScript syntax error in the appended hero initializer.
Because the whole redesign script failed to parse, the browser fell back to the old Institutional Supply hero.

FIXED
- JavaScript now passes syntax validation.
- New hero replacement is robust whether the old .pscInstitutionalHero or the intermediate .m44HomeHero exists.
- Old “Better community health…” section is removed from the DOM.
- Desktop hero image is retained.
- Mobile hero image is retained.
- DM Sans text treatment is retained.
- Logo-box cleanup is retained.
- Product-image suppression / DHA mark behavior from V44.3 remains retained.
- Cache version bumped to 4405.

UPLOAD
- index.html
- v44-full-system-redesign.css
- v44-full-system-redesign.js
- v44-4-home-hero-desktop.png
- v44-4-home-hero-mobile.png
