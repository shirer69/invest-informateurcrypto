"use client";

import { useEffect, useState, useCallback } from "react";

function Pill({ ok, children }) {
  return (
    <span
      className={`font-mono text-[9.5px] uppercase tracking-widest2 rounded px-2 py-0.5 border ${
        ok
          ? "text-emerald-400 border-emerald-500/30"
          : "text-amber-400 border-amber-500/30"
      }`}
    >
      {children}
    </span>
  );
}

export default function SandboxKraken() {
  const [status, setStatus] = useState(null);
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState(null);
  const [loading, setLoading] = useState(false);

  // formulaire d'ordre démo
  const [symbol, setSymbol] = useState("pi_xbtusd");
  const [side, setSide] = useState("buy");
  const [orderType, setOrderType] = useState("lmt");
  const [size, setSize] = useState("1");
  const [limitPrice, setLimitPrice] = useState("");
  const [sending, setSending] = useState(false);
  const [orderRes, setOrderRes] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const s = await fetch("/api/kraken/status").then((r) => r.json());
      setStatus(s);
      if (s.configured) {
        const [a, p] = await Promise.all([
          fetch("/api/kraken/account").then((r) => r.json()).catch(() => null),
          fetch("/api/kraken/positions").then((r) => r.json()).catch(() => null),
        ]);
        setAccount(a);
        setPositions(p);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function sendOrder(e) {
    e.preventDefault();
    setSending(true);
    setOrderRes(null);
    try {
      const res = await fetch("/api/kraken/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          side,
          orderType,
          size: Number(size),
          limitPrice: Number(limitPrice),
        }),
      });
      const data = await res.json();
      setOrderRes(data);
      refresh();
    } catch (err) {
      setOrderRes({ ok: false, error: String(err) });
    } finally {
      setSending(false);
    }
  }

  const configured = status?.configured;
  const posList = positions?.data?.openPositions || [];
  const portfolioValue =
    account?.data?.accounts?.flex?.portfolioValue ??
    account?.data?.accounts?.flex?.collateralValue ??
    null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-display text-[18px] text-bone">Sandbox Kraken</h3>
        <Pill ok={true}>environnement démo</Pill>
        {status && <Pill ok={configured}>{configured ? "connecté" : "clés à configurer"}</Pill>}
      </div>

      {/* bandeau sandbox */}
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 mb-5">
        <p className="text-[12.5px] leading-relaxed text-amber-200/90">
          🧪 <span className="font-semibold">Mode sandbox</span> — fonds fictifs sur{" "}
          <span className="font-mono">demo-futures.kraken.com</span>. Aucun ordre réel,
          aucun fonds réel. Intégration de démonstration (levée de fonds).
        </p>
      </div>

      {!configured ? (
        <div className="rounded-2xl border hairline bg-ink-800/50 p-6">
          <h4 className="font-display text-[17px] text-bone">Connexion non configurée</h4>
          <p className="mt-2 text-[13.5px] leading-relaxed text-mist max-w-prose2">
            Pour activer l'interconnexion, créez une clé API sur un compte{" "}
            <span className="text-bone">Kraken Futures Demo</span> (gratuit, fonds fictifs)
            puis renseignez les variables d'environnement{" "}
            <span className="font-mono text-gold">KRAKEN_DEMO_API_KEY</span> et{" "}
            <span className="font-mono text-gold">KRAKEN_DEMO_API_SECRET</span>.
          </p>
          <button
            onClick={refresh}
            className="btn-ghost mt-5 rounded-full px-5 py-2.5 text-[13px]"
          >
            {loading ? "Vérification…" : "Réessayer la connexion"}
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_1fr] gap-5 items-start">
          {/* Compte + positions */}
          <div className="space-y-5">
            <div className="rounded-2xl border hairline bg-ink-800/50 p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">
                  Compte démo
                </span>
                <button onClick={refresh} className="text-[11.5px] text-gold hover:text-gold-soft">
                  ↻ rafraîchir
                </button>
              </div>
              <div className="mt-3 font-display text-[26px] text-bone">
                {portfolioValue !== null ? `${Number(portfolioValue).toLocaleString("fr-FR")} $` : "—"}
              </div>
              <div className="text-[12px] text-mist">valeur de portefeuille (démo)</div>
            </div>

            <div className="rounded-2xl border hairline bg-ink-800/50 p-6">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">
                Positions ouvertes ({posList.length})
              </span>
              {posList.length === 0 ? (
                <p className="mt-3 text-[13px] text-mist">Aucune position ouverte.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {posList.slice(0, 8).map((p, i) => (
                    <li key={i} className="flex items-center justify-between text-[13px]">
                      <span className="font-mono text-bone">{p.symbol}</span>
                      <span className={p.side === "long" ? "text-emerald-400" : "text-rose-400"}>
                        {p.side} · {p.size}
                      </span>
                      <span className="font-mono text-mist">{p.price}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Ordre démo */}
          <form onSubmit={sendOrder} className="rounded-2xl border gold-line bg-ink-800/40 p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">
              Envoyer un ordre (sandbox)
            </div>

            <div className="mt-4 flex gap-2">
              {["buy", "sell"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className={`flex-1 rounded-lg py-2.5 text-[13.5px] font-semibold transition-colors ${
                    side === s
                      ? s === "buy"
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                        : "bg-rose-500/15 text-rose-300 border border-rose-500/40"
                      : "border border-white/10 text-mist"
                  }`}
                >
                  {s === "buy" ? "Achat" : "Vente"}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <L label="Symbole">
                <input value={symbol} onChange={(e) => setSymbol(e.target.value)}
                       className={inp} placeholder="pi_xbtusd" />
              </L>
              <L label="Taille (contrats)">
                <input value={size} onChange={(e) => setSize(e.target.value)} className={inp} inputMode="decimal" />
              </L>
              <L label="Type">
                <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className={inp}>
                  <option value="lmt">Limite</option>
                  <option value="mkt">Marché</option>
                </select>
              </L>
              <L label="Prix limite">
                <input value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)}
                       className={inp} inputMode="decimal" disabled={orderType === "mkt"} placeholder={orderType === "mkt" ? "—" : "60000"} />
              </L>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="btn-gold mt-5 w-full rounded-full px-6 py-3 text-[14px] font-semibold disabled:opacity-60"
            >
              {sending ? "Envoi…" : "Envoyer l'ordre démo"}
            </button>

            {orderRes && (
              <div className={`mt-4 rounded-xl border p-3 text-[12.5px] ${
                orderRes.ok ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-200" : "border-rose-500/30 bg-rose-500/[0.06] text-rose-200"
              }`}>
                <div className="font-mono uppercase tracking-widest text-[10px] mb-1">
                  {orderRes.ok ? "Ordre accepté (sandbox)" : "Réponse"}
                </div>
                <pre className="whitespace-pre-wrap break-words font-mono text-[11px] opacity-90">
                  {JSON.stringify(orderRes.data || orderRes.error || orderRes, null, 2).slice(0, 700)}
                </pre>
              </div>
            )}
          </form>
        </div>
      )}

      <p className="mt-5 text-[11.5px] leading-relaxed text-mist/60">
        Intégration technique de démonstration sur l'environnement démo de Kraken Futures.
        Aucun ordre réel n'est passé et aucun fonds réel n'est engagé.
      </p>
    </div>
  );
}

const inp =
  "mt-1.5 w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-3.5 py-2.5 text-bone placeholder:text-mist/40 font-mono text-[13px] outline-none transition-colors disabled:opacity-40";

function L({ label, children }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">{label}</span>
      {children}
    </label>
  );
}
