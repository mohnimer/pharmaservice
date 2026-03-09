"use client";
import { useEffect, useState } from "react";

const teal = "#00a896";
const gold = "#c9a84c";
const navy = "#0a1628";
const cream = "#f8f5f0";
const mid = "#4a5568";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div style={{ fontFamily:"'Arsenal',sans-serif", color:navy, background:cream }}>
      <link href="https://fonts.googleapis.com/css2?family=Arsenal:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      <style>{`@import url('https://fonts.cdnfonts.com/css/agrandir');
        html{scroll-behavior:smooth}
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeSlide{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        .fade-up{animation:fadeUp 0.7s ease both}
        .nav-link{font-size:13px;font-weight:400;letter-spacing:0.08em;text-transform:uppercase;color:rgba(248,245,240,0.6);text-decoration:none;transition:color 0.2s}
        .nav-link:hover{color:#f8f5f0}
        .service-item{border-top:2px solid #0a1628;padding-top:32px}
        .footer-link{font-family:'Arsenal',sans-serif;font-size:13px;color:rgba(248,245,240,0.4);line-height:2;text-decoration:none;display:block}
        .footer-link:hover{color:#f8f5f0}
        .who-card{padding:32px 28px;transition:all 0.3s}
        .inno-card{padding:48px 44px;transition:transform 0.3s}
        .inno-card:hover{transform:translateY(-4px)}
        .prod-card{background:#0a1628;border:1px solid rgba(248,245,240,0.06);overflow:hidden;transition:border-color 0.3s;height:100%}
        .prod-card:hover{border-color:rgba(0,168,150,0.25)!important}
        @media(max-width:768px){
          .hero-content{padding:40px 24px!important}
          .hero-h1{font-size:32px!important}
          .about-grid{grid-template-columns:1fr!important}
          .about-left{padding:60px 24px 20px!important}
          .about-cards{padding:0 24px 60px!important;grid-template-columns:1fr 1fr!important}
          .products-section{padding:60px 24px!important}
          .products-grid{grid-template-columns:1fr!important}
          .who-grid{grid-template-columns:1fr 1fr!important}
          .inno-grid{grid-template-columns:1fr!important}
          .services-section{padding:60px 24px!important}
          .services-grid{grid-template-columns:1fr!important;gap:24px!important}
          .cta-grid{grid-template-columns:1fr!important;padding:60px 24px!important;text-align:center}
          .cta-buttons{align-items:center!important}
          .footer-grid{grid-template-columns:1fr!important;padding:40px 24px!important}
          .footer-bottom{padding:20px 24px!important;flex-direction:column!important;gap:4px!important}
          nav{padding:16px 20px!important}
          .nav-links-desktop{display:none!important}
          .strip-section{padding:14px 24px!important;flex-wrap:wrap!important;gap:12px 24px!important;justify-content:center!important}
          .section-h2{font-size:30px!important}
          .cta-h2{font-size:30px!important}
          .about-card-num{font-size:36px!important}
          .who-section{padding:60px 24px!important}
          .inno-section{padding:60px 24px!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        padding:"18px 48px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        background: scrolled ? "rgba(10,22,40,0.96)" : "rgba(10,22,40,0.72)",
        backdropFilter:"blur(14px)",
        borderBottom:`1px solid rgba(201,168,76,${scrolled ? 0.2 : 0.07})`,
        transition:"all 0.3s"
      }}>
        <a href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center" }}>
          <img src="/img/psc_logo_2025.png" alt="Pharma Service Co." style={{ height:34, width:"auto", display:"block" }} />
        </a>
        <div className="nav-links-desktop" style={{ display:"flex", gap:36, alignItems:"center" }}>
          <a href="#about" className="nav-link">About</a>
          <a href="#products" className="nav-link">Products</a>
          <a href="#services" className="nav-link">Services</a>
          <a href="#contact" className="nav-link">Contact</a>
          <a href="/products" style={{
            fontFamily:"'Agrandir',sans-serif", fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
            color:navy, background:gold, padding:"10px 24px", textDecoration:"none", transition:"opacity 0.2s"
          }}>Order Now</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
        position:"relative", overflow:"hidden",
        background:"#060d1a",
      }}>
        {/* Layered dark atmosphere */}
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 70% at 50% 55%, rgba(0,168,150,0.07) 0%, transparent 60%),radial-gradient(ellipse 50% 50% at 80% 20%, rgba(201,168,76,0.05) 0%, transparent 55%),radial-gradient(ellipse 40% 60% at 10% 80%, rgba(10,30,60,0.8) 0%, transparent 60%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(248,245,240,0.011) 40px, rgba(248,245,240,0.011) 41px)", pointerEvents:"none" }} />

        <div className="hero-content fade-up" style={{ padding:"120px 80px 100px", maxWidth:920, width:"100%", position:"relative", zIndex:2, textAlign:"center" }}>
          <div style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, letterSpacing:"0.15em", textTransform:"uppercase", color:gold, marginBottom:36, display:"flex", alignItems:"center", justifyContent:"center", gap:16 }}>
            <span style={{ display:"block", width:52, height:1, background:`linear-gradient(to right, transparent, ${gold})`, opacity:0.6 }}></span>
            Established 1984 — Dubai Healthcare City
            <span style={{ display:"block", width:52, height:1, background:`linear-gradient(to left, transparent, ${gold})`, opacity:0.6 }}></span>
          </div>

          <h1 className="hero-h1" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:"clamp(38px, 5.5vw, 64px)", fontWeight:700, lineHeight:1.1, marginBottom:28, color:cream }}>
            Four Decades of<br/>
            <span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400, color:teal }}>Pharmaceutical</span>{" "}Excellence
          </h1>

          <p style={{ fontSize:17, lineHeight:1.8, color:"rgba(248,245,240,0.58)", maxWidth:520, marginBottom:52, marginLeft:"auto", marginRight:"auto" }}>
            Full-spectrum pharmaceutical distribution across the GCC. Licensed importer, registered distributor, and strategic partner to healthcare institutions from Dubai to Abu Dhabi.
          </p>

          <a href="#about" style={{
            fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
            color:navy, background:gold, padding:"17px 44px", textDecoration:"none", display:"inline-block"
          }}>Learn About Us</a>
        </div>
      </section>

      {/* STRIP */}
      <div className="strip-section" style={{ background:gold, padding:"14px 48px", display:"flex", gap:48, alignItems:"center", overflow:"hidden" }}>
        {["Full UAE Distribution License","MOH Import Certified","Government Tender Access","Dubai Healthcare City"].map((t,i) => (
          <div key={i} style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:navy, whiteSpace:"nowrap", display:"flex", gap:10, alignItems:"center" }}>
            <span style={{ fontSize:7, opacity:0.5 }}>◆</span>{t}
          </div>
        ))}
      </div>

      {/* WHO WE SERVE */}
      <section className="who-section" style={{ padding:"100px 80px", background:cream }}>
        <div style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", color:teal, marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ display:"block", width:32, height:1, background:teal }}></span>Who We Serve
        </div>
        <h2 className="section-h2" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:40, fontWeight:700, marginBottom:56, lineHeight:1.2 }}>
          Your supply partner,<br/><span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400, color:teal }}>whoever you are</span>
        </h2>
        <div className="who-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:2 }}>
          {[
            { icon:"🏥", label:"Nursing Homes & Home Care", line:"Reliable institutional supply of continence care and medical consumables. We know your stock cycles." },
            { icon:"💊", label:"Pharmacies", line:"25% off retail, 120-day terms, bonus units on every order. Better margin than your current distributor." },
            { icon:"🦷", label:"Dental Clinics", line:"FittyDent denture care for your patients. Professional supply with clinic pricing and clinical support." },
            { icon:"🏨", label:"Hotels & Wellness", line:"Planta Lax Tea as a guest amenity or spa product. MOH registered, ready for F&B and wellness channels." },
          ].map((w, i) => (
            <div key={i} className="who-card" style={{ background: i % 2 === 0 ? "rgba(10,22,40,0.035)" : "transparent", padding:"32px 28px", borderTop:`2px solid ${i % 2 === 0 ? "rgba(0,168,150,0.2)" : "rgba(201,168,76,0.15)"}` }}>
              <div style={{ fontSize:28, marginBottom:16 }}>{w.icon}</div>
              <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:16, fontWeight:700, color:navy, marginBottom:12, lineHeight:1.3 }}>{w.label}</div>
              <div style={{ fontFamily:"'Arsenal',sans-serif", fontSize:14, lineHeight:1.75, color:mid }}>{w.line}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VALUE-DRIVEN INNOVATION */}
      <section className="inno-section" style={{ padding:"100px 80px", background:navy }}>
        <div style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", color:teal, marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ display:"block", width:32, height:1, background:teal }}></span>Value-Driven Innovation
        </div>
        <h2 className="section-h2" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:40, fontWeight:700, color:cream, marginBottom:56, lineHeight:1.2 }}>
          Our own brands,<br/><span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400, color:teal }}>built for this market</span>
        </h2>
        <div className="inno-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
          <div className="inno-card" style={{ background:"rgba(0,168,150,0.1)", border:"1px solid rgba(0,168,150,0.22)", padding:"48px 44px" }}>
            <div style={{ marginBottom:24 }}>
              <span style={{ fontFamily:"'Agrandir',sans-serif", fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:teal, background:"rgba(0,168,150,0.14)", padding:"6px 14px", display:"inline-block" }}>NIMED™ Trademark</span>
            </div>
            <h3 style={{ fontFamily:"'Agrandir',sans-serif", fontSize:28, fontWeight:700, color:cream, marginBottom:16, lineHeight:1.2 }}>
              NIMED Underpads<br/><span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400, color:teal, fontSize:21 }}>90 × 180 cm</span>
            </h3>
            <p style={{ fontFamily:"'Arsenal',sans-serif", fontSize:15, lineHeight:1.8, color:"rgba(248,245,240,0.62)", marginBottom:28 }}>
              The only full-bed 90×180cm disposable underpad in the UAE market. PSC's proprietary trademark, designed for institutional continence care. Full coverage eliminates lateral leakage — the standard that nursing homes, hospitals, and home healthcare companies have been waiting for.
            </p>
            <div style={{ borderTop:"1px solid rgba(0,168,150,0.18)", paddingTop:20 }}>
              <div style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, letterSpacing:"0.07em", color:"rgba(248,245,240,0.3)" }}>Manufactured in Italy · PSC Exclusive UAE Distribution</div>
            </div>
          </div>

          <div className="inno-card" style={{ background:"rgba(201,168,76,0.09)", border:"1px solid rgba(201,168,76,0.18)", padding:"48px 44px" }}>
            <div style={{ marginBottom:24 }}>
              <span style={{ fontFamily:"'Agrandir',sans-serif", fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:gold, background:"rgba(201,168,76,0.12)", padding:"6px 14px", display:"inline-block" }}>Cosmetic Innovation</span>
            </div>
            <h3 style={{ fontFamily:"'Agrandir',sans-serif", fontSize:28, fontWeight:700, color:cream, marginBottom:16, lineHeight:1.2 }}>
              NIMED Mosquito Duo<br/><span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400, color:gold, fontSize:21 }}>Before & After Bite</span>
            </h3>
            <p style={{ fontFamily:"'Arsenal',sans-serif", fontSize:15, lineHeight:1.8, color:"rgba(248,245,240,0.62)", marginBottom:28 }}>
              A 2-in-1 cosmetic innovation developed with our third-party Italian manufacturer. Eucalyptus and citronella protection before exposure, soothing relief after — in a single 40ml unit. Designed for retail pharmacies, hotels, and outdoor channels across the GCC.
            </p>
            <div style={{ borderTop:"1px solid rgba(201,168,76,0.15)", paddingTop:20 }}>
              <div style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, letterSpacing:"0.07em", color:"rgba(248,245,240,0.3)" }}>Manufactured in Italy · PSC Exclusive UAE Distribution</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="products-section" style={{ padding:"120px 80px", background:`linear-gradient(180deg, #f8f5f0 0%, #f0ece6 100%)` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:64, flexWrap:"wrap", gap:20 }}>
          <div>
            <div style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", color:teal, marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ display:"block", width:32, height:1, background:teal }}></span>Portfolio
            </div>
            <h2 className="section-h2" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:40, fontWeight:700, color:navy, maxWidth:400, lineHeight:1.2 }}>
              Specialized<br/><span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400, color:teal }}>Product Lines</span>
            </h2>
          </div>
          <a href="/products" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:cream, background:navy, padding:"12px 28px", textDecoration:"none" }}>View All & Order →</a>
        </div>
        <div className="products-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:3 }}>
          {[
            { cat:"Continence Care", name:"NIMED Underpads 90×180cm", desc:"The only 90×180cm disposable underpad in the UAE market. Full bed coverage with lateral leak protection — the institutional standard.", tag:"Institutional Supply", img:"/img/pads-1.png" },
            { cat:"Digestive Health", name:"Planta Lax Tea\nMedicinal Herbal Tea", desc:"GMP-certified medicinal herbal tea. MOH Registered. Senna, Chamomile, and Cascara Bark. Retail, wellness, and hospitality channels.", tag:"MOH Registered", img:"/img/tea-1.png" },
            { cat:"Dental Care", name:"FittyDent Denture Care", desc:"Complete denture adhesive and cleaning system. Zinc-free formula, pH-9 cleaning tablets. For dental clinics and prosthodontists.", tag:"Dental Professional", img:"/img/tabs-1.png" },
            { cat:"Protective Care", name:"NIMED Mosquito Duo", desc:"Before & after bite protection in one product. Eucalyptus and citronella formulation. Retail, hospitality, and outdoor distribution.", tag:"Consumer Retail", img:"/img/duo-1.png" },
            { cat:"Dermatology", name:"Amira Honey Milk Soap", desc:"Original formula for sensitive & eczema-prone skin. Paraben-free, sulfate-free. German Naturkosmetik quality.", tag:"Sensitive Skin", img:"/img/soap-1.png" },
            { cat:"Import & Sourcing", name:"Custom Pharmaceutical Import", desc:"MOH import license enables international sourcing. Registered products, unregistered generics, and named patient supply pathways.", tag:"B2B Service", img:null },
          ].map((p, i) => (
            <a key={i} href="/products" style={{ textDecoration:"none", display:"block" }}>
              <div className="prod-card">
                {p.img && (
                  <div style={{ height:160, overflow:"hidden", position:"relative" }}>
                    <img src={p.img} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top", opacity:0.75, filter:"saturate(0.75)" }} />
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, transparent 40%, rgba(10,22,40,0.92) 100%)" }} />
                  </div>
                )}
                {!p.img && (
                  <div style={{ height:80, background:"rgba(201,168,76,0.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontFamily:"'Agrandir',sans-serif", fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:`rgba(201,168,76,0.5)` }}>Custom Service</span>
                  </div>
                )}
                <div style={{ padding:"24px 26px 30px" }}>
                  <div style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:teal, marginBottom:10 }}>{p.cat}</div>
                  <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:17, fontWeight:700, color:cream, marginBottom:10, lineHeight:1.3, whiteSpace:"pre-line" }}>{p.name}</div>
                  <div style={{ fontSize:13, lineHeight:1.65, color:"rgba(248,245,240,0.5)", marginBottom:18 }}>{p.desc}</div>
                  <span style={{ display:"inline-block", fontSize:10, padding:"4px 11px", border:"1px solid rgba(201,168,76,0.28)", color:gold, letterSpacing:"0.05em" }}>{p.tag}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="about-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", background:navy, color:cream }}>
        <div className="about-left" style={{ padding:"120px 60px 120px 80px" }}>
          <div style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", color:teal, marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ display:"block", width:32, height:1, background:teal }}></span>Our Story
          </div>
          <h2 className="section-h2" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:40, fontWeight:700, lineHeight:1.2, marginBottom:28 }}>
            Built on Trust,<br/><span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400, color:teal }}>Driven by Access</span>
          </h2>
          <p style={{ fontSize:15, lineHeight:1.8, color:"rgba(248,245,240,0.62)", marginBottom:16 }}>
            Pharma Service Co. was founded in 1984 with a singular mission: to ensure that the right pharmaceutical products reach the right hands across the UAE. Over four decades, we have evolved from a regional distributor into a full-service pharmaceutical partner.
          </p>
          <p style={{ fontSize:15, lineHeight:1.8, color:"rgba(248,245,240,0.62)" }}>
            Today, we hold a complete UAE pharmaceutical distribution license and MOH import authorization — enabling us to source internationally and distribute locally at scale, including government tenders through our Abu Dhabi affiliate, MediServ Agencies.
          </p>
        </div>
        <div className="about-cards" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2, padding:"120px 80px 120px 60px", alignContent:"center" }}>
          {[
            { num:"1984", label:"Year founded, under original family ownership" },
            { num:"UAE+", label:"Distribution reach across Emirates and GCC" },
            { num:"40+", label:"Years of uninterrupted UAE operations" },
            { num:"100%", label:"Regulatory compliance across all operations" },
          ].map((c, i) => (
            <div key={i} style={{ background: (i===1||i===2) ? "rgba(248,245,240,0.07)" : "rgba(248,245,240,0.03)", border:"1px solid rgba(248,245,240,0.06)", padding:"32px 28px" }}>
              <div className="about-card-num" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:44, fontWeight:700, color:gold, marginBottom:8 }}>{c.num}</div>
              <div style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, color:"rgba(248,245,240,0.42)", lineHeight:1.5 }}>{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="services-section" style={{ padding:"120px 80px", background:cream, color:navy }}>
        <div style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", color:teal, marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ display:"block", width:32, height:1, background:teal }}></span>What We Do
        </div>
        <h2 className="section-h2" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:40, fontWeight:700, marginBottom:64, lineHeight:1.2 }}>
          Distribution Services<br/><span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400, color:teal }}>Built for the UAE Market</span>
        </h2>
        <div className="services-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:40 }}>
          {[
            { num:"01", title:"Pharmaceutical Distribution", desc:"Full UAE distribution across retail pharmacies, hospitals, clinics, and institutional buyers. Licensed for both government and private sector supply." },
            { num:"02", title:"Government Tender Access", desc:"Through MediServ Agencies in Abu Dhabi, we maintain active access to government procurement channels across the Emirates." },
            { num:"03", title:"International Import & Sourcing", desc:"MOH import license enables us to source from Europe, India, and GCC markets — including named patient import pathways for specialty medications." },
          ].map((s, i) => (
            <div key={i} className="service-item">
              <div style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, letterSpacing:"0.08em", color:teal, marginBottom:20 }}>{s.num}</div>
              <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:22, fontWeight:700, marginBottom:16 }}>{s.title}</div>
              <div style={{ fontFamily:"'Arsenal',sans-serif", fontSize:14, lineHeight:1.7, color:mid }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="cta-grid" style={{ padding:"120px 80px", background:teal, display:"grid", gridTemplateColumns:"1fr auto", alignItems:"center", gap:60 }}>
        <div>
          <h2 className="cta-h2" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:44, fontWeight:700, color:navy, lineHeight:1.2 }}>
            Ready to partner<br/>with <span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400, opacity:0.6 }}>40 years</span><br/>of expertise?
          </h2>
        </div>
        <div className="cta-buttons" style={{ display:"flex", flexDirection:"column", gap:12, alignItems:"flex-start" }}>
          <a href="/products" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:cream, background:navy, padding:"18px 40px", textDecoration:"none", whiteSpace:"nowrap" }}>Browse Products & Order</a>
          <a href="mailto:info@pharmaservice.ae" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:navy, background:"rgba(10,22,40,0.15)", padding:"18px 40px", textDecoration:"none", whiteSpace:"nowrap" }}>Email Us</a>
          <div style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:13, color:"rgba(10,22,40,0.5)", lineHeight:2, marginTop:8 }}>
            Dubai Healthcare City, UAE<br/>
            pharmaservice.ae<br/>
            License: MOH Distribution + Import
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-grid" style={{ background:"#060e1a", padding:"60px 80px", display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:60, borderTop:"1px solid rgba(248,245,240,0.05)" }}>
        <div>
          <a href="/" style={{ display:"block", marginBottom:18, textDecoration:"none" }}>
            <img src="/img/psc_logo_2025.png" alt="Pharma Service Co." style={{ height:38, width:"auto", display:"block" }} />
          </a>
          <p style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:13, color:"rgba(248,245,240,0.32)", lineHeight:1.7, maxWidth:280 }}>UAE pharmaceutical distribution, since 1984. Dubai Healthcare City.</p>
        </div>
        <div>
          <h4 style={{ fontFamily:"'Agrandir',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:gold, marginBottom:20 }}>Company</h4>
          <a href="#about" className="footer-link">About Us</a>
          <a href="#services" className="footer-link">Distribution Services</a>
          <a href="#contact" className="footer-link">Contact</a>
          <a href="/products" className="footer-link">Order Products</a>
        </div>
      </footer>
      <div className="footer-bottom" style={{ background:"#060e1a", padding:"20px 80px", borderTop:"1px solid rgba(248,245,240,0.04)", display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, color:"rgba(248,245,240,0.18)" }}>© 2026 Pharma Service Co. LLC. All rights reserved.</span>
        <span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, color:"rgba(248,245,240,0.18)" }}>Dubai Healthcare City · UAE · MOH Licensed</span>
      </div>
    </div>
  );
}
