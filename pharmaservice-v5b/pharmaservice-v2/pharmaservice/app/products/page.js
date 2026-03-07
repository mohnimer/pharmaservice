"use client";
import { useState, useRef, useEffect } from "react";
import { PRODUCTS, BONUS } from "../../components/products";
import { CUSTOMERS } from "../../components/customers";

const C = {
  navy: "#0a1628", navyMid: "#0f1f3d", navyLight: "#13274a",
  cream: "#f8f5f0", teal: "#00a896", tealDark: "#007d6e",
  tealLight: "rgba(0,168,150,0.12)", gold: "#c9a84c",
  sub: "rgba(248,245,240,0.55)", mute: "rgba(248,245,240,0.35)",
  line: "rgba(248,245,240,0.08)", lineLight: "rgba(248,245,240,0.05)",
  // Portal (light) colours
  bg: "#f4f6f8", white: "#ffffff", ink: "#0f1923", inkMid: "#3d4f5c",
  inkMute: "#8a9baa", border: "#dde3e9", tealP: "#00a896",
};

const portalCss = `
  @import url('https://fonts.cdnfonts.com/css/agrandir');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ---- PORTAL GATE ---- */
  .portal-wrap {
    min-height: 100vh;
    background: ${C.bg};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Arsenal', sans-serif;
    padding: 24px;
  }
  .portal-card {
    background: ${C.white};
    border: 1px solid ${C.border};
    border-radius: 16px;
    padding: 48px 44px;
    width: 100%;
    max-width: 460px;
    box-shadow: 0 4px 32px rgba(0,0,0,0.06);
  }
  @media(max-width: 480px) {
    .portal-card { padding: 32px 24px; }
  }
  .portal-logo {
    height: 36px;
    width: auto;
    object-fit: contain;
    margin-bottom: 32px;
    display: block;
  }
  .portal-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${C.inkMute};
    margin-bottom: 6px;
    display: block;
  }
  .portal-input {
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid ${C.border};
    border-radius: 8px;
    font-size: 15px;
    font-family: 'Arsenal', sans-serif;
    color: ${C.ink};
    background: ${C.white};
    transition: border-color 0.15s, box-shadow 0.15s;
    outline: none;
    margin-bottom: 16px;
  }
  .portal-input:focus {
    border-color: ${C.tealP};
    box-shadow: 0 0 0 3px rgba(0,168,150,0.1);
  }
  .portal-input::placeholder { color: ${C.inkMute}; }
  .portal-suggest {
    position: absolute;
    top: 100%;
    left: 0; right: 0;
    background: ${C.white};
    border: 1.5px solid ${C.border};
    border-top: none;
    border-radius: 0 0 8px 8px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 50;
    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  }
  .portal-suggest-item {
    padding: 11px 16px;
    cursor: pointer;
    border-bottom: 1px solid ${C.border};
    transition: background 0.1s;
  }
  .portal-suggest-item:hover { background: #f0f9f8; }
  .portal-submit {
    width: 100%;
    padding: 15px;
    background: ${C.tealP};
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    font-family: 'Arsenal', sans-serif;
    cursor: pointer;
    transition: background 0.15s;
    margin-top: 4px;
  }
  .portal-submit:hover { background: ${C.tealDark}; }
  .portal-submit:disabled {
    background: ${C.border};
    color: ${C.inkMute};
    cursor: default;
  }

  /* ---- PRODUCTS PORTAL ---- */
  body { background: ${C.navy}; }
  .page { min-height: 100vh; background: ${C.navy}; font-family: 'Arsenal', sans-serif; color: ${C.cream}; }

  @media(min-width:900px) {
    .main-layout { display: grid; grid-template-columns: 1fr 320px; gap: 0; max-width: 1180px; margin: 0 auto; padding: 28px 28px 60px; align-items: start; }
    .product-col { padding-right: 24px; }
    .sidebar { position: sticky; top: 88px; }
    .mob-bar { display: none !important; }
    .tab-bar { display: none !important; }
    .hdr-inner { max-width: 1180px; padding: 0 28px; }
    .pgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .mob-only { display: none !important; }
    .desk-title { display: block !important; }
  }
  @media(max-width:899px) {
    .main-layout { padding: 12px 12px 100px; }
    .sidebar { display: none !important; }
    .pgrid { display: block; }
    .hdr-inner { padding: 0 16px; }
    .desk-title { display: none !important; }
  }

  .pcard { background: rgba(248,245,240,0.03); border: 1px solid rgba(248,245,240,0.08); border-radius: 8px; overflow: hidden; margin-bottom: 12px; transition: all 0.25s; }
  .pcard:hover { background: rgba(248,245,240,0.05); border-color: rgba(0,168,150,0.25); }

  .bbonus { flex:1; padding:10px 4px; border-radius:7px; cursor:pointer; text-align:center; transition:all 0.15s; border:1px solid rgba(248,245,240,0.08); background:rgba(248,245,240,0.04); }
  .bbonus:hover { border-color:${C.teal}; background:${C.tealLight}; }
  .bbonus.active { background:${C.teal}; border-color:${C.teal}; }
  .bbonus.active .bn, .bbonus.active .bp { color:#fff !important; }
  .bbonus.active .bs { color:rgba(255,255,255,0.65) !important; }

  .add-btn { width:100%; padding:13px; background:${C.teal}; color:#fff; border:none; border-radius:7px; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; cursor:pointer; transition:background 0.15s; font-family:'Arsenal',sans-serif; }
  .add-btn:hover { background:${C.tealDark}; }
  .add-btn.added { background:rgba(248,245,240,0.08); border:1px solid rgba(248,245,240,0.12); color:${C.cream}; }
  .add-btn:disabled { background:rgba(248,245,240,0.06); color:rgba(248,245,240,0.35); cursor:default; }

  .wa-btn { display:flex; align-items:center; justify-content:center; gap:8px; background:${C.teal}; color:#fff; border-radius:7px; padding:14px; font-size:12px; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; text-decoration:none; width:100%; transition:background 0.15s; font-family:'Arsenal',sans-serif; }
  .wa-btn:hover { background:${C.tealDark}; }

  .p-input { background: rgba(248,245,240,0.06) !important; color: ${C.cream} !important; border: 1px solid rgba(248,245,240,0.1) !important; border-radius: 7px; padding: 11px 14px; width: 100%; font-size: 13px; font-family: 'Arsenal', sans-serif; transition: border-color 0.15s; outline: none; }
  .p-input::placeholder { color: rgba(248,245,240,0.3) !important; }
  .p-input:focus { border-color: ${C.teal} !important; }

  .thumb-btn { transition: all 0.15s; }
  .thumb-btn:hover { opacity: 1 !important; }

  @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .fade-in { animation: fadeIn 0.4s ease both; }
`;

// ─── Portal Gate ─────────────────────────────────────────────────────────────
function PortalGate({ onEnter }) {
  const [pharmacyInput, setPharmacyInput] = useState("");
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowSuggest(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = pharmacyInput.length >= 2
    ? CUSTOMERS.filter(c => c.n.toLowerCase().includes(pharmacyInput.toLowerCase())).slice(0, 10)
    : [];

  const canSubmit = (selectedPharmacy || pharmacyInput.trim().length >= 3) && contactName.trim().length >= 2;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onEnter({
      pharmacyName: selectedPharmacy ? selectedPharmacy.n : pharmacyInput.trim(),
      pharmacyDetails: selectedPharmacy,
      contactName: contactName.trim(),
      contactNumber: contactNumber.trim(),
    });
  };

  return (
    <div className="portal-wrap">
      <div className="portal-card fade-in">
        {/* Logo */}
        <img src="/img/psc_logo_2025.png" alt="Pharma Service" className="portal-logo" />

        {/* Heading */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily:"'Agrandir',sans-serif", fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 6, lineHeight: 1.2 }}>
            Pharmacy Partner Portal
          </h1>
          <p style={{ fontSize: 14, color: C.inkMid, lineHeight: 1.6 }}>
            Enter your details to access our current offers, pricing, and bonus structure.
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: C.border, marginBottom: 24 }} />

        {/* Pharmacy name */}
        <div ref={ref} style={{ position: "relative", marginBottom: 0 }}>
          <label className="portal-label">Pharmacy Name</label>
          <input
            className="portal-input"
            placeholder="e.g. Al Zahrawi Pharmacy"
            value={selectedPharmacy ? selectedPharmacy.n : pharmacyInput}
            onChange={e => { setPharmacyInput(e.target.value); setSelectedPharmacy(null); setShowSuggest(true); }}
            onFocus={() => setShowSuggest(true)}
            autoComplete="off"
          />
          {showSuggest && filtered.length > 0 && (
            <div className="portal-suggest">
              {filtered.map((c, i) => (
                <div key={i} className="portal-suggest-item" onClick={() => { setSelectedPharmacy(c); setPharmacyInput(c.n); setShowSuggest(false); }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{c.n}</div>
                  <div style={{ fontSize: 12, color: C.inkMute, marginTop: 2 }}>{c.c}{c.a ? ` — ${c.a}` : ""}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact name */}
        <label className="portal-label">Your Name</label>
        <input
          className="portal-input"
          placeholder="Contact person"
          value={contactName}
          onChange={e => setContactName(e.target.value)}
        />

        {/* Contact number */}
        <label className="portal-label">Mobile Number <span style={{ color: C.inkMute, fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional)</span></label>
        <input
          className="portal-input"
          placeholder="+971 50 000 0000"
          value={contactNumber}
          onChange={e => setContactNumber(e.target.value)}
          type="tel"
        />

        <button className="portal-submit" disabled={!canSubmit} onClick={handleSubmit}>
          Access Offers →
        </button>

        <p style={{ fontSize: 12, color: C.inkMute, textAlign: "center", marginTop: 16, lineHeight: 1.6, fontStyle: "italic" }}>
          Your details are used solely to personalise your order and for our team to follow up.
        </p>
      </div>

      <div style={{ marginTop: 24, fontSize: 12, color: C.inkMute, textAlign: "center", fontFamily:"'Arsenal',sans-serif", fontStyle:"italic" }}>
        © 2026 Pharma Service Co. LLC · Dubai Healthcare City
      </div>
    </div>
  );
}

// ─── Gallery ─────────────────────────────────────────────────────────────────
function ProductGallery({ images }) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) return null;
  return (
    <div>
      <div style={{ position:"relative", background:"rgba(248,245,240,0.04)", overflow:"hidden" }}>
        <img src={images[idx]} style={{ width:"100%", height:220, objectFit:"contain", display:"block", padding:"16px" }} alt="" />
        {images.length > 1 && idx > 0 && (
          <button onClick={()=>setIdx(idx-1)} style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", background:"rgba(10,22,40,0.8)", border:`1px solid rgba(248,245,240,0.1)`, color:C.cream, width:30, height:30, borderRadius:"50%", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
        )}
        {images.length > 1 && idx < images.length-1 && (
          <button onClick={()=>setIdx(idx+1)} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"rgba(10,22,40,0.8)", border:`1px solid rgba(248,245,240,0.1)`, color:C.cream, width:30, height:30, borderRadius:"50%", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>›</button>
        )}
      </div>
      {images.length > 1 && (
        <div style={{ display:"flex", gap:5, padding:"6px 10px", borderTop:`1px solid rgba(248,245,240,0.06)`, background:"rgba(248,245,240,0.02)" }}>
          {images.map((img,i) => (
            <button key={i} className="thumb-btn" onClick={()=>setIdx(i)} style={{ width:48, height:48, borderRadius:5, border: i===idx?`2px solid ${C.teal}`:`1px solid rgba(248,245,240,0.08)`, padding:2, cursor:"pointer", background:"rgba(248,245,240,0.04)", opacity:i===idx?1:0.45, flexShrink:0 }}>
              <img src={img} style={{ width:"100%", height:"100%", objectFit:"contain" }} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ p, selectedTier, setTier }) {
  const [expanded, setExpanded] = useState(false);
  const tier = selectedTier ? BONUS.find(b => b.label === selectedTier) : null;
  const isAdded = !!selectedTier;

  return (
    <div className="pcard">
      <div style={{ position:"relative" }}>
        <ProductGallery images={p.gallery} />
        <span style={{ position:"absolute", top:10, left:10, background:"rgba(10,22,40,0.85)", backdropFilter:"blur(8px)", padding:"3px 10px", borderRadius:4, fontSize:10, fontStyle:"italic", color:C.teal }}>{p.cat}</span>
        <span style={{ position:"absolute", top:10, right:10, background:"rgba(10,22,40,0.85)", backdropFilter:"blur(8px)", padding:"3px 10px", borderRadius:4, fontSize:9, letterSpacing:"0.08em", textTransform:"uppercase", color:C.sub }}>{p.origin}</span>
        {isAdded && <div style={{ position:"absolute", bottom:10, right:10, background:C.teal, color:"#fff", borderRadius:20, padding:"3px 10px", fontSize:10, fontWeight:700 }}>✓ In Order</div>}
      </div>
      <div style={{ padding:"14px 16px 0" }}>
        <h3 style={{ fontFamily:"'Agrandir',sans-serif", fontSize:15, fontWeight:700, color:C.cream, textTransform:"uppercase", letterSpacing:"0.03em", marginBottom:4 }}>{p.name}</h3>
        <div style={{ fontSize:12, fontStyle:"italic", color:C.teal, marginBottom:8 }}>{p.tagline}</div>
        <div style={{ fontSize:12, color:C.sub, lineHeight:1.65, marginBottom:10 }}>{p.desc}</div>
        <button onClick={()=>setExpanded(!expanded)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.cream, marginBottom:expanded?8:14, padding:0, fontFamily:"'Arsenal',sans-serif" }}>
          <span style={{ display:"block", width:14, height:1.5, background:C.teal }}></span>
          Why Stock This <span style={{ color:C.teal, fontSize:10, marginLeft:2 }}>{expanded?"▲":"▼"}</span>
        </button>
        {expanded && (
          <div style={{ marginBottom:14 }}>
            {p.why.map((w,i) => <div key={i} style={{ fontSize:12, color:C.sub, lineHeight:1.6, marginBottom:4, paddingLeft:14, position:"relative" }}><span style={{ position:"absolute", left:0, color:C.teal, fontWeight:700 }}>·</span>{w}</div>)}
          </div>
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", background:"rgba(248,245,240,0.03)", borderTop:`1px solid rgba(248,245,240,0.06)`, borderBottom:`1px solid rgba(248,245,240,0.06)`, padding:"10px 16px" }}>
        {[
          { label:"Retail", value:`${p.retail} AED`, color:C.cream },
          { label:tier?"Your price":"Price (25% off)", value:`${tier?(tier.buy*p.buyPrice/tier.total).toFixed(2):p.buyPrice.toFixed(2)} AED`, color:C.gold },
          { label:"Profit/unit", value:`${tier?(p.retail-(tier.buy*p.buyPrice/tier.total)).toFixed(2):p.profit.toFixed(2)} AED`, color:C.teal },
        ].map((item,i) => (
          <div key={i} style={{ textAlign:i===0?"left":i===1?"center":"right" }}>
            <div style={{ fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:C.mute, marginBottom:3 }}>{item.label}</div>
            <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:14, fontWeight:700, color:item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:"12px 16px 16px" }}>
        <div style={{ fontSize:11, color:C.mute, marginBottom:8, fontStyle:"italic" }}>Select pack size — bigger order = lower cost per unit</div>
        <div style={{ display:"flex", gap:4, marginBottom:10 }}>
          {BONUS.map(b => {
            const active = selectedTier === b.label;
            return (
              <button key={b.label} className={`bbonus${active?" active":""}`} onClick={()=>setTier(active?null:b.label)}>
                <div className="bn" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700, lineHeight:1, color:C.cream }}>{b.label}</div>
                <div className="bs" style={{ fontSize:9, color:C.mute, marginTop:3 }}>{(b.buy*p.buyPrice/b.total).toFixed(2)}/u</div>
                <div className="bp" style={{ fontSize:9, color:C.teal, fontWeight:600, marginTop:1 }}>+{(p.retail-(b.buy*p.buyPrice/b.total)).toFixed(2)}</div>
              </button>
            );
          })}
        </div>

        {tier ? (
          <div style={{ background:C.tealLight, border:`1px solid rgba(0,168,150,0.3)`, borderRadius:7, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.cream }}>{tier.total} units <span style={{ fontStyle:"italic", fontWeight:400, color:C.teal }}>({tier.free} free)</span></div>
              <div style={{ fontSize:11, color:C.sub, marginTop:1 }}>Buy {tier.buy}, get {tier.free} free</div>
            </div>
            <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:18, fontWeight:700, color:C.gold }}>{(tier.buy*p.buyPrice).toFixed(2)} <span style={{ fontSize:10, fontWeight:400, color:C.mute }}>AED</span></div>
          </div>
        ) : (
          <div style={{ background:"rgba(248,245,240,0.03)", border:`1px dashed rgba(248,245,240,0.08)`, borderRadius:7, padding:"10px 14px", marginBottom:10, textAlign:"center" }}>
            <div style={{ fontSize:12, color:C.mute, fontStyle:"italic" }}>Select a pack size above to add to your order</div>
          </div>
        )}

        <button className={`add-btn${isAdded?" added":""}`} onClick={()=>isAdded?setTier(null):null} disabled={!tier&&!isAdded}>
          {isAdded?`✓ Added — ${selectedTier} (tap to remove)`:tier?"Add to Order →":"Select a quantity first"}
        </button>
      </div>
    </div>
  );
}

// ─── Order Panel ──────────────────────────────────────────────────────────────
function OrderPanel({ orders, orderItems, totalQty, totalFree, totalAED, visitor, generateWhatsApp }) {
  return (
    <div style={{ background:C.navyMid, borderRadius:10, border:`1px solid rgba(248,245,240,0.08)`, overflow:"hidden" }}>
      <div style={{ background:"rgba(248,245,240,0.04)", borderBottom:`1px solid rgba(248,245,240,0.08)`, padding:"16px 18px" }}>
        <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700, color:C.cream, letterSpacing:"0.06em", textTransform:"uppercase" }}>Your Order</div>
        {visitor && <div style={{ fontSize:11, color:C.teal, marginTop:2, fontStyle:"italic" }}>{visitor.pharmacyName}</div>}
        {totalQty>0 && <div style={{ fontSize:11, color:C.mute, marginTop:1 }}>{orderItems.length} product{orderItems.length!==1?"s":""} · {totalQty} units ({totalFree} free)</div>}
      </div>
      <div style={{ padding:"16px 18px" }}>
        {orderItems.length===0 ? (
          <div style={{ textAlign:"center", padding:"28px 0" }}>
            <div style={{ fontSize:28, marginBottom:10 }}>🛒</div>
            <div style={{ fontSize:13, color:C.mute, fontStyle:"italic", lineHeight:1.6 }}>Select a pack size on any product to start your order</div>
          </div>
        ) : (
          <>
            {orderItems.map(p => {
              const tier = BONUS.find(b=>b.label===orders[p.id]);
              if (!tier) return null;
              return (
                <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:10, marginBottom:10, borderBottom:`1px solid rgba(248,245,240,0.06)` }}>
                  <div style={{ flex:1, paddingRight:8 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:C.cream, lineHeight:1.3 }}>{p.name}</div>
                    <div style={{ fontSize:11, color:C.teal, marginTop:2 }}>{tier.label}: {tier.total} units ({tier.free} free)</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:14, fontWeight:700, color:C.gold }}>{(tier.buy*p.buyPrice).toFixed(2)}</div>
                    <div style={{ fontSize:9, color:C.mute }}>AED</div>
                  </div>
                </div>
              );
            })}
            <div style={{ background:"rgba(248,245,240,0.03)", borderRadius:7, padding:"12px 14px", marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:12, color:C.mute }}>Payment</span>
                <span style={{ fontSize:12, fontWeight:700, color:C.teal }}>120 days</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:8, borderTop:`1px solid rgba(248,245,240,0.06)` }}>
                <span style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700, color:C.cream }}>Total</span>
                <span style={{ fontFamily:"'Agrandir',sans-serif", fontSize:20, fontWeight:700, color:C.gold }}>{totalAED.toFixed(2)} AED</span>
              </div>
            </div>
            <a href={generateWhatsApp()} target="_blank" rel="noopener" className="wa-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.325 0-4.47-.744-6.228-2.007l-.253-.19-3.448 1.156 1.156-3.448-.19-.253A9.952 9.952 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              Send Order via WhatsApp
            </a>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Terms Panel ──────────────────────────────────────────────────────────────
function TermsPanel() {
  return (
    <div>
      <div style={{ background:C.navyMid, borderRadius:10, border:`1px solid rgba(248,245,240,0.08)`, padding:"20px", marginBottom:10 }}>
        <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:17, fontWeight:700, color:C.cream, marginBottom:4 }}>25% Base Discount</div>
        <div style={{ fontSize:12, fontStyle:"italic", color:C.teal, marginBottom:10 }}>Flat across all six products</div>
        <div style={{ fontSize:13, color:C.sub, lineHeight:1.7 }}>Every product priced at 75% of retail. Guaranteed margin from day one. 5% more than any other distributor in the market.</div>
      </div>
      <div style={{ background:C.navyMid, borderRadius:10, border:`1px solid rgba(248,245,240,0.08)`, padding:"20px", marginBottom:10 }}>
        <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:17, fontWeight:700, color:C.cream, marginBottom:4 }}>Bonus Structure</div>
        <div style={{ fontSize:12, fontStyle:"italic", color:C.teal, marginBottom:12 }}>Free units on every order</div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {BONUS.map(b => (
            <div key={b.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(248,245,240,0.04)", borderRadius:7, padding:"10px 14px", border:`1px solid rgba(248,245,240,0.06)` }}>
              <span style={{ fontFamily:"'Agrandir',sans-serif", fontSize:16, fontWeight:700, color:C.cream }}>{b.label}</span>
              <span style={{ fontSize:12, color:C.sub }}>Buy {b.buy}, get <span style={{ color:C.teal, fontWeight:700, fontStyle:"italic" }}>{b.free} free</span> = {b.total} units</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:C.teal, borderRadius:10, padding:"24px 20px" }}>
        <div style={{ fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", opacity:0.7, marginBottom:6 }}>Payment Terms</div>
        <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:52, fontWeight:700, lineHeight:1, color:C.navy }}>120</div>
        <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:17, fontWeight:700, color:C.navy, marginBottom:12 }}>Day Credit Terms</div>
        <div style={{ fontSize:13, lineHeight:1.7, color:"rgba(10,22,40,0.65)", marginBottom:16 }}>Zero upfront. Zero deposit. Zero risk. Display stands and bi-weekly restocking visits included.</div>
        <div style={{ height:1, background:"rgba(10,22,40,0.15)", marginBottom:16 }} />
        <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:14, fontWeight:700, color:C.navy, marginBottom:10 }}>Settle early? Get rewarded.</div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {[["30 days","5% cash discount"],["60 days","3% discount + priority restock"],["90 days","Bonus units + preferred pricing"]].map(([d,r]) => (
            <div key={d} style={{ background:"rgba(10,22,40,0.1)", borderRadius:7, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700, color:C.navy }}>{d}</span>
              <span style={{ fontSize:12, color:"rgba(10,22,40,0.65)", fontStyle:"italic" }}>{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Page() {
  const [visitor, setVisitor] = useState(null);
  const [tab, setTab] = useState("catalogue");
  const [orders, setOrders] = useState({});

  const setTier = (id, tier) => setOrders(prev => ({ ...prev, [id]: tier }));
  const orderItems = PRODUCTS.filter(p => orders[p.id]);

  const calcOrder = () => {
    let tq=0, tf=0, ta=0;
    orderItems.forEach(p => {
      const tier = BONUS.find(b => b.label === orders[p.id]);
      if (tier) { tq += tier.total; tf += tier.free; ta += tier.buy * p.buyPrice; }
    });
    return { totalQty: tq, totalFree: tf, totalAED: ta };
  };
  const { totalQty, totalFree, totalAED } = calcOrder();

  const generateWhatsApp = () => {
    let msg = `*New Order — Pharma Service Co.*\n`;
    if (visitor) {
      msg += `Pharmacy: ${visitor.pharmacyName}\n`;
      if (visitor.pharmacyDetails) msg += `${visitor.pharmacyDetails.c}${visitor.pharmacyDetails.a ? ` — ${visitor.pharmacyDetails.a}` : ""}\n`;
      msg += `Contact: ${visitor.contactName}`;
      if (visitor.contactNumber) msg += ` · ${visitor.contactNumber}`;
      msg += `\n`;
    }
    msg += `\n`;
    orderItems.forEach(p => {
      const tier = BONUS.find(b => b.label === orders[p.id]);
      if (tier) msg += `${p.name}: ${tier.label} (${tier.buy} + ${tier.free} free = ${tier.total}) = ${(tier.buy*p.buyPrice).toFixed(2)} AED\n`;
    });
    msg += `\n*Total: ${totalQty} units (${totalFree} free) — ${totalAED.toFixed(2)} AED*\nPayment: 120-day credit terms`;
    return `https://wa.me/971553511335?text=${encodeURIComponent(msg)}`;
  };

  const tabs = [
    { id:"catalogue", l:"Products" },
    { id:"order", l: `Order${totalQty > 0 ? ` (${totalQty})` : ""}` },
    { id:"terms", l:"Terms" },
  ];

  // ── Show gate if no visitor ──────────────────────────────────────────────
  if (!visitor) {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Arsenal:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <style>{portalCss}</style>
        <PortalGate onEnter={setVisitor} />
      </>
    );
  }

  // ── Show portal ──────────────────────────────────────────────────────────
  return (
    <div className="page fade-in">
      <link href="https://fonts.googleapis.com/css2?family=Arsenal:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      <style>{portalCss}</style>

      {/* HEADER */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:"rgba(10,22,40,0.97)", backdropFilter:"blur(16px)", borderBottom:`1px solid rgba(248,245,240,0.07)` }}>
        <div className="hdr-inner" style={{ margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0 10px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <a href="/" style={{ display:"flex", alignItems:"center", textDecoration:"none" }}>
                <img src="/img/psc_logo_2025.png" alt="Pharma Service" style={{ height:36, width:"auto", objectFit:"contain", filter:"brightness(0) invert(1)" }} />
              </a>
              <div style={{ width:1, height:28, background:"rgba(248,245,240,0.1)" }} />
              <div>
                <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700, color:C.cream, lineHeight:1 }}>
                  Welcome, {visitor.pharmacyName}
                </div>
                <div style={{ fontSize:11, color:C.teal, fontStyle:"italic", marginTop:2 }}>{visitor.contactName}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <div style={{ textAlign:"center", background:"rgba(248,245,240,0.06)", border:`1px solid rgba(248,245,240,0.08)`, borderRadius:6, padding:"5px 14px" }}>
                <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:16, fontWeight:700, color:C.teal, lineHeight:1 }}>25%</div>
                <div style={{ fontSize:9, color:C.mute, marginTop:2, fontStyle:"italic" }}>Discount</div>
              </div>
              <div style={{ textAlign:"center", background:"rgba(248,245,240,0.06)", border:`1px solid rgba(248,245,240,0.08)`, borderRadius:6, padding:"5px 14px" }}>
                <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:16, fontWeight:700, color:C.teal, lineHeight:1 }}>120</div>
                <div style={{ fontSize:9, color:C.mute, marginTop:2, fontStyle:"italic" }}>Day Terms</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE TABS */}
      <div className="tab-bar" style={{ background:"rgba(10,22,40,0.98)", borderBottom:`1px solid rgba(248,245,240,0.07)`, position:"sticky", top:64, zIndex:90 }}>
        <div style={{ display:"flex" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, padding:"12px 8px", fontSize:11, fontWeight:tab===t.id?700:400, letterSpacing:"0.07em", textTransform:"uppercase", color:tab===t.id?C.cream:C.mute, background:"none", border:"none", borderBottom:tab===t.id?`2px solid ${C.teal}`:"2px solid transparent", cursor:"pointer", fontFamily:"'Arsenal',sans-serif" }}>{t.l}</button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="main-layout">
        <div className="product-col">
          <div className="desk-title" style={{ display:"none", marginBottom:24 }}>
            <div style={{ fontSize:11, fontStyle:"italic", color:C.teal, marginBottom:6, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ display:"block", width:18, height:1, background:C.teal }}></span>Pharmacy Partner Programme
            </div>
            <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:22, fontWeight:700, color:C.cream }}>Current Offers</div>
            <div style={{ fontSize:12, fontStyle:"italic", color:C.mute, marginTop:2 }}>Updated March 4th, 2026 · Available to approved partners only.</div>
          </div>

          {tab === "catalogue" && (
            <>
              <div className="mob-only" style={{ marginBottom:16 }}>
                <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:18, fontWeight:700, color:C.cream }}>Current Offers</div>
                <div style={{ fontSize:12, fontStyle:"italic", color:C.mute, marginTop:2 }}>Available to approved partners only.</div>
              </div>
              <div className="pgrid">
                {PRODUCTS.map(p => <ProductCard key={p.id} p={p} selectedTier={orders[p.id]||null} setTier={t=>setTier(p.id,t)} />)}
              </div>
            </>
          )}
          {tab === "order" && (
            <div style={{ maxWidth:500 }}>
              <div style={{ fontSize:12, fontStyle:"italic", color:C.teal, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ display:"block", width:18, height:1, background:C.teal }}></span>Review & Send Your Order
              </div>
              <OrderPanel orders={orders} orderItems={orderItems} totalQty={totalQty} totalFree={totalFree} totalAED={totalAED} visitor={visitor} generateWhatsApp={generateWhatsApp} />
            </div>
          )}
          {tab === "terms" && <TermsPanel />}
        </div>

        <div className="sidebar">
          <OrderPanel orders={orders} orderItems={orderItems} totalQty={totalQty} totalFree={totalFree} totalAED={totalAED} visitor={visitor} generateWhatsApp={generateWhatsApp} />
          <div style={{ marginTop:10 }}>
            <TermsPanel />
          </div>
        </div>
      </div>

      {/* MOBILE FLOATING BAR */}
      {totalQty > 0 && tab !== "order" && (
        <div className="mob-bar" onClick={()=>setTab("order")} style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(10,22,40,0.98)", backdropFilter:"blur(16px)", borderTop:`1px solid rgba(248,245,240,0.08)`, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", zIndex:100, cursor:"pointer" }}>
          <div>
            <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700, color:C.cream }}>{orderItems.length} product{orderItems.length!==1?"s":""} · {totalQty} units <span style={{ fontStyle:"italic", fontWeight:400, color:C.teal }}>({totalFree} free)</span></div>
            <div style={{ fontSize:11, color:C.mute, fontStyle:"italic" }}>Tap to review & send order</div>
          </div>
          <div style={{ background:C.teal, color:"#fff", borderRadius:7, padding:"9px 18px", fontFamily:"'Agrandir',sans-serif", fontSize:14, fontWeight:700 }}>{totalAED.toFixed(2)} AED</div>
        </div>
      )}

      <div style={{ textAlign:"center", padding:"16px", fontSize:11, fontStyle:"italic", color:C.mute }}>
        © 2026 Pharma Service Co. LLC · Dubai Healthcare City · pharmaservice.ae
      </div>
    </div>
  );
}
