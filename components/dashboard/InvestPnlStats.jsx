"use client";
import { useState, useEffect } from "react";
import { useUnlock } from "./UnlockProvider";
import { copyMasterPnl } from "@/lib/clientStore";

const ANALYTICS_START_MONTH = "2026-06";

const DEMO_ROWS = [
  { month: "2026-04", spot: 1.9, stock: 0.8, margin: 0.5, perps: 1.3 },
  { month: "2026-05", spot: 2.6, stock: 1.4, margin: -0.4, perps: 2.0 },
  { month: "2026-06", spot: 3.2, stock: 1.7, margin: 0.9, perps: 2.6 },
].map((r) => ({ ...r, total: r.spot + r.stock + r.margin + r.perps }));

const CATS = [
  {
    k: "spot", label: "Spot crypto", color: "#C9A24B",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 8h4.5a2.5 2.5 0 0 1 0 5H9m0-5v8m0-5h5.5a2.5 2.5 0 0 1 0 5H9" />
        <line x1="10" y1="6" x2="10" y2="8" /><line x1="10" y1="16" x2="10" y2="18" />
      </svg>
    ),
  },
  {
    k: "stock", label: "Actions US / ETF", color: "#7C5CFC",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 17 8 12 12 16 17 9 21 13" />
        <line x1="3" y1="20" x2="21" y2="20" />
        <line x1="21" y1="9" x2="21" y2="13" />
      </svg>
    ),
  },
  {
    k: "margin", label: "Margin Trading", color: "#5BA8FF",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 16V8m0 8-3-3m3 3 3-3M17 8v8m0-8 3 3m-3-3-3 3" />
        <line x1="3" y1="12" x2="21" y2="12" strokeOpacity="0.3" />
      </svg>
    ),
  },
  {
    k: "perps", label: "Futures (Swing Trading)", color: "#19C37D",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
];

function Kpi({ label, value, cls }) {
  return (
    <div className="rounded-2xl border hairline bg-ink-800/50 p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">{label}</div>
      <div className={`mt-1.5 font-display text-[20px] ${cls || "text-bone"}`}>{value}</div>
    </div>
  );
}

export default function InvestPnlStats({ onGoInvest, showButton = true }) {
  const { locked } = useUnlock();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    if (locked) { setRows(DEMO_ROWS); return; }
    (async () => {
      const [sp, pp] = await Promise.all([
        fetch("/api/kraken/spot-monthly-pnl").then((r) => r.json()).catch(() => null),
        copyMasterPnl().catch(() => ({ months: [] })),
      ]);
      const map = {};
      const ensure = (m) => (map[m] = map[m] || { spot: 0, margin: 0, perps: 0, stock: 0 });
      (sp?.months || []).forEach((m) => { ensure(m.month).spot = m.spot; map[m.month].margin = m.margin; map[m.month].stock = m.stock || 0; });
      (pp?.months || []).forEach((m) => { ensure(m.month).perps = m.pnl; });
      const arr = Object.entries(map)
        .map(([month, v]) => ({ month, ...v, total: v.spot + v.margin + v.perps + v.stock }))
        .filter((r) => r.month >= ANALYTICS_START_MONTH)
        .sort((a, b) => a.month.localeCompare(b.month));
      setRows(arr);
    })();
  }, [locked]);

  if (!rows) return null;

  const totalAll = rows.reduce((s, r) => s + r.total, 0);
  const denomAbs = rows.reduce((s, r) => s + Math.abs(r.spot) + Math.abs(r.stock) + Math.abs(r.margin) + Math.abs(r.perps), 0);
  const pct = (v) => (denomAbs > 0 ? (v / denomAbs) * 100 : 0);
  const pctStr = (v) => `${v >= 0 ? "+" : ""}${pct(v).toFixed(1)} %`;
  const DISPLAY_MULT = 100;
  const dUsd = (v) => "$" + Math.abs(Number(v) * DISPLAY_MULT).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dUsdSigned = (v) => `${v >= 0 ? "+" : "−"}${dUsd(v)}`;
  const signClass = (v) => (Number(v) >= 0 ? "text-emerald-400" : "text-rose-400");
  const sumCat = (k) => rows.reduce((s, r) => s + (r[k] || 0), 0);

  return (
    <div className="mt-5">
      {/* PnL par catégorie */}
      <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60 mb-3">PnL cumulé par stratégie</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {CATS.map((c) => {
          const v = sumCat(c.k);
          return (
            <div key={c.k} className="rounded-2xl border hairline bg-ink-800/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="grid place-items-center h-7 w-7 shrink-0 rounded-lg"
                      style={{ background: `${c.color}22`, color: c.color }}>
                  {c.icon}
                </span>
                <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60 leading-tight">{c.label}</div>
              </div>
              <div className={`font-display text-[20px] ${signClass(v)}`}>{dUsdSigned(v)}</div>
              <div className={`text-[11px] ${signClass(v)}`}>{pctStr(v)}</div>
            </div>
          );
        })}
      </div>

      {/* KPIs globaux */}
      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <Kpi label="PnL cumulé" value={`${dUsdSigned(totalAll)} · ${pctStr(totalAll)}`} cls={`font-display text-[20px] ${signClass(totalAll)}`} />
        <Kpi label="Mois suivis" value={rows.length} />
        <Kpi label="Mois positifs" value={`${rows.filter((r) => r.total >= 0).length} / ${rows.length}`} />
      </div>

      {/* Bouton Voir les actifs */}
      {showButton && (
        <button
          onClick={onGoInvest}
          className="w-full flex items-center justify-between gap-3 rounded-xl border gold-line bg-gradient-to-r from-ink-700/60 to-ink-900 px-4 py-2.5 hover:border-gold/50 transition-colors"
        >
          <span className="text-[13px] text-bone font-medium">Voir les actifs — Pôle Invest</span>
          <span className="btn-gold inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap shrink-0">
            Voir
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
