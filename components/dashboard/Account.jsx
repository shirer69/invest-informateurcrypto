"use client";

import { useState } from "react";
import { getUser, apiChangePassword, apiChangeEmail, apiDeleteAccount } from "@/lib/clientStore";
import { IconArrow } from "@/components/Icons";

const SUPPORT_TG = "https://t.me/cyclepartners";

const ERR = {
  invalid_current_password: "Mot de passe actuel incorrect.",
  password_too_short: "Nouveau mot de passe : 6 caractères minimum.",
  invalid_password: "Mot de passe incorrect.",
  email_invalid: "Adresse e-mail invalide.",
  email_exists: "Cette adresse e-mail est déjà utilisée.",
};
const msg = (e) => ERR[e] || "Une erreur est survenue, réessayez.";

function Note({ m }) {
  if (!m) return null;
  return <p className={`mt-2 text-[12.5px] ${m.ok ? "text-emerald-400" : "text-rose-400/90"}`}>{m.text}</p>;
}

const inputCls =
  "w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-bone placeholder:text-mist/40 text-[14px] outline-none transition-colors";

export default function Account() {
  const user = getUser();
  const [cur, setCur] = useState("");
  const [npw, setNpw] = useState("");
  const [pwMsg, setPwMsg] = useState(null);
  const [pwBusy, setPwBusy] = useState(false);

  const [newMail, setNewMail] = useState("");
  const [mailPw, setMailPw] = useState("");
  const [mailMsg, setMailMsg] = useState(null);
  const [mailBusy, setMailBusy] = useState(false);

  const [delOpen, setDelOpen] = useState(false);
  const [delPw, setDelPw] = useState("");
  const [delMsg, setDelMsg] = useState(null);
  const [delBusy, setDelBusy] = useState(false);

  async function changePw(e) {
    e.preventDefault();
    setPwBusy(true); setPwMsg(null);
    const r = await apiChangePassword(cur, npw);
    setPwBusy(false);
    if (r.ok) { setPwMsg({ ok: true, text: "Mot de passe mis à jour ✓" }); setCur(""); setNpw(""); }
    else setPwMsg({ ok: false, text: msg(r.error) });
  }

  async function changeMail(e) {
    e.preventDefault();
    setMailBusy(true); setMailMsg(null);
    const r = await apiChangeEmail(mailPw, newMail.trim());
    setMailBusy(false);
    if (r.ok) { setMailMsg({ ok: true, text: "Adresse e-mail mise à jour ✓" }); setNewMail(""); setMailPw(""); }
    else setMailMsg({ ok: false, text: msg(r.error) });
  }

  async function doDelete(e) {
    e.preventDefault();
    setDelBusy(true); setDelMsg(null);
    const r = await apiDeleteAccount(delPw);
    setDelBusy(false);
    if (r.ok) { if (typeof window !== "undefined") window.location.href = "/"; }
    else setDelMsg({ ok: false, text: msg(r.error) });
  }

  return (
    <div className="max-w-xl">
      <h3 className="font-display text-[18px] text-bone mb-4">Mon compte</h3>

      <div className="rounded-2xl border hairline bg-ink-800/50 p-5 mb-4">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Identité</span>
        <div className="mt-2 text-[14px] text-bone">{user?.name || "—"}</div>
        <div className="font-mono text-[12.5px] text-mist">{user?.email || "—"}</div>
      </div>

      {/* Mot de passe */}
      <form onSubmit={changePw} className="rounded-2xl border hairline bg-ink-800/50 p-5 mb-4">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Changer le mot de passe</span>
        <input type="password" value={cur} onChange={(e) => { setCur(e.target.value); setPwMsg(null); }}
          placeholder="Mot de passe actuel" autoComplete="current-password" className={`mt-3 ${inputCls}`} />
        <input type="password" value={npw} onChange={(e) => { setNpw(e.target.value); setPwMsg(null); }}
          placeholder="Nouveau mot de passe (6 car. min.)" autoComplete="new-password" className={`mt-2.5 ${inputCls}`} />
        <Note m={pwMsg} />
        <button disabled={pwBusy} className="btn-gold mt-3 rounded-full px-5 py-2.5 text-[13.5px] font-semibold disabled:opacity-60">
          {pwBusy ? "…" : "Mettre à jour le mot de passe"}
        </button>
      </form>

      {/* Email */}
      <form onSubmit={changeMail} className="rounded-2xl border hairline bg-ink-800/50 p-5 mb-4">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Changer l'adresse e-mail</span>
        <input type="email" value={newMail} onChange={(e) => { setNewMail(e.target.value); setMailMsg(null); }}
          placeholder="Nouvelle adresse e-mail" autoComplete="email" className={`mt-3 ${inputCls}`} />
        <input type="password" value={mailPw} onChange={(e) => { setMailPw(e.target.value); setMailMsg(null); }}
          placeholder="Mot de passe (confirmation)" autoComplete="current-password" className={`mt-2.5 ${inputCls}`} />
        <Note m={mailMsg} />
        <button disabled={mailBusy} className="btn-gold mt-3 rounded-full px-5 py-2.5 text-[13.5px] font-semibold disabled:opacity-60">
          {mailBusy ? "…" : "Mettre à jour l'e-mail"}
        </button>
      </form>

      {/* Support */}
      <div className="rounded-2xl border hairline bg-ink-800/50 p-5 mb-4">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Support</span>
        <p className="mt-2 text-[13px] text-mist">Une question ou un souci ? Notre équipe vous répond sur Telegram.</p>
        <a href={SUPPORT_TG} target="_blank" rel="noopener noreferrer"
          className="btn-ghost mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px]">
          Contacter le support <IconArrow className="h-4 w-4" />
        </a>
      </div>

      {/* Suppression */}
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.04] p-5">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-rose-400/90">Zone sensible</span>
        <p className="mt-2 text-[13px] text-mist">
          La suppression de votre compte est <b>définitive</b> et efface vos données (accès, progression, facturation).
        </p>
        {!delOpen ? (
          <button onClick={() => setDelOpen(true)}
            className="mt-3 rounded-full border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 px-5 py-2.5 text-[13.5px] transition-colors">
            Supprimer mon compte
          </button>
        ) : (
          <form onSubmit={doDelete} className="mt-3">
            <input type="password" value={delPw} onChange={(e) => { setDelPw(e.target.value); setDelMsg(null); }}
              placeholder="Confirmez avec votre mot de passe" autoComplete="current-password" className={inputCls} />
            <Note m={delMsg} />
            <div className="mt-3 flex gap-2.5">
              <button disabled={delBusy}
                className="rounded-full bg-rose-500/90 hover:bg-rose-500 text-white px-5 py-2.5 text-[13.5px] font-semibold disabled:opacity-60">
                {delBusy ? "Suppression…" : "Confirmer la suppression"}
              </button>
              <button type="button" onClick={() => { setDelOpen(false); setDelPw(""); setDelMsg(null); }}
                className="btn-ghost rounded-full px-5 py-2.5 text-[13.5px]">Annuler</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
