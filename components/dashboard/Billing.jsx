"use client";

import { useEffect, useState } from "react";
import { apiBilling } from "@/lib/clientStore";
import { useUnlock } from "@/components/dashboard/UnlockProvider";
import { IconArrow } from "@/components/Icons";

const fmtDate = (sec) =>
  !sec ? "—" : new Date(Number(sec) * 1000).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
const fmtUsd = (n) =>
  n == null ? "—" : Number(n).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $";
const daysLeft = (sec) => Math.max(0, Math.ceil((Number(sec) * 1000 - Date.now()) / 86400000));

export default function Billing() {
  const { openUnlock } = useUnlock();
  const [b, setB] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    apiBilling().then((r) => { if (alive) setB(r); });
    return () => { alive = false; };
  }, []);

  if (b === null)
    return (
      <div>
        <h3 className="font-display text-[18px] text-bone mb-4">Facturation</h3>
        <div className="text-[13px] text-mist/60">Chargement…</div>
      </div>
    );

  const access = b.access || {};
  const wallet = b.wallet || {};
  const copy = b.copy || {};
  const invoices = copy.invoices || [];
  const has = access.has_access;
  const isSub = access.source === "abonnement";
  const statusLabel = !has
    ? "Accès verrouillé"
    : isSub
    ? "Abonnement actif"
    : "Accès 3 mois offert";
  const statusColor = !has ? "text-rose-400" : "text-emerald-400";

  function copyAddr() {
    if (!wallet.deposit_address) return;
    try {
      navigator.clipboard.writeText(wallet.deposit_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <div>
      <h3 className="font-display text-[18px] text-bone mb-4">Facturation</h3>

      {/* Statut d'accès */}
      <div className="rounded-2xl border gold-line bg-gold/[0.04] p-5 mb-5">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">Statut d'accès</span>
        <div className="mt-2 flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${has ? "bg-emerald-400" : "bg-rose-400"}`} />
          <span className={`font-display text-[22px] ${statusColor}`}>{statusLabel}</span>
        </div>
        {has ? (
          <p className="mt-2 text-[13px] text-mist">
            {isSub ? "Abonnement" : "Accès offert"} valable jusqu'au{" "}
            <span className="text-bone">{fmtDate(access.access_until)}</span>
            <span className="text-mist/60"> ({daysLeft(access.access_until)} jours restants)</span>.
          </p>
        ) : (
          <>
            <p className="mt-2 text-[13px] text-mist">
              Aucun accès actif. Débloquez via votre IIBAN Kraken (3 mois offerts) ou un abonnement
              de {fmtUsd(b.price_usd)} / {b.days} jours.
            </p>
            <button onClick={openUnlock}
              className="btn-gold mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold">
              Débloquer l'accès <IconArrow className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Wallet dédié */}
      <div className="rounded-2xl border hairline bg-ink-800/50 p-5 mb-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">
            Mon wallet de dépôt dédié
          </span>
          <span className="font-display text-[20px] text-bone">
            Solde : <span className={wallet.balance > 0 ? "text-emerald-400" : "text-bone"}>{fmtUsd(wallet.balance)}</span>
          </span>
        </div>
        <p className="mt-2 text-[12.5px] leading-relaxed text-mist">
          Déposez des fonds en <span className="text-bone">{wallet.network || "USDT (TRC-20)"}</span> sur
          cette adresse unique. Le solde sert à régler votre <b>abonnement</b> et vos{" "}
          <b>factures de copy-trading</b>.
        </p>
        {wallet.deposit_address ? (
          <div className="mt-3 flex items-stretch gap-2">
            <code className="flex-1 min-w-0 rounded-lg bg-ink-900 border border-white/10 px-3.5 py-2.5 font-mono text-[12.5px] text-bone break-all">
              {wallet.deposit_address}
            </code>
            <button onClick={copyAddr}
              className="btn-ghost shrink-0 rounded-lg px-4 text-[12.5px] font-semibold">
              {copied ? "Copié ✓" : "Copier"}
            </button>
          </div>
        ) : (
          <p className="mt-3 text-[12.5px] text-mist/60">Adresse de dépôt en cours de génération…</p>
        )}
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[11.5px] text-mist">
          {b.fee_due > 0 && (
            <span className="text-amber-300/90">Factures dues : <b>{fmtUsd(b.fee_due)}</b></span>
          )}
          {copy.next_bill_ts && (
            <span>Prochaine facturation copy : <span className="text-bone">{fmtDate(copy.next_bill_ts)}</span></span>
          )}
        </div>
        <p className="mt-2 text-[10.5px] leading-relaxed text-mist/50">
          ⚠️ N'envoyez que de l'USDT sur le réseau TRC-20 (Tron). Tout autre actif/réseau serait perdu.
        </p>
      </div>

      {/* Factures copy-auto */}
      <div className="rounded-2xl border hairline bg-ink-800/40 overflow-hidden">
        <div className="px-5 py-3 border-b hairline">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">
            Factures copy-trading — détail par période
          </span>
        </div>
        {invoices.length === 0 ? (
          <p className="px-5 py-5 text-[13px] text-mist/60">
            Aucune facture pour l'instant. Les frais de performance copy-trading apparaîtront ici,
            période par période.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-[13px]">
              <thead>
                <tr className="text-left font-mono text-[10px] uppercase tracking-widest2 text-mist/60 border-b hairline">
                  <th className="px-4 py-3">Période</th>
                  <th className="px-4 py-3 text-right">Gains</th>
                  <th className="px-4 py-3 text-right">Taux</th>
                  <th className="px-4 py-3 text-right">Frais</th>
                  <th className="px-4 py-3 text-right">Payé</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((iv, i) => (
                  <tr key={i} className="border-b hairline last:border-0">
                    <td className="px-4 py-3 text-bone">
                      {fmtDate(iv.period_start)} → {fmtDate(iv.period_end)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-mist">{fmtUsd(iv.profit)}</td>
                    <td className="px-4 py-3 text-right font-mono text-mist">{Math.round((iv.rate || 0) * 100)} %</td>
                    <td className="px-4 py-3 text-right font-mono text-bone">{fmtUsd(iv.fee)}</td>
                    <td className="px-4 py-3 text-right font-mono text-mist">{fmtUsd(iv.paid)}</td>
                    <td className="px-4 py-3">
                      {iv.status === "paid" ? (
                        <span className="text-emerald-400">payée</span>
                      ) : iv.status === "partial" ? (
                        <span className="text-amber-300/90">partielle</span>
                      ) : (
                        <span className="text-rose-400/90">due</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-mist/50">
        Les frais de copy-trading sont prélevés sur les gains réalisés (high-water mark) et débités de
        votre wallet. Aucun conseil en investissement.
      </p>
    </div>
  );
}
