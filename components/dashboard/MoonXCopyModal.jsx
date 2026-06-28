"use client";

import { useState, useEffect, useRef } from "react";
import { API_BASE } from "@/lib/site";
import { IconArrow } from "@/components/Icons";

const MOONX_REF_URL   = "https://moonx.io/ref/JULIEN";
const MIN_DEPOSIT     = 500;

function Step({ n, active, done, children }) {
  return (
    <div className={`flex gap-3 transition-opacity ${(!active && !done) ? "opacity-40" : ""}`}>
      <div className={`shrink-0 mt-0.5 h-6 w-6 rounded-full border flex items-center justify-center text-[11px] font-bold ${
        done ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
             : active ? "bg-gold/15 border-gold/50 text-gold"
             : "border-white/15 text-mist/40"
      }`}>
        {done ? "✓" : n}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export default function MoonXCopyModal({ open, onClose }) {
  const [email, setEmail]       = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult]     = useState(null); // null | {found, has_deposit, deposit_amount}
  const [apiError, setApiError] = useState("");
  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (open) {
      setEmail(""); setResult(null); setApiError(""); setChecking(false);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function checkEmail(e) {
    e.preventDefault();
    const addr = email.trim().toLowerCase();
    if (!addr || !addr.includes("@")) return;
    setChecking(true); setResult(null); setApiError("");
    try {
      const r = await fetch(
        `${API_BASE}/api/moonx/verify-registration?email=${encodeURIComponent(addr)}`,
        { cache: "no-store" }
      ).then((r) => r.json());
      if (r.ok) setResult(r);
      else setApiError(r.error === "moonx_unavailable" ? "Service MoonX momentanément indisponible." : "Erreur de vérification.");
    } catch {
      setApiError("Impossible de joindre le serveur.");
    }
    setChecking(false);
  }

  /* ── État du parcours ── */
  const step1done = !!result;
  const step2done = result?.found;
  const step3done = result?.has_deposit;

  const depositPct = result?.found && !result.has_deposit
    ? Math.min(100, Math.round((result.deposit_amount / MIN_DEPOSIT) * 100))
    : 0;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-[520px] rounded-3xl border gold-line bg-ink-900 shadow-[0_32px_80px_-8px_rgba(0,0,0,0.8)] overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b hairline">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">Copy Auto · MoonX Forex</span>
            </div>
            <h2 className="font-display text-[22px] text-bone leading-tight">Rejoindre le copy auto</h2>
            <p className="text-[12.5px] text-mist/70 mt-1">Répliquez les trades de Julien en temps réel sur MoonX.</p>
          </div>
          <button onClick={onClose} className="shrink-0 ml-4 mt-1 grid place-items-center h-8 w-8 rounded-full border border-white/10 text-mist/60 hover:text-bone hover:border-white/25 transition-colors text-[16px]">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Étape 1 : S'inscrire */}
          <Step n="1" active={!step1done} done={step1done}>
            <p className="text-[13.5px] font-semibold text-bone mb-1">Créez votre compte MoonX</p>
            <p className="text-[12.5px] text-mist/70 mb-3 leading-relaxed">
              Inscrivez-vous via le lien de parrainage de Julien pour être rattaché à son réseau copy auto.
            </p>
            <a
              href={MOONX_REF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gold text-ink-900 font-semibold text-[13px] px-5 py-2.5 hover:bg-gold-soft transition-colors"
            >
              S'inscrire sur MoonX <IconArrow className="h-3.5 w-3.5" />
            </a>
            <p className="mt-2 text-[11px] text-mist/40 font-mono">{MOONX_REF_URL}</p>
          </Step>

          {/* Étape 2 : Vérifier l'email */}
          <Step n="2" active={!step2done} done={step2done}>
            <p className="text-[13.5px] font-semibold text-bone mb-1">Confirmez votre inscription</p>
            <p className="text-[12.5px] text-mist/70 mb-3 leading-relaxed">
              Entrez l'email avec lequel vous vous êtes inscrit sur MoonX.
            </p>
            <form onSubmit={checkEmail} className="flex gap-2">
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setResult(null); setApiError(""); }}
                placeholder="votre@email.com"
                disabled={checking}
                className="flex-1 min-w-0 rounded-xl bg-ink-800 border border-white/10 focus:border-gold/50 px-3.5 py-2.5 text-bone placeholder:text-mist/40 text-[13px] outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={checking || !email.trim()}
                className="btn-gold rounded-xl px-4 py-2.5 text-[13px] font-semibold disabled:opacity-50 shrink-0 flex items-center gap-1.5"
              >
                {checking ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : "Vérifier"}
              </button>
            </form>

            {apiError && (
              <p className="mt-2 text-[12px] text-rose-400">{apiError}</p>
            )}

            {/* Résultat vérification */}
            {result && !result.found && (
              <div className="mt-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 p-3.5">
                <p className="text-[12.5px] text-amber-200 font-medium">Email non trouvé sur MoonX</p>
                <p className="text-[12px] text-mist/70 mt-1 leading-relaxed">
                  Cet email n'est pas encore enregistré dans notre réseau affilié. Assurez-vous d'avoir utilisé le lien de parrainage ci-dessus lors de votre inscription, puis réessayez.
                </p>
              </div>
            )}

            {result?.found && (
              <div className="mt-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 p-3 flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-[12.5px] text-emerald-300">Compte trouvé — bienvenue dans le réseau Julien !</p>
              </div>
            )}
          </Step>

          {/* Étape 3 : Dépôt minimum */}
          {result?.found && (
            <Step n="3" active={!step3done} done={step3done}>
              <p className="text-[13.5px] font-semibold text-bone mb-1">
                {step3done ? "Dépôt minimum atteint ✓" : `Déposez minimum ${MIN_DEPOSIT}$ sur MoonX`}
              </p>

              {!step3done ? (
                <>
                  <p className="text-[12.5px] text-mist/70 mb-3 leading-relaxed">
                    Un dépôt de <span className="text-bone font-semibold">{MIN_DEPOSIT}$</span> minimum est requis pour activer le copy auto et accéder au groupe VIP Pôle Trading.
                  </p>

                  {/* Barre de progression */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[11px] font-mono text-mist/60 mb-1.5">
                      <span>Dépôt actuel : <span className="text-bone">${result.deposit_amount?.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) ?? "0"}</span></span>
                      <span>Objectif : <span className="text-bone">${MIN_DEPOSIT}</span></span>
                    </div>
                    <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold/70 transition-all duration-500"
                        style={{ width: `${depositPct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-mist/50 font-mono">
                      Il reste <span className="text-amber-300">${Math.max(0, MIN_DEPOSIT - (result.deposit_amount ?? 0)).toLocaleString("fr-FR", { maximumFractionDigits: 0 })}</span> à déposer.
                    </p>
                  </div>

                  <div className="rounded-xl bg-ink-800/60 border border-white/8 p-3.5 space-y-2 text-[12.5px] text-mist/80 leading-relaxed">
                    <p className="font-semibold text-bone text-[13px]">Comment déposer sur MoonX :</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-mist/70">
                      <li>Connectez-vous sur <a href="https://moonx.io" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">moonx.io</a></li>
                      <li>Rendez-vous dans <b className="text-bone">Wallet → Dépôt</b></li>
                      <li>Sélectionnez votre méthode de dépôt (crypto ou virement)</li>
                      <li>Effectuez un dépôt d'au moins <b className="text-bone">${MIN_DEPOSIT}</b></li>
                    </ol>
                    <p className="text-[11.5px] text-mist/50 mt-2">
                      Une fois le dépôt confirmé, actualisez la vérification ci-dessus.
                    </p>
                  </div>
                </>
              ) : (
                /* ── Accès accordé ── */
                <div className="space-y-3">
                  <p className="text-[12.5px] text-mist/70 leading-relaxed">
                    Vous remplissez toutes les conditions. Voici comment rejoindre le copy auto et le groupe VIP :
                  </p>

                  {/* Procédure copy auto */}
                  <div className="rounded-xl bg-ink-800/60 border border-white/8 p-4 space-y-3 text-[12.5px]">
                    <p className="font-semibold text-bone text-[13px]">Procédure d'activation copy auto :</p>
                    <ol className="list-decimal list-inside space-y-2 text-mist/80 leading-relaxed">
                      <li>Connectez-vous sur <a href="https://moonx.io" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">moonx.io</a></li>
                      <li>Allez dans <b className="text-bone">Copy Trading</b> depuis le menu</li>
                      <li>Recherchez <b className="text-bone">Julien M.</b> dans la liste des traders</li>
                      <li>Cliquez <b className="text-bone">Copier</b> et définissez votre montant alloué</li>
                      <li>La réplication de trades démarre automatiquement</li>
                    </ol>
                  </div>

                  {/* Accès VIP Telegram */}
                  <div className="rounded-xl bg-gold/[0.06] border gold-line p-4">
                    <p className="text-[12.5px] font-semibold text-bone mb-1">Accès groupe VIP Pôle Trading</p>
                    <p className="text-[12px] text-mist/70 mb-3 leading-relaxed">
                      Contactez Julien directement sur Telegram en mentionnant votre email MoonX pour recevoir votre invitation au groupe privé.
                    </p>
                    <a
                      href="https://t.me/cyclepartners?text=Bonjour%20Julien%2C%20je%20viens%20de%20m%27inscrire%20sur%20MoonX%20et%20j%27ai%20effectu%C3%A9%20mon%20d%C3%A9p%C3%B4t.%20Je%20souhaite%20rejoindre%20le%20copy%20auto%20et%20le%20groupe%20VIP."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-gold text-ink-900 font-semibold text-[13px] px-5 py-2.5 hover:bg-gold-soft transition-colors"
                    >
                      Contacter Julien sur Telegram <IconArrow className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </Step>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t hairline flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px] text-mist/40 leading-relaxed">
            Copy auto sur MoonX · Forex · À titre éducatif, ne constitue pas un conseil en investissement.
          </p>
          <button onClick={onClose}
            className="btn-ghost rounded-full px-4 py-2 text-[12.5px]">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
