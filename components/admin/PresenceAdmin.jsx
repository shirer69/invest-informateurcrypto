"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/site";

const REFRESH_MS = 15_000;

function dur(s) {
  if (s < 60)  return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}min`;
  return `${Math.floor(s / 3600)}h${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}`;
}

function Dot({ last_seen_s }) {
  const fresh = last_seen_s < 35;
  return (
    <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${fresh ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
  );
}

export default function PresenceAdmin({ adminKey }) {
  const [data, setData]     = useState(null);
  const [error, setError]   = useState(null);
  const [now, setNow]       = useState(Date.now());
  const iref = useRef(null);
  const tref = useRef(null);

  async function load() {
    try {
      const r = await fetch(`${API_BASE}/api/admin/presence`, {
        headers: { "x-admin-key": adminKey },
        cache: "no-store",
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      setData(d);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
    iref.current = setInterval(load, REFRESH_MS);
    tref.current = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearInterval(iref.current); clearInterval(tref.current); };
  }, []);

  const sessions = data?.online ?? [];
  const members  = sessions.filter(s => s.email && !s.email.endsWith("@telegram.local"));
  const tgUsers  = sessions.filter(s => s.email?.endsWith("@telegram.local"));
  const anon     = sessions.filter(s => !s.email);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-[20px] text-bone">Présence en ligne</h2>
          <p className="text-[12px] text-mist/50 mt-0.5">Actualisé toutes les 15 s — sessions actives dans les 3 dernières minutes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] px-4 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-display text-[22px] text-emerald-400 font-black">{data?.total ?? "—"}</span>
            <span className="text-[12px] text-mist/60">en ligne</span>
          </div>
          <button onClick={load} className="text-[11px] text-mist hover:text-bone border border-white/10 rounded-lg px-3 py-1.5">
            ↻ Rafraîchir
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-2.5 text-[12.5px] text-rose-300">
          Erreur : {error}
        </div>
      )}

      {/* Résumé par page */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(
            sessions.reduce((acc, s) => {
              acc[s.tab_label] = (acc[s.tab_label] || 0) + 1;
              return acc;
            }, {})
          )
          .sort((a, b) => b[1] - a[1])
          .map(([label, count]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-ink-800/50 px-3 py-2.5 flex items-center justify-between gap-2">
              <span className="text-[12px] text-mist/80 truncate">{label}</span>
              <span className="font-mono text-[14px] font-bold text-bone shrink-0">{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Liste des sessions */}
      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-ink-800/30 p-8 text-center text-[13px] text-mist/50">
          {data ? "Aucun visiteur actif en ce moment." : "Chargement…"}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-ink-800/30 overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-white/8 text-mist/50 font-mono text-[10px] uppercase tracking-widest">
                <th className="text-left px-4 py-2.5">Utilisateur</th>
                <th className="text-left px-4 py-2.5 hidden sm:table-cell">Page</th>
                <th className="text-left px-4 py-2.5 hidden md:table-cell">Sur cette page</th>
                <th className="text-left px-4 py-2.5 hidden lg:table-cell">Connecté depuis</th>
                <th className="text-right px-4 py-2.5">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sessions.map((s) => (
                <tr key={s.session_id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Utilisateur */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[13px] shrink-0">{s.device}</span>
                      <div className="min-w-0">
                        {s.name ? (
                          <p className="text-bone font-medium truncate">{s.name}</p>
                        ) : s.email?.endsWith("@telegram.local") ? (
                          <p className="text-sky-300/80 truncate">Utilisateur TG</p>
                        ) : (
                          <p className="text-mist/40 italic">Visiteur</p>
                        )}
                        {s.email && !s.email.endsWith("@telegram.local") && (
                          <p className="text-mist/50 text-[11px] truncate">{s.email}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Page */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="rounded-full bg-gold/10 border border-gold/20 px-2.5 py-0.5 text-gold/90 text-[11px] font-mono whitespace-nowrap">
                      {s.tab_label}
                    </span>
                  </td>
                  {/* Durée sur la page */}
                  <td className="px-4 py-3 hidden md:table-cell font-mono text-[11px] text-mist/60">
                    {dur(s.tab_since_s)}
                  </td>
                  {/* Connecté depuis */}
                  <td className="px-4 py-3 hidden lg:table-cell font-mono text-[11px] text-mist/60">
                    {dur(s.since_s)}
                  </td>
                  {/* Statut */}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Dot last_seen_s={s.last_seen_s} />
                      <span className="text-[11px] font-mono text-mist/50">{s.last_seen_s}s</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pied de tableau : répartition */}
          <div className="border-t border-white/8 px-4 py-2.5 flex items-center gap-4 text-[11px] text-mist/50 flex-wrap">
            {members.length  > 0 && <span>👤 {members.length} membre{members.length > 1 ? "s" : ""}</span>}
            {tgUsers.length  > 0 && <span>✈️ {tgUsers.length} Telegram</span>}
            {anon.length     > 0 && <span>👻 {anon.length} visiteur{anon.length > 1 ? "s" : ""} anonyme{anon.length > 1 ? "s" : ""}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
