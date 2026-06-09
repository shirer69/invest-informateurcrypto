// Rendu SVG du logo Kraken (référence partenaire / affilié).
export default function KrakenLogo({ className = "", mark = true, wordmark = true, color = "#7C5CFC" }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      {mark && (
        <svg viewBox="0 0 64 64" className="h-8 w-8" aria-hidden="true">
          {/* tête / dôme */}
          <path
            d="M32 6C18.7 6 8 16.7 8 30v3.2c0 1 .8 1.8 1.8 1.8h6.4c1 0 1.8-.8 1.8-1.8V30a13.9 13.9 0 0 1 27.9 0v3.2c0 1 .8 1.8 1.8 1.8h6.5c1 0 1.8-.8 1.8-1.8V30C56 16.7 45.3 6 32 6Z"
            fill={color}
          />
          {/* tentacules */}
          <g fill={color}>
            <rect x="8" y="39" width="9.9" height="19" rx="4.95" />
            <rect x="21.5" y="39" width="9.9" height="14" rx="4.95" />
            <rect x="32.6" y="39" width="9.9" height="19" rx="4.95" />
            <rect x="46.1" y="39" width="9.9" height="14" rx="4.95" />
          </g>
        </svg>
      )}
      {wordmark && (
        <svg viewBox="0 0 180 44" className="h-7" aria-label="Kraken">
          <text
            x="0" y="33"
            fill={color}
            style={{ fontFamily: "var(--font-sans), system-ui, sans-serif", fontWeight: 600, fontSize: 36, letterSpacing: "-0.02em" }}
          >
            kraken
          </text>
        </svg>
      )}
    </span>
  );
}
