"use client";
import { useEffect, useState } from "react";
import { PRODUCTS } from "../components/products";

const teal = "#11b7ab";
const gold = "#c9a84c";
const navy = "#07162b";
const cream = "#f4f1ea";
const ink = "#17273b";

const audiences = [
  {
    title: "Nursing Homes & Home Care",
    text: "Full-bed institutional supply of continence care and medical consumables. We keep your stock cycles moving.",
    icon: "🏥",
  },
  {
    title: "Pharmacies",
    text: "25% off retail, 120-day terms, bonus units on every order. Better margin than your current distributor.",
    icon: "💊",
  },
  {
    title: "Dental Clinics",
    text: "Fittydent denture care for your patients. Professional supply with clinic pricing and clinical support.",
    icon: "🦷",
  },
  {
    title: "Hotels & Wellness",
    text: "Direct line for bulk guest amenity supply in the GCC. MOH registered, ready for F&B and wellness channels.",
    icon: "🏨",
  },
];

const productCards = [
  {
    id: "pads",
    title: "NIMED Underpads 90×180cm",
    subtitle: "PRODUCT CARE",
    text: "The only 90x180cm disposable underpad in the UAE market. Full bed coverage with leak-proof protection — the institutional standard.",
    tag: "Institutional Supply",
    image: "/img/pads-1.png",
  },
  {
    id: "tea",
    title: "Planta Lax Tea\nMedicinal Herbal Tea",
    subtitle: "DIETETIC HERBS",
    text: "GMP-certified medicinal herbal tea, MOH registered, SENA, chamomile, and Cascara bark. Trusted, timeless, and hospitality-safe.",
    tag: "MOH Registered",
    image: "/img/tea-1.png",
  },
  {
    id: "tabs",
    title: "FittyDent Denture Care",
    subtitle: "DENTAL CARE",
    text: "Complete denture adhesive and cleaning system. Zero-free formula, pH 9.0 quality tablets, for dental clinics and prosthodontists.",
    tag: "Dental Professional",
    image: "/img/tabs-1.png",
  },
  {
    id: "duo",
    title: "NIMED Mosquito Duo",
    subtitle: "PROTECTIVE CARE",
    text: "Before-and-after bite protection in one product. Fast relief plus barrier support for bites, hospitality, and active outdoor channels.",
    tag: "Cosmetic Retail",
    image: "/img/duo-1.png",
  },
  {
    id: "soap",
    title: "Amira Honey Milk Soap",
    subtitle: "SENSITIVE SKIN CARE",
    text: "Original formula for sensitive skin, eczema-prone skin, rashes, and daily use. Four-decade market legacy.",
    tag: "Sensitive Skin",
    image: "/img/soap-1.png",
  },
  {
    id: "custom",
    title: "Custom Pharmaceutical Import",
    subtitle: "CUSTOM SERVICES",
    text: "MOH import license enables international sourcing, registered products, emergency requests, and tender partners to supply niches.",
    tag: "B2B Sourcing",
    image: "/img/trio-1.png",
  },
];

const services = [
  {
    no: "01",
    title: "Pharmaceutical Distribution",
    text: "Full UAE distribution across retail pharmacies, hospitals, clinics, and institutional buyers. Licensed for both government and private sector supply.",
  },
  {
    no: "02",
    title: "Government Tender Access",
    text: "Through Medical Services in Abu Dhabi, we hold an active access to government procurement channels across the Emirates.",
  },
  {
    no: "03",
    title: "International Import & Sourcing",
    text: "MOH import license enables us to source from Europe, India, and GCC partners — including parallel and post-shortage specialty medications.",
  },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Arsenal', sans-serif", background: cream, color: ink }}>
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/agrandir');
        html{scroll-behavior:smooth}
        *{box-sizing:border-box}
        .container{max-width:1180px;margin:0 auto}
        .nav-link{font-family:'Agrandir',sans-serif;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(244,241,234,.82);text-decoration:none}
        .nav-link:hover{color:#fff}
        .section-kicker{display:flex;align-items:center;gap:10px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:${teal};font-family:'Agrandir',sans-serif;font-weight:700}
        .section-kicker::before{content:'';display:block;width:26px;height:1px;background:currentColor;opacity:.9}
        .card-light{background:rgba(255,255,255,.45);border:1px solid rgba(7,22,43,.08)}
        .grid-4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
        .grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0}
        .gold-btn{display:inline-flex;align-items:center;justify-content:center;background:${gold};color:${navy};padding:14px 24px;border-radius:0;text-decoration:none;font-family:'Agrandir',sans-serif;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}
        .dark-btn{display:inline-flex;align-items:center;justify-content:center;background:${navy};color:${cream};padding:14px 24px;border-radius:0;text-decoration:none;font-family:'Agrandir',sans-serif;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}
        .teal-italic{color:${teal};font-style:italic;font-weight:400}
        .product-tile{position:relative;min-height:315px;overflow:hidden;border:1px solid rgba(7,22,43,.14);text-decoration:none}
        .product-tile img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
        .product-tile .overlay{position:absolute;inset:0;background:linear-gradient(180deg, rgba(7,22,43,.05) 0%, rgba(7,22,43,.18) 24%, rgba(7,22,43,.92) 64%, rgba(7,22,43,.98) 100%)}
        .stat-box{background:#0d213e;border:1px solid rgba(255,255,255,.04);padding:28px}
        .footer-link{color:rgba(244,241,234,.72);text-decoration:none;font-size:13px}
        .footer-link:hover{color:#fff}
        @media (max-width: 980px){
          .desktop-nav{display:none!important}
          .hero-inner,.serve-grid,.innovation-grid,.story-grid,.services-grid,.cta-grid,.footer-grid{grid-template-columns:1fr!important}
          .grid-3{grid-template-columns:1fr!important;gap:18px}
          .grid-4{grid-template-columns:1fr 1fr!important}
          .hero-copy{padding-right:0!important}
        }
        @media (max-width: 640px){
          .grid-4{grid-template-columns:1fr!important}
          .site-pad{padding-left:20px!important;padding-right:20px!important}
          .hero-title{font-size:42px!important}
        }
      `}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: scrolled ? "rgba(7,22,43,.96)" : "rgba(7,22,43,.88)", borderBottom: `1px solid rgba(255,255,255,${scrolled ? 0.08 : 0.04})`, backdropFilter: "blur(8px)" }}>
        <div className="container site-pad" style={{ padding: "18px 30px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ textDecoration: "none", color: cream, display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.png" alt="Pharma Service Co." style={{ height: 24, width: "auto" }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
            <span style={{ display: "none", fontFamily: "'Agrandir', sans-serif", fontWeight: 700, fontSize: 16 }}>Pharma Service Co.</span>
          </a>
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a href="#about" className="nav-link">About</a>
            <a href="#portfolio" className="nav-link">Products</a>
            <a href="#services" className="nav-link">Services</a>
            <a href="#footer" className="nav-link">Contact</a>
            <a href="/products" className="gold-btn" style={{ padding: "12px 20px" }}>Order Now</a>
          </div>
        </div>
      </nav>

      <section style={{ background: `radial-gradient(circle at 50% 22%, rgba(17,183,171,.22), transparent 22%), linear-gradient(180deg, rgba(7,22,43,.98), rgba(5,16,30,.98)), url('/banner-warehouse.jpg') center/cover no-repeat`, color: cream, paddingTop: 92 }}>
        <div className="container site-pad" style={{ padding: "54px 30px 0" }}>
          <div className="hero-inner" style={{ minHeight: 610, display: "grid", gridTemplateColumns: "1fr", alignItems: "center", textAlign: "center" }}>
            <div className="hero-copy" style={{ maxWidth: 760, margin: "0 auto", paddingRight: 0, paddingTop: 22, paddingBottom: 82 }}>
              <div style={{ color: gold, fontFamily: "'Agrandir', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 20 }}>Established 1984 · Dubai Healthcare City</div>
              <h1 className="hero-title" style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 72, lineHeight: 1.03, letterSpacing: "-.03em", marginBottom: 18 }}>
                Four Decades of <br />
                <span className="teal-italic">Pharmaceutical</span> Excellence
              </h1>
              <p style={{ maxWidth: 560, margin: "0 auto 28px", color: "rgba(244,241,234,.72)", fontSize: 16, lineHeight: 1.9 }}>
                Full-spectrum pharmaceutical distribution across the GCC. Licensed importers, registered distributor, and strategic partner to healthcare institutions from Dubai to Abu Dhabi.
              </p>
              <a href="#about" className="gold-btn">Learn About Us</a>
            </div>
          </div>
        </div>
        <div style={{ background: gold, color: navy }}>
          <div className="container site-pad" style={{ padding: "12px 30px", display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", fontFamily: "'Agrandir', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>
            <span>Full UAE Distribution License</span>
            <span>MOH Import Certified</span>
            <span>Government Tender Access</span>
            <span>Dubai Healthcare City</span>
          </div>
        </div>
      </section>

      <section style={{ background: cream }}>
        <div className="container site-pad" style={{ padding: "86px 30px" }}>
          <div className="section-kicker" style={{ marginBottom: 18 }}>Who We Serve</div>
          <h2 style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 54, lineHeight: 1.05, marginBottom: 36 }}>
            Your supply partner,<br />
            <span className="teal-italic">whoever you are</span>
          </h2>
          <div className="serve-grid grid-4">
            {audiences.map((item) => (
              <div key={item.title} className="card-light" style={{ padding: 26, minHeight: 170 }}>
                <div style={{ fontSize: 18, marginBottom: 18 }}>{item.icon}</div>
                <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{item.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.8, color: "#556579" }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: navy }}>
        <div className="container site-pad" style={{ padding: "82px 30px" }}>
          <div className="section-kicker" style={{ marginBottom: 18 }}>Value-Driven Innovation</div>
          <h2 style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 52, lineHeight: 1.04, color: cream, marginBottom: 34 }}>
            Our own brands,<br />
            <span className="teal-italic">built for this market</span>
          </h2>
          <div className="innovation-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            <div style={{ background: "#063447", color: cream, padding: 34, border: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ display: "inline-block", background: teal, color: cream, fontFamily: "'Agrandir', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", padding: "7px 10px", marginBottom: 24 }}>NIMED™ Trademark</div>
              <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 34, lineHeight: 1.05, marginBottom: 16 }}>NIMED Underpads</div>
              <div style={{ color: "rgba(244,241,234,.74)", fontSize: 14, lineHeight: 1.9, maxWidth: 460 }}>
                The only full bed 90×180cm disposable underpad in the UAE market. PSC’s proprietary trademark, designed for institutional continence care. Full coverage alternative to local 90×60 — the standard that nursing homes, hospitals, and home health care companies have been waiting for.
              </div>
              <div style={{ marginTop: 30, color: "rgba(244,241,234,.45)", fontSize: 10, fontFamily: "'Agrandir', sans-serif", letterSpacing: ".14em", textTransform: "uppercase" }}>Manufactured in Italy · PSC Exclusive UAE Distribution</div>
            </div>
            <div style={{ background: "#1f2a33", color: cream, padding: 34, border: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ display: "inline-block", background: gold, color: navy, fontFamily: "'Agrandir', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", padding: "7px 10px", marginBottom: 24 }}>Cosmetic Innovation</div>
              <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 34, lineHeight: 1.05, marginBottom: 6 }}>NIMED Mosquito Duo</div>
              <div style={{ color: gold, fontStyle: "italic", fontSize: 15, marginBottom: 16 }}>Before & After Bite</div>
              <div style={{ color: "rgba(244,241,234,.74)", fontSize: 14, lineHeight: 1.9, maxWidth: 460 }}>
                A 2-in-1 cosmetic innovation developed with our third party Italian manufacturer. Eucalyptus and citronella protection before exposure, soothing relief after — all in a single 40ml tube. Designed for retail pharmacies, hotels, and outdoor channels across the GCC.
              </div>
              <div style={{ marginTop: 30, color: "rgba(244,241,234,.45)", fontSize: 10, fontFamily: "'Agrandir', sans-serif", letterSpacing: ".14em", textTransform: "uppercase" }}>Manufactured in Italy · PSC Exclusive UAE Distribution</div>
            </div>
          </div>
        </div>
      </section>

      <section id="portfolio" style={{ background: cream }}>
        <div className="container site-pad" style={{ padding: "86px 30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "end", marginBottom: 26, flexWrap: "wrap" }}>
            <div>
              <div className="section-kicker" style={{ marginBottom: 18 }}>Portfolio</div>
              <h2 style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 52, lineHeight: 1.04 }}>
                Specialized<br />
                <span className="teal-italic">Product Lines</span>
              </h2>
            </div>
            <a href="/products" className="dark-btn">View All & Order →</a>
          </div>
          <div className="grid-3">
            {productCards.map((card, idx) => (
              <a key={card.id + idx} href="/products" className="product-tile">
                <img src={card.image} alt={card.title} />
                <div className="overlay" />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 18 }}>
                  <div style={{ color: teal, fontFamily: "'Agrandir', sans-serif", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 10 }}>{card.subtitle}</div>
                  <div style={{ color: cream, fontFamily: "'Agrandir', sans-serif", fontSize: 24, lineHeight: 1.05, whiteSpace: "pre-line", marginBottom: 12 }}>{card.title}</div>
                  <div style={{ color: "rgba(244,241,234,.72)", fontSize: 12, lineHeight: 1.75, maxWidth: 310, marginBottom: 12 }}>{card.text}</div>
                  <div style={{ color: gold, fontFamily: "'Agrandir', sans-serif", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" }}>{card.tag}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="about" style={{ background: navy, color: cream }}>
        <div className="container site-pad" style={{ padding: "82px 30px" }}>
          <div className="story-grid" style={{ display: "grid", gridTemplateColumns: "1.08fr .92fr", gap: 26, alignItems: "start" }}>
            <div>
              <div className="section-kicker" style={{ marginBottom: 18 }}>Our Story</div>
              <h2 style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 50, lineHeight: 1.04, marginBottom: 10 }}>
                Built on Trust,<br />
                <span className="teal-italic">Driven by Access</span>
              </h2>
              <p style={{ color: "rgba(244,241,234,.72)", fontSize: 14, lineHeight: 1.9, maxWidth: 470, marginBottom: 18 }}>
                Pharma Service Co. was founded in 1984 with a singular mission: to ensure that the right pharmaceutical products reach the right hands across the UAE. Over four decades, we have evolved from a regional distributor into a full-service pharmaceutical partner.
              </p>
              <p style={{ color: "rgba(244,241,234,.72)", fontSize: 14, lineHeight: 1.9, maxWidth: 480 }}>
                Today, we hold a complete UAE pharmaceutical distribution license and MOH import authorization — enabling us to source internationally and distribute locally by air, sea, land, and through tender access into Abu Dhabi-affiliated, Ministry-aligned systems.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div className="stat-box">
                <div style={{ color: gold, fontFamily: "'Agrandir', sans-serif", fontSize: 42, lineHeight: 1, marginBottom: 12 }}>1984</div>
                <div style={{ color: "rgba(244,241,234,.62)", fontSize: 12, lineHeight: 1.7 }}>Year founded under original family ownership</div>
              </div>
              <div className="stat-box">
                <div style={{ color: gold, fontFamily: "'Agrandir', sans-serif", fontSize: 42, lineHeight: 1, marginBottom: 12 }}>UAE+</div>
                <div style={{ color: "rgba(244,241,234,.62)", fontSize: 12, lineHeight: 1.7 }}>Infrastructure that serves clinics and GCC channels</div>
              </div>
              <div className="stat-box">
                <div style={{ color: gold, fontFamily: "'Agrandir', sans-serif", fontSize: 42, lineHeight: 1, marginBottom: 12 }}>40+</div>
                <div style={{ color: "rgba(244,241,234,.62)", fontSize: 12, lineHeight: 1.7 }}>Years of uninterrupted UAE operations</div>
              </div>
              <div className="stat-box">
                <div style={{ color: gold, fontFamily: "'Agrandir', sans-serif", fontSize: 42, lineHeight: 1, marginBottom: 12 }}>100%</div>
                <div style={{ color: "rgba(244,241,234,.62)", fontSize: 12, lineHeight: 1.7 }}>Regulatory-compliant cross-border supply systems</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" style={{ background: cream }}>
        <div className="container site-pad" style={{ padding: "82px 30px" }}>
          <div className="section-kicker" style={{ marginBottom: 18 }}>What We Do</div>
          <h2 style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 52, lineHeight: 1.04, marginBottom: 34 }}>
            Distribution Services<br />
            <span className="teal-italic">Built for the UAE Market</span>
          </h2>
          <div className="services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 20 }}>
            {services.map((service) => (
              <div key={service.no} style={{ paddingTop: 20, borderTop: "2px solid rgba(23,39,59,.28)" }}>
                <div style={{ color: "rgba(23,39,59,.5)", fontFamily: "'Agrandir', sans-serif", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 18 }}>{service.no}</div>
                <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 24, lineHeight: 1.1, marginBottom: 14 }}>{service.title}</div>
                <div style={{ color: "#556579", fontSize: 13, lineHeight: 1.85 }}>{service.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: teal }}>
        <div className="container site-pad cta-grid" style={{ padding: "78px 30px", display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" }}>
          <div>
            <h2 style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 56, lineHeight: 1.02, color: navy }}>
              <span style={{ background: "rgba(244,241,234,.4)", padding: "0 4px" }}>Ready to partner</span><br />
              with <span className="teal-italic" style={{ color: "rgba(7,22,43,.72)" }}>40 years</span><br />
              of expertise?
            </h2>
          </div>
          <div style={{ display: "grid", gap: 14, justifyItems: "start" }}>
            <a href="/products" className="dark-btn">Browse Products & Order</a>
            <a href="mailto:info@pharmaservice.ae" className="dark-btn" style={{ background: "rgba(7,22,43,.12)", color: navy }}>Email Us</a>
            <div style={{ color: "rgba(7,22,43,.68)", fontSize: 11, lineHeight: 1.9, textTransform: "uppercase", letterSpacing: ".08em" }}>
              Dubai Healthcare City, UAE<br />
              info@pharmaservice.ae<br />
              +971 4 XXX XXXX
            </div>
          </div>
        </div>
      </section>

      <footer id="footer" style={{ background: "#041122", color: cream }}>
        <div className="container site-pad footer-grid" style={{ padding: "44px 30px 36px", display: "grid", gridTemplateColumns: "1fr auto", gap: 24 }}>
          <div>
            <a href="/" style={{ textDecoration: "none", color: cream, display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <img src="/logo.png" alt="Pharma Service Co." style={{ height: 22, width: "auto" }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
              <span style={{ display: "none", fontFamily: "'Agrandir', sans-serif", fontWeight: 700, fontSize: 15 }}>Pharma Service Co.</span>
            </a>
            <div style={{ color: "rgba(244,241,234,.55)", fontSize: 12, lineHeight: 1.8 }}>DHCC pharmaceutical distributor, since 1984, Dubai<br />Arabian Gulf</div>
          </div>
          <div>
            <div style={{ color: gold, fontFamily: "'Agrandir', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 16 }}>Company</div>
            <div style={{ display: "grid", gap: 10 }}>
              <a className="footer-link" href="#about">About Us</a>
              <a className="footer-link" href="#portfolio">View Products</a>
              <a className="footer-link" href="#footer">Contact</a>
              <a className="footer-link" href="/products">Order Products</a>
            </div>
          </div>
        </div>
        <div className="container site-pad" style={{ padding: "14px 30px 22px", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,.06)", color: "rgba(244,241,234,.38)", fontSize: 11 }}>
          <span>© 2026 Pharma Service Co. LLC. All rights reserved.</span>
          <span>Dubai Healthcare City · UAE · MOH Licensed</span>
        </div>
      </footer>
    </div>
  );
}
