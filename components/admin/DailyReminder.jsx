"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/site";

const PREFIX = "📣 Acq"; // templates d'acquisition (rotation quotidienne)

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
function dayIndex() {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

async function aget(path, key) {
  try {
    const r = await fetch(`${API_BASE}${path}`, { headers: { "x-admin-key": key }, cache: "no-store" });
    return await r.json();
  } catch { return {}; }
}
async function apost(path, key, body) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST", headers: { "x-admin-key": key, "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  return r;
}

export default function DailyReminder({ adminKey, onGo }) {
  const [show, setShow] = useState(false);
  const [mail, setMail] = useState(null);
  const [tg, setTg] = useState(null);
  const [preview, setPreview] = useState(null); // {type:'mail'|'tg', html?, text?, buttons?}
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(null); // {ok, text}

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
      const i = dayIndex();
      if (mails.length) setMail(mails[i % mails.length]);
      if (tgs.length) setTg(tgs[i % tgs.length]);
      setShow(true);
    })();
  }, [adminKey]);

  function dismiss() {
    try { localStorage.setItem("pi_reminder_" + todayKey(), "1"); } catch {}
    setShow(false);
  }

  async function previewMail() {
    setBusy("pm");
    const r = await apost("/api/admin/mail/preview", adminKey, { ...mail, editable: false });
    const html = await r.text();
    setPreview({ type: "mail", html });
    setBusy("");
  }
  function previewTg() {
    let buttons = [];
    try { buttons = JSON.parse(tg.buttons || "[]"); } catch {}
    setPreview({ type: "tg", text: tg.text || "", buttons });
  }

  async function sendMail() {
    if (!confirm(`Envoyer le mail « ${mail.name} » à toute la liste (comptes email réels) ?`)) return;
    setBusy("sm"); setMsg(null);
    const r = await apost("/api/admin/mail/campaigns", adminKey, { template_id: mail.id, audience: "all" });
    const d = await r.json().catch(() => ({}));
    setBusy("");
    setMsg(d.ok ? { ok: true, text: `Mail mis en file : ${d.queued ?? d.sent ?? "?"} destinataire(s).` }
                : { ok: false, text: "Échec de l'envoi du mail." });
  }
  async function sendTg() {
    if (!confirm(`Publier le post Telegram « ${tg.name} » ?`)) return;
    setBusy("st"); setMsg(null);
    let buttons = [];
    try { buttons = JSON.parse(tg.buttons || "[]"); } catch {}
    const r = await apost("/api/admin/tg/send", adminKey, { text: tg.text || "", photo: tg.photo || "", buttons, audience: "all" });
    const d = await r.json().catch(() => ({}));
    setBusy("");
    setMsg(d.ok ? { ok: true, text: `Post TG en cours d'envoi (${d.reachable ?? "?"} destinataire(s)).` }
                : { ok: false, text: "Échec de l'envoi TG." });
  }

  if (!show) return null;
  const SBtn = "rounded-lg px-2.5 py-1.5 text-[11.5px] border hairline text-mist hover:text-bone transition-colors";

  return (
    <>
      <div className="fixed bottom-5 right-5 z-[200] w-[340px] max-w-[calc(100vw-2rem)]">
        <div className="rounded-2xl border gold-line bg-ink-900/95 backdrop-blur-md shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3.5">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">📨 Rappel du jour</span>
            <button onClick={dismiss} aria-label="Fermer"
                    className="h-7 w-7 grid place-items-center rounded-full border hairline text-mist hover:text-bone">
              <span className="block w-3 h-px bg-current rotate-45 translate-y-[0.5px]" />
              <span className="block w-3 h-px bg-current -rotate-45 -translate-y-[0.5px]" />
            </button>
          </div>
          <div className="px-4 pb-4 pt-2">
            <p className="text-[13px] text-bone leading-snug">
              N&apos;oublie pas d&apos;envoyer <b>1 email</b> et <b>1 post Telegram</b> aujourd&apos;hui. 🚀
            </p>

            {/* Email du jour */}
            <div className="mt-3 rounded-xl border hairline bg-ink-800/50 p-2.5">
              <div className="font-mono text-[9px] uppercase tracking-widest2 text-mist/60">Email du jour</div>
              <div className="text-[13px] text-bone truncate">{mail?.name || "—"}</div>
              {mail?.subject && <div className="text-[11px] text-mist/70 truncate">{mail.subject}</div>}
              <div className="mt-2 flex gap-2">
                <button className={SBtn} disabled={!mail || busy === "pm"} onClick={previewMail}>
                  {busy === "pm" ? "…" : "👁 Aperçu"}
                </button>
                <button className="rounded-lg px-2.5 py-1.5 text-[11.5px] btn-gold font-semibold disabled:opacity-60"
                        disabled={!mail || busy === "sm"} onClick={sendMail}>
                  {busy === "sm" ? "…" : "📤 Envoyer"}
                </button>
              </div>
            </div>

            {/* Post TG du jour */}
            <div className="mt-2 rounded-xl border hairline bg-ink-800/50 p-2.5">
              <div className="font-mono text-[9px] uppercase tracking-widest2 text-mist/60">Post Telegram du jour</div>
              <div className="text-[13px] text-bone truncate">{tg?.name || "—"}</div>
              <div className="mt-2 flex gap-2">
                <button className={SBtn} disabled={!tg} onClick={previewTg}>👁 Aperçu</button>
                <button className="rounded-lg px-2.5 py-1.5 text-[11.5px] btn-gold font-semibold disabled:opacity-60"
                        disabled={!tg || busy === "st"} onClick={sendTg}>
                  {busy === "st" ? "…" : "📤 Publier"}
                </button>
              </div>
            </div>

            {msg && (
              <div className={`mt-2.5 text-[12px] ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>{msg.text}</div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => { if (onGo) onGo(); dismiss(); }}
                      className="flex-1 rounded-full px-4 py-2 text-[12.5px] border hairline text-mist hover:text-bone">
                Ouvrir l&apos;éditeur
              </button>
              <button onClick={dismiss} className="rounded-full px-4 py-2 text-[12.5px] border hairline text-mist hover:text-bone">
                Plus tard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'aperçu */}
      {preview && (
        <div className="fixed inset-0 z-[210] grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPreview(null)} />
          <div className="relative w-full max-w-2xl max-h-[88vh] rounded-2xl border gold-line bg-ink-900 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b hairline">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">
                Aperçu — {preview.type === "mail" ? mail?.name : tg?.name}
              </span>
              <button onClick={() => setPreview(null)} className="text-mist hover:text-bone text-[13px]">Fermer ✕</button>
            </div>
            <div className="overflow-auto p-4 bg-ink-800/40">
              {preview.type === "mail" ? (
                <iframe title="preview" srcDoc={preview.html} className="w-full h-[60vh] rounded-lg bg-white" />
              ) : (
                <div className="mx-auto max-w-md rounded-2xl border hairline bg-ink-900 p-4">
                  <div className="whitespace-pre-wrap text-[14px] text-bone"
                       dangerouslySetInnerHTML={{ __html: (preview.text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/&lt;b&gt;/g, "<b>").replace(/&lt;\/b&gt;/g, "</b>") }} />
                  <div className="mt-3 space-y-2">
                    {(preview.buttons || []).flat().map((b, i) => (
                      <div key={i} className="rounded-lg border gold-line bg-gold/[0.06] px-3 py-2 text-center text-[13px] text-gold">
                        {b.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
