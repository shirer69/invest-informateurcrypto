"use client";

import { useEffect, useState } from "react";
import { apiForgot, apiReset } from "@/lib/clientStore";

export default function ResetPage() {
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  // forgot
  const [email, setEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  // reset
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    setToken(t);
    setReady(true);
  }, []);

  async function submitForgot(e) {
    e.preventDefault();
    setBusy(true);
    await apiForgot(email.trim());
    setBusy(false);
    setForgotSent(true);
  }

  async function submitReset(e) {
    e.preventDefault();
    setErr("");
    if (pwd.length < 6) return setErr("Mot de passe : 6 caractères minimum.");
    if (pwd !== pwd2) return setErr("Les mots de passe ne correspondent pas.");
    setBusy(true);
    const r = await apiReset({ token, password: pwd });
    setBusy(false);
    if (r.ok) {
      window.location.href = "/";
    } else {
      setErr(r.error === "invalid_token"
        ? "Lien expiré ou invalide. Refaites une demande."
        : "Échec de la réinitialisation. Réessayez.");
    }
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen grid place-items-center px-4 aura">
      <div className="w-full max-w-sm rounded-3xl border gold-line glass p-7">
        <span className="eyebrow">Pôle Invest</span>

        {token ? (
          <>
            <h1 className="mt-3 font-display text-[24px] text-bone">Nouveau mot de passe</h1>
            <p className="mt-2 text-[13px] text-mist">Choisissez un nouveau mot de passe pour votre compte.</p>
            <form onSubmit={submitReset} className="mt-5 space-y-3">
              <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)}
                placeholder="Nouveau mot de passe" autoFocus
                className="w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-bone placeholder:text-mist/40 outline-none" />
              <input type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)}
                placeholder="Confirmer le mot de passe"
                className="w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-bone placeholder:text-mist/40 outline-none" />
              {err && <p className="text-[12.5px] text-red-400/90">{err}</p>}
              <button disabled={busy} className="btn-gold w-full rounded-full px-6 py-3.5 text-[15px] font-semibold disabled:opacity-50">
                {busy ? "…" : "Valider"}
              </button>
            </form>
          </>
        ) : forgotSent ? (
          <>
            <h1 className="mt-3 font-display text-[24px] text-bone">Email envoyé</h1>
            <p className="mt-2 text-[13.5px] text-mist leading-relaxed">
              Si un compte est associé à cette adresse, vous recevrez un lien de réinitialisation
              dans quelques instants. Pensez à vérifier vos spams.
            </p>
            <a href="/" className="mt-5 inline-block text-[13px] text-gold hover:text-gold-soft">← Retour à l'accueil</a>
          </>
        ) : (
          <>
            <h1 className="mt-3 font-display text-[24px] text-bone">Mot de passe oublié</h1>
            <p className="mt-2 text-[13px] text-mist">Saisissez votre email : nous vous enverrons un lien de réinitialisation.</p>
            <form onSubmit={submitForgot} className="mt-5 space-y-3">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email" autoFocus required
                className="w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-bone placeholder:text-mist/40 outline-none" />
              <button disabled={busy || !email} className="btn-gold w-full rounded-full px-6 py-3.5 text-[15px] font-semibold disabled:opacity-50">
                {busy ? "…" : "Envoyer le lien"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
