"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { chatList, chatSend, getToken } from "@/lib/clientStore";

export default function Chat({ me }) {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const firstLoad = useRef(true);
  const authed = typeof window !== "undefined" && !!getToken();

  const refresh = useCallback(async () => {
    const list = await chatList(0);
    // n'actualise l'état que si le contenu a vraiment changé (évite re-render inutile)
    setMsgs((prev) => {
      const a = prev[prev.length - 1];
      const b = list[list.length - 1];
      if (prev.length === list.length && a?.ts === b?.ts) return prev;
      return list;
    });
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 4000); // polling chat partagé
    return () => clearInterval(id);
  }, [refresh]);

  // Auto-défilement DANS la zone de messages uniquement (jamais la page entière),
  // et seulement si l'utilisateur est déjà près du bas.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (firstLoad.current || nearBottom) {
      el.scrollTop = el.scrollHeight;
      if (msgs.length) firstLoad.current = false;
    }
  }, [msgs]);

  async function send(e) {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    setSending(true);
    const r = await chatSend(v);
    setSending(false);
    if (r.ok) {
      setText("");
      refresh();
    }
  }

  return (
    <div className="flex flex-col h-[440px] rounded-2xl border hairline bg-ink-800/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b hairline">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="font-display text-[15px] text-bone">Discussion membres</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60"># général</span>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {msgs.length === 0 && (
          <p className="text-[13px] text-mist/60">Aucun message pour le moment. Lancez la discussion 👋</p>
        )}
        {msgs.map((m, i) => {
          const mine = me && m.name === me;
          const fmtTs = (ts) => {
            if (!ts) return null;
            const d = new Date(ts * 1000);
            return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
          };
          return (
            <div key={i} className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className={`text-[12.5px] font-semibold ${mine ? "text-gold" : "text-bone"}`}>
                  {m.name}
                </span>
                {m.ts && <span className="text-[10.5px] text-mist/40 font-mono">{fmtTs(m.ts)}</span>}
              </div>
              <p className="text-[13.5px] leading-snug text-mist mt-0.5">{m.text}</p>
            </div>
          );
        })}
      </div>

      {authed ? (
        <form onSubmit={send} className="flex gap-2 p-3 border-t hairline">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Votre message…"
            className="flex-1 min-w-0 rounded-lg bg-ink-900 border border-white/10 focus:border-gold/50 px-3.5 py-2.5 text-bone placeholder:text-mist/40 text-[13.5px] outline-none transition-colors"
          />
          <button disabled={sending} className="btn-gold rounded-lg px-4 py-2.5 text-[13px] font-semibold disabled:opacity-60">
            {sending ? "…" : "Envoyer"}
          </button>
        </form>
      ) : (
        <div className="p-3 border-t hairline text-center text-[12.5px] text-mist/70">
          Connectez-vous (via l'adhésion) pour participer à la discussion.
        </div>
      )}
    </div>
  );
}
