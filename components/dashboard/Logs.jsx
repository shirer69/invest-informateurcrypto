"use client";

import { useEffect, useMemo, useState } from "react";
import { Locked } from "./UnlockProvider";
import LiveTag from "./LiveTag";
import { API_BASE } from "@/lib/site";

const DISPLAY_MULT = 100; // montants à l'échelle du compte (× 100)
const fmtUsd = (x) =>
  x == null ? "—" : "$" + Number(x * DISPLAY_MULT).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPx = (x) =>
  x == null ? "—" : Number(x).toLocaleString("fr-FR", { maximumFractionDigits: 6 });
const fmtDate = (s) =>
  !s ? "—" : new Date(s * 1000).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

const CATS = [
  { id: "all", label: "Tout" },
  { id: "forex", label: "Forex MoonX" },
  { id: "futures", label: "Futures MoonX" },
  { id: "spot", label: "Spot" },
  { id: "xstocks", label: "Actions US (xStocks)" },
  { id: "marge", label: "Marge" },
  { id: "perps", label: "Perps Kraken" },
];
const CAT_LABEL = { spot: "Spot", xstocks: "xStocks", marge: "Marge", perps: "Perps", forex: "Forex", futures: "Futures" };
const CAT_COLOR = { spot: "text-gold", xstocks: "text-violet-400", marge: "text-cyan-400", perps: "text-emerald-400", forex: "text-blue-400", futures: "text-indigo-400" };

export default function Logs() {
  const [trades, setTrades] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let alive = true;
    (async () => {
      const [d, fx] = await Promise.all([
        fetch(`${API_BASE}/api/julien/trade-history`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        fetch(`${API_BASE}/api/julien/trades`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      ]);
      if (!alive) return;

      const cleanPerp = (s) => {
        let x = (s || "").toLowerCase().replace(/^p[fi]_/, "").replace(/usd$/, "").toUpperCase();
        if (x === "XBT") x = "BTC";
        return x ? `${x}/USD` : (s || "");
      };

      const spot = d?.ok ? (d.spot_events || []).map((e) => {
        const price = e.exit_price || e.entry_price || 0;
        const cat = e.type === "stock" ? "xstocks" : e.type === "margin" ? "marge" : "spot";
        return {
          ts: e.created_at,
          market: e.symbol,
          cat,
          side: e.direction === "achat" ? "buy" : "sell",
          price,
          vol: e.amount,
          cost: (e.amount || 0) * price,
        };
      }) : [];

      const perps = d?.ok ? (Array.isArray(d.kraken_futures) ? d.kraken_futures : []).map((f) => ({
        ts: Math.floor(new Date(f.fillTime).getTime() / 1000),
        market: cleanPerp(f.symbol),
        cat: "perps",
        side: f.side,
        price: f.price,
        vol: f.size,
        cost: (f.size || 0) * (f.price || 0),
      })) : [];

      const forex = Array.isArray(fx?.trades) ? fx.trades.map((t) => ({
        ts: t.created_at,
        market: t.asset || "?",
        cat: t.type || "forex",
        side: (t.direction || "").toUpperCase() === "LONG" ? "buy" : "sell",
        price: t.exit_price ?? t.entry_price ?? null,
        vol: t.lots ?? null,
        pnl: t.pnl_usd ?? null,
        rawCost: true,
      })) : [];

      setTrades([...forex, ...spot, ...perps].sort((a, b) => b.ts - a.ts));
    })();
    return () => { alive = false; };
  }, []);

  const rows = useMemo(
    () => (trades || []).filter((t) => filter === "all" || t.cat === filter),
    [trades, filter]
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-display text-[18px] text-bone">Logs — historique des trades</h3>
        <LiveTag />
      </div>

      <Locked label="Déverrouiller l'historique">
        {/* filtres */}
        <div className="flex flex-wrap gap-2 mb-3">
          {CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`rounded-full px-3 py-1.5 text-[12px] border transition-colors ${
                filter === c.id ? "bg-gold/[0.12] text-bone gold-line" : "text-mist hover:text-bone border-white/10"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border hairline bg-ink-800/40 overflow-x-auto">
          <table className="w-full min-w-[680px] text-[13px]">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-widest2 text-mist/60 border-b hairline">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Marché</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Sens</th>
                <th className="px-4 py-3 text-right">Prix</th>
                <th className="px-4 py-3 text-right">Volume</th>
                <th className="px-4 py-3 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {trades === null && (
                <tr><td colSpan={7} className="px-4 py-5 text-[13px] text-mist/60">Chargement de l'historique…</td></tr>
              )}
              {trades !== null && rows.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-5 text-[13px] text-mist/60">Aucun trade sur cette catégorie.</td></tr>
              )}
              {rows.map((t, i) => {
                const buy = (t.side || "").startsWith("b");
                return (
                  <tr key={i} className="border-b hairline last:border-0">
                    <td className="px-4 py-2.5 font-mono text-[12px] text-mist">{fmtDate(t.ts)}</td>
                    <td className="px-4 py-2.5 text-bone">{t.market}</td>
                    <td className={`px-4 py-2.5 font-mono text-[11px] ${CAT_COLOR[t.cat] || "text-mist"}`}>{CAT_LABEL[t.cat] || t.cat}</td>
                    <td className={`px-4 py-2.5 ${buy ? "text-emerald-400" : "text-rose-400"}`}>{buy ? "Achat" : "Vente"}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-mist">{fmtPx(t.price)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-mist">{fmtPx(t.vol)}</td>
                    <td className={`px-4 py-2.5 text-right font-mono ${t.rawCost ? (t.pnl >= 0 ? "text-emerald-400" : "text-rose-400") : "text-bone"}`}>
                      {t.rawCost ? (t.pnl != null ? `${t.pnl >= 0 ? "+" : ""}$${Math.abs(t.pnl).toFixed(2)}` : "—") : fmtUsd(t.cost)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-mist/50">
          Historique consolidé en lecture seule : Forex MoonX (Julien Moretto), spot, actions US (xStocks), marge et perps Kraken.
          Montants Kraken affichés à l'échelle du compte (×100). PnL Forex en valeur réelle.
        </p>
      </Locked>
    </div>
  );
}
