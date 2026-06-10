"use client";

import { motion } from "framer-motion";
import { PERFORMANCE, TELEGRAM_URL } from "@/lib/site";

// Courbe d'equity stylisée (croissance avec respirations réalistes), normalisée 0..1
const SERIES = [
  0.02, 0.04, 0.03, 0.07, 0.11, 0.09, 0.15, 0.21, 0.19, 0.27, 0.34, 0.31,
  0.38, 0.42, 0.4, 0.47, 0.52, 0.5, 0.55, 0.6, 0.58, 0.64, 0.69, 0.67,
  0.72, 0.76, 0.74, 0.79, 0.83, 0.81, 0.86, 0.9, 0.88, 0.93, 0.97, 1.0,
];

const W = 720;
const H = 300;
const PAD_X = 14;
const PAD_TOP = 18;
const PAD_BOT = 34;

function buildPath(series) {
  const n = series.length;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOT;
  const pts = series.map((v, i) => [
    PAD_X + (i / (n - 1)) * innerW,
    PAD_TOP + (1 - v) * innerH,
  ]);
  // Lissage Catmull-Rom -> Bézier
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return { d, last: pts[pts.length - 1] };
}

export default function TrackRecord() {
  const { d, last } = buildPath(SERIES);
  const area = `${d} L ${last[0].toFixed(2)} ${H - PAD_BOT} L ${PAD_X} ${H - PAD_BOT} Z`;

  return (
    <div className="relative rounded-2xl glass overflow-hidden">
      {/* halo or */}
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full blur-3xl"
           style={{ background: "radial-gradient(circle, rgba(46,230,168,0.18), transparent 70%)" }} />

      <div className="flex items-center justify-between px-6 pt-5">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_0_4px_rgba(46,230,168,0.18)]" />
          <span className="font-mono text-[10.5px] uppercase tracking-widest2 text-mist">
            Courbe d'equity — compte propre de Julien
          </span>
        </div>
        <span className="font-mono text-[10.5px] text-mist/70">2023 — 2025</span>
      </div>

      <div className="px-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
             aria-label="Courbe de performance du portefeuille">
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2ee6a8" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#2ee6a8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#11a87b" />
              <stop offset="55%" stopColor="#79f3c9" />
              <stop offset="100%" stopColor="#2ee6a8" />
            </linearGradient>
          </defs>

          {/* grille horizontale fine */}
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1={PAD_X} x2={W - PAD_X}
              y1={PAD_TOP + g * (H - PAD_TOP - PAD_BOT)}
              y2={PAD_TOP + g * (H - PAD_TOP - PAD_BOT)}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          ))}

          <motion.path
            d={area} fill="url(#areaFill)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.6 }}
          />
          <motion.path
            d={d} fill="none" stroke="url(#strokeGrad)" strokeWidth="2.4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2.1, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.circle
            cx={last[0]} cy={last[1]} r="4.5" fill="#79f3c9"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 2 }}
          />

          {/* repères années */}
          {["2023", "2024", "2025"].map((yr, i) => (
            <text key={yr}
              x={PAD_X + (i / 2) * (W - PAD_X * 2)}
              y={H - 12}
              textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}
              fill="rgba(255,255,255,0.4)"
              style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
              {yr}
            </text>
          ))}
        </svg>
      </div>

      {/* stats annuelles + répartition au survol */}
      <div className="grid grid-cols-3 border-t hairline">
        {PERFORMANCE.map((p, i) => (
          <motion.div
            key={p.year}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 + i * 0.12 }}
            className={`group relative px-3 sm:px-5 py-5 cursor-default ${i < 2 ? "border-r hairline" : ""}`}
          >
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[9.5px] sm:text-[10.5px] uppercase tracking-widest2 text-mist">
                {p.year}
              </span>
              {p.breakdown && (
                <span className="font-mono text-[9px] text-gold/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  ⓘ
                </span>
              )}
            </div>
            <div className="mt-1 font-display text-[19px] sm:text-2xl md:text-[28px] text-gold-grad whitespace-nowrap tabular-nums">
              {p.value}
            </div>

            {p.breakdown && (
              <div className="pointer-events-none absolute z-30 left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 rounded-xl border gold-line bg-ink-900/95 backdrop-blur-sm p-3.5 shadow-2xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                <div className="font-mono text-[9px] uppercase tracking-widest2 text-mist/70 mb-2.5">
                  Répartition des profits {p.year}
                </div>
                <div className="space-y-2">
                  {p.breakdown.map((b) => (
                    <div key={b.label}>
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="text-bone">{b.label}</span>
                        <span className="font-mono text-gold tabular-nums">{b.pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold-soft"
                             style={{ width: `${b.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <span className="absolute left-1/2 -translate-x-1/2 top-full h-2 w-2 -mt-1 rotate-45 bg-ink-900 border-r border-b gold-line" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="px-6 py-4 text-[11.5px] leading-relaxed text-mist/70 border-t hairline">
        <p>
          Historique de performance du portefeuille personnel de Julien (compte{" "}
          <span className="text-mist">Quantfury</span>). Les performances passées ne
          préjugent pas des performances futures.
        </p>
        <p className="mt-1.5">
          Relevé de compte PDF disponible sur demande uniquement —{" "}
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-soft transition-colors underline underline-offset-2 decoration-gold/30"
          >
            en faire la demande
          </a>
          .
        </p>
      </div>
    </div>
  );
}
