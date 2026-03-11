# Pharma Service — With Sanity CMS

**Version:** 3.0 (Next.js + Sanity CMS Integration)  
**Updated:** March 11, 2026

## What's New

✅ **Sanity CMS integrated** — Add products, articles, news via dashboard  
✅ **Dynamic product pages** — `/products/[slug]` pulls from Sanity  
✅ **SEO-optimized** — Meta tags and schema markup auto-generated  
✅ **Image optimization** — Sanity CDN handles all images  

---

## Deployment Instructions

### STEP 1: Deploy to Vercel

Push this code to GitHub and deploy via Vercel (or upload ZIP directly).

**Vercel will auto-detect Next.js and build successfully.**

### STEP 2: Access Sanity Studio

**Go to:** https://www.sanity.io/manage

**Navigate to:** Your project → API → Add CORS origin

**Add:** `https://pharmaservice.ae` (your live site URL)

### STEP 3: Add Your First Product

1. Go to https://www.sanity.io/manage
2. Click on your `pharmaservice` project
3. Go to **Vision** (or **Content** if you see it)
4. Use the Vision tool to add content

**OR set up Sanity Studio locally:**

```bash
npm install
npx sanity init
npx sanity start
```

This opens Sanity Studio at `http://localhost:3333`

---

## Adding Content

### Via Sanity Dashboard (Easiest)

1. Go to https://www.sanity.io/manage
2. Click your project
3. Use Vision or Content tab to add products

### Via Local Studio (More Control)

```bash
cd your-project
npx sanity start
```

Opens at `localhost:3333` — full CMS interface

---

## How It Works

**You add a product in Sanity:**
- Name: "PlantaLax Herbal Tea"
- Slug: "plantalax-herbal-tea"
- Price: 23
- Category: Digestive
- Images, description, etc.

**Product page auto-generates at:**
`https://pharmaservice.ae/products/plantalax-herbal-tea`

**With full SEO:**
- Meta tags
- Schema markup
- Optimized images
- Clean URLs

---

## Content Types Available

### 1. Products
Everything you need for product pages:
- Name, price, description
- Images with auto-optimization
- Stock status
- MOH registration
- SEO fields

### 2. Articles
Editorial content and guides:
- Rich text editor
- Categories
- Read time
- Author info
- SEO fields

### 3. News
MOHAP/DHA regulatory updates:
- Source tracking
- Important flag
- External links
- Date sorting

---

## What You Get (SEO)

Every product/article automatically gets:

```html
<!-- Clean URL -->
/products/plantalax-herbal-tea

<!-- Meta Tags -->
<title>PlantaLax Herbal Tea | Pharma Service</title>
<meta name="description" content="GMP-certified...">

<!-- Schema Markup -->
<script type="application/ld+json">
{
  "@type": "Product",
  "name": "PlantaLax",
  "price": "23",
  "priceCurrency": "AED",
  "availability": "InStock"
}
</script>
```

**Google indexes it. People find it. They buy.**

---

## Next Steps

1. ✅ Deploy this code
2. ✅ Add your products in Sanity
3. ✅ Write comparison articles
4. ⏳ Add Stripe checkout
5. ⏳ Build Notion intelligence agent

---

## File Structure

```
├── app/
│   ├── page.tsx                    # Homepage
│   ├── products/[slug]/page.tsx    # Dynamic product pages
│   └── globals.css
├── sanity/
│   └── schemas/                    # Content models
├── lib/
│   └── sanity.ts                   # Sanity client
└── sanity.config.ts                # Sanity config
```

---

## Support

**Sanity Docs:** https://www.sanity.io/docs  
**Next.js Docs:** https://nextjs.org/docs
