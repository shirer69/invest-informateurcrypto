"use client";

import { useEffect, useRef, useState } from "react";

const KEY = "pi_chat";

const SEED = [
  { user: "Julien M.", text: "Bienvenue dans l'espace membres 👋 Restez disciplinés cette semaine.", t: 0, admin: true },
  { user: "Maklesguy", text: "Le money management est vraiment ce qui change tout.", t: 0 },
  { user: "SebAi", text: "Hâte du brief de ce soir 🔥", t: 0 },
];

export default function Chat({ me }) {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      setMsgs(saved && saved.length ? saved : SEED);
    } catch {
      setMsgs(SEED);
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  function send(e) {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    const next = [...msgs, { user: me || "Invité", text: v, t: 1 }];
    setMsgs(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next.slice(-200)));
    } catch {}
    setText("");
  }

  return (
    <div className="flex flex-col h-[420px] rounded-2xl border hairline bg-ink-800/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b hairline">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="font-display text-[15px] text-bone">Discussion membres</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60">
          # général
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className={`text-[12.5px] font-semibold ${m.admin ? "text-gold" : "text-bone"}`}>
                {m.user}
              </span>
              {m.admin && (
                <span className="font-mono text-[8.5px] uppercase tracking-widest2 text-gold/70 border gold-line rounded px-1">
                  admin
                </span>
              )}
            </div>
            <p className="text-[13.5px] leading-snug text-mist mt-0.5">{m.text}</p>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 p-3 border-t hairline">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Votre message…"
          className="flex-1 min-w-0 rounded-lg bg-ink-900 border border-white/10 focus:border-gold/50 px-3.5 py-2.5 text-bone placeholder:text-mist/40 text-[13.5px] outline-none transition-colors"
        />
        <button className="btn-gold rounded-lg px-4 py-2.5 text-[13px] font-semibold">
          Envoyer
        </button>
      </form>
    </div>
  );
}
