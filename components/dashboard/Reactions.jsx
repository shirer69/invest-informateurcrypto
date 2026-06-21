"use client";

import { useState, useEffect } from "react";
import { getToken, apiToggleReaction } from "@/lib/clientStore";

const EMPTY = {
  like:    { count: 0, me: false },
  bullish: { count: 0, me: false },
  bearish: { count: 0, me: false },
};

const ICONS = {
  like: (active) => (
    <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 transition-transform ${active ? "scale-110" : ""}`}
         fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  ),
  bullish: (active) => (
    <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 transition-transform ${active ? "scale-110" : ""}`}
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  bearish: (active) => (
    <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 transition-transform ${active ? "scale-110" : ""}`}
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  ),
};

const STYLE = {
  like:    { on: "bg-gold/15 border-gold/40 text-gold", title: "J'aime" },
  bullish: { on: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400", title: "Bullish" },
  bearish: { on: "bg-rose-500/15 border-rose-500/40 text-rose-400", title: "Bearish" },
};

export default function Reactions({ contentType, contentId, initial }) {
  const [data, setData] = useState({ ...EMPTY, ...(initial || {}) });
  const [busy, setBusy] = useState(false);
  const authed = typeof window !== "undefined" && !!getToken();

  // `initial` arrive de façon asynchrone (après le fetch des likes) : on
  // resynchronise l'état quand il devient disponible, sinon les compteurs
  // restent figés à 0 jusqu'au premier clic.
  useEffect(() => {
    if (initial) setData({ ...EMPTY, ...initial });
  }, [initial]);

  async function toggle(e, reaction) {
    if (e) e.stopPropagation();
    if (!authed || busy) return;
    setBusy(true);
    const r = await apiToggleReaction(contentType, contentId, reaction);
    if (r && r.ok && r.reactions) setData(r.reactions);
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {["like", "bullish", "bearish"].map((rk) => {
        const d = data[rk] || EMPTY[rk];
        return (
          <button
            key={rk}
            onClick={(e) => toggle(e, rk)}
            disabled={!authed || busy}
            title={authed ? STYLE[rk].title : "Connectez-vous pour réagir"}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-mono border transition-all ${
              d.me ? STYLE[rk].on : "border-white/10 text-mist/50 hover:border-white/20 hover:text-mist"
            } disabled:opacity-40 disabled:cursor-default`}
          >
            {ICONS[rk](d.me)}
            <span>{d.count > 0 ? d.count : ""}</span>
          </button>
        );
      })}
    </div>
  );
}
