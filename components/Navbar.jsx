"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useJoin } from "./JoinProvider";

const LINKS = [
  { label: "Membres", href: "#membres" },
  { label: "Julien M.", href: "#julien" },
  { label: "Vidéos", href: "#videos" },
  { label: "Méthode", href: "#approche" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { open: openJoin } = useJoin();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <span className="grid place-items-center h-9 w-9 rounded-[10px] border gold-line text-gold font-display text-[13px] leading-none">
            CI
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[15px] tracking-tight text-bone">
              Club des Informateurs
            </span>
            <span className="block font-mono text-[9.5px] uppercase tracking-widest2 text-gold/80">
              Pôle Invest
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
          <button
            onClick={openJoin}
            className="btn-gold hidden sm:inline-flex rounded-full px-5 py-2.5 text-[13px] font-semibold"
          >
            Demander mon accès
          </button>
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
            <button
              onClick={() => {
                setOpen(false);
                openJoin();
              }}
              className="btn-gold rounded-full px-5 py-3 text-center text-sm mt-1 font-semibold"
            >
              Demander mon accès au Pôle Invest
            </button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
