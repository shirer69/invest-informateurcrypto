"use client";

import { motion } from "framer-motion";
import { Reveal, Stagger, StaggerItem } from "./Reveal";

const ease = [0.22, 1, 0.36, 1];

/* ---------- petites icônes inline ---------- */
const I = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  spot: "M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5",
  margin: "M4 18V9M10 18V5M16 18v-7M22 18H2",
  perp: "M3 12h4l3 7 4-14 3 7h4",
  stock: "M3 17l5-5 4 3 8-8M21 7v5M21 7h-5",
  copy: "M9 9h10v10H9zM5 15H4V5h10v1",
  video: "M4 5h16v14H4zM10 9l5 3-5 3z",
  chat: "M4 5h16v10H8l-4 4z",
  vip: "M4 8l4 4 4-8 4 8 4-4-1 9H5z",
};

function Ico({ d, className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"
         strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}

const FEATURES = [
  { d: I.grid, t: "Suivi de portefeuille", s: "Equity, PnL et drawdown consolidés en temps réel." },
  { d: I.spot, t: "Spot", s: "Positions et soldes spot, toutes vos lignes au même endroit." },
  { d: I.margin, t: "Marge", s: "Exposition, collatéral et niveau de risque suivis en continu." },
  { d: I.perp, t: "Perps", s: "Contrats perpétuels, funding et levier sous contrôle." },
  { d: I.stock, t: "Actions US & indices", s: "Leaders US, S&P 500, Nasdaq — vue marché intégrée." },
  { d: I.copy, t: "Copy trading auto", s: "Réplication des positions du desk, avec plafonds de risque." },
  { d: I.video, t: "Vidéos", s: "Analyses hebdomadaires et formats longs, directement dans l'app." },
  { d: I.chat, t: "Chat communautaire", s: "Échanges entre membres, modéré, en temps réel." },
  { d: I.vip, t: "Analyses & posts VIP", s: "Le flux d'intelligence du desk, structuré et contextualisé." },
];

/* equity sparkline */
const PTS = [6, 10, 8, 14, 19, 17, 24, 30, 28, 36, 42, 40, 47, 53, 58, 64, 70, 76, 82, 88];
function spark(w, h) {
  const max = Math.max(...PTS), min = Math.min(...PTS);
  return PTS.map((v, i) => [
    (i / (PTS.length - 1)) * w,
    h - ((v - min) / (max - min)) * h,
  ]);
}

const POSITIONS = [
  { sym: "BTC/USD", typ: "Spot", side: "Long", pnl: "+4,2 %", up: true },
  { sym: "ETH/USD", typ: "Perp", side: "Long", pnl: "+2,1 %", up: true },
  { sym: "NVDA", typ: "Actions", side: "Long", pnl: "+6,8 %", up: true },
  { sym: "S&P 500", typ: "Indice", side: "Long", pnl: "−0,4 %", up: false },
];

export default function DashboardShowcase() {
  const pts = spark(280, 70);
  const line = pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L 280 70 L 0 70 Z`;

  return (
    <section id="plateforme" className="relative py-24 md:py-32 border-t hairline aura">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="max-w-2xl">
          <span className="eyebrow">La plateforme</span>
          <h2 className="mt-5 font-display font-light text-[32px] md:text-[44px] leading-[1.08] tracking-tightest text-bone">
            Un cockpit d'investissement, pas un simple groupe
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-mist">
            Le Pôle Invest s'accompagne d'un tableau de bord privé : suivi de portefeuille,
            spot, marge, perps, actions US et indices, copy trading, vidéos, chat et le flux
            d'analyses du desk — réunis dans une seule interface.
          </p>
        </Reveal>

        {/* MOCKUP */}
        <Reveal delay={0.1}>
          <div className="mt-14 rounded-2xl border gold-line bg-ink-900/80 overflow-hidden shadow-2xl">
            {/* barre fenêtre */}
            <div className="flex items-center gap-2 px-4 py-3 border-b hairline bg-ink-800/60">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <div className="ml-3 flex-1 max-w-xs rounded-md bg-ink-900 border hairline px-3 py-1 font-mono text-[10.5px] text-mist/70">
                app.informateurcrypto.fr
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest2 text-gold/60">Aperçu</span>
            </div>

            <div className="grid lg:grid-cols-[200px_1fr_240px]">
              {/* sidebar */}
              <div className="hidden lg:flex flex-col gap-1 p-3 border-r hairline bg-ink-900/60">
                {[
                  ["Portefeuille", I.grid, true], ["Spot", I.spot], ["Marge", I.margin],
                  ["Perps", I.perp], ["Actions US", I.stock], ["Copy trading", I.copy],
                  ["Vidéos", I.video], ["Chat", I.chat], ["VIP", I.vip],
                ].map(([label, d, active]) => (
                  <div key={label}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] ${
                      active ? "bg-gold/10 text-gold border gold-line" : "text-mist hover:text-bone"
                    }`}>
                    <Ico d={d} className="h-4 w-4" /> {label}
                  </div>
                ))}
              </div>

              {/* main */}
              <div className="p-5 space-y-4 min-w-0">
                {/* KPIs */}
                <div className="grid grid-cols-3 gap-3">
                  {[["Equity", "128 540 $"], ["PnL 30j", "+12,2 %"], ["Drawdown", "−3,1 %"]].map(([k, v], i) => (
                    <div key={k} className="rounded-xl border hairline bg-white/[0.02] p-3">
                      <div className="font-mono text-[9px] uppercase tracking-widest2 text-mist">{k}</div>
                      <div className={`mt-1 font-display text-[18px] ${i === 1 ? "text-gold-grad" : "text-bone"}`}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* equity curve */}
                <div className="rounded-xl border hairline bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist">Courbe d'equity</span>
                    <span className="font-mono text-[10px] text-gold/70">YTD</span>
                  </div>
                  <svg viewBox="0 0 280 70" className="mt-2 w-full h-[70px]">
                    <defs>
                      <linearGradient id="dshFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c9a24b" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#c9a24b" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <motion.path d={area} fill="url(#dshFill)"
                      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.4 }} />
                    <motion.path d={line} fill="none" stroke="#e8ce8e" strokeWidth="1.8"
                      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease }} />
                  </svg>
                </div>

                {/* allocation + positions */}
                <div className="grid sm:grid-cols-[1fr_1.4fr] gap-3">
                  <div className="rounded-xl border hairline bg-white/[0.02] p-4">
                    <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist">Allocation</span>
                    {[["Spot", "58%", "w-[58%]"], ["Marge", "27%", "w-[27%]"], ["Perps", "15%", "w-[15%]"]].map(([k, v, w]) => (
                      <div key={k} className="mt-3">
                        <div className="flex justify-between text-[11px] text-mist"><span>{k}</span><span className="text-bone">{v}</span></div>
                        <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div className={`h-full ${w} rounded-full bg-gradient-to-r from-gold-deep to-gold-soft`} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border hairline bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist">Positions en cours</span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border gold-line px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-widest2 text-gold">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" /> Copy auto
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {POSITIONS.map((p) => (
                        <div key={p.sym} className="flex items-center justify-between text-[11.5px]">
                          <span className="text-bone font-medium w-20">{p.sym}</span>
                          <span className="text-mist/70 w-14">{p.typ}</span>
                          <span className="text-mist/70 w-10">{p.side}</span>
                          <span className={`font-mono w-14 text-right ${p.up ? "text-emerald-400/90" : "text-red-400/80"}`}>{p.pnl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* right panel */}
              <div className="hidden lg:block p-4 border-l hairline bg-ink-900/60 space-y-3">
                <div className="rounded-xl border hairline bg-white/[0.02] p-3">
                  <div className="font-mono text-[9px] uppercase tracking-widest2 text-gold/70">Flux VIP</div>
                  <p className="mt-2 text-[11px] leading-snug text-mist">
                    « Faiblesse relative de BTC face aux indices — pas de configuration claire, on attend. »
                  </p>
                </div>
                <div className="rounded-xl border hairline bg-white/[0.02] overflow-hidden">
                  <div className="relative aspect-video bg-gradient-to-br from-ink-700 to-ink-900 grid place-items-center">
                    <span className="grid place-items-center h-9 w-9 rounded-full bg-black/40 border border-white/20">
                      <Ico d={I.video} className="h-4 w-4 text-bone" />
                    </span>
                  </div>
                  <div className="px-3 py-2 text-[10.5px] text-mist">Analyse hebdo · 12 min</div>
                </div>
                <div className="rounded-xl border hairline bg-white/[0.02] p-3 space-y-2">
                  <div className="font-mono text-[9px] uppercase tracking-widest2 text-mist">Chat</div>
                  {[["Eric", "Risk management au cordeau 👌"], ["Seb", "Enfin une vraie discipline"]].map(([n, m]) => (
                    <div key={n} className="text-[10.5px]">
                      <span className="text-gold/80">{n} </span><span className="text-mist">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-4 py-2 border-t hairline text-[10px] text-mist/50 font-mono">
              Aperçu de l'interface — données illustratives.
            </div>
          </div>
        </Reveal>

        {/* FEATURES */}
        <Stagger className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <StaggerItem key={f.t}
              className="group rounded-2xl border hairline bg-ink-800/40 p-5 hover:border-gold/30 transition-colors duration-500">
              <span className="grid place-items-center h-10 w-10 rounded-xl border gold-line text-gold">
                <Ico d={f.d} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-[17px] text-bone">{f.t}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-mist">{f.s}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
