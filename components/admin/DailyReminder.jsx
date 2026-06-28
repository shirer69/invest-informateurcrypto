"use client";

import { useEffect, useState, useRef } from "react";
import { API_BASE } from "@/lib/site";

const PREFIX = "📣 Acq";
const TEST_EMAIL = "alexis.myc@gmail.com";
const ADMIN_TG = "5389728045"; // L'Informateur Crypto (+33630892095) — cible des tests TG

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
function dayIndex() {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}
function tgToHtml(s) {
  let h = (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  h = h.replace(/&lt;(\/?)(b|strong|i|em|u|s|code|pre)&gt;/g, "<$1$2>");
  h = h.replace(/&lt;a href="([^"]+)"&gt;/g, '<a href="$1">').replace(/&lt;\/a&gt;/g, "</a>");
  return h.replace(/\n/g, "<br/>");
}
async function aget(path, key) {
  try { return await (await fetch(`${API_BASE}${path}`, { headers: { "x-admin-key": key }, cache: "no-store" })).json(); }
  catch { return {}; }
}
function apost(path, key, body) {
  return fetch(`${API_BASE}${path}`, {
    method: "POST", headers: { "x-admin-key": key, "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
}
async function uploadImage(file, key) {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${API_BASE}/api/admin/tg/upload`, { method: "POST", headers: { "x-admin-key": key }, body: fd });
  const d = await r.json().catch(() => ({}));
  return d.url || "";
}

// Reconvertit le HTML édité (contentEditable) en markup Telegram (<b>/<i>/<u>/<s>/<a> + \n)
function _htmlToTg(node) {
  let out = "";
  node.childNodes.forEach((n) => {
    if (n.nodeType === 3) { out += n.nodeValue; return; }
    if (n.nodeType !== 1) return;
    const t = n.tagName.toLowerCase();
    const inner = _htmlToTg(n);
    if (t === "br") out += "\n";
    else if (t === "div" || t === "p") { if (out && !out.endsWith("\n")) out += "\n"; out += inner; if (!out.endsWith("\n")) out += "\n"; }
    else if (t === "b" || t === "strong") out += "<b>" + inner + "</b>";
    else if (t === "i" || t === "em") out += "<i>" + inner + "</i>";
    else if (t === "u") out += "<u>" + inner + "</u>";
    else if (t === "s" || t === "strike" || t === "del") out += "<s>" + inner + "</s>";
    else if (t === "a") out += '<a href="' + (n.getAttribute("href") || "") + '">' + inner + "</a>";
    else out += inner;
  });
  return out;
}
function htmlToTgText(html) {
  if (typeof document === "undefined") return html;
  const d = document.createElement("div");
  d.innerHTML = html;
  return _htmlToTg(d).replace(/<b><\/b>|<i><\/i>|<u><\/u>/g, "").replace(/\n{3,}/g, "\n\n").replace(/^\n+|\n+$/g, "");
}

// Éditeur WYSIWYG : on édite directement le rendu. onChange reçoit l'innerHTML.
function RichEditor({ initialHtml, onChange, dark }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current && ref.current.innerHTML !== (initialHtml || "")) ref.current.innerHTML = initialHtml || ""; }, []); // init une seule fois
  const emit = () => { if (ref.current) onChange(ref.current.innerHTML); };
  const anchorAt = () => {
    const s = typeof window !== "undefined" && window.getSelection();
    if (!s || !s.rangeCount) return null;
    let n = s.getRangeAt(0).startContainer;
    while (n && n !== ref.current) { if (n.nodeType === 1 && n.tagName === "A") return n; n = n.parentNode; }
    return null;
  };
  const exec = (cmd, val) => { try { document.execCommand("styleWithCSS", false, false); document.execCommand(cmd, false, val); } catch {} emit(); };
  const editLink = () => {
    const a = anchorAt();
    const url = window.prompt("Lien (URL) — laisser vide pour retirer le lien :", a ? a.getAttribute("href") || "" : "https://");
    if (url === null) return;
    if (a) { if (url.trim() === "") { a.replaceWith(document.createTextNode(a.textContent)); } else { a.setAttribute("href", url.trim()); } emit(); return; }
    if (url.trim() === "") return;
    const s = window.getSelection();
    if (s && !s.isCollapsed) exec("createLink", url.trim());
    else { document.execCommand("insertHTML", false, `<a href="${url.trim()}">${url.trim()}</a>`); emit(); }
  };
  const TB = "h-7 min-w-[28px] px-2 grid place-items-center rounded-md border hairline text-mist hover:text-bone text-[12px]";
  return (
    <div>
      <div className="flex gap-1.5 mb-1.5">
        <button type="button" title="Gras" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")} className={TB}><b>B</b></button>
        <button type="button" title="Italique" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")} className={TB}><i>I</i></button>
        <button type="button" title="Souligné" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")} className={TB}><u>U</u></button>
        <button type="button" title="Ajouter / modifier un lien" onMouseDown={(e) => e.preventDefault()} onClick={editLink} className={TB + " min-w-0"}>🔗 Lien</button>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning onInput={emit} spellCheck={false}
        className={dark
          ? "min-h-[120px] rounded-2xl rounded-tl-md bg-[#182533] px-3.5 py-3 text-[14.5px] leading-relaxed text-[#e7ebf2] outline-none [&_b]:font-bold [&_a]:text-[#6ab3f3] [&_a]:underline"
          : "min-h-[180px] rounded-lg bg-white px-4 py-3 text-[14px] leading-relaxed text-[#1a1a1a] outline-none [&_a]:text-[#1a73e8] [&_a]:underline"} />
    </div>
  );
}

export default function DailyReminder({ adminKey, onGo }) {
  const [ready, setReady] = useState(false);
  const [min, setMin] = useState(false);
  const [mails, setMails] = useState([]);
  const [tgs, setTgs] = useState([]);
  const [mIdx, setMIdx] = useState(0);
  const [tIdx, setTIdx] = useState(0);
  const [pv, setPv] = useState(null); // {type, edit, html?}
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(null);
  const [schedAt, setSchedAt] = useState("");
  const [doneMail, setDoneMail] = useState(false);
  const [doneTg, setDoneTg] = useState(false);

  useEffect(() => {
    if (!adminKey) return;
    const tk = todayKey();
    try {
      setDoneMail(localStorage.getItem("pi_done_mail_" + tk) === "1");
      setDoneTg(localStorage.getItem("pi_done_tg_" + tk) === "1");
      setMin(localStorage.getItem("pi_reminder_min") === "1");
    } catch {}
    (async () => {
      const [m, t] = await Promise.all([
        aget("/api/admin/mail/templates", adminKey),
        aget("/api/admin/tg/templates", adminKey),
      ]);
      const ml = (m.templates || []).filter((x) => (x.name || "").startsWith(PREFIX));
      const tl = (t.templates || []).filter((x) => (x.name || "").startsWith(PREFIX));
      setMails(ml); setTgs(tl);
      const i = dayIndex();
      let mi = ml.length ? i % ml.length : 0, ti = tl.length ? i % tl.length : 0;
      try {
        if (localStorage.getItem("pi_acq_day") === tk) {
          const sm = parseInt(localStorage.getItem("pi_acq_mi") ?? "", 10);
          const st = parseInt(localStorage.getItem("pi_acq_ti") ?? "", 10);
          if (!isNaN(sm) && ml.length) mi = ((sm % ml.length) + ml.length) % ml.length;
          if (!isNaN(st) && tl.length) ti = ((st % tl.length) + tl.length) % tl.length;
        }
      } catch {}
      setMIdx(mi); setTIdx(ti); setReady(true);
    })();
  }, [adminKey]);

  const mail = mails[mIdx] || null;
  const tg = tgs[tIdx] || null;
  const tgButtons = (() => { try { return JSON.parse(tg?.buttons || "[]"); } catch { return []; } })();

  function persist(mi, ti) {
    try {
      localStorage.setItem("pi_acq_day", todayKey());
      localStorage.setItem("pi_acq_mi", String(mi));
      localStorage.setItem("pi_acq_ti", String(ti));
    } catch {}
  }
  function cycleMail(d) { if (mails.length) { const n = ((mIdx + d) % mails.length + mails.length) % mails.length; setMIdx(n); persist(n, tIdx); setMsg(null); } }
  function cycleTg(d) { if (tgs.length) { const n = ((tIdx + d) % tgs.length + tgs.length) % tgs.length; setTIdx(n); persist(mIdx, n); setMsg(null); } }
  function toggleMin(v) { setMin(v); try { localStorage.setItem("pi_reminder_min", v ? "1" : "0"); } catch {} }
  function markDone(k) { try { localStorage.setItem(`pi_done_${k}_` + todayKey(), "1"); } catch {} k === "mail" ? setDoneMail(true) : setDoneTg(true); }

  // ── Aperçu (éditable) ──
  async function openMailPreview() {
    setBusy("pm");
    const edit = { id: mail.id, name: mail.name, subject: mail.subject || "", intro: mail.intro || "",
      body_html: mail.body_html || "", cta_label: mail.cta_label || "", cta_url: mail.cta_url || "", footnote: mail.footnote || "" };
    const html = await (await apost("/api/admin/mail/preview", adminKey, { ...edit, editable: false })).text();
    setPv({ type: "mail", edit, html }); setBusy("");
  }
  function openTgPreview() {
    setPv({ type: "tg", edit: { text: tg.text || "", buttons: tgButtons, name: tg.name } });
  }
  async function refreshMailPreview() {
    setBusy("rp");
    const html = await (await apost("/api/admin/mail/preview", adminKey, { ...pv.edit, editable: false })).text();
    setPv((p) => ({ ...p, html })); setBusy("");
  }
  // Édite le 1er bouton inline TG (label/url)
  function setTgBtn(field, value) {
    setPv((p) => {
      const btns = JSON.parse(JSON.stringify(p.edit.buttons || []));
      if (!btns.length) btns.push([]);
      if (!btns[0].length) btns[0].push({ text: "", url: "" });
      btns[0][0] = { ...btns[0][0], [field]: value };
      return { ...p, edit: { ...p.edit, buttons: btns } };
    });
  }
  // Upload d'image → URL hébergée
  async function pickTgImage(file) {
    if (!file) return;
    setBusy("up"); setMsg(null);
    const url = await uploadImage(file, adminKey); setBusy("");
    if (url) setPv((p) => ({ ...p, edit: { ...p.edit, photo: url } }));
    else setMsg({ ok: false, text: "Échec de l'upload de l'image." });
  }
  async function pickMailImage(file) {
    if (!file) return;
    setBusy("up"); setMsg(null);
    const url = await uploadImage(file, adminKey); setBusy("");
    if (!url) { setMsg({ ok: false, text: "Échec de l'upload de l'image." }); return; }
    const img = `<img src="${url}" alt="" style="max-width:100%;border-radius:12px;display:block;margin:0 auto 14px"/>\n`;
    setPv((p) => ({ ...p, imgRev: (p.imgRev || 0) + 1, edit: { ...p.edit, body_html: img + (p.edit.body_html || "") } }));
    // recharge l'aperçu
    const html = await (await apost("/api/admin/mail/preview", adminKey, { ...pv.edit, body_html: img + (pv.edit.body_html || ""), editable: false })).text();
    setPv((p) => ({ ...p, html }));
  }

  // ── Actions (content = template courant OU édité) ──
  async function testMail(c) {
    setBusy("tm"); setMsg(null);
    const r = await apost("/api/admin/mail/test", adminKey, { email: TEST_EMAIL, ...c });
    const d = await r.json().catch(() => ({}));
    setBusy(""); setMsg(d.ok ? { ok: true, text: `Mail de test envoyé à ${TEST_EMAIL}.` } : { ok: false, text: "Échec du mail de test (redémarrage du backend requis ?)." });
  }
  async function sendMail(c, edited) {
    if (!confirm(`Envoyer le mail « ${c.name} » à toute la liste ?`)) return;
    setBusy("sm"); setMsg(null);
    if (edited) await apost("/api/admin/mail/templates", adminKey, c); // sauvegarde l'édition dans le template
    const r = await apost("/api/admin/mail/campaigns", adminKey, { template_id: c.id, audience: "all" });
    const d = await r.json().catch(() => ({}));
    setBusy("");
    if (d.ok) { markDone("mail"); setMsg({ ok: true, text: `Mail mis en file : ${d.queued ?? d.sent ?? "?"} destinataire(s).` }); setPv(null); }
    else setMsg({ ok: false, text: "Échec de l'envoi du mail." });
  }
  async function testTg(text, buttons, photo = "") {
    setBusy("tt"); setMsg(null);
    const r = await apost("/api/admin/tg/preview", adminKey, { tg_id: ADMIN_TG, text, buttons, photo, name: "Admin" });
    const d = await r.json().catch(() => ({}));
    setBusy(""); setMsg(d.ok ? { ok: true, text: "Post de test envoyé sur ton Telegram." } : { ok: false, text: "Échec du test TG." });
  }
  async function sendTg(text, buttons, photo = "") {
    if (!confirm("Publier ce post Telegram à toute l'audience ?")) return;
    setBusy("st"); setMsg(null);
    const r = await apost("/api/admin/tg/send", adminKey, { text, photo: photo || "", buttons, audience: "all" });
    const d = await r.json().catch(() => ({}));
    setBusy("");
    if (d.ok) { markDone("tg"); setMsg({ ok: true, text: `Post TG en cours d'envoi (${d.reachable ?? "?"}).` }); setPv(null); }
    else setMsg({ ok: false, text: "Échec de l'envoi TG." });
  }
  async function scheduleSend() {
    if (!schedAt) { setMsg({ ok: false, text: "Choisis une date et une heure." }); return; }
    setBusy("sc"); setMsg(null);
    let channel, payload;
    if (pv.type === "mail") {
      await apost("/api/admin/mail/templates", adminKey, pv.edit); // sauvegarde l'édition
      channel = "mail"; payload = { template_id: pv.edit.id, audience: "all", subject_override: pv.edit.subject };
    } else {
      channel = "tg"; payload = { text: pv.edit.text, photo: pv.edit.photo || "", buttons: pv.edit.buttons || [], audience: "all" };
    }
    const r = await apost("/api/admin/schedule", adminKey, { channel, run_at_local: schedAt, payload });
    const d = await r.json().catch(() => ({}));
    setBusy("");
    if (d.ok) { setMsg({ ok: true, text: `Programmé pour le ${schedAt.replace("T", " ")} (heure FR).` }); }
    else setMsg({ ok: false, text: d.error === "past" ? "Choisis une heure future." : "Échec de la programmation (redémarrage backend requis ?)." });
  }

  if (!ready) return null;
  const allDone = doneMail && doneTg;
  const Bsm = "rounded-lg px-2 py-1.5 text-[11px] border hairline text-mist hover:text-bone transition-colors disabled:opacity-50";
  const Bgold = "rounded-lg px-2.5 py-1.5 text-[11px] btn-gold font-semibold disabled:opacity-60";
  const Arrow = ({ d, onClick }) => (
    <button onClick={onClick} className="h-6 w-6 grid place-items-center rounded-md border hairline text-mist hover:text-bone text-[12px]" title="Changer">{d < 0 ? "‹" : "›"}</button>
  );
  const Status = ({ done }) => done
    ? <span className="text-[10.5px] font-semibold text-emerald-400">✅ Envoyé</span>
    : <span className="text-[10.5px] font-semibold text-amber-400">⏳ À faire</span>;

  if (min) {
    return (
      <button onClick={() => toggleMin(false)}
        className={`fixed bottom-5 right-5 z-[200] rounded-full border px-4 py-2.5 text-[12.5px] font-semibold shadow-2xl backdrop-blur-md ${allDone ? "border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-300" : "border-amber-400/40 bg-amber-400/[0.08] text-amber-300"}`}>
        📨 Envois du jour : {(doneMail ? 1 : 0) + (doneTg ? 1 : 0)}/2 {allDone ? "✅" : ""}
      </button>
    );
  }

  const mailContent = mail ? { id: mail.id, name: mail.name, subject: mail.subject, intro: mail.intro, body_html: mail.body_html, cta_label: mail.cta_label, cta_url: mail.cta_url, footnote: mail.footnote } : null;

  return (
    <>
      <div className="fixed bottom-5 right-5 z-[200] w-[348px] max-w-[calc(100vw-2rem)]">
        <div className={`rounded-2xl border bg-ink-900/95 backdrop-blur-md shadow-2xl overflow-hidden ${allDone ? "border-emerald-500/40" : "gold-line"}`}>
          <div className="flex items-center justify-between px-4 pt-3.5">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">📨 Envois du jour</span>
            <button onClick={() => toggleMin(true)} title="Réduire" className="h-7 w-7 grid place-items-center rounded-full border hairline text-mist hover:text-bone">
              <span className="block w-3 h-px bg-current" />
            </button>
          </div>
          <div className="px-4 pb-4 pt-2">
            <p className="text-[12.5px] text-mist leading-snug">
              {allDone ? <span className="text-emerald-400 font-semibold">Tout est envoyé aujourd&apos;hui 🎉</span>
                       : <>Pense à envoyer <b>1 email</b> et <b>1 post Telegram</b> aujourd&apos;hui.</>}
            </p>

            {/* Email */}
            <div className="mt-3 rounded-xl border hairline bg-ink-800/50 p-2.5">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[9px] uppercase tracking-widest2 text-mist/60">Email du jour</div><Status done={doneMail} />
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <Arrow d={-1} onClick={() => cycleMail(-1)} />
                <div className="flex-1 min-w-0"><div className="text-[13px] text-bone truncate">{mail?.name || "—"}</div>{mail?.subject && <div className="text-[11px] text-mist/70 truncate">{mail.subject}</div>}</div>
                <span className="font-mono text-[9px] text-mist/40">{mails.length ? mIdx + 1 : 0}/{mails.length}</span>
                <Arrow d={1} onClick={() => cycleMail(1)} />
              </div>
              <div className="mt-2 flex gap-1.5">
                <button className={Bsm} disabled={!mail || busy === "pm"} onClick={openMailPreview}>{busy === "pm" ? "…" : "👁 Aperçu"}</button>
                <button className={Bsm} disabled={!mail || busy === "tm"} onClick={() => testMail(mailContent)}>{busy === "tm" ? "…" : "🧪 Test"}</button>
                <button className={Bgold} disabled={!mail || busy === "sm"} onClick={() => sendMail(mailContent, false)}>{busy === "sm" ? "…" : (doneMail ? "↻" : "📤 Envoyer")}</button>
              </div>
            </div>

            {/* Telegram */}
            <div className="mt-2 rounded-xl border hairline bg-ink-800/50 p-2.5">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[9px] uppercase tracking-widest2 text-mist/60">Post Telegram du jour</div><Status done={doneTg} />
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <Arrow d={-1} onClick={() => cycleTg(-1)} />
                <div className="flex-1 min-w-0"><div className="text-[13px] text-bone truncate">{tg?.name || "—"}</div></div>
                <span className="font-mono text-[9px] text-mist/40">{tgs.length ? tIdx + 1 : 0}/{tgs.length}</span>
                <Arrow d={1} onClick={() => cycleTg(1)} />
              </div>
              <div className="mt-2 flex gap-1.5">
                <button className={Bsm} disabled={!tg} onClick={openTgPreview}>👁 Aperçu</button>
                <button className={Bsm} disabled={!tg || busy === "tt"} onClick={() => testTg(tg.text, tgButtons, tg.photo || "")}>{busy === "tt" ? "…" : "🧪 Test"}</button>
                <button className={Bgold} disabled={!tg || busy === "st"} onClick={() => sendTg(tg.text, tgButtons, tg.photo || "")}>{busy === "st" ? "…" : (doneTg ? "↻" : "📤 Publier")}</button>
              </div>
            </div>

            {msg && <div className={`mt-2.5 text-[12px] ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>{msg.text}</div>}
            <button onClick={() => onGo && onGo()} className="mt-3 w-full rounded-full px-4 py-2 text-[12.5px] border hairline text-mist hover:text-bone">Ouvrir l&apos;éditeur d&apos;emails</button>
          </div>
        </div>
      </div>

      {/* Modal aperçu éditable */}
      {pv && (
        <div className="fixed inset-0 z-[210] grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPv(null)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl border gold-line bg-ink-900 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b hairline">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">
                Aperçu éditable — {pv.type === "mail" ? pv.edit.name : pv.edit.name}
              </span>
              <button onClick={() => setPv(null)} className="text-mist hover:text-bone text-[13px]">Fermer ✕</button>
            </div>

            <div className="overflow-auto p-4 bg-ink-800/40 space-y-3">
              {pv.type === "mail" ? (
                <>
                  <label className="block text-[11px] text-mist/70">Objet
                    <input value={pv.edit.subject} onChange={(e) => setPv((p) => ({ ...p, edit: { ...p.edit, subject: e.target.value } }))}
                      className="mt-1 w-full rounded-lg bg-ink-900 border hairline px-3 py-2 text-[13px] text-bone outline-none" />
                  </label>
                  <div className="text-[11px] text-mist/70">Corps de l&apos;email — édite directement le texte et les liens
                    <div className="mt-1">
                      <RichEditor key={"mb" + pv.edit.id + "-" + (pv.imgRev || 0)} initialHtml={pv.edit.body_html}
                        onChange={(h) => setPv((p) => ({ ...p, edit: { ...p.edit, body_html: h } }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block text-[11px] text-mist/70">Libellé du bouton
                      <input value={pv.edit.cta_label || ""} onChange={(e) => setPv((p) => ({ ...p, edit: { ...p.edit, cta_label: e.target.value } }))}
                        className="mt-1 w-full rounded-lg bg-ink-900 border hairline px-3 py-2 text-[12.5px] text-bone outline-none" />
                    </label>
                    <label className="block text-[11px] text-mist/70">Lien du bouton
                      <input value={pv.edit.cta_url || ""} onChange={(e) => setPv((p) => ({ ...p, edit: { ...p.edit, cta_url: e.target.value } }))}
                        className="mt-1 w-full rounded-lg bg-ink-900 border hairline px-3 py-2 text-[12.5px] text-bone outline-none font-mono" />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <label className="rounded-lg px-3 py-1.5 text-[12px] border hairline text-mist hover:text-bone cursor-pointer">
                      {busy === "up" ? "Upload…" : "🖼 Ajouter une image"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => pickMailImage(e.target.files?.[0])} />
                    </label>
                    <button onClick={refreshMailPreview} className="rounded-lg px-3 py-1.5 text-[12px] border hairline text-mist hover:text-bone">{busy === "rp" ? "…" : "↻ Rendu complet"}</button>
                  </div>
                  <details>
                    <summary className="text-[11px] text-mist/60 cursor-pointer select-none">Voir le rendu complet (en-tête + pied de page)</summary>
                    <iframe title="preview" srcDoc={pv.html} className="mt-2 w-full h-[42vh] rounded-lg bg-white" />
                  </details>
                </>
              ) : (
                <>
                  <div className="text-[11px] text-mist/70">Aperçu du post — édite directement le texte et les liens
                    <div className="mt-1">
                      <RichEditor key={"tg" + (pv.edit.name || "")} dark initialHtml={tgToHtml(pv.edit.text)}
                        onChange={(h) => setPv((p) => ({ ...p, edit: { ...p.edit, text: htmlToTgText(h) } }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block text-[11px] text-mist/70">Libellé du bouton
                      <input value={pv.edit.buttons?.[0]?.[0]?.text || ""} onChange={(e) => setTgBtn("text", e.target.value)}
                        className="mt-1 w-full rounded-lg bg-ink-900 border hairline px-3 py-2 text-[12.5px] text-bone outline-none" />
                    </label>
                    <label className="block text-[11px] text-mist/70">Lien du bouton
                      <input value={pv.edit.buttons?.[0]?.[0]?.url || ""} onChange={(e) => setTgBtn("url", e.target.value)}
                        className="mt-1 w-full rounded-lg bg-ink-900 border hairline px-3 py-2 text-[12.5px] text-bone outline-none font-mono" />
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="rounded-lg px-3 py-1.5 text-[12px] border hairline text-mist hover:text-bone cursor-pointer">
                      {busy === "up" ? "Upload…" : "🖼 Ajouter une image"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => pickTgImage(e.target.files?.[0])} />
                    </label>
                    {pv.edit.photo && (
                      <button onClick={() => setPv((p) => ({ ...p, edit: { ...p.edit, photo: "" } }))}
                              className="rounded-lg px-3 py-1.5 text-[12px] border hairline text-red-400/80 hover:text-red-400">Retirer l&apos;image</button>
                    )}
                  </div>
                  {(pv.edit.photo || (pv.edit.buttons || []).flat().length > 0) && (
                    <>
                      <div className="text-[11px] text-mist/60">Image &amp; boutons (aperçu) :</div>
                      <div className="rounded-2xl rounded-tl-md bg-[#182533] px-3.5 py-3 space-y-2">
                        {pv.edit.photo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={pv.edit.photo} alt="" className="w-full rounded-lg" />
                        )}
                        {(pv.edit.buttons || []).flat().length > 0 && (
                          <div className="space-y-1.5">
                            {(pv.edit.buttons || []).flat().map((b, i) => (
                              <div key={i} className="rounded-lg bg-[#2b5278] px-3 py-2 text-center text-[13.5px] text-[#cfe6ff]">{b.text}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 px-5 py-2.5 border-t hairline">
              <span className="text-[11px] text-mist/70">🕒 Programmer (heure FR) :</span>
              <input type="datetime-local" value={schedAt} onChange={(e) => setSchedAt(e.target.value)}
                     className="rounded-lg bg-ink-900 border hairline px-2 py-1.5 text-[12px] text-bone outline-none" />
              <button className={Bsm} disabled={busy === "sc"} onClick={scheduleSend}>{busy === "sc" ? "…" : "Programmer l'envoi"}</button>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t hairline">
              {msg && <div className={`mr-auto text-[12px] ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>{msg.text}</div>}
              {pv.type === "mail" ? (
                <>
                  <button className={Bsm} disabled={busy === "tm"} onClick={() => testMail(pv.edit)}>{busy === "tm" ? "…" : "🧪 Test"}</button>
                  <button className="rounded-full px-5 py-2 text-[13px] btn-gold font-semibold" disabled={busy === "sm"} onClick={() => sendMail(pv.edit, true)}>{busy === "sm" ? "…" : "📤 Envoyer"}</button>
                </>
              ) : (
                <>
                  <button className={Bsm} disabled={busy === "tt"} onClick={() => testTg(pv.edit.text, pv.edit.buttons, pv.edit.photo)}>{busy === "tt" ? "…" : "🧪 Test"}</button>
                  <button className="rounded-full px-5 py-2 text-[13px] btn-gold font-semibold" disabled={busy === "st"} onClick={() => sendTg(pv.edit.text, pv.edit.buttons, pv.edit.photo)}>{busy === "st" ? "…" : "📤 Publier"}</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
