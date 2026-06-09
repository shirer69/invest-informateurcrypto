"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KRAKEN_URL, TELEGRAM_URL, REFERRAL_CODE } from "@/lib/site";
import { IconArrow } from "./Icons";

const JoinCtx = createContext({ open: () => {} });
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
    t: "Envoyer votre UID Kraken (identifiant IIBAN)",
    d: "Transmettez votre UID Kraken (identifiant IIBAN) sur notre Telegram pour validation.",
    cta: { label: "Contacter sur Telegram", href: TELEGRAM_URL },
  },
  {
    n: "3",
    t: "Vérifier votre statut & recevoir l'accès",
    d: "Saisissez votre UID Kraken ci-dessous : si votre attribution est active, vous recevez instantanément votre lien Telegram privé.",
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

  const open = useCallback(() => {
    setOpen(true);
    setError(false);
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
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await res.json();
      if (data.status === "active") {
        setInviteLink(data.link || "");
        setVState("active");
      } else if (data.status === "invalid") {
        setVState("invalid");
      } else {
        setVState("notfound");
      }
    } catch {
      setVState("error");
    }
  };

  const submitCode = (e) => {
    e.preventDefault();
    if (code.trim().toUpperCase() === REFERRAL_CODE) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <JoinCtx.Provider value={{ open }}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] grid place-items-center p-4"
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
              className="relative w-full max-w-lg rounded-3xl border gold-line bg-ink-800/95 shadow-2xl overflow-hidden"
            >
              <div
                className="pointer-events-none absolute -top-20 -right-10 h-52 w-52 rounded-full blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(201,162,75,0.20), transparent 70%)" }}
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
                      Entrez votre code parrain
                    </h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-mist">
                      L'accès au Pôle Invest se fait sur parrainage. Saisissez votre code
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
                        placeholder="CODE PARRAIN"
                        className={`w-full rounded-xl bg-ink-900 border px-4 py-3.5 text-bone placeholder:text-mist/40 font-mono tracking-[0.18em] uppercase outline-none transition-colors ${
                          error ? "border-red-500/60" : "border-white/10 focus:border-gold/50"
                        }`}
                      />
                      {error && (
                        <p className="mt-2.5 text-[12.5px] text-red-400/90">
                          Code parrain invalide. Vérifiez auprès de votre parrain.
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
                  <motion.div
                    key="steps"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease }}
                  >
                    <h3 className="font-display font-light text-[26px] leading-tight tracking-tightest text-bone">
                      Trois étapes pour rejoindre{" "}
                      <span className="text-mist">(5 min)</span>
                    </h3>
                    <p className="mt-3 text-[13.5px] leading-relaxed text-mist">
                      Suivez ces étapes dans l'ordre. L'accès est activé après validation de
                      votre dépôt.
                    </p>

                    <div className="mt-4 flex items-center gap-3 rounded-2xl border gold-line bg-gold/[0.06] px-4 py-3">
                      <span className="font-display text-[34px] leading-none text-gold-grad">5 $</span>
                      <span className="text-[13px] leading-snug text-bone">
                        Dépôt minimum
                        <span className="block text-[11.5px] text-mist">ticket d'entrée pour accéder au Pôle Invest</span>
                      </span>
                    </div>

                    <div className="mt-6 space-y-3">
                      {STEPS.map((s) => (
                        <div
                          key={s.n}
                          className="flex gap-4 rounded-2xl border hairline bg-white/[0.02] p-4"
                        >
                          <span className="grid place-items-center h-8 w-8 shrink-0 rounded-full border gold-line text-gold font-mono text-[13px]">
                            {s.n}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-display text-[16px] text-bone">{s.t}</h4>
                            <p className="mt-1 text-[13px] leading-relaxed text-mist">{s.d}</p>
                            {s.cta && (
                              <a
                                href={s.cta.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group mt-2.5 inline-flex items-center gap-1.5 text-[12.5px] text-gold hover:text-gold-soft transition-colors"
                              >
                                {s.cta.label}
                                <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Vérification de l'UID */}
                    {vState !== "active" ? (
                      <form onSubmit={verifyUid} className="mt-5 rounded-2xl border gold-line bg-gold/[0.05] p-4">
                        <label className="font-mono text-[10.5px] uppercase tracking-widest2 text-gold/80">
                          Déjà déposé ? Obtenez votre accès
                        </label>
                        <div className="mt-2.5 flex gap-2">
                          <input
                            value={uid}
                            onChange={(e) => {
                              setUid(e.target.value);
                              if (vState !== "idle" && vState !== "checking") setVState("idle");
                            }}
                            placeholder="UID Kraken (identifiant IIBAN)"
                            className="flex-1 min-w-0 rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-bone placeholder:text-mist/40 font-mono text-[13px] tracking-wide outline-none transition-colors"
                          />
                          <button
                            type="submit"
                            disabled={vState === "checking"}
                            className="btn-gold shrink-0 rounded-xl px-5 py-3 text-[13.5px] font-semibold disabled:opacity-60"
                          >
                            {vState === "checking" ? "Vérification…" : "Vérifier"}
                          </button>
                        </div>
                        {vState === "notfound" && (
                          <p className="mt-2.5 text-[12.5px] text-amber-300/90">
                            Attribution introuvable ou pas encore active. Si vous venez de
                            déposer, patientez puis réessayez — ou contactez-nous sur{" "}
                            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="underline decoration-gold/40 text-gold">Telegram</a>.
                          </p>
                        )}
                        {vState === "invalid" && (
                          <p className="mt-2.5 text-[12.5px] text-red-400/90">
                            Saisissez un identifiant valide (au moins les 4 derniers caractères de votre IIBAN).
                          </p>
                        )}
                        {vState === "error" && (
                          <p className="mt-2.5 text-[12.5px] text-red-400/90">
                            Erreur de vérification. Réessayez dans un instant.
                          </p>
                        )}

                        <a
                          href={KRAKEN_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-mist hover:text-bone transition-colors"
                        >
                          Pas encore de compte ? Créer mon compte Kraken
                          <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </a>
                      </form>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-5 rounded-2xl border gold-line bg-gold/[0.08] p-5 text-center"
                      >
                        <div className="text-[13px] text-gold font-mono uppercase tracking-widest2">
                          Statut : actif ✓
                        </div>
                        <p className="mt-2 text-[14px] text-bone">
                          Votre accès est validé. Rejoignez le groupe privé du Pôle Invest :
                        </p>
                        <a
                          href={inviteLink || TELEGRAM_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-gold mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold"
                        >
                          Accéder au groupe privé
                          <IconArrow className="h-4 w-4" />
                        </a>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </JoinCtx.Provider>
  );
}
