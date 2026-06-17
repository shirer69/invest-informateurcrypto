"use client";

import { useEffect, useState } from "react";
import { LAUNCH_ISO } from "@/lib/site";

const TARGET = new Date(LAUNCH_ISO).getTime();

function diff() {
  const ms = TARGET - Date.now();
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return {
    j: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

const pad = (n) => String(n).padStart(2, "0");

/* ── Compact inline variant (Hero / landing) ───────────────────────────── */
export default function Countdown({ variant = "hero" }) {
  const [t, setT] = useState(undefined);

  useEffect(() => {
    setT(diff());
    const id = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  if (t === undefined) return <div className="h-[72px]" aria-hidden />;

  /* ── Post-lancement ── */
  if (t === null) {
    return (
      <div className="inline-flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/[0.06] px-5 py-3">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-[11px] uppercase tracking-widest2 text-emerald-300">
          Portefeuille INVEST — démarré
        </span>
      </div>
    );
  }

  const cells = [
    { v: t.j, l: "Jours" },
    { v: t.h, l: "Heures" },
    { v: t.m, l: "Min" },
    { v: t.s, l: "Sec" },
  ];

  if (variant === "dashboard") {
    /* ── Variant dashboard : banner plein bloc ── */
    return (
      <div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] px-5 py-4 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-amber-400 text-[14px]">⚠️</span>
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-amber-400/90">
                Démarrage du portefeuille INVEST
              </span>
            </div>
            <p className="text-[13px] text-mist/70 leading-snug">
              Le suivi de performance démarre le{" "}
              <span className="text-bone font-semibold">24 juin 2026</span>.
              Les montants sont déjà en direct — le P&amp;L sera calculé à partir de cette date.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {cells.map((c, i) => (
              <div key={c.l} className="flex items-center gap-2">
                <div className="min-w-[46px] rounded-xl border border-amber-400/30 bg-black/20 px-2 py-1.5 text-center">
                  <div className="font-display text-[20px] leading-none tabular-nums text-amber-300">
                    {pad(c.v)}
                  </div>
                  <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.15em] text-mist/50">
                    {c.l}
                  </div>
                </div>
                {i < cells.length - 1 && (
                  <span className="font-display text-[16px] text-amber-400/40 leading-none">:</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Variant hero (landing page) ── */
  return (
    <div className="inline-flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[11px]">⚠️</span>
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-amber-400/90">
          Démarrage du portefeuille INVEST · 24 juin 2026
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {cells.map((c, i) => (
          <div key={c.l} className="flex items-center gap-1.5">
            <div className="min-w-[52px] rounded-xl border border-amber-400/30 bg-amber-400/[0.06] px-2 py-1.5 text-center backdrop-blur-sm">
              <div className="font-display text-[22px] leading-none tabular-nums text-amber-200">
                {pad(c.v)}
              </div>
              <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-mist/60">
                {c.l}
              </div>
            </div>
            {i < cells.length - 1 && (
              <span className="font-display text-[18px] text-amber-400/40 leading-none">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
