import "./globals.css";
import { Sora, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import JoinProvider from "@/components/JoinProvider";

const display = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = "https://invest.informateurcrypto.fr";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Club des Informateurs — Pôle Invest",
    template: "%s · Pôle Invest",
  },
  description:
    "Le prochain cycle se prépare avant qu'il ne commence. Un espace d'investissement privé piloté par Julien Moretto pour se positionner sur les grandes tendances : crypto, intelligence artificielle, actions US, semi-conducteurs et narratives macro du prochain cycle.",
  keywords: [
    "Pôle Invest",
    "Julien Moretto",
    "investissement crypto",
    "actions US",
    "intelligence artificielle",
    "semi-conducteurs",
    "ETF",
    "macro",
    "private investment club",
  ],
  authors: [{ name: "Julien Moretto" }],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "Club des Informateurs — Pôle Invest",
    title: "Le prochain cycle se prépare avant qu'il ne commence.",
    description:
      "Le prochain cycle se prépare avant qu'il ne commence. Un espace d'investissement privé piloté par Julien Moretto pour se positionner sur les grandes tendances : crypto, intelligence artificielle, actions US, semi-conducteurs et narratives macro du prochain cycle.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Club des Informateurs — Pôle Invest",
    description:
      "Le prochain cycle se prépare avant qu'il ne commence. Un espace d'investissement privé piloté par Julien Moretto pour se positionner sur les grandes tendances : crypto, intelligence artificielle, actions US, semi-conducteurs et narratives macro du prochain cycle.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#0a0b0e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased grain">
        <JoinProvider>{children}</JoinProvider>
      </body>
    </html>
  );
}
