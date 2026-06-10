"use client";

import { useEffect, useState, useCallback } from "react";

// Couleurs par catégorie (identification rapide)
const CAT = {
  crypto: { label: "Spot crypto", color: "#C9A24B" },
  stock: { label: "Actions / ETF tokenisés", color: "#7C5CFC" },
  margin: { label: "Marge (positions)", color: "#5BA8FF" },
  perps: { label: "Futures crypto (perps)", color: "#19C37D" },
  cash: { label: "Cash / stables", color: "#8A93A6" },
};

// Confidentialité : on n'affiche jamais les montants ($ / quantités) — masqués.
// Seuls les pourcentages (répartition) sont visibles.
const MASK = "****";
const fmtUsd = () => MASK;
const fmtAmt = () => MASK;
const pct = (v, t) => (t > 0 ? (v / t) * 100 : 0);

function Table({ rows, cols }) {
  if (!rows.length) return <p className="px-5 py-4 text-[13px] text-mist">Aucun actif.</p>;
  return (
    <table className="w-full text-[13.5px]">
      <thead>
        <tr className="text-left font-mono text-[10px] uppercase tracking-widest2 text-mist/60 border-b hairline">
          {cols.map((c) => (
            <th key={c.k} className={`px-5 py-3 ${c.right ? "text-right" : ""} ${c.hide || ""}`}>{c.h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b hairline last:border-0">
            {cols.map((c) => (
              <td key={c.k} className={`px-5 py-3 ${c.right ? "text-right font-mono" : ""} ${c.cls ? c.cls(r) : "text-bone"} ${c.hide || ""}`}>
                {c.render ? c.render(r) : r[c.k]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Section({ title, dot, children }) {
  return (
    <div className="rounded-2xl border hairline bg-ink-800/40 overflow-hidden">
      <div className="px-5 py-3 border-b hairline flex items-center gap-2">
        {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot }} />}
        <span className="font-display text-[15px] text-bone">{title}</span>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export default function PortfolioKraken() {
  const [loading, setLoading] = useState(true);
  const [spot, setSpot] = useState(null);
  const [fut, setFut] = useState(null);
  const [futPos, setFutPos] = useState(null);
  const [marginPos, setMarginPos] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, f, fp, mp] = await Promise.all([
      fetch("/api/kraken/spot/portfolio").then((r) => r.json()).catch(() => null),
      fetch("/api/kraken/futures/account").then((r) => r.json()).catch(() => null),
      fetch("/api/kraken/futures/positions").then((r) => r.json()).catch(() => null),
      fetch("/api/kraken/spot/positions").then((r) => r.json()).catch(() => null),
    ]);
    setSpot(s); setFut(f); setFutPos(fp);
    // OpenPositions (marge) : result = { txid: {...} }
    const raw = mp?.result || {};
    const list = Object.entries(raw).map(([id, p]) => ({
      id, pair: p.pair, side: p.type, vol: p.vol,
      value: parseFloat(p.value ?? p.cost ?? 0) || 0,
      net: parseFloat(p.net ?? 0) || 0,
    }));
    setMarginPos(list);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const holdings = spot?.ok ? spot.holdings : [];
  const t = spot?.totals || {};

  // Part de chaque ligne au sein de sa catégorie (calculée sur les vraies valeurs)
  const withShare = (rows) => {
    const tot = rows.reduce((s, r) => s + (r.value || 0), 0);
    return rows.map((r) => ({ ...r, _share: tot > 0 ? ((r.value || 0) / tot) * 100 : 0 }));
  };
  const crypto = withShare(holdings.filter((h) => h.kind === "crypto"));
  const stocks = withShare(holdings.filter((h) => h.kind === "stock"));
  const cash = holdings.filter((h) => h.kind === "cash");

  const futValue =
    fut?.data?.accounts?.flex?.portfolioValue ??
    fut?.data?.accounts?.flex?.collateralValue ?? 0;
  const futPositions = futPos?.data?.openPositions || [];
  const marginTotal = marginPos.reduce((s, p) => s + p.value, 0);
  const marginRows = marginPos.map((p) => ({
    ...p,
    _share: marginTotal > 0 ? (p.value / marginTotal) * 100 : 0,
  }));

  // Valeurs par catégorie (composition)
  const comp = {
    crypto: t.crypto || 0,
    stock: t.stock || 0,
    margin: marginTotal,
    perps: Number(futValue) || 0,
    cash: t.cash || 0,
  };
  const total = Object.values(comp).reduce((s, v) => s + v, 0);
  const segs = Object.entries(comp).filter(([, v]) => v > 0);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-display text-[18px] text-bone">Portefeuille Kraken</h3>
        <span className="font-mono text-[9px] uppercase tracking-widest2 rounded px-1.5 py-0.5 border"
              style={{ color: "#7C5CFC", borderColor: "rgba(124,92,252,0.4)" }}>lecture seule</span>
        <button onClick={load} className="ml-auto text-[12px] text-mist hover:text-bone">↻ rafraîchir</button>
      </div>

      {/* Hero total + composition */}
      <div className="relative rounded-3xl border overflow-hidden p-7 mb-5" style={{ borderColor: "rgba(124,92,252,0.30)" }}>
        <div className="pointer-events-none absolute -top-20 -right-10 h-56 w-56 rounded-full blur-3xl"
             style={{ background: "radial-gradient(circle, rgba(124,92,252,0.22), transparent 70%)" }} />
        <div className="relative">
          <div className="font-mono text-[10px] uppercase tracking-widest2" style={{ color: "#7C5CFC" }}>
            Valeur totale (estimée) · composition du portefeuille
          </div>
          <div className="mt-2 font-display text-[40px] md:text-[46px] leading-none text-bone">
            {loading ? "…" : fmtUsd(total)}
          </div>

          {/* Barre de composition segmentée */}
          <div className="mt-5 flex h-3.5 w-full rounded-full overflow-hidden bg-white/[0.05]">
            {segs.map(([k, v]) => (
              <div key={k} title={`${CAT[k].label} — ${fmtUsd(v)}`}
                   style={{ width: `${pct(v, total)}%`, background: CAT[k].color }} />
            ))}
          </div>

          {/* Légende */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(CAT).map(([k, c]) => (
              <div key={k} className="flex items-start gap-2">
                <span className="mt-1 h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: c.color }} />
                <div className="leading-tight">
                  <div className="text-[12px] text-bone">{c.label}</div>
                  <div className="font-mono text-[12px] text-mist">
                    {fmtUsd(comp[k])} <span className="text-mist/50">· {pct(comp[k], total).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables par catégorie */}
      <div className="space-y-5">
        <Section title="Spot crypto" dot={CAT.crypto.color}>
          <Table rows={crypto} cols={[
            { k: "symbol", h: "Actif" },
            { k: "_share", h: "Part", right: true, cls: () => "text-gold", render: (r) => `${r._share.toFixed(1)} %` },
            { k: "amount", h: "Quantité", right: true, hide: "hidden sm:table-cell", render: (r) => fmtAmt(r.amount) },
            { k: "value", h: "Valeur", right: true, render: (r) => fmtUsd(r.value) },
          ]} />
        </Section>

        <Section title="Actions / ETF tokenisés" dot={CAT.stock.color}>
          <Table rows={stocks} cols={[
            { k: "symbol", h: "Titre" },
            { k: "_share", h: "Part", right: true, cls: () => "text-gold", render: (r) => `${r._share.toFixed(1)} %` },
            { k: "amount", h: "Quantité", right: true, hide: "hidden sm:table-cell", render: (r) => fmtAmt(r.amount) },
            { k: "value", h: "Valeur", right: true, render: (r) => fmtUsd(r.value) },
          ]} />
        </Section>

        <Section title="Positions sur marge" dot={CAT.margin.color}>
          <Table rows={marginRows} cols={[
            { k: "pair", h: "Paire" },
            { k: "side", h: "Sens", cls: (r) => (r.side === "buy" ? "text-emerald-400" : "text-rose-400"), render: (r) => (r.side === "buy" ? "Long" : "Short") },
            { k: "_share", h: "Part", right: true, cls: () => "text-gold", render: (r) => `${r._share.toFixed(1)} %` },
            { k: "value", h: "Valeur", right: true, hide: "hidden sm:table-cell", render: (r) => fmtUsd(r.value) },
            { k: "net", h: "P&L", right: true, cls: (r) => (r.net >= 0 ? "text-emerald-400" : "text-rose-400"), render: (r) => `${r.net >= 0 ? "+" : ""}${fmtUsd(r.net)}` },
          ]} />
        </Section>

        <Section title="Futures crypto (perps)" dot={CAT.perps.color}>
          {futPositions.length === 0 ? (
            <p className="px-5 py-4 text-[13px] text-mist">Aucune position future ouverte.</p>
          ) : (
            <Table rows={futPositions} cols={[
              { k: "symbol", h: "Symbole" },
              { k: "side", h: "Sens", cls: (r) => (r.side === "long" ? "text-emerald-400" : "text-rose-400") },
              { k: "size", h: "Taille", right: true },
              { k: "price", h: "Prix", right: true },
            ]} />
          )}
        </Section>

        <Section title="Cash & stablecoins" dot={CAT.cash.color}>
          <Table rows={cash} cols={[
            { k: "symbol", h: "Devise" },
            { k: "amount", h: "Montant", right: true, render: (r) => fmtAmt(r.amount) },
            { k: "value", h: "Valeur", right: true, render: (r) => fmtUsd(r.value) },
          ]} />
        </Section>
      </div>

      <p className="mt-5 text-[11.5px] leading-relaxed text-mist/60">
        Vue agrégée en lecture seule. Valeurs estimées via les prix de marché ; aucune
        exécution d'ordre ni mouvement de fonds depuis cette interface.
      </p>
    </div>
  );
}
