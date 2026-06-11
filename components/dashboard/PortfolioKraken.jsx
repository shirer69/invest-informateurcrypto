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
  const [ftk, setFtk] = useState({}); // map symbole -> prix mark (perps)

  const load = useCallback(async () => {
    setLoading(true);
    const [s, f, fp, mp, tk] = await Promise.all([
      fetch("/api/kraken/spot/portfolio").then((r) => r.json()).catch(() => null),
      fetch("/api/kraken/futures/account").then((r) => r.json()).catch(() => null),
      fetch("/api/kraken/futures/positions").then((r) => r.json()).catch(() => null),
      fetch("/api/kraken/spot/positions").then((r) => r.json()).catch(() => null),
      fetch("/api/kraken/futures/tickers").then((r) => r.json()).catch(() => null),
    ]);
    setSpot(s); setFut(f); setFutPos(fp);
    const map = {};
    for (const t of (tk?.tickers || [])) {
      const p = parseFloat(t.markPrice ?? t.last ?? 0);
      if (t.symbol && p) map[t.symbol.toUpperCase()] = p;
    }
    setFtk(map);
    // OpenPositions (marge) : result = { txid: {...} }
    const raw = mp?.result || {};
    const list = Object.entries(raw).map(([id, p]) => ({
      id, pair: p.pair, side: p.type,
      vol: parseFloat(p.vol) || 0,
      cost: parseFloat(p.cost) || 0,
      margin: parseFloat(p.margin) || 0,
      value: parseFloat(p.value ?? p.cost ?? 0) || 0,
      net: parseFloat(p.net ?? 0) || 0,
    }));
    setMarginPos(list);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const holdings = spot?.ok ? spot.holdings : [];
  const t = spot?.totals || {};

  const futValue =
    fut?.data?.accounts?.flex?.portfolioValue ??
    fut?.data?.accounts?.flex?.collateralValue ?? 0;
  const futPositionsRaw = futPos?.data?.openPositions || [];
  const marginTotal = marginPos.reduce((s, p) => s + p.value, 0);

  // Composition globale
  const comp = {
    crypto: t.crypto || 0,
    stock: t.stock || 0,
    margin: marginTotal,
    perps: Number(futValue) || 0,
    cash: t.cash || 0,
  };
  const total = Object.values(comp).reduce((s, v) => s + v, 0);
  const segs = Object.entries(comp).filter(([, v]) => v > 0);

  // Part & P&L TOUJOURS relatifs à la valeur totale du portefeuille
  const shareOf = (v) => (total > 0 ? ((v || 0) / total) * 100 : 0);
  const pnlPctOf = (net) => (total > 0 ? ((net || 0) / total) * 100 : null);
  const px = (n) => (n && isFinite(n) ? Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 6 }) : "—");
  const pnlCell = (r) => (r._pnl == null ? "—" : `${r._pnl >= 0 ? "+" : ""}${r._pnl.toFixed(2)} %`);

  const crypto = holdings.filter((h) => h.kind === "crypto").map((h) => ({ ...h, cur: h.price, _share: shareOf(h.value) }));
  const stocks = holdings.filter((h) => h.kind === "stock").map((h) => ({ ...h, cur: h.price, _share: shareOf(h.value) }));
  const cash = holdings.filter((h) => h.kind === "cash").map((h) => ({ ...h, _share: shareOf(h.value) }));

  const marginRows = marginPos.map((p) => ({
    ...p,
    entry: p.vol > 0 ? p.cost / p.vol : null,
    cur: p.vol > 0 ? p.value / p.vol : null, // prix actuel ≈ valeur courante / volume
    lev: p.margin > 0 ? p.cost / p.margin : null,
    tp: null, sl: null,
    _share: shareOf(p.value),
    _pnl: pnlPctOf(p.net),
  }));

  const perps = futPositionsRaw.map((p) => {
    const size = parseFloat(p.size) || 0;
    const entry = parseFloat(p.price) || 0;
    const sym = (p.symbol || "").toUpperCase();
    const cur = ftk[sym] || null; // prix mark live
    const pnl = p.pnl != null ? parseFloat(p.pnl) : null;
    return {
      symbol: sym,
      side: p.side,
      entry,
      cur,
      lev: p.leverage != null ? parseFloat(p.leverage) : (p.maxLeverage != null ? parseFloat(p.maxLeverage) : null),
      tp: null, sl: null,
      _share: shareOf(size * entry),
      _pnl: pnl != null ? pnlPctOf(pnl) : null,
    };
  });

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
                  <div className="font-mono text-[13px] text-bone">
                    {pct(comp[k], total).toFixed(0)}<span className="text-mist/60"> %</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Note : tout est relatif au portefeuille total */}
      <div className="rounded-xl border gold-line bg-gold/[0.04] px-4 py-2.5 mb-4">
        <p className="text-[11.5px] leading-relaxed text-mist">
          <span className="text-gold">ⓘ</span> La <span className="text-bone">Part</span> et le{" "}
          <span className="text-bone">P&L</span> de chaque ligne sont exprimés en{" "}
          <span className="text-bone">% de la valeur totale du portefeuille</span> (spot + actions +
          marge + perps + cash). Les montants restent confidentiels.
        </p>
      </div>

      {/* Tables par catégorie */}
      <div className="space-y-5">
        <Section title="Spot crypto" dot={CAT.crypto.color}>
          <Table rows={crypto} cols={[
            { k: "symbol", h: "Actif" },
            { k: "cur", h: "Prix actuel", right: true, hide: "hidden sm:table-cell", render: (r) => px(r.cur) },
            { k: "_share", h: "Part", right: true, cls: () => "text-gold", render: (r) => `${r._share.toFixed(1)} %` },
            { k: "_pnl", h: "P&L", right: true, cls: (r) => (r._pnl == null ? "text-mist" : r._pnl >= 0 ? "text-emerald-400" : "text-rose-400"), render: pnlCell },
          ]} />
        </Section>

        <Section title="Actions / ETF tokenisés" dot={CAT.stock.color}>
          <Table rows={stocks} cols={[
            { k: "symbol", h: "Titre" },
            { k: "_share", h: "Part", right: true, cls: () => "text-gold", render: (r) => `${r._share.toFixed(1)} %` },
            { k: "_pnl", h: "P&L", right: true, cls: (r) => (r._pnl == null ? "text-mist" : r._pnl >= 0 ? "text-emerald-400" : "text-rose-400"), render: pnlCell },
          ]} />
        </Section>

        <Section title="Positions sur marge" dot={CAT.margin.color}>
          <Table rows={marginRows} cols={[
            { k: "pair", h: "Paire" },
            { k: "side", h: "Sens", cls: (r) => (r.side === "buy" ? "text-emerald-400" : "text-rose-400"), render: (r) => (r.side === "buy" ? "Long" : "Short") },
            { k: "entry", h: "Entrée", right: true, hide: "hidden sm:table-cell", render: (r) => px(r.entry) },
            { k: "cur", h: "Prix actuel", right: true, hide: "hidden sm:table-cell", render: (r) => px(r.cur) },
            { k: "lev", h: "Levier", right: true, hide: "hidden md:table-cell", render: (r) => (r.lev ? `×${r.lev.toFixed(1)}` : "—") },
            { k: "tp", h: "TP", right: true, hide: "hidden md:table-cell", render: (r) => px(r.tp) },
            { k: "sl", h: "SL", right: true, hide: "hidden md:table-cell", render: (r) => px(r.sl) },
            { k: "_share", h: "Part", right: true, cls: () => "text-gold", render: (r) => `${r._share.toFixed(1)} %` },
            { k: "_pnl", h: "P&L", right: true, cls: (r) => (r._pnl == null ? "text-mist" : r._pnl >= 0 ? "text-emerald-400" : "text-rose-400"), render: pnlCell },
          ]} />
        </Section>

        <Section title="Futures crypto (perps)" dot={CAT.perps.color}>
          {perps.length === 0 ? (
            <p className="px-5 py-4 text-[13px] text-mist">Aucune position future ouverte.</p>
          ) : (
            <Table rows={perps} cols={[
              { k: "symbol", h: "Symbole" },
              { k: "side", h: "Sens", cls: (r) => (r.side === "long" ? "text-emerald-400" : "text-rose-400") },
              { k: "entry", h: "Entrée", right: true, hide: "hidden sm:table-cell", render: (r) => px(r.entry) },
              { k: "cur", h: "Prix actuel", right: true, hide: "hidden sm:table-cell", render: (r) => px(r.cur) },
              { k: "lev", h: "Levier", right: true, hide: "hidden md:table-cell", render: (r) => (r.lev ? `×${r.lev.toFixed(1)}` : "—") },
              { k: "tp", h: "TP", right: true, hide: "hidden md:table-cell", render: (r) => px(r.tp) },
              { k: "sl", h: "SL", right: true, hide: "hidden md:table-cell", render: (r) => px(r.sl) },
              { k: "_share", h: "Part", right: true, cls: () => "text-gold", render: (r) => `${r._share.toFixed(1)} %` },
              { k: "_pnl", h: "P&L", right: true, cls: (r) => (r._pnl == null ? "text-mist" : r._pnl >= 0 ? "text-emerald-400" : "text-rose-400"), render: pnlCell },
            ]} />
          )}
        </Section>

        <Section title="Cash & stablecoins" dot={CAT.cash.color}>
          <Table rows={cash} cols={[
            { k: "symbol", h: "Devise" },
            { k: "_share", h: "Part", right: true, cls: () => "text-gold", render: (r) => `${r._share.toFixed(1)} %` },
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
