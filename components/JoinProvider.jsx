"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import Script from "next/script";
import { AnimatePresence, motion } from "framer-motion";
import { KRAKEN_URL, TELEGRAM_URL, REFERRAL_CODES, API_BASE } from "@/lib/site";
import { IconArrow } from "./Icons";
import { apiSignup, apiLogin, apiAccessCode, apiCheckCode, getToken } from "@/lib/clientStore";

const JoinCtx = createContext({ open: () => {}, openWithCode: () => {} });
export const useJoin = () => useContext(JoinCtx);

const ease = [0.22, 1, 0.36, 1];

const STEPS = [
  {
    n: "1",
    t: "Créer un compte Kraken",
    d: "Inscrivez-vous via notre lien partenaire et effectuez votre dépôt pour activer l'accès.",
    cta: { label: "Ouvrir Kraken", href: KRAKEN_URL },
  },
  {
    n: "2",
    t: "Vérifier votre UID Kraken (IIBAN)",
    d: "Saisissez votre UID Kraken (identifiant IIBAN) ci-dessous. Si votre attribution est active, vous recevez instantanément votre accès.",
  },
];

export default function JoinProvider({ children }) {
  const [isOpen, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  // Vérification de l'UID Kraken
  const [uid, setUid] = useState("");
  const [vState, setVState] = useState("idle"); // idle | checking | active | notfound | invalid | error
  const [inviteLink, setInviteLink] = useState("");

  // Inscription (prénom + email + mot de passe) avant accès au dashboard
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [signupErr, setSignupErr] = useState("");
  const [codeInfo, setCodeInfo] = useState(null); // {code, valid, used} si lien ?code=

  const open = useCallback(() => {
    setOpen(true);
    setError(false);
  }, []);

  // Code d'accès reçu par Telegram : invest.informateurcrypto.fr/?code=XXXX
  // → si déjà connecté, on applique tout de suite ; sinon on ouvre l'inscription
  //   (le code tient lieu d'invitation) et il sera appliqué après création du compte.
  useEffect(() => {
    let c = null;
    try { c = new URLSearchParams(window.location.search).get("code"); } catch {}
    if (!c) return;
    c = c.trim();
    try { localStorage.setItem("pi_pending_code", c); } catch {}
    try {
      const u = new URL(window.location.href); u.searchParams.delete("code");
      window.history.replaceState({}, "", u);
    } catch {}
    (async () => {
      if (getToken()) {
        const r = await apiAccessCode(c);
        if (r.ok) {
          try { localStorage.removeItem("pi_pending_code"); } catch {}
          if (typeof window !== "undefined") window.location.href = "/dashboard";
          return;
        }
      }
      // Vérifie le code (sans le consommer) pour l'afficher dans le formulaire.
      try {
        const chk = await apiCheckCode(c);
        setCodeInfo({ code: c, valid: !!chk.valid, used: !!chk.used });
      } catch { setCodeInfo({ code: c, valid: false, used: false }); }
      // Non connecté → on ouvre directement l'inscription (gate d'invitation sautée).
      setUnlocked(true);
      setOpen(true);
    })();
  }, []);

  // Ouvre le modal en passant directement par le code parrain (saisi dans le hero).
  const openWithCode = useCallback((c) => {
    const ok = REFERRAL_CODES.includes((c || "").trim().toUpperCase());
    setCode(c || "");
    setUnlocked(ok);
    setError(!ok && !!(c || "").trim());
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    // léger délai avant reset pour ne pas voir le flip pendant la sortie
    setTimeout(() => {
      setUnlocked(false);
      setCode("");
      setError(false);
      setUid("");
      setVState("idle");
      setInviteLink("");
    }, 350);
  }, []);

  const verifyUid = async (e) => {
    e.preventDefault();
    if (uid.trim().replace(/\s+/g, "").length < 4) {
      setVState("invalid");
      return;
    }
    setVState("checking");
    try {
      const res = await fetch(`${API_BASE}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await res.json();
      if (data.status === "active") {
        setInviteLink(data.link || "");
        setVState("active");
      } else if (data.status === "pending") {
        setVState("pending");
      } else if (data.status === "invalid") {
        setVState("invalid");
      } else {
        setVState("notfound");
      }
    } catch {
      setVState("error");
    }
  };

  const submitSignup = async (e) => {
    e.preventDefault();
    const mail = email.trim();
    const fn = firstName.trim();
    if (fn.length < 2) {
      setSignupErr("Indiquez votre prénom.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setSignupErr("Adresse e-mail invalide.");
      return;
    }
    if (pwd.length < 6) {
      setSignupErr("Mot de passe : 6 caractères minimum.");
      return;
    }
    setSignupErr("");

    // Création de compte serveur (prénom + email + mot de passe). L'accès au contenu
    // reste verrouillé dans le dashboard tant qu'il n'est pas débloqué (IIBAN ou 239 $).
    let r = await apiSignup({ email: mail, password: pwd, name: fn });
    if (!r.ok && r.error === "email_exists") {
      r = await apiLogin({ email: mail, password: pwd });
      if (!r.ok) {
        setSignupErr("Ce compte existe déjà. Mot de passe incorrect.");
        return;
      }
    } else if (!r.ok) {
      setSignupErr("Création du compte impossible. Réessayez.");
      return;
    }

    // Applique un éventuel code d'accès offert mémorisé (lien Telegram ?code=).
    try {
      const pc = localStorage.getItem("pi_pending_code");
      if (pc) { await apiAccessCode(pc); localStorage.removeItem("pi_pending_code"); }
    } catch {}

    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
  };

  const submitCode = (e) => {
    e.preventDefault();
    if (REFERRAL_CODES.includes(code.trim().toUpperCase())) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <JoinCtx.Provider value={{ open, openWithCode }}>
      {/* SDK Telegram : permet de relier le compte créé à l'identité Telegram (Mini App). */}
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
      {children}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={close}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.45, ease }}
              className="relative w-full max-w-lg my-auto rounded-3xl border gold-line bg-ink-800/95 shadow-2xl overflow-y-auto max-h-[94dvh]"
            >
              <div
                className="pointer-events-none absolute -top-20 -right-10 h-52 w-52 rounded-full blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(46,230,168,0.20), transparent 70%)" }}
              />

              {/* header */}
              <div className="relative flex items-center justify-between px-7 pt-6">
                <span className="eyebrow">Accès au Pôle Invest</span>
                <button
                  onClick={close}
                  aria-label="Fermer"
                  className="h-9 w-9 grid place-items-center rounded-full border hairline text-mist hover:text-bone transition-colors"
                >
                  <span className="block w-3.5 h-px bg-current rotate-45 translate-y-[0.5px]" />
                  <span className="block w-3.5 h-px bg-current -rotate-45 -translate-y-[0.5px]" />
                </button>
              </div>

              <div className="relative px-7 pb-7 pt-3">
                {!unlocked ? (
                  <motion.div
                    key="gate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h3 className="font-display font-light text-[26px] leading-tight tracking-tightest text-bone">
                      Entrez votre code d'invitation
                    </h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-mist">
                      L'accès au Pôle Invest se fait sur invitation. Saisissez votre code
                      pour découvrir les étapes d'adhésion.
                    </p>
                    <form onSubmit={submitCode} className="mt-6">
                      <input
                        autoFocus
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value);
                          setError(false);
                        }}
                        placeholder="CODE D'INVITATION"
                        className={`w-full rounded-xl bg-ink-900 border px-4 py-3.5 text-bone placeholder:text-mist/40 font-mono tracking-[0.18em] uppercase outline-none transition-colors ${
                          error ? "border-red-500/60" : "border-white/10 focus:border-gold/50"
                        }`}
                      />
                      {error && (
                        <p className="mt-2.5 text-[12.5px] text-red-400/90">
                          Code d'invitation invalide. Vérifiez auprès de votre parrain.
                        </p>
                      )}
                      <button
                        type="submit"
                        className="btn-gold mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px]"
                      >
                        Déverrouiller l'accès
                        <IconArrow className="h-4 w-4" />
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.form
                    key="signup"
                    onSubmit={submitSignup}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease }}
                  >
                    <h3 className="font-display font-light text-[26px] leading-tight tracking-tightest text-bone">
                      Créez votre compte
                    </h3>
                    <p className="mt-3 text-[13.5px] leading-relaxed text-mist">
                      Renseignez vos informations pour accéder à votre tableau de bord.
                    </p>

                    {codeInfo && (
                      codeInfo.valid && !codeInfo.used ? (
                        <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/[0.08] px-4 py-2.5">
                          <p className="text-[13px] text-emerald-300">
                            🔑 Code <span className="font-mono text-bone">{codeInfo.code}</span> valide ✓ —
                            vos <b>3 mois d'accès offerts</b> seront activés à la création de votre compte.
                          </p>
                        </div>
                      ) : codeInfo.used ? (
                        <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/[0.08] px-4 py-2.5">
                          <p className="text-[13px] text-amber-300">
                            🔑 Code <span className="font-mono">{codeInfo.code}</span> — ce code a déjà été utilisé.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 rounded-xl border border-rose-500/40 bg-rose-500/[0.08] px-4 py-2.5">
                          <p className="text-[13px] text-rose-300">
                            🔑 Code <span className="font-mono">{codeInfo.code}</span> invalide.
                          </p>
                        </div>
                      )
                    )}

                    <input
                      type="text"
                      autoFocus
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); setSignupErr(""); }}
                      placeholder="Prénom"
                      autoComplete="given-name"
                      className="mt-5 w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-bone placeholder:text-mist/40 text-[14px] outline-none transition-colors"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setSignupErr(""); }}
                      placeholder="Adresse e-mail"
                      autoComplete="email"
                      className="mt-2.5 w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-bone placeholder:text-mist/40 text-[14px] outline-none transition-colors"
                    />
                    <input
                      type="password"
                      value={pwd}
                      onChange={(e) => { setPwd(e.target.value); setSignupErr(""); }}
                      placeholder="Mot de passe (6 caractères min.)"
                      autoComplete="new-password"
                      className="mt-2.5 w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-bone placeholder:text-mist/40 text-[14px] outline-none transition-colors"
                    />
                    {signupErr && (
                      <p className="mt-2 text-[12.5px] text-red-400/90">{signupErr}</p>
                    )}
                    <button
                      type="submit"
                      className="btn-gold mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold"
                    >
                      Créer mon compte & accéder au tableau de bord
                      <IconArrow className="h-4 w-4" />
                    </button>
                  </motion.form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </JoinCtx.Provider>
  );
}
