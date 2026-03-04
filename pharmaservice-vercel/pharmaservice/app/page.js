"use client";
import { useState, useRef, useEffect } from "react";
import { PRODUCTS, BONUS } from "../components/products";
import { CUSTOMERS } from "../components/customers";

const col = {
  bg: "#fafaf8", card: "#ffffff", ink: "#1a1a1a", sub: "#6b6b6b",
  mute: "#a0a0a0", line: "#e8e6e2", teal: "#00a896", gold: "#c9a84c",
};

function Gallery({ productId, onClose }) {
  const p = PRODUCTS.find(x => x.id === productId);
  const images = p?.gallery || [];
  const [idx, setIdx] = useState(0);
  if (!productId || !images.length) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.92)", display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px" }}>
        <div style={{ fontStyle:"italic", color:"#fff", fontSize:14 }}>{idx+1} of {images.length}</div>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,0.08)", border:"none", color:"#fff", width:36, height:36, fontSize:20, cursor:"pointer", borderRadius:"50%" }}>×</button>
      </div>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
        <img src={images[idx]} style={{ maxWidth:"90%", maxHeight:"76vh", objectFit:"contain", borderRadius:4 }} alt="" />
        {images.length > 1 && idx > 0 && (
          <button onClick={() => setIdx(idx-1)} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", width:40, height:40, borderRadius:"50%", fontSize:18, cursor:"pointer" }}>‹</button>
        )}
        {images.length > 1 && idx < images.length-1 && (
          <button onClick={() => setIdx(idx+1)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", width:40, height:40, borderRadius:"50%", fontSize:18, cursor:"pointer" }}>›</button>
        )}
      </div>
      {images.length > 1 && (
        <div style={{ display:"flex", justifyContent:"center", gap:8, padding:"16px 20px 24px" }}>
          {images.map((img, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{ width:48, height:48, borderRadius:4, border: i===idx ? "2px solid #fff" : "2px solid rgba(255,255,255,0.15)", padding:0, cursor:"pointer", overflow:"hidden", opacity: i===idx ? 1 : 0.45 }}>
              <img src={img} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" />
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

  const filtered = search.length >= 2
    ? CUSTOMERS.filter(c => c.n.toLowerCase().includes(search.toLowerCase())).slice(0, 12)
    : [];

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <input
        value={value || search}
        onChange={e => { setSearch(e.target.value); onChange(""); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Start typing pharmacy name..."
        style={{ width:"100%", padding:"12px 14px", border:`1px solid ${col.line}`, borderRadius:6, fontSize:14, fontFamily:"'Arsenal',sans-serif", outline:"none", background:"#fff", color:col.ink }}
      />
      {open && filtered.length > 0 && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:50, background:"#fff", border:`1px solid ${col.line}`, borderTop:"none", borderRadius:"0 0 6px 6px", maxHeight:240, overflowY:"auto", boxShadow:"0 8px 24px rgba(0,0,0,0.08)" }}>
          {filtered.map((c, i) => (
            <div key={i} onClick={() => { onSelect(c); setSearch(c.n); setOpen(false); }}
              style={{ padding:"10px 14px", cursor:"pointer", borderBottom:`1px solid ${col.line}` }}
              onMouseEnter={e => e.currentTarget.style.background="#f5f5f2"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              <div style={{ fontSize:13, fontWeight:500, color:col.ink }}>{c.n}</div>
              <div style={{ fontSize:11, color:col.mute }}>{c.c}{c.a ? ` — ${c.a}` : ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ p, selectedTier, setTier, onGallery }) {
  const galleryCount = p.gallery?.length || 0;
  const tier = selectedTier ? BONUS.find(b => b.label === selectedTier) : null;

  return (
    <div style={{ background:col.card, borderRadius:8, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", marginBottom:16, border:`1px solid ${col.line}` }}>
      <div style={{ position:"relative", cursor:"pointer" }} onClick={() => onGallery(p.id)}>
        <img src={p.thumb} style={{ width:"100%", height:220, objectFit:"cover", objectPosition:"top", display:"block" }} alt={p.name} />
        <div style={{ position:"absolute", top:12, left:12, background:"rgba(255,255,255,0.92)", backdropFilter:"blur(8px)", padding:"4px 10px", borderRadius:4, fontSize:10, fontFamily:"'Arsenal',sans-serif", fontStyle:"italic", color:col.teal }}>{p.cat}</div>
        <div style={{ position:"absolute", top:12, right:12, background:"rgba(255,255,255,0.92)", backdropFilter:"blur(8px)", padding:"4px 10px", borderRadius:4, fontSize:9, letterSpacing:"0.08em", textTransform:"uppercase", color:col.sub }}>{p.origin}</div>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(transparent, rgba(0,0,0,0.55))", padding:"28px 16px 12px", display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
          <div style={{ fontStyle:"italic", color:"#fff", fontSize:13, display:"flex", alignItems:"center", gap:6 }}>View Product Gallery</div>
          {galleryCount > 1 && <div style={{ color:"rgba(255,255,255,0.6)", fontSize:11 }}>{galleryCount} images</div>}
        </div>
      </div>

      <div style={{ padding:"18px 18px 14px" }}>
        <h3 style={{ fontFamily:"'Agrandir',sans-serif", fontSize:17, fontWeight:700, color:col.ink, marginBottom:4, lineHeight:1.3, textTransform:"uppercase", letterSpacing:"0.03em" }}>{p.name}</h3>
        <div style={{ fontStyle:"italic", fontSize:13, color:col.teal, marginBottom:8 }}>{p.tagline}</div>
        <div style={{ fontSize:13, color:col.sub, lineHeight:1.65, marginBottom:16 }}>{p.desc}</div>

        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:col.ink, marginBottom:10, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ display:"block", width:20, height:1.5, background:col.teal }}></span>Why Stock This
        </div>
        {p.why.map((w,i) => <div key={i} style={{ fontSize:12.5, color:col.sub, lineHeight:1.6, marginBottom:5, paddingLeft:16, position:"relative" }}><span style={{ position:"absolute", left:0, color:col.teal, fontSize:13, fontWeight:700, top:-1 }}>·</span>{w}</div>)}
      </div>

      <div style={{ background:"#f7f7f5", borderTop:`1px solid ${col.line}`, padding:"12px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:8, letterSpacing:"0.12em", color:col.mute, textTransform:"uppercase", fontWeight:600, marginBottom:2 }}>Retail</div>
          <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:18, fontWeight:700, color:col.ink }}>{p.retail} <span style={{ fontSize:10, fontWeight:400, color:col.mute }}>AED</span></div>
        </div>
        <div>
          <div style={{ fontSize:8, letterSpacing:"0.12em", color:col.mute, textTransform:"uppercase", fontWeight:600, marginBottom:2 }}>{tier ? "Your price (w/ bonus)" : "Your price (25% off)"}</div>
          <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:18, fontWeight:700, color:col.gold }}>{tier ? (tier.buy * p.buyPrice / tier.total).toFixed(2) : p.buyPrice.toFixed(2)} <span style={{ fontSize:10, fontWeight:400, color:col.mute }}>AED</span></div>
        </div>
        <div>
          <div style={{ fontSize:8, letterSpacing:"0.12em", color:col.mute, textTransform:"uppercase", fontWeight:600, marginBottom:2 }}>{tier ? "Profit (w/ bonus)" : "Your profit"}</div>
          <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:18, fontWeight:700, color:col.teal }}>{tier ? (p.retail - (tier.buy * p.buyPrice / tier.total)).toFixed(2) : p.profit.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ padding:"14px 18px 18px", borderTop:`1px solid ${col.line}` }}>
        <div style={{ fontStyle:"italic", fontSize:12, color:col.mute, marginBottom:10 }}>Select order quantity</div>
        <div style={{ display:"flex", gap:5 }}>
          {BONUS.map(b => {
            const active = selectedTier === b.label;
            const effCost = (b.buy * p.buyPrice / b.total).toFixed(2);
            const effProfit = (p.retail - (b.buy * p.buyPrice / b.total)).toFixed(2);
            return (
              <button key={b.label} onClick={() => setTier(active ? null : b.label)} style={{
                flex:1, padding:"10px 3px", cursor:"pointer", fontFamily:"'Arsenal',sans-serif", textAlign:"center", transition:"all 0.15s", borderRadius:6,
                background: active ? col.teal : "#f7f7f5",
                border: active ? `1px solid ${col.teal}` : `1px solid ${col.line}`,
                color: active ? "#fff" : col.ink,
              }}>
                <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:14, fontWeight:700, lineHeight:1 }}>{b.label}</div>
                <div style={{ fontSize:9, color: active ? "rgba(255,255,255,0.65)" : col.mute, marginTop:4 }}>{effCost}/unit</div>
                <div style={{ fontSize:9, color: active ? "#fff" : col.teal, fontWeight:600 }}>{effProfit} AED profit</div>
              </button>
            );
          })}
        </div>
        {tier && (
          <div style={{ marginTop:10, background:"#f7f7f5", border:`1px solid ${col.line}`, borderRadius:6, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:13, color:col.ink }}><span style={{ fontWeight:700 }}>{tier.total} units</span> <span style={{ fontStyle:"italic", color:col.teal }}>({tier.free} free)</span></div>
            <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:17, fontWeight:700, color:col.gold }}>{(tier.buy * p.buyPrice).toFixed(2)} AED</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  const [tab, setTab] = useState("catalogue");
  const [orders, setOrders] = useState({});
  const [galleryId, setGalleryId] = useState(null);
  const [pharmacy, setPharmacy] = useState(null);
  const [contactName, setContactName] = useState("");

  const setTier = (id, tier) => setOrders({...orders, [id]: tier});
  const orderItems = PRODUCTS.filter(p => orders[p.id]);

  const calcOrder = () => {
    let totalQty = 0, totalFree = 0, totalAED = 0;
    orderItems.forEach(p => {
      const tier = BONUS.find(b => b.label === orders[p.id]);
      if (tier) { totalQty += tier.total; totalFree += tier.free; totalAED += tier.buy * p.buyPrice; }
    });
    return { totalQty, totalFree, totalAED };
  };
  const { totalQty, totalFree, totalAED } = calcOrder();

  const generateWhatsApp = () => {
    let msg = `*New Order — Pharma Service Co.*\n`;
    if (pharmacy) msg += `Pharmacy: ${pharmacy.n}\n${pharmacy.c}${pharmacy.a ? ` — ${pharmacy.a}` : ""}\n`;
    if (contactName) msg += `Contact: ${contactName}\n`;
    msg += `\n`;
    orderItems.forEach(p => {
      const tier = BONUS.find(b => b.label === orders[p.id]);
      if (tier) msg += `${p.name}: ${tier.label} (${tier.buy} + ${tier.free} free = ${tier.total}) = ${(tier.buy * p.buyPrice).toFixed(2)} AED\n`;
    });
    msg += `\n*Total: ${totalQty} units (${totalFree} free) — ${totalAED.toFixed(2)} AED*\nPayment: 120-day credit terms`;
    return `https://wa.me/971553511335?text=${encodeURIComponent(msg)}`;
  };

  const tabs = [{id:"catalogue",l:"Products"},{id:"order",l:`Order${totalQty>0?` (${totalQty})`:""}`},{id:"terms",l:"Terms"}];

  return (
    <div style={{ background:col.bg, minHeight:"100vh" }}>
      <Gallery productId={galleryId} onClose={() => setGalleryId(null)} />

      {/* Header */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:"rgba(250,250,248,0.95)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${col.line}` }}>
        <div style={{ maxWidth:520, margin:"0 auto", padding:"14px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:16, fontWeight:700, letterSpacing:"0.02em", color:col.ink }}>Pharma Service<span style={{ color:col.teal }}>.</span></div>
            <div style={{ fontStyle:"italic", fontSize:11, color:col.mute }}>Est. 1984 · Dubai</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <div style={{ flex:1, textAlign:"center", border:`1px solid ${col.line}`, borderRadius:6, padding:"8px 4px", background:"#fff" }}>
              <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:18, fontWeight:700, color:col.teal }}>25%</div>
              <div style={{ fontStyle:"italic", fontSize:10, color:col.mute, marginTop:1 }}>Base Discount</div>
            </div>
            <div style={{ flex:1, textAlign:"center", border:`1px solid ${col.line}`, borderRadius:6, padding:"8px 4px", background:"#fff" }}>
              <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:18, fontWeight:700, color:col.teal }}>120</div>
              <div style={{ fontStyle:"italic", fontSize:10, color:col.mute, marginTop:1 }}>Day Credit Terms</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:"rgba(250,250,248,0.98)", borderBottom:`1px solid ${col.line}`, position:"sticky", top:92, zIndex:90 }}>
        <div style={{ maxWidth:520, margin:"0 auto", display:"flex" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex:1, padding:"13px 8px", fontSize:12, fontWeight: tab===t.id ? 700 : 400, letterSpacing:"0.06em", textTransform:"uppercase",
              color: tab===t.id ? col.ink : col.mute,
              background:"none", border:"none", borderBottom: tab===t.id ? `2px solid ${col.teal}` : "2px solid transparent",
              cursor:"pointer", fontFamily:"'Arsenal',sans-serif",
            }}>{t.l}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:520, margin:"0 auto", padding:"16px 16px 110px" }}>

        {tab === "catalogue" && <>
          <div style={{ marginBottom:20, paddingTop:4 }}>
            <div style={{ fontStyle:"italic", fontSize:12, color:col.teal, marginBottom:4, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ display:"block", width:20, height:1, background:col.teal }}></span>Pharmacy Partner Programme
            </div>
            <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:20, fontWeight:700, lineHeight:1.3, color:col.ink }}>Products in Stock</div>
            <div style={{ fontStyle:"italic", fontSize:13, color:col.mute, marginTop:2 }}>Updated as of March 4th, 2026.</div>
          </div>
          {PRODUCTS.map(p => <ProductCard key={p.id} p={p} selectedTier={orders[p.id]||null} setTier={t => setTier(p.id, t)} onGallery={setGalleryId} />)}
        </>}

        {tab === "order" && <>
          <div style={{ fontStyle:"italic", fontSize:12, color:col.teal, margin:"12px 0 12px", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ display:"block", width:20, height:1, background:col.teal }}></span>Order Details
          </div>

          <div style={{ background:"#fff", borderRadius:8, border:`1px solid ${col.line}`, padding:"18px", marginBottom:16 }}>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontStyle:"italic", fontSize:12, color:col.mute, display:"block", marginBottom:6 }}>Pharmacy Name</label>
              <PharmacySearch value={pharmacy?.n || ""} onChange={(v) => { if (!v) setPharmacy(null); }} onSelect={(c) => setPharmacy(c)} />
              {pharmacy && (
                <div style={{ fontStyle:"italic", fontSize:11, color:col.mute, marginTop:5, paddingLeft:2 }}>{pharmacy.c}{pharmacy.a ? ` — ${pharmacy.a}` : ""}{pharmacy.p ? ` · ${pharmacy.p}` : ""}</div>
              )}
            </div>
            <div>
              <label style={{ fontStyle:"italic", fontSize:12, color:col.mute, display:"block", marginBottom:6 }}>Contact Person</label>
              <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Name or phone number" style={{ width:"100%", padding:"12px 14px", border:`1px solid ${col.line}`, borderRadius:6, fontSize:14, fontFamily:"'Arsenal',sans-serif", outline:"none", background:"#fff", color:col.ink }} />
            </div>
          </div>

          {orderItems.length === 0 ? (
            <div style={{ background:"#fff", borderRadius:8, border:`1px solid ${col.line}`, padding:"48px 20px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:16, color:col.mute, marginBottom:6 }}>No items selected</div>
              <div style={{ fontStyle:"italic", fontSize:13, color:col.mute }}>Select quantities in the Products tab</div>
            </div>
          ) : <>
            {orderItems.map(p => {
              const tier = BONUS.find(b => b.label === orders[p.id]);
              if (!tier) return null;
              return (
                <div key={p.id} style={{ background:"#fff", borderRadius:8, border:`1px solid ${col.line}`, padding:"14px 18px", marginBottom:6, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700, color:col.ink }}>{p.name}</div>
                    <div style={{ fontSize:12, color:col.mute }}>{tier.label}: {tier.buy} pcs <span style={{ fontStyle:"italic", color:col.teal, fontWeight:700 }}>+{tier.free} free</span> = {tier.total} units</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:17, fontWeight:700, color:col.gold }}>{(tier.buy * p.buyPrice).toFixed(2)}</div>
                    <div style={{ fontStyle:"italic", fontSize:10, color:col.mute }}>AED</div>
                  </div>
                </div>
              );
            })}

            <div style={{ background:"#fff", borderRadius:8, border:`1px solid ${col.line}`, padding:"18px", marginTop:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ fontStyle:"italic", fontSize:13, color:col.mute }}>Total Units</span><span style={{ fontSize:13, fontWeight:700, color:col.ink }}>{totalQty} <span style={{ fontStyle:"italic", color:col.teal }}>({totalFree} free)</span></span></div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ fontStyle:"italic", fontSize:13, color:col.mute }}>Payment Terms</span><span style={{ fontSize:13, fontWeight:700, color:col.teal }}>120 days</span></div>
              <div style={{ height:1, background:col.line, margin:"10px 0" }} />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ fontFamily:"'Agrandir',sans-serif", fontSize:16, fontWeight:700 }}>Total</span><span style={{ fontFamily:"'Agrandir',sans-serif", fontSize:22, fontWeight:700, color:col.gold }}>{totalAED.toFixed(2)} AED</span></div>
            </div>

            <a href={generateWhatsApp()} target="_blank" rel="noopener" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:col.teal, color:"#fff", borderRadius:8, padding:"15px", fontSize:13, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", textDecoration:"none", marginTop:14 }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.325 0-4.47-.744-6.228-2.007l-.253-.19-3.448 1.156 1.156-3.448-.19-.253A9.952 9.952 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              Send Order via WhatsApp
            </a>
          </>}
        </>}

        {tab === "terms" && <>
          <div style={{ background:"#fff", borderRadius:8, border:`1px solid ${col.line}`, padding:"22px 18px", marginBottom:10, marginTop:8 }}>
            <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:18, fontWeight:700, color:col.ink, marginBottom:3 }}>25% Base Discount</div>
            <div style={{ fontStyle:"italic", fontSize:12, color:col.teal, marginBottom:10 }}>Flat discount across all six products</div>
            <div style={{ fontSize:13, color:col.sub, lineHeight:1.7 }}>Every product priced at 75% of retail. Your margin is guaranteed from day one. No hidden costs, no variable pricing. 5% more discount than any other distributor.</div>
          </div>

          <div style={{ background:"#fff", borderRadius:8, border:`1px solid ${col.line}`, padding:"22px 18px", marginBottom:10 }}>
            <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:18, fontWeight:700, color:col.ink, marginBottom:3 }}>Bonus Structure</div>
            <div style={{ fontStyle:"italic", fontSize:12, color:col.teal, marginBottom:10 }}>Free units on every product ordered</div>
            <div style={{ display:"flex", flexDirection:"column", gap:4, marginTop:10 }}>
              {BONUS.map(b => (
                <div key={b.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"#f7f7f5", borderRadius:6, padding:"10px 14px" }}>
                  <span style={{ fontFamily:"'Agrandir',sans-serif", fontSize:17, fontWeight:700, color:col.ink }}>{b.label}</span>
                  <span style={{ fontSize:12, color:col.sub }}>Buy {b.buy}, get <span style={{ fontStyle:"italic", color:col.teal, fontWeight:700 }}>{b.free} free</span> = {b.total} total</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:col.teal, borderRadius:8, padding:"26px 20px", marginBottom:10, color:"#fff" }}>
            <div style={{ fontStyle:"italic", fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", opacity:0.7, marginBottom:8 }}>Payment Terms</div>
            <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:54, fontWeight:700, lineHeight:1 }}>120</div>
            <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:18, fontWeight:700, marginBottom:16 }}>Day Credit Terms</div>
            <div style={{ fontSize:13, lineHeight:1.7, opacity:0.8, marginBottom:20 }}>We believe in partnerships, not pressure. Stock our full range and take up to 120 days to settle. Zero upfront. Zero deposit. Zero risk. We provide display stands, shelf materials, and bi-weekly restocking visits.</div>
            <div style={{ height:1, background:"rgba(255,255,255,0.15)", marginBottom:20 }} />
            <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:16, fontWeight:700, color:col.gold, marginBottom:10 }}>Settle early? Get rewarded.</div>
            <div style={{ fontStyle:"italic", fontSize:12, opacity:0.75, lineHeight:1.7, marginBottom:14 }}>Most partners settle at 90 days because the rewards make it worth their while.</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:6, padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700 }}>30 days</span><span style={{ fontStyle:"italic", fontSize:12 }}>5% cash discount</span></div>
              <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:6, padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700 }}>60 days</span><span style={{ fontStyle:"italic", fontSize:12 }}>3% discount + priority restock</span></div>
              <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:6, padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ fontFamily:"'Agrandir',sans-serif", fontSize:13, fontWeight:700 }}>90 days</span><span style={{ fontStyle:"italic", fontSize:12 }}>Bonus units + preferred pricing</span></div>
            </div>
          </div>
        </>}
      </div>

      {totalQty > 0 && tab !== "order" && (
        <div onClick={() => setTab("order")} style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(255,255,255,0.96)", backdropFilter:"blur(12px)", borderTop:`1px solid ${col.line}`, padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", zIndex:100, cursor:"pointer", boxShadow:"0 -4px 16px rgba(0,0,0,0.04)" }}>
          <div>
            <div style={{ fontFamily:"'Agrandir',sans-serif", fontSize:14, fontWeight:700, color:col.ink }}>{orderItems.length} product{orderItems.length !== 1 ? "s" : ""} · {totalQty} units <span style={{ fontStyle:"italic", fontWeight:400, color:col.teal }}>({totalFree} free)</span></div>
            <div style={{ fontStyle:"italic", fontSize:11, color:col.mute }}>Tap to review order</div>
          </div>
          <div style={{ background:col.teal, color:"#fff", borderRadius:6, padding:"10px 18px", fontFamily:"'Agrandir',sans-serif", fontSize:14, fontWeight:700 }}>{totalAED.toFixed(2)} AED</div>
        </div>
      )}

      <div style={{ textAlign:"center", padding:"20px", fontStyle:"italic", fontSize:11, color:col.mute }}>
        © 2026 Pharma Service Co. LLC · Dubai Healthcare City · pharmaservice.ae
      </div>
    </div>
  );
}
