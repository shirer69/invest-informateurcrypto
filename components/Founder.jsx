import { Reveal, Stagger, StaggerItem } from "./Reveal";
import FounderPhoto from "./FounderPhoto";
import FrenchFlag from "./FrenchFlag";
import { IconLinkedin } from "./Icons";
import { LINKEDIN_URL } from "@/lib/site";

const CREDENTIALS = [
  { label: "Certification AMF", flag: true },
  { label: "4 ans analyste crypto chez Coinhouse" },
  { label: "Membre ANACOFI" },
  { label: "ESCP Business School — Finance de marché" },
];

const TIMELINE = [
  {
    period: "Aujourd'hui",
    title: "Conseiller financier indépendant — CIF",
    desc: "Co-fondateur de Cycle Partners. Pilote un portefeuille de conviction concentré et accompagne une vingtaine de clients en gestion privée, avec un track record public sur +3 ans.",
  },
  {
    period: "+2 ans",
    title: "Trader financé — propfirm",
    desc: "Gestion de capital alloué, sous contraintes de risque institutionnelles.",
  },
  {
    period: "2 ans",
    title: "Gestion de patrimoine — Private Equity",
    desc: "Structuration d'allocations long terme pour une clientèle privée.",
  },
  {
    period: "4 ans",
    title: "Analyste crypto — Coinhouse",
    desc: "Recherche et analyse au sein de l'exchange fondé par Éric Larchevêque.",
  },
];

export default function Founder() {
  return (
    <section id="julien" className="relative py-24 md:py-32 border-t hairline aura">
      <div className="mx-auto max-w-[1180px] px-6 grid lg:grid-cols-[0.85fr_1.15fr] gap-14 lg:gap-20">
        {/* Carte profil */}
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <div className="relative rounded-2xl glass overflow-hidden">
              <FounderPhoto src="/julien.jpg" alt="Julien Moretto" />
              <div className="p-6">
                <h3 className="font-display text-2xl text-bone">Julien Moretto</h3>
                <p className="mt-1 text-[13.5px] text-gold">Conseiller financier indépendant</p>

                <ul className="mt-5 space-y-2.5">
                  {CREDENTIALS.map((c) => (
                    <li key={c.label} className="flex items-start gap-2.5 text-[13px] text-mist">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-gold shrink-0" />
                      <span>
                        {c.label}
                        {c.flag && <FrenchFlag className="h-3 w-[18px] ml-1.5" />}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[13.5px]"
                  >
                    <IconLinkedin className="h-4 w-4" /> Voir le profil LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Récit + timeline */}
        <div>
          <Reveal>
            <span className="eyebrow">Co-fondateur — Cycle Partners</span>
            <h2 className="mt-5 font-display font-light text-[32px] md:text-[44px] leading-[1.08] tracking-tightest text-bone">
              Une expérience construite des deux côtés du marché
            </h2>
            <p className="mt-6 text-[16px] leading-relaxed text-mist max-w-prose2">
              De la recherche crypto chez Coinhouse à la gestion de patrimoine privé, jusqu&apos;au
              trading financé sur propfirm : un parcours qui mêle rigueur institutionnelle et
              compréhension fine des cycles d&apos;actifs. Co-fondateur de Cycle Partners,
              Julien pilote aujourd&apos;hui un portefeuille de conviction concentré sur les
              thèses structurelles du prochain cycle.
            </p>
          </Reveal>

          <Stagger className="mt-12 relative">
            <span className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-gold/40 via-white/10 to-transparent" />
            <div className="space-y-9">
              {TIMELINE.map((t) => (
                <StaggerItem key={t.title} className="relative pl-10">
                  <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-gold bg-ink-900" />
                  <div className="font-mono text-[10.5px] uppercase tracking-widest2 text-gold/70">
                    {t.period}
                  </div>
                  <h3 className="mt-1.5 font-display text-[20px] text-bone">{t.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-mist max-w-prose2">
                    {t.desc}
                  </p>
                </StaggerItem>
              ))}
            </div>
          </Stagger>
        </div>
      </div>
    </section>
  );
}
