"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getToken, getUser } from "@/lib/clientStore";
import { API_BASE } from "@/lib/site";

function fmtTs(ts) {
  if (!ts) return "";
  const d = new Date(ts * 1000);
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function SupportChat() {
  const [open, setOpen]     = useState(false);
  const [msgs, setMsgs]     = useState([]);
  const [text, setText]     = useState("");
  const [sending, setSend]  = useState(false);
  const [unread, setUnread] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const listRef = useRef(null);
  const pollRef = useRef(null);

  const token = typeof window !== "undefined" ? getToken() : null;
  const authed = !!token;

  const authHeaders = useCallback(() => ({
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  }), [token]);

  const fetchMsgs = useCallback(async () => {
    if (!authed) return;
    try {
      const r = await fetch(`${API_BASE}/api/support/messages`, {
        headers: authHeaders(), cache: "no-store",
      });
      if (!r.ok) return;
      const d = await r.json();
      if (d.ok) { setMsgs(d.messages || []); setLoaded(true); }
    } catch {}
  }, [authed, authHeaders]);

  const fetchUnread = useCallback(async () => {
    if (!authed) return;
    try {
      const r = await fetch(`${API_BASE}/api/support/unread`, {
        headers: authHeaders(), cache: "no-store",
      });
      if (!r.ok) return;
      const d = await r.json();
      setUnread(d.count || 0);
    } catch {}
  }, [authed, authHeaders]);

  // Poll pour les non-lus quand bulle fermée
  useEffect(() => {
    if (!authed) return;
    fetchUnread();
    const id = setInterval(fetchUnread, 15_000);
    return () => clearInterval(id);
  }, [authed, fetchUnread]);

  // Poll messages quand ouvert
  useEffect(() => {
    if (!open || !authed) return;
    fetchMsgs();
    pollRef.current = setInterval(fetchMsgs, 8_000);
    return () => clearInterval(pollRef.current);
  }, [open, authed, fetchMsgs]);

  // Reset unread quand ouvert
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  // Scroll bas quand nouveaux msgs
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [msgs, open]);

  async function send(e) {
    e.preventDefault();
    const v = text.trim();
    if (!v || sending) return;
    setSend(true);
    try {
      const r = await fetch(`${API_BASE}/api/support/send`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ message: v }),
      });
      const d = await r.json();
      if (d.ok) { setText(""); await fetchMsgs(); }
    } catch {}
    setSend(false);
  }

  return (
    <>
      {/* Bulle flottante */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed z-[9998] flex items-center justify-center w-14 h-14 shadow-2xl bg-gold text-ink-900 transition-transform hover:scale-105 active:scale-95
          top-1/2 -translate-y-1/2 right-0 rounded-l-2xl rounded-r-none
          sm:top-auto sm:translate-y-0 sm:bottom-5 sm:right-5 sm:rounded-full"
        aria-label="Support"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed z-[9997] w-[340px] max-w-[calc(100vw-1rem)] rounded-2xl border hairline bg-ink-900 shadow-2xl flex flex-col overflow-hidden
          right-1 bottom-[calc(50%-210px)] sm:right-5 sm:bottom-24"
          style={{ height: "420px" }}>
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b hairline bg-ink-800/80">
            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gold/10 text-gold">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </span>
            <div>
              <div className="text-[13.5px] font-semibold text-bone leading-tight">Support Pôle Invest</div>
              <div className="text-[10.5px] text-mist/60">Réponse sous 24 h</div>
            </div>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {!authed && (
              <div className="h-full flex items-center justify-center text-center px-4">
                <div>
                  <div className="text-gold text-2xl mb-2">💬</div>
                  <p className="text-[13px] text-mist/70">Connectez-vous pour contacter le support.</p>
                </div>
              </div>
            )}
            {authed && !loaded && (
              <div className="h-full flex items-center justify-center">
                <span className="text-[12px] text-mist/50">Chargement…</span>
              </div>
            )}
            {authed && loaded && msgs.length === 0 && (
              <div className="pt-6 text-center">
                <div className="text-2xl mb-2">👋</div>
                <p className="text-[13px] text-mist/70">Comment pouvons-nous vous aider ?</p>
                <p className="text-[11.5px] text-mist/40 mt-1">Posez votre question ci-dessous.</p>
              </div>
            )}
            {msgs.map((m) => (
              <div key={m.id} className={`flex ${m.from_admin ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-[13px] leading-snug ${
                  m.from_admin
                    ? "bg-ink-700 text-bone rounded-tl-sm"
                    : "bg-gold/[0.15] border border-gold/20 text-bone rounded-tr-sm"
                }`}>
                  {m.from_admin && (
                    <div className="text-[9.5px] font-mono uppercase tracking-widest2 text-gold/70 mb-1">Support</div>
                  )}
                  <p className="whitespace-pre-wrap break-words">{m.message}</p>
                  <div className="text-[9.5px] text-mist/40 mt-1 text-right">{fmtTs(m.ts)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          {authed && (
            <form onSubmit={send} className="flex gap-2 p-3 border-t hairline bg-ink-800/50">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Votre message…"
                maxLength={2000}
                className="flex-1 min-w-0 rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-3 py-2.5 text-bone placeholder:text-mist/40 text-[13px] outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="rounded-xl bg-gold/[0.12] border border-gold/30 text-gold px-3 py-2 disabled:opacity-40 hover:bg-gold/20 transition-colors"
              >
                {sending ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
