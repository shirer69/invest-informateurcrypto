"use client";

import { useState, useEffect, useRef } from "react";
import TrackRecord from "@/components/TrackRecord";
import { IconArrow } from "@/components/Icons";
import Chat from "@/components/dashboard/Chat";
import VipFeed from "@/components/dashboard/VipFeed";
import AudioFeed from "@/components/dashboard/AudioFeed";
import { Locked } from "@/components/dashboard/UnlockProvider";
import RealFuturesPositions from "@/components/dashboard/RealFuturesPositions";
import LiveTag from "@/components/dashboard/LiveTag";
import {
  getUser, copyState, copySaveKeys, copySettings, copyStart, copyStop,
  copyResetBaseline, copyDeleteKeys, copyMaster, copyMasterPnl,
  copyContract, copyContractSign,
} from "@/lib/clientStore";
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
               style={{ background: "radial-gradient(circle, rgba(46,230,168,0.20), transparent 70%)" }} />
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
      {/* Posts VIP en direct + discussion membres */}
      <div className="mt-8 grid lg:grid-cols-[1.25fr_1fr] gap-5 items-start">
        <VipFeed />
        <div>
          <h3 className="font-display text-[17px] text-bone mb-3">Discussion membres</h3>
          <Chat me={getUser()?.name} />
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
        <h3 className="font-display text-[18px] text-bone">Positions Futures</h3>
        <span className="font-mono text-[9px] uppercase tracking-widest2 text-emerald-400 border border-emerald-500/30 rounded px-1.5 py-0.5">
          lecture seule
        </span>
      </div>
      <Locked>
      <div className="rounded-2xl border hairline bg-ink-800/50 p-1.5">
        <RealFuturesPositions />
      </div>
      </Locked>
      <Disclaimer>
        Positions ouvertes du compte Futures Kraken, en lecture seule — aucune exécution
        d'ordre n'est possible depuis cette interface.
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
const moLabel = (m) => { const [y, mo] = m.split("-"); return `${mo}/${y.slice(2)}`; };
// Le suivi Analytics démarre à juin 2026 (les mois antérieurs sont ignorés).
const ANALYTICS_START_MONTH = "2026-06";

export function Analytics() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
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
        .filter((r) => r.month >= ANALYTICS_START_MONTH) // suivi à partir de juin 2026
        .sort((a, b) => a.month.localeCompare(b.month));
      setRows(arr);
    })();
  }, []);

  if (rows === null) {
    return (
      <div>
        <h3 className="font-display text-[18px] text-bone mb-4">Analytics <LiveTag /></h3>
        <div className="grid place-items-center gap-3 py-24 text-mist">
          <Spinner className="text-gold" /> <p className="text-[13px]">Calcul du PnL mensuel…</p>
        </div>
      </div>
    );
  }

  const totalAll = rows.reduce((s, r) => s + r.total, 0);
  const max = Math.max(1, ...rows.map((r) => Math.abs(r.total)));
  // Affichage uniquement en % (jamais de montant) : part relative à l'activité totale.
  const denomAbs = rows.reduce(
    (s, r) => s + Math.abs(r.spot) + Math.abs(r.stock) + Math.abs(r.margin) + Math.abs(r.perps), 0
  );
  const pct = (v) => (denomAbs > 0 ? (v / denomAbs) * 100 : 0);
  const pctStr = (v) => `${v >= 0 ? "+" : ""}${pct(v).toFixed(1)} %`;
  // Montants en $ affichés à l'échelle du compte (× 100) — les % ne sont PAS multipliés.
  const DISPLAY_MULT = 100;
  const dUsd = (v) => "$" + Math.abs(Number(v) * DISPLAY_MULT).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dUsdSigned = (v) => `${v >= 0 ? "+" : "−"}${dUsd(v)}`;
  // Cellule : montant en $ (×100) + pourcentage en dessous.
  const cellVal = (v) => (
    <>
      <div>{dUsdSigned(v)}</div>
      <div className="text-[10px] text-mist/60">{pctStr(v)}</div>
    </>
  );

  return (
    <div>
      <h3 className="font-display text-[18px] text-bone mb-4">Analytics — résultats master A <LiveTag /></h3>

      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <CopyKpi label="PnL cumulé" value={`${dUsdSigned(totalAll)} · ${pctStr(totalAll)}`}
          cls={`font-display text-[20px] ${signClass(totalAll)}`} />
        <CopyKpi label="Mois suivis" value={rows.length} />
        <CopyKpi label="Mois positifs" value={`${rows.filter((r) => r.total >= 0).length} / ${rows.length}`} />
      </div>

      {/* histogramme PnL mensuel (total) */}
      <div className="rounded-2xl border hairline bg-ink-800/50 p-6 mb-5">
        <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">
          PnL réalisé par mois — compte complet (spot · actions US · marge · perps)
        </div>
        {rows.length === 0 ? (
          <p className="mt-4 text-[13px] text-mist/60">Aucun résultat sur la période (pas encore d'historique).</p>
        ) : (
          <div className="mt-6 flex items-end justify-between gap-2 h-44">
            {rows.map((r) => {
              const h = (Math.abs(r.total) / max) * 100;
              const up = r.total >= 0;
              return (
                <div key={r.month} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
                  <span className={`mb-1 font-mono text-[9px] ${up ? "text-emerald-400" : "text-rose-400"}`}>
                    {dUsdSigned(r.total)}
                  </span>
                  <div className={`w-full rounded-t ${up ? "bg-emerald-500/70" : "bg-rose-500/70"}`}
                       style={{ height: `${Math.max(h, 4)}%` }} title={`${moLabel(r.month)} : ${dUsdSigned(r.total)} · ${pctStr(r.total)}`} />
                  <span className="mt-1.5 font-mono text-[9px] text-mist/60">{moLabel(r.month)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* détail mensuel */}
      {rows.length > 0 && (
        <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Détail par mois & catégorie</span>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-[13px] font-mono">
              <thead>
                <tr className="text-mist/60 text-[10px] uppercase tracking-widest2">
                  <th className="text-left font-medium py-2">Mois</th>
                  <th className="text-right font-medium">Spot</th>
                  <th className="text-right font-medium">Actions US</th>
                  <th className="text-right font-medium">Marge</th>
                  <th className="text-right font-medium">Perps</th>
                  <th className="text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice().reverse().map((r) => (
                  <tr key={r.month} className="border-t hairline">
                    <td className="py-2.5 text-bone align-top">{moLabel(r.month)}</td>
                    <td className={`text-right align-top ${signClass(r.spot)}`}>{cellVal(r.spot)}</td>
                    <td className={`text-right align-top ${signClass(r.stock)}`}>{cellVal(r.stock)}</td>
                    <td className={`text-right align-top ${signClass(r.margin)}`}>{cellVal(r.margin)}</td>
                    <td className={`text-right align-top ${signClass(r.perps)}`}>{cellVal(r.perps)}</td>
                    <td className={`text-right align-top font-semibold ${signClass(r.total)}`}>{cellVal(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Disclaimer>
        PnL réalisé reconstitué depuis l'historique Kraken (trades spot/marge + journal des perps du
        compte maître). Le PnL spot dépend du prix de revient reconstitué (approximatif). Les
        performances passées ne préjugent pas des performances futures.
      </Disclaimer>
    </div>
  );
}

/* ---------------- Copy-trading (multi-utilisateurs) ---------------- */
const fmtUsd = (x) =>
  x == null ? "—" : "$" + Number(x).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signClass = (x) => (Number(x) >= 0 ? "text-emerald-400" : "text-rose-400");
const signStr = (x) => (Number(x) >= 0 ? "+" : "") + fmtUsd(x);

const STATUS_META = {
  idle: { label: "Inactif", color: "text-mist/60", dot: "bg-mist/40" },
  active: { label: "Copie active", color: "text-emerald-400", dot: "bg-emerald-400" },
  waiting_flat: { label: "En attente (trader en position)", color: "text-gold", dot: "bg-gold" },
  stopped: { label: "Arrêté", color: "text-mist/60", dot: "bg-mist/40" },
  stopped_loss: { label: "Coupé (seuil de perte atteint)", color: "text-rose-400", dot: "bg-rose-400" },
};

function EquityCurve({ points }) {
  if (!points || points.length < 2) {
    return (
      <div className="h-[120px] grid place-items-center text-[12px] text-mist/50">
        La courbe apparaîtra après quelques jours d'activité.
      </div>
    );
  }
  const w = 600, h = 120, pad = 6;
  const vals = points.map((p) => p.equity);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const xs = (i) => pad + (i * (w - 2 * pad)) / (points.length - 1);
  const ys = (v) => h - pad - ((v - min) / span) * (h - 2 * pad);
  const d = points.map((p, i) => `${i ? "L" : "M"}${xs(i).toFixed(1)},${ys(p.equity).toFixed(1)}`).join(" ");
  const up = vals[vals.length - 1] >= vals[0];
  const stroke = up ? "#2ee6a8" : "#fb7185";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[120px]" preserveAspectRatio="none">
      <path d={`${d} L${xs(points.length - 1)},${h} L${xs(0)},${h} Z`} fill={stroke} opacity="0.08" />
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

function CopyKpi({ label, value, cls }) {
  return (
    <div className="rounded-2xl border hairline bg-ink-800/50 p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">{label}</div>
      <div className={`mt-1.5 font-display text-[20px] ${cls || "text-bone"}`}>{value}</div>
    </div>
  );
}

function Spinner({ className = "" }) {
  return (
    <svg className={`animate-spin ${className}`} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* Bloc d'information sur la stratégie de copy (objectifs, règles, money management) */
function CopyInfo() {
  return (
    <div className="mt-6 grid lg:grid-cols-2 gap-4">
      <div className="rounded-2xl border gold-line bg-ink-800/40 p-5">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">Objectifs</span>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border hairline bg-ink-900/40 p-4">
            <div className="text-[12px] text-mist/70">Performance cible</div>
            <div className="mt-1 font-display text-[19px] text-emerald-400">5 % à 20 %</div>
            <div className="text-[12px] text-mist">de profit mensuel</div>
          </div>
          <div className="rounded-xl border hairline bg-ink-900/40 p-4">
            <div className="text-[12px] text-mist/70">Protection capital</div>
            <div className="mt-1 font-display text-[19px] text-bone">Drawdown max 11 %</div>
            <div className="text-[12px] text-mist">limite de perte gérée</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Règles de sortie</span>
        <div className="mt-3 space-y-3">
          <div>
            <div className="text-[13px] text-bone font-medium">Scalping / Intraday</div>
            <p className="text-[12.5px] leading-relaxed text-mist">
              Stop-loss serrés systématiques. Les TP offrent des ratios largement supérieurs aux
              pertes. Jamais de pertes laissées courir.
            </p>
          </div>
          <div>
            <div className="text-[13px] text-bone font-medium">Semi-Swing</div>
            <p className="text-[12.5px] leading-relaxed text-mist">
              Trades tenus 24/48 h. Plus de marge pour le stop-loss et cibles larges, avec levier réduit.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border hairline bg-ink-800/50 p-5 lg:col-span-2">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Money management</span>
        <div className="mt-3 grid sm:grid-cols-3 gap-3">
          {[
            ["5 % du capital", "engagé par trade"],
            ["Toujours un stop-loss", "sur chaque position"],
            ["1 à 3 TP", "par position"],
          ].map(([a, b]) => (
            <div key={a} className="rounded-xl border hairline bg-ink-900/40 p-4">
              <div className="font-display text-[16px] text-bone">{a}</div>
              <div className="text-[12px] text-mist">{b}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Facturation (frais de performance HWM) ---------------- */
function Billing({ b }) {
  const [copied, setCopied] = useState(false);
  const due = b.fee_due > 0;
  const grace = b.grace_days_left;
  return (
    <div className="rounded-2xl border gold-line bg-ink-800/40 p-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">Facturation · frais de performance</span>
        <span className="text-[11px] text-mist/60">
          Taux actuel <b className="text-bone">{b.current_rate_pct} %</b>
        </span>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CopyKpi label="Taux appliqué" value={`${b.current_rate_pct} %`}
          cls="font-display text-[20px] text-gold" />
        <CopyKpi label="High-Water Mark" value={fmtUsd(b.hwm)} />
        <CopyKpi label="Solde prépayé" value={fmtUsd(b.fee_balance)}
          cls={`font-display text-[20px] ${b.fee_balance > 0 ? "text-emerald-400" : "text-bone"}`} />
        <CopyKpi label="Frais dus" value={fmtUsd(b.fee_due)}
          cls={`font-display text-[20px] ${due ? "text-rose-400" : "text-bone"}`} />
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-mist">
        Frais de <b>{b.current_rate_pct} %</b> prélevés <b>mensuellement</b> sur les profits réalisés
        qui dépassent ton plus-haut historique (High-Water Mark) — tu ne paies jamais deux fois le
        même gain, et rien tant que tu n'as pas de nouveau record. Tarif : <b>{b.rate_low_pct} %</b> si
        ton wallet Futures est sous {fmtUsd(b.threshold)}, sinon <b>{b.rate_high_pct} %</b>.
      </p>

      {due && (
        <div className="mt-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-300">
          ⚠️ Frais en attente de paiement : <b>{fmtUsd(b.fee_due)}</b>.{" "}
          {grace != null && grace > 0
            ? `Recharge ton wallet sous ${grace} jour${grace > 1 ? "s" : ""} pour éviter la suspension de la copie.`
            : "Délai dépassé — la copie peut être suspendue."}
        </div>
      )}

      {/* dépôt crypto */}
      <div className="mt-4 rounded-xl border hairline bg-ink-900/40 p-4">
        <div className="text-[12px] uppercase tracking-widest2 text-mist/70 font-mono">Recharger (USDT · TRC-20)</div>
        {b.deposit_address ? (
          <>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <code className="text-[12.5px] text-bone break-all bg-ink-900/60 border hairline rounded px-2 py-1">{b.deposit_address}</code>
              <button onClick={() => { navigator.clipboard?.writeText(b.deposit_address); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="text-[12px] text-gold underline">{copied ? "copié ✓" : "copier"}</button>
            </div>
            <p className="mt-2 text-[11.5px] text-mist/60">
              Envoie de l'USDT (réseau <b>TRC-20 uniquement</b>) à cette adresse de dépôt dédiée.
              Les dépôts sont <b>détectés et crédités automatiquement</b> sur ton solde prépayé,
              utilisé pour régler les commissions.
            </p>
          </>
        ) : (
          <p className="mt-2 text-[12.5px] text-mist/70">
            Ton adresse de dépôt dédiée sera attribuée par l'équipe — contacte le support pour l'obtenir.
          </p>
        )}
      </div>

      {/* historique des factures */}
      {b.invoices && b.invoices.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] uppercase tracking-widest2 text-mist/60 font-mono mb-2">Historique de facturation</div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] font-mono">
              <thead>
                <tr className="text-mist/60 text-[10px] uppercase tracking-widest2">
                  <th className="text-left font-medium py-1.5">Date</th>
                  <th className="text-right font-medium">Profit</th>
                  <th className="text-right font-medium">Taux</th>
                  <th className="text-right font-medium">Frais</th>
                  <th className="text-right font-medium">Réglé</th>
                  <th className="text-left font-medium pl-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {b.invoices.map((iv, i) => (
                  <tr key={i} className="border-t hairline">
                    <td className="py-2 text-mist/80">{new Date(iv.ts * 1000).toLocaleDateString("fr-FR")}</td>
                    <td className="text-right text-mist">{fmtUsd(iv.profit)}</td>
                    <td className="text-right text-mist">{Math.round(iv.rate * 100)} %</td>
                    <td className="text-right text-bone">{fmtUsd(iv.fee)}</td>
                    <td className="text-right text-emerald-400">{fmtUsd(iv.paid)}</td>
                    <td className={`pl-3 ${iv.status === "paid" ? "text-emerald-400" : "text-rose-400"}`}>
                      {iv.status === "paid" ? "Réglé" : "Dû"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Monitoring : positions du compte Futures réel (master A) ---------------- */
export function Monitoring({ onGoCopy }) {
  const [user, setUser] = useState(null);
  const [acct, setAcct] = useState(null); // {ok, data} compte futures
  const [fills, setFills] = useState(null); // historique des positions (fills)

  useEffect(() => {
    setUser(getUser());
    const tick = async () => {
      const [a, f] = await Promise.all([
        fetch("/api/kraken/futures/account").then((r) => r.json()).catch(() => null),
        fetch("/api/kraken/futures/fills").then((r) => r.json()).catch(() => null),
      ]);
      setAcct(a); setFills(f);
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  // Gains du wallet Futures (échelle ×100). Compte inactif → null.
  const flex = acct?.data?.accounts?.flex || {};
  const walletValue = flex.portfolioValue ?? flex.balanceValue ?? null;
  const walletPnl = flex.pnl ?? flex.unrealizedFunding ?? null;
  const acctInactive = acct && acct.ok === false && /inactive/i.test(acct.error || "");
  const fillRows = (fills?.trades || []).slice(0, 25);
  const dUsd = (x) => (x == null ? "—" : "$" + Number(x * 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

  if (!user) {
    return (
      <div>
        <h3 className="font-display text-[18px] text-bone mb-4">Monitoring</h3>
        <div className="rounded-2xl border gold-line bg-ink-800/40 p-8 text-[14px] text-mist">
          Connecte-toi pour suivre l'activité du trader en direct.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-[18px] text-bone">Monitoring</h3>
        <LiveTag />
      </div>

      {/* Gains du wallet Futures (master A) */}
      <div className="relative rounded-2xl border gold-line bg-ink-800/40 p-5 mb-5 overflow-hidden">
        <div className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full blur-3xl"
             style={{ background: "radial-gradient(circle, rgba(46,230,168,0.14), transparent 70%)" }} />
        <div className="relative">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">Gains du wallet Futures (Julien)</span>
          {acctInactive ? (
            <p className="mt-2 text-[13px] text-amber-100/90">Compte Futures non encore activé — les gains s'afficheront dès l'activation.</p>
          ) : (
            <div className="mt-2 flex flex-wrap items-end gap-x-8 gap-y-2">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60">Valeur du wallet</div>
                <div className="font-display text-[26px] text-bone">{dUsd(walletValue)}</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60">PnL latent</div>
                <div className={`font-display text-[22px] ${walletPnl == null ? "text-bone" : walletPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {walletPnl == null ? "—" : `${walletPnl >= 0 ? "+" : ""}${dUsd(walletPnl)}`}
                </div>
              </div>
            </div>
          )}
          <button onClick={() => onGoCopy && onGoCopy()}
            className="btn-gold mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold">
            ⇄ Activer le copy auto
          </button>
        </div>
      </div>

      {/* Positions du compte Futures réel (lecture seule) — master A */}
      <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">
          Positions Futures en direct
        </span>
        <div className="mt-3">
          <RealFuturesPositions />
        </div>
      </div>

      {/* Historique des positions (fills Futures) */}
      <div className="mt-5 rounded-2xl border hairline bg-ink-800/50 p-5">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">
          Historique des positions Futures
        </span>
        {fills === null ? (
          <div className="mt-3 text-[13px] text-mist/60">Chargement…</div>
        ) : fillRows.length === 0 ? (
          <div className="mt-3 text-[13px] text-mist/60">
            {acctInactive ? "Compte Futures non activé — aucun historique pour l'instant." : "Aucune opération Futures pour l'instant."}
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-[13px] font-mono">
              <thead>
                <tr className="text-left text-mist/60 text-[10px] uppercase tracking-widest2 border-b hairline">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Marché</th>
                  <th className="py-2 pr-4">Sens</th>
                  <th className="py-2 pr-4 text-right">Prix</th>
                  <th className="py-2 text-right">Volume</th>
                </tr>
              </thead>
              <tbody>
                {fillRows.map((t, i) => {
                  const buy = (t.side || "").startsWith("b");
                  return (
                    <tr key={i} className="border-b hairline last:border-0">
                      <td className="py-2 pr-4 text-mist text-[12px]">{t.ts ? new Date(t.ts * 1000).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                      <td className="py-2 pr-4 text-bone">{t.market}</td>
                      <td className={`py-2 pr-4 ${buy ? "text-emerald-400" : "text-rose-400"}`}>{buy ? "Achat" : "Vente"}</td>
                      <td className="py-2 pr-4 text-right text-mist">{t.price ?? "—"}</td>
                      <td className="py-2 text-right text-mist">{t.vol ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audios Pôle Trading */}
      <div className="mt-6">
        <AudioFeed />
      </div>

      <Disclaimer>
        Suivi informatif des positions du compte Futures (lecture seule). Ne constitue pas un
        conseil en investissement.
      </Disclaimer>
    </div>
  );
}

export function CopyTrading() {
  const [user, setUser] = useState(null);
  const [s, setS] = useState(null);
  const [keyForm, setKeyForm] = useState({ api_key: "", api_secret: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [draft, setDraft] = useState(null); // réglages en cours d'édition
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [contract, setContract] = useState(null); // {signed, text, signed_name, ...}
  const [signName, setSignName] = useState("");
  const [signAccept, setSignAccept] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signErr, setSignErr] = useState("");
  const timer = useRef(null);

  async function refresh() {
    const d = await copyState();
    setS(d);
    if (d && d.settings && !draft) setDraft(d.settings);
  }
  async function loadContract() {
    const c = await copyContract();
    if (c.ok) setContract(c);
  }
  async function signContract() {
    setSignErr("");
    if (signName.trim().length < 3) { setSignErr("Saisissez votre nom complet."); return; }
    if (!signAccept) { setSignErr("Cochez la case d'acceptation."); return; }
    setSigning(true);
    const r = await copyContractSign(signName.trim());
    setSigning(false);
    if (r.ok) { await loadContract(); setMsg("Contrat signé ✓ — vous pouvez démarrer la copie."); }
    else setSignErr("Erreur lors de la signature, réessayez.");
  }

  useEffect(() => {
    setUser(getUser());
    try { if (sessionStorage.getItem("copy_unlocked") === "1") setUnlocked(true); } catch {}
    refresh();
    loadContract();
    timer.current = setInterval(refresh, 4000);
    return () => clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tryUnlock() {
    if (pw === "patouchka") {
      setUnlocked(true); setPwErr(false);
      try { sessionStorage.setItem("copy_unlocked", "1"); } catch {}
    } else {
      setPwErr(true);
    }
  }

  if (!unlocked) {
    return (
      <div>
        <h3 className="font-display text-[18px] text-bone mb-4">Copy-trading <DemoTag /></h3>
        <div className="rounded-2xl border gold-line bg-ink-800/40 p-8 max-w-md">
          <div className="text-[28px]">🔒</div>
          <h4 className="mt-3 font-display text-[18px] text-bone">Accès protégé</h4>
          <p className="mt-2 text-[13px] text-mist">Saisis le mot de passe pour accéder au copy-trading.</p>
          <input type="password" value={pw} autoFocus
            onChange={(e) => { setPw(e.target.value); setPwErr(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") tryUnlock(); }}
            placeholder="Mot de passe"
            className="mt-4 w-full bg-ink-900/60 border hairline rounded-lg px-3 py-2.5 text-[13px] font-mono text-bone outline-none focus:border-gold/50" />
          {pwErr && <p className="mt-2 text-[12.5px] text-rose-400">Mot de passe incorrect.</p>}
          <button onClick={tryUnlock}
            className="btn-gold mt-4 rounded-full px-6 py-3 text-[14px] font-semibold">Déverrouiller</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <h3 className="font-display text-[18px] text-bone mb-4">Copy-trading</h3>
        <div className="rounded-2xl border gold-line bg-ink-800/40 p-8 text-[14px] text-mist">
          Connecte-toi à ton compte pour activer le copy-trading.
        </div>
      </div>
    );
  }

  // Premier chargement des données (compte Kraken B) : spinner
  if (s === null) {
    return (
      <div>
        <h3 className="font-display text-[18px] text-bone mb-4">Copy-trading <DemoTag /></h3>
        <div className="grid place-items-center gap-3 py-24 text-mist">
          <Spinner className="text-gold" /> <p className="text-[13px]">Chargement de ton compte…</p>
        </div>
      </div>
    );
  }

  const configured = s && s.configured;
  const status = (s && s.status) || "idle";
  const meta = STATUS_META[status] || STATUS_META.idle;
  const active = s && s.active;
  const isReal = (s && s.mode) === "real";          // bascule sandbox→réel (env serveur)
  const futuresHost = isReal ? "futures.kraken.com" : "demo-futures.kraken.com";

  async function saveKeys() {
    setBusy(true); setMsg("");
    const r = await copySaveKeys(keyForm.api_key.trim(), keyForm.api_secret.trim());
    setBusy(false);
    if (r.ok) { setKeyForm({ api_key: "", api_secret: "" }); setMsg("Clés enregistrées ✓"); refresh(); }
    else setMsg(r.error === "invalid_keys" ? "Clés refusées par le sandbox (vérifie qu'elles sont bien des clés démo Futures)." : "Erreur : " + (r.detail || r.error));
  }
  async function doStart() {
    setBusy(true); const r = await copyStart(); setBusy(false);
    if (!r.ok && r.error === "contract_required") {
      await loadContract();
      setMsg("Signez d'abord le contrat de commission ci-dessous.");
      return;
    }
    setMsg(r.ok ? (r.status === "waiting_flat" ? "Copie armée — en attente que le trader soit à plat." : "Copie démarrée.") : "Erreur : " + r.error);
    refresh();
  }
  async function doStop() {
    if (!confirm("Arrêter la copie ferme immédiatement toutes tes positions copiées. Continuer ?")) return;
    setStopping(true); setMsg("");
    const r = await copyStop();
    setStopping(false);
    setMsg(r.ok ? "Copie arrêtée, positions fermées." : "Erreur : " + r.error);
    refresh();
  }
  async function saveSettings() {
    setBusy(true); const r = await copySettings(draft); setBusy(false);
    setMsg(r.ok ? "Réglages enregistrés ✓" : "Erreur réglages");
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-[18px] text-bone inline-flex items-center gap-2">
          Copy-trading
          {isReal ? (
            <span className="font-mono text-[9px] uppercase tracking-widest2 text-rose-300 border border-rose-500/40 bg-rose-500/10 rounded px-1.5 py-0.5">réel</span>
          ) : <DemoTag />}
        </h3>
        <span className={`inline-flex items-center gap-2 text-[12px] ${meta.color}`}>
          <span className={`h-2 w-2 rounded-full ${meta.dot}`} /> {meta.label}
        </span>
      </div>

      {!configured ? (
        /* ---- onboarding : saisie des clés ---- */
        <div className="rounded-2xl border gold-line bg-ink-800/40 p-6 max-w-2xl">
          <h4 className="font-display text-[18px] text-bone">
            Connecte ton compte {isReal ? "Kraken Futures" : "démo Futures"}
          </h4>
          <p className="mt-2 text-[13.5px] leading-relaxed text-mist">
            Le copy-trading réplique automatiquement les positions du trader sur <b>ton</b> compte
            Kraken Futures{isReal ? " réel" : " de démonstration"}. Crée deux clés API sur{" "}
            <a className="text-gold underline" href={`https://${futuresHost}`} target="_blank" rel="noopener noreferrer">
              {futuresHost}
            </a>{" "}
            (Settings → API Keys, droit de trading), puis colle-les ci-dessous.
          </p>
          {isReal && (
            <p className="mt-2 text-[12px] text-rose-300/90 border border-rose-500/30 bg-rose-500/[0.06] rounded-lg px-3 py-2">
              ⚠️ Mode RÉEL : les ordres sont exécutés avec de l'argent réel sur ton compte.
            </p>
          )}
          <div className="mt-5 space-y-3">
            <div>
              <label className="block text-[11px] uppercase tracking-widest2 text-mist/70 mb-1.5">Clé publique</label>
              <input value={keyForm.api_key} onChange={(e) => setKeyForm({ ...keyForm, api_key: e.target.value })}
                className="w-full bg-ink-900/60 border hairline rounded-lg px-3 py-2.5 text-[13px] font-mono text-bone outline-none focus:border-gold/50" />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest2 text-mist/70 mb-1.5">Clé privée</label>
              <input value={keyForm.api_secret} onChange={(e) => setKeyForm({ ...keyForm, api_secret: e.target.value })} type="password"
                className="w-full bg-ink-900/60 border hairline rounded-lg px-3 py-2.5 text-[13px] font-mono text-bone outline-none focus:border-gold/50" />
            </div>
            <button disabled={busy} onClick={saveKeys}
              className="btn-gold rounded-full px-6 py-3 text-[14px] font-semibold disabled:opacity-50">
              {busy ? "Vérification…" : "Connecter mon compte"}
            </button>
            {msg && <p className="text-[12.5px] text-mist">{msg}</p>}
          </div>
          <ul className="mt-5 space-y-2 border-t hairline pt-4">
            {["Sandbox démo uniquement — aucun argent réel", "Clés chiffrées au repos", "Jamais de permission de retrait", "Tu gardes le contrôle : start/stop à tout moment"].map((x) => (
              <li key={x} className="flex items-center gap-3 text-[12.5px] text-mist/80">
                <span className="h-1 w-1 rounded-full bg-gold" /> {x}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        /* ---- tableau de bord investisseur ---- */
        <div className="space-y-5">
          {/* Contrat de commission à signer (préalable au démarrage) */}
          {contract && !contract.signed && (
            <div className="rounded-2xl border gold-line bg-gold/[0.05] p-5">
              <div className="flex items-center gap-2">
                <span className="grid place-items-center h-7 w-7 rounded-full border gold-line text-gold text-[13px]">✍️</span>
                <h4 className="font-display text-[17px] text-bone">Contrat de commission — signature requise</h4>
              </div>
              <p className="mt-2 text-[12.5px] text-mist">
                Avant d'activer la copie, lisez et signez électroniquement le contrat de commission
                sur les profits. Sans signature, la copie ne peut pas démarrer.
              </p>
              <pre className="mt-3 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl border hairline bg-ink-900/60 p-4 text-[12px] leading-relaxed text-mist font-sans">
                {contract.text}
              </pre>
              <input
                value={signName}
                onChange={(e) => { setSignName(e.target.value); setSignErr(""); }}
                placeholder="Votre nom et prénom (signature)"
                className="mt-3 w-full bg-ink-900/60 border hairline rounded-lg px-3.5 py-2.5 text-[13px] text-bone outline-none focus:border-gold/50"
              />
              <label className="mt-2.5 flex items-start gap-2.5 text-[12.5px] text-mist cursor-pointer">
                <input type="checkbox" checked={signAccept}
                  onChange={(e) => { setSignAccept(e.target.checked); setSignErr(""); }}
                  className="mt-0.5 accent-gold" />
                <span>J'ai lu et j'accepte les termes du contrat de commission. Je signe électroniquement (horodatage + IP conservés comme preuve).</span>
              </label>
              {signErr && <p className="mt-2 text-[12.5px] text-rose-400/90">{signErr}</p>}
              <button disabled={signing} onClick={signContract}
                className="btn-gold mt-3 rounded-full px-6 py-2.5 text-[13.5px] font-semibold disabled:opacity-60">
                {signing ? "Signature…" : "Signer & activer le copy-trading"}
              </button>
            </div>
          )}
          {contract && contract.signed && (
            <p className="text-[11.5px] text-emerald-400/90">
              ✓ Contrat de commission signé{contract.signed_name ? ` par ${contract.signed_name}` : ""}.
            </p>
          )}

          {/* contrôles */}
          <div className="flex items-center gap-3 flex-wrap">
            {!active ? (
              <button disabled={busy || (contract && !contract.signed)} onClick={doStart}
                title={contract && !contract.signed ? "Signez d'abord le contrat" : ""}
                className="rounded-full px-6 py-3 text-[14px] font-semibold bg-emerald-500/90 text-ink-900 disabled:opacity-50">
                ▶ Démarrer la copie
              </button>
            ) : (
              <button disabled={stopping} onClick={doStop}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold bg-rose-500/90 text-white disabled:opacity-70">
                {stopping ? (<><Spinner /> Arrêt en cours…</>) : "■ Arrêter (ferme les positions)"}
              </button>
            )}
            {stopping && (
              <span className="inline-flex items-center gap-2 text-[12.5px] text-mist/80">
                Fermeture des positions et annulation des ordres…
              </span>
            )}
            {!stopping && msg && <span className="text-[12.5px] text-mist">{msg}</span>}
          </div>

          {status === "waiting_flat" && (
            <div className="rounded-xl border gold-line bg-gold/5 px-4 py-3 text-[13px] text-gold/90">
              ⏳ Le trader a une position ouverte. Pour ne pas entrer en cours de route, ta copie
              démarrera dès qu'il sera à plat (0 position) — à la prochaine opportunité.
            </div>
          )}

          {/* KPIs — performance issue UNIQUEMENT des trades copiés */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CopyKpi label="Valeur du portefeuille" value={fmtUsd(s.equity)} />
            <CopyKpi label="Performance totale (copy)"
              value={`${signStr(s.pnl_total)} (${s.pnl_total_pct >= 0 ? "+" : ""}${s.pnl_total_pct}%)`}
              cls={`font-display text-[20px] ${signClass(s.pnl_total)}`} />
            <CopyKpi label="Gains réalisés (copy)" value={signStr(s.pnl_realized)} cls={`font-display text-[20px] ${signClass(s.pnl_realized)}`} />
            <CopyKpi label="Gains latents (copy)" value={signStr(s.pnl_unrealized)} cls={`font-display text-[20px] ${signClass(s.pnl_unrealized)}`} />
          </div>
          <p className="-mt-2 text-[11.5px] text-mist/50">
            La performance affichée provient <b>uniquement</b> des positions déclenchées par le copy
            (le trader maître) — elle exclut tes éventuels trades manuels et la revalorisation du collatéral.
          </p>

          {/* métriques */}
          <div className="grid sm:grid-cols-3 gap-4">
            <CopyKpi label="Sharpe" value={s.metrics?.sharpe != null ? s.metrics.sharpe : "—"} />
            <CopyKpi label="CAGR" value={s.metrics?.cagr != null ? `${s.metrics.cagr >= 0 ? "+" : ""}${s.metrics.cagr}%` : "—"}
              cls={`font-display text-[20px] ${s.metrics?.cagr != null ? signClass(s.metrics.cagr) : "text-bone"}`} />
            <CopyKpi label="Max Drawdown" value={`-${s.metrics?.max_drawdown ?? 0}%`}
              cls="font-display text-[20px] text-rose-400" />
          </div>

          {/* courbe equity */}
          <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">
                Courbe d'équité {s.first_day ? `· depuis le ${s.first_day}` : ""}
              </span>
            </div>
            <EquityCurve points={s.curve} />
          </div>

          {/* positions */}
          <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Positions en cours</span>
            {(!s.positions || !s.positions.length) ? (
              <div className="mt-3 text-[13px] text-mist/60">Aucune position ouverte.</div>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-[13px] font-mono">
                  <thead>
                    <tr className="text-mist/60 text-[10px] uppercase tracking-widest2">
                      <th className="text-left font-medium py-2">Marché</th>
                      <th className="text-left font-medium">Sens</th>
                      <th className="text-right font-medium">Taille</th>
                      <th className="text-right font-medium">Entrée</th>
                      <th className="text-right font-medium">Mark</th>
                      <th className="text-right font-medium">PnL latent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.positions.map((p, i) => (
                      <tr key={i} className="border-t hairline">
                        <td className="py-2.5 text-bone">{p.symbol}</td>
                        <td className={p.side === "long" ? "text-emerald-400" : "text-rose-400"}>{p.side}</td>
                        <td className="text-right text-mist">{p.size}</td>
                        <td className="text-right text-mist">{fmtUsd(p.entry)}</td>
                        <td className="text-right text-mist">{fmtUsd(p.mark)}</td>
                        <td className={`text-right ${signClass(p.upnl)}`}>{signStr(p.upnl)} ({p.upnl_pct >= 0 ? "+" : ""}{p.upnl_pct}%)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* historique des trades copiés */}
          <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Historique des trades (copy)</span>
            {(!s.trades || !s.trades.length) ? (
              <div className="mt-3 text-[13px] text-mist/60">Aucun trade copié pour le moment.</div>
            ) : (
              <div className="mt-3 overflow-x-auto max-h-[340px] overflow-y-auto">
                <table className="w-full text-[13px] font-mono">
                  <thead className="sticky top-0 bg-ink-800">
                    <tr className="text-mist/60 text-[10px] uppercase tracking-widest2">
                      <th className="text-left font-medium py-2">Date</th>
                      <th className="text-left font-medium">Action</th>
                      <th className="text-left font-medium">Marché</th>
                      <th className="text-left font-medium">Sens</th>
                      <th className="text-right font-medium">Taille</th>
                      <th className="text-right font-medium">Prix</th>
                      <th className="text-right font-medium">Réalisé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.trades.map((t, i) => (
                      <tr key={i} className="border-t hairline">
                        <td className="py-2.5 text-mist/80 whitespace-nowrap">
                          {new Date(t.ts * 1000).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="text-mist">{t.kind}</td>
                        <td className="text-bone">{t.symbol}</td>
                        <td className={t.side === "buy" ? "text-emerald-400" : "text-rose-400"}>{t.side === "buy" ? "Achat" : "Vente"}</td>
                        <td className="text-right text-mist">{t.size}</td>
                        <td className="text-right text-mist">{fmtUsd(t.price)}</td>
                        <td className={`text-right ${t.realized ? signClass(t.realized) : "text-mist/40"}`}>
                          {t.realized ? signStr(t.realized) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* piliers copiés */}
          {draft && (
            <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Piliers copiés</span>
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                <PillarToggle label="Perps (Futures)" sub="positions à terme"
                  checked={draft.copy_perps !== false}
                  onChange={(v) => setDraft({ ...draft, copy_perps: v })} />
                <PillarToggle label="Spot" sub="bientôt" disabled checked={false} />
                <PillarToggle label="Marge" sub="bientôt" disabled checked={false} />
              </div>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[11.5px] text-mist/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  Actions tokenisées (xStocks) : <b className="text-bone">toujours exclues</b>
                </span>
                <button disabled={busy} onClick={saveSettings}
                  className="ml-auto btn-ghost rounded-full px-4 py-2 text-[12px]">Enregistrer</button>
              </div>
            </div>
          )}

          {/* réglages risque */}
          {draft && (
            <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Garde-fous</span>
              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field label="Levier max (x)" value={draft.max_leverage}
                  onChange={(v) => setDraft({ ...draft, max_leverage: v })} step="0.5" />
                <Field label="Stop-loss / position (%)" value={Math.round(draft.auto_stop_loss_pct * 1000) / 10}
                  onChange={(v) => setDraft({ ...draft, auto_stop_loss_pct: (parseFloat(v) || 0) / 100 })} step="0.5" />
                <Field label="Stop-copy à perte de (%)" value={draft.stop_copy_loss_pct}
                  onChange={(v) => setDraft({ ...draft, stop_copy_loss_pct: parseFloat(v) || 0 })} step="1" />
                <Field label="Multiplicateur taille" value={draft.size_ratio}
                  onChange={(v) => setDraft({ ...draft, size_ratio: parseFloat(v) || 0 })} step="0.1" />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button disabled={busy} onClick={saveSettings}
                  className="btn-gold rounded-full px-5 py-2.5 text-[13px] font-semibold disabled:opacity-50">
                  Enregistrer les garde-fous
                </button>
                <button onClick={async () => { if (confirm("Déconnecter ce compte et oublier les clés ?")) { await copyDeleteKeys(); refresh(); } }}
                  className="text-[12px] text-mist/60 hover:text-rose-400 underline">
                  Déconnecter mon compte
                </button>
              </div>
              <p className="mt-3 text-[11.5px] text-mist/50">
                Stop-loss / position : pose un stop automatique à X % de l'entrée. Stop-copy : coupe
                tout et ferme si ta perte totale atteint X %. Levier max : plafonne ton exposition.
              </p>
            </div>
          )}

          {/* facturation */}
          {s.billing && <Billing b={s.billing} />}
        </div>
      )}

      <CopyInfo />

      <Disclaimer>
        Environnement de démonstration (sandbox) — aucun argent réel. Tout investissement comporte
        un risque de perte en capital. Outil éducatif, ne constitue pas un conseil en investissement.
      </Disclaimer>
    </div>
  );
}

function PillarToggle({ label, sub, checked, onChange, disabled }) {
  return (
    <button type="button" disabled={disabled}
      onClick={() => !disabled && onChange && onChange(!checked)}
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
        disabled ? "hairline bg-white/[0.015] opacity-60 cursor-not-allowed"
                 : checked ? "gold-line bg-gold/[0.06]" : "hairline bg-ink-900/40 hover:border-white/20"
      }`}>
      <span className="min-w-0">
        <span className="block text-[13.5px] text-bone">{label}</span>
        <span className="block text-[11px] text-mist/60">{sub}</span>
      </span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-emerald-500/80" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function Field({ label, value, onChange, step }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-widest2 text-mist/70 mb-1.5">{label}</label>
      <input type="number" step={step} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-ink-900/60 border hairline rounded-lg px-3 py-2.5 text-[13px] font-mono text-bone outline-none focus:border-gold/50" />
    </div>
  );
}
