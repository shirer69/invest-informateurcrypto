"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { API_BASE } from "@/lib/site";

/* ─── API helpers ─────────────────────────────────────────────────────────── */
const hdr = (key) => ({ "x-admin-key": key, "Content-Type": "application/json" });

async function aGet(path, key) {
  const r = await fetch(`${API_BASE}${path}`, { headers: hdr(key), cache: "no-store" });
  return r.json().catch(() => ({}));
}
async function aPost(path, key, body) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST", headers: hdr(key), body: JSON.stringify(body || {}),
  });
  return r.json().catch(() => ({}));
}
async function aDel(path, key) {
  const r = await fetch(`${API_BASE}${path}`, { method: "DELETE", headers: hdr(key) });
  return r.json().catch(() => ({}));
}

const fmtDate = (ts) =>
  ts ? new Date(ts * 1000).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

const AUDIENCES = [
  { id: "all",                 label: "Tous (comptes email réels)" },
  { id: "members",             label: "Membres actifs (accès ouvert)" },
  { id: "all_except_members",  label: "Tous sauf membres actifs" },
  { id: "users",               label: "Utilisateurs Telegram uniquement" },
  { id: "copy",                label: "Membres avec copy actif" },
];

/* ─── Sous-onglets ────────────────────────────────────────────────────────── */
const MAIL_TABS = [
  { id: "inbox",       label: "📥 Boîte mail" },
  { id: "templates",   label: "📄 Templates" },
  { id: "campaigns",   label: "📤 Campagnes" },
  { id: "history",     label: "📜 Historique" },
  { id: "automations", label: "⚙️ Automatisations" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Composant racine EmailAdmin
   ═══════════════════════════════════════════════════════════════════════════ */
export default function EmailAdmin({ adminKey }) {
  const [sub, setSub] = useState("inbox");
  const [templates, setTemplates] = useState(null);
  const [campaigns, setCampaigns] = useState(null);
  const [automations, setAutomations] = useState(null);

  const reload = useCallback(async () => {
    const [t, c, a] = await Promise.all([
      aGet("/api/admin/mail/templates", adminKey),
      aGet("/api/admin/mail/campaigns", adminKey),
      aGet("/api/admin/mail/automations", adminKey),
    ]);
    setTemplates(t.templates || []);
    setCampaigns(c.campaigns || []);
    setAutomations(a.automations || []);
  }, [adminKey]);

  useEffect(() => { reload(); }, [reload]);

  return (
    <div>
      {/* Sous-navigation */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 [scrollbar-width:none]">
        {MAIL_TABS.map((t) => (
          <button key={t.id} onClick={() => setSub(t.id)}
            className={`rounded-xl px-4 py-2 text-[13.5px] whitespace-nowrap border transition-colors ${
              sub === t.id
                ? "bg-gold/[0.10] text-bone gold-line"
                : "text-mist hover:text-bone border-transparent"
            }`}>
            {t.label}
          </button>
        ))}
        <button onClick={reload} className="ml-auto text-[12px] text-mist hover:text-bone whitespace-nowrap">
          ↻ Rafraîchir
        </button>
      </div>

      {sub === "inbox"       && <InboxSection adminKey={adminKey} />}
      {sub === "templates"   && <TemplatesSection adminKey={adminKey} templates={templates} onReload={reload} />}
      {sub === "campaigns"   && <CampaignsSection adminKey={adminKey} templates={templates} campaigns={campaigns} onReload={reload} />}
      {sub === "history"     && <HistorySection campaigns={campaigns} onReload={reload} />}
      {sub === "automations" && <AutomationsSection adminKey={adminKey} templates={templates} automations={automations} onReload={reload} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION — Templates
   ═══════════════════════════════════════════════════════════════════════════ */
const emptyTpl = () => ({ id: null, name: "", title: "", subject: "", intro: "", body_html: "", cta_label: "", cta_url: "", footnote: "" });

function TemplatesSection({ adminKey, templates, onReload }) {
  const [form, setForm]           = useState(emptyTpl());
  const [msg,  setMsg]            = useState(null);
  const [busy, setBusy]           = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewBusy, setPreviewBusy] = useState(false);
  const [seedBusy, setSeedBusy]   = useState(false);
  const [seedMsg,  setSeedMsg]    = useState(null);
  const previewTimerRef = useRef(null);
  const iframeRef = useRef(null);
  const bodyEditingRef = useRef(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Rend le corps de l'aperçu (iframe) éditable et synchronise vers form.body_html.
  function wireEditableBody() {
    try {
      const doc = iframeRef.current && iframeRef.current.contentDocument;
      const el = doc && doc.getElementById("pi-edit-body");
      if (!el || el.dataset.wired) return;
      el.dataset.wired = "1";
      el.addEventListener("focus", () => { bodyEditingRef.current = true; });
      el.addEventListener("blur", () => {
        bodyEditingRef.current = false;
        setForm((f) => ({ ...f, body_html: el.innerHTML }));
        fetchPreview();   // re-rendu propre après édition
      });
      el.addEventListener("input", () => {
        setForm((f) => ({ ...f, body_html: el.innerHTML }));
      });
    } catch { /* cross-origin: ignore */ }
  }

  async function fetchPreview(overrideForm) {
    setPreviewBusy(true); setPreviewHtml("");
    try {
      const r = await fetch(`${API_BASE}/api/admin/mail/preview`, {
        method: "POST",
        headers: hdr(adminKey),
        body: JSON.stringify(overrideForm || form),
      });
      const html = await r.text();
      setPreviewHtml(html);
    } catch {
      setPreviewHtml("<p style='color:#ff6b6b;padding:20px'>Erreur de rendu</p>");
    } finally {
      setPreviewBusy(false);
    }
  }

  useEffect(() => {
    // Pas de re-rendu pendant qu'on édite dans l'aperçu (sinon le curseur saute).
    if (bodyEditingRef.current) return;
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => fetchPreview(), 800);
    return () => clearTimeout(previewTimerRef.current);
  }, [form, adminKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function load(t) {
    const next = { id: t.id, name: t.name || "", title: t.title || "", subject: t.subject || "", intro: t.intro || "",
                   body_html: t.body_html || "", cta_label: t.cta_label || "", cta_url: t.cta_url || "", footnote: t.footnote || "" };
    setForm(next);
    setMsg(null);
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    fetchPreview(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() {
    const next = emptyTpl();
    setForm(next);
    setMsg(null);
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    fetchPreview(next);
  }

  async function save() {
    if (!form.name.trim()) { setMsg({ ok: false, t: "Donnez un nom au template." }); return; }
    setBusy(true);
    const r = await aPost("/api/admin/mail/templates", adminKey, form);
    setBusy(false);
    if (r.ok) { setMsg({ ok: true, t: "Template enregistré." }); setForm((f) => ({ ...f, id: r.id })); onReload(); }
    else setMsg({ ok: false, t: "Erreur d'enregistrement." });
  }

  async function del(id) {
    if (!confirm("Supprimer ce template ?")) return;
    await aDel(`/api/admin/mail/templates/${id}`, adminKey);
    if (form.id === id) reset();
    onReload();
  }

  async function seedTemplates(force = false) {
    setSeedBusy(true); setSeedMsg(null);
    const r = await aPost("/api/admin/mail/templates/seed", adminKey, { force });
    setSeedBusy(false);
    if (r.ok) {
      const parts = [];
      if (r.added?.length)   parts.push(`${r.added.length} ajouté(s)`);
      if (r.updated?.length) parts.push(`${r.updated.length} mis à jour`);
      if (r.skipped)         parts.push(`${r.skipped} inchangé(s)`);
      setSeedMsg("✓ " + (parts.join(" · ") || "Aucun changement."));
      onReload();
    } else setSeedMsg("Erreur d'import.");
  }

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5 items-start">
      {/* ── Éditeur ── */}
      <div className="rounded-2xl border hairline bg-ink-800/40 p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-[17px] text-bone">
            {form.id ? `Éditer · #${form.id}` : "Nouveau template"}
          </h3>
          <button onClick={reset} className="text-[12.5px] text-mist hover:text-bone">+ Nouveau</button>
        </div>

        <Field label="Nom interne" value={form.name} onChange={(v) => set("name", v)} placeholder="Ex : Bienvenue membres" />
        <Field label="Titre affiché dans l'email" value={form.title} onChange={(v) => set("title", v)} placeholder="Ex : Bienvenue sur le Pôle Invest, {{Prénom}} !" />
        <Field label="Sujet de l'email" value={form.subject} onChange={(v) => set("subject", v)} placeholder="Ex : Bienvenue sur le Pôle Invest 👋" />

        <div>
          <label className="field-label">
            Introduction <span className="normal-case text-mist/50">(supporte {"{{Prénom}}"})</span>
          </label>
          <textarea rows={3} value={form.intro} onChange={(e) => set("intro", e.target.value)}
            placeholder="Bonjour {{Prénom}}, votre accès est actif…"
            className="field-textarea" />
        </div>

        <div>
          <label className="field-label">Corps HTML <span className="normal-case text-mist/50">(HTML complet autorisé)</span></label>
          <HtmlToolbar onInsert={(s) => set("body_html", form.body_html + s)} />
          <textarea rows={6} value={form.body_html} onChange={(e) => set("body_html", e.target.value)}
            placeholder="<p>Vos <b>gains du mois</b> : …</p>"
            className="field-textarea font-mono text-[12.5px]" />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Bouton CTA — Texte" value={form.cta_label} onChange={(v) => set("cta_label", v)} placeholder="Accéder au dashboard" />
          <Field label="Bouton CTA — URL"   value={form.cta_url}   onChange={(v) => set("cta_url", v)}   placeholder="https://invest.informateurcrypto.fr/dashboard" mono />
        </div>

        <div>
          <label className="field-label">Note de bas de page <span className="normal-case text-mist/50">(optionnel)</span></label>
          <textarea rows={2} value={form.footnote} onChange={(e) => set("footnote", e.target.value)}
            placeholder="Cet email vous a été envoyé car vous êtes membre du Club des Informateurs."
            className="field-textarea" />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button onClick={save} disabled={busy}
            className="btn-gold rounded-full px-7 py-2.5 text-[13.5px] font-semibold disabled:opacity-60">
            {busy ? "Enregistrement…" : "💾 Enregistrer"}
          </button>
          <button onClick={() => fetchPreview()} disabled={previewBusy}
            className="btn-ghost rounded-full px-5 py-2.5 text-[13px] disabled:opacity-60">
            {previewBusy ? "Rendu…" : "↻ Rafraîchir"}
          </button>
          {msg && <span className={`text-[12.5px] ${msg.ok ? "text-pos" : "text-flag"}`}>{msg.t}</span>}
        </div>
      </div>

      {/* ── Panneau droit ── */}
      <div className="space-y-4 lg:sticky lg:top-24">

        {/* Aperçu réel (HTML du serveur) */}
        <div className="rounded-2xl border hairline overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b hairline bg-ink-800/40">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60">
              Aperçu réel — rendu serveur
            </span>
            <span className="text-[10px] text-mist/40">
              {previewBusy ? "Actualisation…" : "Prénom = « Jean »"}
            </span>
          </div>
          {previewHtml === "" ? (
            <div className="h-48 flex items-center justify-center bg-[#07080b]">
              <span className="text-mist/50 text-[13px] animate-pulse">Rendu en cours…</span>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              onLoad={wireEditableBody}
              srcDoc={previewHtml}
              className="w-full border-0 bg-[#07080b]"
              style={{ height: "580px" }}
              title="Aperçu email"
              sandbox="allow-same-origin"
            />
          )}
        </div>

        {/* Import / sync templates */}
        <div className="rounded-2xl border gold-line bg-gold/[0.04] p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80 mb-2">
            Templates du site — synchronisation
          </div>
          <p className="text-[12.5px] text-mist/70 mb-3 leading-relaxed">
            7 templates intégrés au style Hyperliquid du site (Bienvenue, VIP, Reset,
            Facture, Signal, Relance J+3, Expiration J-7) avec tables de données cyan.
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => seedTemplates(false)} disabled={seedBusy}
              className="btn-ghost rounded-full px-5 py-2 text-[12.5px] disabled:opacity-60">
              {seedBusy ? "…" : "⬇ Importer les nouveaux"}
            </button>
            <button onClick={() => seedTemplates(true)} disabled={seedBusy}
              className="btn-ghost rounded-full px-5 py-2 text-[12.5px] disabled:opacity-60 border-gold/30">
              {seedBusy ? "…" : "↺ Tout mettre à jour"}
            </button>
          </div>
          {seedMsg && <p className="mt-2 text-[12px] text-pos">{seedMsg}</p>}
        </div>

        {/* Liste des templates */}
        <div className="rounded-2xl border hairline bg-ink-800/40 p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70 mb-3">
            Templates ({templates?.length ?? "—"})
          </div>
          {!templates ? (
            <p className="text-[13px] text-mist/60">Chargement…</p>
          ) : templates.length === 0 ? (
            <p className="text-[13px] text-mist/60">
              Aucun template. Importez les templates existants ci-dessus ou créez-en un.
            </p>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <div key={t.id}
                  onClick={() => load(t)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-colors
                    ${form.id === t.id ? "bg-gold/[0.06] gold-line" : "hairline bg-white/[0.01] hover:bg-white/[0.03]"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] text-bone truncate">{t.name || "Sans titre"}</div>
                    <div className="text-[11px] text-mist/60 truncate">{t.subject || "—"}</div>
                    <div className="text-[10px] text-mist/40 font-mono">{fmtDate(t.updated_at)}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); del(t.id); }}
                    className="text-mist/40 hover:text-rose-400 text-[13px] shrink-0">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-[11.5px] text-mist/50 leading-relaxed">
          {"{{Prénom}}"} est remplacé par le prénom réel dans l'intro, le corps, le sujet et l'URL du CTA.
          L'aperçu utilise «&nbsp;Jean&nbsp;» comme prénom d'exemple.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION — Campagnes
   ═══════════════════════════════════════════════════════════════════════════ */
function CampaignsSection({ adminKey, templates, campaigns, onReload }) {
  const [form, setForm]     = useState({ template_id: "", audience: "all", subject: "" });
  const [busy, setBusy]     = useState(false);
  const [msg,  setMsg]      = useState(null);
  const [confirm, setConfirm] = useState(false);
  const sendingRef = useRef(false);

  const selTpl = (templates || []).find((t) => String(t.id) === String(form.template_id));

  async function send() {
    if (!form.template_id) { setMsg({ ok: false, t: "Sélectionnez un template." }); return; }
    if (sendingRef.current) return;
    sendingRef.current = true;
    setConfirm(false); setBusy(true); setMsg({ ok: true, t: "Envoi en cours… (peut prendre quelques instants)" });
    const r = await aPost("/api/admin/mail/campaigns", adminKey, {
      template_id: Number(form.template_id),
      audience: form.audience,
      subject: form.subject.trim() || null,
    });
    sendingRef.current = false;
    setBusy(false);
    if (r.ok) {
      setMsg({ ok: true, t: `✓ Envoyé : ${r.sent} · Échecs : ${r.failed} · Cible : ${r.reachable}` });
      onReload();
    } else {
      setMsg({ ok: false, t: `Erreur : ${r.error || "envoi impossible"}` });
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5 items-start">
      {/* Formulaire */}
      <div className="rounded-2xl border gold-line bg-gold/[0.04] p-5 space-y-4">
        <h3 className="font-display text-[17px] text-bone">Envoyer une campagne</h3>

        <div>
          <label className="field-label">Template email</label>
          <select value={form.template_id} onChange={(e) => setForm((f) => ({ ...f, template_id: e.target.value }))}
            className="field-select">
            <option value="">— Choisir un template —</option>
            {(templates || []).map((t) => (
              <option key={t.id} value={t.id}>{t.name || `Template #${t.id}`}</option>
            ))}
          </select>
        </div>

        {selTpl && (
          <div className="rounded-xl border hairline bg-ink-900/60 px-4 py-3 text-[13px] text-mist">
            <div className="font-semibold text-bone">{selTpl.name}</div>
            <div className="text-mist/70 mt-0.5">Sujet par défaut : <span className="italic">{selTpl.subject || "—"}</span></div>
          </div>
        )}

        <div>
          <label className="field-label">Sujet <span className="normal-case text-mist/50">(optionnel — remplace le sujet du template)</span></label>
          <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            placeholder={selTpl?.subject || "Laisser vide pour utiliser le sujet du template"}
            className="field-input" />
        </div>

        <div>
          <label className="field-label">Audience</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {AUDIENCES.map((a) => (
              <button key={a.id} onClick={() => setForm((f) => ({ ...f, audience: a.id }))}
                className={`rounded-lg px-3 py-1.5 text-[12px] border transition-colors ${
                  form.audience === a.id ? "bg-gold/[0.10] text-bone gold-line" : "text-mist hover:text-bone border-transparent"
                }`}>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          {!confirm ? (
            <button onClick={() => { if (!form.template_id) { setMsg({ ok: false, t: "Sélectionnez un template." }); return; } setConfirm(true); }}
              disabled={busy}
              className="btn-gold rounded-full px-7 py-2.5 text-[13.5px] font-semibold disabled:opacity-60">
              Envoyer la campagne
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[13px] text-bone">Confirmer l'envoi à « {AUDIENCES.find((a) => a.id === form.audience)?.label} » ?</span>
              <button onClick={send} disabled={busy}
                className="btn-gold rounded-full px-5 py-2.5 text-[13px] font-semibold disabled:opacity-60">
                {busy ? "Envoi…" : "Oui, envoyer"}
              </button>
              <button onClick={() => setConfirm(false)} className="btn-ghost rounded-full px-5 py-2.5 text-[13px]">Annuler</button>
            </div>
          )}
          {msg && <div className={`mt-2 text-[12.5px] ${msg.ok ? "text-pos" : "text-flag"}`}>{msg.t}</div>}
        </div>
      </div>

      {/* Historique */}
      <div className="rounded-2xl border hairline bg-ink-800/40 p-5">
        <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70 mb-3">
          Historique des envois
        </div>
        {!campaigns ? (
          <p className="text-[13px] text-mist/60">Chargement…</p>
        ) : campaigns.length === 0 ? (
          <p className="text-[13px] text-mist/60">Aucun envoi pour l'instant.</p>
        ) : (
          <div className="space-y-2">
            {campaigns.map((c) => {
              const isTrigger = c.source && c.source !== "manual";
              const triggerLabel = isTrigger ? c.source.replace("trigger:", "") : null;
              const isIndividual = isTrigger && !AUDIENCES.find((a) => a.id === c.audience);
              return (
                <div key={c.id} className="rounded-xl border hairline bg-white/[0.015] px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13.5px] text-bone">{c.template_name || `Template #${c.template_id}`}</span>
                        {isTrigger ? (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            ⚡ {triggerLabel}
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-mist/60 border border-white/10">
                            manuel
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-mist/60 mt-0.5">
                        {isIndividual
                          ? <span className="text-sky-400/80">→ {c.audience}</span>
                          : <>{AUDIENCES.find((a) => a.id === c.audience)?.label || c.audience || "—"}</>
                        }
                        {c.subject_override && <> · <span className="italic">{c.subject_override}</span></>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[12px] text-pos">✓ {c.count_sent}</div>
                      {c.count_failed > 0 && <div className="text-[11px] text-flag">✗ {c.count_failed}</div>}
                    </div>
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-mist/40">{fmtDate(c.sent_at)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION — Historique des envois (individuel & campagne)
   ═══════════════════════════════════════════════════════════════════════════ */
function _isIndividual(c) {
  const isTrigger = c.source && c.source !== "manual";
  return isTrigger && !AUDIENCES.find((a) => a.id === c.audience);
}

function HistoryRow({ c }) {
  const isTrigger = c.source && c.source !== "manual";
  const triggerLabel = isTrigger ? c.source.replace("trigger:", "") : null;
  const ind = _isIndividual(c);
  return (
    <div className="rounded-xl border hairline bg-white/[0.015] px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13.5px] text-bone">{c.template_name || `Template #${c.template_id}`}</span>
            {ind ? (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30">👤 individuel</span>
            ) : isTrigger ? (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">⚡ {triggerLabel}</span>
            ) : (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold/80 border border-gold/20">📣 campagne</span>
            )}
          </div>
          <div className="text-[11px] text-mist/60 mt-0.5">
            {ind ? <span className="text-sky-400/80">→ {c.audience}</span>
                 : <>{AUDIENCES.find((a) => a.id === c.audience)?.label || c.audience || "—"}</>}
            {c.subject_override && <> · <span className="italic">{c.subject_override}</span></>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[12px] text-pos">✓ {c.count_sent}</div>
          {c.count_failed > 0 && <div className="text-[11px] text-flag">✗ {c.count_failed}</div>}
        </div>
      </div>
      <div className="mt-1 font-mono text-[10px] text-mist/40">{fmtDate(c.sent_at)}</div>
    </div>
  );
}

function HistorySection({ campaigns, onReload }) {
  const [filter, setFilter] = useState("all"); // all | broadcast | individual
  const all = campaigns || [];
  const nInd = all.filter(_isIndividual).length;
  const nCamp = all.length - nInd;
  const rows = all.filter((c) =>
    filter === "all" ? true : filter === "individual" ? _isIndividual(c) : !_isIndividual(c)
  );
  return (
    <div className="rounded-2xl border hairline bg-ink-800/40 p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Historique des envois</div>
        <button onClick={onReload} className="text-[12px] text-mist hover:text-bone">↻ rafraîchir</button>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {[["all", `Tous (${all.length})`], ["broadcast", `Campagnes (${nCamp})`], ["individual", `Individuels (${nInd})`]].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)}
            className={`rounded-full px-3 py-1.5 text-[12px] border transition-colors ${
              filter === id ? "bg-gold/[0.12] text-bone gold-line" : "text-mist border-white/10 hover:text-bone"}`}>
            {label}
          </button>
        ))}
      </div>
      {!campaigns ? <p className="text-[13px] text-mist/60">Chargement…</p>
        : rows.length === 0 ? <p className="text-[13px] text-mist/60">Aucun envoi sur ce filtre.</p>
        : <div className="space-y-2">{rows.map((c) => <HistoryRow key={c.id} c={c} />)}</div>}
      <p className="mt-3 text-[11px] text-mist/50 leading-relaxed">
        50 derniers envois. <b>Individuel</b> = trigger envoyé à un destinataire ; <b>Campagne</b> = envoi groupé ; <b>⚡</b> = déclenché automatiquement.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION — Automatisations
   ═══════════════════════════════════════════════════════════════════════════ */
function AutomationsSection({ adminKey, templates, automations, onReload }) {
  const [editing, setEditing] = useState(null); // trigger.id en cours d'édition
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg,  setMsg]  = useState(null);

  function openEdit(auto) {
    setEditing(auto.id);
    setForm({
      trigger:      auto.id,
      template_id:  String(auto.template_id || ""),
      audience:     auto.audience || "all",
      cooldown_min: auto.cooldown_min || 0,
      enabled:      auto.enabled ?? true,
    });
    setMsg(null);
  }

  async function save() {
    if (!form.template_id) { setMsg({ ok: false, t: "Choisissez un template." }); return; }
    setBusy(true);
    const r = await aPost("/api/admin/mail/automations", adminKey, {
      trigger:      form.trigger,
      template_id:  Number(form.template_id),
      audience:     form.audience,
      cooldown_min: Number(form.cooldown_min) || 0,
      enabled:      form.enabled ? 1 : 0,
    });
    setBusy(false);
    if (r.ok) { setMsg({ ok: true, t: "Automatisation enregistrée." }); setEditing(null); onReload(); }
    else setMsg({ ok: false, t: "Erreur." });
  }

  async function toggle(auto) {
    if (!auto.automation_id) return;
    await aPost(`/api/admin/mail/automations/${auto.automation_id}/toggle`, adminKey, {});
    onReload();
  }

  async function del(auto) {
    if (!auto.automation_id) return;
    if (!confirm("Supprimer cette automatisation ?")) return;
    await aDel(`/api/admin/mail/automations/${auto.automation_id}`, adminKey);
    onReload();
  }

  if (!automations) return <p className="text-[13px] text-mist/60">Chargement…</p>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border hairline bg-amber-500/[0.05] border-amber-500/20 px-4 py-3 text-[12.5px] text-amber-200/80">
        Les automatisations se déclenchent <b>automatiquement</b> à l'événement correspondant.
        Assignez un template à un trigger pour l'activer. Le déclenchement utilise le template sélectionné avec substitution <code className="bg-white/10 px-1 rounded text-amber-300">{"{{"} Prénom {"}}"}</code>.
      </div>

      <div className="grid gap-3">
        {automations.map((auto) => {
          const isEditing = editing === auto.id;
          return (
            <div key={auto.id}
              className={`rounded-2xl border p-5 transition-all ${
                isEditing ? "gold-line bg-gold/[0.04]"
                : auto.configured && auto.enabled ? "border-pos/25 bg-pos/[0.03]"
                : auto.configured ? "hairline bg-white/[0.015]"
                : "border-dashed border-white/15 bg-transparent"
              }`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] text-bone font-semibold">{auto.label}</span>
                    {auto.configured && (
                      <span className={`font-mono text-[9.5px] uppercase tracking-widest2 rounded px-1.5 py-0.5 border ${
                        auto.enabled ? "text-pos border-pos/40" : "text-mist/50 border-white/15"
                      }`}>
                        {auto.enabled ? "actif" : "inactif"}
                      </span>
                    )}
                    {!auto.configured && (
                      <span className="font-mono text-[9.5px] uppercase tracking-widest2 text-mist/40">non configuré</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-mist/70">{auto.desc}</p>
                  {auto.configured && !isEditing && (
                    <div className="mt-1.5 text-[12px] text-mist/60">
                      Template : <span className="text-bone">{auto.template_name}</span>
                      {" · "}Audience : {AUDIENCES.find((a) => a.id === auto.audience)?.label || auto.audience}
                      {auto.cooldown_min > 0 && (
                        <> · Cooldown : <span className="text-bone">{auto.cooldown_min} min</span></>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {auto.configured && !isEditing && (
                    <>
                      <button onClick={() => toggle(auto)}
                        className={`rounded-full px-3 py-1.5 text-[11.5px] border transition-colors ${
                          auto.enabled
                            ? "text-pos border-pos/40 hover:bg-pos/10"
                            : "text-mist border-white/20 hover:text-bone"
                        }`}>
                        {auto.enabled ? "Désactiver" : "Activer"}
                      </button>
                      <button onClick={() => del(auto)} className="text-mist/40 hover:text-rose-400 text-[13px]">✕</button>
                    </>
                  )}
                  {!isEditing && (
                    <button onClick={() => openEdit(auto)}
                      className="btn-ghost rounded-full px-4 py-1.5 text-[12.5px]">
                      {auto.configured ? "Modifier" : "Configurer"}
                    </button>
                  )}
                </div>
              </div>

              {/* Formulaire d'édition inline */}
              {isEditing && (
                <div className="mt-4 pt-4 border-t hairline space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="field-label">Template à envoyer</label>
                      <select value={form.template_id}
                        onChange={(e) => setForm((f) => ({ ...f, template_id: e.target.value }))}
                        className="field-select">
                        <option value="">— Choisir un template —</option>
                        {(templates || []).map((t) => (
                          <option key={t.id} value={t.id}>{t.name || `Template #${t.id}`}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="field-label">Audience</label>
                      <select value={form.audience}
                        onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
                        className="field-select">
                        {AUDIENCES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={form.enabled}
                        onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
                        className="accent-[#c9a24b] w-4 h-4" />
                      <span className="text-[13px] text-bone">Activé</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="text-[12px] text-mist/70 whitespace-nowrap">Cooldown (min)</label>
                      <input type="number" min={0} value={form.cooldown_min}
                        onChange={(e) => setForm((f) => ({ ...f, cooldown_min: e.target.value }))}
                        className="w-20 rounded-lg bg-ink-900 border border-white/10 px-3 py-1.5 text-bone text-[13px] font-mono outline-none"
                        placeholder="0" />
                      <span className="text-[11px] text-mist/40">— 0 = sans limite</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={save} disabled={busy}
                      className="btn-gold rounded-full px-6 py-2 text-[13px] font-semibold disabled:opacity-60">
                      {busy ? "Enregistrement…" : "Enregistrer"}
                    </button>
                    <button onClick={() => { setEditing(null); setMsg(null); }} className="btn-ghost rounded-full px-5 py-2 text-[12.5px]">
                      Annuler
                    </button>
                    {msg && <span className={`text-[12.5px] ${msg.ok ? "text-pos" : "text-flag"}`}>{msg.t}</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11.5px] text-mist/50 leading-relaxed mt-4">
        <b className="text-mist/70">Inscription</b> et <b className="text-mist/70">Déblocage</b> se déclenchent en temps réel.
        Les autres triggers (<b>J+1, J+3, Expiration J-7</b>) nécessitent un cron VPS — à ajouter dans pm2/crontab si besoin.
        Le délai est appliqué côté serveur uniquement si implémenté dans le moteur.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION — Boîte de réception IMAP
   ═══════════════════════════════════════════════════════════════════════════ */

/** Affiche un email HTML dans un iframe isolé qui s'auto-redimensionne au contenu. */
function HtmlEmailFrame({ html }) {
  const ref = useRef(null);

  // Injecte le HTML via srcdoc et redimensionne l'iframe dès que le contenu est rendu
  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;

    // Enveloppe le fragment HTML dans un document complet si nécessaire
    const wrapped = html.trim().startsWith("<!") || html.trim().toLowerCase().startsWith("<html")
      ? html
      : `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
          body{margin:0;padding:16px;font-family:sans-serif;background:#fff;color:#111;word-break:break-word;}
          img{max-width:100%;height:auto;}
          a{color:#0066cc;}
        </style></head><body>${html}</body></html>`;

    // Écrit le document directement (plus fiable que srcDoc pour le resize)
    frame.srcdoc = wrapped;

    function resize() {
      try {
        const doc = frame.contentDocument || frame.contentWindow?.document;
        if (!doc) return;
        const h = doc.documentElement.scrollHeight || doc.body.scrollHeight;
        if (h > 0) frame.style.height = h + "px";
      } catch {}
    }

    frame.onload = () => {
      resize();
      // Re-check après 200ms (images chargées)
      setTimeout(resize, 200);
      setTimeout(resize, 800);
    };
  }, [html]);

  return (
    <iframe
      ref={ref}
      title="Corps email"
      sandbox="allow-same-origin allow-scripts allow-popups"
      className="w-full border-0 rounded-b-2xl bg-white"
      style={{ minHeight: 200, height: 400, display: "block" }}
    />
  );
}

function parseDate(raw) {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    const now = new Date();
    const today = now.toDateString() === d.toDateString();
    return today
      ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch { return raw; }
}

function InboxSection({ adminKey }) {
  const [list, setList]       = useState(null);   // [{id, subject, from_, date, unread}]
  const [total, setTotal]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null); // {id, subject, from_, to, date, body, is_html}
  const [bodyLoading, setBodyLoading] = useState(false);
  const [search, setSearch]   = useState("");
  const [deleting, setDeleting] = useState(null);

  async function loadList() {
    setLoading(true);
    try {
      const r = await aGet("/api/admin/mail/inbox?limit=60", adminKey);
      if (r.ok) { setList(r.emails || []); setTotal(r.total); }
      else setList([]);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadList(); }, [adminKey]); // eslint-disable-line

  async function openMsg(item) {
    if (selected?.id === item.id) { setSelected(null); return; }
    setBodyLoading(true);
    setSelected({ ...item, body: null });
    const r = await aGet(`/api/admin/mail/inbox/${item.id}`, adminKey);
    setBodyLoading(false);
    if (r.ok) {
      setSelected(r);
      // Mark as read in local list
      setList((prev) => prev.map((m) => m.id === item.id ? { ...m, unread: false } : m));
    }
  }

  async function deleteMsg(e, id) {
    e.stopPropagation();
    if (!confirm("Supprimer cet email ?")) return;
    setDeleting(id);
    await aDel(`/api/admin/mail/inbox/${id}`, adminKey);
    setDeleting(null);
    setList((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  const filtered = (list || []).filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (m.subject || "").toLowerCase().includes(q) || (m.from_ || "").toLowerCase().includes(q);
  });

  const unreadCount = (list || []).filter((m) => m.unread).length;

  return (
    <div>
      {/* Barre d'outils */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60">
            contact@informateurcrypto.fr
          </span>
          {total !== null && (
            <span className="font-mono text-[10px] text-mist/40">({total} total)</span>
          )}
          {unreadCount > 0 && (
            <span className="grid place-items-center h-5 min-w-[20px] rounded-full bg-gold/20 border gold-line font-mono text-[10px] text-gold px-1.5">
              {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="flex-1 min-w-[180px] max-w-xs rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-3.5 py-2 text-bone placeholder:text-mist/40 text-[13px] outline-none"
        />
        <button onClick={loadList} disabled={loading}
          className="ml-auto btn-ghost rounded-full px-4 py-2 text-[12.5px] disabled:opacity-50">
          {loading ? "…" : "↻ Actualiser"}
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-4 items-start">
        {/* Liste */}
        <div className="rounded-2xl border hairline bg-ink-800/40 overflow-hidden">
          {loading && !list && (
            <div className="flex items-center justify-center h-40 text-mist/50 text-[13px] animate-pulse">
              Connexion IMAP…
            </div>
          )}
          {list && filtered.length === 0 && (
            <div className="flex items-center justify-center h-32 text-mist/50 text-[13px]">
              {search ? "Aucun résultat" : "Boîte vide"}
            </div>
          )}
          {filtered.map((m) => (
            <div
              key={m.id}
              onClick={() => openMsg(m)}
              className={`flex items-start gap-3 px-4 py-3.5 border-b hairline last:border-0 cursor-pointer transition-colors
                ${selected?.id === m.id ? "bg-gold/[0.07] border-l-2 border-l-gold/50" : "hover:bg-white/[0.02] border-l-2 border-l-transparent"}`}
            >
              {/* Indicateur non lu */}
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.unread ? "bg-gold" : "bg-transparent"}`} />
              <div className="flex-1 min-w-0">
                <div className={`text-[13.5px] truncate ${m.unread ? "text-bone font-semibold" : "text-mist/80"}`}>
                  {m.subject || "(sans objet)"}
                </div>
                <div className="text-[11.5px] text-mist/50 truncate mt-0.5">{m.from_}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[10.5px] text-mist/40 whitespace-nowrap">
                  {parseDate(m.date)}
                </span>
                <button
                  onClick={(e) => deleteMsg(e, m.id)}
                  disabled={deleting === m.id}
                  className="text-mist/30 hover:text-rose-400 transition-colors text-[13px] disabled:opacity-40"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Corps du message */}
        <div className="rounded-2xl border hairline bg-ink-800/40 overflow-hidden sticky top-24">
          {!selected && (
            <div className="flex items-center justify-center h-64 text-mist/40 text-[13px]">
              Sélectionnez un email
            </div>
          )}
          {selected && (
            <>
              {/* En-tête du message */}
              <div className="px-5 py-4 border-b hairline space-y-1.5">
                <h3 className="font-display text-[16px] text-bone leading-snug">
                  {selected.subject || "(sans objet)"}
                </h3>
                <div className="text-[12px] text-mist/70">
                  <span className="text-mist/50">De : </span>{selected.from_}
                </div>
                {selected.to && (
                  <div className="text-[12px] text-mist/70">
                    <span className="text-mist/50">À : </span>{selected.to}
                  </div>
                )}
                <div className="font-mono text-[10.5px] text-mist/40">{selected.date}</div>
              </div>

              {/* Corps */}
              <div className={selected.is_html ? "" : "p-5"}>
                {bodyLoading && (
                  <div className="p-5 text-mist/50 text-[13px] animate-pulse">Chargement…</div>
                )}
                {!bodyLoading && selected.body != null && (
                  selected.is_html ? (
                    <HtmlEmailFrame html={selected.body} />
                  ) : (
                    <pre className="whitespace-pre-wrap text-[13px] leading-relaxed text-mist font-sans">
                      {selected.body}
                    </pre>
                  )
                )}
                {!bodyLoading && selected.body == null && (
                  <div className="p-5 text-mist/50 text-[13px]">Impossible de charger le corps.</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers UI — champs réutilisables
   ═══════════════════════════════════════════════════════════════════════════ */
function Field({ label, value, onChange, placeholder, mono }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`field-input ${mono ? "font-mono text-[12.5px]" : ""}`} />
    </div>
  );
}

function HtmlToolbar({ onInsert }) {
  const tags = [
    { label: "B",   title: "Gras",       ins: (s) => `<b>${s}</b>` },
    { label: "I",   title: "Italique",   ins: (s) => `<i>${s}</i>` },
    { label: "U",   title: "Souligné",   ins: (s) => `<u>${s}</u>` },
    { label: "🔗",  title: "Lien",       ins: (s) => `<a href="${s}">texte du lien</a>` },
    { label: "P",   title: "Paragraphe", ins: ()  => "<p>…</p>" },
    { label: "{P}", title: "{{Prénom}}", ins: ()  => "{{Prénom}}" },
  ];
  return (
    <div className="flex gap-1.5 mb-1.5 flex-wrap">
      {tags.map((t) => (
        <button key={t.label} type="button" title={t.title}
          onClick={() => {
            if (t.label === "🔗") {
              const url = prompt("URL :", "https://");
              if (url) onInsert(t.ins(url));
            } else {
              onInsert(t.ins(""));
            }
          }}
          className="h-7 px-2.5 rounded-md border hairline bg-white/[0.03] text-bone hover:border-gold/40 text-[12px] font-mono">
          {t.label}
        </button>
      ))}
    </div>
  );
}

