"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { API_BASE } from "@/lib/site";

function fmtTs(ts) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_MAP = {
  active:          { label: "Membre actif",               cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  pending_trade:   { label: "Dépôt reçu — first trade manquant", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  pending_grant:   { label: "IIBAN actif — accès non accordé",   cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  pending_deposit: { label: "IIBAN saisi — dépôt en attente",    cls: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  no_iiban:        { label: "Inscrit — pas de IIBAN",            cls: "bg-white/5 text-mist/60 border-white/10" },
  unknown:         { label: "Inconnu",                           cls: "bg-white/5 text-mist/40 border-white/10" },
};

function MemberBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.unknown;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function SupportAdmin({ adminKey }) {
  const [convs, setConvs]       = useState([]);
  const [selected, setSelected] = useState(null); // email
  const [thread, setThread]     = useState([]);
  const [profile, setProfile]   = useState(null);
  const [reply, setReply]       = useState("");
  const [sending, setSending]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingThread, setLT]  = useState(false);
  const listRef = useRef(null);

  const fetchConvs = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/api/admin/support/conversations`, {
        headers: { "x-admin-key": adminKey }, cache: "no-store",
      });
      const d = await r.json();
      if (d.ok) setConvs(d.conversations || []);
    } catch {}
  }, [adminKey]);

  const fetchThread = useCallback(async (email) => {
    if (!email) return;
    setLT(true);
    try {
      const r = await fetch(
        `${API_BASE}/api/admin/support/thread?email=${encodeURIComponent(email)}`,
        { headers: { "x-admin-key": adminKey }, cache: "no-store" },
      );
      const d = await r.json();
      if (d.ok) {
        setThread(d.messages || []);
        setProfile(d.profile || null);
        setConvs((prev) => prev.map((c) => c.email === email ? { ...c, unread: 0 } : c));
      }
    } catch {}
    setLT(false);
  }, [adminKey]);

  useEffect(() => {
    fetchConvs();
    const id = setInterval(fetchConvs, 20_000);
    return () => clearInterval(id);
  }, [fetchConvs]);

  // Scroll bas du thread
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread]);

  // Poll thread actif
  useEffect(() => {
    if (!selected) return;
    const id = setInterval(() => fetchThread(selected), 10_000);
    return () => clearInterval(id);
  }, [selected, fetchThread]);

  function selectConv(email) {
    setSelected(email);
    setThread([]);
    setProfile(null);
    setReply("");
    fetchThread(email);
  }

  async function sendReply(e) {
    e.preventDefault();
    const msg = reply.trim();
    if (!msg || sending) return;
    setSending(true);
    try {
      const r = await fetch(`${API_BASE}/api/admin/support/reply`, {
        method: "POST",
        headers: { "x-admin-key": adminKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email: selected, message: msg }),
      });
      const d = await r.json();
      if (d.ok) { setReply(""); await fetchThread(selected); }
    } catch {}
    setSending(false);
  }

  async function deleteConv() {
    if (!selected || !confirm(`Supprimer toute la conversation avec ${selected} ?`)) return;
    setDeleting(true);
    try {
      const r = await fetch(`${API_BASE}/api/admin/support/delete`, {
        method: "POST",
        headers: { "x-admin-key": adminKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email: selected }),
      });
      const d = await r.json();
      if (d.ok) {
        setConvs((prev) => prev.filter((c) => c.email !== selected));
        setSelected(null); setThread([]);
      }
    } catch {}
    setDeleting(false);
  }

  const totalUnread = convs.reduce((s, c) => s + (c.unread || 0), 0);

  return (
    <div className="flex gap-4 h-[680px]">
      {/* Liste des conversations */}
      <div className="w-72 shrink-0 rounded-2xl border hairline bg-ink-800/50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b hairline">
          <span className="font-display text-[14px] text-bone">Conversations</span>
          {totalUnread > 0 && (
            <span className="h-5 min-w-[20px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
              {totalUnread}
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.05]">
          {convs.length === 0 && (
            <div className="p-6 text-center text-[13px] text-mist/50">Aucune conversation.</div>
          )}
          {convs.map((c) => (
            <button
              key={c.email}
              onClick={() => selectConv(c.email)}
              className={`w-full text-left px-4 py-3 transition-colors hover:bg-ink-700/50 ${
                selected === c.email ? "bg-gold/[0.08] border-l-2 border-gold" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="font-semibold text-[13px] text-bone truncate">{c.name}</span>
                {c.unread > 0 && (
                  <span className="h-4 min-w-[16px] rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center px-1 shrink-0">
                    {c.unread}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-mist/50 truncate mb-1">{c.email}</div>
              <div className="text-[11.5px] text-mist/70 truncate">
                {c.preview_from_admin ? <span className="text-gold/70">Vous: </span> : ""}
                {c.preview}
              </div>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded-full border ${(STATUS_MAP[c.member_status] || STATUS_MAP.unknown).cls}`}>
                  {(STATUS_MAP[c.member_status] || STATUS_MAP.unknown).label}
                </span>
                <span className="text-[10px] text-mist/40 shrink-0">{fmtTs(c.last_ts)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 rounded-2xl border hairline bg-ink-800/50 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-[13px] text-mist/50 flex-col gap-2">
            <span className="text-3xl">💬</span>
            <span>Sélectionnez une conversation</span>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="px-5 py-3 border-b hairline space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-bone text-[14px]">
                    {convs.find((c) => c.email === selected)?.name || selected}
                  </div>
                  <div className="text-[11px] text-mist/50 break-all">{selected}</div>
                </div>
                <button
                  onClick={deleteConv}
                  disabled={deleting}
                  className="text-[11.5px] text-rose-400/70 hover:text-rose-400 transition-colors disabled:opacity-40 shrink-0"
                >
                  {deleting ? "Suppression…" : "Supprimer"}
                </button>
              </div>
              {/* Infos membre */}
              <div className="flex flex-wrap items-center gap-2">
                {profile && <MemberBadge status={profile.member_status} />}
                {profile?.uid && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-mist/70">
                    IIBAN <span className="text-bone">{profile.uid}</span>
                  </span>
                )}
                {!profile?.uid && (
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-mist/40">
                    Pas de IIBAN
                  </span>
                )}
                {profile?.tg_id && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-mist/70">
                    TG <span className="text-bone">{profile.tg_id}</span>
                  </span>
                )}
                {!profile?.tg_id && (
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-mist/40">
                    Pas de TG ID
                  </span>
                )}
              </div>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {loadingThread && thread.length === 0 && (
                <div className="text-center text-[12px] text-mist/50">Chargement…</div>
              )}
              {thread.map((m) => (
                <div key={m.id} className={`flex ${m.from_admin ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-[13px] leading-snug ${
                    m.from_admin
                      ? "bg-gold/[0.12] border border-gold/20 text-bone rounded-tr-sm"
                      : "bg-ink-700 text-bone rounded-tl-sm"
                  }`}>
                    {!m.from_admin && (
                      <div className="text-[9.5px] font-mono uppercase tracking-widest2 text-mist/50 mb-1">
                        {m.name || selected.split("@")[0]}
                      </div>
                    )}
                    {m.from_admin && (
                      <div className="text-[9.5px] font-mono uppercase tracking-widest2 text-gold/70 mb-1">Vous (admin)</div>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.message}</p>
                    <div className="text-[9.5px] text-mist/40 mt-1 text-right">{fmtTs(m.ts)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply */}
            <form onSubmit={sendReply} className="flex gap-2 p-4 border-t hairline">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) sendReply(e); }}
                placeholder="Répondre… (Entrée pour envoyer)"
                rows={2}
                maxLength={2000}
                className="flex-1 min-w-0 rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-3.5 py-2.5 text-bone placeholder:text-mist/40 text-[13px] outline-none transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className="self-end rounded-xl btn-gold px-4 py-2.5 text-[13px] font-semibold disabled:opacity-40"
              >
                {sending ? "…" : "Envoyer"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
