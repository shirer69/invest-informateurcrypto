"use client";

import { useEffect, useState, useCallback } from "react";
import { vipPosts, getToken } from "@/lib/clientStore";

function timeAgo(iso) {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function VipFeed() {
  const [posts, setPosts] = useState(null);
  const [err, setErr] = useState(null);
  const authed = typeof window !== "undefined" && !!getToken();

  const load = useCallback(async () => {
    const r = await vipPosts();
    if (r.ok) { setPosts(r.posts); setErr(null); }
    else setErr(r.error);
  }, []);

  useEffect(() => {
    if (!authed) return;
    load();
    const id = setInterval(load, 60000); // ingestion temps réel (1 min)
    return () => clearInterval(id);
  }, [authed, load]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-display text-[18px] text-bone">Posts VIP — en direct</h3>
        <span className="font-mono text-[9px] uppercase tracking-widest2 text-gold/80 border gold-line rounded px-1.5 py-0.5">live</span>
        {authed && <button onClick={load} className="ml-auto text-[12px] text-mist hover:text-bone">↻ rafraîchir</button>}
      </div>

      {!authed ? (
        <div className="rounded-2xl border hairline bg-ink-800/50 p-6 text-[13.5px] text-mist">
          Connectez-vous pour accéder aux dernières publications du groupe VIP.
        </div>
      ) : posts === null ? (
        <div className="text-[13px] text-mist">Chargement du flux…</div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border hairline bg-ink-800/50 p-6 text-[13.5px] text-mist">
          Aucune publication récente pour le moment.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <article key={p.id} className="rounded-2xl border hairline bg-ink-800/50 p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">
                  VIP Pôle Invest
                </span>
                <span className="font-mono text-[10.5px] text-mist/60">{timeAgo(p.date)}</span>
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-slate-200 whitespace-pre-wrap break-words">
                {p.text}
              </p>
              {p.media && (
                <span className="mt-2 inline-block font-mono text-[10.5px] text-mist/60">📎 média joint</span>
              )}
            </article>
          ))}
        </div>
      )}

      <p className="mt-5 text-[11.5px] leading-relaxed text-mist/60">
        Flux du canal privé, réservé aux membres connectés. Contenu éducatif — ne constitue
        pas un conseil en investissement.
      </p>
    </div>
  );
}
