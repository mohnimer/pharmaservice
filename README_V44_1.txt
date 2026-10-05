PSC V44.1 — HOME CLINICAL-NEEDS QUALITY CORRECTION

What was wrong in V44:
- Fixed 118px row heights were too short for the existing typography.
- Old publicClinicalCard padding rules were still forcing 142px of right padding.
- The six cards had no clear dominant object.
- Card-specific art direction was missing.
- Text clipped / overflowed and several cards looked like squeezed leftovers.
- The 'Explore catalogue' action floated in dead space.

What V44.1 does:
- Makes Vitals & Assessment the anchor card.
- Uses a deliberate 12-column composition inspired by the approved Our Model quality.
- Gives every card its own text scale and artwork position.
- Removes clipping and restores proper whitespace.
- Uses three clean supporting cards on the lower row.
- Aligns the header and catalogue action.
- Keeps the rest of V44 unchanged.

UPLOAD:
1. index.html
2. v44-full-system-redesign.css
3. v44-full-system-redesign.js

The JS file is unchanged but included so the upload set remains self-contained.
