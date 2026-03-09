"use client";
import { useEffect, useState } from "react";
import { PRODUCTS } from "../components/products";

const teal = "#00a896";
const gold = "#c9a84c";
const navy = "#0a1628";
const cream = "#f8f5f0";
const ink = "#142235";

const productShowcase = [
  { id: "pads", name: "NIMED Underpads XL · 90×180cm", buyer: "For nursing homes, hospitals, and homecare buyers needing full-bed coverage.", tag: "Institutional Supply" },
  { id: "tea", name: "Planta Lax Tea · Medicinal Herbal Tea", buyer: "For pharmacies and wellness-led retailers looking for a trusted digestive product with repeat demand.", tag: "MOH Registered" },
  { id: "tabs", name: "Fittydent Cleaning Tablets · 32s", buyer: "For dental clinics, prosthodontists, and pharmacies serving denture wearers.", tag: "Dental Care" },
  { id: "duo", name: "NIMED Mosquito Duo 40ml", buyer: "For pharmacies, hotels, and family retailers wanting a differentiated before-and-after bite solution.", tag: "Consumer Retail" },
  { id: "soap", name: "Amira Honey Milk Soap 100g", buyer: "For sensitive-skin shelves, dermatology counters, and daily repeat purchase baskets.", tag: "Sensitive Skin" },
  { id: "trio", name: "Mosquito Trio Spray 100ml", buyer: "For outdoor, family, and travel-led channels that need a broader mosquito care range.", tag: "Seasonal Demand" },
].map((item) => ({ ...item, product: PRODUCTS.find((p) => p.id === item.id) }));

const audiences = [
  { title: "Pharmacies", text: "Fast-moving OTC and differentiated products with clear retail margin, 120-day terms, and direct reorder flow." },
  { title: "Nursing Homes", text: "Institutional continence and hygiene products backed by dependable UAE stock and practical supply support." },
  { title: "Hospitals & Clinics", text: "Licensed partner for regulated supply, specialty sourcing pathways, and credible product support." },
  { title: "Dental Practices", text: "Denture-care products that are easy to explain, easy to stock, and built for recurring patient use." },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Arsenal', sans-serif", color: ink, background: cream }}>
      <style>{`@import url('https://fonts.cdnfonts.com/css/agrandir');
        html{scroll-behavior:smooth}
        *{box-sizing:border-box}
        .nav-link{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(248,245,240,.72);text-decoration:none}
        .nav-link:hover{color:#fff}
        .section-kicker{display:flex;align-items:center;gap:12px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-style:italic}
        .line{display:block;width:34px;height:1px}
        .card-dark{background:rgba(248,245,240,.04);border:1px solid rgba(248,245,240,.08);border-radius:20px;box-shadow:0 18px 50px rgba(0,0,0,.18)}
        .card-light{background:#fff;border:1px solid rgba(10,22,40,.08);border-radius:20px;box-shadow:0 20px 50px rgba(10,22,40,.07)}
        .pill{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid rgba(201,168,76,.32);border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${gold}}
        .product-card:hover{transform:translateY(-4px);border-color:rgba(0,168,150,.28)}
        @media (max-width: 960px){
          .desktop-nav{display:none!important}
          .hero-grid,.audience-grid,.story-grid,.innovation-grid,.cta-grid,.footer-grid{grid-template-columns:1fr!important}
          .hero-section{padding:110px 24px 72px!important}
          .section-pad{padding:72px 24px!important}
          .products-grid{grid-template-columns:1fr!important}
          .portfolio-head{align-items:flex-start!important}
        }
      `}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: scrolled ? "rgba(10,22,40,.94)" : "rgba(10,22,40,.72)", backdropFilter: "blur(12px)", borderBottom: `1px solid rgba(201,168,76,${scrolled ? 0.16 : 0.08})` }}>
        <a href="/" style={{ textDecoration: "none", color: cream, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontFamily: "'Agrandir', sans-serif", fontWeight: 700, fontSize: 18 }}>Pharma Service<span style={{ color: gold }}>.</span></div>
        </a>
        <div className="desktop-nav" style={{ display: "flex", gap: 28, alignItems: "center" }}>
          <a href="#products" className="nav-link">Products</a>
          <a href="#who" className="nav-link">Who We Serve</a>
          <a href="#innovation" className="nav-link">Innovation</a>
          <a href="#about" className="nav-link">About</a>
          <a href="/products" style={{ textDecoration: "none", fontFamily: "'Agrandir', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: navy, background: gold, padding: "12px 22px", borderRadius: 999 }}>Order Products</a>
        </div>
      </nav>

      <section className="hero-section hero-grid" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 28, alignItems: "stretch", padding: "120px 48px 88px", background: `${navy} url('/banner-warehouse.jpg') center/cover no-repeat`, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(10,22,40,.92) 0%, rgba(10,22,40,.84) 52%, rgba(10,22,40,.7) 100%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 700 }}>
          <div className="section-kicker" style={{ color: gold, marginBottom: 24 }}><span className="line" style={{ background: gold }} />Established 1984 · Dubai Healthcare City</div>
          <h1 style={{ fontFamily: "'Agrandir', sans-serif", fontSize: "clamp(38px, 5vw, 64px)", lineHeight: 1.04, color: cream, marginBottom: 18 }}>Serious pharmaceutical supply for buyers who need products now.</h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "rgba(248,245,240,.78)", maxWidth: 620, marginBottom: 30 }}>Pharma Service Co. is a long-standing UAE operator with real inventory, active distribution capability, and a direct ordering path for pharmacy and institutional buyers.</p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
            <span className="pill">40 years in market</span>
            <span className="pill">6 active product lines</span>
            <span className="pill">120-day terms</span>
            <span className="pill">25% partner discount</span>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href="#about" style={{ textDecoration: "none", fontFamily: "'Agrandir', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: navy, background: gold, padding: "15px 28px", borderRadius: 999 }}>Learn About Us</a>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 16, alignContent: "center" }}>
          {[
            ["MOH credentials", "Licensed UAE pharmaceutical distribution and import operations"],
            ["Commercial readiness", "Products ready for pharmacy, institutional, and specialty buyers"],
            ["Order path", "Direct route from homepage to product ordering and WhatsApp confirmation"],
          ].map(([title, text]) => (
            <div key={title} className="card-dark" style={{ padding: 22 }}>
              <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 18, fontWeight: 700, color: cream, marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(248,245,240,.68)" }}>{text}</div>
            </div>
          ))}
          <div style={{ background: gold, color: navy, borderRadius: 20, padding: "16px 18px", boxShadow: "0 18px 50px rgba(0,0,0,.18)" }}>
            <div style={{ fontFamily: "'Agrandir', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>Licenses & Commercial Terms</div>
            <div style={{ fontSize: 14, lineHeight: 1.65 }}>MOH-aligned distribution capability · 120-day credit terms · 25% partner discount · direct buyer order path</div>
          </div>
        </div>
      </section>

      <section id="products" className="section-pad" style={{ padding: "96px 48px", background: navy }}>
        <div className="portfolio-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 36 }}>
          <div>
            <div className="section-kicker" style={{ color: teal, marginBottom: 16 }}><span className="line" style={{ background: teal }} />Portfolio</div>
            <h2 style={{ fontFamily: "'Agrandir', sans-serif", fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.08, color: cream }}>Specialized Product Lines</h2>
          </div>
          <a href="/products" style={{ textDecoration: "none", fontFamily: "'Agrandir', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: navy, background: gold, padding: "12px 22px", borderRadius: 999 }}>Go to Order Page</a>
        </div>

        <div className="products-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 18 }}>
          {productShowcase.map(({ product, name, buyer, tag }) => (
            <a key={product.id} href="/products" className="product-card card-dark" style={{ textDecoration: "none", color: cream, overflow: "hidden", transition: "transform .2s,border-color .2s" }}>
              <div style={{ position: "relative", aspectRatio: "1.1 / 1", background: "rgba(255,255,255,.03)" }}>
                <img src={product.thumb} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", top: 14, left: 14, background: "rgba(10,22,40,.8)", color: teal, border: "1px solid rgba(0,168,150,.25)", borderRadius: 999, padding: "6px 10px", fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase" }}>{product.cat}</div>
              </div>
              <div style={{ padding: 22 }}>
                <div style={{ color: gold, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10 }}>{tag}</div>
                <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 20, fontWeight: 700, lineHeight: 1.2, marginBottom: 10 }}>{name}</div>
                <div style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(248,245,240,.72)" }}>{buyer}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section style={{ background: gold, padding: "16px 48px", display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          "25% Partner Discount",
          "120-Day Credit Terms",
          "6+1 Bonus Structure",
          "Direct WhatsApp Order Flow",
        ].map((item) => (
          <div key={item} style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: navy }}>{item}</div>
        ))}
      </section>

      <section id="who" className="section-pad" style={{ padding: "96px 48px", background: cream }}>
        <div className="section-kicker" style={{ color: teal, marginBottom: 16 }}><span className="line" style={{ background: teal }} />Who We Serve</div>
        <h2 style={{ fontFamily: "'Agrandir', sans-serif", fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.08, color: ink, marginBottom: 28 }}>Built for serious buyers across healthcare and care-driven retail.</h2>
        <div className="audience-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 18 }}>
          {audiences.map((a) => (
            <div key={a.title} className="card-light" style={{ padding: 24 }}>
              <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 21, fontWeight: 700, color: ink, marginBottom: 10 }}>{a.title}</div>
              <div style={{ fontSize: 14, lineHeight: 1.75, color: "#4c5b6d" }}>{a.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="innovation" className="section-pad" style={{ padding: "96px 48px", background: navy }}>
        <div className="section-kicker" style={{ color: teal, marginBottom: 16 }}><span className="line" style={{ background: teal }} />Value-Driven Innovation</div>
        <h2 style={{ fontFamily: "'Agrandir', sans-serif", fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.08, color: cream, marginBottom: 28 }}>Products with real commercial logic behind them.</h2>
        <div className="innovation-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div style={{ background: teal, color: navy, borderRadius: 24, padding: 28, boxShadow: "0 18px 50px rgba(0,0,0,.18)" }}>
            <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 26, fontWeight: 700, marginBottom: 10 }}>NIMED Underpads</div>
            <div style={{ fontSize: 15, lineHeight: 1.8, maxWidth: 640 }}>Our own trademarked institutional care line built for practical healthcare demand. NIMED Underpads give buyers a differentiated full-bed solution with institutional logic, dependable sizing, and exclusive UAE distribution through Pharma Service Co.</div>
            <div style={{ marginTop: 16, fontFamily: "'Agrandir', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>Manufactured in Italy · PSC Exclusive UAE Distribution</div>
          </div>
          <div style={{ background: gold, color: navy, borderRadius: 24, padding: 28, boxShadow: "0 18px 50px rgba(0,0,0,.18)" }}>
            <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 26, fontWeight: 700, marginBottom: 10 }}>NIMED Mosquito Duo</div>
            <div style={{ fontSize: 15, lineHeight: 1.8, maxWidth: 640 }}>A cosmetic innovation built with our partner third-party manufacturer in Italy. The 2-in-1 before-and-after-bite concept gives pharmacies and consumer channels a product that stands out commercially, not just cosmetically.</div>
            <div style={{ marginTop: 16, fontFamily: "'Agrandir', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>Manufactured in Italy · PSC Exclusive UAE Distribution</div>
          </div>
        </div>
      </section>

      <section id="about" className="section-pad" style={{ padding: "96px 48px", background: cream }}>
        <div className="story-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 24, alignItems: "start" }}>
          <div>
            <div className="section-kicker" style={{ color: teal, marginBottom: 16 }}><span className="line" style={{ background: teal }} />Our Story</div>
            <h2 style={{ fontFamily: "'Agrandir', sans-serif", fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.08, color: ink, marginBottom: 16 }}>A UAE operator built on continuity, licensing, and execution.</h2>
            <p style={{ fontSize: 16, lineHeight: 1.85, color: "#4c5b6d", maxWidth: 760 }}>Pharma Service Co. has been operating in the UAE since 1984. Over four decades, the company has built a serious commercial base across pharmacy, institutional, and healthcare channels. The point is not to look impressive on paper. The point is to solve supply problems with real products, credible distribution, and practical buyer terms.</p>
          </div>
          <div style={{ display: "grid", gap: 16 }}>
            {[
              ["40+ Years", "of uninterrupted UAE operations"],
              ["6 Products", "actively shown for direct B2B ordering"],
              ["120 Days", "credit terms for pharmacy partners"],
            ].map(([num, label]) => (
              <div key={num} className="card-light" style={{ padding: 22 }}>
                <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 34, fontWeight: 700, color: gold, marginBottom: 6 }}>{num}</div>
                <div style={{ fontSize: 14, lineHeight: 1.7, color: "#4c5b6d" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad cta-grid" style={{ padding: "96px 48px", background: teal, display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 24, alignItems: "center" }}>
        <div>
          <div className="section-kicker" style={{ color: navy, marginBottom: 16 }}><span className="line" style={{ background: navy }} />Direct Path to Order</div>
          <h2 style={{ fontFamily: "'Agrandir', sans-serif", fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.08, color: navy, marginBottom: 12 }}>Buyers can move from company story to product order without friction.</h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(10,22,40,.78)", maxWidth: 680 }}>Go to the order page, identify the pharmacy, choose pack sizes, and send a pre-filled WhatsApp order directly with the pharmacy name already woven into the message.</p>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "flex-start" }}>
          <a href="/products" style={{ textDecoration: "none", fontFamily: "'Agrandir', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: cream, background: navy, padding: "15px 26px", borderRadius: 999 }}>Order Products</a>
          <a href="mailto:info@pharmaservice.ae" style={{ textDecoration: "none", fontFamily: "'Agrandir', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: navy, background: "rgba(10,22,40,.08)", padding: "15px 26px", borderRadius: 999 }}>Email Us</a>
        </div>
      </section>

      <footer style={{ background: "#06101d", color: cream }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 24, padding: "56px 48px" }}>
          <div>
            <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 14 }}>Pharma Service<span style={{ color: gold }}>.</span></div>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(248,245,240,.62)", maxWidth: 460 }}>Pharmaceutical distribution in the UAE since 1984. Built for serious pharmacy and institutional buyers who need products, terms, and execution.</p>
          </div>
          <div>
            <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: gold, marginBottom: 16 }}>Company</div>
            <div style={{ display: "grid", gap: 10 }}>
              <a href="#about" style={{ textDecoration: "none", color: "rgba(248,245,240,.7)" }}>About Us</a>
              <a href="#who" style={{ textDecoration: "none", color: "rgba(248,245,240,.7)" }}>Who We Serve</a>
              <a href="#innovation" style={{ textDecoration: "none", color: "rgba(248,245,240,.7)" }}>Value-Driven Innovation</a>
              <a href="/products" style={{ textDecoration: "none", color: "rgba(248,245,240,.7)" }}>Order Products</a>
            </div>
          </div>
        </div>
        <div style={{ padding: "18px 48px", borderTop: "1px solid rgba(248,245,240,.08)", fontSize: 12, color: "rgba(248,245,240,.45)", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <span>© 2026 Pharma Service Co. LLC</span>
          <span>Dubai Healthcare City · UAE</span>
        </div>
      </footer>
    </div>
  );
}
