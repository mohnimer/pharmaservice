"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { PRODUCTS, BONUS } from "../../components/products";
import { CUSTOMERS } from "../../components/customers";

const col = {
  navy: "#0a1628",
  navy2: "#0e2038",
  cream: "#f8f5f0",
  teal: "#00a896",
  gold: "#c9a84c",
  line: "rgba(248,245,240,0.08)",
  text: "rgba(248,245,240,0.74)",
  muted: "rgba(248,245,240,0.48)",
};

function PharmacySearch({ value, onChange, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || "");
  const ref = useRef(null);

  useEffect(() => setSearch(value || ""), [value]);

  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const filtered = search.length >= 2
    ? CUSTOMERS.filter((c) => c.n.toLowerCase().includes(search.toLowerCase())).slice(0, 12)
    : [];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input
        value={search}
        onChange={(e) => {
          const v = e.target.value;
          setSearch(v);
          onChange(v);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Start typing pharmacy name..."
        style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "#fff", border: "1px solid #d8dedf", fontSize: 14, outline: "none" }}
      />
      {open && filtered.length > 0 && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 30, background: "#fff", border: "1px solid #d8dedf", borderRadius: 14, boxShadow: "0 18px 40px rgba(0,0,0,.08)", overflow: "hidden", maxHeight: 280, overflowY: "auto" }}>
          {filtered.map((c, i) => (
            <button
              key={`${c.n}-${i}`}
              onClick={() => {
                setSearch(c.n);
                onSelect(c);
                setOpen(false);
              }}
              style={{ width: "100%", textAlign: "left", padding: "12px 14px", background: "#fff", border: "none", borderBottom: i === filtered.length - 1 ? "none" : "1px solid #eef2f2", cursor: "pointer" }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, color: "#182532" }}>{c.n}</div>
              <div style={{ fontSize: 11, color: "#6b7a88", marginTop: 3 }}>{c.c}{c.a ? ` — ${c.a}` : ""}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, selected, setSelected, added, setAdded, onOpenGallery }) {
  const selectedTier = BONUS.find((b) => b.label === selected);

  return (
    <div style={{ background: "rgba(248,245,240,0.04)", border: `1px solid ${col.line}`, borderRadius: 22, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,.18)" }}>
      <button onClick={() => onOpenGallery(product.id)} style={{ padding: 0, border: "none", background: "transparent", width: "100%", cursor: "pointer", position: "relative" }}>
        <img src={product.thumb} alt={product.name} style={{ width: "100%", height: 260, objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,22,40,.06) 0%, rgba(10,22,40,.7) 100%)" }} />
        <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(10,22,40,.82)", color: col.teal, border: "1px solid rgba(0,168,150,.24)", padding: "6px 10px", borderRadius: 999, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase" }}>{product.cat}</div>
        <div style={{ position: "absolute", bottom: 16, left: 16, color: col.cream, fontSize: 13, fontStyle: "italic" }}>View product images</div>
      </button>

      <div style={{ padding: 22 }}>
        <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 22, fontWeight: 700, lineHeight: 1.18, color: col.cream, marginBottom: 6 }}>{product.name}</div>
        <div style={{ color: col.teal, fontSize: 14, fontStyle: "italic", marginBottom: 10 }}>{product.tagline}</div>
        <div style={{ color: col.text, fontSize: 14, lineHeight: 1.75, marginBottom: 16 }}>{product.desc}</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${col.line}`, borderRadius: 14, padding: 12 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em", color: col.muted, marginBottom: 6 }}>Retail</div>
            <div style={{ fontFamily: "'Agrandir', sans-serif", fontWeight: 700, color: col.cream }}>{product.retail} AED</div>
          </div>
          <div style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${col.line}`, borderRadius: 14, padding: 12 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em", color: col.muted, marginBottom: 6 }}>Buy price</div>
            <div style={{ fontFamily: "'Agrandir', sans-serif", fontWeight: 700, color: col.gold }}>{product.buyPrice.toFixed(2)} AED</div>
          </div>
          <div style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${col.line}`, borderRadius: 14, padding: 12 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em", color: col.muted, marginBottom: 6 }}>Margin</div>
            <div style={{ fontFamily: "'Agrandir', sans-serif", fontWeight: 700, color: col.teal }}>{product.profit.toFixed(2)} AED</div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: col.gold, marginBottom: 12 }}>Why buyers stock it</div>
        <div style={{ display: "grid", gap: 7, marginBottom: 18 }}>
          {product.why.slice(0, 4).map((w, i) => (
            <div key={i} style={{ position: "relative", paddingLeft: 16, color: col.text, fontSize: 13, lineHeight: 1.65 }}>
              <span style={{ position: "absolute", left: 0, top: 0, color: col.teal }}>•</span>{w}
            </div>
          ))}
        </div>

        <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 13, fontWeight: 700, color: col.cream, marginBottom: 10 }}>Select pack size — bigger order = lower cost per unit.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 8 }}>
          {BONUS.map((b) => {
            const active = selected === b.label;
            const unitCost = (b.buy * product.buyPrice / b.total).toFixed(2);
            return (
              <button
                key={b.label}
                onClick={() => {
                  setSelected(product.id, active ? null : b.label);
                  setAdded(product.id, false);
                }}
                style={{ padding: "11px 6px", borderRadius: 14, border: active ? `1px solid ${col.teal}` : `1px solid ${col.line}`, background: active ? "rgba(0,168,150,.16)" : "rgba(255,255,255,.03)", cursor: "pointer", color: active ? col.cream : col.text }}
              >
                <div style={{ fontFamily: "'Agrandir', sans-serif", fontWeight: 700, fontSize: 15 }}>{b.label}</div>
                <div style={{ fontSize: 10, marginTop: 4, color: active ? "rgba(248,245,240,.82)" : col.muted }}>{unitCost}/unit</div>
              </button>
            );
          })}
        </div>

        {selectedTier && (
          <div style={{ marginTop: 12, background: "rgba(0,168,150,.12)", border: "1px solid rgba(0,168,150,.28)", color: col.cream, borderRadius: 16, padding: 14 }}>
            <div style={{ fontFamily: "'Agrandir', sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>You’re getting {selectedTier.buy} paid units + {selectedTier.free} free = {selectedTier.total} total units.</div>
            <div style={{ fontSize: 13, color: "rgba(248,245,240,.76)" }}>Total line cost: {(selectedTier.buy * product.buyPrice).toFixed(2)} AED · effective unit cost: {(selectedTier.buy * product.buyPrice / selectedTier.total).toFixed(2)} AED</div>
          </div>
        )}

        <button
          onClick={() => selected && setAdded(product.id, true)}
          disabled={!selected}
          style={{ width: "100%", marginTop: 14, padding: "15px 16px", borderRadius: 14, border: added ? `1px solid rgba(201,168,76,.26)` : selected ? `1px solid ${col.teal}` : `1px solid ${col.line}`, background: added ? "#15263d" : selected ? col.teal : "rgba(255,255,255,.05)", color: !selected ? "rgba(248,245,240,.46)" : col.cream, fontFamily: "'Agrandir', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", cursor: !selected ? "not-allowed" : "pointer" }}
        >
          {!selected ? "Select a quantity first" : added ? "✓ Added" : "Add to Order →"}
        </button>
      </div>
    </div>
  );
}

function Gallery({ productId, onClose }) {
  const product = PRODUCTS.find((p) => p.id === productId);
  const images = product?.gallery || [];
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [productId]);
  if (!productId || !images.length) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.9)", zIndex: 100, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", color: "#fff" }}>
        <div>{product.name}</div>
        <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: 999, border: "none", background: "rgba(255,255,255,.12)", color: "#fff", fontSize: 22, cursor: "pointer" }}>×</button>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <img src={images[index]} alt="" style={{ maxWidth: "90vw", maxHeight: "74vh", objectFit: "contain" }} />
        {index > 0 && <button onClick={() => setIndex(index - 1)} style={{ position: "absolute", left: 24, width: 44, height: 44, borderRadius: 999, border: "none", background: "rgba(255,255,255,.12)", color: "#fff", fontSize: 24, cursor: "pointer" }}>‹</button>}
        {index < images.length - 1 && <button onClick={() => setIndex(index + 1)} style={{ position: "absolute", right: 24, width: 44, height: 44, borderRadius: 999, border: "none", background: "rgba(255,255,255,.12)", color: "#fff", fontSize: 24, cursor: "pointer" }}>›</button>}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [gateOpen, setGateOpen] = useState(false);
  const [pharmacyInput, setPharmacyInput] = useState("");
  const [pharmacy, setPharmacy] = useState(null);
  const [contactName, setContactName] = useState("");
  const [mobile, setMobile] = useState("");
  const [selected, setSelectedState] = useState({});
  const [added, setAddedState] = useState({});
  const [galleryId, setGalleryId] = useState(null);

  const setSelected = (id, tier) => setSelectedState((prev) => ({ ...prev, [id]: tier }));
  const setAdded = (id, value) => setAddedState((prev) => ({ ...prev, [id]: value }));

  const orderItems = useMemo(() => PRODUCTS.filter((p) => added[p.id] && selected[p.id]), [added, selected]);

  const summary = useMemo(() => {
    return orderItems.reduce((acc, p) => {
      const tier = BONUS.find((b) => b.label === selected[p.id]);
      if (!tier) return acc;
      acc.totalQty += tier.total;
      acc.totalFree += tier.free;
      acc.totalPaid += tier.buy;
      acc.totalAED += tier.buy * p.buyPrice;
      acc.lines.push({ p, tier, total: tier.buy * p.buyPrice });
      return acc;
    }, { totalQty: 0, totalFree: 0, totalPaid: 0, totalAED: 0, lines: [] });
  }, [orderItems, selected]);

  const whatsappHref = useMemo(() => {
    let msg = `*New Order — Pharma Service Co.*\n`;
    msg += `Pharmacy: ${pharmacy?.n || pharmacyInput}\n`;
    if (contactName) msg += `Contact: ${contactName}\n`;
    if (mobile) msg += `Mobile: ${mobile}\n`;
    msg += `\n`;
    summary.lines.forEach(({ p, tier, total }) => {
      msg += `${p.name}: ${tier.label} (${tier.buy} + ${tier.free} free = ${tier.total}) = ${total.toFixed(2)} AED\n`;
    });
    msg += `\n*Total: ${summary.totalQty} units (${summary.totalFree} free) — ${summary.totalAED.toFixed(2)} AED*\nPayment: 120-day credit terms`;
    return `https://wa.me/971553511335?text=${encodeURIComponent(msg)}`;
  }, [pharmacy, pharmacyInput, contactName, mobile, summary]);

  const canEnter = pharmacyInput.trim() && contactName.trim();

  return (
    <div style={{ minHeight: "100vh", background: gateOpen ? col.navy : "#eef2f2", color: col.cream, fontFamily: "'Arsenal', sans-serif" }}>
      <style>{`@import url('https://fonts.cdnfonts.com/css/agrandir');
        *{box-sizing:border-box}
        @media (max-width: 960px){
          .desktop-grid{grid-template-columns:1fr!important}
          .sidebar{position:fixed!important;left:16px;right:16px;bottom:16px;top:auto!important;width:auto!important;z-index:40}
          .mobile-pad{padding-bottom:220px!important}
          .hide-mobile{display:none!important}
        }
      `}</style>

      <Gallery productId={galleryId} onClose={() => setGalleryId(null)} />

      {!gateOpen ? (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ width: "min(620px, 100%)", background: "#fff", borderRadius: 24, border: "1px solid #dde4e7", boxShadow: "0 24px 60px rgba(0,0,0,.08)", padding: 28 }}>
            <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 26, fontWeight: 700, color: "#132131", marginBottom: 8 }}>Pharma Service<span style={{ color: col.teal }}>.</span></div>
            <div style={{ fontSize: 13, color: "#687888", marginBottom: 20 }}>Access partner offers and build your order directly from the products page.</div>

            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#132131", marginBottom: 8 }}>Pharmacy Name</div>
                <PharmacySearch value={pharmacyInput} onChange={(v) => { setPharmacyInput(v); setPharmacy(null); }} onSelect={(c) => { setPharmacy(c); setPharmacyInput(c.n); }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#132131", marginBottom: 8 }}>Your Name</div>
                <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Enter your contact name" style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "#fff", border: "1px solid #d8dedf", fontSize: 14, outline: "none" }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#132131", marginBottom: 8 }}>Mobile Number <span style={{ color: "#7b8a98", fontWeight: 400 }}>(optional)</span></div>
                <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="05X XXX XXXX" style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "#fff", border: "1px solid #d8dedf", fontSize: 14, outline: "none" }} />
              </div>
            </div>

            <button onClick={() => canEnter && setGateOpen(true)} disabled={!canEnter} style={{ width: "100%", marginTop: 20, padding: "16px 18px", borderRadius: 14, border: "none", background: canEnter ? col.teal : "#cfd7da", color: "#fff", fontFamily: "'Agrandir', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", cursor: canEnter ? "pointer" : "not-allowed" }}>Access Offers →</button>
          </div>
        </div>
      ) : (
        <>
          <header style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(10,22,40,.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${col.line}` }}>
            <div style={{ maxWidth: 1440, margin: "0 auto", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 28, fontWeight: 700 }}>Welcome, {pharmacyInput}</div>
                <div style={{ color: col.teal, fontSize: 14, marginTop: 4 }}>{contactName}{mobile ? ` · ${mobile}` : ""}</div>
              </div>
              <div className="hide-mobile" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ padding: "10px 14px", border: `1px solid ${col.line}`, borderRadius: 999, color: col.text, fontSize: 12 }}>25% discount</div>
                <div style={{ padding: "10px 14px", border: `1px solid ${col.line}`, borderRadius: 999, color: col.text, fontSize: 12 }}>120-day terms</div>
                <div style={{ padding: "10px 14px", border: `1px solid ${col.line}`, borderRadius: 999, color: col.text, fontSize: 12 }}>Live order sidebar</div>
              </div>
            </div>
          </header>

          <main className="mobile-pad" style={{ maxWidth: 1440, margin: "0 auto", padding: "24px" }}>
            <div className="desktop-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 360px", gap: 24, alignItems: "start" }}>
              <section>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ color: col.teal, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 10 }}>Product Catalogue</div>
                  <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 38, fontWeight: 700, lineHeight: 1.05, marginBottom: 10 }}>Build your order without leaving this page.</div>
                  <div style={{ color: col.text, fontSize: 15, lineHeight: 1.8, maxWidth: 820 }}>Choose the products, select the bonus tier, and add them into the live order sidebar. Your pharmacy and contact details will be embedded automatically into the WhatsApp order message.</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 20 }}>
                  {PRODUCTS.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      selected={selected[product.id]}
                      setSelected={setSelected}
                      added={!!added[product.id]}
                      setAdded={setAdded}
                      onOpenGallery={setGalleryId}
                    />
                  ))}
                </div>
              </section>

              <aside className="sidebar" style={{ position: "sticky", top: 110 }}>
                <div style={{ background: "rgba(248,245,240,0.05)", border: `1px solid ${col.line}`, borderRadius: 24, boxShadow: "0 16px 40px rgba(0,0,0,.2)", padding: 22 }}>
                  <div style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Order Summary</div>
                  <div style={{ color: col.text, fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>Desktop users stay on this page while the order builds in real time.</div>

                  <div style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${col.line}`, borderRadius: 16, padding: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: col.muted, marginBottom: 6 }}>Buyer</div>
                    <div style={{ fontFamily: "'Agrandir', sans-serif", fontWeight: 700, fontSize: 16 }}>{pharmacyInput}</div>
                    <div style={{ color: col.teal, fontSize: 13, marginTop: 4 }}>{contactName}</div>
                  </div>

                  {summary.lines.length === 0 ? (
                    <div style={{ background: "rgba(255,255,255,.03)", border: `1px dashed ${col.line}`, borderRadius: 16, padding: 18, color: col.muted, fontSize: 14, lineHeight: 1.7 }}>No items added yet. Pick a pack size on any product card, then press Add to Order.</div>
                  ) : (
                    <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
                      {summary.lines.map(({ p, tier, total }) => (
                        <div key={p.id} style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${col.line}`, borderRadius: 16, padding: 14 }}>
                          <div style={{ fontFamily: "'Agrandir', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{p.name}</div>
                          <div style={{ color: col.text, fontSize: 13 }}>{tier.label} · {tier.buy} paid + {tier.free} free = {tier.total}</div>
                          <div style={{ color: col.gold, fontFamily: "'Agrandir', sans-serif", fontSize: 16, fontWeight: 700, marginTop: 8 }}>{total.toFixed(2)} AED</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ background: "rgba(0,168,150,.12)", border: "1px solid rgba(0,168,150,.28)", borderRadius: 18, padding: 16, marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: col.text, fontSize: 13 }}>Total units</span><span style={{ fontFamily: "'Agrandir', sans-serif", fontWeight: 700 }}>{summary.totalQty}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: col.text, fontSize: 13 }}>Free units</span><span style={{ fontFamily: "'Agrandir', sans-serif", fontWeight: 700, color: col.teal }}>{summary.totalFree}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: col.text, fontSize: 13 }}>Terms</span><span style={{ fontFamily: "'Agrandir', sans-serif", fontWeight: 700, color: col.gold }}>120 days</span></div>
                    <div style={{ height: 1, background: "rgba(248,245,240,.12)", margin: "10px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 15, fontWeight: 700 }}>Total</span><span style={{ fontFamily: "'Agrandir', sans-serif", fontSize: 24, fontWeight: 700 }}>{summary.totalAED.toFixed(2)} AED</span></div>
                  </div>

                  <a href={summary.lines.length ? whatsappHref : "#"} target="_blank" rel="noreferrer" onClick={(e) => !summary.lines.length && e.preventDefault()} style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", textDecoration: "none", padding: "16px 18px", borderRadius: 16, fontFamily: "'Agrandir', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", background: summary.lines.length ? col.teal : "rgba(255,255,255,.05)", color: summary.lines.length ? col.cream : col.muted, border: summary.lines.length ? `1px solid ${col.teal}` : `1px solid ${col.line}` }}>Send Order via WhatsApp</a>
                </div>
              </aside>
            </div>
          </main>
        </>
      )}
    </div>
  );
}
