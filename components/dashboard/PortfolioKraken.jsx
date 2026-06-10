"use client";

import { useEffect, useState, useCallback } from "react";

const KP = "#7c5cfc"; // accent Kraken (violet)
const fmtUsd = (n) =>
  n === null || n === undefined || isNaN(n)
    ? "—"
    : Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + " $";
const fmtAmt = (n) =>
  Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 8 });

function Card({ title, value, sub, accent }) {
  return (
    <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">{title}</div>
      <div className="mt-2 font-display text-[24px] text-bone" style={accent ? { color: accent } : {}}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[12px] text-mist">{sub}</div>}
    </div>
  );
}

function Table({ rows }) {
  if (!rows.length) return <p className="px-5 py-4 text-[13px] text-mist">Aucun actif.</p>;
  return (
    <table className="w-full text-[13.5px]">
      <thead>
        <tr className="text-left font-mono text-[10px] uppercase tracking-widest2 text-mist/60 border-b hairline">
          <th className="px-5 py-3">Actif</th>
          <th className="px-5 py-3 text-right">Quantité</th>
          <th className="px-5 py-3 text-right hidden sm:table-cell">Prix</th>
          <th className="px-5 py-3 text-right">Valeur (est.)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((h) => (
          <tr key={h.asset} className="border-b hairline last:border-0">
            <td className="px-5 py-3 font-medium text-bone">{h.symbol}</td>
            <td className="px-5 py-3 text-right font-mono text-mist">{fmtAmt(h.amount)}</td>
            <td className="px-5 py-3 text-right font-mono text-mist hidden sm:table-cell">
              {h.price ? fmtUsd(h.price) : "—"}
            </td>
            <td className="px-5 py-3 text-right font-mono text-bone">{fmtUsd(h.value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function PortfolioKraken() {
  const [loading, setLoading] = useState(true);
  const [spot, setSpot] = useState(null);
  const [fut, setFut] = useState(null);
  const [futPos, setFutPos] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, f, fp] = await Promise.all([
      fetch("/api/kraken/spot/portfolio").then((r) => r.json()).catch(() => null),
      fetch("/api/kraken/account").then((r) => r.json()).catch(() => null),
      fetch("/api/kraken/positions").then((r) => r.json()).catch(() => null),
    ]);
    setSpot(s);
    setFut(f);
    setFutPos(fp);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const spotOk = spot?.ok;
  const holdings = spotOk ? spot.holdings : [];
  const crypto = holdings.filter((h) => h.kind === "crypto");
  const stocks = holdings.filter((h) => h.kind === "stock");
  const cash = holdings.filter((h) => h.kind === "cash");
  const t = spot?.totals || {};

  const futValue =
    fut?.data?.accounts?.flex?.portfolioValue ??
    fut?.data?.accounts?.flex?.collateralValue ??
    null;
  const futPositions = futPos?.data?.openPositions || [];

  const spotTotal = t.spotEquity ?? ((t.crypto || 0) + (t.stock || 0) + (t.cash || 0));
  const grandTotal =
    (spotTotal || 0) + (futValue ? Number(futValue) : 0);

  const nothingConfigured =
    spot && !spot.ok && spot.error === "not_configured" && fut && fut.ok === false;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-display text-[18px] text-bone">Portefeuille Kraken</h3>
        <span className="font-mono text-[9px] uppercase tracking-widest2 rounded px-1.5 py-0.5 border"
              style={{ color: KP, borderColor: "rgba(124,92,252,0.4)" }}>
          lecture seule
        </span>
        <button onClick={load} className="ml-auto text-[12px] text-mist hover:text-bone">↻ rafraîchir</button>
      </div>

      {/* Hero total */}
      <div className="relative rounded-3xl border overflow-hidden p-7 mb-5"
           style={{ borderColor: "rgba(124,92,252,0.35)" }}>
        <div className="pointer-events-none absolute -top-20 -right-10 h-56 w-56 rounded-full blur-3xl"
             style={{ background: "radial-gradient(circle, rgba(124,92,252,0.28), transparent 70%)" }} />
        <div className="relative">
          <div className="font-mono text-[10px] uppercase tracking-widest2" style={{ color: KP }}>
            Valeur totale du portefeuille (estimée)
          </div>
          <div className="mt-2 font-display text-[40px] md:text-[48px] leading-none text-bone">
            {loading ? "…" : fmtUsd(grandTotal)}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[12.5px] text-mist">
            <span>Spot : <span className="text-bone">{fmtUsd(spotTotal)}</span></span>
            <span>Futures : <span className="text-bone">{futValue ? fmtUsd(Number(futValue)) : "—"}</span></span>
            <span>Crypto : <span className="text-bone">{fmtUsd(t.crypto)}</span></span>
            <span>Actions : <span className="text-bone">{fmtUsd(t.stock)}</span></span>
            <span>Cash : <span className="text-bone">{fmtUsd(t.cash)}</span></span>
          </div>
        </div>
      </div>

      {nothingConfigured && (
        <div className="rounded-2xl border hairline bg-ink-800/50 p-6 mb-5">
          <h4 className="font-display text-[16px] text-bone">Comptes non connectés</h4>
          <p className="mt-2 text-[13px] leading-relaxed text-mist max-w-prose2">
            Renseignez une clé <span className="font-mono" style={{ color: KP }}>Spot read-only</span>{" "}
            (<span className="font-mono">KRAKEN_SPOT_API_KEY/SECRET</span>, permissions
            <em> Query Funds / Open Positions</em> uniquement) et/ou une clé{" "}
            <span className="font-mono" style={{ color: KP }}>Futures démo</span> pour afficher
            le portefeuille réel en lecture seule.
          </p>
        </div>
      )}

      {/* Répartition KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card title="Wallet spot crypto" value={fmtUsd(t.crypto)} sub={`${crypto.length} actifs`} />
        <Card title="Actions tokenisées" value={fmtUsd(t.stock)} sub={`${stocks.length} titres`} accent={KP} />
        <Card title="Cash / stables" value={fmtUsd(t.cash)} sub={`${cash.length} devises`} />
        <Card title="Positions futures" value={`${futPositions.length}`} sub="ouvertes" />
      </div>

      {/* Tables */}
      <div className="space-y-5">
        <Section title="Wallet spot — crypto">
          <Table rows={crypto} />
        </Section>

        {stocks.length > 0 && (
          <Section title="Actions tokenisées (xStocks)">
            <Table rows={stocks} />
          </Section>
        )}

        <Section title="Cash & stablecoins">
          <Table rows={cash} />
        </Section>

        <Section title="Positions futures ouvertes">
          {futPositions.length === 0 ? (
            <p className="px-5 py-4 text-[13px] text-mist">Aucune position future ouverte.</p>
          ) : (
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="text-left font-mono text-[10px] uppercase tracking-widest2 text-mist/60 border-b hairline">
                  <th className="px-5 py-3">Symbole</th>
                  <th className="px-5 py-3">Sens</th>
                  <th className="px-5 py-3 text-right">Taille</th>
                  <th className="px-5 py-3 text-right">Prix</th>
                </tr>
              </thead>
              <tbody>
                {futPositions.map((p, i) => (
                  <tr key={i} className="border-b hairline last:border-0">
                    <td className="px-5 py-3 font-mono text-bone">{p.symbol}</td>
                    <td className="px-5 py-3">
                      <span className={p.side === "long" ? "text-emerald-400" : "text-rose-400"}>{p.side}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-mist">{p.size}</td>
                    <td className="px-5 py-3 text-right font-mono text-mist">{p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      </div>

      <p className="mt-5 text-[11.5px] leading-relaxed text-mist/60">
        Vue agrégée en lecture seule. Valeurs estimées via les prix de marché ; aucune
        exécution d'ordre ni mouvement de fonds n'est possible depuis cette interface.
      </p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border hairline bg-ink-800/40 overflow-hidden">
      <div className="px-5 py-3 border-b hairline font-display text-[15px] text-bone">{title}</div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
