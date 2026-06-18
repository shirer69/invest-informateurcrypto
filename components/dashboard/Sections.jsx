"use client";

import { useState, useEffect, useRef } from "react";
import TrackRecord from "@/components/TrackRecord";
import { IconArrow } from "@/components/Icons";
import Chat from "@/components/dashboard/Chat";
import VipFeed from "@/components/dashboard/VipFeed";
import AudioFeed from "@/components/dashboard/AudioFeed";
import { Locked, useUnlock } from "@/components/dashboard/UnlockProvider";
import RealFuturesPositions from "@/components/dashboard/RealFuturesPositions";
import { AssetTables } from "@/components/dashboard/PortfolioKraken";
import InvestPnlStats from "@/components/dashboard/InvestPnlStats";
import LiveTag from "@/components/dashboard/LiveTag";
import TickerBanner from "@/components/dashboard/TickerBanner";
import {
  getUser, getToken, copyState, copySaveKeys, copySaveSpotKeys, copySettings, copyStart, copyStop,
  copyResetBaseline, copyDeleteKeys, copyMaster, copyMasterPnl,
  copyContract, copyContractSign, copySpotPlan, copyMarginPlan,
  poleTradingAudios, audioStreamUrl, poleTradingFeed, photoUrl, apiAccessCode, apiGetLikes, apiToggleReaction,
} from "@/lib/clientStore";
import { KPIS, POSITIONS, SIGNALS, MONTHLY, RISK } from "@/lib/dashboardData";
import LegalDisclaimer from "@/components/LegalDisclaimer";

const DemoTag = () => (
  <span className="font-mono text-[9px] uppercase tracking-widest2 text-mist/50 border hairline rounded px-1.5 py-0.5">
    démo
  </span>
);

const RECALL_TG = "https://t.me/clubdesinformateurs?text=" + encodeURIComponent("Bonjour, je souhaite être rappelé à propos du copy auto Kraken.");
const RecallButton = () => (
  <a href={RECALL_TG} target="_blank" rel="noopener noreferrer"
    className="inline-flex items-center gap-2 rounded-full border hairline px-4 py-2.5 text-[13px] text-mist hover:text-bone hover:border-gold/40 transition-colors">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0 text-gold">
      <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
    </svg>
    Je souhaite être rappelé
  </a>
);

const Disclaimer = ({ children }) => (
  <p className="mt-1.5 text-[11.5px] leading-relaxed text-mist/60">{children}</p>
);

/* ---------------- Vue d'ensemble ---------------- */
export function Overview({ tgLink }) {
  const { locked } = useUnlock();
  return (
    <div>
      <div className={`mt-5 gap-5 items-start ${locked ? "grid lg:grid-cols-[1.6fr_1fr]" : ""}`}>
        {locked && (
          <div>
            <h3 className="mb-3 font-display text-[17px] text-bone">Courbe de performance</h3>
            <TrackRecord />
          </div>
        )}
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
    </div>
  );
}

/* ---------------- Dernier investissement (bloc commun Invest + Actions) ---------------- */
const DISPLAY_MULT = 100;

const LAST_INVEST_MOCK = {
  symbol: "BTC",
  entry_ts: 1748700000,
  baseline: 94200,
  value: 0.0495 / 100,
  cost:  0.0462 / 100,
};

function LastTradeTeaser({ trades }) {
  const { locked, openUnlock } = useUnlock();
  if (!locked) return null;

  const last = [...(trades || [])].sort((a, b) => (b.created_at || 0) - (a.created_at || 0))[0];

  const fmtDate = (ts) => {
    if (!ts) return null;
    return new Date(ts * 1000).toLocaleString("fr-FR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const lastDate = last?.created_at ? fmtDate(last.created_at) : null;
  const asset = last?.asset || "NAS100";
  const direction = last?.direction || "LONG";
  const pnl = last?.pnl_usd ?? 0;
  const pnlStr = (pnl >= 0 ? "+" : "") + "$" + Math.abs(pnl).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pnlCls = pnl >= 0 ? "text-emerald-400" : "text-rose-400";

  return (
    <div className="rounded-2xl border hairline bg-ink-800/40 px-5 py-3.5 mb-5 flex flex-wrap items-center gap-x-6 gap-y-2">
      {/* Titre + date — toujours visibles */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">Dernier investissement</span>
      </div>
      {lastDate && (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/50">Le</span>
          <span className="font-mono text-[12px] text-bone">{lastDate}</span>
        </div>
      )}
      {/* Contenu flouté + bouton déverrouiller */}
      <div className="relative flex flex-wrap items-center gap-x-6 gap-y-2 flex-1 min-w-[180px]">
        <div className="pointer-events-none select-none blur-[4px] opacity-60 flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/50">Actif</span>
            <span className="font-display text-[15px] text-bone">{asset}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/50">Direction</span>
            <span className="font-mono text-[13.5px] text-bone">{direction}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/50">PnL</span>
            <span className={`font-mono text-[13.5px] font-semibold ${pnlCls}`}>{pnlStr}</span>
          </div>
        </div>
        <button onClick={openUnlock} className="absolute inset-0 z-10 flex items-center justify-center">
          <span className="btn-gold inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-semibold shadow-lg">
            🔒 Obtenir l'accès
          </span>
        </button>
      </div>
    </div>
  );
}

function LastInvestmentMockup() {
  const { openUnlock } = useUnlock();
  const fmtUsd = (v) => "$" + Math.abs(v).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const MULT = DISPLAY_MULT;
  const value  = LAST_INVEST_MOCK.value  * MULT;
  const cost   = LAST_INVEST_MOCK.cost   * MULT;
  const pnlAbs = value - cost;
  const pnlPct = ((value - cost) / cost) * 100;
  return (
    <div className="rounded-2xl border hairline bg-ink-800/40 px-5 py-3.5 mb-5 flex flex-wrap items-center gap-x-6 gap-y-2">
      {/* Titre + date : toujours visibles */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">Dernier investissement</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/50">Acheté le</span>
        <span className="font-mono text-[12px] text-bone">31 mai 2025 · 09:14</span>
      </div>
      {/* Contenu financier : flou + bouton déverrouiller */}
      <div className="relative flex flex-wrap items-center gap-x-6 gap-y-2 flex-1">
        <div className="pointer-events-none select-none blur-[4px] opacity-60 flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/50">Actif</span>
            <span className="font-display text-[15px] text-bone">BTC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/50">Prix d'entrée</span>
            <span className="font-mono text-[13.5px] text-bone">{fmtUsd(LAST_INVEST_MOCK.baseline)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/50">Taille</span>
            <span className="font-mono text-[13.5px] text-bone">{fmtUsd(value)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/50">PnL en cours</span>
            <span className="font-mono text-[13.5px] font-semibold text-emerald-400">
              +{fmtUsd(pnlAbs)}
              <span className="ml-1 text-[11px] opacity-80">(+{pnlPct.toFixed(2)} %)</span>
            </span>
          </div>
        </div>
        <button
          onClick={openUnlock}
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <span className="btn-gold inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-semibold shadow-lg">
            🔒 Obtenir les signaux
          </span>
        </button>
      </div>
    </div>
  );
}

function LastInvestment({ kinds }) {
  const { locked } = useUnlock();
  const [item, setItem] = useState(null);

  useEffect(() => {
    // Fetch portfolio pour les infos financières (valeur, PnL…)
    const portfolioP = fetch("/api/kraken/spot/portfolio", { cache: "no-store" })
      .then((r) => r.json()).catch(() => null);
    // Fetch historique Kraken pour la vraie date du dernier achat
    const historyP = fetch(`${API_BASE_URL}/api/julien/trade-history`, { cache: "no-store" })
      .then((r) => r.json()).catch(() => null);

    Promise.all([portfolioP, historyP]).then(([port, hist]) => {
      if (!port?.ok || !port.holdings) return;
      const best = port.holdings
        .filter((h) => kinds.includes(h.kind) && h.value > 0 && h.baseline)
        .sort((a, b) => (b.entry_ts || 0) - (a.entry_ts || 0))[0];
      if (!best) return;

      // Remplacer entry_ts par la date réelle du dernier achat Kraken si disponible
      if (hist?.ok) {
        const buyTs = [
          ...(hist.spot_events || [])
            .filter((e) => ["achat", "renforcement", "long", "short"].includes((e.direction || "").toLowerCase()))
            .map((e) => e.created_at || 0),
          ...(hist.kraken_futures || [])
            .filter((f) => f.side === "buy")
            .map((f) => f.fillTime ? Math.floor(new Date(f.fillTime).getTime() / 1000) : 0),
        ].filter(Boolean).sort((a, b) => b - a);
        if (buyTs.length > 0) best.entry_ts = buyTs[0];
      }
      setItem(best);
    });
  }, [kinds]);

  if (locked || !item) return null;

  const MULT = DISPLAY_MULT;
  const value   = item.value  * MULT;
  const cost    = item.cost   ? item.cost * MULT : null;
  const pnlAbs  = cost != null ? value - cost : null;
  const pnlPct  = cost && cost > 0 ? ((value - cost) / cost) * 100 : null;
  const fmtUsd  = (v) => "$" + Math.abs(v).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const up      = pnlAbs == null || pnlAbs >= 0;

  const fmtEntryDate = (ts) => {
    if (!ts) return null;
    try {
      const d = new Date(ts * 1000);
      return d.toLocaleString("fr-FR", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return null; }
  };
  const entryDate = fmtEntryDate(item.entry_ts);

  return (
    <div className="rounded-2xl border hairline bg-ink-800/40 px-5 py-3.5 mb-5 flex flex-wrap items-center gap-x-6 gap-y-2">
      {/* label */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">Dernier investissement</span>
      </div>
      {/* actif */}
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/50">Actif</span>
        <span className="font-display text-[15px] text-bone">{item.symbol}</span>
      </div>
      {/* date d'achat */}
      {entryDate && (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/50">Acheté le</span>
          <span className="font-mono text-[12px] text-bone">{entryDate}</span>
        </div>
      )}
      {/* prix d'entrée */}
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/50">Prix d'entrée</span>
        <span className="font-mono text-[13.5px] text-bone">{item.baseline ? fmtUsd(item.baseline) : "—"}</span>
      </div>
      {/* taille */}
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/50">Taille</span>
        <span className="font-mono text-[13.5px] text-bone">{fmtUsd(value)}</span>
      </div>
      {/* PnL en cours */}
      <div className="flex items-center gap-1.5 ml-auto">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/50">PnL en cours</span>
        {pnlAbs != null ? (
          <span className={`font-mono text-[13.5px] font-semibold ${up ? "text-emerald-400" : "text-rose-400"}`}>
            {pnlAbs >= 0 ? "+" : "−"}{fmtUsd(pnlAbs)}
            {pnlPct != null && (
              <span className="ml-1 text-[11px] opacity-80">
                ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)} %)
              </span>
            )}
          </span>
        ) : <span className="font-mono text-[13.5px] text-mist/50">—</span>}
      </div>
    </div>
  );
}

/* ---------------- Historique trading master A ---------------- */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "https://api.informateurcrypto.fr";

function fmt_price(x) {
  if (x == null) return "—";
  return x >= 1000
    ? x.toLocaleString("fr-FR", { maximumFractionDigits: 0 })
    : x.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 5 });
}
function fmt_pnl_usd(x) {
  if (x == null) return null;
  const sign = x >= 0 ? "+" : "";
  return `${sign}$${Math.abs(x).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmt_date(ts) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function fmt_duration(s) {
  if (!s) return null;
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  if (d) return `${d}j ${h}h`;
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

const TYPE_BADGE = {
  futures: { label: "Futures", cls: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
  forex:   { label: "Forex",   cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  crypto:  { label: "Spot",    cls: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
  margin:  { label: "Marge",   cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  stock:   { label: "xStocks", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
};

function TradeBadge({ type }) {
  const b = TYPE_BADGE[type] || { label: type, cls: "bg-white/5 text-mist border-white/10" };
  return (
    <span className={`font-mono text-[9.5px] px-1.5 py-0.5 rounded border ${b.cls}`}>{b.label}</span>
  );
}

function TradeRow({ trade }) {
  const pnl = trade.pnl_usd ?? null;
  const pnlPct = trade.pnl_pct ?? null;
  const isPos = pnl != null ? pnl >= 0 : null;
  const dir = (trade.direction || "").toUpperCase();

  return (
    <tr className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
      <td className="py-2 pr-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <TradeBadge type={trade.type} />
          <span className="font-mono text-[12px] text-bone">{trade.asset || trade.symbol}</span>
        </div>
      </td>
      <td className="py-2 pr-3">
        <span className={`font-mono text-[11px] ${["LONG","ACHAT","RENFORCEMENT"].includes(dir) ? "text-emerald-400" : dir.includes("VENTE") || dir.includes("CLOTURE") || dir.includes("SHORT") ? "text-rose-400" : "text-mist/60"}`}>
          {trade.direction || "—"}
        </span>
      </td>
      <td className="py-2 pr-3 font-mono text-[11px] text-mist/70">{fmt_price(trade.entry_price)}</td>
      <td className="py-2 pr-3 font-mono text-[11px] text-mist/70">{fmt_price(trade.exit_price)}</td>
      <td className="py-2 pr-3">
        {pnl != null ? (
          <span className={`font-mono text-[11px] font-medium ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
            {fmt_pnl_usd(pnl)}
            {pnlPct != null && <span className="text-[10px] ml-1 opacity-70">({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)</span>}
          </span>
        ) : <span className="text-mist/30">—</span>}
      </td>
      <td className="py-2 pr-3 font-mono text-[10.5px] text-mist/50">{fmt_date(trade.close_ts || trade.created_at)}</td>
    </tr>
  );
}

function TradeHistory() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/julien/trade-history`, { cache: "no-store" })
      .then((r) => r.json()).catch(() => null)
      .then((d) => setData(d || null));
  }, []);

  const rows = data !== null ? [
    ...(data.kraken_futures || []).map((f) => ({
      type: "futures",
      asset: (f.symbol || "").replace("PF_", "").replace("USD", "/USD"),
      direction: f.side === "buy" ? "Long" : "Short",
      entry_price: f.price, exit_price: null,
      pnl_usd: f.realized_pnl ?? null, pnl_pct: null,
      close_ts: f.fillTime ? Math.floor(new Date(f.fillTime).getTime() / 1000) : null,
    })),
    ...(data.spot_events || []).map((t) => ({
      type: t.type || "crypto", asset: t.symbol === "XBT" ? "BTC" : t.symbol,
      direction: t.direction,
      entry_price: t.entry_price, exit_price: t.exit_price,
      pnl_usd: t.pnl_usd, pnl_pct: t.pnl_pct,
      close_ts: t.created_at, entry_ts: t.entry_ts,
      duration_s: t.duration_s,
    })),
  ].sort((a, b) => (b.close_ts || 0) - (a.close_ts || 0)) : [];

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <h4 className="font-display text-[16px] text-bone">Historique des trades</h4>
        <span className="font-mono text-[9px] uppercase tracking-widest2 text-gold/80 border gold-line rounded px-1.5 py-0.5">Compte INVEST Kraken</span>
      </div>

      {data === null ? (
        <div className="text-[13px] text-mist/60">Chargement de l'historique…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-ink-900/30 p-5 text-[13px] text-mist/50">Aucun trade enregistré.</div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-ink-900/30 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                {["Actif", "Direction", "Entrée", "Sortie", "PnL", "Date"].map((h) => (
                  <th key={h} className="py-2 pr-3 font-mono text-[9.5px] uppercase tracking-widest2 text-mist/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((t, i) => <TradeRow key={i} trade={t} />)}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-[11px] text-mist/40">
        Trades du compte maître Kraken (spot, marge, xStocks, futures perps).
        Données historiques — ne constituent pas un conseil en investissement.
      </p>
    </div>
  );
}

/* ---------------- Analytics ---------------- */
const moLabel = (m) => { const [y, mo] = m.split("-"); return `${mo}/${y.slice(2)}`; };
// Le suivi Analytics démarre à juin 2026 (les mois antérieurs sont ignorés).
const ANALYTICS_START_MONTH = "2026-06";

// Données de démonstration (affichées quand le dashboard est verrouillé) — valeurs à
// l'échelle interne (×100 à l'affichage). Pédagogiques, non contractuelles.
const DEMO_ROWS = [
  { month: "2026-04", spot: 1.9, stock: 0.8, margin: 0.5, perps: 1.3 },
  { month: "2026-05", spot: 2.6, stock: 1.4, margin: -0.4, perps: 2.0 },
  { month: "2026-06", spot: 3.2, stock: 1.7, margin: 0.9, perps: 2.6 },
].map((r) => ({ ...r, total: r.spot + r.stock + r.margin + r.perps }));

export function Analytics({ copyAccess, copyRequest, hasAccess, tgInvite, onRequestCopy }) {
  const { openUnlock } = useUnlock();
  const [localTgLink, setLocalTgLink] = useState(null);
  useEffect(() => {
    try { setLocalTgLink(localStorage.getItem("pi_tg_link") || null); } catch {}
  }, []);
  const effectiveTgLink = tgInvite || localTgLink;

  return (
    <div>
      <TickerBanner />
      <div className="flex items-center gap-3 mb-4 mt-4">
        <img src="/julien.jpg" alt="Julien" className="h-9 w-9 rounded-full object-cover shrink-0" />
        <h2 className="font-display text-[22px] text-bone tracking-tight">PÔLE INVEST</h2>
      </div>
      <LastInvestment kinds={["crypto", "margin"]} />

      {/* Notice démarrage portefeuille INVEST */}
      <div className="mt-4 flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-4">
        <span className="text-[18px] leading-none mt-0.5 shrink-0">⚠️</span>
        <div>
          <p className="font-semibold text-[13.5px] text-amber-300 leading-snug">Démarrage du portefeuille INVEST</p>
          <p className="mt-1 text-[13px] text-slate-300 leading-relaxed">
            Le suivi de performance démarre le <strong className="text-bone">24 juin 2026</strong>. Les montants sont déjà en direct — le P&amp;L sera calculé à partir de cette date.
          </p>
        </div>
      </div>

      {/* CTA copy auto */}
      <div className="mt-5">
        {copyAccess ? (
          <div className="w-full flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] px-4 py-2.5">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-emerald-400" fill="currentColor" aria-hidden>
              <path d="M9.04 15.47 8.7 20.3c.46 0 .66-.2.9-.43l2.16-2.07 4.48 3.28c.82.45 1.41.21 1.63-.76l2.95-13.81c.26-1.2-.44-1.67-1.24-1.38L2.5 9.66c-1.18.46-1.16 1.12-.2 1.42l4.71 1.47L17.9 6.6c.5-.33.96-.15.58.18z" />
            </svg>
            <span className="text-[13px] text-emerald-400 font-medium">Copy auto activé sur votre compte</span>
          </div>
        ) : !hasAccess ? (
          <button
            onClick={openUnlock}
            className="w-full flex items-center justify-between gap-3 rounded-xl border gold-line bg-gradient-to-r from-ink-700/60 to-ink-900 px-4 py-2.5 hover:border-gold/50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gold" fill="currentColor" aria-hidden>
                <path d="M9.04 15.47 8.7 20.3c.46 0 .66-.2.9-.43l2.16-2.07 4.48 3.28c.82.45 1.41.21 1.63-.76l2.95-13.81c.26-1.2-.44-1.67-1.24-1.38L2.5 9.66c-1.18.46-1.16 1.12-.2 1.42l4.71 1.47L17.9 6.6c.5-.33.96-.15.58.18z" />
              </svg>
              <span className="text-[13px] text-bone font-medium">Activer le copy auto — Pôle Invest</span>
            </div>
            <span className="btn-gold inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap shrink-0">
              Activer <IconArrow className="h-3 w-3" />
            </span>
          </button>
        ) : copyRequest ? (
          <div className="flex flex-col gap-2.5">
            <div className="w-full flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.07] px-4 py-2.5">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-[13px] text-amber-400 font-medium">Demande envoyée — en attente de validation</span>
            </div>
            <a
              href="https://t.me/clubdesinformateurs?text=Bonjour%2C%20je%20souhaite%20ouvrir%20un%20sous-compte%20Kraken%20d%C3%A9di%C3%A9%20au%20copy."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between gap-3 rounded-xl border border-sky-500/30 bg-sky-500/[0.07] px-4 py-2.5 hover:border-sky-400/50 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-sky-400" fill="currentColor" aria-hidden>
                  <path d="M9.04 15.47 8.7 20.3c.46 0 .66-.2.9-.43l2.16-2.07 4.48 3.28c.82.45 1.41.21 1.63-.76l2.95-13.81c.26-1.2-.44-1.67-1.24-1.38L2.5 9.66c-1.18.46-1.16 1.12-.2 1.42l4.71 1.47L17.9 6.6c.5-.33.96-.15.58.18z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-[13px] text-sky-300 font-medium leading-tight">Étape suivante — Créer un sous-compte Kraken</p>
                  <p className="text-[10.5px] text-mist/50 mt-0.5 truncate">Contacter @clubdesinformateurs sur Telegram</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-[11px] font-semibold text-sky-300 whitespace-nowrap shrink-0">
                Ouvrir <IconArrow className="h-3 w-3" />
              </span>
            </a>
          </div>
        ) : (
          <a
            href="https://t.me/clubdesinformateurs"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between gap-3 rounded-xl border gold-line bg-gradient-to-r from-ink-700/60 to-ink-900 px-4 py-2.5 hover:border-gold/50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gold" fill="currentColor" aria-hidden>
                <path d="M9.04 15.47 8.7 20.3c.46 0 .66-.2.9-.43l2.16-2.07 4.48 3.28c.82.45 1.41.21 1.63-.76l2.95-13.81c.26-1.2-.44-1.67-1.24-1.38L2.5 9.66c-1.18.46-1.16 1.12-.2 1.42l4.71 1.47L17.9 6.6c.5-.33.96-.15.58.18z" />
              </svg>
              <span className="text-[13px] text-bone font-medium">Activer le copy auto — Pôle Invest</span>
            </div>
            <span className="btn-gold inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap shrink-0">
              Rejoindre <IconArrow className="h-3 w-3" />
            </span>
          </a>
        )}
      </div>

      {/* Bouton VIP Telegram pour membres actifs */}
      {hasAccess && effectiveTgLink && (
        <a
          href={effectiveTgLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 w-full flex items-center justify-between gap-3 rounded-xl border gold-line bg-gradient-to-r from-ink-700/60 to-ink-900 px-4 py-3 hover:border-gold/50 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-gold" fill="currentColor" aria-hidden>
              <path d="M9.04 15.47 8.7 20.3c.46 0 .66-.2.9-.43l2.16-2.07 4.48 3.28c.82.45 1.41.21 1.63-.76l2.95-13.81c.26-1.2-.44-1.67-1.24-1.38L2.5 9.66c-1.18.46-1.16 1.12-.2 1.42l4.71 1.47L17.9 6.6c.5-.33.96-.15.58.18z" />
            </svg>
            <div>
              <div className="text-[13.5px] text-bone font-medium">Rejoindre le groupe VIP Telegram</div>
              <div className="font-mono text-[10px] text-mist/50">Accès membre actif</div>
            </div>
          </div>
          <span className="btn-gold inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap shrink-0">
            Rejoindre <IconArrow className="h-3 w-3" />
          </span>
        </a>
      )}

      {/* Titre Portefeuille Invest */}
      <div className="mb-4 mt-2 flex items-center gap-2.5 flex-wrap">
        <h4 className="font-display text-[16px] text-bone">Portefeuille Invest</h4>
        <LiveTag />
      </div>

      <InvestPnlStats showButton={false} />

      <AssetTables />

      <TradeHistory />
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

/* ── Challenge Forex (bloc partagé) ── */
const CHALLENGE_CAPITAL = 5000;
const CHALLENGE_BASELINE_PCT = 29.20;
const CHALLENGE_TRACKING_SINCE = 1781395200;
const CHALLENGE_START_TS = 1780617600;

export function ChallengeBlock({ onGoTrading }) {
  const [forexTrades, setForexTrades] = useState([]);
  useEffect(() => {
    fetch("https://api.informateurcrypto.fr/api/julien/trades", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (d.ok && Array.isArray(d.trades)) setForexTrades(d.trades); })
      .catch(() => {});
  }, []);

  const newForexPnl = forexTrades
    .filter((t) => (t.type === "forex" || !t.type) && (t.created_at || 0) >= CHALLENGE_TRACKING_SINCE)
    .reduce((s, t) => s + (t.pnl_usd || 0), 0);
  const challengePct = CHALLENGE_BASELINE_PCT + (newForexPnl / CHALLENGE_CAPITAL * 100);
  const daysElapsed = Math.max(0, Math.floor((Date.now() / 1000 - CHALLENGE_START_TS) / 86400));

  return (
    <div className="mb-5 rounded-2xl overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-ink-900 via-ink-800/80 to-ink-900 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full blur-3xl opacity-20" style={{background:"radial-gradient(circle,#22c55e,transparent 70%)"}}/>
        <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full blur-3xl opacity-10" style={{background:"radial-gradient(circle,#eab308,transparent 70%)"}}/>
      </div>
      <div className="relative p-5">
        <div className="font-display text-[16px] text-bone mb-3">Pôle Trading</div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-[9.5px] uppercase tracking-widest2 text-emerald-400/80 mb-1">Challenge en cours</div>
            <div className="font-display text-[28px] leading-none text-emerald-400 font-black">{challengePct >= 0 ? "+" : ""}{challengePct.toFixed(2)} %</div>
            <div className="font-mono text-[11px] text-mist/70 mt-1">après {daysElapsed} jour{daysElapsed > 1 ? "s" : ""}</div>
          </div>
          <div className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-center shrink-0">
            <div className="font-mono text-[9px] uppercase tracking-widest2 text-gold/70">Objectif</div>
            <div className="font-display text-[22px] leading-none text-gold font-black">+100 %</div>
            <div className="font-mono text-[10px] text-gold/60 mt-0.5">en 30-45 jours</div>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-3.5 py-2.5">
          <span className="text-[13px] leading-none mt-0.5">⚠️</span>
          <p className="text-[11px] leading-relaxed text-amber-100/80">
            Un challenge est une stratégie à <span className="text-amber-100">haut risque</span> (effet de levier élevé, objectif agressif) :
            une perte importante, voire totale, du capital engagé est possible. À l'inverse, notre <span className="text-amber-100">portefeuille trading ci-dessous</span> suit une gestion du risque bien plus prudente.
          </p>
        </div>
        {onGoTrading ? (
          <button
            onClick={onGoTrading}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors px-5 py-2.5 text-[13px] font-semibold text-ink-900"
          >
            Voir le Pôle Trading <IconArrow className="h-3.5 w-3.5" />
          </button>
        ) : (
          <a
            href="https://t.me/clubdesinformateurs"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors px-5 py-2.5 text-[13px] font-semibold text-ink-900"
          >
            Activer le copy auto <IconArrow className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

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
    <div className="rounded-2xl border hairline bg-ink-800/40 p-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.20)" }}>
      <div className="font-mono text-[9.5px] uppercase tracking-widest2 text-mist/50">{label}</div>
      <div className={`mt-2 font-display text-[20px] ${cls || "text-bone"}`}>{value}</div>
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
    <div />
  );
}

/* ---------------- Wallet (frais de performance HWM) ---------------- */
function Billing({ b }) {
  const [copied, setCopied] = useState(false);
  const due = b.fee_due > 0;
  const grace = b.grace_days_left;
  return (
    <div className="rounded-2xl border gold-line bg-ink-800/40 p-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">Wallet · frais de performance</span>
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
        qui dépassent votre plus-haut historique (High-Water Mark) — vous ne payez jamais deux fois le
        même gain, et rien tant que vous n'avez pas de nouveau record. Tarif : <b>{b.rate_low_pct} %</b> si
        votre wallet Futures est sous {fmtUsd(b.threshold)}, sinon <b>{b.rate_high_pct} %</b>.
      </p>

      {due && (
        <div className="mt-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-300">
          ⚠️ Frais en attente de paiement : <b>{fmtUsd(b.fee_due)}</b>.{" "}
          {grace != null && grace > 0
            ? `Rechargez votre wallet sous ${grace} jour${grace > 1 ? "s" : ""} pour éviter la suspension de la copie.`
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
              Les dépôts sont <b>détectés et crédités automatiquement</b> sur votre solde prépayé,
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

/* Aperçu flou des 2 derniers vocaux + overlay unlock */
function ScopeCodeGate({ scope }) {
  const { refreshAccess } = useUnlock();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error | success
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) return;
    setStatus("loading");
    const r = await apiAccessCode(c);
    if (r.ok) {
      if (r.scope === scope) {
        setStatus("success");
        setMsg("Accès débloqué !");
        await refreshAccess();
      } else {
        setStatus("error");
        setMsg("Ce code ne correspond pas à ce type d'accès.");
      }
    } else {
      setStatus("error");
      const err = r.error || "";
      setMsg(
        err === "already_used" ? "Ce code a déjà été utilisé."
        : err === "expired" ? "Ce code a expiré."
        : err === "max_uses" ? "Ce code a atteint son nombre d'utilisations maximum."
        : "Code invalide ou introuvable."
      );
    }
  }

  const label = scope === "monitoring" ? "Monitoring temps réel"
    : scope === "invest" ? "Accès Portefeuille INVEST"
    : "Actions US (X-Stocks)";
  const desc = scope === "monitoring"
    ? "Entrez un code d'accès pour débloquer les analyses vocales en temps réel pendant 7 jours."
    : scope === "invest"
    ? "Entrez un code d'activation pour accéder à la page Portefeuille INVEST pendant 7 jours."
    : "Entrez un code d'accès pour débloquer le portefeuille Actions US pendant 7 jours.";

  return (
    <div className="rounded-2xl border gold-line bg-gold/[0.03] p-5">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="grid place-items-center h-7 w-7 rounded-full border gold-line text-gold text-sm">🔑</span>
        <span className="text-[13.5px] text-bone font-medium">{label}</span>
      </div>
      <p className="text-[12px] text-mist/80 mb-4 leading-relaxed">{desc}</p>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus("idle"); setMsg(""); }}
          placeholder="Code d'accès"
          disabled={status === "loading" || status === "success"}
          autoCapitalize="characters"
          className="flex-1 min-w-0 rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-2.5 text-bone placeholder:text-mist/40 font-mono text-[13px] outline-none disabled:opacity-60 uppercase tracking-wider"
        />
        <button type="submit"
          disabled={status === "loading" || status === "success" || !code.trim()}
          className="btn-gold rounded-xl px-4 py-2.5 text-[13px] font-semibold disabled:opacity-60 min-w-[80px]">
          {status === "loading" ? "…" : "Valider"}
        </button>
      </form>
      {status === "error" && <p className="mt-2 text-[12px] text-rose-400/90">{msg}</p>}
      {status === "success" && <p className="mt-2 text-[12px] text-emerald-400/90">✓ {msg}</p>}
    </div>
  );
}

function LockedAudioPreview() {
  const { locked, monitoringAccess, openUnlock } = useUnlock();
  const [audios, setAudios] = useState(null);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    // Retry tant qu'on n'a pas de token (race condition mini-app : token stocké juste avant le rendu)
    const load = async () => {
      const tok = getToken();
      if (!tok) {
        // Pas encore de token — réessaye dans 800ms (max 5 fois)
        if (retries < 5) setTimeout(() => setRetries((n) => n + 1), 800);
        return;
      }
      const r = await poleTradingAudios();
      if (r.ok) setAudios(r.audios);
      else if (r.audios) setAudios(r.audios); // [] si vide
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retries]);

  const preview = audios ? audios.slice(0, 2) : [];

  function relTime(iso) {
    if (!iso) return "";
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return "à l'instant";
    if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
    if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
    const d = Math.floor(s / 86400); return d === 1 ? "hier" : `il y a ${d} j`;
  }
  function dateLabel(iso) {
    if (!iso) return "";
    try { return new Date(iso).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); } catch { return ""; }
  }
  function dur(sec) {
    if (!sec && sec !== 0) return ""; const m = Math.floor(sec / 60), s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  if (monitoringAccess) {
    return <AudioFeed hideHeader />;
  }
  if (!locked) {
    return <ScopeCodeGate scope="monitoring" />;
  }

  // Verrouillé : 2 derniers vocaux écoutables librement, les suivants floutés + overlay
  const latestTwo = audios ? audios.slice(0, 2) : [];
  const rest = audios ? audios.slice(2, 4) : [];

  function AudioCardPreview({ a, i }) {
    return (
      <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid place-items-center h-9 w-9 shrink-0 rounded-full border gold-line text-gold">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M3 10v4M7 7v10M11 4v16M15 8v8M19 11v2" />
              </svg>
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-[14.5px] text-bone">Point audio</span>
                {a.duration != null && <span className="font-mono text-[10.5px] text-mist/60">{dur(a.duration)}</span>}
              </div>
              <div className="font-mono text-[10.5px] text-mist/70">{dateLabel(a.date)} · {relTime(a.date)}</div>
            </div>
          </div>
        </div>
        {a.caption && <p className="mt-3 text-[13.5px] leading-relaxed text-slate-200 line-clamp-2">{a.caption}</p>}
        <div className="mt-3 h-10 w-full rounded-lg bg-white/10" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 2 derniers vocaux — pleinement accessibles */}
      {audios === null ? (
        <div className="rounded-2xl border hairline bg-ink-800/50 p-5 text-[13px] text-mist/60">Chargement…</div>
      ) : latestTwo.length === 0 ? (
        <div className="rounded-2xl border hairline bg-ink-800/50 p-5 text-[13px] text-mist/60">Aucun audio récent.</div>
      ) : latestTwo.map((a, idx) => (
        <div key={a.id} className="rounded-2xl border hairline bg-ink-800/50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="grid place-items-center h-9 w-9 shrink-0 rounded-full border gold-line text-gold">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M3 10v4M7 7v10M11 4v16M15 8v8M19 11v2" />
                </svg>
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-[14.5px] text-bone">Point audio</span>
                  {idx === 0 && <span className="font-mono text-[9px] uppercase tracking-widest2 text-gold border gold-line rounded-full px-1.5 py-0.5">Dernier</span>}
                  {a.duration != null && <span className="font-mono text-[10.5px] text-mist/60">{dur(a.duration)}</span>}
                </div>
                <div className="font-mono text-[10.5px] text-mist/70">{dateLabel(a.date)} · <span className={idx === 0 ? "text-gold/90" : ""}>{relTime(a.date)}</span></div>
              </div>
            </div>
          </div>
          {a.caption && <p className="mt-3 text-[13.5px] leading-relaxed text-slate-200 whitespace-pre-wrap break-words">{a.caption}</p>}
          <audio controls preload="none" className="mt-3 w-full" style={{ height: 40 }}>
            <source src={audioStreamUrl(a.id)} type={a.mime || "audio/ogg"} />
          </audio>
        </div>
      ))}

      {/* Audios suivants — floutés + overlay unlock */}
      {rest.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden">
          <div className="pointer-events-none select-none blur-[3px] opacity-50 space-y-3" aria-hidden>
            {rest.map((a) => <AudioCardPreview key={a.id} a={a} />)}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-900/55 backdrop-blur-[1px]">
            <button onClick={openUnlock} className="btn-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13.5px] font-semibold shadow-lg">
              🔓 Déverrouiller le monitoring
            </button>
            <p className="text-[11px] text-mist/60">Accès à tous les audios en temps réel</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Monitoring audio (onglet dédié) ---------------- */
function LatestVideo() {
  const [video, setVideo] = useState(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    fetch("/api/videos", { cache: "no-store" })
      .then((r) => r.json()).catch(() => ({ videos: [] }))
      .then((d) => { const v = (d.videos || [])[0]; if (v) setVideo(v); });
  }, []);

  if (!video) return (
    <div className="rounded-2xl border hairline bg-ink-800/50 p-6 text-[13px] text-mist/60">
      {video === null ? "Chargement…" : "Aucune vidéo disponible."}
    </div>
  );

  const date = video.published ? new Date(video.published).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";

  return (
    <div className="rounded-2xl border hairline bg-ink-800/50 overflow-hidden">
      <div className="relative aspect-video bg-ink-900">
        {active ? (
          <iframe className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        ) : (
          <button onClick={() => setActive(true)} className="group absolute inset-0">
            <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt={video.title}
                 className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid place-items-center h-14 w-14 rounded-full bg-black/60 border border-white/20 text-white group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="h-6 w-6 ml-0.5" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="p-4">
        <p className="text-[14px] leading-snug text-bone font-medium">{video.title}</p>
        {date && <p className="mt-1 font-mono text-[11px] text-mist/60">{date}</p>}
      </div>
    </div>
  );
}

/* ── helpers fil d'actu ── */
function relTime(iso) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  const d = Math.floor(s / 86400);
  return d === 1 ? "hier" : `il y a ${d} j`;
}
function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      weekday: "short", day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
    });
  } catch { return ""; }
}
function dur(sec) {
  if (sec == null) return "";
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

const REACT_STYLE = {
  like:    { on: "bg-gold/15 border-gold/40 text-gold" },
  bullish: { on: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" },
  bearish: { on: "bg-rose-500/15 border-rose-500/40 text-rose-400" },
};
const REACT_ICONS = {
  like: (a) => <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${a ? "scale-110" : ""} transition-transform`} fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
  bullish: (a) => <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${a ? "scale-110" : ""} transition-transform`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  bearish: (a) => <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${a ? "scale-110" : ""} transition-transform`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>,
};

function FeedReactions({ contentType, contentId, initial }) {
  const EMPTY = { like: { count: 0, me: false }, bullish: { count: 0, me: false }, bearish: { count: 0, me: false } };
  const [data, setData] = useState({ ...EMPTY, ...(initial || {}) });
  const [busy, setBusy] = useState(false);
  const authed = typeof window !== "undefined" && !!getToken();
  async function toggle(e, rk) {
    e.stopPropagation();
    if (!authed || busy) return;
    setBusy(true);
    const r = await apiToggleReaction(contentType, contentId, rk);
    if (r?.ok && r.reactions) setData(r.reactions);
    setBusy(false);
  }
  return (
    <div className="flex items-center gap-1.5 mt-3">
      {["like","bullish","bearish"].map((rk) => {
        const d = data[rk] || EMPTY[rk];
        return (
          <button key={rk} onClick={(e) => toggle(e, rk)} disabled={!authed || busy}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-mono border transition-all ${
              d.me ? REACT_STYLE[rk].on : "border-white/10 text-mist/50 hover:border-white/20 hover:text-mist"
            } disabled:opacity-40 disabled:cursor-default`}>
            {REACT_ICONS[rk](d.me)}
            <span>{d.count > 0 ? d.count : ""}</span>
          </button>
        );
      })}
    </div>
  );
}

function AudioItem({ item, reactions, first }) {
  return (
    <article className={`rounded-2xl border bg-ink-800/50 p-4 ${first ? "border-gold/30" : "border-white/[0.07]"}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <img src="/julien.jpg" alt="" className="h-8 w-8 rounded-full border gold-line object-cover object-top shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-[13.5px] text-bone">Point audio</span>
              {first && <span className="font-mono text-[9px] uppercase tracking-widest text-gold border gold-line rounded-full px-1.5 py-0.5">Dernier</span>}
              {item.duration != null && <span className="font-mono text-[10px] text-mist/60">{dur(item.duration)}</span>}
            </div>
            <div className="font-mono text-[10px] text-mist/60">{fmtDate(item.date)} · <span className={first ? "text-emerald-400" : ""}>{relTime(item.date)}</span></div>
          </div>
        </div>
        <span className="text-[18px]">🎙️</span>
      </div>
      {item.caption && <p className="text-[13px] leading-relaxed text-slate-200 whitespace-pre-wrap mb-2">{item.caption}</p>}
      <audio controls preload="none" className="w-full" style={{ height: 36 }}>
        <source src={audioStreamUrl(item.msg_id)} type={item.mime || "audio/ogg"} />
      </audio>
      <FeedReactions contentType="audio" contentId={String(item.msg_id)} initial={reactions} />
    </article>
  );
}

function PostItem({ item, reactions, first }) {
  return (
    <article className="rounded-2xl border border-white/[0.07] bg-ink-800/50 p-4">
      <div className="flex items-center gap-2.5 mb-2">
        <img src="/julien.jpg" alt="" className="h-8 w-8 rounded-full border gold-line object-cover object-top shrink-0" />
        <div>
          <span className="font-display text-[13.5px] text-bone">Julien</span>
          <div className="font-mono text-[10px] text-mist/60">{fmtDate(item.date)} · <span className={first ? "text-emerald-400" : ""}>{relTime(item.date)}</span></div>
        </div>
        <span className="ml-auto text-[18px]">{item.kind === "photo" ? "📷" : "💬"}</span>
      </div>
      {item.text && <p className="text-[13px] leading-relaxed text-slate-200 whitespace-pre-wrap mb-2">{item.text}</p>}
      {item.has_photo && (
        <img src={photoUrl(item.msg_id)} alt="" className="w-full rounded-xl border border-white/[0.07] mb-2"
          onError={(e) => { e.currentTarget.style.display = "none"; }} />
      )}
      <FeedReactions contentType="post" contentId={String(item.msg_id)} initial={reactions} />
    </article>
  );
}

export function MonitoringAudio() {
  const [items, setItems] = useState(null);
  const [likes, setLikes] = useState({});
  const [err, setErr] = useState(null);
  const authed = typeof window !== "undefined" && !!getToken();
  const { openUnlock } = useUnlock();

  const load = useEffect.bind ? undefined : undefined; // placeholder
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    async function fetch_() {
      const r = await poleTradingFeed();
      if (cancelled) return;
      if (r.ok) {
        setItems(r.items);
        setErr(null);
        const audioIds = r.items.filter(i => i.kind === "audio").map(i => String(i.msg_id));
        const postIds  = r.items.filter(i => i.kind !== "audio").map(i => String(i.msg_id));
        const map = {};
        if (audioIds.length) {
          const ld = await apiGetLikes("audio", audioIds);
          if (ld.ok) Object.assign(map, ld.likes || {});
        }
        if (postIds.length) {
          const ld = await apiGetLikes("post", postIds);
          if (ld.ok) Object.assign(map, ld.likes || {});
        }
        if (!cancelled) setLikes(map);
      } else {
        setErr(r.error);
      }
    }
    fetch_();
    const id = setInterval(fetch_, 90000);
    return () => { cancelled = true; clearInterval(id); };
  }, [authed]);

  return (
    <div>
      <TickerBanner flush />
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <img src="/julien.jpg" alt="Julien" className="h-9 w-9 rounded-full object-cover shrink-0 border gold-line" />
          <div>
            <h3 className="font-display text-[18px] text-bone">Monitoring — Fil en direct</h3>
            <p className="text-[11.5px] text-mist/70 mt-0.5">Audios, analyses et posts de Julien</p>
          </div>
        </div>
        <LiveTag />
      </div>

      {/* Avertissement : périmètre du monitoring */}
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-3.5 py-2.5">
        <span className="text-[13px] leading-none mt-0.5">ℹ️</span>
        <p className="text-[11.5px] leading-relaxed text-amber-100/80">
          Ce monitoring regroupe les <span className="text-amber-100">audios, analyses et posts</span> de Julien.
          Il <b>n'inclut pas</b> ses <span className="text-amber-100">signaux, calls et positions</span> — ceux-ci sont réservés au <span className="text-amber-100">groupe privé / copy auto</span>.
        </p>
      </div>


      {!authed ? (
        <div className="rounded-2xl border hairline bg-ink-800/50 p-6 text-[13.5px] text-mist">
          Connectez-vous pour accéder au fil en direct.
        </div>
      ) : items === null ? (
        <div className="flex items-center gap-3 py-12 justify-center text-mist/60">
          <svg className="h-5 w-5 animate-spin text-gold" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
          </svg>
          <span className="text-[13px]">Chargement du fil…</span>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border hairline bg-ink-800/50 p-6 text-[13.5px] text-mist/60">
          {err ? "Fil momentanément indisponible." : "Aucun contenu pour le moment."}
        </div>
      ) : (() => {
        // Dernier audio mis en avant en haut ; on l'exclut ensuite de la liste
        // pour ne pas le dupliquer s'il est aussi le post le plus récent.
        const latestAudio = items.find((i) => i.kind === "audio");
        const rest = items.filter((i) => i !== latestAudio);
        const firstPostId = rest.find((i) => i.kind !== "audio")?.id;
        return (
          <>
            {latestAudio && (
              <div className="mb-6">
                <div className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80 mb-2">Dernier audio</div>
                <AudioItem item={latestAudio} reactions={likes[String(latestAudio.msg_id)]} first />
              </div>
            )}
            {rest.length > 0 && (
              <>
                <button
                  onClick={openUnlock}
                  className="w-full mb-3 flex items-center justify-center gap-2 rounded-xl btn-gold px-5 py-3 text-[13.5px] font-semibold shadow-lg"
                >
                  🔓 Obtenir l'accès <IconArrow className="h-3.5 w-3.5" />
                </button>
                <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60 mb-2">Derniers posts</div>
                <div className="space-y-3">
                  {rest.map((item) => (
                    <div key={item.id} className="blur-[3px] select-none pointer-events-none opacity-60">
                      {item.kind === "audio"
                        ? <AudioItem item={item} reactions={likes[String(item.msg_id)]} />
                        : <PostItem  item={item} reactions={likes[String(item.msg_id)]} first={item.id === firstPostId} />}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        );
      })()}

      <p className="mt-5 text-[11px] text-mist/40 leading-relaxed">
        Contenu du canal Pôle Trading. À titre éducatif — ne constitue pas un conseil en investissement.
      </p>
    </div>
  );
}

/* ---------------- Futures : KPIs copy + historique des trades ---------------- */
export const JULIEN_TRADES = [{"asset":"HYPEUSDT","type":"LONG","pnlUsd":592.3,"pnlPct":"+94.8%","timestamp":1780195228728},{"asset":"HYPEUSDT","type":"LONG","pnlUsd":242.0,"pnlPct":"+38.7%","timestamp":1780067899526},{"asset":"HYPEUSDT","type":"LONG","pnlUsd":219.4,"pnlPct":"+17.6%","timestamp":1780064282553},{"asset":"HYPEUSDT","type":"LONG","pnlUsd":124.9,"pnlPct":"+10.0%","timestamp":1779895625818},{"asset":"HYPEUSDT","type":"LONG","pnlUsd":-245.3,"pnlPct":"-19.6%","timestamp":1779893241766},{"asset":"HYPEUSDT","type":"LONG","pnlUsd":61.8,"pnlPct":"+4.9%","timestamp":1779879256419},{"asset":"HYPEUSDT","type":"LONG","pnlUsd":-414.0,"pnlPct":"-16.6%","timestamp":1779875700000},{"asset":"HYPEUSDT","type":"LONG","pnlUsd":-106.7,"pnlPct":"-4.3%","timestamp":1779825169905},{"asset":"TONUSDT","type":"LONG","pnlUsd":-1596.6,"pnlPct":"-63.9%","timestamp":1779825153357},{"asset":"HYPEUSDT","type":"LONG","pnlUsd":-45.5,"pnlPct":"-3.6%","timestamp":1779825129345},{"asset":"HYPEUSDT","type":"LONG","pnlUsd":113.8,"pnlPct":"+9.1%","timestamp":1779824107027},{"asset":"TAOUSDT","type":"LONG","pnlUsd":270.0,"pnlPct":"+21.6%","timestamp":1779824096343},{"asset":"ONDOUSDT","type":"LONG","pnlUsd":-562.3,"pnlPct":"-22.5%","timestamp":1779473633850},{"asset":"TAOUSDT","type":"LONG","pnlUsd":-239.5,"pnlPct":"-9.6%","timestamp":1779459771518},{"asset":"TAOUSDT","type":"LONG","pnlUsd":1.7,"pnlPct":"+0.1%","timestamp":1779458670223},{"asset":"TAOUSDT","type":"LONG","pnlUsd":-289.9,"pnlPct":"-11.6%","timestamp":1779456172336},{"asset":"XAGUSDT","type":"LONG","pnlUsd":-145.3,"pnlPct":"-5.8%","timestamp":1779284560767},{"asset":"ETH/USDT","type":"SHORT","pnlUsd":10.6,"pnlPct":"+0.8%","timestamp":1779220422907},{"asset":"ETHUSDT","type":"SHORT","pnlUsd":177.0,"pnlPct":"+14.2%","timestamp":1779113991075},{"asset":"ETHUSDT","type":"SHORT","pnlUsd":54.5,"pnlPct":"+4.4%","timestamp":1779111197174},{"asset":"BTCUSDT","type":"LONG","pnlUsd":83.0,"pnlPct":"+6.6%","timestamp":1778886347191},{"asset":"TAOUSDT","type":"LONG","pnlUsd":759.7,"pnlPct":"+121.5%","timestamp":1778852086284},{"asset":"SUIUSDT","type":"LONG","pnlUsd":401.0,"pnlPct":"+32.1%","timestamp":1778529069981},{"asset":"SUIUSDT","type":"LONG","pnlUsd":-142.9,"pnlPct":"-5.7%","timestamp":1778507461935},{"asset":"SOLUSDT","type":"LONG","pnlUsd":-290.5,"pnlPct":"-11.6%","timestamp":1778161818726},{"asset":"TONUSDT","type":"LONG","pnlUsd":-237.7,"pnlPct":"-9.5%","timestamp":1778153768953},{"asset":"TONUSDT","type":"LONG","pnlUsd":878.1,"pnlPct":"+70.2%","timestamp":1778093073606},{"asset":"TONUSDT","type":"LONG","pnlUsd":322.7,"pnlPct":"+25.8%","timestamp":1778082362845},{"asset":"XAUUSDT","type":"LONG","pnlUsd":190.3,"pnlPct":"+15.2%","timestamp":1777987191522},{"asset":"XAUUSDT","type":"LONG","pnlUsd":24.3,"pnlPct":"+1.9%","timestamp":1777958002099},{"asset":"TAOUSDT","type":"LONG","pnlUsd":656.9,"pnlPct":"+105.1%","timestamp":1777749602748},{"asset":"BTC/USDT","type":"LONG","pnlUsd":-124.3,"pnlPct":"-9.9%","timestamp":1777669305357},{"asset":"BTC/USDT","type":"LONG","pnlUsd":90.8,"pnlPct":"+7.3%","timestamp":1777650607163},{"asset":"BTC/USDT","type":"LONG","pnlUsd":123.0,"pnlPct":"+4.9%","timestamp":1777488273946},{"asset":"BTC/USDT","type":"LONG","pnlUsd":-150.4,"pnlPct":"-6.0%","timestamp":1777477659383},{"asset":"SOLUSDT","type":"SHORT","pnlUsd":-97.9,"pnlPct":"-7.8%","timestamp":1777442043758},{"asset":"TAOUSDT","type":"LONG","pnlUsd":646.9,"pnlPct":"+51.8%","timestamp":1777441734192},{"asset":"SOLUSDT","type":"SHORT","pnlUsd":55.6,"pnlPct":"+4.4%","timestamp":1777384817496},{"asset":"BTCUSDT","type":"LONG","pnlUsd":-86.1,"pnlPct":"-6.9%","timestamp":1776697499672},{"asset":"BTC/USDT","type":"LONG","pnlUsd":81.8,"pnlPct":"+6.5%","timestamp":1776695032630},{"asset":"BTC/USDT","type":"LONG","pnlUsd":-124.0,"pnlPct":"-19.8%","timestamp":1776688882557},{"asset":"BTC/USDT","type":"LONG","pnlUsd":209.6,"pnlPct":"+33.5%","timestamp":1776436746186},{"asset":"BTC/USDT","type":"LONG","pnlUsd":157.8,"pnlPct":"+12.6%","timestamp":1776431838942},{"asset":"SOLUSDT","type":"LONG","pnlUsd":-59.4,"pnlPct":"-4.8%","timestamp":1776422992217},{"asset":"SOLUSDT","type":"LONG","pnlUsd":132.8,"pnlPct":"+10.6%","timestamp":1776416091973},{"asset":"SOLUSDT","type":"LONG","pnlUsd":-146.4,"pnlPct":"-11.7%","timestamp":1776347738580},{"asset":"SOLUSDT","type":"LONG","pnlUsd":147.5,"pnlPct":"+11.8%","timestamp":1776345776246},{"asset":"TAOUSDT","type":"LONG","pnlUsd":238.1,"pnlPct":"+19.0%","timestamp":1776265440000},{"asset":"TAOUSDT","type":"LONG","pnlUsd":238.1,"pnlPct":"+19.0%","timestamp":1776265320000},{"asset":"TAOUSDT","type":"LONG","pnlUsd":-380.8,"pnlPct":"-15.2%","timestamp":1776183042364},{"asset":"BTC/USDT","type":"LONG","pnlUsd":-71.6,"pnlPct":"-11.4%","timestamp":1776111927812},{"asset":"BTCUSDT","type":"LONG","pnlUsd":117.7,"pnlPct":"+18.8%","timestamp":1775831152127},{"asset":"BTC/USDT","type":"LONG","pnlUsd":122.1,"pnlPct":"+9.8%","timestamp":1775829883313},{"asset":"BTC/USDT","type":"LONG","pnlUsd":-27.8,"pnlPct":"-4.4%","timestamp":1775726954830},{"asset":"BTC/USDT","type":"LONG","pnlUsd":127.3,"pnlPct":"+20.4%","timestamp":1775670689113},{"asset":"BTC/USDT","type":"LONG","pnlUsd":73.6,"pnlPct":"+5.9%","timestamp":1775661651012},{"asset":"BTC/USDT","type":"LONG","pnlUsd":277.7,"pnlPct":"+22.2%","timestamp":1775583608043},{"asset":"BTCUSDT","type":"LONG","pnlUsd":147.7,"pnlPct":"+11,8%","timestamp":1775578560000},{"asset":"UNIUSDT","type":"LONG","pnlUsd":206.2,"pnlPct":"+16.5%","timestamp":1775210760000},{"asset":"XRPUSDT","type":"SHORT","pnlUsd":108.2,"pnlPct":"+8.7%","timestamp":1775171897171},{"asset":"XRPUSDT","type":"SHORT","pnlUsd":277.7,"pnlPct":"+22.2%","timestamp":1775171892428},{"asset":"BTC/USDT","type":"LONG","pnlUsd":516.0,"pnlPct":"+41.3%","timestamp":1774977427701},{"asset":"BTC/USDT","type":"LONG","pnlUsd":137.7,"pnlPct":"+11.0%","timestamp":1774970123933},{"asset":"BTCUSDT","type":"LONG","pnlUsd":-256.6,"pnlPct":"-10.3%","timestamp":1774969315234},{"asset":"BTCUSDT","type":"LONG","pnlUsd":-140.4,"pnlPct":"-5.6%","timestamp":1774879260000},{"asset":"BTCUSDT","type":"LONG","pnlUsd":295.9,"pnlPct":"+23.7%","timestamp":1774711140000},{"asset":"BCHUSDT","type":"LONG","pnlUsd":8.8,"pnlPct":"+0.4%","timestamp":1774696500000},{"asset":"BTCUSDT","type":"LONG","pnlUsd":53.9,"pnlPct":"+4.3%","timestamp":1774641120000}];

export function Monitoring({ onGoCopy, onGoMonitoring }) {
  const { locked } = useUnlock();
  const [user, setUser] = useState(null);
  const [moonxTrades, setMoonxTrades] = useState(null);

  useEffect(() => { setUser(getUser()); }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/julien/trades`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (d.ok && Array.isArray(d.trades)) setMoonxTrades(d.trades); })
      .catch(() => { setMoonxTrades([]); });
  }, []);

  const trades = moonxTrades || [];
  const futuresTrades = trades.filter((t) => t.type === "futures");
  const dUsdJ = (x) => (x == null ? "—" : (x >= 0 ? "+" : "-") + "$" + Math.abs(x).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

  const jTotalPnl = futuresTrades.reduce((s, t) => s + (t.pnl_usd || 0), 0);
  const jWins = futuresTrades.filter((t) => (t.pnl_usd || 0) > 0).length;
  const jWinRate = futuresTrades.length > 0 ? Math.round((jWins / futuresTrades.length) * 100) : null;

  const J_CAPITAL = 50000;
  const jTotalPct = futuresTrades.length > 0 ? (jTotalPnl / J_CAPITAL) * 100 : null;

  const jDrawdown = (() => {
    if (futuresTrades.length === 0) return null;
    const sorted = [...futuresTrades].sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
    let equity = 0, peak = 0, maxDd = 0;
    for (const t of sorted) {
      equity += t.pnl_usd || 0;
      if (equity > peak) peak = equity;
      const dd = ((peak - equity) / J_CAPITAL) * 100;
      if (dd > maxDd) maxDd = dd;
    }
    return maxDd;
  })();

  const allTrades = trades.map((t) => ({
    source: t.type || "forex",
    asset: t.asset,
    direction: t.direction,
    pnlUsd: t.pnl_usd,
    pnlPct: (() => {
      if (t.pnl_pct != null && t.pnl_pct !== "") return String(t.pnl_pct);
      if (t.entry_price && t.exit_price) {
        const isLong = /long|buy/i.test(t.direction || "");
        const pct = isLong
          ? (t.exit_price - t.entry_price) / t.entry_price * 100
          : (t.entry_price - t.exit_price) / t.entry_price * 100;
        return (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%";
      }
      return "—";
    })(),
    ts: (t.created_at || 0) * 1000,
  })).sort((a, b) => b.ts - a.ts);

  const FuturesCTAs = () => (
    <div className="mb-5">
      <a
        href="https://t.me/clubdesinformateurs"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center gap-2 justify-between rounded-xl border gold-line bg-gradient-to-r from-ink-700/60 to-ink-900 px-4 py-2.5 hover:border-gold/50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gold" fill="currentColor" aria-hidden>
            <path d="M9.04 15.47 8.7 20.3c.46 0 .66-.2.9-.43l2.16-2.07 4.48 3.28c.82.45 1.41.21 1.63-.76l2.95-13.81c.26-1.2-.44-1.67-1.24-1.38L2.5 9.66c-1.18.46-1.16 1.12-.2 1.42l4.71 1.47L17.9 6.6c.5-.33.96-.15.58.18z" />
          </svg>
          <span className="text-[13px] text-bone font-medium">Rejoindre les copy auto / groupe VIP du Pôle Trading</span>
        </div>
        <span className="btn-gold inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap shrink-0">
          Rejoindre <IconArrow className="h-3 w-3" />
        </span>
      </a>
    </div>
  );

  if (!user) {
    return (
      <div>
          <TickerBanner />
        <div className="flex items-center gap-3 mb-4 mt-4">
          <img src="/julien.jpg" alt="Julien" className="h-9 w-9 rounded-full object-cover shrink-0" />
          <h3 className="font-display text-[18px] text-bone">PÔLE TRADING</h3>
        </div>
        <FuturesCTAs />
        <div className="rounded-2xl border gold-line bg-ink-800/40 p-6 text-[14px] text-mist text-center">
          Connectez-vous pour suivre l'activité du trader en direct.
        </div>
      </div>
    );
  }

  return (
    <div>
      <TickerBanner />
      {/* Titre */}
      <div className="flex items-center gap-3 mb-4 mt-4 flex-wrap">
        <img src="/julien.jpg" alt="Julien" className="h-9 w-9 rounded-full object-cover shrink-0" />
        <h3 className="font-display text-[18px] text-bone">PÔLE TRADING</h3>
        <LiveTag />
      </div>

      <LastTradeTeaser trades={trades} />

      <FuturesCTAs />

      <ChallengeBlock />

      {/* Titre Portefeuille Trading */}
      <div className="mb-4 mt-1 flex items-center gap-2.5 flex-wrap">
        <h4 className="font-display text-[16px] text-bone">Portefeuille Trading</h4>
        <LiveTag />
      </div>

      {/* KPIs performance */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {
            label: "Gains réalisés",
            value: moonxTrades === null ? "…" : dUsdJ(jTotalPnl),
            sub: moonxTrades === null ? null : `${futuresTrades.length} trades`,
            cls: jTotalPnl >= 0 ? "text-emerald-400" : "text-rose-400",
          },
          {
            label: "Total %",
            value: moonxTrades === null || jTotalPct === null ? "…" : `${jTotalPct >= 0 ? "+" : ""}${jTotalPct.toFixed(2)} %`,
            sub: "capital 50 000 $",
            cls: jTotalPct !== null && jTotalPct >= 0 ? "text-emerald-400" : "text-rose-400",
          },
          {
            label: "Investisseurs en auto",
            value: "78",
            sub: "+200 k€ · depuis 64 j",
            cls: "text-emerald-400",
          },
          {
            label: "Drawdown max",
            value: "-1.4 %",
            sub: null,
            cls: "text-rose-400",
          },
        ].map(({ label, value, sub, cls }) => (
          <div key={label} className="rounded-2xl border hairline bg-ink-800/40 p-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.20)" }}>
            <div className="font-mono text-[9.5px] uppercase tracking-widest2 text-mist/50 mb-1.5">{label}</div>
            <div className={`font-display text-[20px] leading-none ${cls}`}>{value}</div>
            {sub && <div className="mt-1 font-mono text-[10px] text-mist/45">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Bloc promo — Monitoring quotidien sur groupe privé */}
      <button
        onClick={onGoMonitoring}
        className="group mb-5 w-full text-left block rounded-2xl overflow-hidden border gold-line bg-gradient-to-br from-ink-900 via-ink-800/70 to-ink-900 relative hover:border-gold/50 transition-colors"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-8 -left-8 h-40 w-40 rounded-full blur-3xl opacity-15" style={{ background: "radial-gradient(circle,#C9A24B,transparent 70%)" }} />
        </div>
        <div className="relative p-5">
          <div className="flex items-center gap-3 mb-3">
            <img src="/julien.jpg" alt="Julien" className="h-10 w-10 rounded-full object-cover shrink-0 border gold-line" />
            <div className="min-w-0">
              <div className="font-mono text-[9.5px] uppercase tracking-widest2 text-gold/80 mb-0.5">Groupe privé · tous les jours</div>
              <h4 className="font-display text-[16px] text-bone leading-tight">Le Monitoring quotidien de Julien</h4>
            </div>
          </div>
          <p className="text-[12.5px] leading-relaxed text-mist/80">
            Chaque jour, Julien anime un <span className="text-bone">monitoring en direct</span> sur un groupe privé :
            analyses <span className="text-bone">audio</span>, <span className="text-bone">zones à surveiller</span>,
            <span className="text-bone"> scalping live</span> et <span className="text-bone">trading intraday</span>.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { icon: "🎙️", label: "Analyses audio quotidiennes" },
              { icon: "🎯", label: "Zones à surveiller" },
              { icon: "⚡", label: "Scalping en live" },
              { icon: "📊", label: "Trading intraday" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-[11.5px] text-mist/70">
                <span className="text-[13px]">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <span className="btn-gold mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold">
            Accès monitoring <IconArrow className="h-3.5 w-3.5" />
          </span>
        </div>
      </button>

      {/* Historique des trades */}
      <div className="rounded-2xl border hairline bg-ink-800/40 p-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.25)" }}>
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60">
            Historique MoonX — Forex + Futures
          </span>
          <span className="font-mono text-[10px] text-mist/40">
            {moonxTrades === null ? "…" : `${allTrades.length} op.`}
          </span>
        </div>
        {allTrades.length === 0 ? (
          <div className="mt-3 text-[13px] text-mist/60">Aucune opération pour l'instant.</div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-[13px] font-mono">
              <thead>
                <tr className="text-left text-mist/60 text-[10px] uppercase tracking-widest2 border-b hairline">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Marché</th>
                  <th className="py-2 pr-4">Sens</th>
                  <th className="py-2 pr-4 text-right">PnL ($)</th>
                  <th className="py-2 pr-4 text-right">PnL (%)</th>
                  <th className="py-2 text-right">Source</th>
                </tr>
              </thead>
              <tbody>
                {allTrades.map((t, i) => {
                  const isLong = (t.direction || "").toUpperCase() === "LONG";
                  const win = (t.pnlUsd || 0) >= 0;
                  return (
                    <tr key={i} className="border-b hairline last:border-0">
                      <td className="py-2 pr-4 text-mist text-[12px]">
                        {t.ts ? new Date(t.ts).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="py-2 pr-4 text-bone">{t.asset || "—"}</td>
                      <td className={`py-2 pr-4 ${isLong ? "text-emerald-400" : "text-rose-400"}`}>
                        {isLong ? "Long" : "Short"}
                      </td>
                      <td className={`py-2 pr-4 text-right ${win ? "text-emerald-400" : "text-rose-400"}`}>
                        {(t.pnlUsd >= 0 ? "+" : "") + Number(t.pnlUsd).toFixed(2)}
                      </td>
                      <td className={`py-2 pr-4 text-right ${win ? "text-emerald-400" : "text-rose-400"}`}>
                        {t.pnlPct || "—"}
                      </td>
                      <td className="py-2 text-right">
                        {t.source === "forex" ? (
                          <span className="inline-flex items-center rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[9px] font-semibold text-blue-400 uppercase tracking-wide">Forex</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[9px] font-semibold text-indigo-400 uppercase tracking-wide">Futures</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

function KrakenApiGuide({ type, onClose }) {
  const isSpot = type === "spot";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-[#1a1a2e] rounded-2xl w-full max-w-lg shadow-2xl border border-white/10 overflow-hidden"
           onClick={(e) => e.stopPropagation()}>
        {/* Header Kraken-style */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10">
          <h3 className="text-[15px] font-semibold text-white">
            {isSpot ? "Ajouter une clé API" : "Ajouter une clé API Futures"}
            <span className="ml-2 text-[11px] font-normal text-red-400">*</span>
          </h3>
          <button onClick={onClose} className="text-white/50 hover:text-white text-[20px] leading-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {isSpot ? (
            <>
              {/* Nom */}
              <div>
                <p className="text-[11px] text-white/50 mb-1">Nom</p>
                <div className="bg-[#2a2a3e] rounded px-3 py-2 text-[13px] text-white/80">Mon Compte Copy</div>
              </div>
              <p className="text-[12px] text-white/50">Sélectionnez au moins une autorisation.</p>
              {/* Grid 3 colonnes */}
              <div className="grid grid-cols-3 gap-4 text-[12px]">
                {/* Fonds */}
                <div>
                  <p className="font-semibold text-white mb-2">Fonds</p>
                  <label className="flex items-center gap-2 mb-1">
                    <span className="h-4 w-4 rounded bg-[#7b5ea7] flex items-center justify-center flex-shrink-0">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </span>
                    <span className="text-white/80">Requête</span>
                  </label>
                  <label className="flex items-center gap-2 mb-1 opacity-40">
                    <span className="h-4 w-4 rounded border border-white/30 flex-shrink-0"/>
                    <span className="text-white/60">Dépôt</span>
                  </label>
                  <label className="flex items-center gap-2 mb-1 opacity-40">
                    <span className="h-4 w-4 rounded border border-white/30 flex-shrink-0"/>
                    <span className="text-white/60">Retrait</span>
                  </label>
                  <label className="flex items-center gap-2 opacity-40">
                    <span className="h-4 w-4 rounded border border-white/30 flex-shrink-0"/>
                    <span className="text-white/60">Gains</span>
                  </label>
                </div>
                {/* Ordres */}
                <div>
                  <p className="font-semibold text-white mb-2">Ordres et transactions</p>
                  {["Consulter les ordres et transactions ouverts","Consulter les ordres et les transactions clôturés","Créer et modifier des ordres","Annuler et clôturer des ordres"].map((x) => (
                    <label key={x} className="flex items-start gap-2 mb-1.5">
                      <span className="h-4 w-4 rounded bg-[#7b5ea7] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </span>
                      <span className="text-white/80 leading-tight">{x}</span>
                    </label>
                  ))}
                </div>
                {/* Données */}
                <div>
                  <p className="font-semibold text-white mb-2">Données</p>
                  <label className="flex items-center gap-2 mb-1 opacity-40">
                    <span className="h-4 w-4 rounded border border-white/30 flex-shrink-0"/>
                    <span className="text-white/60">Consulter le registre</span>
                  </label>
                  <label className="flex items-center gap-2 opacity-40">
                    <span className="h-4 w-4 rounded border border-white/30 flex-shrink-0"/>
                    <span className="text-white/60">Exporter les données</span>
                  </label>
                </div>
              </div>
              <p className="text-[11px] text-amber-400/80 border border-amber-400/20 bg-amber-400/5 rounded-lg px-3 py-2">
                ⚠️ Ne jamais activer Dépôt / Retrait — inutile pour le copy.
              </p>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-6 text-[13px]">
                {/* API générale */}
                <div>
                  <p className="font-semibold text-white mb-3">API générale</p>
                  <label className="flex items-center gap-2.5 mb-2 cursor-pointer">
                    <span className="h-4 w-4 rounded-full border-4 border-[#7b5ea7] flex-shrink-0"/>
                    <span className="text-white font-medium">Accès complet</span>
                  </label>
                  <label className="flex items-center gap-2.5 mb-2 opacity-40">
                    <span className="h-4 w-4 rounded-full border border-white/40 flex-shrink-0"/>
                    <span className="text-white/70">Lecture seule</span>
                  </label>
                  <label className="flex items-center gap-2.5 opacity-40">
                    <span className="h-4 w-4 rounded-full border border-white/40 flex-shrink-0"/>
                    <span className="text-white/70">Aucun accès</span>
                  </label>
                </div>
                {/* API de retrait */}
                <div>
                  <p className="font-semibold text-white mb-3">API de retrait</p>
                  <label className="flex items-center gap-2.5 mb-2 opacity-40">
                    <span className="h-4 w-4 rounded-full border border-white/40 flex-shrink-0"/>
                    <span className="text-white/70">Accès complet</span>
                  </label>
                  <label className="flex items-center gap-2.5">
                    <span className="h-4 w-4 rounded-full border-4 border-[#7b5ea7] flex-shrink-0"/>
                    <span className="text-white font-medium">Aucun accès</span>
                  </label>
                </div>
              </div>
              <p className="text-[11px] text-amber-400/80 border border-amber-400/20 bg-amber-400/5 rounded-lg px-3 py-2">
                ⚠️ API de retrait = Aucun accès obligatoire — le copy n'a jamais besoin de retirer des fonds.
              </p>
            </>
          )}

          {/* Bouton bas */}
          <div className="pt-2 border-t border-white/10">
            <div className="bg-[#2a2a3e] rounded-xl px-4 py-3 text-center text-[13px] text-white/50 italic">
              Générer une clé → copier la clé publique et privée
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CopyTrading() {
  const { locked, investAccess } = useUnlock();
  const [user, setUser] = useState(null);
  const [s, setS] = useState(null);
  const [keyForm, setKeyForm] = useState({ api_key: "", api_secret: "" });
  const [spotKeyForm, setSpotKeyForm] = useState({ api_key: "", api_secret: "" });
  const [showFuturesHelp, setShowFuturesHelp] = useState(false);
  const [showSpotHelp, setShowSpotHelp] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [draft, setDraft] = useState(null); // réglages en cours d'édition
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
    refresh();
    loadContract();
    timer.current = setInterval(refresh, 4000);
    return () => clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) {
    return (
      <div>
        <h3 className="font-display text-[18px] text-bone mb-4">Copy-auto Portefeuille INVEST - LIVE</h3>
        <div className="rounded-2xl border gold-line bg-ink-800/40 p-8 text-[14px] text-mist">
          Connectez-vous à votre compte pour activer le copy-trading.
        </div>
      </div>
    );
  }

  // Premier chargement des données (compte Kraken B) : spinner
  if (s === null) {
    return (
      <div>
        <h3 className="font-display text-[18px] text-bone mb-4">Copy-auto Portefeuille INVEST - LIVE</h3>
        <div className="grid place-items-center gap-3 py-24 text-mist">
          <Spinner className="text-gold" /> <p className="text-[13px]">Chargement de votre compte…</p>
        </div>
      </div>
    );
  }

  const configured = s && s.configured;
  const spotConfigured = s && s.spot_configured;
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
  async function saveSpotKeys() {
    setBusy(true); setMsg("");
    const r = await copySaveSpotKeys(spotKeyForm.api_key.trim(), spotKeyForm.api_secret.trim());
    setBusy(false);
    if (r.ok) { setSpotKeyForm({ api_key: "", api_secret: "" }); setMsg("Clés Spot enregistrées ✓"); refresh(); }
    else setMsg(r.error === "invalid_keys" ? "Clés Spot refusées (vérifie qu'elles ont bien les permissions Spot/Margin)." : "Erreur : " + (r.detail || r.error));
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
    if (!confirm("Arrêter la copie ferme immédiatement toutes vos positions copiées. Continuer ?")) return;
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
          Copy-auto Portefeuille INVEST - LIVE
        </h3>
        <span className={`inline-flex items-center gap-2 text-[12px] ${meta.color}`}>
          <span className={`h-2 w-2 rounded-full ${meta.dot}`} /> {meta.label}
        </span>
      </div>


      {showFuturesHelp && <KrakenApiGuide type="futures" onClose={() => setShowFuturesHelp(false)} />}
      {showSpotHelp && <KrakenApiGuide type="spot" onClose={() => setShowSpotHelp(false)} />}

      {!configured ? (
        /* ---- onboarding : Futures + Spot côte à côte (au moins une requise) ---- */
        <div className="space-y-4 max-w-4xl">
          <div>
            <h4 className="font-display text-[17px] text-bone mb-1">Connectez votre sous-compte Kraken</h4>
            <p className="text-[13px] text-mist mb-2">
              Le copy-trading réplique les positions sur le sous-compte Kraken dédié que vous avez créé.
              Configurez au moins un wallet (Futures ou Spot / Margin) pour démarrer — vous pourrez ajouter l'autre ensuite.
            </p>
            <p className="text-[12px] text-mist/70 border border-gold/20 bg-gold/[0.04] rounded-lg px-3 py-2">
              💡 <b className="text-bone">Frais de performance : 20 %</b> sur les gains réalisés du compte chaque mois (gains non réalisés exclus). Facturés automatiquement et réglables en crypto depuis le menu <b className="text-bone">Wallet</b>.
            </p>
            {isReal && (
              <p className="mt-2 text-[12px] text-rose-300/90 border border-rose-500/30 bg-rose-500/[0.06] rounded-lg px-3 py-2">
                ⚠️ Mode RÉEL : les ordres sont exécutés avec de l'argent réel sur votre compte.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Futures */}
            <div className="rounded-2xl border gold-line bg-ink-800/40 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[18px]">⚡</span>
                <h5 className="font-display text-[16px] text-bone">Futures</h5>
                <button onClick={() => setShowFuturesHelp(true)}
                  className="rounded-full border border-gold/40 text-gold text-[11px] font-bold px-2 py-0.5 hover:bg-gold/10 flex-shrink-0"
                  title="Comment créer les clés API Futures">Help</button>
              </div>
              <p className="text-[12.5px] text-mist mb-4 leading-relaxed">
                Crée les clés sur{" "}
                <a className="text-gold underline" href="https://pro.kraken.com/app/settings/api" target="_blank" rel="noopener noreferrer">pro.kraken.com/app/settings/api</a>.
              </p>
              <div className="space-y-3">
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
                  className="btn-gold rounded-full px-5 py-2.5 text-[13px] font-semibold disabled:opacity-50 inline-flex items-center gap-2">
                  {busy && <Spinner size={14} className="text-ink-900" />}
                  {busy ? "Vérification…" : "Connecter Futures"}
                </button>
              </div>
            </div>

            {/* Spot / Margin */}
            <div className="rounded-2xl border border-sky-500/30 bg-sky-500/[0.04] p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[18px]">💎</span>
                <h5 className="font-display text-[16px] text-bone">Spot / Margin</h5>
                <button onClick={() => setShowSpotHelp(true)}
                  className="rounded-full border border-gold/40 text-gold text-[11px] font-bold px-2 py-0.5 hover:bg-gold/10 flex-shrink-0"
                  title="Comment créer les clés API Spot">Help</button>
              </div>
              <p className="text-[12.5px] text-mist mb-4 leading-relaxed">
                Crée les clés sur{" "}
                <a className="text-gold underline" href="https://pro.kraken.com/app/settings/api" target="_blank" rel="noopener noreferrer">pro.kraken.com/app/settings/api</a>.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest2 text-mist/70 mb-1.5">Clé publique (Spot)</label>
                  <input value={spotKeyForm.api_key} onChange={(e) => setSpotKeyForm({ ...spotKeyForm, api_key: e.target.value })}
                    className="w-full bg-ink-900/60 border hairline rounded-lg px-3 py-2.5 text-[13px] font-mono text-bone outline-none focus:border-gold/50" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest2 text-mist/70 mb-1.5">Clé privée (Spot)</label>
                  <input value={spotKeyForm.api_secret} onChange={(e) => setSpotKeyForm({ ...spotKeyForm, api_secret: e.target.value })} type="password"
                    className="w-full bg-ink-900/60 border hairline rounded-lg px-3 py-2.5 text-[13px] font-mono text-bone outline-none focus:border-gold/50" />
                </div>
                <button disabled={busy} onClick={saveSpotKeys}
                  className="btn-gold rounded-full px-5 py-2.5 text-[13px] font-semibold disabled:opacity-50 inline-flex items-center gap-2">
                  {busy && <Spinner size={14} className="text-ink-900" />}
                  {busy ? "Vérification…" : "Connecter Spot / Margin"}
                </button>
              </div>
            </div>
          </div>

          {msg && <p className="text-[12.5px] text-mist">{msg}</p>}

          <ul className="space-y-2">
            {["Clés chiffrées au repos", "Jamais de permission de retrait", "Vous gardez le contrôle : start/stop à tout moment"].map((x) => (
              <li key={x} className="flex items-center gap-3 text-[12.5px] text-mist/80">
                <span className="h-1 w-1 rounded-full bg-gold" /> {x}
              </li>
            ))}
          </ul>

          <RecallButton />
        </div>
      ) : (
        /* ---- tableau de bord investisseur ---- */
        <div className="space-y-5">

          {/* ---- Clés Spot/Margin manquantes ---- */}
          {!spotConfigured && (
            <div className="rounded-2xl border border-gold/30 bg-gold/[0.04] p-6 max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-gold text-[20px]">⚙️</span>
                <h4 className="font-display text-[17px] text-bone">Connectez votre compte Spot / Margin Kraken</h4>
                <button onClick={() => setShowSpotHelp(true)}
                  className="rounded-full border border-gold/40 text-gold text-[11px] font-bold px-2 py-0.5 hover:bg-gold/10 flex-shrink-0"
                  title="Comment créer les clés API Spot">Help</button>
              </div>
              <p className="text-[13px] leading-relaxed text-mist mb-4">
                Pour copier les positions <b className="text-bone">Spot et Margin</b>, saisissez les clés API de votre sous-compte Kraken dédié.
                Crée-les sur <a className="text-gold underline" href="https://pro.kraken.com/app/settings/api" target="_blank" rel="noopener noreferrer">pro.kraken.com/app/settings/api</a>.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest2 text-mist/70 mb-1.5">Clé publique (Spot)</label>
                  <input value={spotKeyForm.api_key} onChange={(e) => setSpotKeyForm({ ...spotKeyForm, api_key: e.target.value })}
                    className="w-full bg-ink-900/60 border hairline rounded-lg px-3 py-2.5 text-[13px] font-mono text-bone outline-none focus:border-gold/50" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest2 text-mist/70 mb-1.5">Clé privée (Spot)</label>
                  <input value={spotKeyForm.api_secret} onChange={(e) => setSpotKeyForm({ ...spotKeyForm, api_secret: e.target.value })} type="password"
                    className="w-full bg-ink-900/60 border hairline rounded-lg px-3 py-2.5 text-[13px] font-mono text-bone outline-none focus:border-gold/50" />
                </div>
                <button disabled={busy} onClick={saveSpotKeys}
                  className="btn-gold rounded-full px-6 py-3 text-[14px] font-semibold disabled:opacity-50 inline-flex items-center gap-2">
                  {busy && <Spinner size={14} className="text-ink-900" />}
                  {busy ? "Vérification…" : "Connecter Spot / Margin"}
                </button>
                {msg && <p className="text-[12.5px] text-mist">{msg}</p>}
              </div>
            </div>
          )}

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
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold bg-emerald-500/90 text-ink-900 disabled:opacity-50">
                {busy ? <Spinner size={16} className="text-ink-900" /> : "▶"} {busy ? "Démarrage…" : "Démarrer la copie"}
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
            (le trader maître) — elle exclut vos éventuels trades manuels et la revalorisation du collatéral.
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
                <PillarToggle label="Spot" sub="crypto spot"
                  checked={draft.copy_spot === true}
                  onChange={(v) => setDraft({ ...draft, copy_spot: v })} />
                <PillarToggle label="Marge" sub="positions sur marge"
                  checked={draft.copy_margin === true}
                  onChange={(v) => setDraft({ ...draft, copy_margin: v })} />
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
                tout et ferme si votre perte totale atteint X %. Levier max : plafonne votre exposition.
              </p>
            </div>
          )}

          {/* Option 2 — plans manuels (spot + xStocks, marge) */}
          <SpotPlanPanel />
          <MarginPlanPanel />

          {/* facturation */}
          {s.billing && <Billing b={s.billing} />}

          {/* code d'activation Portefeuille INVEST */}
          {!investAccess && <ScopeCodeGate scope="invest" />}

          <RecallButton />
        </div>
      )}

      <CopyInfo />

    </div>
  );
}

function SpotPlanPanel() {
  const [capital, setCapital] = useState("1000");
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function compute() {
    setBusy(true); setErr("");
    const r = await copySpotPlan(parseFloat(capital) || 0);
    setBusy(false);
    if (r.ok) setData(r);
    else setErr(r.error === "not_configured" ? "Plan spot indisponible (compte maître non configuré)." : "Erreur de calcul du plan.");
  }

  return (
    <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Plan spot — à exécuter manuellement</span>
        <span className="font-mono text-[9px] uppercase tracking-widest2 text-cyan-300 border border-cyan-500/30 rounded px-1.5 py-0.5">suggestion</span>
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-mist">
        Réplique la <b>composition spot</b> de Julien (hors xStocks) sur le capital de votre choix.
        <b className="text-bone"> Aucune exécution automatique</b> : vous passez les ordres vous-même sur votre compte Kraken.
      </p>
      <div className="mt-3 flex items-end gap-2 flex-wrap">
        <div>
          <label className="block text-[11px] uppercase tracking-widest2 text-mist/70 mb-1.5">Capital à allouer ($)</label>
          <input type="number" step="100" value={capital}
            onChange={(e) => setCapital(e.target.value)}
            className="w-40 bg-ink-900/60 border hairline rounded-lg px-3 py-2.5 text-[13px] font-mono text-bone outline-none focus:border-gold/50" />
        </div>
        <button disabled={busy} onClick={compute}
          className="btn-gold rounded-full px-5 py-2.5 text-[13px] font-semibold disabled:opacity-50">
          {busy ? "Calcul…" : "Calculer le plan"}
        </button>
      </div>
      {err && <p className="mt-2 text-[12.5px] text-rose-400/90">{err}</p>}
      {data && data.plan && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[440px] text-[13px] font-mono">
            <thead>
              <tr className="text-left text-mist/60 text-[10px] uppercase tracking-widest2 border-b hairline">
                <th className="px-3 py-2">Actif</th>
                <th className="px-3 py-2 text-right">Part</th>
                <th className="px-3 py-2 text-right">Montant</th>
                <th className="px-3 py-2 text-right">Quantité ≈</th>
                <th className="px-3 py-2 text-right">Prix</th>
              </tr>
            </thead>
            <tbody>
              {data.plan.filter((p) => p.target_usd > 0).map((p) => (
                <tr key={p.asset} className="border-b hairline last:border-0">
                  <td className="px-3 py-2 text-bone">{p.asset}</td>
                  <td className="px-3 py-2 text-right text-gold">{p.pct} %</td>
                  <td className="px-3 py-2 text-right text-bone">${p.target_usd}</td>
                  <td className="px-3 py-2 text-right text-mist">{p.target_qty}</td>
                  <td className="px-3 py-2 text-right text-mist">${p.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px] leading-relaxed text-mist/60">
            {data.note} Quantités indicatives au prix courant ; ajuste selon les minimums d'ordre Kraken.
          </p>
        </div>
      )}

      {data && data.xstocks_plan && data.xstocks_plan.length > 0 && (
        <div className="mt-5 rounded-xl border border-violet-500/30 bg-violet-500/[0.05] p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest2 text-violet-300">
            Actions tokenisées (xStocks) — à acheter dans l'app Kraken
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-[13px] font-mono">
              <thead>
                <tr className="text-left text-mist/60 text-[10px] uppercase tracking-widest2 border-b hairline">
                  <th className="px-3 py-2">Titre</th>
                  <th className="px-3 py-2 text-right">Part</th>
                  <th className="px-3 py-2 text-right">Montant</th>
                  <th className="px-3 py-2 text-right">Prix ≈</th>
                </tr>
              </thead>
              <tbody>
                {data.xstocks_plan.filter((p) => p.target_usd > 0).map((p) => (
                  <tr key={p.asset} className="border-b hairline last:border-0">
                    <td className="px-3 py-2 text-bone">{p.asset}</td>
                    <td className="px-3 py-2 text-right text-violet-300">{p.pct} %</td>
                    <td className="px-3 py-2 text-right text-bone">${p.target_usd}</td>
                    <td className="px-3 py-2 text-right text-mist">${p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-amber-300/90">
            ⚠️ Les xStocks ne s'achètent/vendent <b>que via l'app Kraken</b> (aucun ordre par API).
            {data.xstocks_note ? ` ${data.xstocks_note}` : ""}
          </p>
        </div>
      )}
    </div>
  );
}

function MarginPlanPanel() {
  const [capital, setCapital] = useState("1000");
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function compute() {
    setBusy(true); setErr("");
    const r = await copyMarginPlan(parseFloat(capital) || 0);
    setBusy(false);
    if (r.ok) setData(r);
    else setErr(r.error === "not_configured" ? "Plan marge indisponible (compte maître non configuré)." : "Erreur de calcul.");
  }

  return (
    <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Plan marge — à exécuter manuellement</span>
        <span className="font-mono text-[9px] uppercase tracking-widest2 text-cyan-300 border border-cyan-500/30 rounded px-1.5 py-0.5">suggestion</span>
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-mist">
        Réplique les <b>positions de marge</b> de Julien (paire · sens · levier).
        <b className="text-bone"> Aucune exécution automatique.</b>
      </p>
      <div className="mt-3 flex items-end gap-2 flex-wrap">
        <div>
          <label className="block text-[11px] uppercase tracking-widest2 text-mist/70 mb-1.5">Capital à allouer ($)</label>
          <input type="number" step="100" value={capital} onChange={(e) => setCapital(e.target.value)}
            className="w-40 bg-ink-900/60 border hairline rounded-lg px-3 py-2.5 text-[13px] font-mono text-bone outline-none focus:border-gold/50" />
        </div>
        <button disabled={busy} onClick={compute}
          className="btn-gold rounded-full px-5 py-2.5 text-[13px] font-semibold disabled:opacity-50">
          {busy ? "Calcul…" : "Calculer le plan"}
        </button>
      </div>
      {err && <p className="mt-2 text-[12.5px] text-rose-400/90">{err}</p>}
      {data && (data.plan?.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[460px] text-[13px] font-mono">
            <thead>
              <tr className="text-left text-mist/60 text-[10px] uppercase tracking-widest2 border-b hairline">
                <th className="px-3 py-2">Paire</th>
                <th className="px-3 py-2">Sens</th>
                <th className="px-3 py-2 text-right">Levier</th>
                <th className="px-3 py-2 text-right">Part</th>
                <th className="px-3 py-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {data.plan.map((p, i) => (
                <tr key={i} className="border-b hairline last:border-0">
                  <td className="px-3 py-2 text-bone">{p.pair}</td>
                  <td className={`px-3 py-2 ${p.side === "long" ? "text-emerald-400" : "text-rose-400"}`}>{p.side}</td>
                  <td className="px-3 py-2 text-right text-mist">{p.leverage ? `×${p.leverage}` : "—"}</td>
                  <td className="px-3 py-2 text-right text-gold">{p.pct} %</td>
                  <td className="px-3 py-2 text-right text-bone">${p.target_usd}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px] leading-relaxed text-mist/60">{data.note}</p>
        </div>
      ) : (
        <p className="mt-3 text-[12.5px] text-mist/60">Aucune position de marge ouverte chez Julien actuellement.</p>
      ))}
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

/* ================== XStocks — Actions tokenisés (données réelles compte maître A) ================== */

const TICKER_META = {
  AAPL:  { name: "Apple Inc.",            sector: "Tech",    color: "#5BA8FF" },
  NVDA:  { name: "NVIDIA Corporation",    sector: "Tech",    color: "#19C37D" },
  MSFT:  { name: "Microsoft Corporation", sector: "Tech",    color: "#7C5CFC" },
  GOOGL: { name: "Alphabet Inc. Cl A",    sector: "Tech",    color: "#C9A24B" },
  GOOG:  { name: "Alphabet Inc. Cl C",    sector: "Tech",    color: "#D4B44B" },
  META:  { name: "Meta Platforms",        sector: "Tech",    color: "#fb7185" },
  AMZN:  { name: "Amazon.com Inc.",       sector: "Conso.",  color: "#f97316" },
  TSLA:  { name: "Tesla Inc.",            sector: "Conso.",  color: "#e879f9" },
  NFLX:  { name: "Netflix Inc.",          sector: "Tech",    color: "#ef4444" },
  AMD:   { name: "Advanced Micro Devices",sector: "Tech",    color: "#22d3ee" },
  COIN:  { name: "Coinbase Global",       sector: "Finance", color: "#a78bfa" },
  MSTR:  { name: "MicroStrategy",         sector: "Finance", color: "#f59e0b" },
  PLTR:  { name: "Palantir Technologies", sector: "Tech",    color: "#10b981" },
  INTC:  { name: "Intel Corporation",     sector: "Tech",    color: "#6366f1" },
  DIS:   { name: "The Walt Disney Co.",   sector: "Conso.",  color: "#ec4899" },
  BABA:  { name: "Alibaba Group",         sector: "Tech",    color: "#f97316" },
  ABNB:  { name: "Airbnb Inc.",           sector: "Conso.",  color: "#fb923c" },
  MCD:   { name: "McDonald's Corp.",      sector: "Conso.",  color: "#fbbf24" },
  SPY:   { name: "SPDR S&P 500 ETF",     sector: "ETF",     color: "#34d399" },
  QQQ:   { name: "Invesco QQQ Trust",    sector: "ETF",     color: "#60a5fa" },
};
const SECTOR_COLORS = { "Tech": "#7C5CFC", "Conso.": "#f97316", "Finance": "#f59e0b", "ETF": "#34d399" };
const TICKER_COLORS_FALLBACK = ["#19C37D","#5BA8FF","#7C5CFC","#C9A24B","#fb7185","#f97316","#e879f9","#22d3ee","#a78bfa","#ef4444"];

function XStocksPie({ data }) {
  const size = 120; const cx = size / 2; const cy = size / 2; const rad = size / 2 - 4;
  const total = data.reduce((s, d) => s + d.value, 0);
  let ang = -Math.PI / 2;
  const slices = data.map((d) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + rad * Math.cos(ang);
    const y1 = cy + rad * Math.sin(ang);
    ang += sweep;
    const x2 = cx + rad * Math.cos(ang);
    const y2 = cy + rad * Math.sin(ang);
    const large = sweep > Math.PI ? 1 : 0;
    return { ...d, path: `M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${rad},${rad} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z` };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity={0.85} />)}
      <circle cx={cx} cy={cy} r={rad * 0.45} fill="rgba(15,15,20,0.90)" />
    </svg>
  );
}

const XSTOCKS_DEMO = [
  { ticker: "NVDA",  name: "NVIDIA Corporation",    sector: "Tech",    color: "#19C37D", qty: 12.5,  price: 134.20, mktVal: 1677.50, costVal: 980.00,  pnlAbs: 697.50,  pnlPct: 71.17 },
  { ticker: "AAPL",  name: "Apple Inc.",            sector: "Tech",    color: "#5BA8FF", qty: 30.0,  price: 213.40, mktVal: 6402.00, costVal: 5100.00, pnlAbs: 1302.00, pnlPct: 25.53 },
  { ticker: "MSFT",  name: "Microsoft Corporation", sector: "Tech",    color: "#7C5CFC", qty: 10.0,  price: 448.60, mktVal: 4486.00, costVal: 3800.00, pnlAbs: 686.00,  pnlPct: 18.05 },
  { ticker: "TSLA",  name: "Tesla Inc.",            sector: "Conso.",  color: "#e879f9", qty: 20.0,  price: 246.80, mktVal: 4936.00, costVal: 5400.00, pnlAbs: -464.00, pnlPct: -8.59 },
  { ticker: "META",  name: "Meta Platforms",        sector: "Tech",    color: "#fb7185", qty: 8.0,   price: 618.30, mktVal: 4946.40, costVal: 3900.00, pnlAbs: 1046.40, pnlPct: 26.83 },
  { ticker: "PLTR",  name: "Palantir Technologies", sector: "Tech",    color: "#10b981", qty: 50.0,  price: 127.60, mktVal: 6380.00, costVal: 4200.00, pnlAbs: 2180.00, pnlPct: 51.90 },
  { ticker: "COIN",  name: "Coinbase Global",       sector: "Finance", color: "#a78bfa", qty: 15.0,  price: 298.40, mktVal: 4476.00, costVal: 3600.00, pnlAbs: 876.00,  pnlPct: 24.33 },
  { ticker: "SPY",   name: "SPDR S&P 500 ETF",     sector: "ETF",     color: "#34d399", qty: 18.0,  price: 586.20, mktVal: 10551.60,costVal: 9100.00, pnlAbs: 1451.60, pnlPct: 15.95 },
];

export function XStocks() {
  const { locked, xstocksAccess, openUnlock } = useUnlock();
  const isUnlocked = !locked || xstocksAccess;
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isUnlocked) return;
    setLoading(true);
    fetch("https://api.informateurcrypto.fr/api/kraken/spot-portfolio", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { setRaw(d); setLoading(false); })
      .catch(() => setLoading(false));
    const id = setInterval(() => {
      fetch("https://api.informateurcrypto.fr/api/kraken/spot-portfolio", { cache: "no-store" })
        .then((r) => r.json()).then(setRaw).catch(() => {});
    }, 120_000);
    return () => clearInterval(id);
  }, [isUnlocked]);

  const fmtUsd = (v) => "$" + Math.abs(v).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const signed = (v) => `${v >= 0 ? "+" : "−"}${fmtUsd(v)}`;
  const signedPct = (v) => `${v >= 0 ? "+" : ""}${v.toFixed(2)} %`;
  const signCls = (v) => v >= 0 ? "text-emerald-400" : "text-rose-400";

  // Build holdings — démo si verrouillé, réel sinon
  const holdings = (() => {
    if (!isUnlocked) return XSTOCKS_DEMO;
    if (!raw?.ok || !raw?.holdings) return [];
    const all = raw.holdings
      .filter((h) => h.kind === "stock")
      .map((h, i) => {
        const meta = TICKER_META[h.symbol] || {};
        const mktVal = (h.value ?? 0) * DISPLAY_MULT;
        const costVal = (h.cost ?? 0) * DISPLAY_MULT;
        const pnlAbs = costVal > 0 ? mktVal - costVal : null;
        const pnlPct = costVal > 0 ? ((mktVal - costVal) / costVal) * 100 : null;
        return {
          ticker:  h.symbol,
          name:    meta.name || h.symbol,
          sector:  meta.sector || "Autre",
          color:   meta.color || TICKER_COLORS_FALLBACK[i % TICKER_COLORS_FALLBACK.length],
          qty:     h.amount,
          price:   h.price ?? 0,
          mktVal,
          costVal,
          pnlAbs,
          pnlPct,
        };
      });
    const grandTotal = all.reduce((s, h) => s + h.mktVal, 0);
    return all.filter((h) => grandTotal <= 0 || h.mktVal / grandTotal >= 0.005);
  })();

  const totalMkt  = holdings.reduce((s, h) => s + h.mktVal, 0);
  const totalCost = holdings.reduce((s, h) => s + h.costVal, 0);
  const totalPnl  = totalCost > 0 ? totalMkt - totalCost : null;
  const totalPnlPct = totalCost > 0 ? ((totalMkt - totalCost) / totalCost) * 100 : null;

  const sectors = {};
  holdings.forEach((h) => {
    if (!sectors[h.sector]) sectors[h.sector] = { label: h.sector, value: 0, color: SECTOR_COLORS[h.sector] || "#C9A24B" };
    sectors[h.sector].value += h.mktVal;
  });
  const sectorList = Object.values(sectors);
  const tickerData = holdings.map((h) => ({ label: h.ticker, value: h.mktVal, color: h.color }));

  const blurred = !isUnlocked;
  const bCls = blurred ? "blur-[3px] select-none pointer-events-none" : "";

  return (
    <div>
      <LastInvestment kinds={["stock"]} />
      {!locked && !xstocksAccess && <ScopeCodeGate scope="xstocks" />}
      {(locked || xstocksAccess) && (
      <>
      {/* Titre — toujours visible */}
      <div className="mb-5 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-display text-[20px] text-bone">X-Stocks <span className="text-mist/60 text-[15px] font-normal">(actions tokenisées)</span></h3>
          <p className="text-[11.5px] text-mist/60 mt-1">
            Portefeuille réel du compte maître A — exposition directe sur actions US via Kraken xStocks
          </p>
        </div>
        {loading && <span className="text-[11px] text-mist/50 mt-1">Chargement…</span>}
        {!loading && raw?.ok && <span className="text-[10px] font-mono text-emerald-400/70 mt-1">● Live</span>}
        {!loading && raw && !raw.ok && <span className="text-[10px] font-mono text-rose-400/70 mt-1">⚠ Indisponible</span>}
      </div>

      {/* Bouton déverrouiller — sous le titre, visible uniquement si verrouillé */}
      {blurred && (
        <div className="mb-5">
          <button onClick={openUnlock} className="btn-gold inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold shadow-2xl">
            <span aria-hidden>🔒</span> Déverrouiller pour voir les Actions
            <IconArrow className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Hero KPIs — label visible, valeur floutée */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Valeur totale",   value: totalMkt > 0 ? fmtUsd(totalMkt) : "—",                cls: "text-bone" },
          { label: "P&L non réalisé", value: totalPnl != null ? signed(totalPnl) : "—",            cls: totalPnl != null ? signCls(totalPnl) : "text-mist/60" },
          { label: "Performance",     value: totalPnlPct != null ? signedPct(totalPnlPct) : "—",    cls: totalPnlPct != null ? signCls(totalPnlPct) : "text-mist/60" },
          { label: "Positions",       value: loading ? "…" : `${holdings.length}`,                  cls: "text-bone" },
        ].map(({ label, value, cls }) => (
          <div key={label} className="rounded-2xl border hairline bg-ink-800/40 p-4">
            <div className="font-mono text-[9.5px] uppercase tracking-widest2 text-mist/60 mb-1">{label}</div>
            <div className={`font-display text-[20px] leading-none ${cls} ${bCls}`}>{value}</div>
          </div>
        ))}
      </div>

      {holdings.length > 0 && (
        <>
        {/* Répartition portefeuille */}
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          {/* Pie par ticker */}
          <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Répartition par action</span>
            <div className={`flex items-center gap-5 mt-4 ${bCls}`}>
              <XStocksPie data={tickerData} />
              <div className="space-y-1.5 flex-1 min-w-0">
                {holdings.map((h) => (
                  <div key={h.ticker} className="flex items-center justify-between gap-2 text-[11.5px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: h.color }} />
                      <span className="font-mono text-bone">{h.ticker}</span>
                    </div>
                    <span className="font-mono text-mist/70 tabular-nums">
                      {totalMkt > 0 ? ((h.mktVal / totalMkt) * 100).toFixed(1) : "0.0"} %
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pie sectoriel */}
          <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Répartition sectorielle</span>
            <div className={`flex items-center gap-5 mt-4 ${bCls}`}>
              <XStocksPie data={sectorList} />
              <div className="space-y-3 flex-1 min-w-0">
                {sectorList.map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                        <span className="text-bone">{s.label}</span>
                      </div>
                      <span className="font-mono text-mist/70 tabular-nums">
                        {totalMkt > 0 ? ((s.value / totalMkt) * 100).toFixed(1) : "0.0"} %
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${totalMkt > 0 ? (s.value / totalMkt) * 100 : 0}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des positions — en-têtes visibles, contenu flouté */}
        <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Positions en portefeuille</span>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-[13px] font-mono">
              <thead>
                <tr className="text-left text-mist/60 text-[10px] uppercase tracking-widest2 border-b hairline">
                  <th className="py-2 pr-4">Ticker</th>
                  <th className="py-2 pr-4 hidden sm:table-cell">Nom</th>
                  <th className="py-2 pr-4 hidden sm:table-cell">Secteur</th>
                  <th className="py-2 pr-4 text-right">Qté</th>
                  <th className="py-2 pr-4 text-right">Prix</th>
                  <th className="py-2 pr-4 text-right">Valeur</th>
                  <th className="py-2 text-right">P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <tr key={h.ticker} className="border-b hairline last:border-0">
                    <td className="py-2.5 pr-4">
                      <div className={`flex items-center gap-1.5 ${bCls}`}>
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: h.color }} />
                        <span className="font-semibold text-bone">{h.ticker}</span>
                      </div>
                    </td>
                    <td className={`py-2.5 pr-4 text-mist/70 hidden sm:table-cell text-[12px] ${bCls}`}>{h.name}</td>
                    <td className={`py-2.5 pr-4 hidden sm:table-cell ${bCls}`}>
                      <span className="rounded-md px-1.5 py-0.5 text-[10px]"
                        style={{ background: (SECTOR_COLORS[h.sector] || "#C9A24B") + "22", color: SECTOR_COLORS[h.sector] || "#C9A24B" }}>
                        {h.sector}
                      </span>
                    </td>
                    <td className={`py-2.5 pr-4 text-right text-mist tabular-nums ${bCls}`}>{h.qty.toFixed(4)}</td>
                    <td className={`py-2.5 pr-4 text-right text-mist tabular-nums ${bCls}`}>{h.price > 0 ? fmtUsd(h.price) : "—"}</td>
                    <td className={`py-2.5 pr-4 text-right text-bone tabular-nums ${bCls}`}>{fmtUsd(h.mktVal)}</td>
                    <td className={`py-2.5 text-right tabular-nums ${h.pnlPct != null ? signCls(h.pnlPct) : "text-mist/40"}`}>
                      {h.pnlPct != null ? signedPct(h.pnlPct) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-mist/40">
            Données en direct du compte maître A — rafraîchissement toutes les 2 min. P&amp;L calculé depuis le 1er juin 2026.
          </p>
        </div>
        </>
      )}

      {!loading && holdings.length === 0 && raw?.ok && (
        <div className="rounded-2xl border hairline bg-ink-800/40 p-8 text-center text-[13px] text-mist/60">
          Aucune position xStocks ouverte actuellement.
        </div>
      )}

      {loading && holdings.length === 0 && (
        <div className="rounded-2xl border hairline bg-ink-800/40 p-8 text-center text-[13px] text-mist/60">
          Chargement des positions…
        </div>
      )}
      </>
      )}
    </div>
  );
}
