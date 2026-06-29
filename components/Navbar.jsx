"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useJoin } from "./JoinProvider";
import LogoMark from "./LogoMark";
import LoginModal from "./dashboard/LoginModal";
import { getToken } from "@/lib/clientStore";

const LINKS = [
  { label: "Membres", href: "#membres" },
  { label: "À propos", href: "/a-propos" },
  { label: "Vidéos", href: "#videos" },
  { label: "Méthode", href: "#approche" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [logged, setLogged] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const { open: openJoin } = useJoin();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    setLogged(!!getToken());
    try {
      setVisitCount(parseInt(localStorage.getItem("pi_tg_visit_count") || "0", 10));
    } catch {}
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showAccessBtn = !logged && visitCount >= 6;

  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3 glass border-b" : "py-5 bg-transparent border-b border-transparent"
      }`}
      style={{ borderColor: scrolled ? "rgba(255,255,255,0.07)" : "transparent" }}
    >
      <nav className="mx-auto max-w-[1180px] px-6 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3 group">
          <LogoMark className="hidden sm:block h-12 w-12" />
          <span className="leading-tight">
            <span className="block font-display text-[15px] tracking-tight text-bone">
              Club des Informateurs
            </span>
            <span className="block font-mono text-[9.5px] uppercase tracking-widest2 text-gold/80">
              Julien M. — Club des Informateurs
            </span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-9">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13.5px] text-mist hover:text-bone transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {showAccessBtn && (
            <button
              onClick={openJoin}
              className="btn-ghost hidden sm:inline-flex rounded-full px-5 py-2.5 text-[13px]"
            >
              Devenir membre
            </button>
          )}
          {showAccessBtn && (
            <button
              onClick={openJoin}
              className="btn-gold hidden sm:inline-flex rounded-full px-5 py-2.5 text-[13px] font-semibold"
            >
              Demander mon accès
            </button>
          )}
          {!showAccessBtn && (
            <a
              href="/dashboard?tab=portfolio"
              className="btn-gold hidden sm:inline-flex rounded-full px-5 py-2.5 text-[13px] font-semibold"
            >
              Démarrer l&apos;app
            </a>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden h-10 w-10 grid place-items-center rounded-lg border hairline text-bone"
            aria-label="Menu"
          >
            <span className="block w-4 h-px bg-bone relative before:absolute before:-top-1.5 before:left-0 before:w-4 before:h-px before:bg-bone after:absolute after:top-1.5 after:left-0 after:w-4 after:h-px after:bg-bone" />
          </button>
        </div>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden glass border-t hairline mt-3"
        >
          <div className="px-6 py-5 flex flex-col gap-4">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-bone/90 text-[15px]"
              >
                {l.label}
              </a>
            ))}
            {showAccessBtn ? (
              <>
                <button
                  onClick={() => { setOpen(false); openJoin(); }}
                  className="btn-ghost rounded-full px-5 py-3 text-center text-sm mt-1"
                >
                  Devenir membre
                </button>
                <button
                  onClick={() => { setOpen(false); openJoin(); }}
                  className="btn-gold rounded-full px-5 py-3 text-center text-sm font-semibold"
                >
                  Demander mon accès à Club des Informateurs
                </button>
              </>
            ) : (
              <a
                href="/dashboard?tab=portfolio"
                onClick={() => setOpen(false)}
                className="btn-gold rounded-full px-5 py-3 text-center text-sm font-semibold mt-1"
              >
                Démarrer l&apos;app
              </a>
            )}
          </div>
        </motion.div>
      )}

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </motion.header>
  );
}
