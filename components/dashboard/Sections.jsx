"use client";

import TrackRecord from "@/components/TrackRecord";
import { IconArrow } from "@/components/Icons";
import { KPIS, POSITIONS, SIGNALS, MONTHLY, RISK } from "@/lib/dashboardData";

const DemoTag = () => (
  <span className="font-mono text-[9px] uppercase tracking-widest2 text-mist/50 border hairline rounded px-1.5 py-0.5">
    démo
  </span>
);

const Disclaimer = ({ children }) => (
  <p className="mt-4 text-[11.5px] leading-relaxed text-mist/60">{children}</p>
);

/* ---------------- Vue d'ensemble ---------------- */
export function Overview({ tgLink }) {
  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-2xl border hairline bg-ink-800/50 p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">
                {k.label}
              </span>
              {k.up !== undefined && (
                <span className={`text-[11px] ${k.up ? "text-emerald-400" : "text-rose-400"}`}>
                  {k.up ? "▲" : "▼"}
                </span>
              )}
            </div>
            <div className="mt-2 font-display text-[26px] text-bone">{k.value}</div>
            {k.sub && <div className="mt-0.5 text-[12px] text-mist">{k.sub}</div>}
          </div>
        ))}
      </div>

      <div className="mt-5 grid lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        <div>
          <h3 className="mb-3 font-display text-[17px] text-bone">Courbe de performance</h3>
          <TrackRecord />
        </div>
        <div className="relative rounded-2xl border gold-line overflow-hidden p-6 flex flex-col justify-between min-h-[220px]">
          <div className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full blur-3xl"
               style={{ background: "radial-gradient(circle, rgba(201,162,75,0.20), transparent 70%)" }} />
          <div className="relative">
            <div className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">Groupe privé</div>
            <h3 className="mt-2 font-display text-[20px] text-bone">VIP Pôle Invest</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-mist">
              Accès au groupe Telegram privé et aux analyses en direct.
            </p>
          </div>
          <a href={tgLink} target="_blank" rel="noopener noreferrer"
             className="btn-gold relative mt-5 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[14.5px] font-semibold">
            Rejoindre le groupe VIP <IconArrow className="h-4 w-4" />
          </a>
        </div>
      </div>
      <Disclaimer>
        Données de démonstration. Contenu éducatif — ne constitue pas un conseil en
        investissement. Risque de perte en capital.
      </Disclaimer>
    </div>
  );
}

/* ---------------- Positions (lecture seule) ---------------- */
export function Positions() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-display text-[18px] text-bone">Positions</h3>
        <span className="font-mono text-[9px] uppercase tracking-widest2 text-emerald-400 border border-emerald-500/30 rounded px-1.5 py-0.5">
          lecture seule
        </span>
        <DemoTag />
      </div>
      <div className="rounded-2xl border hairline bg-ink-800/50 overflow-hidden">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest2 text-mist/60 border-b hairline">
              <th className="px-5 py-3">Actif</th>
              <th className="px-5 py-3">Sens</th>
              <th className="px-5 py-3 hidden sm:table-cell">Entrée</th>
              <th className="px-5 py-3 hidden sm:table-cell">Dernier</th>
              <th className="px-5 py-3 hidden md:table-cell">Taille</th>
              <th className="px-5 py-3 text-right">P&L</th>
            </tr>
          </thead>
          <tbody>
            {POSITIONS.map((p) => {
              const up = p.pnlPct >= 0;
              return (
                <tr key={p.asset} className="border-b hairline last:border-0">
                  <td className="px-5 py-3.5 font-medium text-bone">{p.asset}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[12px] ${p.side === "Long" ? "text-emerald-400" : "text-rose-400"}`}>
                      {p.side}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-mist hidden sm:table-cell">{p.entry}</td>
                  <td className="px-5 py-3.5 font-mono text-mist hidden sm:table-cell">{p.last}</td>
                  <td className="px-5 py-3.5 font-mono text-mist hidden md:table-cell">{p.size}</td>
                  <td className={`px-5 py-3.5 text-right font-mono ${up ? "text-emerald-400" : "text-rose-400"}`}>
                    {up ? "+" : ""}{p.pnlPct.toFixed(2)} %
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Disclaimer>
        Affichage à titre illustratif — aucune connexion à un compte réel et aucune
        exécution d'ordre n'est effectuée depuis cette interface.
      </Disclaimer>
    </div>
  );
}

/* ---------------- Intelligence (feed structuré) ---------------- */
const biasColor = { long: "text-emerald-400", short: "text-rose-400", neutral: "text-mist" };
const typeLabel = { signal: "Signal", analysis: "Analyse", macro: "Macro", education: "Pédagogie" };

export function Intelligence() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-display text-[18px] text-bone">Intelligence — feed Telegram</h3>
        <DemoTag />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {SIGNALS.map((s, i) => (
          <div key={i} className="rounded-2xl border hairline bg-ink-800/50 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display text-[17px] text-bone">{s.asset}</span>
                <span className="font-mono text-[9.5px] uppercase tracking-widest2 text-gold/80 border gold-line rounded-full px-2 py-0.5">
                  {typeLabel[s.type]}
                </span>
              </div>
              <span className="font-mono text-[10.5px] text-mist/60">{s.time}</span>
            </div>
            {s.type !== "education" && (
              <div className="mt-3 flex items-center gap-3">
                <span className={`text-[12px] font-mono uppercase ${biasColor[s.bias]}`}>
                  {s.bias === "long" ? "Biais haussier" : s.bias === "short" ? "Biais baissier" : "Neutre"}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold-soft"
                       style={{ width: `${Math.round(s.confidence * 100)}%` }} />
                </div>
                <span className="font-mono text-[11px] text-mist">{Math.round(s.confidence * 100)}%</span>
              </div>
            )}
            <p className="mt-3 text-[13.5px] leading-relaxed text-mist">{s.context}</p>
          </div>
        ))}
      </div>
      <Disclaimer>
        Feed illustratif. En production : ingestion + classification des publications du
        canal, restituées en flux structuré. Aucun conseil personnalisé.
      </Disclaimer>
    </div>
  );
}

/* ---------------- Analytics ---------------- */
export function Analytics() {
  const max = Math.max(...MONTHLY.map((m) => Math.abs(m.r)));
  return (
    <div>
      <h3 className="font-display text-[18px] text-bone mb-4 flex items-center gap-2">
        Analytics <DemoTag />
      </h3>
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5 items-start">
        <div className="rounded-2xl border hairline bg-ink-800/50 p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">
            Rendements mensuels (démo)
          </div>
          <div className="mt-6 flex items-end justify-between gap-2 h-44">
            {MONTHLY.map((m) => {
              const h = (Math.abs(m.r) / max) * 100;
              const up = m.r >= 0;
              return (
                <div key={m.m} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className={`mb-1 font-mono text-[9.5px] ${up ? "text-emerald-400" : "text-rose-400"}`}>
                    {up ? "+" : ""}{m.r}
                  </span>
                  <div className={`w-full rounded-t ${up ? "bg-emerald-500/70" : "bg-rose-500/70"}`}
                       style={{ height: `${Math.max(h, 6)}%` }} />
                  <span className="mt-1.5 font-mono text-[9px] text-mist/60">{m.m}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border hairline bg-ink-800/50 p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">
            Métriques de risque
          </div>
          <ul className="mt-4 space-y-3">
            {RISK.map((r) => (
              <li key={r.label} className="flex items-center justify-between text-[13.5px]">
                <span className="text-mist">{r.label}</span>
                <span className="text-bone font-mono">{r.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Disclaimer>
        Statistiques de démonstration. Les performances passées ne préjugent pas des
        performances futures.
      </Disclaimer>
    </div>
  );
}

/* ---------------- Copy-trading (verrouillé) ---------------- */
export function CopyTrading() {
  return (
    <div>
      <h3 className="font-display text-[18px] text-bone mb-4">Copy-trading</h3>
      <div className="relative rounded-2xl border gold-line bg-ink-800/40 p-8 overflow-hidden">
        <div className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full blur-3xl"
             style={{ background: "radial-gradient(circle, rgba(201,162,75,0.14), transparent 70%)" }} />
        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest2 text-gold/80 border gold-line rounded-full px-3 py-1">
            🔒 Bientôt · opt-in
          </span>
          <h4 className="mt-4 font-display font-light text-[24px] leading-tight tracking-tightest text-bone">
            La copie de positions n'est pas activée
          </h4>
          <p className="mt-3 text-[14px] leading-relaxed text-mist">
            Pour des raisons de sécurité et de conformité, aucune exécution d'ordre n'est
            réalisée depuis cette plateforme. La fonctionnalité de copie (sur opt-in
            explicite, sans permission de retrait, plafonds de risque) fera l'objet d'un
            cadre dédié.
          </p>
          <ul className="mt-5 space-y-2.5">
            {[
              "Connexion Kraken en lecture seule uniquement",
              "Jamais de permission de retrait",
              "Plafonds de risque et opt-in obligatoires",
            ].map((x) => (
              <li key={x} className="flex items-center gap-3 text-[13.5px] text-mist">
                <span className="h-1 w-1 rounded-full bg-gold" /> {x}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Disclaimer>
        Aucun ordre n'est passé sur les marchés via cette interface. Tout investissement
        comporte un risque de perte en capital.
      </Disclaimer>
    </div>
  );
}
