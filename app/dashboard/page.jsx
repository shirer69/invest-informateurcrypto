"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Chat from "@/components/dashboard/Chat";
import OrderTicket from "@/components/dashboard/OrderTicket";
import SandboxKraken from "@/components/dashboard/SandboxKraken";
import PortfolioKraken from "@/components/dashboard/PortfolioKraken";
import Academy from "@/components/dashboard/Academy";
import VipFeed from "@/components/dashboard/VipFeed";
import AudioFeed from "@/components/dashboard/AudioFeed";
import LoginModal from "@/components/dashboard/LoginModal";
import LogoMark from "@/components/LogoMark";
import { Overview, Positions, Intelligence, Analytics, CopyTrading } from "@/components/dashboard/Sections";
import { TELEGRAM_URL } from "@/lib/site";
import { getUser, logout, getToken, apiTelegramAuth } from "@/lib/clientStore";

const NAV = [
  { id: "overview", label: "Vue d'ensemble", icon: "▦" },
  { id: "portfolio", label: "Portefeuille Kraken", icon: "◈" },
  { id: "vip", label: "Alertes", icon: "◆" },
  { id: "positions", label: "Positions", icon: "≣" },
  { id: "academy", label: "Academy", icon: "✸" },
  { id: "audios", label: "Audios Pôle Trading", icon: "♪" },
  { id: "analytics", label: "Analytics", icon: "◴" },
  { id: "community", label: "Communauté", icon: "✦" },
  { id: "order", label: "Préparer un ordre", icon: "⊕" },
  { id: "sandbox", label: "Sandbox Kraken", icon: "⚡" },
  { id: "copy", label: "Copy-trading", icon: "⇄" },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("overview");
  const [tgLink, setTgLink] = useState(TELEGRAM_URL);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
    try {
      const l = localStorage.getItem("pi_tg_link");
      if (l) setTgLink(l);
    } catch {}
  }, []);

  // Mini App Telegram : init SDK + connexion automatique via initData
  useEffect(() => {
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      const tg = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp;
      if (tg) {
        clearInterval(id);
        try { tg.ready(); tg.expand(); } catch {}
        document.documentElement.classList.add("in-telegram");
        if (!getToken() && tg.initData) {
          apiTelegramAuth(tg.initData).then((r) => {
            if (r.ok) setUser(r.user);
          });
        }
      } else if (tries > 40) {
        clearInterval(id);
      }
    }, 100);
    return () => clearInterval(id);
  }, []);

  const name = user?.name || "Invité";

  return (
    <div className="min-h-screen aura">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* top bar */}
      <header className="sticky top-0 z-40 glass border-b hairline">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-5 h-16 flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2.5 min-w-0">
            <LogoMark className="h-9 w-9 shrink-0" />
            <span className="leading-tight min-w-0">
              <span className="block font-display text-[14px] sm:text-[15px] text-bone truncate">Julien - Pôle Invest</span>
              <span className="block font-mono text-[9.5px] uppercase tracking-widest2 text-gold/80">tableau de bord</span>
            </span>
          </a>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[13px] text-mist hidden md:inline">Bonjour, <span className="text-bone">{name}</span></span>
            {user ? (
              <button onClick={() => { logout(); window.location.href = "/"; }}
                      className="btn-ghost rounded-full px-4 py-2 text-[12.5px]">Se déconnecter</button>
            ) : (
              <button onClick={() => setLoginOpen(true)}
                      className="btn-gold rounded-full px-4 py-2 text-[12.5px] font-semibold">Se connecter</button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-5 py-6 lg:py-8 grid lg:grid-cols-[210px_1fr] gap-5 lg:gap-8">
        {/* sidebar */}
        <aside className="lg:sticky lg:top-24 self-start min-w-0">
          <div className="lg:hidden mb-1.5 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-widest2 text-gold/70">
            <span>Menu</span>
            <span className="text-mist/50">— faites défiler</span>
            <span className="animate-pulse">→</span>
          </div>
          <div className="relative">
            <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 -mx-4 px-4 sm:-mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {NAV.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setTab(n.id)}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 lg:px-4 py-2.5 text-[13.5px] lg:text-[14px] whitespace-nowrap transition-colors ${
                    tab === n.id
                      ? "bg-gold/[0.10] text-bone border gold-line"
                      : "text-mist hover:text-bone border border-transparent"
                  }`}
                >
                  <span className={`text-[15px] ${tab === n.id ? "text-gold" : "text-mist/60"}`}>{n.icon}</span>
                  {n.label}
                </button>
              ))}
            </nav>
            {/* dégradé de bord pour indiquer le défilement horizontal (mobile) */}
            <div className="lg:hidden pointer-events-none absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-ink-900 via-ink-900/70 to-transparent" />
          </div>
        </aside>

        {/* content */}
        <main className="min-w-0">
          {tab === "overview" && <Overview tgLink={tgLink} />}
          {tab === "portfolio" && <PortfolioKraken />}
          {tab === "vip" && <VipFeed />}
          {tab === "academy" && <Academy />}
          {tab === "positions" && <Positions />}
          {tab === "audios" && <AudioFeed />}
          {tab === "analytics" && <Analytics />}
          {tab === "community" && (
            <div>
              <h3 className="font-display text-[18px] text-bone mb-4">Communauté</h3>
              <Chat me={user?.name} />
            </div>
          )}
          {tab === "order" && <OrderTicket />}
          {tab === "sandbox" && <SandboxKraken />}
          {tab === "copy" && <CopyTrading />}
        </main>
      </div>
    </div>
  );
}
