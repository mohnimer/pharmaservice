PSC V44.8 PRODUCT IMAGE HOTFIX

UPLOAD BOTH FILES TO THE SITE ROOT:
1. index.html
2. v44-8-product-image-recovery.js

WHY THE IMAGES WERE BLANK
This is not a slow-loading problem.

The production runtime has two separate behaviours that collide:
- the Supabase storefront overlay can replace an existing local imageUrl with null;
- productDisplayImageUrl() prefers the generated INST-xxxx asset whenever a catalogue transaction ID exists.

V44.7 then correctly hides those generated INST assets, so the result is a blank image field even when a real product photo exists.

WHAT THIS HOTFIX DOES
- remembers every real product image before async storefront hydration can blank it;
- restores real product photos after each catalogue render;
- replaces generated INST artwork in visible cards with the real photo when one exists;
- restores images in public catalogue, buyer portal, product detail modal, related products and request drawer;
- keeps intentionally blank products blank when no real product photo exists;
- keeps DHA marks untouched;
- keeps the V44.7 user-supplied product additions visible after the CMS overlay;
- does not change the family architecture, quotation behaviour, portal logic or design system.

IMPORTANT
The actual WebP files ARE already present in the repository. The fault is runtime image selection, not missing asset files.
