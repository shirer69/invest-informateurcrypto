/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces — near-black / graphite / navy (terminal institutionnel)
        ink: {
          DEFAULT: "#070A0F",
          900: "#070A0F",
          800: "#0C1118", // panneaux / data containers
          700: "#121925",
          600: "#1B2433", // bordures élevées
        },
        bone: "#E7EBF2",   // texte primaire (blanc cassé froid)
        mist: "#8A93A6",   // texte secondaire / muted
        // Accent primaire — cyan électrique (clé d'action / highlights).
        // Conserve la clé "gold" pour basculer toute l'UI sans toucher au markup.
        gold: {
          DEFAULT: "#2EE6A8",
          soft: "#79F3C9",
          deep: "#11A87B",
        },
        accent: {
          DEFAULT: "#2EE6A8",
          soft: "#79F3C9",
          deep: "#11A87B",
        },
        // Sémantique data / finance
        pos: "#1FCB83",   // PnL positif / gains
        neg: "#F6465D",   // drawdown / pertes
        flag: "#E8A33D",  // alertes / risque (amber)
        info: "#5B9DFF",  // bleu secondaire
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.03em",
        widest2: "0.22em",
      },
      maxWidth: {
        prose2: "62ch",
      },
      borderRadius: {
        // léger resserrement : data containers, pas décoratif
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        pulseDot: {
          "0%,100%": { opacity: 1 },
          "50%": { opacity: 0.4 },
        },
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 6s linear infinite",
        pulseDot: "pulseDot 2s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};
