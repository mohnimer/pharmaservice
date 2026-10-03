PSC V37.7.6 HOTFIX

Fixes:
1. Product detail sticky header no longer leaves a scroll/overlap gap above the title.
2. Institutional product image URLs now carry a release cache-buster so cards reload the controlled INST-#### image assets instead of remaining on an old fallback after deployment.
3. Includes the two product assets still missing from GitHub at QA time: INST-0091 and INST-0092.

Upload paths exactly:
- app.js -> repository root
- styles.css -> repository root
- assets/app.js -> assets/app.js
- assets/styles.css -> assets/styles.css
- assets/products/inst-0091.webp -> assets/products/inst-0091.webp
- assets/products/inst-0092.webp -> assets/products/inst-0092.webp

After deployment completes, hard refresh the browser once.
