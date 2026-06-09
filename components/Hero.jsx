"use client";

import { motion } from "framer-motion";
import TrackRecord from "./TrackRecord";
import { TRUST } from "@/lib/site";
import { IconArrow } from "./Icons";
import { useJoin } from "./JoinProvider";
import FrenchFlag from "./FrenchFlag";

const ease = [0.22, 1, 0.36, 1];

export default function Hero() {
  const { open: openJoin } = useJoin();
  return (
    <section id="top" className="relative aura pt-36 md:pt-44 pb-20 md:pb-28">
      {/* fine vertical guide lines */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.5]">
        <div className="mx-auto max-w-[1180px] h-full px-6 grid grid-cols-12">
          {Array.from({ length: 13 }).map((_, i) => (
            <div key={i} className="border-l border-white/[0.025] h-full" />
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-[1180px] px-6 grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="inline-flex items-center gap-3 rounded-full border gold-line px-4 py-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            <span className="eyebrow !text-[10px] !tracking-[0.24em]">
              Desk d'investissement privé · sur invitation
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.08, ease }}
            className="mt-7 font-display font-light tracking-tightest text-[40px] leading-[1.04] sm:text-[54px] md:text-[62px] text-bone"
          >
            Le prochain cycle se prépare{" "}
            <span className="italic text-gold-grad">avant qu'il ne commence.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease }}
            className="mt-7 max-w-prose2 text-[16.5px] leading-relaxed text-mist"
          >
            Un espace d'investissement privé piloté par{" "}
            <span className="text-bone">Julien Moretto</span> pour se positionner sur les
            grandes tendances : crypto, intelligence artificielle, actions US,
            semi-conducteurs et narratives macro du prochain cycle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.32, ease }}
            className="mt-9 flex flex-wrap items-center gap-3.5"
          >
            <button
              onClick={openJoin}
              className="btn-gold group inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-[15.5px] font-semibold"
            >
              Demander mon accès au Pôle Invest
              <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>
            <a
              href="#approche"
              className="btn-ghost inline-flex items-center gap-2 rounded-full px-7 py-4 text-[15px]"
            >
              Découvrir la méthode
            </a>
          </motion.div>

          {/* trust strip */}
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-11 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 border-t hairline pt-7"
          >
            {TRUST.map((t) => (
              <li key={t.label} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-gold shrink-0" />
                <span className="text-[12.5px] leading-snug text-mist">
                  {t.label}
                  {t.flag && <FrenchFlag className="h-3 w-[18px] ml-1.5" />}
                </span>
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.3, ease }}
        >
          <TrackRecord />
        </motion.div>
      </div>
    </section>
  );
}
