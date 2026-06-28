import { Reveal, Stagger, StaggerItem } from "./Reveal";

const PILLARS = [
  { k: "01", t: "Intelligence artificielle", d: "Le socle applicatif et computationnel de la décennie." },
  { k: "02", t: "Infrastructures semi-conducteurs", d: "La rente physique qui alimente toute la chaîne IA." },
  { k: "03", t: "Actifs numériques", d: "Un cycle d'adoption institutionnelle encore inachevé." },
  { k: "04", t: "Tech américaine sélective", d: "Quelques sociétés capables de capturer la création de valeur." },
  { k: "05", t: "Narratifs macro asymétriques", d: "Se positionner là où le rapport risque / rendement est déséquilibré." },
];

export default function WhyNow() {
  return (
    <section className="relative py-24 md:py-32 border-t hairline">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 lg:gap-20">
          <div>
            <Reveal>
              <span className="eyebrow">Le bon moment</span>
              <h2 className="mt-5 font-display font-light text-[32px] md:text-[44px] leading-[1.08] tracking-tightest text-bone">
                Pourquoi nous lançons Cycle Partners maintenant
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-mist max-w-prose2">
                <p>Cycle Partners est un micro edge fund co-fondé par Julien Moretto, gérant de portefeuille et conseiller financier indépendant.</p>
                <p>
                  Notre thèse est simple :{" "}
                  <span className="text-bone">
                    les rendements asymétriques se capturent avant que le consensus
                    ne valide une tendance — pas après.
                  </span>
                </p>
                <p>
                  Nous gérons un portefeuille concentré sur un nombre restreint de thèses
                  structurelles à fort différentiel d&apos;information, avec une discipline
                  de gestion du risque empruntée à l&apos;institutional trading.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <blockquote className="mt-10 border-l-2 gold-line pl-6">
                <p className="font-display italic text-[20px] md:text-[23px] leading-snug text-bone">
                  « Les achats des quatre prochains mois détermineront votre rentabilité
                  sur les quatre prochaines années. »
                </p>
              </blockquote>
            </Reveal>
          </div>

          <Stagger className="grid sm:grid-cols-2 gap-px rounded-2xl overflow-hidden border hairline bg-white/[0.02]">
            {PILLARS.map((p) => (
              <StaggerItem
                key={p.k}
                className="group bg-ink-800/60 p-7 hover:bg-ink-700/60 transition-colors duration-500"
              >
                <span className="font-mono text-[11px] text-gold/70">{p.k}</span>
                <h3 className="mt-4 font-display text-[19px] text-bone">{p.t}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-mist">{p.d}</p>
                <span className="mt-5 block h-px w-10 bg-gold/30 group-hover:w-20 transition-all duration-500" />
              </StaggerItem>
            ))}
            <StaggerItem className="bg-ink-800/60 p-7 flex flex-col justify-center">
              <p className="text-[13.5px] leading-relaxed text-mist">
                <span className="text-bone">Objectif —</span> construire des positions de
                conviction, pas réagir au bruit quotidien des marchés.
              </p>
            </StaggerItem>
          </Stagger>
        </div>
      </div>
    </section>
  );
}
