import { Reveal, Stagger, StaggerItem } from "./Reveal";
import {
  IconPortfolio,
  IconSwing,
  IconThesis,
  IconAlert,
  IconCycle,
  IconVault,
} from "./Icons";

const ITEMS = [
  {
    Icon: IconPortfolio,
    t: "Portefeuille moyen / long terme",
    d: "Construire des positions de conviction sur les tendances structurelles, avec une logique de cycle.",
  },
  {
    Icon: IconSwing,
    t: "Swing à faible leverage",
    d: "Capturer des opportunités tactiques sans jamais basculer dans une approche casino.",
  },
  {
    Icon: IconThesis,
    t: "Analyses institutionnelles",
    d: "Thèses détaillées, contexte macro et raisonnement — le « pourquoi » avant le « quoi ».",
  },
  {
    Icon: IconAlert,
    t: "Alertes & timing",
    d: "Points d'entrée, niveaux d'invalidation et gestion du risque, communiqués avec discipline.",
  },
  {
    Icon: IconCycle,
    t: "Vision du cycle",
    d: "Comprendre les narratifs majeurs avant qu'ils ne deviennent le sujet du grand public.",
  },
  {
    Icon: IconVault,
    t: "Communauté privée",
    d: "Un cercle restreint, réservé aux membres, sans bruit ni promesses irréalistes.",
  },
];

export default function Membership() {
  return (
    <section id="membres" className="relative py-24 md:py-32 border-t hairline">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="max-w-2xl">
          <span className="eyebrow">Accès membre</span>
          <h2 className="mt-5 font-display font-light text-[32px] md:text-[44px] leading-[1.08] tracking-tightest text-bone">
            Ce que reçoivent les membres
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-mist">
            Un dispositif complet, pensé comme un desk d'investissement — et non comme un
            flux de signaux décontextualisés.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ITEMS.map(({ Icon, t, d }) => (
            <StaggerItem
              key={t}
              className="group relative rounded-2xl border hairline bg-ink-800/50 p-7 hover:border-gold/30 transition-all duration-500 overflow-hidden"
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "radial-gradient(circle, rgba(46,230,168,0.16), transparent 70%)" }}
              />
              <span className="grid place-items-center h-12 w-12 rounded-xl border gold-line text-gold">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-6 font-display text-[20px] text-bone">{t}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-mist">{d}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
