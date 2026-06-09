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
    d: "Inscrivez-vous via notre lien partenaire et effectuez un dépôt (5 $ minimum).",
    cta: { label: "Ouvrir Kraken", href: KRAKEN_URL },
  },
  {
    n: "2",
    t: "Envoyer votre UID Kraken",
    d: "Transmettez votre UID Kraken (identifiant de compte) sur notre Telegram pour validation.",
    cta: { label: "Contacter sur Telegram", href: TELEGRAM_URL },
  },
  {
    n: "3",
    t: "Recevez votre accès privé",
    d: "Vous recevez votre lien Telegram vers le groupe privé du Pôle Invest.",
  },
];

export default function JoinProvider({ children }) {
  const [isOpen, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

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
    }, 350);
  }, []);

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
                      Trois étapes pour rejoindre
                    </h3>
                    <p className="mt-3 text-[13.5px] leading-relaxed text-mist">
                      Suivez ces étapes dans l'ordre. L'accès est activé après validation de
                      votre dépôt.
                    </p>

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

                    <a
                      href={KRAKEN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px]"
                    >
                      Commencer maintenant — créer mon compte Kraken
                      <IconArrow className="h-4 w-4" />
                    </a>
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
