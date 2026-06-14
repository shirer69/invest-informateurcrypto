import { TELEGRAM_URL, YOUTUBE_URL, LINKEDIN_URL } from "@/lib/site";
import JoinButton from "./JoinButton";
import LegalDisclaimer from "./LegalDisclaimer";

export default function Footer() {
  return (
    <footer className="relative border-t hairline bg-ink-900">
      <div className="mx-auto max-w-[1180px] px-6 py-16">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-12">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid place-items-center h-9 w-9 rounded-[10px] border gold-line text-gold font-display text-[13px]">
                CI
              </span>
              <span className="leading-tight">
                <span className="block font-display text-[15px] text-bone">
                  Club des Informateurs
                </span>
                <span className="block font-mono text-[9.5px] uppercase tracking-widest2 text-gold/80">
                  Pôle Invest
                </span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-[13.5px] leading-relaxed text-mist">
              Un desk d'investissement privé pour se positionner, avec discipline, sur les
              grandes tendances du prochain cycle.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60">
              Navigation
            </h4>
            <ul className="mt-5 space-y-3 text-[14px]">
              {[
                ["Méthode", "#approche"],
                ["Membres", "#membres"],
                ["Julien Moretto", "#julien"],
                ["Vidéos", "#videos"],
                ["FAQ", "#faq"],
              ].map(([l, h]) => (
                <li key={h}>
                  <a href={h} className="text-mist hover:text-bone transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60">
              Liens
            </h4>
            <ul className="mt-5 space-y-3 text-[14px]">
              <li>
                <JoinButton className="text-mist hover:text-bone transition-colors">
                  Demander mon accès
                </JoinButton>
              </li>
              <li>
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
                   className="text-mist hover:text-bone transition-colors">
                  Telegram du club
                </a>
              </li>
              <li>
                <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer"
                   className="text-mist hover:text-bone transition-colors">
                  Chaîne YouTube
                </a>
              </li>
              <li>
                <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer"
                   className="text-mist hover:text-bone transition-colors">
                  LinkedIn — Julien Moretto
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer réglementaire */}
        <LegalDisclaimer />

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-mist/60">
          <span>© 2026 Club des Informateurs — Pôle Invest. Tous droits réservés.</span>
          <span className="font-mono">invest.informateurcrypto.fr</span>
        </div>
      </div>
    </footer>
  );
}
