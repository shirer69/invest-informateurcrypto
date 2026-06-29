"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Chat from "@/components/dashboard/Chat";
import PortfolioKraken from "@/components/dashboard/PortfolioKraken";
import Academy from "@/components/dashboard/Academy";
import VipFeed from "@/components/dashboard/VipFeed";
import LoginModal from "@/components/dashboard/LoginModal";
import { UnlockProvider, Locked, useUnlock } from "@/components/dashboard/UnlockProvider";

function AutoUnlock() {
  const { openUnlock } = useUnlock();
  useEffect(() => { openUnlock(); }, [openUnlock]);
  return null;
}

function CopyNoAccessCta() {
  const { openUnlock } = useUnlock();
  return (
    <button onClick={openUnlock} className="mt-5 btn-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold">
      🔒 Déverrouiller l'accès <span>→</span>
    </button>
  );
}
import Billing from "@/components/dashboard/Billing";
import VideosFeed from "@/components/dashboard/VideosFeed";
import Account from "@/components/dashboard/Account";
import { Intelligence, Analytics, CopyTrading, Monitoring, MonitoringAudio, XStocks } from "@/components/dashboard/Sections";
import Contest from "@/components/dashboard/Contest";
import Logs from "@/components/dashboard/Logs";
import SignupGate from "@/components/dashboard/SignupGate";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import { TELEGRAM_URL } from "@/lib/site";
import { getUser, logout, getToken, apiTelegramAuth, apiAccess, apiCopyRequest, apiVisit } from "@/lib/clientStore";
import { API_BASE } from "@/lib/site";

// Logo Kraken (mark) — utilisé comme icône de l'onglet Invest dans le menu.
function KrakenMark({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M6 40V31a26 26 0 0 1 52 0v9Z" fill="#7C5CFC" />
      <g fill="#7C5CFC">
        <rect x="6" y="34" width="9.8" height="25" rx="4.9" />
        <rect x="20.07" y="34" width="9.8" height="25" rx="4.9" />
        <rect x="34.13" y="34" width="9.8" height="25" rx="4.9" />
        <rect x="48.2" y="34" width="9.8" height="25" rx="4.9" />
      </g>
    </svg>
  );
}

const NAV = [
  { id: "portfolio", label: "Accueil", icon: "🏠" },
  { id: "analytics", label: "Invest", icon: "📊", iconNode: KrakenMark, badge: "New" },
  { id: "monitoring", label: "Trading", icon: "⚡" },
  { id: "audio", label: "Monitoring", icon: "📡" },
  { id: "contest", label: "Concours", icon: "🎯", badge: "New" },
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
const PRIMARY_TABS = ["portfolio", "analytics", "monitoring", "audio", "contest"];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [copyAccess, setCopyAccess] = useState(false);
  const [copyRequest, setCopyRequest] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [tgInvite, setTgInvite] = useState("");
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
  const [visit, setVisit] = useState(0);       // nb de connexions (utilisateurs non inscrits)
  const [skipped, setSkipped] = useState(false); // « Passer » choisi à la 2e connexion
  const [gateSkipped, setGateSkipped] = useState(false); // user a cliqué Skip sur le formulaire
  const [visitCount, setVisitCount] = useState(1); // nb de visites TG (localStorage)
  const [forceCode, setForceCode] = useState(false); // ?code dans l'URL → exiger le code d'invitation
  const [codePrefill, setCodePrefill] = useState(""); // valeur éventuelle du ?code

  // ── Beacon de présence ──────────────────────────────────────────────────────
  useEffect(() => {
    let sid = null;
    try { sid = sessionStorage.getItem("pi_sid"); } catch {}
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      try { sessionStorage.setItem("pi_sid", sid); } catch {}
    }
    function ping() {
      const token = getToken();
      fetch(`${API_BASE}/api/presence/ping`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ session_id: sid, tab, page: "dashboard" }),
      }).catch(() => {});
    }
    ping();
    const iv = setInterval(ping, 30_000);
    return () => clearInterval(iv);
  }, [tab]);

  useEffect(() => {
    setUser(getUser());
    try {
      const l = localStorage.getItem("pi_tg_link");
      if (l) setTgLink(l);
      const savedTab = localStorage.getItem("pi_active_tab");
      if (savedTab) setRawTab(savedTab);
    } catch {}
    // Compteur de visites (une seule incrémentation par session navigateur)
    try {
      if (!sessionStorage.getItem("pi_session_counted")) {
        const n = parseInt(localStorage.getItem("pi_tg_visit_count") || "0", 10) + 1;
        localStorage.setItem("pi_tg_visit_count", String(n));
        sessionStorage.setItem("pi_session_counted", "1");
        setVisitCount(n);
      } else {
        setVisitCount(parseInt(localStorage.getItem("pi_tg_visit_count") || "1", 10));
      }
    } catch {}
    apiAccess().then((d) => {
      if (d?.copy_access) setCopyAccess(true);
      if (d?.copy_request) setCopyRequest(true);
      if (d?.has_access) setHasAccess(true);
      if (d?.tg_invite) {
        setTgInvite(d.tg_invite);
        try { localStorage.setItem("pi_tg_link", d.tg_invite); } catch {}
      }
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
  // (`t.me/CyclePartners_bot/<app>?startapp=videos`). Ex. lien direct « Vidéos ».
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
      monitoring: "audio",
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

  // ?code dans l'URL → on EXIGE le code d'invitation (et on pré-remplit la valeur
  // éventuelle), puis on nettoie l'URL.
  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      if (u.searchParams.has("code")) {
        const v = (u.searchParams.get("code") || "").trim();
        setForceCode(true);
        if (v && v !== "1" && v.toLowerCase() !== "true") setCodePrefill(v.toUpperCase());
        u.searchParams.delete("code");
        window.history.replaceState({}, "", u);
      }
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

  // Ping serveur : 1 visite par session navigateur (attend que le token soit prêt,
  // car en mini-app il arrive après l'auto-login Telegram).
  useEffect(() => {
    try { if (sessionStorage.getItem("pi_visit_pinged")) return; } catch {}
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      if (getToken()) {
        clearInterval(id);
        try { sessionStorage.setItem("pi_visit_pinged", "1"); } catch {}
        apiVisit().catch(() => {});
      } else if (tries > 50) {
        clearInterval(id);
      }
    }, 200);
    return () => clearInterval(id);
  }, []);

  const name = user?.name || "Invité";
  const canCopy = copyAccess;
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

  // ?code dans l'URL → gate OBLIGATOIRE pour saisir le code d'invitation.
  // Tous les autres visiteurs (inscrits ou non) voient le dashboard verrouillé.
  if (forceCode && !registered && !gateSkipped) {
    const isTgUser = emailLc.endsWith("@telegram.local");
    let isDirect = false;
    try {
      const p = new URLSearchParams(window.location.search);
      const sp = window.Telegram?.WebApp?.initDataUnsafe?.start_param || "";
      isDirect = p.get("direct") === "1" || sp === "direct";
    } catch {}
    return (
      <div className="min-h-screen aura">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
        <SignupGate
          onDone={() => { window.location.href = `/dashboard?tab=audio`; }}
          onLogin={() => setLoginOpen(true)}
          skipCode={false}
          initialCode={codePrefill}
          tgName={isTgUser ? (user?.name || "") : ""}
          title="Code d'invitation requis"
          noPassword={isTgUser}
        />
      </div>
    );
  }

  const isUnlockParam = (() => { try { return new URLSearchParams(window.location.search).get("unlock") === "1"; } catch { return false; } })();

  return (
    <UnlockProvider>
    {isUnlockParam && <AutoUnlock />}
    <div className="min-h-screen aura">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* top bar */}
      <header className="sticky top-0 z-40 glass border-b hairline shadow-[0_8px_32px_-8px_rgba(0,0,0,0.55)]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-5 h-16 flex items-center justify-between gap-3">
          <a href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 min-w-0 group">
            <span className="leading-tight min-w-0">
              <span className="block font-display text-[14px] sm:text-[15px] text-bone truncate group-hover:text-white transition-colors duration-200">Julien — Club des Informateurs</span>
              <span className="block font-mono text-[9px] uppercase tracking-widest2 text-gold/70">Micro hedge funds</span>
            </span>
          </a>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[12.5px] text-mist/70 hidden md:inline">Bonjour, <span className="text-bone font-medium">{name}</span></span>
            {user ? (
              <button onClick={() => { logout(); window.location.href = "/"; }}
                      className="btn-ghost rounded-full px-4 py-2 text-[12px] tracking-wide">Se déconnecter</button>
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
            <nav className="flex lg:flex-col gap-0.5">
              {nav.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setTab(n.id)}
                  className={`relative flex items-center gap-2.5 rounded-xl px-3.5 lg:px-4 py-2.5 text-[13px] lg:text-[13.5px] whitespace-nowrap transition-all duration-200 ${
                    tab === n.id
                      ? "bg-gold/[0.07] text-bone border gold-line shadow-[inset_3px_0_0_rgba(46,230,168,0.55),0_2px_12px_-4px_rgba(0,0,0,0.4)]"
                      : "text-mist/70 hover:text-bone hover:bg-white/[0.03] border border-transparent"
                  }`}
                >
                  <span className={`text-[14px] transition-all duration-200 ${tab === n.id ? "text-gold" : "text-mist/40 group-hover:text-mist/70"}`}>{n.iconNode ? <n.iconNode className="h-[15px] w-[15px]" /> : n.icon}</span>
                  <span className="font-medium">{n.label}</span>
                  {n.badge && (
                    <span className="lg:ml-auto shrink-0 rounded-full bg-gold/15 border gold-line px-2 py-0.5 text-[8.5px] font-mono uppercase tracking-wider text-gold/90">
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
          {tab === "portfolio" && <PortfolioKraken onGoInvest={() => setTab("analytics")} onGoTrading={() => setTab("monitoring")} />}
          {tab === "contest" && <Contest />}
          {tab === "vip" && <XStocks />}
          {/* Academy : seuls les modules sont verrouillés (verrou interne) */}
          {tab === "academy" && <Academy />}
          {/* Logs : historique de tous les trades (verrou interne) */}
          {tab === "logs" && <Logs />}
          {/* Futures : KPIs copy + historique des trades julien */}
          {tab === "monitoring" && <Monitoring onGoCopy={() => setTab("copy")} onGoMonitoring={() => setTab("audio")} />}
          {/* Monitoring audio : points vocaux de Julien */}
          {tab === "audio" && <MonitoringAudio />}
          {tab === "analytics" && (
            <Analytics
              copyAccess={copyAccess}
              copyRequest={copyRequest}
              hasAccess={hasAccess}
              tgInvite={tgInvite}
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
                {!hasAccess ? (
                  <>
                    <div className="text-[28px] mb-3">🔒</div>
                    <p className="font-display text-[20px] text-bone">Accès membre requis</p>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-mist max-w-prose2 mx-auto">
                      Le copy-trading automatique est réservé aux membres actifs (IIBAN validé ou abonnement).
                    </p>
                    <CopyNoAccessCta />
                  </>
                ) : copyRequest ? (
                  <>
                    <div className="text-[28px] mb-3">⏳</div>
                    <p className="font-display text-[20px] text-bone">Demande envoyée</p>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-mist max-w-prose2 mx-auto">
                      Votre demande d'accès au copy auto a bien été transmise. Julien la traitera prochainement.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-[28px] mb-3">🔁</div>
                    <p className="font-display text-[20px] text-bone">Accès sur demande</p>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-mist max-w-prose2 mx-auto">
                      Le copy-trading automatique est disponible sur demande. Cliquez ci-dessous pour envoyer une demande d'accès à Julien.
                    </p>
                    <button
                      onClick={async () => {
                        setCopyRequest(true);
                        await apiCopyRequest();
                      }}
                      className="mt-6 btn-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold"
                    >
                      Demander l'accès au copy auto
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {tab === "billing" && <Billing />}
          {tab === "account" && <Account />}
        </main>
      </div>

      {/* Disclaimer réglementaire */}
      <div className="mx-auto max-w-[860px] px-4 pb-[calc(80px+env(safe-area-inset-bottom))] lg:pb-12">
        <LegalDisclaimer />
      </div>

      {/* Barre du bas (mobile uniquement) */}
      {(() => {
        const primary = nav.filter((n) => PRIMARY_TABS.includes(n.id));
        const activeInPrimary = primary.some((n) => n.id === tab);
        return (
          <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-ink-900 border-t hairline backdrop-blur-xl shadow-[0_-20px_50px_rgba(0,0,0,0.75)] pb-[env(safe-area-inset-bottom)]">
            <div className="grid grid-cols-5">
              {primary.map((n) => {
                const on = tab === n.id;
                return (
                  <button key={n.id} onClick={() => { setTab(n.id); setMoreOpen(false); }}
                    className={`relative flex flex-col items-center justify-center gap-1 py-3 text-[10.5px] font-medium transition-all duration-200 ${
                      on ? "text-gold" : "text-mist/50 active:text-mist"
                    }`}>
                    {on && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-gold shadow-[0_0_8px_rgba(46,230,168,0.8)]" />}
                    <span className={`text-[20px] leading-none transition-transform duration-200 ${on ? "scale-110" : ""}`}>{n.iconNode ? <n.iconNode className="h-5 w-5" /> : n.icon}</span>
                    <span className="truncate max-w-[66px]">{n.label}</span>
                  </button>
                );
              })}
              <button onClick={() => setMoreOpen(true)}
                className={`relative flex flex-col items-center justify-center gap-1 py-3 text-[10.5px] font-medium transition-all duration-200 ${
                  !activeInPrimary ? "text-gold" : "text-mist/50"
                }`}>
                {!activeInPrimary && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-gold shadow-[0_0_8px_rgba(46,230,168,0.8)]" />}
                <span className={`text-[20px] leading-none transition-transform duration-200 ${!activeInPrimary ? "scale-110" : ""}`}>⋯</span>
                <span>Plus</span>
              </button>
            </div>
          </nav>
        );
      })()}

      {/* Feuille « Plus » (mobile) — tous les onglets */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setMoreOpen(false)} />
          <div className="relative w-full rounded-t-[28px] border-t gold-line bg-ink-900/98 backdrop-blur-2xl p-5 pb-[calc(env(safe-area-inset-bottom)+20px)] shadow-[0_-24px_60px_rgba(0,0,0,0.8)]">
            {/* drag handle */}
            <div className="mx-auto mb-4 h-[3px] w-10 rounded-full bg-white/15" />
            <div className="flex items-center justify-between mb-4">
              <span className="eyebrow">Menu</span>
              <button onClick={() => setMoreOpen(false)} aria-label="Fermer"
                className="h-8 w-8 grid place-items-center rounded-full border hairline text-mist/60 hover:text-bone transition-colors">
                <span className="block w-3 h-px bg-current rotate-45 translate-y-[0.5px]" />
                <span className="block w-3 h-px bg-current -rotate-45 -translate-y-[0.5px]" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {nav.map((n) => (
                <button key={n.id} onClick={() => { setTab(n.id); setMoreOpen(false); }}
                  className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-4 text-[12px] transition-all duration-150 ${
                    tab === n.id
                      ? "bg-gold/[0.08] text-bone gold-line shadow-[inset_0_1px_0_rgba(46,230,168,0.12)]"
                      : "text-mist/60 border-white/[0.06] active:bg-white/[0.04]"
                  }`}>
                  <span className={`text-[22px] leading-none ${tab === n.id ? "" : "opacity-60"}`}>{n.iconNode ? <n.iconNode className="h-[22px] w-[22px]" /> : n.icon}</span>
                  <span className="text-center leading-tight font-medium">{n.label}</span>
                  {n.badge && (
                    <span className="absolute top-1.5 right-1.5 rounded-full bg-gold/20 border gold-line px-1.5 text-[7.5px] font-mono uppercase tracking-wider text-gold">
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
