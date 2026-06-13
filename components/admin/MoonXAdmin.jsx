"use client";

import { useState, useEffect, useCallback } from "react";
import { API_BASE } from "@/lib/site";

function fmtDate(s) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("fr-FR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return s; }
}
function fmtUsd(v) {
  if (v == null || v === "") return "—";
  const n = parseFloat(v);
  if (isNaN(n)) return v;
  return "$" + n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MoonXAdmin({ adminKey }) {
  const [status, setStatus]     = useState(null);
  const [email, setEmail]       = useState("");
  const [result, setResult]     = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError]       = useState("");

  // Credentials form
  const [showCreds, setShowCreds] = useState(false);
  const [credEmail, setCredEmail] = useState("");
  const [credPwd, setCredPwd]     = useState("");
  const [savingCreds, setSavingCreds] = useState(false);
  const [credsMsg, setCredsMsg]   = useState("");

  // Tableau complet
  const [allRegs, setAllRegs]     = useState(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [search, setSearch]       = useState("");
  const [sortField, setSortField] = useState("registrationDate");
  const [sortDir, setSortDir]     = useState("desc");

  const get = useCallback(async (path) => {
    const r = await fetch(`${API_BASE}${path}`, {
      headers: { "x-admin-key": adminKey }, cache: "no-store",
    });
    return r.json();
  }, [adminKey]);

  const post = useCallback(async (path, body) => {
    const r = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "x-admin-key": adminKey, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return r.json();
  }, [adminKey]);

  useEffect(() => {
    get("/api/admin/moonx/status").then(setStatus).catch(() => {});
  }, [get]);

  async function saveCreds(e) {
    e.preventDefault();
    setSavingCreds(true); setCredsMsg("");
    const r = await post("/api/admin/moonx/credentials", { email: credEmail, password: credPwd });
    setSavingCreds(false);
    if (r.ok) {
      setCredsMsg("✓ Connexion réussie — identifiants sauvegardés.");
      setShowCreds(false);
      get("/api/admin/moonx/status").then(setStatus);
    } else {
      setCredsMsg("Erreur : " + (r.error || "connexion échouée"));
    }
  }

  async function checkEmail(e) {
    e.preventDefault();
    const target = email.trim();
    if (!target) return;
    setChecking(true); setResult(null); setError("");
    const r = await get(`/api/admin/moonx/check?email=${encodeURIComponent(target)}`);
    setChecking(false);
    if (!r.ok) { setError(r.error || "Erreur API"); return; }
    setResult(r);
  }

  async function loadAll(force = false) {
    setLoadingAll(true);
    const r = await get(`/api/admin/moonx/registrations${force ? "?force=true" : ""}`);
    setLoadingAll(false);
    if (r.ok) setAllRegs(r);
    else setError(r.error || "Erreur chargement");
  }

  // Tableau filtré + trié
  const filtered = (() => {
    if (!allRegs?.registrations) return [];
    let rows = allRegs.registrations;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(r =>
        (r.email || "").toLowerCase().includes(q) ||
        (r.country || "").toLowerCase().includes(q) ||
        (r.status || "").toLowerCase().includes(q)
      );
    }
    rows = [...rows].sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  })();

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  }

  const STATUS_LABELS = {
    qualified: "Qualifié", validated: "Validé", partial: "Partiel",
    pending: "En attente", active: "Actif",
  };
  const statusLabel = (s) => STATUS_LABELS[(s || "").toLowerCase()] || s || "—";
  const statusColor = (s) => {
    if (!s) return "text-mist/40";
    const sl = s.toLowerCase();
    if (sl === "qualified" || sl.includes("valid") || sl === "active") return "text-emerald-400";
    if (sl.includes("partial")) return "text-amber-300";
    return "text-mist/60";
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-[20px] text-bone">MoonX — Registrations</h2>
          <p className="text-[12.5px] text-mist/60 mt-0.5">
            Vérification d'un email sur le programme de partenariat MoonX.io
          </p>
        </div>
        <div className="flex items-center gap-2">
          {status?.configured && (
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              ● Connecté · {status.email}
            </span>
          )}
          <button onClick={() => setShowCreds(v => !v)}
            className="btn-ghost rounded-xl px-3 py-2 text-[12px]">
            {showCreds ? "Annuler" : (status?.configured ? "Changer identifiants" : "Configurer")}
          </button>
        </div>
      </div>

      {/* Credentials form */}
      {showCreds && (
        <form onSubmit={saveCreds}
          className="mb-5 rounded-2xl border gold-line bg-gold/[0.04] p-5 space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80 mb-1">
            Identifiants compte partenaire MoonX.io
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-mist/60 mb-1">Email MoonX</label>
              <input value={credEmail} onChange={e => setCredEmail(e.target.value)}
                type="email" required placeholder="partner@email.com"
                className="w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-3.5 py-2.5 text-bone text-[13px] outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-mist/60 mb-1">Mot de passe</label>
              <input value={credPwd} onChange={e => setCredPwd(e.target.value)}
                type="password" required placeholder="••••••••"
                className="w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-3.5 py-2.5 text-bone text-[13px] outline-none" />
            </div>
          </div>
          {credsMsg && (
            <p className={`text-[12.5px] ${credsMsg.startsWith("✓") ? "text-emerald-400" : "text-rose-400"}`}>
              {credsMsg}
            </p>
          )}
          <button type="submit" disabled={savingCreds}
            className="btn-gold rounded-xl px-5 py-2.5 text-[13px] font-semibold disabled:opacity-50">
            {savingCreds ? "Connexion…" : "Enregistrer & tester"}
          </button>
        </form>
      )}

      {!status?.configured && !showCreds && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] p-5 mb-5 text-[13px] text-amber-200/90">
          Configurez vos identifiants MoonX partenaire pour activer la vérification.
        </div>
      )}

      {status?.configured && (
        <>
          {/* Recherche email individuel */}
          <div className="rounded-2xl border hairline bg-ink-800/50 p-5 mb-5">
            <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60 mb-3">
              Vérifier un email
            </div>
            <form onSubmit={checkEmail} className="flex gap-2">
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="text"
                placeholder="nacim, nacim@gmail.com…"
                className="flex-1 min-w-0 rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-3.5 py-2.5 text-bone placeholder:text-mist/40 text-[13px] font-mono outline-none"
              />
              <button type="submit" disabled={checking || !email.trim()}
                className="btn-gold rounded-xl px-5 py-2.5 text-[13px] font-semibold disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
                {checking ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Recherche…
                  </>
                ) : "Rechercher"}
              </button>
            </form>

            {error && (
              <p className="mt-3 text-[12.5px] text-rose-400">{error}</p>
            )}

            {result && !result.found && !result.multiple && (
              <div className="mt-4 rounded-xl border border-white/10 bg-ink-900/60 p-4 flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                <div>
                  <div className="font-semibold text-bone text-[13.5px]">Email non trouvé</div>
                  <div className="text-[12px] text-mist/60 mt-0.5">
                    Cet email n'est pas enregistré parmi les {result.total_searched} affiliés MoonX.
                  </div>
                </div>
              </div>
            )}

            {result?.multiple && result.suggestions?.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
                <div className="font-semibold text-bone text-[13px] mb-2">
                  Plusieurs correspondances — précisez l'email :
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.suggestions.map(s => (
                    <button key={s} onClick={() => { setEmail(s); setResult(null); }}
                      className="font-mono text-[12px] px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-200 hover:bg-amber-500/10">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {result?.found && (
              <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="font-semibold text-bone text-[14px]">{result.email}</span>
                  <span className={`ml-auto text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                    statusColor(result.status) === "text-emerald-400"
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                      : statusColor(result.status) === "text-amber-300"
                        ? "border-amber-500/30 text-amber-300 bg-amber-500/10"
                        : "border-white/10 text-mist/50 bg-white/5"
                  }`}>
                    {statusLabel(result.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Date d'inscription", value: fmtDate(result.registration_date) },
                    { label: "Premier dépôt",      value: fmtUsd(result.first_deposit) },
                    { label: "Dépôts total",        value: fmtUsd(result.deposits) },
                    { label: "Dépôts nets",         value: fmtUsd(result.net_deposits) },
                    { label: "Commission",          value: fmtUsd(result.commission) },
                    { label: "Pays",               value: result.country || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg bg-ink-900/60 p-3">
                      <div className="text-[9.5px] font-mono uppercase tracking-widest2 text-mist/50 mb-1">{label}</div>
                      <div className="text-[13.5px] font-semibold text-bone">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tableau complet */}
          <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60">
                Toutes les registrations
                {allRegs && <span className="ml-2 text-bone">{allRegs.count} affiliés</span>}
                {allRegs?.cached_at && (
                  <span className="ml-2 text-mist/40">
                    · mis à jour {Math.round((Date.now() / 1000 - allRegs.cached_at) / 60)} min ago
                  </span>
                )}
              </span>
              <div className="flex gap-2">
                {allRegs && (
                  <button onClick={() => loadAll(true)} disabled={loadingAll}
                    className="btn-ghost rounded-xl px-3 py-1.5 text-[12px]">
                    ↻ Forcer actualisation
                  </button>
                )}
                <button onClick={() => loadAll(false)} disabled={loadingAll}
                  className="btn-gold rounded-xl px-4 py-1.5 text-[12px] font-semibold disabled:opacity-50">
                  {loadingAll ? "Chargement…" : (allRegs ? "Actualiser" : "Charger la liste")}
                </button>
              </div>
            </div>

            {allRegs && (
              <>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filtrer par email, pays, statut…"
                  className="w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-3.5 py-2.5 text-bone placeholder:text-mist/40 text-[13px] outline-none mb-3"
                />
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-[12.5px] font-mono">
                    <thead>
                      <tr className="text-left text-mist/50 text-[10px] uppercase tracking-widest2 border-b hairline">
                        {[
                          { field: "email",            label: "Email" },
                          { field: "registrationDate", label: "Inscription" },
                          { field: "firstDeposit",     label: "1er dépôt" },
                          { field: "deposits",         label: "Dépôts" },
                          { field: "status",           label: "Statut" },
                          { field: "country",          label: "Pays" },
                          { field: "commission",       label: "Commission" },
                        ].map(({ field, label }) => (
                          <th key={field}
                            className="py-2 pr-4 cursor-pointer hover:text-bone transition-colors select-none"
                            onClick={() => toggleSort(field)}>
                            {label}
                            {sortField === field && (
                              <span className="ml-1 text-gold">{sortDir === "asc" ? "↑" : "↓"}</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 && (
                        <tr><td colSpan={7} className="py-6 text-center text-mist/40">Aucun résultat.</td></tr>
                      )}
                      {filtered.map((r, i) => (
                        <tr key={i} className="border-b hairline last:border-0 hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 pr-4 text-bone max-w-[200px] truncate">{r.email || "—"}</td>
                          <td className="py-2.5 pr-4 text-mist/70 whitespace-nowrap">{fmtDate(r.registrationDate)}</td>
                          <td className="py-2.5 pr-4 tabular-nums">
                            {r.firstDeposit > 0
                              ? <span className="text-emerald-400">{fmtUsd(r.firstDeposit)}</span>
                              : <span className="text-mist/40">—</span>}
                          </td>
                          <td className="py-2.5 pr-4 tabular-nums text-mist/70">{fmtUsd(r.deposits)}</td>
                          <td className={`py-2.5 pr-4 ${statusColor(r.status)}`}>{r.status || "—"}</td>
                          <td className="py-2.5 pr-4 text-mist/60">{r.country || "—"}</td>
                          <td className="py-2.5 tabular-nums text-mist/70">{fmtUsd(r.commission)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filtered.length < (allRegs?.count || 0) && (
                  <p className="mt-2 text-[11px] text-mist/40 text-right">
                    Affichage : {filtered.length} / {allRegs.count}
                  </p>
                )}
              </>
            )}

            {!allRegs && !loadingAll && (
              <p className="text-[13px] text-mist/50 text-center py-6">
                Cliquez sur "Charger la liste" pour afficher tous les affiliés.
              </p>
            )}
            {loadingAll && (
              <div className="text-center py-8">
                <svg className="animate-spin h-6 w-6 text-gold mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <p className="mt-2 text-[12.5px] text-mist/50">Récupération depuis MoonX…</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
