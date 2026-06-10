// Rendu SVG sobre du logo OKX (référence partenaire).
export default function OkxLogo({ className = "", color = "#ECE9E1" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 48 48" className="h-7 w-7" aria-hidden="true">
        {/* mark inspiré : grille de carrés */}
        <g fill={color}>
          <rect x="6" y="6" width="11" height="11" rx="1.5" />
          <rect x="31" y="6" width="11" height="11" rx="1.5" />
          <rect x="18.5" y="18.5" width="11" height="11" rx="1.5" />
          <rect x="6" y="31" width="11" height="11" rx="1.5" />
          <rect x="31" y="31" width="11" height="11" rx="1.5" />
        </g>
      </svg>
      <svg viewBox="0 0 110 40" className="h-[18px]" aria-label="OKX">
        <text x="0" y="31" fill={color}
          style={{ fontFamily: "var(--font-sans), system-ui, sans-serif", fontWeight: 700, fontSize: 32, letterSpacing: "0.02em" }}>
          OKX
        </text>
      </svg>
    </span>
  );
}
