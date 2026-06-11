"use client";

import { useEffect, useState, useCallback } from "react";
import { copyMaster } from "@/lib/clientStore";
import { Locked, useUnlock } from "./UnlockProvider";
import RealFuturesPositions from "./RealFuturesPositions";
import LiveTag from "./LiveTag";
import KrakenLogo from "@/components/KrakenLogo";
import { IconArrow } from "@/components/Icons";

// Barre d'accès au groupe VIP Telegram (grisée tant que le dashboard est verrouillé).
function VipJoinBar() {
  const { locked, openUnlock } = useUnlock();
  const [link, setLink] = useState("");
  useEffect(() => {
    try { setLink(localStorage.getItem("pi_tg_link") || ""); } catch {}
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
            {locked ? "Débloquez votre accès pour rejoindre le canal privé." : "Votre accès est actif — rejoignez le canal privé."}
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
        <span className="text-[12px] text-mist/70">Lien VIP envoyé par e-mail / dans l'onglet Facturation.</span>
      )}
    </div>
  );
}

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
// Le suivi de performance n'a pas encore démarré → on affiche 0,00 % en attendant la date de départ.
const TRACKING_STARTED = false;
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

function Table({ rows, cols, mobileMax }) {
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
        <tbody>
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

function Section({ title, dot, children }) {
  return (
    <div className="rounded-2xl border hairline bg-ink-800/40 overflow-hidden">
      <div className="px-5 py-3 border-b hairline flex items-center gap-2">
        {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot }} />}
        <span className="font-display text-[15px] text-bone">{title}</span>
      </div>
      <Locked><div className="overflow-x-auto">{children}</div></Locked>
    </div>
  );
}

// Données simulées affichées derrière le floutage (dashboard verrouillé).
// Aucun appel API n'est effectué tant que le contenu est verrouillé.
const MOCK = {
  accountPnlPct: 18.43,
  accountAbs:    0.1843,
  total:         1,
  comp: { crypto: 0.52, stock: 0.18, margin: 0, perps: 0.21, cash: 0.09 },
  crypto: [
    { symbol: "BTC",  value: 0.2810, _share: 28.1, cur: 107420, _abs: 0.052, _pnl: 5.2 },
    { symbol: "ETH",  value: 0.1540, _share: 15.4, cur: 3820,   _abs: 0.031, _pnl: 3.1 },
    { symbol: "SOL",  value: 0.0850, _share: 8.5,  cur: 186.4,  _abs: 0.018, _pnl: 1.8 },
  ],
  stocks: [
    { symbol: "NVDA", value: 0.0980, _share: 9.8,  cur: 1342,   _abs: 0.021, _pnl: 2.1 },
    { symbol: "AAPL", value: 0.0820, _share: 8.2,  cur: 218.5,  _abs: 0.012, _pnl: 1.2 },
  ],
  perps: [
    { symbol: "PF_XBTUSD", side: "long",  entry: 102100, cur: 107420, lev: 5, tp: null, sl: null, _abs: 0.053, _share: 10.6, _pnl: 5.3 },
    { symbol: "PF_ETHUSD", side: "short", entry: 3950,   cur: 3820,   lev: 3, tp: null, sl: null, _abs: 0.013, _share: 5.1,  _pnl: 1.3 },
  ],
  cash: [
    { symbol: "USDT", value: 0.09, _share: 9.0 },
  ],
};

export default function PortfolioKraken() {
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
    // 1) Spot d'abord : débloque le hero / le P&L dès que possible.
    const s = await fetch("/api/kraken/spot/portfolio").then((r) => r.json()).catch(() => null);
    setSpot(s);
    if (s && s.ok) setFirstDone(true);

    // 2) Le reste (futures, marge, tickers) en arrière-plan, sans bloquer l'affichage.
    const [f, fp, mp, tk, ma] = await Promise.all([
      fetch("/api/kraken/futures/account").then((r) => r.json()).catch(() => null),
      fetch("/api/kraken/futures/positions").then((r) => r.json()).catch(() => null),
      fetch("/api/kraken/spot/positions").then((r) => r.json()).catch(() => null),
      fetch("/api/kraken/futures/tickers").then((r) => r.json()).catch(() => null),
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

  // Charge les vraies données seulement si déverrouillé.
  useEffect(() => { if (!locked) load(); }, [load, locked]);

  // Rafraîchissement DOUX toutes les 60 s (récupère un éventuel rate-limit transitoire),
  // sans marteler l'API. Aucun retry rapide.
  useEffect(() => {
    if (locked) return;
    const id = setInterval(() => load(), 60000);
    return () => clearInterval(id);
  }, [load, locked]);

  // Si verrouillé → données mock, pas de spinner
  if (locked) {
    const m = MOCK;
    const px = (n) => (n ? Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 6 }) : "—");
    const pnlCell = (r) => {
      const a = r._abs != null ? `${r._abs >= 0 ? "+" : ""}${fmtUsd(r._abs)}` : "";
      const p = r._pnl != null ? `${r._pnl >= 0 ? "+" : ""}${r._pnl.toFixed(2)} %` : "";
      return a && p ? `${a} · ${p}` : a || p;
    };
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-display text-[18px] text-bone">Portefeuille Kraken</h3>
          <LiveTag />
        </div>
        <VipJoinBar />
        {/* Hero mock */}
        <div className="relative rounded-3xl border overflow-hidden p-7 mb-5" style={{ borderColor: "rgba(124,92,252,0.30)" }}>
          <div className="pointer-events-none absolute -top-20 -right-10 h-56 w-56 rounded-full blur-3xl"
               style={{ background: "radial-gradient(circle, rgba(124,92,252,0.22), transparent 70%)" }} />
          <KrakenLogo mark wordmark={false} color="#7C5CFC"
            className="pointer-events-none absolute -bottom-8 -right-6 opacity-[0.10] [&_svg]:h-44 [&_svg]:w-44" />
          <div className="relative">
            <div className="font-mono text-[10px] uppercase tracking-widest2" style={{ color: "#7C5CFC" }}>P&L du compte</div>
            <Locked>
              <div className="mt-2 font-display text-[44px] md:text-[54px] leading-none text-emerald-400">
                +{m.accountPnlPct.toFixed(2)} %
              </div>
              <div className="mt-1.5 font-mono text-[12.5px]">
                <span className="text-emerald-400">+{fmtUsd(m.accountAbs)}</span>
                <span className="text-mist/60"> · valeur totale du compte {fmtUsd(m.total)}</span>
              </div>
              <div className="mt-4 font-mono text-[10px] uppercase tracking-widest2 text-mist/60">Composition du portefeuille</div>
              <div className="mt-5 flex h-3.5 w-full rounded-full overflow-hidden bg-white/[0.05]">
                {Object.entries(m.comp).filter(([,v])=>v>0).map(([k,v])=>(
                  <div key={k} style={{ width:`${v*100}%`, background: CAT[k].color }} />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(CAT).map(([k,c])=>(
                  <div key={k} className="flex items-start gap-2">
                    <span className="mt-1 h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: c.color }} />
                    <div className="leading-tight">
                      <div className="text-[12px] text-bone">{c.label}</div>
                      <div className="font-mono text-[13px] text-bone">
                        {((m.comp[k]||0)*100).toFixed(0)}<span className="text-mist/60"> %</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Locked>
          </div>
        </div>
        <div className="space-y-5">
          {[
            { title: "Spot crypto", dot: CAT.crypto.color, rows: m.crypto, cols: [
              {k:"symbol",h:"Actif"}, {k:"cur",h:"Prix actuel",right:true,hide:"hidden sm:table-cell",render:(r)=>px(r.cur)},
              {k:"value",h:"Valeur",right:true,render:(r)=>fmtUsd(r.value)}, {k:"_share",h:"Part",right:true,cls:()=>"text-gold",render:(r)=>`${r._share.toFixed(1)} %`},
              {k:"_pnl",h:"P&L",right:true,cls:(r)=>(r._pnl>=0?"text-emerald-400":"text-rose-400"),render:pnlCell},
            ]},
            { title: "Actions / ETF tokenisés", dot: CAT.stock.color, rows: m.stocks, cols: [
              {k:"symbol",h:"Titre"}, {k:"cur",h:"Prix actuel",right:true,hide:"hidden sm:table-cell",render:(r)=>px(r.cur)},
              {k:"value",h:"Valeur",right:true,render:(r)=>fmtUsd(r.value)}, {k:"_share",h:"Part",right:true,cls:()=>"text-gold",render:(r)=>`${r._share.toFixed(1)} %`},
              {k:"_pnl",h:"P&L",right:true,cls:(r)=>(r._pnl>=0?"text-emerald-400":"text-rose-400"),render:pnlCell},
            ]},
            { title: "Futures crypto (perps)", dot: CAT.perps.color, rows: m.perps, cols: [
              {k:"symbol",h:"Contrat"}, {k:"side",h:"Sens",cls:(r)=>(r.side==="long"?"text-emerald-400":"text-rose-400"),render:(r)=>(r.side==="long"?"Long":"Short")},
              {k:"entry",h:"Entrée",right:true,hide:"hidden sm:table-cell",render:(r)=>px(r.entry)}, {k:"cur",h:"Mark",right:true,hide:"hidden sm:table-cell",render:(r)=>px(r.cur)},
              {k:"lev",h:"Levier",right:true,hide:"hidden md:table-cell",render:(r)=>(r.lev?`×${r.lev}`:"-")},
              {k:"_share",h:"Part",right:true,cls:()=>"text-gold",render:(r)=>`${r._share.toFixed(1)} %`},
              {k:"_pnl",h:"P&L",right:true,cls:(r)=>(r._pnl>=0?"text-emerald-400":"text-rose-400"),render:pnlCell},
            ]},
            { title: "Cash & stablecoins", dot: CAT.cash.color, rows: m.cash, cols: [
              {k:"symbol",h:"Devise"}, {k:"value",h:"Valeur",right:true,render:(r)=>fmtUsd(r.value)},
              {k:"_share",h:"Part",right:true,cls:()=>"text-gold",render:(r)=>`${r._share.toFixed(1)} %`},
            ]},
          ].map(({ title, dot, rows, cols }) => (
            <div key={title} className="rounded-2xl border hairline bg-ink-800/40 overflow-hidden">
              <div className="px-5 py-3 border-b hairline flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
                <span className="font-display text-[15px] text-bone">{title}</span>
              </div>
              <Locked><div className="overflow-x-auto"><Table rows={rows} cols={cols} /></div></Locked>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[11.5px] leading-relaxed text-mist/60">
          Vue agrégée en lecture seule. Valeurs estimées via les prix de marché.
        </p>
      </div>
    );
  }

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

  // P&L ABSOLU par actif (progression depuis le 1er juin), en % de la valeur TOTALE du compte.
  // Tant que le suivi n'a pas démarré (TRACKING_STARTED=false) → 0.
  const spotAbs = (h) =>
    h.cost != null && h.cost > 0 && h.value != null ? h.value - h.cost : null;
  const absOf = (a) => (TRACKING_STARTED ? a : 0);
  const pnlOf = (a) => (TRACKING_STARTED ? (a == null ? null : pnlPctOf(a)) : 0);
  const crypto = holdings.filter((h) => h.kind === "crypto").map((h) => { const a = spotAbs(h); return { ...h, cur: h.price, _abs: absOf(a), _share: shareOf(h.value), _pnl: pnlOf(a) }; });
  const stocks = holdings.filter((h) => h.kind === "stock").map((h) => { const a = spotAbs(h); return { ...h, cur: h.price, _abs: absOf(a), _share: shareOf(h.value), _pnl: pnlOf(a) }; });
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

  // P&L GLOBAL du compte, en % de la valeur totale. 0,00 % tant que le suivi n'a pas démarré.
  const sumAbs = (arr) => arr.reduce((s, r) => s + (r._abs || 0), 0);
  const accountAbs = TRACKING_STARTED ? sumAbs(crypto) + sumAbs(stocks) + sumAbs(marginRows) + sumAbs(perps) : 0;
  const accountPnlPct = TRACKING_STARTED ? (total > 0 ? (accountAbs / total) * 100 : null) : 0;

  const header = (
    <div className="flex items-center gap-2 mb-4">
      <h3 className="font-display text-[18px] text-bone">Portefeuille Kraken</h3>
      <LiveTag />
      <button onClick={load} disabled={loading}
        className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-mist hover:text-bone disabled:opacity-60">
        {loading ? <Spinner size={13} /> : "↻"} {loading ? "chargement…" : "rafraîchir"}
      </button>
    </div>
  );

  // Spinner plein écran tant que le 1er chargement complet n'est pas terminé
  // (on n'affiche le P&L du compte qu'une fois toutes les données remontées).
  if (!firstDone) {
    return (
      <div>
        {header}
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
            P&L du compte {TRACKING_STARTED ? "· depuis le départ" : "· en attente du départ"}
          </div>
          <Locked>
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
          </Locked>
        </div>
      </div>

      {/* Note : tout est relatif au portefeuille total */}
      <div className="rounded-xl border gold-line bg-gold/[0.04] px-4 py-2.5 mb-4">
        <p className="text-[11.5px] leading-relaxed text-mist">
          <span className="text-gold">ⓘ</span> La <span className="text-bone">Part</span> et le{" "}
          <span className="text-bone">P&L</span> sont exprimés en{" "}
          <span className="text-bone">% de la valeur totale du compte</span> (spot, actions US/ETF,
          marge, perps). Le P&L spot/actions mesure la <span className="text-bone">progression
          depuis le cours de départ</span> : quantité × (cours actuel − cours de départ), rapporté à
          la valeur totale du compte.
        </p>
      </div>

      {/* Tables par catégorie */}
      <div className="space-y-5">
        <Section title="Spot crypto" dot={CAT.crypto.color}>
          <Table rows={crypto} mobileMax={3} cols={[
            { k: "symbol", h: "Actif" },
            { k: "cur", h: "Prix actuel", right: true, hide: "hidden sm:table-cell", render: (r) => px(r.cur) },
            { k: "value", h: "Valeur", right: true, render: (r) => fmtUsd(r.value) },
            { k: "_share", h: "Part", right: true, cls: () => "text-gold", render: (r) => `${r._share.toFixed(1)} %` },
            { k: "_pnl", h: "P&L", right: true, cls: (r) => (r._pnl == null ? "text-mist" : r._pnl >= 0 ? "text-emerald-400" : "text-rose-400"), render: pnlCell },
          ]} />
        </Section>

        <Section title="Actions / ETF tokenisés" dot={CAT.stock.color}>
          <Table rows={stocks} cols={[
            { k: "symbol", h: "Titre" },
            { k: "cur", h: "Prix actuel", right: true, hide: "hidden sm:table-cell", render: (r) => px(r.cur) },
            { k: "value", h: "Valeur", right: true, render: (r) => fmtUsd(r.value) },
            { k: "_share", h: "Part", right: true, cls: () => "text-gold", render: (r) => `${r._share.toFixed(1)} %` },
            { k: "_pnl", h: "P&L", right: true, cls: (r) => (r._pnl == null ? "text-mist" : r._pnl >= 0 ? "text-emerald-400" : "text-rose-400"), render: pnlCell },
          ]} />
        </Section>

        <Section title="Positions sur marge" dot={CAT.margin.color}>
          <Table rows={marginRows} cols={[
            { k: "pair", h: "Paire" },
            { k: "side", h: "Sens", cls: (r) => (r.side === "buy" ? "text-emerald-400" : "text-rose-400"), render: (r) => (r.side === "buy" ? "Long" : "Short") },
            { k: "entry", h: "Entrée", right: true, hide: "hidden sm:table-cell", render: (r) => px(r.entry) },
            { k: "cur", h: "Prix actuel", right: true, hide: "hidden sm:table-cell", render: (r) => px(r.cur) },
            { k: "lev", h: "Levier", right: true, hide: "hidden md:table-cell", render: (r) => (r.lev ? `×${r.lev.toFixed(1)}` : "—") },
            { k: "tp", h: "TP", right: true, hide: "hidden md:table-cell", render: (r) => px(r.tp) },
            { k: "sl", h: "SL", right: true, hide: "hidden md:table-cell", render: (r) => px(r.sl) },
            { k: "value", h: "Valeur", right: true, render: (r) => fmtUsd(r.value) },
            { k: "_share", h: "Part", right: true, cls: () => "text-gold", render: (r) => `${r._share.toFixed(1)} %` },
            { k: "_pnl", h: "P&L", right: true, cls: (r) => (r._pnl == null ? "text-mist" : r._pnl >= 0 ? "text-emerald-400" : "text-rose-400"), render: pnlCell },
          ]} />
        </Section>

        <Section title="Futures crypto (perps)" dot={CAT.perps.color}>
          {/* Même source et même affichage que l'onglet Futures */}
          <div className="p-1.5">
            <RealFuturesPositions />
          </div>
        </Section>

        <Section title="Cash & stablecoins" dot={CAT.cash.color}>
          <Table rows={cash} cols={[
            { k: "symbol", h: "Devise" },
            { k: "value", h: "Valeur", right: true, render: (r) => fmtUsd(r.value) },
            { k: "_share", h: "Part", right: true, cls: () => "text-gold", render: (r) => `${r._share.toFixed(1)} %` },
          ]} />
        </Section>
      </div>

      <p className="mt-5 text-[11.5px] leading-relaxed text-mist/60">
        Vue agrégée en lecture seule. Valeurs estimées via les prix de marché ; aucune
        exécution d'ordre ni mouvement de fonds depuis cette interface.
      </p>
    </div>
  );
}
