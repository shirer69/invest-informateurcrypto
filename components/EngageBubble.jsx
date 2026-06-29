"use client";

import { usePageEngagement } from "@/lib/usePageEngagement";

const TG_URL = "https://t.me/clubdesinformateurs";

export default function EngageBubble() {
  const { showBubble, dismissBubble } = usePageEngagement();

  if (!showBubble) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[200] max-w-[290px] animate-fade-in-up">
      <div className="relative rounded-2xl border border-white/10 bg-ink-800 shadow-2xl p-4">
        <button
          onClick={dismissBubble}
          aria-label="Fermer"
          className="absolute top-2.5 right-3 text-mist/50 hover:text-mist text-[16px] leading-none"
        >
          ×
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="relative shrink-0">
            <img src="/julien.jpg" alt="Support" className="h-9 w-9 rounded-full object-cover" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-ink-800" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-bone leading-tight">Support Club des Informateurs</p>
            <p className="text-[11px] text-emerald-400">En ligne</p>
          </div>
        </div>

        <p className="text-[13px] text-slate-300 leading-relaxed mb-3">
          Hello ! 👋 Une question sur votre dashboard ou votre stratégie ? Écrivez-nous directement.
        </p>

        <a
          href={TG_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismissBubble}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#229ED9] hover:bg-[#1a8bbf] transition-colors px-4 py-2.5 text-[13px] font-semibold text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden>
            <path d="M9.04 15.47 8.7 20.3c.46 0 .66-.2.9-.43l2.16-2.07 4.48 3.28c.82.45 1.41.21 1.63-.76l2.95-13.81c.26-1.2-.44-1.67-1.24-1.38L2.5 9.66c-1.18.46-1.16 1.12-.2 1.42l4.71 1.47L17.9 6.6c.5-.33.96-.15.58.18z" />
          </svg>
          Ouvrir la conversation
        </a>
      </div>
    </div>
  );
}
