/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0b0e",
          900: "#0a0b0e",
          800: "#0e1014",
          700: "#13161c",
          600: "#1a1e26",
        },
        bone: "#ECE9E1",
        mist: "#9aa0ab",
        gold: {
          DEFAULT: "#C9A24B",
          soft: "#E8CE8E",
          deep: "#A07E2E",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        widest2: "0.28em",
      },
      maxWidth: {
        prose2: "62ch",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};
