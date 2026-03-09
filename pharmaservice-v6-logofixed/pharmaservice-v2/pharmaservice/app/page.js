"use client";
import { useEffect, useState } from "react";

const C = {
  navy: "#0a1628", navyMid: "#0f1f3d", cream: "#f8f5f0",
  teal: "#00a896", tealDark: "#007d6e", gold: "#c9a84c",
  mid: "#4a5568", mute: "rgba(248,245,240,0.45)",
};

const css = `
  @import url('https://fonts.cdnfonts.com/css/agrandir');
  html { scroll-behavior: smooth; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.navy}; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
  .fu { animation: fadeUp 0.7s ease both; }
  .nl { font-size:12px; letter-spacing:0.1em; text-transform:uppercase; color:${C.mute}; text-decoration:none; font-family:'Arsenal',sans-serif; transition:color 0.2s; }
  .nl:hover { color:${C.cream}; }
  .pcard { background:rgba(248,245,240,0.03); border:1px solid rgba(248,245,240,0.06); padding:32px 28px; transition:all 0.3s; cursor:pointer; position:relative; overflow:hidden; text-decoration:none; display:block; }
  .pcard::before { content:''; position:absolute; top:0; left:0; width:3px; height:0; background:${C.teal}; transition:height 0.4s; }
  .pcard:hover { background:rgba(248,245,240,0.05); border-color:rgba(0,168,150,0.25); }
  .pcard:hover::before { height:100%; }
  .acard { padding:28px; }
  .sitem { border-top:2px solid rgba(248,245,240,0.08); padding-top:28px; }
  .flink { font-size:13px; color:rgba(248,245,240,0.35); text-decoration:none; display:block; line-height:2.2; font-family:'Arsenal',sans-serif; transition:color 0.2s; }
  .flink:hover { color:${C.cream}; }
  .pill { display:inline-block; font-size:10px; padding:4px 12px; border:1px solid rgba(201,168,76,0.3); color:${C.gold}; letter-spacing:0.06em; font-family:'Arsenal',sans-serif; }
  .audience-card { border:1px solid rgba(248,245,240,0.07); padding:28px 24px; transition:all 0.3s; }
  .audience-card:hover { background:rgba(248,245,240,0.04); border-color:rgba(0,168,150,0.2); }
  .order-cta { background:${C.gold}; color:${C.navy}; font-family:'Agrandir',sans-serif; font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:14px 32px; text-decoration:none; display:inline-block; transition:background 0.2s; }
  .order-cta:hover { background:#b8962e; }
  .ghost-cta { font-family:'Arsenal',sans-serif; font-style:italic; font-size:14px; color:${C.mute}; text-decoration:none; transition:color 0.2s; }
  .ghost-cta:hover { color:${C.cream}; }

  @media(max-width:768px) {
    .hero-grid { grid-template-columns:1fr !important; }
    .hero-stats { display:none !important; }
    .hero-pad { padding:40px 24px 60px !important; }
    .strip { padding:12px 20px !important; flex-wrap:wrap; gap:14px 20px !important; justify-content:center !important; }
    .about-grid { grid-template-columns:1fr !important; }
    .about-pad { padding:60px 24px !important; }
    .about-cards { grid-template-columns:1fr 1fr !important; padding:0 24px 60px !important; }
    .products-section { padding:60px 24px !important; }
    .pgrid { grid-template-columns:1fr !important; }    .audience-grid { grid-template-columns:1fr 1fr !important; gap:8px !important; }
    .services-pad { padding:60px 24px !important; }
    .sgrid { grid-template-columns:1fr !important; gap:32px !important; }
    .cta-pad { padding:60px 24px !important; }
    .cta-grid { grid-template-columns:1fr !important; gap:40px !important; }
    .footer-pad { padding:48px 24px !important; grid-template-columns:1fr !important; gap:40px !important; }
    .footer-bottom { padding:16px 24px !important; flex-direction:column !important; gap:4px !important; }
    nav { padding:14px 20px !important; }
    .nav-desk { display:none !important; }
    .hero-h1 { font-size:34px !important; }
    .sec-h2 { font-size:30px !important; }
  }
`;

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const audiences = [
    { icon:"🏥", title:"Retail Pharmacies", desc:"Counter display products that move. 25% margin, 120-day terms, bi-weekly restocking. No risk to you." },
    { icon:"🛏", title:"Nursing Homes & Home Healthcare", desc:"Institutional-grade underpads, digestive health, and consumables. Bulk pricing, direct delivery." },
    { icon:"🦷", title:"Dental Clinics", desc:"FittyDent denture care system. Zinc-free, pH-balanced. Recommend by name, patients return monthly." },
    { icon:"🏨", title:"Hotels & Corporate Wellness", desc:"PlantaLax for spa amenities and wellness packages. MOH registered. Premium positioning." },
  ];

  return (
    <div style={{ fontFamily:"'Arsenal',sans-serif", color:C.cream, background:C.navy }}>
      <link href="https://fonts.googleapis.com/css2?family=Arsenal:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      <style>{css}</style>

      {/* NAV */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, padding:"18px 48px", display:"flex", justifyContent:"space-between", alignItems:"center", background: scrolled ? "rgba(10,22,40,0.97)" : "rgba(10,22,40,0.7)", backdropFilter:"blur(16px)", borderBottom:`1px solid rgba(201,168,76,${scrolled?0.2:0.08})`, transition:"all 0.3s" }}>
        <a href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center" }}>
          <img src="/img/psc_logo_2025.png" alt="Pharma Service" style={{ height:52, width:"auto", objectFit:"contain" }} />
        </a>
        <div className="nav-desk" style={{ display:"flex", gap:32, alignItems:"center" }}>
          <a href="#about" className="nl">About</a>
          <a href="#products" className="nl">Products</a>
          <a href="#services" className="nl">Services</a>
          <a href="#contact" className="nl">Contact</a>
          <a href="/products" className="order-cta" style={{ padding:"10px 24px", fontSize:12 }}>Order Now</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-grid" style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"3fr 2fr", paddingTop:80, position:"relative", overflow:"hidden", background:C.navy }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 90% at 75% 50%, rgba(0,168,150,0.07) 0%, transparent 65%), radial-gradient(ellipse 50% 60% at 5% 90%, rgba(201,168,76,0.05) 0%, transparent 60%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:0, left:"60%", width:1, height:"100%", background:"linear-gradient(to bottom, transparent 5%, rgba(201,168,76,0.15) 30%, rgba(201,168,76,0.15) 70%, transparent 95%)", pointerEvents:"none" }} />

        {/* LEFT */}
        <div className="hero-pad fu" style={{ padding:"100px 60px 100px 80px", display:"flex", flexDirection:"column", justifyContent:"center", position:"relative", zIndex:2 }}>
          <div style={{ fontStyle:"italic", fontSize:12, letterSpacing:"0.14em", textTransform:"uppercase", color:C.gold, marginBottom:28, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ display:"block", width:36, height:1, background:C.gold }}></span>
            Established 1984 · Dubai Healthcare City
          </div>
          <h1 className="hero-h1" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:"clamp(38px, 4.5vw, 62px)", fontWeight:700, lineHeight:1.1, marginBottom:24, color:C.cream }}>
            The UAE's Most<br/>
            <span style={{ color:C.teal, fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400 }}>Trusted</span> Pharma<br/>
            Distributor
          </h1>
          <p style={{ fontSize:16, lineHeight:1.8, color:C.mute, maxWidth:460, marginBottom:20 }}>
            40 years of pharmaceutical distribution in the UAE. MOH licensed importer. Full distribution across pharmacies, hospitals, nursing homes, and dental clinics.
          </p>

          {/* Trust signals inline */}
          <div style={{ display:"flex", gap:24, marginBottom:40, flexWrap:"wrap" }}>
            {[["25%","Base Discount"],["120","Day Terms"],["6","Products in Stock"],["40+","Years Active"]].map(([v,l]) => (
              <div key={l}>
                <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:22, fontWeight:700, color:C.gold, lineHeight:1 }}>{v}</div>
                <div style={{ fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", color:C.mute, marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
            <a href="/products" className="order-cta">Browse Products & Order</a>
            <a href="#about" className="ghost-cta">Learn about us →</a>
          </div>
        </div>

        {/* RIGHT — credential stats */}
        <div className="hero-stats" style={{ display:"flex", flexDirection:"column", justifyContent:"center", padding:"100px 60px 100px 20px", gap:0, position:"relative", zIndex:2 }}>
          {[
            { label:"Regulatory Status", value:"MOH Licensed", sub:"Full import + distribution" },
            { label:"Serving Since", value:"1984", sub:"Family-owned, UAE-rooted" },
            { label:"Coverage", value:"UAE + GCC", sub:"Dubai · Abu Dhabi · Beyond" },
            { label:"Import Capability", value:"Europe · India · GCC", sub:"Named patient & commercial import" },
          ].map((s, i) => (
            <div key={i} style={{ padding:"20px 24px", borderBottom:"1px solid rgba(248,245,240,0.05)", transition:"background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(248,245,240,0.03)"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              <div style={{ fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(248,245,240,0.35)", marginBottom:5 }}>{s.label}</div>
              <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:20, fontWeight:700, color:C.cream, marginBottom:3 }}>{s.value}</div>
              <div style={{ fontSize:12, fontStyle:"italic", color:C.mute }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GOLD STRIP */}
      <div className="strip" style={{ background:C.gold, padding:"13px 48px", display:"flex", gap:40, alignItems:"center", overflow:"hidden" }}>
        {["Full UAE Distribution License","MOH Import Authorized","Government Tender Access","Dubai Healthcare City HQ","40 Years of Pharmaceutical Excellence"].map((t,i) => (
          <div key={i} style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.navy, whiteSpace:"nowrap", display:"flex", gap:10, alignItems:"center", flexShrink:0 }}>
            <span style={{ fontSize:6, opacity:0.4 }}>◆</span>{t}
          </div>
        ))}
      </div>

      {/* WHO WE SERVE */}
      <section style={{ padding:"100px 80px", background:"#080f1e" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ fontStyle:"italic", fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", color:C.teal, marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ display:"block", width:32, height:1, background:C.teal }}></span>Who We Serve
          </div>
          <h2 className="sec-h2" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:38, fontWeight:700, lineHeight:1.2, marginBottom:16, color:C.cream }}>
            Built for Every<br/><span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400, color:C.teal }}>Healthcare Channel</span>
          </h2>
          <p style={{ fontSize:15, color:C.mute, lineHeight:1.8, maxWidth:520, marginBottom:56 }}>Whether you're a retail pharmacy, nursing home, dental clinic or hotel spa — we have products, terms and logistics built for your operation.</p>
          <div className="audience-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {audiences.map((a,i) => (
              <div key={i} className="audience-card">
                <div style={{ fontSize:28, marginBottom:16 }}>{a.icon}</div>
                <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:16, fontWeight:700, color:C.cream, marginBottom:10, lineHeight:1.3 }}>{a.title}</div>
                <div style={{ fontSize:13, color:C.mute, lineHeight:1.7 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="about-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", background:C.cream, color:C.navy }}>
        <div className="about-pad" style={{ padding:"100px 60px 100px 80px" }}>
          <div style={{ fontStyle:"italic", fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", color:C.teal, marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ display:"block", width:32, height:1, background:C.teal }}></span>Our Story
          </div>
          <h2 className="sec-h2" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:38, fontWeight:700, lineHeight:1.2, marginBottom:24 }}>
            40 Years in the UAE.<br/><span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400, color:C.teal }}>Still Growing.</span>
          </h2>
          <p style={{ fontSize:15, lineHeight:1.85, color:C.mid, marginBottom:16 }}>
            Pharma Service Co. was founded in 1984 — when Dubai's healthcare infrastructure was still being built. We grew with it. From a regional distributor to a full-service pharmaceutical partner operating across the UAE and GCC.
          </p>
          <p style={{ fontSize:15, lineHeight:1.85, color:C.mid, marginBottom:16 }}>
            We hold a complete UAE pharmaceutical distribution license and MOH import authorization. Through our sister company MediServ Agencies in Abu Dhabi, we access government tender procurement across all Emirates.
          </p>
          <p style={{ fontSize:15, lineHeight:1.85, color:C.mid }}>
            Today we operate across pharmacies, hospitals, nursing homes, dental clinics, hotels and home healthcare companies — with the same mission we've always had: get the right product to the right place, on the right terms.
          </p>
        </div>
        <div className="about-cards" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2, padding:"100px 80px 100px 40px", alignContent:"center" }}>
          {[
            { num:"1984", label:"Founded under family ownership in Dubai" },
            { num:"2", label:"Licensed entities — Dubai & Abu Dhabi" },
            { num:"6", label:"European health brands currently in stock" },
            { num:"100%", label:"Regulatory compliance across all operations" },
          ].map((c,i) => (
            <div key={i} style={{ background: i%2===0 ? C.navy : C.navyMid, padding:"32px 24px", color:C.cream }}>
              <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:42, fontWeight:700, color:C.gold, marginBottom:8 }}>{c.num}</div>
              <div style={{ fontStyle:"italic", fontSize:12, color:"rgba(248,245,240,0.45)", lineHeight:1.5 }}>{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="products-section" style={{ padding:"100px 80px", background:C.navy }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:56, flexWrap:"wrap", gap:20 }}>
            <div>
              <div style={{ fontStyle:"italic", fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", color:C.teal, marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ display:"block", width:32, height:1, background:C.teal }}></span>Portfolio
              </div>
              <h2 className="sec-h2" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:38, fontWeight:700, color:C.cream, lineHeight:1.2 }}>
                Specialized<br/><span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400, color:C.teal }}>Product Lines</span>
              </h2>
            </div>
            <a href="/products" className="order-cta">View All & Order →</a>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

            {/* PlantaLax Banner */}
            <a href="https://www.plantalax.com" target="_blank" rel="noopener" style={{ textDecoration:"none", display:"block", position:"relative", borderRadius:12, overflow:"hidden", background:"linear-gradient(135deg, #0d2b1e 0%, #0a1e15 60%, #07140e 100%)", border:"1px solid rgba(0,168,150,0.2)", minHeight:320, transition:"all 0.3s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,168,150,0.5)";e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 16px 48px rgba(0,168,150,0.15)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(0,168,150,0.2)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
              {/* Background texture */}
              <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 80% 50%, rgba(0,168,150,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />
              {/* Product image */}
              <div style={{ position:"absolute", right:-10, bottom:0, height:"85%", display:"flex", alignItems:"flex-end" }}>
                <img src="/img/tea-1.png" style={{ height:"100%", width:"auto", objectFit:"contain", objectPosition:"bottom", filter:"drop-shadow(0 8px 24px rgba(0,0,0,0.4))" }} alt="PlantaLax Tea" />
              </div>
              {/* Content */}
              <div style={{ position:"relative", zIndex:2, padding:"36px 32px", maxWidth:"60%" }}>
                <div style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:C.teal, marginBottom:12, fontStyle:"italic" }}>Digestive Health</div>
                <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:28, fontWeight:700, color:C.cream, lineHeight:1.15, marginBottom:12 }}>PlantaLax<br/>Herbal Tea</div>
                <div style={{ fontSize:13, color:"rgba(248,245,240,0.55)", lineHeight:1.7, marginBottom:24 }}>GMP-certified. MOH Registered. Senna, Chamomile & Cascara Bark.</div>
                <div style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:C.teal }}>
                  plantalax.com <span style={{ fontSize:14 }}>→</span>
                </div>
                <div style={{ marginTop:16 }}>
                  <span style={{ display:"inline-block", fontSize:10, padding:"4px 12px", border:"1px solid rgba(0,168,150,0.4)", color:C.teal, letterSpacing:"0.06em", borderRadius:2 }}>MOH #1890-2547-1-C</span>
                </div>
              </div>
            </a>

            {/* FittyDent Banner */}
            <a href="https://www.fittydent.ae" target="_blank" rel="noopener" style={{ textDecoration:"none", display:"block", position:"relative", borderRadius:12, overflow:"hidden", background:"linear-gradient(135deg, #0a1e2e 0%, #071525 60%, #040d18 100%)", border:"1px solid rgba(201,168,76,0.2)", minHeight:320, transition:"all 0.3s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,0.5)";e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 16px 48px rgba(201,168,76,0.1)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,0.2)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
              <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 80% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />
              {/* Product image */}
              <div style={{ position:"absolute", right:-10, bottom:0, height:"85%", display:"flex", alignItems:"flex-end" }}>
                <img src="/img/tabs-1.png" style={{ height:"100%", width:"auto", objectFit:"contain", objectPosition:"bottom", filter:"drop-shadow(0 8px 24px rgba(0,0,0,0.4))" }} alt="FittyDent" />
              </div>
              {/* Content */}
              <div style={{ position:"relative", zIndex:2, padding:"36px 32px", maxWidth:"60%" }}>
                <div style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:C.gold, marginBottom:12, fontStyle:"italic" }}>Dental Care</div>
                <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:28, fontWeight:700, color:C.cream, lineHeight:1.15, marginBottom:12 }}>FittyDent<br/>Denture Care</div>
                <div style={{ fontSize:13, color:"rgba(248,245,240,0.55)", lineHeight:1.7, marginBottom:24 }}>Complete adhesive & cleaning system. Zinc-free. pH-9 formula.</div>
                <div style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:C.gold }}>
                  fittydent.ae <span style={{ fontSize:14 }}>→</span>
                </div>
                <div style={{ marginTop:16 }}>
                  <span style={{ display:"inline-block", fontSize:10, padding:"4px 12px", border:"1px solid rgba(201,168,76,0.4)", color:C.gold, letterSpacing:"0.06em", borderRadius:2 }}>Dental Professional</span>
                </div>
              </div>
            </a>

          </div>
        </div>
      </section>



      {/* SERVICES */}
      <section id="services" className="services-pad" style={{ padding:"100px 80px", background:C.cream, color:C.navy }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ fontStyle:"italic", fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", color:C.teal, marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ display:"block", width:32, height:1, background:C.teal }}></span>What We Do
          </div>
          <h2 className="sec-h2" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:38, fontWeight:700, marginBottom:56, lineHeight:1.2 }}>
            Distribution Services<br/><span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400, color:C.teal }}>Built for the UAE Market</span>
          </h2>
          <div className="sgrid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:48 }}>
            {[
              { num:"01", title:"Pharmaceutical Distribution", desc:"Full UAE distribution across retail pharmacies, hospitals, nursing homes, dental clinics, and home healthcare companies. MOH licensed, fully compliant." },
              { num:"02", title:"Government Tender Access", desc:"Registered and active for government procurement channels across the UAE — SEHA, DHA, and MOH tenders." },
              { num:"03", title:"International Import & Sourcing", desc:"MOH import license enables us to source from Europe, India, and GCC. Named patient import pathways for specialty and biologic medications." },
            ].map((s,i) => (
              <div key={i} className="sitem">
                <div style={{ fontStyle:"italic", fontSize:12, letterSpacing:"0.08em", color:C.teal, marginBottom:16 }}>{s.num}</div>
                <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:20, fontWeight:700, marginBottom:14, color:C.navy }}>{s.title}</div>
                <div style={{ fontSize:14, lineHeight:1.75, color:C.mid }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="cta-pad" style={{ padding:"100px 80px", background:C.navy }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div className="cta-grid" style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:80, alignItems:"center" }}>
            <div>
              <div style={{ fontStyle:"italic", fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", color:C.gold, marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ display:"block", width:32, height:1, background:C.gold }}></span>Get Started
              </div>
              <h2 style={{ fontFamily:"'Agrandir',sans-serif", fontSize:"clamp(32px,3.5vw,52px)", fontWeight:700, color:C.cream, lineHeight:1.15, marginBottom:20 }}>
                Ready to partner with<br/>
                <span style={{ fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", fontWeight:400, color:C.teal }}>40 years of expertise</span>?
              </h2>
              <p style={{ fontSize:15, color:C.mute, lineHeight:1.8, maxWidth:480 }}>Browse our full product catalogue, select your quantities, and send your order directly via WhatsApp. No paperwork, no meetings required to get started.</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12, minWidth:240 }}>
              <a href="/products" className="order-cta" style={{ textAlign:"center", padding:"18px 40px" }}>Browse Products & Order</a>
              <a href="mailto:info@pharmaservice.ae" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:C.cream, background:"rgba(248,245,240,0.06)", padding:"18px 40px", textDecoration:"none", textAlign:"center", transition:"background 0.2s", border:"1px solid rgba(248,245,240,0.1)" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(248,245,240,0.1)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(248,245,240,0.06)"}>
                Email Us Directly
              </a>
              <div style={{ fontStyle:"italic", fontSize:12, color:"rgba(248,245,240,0.3)", lineHeight:2, marginTop:4 }}>
                Dubai Healthcare City, UAE<br/>
                pharmaservice.ae<br/>
                MOH Distribution + Import License
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-pad" style={{ background:"#050c18", padding:"60px 80px", display:"grid", gridTemplateColumns:"1.5fr 1fr 1fr", gap:60, borderTop:"1px solid rgba(248,245,240,0.04)" }}>
        <div>
          <img src="/img/psc_logo_2025.png" alt="Pharma Service" style={{ height:44, width:"auto", objectFit:"contain", marginBottom:16 }} />
          <p style={{ fontStyle:"italic", fontSize:13, color:"rgba(248,245,240,0.3)", lineHeight:1.8, maxWidth:240, marginBottom:20 }}>UAE pharmaceutical distribution since 1984. Dubai Healthcare City. MOH Licensed.</p>
        </div>
        <div>
          <h4 style={{ fontFamily:"'Agrandir',sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:C.gold, marginBottom:20 }}>Products</h4>
          {["NIMED Underpads XL","PlantaLax Herbal Tea","FittyDent Denture Care","NIMED Mosquito Duo","Mosquito Trio Spray","Amira Honey Milk Soap"].map(p => (
            <a key={p} href="/products" className="flink">{p}</a>
          ))}
        </div>
        <div>
          <h4 style={{ fontFamily:"'Agrandir',sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:C.gold, marginBottom:20 }}>Company</h4>
          <a href="#about" className="flink">About Us</a>
          <a href="#services" className="flink">Distribution Services</a>
          <a href="#products" className="flink">Product Portfolio</a>
          <a href="#contact" className="flink">Contact & Partnerships</a>
          <a href="/products" className="flink">Pharmacy Partner Programme</a>
        </div>
      </footer>
      <div className="footer-bottom" style={{ background:"#050c18", padding:"18px 80px", borderTop:"1px solid rgba(248,245,240,0.04)", display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontStyle:"italic", fontSize:11, color:"rgba(248,245,240,0.18)" }}>© 2026 Pharma Service Co. LLC. All rights reserved.</span>
        <span style={{ fontStyle:"italic", fontSize:11, color:"rgba(248,245,240,0.18)" }}>Dubai Healthcare City · UAE · MOH Licensed Distributor</span>
      </div>
    </div>
  );
}
