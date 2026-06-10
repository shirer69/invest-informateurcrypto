"use client";

import { useEffect, useState } from "react";
import TrackRecord from "@/components/TrackRecord";
import Chat from "@/components/dashboard/Chat";
import { IconArrow } from "@/components/Icons";
import { TELEGRAM_URL } from "@/lib/site";
import { getUser, logout } from "@/lib/clientStore";

// Posts VIP — exemples de démonstration (contenu éducatif, pas un conseil).
// En production : flux temps réel du canal VIP via le backend.
const VIP_POSTS = [
  {
    tag: "Macro",
    time: "Aujourd'hui · 09:12",
    title: "Brief de la semaine",
    body: "Contexte macro chargé : on reste sélectif, on privilégie les setups propres et on évite de forcer dans le bruit. Discipline avant tout.",
  },
  {
    tag: "BTC",
    time: "Hier · 21:40",
    title: "Lecture BTC — zones clés",
    body: "Réintégration au-dessus de la borne basse du range après un balayage. On surveille une confirmation avant tout positionnement, invalidation sous le plus-bas.",
  },
  {
    tag: "Indices",
    time: "Hier · 15:05",
    title: "NASDAQ — prudence post-publication",
    body: "Volatilité élevée à l'ouverture. Structure encore illisible : pas de précipitation, on laisse le marché choisir sa direction.",
  },
  {
    tag: "Gestion",
    time: "Lun · 11:20",
    title: "Rappel money management",
    body: "Risque par position défini à l'avance et faible. L'objectif n'est pas de gagner vite, c'est de durer. Protéger le capital reste la priorité.",
  },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tgLink, setTgLink] = useState(TELEGRAM_URL);

  useEffect(() => {
    setUser(getUser());
    try {
      const l = localStorage.getItem("pi_tg_link");
      if (l) setTgLink(l);
    } catch {}
  }, []);

  const name = user?.name || "Invité";

  return (
    <div className="min-h-screen aura">
      {/* top bar */}
      <header className="sticky top-0 z-40 glass border-b hairline">
        <div className="mx-auto max-w-[1180px] px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <span className="grid place-items-center h-9 w-9 rounded-[10px] border gold-line text-gold font-display text-[13px]">
              CI
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[15px] text-bone">Tableau de bord</span>
              <span className="block font-mono text-[9.5px] uppercase tracking-widest2 text-gold/80">
                Pôle Invest
              </span>
            </span>
          </a>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-mist hidden sm:inline">
              Bonjour, <span className="text-bone">{name}</span>
            </span>
            {user ? (
              <button
                onClick={() => { logout(); window.location.href = "/"; }}
                className="btn-ghost rounded-full px-4 py-2 text-[12.5px]"
              >
                Se déconnecter
              </button>
            ) : (
              <a href="/" className="btn-ghost rounded-full px-4 py-2 text-[12.5px]">
                Accueil
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-6 py-10">
        {/* welcome + CTA telegram */}
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
          <div className="rounded-2xl border hairline bg-ink-800/50 p-7">
            <span className="eyebrow">Bienvenue</span>
            <h1 className="mt-3 font-display font-light text-[28px] md:text-[34px] leading-tight tracking-tightest text-bone">
              Votre espace Pôle Invest
            </h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-mist max-w-prose2">
              Suivez le track record du portefeuille, retrouvez les dernières publications du
              groupe VIP et échangez avec les autres membres.
            </p>
          </div>

          <div className="relative rounded-2xl border gold-line overflow-hidden p-7 flex flex-col justify-between">
            <div
              className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(201,162,75,0.20), transparent 70%)" }}
            />
            <div className="relative">
              <div className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">
                Groupe privé
              </div>
              <h2 className="mt-2 font-display text-[20px] text-bone">VIP Pôle Invest</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-mist">
                Votre lien d'accès au groupe Telegram privé.
              </p>
            </div>
            <a
              href={tgLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold relative mt-5 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[14.5px] font-semibold"
            >
              Rejoindre le groupe VIP
              <IconArrow className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* track record + chat */}
        <div className="mt-5 grid lg:grid-cols-[1.5fr_1fr] gap-5 items-start">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <h2 className="font-display text-[18px] text-bone">Track record du portefeuille</h2>
            </div>
            <TrackRecord />
          </div>
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <h2 className="font-display text-[18px] text-bone">Discussion</h2>
            </div>
            <Chat me={user?.name} />
          </div>
        </div>

        {/* VIP posts */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <h2 className="font-display text-[18px] text-bone">Dernières publications · VIP Pôle Invest</h2>
            </div>
            <a href={tgLink} target="_blank" rel="noopener noreferrer"
               className="text-[12.5px] text-mist hover:text-bone transition-colors">
              Tout voir sur Telegram →
            </a>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {VIP_POSTS.map((p, i) => (
              <article key={i} className="rounded-2xl border hairline bg-ink-800/50 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80 border gold-line rounded-full px-2.5 py-0.5">
                    {p.tag}
                  </span>
                  <span className="font-mono text-[10.5px] text-mist/60">{p.time}</span>
                </div>
                <h3 className="mt-3 font-display text-[17px] text-bone">{p.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-mist">{p.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-[11.5px] text-mist/60">
            Contenu fourni à titre éducatif et informatif — ne constitue pas un conseil en
            investissement. Risque de perte en capital.
          </p>
        </div>
      </main>
    </div>
  );
}
