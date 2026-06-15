"use client";

import { useEffect, useState, useCallback } from "react";
import { poleTradingAudios, audioStreamUrl, getToken, apiToggleLike, apiGetLikes } from "@/lib/clientStore";
import { Locked } from "./UnlockProvider";

function relTime(iso) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  const d = Math.floor(s / 86400);
  return d === 1 ? "hier" : `il y a ${d} j`;
}

function dateLabel(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
      timeZone: "Europe/Paris",
    });
  } catch { return ""; }
}

function dur(sec) {
  if (!sec && sec !== 0) return "";
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function LikeButton({ contentType, contentId, initialCount = 0, initialLiked = false }) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);
  const authed = typeof window !== "undefined" && !!getToken();

  async function toggle() {
    if (!authed || loading) return;
    setLoading(true);
    const r = await apiToggleLike(contentType, contentId);
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

function AudioCard({ a, latest, likeData }) {
  const id = String(a.id);
  return (
    <article className="rounded-2xl border hairline bg-ink-800/50 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src="/julien.jpg" alt="Julien"
               className="h-9 w-9 shrink-0 rounded-full border gold-line object-cover object-top" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display text-[14.5px] text-bone">Point audio</span>
              {latest && (
                <span className="font-mono text-[9px] uppercase tracking-widest2 text-gold border gold-line rounded-full px-1.5 py-0.5">Dernier</span>
              )}
              {a.duration != null && (
                <span className="font-mono text-[10.5px] text-mist/60">{dur(a.duration)}</span>
              )}
            </div>
            <div className="font-mono text-[10.5px] text-mist/70">
              {dateLabel(a.date)} · {latest ? <span className="text-gold/90">{relTime(a.date)}</span> : relTime(a.date)}
            </div>
          </div>
        </div>
        <LikeButton
          contentType="audio"
          contentId={id}
          initialCount={likeData?.[id]?.count ?? 0}
          initialLiked={likeData?.[id]?.liked ?? false}
        />
      </div>

      {a.caption && (
        <p className="mt-3 text-[13.5px] leading-relaxed text-slate-200 whitespace-pre-wrap break-words">{a.caption}</p>
      )}

      <audio controls preload="none" className="mt-3 w-full" style={{ height: 40 }}>
        <source src={audioStreamUrl(a.id)} type={a.mime || "audio/ogg"} />
      </audio>
    </article>
  );
}

export default function AudioFeed({ hideHeader = false }) {
  const [audios, setAudios] = useState(null);
  const [likeData, setLikeData] = useState({});
  const [err, setErr] = useState(null);
  const authed = typeof window !== "undefined" && !!getToken();

  const load = useCallback(async () => {
    const r = await poleTradingAudios();
    if (r.ok) {
      setAudios(r.audios);
      setErr(null);
      const ids = (r.audios || []).map((a) => String(a.id));
      if (ids.length) {
        const ld = await apiGetLikes("audio", ids);
        if (ld.ok) setLikeData(ld.likes || {});
      }
    } else setErr(r.error);
  }, []);

  useEffect(() => {
    if (!authed) return;
    load();
    const id = setInterval(load, 120000);
    return () => clearInterval(id);
  }, [authed, load]);

  return (
    <div>
      {!hideHeader && (
        <>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display text-[18px] text-bone">Audios — Pôle Trading Julien</h3>
            <span className="font-mono text-[9px] uppercase tracking-widest2 text-gold/80 border gold-line rounded px-1.5 py-0.5">live</span>
            {authed && <button onClick={load} className="ml-auto text-[12px] text-mist hover:text-bone">↻</button>}
          </div>
          <p className="text-[13px] text-mist mb-4">Les 4 derniers points audio de Julien, à écouter directement ici.</p>
        </>
      )}

      {!authed ? (
        <div className="rounded-2xl border hairline bg-ink-800/50 p-6 text-[13.5px] text-mist">
          Connectez-vous pour écouter les derniers audios du Pôle Trading.
        </div>
      ) : audios === null ? (
        <div className="text-[13px] text-mist">Chargement des audios…</div>
      ) : audios.length === 0 ? (
        <div className="rounded-2xl border hairline bg-ink-800/50 p-6 text-[13.5px] text-mist">
          {err ? "Audios momentanément indisponibles." : "Aucun audio récent."}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Le plus récent reste accessible même dashboard verrouillé (aperçu). */}
          <AudioCard a={audios[0]} latest likeData={likeData} />
          {audios.length > 1 && (
            <Locked label="Déverrouiller tous les audios">
              <div className="space-y-4">
                {audios.slice(1).map((a) => (
                  <AudioCard key={a.id} a={a} likeData={likeData} />
                ))}
              </div>
            </Locked>
          )}
        </div>
      )}

      <p className="mt-5 text-[11.5px] leading-relaxed text-mist/60">
        Contenu du canal Pôle Trading, réservé aux membres connectés. À titre éducatif — ne constitue pas un conseil en investissement.
      </p>
    </div>
  );
}
