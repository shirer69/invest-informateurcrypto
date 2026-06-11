"use client";

import { useEffect, useMemo, useState } from "react";
import { Locked } from "./UnlockProvider";
import LiveTag from "./LiveTag";

const DISPLAY_MULT = 100; // montants à l'échelle du compte (× 100)
const fmtUsd = (x) =>
  x == null ? "—" : "$" + Number(x * DISPLAY_MULT).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPx = (x) =>
  x == null ? "—" : Number(x).toLocaleString("fr-FR", { maximumFractionDigits: 6 });
const fmtDate = (s) =>
  !s ? "—" : new Date(s * 1000).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

const CATS = [
  { id: "all", label: "Tout" },
  { id: "spot", label: "Spot" },
  { id: "xstocks", label: "Actions US (xStocks)" },
  { id: "marge", label: "Marge" },
  { id: "perps", label: "Perps" },
];
const CAT_LABEL = { spot: "Spot", xstocks: "xStocks", marge: "Marge", perps: "Perps" };
const CAT_COLOR = { spot: "text-gold", xstocks: "text-violet-400", marge: "text-cyan-400", perps: "text-emerald-400" };

export default function Logs() {
  const [trades, setTrades] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let alive = true;
    (async () => {
      const [sp, fu] = await Promise.all([
        fetch("/api/kraken/spot/trades").then((r) => r.json()).catch(() => null),
        fetch("/api/kraken/futures/fills").then((r) => r.json()).catch(() => null),
      ]);
      if (!alive) return;
      const all = [...((sp?.trades) || []), ...((fu?.trades) || [])].sort((a, b) => b.ts - a.ts);
      setTrades(all);
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
                    <td className="px-4 py-2.5 text-right font-mono text-bone">{fmtUsd(t.cost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-mist/50">
          Historique consolidé en lecture seule : trades spot, actions US (xStocks), marge et perps.
          Montants affichés à l'échelle du compte.
        </p>
      </Locked>
    </div>
  );
}
