"use client";

import { useState, useEffect, useCallback } from "react";
import { API_BASE } from "@/lib/site";

const fmtUsd = (v) => v == null ? "—" : "$" + Number(v).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtCrypto = (v, d = 4) => v == null ? "—" : Number(v).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: d });

export default function SweepAdmin({ adminKey }) {
  const [addrs, setAddrs]       = useState({ trc20: "", bep20: "" });
  const [editing, setEditing]   = useState(false);
  const [addrForm, setAddrForm] = useState({ trc20: "", bep20: "" });
  const [savingAddr, setSavingAddr] = useState(false);
  const [addrMsg, setAddrMsg]   = useState("");

  const [status, setStatus]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [sweeping, setSweeping] = useState({}); // email+network → "pending"|"ok"|"error"
  const [results, setResults]   = useState({});  // email+network → {txid, error}

  const h = useCallback(() => ({
    "x-admin-key": adminKey, "Content-Type": "application/json",
  }), [adminKey]);

  // Charge les adresses de réception configurées
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/sweep/addresses`, { headers: h(), cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (d.ok) { setAddrs(d); setAddrForm({ trc20: d.trc20, bep20: d.bep20 }); } })
      .catch(() => {});
  }, [h]);

  async function saveAddresses(e) {
    e.preventDefault();
    setSavingAddr(true); setAddrMsg("");
    const r = await fetch(`${API_BASE}/api/admin/sweep/addresses`, {
      method: "POST", headers: h(), body: JSON.stringify(addrForm),
    }).then((r) => r.json()).catch(() => ({ error: "network" }));
    setSavingAddr(false);
    if (r.ok) {
      setAddrs({ ...addrForm });
      setAddrMsg("✓ Adresses sauvegardées.");
      setEditing(false);
    } else {
      setAddrMsg("Erreur : " + (r.error || "inconnue"));
    }
  }

  async function loadStatus() {
    setLoading(true);
    const r = await fetch(`${API_BASE}/api/admin/sweep/status`, { headers: h(), cache: "no-store" })
      .then((r) => r.json()).catch(() => null);
    setLoading(false);
    if (r?.ok) setStatus(r);
  }

  async function doSweep(email, network) {
    const key = `${email}:${network}`;
    setSweeping((s) => ({ ...s, [key]: "pending" }));
    setResults((r) => { const n = { ...r }; delete n[key]; return n; });
    const res = await fetch(`${API_BASE}/api/admin/sweep/execute`, {
      method: "POST", headers: h(),
      body: JSON.stringify({ email, network }),
    }).then((r) => r.json()).catch(() => ({ error: "network" }));
    setSweeping((s) => ({ ...s, [key]: res.ok ? "ok" : "error" }));
    setResults((r) => ({ ...r, [key]: res }));
    // Refresh status après sweep
    if (res.ok) setTimeout(loadStatus, 3000);
  }

  const configured = addrs.trc20 || addrs.bep20;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-[20px] text-bone">Sweep — Récupération des fonds</h2>
        <p className="text-[12.5px] text-mist/60 mt-0.5">
          Seuls les montants facturés (abonnement + copy fees) sont transférables. Le crédit non consommé reste intouchable.
        </p>
      </div>

      {/* Adresses de réception */}
      <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60">Mes adresses de réception</span>
          <button onClick={() => { setEditing((v) => !v); setAddrMsg(""); }}
            className="btn-ghost rounded-xl px-3 py-1.5 text-[12px]">
            {editing ? "Annuler" : (configured ? "Modifier" : "Configurer")}
          </button>
        </div>

        {!editing && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-red-400 uppercase w-14 shrink-0">TRC-20</span>
              <code className="text-[12px] text-bone font-mono break-all">{addrs.trc20 || <span className="text-mist/40">Non configuré</span>}</code>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-yellow-400 uppercase w-14 shrink-0">BEP-20</span>
              <code className="text-[12px] text-bone font-mono break-all">{addrs.bep20 || <span className="text-mist/40">Non configuré</span>}</code>
            </div>
          </div>
        )}

        {editing && (
          <form onSubmit={saveAddresses} className="space-y-3">
            <div>
              <label className="block text-[11px] text-mist/60 mb-1">
                Adresse réception <span className="text-red-400">USDT TRC-20</span> (commence par T…)
              </label>
              <input value={addrForm.trc20} onChange={(e) => setAddrForm((f) => ({ ...f, trc20: e.target.value }))}
                placeholder="TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"
                className="w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-3.5 py-2.5 font-mono text-[12.5px] text-bone outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-mist/60 mb-1">
                Adresse réception <span className="text-yellow-400">USDC BEP-20</span> (commence par 0x…)
              </label>
              <input value={addrForm.bep20} onChange={(e) => setAddrForm((f) => ({ ...f, bep20: e.target.value }))}
                placeholder="0xAbCd…"
                className="w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-3.5 py-2.5 font-mono text-[12.5px] text-bone outline-none" />
            </div>
            {addrMsg && (
              <p className={`text-[12.5px] ${addrMsg.startsWith("✓") ? "text-emerald-400" : "text-rose-400"}`}>{addrMsg}</p>
            )}
            <button type="submit" disabled={savingAddr}
              className="btn-gold rounded-xl px-5 py-2.5 text-[13px] font-semibold disabled:opacity-50">
              {savingAddr ? "Sauvegarde…" : "Enregistrer"}
            </button>
          </form>
        )}
      </div>

      {/* Tableau des sweepables */}
      <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60">
            Fonds récupérables
            {status && (
              <span className="ml-2 text-mist/40 normal-case">
                · {status.users.length} user{status.users.length !== 1 ? "s" : ""} · actualisé il y a {Math.round((Date.now() / 1000 - status.ts) / 60)} min
              </span>
            )}
          </span>
          <button onClick={loadStatus} disabled={loading}
            className="btn-gold rounded-xl px-4 py-1.5 text-[12px] font-semibold disabled:opacity-50">
            {loading ? "Chargement…" : (status ? "↻ Actualiser" : "Charger")}
          </button>
        </div>

        {!status && !loading && (
          <p className="text-[13px] text-mist/50 text-center py-8">
            Cliquez sur "Charger" pour interroger les balances on-chain.
          </p>
        )}

        {status && status.users.length === 0 && (
          <p className="text-[13px] text-mist/50 text-center py-8">
            Aucun montant récupérable pour l'instant.
          </p>
        )}

        {status && status.users.length > 0 && (
          <div className="space-y-4">
            {status.users.map((u) => (
              <div key={u.email} className="rounded-xl border border-white/8 bg-ink-900/50 p-4">
                <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                  <span className="font-mono text-[12px] text-bone">{u.email}</span>
                  <span className="text-[11px] text-mist/50">
                    Crédit restant (ne pas toucher) : <span className="text-amber-300">{fmtUsd(u.fee_balance)}</span>
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {/* TRC-20 */}
                  <NetworkSweepCard
                    network="trc20"
                    label="USDT TRC-20 · Tron"
                    color="text-red-400"
                    addrLabel="Adresse Tron"
                    address={u.trc20.address}
                    tokenBalance={u.trc20.usdt}
                    tokenSymbol="USDT"
                    gasBalance={u.trc20.trx}
                    gasSymbol="TRX"
                    sweepable={u.trc20.sweepable}
                    hasGas={u.trc20.has_gas}
                    minGas={u.trc20.min_gas}
                    toAddr={addrs.trc20}
                    sweepState={sweeping[`${u.email}:trc20`]}
                    result={results[`${u.email}:trc20`]}
                    onSweep={() => doSweep(u.email, "trc20")}
                  />
                  {/* BEP-20 */}
                  <NetworkSweepCard
                    network="bep20"
                    label="USDC BEP-20 · BSC"
                    color="text-yellow-400"
                    addrLabel="Adresse BSC"
                    address={u.bep20.address}
                    tokenBalance={u.bep20.usdc}
                    tokenSymbol="USDC"
                    gasBalance={u.bep20.bnb}
                    gasSymbol="BNB"
                    sweepable={u.bep20.sweepable}
                    hasGas={u.bep20.has_gas}
                    minGas={u.bep20.min_gas}
                    toAddr={addrs.bep20}
                    sweepState={sweeping[`${u.email}:bep20`]}
                    result={results[`${u.email}:bep20`]}
                    onSweep={() => doSweep(u.email, "bep20")}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NetworkSweepCard({
  network, label, color, addrLabel, address,
  tokenBalance, tokenSymbol, gasBalance, gasSymbol,
  sweepable, hasGas, minGas, toAddr,
  sweepState, result, onSweep,
}) {
  const [copied, setCopied] = useState(false);
  const hasSweepable = sweepable > 0;

  function copyAddr() {
    if (!address) return;
    navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={`rounded-lg border p-3 space-y-2 ${hasSweepable ? "border-white/15 bg-ink-800/40" : "border-white/5 bg-ink-900/30 opacity-60"}`}>
      <div className={`font-mono text-[10px] uppercase tracking-widest2 ${color}`}>{label}</div>

      {/* Balance on-chain */}
      <div className="flex justify-between text-[12px]">
        <span className="text-mist/60">Balance on-chain</span>
        <span className="text-bone font-mono">{fmtCrypto(tokenBalance)} {tokenSymbol}</span>
      </div>

      {/* Gas */}
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-mist/60">Gas ({gasSymbol})</span>
        <span className={`font-mono ${hasGas ? "text-emerald-400" : "text-rose-400"}`}>
          {fmtCrypto(gasBalance, 6)} {gasSymbol}
          {!hasGas && <span className="ml-1 text-[10px]">(min {minGas})</span>}
        </span>
      </div>

      {/* Sweepable */}
      <div className="flex justify-between text-[12px] border-t border-white/8 pt-2 mt-2">
        <span className="text-mist/60">Récupérable</span>
        <span className={`font-semibold font-mono ${hasSweepable ? "text-emerald-400" : "text-mist/40"}`}>
          {fmtUsd(sweepable)}
        </span>
      </div>

      {/* Adresse + gas manquant */}
      {hasSweepable && !hasGas && address && (
        <div className="rounded-lg bg-amber-500/[0.08] border border-amber-500/20 p-2.5 space-y-1.5">
          <p className="text-[11px] text-amber-200/80">
            Envoyez ≥ {minGas} {gasSymbol} sur cette adresse pour payer les frais, puis cliquez "Fees envoyés" :
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 text-[10.5px] font-mono text-amber-100 break-all">{address}</code>
            <button onClick={copyAddr} className="shrink-0 text-[10px] font-mono text-amber-300 border border-amber-500/30 rounded px-2 py-1 hover:bg-amber-500/10">
              {copied ? "✓" : "Copier"}
            </button>
          </div>
          <button onClick={onSweep} disabled={sweepState === "pending" || !toAddr}
            className="w-full rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 text-[12px] font-semibold py-2 hover:bg-amber-500/20 disabled:opacity-50 transition-colors">
            {sweepState === "pending" ? "Transfert en cours…" : "✓ Fees envoyés — tenter le sweep"}
          </button>
        </div>
      )}

      {/* Bouton sweep normal */}
      {hasSweepable && hasGas && (
        <button onClick={onSweep}
          disabled={sweepState === "pending" || !toAddr}
          className="w-full rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[12px] font-semibold py-2 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors">
          {sweepState === "pending" ? "Transfert en cours…" : `Sweeper ${fmtUsd(sweepable)} →`}
        </button>
      )}

      {!toAddr && hasSweepable && (
        <p className="text-[11px] text-rose-400/80">Configurez votre adresse de réception {network.toUpperCase()} ci-dessus.</p>
      )}

      {/* Résultat */}
      {result && (
        <div className={`rounded-lg px-3 py-2 text-[11.5px] break-all ${result.ok ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300" : "bg-rose-500/10 border border-rose-500/20 text-rose-300"}`}>
          {result.ok ? (
            <>✓ Sweep OK — txid : <span className="font-mono text-[10px]">{result.txid}</span></>
          ) : (
            <>✗ {result.error}{result.detail ? ` — ${result.detail}` : ""}</>
          )}
        </div>
      )}
    </div>
  );
}
