"use client";

import { useEffect, useRef, useState, useCallback, useDeferredValue } from "react";
import { API_BASE } from "@/lib/site";

/* ---------- API ---------- */
const h = (key) => ({ "x-admin-key": key, "Content-Type": "application/json" });
async function aGet(path, key) {
  const r = await fetch(`${API_BASE}${path}`, { headers: h(key), cache: "no-store" });
  return r.json().catch(() => ({}));
}
async function aPost(path, key, body) {
  const r = await fetch(`${API_BASE}${path}`, { method: "POST", headers: h(key), body: JSON.stringify(body || {}) });
  return r.json().catch(() => ({}));
}
async function aDel(path, key) {
  const r = await fetch(`${API_BASE}${path}`, { method: "DELETE", headers: h(key) });
  return r.json().catch(() => ({}));
}

/* ---------- contenteditable -> HTML Telegram ---------- */
const escTxt = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function serialize(node) {
  let out = "";
  node.childNodes.forEach((n) => {
    if (n.nodeType === 3) { out += escTxt(n.nodeValue); return; }
    if (n.nodeType !== 1) return;
    const tag = n.tagName.toLowerCase();
    const inner = serialize(n);
    if (tag === "br") out += "\n";
    else if (tag === "b" || tag === "strong") out += `<b>${inner}</b>`;
    else if (tag === "i" || tag === "em") out += `<i>${inner}</i>`;
    else if (tag === "u") out += `<u>${inner}</u>`;
    else if (tag === "s" || tag === "strike" || tag === "del") out += `<s>${inner}</s>`;
    else if (tag === "a") out += `<a href="${(n.getAttribute("href") || "").replace(/"/g, "%22")}">${inner}</a>`;
    else if (tag === "div" || tag === "p") out += (out && !out.endsWith("\n") ? "\n" : "") + inner;
    else out += inner;
  });
  return out;
}
const tgToHtml = (t) => (t || "").replace(/\n/g, "<br>");
const sample = (t) => (t || "").replace(/\{pr[ée]nom\}|\{PRENOM\}|\{first_name\}/gi, "Jean");

const AUDIENCES = [
  { id: "all", label: "Tous" },
  { id: "members", label: "Membres (email)" },
  { id: "users", label: "Telegram" },
  { id: "copy", label: "Copy actifs" },
];

export default function TgPosts({ adminKey }) {
  const editorRef = useRef(null);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [buttons, setButtons] = useState([{ text: "", url: "" }]);
  const [audience, setAudience] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [testId, setTestId] = useState("");
  const [msg, setMsg] = useState(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const reload = useCallback(async () => {
    const [t, s] = await Promise.all([
      aGet("/api/admin/tg/templates", adminKey),
      aGet("/api/admin/tg/schedules", adminKey),
    ]);
    setTemplates(t.templates || []);
    setSchedules(s.schedules || []);
  }, [adminKey]);

  useEffect(() => { reload(); }, [reload]);

  function refreshPreview() {
    if (editorRef.current) setPreviewHtml(sample(serialize(editorRef.current)));
  }

  function exec(cmd, val) {
    document.execCommand(cmd, false, val);
    editorRef.current && editorRef.current.focus();
    refreshPreview();
  }
  function addLink() {
    const url = prompt("URL du lien :", "https://");
    if (url) exec("createLink", url);
  }
  function insertPrenom() {
    document.execCommand("insertText", false, "{prenom}");
    refreshPreview();
  }

  async function uploadFile(file) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setMsg({ ok: false, t: "Image trop lourde (max 10 Mo)." }); return; }
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) { setMsg({ ok: false, t: "Format non supporté. Utilisez JPG, PNG, GIF ou WebP." }); return; }
    setUploading(true); setMsg({ ok: true, t: "Upload en cours…" });
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch(`${API_BASE}/api/admin/tg/upload?key=${encodeURIComponent(adminKey)}`, { method: "POST", body: fd });
      const d = await r.json();
      if (d.ok) { setPhoto(d.url); setMsg({ ok: true, t: `✓ Image uploadée (${Math.round(file.size / 1024)} Ko)` }); }
      else setMsg({ ok: false, t: d.error || "Échec de l'upload." });
    } catch (e) { setMsg({ ok: false, t: "Erreur réseau lors de l'upload." }); }
    finally { setUploading(false); }
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) uploadFile(file);
  }

  function payload() {
    const text = editorRef.current ? serialize(editorRef.current) : "";
    return { text, photo: photo.trim() || null, buttons: buttons.filter((b) => b.text && b.url).map((b) => [b]), audience };
  }

  function loadTemplate(t) {
    setEditingId(t.id);
    setName(t.name || "");
    setPhoto(t.photo || "");
    let btns = [];
    try { btns = (JSON.parse(t.buttons || "[]") || []).map((row) => row[0]).filter(Boolean); } catch {}
    setButtons(btns.length ? btns : [{ text: "", url: "" }]);
    if (editorRef.current) { editorRef.current.innerHTML = tgToHtml(t.text); refreshPreview(); }
    setMsg(null);
  }
  function resetEditor() {
    setEditingId(null); setName(""); setPhoto(""); setButtons([{ text: "", url: "" }]);
    if (editorRef.current) editorRef.current.innerHTML = "";
    setPreviewHtml("");
  }

  async function saveTemplate() {
    const p = payload();
    const r = await aPost("/api/admin/tg/templates", adminKey, { id: editingId, name: name || "Sans titre", text: p.text, photo: p.photo, buttons: p.buttons });
    if (r.ok) { setEditingId(r.id); setMsg({ ok: true, t: "Template enregistré." }); reload(); }
    else setMsg({ ok: false, t: "Échec de l'enregistrement." });
  }
  async function sendNow() {
    const p = payload();
    if (!p.text && !p.photo) { setMsg({ ok: false, t: "Le post est vide." }); return; }
    setMsg({ ok: true, t: "Envoi en cours…" });
    const r = await aPost("/api/admin/tg/send", adminKey, p);
    setMsg(r.ok ? { ok: true, t: `Envoi lancé à ${r.reachable} destinataire(s).` } : { ok: false, t: "Échec de l'envoi." });
  }
  async function sendTest() {
    if (!testId.trim()) { setMsg({ ok: false, t: "Indiquez un tg_id de test." }); return; }
    const p = payload();
    const r = await aPost("/api/admin/tg/preview", adminKey, { ...p, tg_id: testId.trim(), name: "Jean" });
    setMsg(r.ok ? { ok: true, t: "Test envoyé ✓" } : { ok: false, t: "Échec du test (tg_id valide ?)." });
  }
  async function delTemplate(id) {
    await aDel(`/api/admin/tg/templates/${id}`, adminKey);
    if (editingId === id) resetEditor();
    reload();
  }

  /* schedules */
  const [schKind, setSchKind] = useState("daily");
  const [schAt, setSchAt] = useState("11:00");
  const [schEvery, setSchEvery] = useState(24);
  const [schTpl, setSchTpl] = useState("");
  const [schAud, setSchAud] = useState("all");

  async function addSchedule() {
    if (!schTpl) { setMsg({ ok: false, t: "Choisissez un template à planifier." }); return; }
    const body = { template_id: Number(schTpl), audience: schAud, kind: schKind, at_hhmm: schAt, every_min: schKind === "interval" ? Number(schEvery) * 60 : 1440 };
    const r = await aPost("/api/admin/tg/schedules", adminKey, body);
    if (r.ok) { setMsg({ ok: true, t: "Planification créée." }); reload(); }
  }
  async function toggleSchedule(id) { await aPost(`/api/admin/tg/schedules/${id}/toggle`, adminKey, {}); reload(); }
  async function delSchedule(id) { await aDel(`/api/admin/tg/schedules/${id}`, adminKey); reload(); }

  const fmtNext = (s) => (!s ? "—" : new Date(s * 1000).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }));
  const TBtn = ({ onClick, children, title }) => (
    <button type="button" onClick={onClick} title={title}
      className="h-8 min-w-8 px-2 rounded-lg border hairline bg-white/[0.02] text-bone hover:border-gold/50 text-[13px]">{children}</button>
  );

  return (
    <div className="grid lg:grid-cols-[1.3fr_1fr] gap-5 items-start">
      {/* ----- Éditeur ----- */}
      <div className="space-y-4">
        <div className="rounded-2xl border hairline bg-ink-800/40 p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du template"
              className="flex-1 rounded-lg bg-ink-900 border border-white/10 focus:border-gold/50 px-3 py-2 text-bone text-[13.5px] outline-none" />
            {editingId && <span className="text-[11px] text-mist/60">#{editingId}</span>}
            <button onClick={resetEditor} className="text-[12px] text-mist hover:text-bone">+ Nouveau</button>
          </div>

          {/* toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <TBtn onClick={() => exec("bold")} title="Gras"><b>B</b></TBtn>
            <TBtn onClick={() => exec("italic")} title="Italique"><i>I</i></TBtn>
            <TBtn onClick={() => exec("underline")} title="Souligné"><u>U</u></TBtn>
            <TBtn onClick={() => exec("strikeThrough")} title="Barré"><s>S</s></TBtn>
            <TBtn onClick={addLink} title="Lien">🔗</TBtn>
            <TBtn onClick={insertPrenom} title="Insérer le prénom">{"{prenom}"}</TBtn>
          </div>

          {/* contenteditable */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={refreshPreview}
            className="min-h-[140px] rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-bone text-[14px] leading-relaxed outline-none [&_a]:text-gold [&_a]:underline"
          />

          {/* photo — upload ou URL */}
          <div className="mt-3">
            <label className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60 mb-1.5 block">
              Photo <span className="normal-case text-mist/40">(optionnel — upload ou URL)</span>
            </label>

            {/* Zone drag & drop */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors
                ${dragOver ? "border-gold/60 bg-gold/[0.05]" : "border-white/15 hover:border-gold/30 bg-ink-900/60"}`}
              style={{ minHeight: photo ? "auto" : "90px" }}
            >
              {/* Preview de l'image sélectionnée */}
              {photo ? (
                <div className="relative w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="preview" onError={() => {}} className="w-full max-h-52 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPhoto(""); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-500/80 transition-colors text-[14px]"
                  >✕</button>
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                      <span className="text-bone text-[13px]">Upload…</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-5 flex flex-col items-center gap-1.5 select-none">
                  {uploading ? (
                    <span className="text-[13px] text-mist animate-pulse">Upload en cours…</span>
                  ) : (
                    <>
                      <span className="text-2xl">🖼️</span>
                      <span className="text-[12.5px] text-mist/70">
                        Glissez une image ou <span className="text-gold underline">cliquez pour choisir</span>
                      </span>
                      <span className="text-[11px] text-mist/40">JPG · PNG · GIF · WebP · max 10 Mo</span>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="sr-only"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Champ URL en fallback */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10.5px] text-mist/40 whitespace-nowrap">ou URL directe</span>
              <input
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="https://…/image.jpg"
                className="flex-1 rounded-lg bg-ink-900 border border-white/10 focus:border-gold/50 px-3 py-1.5 text-bone text-[12px] font-mono outline-none"
              />
            </div>
          </div>

          {/* boutons inline */}
          <div className="mt-3">
            <label className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60">Boutons inline</label>
            <div className="mt-1.5 space-y-2">
              {buttons.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <input value={b.text} onChange={(e) => setButtons(buttons.map((x, j) => j === i ? { ...x, text: e.target.value } : x))}
                    placeholder="Texte du bouton" className="flex-1 rounded-lg bg-ink-900 border border-white/10 focus:border-gold/50 px-3 py-2 text-bone text-[13px] outline-none" />
                  <input value={b.url} onChange={(e) => setButtons(buttons.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                    placeholder="https://…" className="flex-1 rounded-lg bg-ink-900 border border-white/10 focus:border-gold/50 px-3 py-2 text-bone text-[13px] font-mono outline-none" />
                  <button onClick={() => setButtons(buttons.filter((_, j) => j !== i).length ? buttons.filter((_, j) => j !== i) : [{ text: "", url: "" }])}
                    className="px-2 text-mist hover:text-rose-400">✕</button>
                </div>
              ))}
              <button onClick={() => setButtons([...buttons, { text: "", url: "" }])} className="text-[12.5px] text-gold hover:text-gold-soft">+ Ajouter un bouton</button>
            </div>
          </div>

          {/* audience + actions */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <select value={audience} onChange={(e) => setAudience(e.target.value)}
              className="rounded-lg bg-ink-900 border border-white/10 px-3 py-2 text-bone text-[13px] outline-none">
              {AUDIENCES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
            <button onClick={saveTemplate} className="btn-ghost rounded-full px-4 py-2 text-[12.5px]">💾 Template</button>
            <button onClick={sendNow} className="btn-gold rounded-full px-5 py-2 text-[12.5px] font-semibold">Envoyer maintenant</button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input value={testId} onChange={(e) => setTestId(e.target.value)} placeholder="tg_id de test"
              className="w-40 rounded-lg bg-ink-900 border border-white/10 px-3 py-1.5 text-bone text-[12.5px] font-mono outline-none" />
            <button onClick={sendTest} className="btn-ghost rounded-full px-4 py-1.5 text-[12px]">Envoyer un test</button>
            {msg && <span className={`text-[12.5px] ${msg.ok ? "text-pos" : "text-flag"}`}>{msg.t}</span>}
          </div>
        </div>

        {/* templates list */}
        <div className="rounded-2xl border hairline bg-ink-800/40 p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70 mb-3">Templates enregistrés</div>
          {templates.length === 0 ? (
            <p className="text-[13px] text-mist/60">Aucun template. Créez-en un et cliquez « 💾 Template ».</p>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border hairline bg-white/[0.015] px-3 py-2">
                  <button onClick={() => loadTemplate(t)} className="text-left min-w-0">
                    <div className="text-[13.5px] text-bone truncate">{t.name || "Sans titre"}</div>
                    <div className="text-[11px] text-mist/60 truncate">{(t.text || "").replace(/<[^>]+>/g, "").slice(0, 60) || (t.photo ? "📷 photo" : "—")}</div>
                  </button>
                  <button onClick={() => delTemplate(t.id)} className="text-mist hover:text-rose-400 text-[13px]">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ----- Aperçu + planification ----- */}
      <div className="space-y-4 lg:sticky lg:top-24">
        {/* preview Telegram */}
        <div className="rounded-2xl border hairline bg-ink-800/40 p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70 mb-3">Aperçu</div>
          <div className="rounded-2xl bg-[#17212b] p-3 max-w-[320px]">
            <div className="rounded-2xl rounded-tl-md bg-[#182533] overflow-hidden">
              {photo ? <img src={photo} alt="" className="w-full max-h-48 object-cover" /> : null}
              <div className="px-3.5 py-2.5">
                <div className="text-[13.5px] leading-relaxed text-[#e9eef2] whitespace-pre-wrap [&_a]:text-[#6ab3f3] [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: previewHtml || "<span style='opacity:.4'>Votre message…</span>" }} />
              </div>
              {buttons.filter((b) => b.text && b.url).length > 0 && (
                <div className="px-2 pb-2 space-y-1.5">
                  {buttons.filter((b) => b.text && b.url).map((b, i) => (
                    <div key={i} className="rounded-lg bg-[#2b5278] text-center text-[12.5px] text-white py-1.5">{b.text}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-mist/50">{"{prenom}"} est remplacé par le prénom réel de chaque destinataire (ici « Jean »).</p>
        </div>

        {/* planification */}
        <div className="rounded-2xl border gold-line bg-gold/[0.04] p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80 mb-3">Automatiser un post</div>
          <div className="space-y-2">
            <select value={schTpl} onChange={(e) => setSchTpl(e.target.value)} className="w-full rounded-lg bg-ink-900 border border-white/10 px-3 py-2 text-bone text-[13px] outline-none">
              <option value="">— Template à envoyer —</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name || `#${t.id}`}</option>)}
            </select>
            <div className="flex gap-2">
              <select value={schKind} onChange={(e) => setSchKind(e.target.value)} className="rounded-lg bg-ink-900 border border-white/10 px-3 py-2 text-bone text-[13px] outline-none">
                <option value="daily">Chaque jour à</option>
                <option value="interval">Toutes les</option>
              </select>
              {schKind === "daily" ? (
                <input type="time" value={schAt} onChange={(e) => setSchAt(e.target.value)} className="rounded-lg bg-ink-900 border border-white/10 px-3 py-2 text-bone text-[13px] outline-none" />
              ) : (
                <div className="flex items-center gap-1.5">
                  <input type="number" min={1} value={schEvery} onChange={(e) => setSchEvery(e.target.value)} className="w-20 rounded-lg bg-ink-900 border border-white/10 px-3 py-2 text-bone text-[13px] outline-none" />
                  <span className="text-[13px] text-mist">heures</span>
                </div>
              )}
            </div>
            <select value={schAud} onChange={(e) => setSchAud(e.target.value)} className="w-full rounded-lg bg-ink-900 border border-white/10 px-3 py-2 text-bone text-[13px] outline-none">
              {AUDIENCES.map((a) => <option key={a.id} value={a.id}>Audience : {a.label}</option>)}
            </select>
            <button onClick={addSchedule} className="btn-gold w-full rounded-full px-5 py-2.5 text-[13px] font-semibold">Planifier</button>
          </div>

          {schedules.length > 0 && (
            <div className="mt-4 space-y-2">
              {schedules.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-2 rounded-lg border hairline bg-ink-900/60 px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-[13px] text-bone truncate">{s.template_name || `Template #${s.template_id}`}</div>
                    <div className="text-[11px] text-mist/60">
                      {s.kind === "daily" ? `Chaque jour ${s.at_hhmm}` : `Toutes les ${Math.round((s.every_min || 0) / 60)} h`} · prochain : {fmtNext(s.next_run)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleSchedule(s.id)} className={`text-[11px] rounded-full px-2 py-1 border ${s.enabled ? "text-pos border-pos/40" : "text-mist/60 border-white/10"}`}>
                      {s.enabled ? "actif" : "off"}
                    </button>
                    <button onClick={() => delSchedule(s.id)} className="text-mist hover:text-rose-400 text-[13px]">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
