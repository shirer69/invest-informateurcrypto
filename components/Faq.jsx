"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { IconPlus } from "./Icons";

const QA = [
  {
    q: "Est-ce du trading de signaux ?",
    a: "Non. Nous partageons une approche d'investissement structurée : des thèses, un contexte macro et une gestion du risque — pas un flux de signaux à exécuter à l'aveugle.",
  },
  {
    q: "Quel niveau faut-il avoir ?",
    a: "Du débutant à l'avancé. Le raisonnement est toujours explicité, afin que chacun comprenne le « pourquoi » derrière chaque positionnement.",
  },
  {
    q: "Quel capital minimum ?",
    a: "Flexible. L'accès est conçu pour rester ouvert, avec un dépôt minimum volontairement bas (à partir de 5 $).",
  },
  {
    q: "Pourquoi Kraken ?",
    a: "Pour la simplicité d'accès et une infrastructure d'exchange reconnue, adaptée aussi bien aux débutants qu'aux profils plus avancés.",
  },
  {
    q: "Est-ce garanti ?",
    a: "Non. Aucun investissement n'est garanti. Tout placement comporte un risque de perte en capital, et les performances passées ne préjugent pas des performances futures.",
  },
];

function Item({ q, a, open, onClick }) {
  return (
    <div className="border-b hairline">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-6 py-6 text-left group"
      >
        <span className="font-display text-[18px] md:text-[21px] text-bone group-hover:text-gold-grad transition-colors">
          {q}
        </span>
        <span
          className={`grid place-items-center h-8 w-8 rounded-full border gold-line text-gold shrink-0 transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          <IconPlus className="h-4 w-4" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-7 pr-12 text-[15px] leading-relaxed text-mist max-w-prose2">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative py-24 md:py-32 border-t hairline">
      <div className="mx-auto max-w-[1180px] px-6 grid lg:grid-cols-[0.7fr_1.3fr] gap-12 lg:gap-20">
        <Reveal>
          <span className="eyebrow">Questions fréquentes</span>
          <h2 className="mt-5 font-display font-light text-[32px] md:text-[44px] leading-[1.08] tracking-tightest text-bone">
            Ce qu'il faut savoir avant d'entrer
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div>
            {QA.map((item, i) => (
              <Item
                key={item.q}
                {...item}
                open={open === i}
                onClick={() => setOpen(open === i ? -1 : i)}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
