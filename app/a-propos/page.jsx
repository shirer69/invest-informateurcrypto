import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FounderPhoto from "@/components/FounderPhoto";
import FrenchFlag from "@/components/FrenchFlag";
import { IconLinkedin } from "@/components/Icons";
import { LINKEDIN_URL } from "@/lib/site";
import JoinProvider from "@/components/JoinProvider";

export const metadata = {
  title: "À propos — Julien Moretto | Club des Informateurs",
  description: "Conseiller financier indépendant, analyste crypto, trader financé. Découvrez le parcours de Julien Moretto, co-fondateur de Club des Informateurs.",
};

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
    desc: "Cabinet de gestion pilotant une vingtaine de portefeuilles clients, en plus du Pôle Invest et d'un compte propre avec track record sur +3 ans.",
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

const VALUES = [
  {
    icon: "🎯",
    title: "Transparence totale",
    desc: "Track record public, positions en temps réel, résultats réels — pas de marketing, que des faits.",
  },
  {
    icon: "⚖️",
    title: "Rigueur institutionnelle",
    desc: "Méthodes issues de la gestion de patrimoine et du trading financé, adaptées aux crypto-actifs.",
  },
  {
    icon: "🔄",
    title: "Accompagnement continu",
    desc: "Analyses vocales quotidiennes, groupe VIP Telegram et copy-trading pour suivre chaque décision.",
  },
];

export default function APropos() {
  return (
    <JoinProvider>
      <div className="min-h-screen aura">
        <Navbar />

        {/* Hero */}
        <section className="pt-36 pb-16 md:pt-44 md:pb-24 border-b hairline">
          <div className="mx-auto max-w-[1180px] px-6">
            <span className="eyebrow">À propos</span>
            <h1 className="mt-5 font-display font-light text-[36px] md:text-[54px] leading-[1.06] tracking-tightest text-bone max-w-2xl">
              Julien Moretto
            </h1>
            <p className="mt-4 text-[16px] md:text-[18px] text-gold font-medium">
              Conseiller financier indépendant — CIF
            </p>
          </div>
        </section>

        {/* Contenu principal */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-[1180px] px-6 grid lg:grid-cols-[0.85fr_1.15fr] gap-14 lg:gap-20">

            {/* Carte profil */}
            <div className="lg:sticky lg:top-28 self-start">
              <div className="relative rounded-2xl glass overflow-hidden">
                <FounderPhoto src="/julien.jpg" alt="Julien Moretto" />
                <div className="p-6">
                  <h2 className="font-display text-2xl text-bone">Julien Moretto</h2>
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

                  <div className="mt-6 space-y-3">
                    <a
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[13.5px]"
                    >
                      <IconLinkedin className="h-4 w-4" /> Voir le profil LinkedIn
                    </a>
                    <a
                      href="/dashboard"
                      className="btn-gold inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[13.5px] font-semibold"
                    >
                      Accéder au dashboard
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Récit + timeline */}
            <div>
              <span className="eyebrow">Lead portfolio manager</span>
              <h2 className="mt-5 font-display font-light text-[28px] md:text-[40px] leading-[1.08] tracking-tightest text-bone">
                Une expérience construite des deux côtés du marché
              </h2>
              <p className="mt-6 text-[16px] leading-relaxed text-mist max-w-prose2">
                De la recherche crypto chez Coinhouse à la gestion de patrimoine, jusqu'au
                trading financé : un parcours qui mêle rigueur institutionnelle et
                compréhension fine des cycles d'actifs numériques. Aujourd'hui, Julien dirige
                un cabinet de gestion suivant une vingtaine de portefeuilles clients.
              </p>

              {/* Timeline */}
              <div className="mt-12 relative">
                <span className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-gold/40 via-white/10 to-transparent" />
                <div className="space-y-9">
                  {TIMELINE.map((t) => (
                    <div key={t.title} className="relative pl-10">
                      <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-gold bg-ink-900" />
                      <div className="font-mono text-[10.5px] uppercase tracking-widest2 text-gold/70">
                        {t.period}
                      </div>
                      <h3 className="mt-1.5 font-display text-[20px] text-bone">{t.title}</h3>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-mist max-w-prose2">
                        {t.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Valeurs */}
              <div className="mt-16">
                <h3 className="font-display text-[22px] text-bone mb-8">Mes engagements</h3>
                <div className="space-y-5">
                  {VALUES.map((v) => (
                    <div key={v.title} className="flex gap-4 rounded-2xl border hairline bg-ink-800/40 p-5">
                      <span className="text-[24px] shrink-0">{v.icon}</span>
                      <div>
                        <h4 className="font-display text-[16px] text-bone">{v.title}</h4>
                        <p className="mt-1.5 text-[13.5px] leading-relaxed text-mist">{v.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="mt-14 rounded-2xl border gold-line bg-gold/[0.05] p-8">
                <h3 className="font-display text-[22px] text-bone">Rejoindre le Pôle Invest</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-mist max-w-prose2">
                  Accédez au dashboard en temps réel, aux analyses de Julien, au copy-trading automatique et au groupe VIP Telegram.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="/dashboard" className="btn-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold">
                    Accéder au dashboard
                  </a>
                  <a href="/" className="btn-ghost inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px]">
                    ← Retour à l'accueil
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </JoinProvider>
  );
}
