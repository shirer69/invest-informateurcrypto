"use client";

import { useEffect, useState, useCallback } from "react";
import { copyMaster, apiAccess } from "@/lib/clientStore";
import { API_BASE } from "@/lib/site";
import { Locked, useUnlock } from "./UnlockProvider";
import RealFuturesPositions from "./RealFuturesPositions";
import LiveTag from "./LiveTag";
import InvestPnlStats from "./InvestPnlStats";
import KrakenLogo from "@/components/KrakenLogo";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import { IconArrow } from "@/components/Icons";
import TrackRecord from "@/components/TrackRecord";
import Countdown from "@/components/Countdown";
import { ChallengeBlock } from "@/components/dashboard/Sections";

// Barre d'accès au groupe VIP Telegram (grisée tant que le dashboard est verrouillé).
function VipJoinBar() {
  const { locked, openUnlock } = useUnlock();
  const [link, setLink] = useState("");
  useEffect(() => {
    let stored = "";
    try { stored = localStorage.getItem("pi_tg_link") || ""; } catch {}
    if (stored) { setLink(stored); return; }
    // Fallback : récupère le lien depuis l'API si absent du localStorage (autre device, etc.)
    apiAccess().then((d) => {
      if (d && d.tg_invite) {
        setLink(d.tg_invite);
        try { localStorage.setItem("pi_tg_link", d.tg_invite); } catch {}
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="rounded-2xl border gold-line bg-gradient-to-r from-ink-700/60 to-ink-900 p-4 mb-5 flex flex-wrap items-center gap-3 justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <span className="grid place-items-center h-10 w-10 shrink-0 rounded-xl border gold-line text-gold">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
            <path d="M9.04 15.47 8.7 20.3c.46 0 .66-.2.9-.43l2.16-2.07 4.48 3.28c.82.45 1.41.21 1.63-.76l2.95-13.81c.26-1.2-.44-1.67-1.24-1.38L2.5 9.66c-1.18.46-1.16 1.12-.2 1.42l4.71 1.47L17.9 6.6c.5-.33.96-.15.58.18z" />
          </svg>
        </span>
        <div className="min-w-0">
          <div className="font-display text-[15px] text-bone">Groupe VIP Telegram</div>
          <div className="text-[12px] text-mist">
            {locked
              ? "Débloquez votre accès pour rejoindre le canal privé et obtenir les calls/signaux."
              : link
                ? <a href={link} target="_blank" rel="noopener noreferrer" className="text-gold underline underline-offset-2 hover:opacity-80">Votre accès est actif — rejoignez le canal privé.</a>
                : "Votre accès est actif — rejoignez le canal privé."
            }
          </div>
        </div>
      </div>

      {locked ? (
        <button
          onClick={openUnlock}
          title="Débloquez votre accès pour rejoindre le groupe VIP"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold border hairline text-mist/70 cursor-not-allowed opacity-60"
        >
          <span aria-hidden>🔒</span> Rejoindre le groupe Telegram
        </button>
      ) : link ? (
        <a
          href={link} target="_blank" rel="noopener noreferrer"
          className="btn-gold inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold"
        >
          Rejoindre le groupe Telegram <IconArrow className="h-4 w-4" />
        </a>
      ) : (
        <span className="text-[12px] text-mist/70">Lien VIP envoyé par e-mail / dans l'onglet Wallet.</span>
      )}
    </div>
  );
}

// Icônes SVG par catégorie
const ICONS = {
  crypto: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 8h4.5a2 2 0 0 1 0 4H9m0 0h5a2 2 0 0 1 0 4H9M9 8V6m0 2v8m0 0v2m3-10V6m0 10v2" />
    </svg>
  ),
  stock: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 17 8 12 12 16 17 9 21 13" />
      <line x1="3" y1="21" x2="21" y2="21" />
      <line x1="3" y1="3" x2="3" y2="21" />
    </svg>
  ),
  margin: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V8m0 8-3-3m3 3 3-3M17 8v8m0-8 3 3m-3-3-3 3" />
      <line x1="12" y1="4" x2="12" y2="20" strokeDasharray="2 2" strokeWidth="1.2" />
    </svg>
  ),
  perps: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  cash: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  ),
};

// Couleurs par catégorie (identification rapide)
const CAT = {
  crypto: { label: "Spot crypto", color: "#C9A24B" },
  stock: { label: "Actions / ETF tokenisés", color: "#7C5CFC" },
  margin: { label: "Marge (positions)", color: "#5BA8FF" },
  perps: { label: "Futures crypto (perps)", color: "#19C37D" },
  cash: { label: "Cash / stables", color: "#8A93A6" },
};

// Affichage des montants : multipliés par 100 (échelle d'affichage du compte).
const DISPLAY_MULT = 100;
// Le suivi de performance démarre le 15 juin 2026.
const TRACKING_STARTED = true;
const TRACKING_START_LABEL = "15 juin 2026";
const fmtUsd = (x) =>
  x == null || isNaN(x)
    ? "—"
    : "$" + Number(x * DISPLAY_MULT).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (v, t) => (t > 0 ? (v / t) * 100 : 0);

function Spinner({ size = 16, className = "" }) {
  return (
    <svg className={`animate-spin ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Table({ rows, cols, mobileMax, blurred }) {
  if (!rows.length) return <p className="px-5 py-4 text-[13px] text-mist">Aucun actif.</p>;
  const hiddenOnMobile = mobileMax ? Math.max(0, rows.length - mobileMax) : 0;
  return (
    <>
      <table className="w-full text-[13.5px]">
        <thead>
          <tr className="text-left font-mono text-[10px] uppercase tracking-widest2 text-mist/60 border-b hairline">
            {cols.map((c) => (
              <th key={c.k} className={`px-5 py-3 ${c.right ? "text-right" : ""} ${c.hide || ""}`}>{c.h}</th>
            ))}
          </tr>
        </thead>
        <tbody style={blurred ? { filter: "blur(5px)", userSelect: "none", pointerEvents: "none" } : undefined}>
          {rows.map((r, i) => (
            <tr key={i}
              className={`border-b hairline last:border-0 ${mobileMax && i >= mobileMax ? "hidden sm:table-row" : ""}`}>
              {cols.map((c) => (
                <td key={c.k} className={`px-5 py-3 ${c.right ? "text-right font-mono" : ""} ${c.cls ? c.cls(r) : "text-bone"} ${c.hide || ""}`}>
                  {c.render ? c.render(r) : r[c.k]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {hiddenOnMobile > 0 && (
        <p className="sm:hidden px-5 py-2.5 text-[11.5px] text-mist/60 border-t hairline">
          + {hiddenOnMobile} autre{hiddenOnMobile > 1 ? "s" : ""} actif{hiddenOnMobile > 1 ? "s" : ""} — élargir l'écran pour tout voir.
        </p>
      )}
    </>
  );
}

function Section({ title, dot, icon, badge, children }) {
  return (
    <div className="rounded-2xl border hairline bg-ink-800/40 overflow-hidden">
      <div className="px-5 py-3 border-b hairline flex items-center gap-2">
        {icon && (
          <span className="grid place-items-center h-6 w-6 shrink-0 rounded-lg"
                style={{ background: dot ? `${dot}22` : "rgba(255,255,255,0.05)", color: dot || "currentColor" }}>
            {icon}
          </span>
        )}
        {!icon && dot && <span className="h-2 w-2 rounded-full shrink-0" style={{ background: dot }} />}
        <span className="font-display text-[15px] text-bone">{title}</span>
        {badge}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}


export default function PortfolioKraken({ onGoInvest, onGoTrading }) {
  const { locked } = useUnlock();
  const [loading, setLoading] = useState(true);
  const [spot, setSpot] = useState(null);
  const [fut, setFut] = useState(null);
  const [futPos, setFutPos] = useState(null);
  const [marginPos, setMarginPos] = useState([]);
  const [ftk, setFtk] = useState({}); // map symbole -> prix mark (perps)
  const [master, setMaster] = useState(null); // positions perps du trader maître (A)
  const [firstDone, setFirstDone] = useState(false); // 1er chargement complet terminé

  const load = useCallback(async () => {
    setLoading(true);
    // 1) Spot d'abord : affiche le contenu dès le retour (même si erreur).
    const s = await fetch("/api/kraken/spot/portfolio").then((r) => r.json()).catch(() => null);
    setSpot(s);
    setFirstDone(true); // toujours sortir du spinner après le 1er appel

    // 2) Le reste (futures, marge, tickers) en arrière-plan, sans bloquer l'affichage.
    const [f, fp, mp, tk, ma] = await Promise.all([
      fetch(`${API_BASE}/api/kraken/futures/account`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/kraken/futures/positions`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch("/api/kraken/spot/positions").then((r) => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/kraken/futures/tickers`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      copyMaster().catch(() => null),
    ]);
    setFut(f); setFutPos(fp); setMaster(ma);
    const map = {};
    for (const t of (tk?.tickers || [])) {
      const p = parseFloat(t.markPrice ?? t.last ?? 0);
      if (t.symbol && p) map[t.symbol.toUpperCase()] = p;
    }
    setFtk(map);
    // OpenPositions (marge) : result = { txid: {...} }
    const raw = mp?.result || {};
    const list = Object.entries(raw).map(([id, p]) => ({
      id, pair: p.pair, side: p.type,
      vol: parseFloat(p.vol) || 0,
      cost: parseFloat(p.cost) || 0,
      margin: parseFloat(p.margin) || 0,
      value: parseFloat(p.value ?? p.cost ?? 0) || 0,
      net: parseFloat(p.net ?? 0) || 0,
    }));
    setMarginPos(list);
    setLoading(false);
    setFirstDone(true); // 1 tentative suffit : on n'entre JAMAIS dans une boucle de retry
  }, []);

  // Charge les données au montage (portfolio visible même dashboard verrouillé).
  useEffect(() => { load(); }, [load]);

  // Rafraîchissement DOUX toutes les 60 s.
  useEffect(() => {
    const id = setInterval(() => load(), 60000);
    return () => clearInterval(id);
  }, [load]);

  const holdings = spot?.ok ? spot.holdings : [];
  const t = spot?.totals || {};

  const futValue =
    fut?.data?.accounts?.flex?.portfolioValue ??
    fut?.data?.accounts?.flex?.collateralValue ?? 0;
  const futPositionsRaw = futPos?.data?.openPositions || [];
  const marginTotal = marginPos.reduce((s, p) => s + p.value, 0);

  // Composition globale
  const comp = {
    crypto: t.crypto || 0,
    stock: t.stock || 0,
    margin: marginTotal,
    perps: Number(futValue) || 0,
    cash: t.cash || 0,
  };
  const total = Object.values(comp).reduce((s, v) => s + v, 0);
  const segs = Object.entries(comp).filter(([, v]) => v > 0);

  // Part & P&L TOUJOURS relatifs à la valeur totale du portefeuille
  const shareOf = (v) => (total > 0 ? ((v || 0) / total) * 100 : 0);
  const pnlPctOf = (net) => (total > 0 ? ((net || 0) / total) * 100 : null);
  const px = (n) => (n && isFinite(n) ? Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 6 }) : "—");
  const pnlCell = (r) => {
    if (r._abs == null && r._pnl == null) return "—";
    const a = r._abs != null ? `${r._abs >= 0 ? "+" : ""}${fmtUsd(r._abs)}` : "";
    const p = r._pnl != null ? `${r._pnl >= 0 ? "+" : ""}${r._pnl.toFixed(2)} %` : "";
    return a && p ? `${a} · ${p}` : a || p;
  };

  // P&L ABSOLU par actif (progression depuis le 15 juin), en % de la valeur TOTALE du compte.
  // Tant que le suivi n'a pas démarré (TRACKING_STARTED=false) → 0.
  const spotAbs = (h) =>
    h.cost != null && h.cost > 0 && h.value != null ? h.value - h.cost : null;
  const absOf = (a) => (TRACKING_STARTED ? a : 0);
  const pnlOf = (a) => (TRACKING_STARTED ? (a == null ? null : pnlPctOf(a)) : 0);
  const crypto = holdings.filter((h) => h.kind === "crypto" && total > 0 && (h.value || 0) / total >= 0.005).map((h) => { const a = spotAbs(h); return { ...h, cur: h.price, _abs: absOf(a), _share: shareOf(h.value), _pnl: pnlOf(a) }; });
  const stocks = holdings.filter((h) => h.kind === "stock" && total > 0 && (h.value || 0) / total >= 0.005).map((h) => { const a = spotAbs(h); return { ...h, cur: h.price, _abs: absOf(a), _share: shareOf(h.value), _pnl: pnlOf(a) }; });
  const cash = holdings.filter((h) => h.kind === "cash").map((h) => ({ ...h, _share: shareOf(h.value) }));

  const marginRows = marginPos.map((p) => ({
    ...p,
    entry: p.vol > 0 ? p.cost / p.vol : null,
    cur: p.vol > 0 ? p.value / p.vol : null, // prix actuel ≈ valeur courante / volume
    lev: p.margin > 0 ? p.cost / p.margin : null,
    tp: null, sl: null,
    _abs: absOf(p.net),
    _share: shareOf(p.value),
    _pnl: pnlOf(p.net),
  }));

  // Section perps = positions du compte Futures RÉEL (master A), via /api/kraken/futures/positions
  const perps = futPositionsRaw.map((p) => {
    const entry = parseFloat(p.price) || 0;
    const mark = ftk[(p.symbol || "").toUpperCase()] || parseFloat(p.markPrice) || 0;
    const isLong = (p.side || "").toLowerCase() === "long";
    const size = Math.abs(parseFloat(p.size) || 0);
    const notional = size * (mark || entry);
    const abs = entry && mark ? (mark - entry) * size * (isLong ? 1 : -1) : null; // PnL latent ($)
    return {
      symbol: (p.symbol || "").toUpperCase(),
      side: isLong ? "long" : "short",
      entry,
      cur: mark,
      lev: parseFloat(p.maxFixedLeverage) || null,
      tp: null, sl: null,
      _abs: absOf(abs),
      _share: shareOf(notional),
      _pnl: pnlOf(abs),
    };
  });

  // P&L GLOBAL du compte depuis le 15 juin.
  // Seul le spot (crypto + stocks) a une baseline June 15 fiable depuis le VPS.
  // Margin (`net` depuis ouverture) et perps (`abs` depuis entrée) sont exclus du calcul hero.
  const sumAbs = (arr) => arr.reduce((s, r) => s + (r._abs || 0), 0);
  const baselinedTotal = (t.crypto || 0) + (t.stock || 0) + (t.cash || 0) + (Number(futValue) || 0);
  const accountAbs = TRACKING_STARTED ? sumAbs(crypto) + sumAbs(stocks) : 0;
  const accountPnlPct = TRACKING_STARTED ? (baselinedTotal > 0 ? (accountAbs / baselinedTotal) * 100 : null) : 0;
  // DEBUG temporaire — à supprimer
  if (typeof window !== "undefined" && !loading) console.warn("[PnL-DEBUG]", { accountAbs: accountAbs.toFixed(6), baselinedTotal: baselinedTotal.toFixed(4), pct: accountPnlPct?.toFixed(4), cryptoAbs: sumAbs(crypto).toFixed(6), stocksAbs: sumAbs(stocks).toFixed(6), marginAbsRaw: sumAbs(marginRows).toFixed(6), perpsAbsRaw: sumAbs(perps).toFixed(6), marginCount: marginRows.length, perpsCount: perps.length });

  // KPIs Spot (non réalisés = value − cost, basé sur les données Kraken en direct)
  const unrealizedSpot = holdings
    .filter((h) => h.kind === "crypto" || h.kind === "stock")
    .reduce((s, h) => s + (h.cost != null && h.value != null ? h.value - h.cost : 0), 0);
  const unrealizedSpotPct = total > 0 ? (unrealizedSpot / total) * 100 : null;
  const spotKpis = [
    {
      label: "Gains non réalisés",
      value: unrealizedSpot !== 0 ? `${unrealizedSpot >= 0 ? "+" : ""}${fmtUsd(unrealizedSpot)}` : "—",
      sub: unrealizedSpotPct != null && unrealizedSpot !== 0 ? `${unrealizedSpotPct >= 0 ? "+" : ""}${unrealizedSpotPct.toFixed(2)} %` : null,
      cls: unrealizedSpot >= 0 ? "text-emerald-400" : "text-rose-400",
    },
    {
      label: "Gains réalisés",
      value: "—",
      sub: "Suivi actif 15 juin",
      cls: "text-mist/60",
    },
    {
      label: "Drawdown max",
      value: "—",
      sub: "Suivi actif 15 juin",
      cls: "text-mist/60",
    },
    {
      label: "Positions spot",
      value: String(crypto.length + stocks.length),
      sub: `${cash.length} cash · ${marginRows.length} margin`,
      cls: "text-bone",
    },
  ];

  const header = (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <h3 className="font-display text-[18px] text-bone">Micro hedge funds</h3>
        <LiveTag />
        <button onClick={load} disabled={loading}
          className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-mist hover:text-bone disabled:opacity-60">
          {loading ? <Spinner size={13} /> : "↻"} {loading ? "chargement…" : "rafraîchir"}
        </button>
      </div>
    </div>
  );

  // Spinner plein écran tant que le 1er chargement complet n'est pas terminé
  // (on n'affiche le P&L du compte qu'une fois toutes les données remontées).
  if (!firstDone) {
    return (
      <div>
        {header}
        {!TRACKING_STARTED && <Countdown variant="dashboard" />}
        <VipJoinBar />
        <div className="grid place-items-center gap-3 py-24 text-mist">
          <Spinner size={34} className="text-gold" />
          <p className="text-[13px]">Chargement des données Kraken…</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {header}
      {!TRACKING_STARTED && <Countdown variant="dashboard" />}

      <VipJoinBar />

      {/* Hero total + composition */}
      <div className="relative rounded-3xl border overflow-hidden p-7 mb-5" style={{ borderColor: "rgba(124,92,252,0.30)" }}>
        <div className="pointer-events-none absolute -top-20 -right-10 h-56 w-56 rounded-full blur-3xl"
             style={{ background: "radial-gradient(circle, rgba(124,92,252,0.22), transparent 70%)" }} />
        {/* Logo Kraken en filigrane (violet) */}
        <KrakenLogo
          mark wordmark={false} color="#7C5CFC"
          className="pointer-events-none absolute -bottom-8 -right-6 opacity-[0.10] [&_svg]:h-44 [&_svg]:w-44"
        />
        <div className="relative">
          <div className="font-mono text-[10px] uppercase tracking-widest2" style={{ color: "#7C5CFC" }}>
            P&amp;L compte INVEST{TRACKING_STARTED ? ` · depuis le ${TRACKING_START_LABEL}` : null}
          {!TRACKING_STARTED && (
            <> · <span className="text-gold font-semibold">démarrage le {TRACKING_START_LABEL}</span></>
          )}
          </div>
          <div className={`mt-2 font-display text-[44px] md:text-[54px] leading-none ${
            accountPnlPct == null ? "text-bone" : accountPnlPct >= 0 ? "text-emerald-400" : "text-rose-400"
          }`}>
            {loading ? "…" : accountPnlPct == null ? "—" : `${accountPnlPct >= 0 ? "+" : ""}${accountPnlPct.toFixed(2)} %`}
          </div>
          <div className="mt-1.5 font-mono text-[12.5px]">
            <span className={accountAbs >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {accountAbs >= 0 ? "+" : ""}{fmtUsd(accountAbs)}
            </span>
            <span className="text-mist/60"> · valeur totale du compte {fmtUsd(total)}</span>
          </div>
          <div className="mt-4 font-mono text-[10px] uppercase tracking-widest2 text-mist/60">
            Composition du portefeuille
          </div>

          {/* Barre de composition segmentée */}
          <div className="mt-5 flex h-3.5 w-full rounded-full overflow-hidden bg-white/[0.05]">
            {segs.map(([k, v]) => (
              <div key={k} title={`${CAT[k].label} — ${fmtUsd(v)}`}
                   style={{ width: `${pct(v, total)}%`, background: CAT[k].color }} />
            ))}
          </div>

          {/* Légende */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(CAT).map(([k, c]) => (
              <div key={k} className="flex items-start gap-2">
                <span className="mt-1 h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: c.color }} />
                <div className="leading-tight">
                  <div className="text-[12px] text-bone">{c.label}</div>
                  <div className="font-mono text-[13px] text-bone">
                    {pct(comp[k], total).toFixed(0)}<span className="text-mist/60"> %</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bouton Voir les actifs — juste sous le bloc P&L, avant les témoignages */}
      {onGoInvest && (
        <button
          onClick={onGoInvest}
          className="mt-4 w-full flex items-center justify-between gap-3 rounded-xl border gold-line bg-gradient-to-r from-ink-700/60 to-ink-900 px-4 py-2.5 hover:border-gold/50 transition-colors"
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

      {/* Carrousel témoignages */}
      <div className="mb-5 mt-5"><TestimonialCarousel /></div>

      {/* Courbe equity (dashboard verrouillé uniquement) */}
      {locked && (
        <div className="mb-5">
          <TrackRecord />
        </div>
      )}

      <div className="mt-5">
        <ChallengeBlock onGoTrading={onGoTrading} />
      </div>

    </div>
  );
}

/* Tableaux d'actifs réutilisables (Invest tab) */
export function AssetTables() {
  const { investAccess, openUnlock } = useUnlock();
  const blurred = !investAccess;
  const [spot, setSpot] = useState(null);
  const [fut, setFut] = useState(null);
  const [futPos, setFutPos] = useState(null);
  const [marginPos, setMarginPos] = useState([]);
  const [ftk, setFtk] = useState({});
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    const s = await fetch("/api/kraken/spot/portfolio").then((r) => r.json()).catch(() => null);
    setSpot(s); setDone(true);
    const [f, fp, mp, tk] = await Promise.all([
      fetch(`${API_BASE}/api/kraken/futures/account`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/kraken/futures/positions`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch("/api/kraken/spot/positions").then((r) => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/kraken/futures/tickers`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
    ]);
    setFut(f); setFutPos(fp);
    const map = {};
    for (const tk2 of (tk?.tickers || [])) {
      const p = parseFloat(tk2.markPrice ?? tk2.last ?? 0);
      if (tk2.symbol && p) map[tk2.symbol.toUpperCase()] = p;
    }
    setFtk(map);
    const raw = mp?.result || {};
    setMarginPos(Object.entries(raw).map(([id, p]) => ({
      id, pair: p.pair, side: p.type,
      vol: parseFloat(p.vol) || 0, cost: parseFloat(p.cost) || 0,
      margin: parseFloat(p.margin) || 0,
      value: parseFloat(p.value ?? p.cost ?? 0) || 0,
      net: parseFloat(p.net ?? 0) || 0,
    })));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!done) {
    return (
      <div className="grid place-items-center py-12 text-mist">
        <Spinner size={28} className="text-gold" />
      </div>
    );
  }

  const holdings = spot?.ok ? spot.holdings : [];
  const t2 = spot?.totals || {};
  const futValue = fut?.data?.accounts?.flex?.portfolioValue ?? fut?.data?.accounts?.flex?.collateralValue ?? 0;
  const futPositionsRaw = futPos?.data?.openPositions || [];
  const marginTotal = marginPos.reduce((s, p) => s + p.value, 0);
  const comp2 = { crypto: t2.crypto || 0, stock: t2.stock || 0, margin: marginTotal, perps: Number(futValue) || 0, cash: t2.cash || 0 };
  const total2 = Object.values(comp2).reduce((s, v) => s + v, 0);
  const shareOf2 = (v) => (total2 > 0 ? ((v || 0) / total2) * 100 : 0);
  const pnlPctOf2 = (net) => (total2 > 0 ? ((net || 0) / total2) * 100 : null);
  const px2 = (n) => (n && isFinite(n) ? Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 6 }) : "—");
  const pnlCell2 = (r) => {
    if (r._abs == null && r._pnl == null) return "—";
    const a = r._abs != null ? `${r._abs >= 0 ? "+" : ""}${fmtUsd(r._abs)}` : "";
    const p2 = r._pnl != null ? `${r._pnl >= 0 ? "+" : ""}${r._pnl.toFixed(2)} %` : "";
    return a && p2 ? `${a} · ${p2}` : a || p2;
  };
  const spotAbs2 = (h) => h.cost != null && h.cost > 0 && h.value != null ? h.value - h.cost : null;
  const absOf2 = (a) => (TRACKING_STARTED ? a : 0);
  const pnlOf2 = (a) => (TRACKING_STARTED ? (a == null ? null : pnlPctOf2(a)) : 0);
  const crypto2 = holdings.filter((h) => h.kind === "crypto" && total2 > 0 && (h.value || 0) / total2 >= 0.005).map((h) => { const a = spotAbs2(h); return { ...h, cur: h.price, _abs: absOf2(a), _share: shareOf2(h.value), _pnl: pnlOf2(a) }; });
  const stocks2 = holdings.filter((h) => h.kind === "stock" && total2 > 0 && (h.value || 0) / total2 >= 0.005).map((h) => { const a = spotAbs2(h); return { ...h, cur: h.price, _abs: absOf2(a), _share: shareOf2(h.value), _pnl: pnlOf2(a) }; });
  const cash2 = holdings.filter((h) => h.kind === "cash").map((h) => ({ ...h, _share: shareOf2(h.value) }));
  const marginRows2 = marginPos.map((p) => ({
    ...p,
    entry: p.vol > 0 ? p.cost / p.vol : null,
    cur: p.vol > 0 ? p.value / p.vol : null,
    lev: p.margin > 0 ? p.cost / p.margin : null,
    tp: null, sl: null,
    _abs: absOf2(p.net), _share: shareOf2(p.value), _pnl: pnlOf2(p.net),
  }));
  const perps2 = futPositionsRaw.map((p) => {
    const entry = parseFloat(p.price) || 0;
    const mark = ftk[(p.symbol || "").toUpperCase()] || parseFloat(p.markPrice) || 0;
    const isLong = (p.side || "").toLowerCase() === "long";
    const size = Math.abs(parseFloat(p.size) || 0);
    const notional = size * (mark || entry);
    const abs = entry && mark ? (mark - entry) * size * (isLong ? 1 : -1) : null;
    return { symbol: (p.symbol || "").toUpperCase(), side: isLong ? "long" : "short", entry, cur: mark, lev: parseFloat(p.maxFixedLeverage) || null, tp: null, sl: null, _abs: absOf2(abs), _share: shareOf2(notional), _pnl: pnlOf2(abs) };
  });

  return (
    <div className="space-y-5 mt-4">
      <Section title="Spot crypto" dot={CAT.crypto.color} icon={ICONS.crypto}>
        <Table rows={crypto2} mobileMax={3} blurred={blurred} cols={[
          { k: "symbol", h: "Actif" },
          { k: "cur", h: "Prix actuel", right: true, hide: "hidden sm:table-cell", render: (r) => px2(r.cur) },
          { k: "value", h: "Valeur", right: true, render: (r) => fmtUsd(r.value) },
          { k: "_share", h: "Part", right: true, cls: () => "text-gold", render: (r) => `${r._share.toFixed(1)} %` },
          { k: "_pnl", h: "P&L", right: true, cls: (r) => (r._pnl == null ? "text-mist" : r._pnl >= 0 ? "text-emerald-400" : "text-rose-400"), render: pnlCell2 },
        ]} />
      </Section>
      <Section title="Actions / ETF tokenisés" dot={CAT.stock.color} icon={ICONS.stock}>
        <div className="relative">
          <Table rows={stocks2} blurred={blurred} cols={[
            { k: "symbol", h: "Titre" },
            { k: "cur", h: "Prix actuel", right: true, hide: "hidden sm:table-cell", render: (r) => px2(r.cur) },
            { k: "value", h: "Valeur", right: true, render: (r) => fmtUsd(r.value) },
            { k: "_share", h: "Part", right: true, cls: () => "text-gold", render: (r) => `${r._share.toFixed(1)} %` },
            { k: "_pnl", h: "P&L", right: true, cls: (r) => (r._pnl == null ? "text-mist" : r._pnl >= 0 ? "text-emerald-400" : "text-rose-400"), render: pnlCell2 },
          ]} />
          {blurred && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <button onClick={openUnlock} className="btn-gold inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold shadow-xl">
                🔒 Déverrouiller
              </button>
            </div>
          )}
        </div>
      </Section>
      <Section title="Positions sur marge" dot={CAT.margin.color} icon={ICONS.margin}>
        <Table rows={marginRows2} blurred={blurred} cols={[
          { k: "pair", h: "Paire" },
          { k: "side", h: "Sens", cls: (r) => (r.side === "buy" ? "text-emerald-400" : "text-rose-400"), render: (r) => (r.side === "buy" ? "Long" : "Short") },
          { k: "entry", h: "Entrée", right: true, hide: "hidden sm:table-cell", render: (r) => px2(r.entry) },
          { k: "cur", h: "Prix actuel", right: true, hide: "hidden sm:table-cell", render: (r) => px2(r.cur) },
          { k: "lev", h: "Levier", right: true, hide: "hidden md:table-cell", render: (r) => (r.lev ? `×${r.lev.toFixed(1)}` : "—") },
          { k: "value", h: "Valeur", right: true, render: (r) => fmtUsd(r.value) },
          { k: "_share", h: "Part", right: true, cls: () => "text-gold", render: (r) => `${r._share.toFixed(1)} %` },
          { k: "_pnl", h: "P&L", right: true, cls: (r) => (r._pnl == null ? "text-mist" : r._pnl >= 0 ? "text-emerald-400" : "text-rose-400"), render: pnlCell2 },
        ]} />
      </Section>
      <Section title="Futures crypto (perps)" dot={CAT.perps.color} icon={ICONS.perps}>
        <div className="relative">
          <div style={blurred ? { filter: "blur(5px)", userSelect: "none", pointerEvents: "none" } : undefined}>
            <div className="p-1.5"><RealFuturesPositions /></div>
          </div>
          {blurred && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <button onClick={openUnlock} className="btn-gold inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold shadow-xl">
                🔒 Déverrouiller
              </button>
            </div>
          )}
        </div>
      </Section>
      <Section title="Cash & stablecoins" dot={CAT.cash.color} icon={ICONS.cash}>
        <Table rows={cash2} blurred={blurred} cols={[
          { k: "symbol", h: "Devise" },
          { k: "value", h: "Valeur", right: true, render: (r) => fmtUsd(r.value) },
          { k: "_share", h: "Part", right: true, cls: () => "text-gold", render: (r) => `${r._share.toFixed(1)} %` },
        ]} />
      </Section>
    </div>
  );
}
