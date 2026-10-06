PSC V44.10.5 — DEFINITIVE HOME HERO IMPLEMENTATION

The previous image swap reused the old filenames.
That meant the browser/CDN could continue serving the existing cached hero.

THIS VERSION DOES NOT REUSE THEM.

UPLOAD THESE FOUR FILES TO THE WEBSITE ROOT:
1. index.html
2. v44-10-5-hero.css
3. v44-10-5-home-hero-desktop.png
4. v44-10-5-home-hero-mobile.png

The CSS is loaded last and points to brand-new image filenames:
- desktop: /v44-10-5-home-hero-desktop.png?v=44105
- mobile:  /v44-10-5-home-hero-mobile.png?v=44105

The desktop section uses the exact 1672 × 941 image ratio.
The mobile section uses the exact 941 × 1672 image ratio.
No cropping or stale old-hero filename is involved.

This package also retains the V44.10.4 portal-main-search fix.
