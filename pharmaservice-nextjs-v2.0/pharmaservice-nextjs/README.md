# Pharma Service — Next.js Site

**Version:** 2.0 (Next.js + Updated Copy)  
**Updated:** March 11, 2026

## What's This?

This is the complete Pharma Service website as a proper Next.js application. It includes all the copy updates from v1.1, built on Next.js 14 with TypeScript.

## Changes from Previous Version

- ✅ Converted from static HTML to Next.js App Router
- ✅ All copy updates implemented (hero, navigation, footer, etc.)
- ✅ Proper font loading via Next.js (Instrument Serif + DM Sans)
- ✅ TypeScript setup
- ✅ Ready for Sanity CMS integration
- ✅ Deployable to Vercel with zero config

## Project Structure

```
pharmaservice-nextjs/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx             # Homepage
│   └── globals.css          # All styles
├── package.json
├── next.config.js
├── tsconfig.json
└── README.md
```

## How to Deploy to Vercel

### Option 1: Upload to GitHub, Deploy from Vercel

1. **Push to your GitHub repo:**
   ```bash
   cd pharmaservice-nextjs
   git init
   git add .
   git commit -m "Next.js site with copy updates"
   git branch -M main
   git remote add origin https://github.com/mohnimer/pharmaservice.git
   git push -u origin main
   ```

2. **In Vercel:**
   - Go to your existing `pharmaservice` project
   - Settings → Git → Change your repo connection if needed
   - Deploy

### Option 2: Deploy Directly from Vercel Dashboard

1. Zip this folder
2. Go to Vercel dashboard
3. Import Project → Upload folder
4. Vercel auto-detects Next.js, just click Deploy

### Settings in Vercel

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `.` (default)
- **Build Command:** `npm run build` (auto)
- **Output Directory:** `.next` (auto)

No other config needed.

## Local Development

If you want to test locally before deploying:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## What's Next

1. **Sanity CMS Integration** — Add content management
2. **Payment Integration** — Stripe for card payments
3. **Product Pages** — Dynamic routes for products
4. **Blog/News Pages** — Editorial content system

## Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Pure CSS (no Tailwind, keeping original aesthetic)
- **Fonts:** Google Fonts (Instrument Serif + DM Sans)
- **Deployment:** Vercel

## Notes

- All pages are currently static (no API routes yet)
- Scroll animations and nav effects work client-side
- Font loading optimized via Next.js
- Ready for incremental enhancement (Sanity, payments, etc.)

---

**Questions?** Reference the master context document for full company strategy.
