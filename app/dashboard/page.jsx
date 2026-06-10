"use client";

import { useEffect, useState } from "react";
import Chat from "@/components/dashboard/Chat";
import OrderTicket from "@/components/dashboard/OrderTicket";
import SandboxKraken from "@/components/dashboard/SandboxKraken";
import PortfolioKraken from "@/components/dashboard/PortfolioKraken";
import Academy from "@/components/dashboard/Academy";
import VipFeed from "@/components/dashboard/VipFeed";
import LoginModal from "@/components/dashboard/LoginModal";
import { Overview, Positions, Intelligence, Analytics, CopyTrading } from "@/components/dashboard/Sections";
import { TELEGRAM_URL } from "@/lib/site";
import { getUser, logout } from "@/lib/clientStore";

const NAV = [
  { id: "overview", label: "Vue d'ensemble", icon: "▦" },
  { id: "portfolio", label: "Portefeuille Kraken", icon: "◈" },
  { id: "vip", label: "Posts VIP", icon: "◆" },
  { id: "positions", label: "Positions", icon: "≣" },
  { id: "academy", label: "Academy", icon: "✸" },
  { id: "intelligence", label: "Intelligence", icon: "✶" },
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

  const name = user?.name || "Invité";

  return (
    <div className="min-h-screen aura">
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* top bar */}
      <header className="sticky top-0 z-40 glass border-b hairline">
        <div className="mx-auto max-w-[1280px] px-5 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <span className="grid place-items-center h-9 w-9 rounded-[10px] border gold-line text-gold font-display text-[13px]">CI</span>
            <span className="leading-tight">
              <span className="block font-display text-[15px] text-bone">Trading OS · Pôle Invest</span>
              <span className="block font-mono text-[9.5px] uppercase tracking-widest2 text-gold/80">tableau de bord</span>
            </span>
          </a>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-mist hidden sm:inline">Bonjour, <span className="text-bone">{name}</span></span>
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

      <div className="mx-auto max-w-[1280px] px-5 py-8 grid lg:grid-cols-[210px_1fr] gap-8">
        {/* sidebar */}
        <aside className="lg:sticky lg:top-24 self-start">
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-[14px] whitespace-nowrap transition-colors ${
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
        </aside>

        {/* content */}
        <main className="min-w-0">
          {tab === "overview" && <Overview tgLink={tgLink} />}
          {tab === "portfolio" && <PortfolioKraken />}
          {tab === "vip" && <VipFeed />}
          {tab === "academy" && <Academy />}
          {tab === "positions" && <Positions />}
          {tab === "intelligence" && <Intelligence />}
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
