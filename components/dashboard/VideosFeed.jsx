"use client";

import { useEffect, useState } from "react";
import { YOUTUBE_URL } from "@/lib/site";
import { IconArrow } from "@/components/Icons";
import { apiToggleLike, apiGetLikes, getToken } from "@/lib/clientStore";

function frDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch { return ""; }
}

function LikeButton({ contentId, initialCount = 0, initialLiked = false }) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);
  const authed = typeof window !== "undefined" && !!getToken();

  async function toggle(e) {
    e.stopPropagation();
    if (!authed || loading) return;
    setLoading(true);
    const r = await apiToggleLike("video", contentId);
    if (r.ok) { setLiked(r.liked); setCount(r.count); }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={!authed || loading}
      title={authed ? (liked ? "Retirer mon like" : "J'aime") : "Connectez-vous pour liker"}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-mono border transition-all ${
        liked
          ? "bg-gold/15 border-gold/40 text-gold"
          : "border-white/10 text-mist/50 hover:border-white/20 hover:text-mist"
      } disabled:opacity-40 disabled:cursor-default`}
    >
      <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 transition-transform ${liked ? "scale-110" : ""}`} fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      </svg>
      <span>{count > 0 ? count : ""}</span>
    </button>
  );
}

export default function VideosFeed() {
  const [videos, setVideos] = useState(null);
  const [active, setActive] = useState(null);
  const [likeData, setLikeData] = useState({});

  useEffect(() => {
    let alive = true;
    fetch("/api/videos", { cache: "no-store" })
      .then((r) => r.json()).catch(() => ({ videos: [] }))
      .then(async (d) => {
        if (!alive) return;
        const vids = d.videos || [];
        setVideos(vids);
        const ids = vids.map((v) => v.id);
        if (ids.length) {
          const ld = await apiGetLikes("video", ids);
          if (alive && ld.ok) setLikeData(ld.likes || {});
        }
      });
    return () => { alive = false; };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-[18px] text-bone">🎬 Vidéos — Julien</h3>
          <span className="font-mono text-[9px] uppercase tracking-widest2 text-gold/80 border gold-line rounded px-1.5 py-0.5">YouTube</span>
        </div>
        <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-1.5 text-[12.5px] text-gold hover:text-gold-soft transition-colors">
          Voir la chaîne <IconArrow className="h-3.5 w-3.5" />
        </a>
      </div>

      {videos === null ? (
        <div className="text-[13px] text-mist/60">Chargement des vidéos…</div>
      ) : videos.length === 0 ? (
        <div className="rounded-2xl border hairline bg-ink-800/50 p-6 text-[13.5px] text-mist">
          Aucune vidéo pour le moment.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => (
            <div key={v.id} className="rounded-2xl border hairline bg-ink-800/50 overflow-hidden">
              <div className="relative aspect-video bg-ink-900">
                {active === v.id ? (
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0`}
                    title={v.title} allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <button onClick={() => setActive(v.id)} className="group absolute inset-0">
                    <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt={v.title}
                         className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" loading="lazy" />
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid place-items-center h-12 w-12 rounded-full bg-black/60 border border-white/20 text-white group-hover:scale-110 transition-transform">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 ml-0.5" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      </span>
                    </span>
                  </button>
                )}
              </div>
              <div className="p-4">
                <p className="text-[13.5px] leading-snug text-bone line-clamp-2">{v.title}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="font-mono text-[11px] text-mist/60">{frDate(v.published)}</p>
                  <LikeButton
                    contentId={v.id}
                    initialCount={likeData[v.id]?.count ?? 0}
                    initialLiked={likeData[v.id]?.liked ?? false}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-5 text-[11.5px] leading-relaxed text-mist/60">
        Dernières vidéos de la chaîne. Accès libre. Contenu éducatif — ne constitue pas un conseil en investissement.
      </p>
    </div>
  );
}
