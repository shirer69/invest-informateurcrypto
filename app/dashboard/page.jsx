"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Chat from "@/components/dashboard/Chat";
import PortfolioKraken from "@/components/dashboard/PortfolioKraken";
import Academy from "@/components/dashboard/Academy";
import VipFeed from "@/components/dashboard/VipFeed";
import LoginModal from "@/components/dashboard/LoginModal";
import { UnlockProvider, Locked } from "@/components/dashboard/UnlockProvider";
import Billing from "@/components/dashboard/Billing";
import VideosFeed from "@/components/dashboard/VideosFeed";
import Account from "@/components/dashboard/Account";
import { Intelligence, Analytics, CopyTrading, Monitoring, MonitoringAudio, XStocks } from "@/components/dashboard/Sections";
import Logs from "@/components/dashboard/Logs";
import SignupGate from "@/components/dashboard/SignupGate";
import { TELEGRAM_URL } from "@/lib/site";
import { getUser, logout, getToken, apiTelegramAuth, apiAccess, apiCopyRequest } from "@/lib/clientStore";

const NAV = [
  { id: "portfolio", label: "Portefeuille Kraken", icon: "💼" },
  { id: "analytics", label: "Invest", icon: "📊" },
  { id: "monitoring", label: "Trading", icon: "⚡" },
  { id: "audio", label: "Monitoring", icon: "📡" },
  { id: "vip", label: "Actions", icon: "📈" },
  { id: "logs", label: "Logs", icon: "🧾" },
  { id: "academy", label: "Academy", icon: "🎓" },
  { id: "videos", label: "Vidéos", icon: "🎬" },
  { id: "community", label: "Chat", icon: "💬" },
  { id: "copy", label: "Copy-trading", icon: "🔁", badge: "Soon" },
  { id: "billing", label: "Wallet", icon: "💳" },
  { id: "account", label: "Mon compte", icon: "👤" },
];

// Onglet Copy-trading réservé (pour l'instant) à ce compte uniquement.
const COPY_ALLOWED_EMAIL = "linformateurcrypto@gmail.com";

// Onglets principaux de la barre du bas (mobile) — les autres sont sous « Plus ».
const PRIMARY_TABS = ["portfolio", "analytics", "monitoring", "audio"];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [copyAccess, setCopyAccess] = useState(false);
  const [copyRequest, setCopyRequest] = useState(false);
  const [tab, setRawTab] = useState("portfolio");
  const setTab = (t) => {
    setRawTab(t);
    try { localStorage.setItem("pi_active_tab", t); } catch {}
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", t);
      window.history.replaceState(null, "", url.toString());
    } catch {}
  };
  const [tgLink, setTgLink] = useState(TELEGRAM_URL);
  const [loginOpen, setLoginOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [codeMsg, setCodeMsg] = useState(null); // {ok, text} — redemption auto via ?code
  const [booted, setBooted] = useState(false); // résolution initiale (web immédiat, mini-app après auto-login)

  useEffect(() => {
    setUser(getUser());
    try {
      const l = localStorage.getItem("pi_tg_link");
      if (l) setTgLink(l);
      const savedTab = localStorage.getItem("pi_active_tab");
      if (savedTab) setRawTab(savedTab);
    } catch {}
    apiAccess().then((d) => {
      if (d?.copy_access) setCopyAccess(true);
      if (d?.copy_request) setCopyRequest(true);
    }).catch(() => {});
    // Hors mini-app Telegram : on peut statuer immédiatement.
    let inTg = false;
    try {
      inTg = /tgWebApp/i.test(window.location.hash) || /tgWebApp/i.test(window.location.search) ||
        !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData);
    } catch {}
    if (!inTg) setBooted(true);
  }, []);

  // Onglet initial via lien (`?tab=videos`) ou via le start_param de la mini-app
  // (`t.me/Clubdesinformateurs_bot/<app>?startapp=videos`). Ex. lien direct « Vidéos ».
  useEffect(() => {
    const VALID = new Set(nav.map((n) => n.id));
    // Alias d'URL conviviaux → id réel de l'onglet
    const ALIAS = {
      futures: "monitoring",
      invest: "analytics",
      actions: "vip",
      chat: "community",
      facturation: "billing",
      compte: "account",
      audios: "audio",
      monitoring_audio: "audio",
      video: "videos",
    };
    const resolve = (v) => {
      const k = (v || "").toLowerCase();
      return ALIAS[k] || k;
    };
    let target = "";
    try {
      const p = new URLSearchParams(window.location.search);
      target = resolve(p.get("tab") || "");
      if (!target) {
        const sp = window.Telegram?.WebApp?.initDataUnsafe?.start_param || "";
        if (sp.startsWith("tab_")) target = resolve(sp.slice(4));
        else target = resolve(sp);
      }
    } catch {}
    if (target && VALID.has(target)) setTab(target);
  }, []);

  // Nettoie le param ?code= si présent (le code est entrée seule, pas accès).
  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      if (u.searchParams.has("code")) {
        u.searchParams.delete("code");
        window.history.replaceState({}, "", u);
      }
    } catch {}
    try { localStorage.removeItem("pi_pending_code"); } catch {}
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
            if (r.ok) {
              setUser(r.user);
              // Marque les nouveaux utilisateurs TG pour exiger le code d'invitation
              try {
                if (r.user?.is_new) sessionStorage.setItem("pi_tg_is_new", "1");
                else sessionStorage.removeItem("pi_tg_is_new");
              } catch {}
            }
            setBooted(true);
          });
        } else {
          setBooted(true);
        }
      } else if (tries > 40) {
        clearInterval(id);
        setBooted(true);
      }
    }, 100);
    return () => clearInterval(id);
  }, []);

  const name = user?.name || "Invité";
  const canCopy = copyAccess || (user?.email || "").trim().toLowerCase() === COPY_ALLOWED_EMAIL;
  const nav = NAV; // Copy-trading reste visible pour tous ; l'accès est restreint au contenu.

  // Tunnel d'entrée : tant que l'utilisateur n'a pas créé son compte (prénom/mail/pwd),
  // on affiche le gate code → inscription. Un compte Telegram brut (tg…@telegram.local)
  // n'est pas considéré comme inscrit.
  const emailLc = (user?.email || "").toLowerCase();
  const registered = !!user && !emailLc.endsWith("@telegram.local");

  if (!booted) {
    return (
      <div className="min-h-screen aura grid place-items-center">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
        <div className="text-mist text-[13px]">Chargement…</div>
      </div>
    );
  }

  if (!registered) {
    const isTgUser = emailLc.endsWith("@telegram.local");
    // Lien direct ?direct=1 / startapp=direct → saute le code.
    // Utilisateur Telegram existant (is_new=false) → saute le code (déjà dans le système).
    // Nouvel utilisateur Telegram (is_new=true, sessionStorage) → doit entrer son code.
    let isDirect = false;
    try {
      const p = new URLSearchParams(window.location.search);
      const sp = window.Telegram?.WebApp?.initDataUnsafe?.start_param || "";
      isDirect = p.get("direct") === "1" || sp === "direct";
    } catch {}
    const isNewTgUser = isTgUser && (() => { try { return !!sessionStorage.getItem("pi_tg_is_new"); } catch { return false; } })();
    return (
      <div className="min-h-screen aura">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
        <SignupGate
          onDone={() => setUser(getUser())}
          onLogin={() => setLoginOpen(true)}
          skipCode={isDirect || (isTgUser && !isNewTgUser)}
          tgName={isTgUser ? (user?.name || "") : ""}
          title={isTgUser && !isNewTgUser && !isDirect ? "Ajouter ton mail" : undefined}
          noPassword={isTgUser}
        />
      </div>
    );
  }

  return (
    <UnlockProvider>
    <div className="min-h-screen aura">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* top bar */}
      <header className="sticky top-0 z-40 glass border-b hairline">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-5 h-16 flex items-center justify-between gap-3">
          <a href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 min-w-0">
            <span className="leading-tight min-w-0">
              <span className="block font-display text-[14px] sm:text-[15px] text-bone truncate">Julien - Club des Informateurs</span>
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

      <div className="mx-auto max-w-[1280px] px-4 sm:px-5 py-6 lg:py-8 pb-28 lg:pb-8 grid lg:grid-cols-[210px_1fr] gap-5 lg:gap-8">
        {/* sidebar (desktop) */}
        <aside className="hidden lg:block lg:sticky lg:top-24 self-start min-w-0">
          <div className="relative">
            <nav className="flex lg:flex-col gap-1.5">
              {nav.map((n) => (
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
                  {n.badge && (
                    <span className="lg:ml-auto shrink-0 rounded-full bg-gold/20 border gold-line px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-gold">
                      {n.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            {/* dégradé de bord pour indiquer le défilement horizontal (mobile) */}
            <div className="lg:hidden pointer-events-none absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-ink-900 via-ink-900/70 to-transparent" />
          </div>
        </aside>

        {/* content */}
        <main className="min-w-0">
          {/* Portefeuille : chaque tableau est verrouillé individuellement (verrou interne) */}
          {tab === "portfolio" && <PortfolioKraken onGoInvest={() => setTab("analytics")} />}
          {tab === "vip" && <XStocks />}
          {/* Academy : seuls les modules sont verrouillés (verrou interne) */}
          {tab === "academy" && <Academy />}
          {/* Logs : historique de tous les trades (verrou interne) */}
          {tab === "logs" && <Logs />}
          {/* Futures : KPIs copy + historique des trades julien */}
          {tab === "monitoring" && <Monitoring onGoCopy={() => setTab("copy")} />}
          {/* Monitoring audio : points vocaux de Julien */}
          {tab === "audio" && <MonitoringAudio />}
          {tab === "analytics" && (
            <Analytics
              copyAccess={copyAccess}
              copyRequest={copyRequest}
              onRequestCopy={async () => {
                setCopyRequest(true);
                await apiCopyRequest();
              }}
            />
          )}
          {/* Vidéos : accès libre même dashboard verrouillé */}
          {tab === "videos" && <VideosFeed />}
          {/* Chat : ouvert à tous (même dashboard verrouillé) */}
          {tab === "community" && (
            <div>
              <h3 className="font-display text-[18px] text-bone mb-4">💬 Chat</h3>
              <Chat me={user?.name} />
            </div>
          )}
          {tab === "copy" && (canCopy ? (
            <CopyTrading />
          ) : (
            <div>
              <h3 className="font-display text-[18px] text-bone mb-4">Copy-trading (Futures)</h3>
              <div className="rounded-2xl border gold-line bg-gold/[0.05] p-8 text-center">
                <div className="text-[28px] mb-3">{copyRequest ? "⏳" : "🔒"}</div>
                <p className="font-display text-[20px] text-bone">
                  {copyRequest ? "Demande envoyée" : "Accès sur demande"}
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-mist max-w-prose2 mx-auto">
                  {copyRequest
                    ? "Votre demande d'accès au copy auto a bien été transmise. Julien la traitera prochainement."
                    : "Le copy-trading automatique est disponible sur demande. Cliquez ci-dessous pour envoyer une demande d'accès à Julien."}
                </p>
                {!copyRequest && (
                  <button
                    onClick={async () => {
                      setCopyRequest(true);
                      await apiCopyRequest();
                    }}
                    className="mt-6 btn-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold"
                  >
                    Demander l'accès au copy auto
                  </button>
                )}
              </div>
            </div>
          ))}
          {tab === "billing" && <Billing />}
          {tab === "account" && <Account />}
        </main>
      </div>

      {/* Barre du bas (mobile uniquement) */}
      {(() => {
        const primary = nav.filter((n) => PRIMARY_TABS.includes(n.id));
        const activeInPrimary = primary.some((n) => n.id === tab);
        return (
          <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-ink-800 border-t-2 border-gold/50 shadow-[0_-14px_40px_rgba(0,0,0,0.7)] pb-[env(safe-area-inset-bottom)]">
            <div className="grid grid-cols-5">
              {primary.map((n) => {
                const on = tab === n.id;
                return (
                  <button key={n.id} onClick={() => { setTab(n.id); setMoreOpen(false); }}
                    className={`relative flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                      on ? "text-gold bg-gold/[0.10]" : "text-mist"
                    }`}>
                    {on && <span className="absolute top-0 inset-x-3 h-0.5 rounded-full bg-gold" />}
                    <span className="text-[20px] leading-none">{n.icon}</span>
                    <span className="truncate max-w-[66px]">{n.label}</span>
                  </button>
                );
              })}
              <button onClick={() => setMoreOpen(true)}
                className={`relative flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                  !activeInPrimary ? "text-gold bg-gold/[0.10]" : "text-mist"
                }`}>
                {!activeInPrimary && <span className="absolute top-0 inset-x-3 h-0.5 rounded-full bg-gold" />}
                <span className="text-[20px] leading-none">⋯</span>
                <span>Plus</span>
              </button>
            </div>
          </nav>
        );
      })()}

      {/* Feuille « Plus » (mobile) — tous les onglets */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
          <div className="relative w-full rounded-t-3xl border-t gold-line bg-ink-900/98 p-5 pb-[calc(env(safe-area-inset-bottom)+16px)]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">Menu</span>
              <button onClick={() => setMoreOpen(false)} aria-label="Fermer"
                className="h-8 w-8 grid place-items-center rounded-full border hairline text-mist">
                <span className="block w-3.5 h-px bg-current rotate-45 translate-y-[0.5px]" />
                <span className="block w-3.5 h-px bg-current -rotate-45 -translate-y-[0.5px]" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {nav.map((n) => (
                <button key={n.id} onClick={() => { setTab(n.id); setMoreOpen(false); }}
                  className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-4 text-[12px] ${
                    tab === n.id ? "bg-gold/[0.10] text-bone gold-line" : "text-mist border-white/8 hover:text-bone"
                  }`}>
                  <span className={`text-[20px] leading-none ${tab === n.id ? "text-gold" : "text-mist/70"}`}>{n.icon}</span>
                  <span className="text-center leading-tight">{n.label}</span>
                  {n.badge && (
                    <span className="absolute top-1.5 right-1.5 rounded-full bg-gold/20 border gold-line px-1.5 text-[8px] font-mono uppercase tracking-wider text-gold">
                      {n.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </UnlockProvider>
  );
}
