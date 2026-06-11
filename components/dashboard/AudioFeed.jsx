"use client";

import { useEffect, useState, useCallback } from "react";
import { poleTradingAudios, audioStreamUrl, getToken } from "@/lib/clientStore";
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
    });
  } catch { return ""; }
}

function dur(sec) {
  if (!sec && sec !== 0) return "";
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function AudioCard({ a, latest }) {
  return (
    <article className="rounded-2xl border hairline bg-ink-800/50 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid place-items-center h-9 w-9 shrink-0 rounded-full border gold-line text-gold">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M3 10v4M7 7v10M11 4v16M15 8v8M19 11v2" />
            </svg>
          </span>
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

export default function AudioFeed() {
  const [audios, setAudios] = useState(null);
  const [err, setErr] = useState(null);
  const authed = typeof window !== "undefined" && !!getToken();

  const load = useCallback(async () => {
    const r = await poleTradingAudios();
    if (r.ok) { setAudios(r.audios); setErr(null); }
    else setErr(r.error);
  }, []);

  useEffect(() => {
    if (!authed) return;
    load();
    const id = setInterval(load, 120000);
    return () => clearInterval(id);
  }, [authed, load]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-display text-[18px] text-bone">Audios — Pôle Trading Julien</h3>
        <span className="font-mono text-[9px] uppercase tracking-widest2 text-gold/80 border gold-line rounded px-1.5 py-0.5">live</span>
        {authed && <button onClick={load} className="ml-auto text-[12px] text-mist hover:text-bone">↻</button>}
      </div>
      <p className="text-[13px] text-mist mb-4">Les 4 derniers points audio de Julien, à écouter directement ici.</p>

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
          <AudioCard a={audios[0]} latest />
          {audios.length > 1 && (
            <Locked label="Déverrouiller tous les audios">
              <div className="space-y-4">
                {audios.slice(1).map((a) => (
                  <AudioCard key={a.id} a={a} />
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
