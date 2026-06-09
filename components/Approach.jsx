import { Reveal } from "./Reveal";
import { IconCheck, IconCross } from "./Icons";

const OTHERS = [
  "Meme coins",
  "Leverage excessif",
  "Dopamine trading",
  "Hype Twitter",
  "Signaux sans contexte",
];

const OURS = [
  "Investissement structuré",
  "Approche disciplinée",
  "Faible leverage",
  "Narration macro",
  "Asymétrie du risque",
  "Vision moyen / long terme",
];

export default function Approach() {
  return (
    <section id="approche" className="relative py-24 md:py-32 border-t hairline">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="max-w-2xl">
          <span className="eyebrow">La méthode</span>
          <h2 className="mt-5 font-display font-light text-[32px] md:text-[44px] leading-[1.08] tracking-tightest text-bone">
            Une approche différente du bruit des marchés
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-mist">
            Nous ne faisons pas du trading casino. Nous construisons des positions
            asymétriques sur les tendances majeures avant qu'elles ne deviennent mainstream.
          </p>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-2 gap-5">
          {/* Autres groupes */}
          <Reveal>
            <div className="h-full rounded-2xl border hairline bg-ink-800/40 p-8">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[20px] text-mist">
                  La plupart des groupes crypto
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/50">
                  Le bruit
                </span>
              </div>
              <ul className="mt-7 space-y-4">
                {OTHERS.map((o) => (
                  <li key={o} className="flex items-center gap-3.5 text-[15px] text-mist/80">
                    <span className="grid place-items-center h-6 w-6 rounded-full border border-white/10 text-mist/50">
                      <IconCross className="h-3.5 w-3.5" />
                    </span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Pôle Invest */}
          <Reveal delay={0.1}>
            <div className="relative h-full rounded-2xl border gold-line bg-gradient-to-b from-ink-700/70 to-ink-900 p-8 overflow-hidden">
              <div
                className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(201,162,75,0.18), transparent 70%)" }}
              />
              <div className="relative flex items-center justify-between">
                <h3 className="font-display text-[20px] text-bone">Pôle Invest</h3>
                <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">
                  Le signal
                </span>
              </div>
              <ul className="relative mt-7 space-y-4">
                {OURS.map((o) => (
                  <li key={o} className="flex items-center gap-3.5 text-[15px] text-bone">
                    <span className="grid place-items-center h-6 w-6 rounded-full border gold-line text-gold">
                      <IconCheck className="h-3.5 w-3.5" />
                    </span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
