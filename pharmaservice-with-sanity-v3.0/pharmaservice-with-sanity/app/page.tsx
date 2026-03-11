'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  useEffect(() => {
    // Nav scroll effect
    const handleScroll = () => {
      const nav = document.getElementById('nav')
      if (nav) {
        nav.classList.toggle('scrolled', window.scrollY > 20)
      }
    }

    window.addEventListener('scroll', handleScroll)

    // Scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, { threshold: 0.1 })

    document.querySelectorAll('.animate-in').forEach(el => observer.observe(el))

    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      {/* NAV */}
      <nav id="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">Pharma <span>Service</span></Link>
          <div className="nav-links">
            <Link href="/" className="active">Home</Link>
            <Link href="/editorial-picks">Editorial Picks</Link>
            <Link href="/news">Latest News</Link>
            <Link href="/resources">Resources</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/about">About</Link>
            <Link href="#subscribe" className="nav-cta">Subscribe</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-tag">Trusted pharmaceutical expertise since 1984</div>
        <h1><em>Value-driven</em> consumer health insights</h1>
        <p className="hero-sub">Independent research, honest recommendations, direct delivery. We don&apos;t take money from brands to recommend them. We recommend what&apos;s best, you make the choice.</p>
        <div className="hero-actions">
          <Link href="/guides" className="btn-primary">Read This Week&apos;s Guide</Link>
          <Link href="/products" className="btn-secondary">Browse All Products</Link>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-bar">
        <div className="ticker-content">
          <span className="ticker-item"><span className="dot"></span> <strong>40 Years</strong> in UAE Pharmaceutical Distribution</span>
          <span className="ticker-item"><span className="dot"></span> <strong>Licensed</strong> UAE Distribution &amp; MOH Import Authorization</span>
          <span className="ticker-item"><span className="dot"></span> <strong>Next Day Delivery</strong> — direct to your door</span>
          <span className="ticker-item"><span className="dot"></span> <strong>Independent</strong> — we don&apos;t take money from brands to recommend them</span>
          <span className="ticker-item"><span className="dot"></span> <strong>40 Years</strong> in UAE Pharmaceutical Distribution</span>
          <span className="ticker-item"><span className="dot"></span> <strong>Licensed</strong> UAE Distribution &amp; MOH Import Authorization</span>
          <span className="ticker-item"><span className="dot"></span> <strong>Next Day Delivery</strong> — direct to your door</span>
          <span className="ticker-item"><span className="dot"></span> <strong>Independent</strong> — we don&apos;t take money from brands to recommend them</span>
        </div>
      </div>

      {/* EDITORIAL SECTION */}
      <section className="section animate-in">
        <div className="section-header">
          <div>
            <div className="section-label">Latest from the Editors</div>
            <h2 className="section-title">This week in consumer health in the UAE</h2>
          </div>
          <Link href="/guides" className="section-link">View All Guides →</Link>
        </div>

        <div className="featured-grid">
          {/* Main Feature */}
          <div className="featured-main">
            <div className="featured-img">
              <span className="category-badge">Seasonal Guide</span>
              <span className="img-text">Photography: studio product shot</span>
            </div>
            <div className="featured-body">
              <div className="meta">March 2026 · 8 min read</div>
              <h2>Wartime Essentials: What Your Medicine Cabinet Actually Needs Right Now</h2>
              <p>We reviewed 40+ products across six categories to build the definitive home medical kit for the current situation. No panic buying. No guesswork. Just what a pharmaceutical professional would stock for their own family.</p>
              <Link href="/guides/wartime-essentials" className="read-link">Read the full guide</Link>
            </div>
          </div>

          {/* Side Articles */}
          <div className="featured-side">
            <div className="side-article">
              <div>
                <span className="category-badge-sm">Digestive Health</span>
                <h3>We Tested 9 Herbal Laxatives Sold in the UAE. Only One Got the Formulation Right.</h3>
                <p>Most herbal digestive teas use fillers and underdosed active ingredients. Here&apos;s what we found when we looked at the actual formulations.</p>
              </div>
              <div className="meta">March 2026 · 5 min read</div>
            </div>

            <div className="side-article">
              <div>
                <span className="category-badge-sm">Elderly Care</span>
                <h3>The Underpad Problem: Why 60×90 Isn&apos;t Enough and What to Use Instead</h3>
                <p>If you&apos;re caring for a bedridden family member, the standard underpad size sold in the UAE leaves 40% of the bed exposed. There&apos;s a better option.</p>
              </div>
              <div className="meta">February 2026 · 4 min read</div>
            </div>

            <div className="side-article">
              <div>
                <span className="category-badge-sm">Dental Care</span>
                <h3>Your Denture Adhesive Probably Contains Zinc. Here&apos;s Why That Matters.</h3>
                <p>Long-term zinc exposure from denture adhesives has been linked to copper deficiency. We looked at every brand available in the UAE.</p>
              </div>
              <div className="meta">February 2026 · 6 min read</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT EDITORIAL CARDS */}
      <section className="section animate-in">
        <div className="section-header">
          <div>
            <div className="section-label">Our Picks</div>
            <h2 className="section-title">Researched. Tested. Delivered.</h2>
          </div>
          <Link href="/products" className="section-link">View All Products →</Link>
        </div>

        <div className="product-editorial-grid">
          {/* PlantaLax */}
          <div className="product-card">
            <div className="product-card-img plantalax">
              <span className="product-label">Digestive Health</span>
              <span className="verdict"><span className="star">★</span> Editor&apos;s Pick</span>
            </div>
            <div className="product-card-body">
              <h3>PlantaLax Herbal Tea</h3>
              <p className="product-claim">GMP-certified blend of Senna, Chamomile &amp; Cascara Bark. 20 bags per box.</p>
              <div className="product-why">
                <strong>Why we chose this</strong>
                The only herbal digestive tea in the UAE with a legitimate GMP certification and properly dosed active ingredients. Three functional herbs that work together — not a single-note product padded with fillers. MOH Registered.
              </div>
              <div className="product-price-row">
                <span className="product-price">23 AED <span>/ box</span></span>
                <button className="btn-order">Order Now</button>
              </div>
            </div>
          </div>

          {/* NIMED Underpads */}
          <div className="product-card">
            <div className="product-card-img underpad">
              <span className="product-label">Elderly Care</span>
              <span className="verdict"><span className="star">★</span> Only in UAE</span>
            </div>
            <div className="product-card-body">
              <h3>NIMED Underpads 90×180cm</h3>
              <p className="product-claim">Full-bed disposable underpad. 20 per pack. The only 90×180cm format available in the UAE market.</p>
              <div className="product-why">
                <strong>Why we chose this</strong>
                Standard 60×90 underpads leave nearly half the bed exposed, leading to lateral leakage and constant repositioning. This is the only full-bed coverage option in the UAE. It shouldn&apos;t be this hard to find, but it is.
              </div>
              <div className="product-price-row">
                <span className="product-price">45 AED <span>/ pack</span></span>
                <button className="btn-order">Order Now</button>
              </div>
            </div>
          </div>

          {/* FittyDent */}
          <div className="product-card">
            <div className="product-card-img fittydent">
              <span className="product-label">Dental Care</span>
              <span className="verdict"><span className="star">★</span> Zinc-Free</span>
            </div>
            <div className="product-card-body">
              <h3>FittyDent Cleaning Tablets</h3>
              <p className="product-claim">pH-9 formula. 32 tablets per pack. Zinc-free denture adhesive &amp; cleaning system.</p>
              <div className="product-why">
                <strong>Why we chose this</strong>
                Most denture adhesives on UAE shelves contain zinc, which poses real risks for daily long-term users. FittyDent is the only zinc-free system we found with a waterproof adhesive and a high-pH cleaning formula that actually eliminates bacteria.
              </div>
              <div className="product-price-row">
                <span className="product-price">19 AED <span>/ pack</span></span>
                <button className="btn-order">Order Now</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar animate-in">
        <div className="trust-inner">
          <div className="trust-statement">We don&apos;t take money from brands to recommend them. We recommend what&apos;s <em>best</em>, then we make it <em>available</em>.</div>
          <div className="trust-stat">
            <div className="number">1984</div>
            <div className="label">Established</div>
          </div>
          <div className="trust-stat">
            <div className="number">100%</div>
            <div className="label">Independent</div>
          </div>
          <div className="trust-stat">
            <div className="number">UAE</div>
            <div className="label">Licensed Distributor</div>
          </div>
        </div>
      </div>

      {/* NEWSLETTER */}
      <section className="newsletter-section animate-in" id="subscribe">
        <div className="newsletter-box">
          <div>
            <h2>One message a week</h2>
            <p>What&apos;s in season, what works, what doesn&apos;t, and why. From a 40-year pharmaceutical distributor who doesn&apos;t get paid to recommend anything. Just better pharma service.</p>
          </div>
          <div className="newsletter-form">
            <div className="whatsapp-input">
              <input type="tel" placeholder="+971 — Your WhatsApp number" />
              <button>Subscribe</button>
            </div>
            <div className="privacy-note">
              <svg className="whatsapp-icon" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Delivered via WhatsApp. No spam. Unsubscribe anytime.
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div>
            <div className="footer-brand">Pharma <span>Service</span></div>
            <p className="footer-tagline">The voice of reason in healthcare. Independent research, honest recommendations, direct delivery since 1984.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Editorial</h4>
              <Link href="/editorial-picks/seasonal">Seasonal Prep</Link>
              <Link href="/editorial-picks/popular">Popular</Link>
              <Link href="/editorial-picks/native">Native Products</Link>
              <Link href="/blog">OTC Guide</Link>
            </div>
            <div className="footer-col">
              <h4>News</h4>
              <Link href="/news/mohap">MOHAP & EDE Updates</Link>
              <Link href="/news/dha">Dubai Health Authority</Link>
              <Link href="/resources">Resources</Link>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <Link href="/about">About Us</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/wholesale">Wholesale</Link>
              <Link href="/licensing">Licensing Info</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Pharma Service Co. LLC. All rights reserved.</span>
          <span className="footer-license"><span className="dot-green"></span> Licensed UAE Pharmaceutical Distributor · Dubai Healthcare City</span>
        </div>
      </footer>
    </>
  )
}
