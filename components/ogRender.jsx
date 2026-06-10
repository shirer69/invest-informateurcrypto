import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 70px",
          backgroundColor: "#0a0b0e",
          backgroundImage:
            "radial-gradient(circle at 84% -6%, rgba(34,211,238,0.24), transparent 55%), radial-gradient(circle at -4% 112%, rgba(34,211,238,0.10), transparent 55%)",
          color: "#ECE9E1",
          fontFamily: "serif",
        }}
      >
        {/* top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "52px",
                height: "52px",
                borderRadius: "13px",
                border: "1px solid rgba(34,211,238,0.5)",
                color: "#7DE9F4",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              CI
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "21px", fontWeight: 700 }}>Club des Informateurs</div>
              <div
                style={{
                  fontSize: "12px",
                  letterSpacing: "4px",
                  color: "#22D3EE",
                  fontFamily: "monospace",
                }}
              >
                PÔLE INVEST
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "12px",
              letterSpacing: "3px",
              color: "#9aa0ab",
              fontFamily: "monospace",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "999px",
              padding: "8px 16px",
            }}
          >
            DESK D'INVESTISSEMENT PRIVÉ
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: "66px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-1.5px",
            }}
          >
            Le prochain cycle se prépare
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "66px",
              fontWeight: 700,
              fontStyle: "italic",
              lineHeight: 1.05,
              letterSpacing: "-1.5px",
              color: "#7DE9F4",
            }}
          >
            avant qu'il ne commence.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "22px",
              fontSize: "23px",
              color: "#9aa0ab",
              fontFamily: "sans-serif",
            }}
          >
            Piloté par Julien Moretto · Crypto · IA · Actions US · Semi-conducteurs
          </div>
        </div>

        {/* bottom: perf chips */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "14px" }}>
            {[
              ["2023", "+642%"],
              ["2024", "+144%"],
              ["2025", "+108%"],
            ].map(([y, v]) => (
              <div
                key={y}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid rgba(34,211,238,0.3)",
                  borderRadius: "14px",
                  padding: "12px 22px",
                  backgroundColor: "rgba(34,211,238,0.05)",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    letterSpacing: "2px",
                    color: "#9aa0ab",
                    fontFamily: "monospace",
                  }}
                >
                  {y}
                </div>
                <div style={{ fontSize: "30px", fontWeight: 700, color: "#7DE9F4" }}>{v}</div>
              </div>
            ))}
          </div>
          <div
            style={{ display: "flex", fontSize: "16px", color: "#9aa0ab", fontFamily: "monospace" }}
          >
            invest.informateurcrypto.fr
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
