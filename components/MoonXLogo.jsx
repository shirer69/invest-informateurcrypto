export default function MoonXLogo({ className = "", color = "#00E88F" }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      {/* Croissant + X inspiré du logo MoonX */}
      <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
        {/* Croissant */}
        <path
          d="M32 8a18 18 0 1 0 0 32 14 14 0 1 1 0-32z"
          fill={color}
          opacity="0.92"
        />
        {/* X centré légèrement vers la droite */}
        <line x1="22" y1="16" x2="34" y2="32" stroke="#0a1a10" strokeWidth="3.4" strokeLinecap="round" />
        <line x1="34" y1="16" x2="22" y2="32" stroke="#0a1a10" strokeWidth="3.4" strokeLinecap="round" />
      </svg>
      <svg viewBox="0 0 110 40" className="h-[18px]" aria-label="MoonX">
        <text
          x="0" y="30"
          fill={color}
          style={{ fontFamily: "var(--font-sans), system-ui, sans-serif", fontWeight: 700, fontSize: 30, letterSpacing: "-0.01em" }}
        >
          MoonX
        </text>
      </svg>
    </span>
  );
}
