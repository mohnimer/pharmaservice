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
        .fade-slide{animation:fadeSlide 0.6s ease both}
        .nav-link{font-size:13px;font-weight:400;letter-spacing:0.08em;text-transform:uppercase;color:rgba(248,245,240,0.6);text-decoration:none;transition:color 0.2s}
        .nav-link:hover{color:${cream}}
        .product-card{background:rgba(248,245,240,0.03);border:1px solid rgba(248,245,240,0.06);padding:40px 36px;transition:all 0.3s;cursor:pointer;position:relative;overflow:hidden}
        .product-card::before{content:'';position:absolute;top:0;left:0;width:3px;height:0;background:${teal};transition:height 0.3s}
        .product-card:hover{background:rgba(248,245,240,0.05);border-color:rgba(0,168,150,0.2)}
        .product-card:hover::before{height:100%}
        .stat-row{padding:24px 32px;border:1px solid rgba(248,245,240,0.06);display:grid;grid-template-columns:1fr auto;align-items:center;transition:border-color 0.2s,background 0.2s}
        .stat-row:hover{background:rgba(248,245,240,0.03);border-color:rgba(201,168,76,0.2)}
        .service-item{border-top:2px solid ${navy};padding-top:32px}
        .footer-link{font-family:'Arsenal',sans-serif;font-size:13px;color:rgba(248,245,240,0.4);line-height:2;text-decoration:none;display:block}
        .footer-link:hover{color:${cream}}
        @media(max-width:768px){
          .hero-grid{grid-template-columns:1fr!important}
          .hero-left{padding:40px 24px 20px!important}
          .hero-right{padding:0 24px 40px!important}
          .hero-line{display:none!important}
          .about-grid{grid-template-columns:1fr!important}
          .about-left{padding:60px 24px 20px!important}
          .about-cards{padding:0 24px 60px!important}
          .products-section{padding:60px 24px!important}
          .products-grid{grid-template-columns:1fr!important}
          .services-section{padding:60px 24px!important}
          .services-grid{grid-template-columns:1fr!important;gap:24px!important}
          .cta-grid{grid-template-columns:1fr!important;padding:60px 24px!important;text-align:center}
          .cta-buttons{align-items:center!important}
          .footer-grid{grid-template-columns:1fr!important;padding:40px 24px!important}
          .footer-bottom{padding:20px 24px!important;flex-direction:column!important;gap:4px!important}
          nav{padding:16px 20px!important}
          .nav-links-desktop{display:none!important}
          .strip-section{padding:14px 24px!important;flex-wrap:wrap!important;gap:12px 24px!important;justify-content:center!important}
          .hero-h1{font-size:32px!important}
          .section-h2{font-size:32px!important}
          .cta-h2{font-size:32px!important}
          .about-card-num{font-size:36px!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        padding:"20px 48px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        background: scrolled ? "rgba(10,22,40,0.95)" : "rgba(10,22,40,0.85)",
        backdropFilter:"blur(12px)",
        borderBottom:`1px solid rgba(201,168,76,${scrolled ? 0.2 : 0.1})`,
        transition:"all 0.3s"
      }}>
        <a href="/" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:18, fontWeight:700, color:cream, textDecoration:"none" }}>
          Pharma Service<span style={{ color:gold }}>.</span>
        </a>
        <div className="nav-links-desktop" style={{ display:"flex", gap:36, alignItems:"center" }}>
          <a href="#about" className="nav-link">About</a>
          <a href="#products" className="nav-link">Products</a>
          <a href="#services" className="nav-link">Services</a>
          <a href="#contact" className="nav-link">Contact</a>
          <a href="/products" style={{
            fontFamily:"'Agrandir',sans-serif", fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
            color:navy, background:gold, padding:"10px 24px", textDecoration:"none", transition:"background 0.2s"
          }}>Order Now</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-grid" style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr", paddingTop:100, position:"relative", overflow:"hidden", background:navy }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 80% at 80% 50%, rgba(0,168,150,0.08) 0%, transparent 70%),radial-gradient(ellipse 40% 60% at 10% 80%, rgba(201,168,76,0.05) 0%, transparent 60%)", pointerEvents:"none" }} />
        <div className="hero-line" style={{ position:"absolute", top:0, left:"50%", width:1, height:"100%", background:"linear-gradient(to bottom, transparent, rgba(201,168,76,0.2) 30%, rgba(201,168,76,0.2) 70%, transparent)", pointerEvents:"none" }} />

        <div className="hero-left fade-up" style={{ padding:"80px 60px 80px 80px", display:"flex", flexDirection:"column", justifyContent:"center", position:"relative", zIndex:2 }}>
          <div style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", color:gold, marginBottom:32, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ display:"block", width:40, height:1, background:gold }}></span>
            Established 1984 — Dubai Healthcare City
          </div>

          <h1 className="hero-h1" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:"clamp(36px, 4vw, 54px)", fontWeight:700, lineHeight:1.15, marginBottom:28, color:cream }}>
            Four Decades of<br/>
            <span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400, color:teal }}>Pharmaceutical</span><br/>
            Excellence in the UAE
          </h1>

          <p style={{ fontSize:16, lineHeight:1.7, color:"rgba(248,245,240,0.65)", maxWidth:420, marginBottom:48 }}>
            Full-spectrum pharmaceutical distribution across the GCC. Licensed importer, registered distributor, and strategic partner to healthcare institutions from Dubai to Abu Dhabi.
          </p>

          <div style={{ display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
            <a href="/products" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:navy, background:gold, padding:"14px 32px", textDecoration:"none" }}>Our Products</a>
            <a href="#contact" style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:13, color:"rgba(248,245,240,0.6)", textDecoration:"none", display:"flex", alignItems:"center", gap:8 }}>
              Partner with us →
            </a>
          </div>
        </div>

        <div className="hero-right" style={{ padding:"80px 80px 80px 60px", display:"flex", flexDirection:"column", justifyContent:"center", position:"relative", zIndex:2, gap:2 }}>
          {[
            { label:"In Operation", value:"40+ Years", icon:"🏛" },
            { label:"Regulatory Status", value:"MOH Licensed", icon:"✓" },
            { label:"Coverage", value:"UAE + GCC", icon:"🌍" },
            { label:"Import Markets", value:"Europe, India, GCC", icon:"📦" },
          ].map((s, i) => (
            <div key={i} className="stat-row fade-slide" style={{ animationDelay:`${i*0.1+0.1}s` }}>
              <div>
                <div style={{ fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(248,245,240,0.4)", marginBottom:6 }}>{s.label}</div>
                <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:26, fontWeight:700, color:cream }}>{s.value}</div>
              </div>
              <div style={{ fontSize:32, opacity:0.3 }}>{s.icon}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STRIP */}
      <div className="strip-section" style={{ background:gold, padding:"14px 48px", display:"flex", gap:48, alignItems:"center", overflow:"hidden" }}>
        {["Full UAE Distribution License","MOH Import Certified","Government Tender Access","Dubai Healthcare City","MediServ Agencies · Abu Dhabi"].map((t,i) => (
          <div key={i} style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:navy, whiteSpace:"nowrap", display:"flex", gap:10, alignItems:"center" }}>
            <span style={{ fontSize:7, opacity:0.5 }}>◆</span>{t}
          </div>
        ))}
      </div>

      {/* ABOUT */}
      <section id="about" className="about-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", background:cream, color:navy }}>
        <div className="about-left" style={{ padding:"120px 60px 120px 80px" }}>
          <div style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", color:teal, marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ display:"block", width:32, height:1, background:teal }}></span>Our Story
          </div>
          <h2 className="section-h2" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:40, fontWeight:700, lineHeight:1.2, marginBottom:28 }}>
            Built on Trust,<br/><span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400, color:teal }}>Driven by Access</span>
          </h2>
          <p style={{ fontSize:15, lineHeight:1.8, color:mid, marginBottom:16 }}>
            Pharma Service Co. was founded in 1984 with a singular mission: to ensure that the right pharmaceutical products reach the right hands across the UAE. Over four decades, we have evolved from a regional distributor into a full-service pharmaceutical partner.
          </p>
          <p style={{ fontSize:15, lineHeight:1.8, color:mid }}>
            Today, we hold a complete UAE pharmaceutical distribution license and MOH import authorization — enabling us to source internationally and distribute locally at scale, including government tenders through our Abu Dhabi affiliate, MediServ Agencies.
          </p>
        </div>
        <div className="about-cards" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2, padding:"120px 80px 120px 60px", alignContent:"center" }}>
          {[
            { num:"1984", label:"Year founded, under original family ownership" },
            { num:"UAE+", label:"Distribution reach across Emirates and GCC" },
            { num:"2", label:"Licensed entities — Dubai & Abu Dhabi" },
            { num:"100%", label:"Regulatory compliance across all operations" },
          ].map((c, i) => (
            <div key={i} style={{ background: (i===1||i===2) ? "rgba(10,22,40,0.85)" : navy, padding:"32px 28px", color:cream }}>
              <div className="about-card-num" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:44, fontWeight:700, color:gold, marginBottom:8 }}>{c.num}</div>
              <div style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, color:"rgba(248,245,240,0.5)", lineHeight:1.5 }}>{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="products-section" style={{ padding:"120px 80px", background:navy }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:64, flexWrap:"wrap", gap:20 }}>
          <div>
            <div style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", color:teal, marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ display:"block", width:32, height:1, background:teal }}></span>Portfolio
            </div>
            <h2 className="section-h2" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:40, fontWeight:700, color:cream, maxWidth:400, lineHeight:1.2 }}>
              Specialized<br/><span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400, color:teal }}>Product Lines</span>
            </h2>
          </div>
          <a href="/products" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:navy, background:gold, padding:"12px 28px", textDecoration:"none" }}>View All & Order →</a>
        </div>
        <div className="products-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:2 }}>
          {[
            { cat:"Continence Care", name:"NIMED Underpads 90×180cm", desc:"The only 90×180cm disposable underpad in the UAE market. Full bed coverage with lateral leak protection — the institutional standard.", tag:"Institutional Supply" },
            { cat:"Digestive Health", name:"PlantaLax Herbal Tea", desc:"GMP-certified herbal digestive tea. MOH Registered. Senna, Chamomile, and Cascara Bark. Retail, wellness, and hospitality channels.", tag:"MOH Registered" },
            { cat:"Dental Care", name:"FittyDent Denture Care", desc:"Complete denture adhesive and cleaning system. Zinc-free formula, pH-9 cleaning tablets. For dental clinics and prosthodontists.", tag:"Dental Professional" },
            { cat:"Protective Care", name:"NIMED Mosquito Duo", desc:"Before & after bite protection in one product. Eucalyptus and citronella formulation. Retail, hospitality, and outdoor distribution.", tag:"Consumer Retail" },
            { cat:"Dermatology", name:"Amira Honey Milk Soap", desc:"Original formula for sensitive & eczema-prone skin. Paraben-free, sulfate-free. German Naturkosmetik quality.", tag:"Sensitive Skin" },
            { cat:"Import & Sourcing", name:"Custom Pharmaceutical Import", desc:"MOH import license enables international sourcing. Registered products, unregistered generics, and named patient supply pathways.", tag:"B2B Service" },
          ].map((p, i) => (
            <a key={i} href="/products" style={{ textDecoration:"none" }}>
              <div className="product-card">
                <div style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:teal, marginBottom:16 }}>{p.cat}</div>
                <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:20, fontWeight:700, color:cream, marginBottom:16, lineHeight:1.3 }}>{p.name}</div>
                <div style={{ fontSize:14, lineHeight:1.6, color:"rgba(248,245,240,0.5)", marginBottom:24 }}>{p.desc}</div>
                <span style={{ display:"inline-block", fontSize:11, padding:"5px 12px", border:"1px solid rgba(201,168,76,0.3)", color:gold, letterSpacing:"0.05em" }}>{p.tag}</span>
              </div>
            </a>
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
      <footer className="footer-grid" style={{ background:"#060e1a", padding:"60px 80px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:60, borderTop:"1px solid rgba(248,245,240,0.05)" }}>
        <div>
          <a href="/" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:20, fontWeight:700, color:cream, textDecoration:"none", display:"block", marginBottom:16 }}>Pharma Service<span style={{ color:gold }}>.</span></a>
          <p style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:13, color:"rgba(248,245,240,0.35)", lineHeight:1.7, maxWidth:220 }}>UAE pharmaceutical distribution, since 1984. Dubai Healthcare City.</p>
        </div>
        <div>
          <h4 style={{ fontFamily:"'Agrandir',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:gold, marginBottom:20 }}>Products</h4>
          {["NIMED Underpads","PlantaLax Tea","FittyDent","NIMED Mosquito","Amira Soap"].map(p => (
            <a key={p} href="/products" className="footer-link">{p}</a>
          ))}
        </div>
        <div>
          <h4 style={{ fontFamily:"'Agrandir',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:gold, marginBottom:20 }}>Company</h4>
          <a href="#about" className="footer-link">About Us</a>
          <a href="#services" className="footer-link">Distribution Services</a>
          <a href="#contact" className="footer-link">Contact</a>
          <p style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:13, color:"rgba(248,245,240,0.25)", marginTop:8 }}>Sister: MediServ Agencies, Abu Dhabi</p>
        </div>
      </footer>
      <div className="footer-bottom" style={{ background:"#060e1a", padding:"20px 80px", borderTop:"1px solid rgba(248,245,240,0.04)", display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, color:"rgba(248,245,240,0.2)" }}>© 2026 Pharma Service Co. LLC. All rights reserved.</span>
        <span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontSize:12, color:"rgba(248,245,240,0.2)" }}>Dubai Healthcare City · UAE · MOH Licensed</span>
      </div>
    </div>
  );
}
