"use client";

import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { TESTIMONIALS } from "@/lib/testimonials";

const ease = [0.22, 1, 0.36, 1];

function Quote({ name, text, link, i }) {
  const initials = name
    .replace(/[^A-Za-zÀ-ÿ ]/g, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <motion.figure
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease }}
      className="mb-5 break-inside-avoid rounded-2xl border hairline bg-ink-800/50 p-6 hover:border-gold/25 transition-colors duration-500"
    >
      <span className="font-display text-3xl leading-none text-gold/40">“</span>
      <blockquote className="mt-1 text-[14px] leading-relaxed text-bone/90">
        {text}
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="grid place-items-center h-9 w-9 rounded-full border gold-line text-gold font-mono text-[11px]">
          {initials}
        </span>
        <span className="text-[13px] text-mist">{name}</span>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] text-mist hover:text-bone transition-colors"
            title="Voir le message sur Telegram"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#229ED9" aria-hidden="true">
              <path d="M9.04 15.47 8.7 20.3c.46 0 .66-.2.9-.43l2.16-2.07 4.48 3.28c.82.45 1.41.21 1.63-.76l2.95-13.81c.26-1.2-.44-1.67-1.24-1.38L2.5 9.66c-1.18.46-1.16 1.12-.2 1.42l4.71 1.47L17.9 6.6c.5-.33.96-.15.58.18z" />
            </svg>
            Voir sur Telegram
          </a>
        )}
      </figcaption>
    </motion.figure>
  );
}

export default function Testimonials() {
  return (
    <section className="relative py-24 md:py-32 border-t hairline">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="max-w-2xl">
          <span className="eyebrow">Paroles de membres</span>
          <h2 className="mt-5 font-display font-light text-[32px] md:text-[44px] leading-[1.08] tracking-tightest text-bone">
            Ce que disent les membres
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-mist">
            Des retours libres et non filtrés, partagés par les co-investisseurs de Cycle Partners. La rigueur
            du money management revient dans presque chaque message.
          </p>
        </Reveal>

        <div className="mt-14 columns-1 md:columns-2 lg:columns-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <Quote key={t.name} {...t} i={i} />
          ))}
        </div>

        <p className="mt-6 text-[11.5px] text-mist/60">
          Témoignages de co-investisseurs de Cycle Partners. Les expériences individuelles ne
          constituent pas une garantie de résultat.
        </p>
      </div>
    </section>
  );
}
