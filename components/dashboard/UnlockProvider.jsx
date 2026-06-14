"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { hasAccess, apiAccess, apiAccessIiban, apiAccessPay, apiSignup, apiLogin, getUser, getToken } from "@/lib/clientStore";
import { IconArrow } from "@/components/Icons";
import { KRAKEN_URL, TELEGRAM_URL, API_BASE } from "@/lib/site";
import { TESTIMONIALS } from "@/lib/testimonials";

const Ctx = createContext({ locked: true, openUnlock: () => {}, wallet: null });
export const useUnlock = () => useContext(Ctx);

export function UnlockProvider({ children }) {
  const [locked, setLocked] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    const r = await apiAccess();
    if (r && r.ok) {
      setLocked(!r.has_access);
      setWallet({ wallet_balance: r.wallet_balance, price_usd: r.price_usd, can_pay: r.can_pay });
    } else {
      setLocked(!hasAccess());
    }
  }, []);

  useEffect(() => {
    setLocked(!hasAccess());
    refresh();
  }, [refresh]);

  // Ouverture automatique de la modal de déblocage (étape Kraken) quand on arrive
  // via le lien mini-app `t.me/Clubdesinformateurs_bot/invest` (start_param "invest")
  // ou via l'URL `/dashboard?unlock=1` (ou ?startapp=invest).
  useEffect(() => {
    if (typeof window === "undefined") return;
    let wanted = false;
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get("unlock") === "1" || p.get("startapp") === "invest") wanted = true;
      const sp = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
      if (sp === "invest" || sp === "unlock") wanted = true;
    } catch {}
    if (wanted) setOpen(true);
  }, []);

  const openUnlock = useCallback(() => setOpen(true), []);
  // Débloque le contenu en arrière-plan ; le modal reste ouvert pour afficher le lien VIP.
  const onUnlocked = useCallback(() => { setLocked(false); }, []);

  return (
    <Ctx.Provider value={{ locked, openUnlock, wallet }}>
      {children}
      {open && (
        <UnlockModal
          wallet={wallet}
          onClose={() => setOpen(false)}
          onUnlocked={onUnlocked}
        />
      )}
    </Ctx.Provider>
  );
}

/* Wrapper : floute le contenu + bouton « Déverrouiller » tant que verrouillé. */
export function Locked({ children, label = "Déverrouiller", className = "" }) {
  const { locked, openUnlock } = useUnlock();
  if (!locked) return children;
  return (
    <div className={`relative min-h-[120px] ${className}`}>
      <div className="pointer-events-none select-none blur-[2.5px] opacity-70" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 z-10 grid place-items-center p-4">
        <button
          onClick={openUnlock}
          className="btn-gold inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold shadow-2xl"
        >
          <span aria-hidden>🔒</span> {label}
          <IconArrow className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* Modal des deux options de déblocage (IIBAN 3 mois offerts / 239 $ wallet). */
function TestimonialCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(id);
  }, []);
  const t = TESTIMONIALS[idx];
  return (
    <div className="mt-5 rounded-xl border hairline bg-white/[0.02] px-4 py-3 min-h-[90px] flex flex-col justify-between transition-all">
      <p className="text-[12.5px] leading-relaxed text-mist/80 italic">"{t.text}"</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-gold/80">— {t.name}</span>
        <div className="flex gap-1">
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-gold" : "w-1.5 bg-white/20"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function UnlockModal({ wallet, onClose, onUnlocked }) {
  const [uid, setUid] = useState("");
  const [state, setState] = useState("idle"); // idle | checking | pending | notfound | error
  const [paying, setPaying] = useState(false);
  const [payMsg, setPayMsg] = useState("");
  const [bal, setBal] = useState(wallet);
  const [done, setDone] = useState(null); // { invite } après déblocage réussi

  // Étape 1 = inscription (si compte non encore enregistré : email @telegram.local ou vide).
  const _needsSignup = () => {
    const em = (getUser()?.email || "").toLowerCase();
    return !em || em.endsWith("@telegram.local");
  };
  const [step, setStep] = useState(() => (_needsSignup() ? "signup" : "options"));
  const [firstName, setFirstName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPwd, setSuPwd] = useState("");
  const [suErr, setSuErr] = useState("");
  const [suBusy, setSuBusy] = useState(false);

  useEffect(() => { setBal(wallet); }, [wallet]);

  async function submitSignup(e) {
    e.preventDefault();
    const mail = suEmail.trim(); const fn = firstName.trim();
    if (fn.length < 2) { setSuErr("Indiquez votre prénom."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { setSuErr("Adresse e-mail invalide."); return; }
    if (suPwd.length < 6) { setSuErr("Mot de passe : 6 caractères minimum."); return; }
    setSuErr(""); setSuBusy(true);
    const r = await apiSignup({ email: mail, password: suPwd, name: fn });
    if (!r.ok) {
      setSuBusy(false);
      setSuErr(r.error === "invalid_credentials" ? "Mot de passe incorrect." : "Connexion impossible. Réessayez.");
      return;
    }
    setSuBusy(false);
    setStep("options"); // → étape Kraken / IIBAN / abonnement
  }

  async function verify(e) {
    e.preventDefault();
    const trimmed = uid.trim().replace(/\s+/g, "");
    if (trimmed.length < 4) { setState("notfound"); return; }
    setState("checking");

    // Vérification (+ stockage CRM si connecté) pour détecter les IIBAN pending.
    try {
      const tok = getToken();
      const headers = tok ? { Authorization: `Bearer ${tok}` } : {};
      const chk = await fetch(`${API_BASE}/api/access/iiban/check?uid=${encodeURIComponent(trimmed)}`, { cache: "no-store", headers }).then((r) => r.json());
      if (chk.uid_status === "pending") { setState("pending"); return; }
      if (chk.uid_status === "notfound" || chk.uid_status === "invalid") { setState("notfound"); return; }
    } catch {}

    // IIBAN actif → appel authentifié pour attribuer l'accès.
    const r = await apiAccessIiban(trimmed);
    if (r.ok) { onUnlocked(); setDone({ invite: r.tg_invite }); return; }
    if (r.status === 403) setState(r.uid_status === "pending" ? "pending" : "notfound");
    else setState("error");
  }

  async function pay() {
    setPaying(true); setPayMsg("");
    const r = await apiAccessPay();
    setPaying(false);
    if (r.ok) { onUnlocked(); setDone({ invite: r.tg_invite }); return; }
    if (r.status === 402) {
      setPayMsg(
        `Solde insuffisant : ${Number(r.wallet_balance ?? 0).toFixed(2)} $ / ${Number(r.price_usd ?? 239).toFixed(0)} $. ` +
        `Alimentez votre wallet USDT dédié (il manque ${Number(r.missing ?? 0).toFixed(2)} $).`
      );
    } else if (r.status === 401) {
      setPayMsg("Connectez-vous pour finaliser le paiement.");
    } else {
      setPayMsg("Erreur lors du paiement, réessayez.");
    }
  }

  const price = bal?.price_usd ?? 239;

  return (
    <div className="fixed inset-0 z-[120] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative my-auto w-full max-w-md rounded-2xl border gold-line bg-ink-900/95 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">
            {done ? "Accès débloqué" : step === "signup" ? "Créer votre compte" : "Déverrouiller l'accès"}
          </span>
          <button onClick={onClose} aria-label="Fermer"
                  className="h-8 w-8 grid place-items-center rounded-full border hairline text-mist hover:text-bone">
            <span className="block w-3 h-px bg-current rotate-45 translate-y-[0.5px]" />
            <span className="block w-3 h-px bg-current -rotate-45 -translate-y-[0.5px]" />
          </button>
        </div>

        {done ? (
          <div className="mt-3">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center h-8 w-8 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">✓</span>
              <h3 className="font-display font-light text-[22px] leading-tight tracking-tightest text-bone">
                Bienvenue — accès activé
              </h3>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-mist">
              Votre accès est débloqué. Rejoignez le <span className="text-bone">canal VIP privé</span> via
              votre lien d'invitation personnel ci-dessous (demande d'adhésion). Il vous a aussi été{" "}
              <span className="text-bone">envoyé par e-mail</span>.
            </p>
            {done.invite ? (
              <a href={done.invite} target="_blank" rel="noopener noreferrer"
                 className="btn-gold mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold">
                Rejoindre le canal VIP <IconArrow className="h-4 w-4" />
              </a>
            ) : (
              <p className="mt-4 text-[12.5px] text-amber-300/90">
                Votre lien VIP arrive par e-mail dans un instant (ou retrouvez-le dans l'onglet Wallet).
              </p>
            )}
            <button onClick={onClose}
              className="btn-ghost mt-2.5 w-full rounded-full px-6 py-2.5 text-[13px]">
              Accéder à mon dashboard
            </button>
          </div>
        ) : step === "signup" ? (
          <div className="mt-3">
            {/* Raccourci code d'invitation — utile en mini-app (déjà connecté, pas besoin d'email). */}
          <form onSubmit={submitSignup}>
            <h3 className="font-display font-light text-[22px] leading-tight tracking-tightest text-bone">
              Créez votre compte
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-mist">
              Renseignez vos informations pour activer votre accès.
            </p>
            <input type="text" value={firstName} autoFocus
              onChange={(e) => { setFirstName(e.target.value); setSuErr(""); }}
              placeholder="Prénom" autoComplete="given-name"
              className="mt-4 w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-bone placeholder:text-mist/40 text-[14px] outline-none" />
            <input type="email" value={suEmail}
              onChange={(e) => { setSuEmail(e.target.value); setSuErr(""); }}
              placeholder="Adresse e-mail" autoComplete="email"
              className="mt-2.5 w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-bone placeholder:text-mist/40 text-[14px] outline-none" />
            <input type="password" value={suPwd}
              onChange={(e) => { setSuPwd(e.target.value); setSuErr(""); }}
              placeholder="Mot de passe (6 car. min.)" autoComplete="new-password"
              className="mt-2.5 w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-bone placeholder:text-mist/40 text-[14px] outline-none" />
            {suErr && <p className="mt-2 text-[12.5px] text-rose-400/90">{suErr}</p>}
            <button type="submit" disabled={suBusy}
              className="btn-gold mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold disabled:opacity-60">
              {suBusy ? "Création…" : <>Continuer <IconArrow className="h-4 w-4" /></>}
            </button>
          </form>
          </div>
        ) : (
        <>
        <h3 className="mt-3 font-display font-light text-[22px] leading-tight tracking-tightest text-bone">
          Accéder à l'intégralité du dashboard + <span className="text-gold-grad">VIP Telegram</span>
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-mist">
          Débloquez l'accès au <span className="text-bone">canal VIP privé Telegram</span> (positions
          en direct, alertes, audios) ainsi qu'à tout le dashboard — via l'une des deux options :
        </p>

        {/* Étapes Kraken (préalable à l'option 1) */}
        <div className="mt-5 rounded-xl border hairline bg-white/[0.02] p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-display text-[26px] leading-none text-gold-grad whitespace-nowrap shrink-0">5&nbsp;$</span>
            <span className="text-[12.5px] leading-snug text-bone min-w-0">
              Dépôt minimum
              <span className="block text-[11px] text-mist">ticket d'entrée pour activer votre accès</span>
            </span>
          </div>
          <ol className="space-y-2.5">
            {[
              { n: "1", t: "Créer un compte Kraken", d: "via notre lien partenaire", href: KRAKEN_URL, cta: "Ouvrir Kraken" },
              { n: "2", t: "Déposer au moins 5 $", d: "pour activer l'attribution de votre compte" },
            ].map((s) => (
              <li key={s.n} className="flex gap-3">
                <span className="grid place-items-center h-6 w-6 shrink-0 rounded-full border gold-line text-gold font-mono text-[11px]">{s.n}</span>
                <span className="text-[12.5px] leading-snug text-mist min-w-0">
                  <span className="text-bone">{s.t}</span> — {s.d}
                  {s.href && (
                    <a href={s.href} target="_blank" rel="noopener noreferrer"
                       className="ml-1 inline-flex items-center gap-1 text-gold hover:text-gold-soft transition-colors">
                      {s.cta} <IconArrow className="h-3 w-3" />
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Note compte existant */}
        <p className="mt-3 text-[12px] leading-relaxed text-mist/70">
          Vous avez déjà un compte Kraken ?{" "}
          <a href="https://t.me/clubdesinformateurs" target="_blank" rel="noopener noreferrer"
             className="text-gold hover:text-gold-soft transition-colors underline">
            Écrivez-nous sur Telegram
          </a>{" "}
          pour lier votre compte existant.
        </p>

        {/* Option 1 : IIBAN Kraken */}
        <div className="mt-5 rounded-xl border gold-line bg-gold/[0.05] p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">Option 1 · IIBAN Kraken</span>
            <span className="text-[11px] text-emerald-400">3 mois offerts</span>
          </div>
          <form onSubmit={verify} className="mt-2.5 flex gap-2">
            <input
              value={uid}
              onChange={(e) => { setUid(e.target.value); if (state !== "checking") setState("idle"); }}
              placeholder="UID Kraken (identifiant IIBAN)"
              disabled={state === "checking"}
              className="flex-1 min-w-0 rounded-lg bg-ink-900 border border-white/10 focus:border-gold/50 px-3.5 py-2.5 text-bone placeholder:text-mist/40 font-mono text-[13px] outline-none disabled:opacity-60"
            />
            <button disabled={state === "checking"} className="btn-gold rounded-lg px-4 text-[13px] font-semibold disabled:opacity-60 flex items-center gap-2 min-w-[80px] justify-center">
              {state === "checking" ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Vérif…
                </>
              ) : "Valider"}
            </button>
          </form>
          {state === "pending" && (
            <div className="mt-2.5 rounded-lg border border-amber-500/30 bg-amber-500/[0.07] p-3">
              <div className="font-mono text-[10px] uppercase tracking-widest2 text-amber-300">
                Dépôt reçu ✓ — dernière étape
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-amber-100/90">
                Pour <b>finaliser votre accès</b>, vous devez <b>ouvrir puis refermer une position
                en perpétuels (futures)</b> sur Kraken — même un montant minime suffit. Cliquez
                ensuite à nouveau sur <b>Valider</b>.
              </p>
              <a href={KRAKEN_URL} target="_blank" rel="noopener noreferrer"
                 className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-gold hover:text-gold-soft transition-colors">
                Ouvrir Kraken (futures) <IconArrow className="h-3 w-3" />
              </a>
              <details className="mt-2.5 group">
                <summary className="flex items-center gap-1.5 cursor-pointer list-none text-[11.5px] text-mist hover:text-bone transition-colors">
                  <span className="grid place-items-center h-4 w-4 rounded-full border hairline text-[9px]">i</span>
                  Bloqué sur le questionnaire réglementaire (futures) ?
                </summary>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-mist">
                  Kraken impose un court questionnaire réglementaire avant d'activer les
                  perpétuels. Si vous avez un doute sur les réponses, <b>contactez-nous sur
                  Telegram</b>, on vous guide pas à pas.
                </p>
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
                   className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] text-gold hover:text-gold-soft transition-colors">
                  Nous écrire sur Telegram <IconArrow className="h-3 w-3" />
                </a>
              </details>
            </div>
          )}
          {state === "notfound" && (
            <p className="mt-2 text-[12.5px] text-rose-400/90">IIBAN non reconnu comme actif. Vérifiez votre dépôt Kraken.</p>
          )}
          {state === "error" && <p className="mt-2 text-[12.5px] text-rose-400/90">Erreur, réessayez.</p>}
        </div>

        {/* Option 2 : abonnement via wallet */}
        <div className="mt-3 rounded-xl border hairline bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Option 2 · Abonnement</span>
            <span className="text-[13px] font-display text-bone">{Number(price).toFixed(0)} $ <span className="text-mist text-[11px]">/ 3 mois</span></span>
          </div>
          {bal && (
            <p className="mt-2 text-[11.5px] text-mist">
              Solde wallet : <span className="text-bone font-mono">{Number(bal.wallet_balance ?? 0).toFixed(2)} $</span>
            </p>
          )}
          <button onClick={pay} disabled={paying}
                  className="btn-gold mt-2.5 w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold disabled:opacity-60">
            {paying ? "Traitement…" : <>Payer {Number(price).toFixed(0)} $ depuis mon wallet <IconArrow className="h-4 w-4" /></>}
          </button>
          {payMsg && <p className="mt-2 text-[12px] leading-relaxed text-amber-300/90">{payMsg}</p>}
        </div>

        {/* Carrousel témoignages */}
        <TestimonialCarousel />

        <p className="mt-4 text-[11px] leading-relaxed text-mist/50">
          Aucun conseil en investissement. Risque de perte en capital.
        </p>
        </>
        )}
      </div>
    </div>
  );
}
