import { Reveal } from "./Reveal";
import KrakenLogo from "./KrakenLogo";
import { KRAKEN_SITE } from "@/lib/site";
import { IconArrow, IconCheck } from "./Icons";

const POINTS = [
  {
    t: "Sécurité & conservation",
    d: "Haut niveau de sécurité et standards de conservation des actifs reconnus par les acteurs professionnels.",
  },
  {
    t: "Cadre réglementaire",
    d: "Statut Money Services Business (FinCEN, États-Unis), enregistrement crypto auprès de la FCA (Royaume-Uni), et KYC / AML stricts dans ses juridictions.",
  },
  {
    t: "Usage institutionnel",
    d: "Utilisée par des fonds, hedge funds, family offices, traders professionnels et entreprises pour la liquidité et l'exécution.",
  },
];

export default function Partners() {
  return (
    <section className="relative py-24 md:py-32 border-t hairline">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="max-w-2xl">
          <span className="eyebrow">Partenaire d'exécution</span>
          <h2 className="mt-5 font-display font-light text-[32px] md:text-[44px] leading-[1.08] tracking-tightest text-bone">
            Une infrastructure à la hauteur de l'ambition
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 rounded-3xl border hairline bg-ink-800/40 overflow-hidden">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              {/* Bloc marque */}
              <div className="relative p-9 md:p-11 border-b lg:border-b-0 lg:border-r hairline flex flex-col justify-between gap-8">
                <div
                  className="pointer-events-none absolute -top-16 -left-10 h-48 w-48 rounded-full blur-3xl"
                  style={{ background: "radial-gradient(circle, rgba(124,92,252,0.18), transparent 70%)" }}
                />
                <div className="relative">
                  <KrakenLogo />
                  <div className="mt-7 flex items-baseline gap-3">
                    <span className="font-display text-[40px] leading-none text-bone">2011</span>
                    <span className="text-[12.5px] text-mist">année de fondation</span>
                  </div>
                  <p className="mt-5 text-[14.5px] leading-relaxed text-mist max-w-prose2">
                    Fondée en 2011, Kraken fait partie des plateformes les plus établies du
                    secteur crypto, pensée pour les investisseurs particuliers comme
                    institutionnels.
                  </p>
                </div>
                <a
                  href={KRAKEN_SITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-[13.5px] text-bone hover:text-gold-grad transition-colors"
                >
                  kraken.com
                  <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </a>
              </div>

              {/* Points clés */}
              <div className="divide-y divide-white/[0.06]">
                {POINTS.map((p) => (
                  <div key={p.t} className="p-7 md:px-10 md:py-8">
                    <h3 className="font-display text-[18px] text-bone">{p.t}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-mist max-w-prose2">
                      {p.d}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Propfirm */}
        <Reveal delay={0.15}>
          <div className="mt-5 rounded-3xl border gold-line bg-gradient-to-b from-ink-700/60 to-ink-900 p-8 md:p-11 overflow-hidden relative">
            <div
              className="pointer-events-none absolute -bottom-20 right-0 h-56 w-56 rounded-full blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(201,162,75,0.14), transparent 70%)" }}
            />
            <div className="relative grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
              <div>
                <span className="eyebrow">Trading financé</span>
                <h3 className="mt-4 font-display font-light text-[26px] md:text-[32px] leading-tight tracking-tightest text-bone">
                  Kraken propose désormais une propfirm
                </h3>
                <p className="mt-4 text-[14.5px] leading-relaxed text-mist max-w-prose2">
                  Au-delà de l'investissement, Kraken ouvre l'accès à un programme de
                  trading financé (propfirm) : tradez un capital alloué et conservez une
                  part des gains, sous des règles de risque strictes. C'est précisément le
                  terrain où l'approche de Julien fait la différence.
                </p>
                <p className="mt-3 text-[14.5px] leading-relaxed text-mist max-w-prose2">
                  Money management rigoureux, faible leverage, absence de FOMO : une
                  discipline taillée pour <span className="text-bone">passer les
                  évaluations et exploiter durablement un compte financé</span>, là où
                  l'overtrading élimine la majorité des candidats.
                </p>
              </div>
              <ul className="space-y-3.5">
                {[
                  "Capital alloué — gains partagés",
                  "Règles de risque strictes, respectées par construction",
                  "Stratégie faible leverage compatible avec les évaluations",
                  "Discipline pensée pour la durée, pas pour le coup d'éclat",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-3 text-[14.5px] text-bone">
                    <span className="mt-0.5 grid place-items-center h-6 w-6 shrink-0 rounded-full border gold-line text-gold">
                      <IconCheck className="h-3.5 w-3.5" />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
