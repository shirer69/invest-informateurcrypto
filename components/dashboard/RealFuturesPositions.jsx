"use client";

import { useEffect, useState, useCallback } from "react";

// Positions du compte Futures Kraken RÉEL (lecture seule via /api/kraken/futures/*).
// États : chargement · non configuré · compte non activé · aucune position · liste.
export default function RealFuturesPositions({ compact = false }) {
  const [state, setState] = useState("loading"); // loading | inactive | notconf | empty | ok | error
  const [rows, setRows] = useState([]);

  const load = useCallback(async () => {
    try {
      const [pr, tk] = await Promise.all([
        fetch("/api/kraken/futures/positions").then((r) => r.json()).catch(() => null),
        fetch("/api/kraken/futures/tickers").then((r) => r.json()).catch(() => null),
      ]);
      if (!pr || !pr.ok) {
        const err = pr?.error || "";
        if (err === "not_configured") setState("notconf");
        else if (/inactive/i.test(err)) setState("inactive");
        else setState("error");
        setRows([]);
        return;
      }
      const marks = {};
      for (const t of (tk?.tickers || [])) {
        const p = parseFloat(t.markPrice ?? t.last ?? 0);
        if (t.symbol && p) marks[t.symbol.toLowerCase()] = p;
      }
      const open = pr.data?.openPositions || [];
      const parsed = open.map((p) => {
        const entry = parseFloat(p.price) || 0;
        const mark = marks[(p.symbol || "").toLowerCase()] || parseFloat(p.markPrice) || 0;
        const isLong = (p.side || "").toLowerCase() === "long";
        const pnlPct = entry && mark ? ((mark - entry) / entry) * 100 * (isLong ? 1 : -1) : null;
        return {
          symbol: (p.symbol || "").toUpperCase(),
          side: isLong ? "long" : "short",
          size: p.size,
          entry, mark, pnlPct,
        };
      });
      setRows(parsed);
      setState(parsed.length ? "ok" : "empty");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [load]);

  if (state === "loading")
    return <div className="text-[13px] text-mist/60">Chargement des positions…</div>;
  if (state === "notconf")
    return <div className="text-[13px] text-mist/60">Compte Futures non configuré.</div>;
  if (state === "inactive")
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.07] p-4 text-[13px] text-amber-100/90">
        Compte Futures Kraken <b>non encore activé</b> — aucune position à afficher pour l'instant.
        Les positions apparaîtront ici automatiquement dès l'activation du wallet Futures.
      </div>
    );
  if (state === "error")
    return <div className="text-[13px] text-mist/60">Positions momentanément indisponibles.</div>;
  if (state === "empty")
    return <div className="text-[13px] text-mist/60">Aucune position ouverte actuellement.</div>;

  const px = (n) => (n ? Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 6 }) : "—");

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[460px] text-[13px] font-mono">
        <thead>
          <tr className="text-left text-mist/60 text-[10px] uppercase tracking-widest2 border-b hairline">
            <th className="px-4 py-3">Marché</th>
            <th className="px-4 py-3">Sens</th>
            {!compact && <th className="px-4 py-3 text-right">Taille</th>}
            <th className="px-4 py-3 text-right">Entrée</th>
            <th className="px-4 py-3 text-right">Mark</th>
            <th className="px-4 py-3 text-right">PnL %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b hairline last:border-0">
              <td className="px-4 py-3 text-bone">{r.symbol}</td>
              <td className={`px-4 py-3 ${r.side === "long" ? "text-emerald-400" : "text-rose-400"}`}>{r.side}</td>
              {!compact && <td className="px-4 py-3 text-right text-mist">{r.size}</td>}
              <td className="px-4 py-3 text-right text-mist">{px(r.entry)}</td>
              <td className="px-4 py-3 text-right text-mist">{px(r.mark)}</td>
              <td className={`px-4 py-3 text-right ${r.pnlPct == null ? "text-mist" : r.pnlPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {r.pnlPct == null ? "—" : `${r.pnlPct >= 0 ? "+" : ""}${r.pnlPct.toFixed(2)} %`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
