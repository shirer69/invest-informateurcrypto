"use client";

import { useState, useEffect, useRef } from "react";
import TrackRecord from "@/components/TrackRecord";
import { IconArrow } from "@/components/Icons";
import Chat from "@/components/dashboard/Chat";
import VipFeed from "@/components/dashboard/VipFeed";
import {
  getUser, copyState, copySaveKeys, copySettings, copyStart, copyStop,
  copyResetBaseline, copyDeleteKeys, copyMaster,
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
        <h3 className="font-display text-[18px] text-bone">Positions</h3>
        <span className="font-mono text-[9px] uppercase tracking-widest2 text-emerald-400 border border-emerald-500/30 rounded px-1.5 py-0.5">
          lecture seule
        </span>
        <DemoTag />
      </div>
      <div className="rounded-2xl border hairline bg-ink-800/50 overflow-x-auto">
        <table className="w-full min-w-[420px] text-[13.5px]">
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

/* ---------------- Monitoring : activité live du trader maître ---------------- */
export function Monitoring() {
  const [user, setUser] = useState(null);
  const [m, setM] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    setUser(getUser());
    const tick = async () => setM(await copyMaster());
    tick();
    timer.current = setInterval(tick, 4000);
    return () => clearInterval(timer.current);
  }, []);

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

  const online = m && m.online;
  const flat = m ? m.flat : true;
  const positions = (m && m.positions) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-[18px] text-bone">Monitoring <DemoTag /></h3>
        <span className={`inline-flex items-center gap-2 text-[12px] ${online ? "text-emerald-400" : "text-mist/60"}`}>
          <span className={`h-2 w-2 rounded-full ${online ? "bg-emerald-400 animate-pulse" : "bg-mist/40"}`} />
          {online ? "Radar actif" : "Hors ligne"}
        </span>
      </div>

      <div className="rounded-2xl border gold-line bg-ink-800/40 p-5 mb-5">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">Trader maître (signal)</span>
        <div className="mt-2 flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${flat ? "bg-mist/40" : "bg-emerald-400 animate-pulse"}`} />
          <span className="font-display text-[20px] text-bone">
            {flat ? "À plat — aucune position ouverte" : `${positions.length} position${positions.length > 1 ? "s" : ""} en cours`}
          </span>
        </div>
        <p className="mt-2 text-[12.5px] text-mist">
          Le copy-trading répliquera automatiquement ces positions sur ton compte lorsqu'il est démarré.
        </p>
      </div>

      <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Positions du trader</span>
        {!positions.length ? (
          <div className="mt-3 text-[13px] text-mist/60">Aucune position ouverte actuellement.</div>
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
                </tr>
              </thead>
              <tbody>
                {positions.map((p, i) => (
                  <tr key={i} className="border-t hairline">
                    <td className="py-2.5 text-bone">{p.symbol}</td>
                    <td className={p.side === "long" ? "text-emerald-400" : "text-rose-400"}>{p.side}</td>
                    <td className="text-right text-mist">{p.size}</td>
                    <td className="text-right text-mist">{fmtUsd(p.entry)}</td>
                    <td className="text-right text-mist">{fmtUsd(p.mark)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Disclaimer>
        Environnement de démonstration — suivi informatif de l'activité du trader. Ne constitue pas
        un conseil en investissement.
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
  const timer = useRef(null);

  async function refresh() {
    const d = await copyState();
    setS(d);
    if (d && d.settings && !draft) setDraft(d.settings);
  }

  useEffect(() => {
    setUser(getUser());
    refresh();
    timer.current = setInterval(refresh, 4000);
    return () => clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const configured = s && s.configured;
  const status = (s && s.status) || "idle";
  const meta = STATUS_META[status] || STATUS_META.idle;
  const active = s && s.active;

  async function saveKeys() {
    setBusy(true); setMsg("");
    const r = await copySaveKeys(keyForm.api_key.trim(), keyForm.api_secret.trim());
    setBusy(false);
    if (r.ok) { setKeyForm({ api_key: "", api_secret: "" }); setMsg("Clés enregistrées ✓"); refresh(); }
    else setMsg(r.error === "invalid_keys" ? "Clés refusées par le sandbox (vérifie qu'elles sont bien des clés démo Futures)." : "Erreur : " + (r.detail || r.error));
  }
  async function doStart() {
    setBusy(true); const r = await copyStart(); setBusy(false);
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
        <h3 className="font-display text-[18px] text-bone">Copy-trading <DemoTag /></h3>
        <span className={`inline-flex items-center gap-2 text-[12px] ${meta.color}`}>
          <span className={`h-2 w-2 rounded-full ${meta.dot}`} /> {meta.label}
        </span>
      </div>

      {!configured ? (
        /* ---- onboarding : saisie des clés ---- */
        <div className="rounded-2xl border gold-line bg-ink-800/40 p-6 max-w-2xl">
          <h4 className="font-display text-[18px] text-bone">Connecte ton compte démo Futures</h4>
          <p className="mt-2 text-[13.5px] leading-relaxed text-mist">
            Le copy-trading réplique automatiquement les positions du trader sur <b>ton</b> compte
            de démonstration Kraken Futures. Crée deux clés API sur{" "}
            <a className="text-gold underline" href="https://demo-futures.kraken.com" target="_blank" rel="noopener noreferrer">
              demo-futures.kraken.com
            </a>{" "}
            (Settings → API Keys, droit de trading), puis colle-les ci-dessous.
          </p>
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
          {/* contrôles */}
          <div className="flex items-center gap-3 flex-wrap">
            {!active ? (
              <button disabled={busy} onClick={doStart}
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
