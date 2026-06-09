"use client";

import { motion } from "framer-motion";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { IconArrow } from "./Icons";
import { useJoin } from "./JoinProvider";

const STEPS = [
  {
    n: "01",
    t: "Créer un compte Kraken",
    d: "Inscription via notre lien partenaire et dépôt à partir de 5 $, sur une infrastructure d'exchange reconnue.",
  },
  {
    n: "02",
    t: "Envoyer votre UID Kraken (identifiant IIBAN)",
    d: "Transmettez votre UID Kraken (identifiant IIBAN) sur notre Telegram pour validation de votre adhésion.",
  },
  {
    n: "03",
    t: "Recevoir l'accès privé",
    d: "Vous recevez votre lien Telegram vers le groupe privé du Pôle Invest.",
  },
];

export default function HowToJoin() {
  const { open: openJoin } = useJoin();
  return (
    <section className="relative py-24 md:py-32 border-t hairline">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="max-w-2xl">
          <span className="eyebrow">Adhésion</span>
          <h2 className="mt-5 font-display font-light text-[32px] md:text-[44px] leading-[1.08] tracking-tightest text-bone">
            Rejoindre le Pôle Invest en trois étapes
          </h2>
        </Reveal>

        <Stagger className="mt-14 grid md:grid-cols-3 gap-5">
          {STEPS.map((s) => (
            <StaggerItem
              key={s.n}
              className="relative rounded-2xl border hairline bg-ink-800/50 p-8"
            >
              <span className="font-display text-[40px] leading-none text-gold-grad">
                {s.n}
              </span>
              <h3 className="mt-5 font-display text-[21px] text-bone">{s.t}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-mist">{s.d}</p>
            </StaggerItem>
          ))}
        </Stagger>

        {/* CTA bloc */}
        <Reveal delay={0.1}>
          <motion.div className="relative mt-12 rounded-3xl border gold-line overflow-hidden">
            <div
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                background:
                  "radial-gradient(80% 120% at 80% -20%, rgba(201,162,75,0.18), transparent 55%), radial-gradient(60% 100% at 0% 120%, rgba(201,162,75,0.08), transparent 60%)",
              }}
            />
            <div className="relative px-8 md:px-14 py-12 md:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="max-w-xl">
                <h3 className="font-display font-light text-[28px] md:text-[36px] leading-tight tracking-tightest text-bone">
                  Le prochain cycle ne préviendra pas.
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-mist">
                  Positionnez-vous avant qu'il ne devienne évident. Accès à partir d'un
                  dépôt de 5 $.
                </p>
              </div>
              <button
                onClick={openJoin}
                className="btn-gold group inline-flex items-center justify-center gap-2.5 rounded-full px-9 py-4 text-[16px] font-semibold whitespace-nowrap"
              >
                Demander mon accès
                <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
