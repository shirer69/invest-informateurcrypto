"use client";

import { useState, useMemo } from "react";
import { IconArrow } from "@/components/Icons";

const num = (v) => {
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? null : n;
};

const fmt = (n, d = 2) =>
  n === null || !isFinite(n)
    ? "—"
    : n.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });

export default function OrderTicket() {
  const [side, setSide] = useState("long");
  const [asset, setAsset] = useState("BTC/USD");
  const [capital, setCapital] = useState("10000");
  const [risk, setRisk] = useState("1");
  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");

  const calc = useMemo(() => {
    const cap = num(capital);
    const rPct = num(risk);
    const e = num(entry);
    const s = num(sl);
    const t = num(tp);
    if (cap === null || rPct === null || e === null || s === null) return null;

    const stopDist = Math.abs(e - s);
    if (stopDist <= 0) return { error: "Le stop doit différer de l'entrée." };

    // Cohérence du sens
    if (side === "long" && s >= e) return { error: "En LONG, le stop doit être sous l'entrée." };
    if (side === "short" && s <= e) return { error: "En SHORT, le stop doit être au-dessus de l'entrée." };

    const riskAmount = cap * (rPct / 100);
    const units = riskAmount / stopDist; // taille en unités de l'actif
    const notional = units * e;
    let rr = null, gain = null;
    if (t !== null) {
      const tpDist = Math.abs(t - e);
      // cohérence TP
      if (side === "long" && t <= e) return { error: "En LONG, l'objectif doit être au-dessus de l'entrée." };
      if (side === "short" && t >= e) return { error: "En SHORT, l'objectif doit être sous l'entrée." };
      rr = tpDist / stopDist;
      gain = tpDist * units;
    }
    return { riskAmount, units, notional, rr, gain };
  }, [side, capital, risk, entry, sl, tp]);

  const krakenUrl = "https://pro.kraken.com/app/trade";

  const field = (label, val, setter, ph) => (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">{label}</span>
      <input
        value={val}
        onChange={(e) => setter(e.target.value)}
        placeholder={ph}
        inputMode="decimal"
        className="mt-1.5 w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-3.5 py-2.5 text-bone placeholder:text-mist/40 font-mono text-[13.5px] outline-none transition-colors"
      />
    </label>
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-display text-[18px] text-bone">Préparer un ordre</h3>
        <span className="font-mono text-[9px] uppercase tracking-widest2 text-emerald-400 border border-emerald-500/30 rounded px-1.5 py-0.5">
          aucune exécution
        </span>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-5 items-start">
        {/* Formulaire */}
        <div className="rounded-2xl border hairline bg-ink-800/50 p-6">
          <div className="flex gap-2">
            {["long", "short"].map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                className={`flex-1 rounded-lg py-2.5 text-[13.5px] font-semibold transition-colors ${
                  side === s
                    ? s === "long"
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                      : "bg-rose-500/15 text-rose-300 border border-rose-500/40"
                    : "border border-white/10 text-mist hover:text-bone"
                }`}
              >
                {s === "long" ? "Achat / Long" : "Vente / Short"}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {field("Actif", asset, setAsset, "BTC/USD")}
            {field("Capital (€)", capital, setCapital, "10000")}
            {field("Risque / trade (%)", risk, setRisk, "1")}
            {field("Prix d'entrée", entry, setEntry, "61240")}
            {field("Stop-loss", sl, setSl, "59500")}
            {field("Objectif (TP)", tp, setTp, "65000")}
          </div>
        </div>

        {/* Ticket */}
        <div className="rounded-2xl border gold-line bg-ink-800/40 p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">
            Ticket — récapitulatif
          </div>

          {!calc ? (
            <p className="mt-4 text-[13.5px] text-mist">
              Renseignez au minimum capital, risque, entrée et stop-loss.
            </p>
          ) : calc.error ? (
            <p className="mt-4 text-[13.5px] text-rose-400/90">{calc.error}</p>
          ) : (
            <>
              <div className="mt-4 space-y-3">
                <Row label="Sens" value={side === "long" ? "Long" : "Short"} accent={side === "long" ? "emerald" : "rose"} />
                <Row label="Actif" value={asset || "—"} />
                <Row label="Montant risqué" value={`${fmt(calc.riskAmount)} €`} />
                <Row label="Taille de position" value={`${fmt(calc.units, 6)} u.`} />
                <Row label="Valeur notionnelle" value={`${fmt(calc.notional)} €`} />
                <Row label="Ratio R:R" value={calc.rr ? `1 : ${fmt(calc.rr)}` : "—"} />
                <Row label="Gain potentiel (au TP)" value={calc.gain ? `+${fmt(calc.gain)} €` : "—"} accent="emerald" />
              </div>

              <a
                href={krakenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[14.5px] font-semibold"
              >
                Passer l'ordre moi-même sur Kraken
                <IconArrow className="h-4 w-4" />
              </a>
            </>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-xl border hairline bg-white/[0.015] p-5">
        <h4 className="font-mono text-[10px] uppercase tracking-widest2 text-gold/70">
          Comment ça marche
        </h4>
        <p className="mt-2 text-[12.5px] leading-relaxed text-mist/80">
          Cet outil <span className="text-bone">calcule</span> une taille de position selon
          votre risque et <span className="text-bone">prépare</span> un ticket.{" "}
          <span className="text-bone">Aucun ordre n'est transmis</span> : l'exécution se fait
          exclusivement par vous, sur votre compte Kraken. Ceci n'est pas un conseil en
          investissement — tout placement comporte un risque de perte en capital.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, accent }) {
  const c = accent === "emerald" ? "text-emerald-400" : accent === "rose" ? "text-rose-400" : "text-bone";
  return (
    <div className="flex items-center justify-between text-[13.5px]">
      <span className="text-mist">{label}</span>
      <span className={`font-mono ${c}`}>{value}</span>
    </div>
  );
}
