// Backend VPS (vérif IIBAN + génération de liens VIP nommés + /update)
export const API_BASE = "https://api.informateurcrypto.fr";

export const KRAKEN_URL = "https://proinvite.kraken.com/9f1e/76ibgkpe";
export const KRAKEN_SITE = "https://www.kraken.com";
export const TELEGRAM_URL = "https://t.me/clubdesinformateurs";
export const LINKEDIN_URL = "https://www.linkedin.com/in/julien-moretto/";
export const YOUTUBE_URL = "https://www.youtube.com/@ClubdesInformateurs";
export const YOUTUBE_CHANNEL_ID = "UCZodTx5HJOlvJ6gVAebxj7w";

// Codes parrain : tous gérés en base via /admin (plus de codes statiques hardcodés)
export const REFERRAL_CODES = [];
export const REFERRAL_CODE = ""; // compat

export const BRAND = "Club des Informateurs";
export const BRAND_SUB = "Pôle Invest";

// Démarrage du portefeuille INVEST : 16 juin 2026 minuit (Europe/Paris, CEST = UTC+2)
export const LAUNCH_ISO = "2026-06-15T22:00:00Z"; // 2026-06-16 00:00 Paris

// breakdown = répartition des profits par classe d'actifs (en %).
// ⚠️ valeurs illustratives — à remplacer par les chiffres du relevé de compte.
export const PERFORMANCE = [
  {
    year: "2023",
    value: "+642%",
    breakdown: [
      { label: "Crypto", pct: 64 },
      { label: "Actions US", pct: 21 },
      { label: "ETF", pct: 10 },
      { label: "Cash / autres", pct: 5 },
    ],
  },
  {
    year: "2024",
    value: "+144%",
    breakdown: [
      { label: "Crypto", pct: 49 },
      { label: "Actions US", pct: 29 },
      { label: "ETF", pct: 16 },
      { label: "Cash / autres", pct: 6 },
    ],
  },
  {
    year: "2025",
    value: "+108%",
    breakdown: [
      { label: "Crypto", pct: 42 },
      { label: "Actions US", pct: 32 },
      { label: "ETF", pct: 19 },
      { label: "Cash / autres", pct: 7 },
    ],
  },
];

// flag: true -> affiche le drapeau français (SVG) à côté
export const TRUST = [
  { label: "Certification AMF", flag: true },
  { label: "Membre ANACOFI" },
  { label: "+3 ans de track record public" },
  { label: "Trader financé — propfirm" },
  { label: "Ancien analyste Coinhouse" },
];
