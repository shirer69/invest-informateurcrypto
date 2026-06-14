"use client";

import { useState } from "react";
import { apiLogin, apiSendPassword } from "@/lib/clientStore";

export default function LoginModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sendPwdMsg, setSendPwdMsg] = useState(null);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await apiLogin({ email: email.trim(), password: pwd });
    setBusy(false);
    if (r.ok) {
      window.location.href = "/";
    } else {
      setErr(r.error === "invalid_credentials" ? "E-mail ou mot de passe incorrect." : "Connexion impossible.");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm my-auto rounded-3xl border gold-line bg-ink-800/95 shadow-2xl p-7">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Connexion membre</span>
          <button onClick={onClose} aria-label="Fermer"
                  className="h-8 w-8 grid place-items-center rounded-full border hairline text-mist hover:text-bone">
            <span className="block w-3 h-px bg-current rotate-45 translate-y-[0.5px]" />
            <span className="block w-3 h-px bg-current -rotate-45 -translate-y-[0.5px]" />
          </button>
        </div>
        <h3 className="mt-3 font-display font-light text-[24px] tracking-tightest text-bone">
          Accéder à mon espace
        </h3>
        <p className="mt-2 text-[13px] text-mist">
          Connectez-vous avec le compte créé lors de votre adhésion.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-2.5">
          <input
            type="email" autoFocus value={email}
            onChange={(e) => { setEmail(e.target.value); setErr(""); }}
            placeholder="Adresse e-mail"
            className="w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-bone placeholder:text-mist/40 text-[14px] outline-none"
          />
          <input
            type="password" value={pwd}
            onChange={(e) => { setPwd(e.target.value); setErr(""); }}
            placeholder="Mot de passe"
            className="w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-bone placeholder:text-mist/40 text-[14px] outline-none"
          />
          {err && <p className="text-[12.5px] text-red-400/90">{err}</p>}
          <button disabled={busy}
                  className="btn-gold w-full rounded-full px-6 py-3.5 text-[15px] font-semibold disabled:opacity-60">
            {busy ? "Connexion…" : "Se connecter"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              const mail = email.trim();
              if (!mail) { setSendPwdMsg({ ok: false, t: "Entrez votre adresse email d'abord." }); return; }
              setSendPwdMsg({ ok: true, t: "Envoi en cours…" });
              const r = await apiSendPassword(mail);
              setSendPwdMsg(r.ok ? { ok: true, t: "✓ Mot de passe envoyé — vérifiez votre boîte mail." } : { ok: false, t: "Adresse introuvable ou erreur réseau." });
            }}
            className="mt-1 w-full text-center text-[12.5px] text-mist hover:text-bone transition-colors">
            Recevoir mon mot de passe par email
          </button>
          {sendPwdMsg && (
            <p className={`text-[12px] text-center ${sendPwdMsg.ok ? "text-emerald-400" : "text-red-400/90"}`}>{sendPwdMsg.t}</p>
          )}
        </form>
      </div>
    </div>
  );
}
