"use client";
import React, { useState, useEffect } from 'react';

export default function PharmaService() {
  const [activeView, setActiveView] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Scroll Effect for Navbar ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Next.js Friendly SPA Routing (Fixes 404s) ---
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      const validViews = ['home', 'editorial', 'news', 'resources', 'blog', 'about', 'shop'];
      
      if (validViews.includes(hash)) {
        setActiveView(hash);
      } else {
        setActiveView('home');
      }
      window.scrollTo(0, 0);
    };

    // Check URL on initial load
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view, e) => {
    if (e) e.preventDefault();
    window.location.hash = view; // Triggers the hashchange event above
    setMobileMenuOpen(false);
  };

  // --- Dynamic Content (Ready for Sanity.io) ---
  const newsUpdates = [
    { date: "March 15, 2026", title: "New MOHAP Guidelines on Over-The-Counter Zinc Supplements", agency: "MOHAP Update", link: "#" },
    { date: "March 02, 2026", title: "DHA Introduces Stricter Labeling Requirements for Herbal Teas", agency: "DHA Notice", link: "#" },
    { date: "February 18, 2026", title: "Supply Chain Advisory: Expected Shortages in Adult Incontinence Products", agency: "Market Intel", link: "#" },
    { date: "January 30, 2026", title: "EDE Alert: Counterfeit Cosmetics Seized in Dubai Ports", agency: "EDE Alert", link: "#" }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

        /* ============ DESIGN TOKENS ============ */
        :root {
            --bg-cream: #FCFAF6;
            --text-main: #1A1A1A;
            --text-muted: #666666;
            --text-light: #999999;
            --navy-dark: #0A131F;
            --teal: #00A896;
            --teal-hover: #008F7F;
            --prod-beige: #F5EFEB;
            --prod-mint: #E8F2EF;
            --prod-blue: #E9F0F5;
            --white: #FFFFFF;
            --border-color: #EAE6DF;
            --box-bg: #F7F5F0;
            --font-serif: 'Instrument Serif', serif;
            --font-sans: 'DM Sans', sans-serif;
            --max-w: 1280px;
            --nav-height: 80px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: var(--font-sans);
            background-color: var(--bg-cream);
            color: var(--text-main);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            line-height: 1.5;
            overflow-x: hidden;
        }

        h1, h2, h3, h4, .serif {
            font-family: var(--font-serif);
            font-weight: 400;
            letter-spacing: -0.02em;
        }

        em { font-style: italic; color: var(--teal); }

        .label-teal {
            font-size: 11px; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.15em; color: var(--teal); display: inline-flex;
            align-items: center; gap: 8px;
        }

        /* ============ NAVIGATION ============ */
        .navbar {
            position: fixed; top: 0; width: 100%; height: var(--nav-height);
            background-color: var(--bg-cream); border-bottom: 1px solid transparent;
            z-index: 1000; transition: all 0.3s ease; display: flex; align-items: center;
        }
        
        .navbar.scrolled {
            background-color: rgba(252, 250, 246, 0.95); backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--border-color);
        }

        .nav-inner {
            width: 100%; max-width: var(--max-w); margin: 0 auto; padding: 0 40px;
            display: flex; justify-content: space-between; align-items: center;
        }

        .logo {
            font-family: var(--font-serif); font-size: 32px; color: var(--navy-dark);
            text-decoration: none; display: flex; align-items: center; gap: 4px; cursor: pointer;
        }
        .logo span { color: var(--teal); }

        .nav-links { display: flex; gap: 40px; align-items: center; }

        .nav-link {
            font-size: 11px; font-weight: 600; text-transform: uppercase;
            letter-spacing: 0.15em; color: var(--text-muted); text-decoration: none;
            transition: color 0.2s; cursor: pointer;
        }
        .nav-link:hover, .nav-link.active { color: var(--navy-dark); }

        .btn-nav-sub {
            background-color: var(--navy-dark); color: var(--white); font-size: 11px;
            font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;
            padding: 14px 32px; border-radius: 6px; text-decoration: none;
            transition: background 0.2s; cursor: pointer; border: none;
        }
        .btn-nav-sub:hover { background-color: var(--teal); }

        .mobile-menu-btn {
            display: none; background: none; border: none; cursor: pointer;
            color: var(--navy-dark); padding: 8px;
        }

        /* ============ VIEWS & BUTTONS ============ */
        main { padding-top: var(--nav-height); min-height: 80vh; }
        .view-container { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .btn {
            display: inline-flex; align-items: center; justify-content: center;
            font-size: 13px; font-weight: 600; padding: 14px 28px; border-radius: 4px;
            text-decoration: none; transition: all 0.2s; cursor: pointer; border: 1px solid transparent;
        }
        .btn-dark { background-color: var(--navy-dark); color: var(--white); }
        .btn-dark:hover { background-color: var(--teal); }
        .btn-outline { background-color: transparent; color: var(--navy-dark); border-color: var(--border-color); }
        .btn-outline:hover { border-color: var(--navy-dark); }
        .btn-teal { background-color: var(--teal); color: var(--white); padding: 10px 20px; border: none; }
        .btn-teal:hover { background-color: var(--teal-hover); }

        .link-arrow {
            font-size: 11px; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.15em; color: var(--text-muted); text-decoration: none;
            display: inline-flex; align-items: center; gap: 6px; transition: color 0.2s; cursor: pointer;
        }
        .link-arrow:hover, .link-arrow-teal { color: var(--teal); }

        /* ============ HOME: HERO & TICKER ============ */
        .hero { max-width: var(--max-w); margin: 0 auto; padding: 100px 40px 80px; }
        .hero-top-label { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .hero-top-label::before { content: ''; display: block; width: 30px; height: 2px; background-color: var(--teal); }
        .hero h1 { font-size: clamp(48px, 6vw, 76px); line-height: 1.05; color: var(--navy-dark); max-width: 800px; margin-bottom: 24px; }
        .hero p { font-size: 16px; color: var(--text-muted); max-width: 500px; margin-bottom: 40px; line-height: 1.6; }
        .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }

        .ticker-wrap { background-color: var(--navy-dark); color: var(--white); padding: 16px 0; overflow: hidden; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1); }
        .ticker { display: flex; white-space: nowrap; animation: tickerScroll 40s linear infinite; }
        .ticker-item { display: inline-flex; align-items: center; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-light); padding: 0 32px; }
        .ticker-item span { color: var(--white); }
        .ticker-item::before { content: '•'; color: var(--teal); margin-right: 32px; font-size: 16px; }
        @keyframes tickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        /* ============ SECTION GLOBALS ============ */
        .section { max-width: var(--max-w); margin: 0 auto; padding: 80px 40px; }
        .section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .section-title h2 { font-size: 36px; margin-top: 8px; color: var(--navy-dark);}
        .page-header { max-width: 800px; padding: 60px 40px; margin: 0 auto; text-align: center; }
        .page-header h1 { font-size: 56px; margin: 16px 0 24px; }
        .page-header p { font-size: 18px; color: var(--text-muted); }

        /* ============ EDITORIAL GRID ============ */
        .editorial-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 32px; }
        .card-feature { background-color: var(--white); border: 1px solid var(--border-color); display: flex; flex-direction: column; text-decoration: none; color: inherit; transition: box-shadow 0.3s; cursor: pointer; }
        .card-feature:hover { box-shadow: 0 12px 30px rgba(0,0,0,0.04); }
        .card-feature-img { height: 340px; background: linear-gradient(145deg, #093028 0%, #237A57 100%); position: relative; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; }
        .badge { background-color: var(--teal); color: var(--white); font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; padding: 6px 12px; border-radius: 2px; width: fit-content; }
        .img-caption { font-family: var(--font-serif); font-style: italic; color: rgba(255,255,255,0.7); font-size: 14px; }
        .card-body { padding: 32px; display: flex; flex-direction: column; flex-grow: 1; }
        .meta-text { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-light); margin-bottom: 12px; display: block; }
        .card-body h3 { font-size: 26px; line-height: 1.15; margin-bottom: 16px; color: var(--navy-dark); }
        .card-body p { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; }
        .card-body .link-arrow-teal { margin-top: auto; }

        .side-articles { display: flex; flex-direction: column; gap: 24px; }
        .card-side { background-color: var(--white); border: 1px solid var(--border-color); padding: 24px; text-decoration: none; color: inherit; display: flex; flex-direction: column; transition: border-color 0.2s; cursor: pointer; }
        .card-side:hover { border-color: var(--teal); }
        .card-side .badge-outline { color: var(--teal); font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 12px; display: block; }
        .card-side h4 { font-size: 18px; line-height: 1.2; margin-bottom: 8px; color: var(--navy-dark); font-weight: 600; font-family: var(--font-sans); letter-spacing: -0.01em;}
        .card-side p { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }

        /* ============ PRODUCTS GRID ============ */
        .products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .product-card { background-color: var(--white); border: 1px solid var(--border-color); display: flex; flex-direction: column; overflow: hidden; transition: transform 0.3s, box-shadow 0.3s; }
        .product-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.05); }
        .prod-head { height: 180px; padding: 24px; position: relative; }
        .prod-head.bg-beige { background-color: var(--prod-beige); }
        .prod-head.bg-mint { background-color: var(--prod-mint); }
        .prod-head.bg-blue { background-color: var(--prod-blue); }
        .badge-dark { position: absolute; bottom: 24px; left: 24px; background-color: var(--navy-dark); color: var(--white); font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 12px; border-radius: 4px; display: flex; align-items: center; gap: 6px; }
        .prod-body { padding: 32px 24px 24px; display: flex; flex-direction: column; flex-grow: 1; }
        .prod-body h3 { font-size: 22px; margin-bottom: 8px; font-family: var(--font-sans); font-weight: 700; letter-spacing: -0.02em; color: var(--navy-dark); }
        .prod-body > p { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; line-height: 1.6; }
        .why-box { background-color: var(--box-bg); padding: 16px; border-radius: 4px; margin-bottom: 24px; flex-grow: 1; }
        .why-box h5 { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: var(--navy-dark); margin-bottom: 8px; font-family: var(--font-sans); }
        .why-box p { font-size: 12px; color: var(--text-muted); line-height: 1.6; }
        .prod-footer { display: flex; justify-content: space-between; align-items: center; }
        .price { font-size: 18px; font-weight: 700; color: var(--navy-dark); }
        .price span { font-size: 11px; font-weight: 500; color: var(--text-light); }

        /* ============ TRUST BANNER & NEWSLETTER ============ */
        .trust-banner { background-color: var(--navy-dark); color: var(--white); padding: 60px 40px; }
        .trust-inner { max-width: var(--max-w); margin: 0 auto; display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 40px; align-items: center; }
        .trust-quote { font-family: var(--font-serif); font-size: 32px; line-height: 1.1; }
        .trust-stat { text-align: center; }
        .trust-stat h4 { font-family: var(--font-serif); font-size: 40px; margin-bottom: 4px; }
        .trust-stat p { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(255,255,255,0.6); }

        .newsletter-section { padding: 80px 40px; background-color: var(--bg-cream); }
        .newsletter-box { max-width: 1000px; margin: 0 auto; background-color: var(--white); border: 1px solid var(--border-color); border-radius: 8px; padding: 48px 64px; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .newsletter-text h2 { font-size: 36px; margin-bottom: 16px; color: var(--navy-dark); }
        .newsletter-text p { font-size: 13px; color: var(--text-muted); }
        .form-group { display: flex; gap: 12px; margin-bottom: 12px; }
        .form-group input { flex-grow: 1; padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 4px; font-family: var(--font-sans); font-size: 13px; outline: none; }
        .form-group input:focus { border-color: var(--teal); }
        .whatsapp-note { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-light); }

        /* ============ SUB-PAGES ============ */
        .news-list { display: flex; flex-direction: column; gap: 16px; max-width: 900px; margin: 0 auto;}
        .news-item { background: var(--white); border: 1px solid var(--border-color); padding: 32px 40px; display: flex; justify-content: space-between; align-items: center; text-decoration: none; color: var(--navy-dark); transition: border-color 0.2s, box-shadow 0.2s; border-radius: 8px; cursor: pointer; }
        .news-item:hover { border-color: var(--teal); box-shadow: 0 12px 30px rgba(0,0,0,0.04); }
        .news-meta { font-size: 11px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px; display: block;}
        .news-title { font-family: var(--font-serif); font-size: 26px; line-height: 1.2; font-weight: 400; color: var(--navy-dark); }
        .news-agency { background: #EAE6DF; padding: 8px 16px; border-radius: 100px; font-size: 10px; font-weight: 700; color: var(--navy-dark); text-transform: uppercase; letter-spacing: 0.1em; white-space: nowrap; margin-left: 24px;}

        .resources-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
        .resource-card { background: var(--white); padding: 32px; border: 1px solid var(--border-color); border-radius: 4px; transition: border 0.3s; cursor: pointer; }
        .resource-card:hover { border-color: var(--teal); }
        .resource-card h3 { font-size: 18px; margin-bottom: 12px; font-family: var(--font-sans); font-weight: 600;}
        .resource-card p { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; }

        /* ============ FOOTER ============ */
        footer { background-color: var(--navy-dark); color: var(--white); padding: 64px 40px 32px; }
        .footer-inner { max-width: var(--max-w); margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 64px; }
        .footer-logo { font-family: var(--font-serif); font-size: 24px; color: var(--white); margin-bottom: 16px; cursor: pointer; }
        .footer-logo span { color: var(--teal); font-style: italic; }
        .footer-desc { font-size: 12px; color: rgba(255,255,255,0.6); max-width: 250px; line-height: 1.6; }
        .footer-col h5 { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(255,255,255,0.4); margin-bottom: 24px; font-family: var(--font-sans);}
        .footer-col ul { list-style: none; padding: 0; margin: 0; }
        .footer-col ul li { margin-bottom: 12px; }
        .footer-col a { color: rgba(255,255,255,0.8); font-size: 12px; text-decoration: none; transition: color 0.2s; cursor: pointer; }
        .footer-col a:hover { color: var(--teal); }
        .footer-bottom { max-width: var(--max-w); margin: 0 auto; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 32px; display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.4); }
        .footer-bottom span { display: flex; align-items: center; gap: 8px; }
        .footer-bottom span::before { content: ''; display: block; width: 6px; height: 6px; background-color: var(--teal); border-radius: 50%; }

        /* ============ RESPONSIVE ============ */
        @media (max-width: 1024px) {
            .editorial-grid { grid-template-columns: 1fr; }
            .products-grid { grid-template-columns: repeat(2, 1fr); }
            .trust-inner { grid-template-columns: 1fr 1fr; gap: 32px; text-align: center; }
            .trust-quote { grid-column: 1 / -1; margin-bottom: 24px; }
            .newsletter-box { grid-template-columns: 1fr; padding: 40px; }
            .footer-inner { grid-template-columns: 1fr 1fr; gap: 40px; }
            
            .nav-links {
                display: none; position: absolute; top: var(--nav-height); left: 0; width: 100%;
                background-color: var(--bg-cream); flex-direction: column; padding: 32px 40px;
                gap: 24px; border-bottom: 1px solid var(--border-color);
                box-shadow: 0 10px 20px rgba(0,0,0,0.05); align-items: flex-start;
            }
            .nav-links.active { display: flex; }
            .mobile-menu-btn { display: block; }
            .btn-nav-sub { width: 100%; text-align: center; margin-top: 8px; }
        }

        @media (max-width: 768px) {
            .hero { padding-top: 120px; }
            .hero h1 { font-size: 42px; }
            .products-grid { grid-template-columns: 1fr; }
            .trust-inner { grid-template-columns: 1fr; }
            .footer-inner { grid-template-columns: 1fr; }
            .footer-bottom { flex-direction: column; gap: 16px; align-items: flex-start; }
            .news-item { flex-direction: column; align-items: flex-start; gap: 16px; }
        }
      `}} />

      {/* ============ NAVIGATION ============ */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#home" onClick={(e) => navigateTo('home', e)} className="logo">Pharma<span>Service</span></a>
          
          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <a href="#home" onClick={(e) => navigateTo('home', e)} className={`nav-link ${activeView === 'home' ? 'active' : ''}`}>Home</a>
            <a href="#editorial" onClick={(e) => navigateTo('editorial', e)} className={`nav-link ${activeView === 'editorial' ? 'active' : ''}`}>Editorial Picks</a>
            <a href="#news" onClick={(e) => navigateTo('news', e)} className={`nav-link ${activeView === 'news' ? 'active' : ''}`}>Latest News</a>
            <a href="#resources" onClick={(e) => navigateTo('resources', e)} className={`nav-link ${activeView === 'resources' ? 'active' : ''}`}>Resources</a>
            <a href="#blog" onClick={(e) => navigateTo('blog', e)} className={`nav-link ${activeView === 'blog' ? 'active' : ''}`}>Blog</a>
            <a href="#about" onClick={(e) => navigateTo('about', e)} className={`nav-link ${activeView === 'about' ? 'active' : ''}`}>About</a>
            <button onClick={() => window.open('https://wa.me/971500000000', '_blank')} className="btn-nav-sub">Subscribe</button>
          </div>
        </div>
      </nav>

      <main>
        
        {/* ========================================== */}
        {/* VIEW: HOME                                 */}
        {/* ========================================== */}
        {activeView === 'home' && (
          <div className="view-container">
            <header className="hero">
              <div className="hero-top-label label-teal">Trusted Pharmaceutical Expertise Since 1984</div>
              <h1>Value-driven <em>consumer health</em><br />insights</h1>
              <p>Independent research, honest recommendations, direct delivery. We don&apos;t take money from brands to recommend them. We recommend what&apos;s best, you make the choice.</p>
              <div className="hero-actions">
                <a href="#editorial" onClick={(e) => navigateTo('editorial', e)} className="btn btn-dark">Read This Week&apos;s Guide</a>
                <a href="#shop" onClick={(e) => navigateTo('shop', e)} className="btn btn-outline">Browse All Products</a>
              </div>
            </header>

            <div className="ticker-wrap">
              <div className="ticker">
                <div className="ticker-item"><span>UAE DISTRIBUTION &amp; MOH IMPORT AUTHORIZATION</span></div>
                <div className="ticker-item">NEXT DAY DELIVERY — DIRECT TO YOUR DOOR</div>
                <div className="ticker-item"><span>INDEPENDENT</span> — WE DON&apos;T TAKE MONEY FROM BRANDS TO RECOMMEND THEM</div>
                <div className="ticker-item"><span>UAE DISTRIBUTION &amp; MOH IMPORT AUTHORIZATION</span></div>
                <div className="ticker-item">NEXT DAY DELIVERY — DIRECT TO YOUR DOOR</div>
                <div className="ticker-item"><span>INDEPENDENT</span> — WE DON&apos;T TAKE MONEY FROM BRANDS TO RECOMMEND THEM</div>
              </div>
            </div>

            <section className="section">
              <div className="section-header">
                <div className="section-title">
                  <div className="label-teal" style={{ marginBottom: '8px' }}>Latest from the editors</div>
                  <h2>This week in consumer health in the UAE</h2>
                </div>
                <a href="#editorial" onClick={(e) => navigateTo('editorial', e)} className="link-arrow">View all guides &rarr;</a>
              </div>

              <div className="editorial-grid">
                <a href="#editorial" onClick={(e) => navigateTo('editorial', e)} className="card-feature">
                  <div className="card-feature-img">
                    <span className="badge">Seasonal Guide</span>
                    <span className="img-caption">Photography: studio product shot</span>
                  </div>
                  <div className="card-body">
                    <span className="meta-text">March 2026 • 8 min read</span>
                    <h3>Wartime Essentials: What Your Medicine Cabinet Actually Needs Right Now</h3>
                    <p>We reviewed 40+ products across six categories to build the definitive home medical kit for the current situation. No panic buying. No guesswork. Just what a pharmaceutical professional would stock for their own family.</p>
                    <span className="link-arrow-teal label-teal">Read the full guide &rarr;</span>
                  </div>
                </a>

                <div className="side-articles">
                  <a href="#editorial" onClick={(e) => navigateTo('editorial', e)} className="card-side">
                    <span className="badge-outline">Digestive Health</span>
                    <h4>We Tested 9 Herbal Laxatives Sold in the UAE. Only One Got the Formulation Right.</h4>
                    <p>Most herbal digestive teas use fillers and underdosed active ingredients. Here&apos;s what we found when we looked at the actual formulations.</p>
                    <span className="meta-text" style={{ margin: 0 }}>March 2026 • 5 min read</span>
                  </a>
                  <a href="#editorial" onClick={(e) => navigateTo('editorial', e)} className="card-side">
                    <span className="badge-outline">Elderly Care</span>
                    <h4>The Underpad Problem: Why 60×90 Isn&apos;t Enough and What to Use Instead</h4>
                    <p>If you&apos;re caring for a bedridden family member, the standard underpad size sold in the UAE leaves 40% of the bed exposed. There&apos;s a better option.</p>
                    <span className="meta-text" style={{ margin: 0 }}>February 2026 • 4 min read</span>
                  </a>
                  <a href="#editorial" onClick={(e) => navigateTo('editorial', e)} className="card-side">
                    <span className="badge-outline">Dental Care</span>
                    <h4>Your Denture Adhesive Probably Contains Zinc. Here&apos;s Why That Matters.</h4>
                    <p>Long-term zinc exposure from denture adhesives has been linked to copper deficiency. We looked at every brand available in the UAE.</p>
                    <span className="meta-text" style={{ margin: 0 }}>February 2026 • 6 min read</span>
                  </a>
                </div>
              </div>
            </section>

            <section className="section" id="shop">
              <div className="section-header">
                <div className="section-title">
                  <div className="label-teal" style={{ marginBottom: '8px' }}>Our Picks</div>
                  <h2>Researched. Tested. Delivered.</h2>
                </div>
                <a href="#shop" onClick={(e) => navigateTo('shop', e)} className="link-arrow">View all products &rarr;</a>
              </div>

              <div className="products-grid">
                <div className="product-card">
                  <div className="prod-head bg-beige">
                    <div className="badge-dark">★ Editor&apos;s Pick</div>
                  </div>
                  <div className="prod-body">
                    <div style={{ marginBottom: '8px' }}>
                      <span className="badge-outline" style={{ color: 'var(--text-light)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Digestive Health</span>
                    </div>
                    <h3>PlantaLax Herbal Tea</h3>
                    <p>GMP-certified blend of Senna, Chamomile &amp; Cascara Bark. 20 bags per box.</p>
                    
                    <div className="why-box">
                      <h5>Why we chose this</h5>
                      <p>The only herbal digestive tea in the UAE with a legitimate GMP certification and properly dosed active ingredients. Three functional herbs that work together — not a single-note product padded with fillers. MOH Registered.</p>
                    </div>
                    
                    <div className="prod-footer">
                      <div className="price">23 AED <span>/ box</span></div>
                      <button className="btn btn-teal">Order Now</button>
                    </div>
                  </div>
                </div>

                <div className="product-card">
                  <div className="prod-head bg-mint">
                    <div className="badge-dark">✦ Only in UAE</div>
                  </div>
                  <div className="prod-body">
                    <div style={{ marginBottom: '8px' }}>
                      <span className="badge-outline" style={{ color: 'var(--text-light)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Elderly Care</span>
                    </div>
                    <h3>NIMED Underpads 90×180cm</h3>
                    <p>Full-bed disposable underpad. 20 per pack. The only 90×180cm format available in the UAE market.</p>
                    
                    <div className="why-box">
                      <h5>Why we chose this</h5>
                      <p>Standard 60×90 underpads leave nearly half the bed exposed, leading to lateral leakage and constant repositioning. This is the only full-bed coverage option in the UAE. It shouldn&apos;t be this hard to find, but it is.</p>
                    </div>
                    
                    <div className="prod-footer">
                      <div className="price">45 AED <span>/ pack</span></div>
                      <button className="btn btn-teal">Order Now</button>
                    </div>
                  </div>
                </div>

                <div className="product-card">
                  <div className="prod-head bg-blue">
                    <div className="badge-dark">✦ Zinc-Free</div>
                  </div>
                  <div className="prod-body">
                    <div style={{ marginBottom: '8px' }}>
                      <span className="badge-outline" style={{ color: 'var(--text-light)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Dental Care</span>
                    </div>
                    <h3>FittyDent Cleaning Tablets</h3>
                    <p>pH-9 formula. 32 tablets per pack. Zinc-free denture adhesive &amp; cleaning system.</p>
                    
                    <div className="why-box">
                      <h5>Why we chose this</h5>
                      <p>Most denture adhesives on UAE shelves contain zinc, which poses real risks for daily long-term users. FittyDent is the only zinc-free system we found with a waterproof adhesive and a high-pH cleaning formula that actually eliminates bacteria.</p>
                    </div>
                    
                    <div className="prod-footer">
                      <div className="price">19 AED <span>/ pack</span></div>
                      <button className="btn btn-teal">Order Now</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="trust-banner">
              <div className="trust-inner">
                <div className="trust-quote">We don&apos;t take money from brands to recommend them. We recommend what&apos;s <em>best</em>, then we make it <em>available</em>.</div>
                <div className="trust-stat">
                  <h4>1984</h4>
                  <p>Established</p>
                </div>
                <div className="trust-stat">
                  <h4>100%</h4>
                  <p>Independent</p>
                </div>
                <div className="trust-stat">
                  <h4>UAE</h4>
                  <p>Licensed Distributor</p>
                </div>
              </div>
            </div>

            <section className="newsletter-section">
              <div className="newsletter-box">
                <div className="newsletter-text">
                  <h2>One message a week</h2>
                  <p>What&apos;s in season, what works, what doesn&apos;t, and why. From a 40-year pharmaceutical distributor who doesn&apos;t get paid to recommend anything. Just better pharma service.</p>
                </div>
                <div className="newsletter-form">
                  <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed via WhatsApp!'); }}>
                    <div className="form-group">
                      <input type="tel" placeholder="+971 — Your WhatsApp number" required />
                      <button type="submit" className="btn btn-teal">Subscribe</button>
                    </div>
                    <div className="whatsapp-note">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Delivered via WhatsApp. No spam. Unsubscribe anytime.
                    </div>
                  </form>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ========================================== */}
        {/* VIEW: EDITORIAL PICKS                      */}
        {/* ========================================== */}
        {activeView === 'editorial' && (
          <div className="view-container">
            <header className="page-header">
              <div className="label-teal" style={{ justifyContent: 'center' }}>Research &amp; Insights</div>
              <h1>Editorial Picks</h1>
              <p>Deep dives, formulation comparisons, and honest reviews. We do the thinking and absorb the complexity so you can make better decisions.</p>
            </header>
            <section className="section" style={{ paddingTop: 0 }}>
              <div className="editorial-grid">
                <a href="#editorial" className="card-feature">
                  <div className="card-feature-img">
                    <span className="badge">Seasonal Guide</span>
                  </div>
                  <div className="card-body">
                    <span className="meta-text">March 2026 • 8 min read</span>
                    <h3>Wartime Essentials: What Your Medicine Cabinet Actually Needs Right Now</h3>
                    <p>We reviewed 40+ products across six categories to build the definitive home medical kit.</p>
                    <span className="link-arrow-teal label-teal">Read the full guide &rarr;</span>
                  </div>
                </a>
                <div className="side-articles">
                  <a href="#editorial" className="card-side">
                    <span className="badge-outline">Digestive Health</span>
                    <h4>We Tested 9 Herbal Laxatives Sold in the UAE.</h4>
                    <span className="meta-text" style={{ margin: 0 }}>March 2026 • 5 min read</span>
                  </a>
                  <a href="#editorial" className="card-side">
                    <span className="badge-outline">Elderly Care</span>
                    <h4>The Underpad Problem: Why 60×90 Isn&apos;t Enough</h4>
                    <span className="meta-text" style={{ margin: 0 }}>February 2026 • 4 min read</span>
                  </a>
                  <a href="#editorial" className="card-side">
                    <span className="badge-outline">Dental Care</span>
                    <h4>Your Denture Adhesive Probably Contains Zinc.</h4>
                    <span className="meta-text" style={{ margin: 0 }}>February 2026 • 6 min read</span>
                  </a>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ========================================== */}
        {/* VIEW: LATEST NEWS                          */}
        {/* ========================================== */}
        {activeView === 'news' && (
          <div className="view-container">
            <header className="page-header">
              <div className="label-teal" style={{ justifyContent: 'center' }}>Regulatory &amp; Market Updates</div>
              <h1>Latest News</h1>
              <p>Curated updates from MOHAP, Dubai Health Authority, and global supply chain shifts affecting UAE consumers.</p>
            </header>

            <section className="section" style={{ paddingTop: 0 }}>
              <div className="news-list">
                {newsUpdates.map((news, idx) => (
                  <a key={idx} href={news.link} className="news-item" style={{ cursor: 'pointer' }}>
                    <div style={{ maxWidth: '75%' }}>
                      <span className="news-meta">{news.date}</span>
                      <div className="news-title">{news.title}</div>
                    </div>
                    <span className="news-agency">{news.agency}</span>
                  </a>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ========================================== */}
        {/* VIEW: RESOURCES                            */}
        {/* ========================================== */}
        {activeView === 'resources' && (
          <div className="view-container">
            <header className="page-header">
              <div className="label-teal" style={{ justifyContent: 'center' }}>Tools &amp; Downloads</div>
              <h1>Resources</h1>
              <p>Practical assets to help you navigate consumer healthcare.</p>
            </header>

            <section className="section" style={{ paddingTop: 0 }}>
              <div className="resources-grid">
                <div className="resource-card">
                  <h3>The Family Medicine Cabinet Checklist</h3>
                  <p>A printable PDF guide detailing exactly what you need at home, categorized by age and necessity.</p>
                  <span className="link-arrow">Download PDF &rarr;</span>
                </div>
                <div className="resource-card">
                  <h3>Ingredient Glossary</h3>
                  <p>Our plain-english translation of complex pharmaceutical ingredients found in daily OTC products.</p>
                  <span className="link-arrow">Browse Glossary &rarr;</span>
                </div>
                <div className="resource-card">
                  <h3>Product Recall Database</h3>
                  <p>A maintained, searchable list of regional product recalls affecting consumer health goods in the UAE.</p>
                  <span className="link-arrow">Search Database &rarr;</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ========================================== */}
        {/* VIEW: BLOG (OTC GUIDE)                     */}
        {/* ========================================== */}
        {activeView === 'blog' && (
          <div className="view-container">
            <header className="page-header">
              <div className="label-teal" style={{ justifyContent: 'center' }}>Monthly Industry Blog</div>
              <h1>The OTC Guide</h1>
              <p>A monthly macro-view on the landscape of the consumer health OTC Market in the UAE.</p>
            </header>
            <section className="section" style={{ paddingTop: 0 }}>
              <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--white)', padding: '48px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                <div className="label-teal" style={{ marginBottom: '16px' }}>Volume 14 • March 2026</div>
                <h3 style={{ fontSize: '32px', marginBottom: '24px' }}>The State of Consumer Health: Q1 2026</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Our quarterly synthesis of market shifts. Trust is thinning, pharmacy shelves are crowded, and the gap between clinical efficacy and marketing claims has never been wider.</p>
                <a href="#blog" className="btn btn-dark">Read Full Report</a>
              </div>
            </section>
          </div>
        )}

      </main>

      {/* ============ FOOTER ============ */}
      <footer>
        <div className="footer-inner">
          <div>
            <a href="#home" className="footer-logo" onClick={(e) => navigateTo('home', e)} style={{ cursor: 'pointer', textDecoration: 'none' }}>
              Pharma<span>Service</span>
            </a>
            <p className="footer-desc">The voice of reason in healthcare. Independent research, honest recommendations, direct delivery since 1984.</p>
          </div>
          <div className="footer-col">
            <h5>Editorial</h5>
            <ul>
              <li><a href="#editorial" onClick={(e) => navigateTo('editorial', e)}>Seasonal Prep</a></li>
              <li><a href="#editorial" onClick={(e) => navigateTo('editorial', e)}>Popular</a></li>
              <li><a href="#editorial" onClick={(e) => navigateTo('editorial', e)}>Native Products</a></li>
              <li><a href="#blog" onClick={(e) => navigateTo('blog', e)}>OTC Guide</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>News</h5>
            <ul>
              <li><a href="#news" onClick={(e) => navigateTo('news', e)}>MOHAP &amp; EDE Updates</a></li>
              <li><a href="#news" onClick={(e) => navigateTo('news', e)}>Dubai Health Authority</a></li>
              <li><a href="#resources" onClick={(e) => navigateTo('resources', e)}>Resources</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li><a href="#about" onClick={(e) => navigateTo('about', e)}>About Us</a></li>
              <li><a href="#about" onClick={(e) => navigateTo('about', e)}>Contact</a></li>
              <li><a href="#shop" onClick={(e) => navigateTo('shop', e)}>Wholesale</a></li>
              <li><a href="#about" onClick={(e) => navigateTo('about', e)}>Licensing Info</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>&copy; 2026 Pharma Service Co. LLC. All rights reserved.</div>
          <span>Licensed UAE Pharmaceutical Distributor &bull; Dubai Healthcare City</span>
        </div>
      </footer>
    </>
  );
}
