// Rendu SVG sobre du logo Hyperliquid (référence partenaire).
export default function HyperliquidLogo({ className = "", color = "#97FCE4" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 48 48" className="h-7 w-7" aria-hidden="true">
        {/* mark abstrait inspiré (vagues/liquidité) */}
        <path d="M6 30c5 0 6-8 12-8s7 8 12 8 6-8 12-8" fill="none" stroke={color} strokeWidth="3.4" strokeLinecap="round" />
        <path d="M6 20c5 0 6-6 12-6s7 6 12 6 6-6 12-6" fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <svg viewBox="0 0 210 40" className="h-[18px]" aria-label="Hyperliquid">
        <text x="0" y="30" fill={color}
          style={{ fontFamily: "var(--font-sans), system-ui, sans-serif", fontWeight: 600, fontSize: 30, letterSpacing: "-0.01em" }}>
          Hyperliquid
        </text>
      </svg>
    </span>
  );
}
