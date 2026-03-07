"use client";
import { useState, useRef, useEffect } from "react";
import { PRODUCTS, BONUS } from "../../components/products";
import { CUSTOMERS } from "../../components/customers";

const col = {
  bg: "#f5f5f3", card: "#ffffff", ink: "#111111", sub: "#555555",
  mute: "#999999", line: "#e4e2de", teal: "#00a896", gold: "#c9a84c",
  tealLight: "#e8f7f5", tealDark: "#007d6e",
};

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f5f5f3; }
  .page-wrap { display: flex; flex-direction: column; min-height: 100vh; }
  @media (min-width: 900px) {
    .main-layout { display: grid; grid-template-columns: 1fr 340px; gap: 0; max-width: 1200px; margin: 0 auto; width: 100%; padding: 24px 24px 60px; align-items: start; }
    .product-column { padding-right: 24px; }
    .sidebar { position: sticky; top: 80px; }
    .mobile-order-bar { display: none !important; }
    .tab-bar { display: none !important; }
    .header-inner { max-width: 1200px; padding: 0 24px; }
    .products-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .product-card { margin-bottom: 0 !important; }
    .mobile-only { display: none !important; }
  }
  @media (max-width: 899px) {
    .main-layout { padding: 12px 12px 100px; }
    .sidebar { display: none !important; }
    .products-grid { display: block; }
    .header-inner { max-width: 100%; padding: 0 16px; }
    .desktop-section-title { display: none !important; }
  }
  .product-card { background: #fff; border-radius: 10px; overflow: hidden; border: 1px solid #e4e2de; margin-bottom: 14px; transition: box-shadow 0.2s; }
  .product-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
  .bonus-btn { flex: 1; padding: 10px 4px; border-radius: 8px; cursor: pointer; text-align: center; transition: all 0.15s; border: 1.5px solid #e4e2de; background: #f8f8f6; }
  .bonus-btn:hover { border-color: #00a896; background: #e8f7f5; }
  .bonus-btn.active { background: #00a896; border-color: #00a896; }
  .bonus-btn.active .bn { color: #fff !important; }
  .bonus-btn.active .bs { color: rgba(255,255,255,0.7) !important; }
  .bonus-btn.active .bp { color: #fff !important; }
  .add-btn { width: 100%; padding: 13px; background: #00a896; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: background 0.15s; font-family: 'Arsenal', sans-serif; }
  .add-btn:hover { background: #007d6e; }
  .add-btn.added { background: #111; }
  .add-btn:disabled { background: #ccc; cursor: default; }
  .wa-btn { display: flex; align-items: center; justify-content: center; gap: 8px; background: #00a896; color: white; border-radius: 8px; padding: 14px; font-size: 13px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; text-decoration: none; width: 100%; transition: background 0.15s; font-family: 'Arsenal', sans-serif; }
  .wa-btn:hover { background: #007d6e; }
  input:focus { border-color: #00a896 !important; outline: none; }
  .thumb-btn { transition: all 0.15s; }
  .thumb-btn:hover { opacity: 1 !important; border-color: #00a896 !important; }
`;

function ProductGallery({ images }) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) return null;
  return (
    <div>
      <div style={{ position:"relative", background:"#f8f8f6", overflow:"hidden" }}>
        <img src={images[idx]} style={{ width:"100%", height:220, objectFit:"contain", objectPosition:"center", display:"block", padding:"12px" }} alt="" />
        {images.length > 1 && idx > 0 && (
          <button onClick={() => setIdx(idx-1)} style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", background:"rgba(255,255,255,0.95)", border:"1px solid #e4e2de", color:"#111", width:30, height:30, borderRadius:"50%", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
        )}
        {images.length > 1 && idx < images.length-1 && (
          <button onClick={() => setIdx(idx+1)} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"rgba(255,255,255,0.95)", border:"1px solid #e4e2de", color:"#111", width:30, height:30, borderRadius:"50%", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>›</button>
        )}
      </div>
      {images.length > 1 && (
        <div style={{ display:"flex", gap:5, padding:"6px 10px", background:"#f2f2f0", borderTop:"1px solid #e4e2de" }}>
          {images.map((img, i) => (
            <button key={i} className="thumb-btn" onClick={() => setIdx(i)} style={{ width:52, height:52, borderRadius:6, border: i===idx ? "2px solid #00a896" : "2px solid #e4e2de", padding:2, cursor:"pointer", background:"#fff", opacity: i===idx ? 1 : 0.5, flexShrink:0 }}>
              <img src={img} style={{ width:"100%", height:"100%", objectFit:"contain" }} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PharmacySearch({ value, onChange, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);
  const filtered = search.length >= 2 ? CUSTOMERS.filter(c => c.n.toLowerCase().includes(search.toLowerCase())).slice(0, 12) : [];
  return (
    <div ref={ref} style={{ position:"relative" }}>
      <input value={value || search} onChange={e => { setSearch(e.target.value); onChange(""); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="Start typing pharmacy name..."
        style={{ width:"100%", padding:"11px 14px", border:"1px solid #e4e2de", borderRadius:7, fontSize:14, fontFamily:"'Arsenal',sans-serif", background:"#fff", color:"#111", transition:"border-color 0.15s" }} />
      {open && filtered.length > 0 && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:50, background:"#fff", border:"1px solid #e4e2de", borderTop:"none", borderRadius:"0 0 7px 7px", maxHeight:220, overflowY:"auto", boxShadow:"0 8px 24px rgba(0,0,0,0.08)" }}>
          {filtered.map((c, i) => (
            <div key={i} onClick={() => { onSelect(c); setSearch(c.n); setOpen(false); }} style={{ padding:"10px 14px", cursor:"pointer", borderBottom:"1px solid #e4e2de" }}
              onMouseEnter={e => e.currentTarget.style.background="#f5f5f2"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              <div style={{ fontSize:13, fontWeight:500, color:"#111" }}>{c.n}</div>
              <div style={{ fontSize:11, color:"#999" }}>{c.c}{c.a ? ` — ${c.a}` : ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ p, selectedTier, setTier }) {
  const [expanded, setExpanded] = useState(false);
  const tier = selectedTier ? BONUS.find(b => b.label === selectedTier) : null;
  const isAdded = !!selectedTier;

  return (
    <div className="product-card">
      <div style={{ position:"relative" }}>
        <ProductGallery images={p.gallery} />
        <span style={{ position:"absolute", top:10, left:10, background:"rgba(255,255,255,0.93)", backdropFilter:"blur(6px)", padding:"3px 9px", borderRadius:4, fontSize:10, fontStyle:"italic", color:"#00a896" }}>{p.cat}</span>
        <span style={{ position:"absolute", top:10, right:10, background:"rgba(255,255,255,0.93)", backdropFilter:"blur(6px)", padding:"3px 9px", borderRadius:4, fontSize:9, letterSpacing:"0.08em", textTransform:"uppercase", color:"#555" }}>{p.origin}</span>
        {isAdded && <div style={{ position:"absolute", bottom:10, right:10, background:"#00a896", color:"#fff", borderRadius:20, padding:"3px 10px", fontSize:10, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase" }}>✓ In Order</div>}
      </div>

      <div style={{ padding:"14px 16px 0" }}>
        <h3 style={{ fontFamily:"'Agrandir',sans-serif", fontSize:15, fontWeight:700, color:"#111", textTransform:"uppercase", letterSpacing:"0.03em", marginBottom:3 }}>{p.name}</h3>
        <div style={{ fontSize:12, fontStyle:"italic", color:"#00a896", marginBottom:8 }}>{p.tagline}</div>
        <div style={{ fontSize:12, color:"#555", lineHeight:1.6, marginBottom:10 }}>{p.desc}</div>
        <button onClick={() => setExpanded(!expanded)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#111", marginBottom: expanded ? 8 : 14, padding:0, fontFamily:"'Arsenal',sans-serif" }}>
          <span style={{ display:"block", width:16, height:1.5, background:"#00a896" }}></span>
          Why Stock This <span style={{ color:"#00a896", fontSize:10 }}>{expanded ? "▲" : "▼"}</span>
        </button>
        {expanded && (
          <div style={{ marginBottom:14 }}>
            {p.why.map((w,i) => <div key={i} style={{ fontSize:12, color:"#555", lineHeight:1.6, marginBottom:4, paddingLeft:14, position:"relative" }}><span style={{ position:"absolute", left:0, color:"#00a896", fontWeight:700 }}>·</span>{w}</div>)}
          </div>
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", background:"#f8f8f6", borderTop:"1px solid #e4e2de", borderBottom:"1px solid #e4e2de", padding:"10px 16px" }}>
        {[
          { label:"Retail", value:`${p.retail} AED`, color:"#111" },
          { label: tier ? "Your price" : "Price (25% off)", value:`${tier ? (tier.buy*p.buyPrice/tier.total).toFixed(2) : p.buyPrice.toFixed(2)} AED`, color:"#c9a84c" },
          { label: tier ? "Profit" : "Profit/unit", value:`${tier ? (p.retail-(tier.buy*p.buyPrice/tier.total)).toFixed(2) : p.profit.toFixed(2)} AED`, color:"#00a896" },
        ].map((item, i) => (
          <div key={i} style={{ textAlign: i===0 ? "left" : i===1 ? "center" : "right" }}>
            <div style={{ fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:"#999", marginBottom:2 }}>{item.label}</div>
            <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:14, fontWeight:700, color:item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:"12px 16px 16px" }}>
        <div style={{ fontSize:11, color:"#999", marginBottom:8, fontStyle:"italic" }}>Select pack size — bigger order = lower cost per unit</div>
        <div style={{ display:"flex", gap:5, marginBottom:10 }}>
          {BONUS.map(b => {
            const active = selectedTier === b.label;
            const effCost = (b.buy*p.buyPrice/b.total).toFixed(2);
            const effProfit = (p.retail-(b.buy*p.buyPrice/b.total)).toFixed(2);
            return (
              <button key={b.label} className={`bonus-btn${active ? " active" : ""}`} onClick={() => setTier(active ? null : b.label)}>
                <div className="bn" style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700, lineHeight:1, color:"#111" }}>{b.label}</div>
                <div className="bs" style={{ fontSize:9, color:"#999", marginTop:3 }}>{effCost}/u</div>
                <div className="bp" style={{ fontSize:9, color:"#00a896", fontWeight:600, marginTop:1 }}>+{effProfit}</div>
              </button>
            );
          })}
        </div>

        {tier ? (
          <div style={{ background:"#e8f7f5", border:"1px solid #00a896", borderRadius:8, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"#111" }}>{tier.total} units <span style={{ fontStyle:"italic", fontWeight:400, color:"#00a896" }}>({tier.free} free)</span></div>
              <div style={{ fontSize:11, color:"#555", marginTop:1 }}>Buy {tier.buy}, get {tier.free} free</div>
            </div>
            <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:18, fontWeight:700, color:"#c9a84c" }}>{(tier.buy*p.buyPrice).toFixed(2)} <span style={{ fontSize:10, fontWeight:400, color:"#999" }}>AED</span></div>
          </div>
        ) : (
          <div style={{ background:"#f8f8f6", border:"1px dashed #e4e2de", borderRadius:8, padding:"10px 14px", marginBottom:10, textAlign:"center" }}>
            <div style={{ fontSize:12, color:"#999", fontStyle:"italic" }}>Select a pack size above to add to order</div>
          </div>
        )}

        <button className={`add-btn${isAdded ? " added" : ""}`} onClick={() => isAdded ? setTier(null) : null} disabled={!tier && !isAdded}>
          {isAdded ? `✓ Added — ${selectedTier} (tap to remove)` : tier ? "Add to Order →" : "Select a quantity first"}
        </button>
      </div>
    </div>
  );
}

function OrderPanel({ orders, orderItems, totalQty, totalFree, totalAED, pharmacy, setPharmacy, contactName, setContactName, generateWhatsApp }) {
  return (
    <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e4e2de", overflow:"hidden" }}>
      <div style={{ background:"#111", padding:"16px 18px" }}>
        <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:14, fontWeight:700, color:"#fff", letterSpacing:"0.05em", textTransform:"uppercase" }}>Your Order</div>
        {totalQty > 0 && <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:2 }}>{orderItems.length} product{orderItems.length!==1?"s":""} · {totalQty} units ({totalFree} free)</div>}
      </div>
      <div style={{ padding:"16px 18px" }}>
        {orderItems.length === 0 ? (
          <div style={{ textAlign:"center", padding:"28px 0" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🛒</div>
            <div style={{ fontSize:13, color:"#999", fontStyle:"italic", lineHeight:1.5 }}>Select a pack size on any product to start building your order</div>
          </div>
        ) : (
          <>
            {orderItems.map(p => {
              const tier = BONUS.find(b => b.label === orders[p.id]);
              if (!tier) return null;
              return (
                <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:10, marginBottom:10, borderBottom:"1px solid #e4e2de" }}>
                  <div style={{ flex:1, paddingRight:8 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#111", lineHeight:1.3 }}>{p.name}</div>
                    <div style={{ fontSize:11, color:"#00a896", marginTop:2 }}>{tier.label}: {tier.total} units ({tier.free} free)</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:14, fontWeight:700, color:"#c9a84c" }}>{(tier.buy*p.buyPrice).toFixed(2)}</div>
                    <div style={{ fontSize:9, color:"#999" }}>AED</div>
                  </div>
                </div>
              );
            })}
            <div style={{ background:"#f8f8f6", borderRadius:8, padding:"12px 14px", marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:12, color:"#999" }}>Payment</span>
                <span style={{ fontSize:12, fontWeight:700, color:"#00a896" }}>120 days</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:8, borderTop:"1px solid #e4e2de" }}>
                <span style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700 }}>Total</span>
                <span style={{ fontFamily:"'Agrandir',sans-serif", fontSize:20, fontWeight:700, color:"#c9a84c" }}>{totalAED.toFixed(2)} AED</span>
              </div>
            </div>
          </>
        )}
        <div style={{ marginBottom:10 }}>
          <label style={{ fontSize:11, color:"#999", fontStyle:"italic", display:"block", marginBottom:5 }}>Pharmacy Name</label>
          <PharmacySearch value={pharmacy?.n||""} onChange={(v) => { if(!v) setPharmacy(null); }} onSelect={(c) => setPharmacy(c)} />
          {pharmacy && <div style={{ fontSize:11, color:"#999", marginTop:4, fontStyle:"italic" }}>{pharmacy.c}{pharmacy.a?` — ${pharmacy.a}`:""}</div>}
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, color:"#999", fontStyle:"italic", display:"block", marginBottom:5 }}>Contact Person</label>
          <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Name or phone number"
            style={{ width:"100%", padding:"10px 12px", border:"1px solid #e4e2de", borderRadius:7, fontSize:13, fontFamily:"'Arsenal',sans-serif", color:"#111", background:"#fff", transition:"border-color 0.15s" }} />
        </div>
        {totalQty > 0 && (
          <a href={generateWhatsApp()} target="_blank" rel="noopener" className="wa-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.325 0-4.47-.744-6.228-2.007l-.253-.19-3.448 1.156 1.156-3.448-.19-.253A9.952 9.952 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            Send Order via WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

function TermsPanel() {
  return (
    <div>
      <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e4e2de", padding:"20px", marginBottom:12 }}>
        <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:17, fontWeight:700, color:"#111", marginBottom:4 }}>25% Base Discount</div>
        <div style={{ fontSize:12, fontStyle:"italic", color:"#00a896", marginBottom:10 }}>Flat discount across all six products</div>
        <div style={{ fontSize:13, color:"#555", lineHeight:1.7 }}>Every product priced at 75% of retail. Your margin is guaranteed from day one. No hidden costs, no variable pricing. 5% more than any other distributor in the market.</div>
      </div>
      <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e4e2de", padding:"20px", marginBottom:12 }}>
        <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:17, fontWeight:700, color:"#111", marginBottom:4 }}>Bonus Structure</div>
        <div style={{ fontSize:12, fontStyle:"italic", color:"#00a896", marginBottom:12 }}>Free units on every order</div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {BONUS.map(b => (
            <div key={b.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"#f8f8f6", borderRadius:7, padding:"10px 14px" }}>
              <span style={{ fontFamily:"'Agrandir',sans-serif", fontSize:16, fontWeight:700, color:"#111" }}>{b.label}</span>
              <span style={{ fontSize:12, color:"#555" }}>Buy {b.buy}, get <span style={{ color:"#00a896", fontWeight:700, fontStyle:"italic" }}>{b.free} free</span> = {b.total} units</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:"#00a896", borderRadius:10, padding:"24px 20px", marginBottom:12, color:"#fff" }}>
        <div style={{ fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", opacity:0.7, marginBottom:6 }}>Payment Terms</div>
        <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:52, fontWeight:700, lineHeight:1 }}>120</div>
        <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:17, fontWeight:700, marginBottom:14 }}>Day Credit Terms</div>
        <div style={{ fontSize:13, lineHeight:1.7, opacity:0.8, marginBottom:18 }}>Zero upfront. Zero deposit. We provide display stands, shelf materials, and bi-weekly restocking visits.</div>
        <div style={{ height:1, background:"rgba(255,255,255,0.15)", marginBottom:18 }} />
        <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:15, fontWeight:700, color:"#c9a84c", marginBottom:10 }}>Settle early? Get rewarded.</div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {[["30 days","5% cash discount"],["60 days","3% discount + priority restock"],["90 days","Bonus units + preferred pricing"]].map(([d,r]) => (
            <div key={d} style={{ background:"rgba(255,255,255,0.1)", borderRadius:7, padding:"11px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700 }}>{d}</span>
              <span style={{ fontSize:12, opacity:0.85, fontStyle:"italic" }}>{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [tab, setTab] = useState("catalogue");
  const [orders, setOrders] = useState({});
  const [pharmacy, setPharmacy] = useState(null);
  const [contactName, setContactName] = useState("");

  const setTier = (id, tier) => setOrders({...orders, [id]: tier});
  const orderItems = PRODUCTS.filter(p => orders[p.id]);

  const calcOrder = () => {
    let totalQty=0, totalFree=0, totalAED=0;
    orderItems.forEach(p => {
      const tier = BONUS.find(b => b.label === orders[p.id]);
      if (tier) { totalQty+=tier.total; totalFree+=tier.free; totalAED+=tier.buy*p.buyPrice; }
    });
    return { totalQty, totalFree, totalAED };
  };
  const { totalQty, totalFree, totalAED } = calcOrder();

  const generateWhatsApp = () => {
    let msg = `*New Order — Pharma Service Co.*\n`;
    if (pharmacy) msg += `Pharmacy: ${pharmacy.n}\n${pharmacy.c}${pharmacy.a?` — ${pharmacy.a}`:""}\n`;
    if (contactName) msg += `Contact: ${contactName}\n`;
    msg += `\n`;
    orderItems.forEach(p => {
      const tier = BONUS.find(b => b.label === orders[p.id]);
      if (tier) msg += `${p.name}: ${tier.label} (${tier.buy} + ${tier.free} free = ${tier.total}) = ${(tier.buy*p.buyPrice).toFixed(2)} AED\n`;
    });
    msg += `\n*Total: ${totalQty} units (${totalFree} free) — ${totalAED.toFixed(2)} AED*\nPayment: 120-day credit terms`;
    return `https://wa.me/971553511335?text=${encodeURIComponent(msg)}`;
  };

  const tabs = [{id:"catalogue",l:"Products"},{id:"order",l:`Order${totalQty>0?` (${totalQty})`:""}`},{id:"terms",l:"Terms"}];

  const orderPanelProps = { orders, orderItems, totalQty, totalFree, totalAED, pharmacy, setPharmacy, contactName, setContactName, generateWhatsApp };

  return (
    <div className="page-wrap">
      <style>{styles}</style>

      {/* HEADER */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:"rgba(245,245,243,0.97)", backdropFilter:"blur(12px)", borderBottom:"1px solid #e4e2de" }}>
        <div className="header-inner" style={{ margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0 10px" }}>
            <img src="/img/psc_logo_2025.png" alt="Pharma Service" style={{ height:26, width:"auto", objectFit:"contain" }} />
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ textAlign:"center", background:"#fff", border:"1px solid #e4e2de", borderRadius:6, padding:"5px 12px" }}>
                <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:16, fontWeight:700, color:"#00a896", lineHeight:1 }}>25%</div>
                <div style={{ fontSize:9, color:"#999", marginTop:2, fontStyle:"italic" }}>Discount</div>
              </div>
              <div style={{ textAlign:"center", background:"#fff", border:"1px solid #e4e2de", borderRadius:6, padding:"5px 12px" }}>
                <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:16, fontWeight:700, color:"#00a896", lineHeight:1 }}>120</div>
                <div style={{ fontSize:9, color:"#999", marginTop:2, fontStyle:"italic" }}>Day Terms</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE TABS */}
      <div className="tab-bar" style={{ background:"rgba(245,245,243,0.98)", borderBottom:"1px solid #e4e2de", position:"sticky", top:62, zIndex:90 }}>
        <div style={{ display:"flex" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:"12px 8px", fontSize:11, fontWeight: tab===t.id ? 700 : 400, letterSpacing:"0.07em", textTransform:"uppercase", color: tab===t.id ? "#111" : "#999", background:"none", border:"none", borderBottom: tab===t.id ? "2px solid #00a896" : "2px solid transparent", cursor:"pointer", fontFamily:"'Arsenal',sans-serif" }}>{t.l}</button>
          ))}
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="main-layout">
        <div className="product-column">

          {/* Desktop header */}
          <div className="desktop-section-title" style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, fontStyle:"italic", color:"#00a896", marginBottom:4, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ display:"block", width:18, height:1, background:"#00a896" }}></span>Pharmacy Partner Programme
            </div>
            <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:22, fontWeight:700, color:"#111" }}>Products in Stock</div>
            <div style={{ fontSize:12, fontStyle:"italic", color:"#999", marginTop:2 }}>Updated as of March 4th, 2026.</div>
          </div>

          {/* Products tab */}
          {tab === "catalogue" && (
            <>
              <div className="mobile-only" style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontStyle:"italic", color:"#00a896", marginBottom:4, display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ display:"block", width:18, height:1, background:"#00a896" }}></span>Pharmacy Partner Programme
                </div>
                <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:18, fontWeight:700, color:"#111" }}>Products in Stock</div>
                <div style={{ fontSize:12, fontStyle:"italic", color:"#999", marginTop:2 }}>Updated as of March 4th, 2026.</div>
              </div>
              <div className="products-grid">
                {PRODUCTS.map(p => <ProductCard key={p.id} p={p} selectedTier={orders[p.id]||null} setTier={t => setTier(p.id, t)} />)}
              </div>
            </>
          )}

          {/* Order tab (mobile only — desktop uses sidebar) */}
          {tab === "order" && (
            <div style={{ maxWidth:500 }}>
              <div style={{ fontSize:12, fontStyle:"italic", color:"#00a896", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ display:"block", width:18, height:1, background:"#00a896" }}></span>Review Your Order
              </div>
              <OrderPanel {...orderPanelProps} />
            </div>
          )}

          {tab === "terms" && <TermsPanel />}
        </div>

        {/* DESKTOP SIDEBAR */}
        <div className="sidebar">
          <OrderPanel {...orderPanelProps} />
        </div>
      </div>

      {/* MOBILE FLOATING BAR */}
      {totalQty > 0 && tab !== "order" && (
        <div className="mobile-order-bar" onClick={() => setTab("order")} style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(255,255,255,0.97)", backdropFilter:"blur(12px)", borderTop:"1px solid #e4e2de", padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", zIndex:100, cursor:"pointer", boxShadow:"0 -4px 20px rgba(0,0,0,0.06)" }}>
          <div>
            <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700, color:"#111" }}>{orderItems.length} product{orderItems.length!==1?"s":""} · {totalQty} units <span style={{ fontStyle:"italic", fontWeight:400, color:"#00a896" }}>({totalFree} free)</span></div>
            <div style={{ fontSize:11, color:"#999", fontStyle:"italic" }}>Tap to review & send order</div>
          </div>
          <div style={{ background:"#00a896", color:"#fff", borderRadius:7, padding:"9px 16px", fontFamily:"'Agrandir',sans-serif", fontSize:14, fontWeight:700 }}>{totalAED.toFixed(2)} AED</div>
        </div>
      )}

      <div style={{ textAlign:"center", padding:"16px", fontSize:11, fontStyle:"italic", color:"#999" }}>
        © 2026 Pharma Service Co. LLC · Dubai Healthcare City · pharmaservice.ae
      </div>
    </div>
  );
}
