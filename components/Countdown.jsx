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

export default function Countdown() {
  const [t, setT] = useState(undefined); // undefined = pas encore monté (évite mismatch SSR)

  useEffect(() => {
    setT(diff());
    const id = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  if (t === undefined) {
    // placeholder de même hauteur avant hydratation
    return <div className="h-[58px]" aria-hidden />;
  }

  if (t === null) {
    return (
      <div className="inline-flex items-center gap-2.5 rounded-2xl border gold-line bg-gold/[0.06] px-5 py-3">
        <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
        <span className="font-mono text-[12px] uppercase tracking-widest2 text-gold">
          Les accès au Pôle Invest sont ouverts
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

  return (
    <div className="inline-flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">
        Ouverture des accès · dimanche 20h
      </span>
      <div className="flex items-center gap-2">
        {cells.map((c, i) => (
          <div key={c.l} className="flex items-center gap-2">
            <div className="min-w-[54px] rounded-xl border gold-line bg-white/[0.03] px-2.5 py-2 text-center backdrop-blur-sm">
              <div className="font-display text-[24px] leading-none tabular-nums text-bone">
                {pad(c.v)}
              </div>
              <div className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.18em] text-mist">
                {c.l}
              </div>
            </div>
            {i < cells.length - 1 && (
              <span className="font-display text-[20px] text-gold/40 leading-none">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
