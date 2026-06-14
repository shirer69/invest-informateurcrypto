"use client";

import { useState } from "react";
import { REFERRAL_CODES } from "@/lib/site";
import { apiSignup, apiLogin, apiCheckCode, apiAccessCode, apiSendPassword } from "@/lib/clientStore";
import { IconArrow } from "@/components/Icons";

/**
 * Tunnel d'entrée (mini-app / accès direct au dashboard) : code d'invitation →
 * inscription (prénom + email + mot de passe).
 *
 * Props :
 *   skipCode  {boolean}  — si true, saute l'étape code (ex: utilisateur Telegram déjà identifié)
 *   tgName    {string}   — prénom pré-rempli depuis Telegram
 */
export default function SignupGate({ onDone, onSkip, onLogin, skipCode = false, tgName = "", title, noPassword = false }) {
  const [unlocked, setUnlocked]   = useState(skipCode); // skip direct si Telegram
  const [code, setCode]           = useState("");
  const [codeErr, setCodeErr]     = useState(false);

  const [firstName, setFirstName] = useState(tgName);
  const [email, setEmail]         = useState("");
  const [pwd, setPwd]             = useState("");
  const [err, setErr]             = useState("");
  const [busy, setBusy]           = useState(false);

  async function submitCode(e) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) { setCodeErr(true); return; }
    if (REFERRAL_CODES.includes(c)) {
      try { localStorage.removeItem("pi_pending_code"); } catch {}
      setUnlocked(true); setCodeErr(false); return;
    }
    try {
      const chk = await apiCheckCode(c);
      if (chk && chk.valid) {
        try { localStorage.setItem("pi_pending_code", c); } catch {}
        setUnlocked(true); setCodeErr(false); return;
      }
      if (chk && chk.code && chk.valid === false) { setCodeErr(true); return; }
    } catch {}
    // Réseau/webview indéterminé → on accepte, la redemption tranchera après inscription.
    try { localStorage.setItem("pi_pending_code", c); } catch {}
    setUnlocked(true); setCodeErr(false);
  }

  async function submitSignup(e) {
    e.preventDefault();
    const mail = email.trim();
    const fn   = firstName.trim();
    if (fn.length < 2)                               { setErr("Indiquez votre prénom."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail))   { setErr("Adresse e-mail invalide."); return; }
    if (!noPassword && pwd.length < 6)               { setErr("Mot de passe : 6 caractères minimum."); return; }
    setErr(""); setBusy(true);
    const r = await apiSignup({ email: mail, password: noPassword ? undefined : pwd, name: fn, no_password: noPassword });
    if (!r.ok) {
      setBusy(false);
      setErr(r.error === "invalid_credentials" ? "Mot de passe incorrect." : "Connexion impossible. Réessayez.");
      return;
    }
    setBusy(false);
    // Enregistre l'usage du code d'invitation (tracking uniquement — pas d'accès accordé).
    try {
      const pending = localStorage.getItem("pi_pending_code");
      if (pending) {
        await apiAccessCode(pending);
        localStorage.removeItem("pi_pending_code");
      }
    } catch {}
    onDone && onDone();
  }

  const input =
    "w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-bone placeholder:text-mist/40 text-[14px] outline-none transition-colors";

  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-10">
      <div className="relative w-full max-w-md rounded-3xl border gold-line bg-ink-800/95 shadow-2xl overflow-hidden p-7">
        <div className="pointer-events-none absolute -top-20 -right-10 h-52 w-52 rounded-full blur-3xl"
             style={{ background: "radial-gradient(circle, rgba(46,230,168,0.18), transparent 70%)" }} />

        <div className="relative">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">
            {title || (skipCode ? "Finaliser mon compte" : "Accès au Pôle Invest")}
          </span>

          {/* ── Étape 1 : code d'invitation (non Telegram) ── */}
          {!unlocked && (
            <form onSubmit={submitCode} className="mt-3">
              <h3 className="font-display font-light text-[24px] leading-tight tracking-tightest text-bone">
                Entrez votre code d'invitation
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-mist">
                L'accès se fait sur invitation. Saisissez votre code pour créer votre compte.
              </p>
              <input
                autoFocus value={code}
                onChange={(e) => { setCode(e.target.value); setCodeErr(false); }}
                placeholder="CODE D'INVITATION"
                className={`mt-5 w-full rounded-xl bg-ink-900 border px-4 py-3.5 text-bone placeholder:text-mist/40 font-mono tracking-[0.18em] uppercase outline-none transition-colors ${codeErr ? "border-red-500/60" : "border-white/10 focus:border-gold/50"}`}
              />
              {codeErr && <p className="mt-2.5 text-[12.5px] text-red-400/90">Code d'invitation invalide.</p>}
              <button type="submit" className="btn-gold mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px]">
                Déverrouiller l'accès <IconArrow className="h-4 w-4" />
              </button>
              {onLogin && (
                <button type="button" onClick={onLogin} className="mt-3 w-full text-center text-[12.5px] text-mist hover:text-bone transition-colors">
                  Déjà membre ? Se connecter
                </button>
              )}
            </form>
          )}

          {/* ── Étape 2 : formulaire d'inscription ── */}
          {unlocked && (
            <form onSubmit={submitSignup} className="mt-3">
              {skipCode ? (
                <>
                  <h3 className="font-display font-light text-[24px] leading-tight tracking-tightest text-bone">
                    Ajoutez votre email
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-mist">
                    Votre compte Telegram est actif. Ajoutez un email et un mot de passe pour
                    recevoir les alertes et sécuriser votre accès.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-display font-light text-[24px] leading-tight tracking-tightest text-bone">
                    Créez votre compte
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-mist">
                    Renseignez vos informations pour accéder à votre tableau de bord. Vous
                    débloquerez ensuite le contenu (validation IIBAN Kraken — 3 mois offerts —
                    ou abonnement).
                  </p>
                </>
              )}

              <input
                type="text"
                autoFocus={!skipCode}
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setErr(""); }}
                placeholder="Prénom"
                autoComplete="given-name"
                className={`mt-5 ${input}`}
              />
              <input
                type="email"
                autoFocus={skipCode}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErr(""); }}
                placeholder="Adresse e-mail"
                autoComplete="email"
                className={`mt-2.5 ${input}`}
              />
              {!noPassword && (
                <input
                  type="password"
                  value={pwd}
                  onChange={(e) => { setPwd(e.target.value); setErr(""); }}
                  placeholder="Mot de passe (6 caractères min.)"
                  autoComplete="new-password"
                  className={`mt-2.5 ${input}`}
                />
              )}
              {noPassword && (
                <p className="mt-2 text-[12px] text-mist/60">
                  Un mot de passe sera généré et envoyé à votre adresse email.
                </p>
              )}

              {err && <p className="mt-2 text-[12.5px] text-red-400/90">{err}</p>}

              <button
                type="submit"
                disabled={busy}
                className="btn-gold mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold disabled:opacity-60"
              >
                {busy
                  ? "Enregistrement…"
                  : skipCode
                    ? "Enregistrer"
                    : "Créer mon compte & accéder au tableau de bord"}
                {!busy && <IconArrow className="h-4 w-4" />}
              </button>

              {onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="mt-3 w-full text-center text-[12.5px] text-mist/60 hover:text-mist transition-colors"
                >
                  Passer pour l'instant
                </button>
              )}

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
