"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/site";

const PREFIX = "📣 Acq"; // templates d'acquisition créés pour la rotation quotidienne

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function dayIndex() {
  // jour de l'année → rotation stable d'un template par jour
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

async function aget(path, key) {
  try {
    const r = await fetch(`${API_BASE}${path}`, { headers: { "x-admin-key": key }, cache: "no-store" });
    return await r.json();
  } catch {
    return {};
  }
}

export default function DailyReminder({ adminKey, onGo }) {
  const [show, setShow] = useState(false);
  const [mail, setMail] = useState(null);
  const [tg, setTg] = useState(null);

  useEffect(() => {
    if (!adminKey) return;
    let dismissed = false;
    try { dismissed = localStorage.getItem("pi_reminder_" + todayKey()) === "1"; } catch {}
    if (dismissed) return;

    (async () => {
      const [m, t] = await Promise.all([
        aget("/api/admin/mail/templates", adminKey),
        aget("/api/admin/tg/templates", adminKey),
      ]);
      const mails = (m.templates || []).filter((x) => (x.name || "").startsWith(PREFIX));
      const tgs = (t.templates || []).filter((x) => (x.name || "").startsWith(PREFIX));
      const idx = dayIndex();
      if (mails.length) setMail(mails[idx % mails.length]);
      if (tgs.length) setTg(tgs[idx % tgs.length]);
      setShow(true);
    })();
  }, [adminKey]);

  function dismiss() {
    try { localStorage.setItem("pi_reminder_" + todayKey(), "1"); } catch {}
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[200] w-[330px] max-w-[calc(100vw-2rem)]">
      <div className="rounded-2xl border gold-line bg-ink-900/95 backdrop-blur-md shadow-2xl overflow-hidden animate-[fadein_.4s_ease]">
        <div className="flex items-center justify-between px-4 pt-3.5">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">📨 Rappel du jour</span>
          <button onClick={dismiss} aria-label="Fermer"
                  className="h-7 w-7 grid place-items-center rounded-full border hairline text-mist hover:text-bone">
            <span className="block w-3 h-px bg-current rotate-45 translate-y-[0.5px]" />
            <span className="block w-3 h-px bg-current -rotate-45 -translate-y-[0.5px]" />
          </button>
        </div>
        <div className="px-4 pb-4 pt-2">
          <p className="text-[13.5px] text-bone leading-snug">
            N&apos;oublie pas d&apos;envoyer <b>1 email</b> et <b>1 post Telegram</b> aujourd&apos;hui. 🚀
          </p>

          <div className="mt-3 space-y-2">
            <div className="rounded-xl border hairline bg-ink-800/50 p-2.5">
              <div className="font-mono text-[9px] uppercase tracking-widest2 text-mist/60">Email du jour</div>
              <div className="text-[13px] text-bone truncate">{mail?.name || "—"}</div>
              {mail?.subject && <div className="text-[11px] text-mist/70 truncate">{mail.subject}</div>}
            </div>
            <div className="rounded-xl border hairline bg-ink-800/50 p-2.5">
              <div className="font-mono text-[9px] uppercase tracking-widest2 text-mist/60">Post Telegram du jour</div>
              <div className="text-[13px] text-bone truncate">{tg?.name || "—"}</div>
            </div>
          </div>

          <div className="mt-3.5 flex items-center gap-2">
            <button
              onClick={() => { if (onGo) onGo(); dismiss(); }}
              className="btn-gold flex-1 rounded-full px-4 py-2.5 text-[13px] font-semibold"
            >
              Aller envoyer →
            </button>
            <button onClick={dismiss} className="rounded-full px-4 py-2.5 text-[12.5px] border hairline text-mist hover:text-bone">
              Plus tard
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`@keyframes fadein { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}
