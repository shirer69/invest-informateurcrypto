"use client";

// Bulle flottante : redirige vers le Telegram public du Cycle Partners.
export default function SupportChat() {
  return (
    <a
      href="https://t.me/clubdesinformateurs"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-[9998] flex items-center justify-center w-14 h-14 shadow-2xl bg-gold text-ink-900 transition-transform hover:scale-105 active:scale-95
        top-1/2 -translate-y-1/2 right-0 rounded-l-2xl rounded-r-none
        sm:top-auto sm:translate-y-0 sm:bottom-5 sm:right-5 sm:rounded-full"
      aria-label="Nous contacter sur Telegram"
    >
      {/* Icône Telegram (avion en papier) */}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M9.04 15.47 8.7 20.3c.46 0 .66-.2.9-.43l2.16-2.07 4.48 3.28c.82.45 1.41.21 1.63-.76l2.95-13.81c.26-1.2-.44-1.67-1.24-1.38L2.5 9.66c-1.18.46-1.16 1.12-.2 1.42l4.71 1.47L17.9 6.6c.5-.33.96-.15.58.18z" />
      </svg>
    </a>
  );
}
