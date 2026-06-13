"use client";

import { useState, useEffect, useCallback } from "react";
import { API_BASE } from "@/lib/site";

function fmtTs(ts) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}
function relNow(ts) {
  if (!ts) return null;
  const s = Math.floor((Date.now() / 1000) - ts);
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  return `il y a ${Math.floor(s / 86400)} j`;
}

const STEPS = [
  { id: "iiban_pending_j1",     label: "J+1",   tg_trigger: "iiban_pending_j1" },
  { id: "iiban_pending_j3",     label: "J+3",   tg_trigger: "iiban_pending_j3" },
  { id: "iiban_pending_j7",     label: "J+7",   tg_trigger: "iiban_pending_j7" },
  { id: "iiban_pending_weekly", label: "Hebdo", tg_trigger: "iiban_pending_weekly" },
];

export default function IibanPendingAdmin({ adminKey }) {
  const [queue, setQueue]   = useState([]);
  const [loading, setLoad]  = useState(false);
  const [tab, setTab]       = useState("queue"); // queue | tg | mail

  // TG triggers state
  const [tgTriggers, setTgTriggers]   = useState([]);
  const [tgTemplates, setTgTemplates] = useState([]);
  // Mail automations state
  const [mailAutos, setMailAutos]     = useState([]);
  const [mailTemplates, setMailTemplates] = useState([]);

  const get = useCallback(async (path) => {
    const r = await fetch(`${API_BASE}${path}`, { headers: { "x-admin-key": adminKey }, cache: "no-store" });
    return r.json();
  }, [adminKey]);

  const post = useCallback(async (path, body) => {
    const r = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "x-admin-key": adminKey, "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    return r.json();
  }, [adminKey]);

  const loadQueue = useCallback(async () => {
    setLoad(true);
    const d = await get("/api/admin/iiban-pending/queue");
    if (d.ok) setQueue(d.queue || []);
    setLoad(false);
  }, [get]);

  const loadTg = useCallback(async () => {
    const [t, tmpl] = await Promise.all([
      get("/api/admin/tg/triggers"),
      get("/api/admin/tg/templates"),
    ]);
    setTgTriggers(t.triggers || []);
    setTgTemplates(tmpl.templates || []);
  }, [get]);

  const loadMail = useCallback(async () => {
    const [a, tmpl] = await Promise.all([
      get("/api/admin/mail/automations"),
      get("/api/admin/mail/templates"),
    ]);
    setMailAutos(a.automations || []);
    setMailTemplates(tmpl.templates || []);
  }, [get]);

  useEffect(() => { loadQueue(); }, [loadQueue]);
  useEffect(() => {
    if (tab === "tg")   loadTg();
    if (tab === "mail") loadMail();
  }, [tab, loadTg, loadMail]);

  async function disable(email) {
    await post("/api/admin/iiban-pending/disable", { email });
    loadQueue();
  }
  async function reset(email) {
    await post("/api/admin/iiban-pending/reset", { email });
    loadQueue();
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-[20px] text-bone">Relances IIBAN Pending</h2>
        <p className="text-[12.5px] text-mist/60 mt-1">
          Utilisateurs ayant saisi un IIBAN valide mais sans dépôt/first trade confirmé.
          Relances automatiques à J+1, J+3, J+7, puis toutes les semaines.
        </p>
      </div>

      {/* Schedule visuel */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {STEPS.map((s) => (
          <div key={s.id} className="rounded-xl border hairline bg-ink-800/50 p-3 text-center">
            <div className="font-display text-[18px] text-gold">{s.label}</div>
            <div className="text-[10.5px] text-mist/60 mt-1">TG + Email</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 border-b hairline pb-3">
        {[
          { id: "queue", label: "📋 File d'attente" },
          { id: "tg",    label: "📨 Templates TG" },
          { id: "mail",  label: "📧 Templates Email" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-[13px] transition-colors ${
              tab === t.id ? "bg-gold/[0.10] text-bone border gold-line" : "text-mist hover:text-bone border border-transparent"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* File d'attente */}
      {tab === "queue" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-mist/70">{queue.filter(q => q.active).length} actifs · {queue.length} total</span>
            <button onClick={loadQueue} className="btn-ghost rounded-full px-3 py-1.5 text-[12px]">↻ Rafraîchir</button>
          </div>
          {loading && <div className="text-center text-[13px] text-mist/50 py-8">Chargement…</div>}
          {!loading && queue.length === 0 && (
            <div className="text-center text-[13px] text-mist/50 py-8">Aucun utilisateur en attente.</div>
          )}
          <div className="space-y-2">
            {queue.map((u) => (
              <div key={u.email}
                className={`rounded-2xl border p-4 flex flex-wrap items-center gap-3 ${
                  u.active ? "hairline bg-ink-800/40" : "border-white/5 bg-ink-900/30 opacity-50"
                }`}>
                {/* Identité */}
                <div className="flex-1 min-w-[180px]">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-bone text-[13.5px]">{u.name}</span>
                    {u.active
                      ? <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">Actif</span>
                      : <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded-full bg-white/5 text-mist/40 border border-white/10">Désactivé</span>
                    }
                  </div>
                  <div className="text-[11px] text-mist/50">{u.email}</div>
                  {u.uid && <div className="text-[10.5px] font-mono text-mist/60 mt-0.5">IIBAN : {u.uid}</div>}
                  {u.tg_id && <div className="text-[10.5px] font-mono text-mist/60">TG : {u.tg_id}</div>}
                </div>

                {/* Timing */}
                <div className="text-[11.5px] text-mist/70 space-y-0.5 shrink-0">
                  <div>Depuis : <span className="text-bone">{relNow(u.pending_since)}</span></div>
                  <div>Envois : <span className="text-bone">{u.send_count}</span></div>
                  {u.last_sent > 0 && <div>Dernier : <span className="text-bone">{fmtTs(u.last_sent)}</span></div>}
                </div>

                {/* Prochain envoi */}
                <div className="shrink-0">
                  {u.active && (
                    <div className={`rounded-lg border px-2.5 py-1.5 text-center text-[11px] ${
                      u.overdue
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                        : "border-white/10 bg-white/5 text-mist/70"
                    }`}>
                      <div className="font-mono text-[9.5px] uppercase tracking-widest2 mb-0.5">Prochain</div>
                      <div className="font-semibold">{u.next_label}</div>
                      <div className="text-[10px] mt-0.5">{fmtTs(u.next_send_ts)}</div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  {u.active && (
                    <button onClick={() => disable(u.email)}
                      className="text-[11.5px] text-rose-400/70 hover:text-rose-400 transition-colors">
                      Désactiver
                    </button>
                  )}
                  <button onClick={() => reset(u.email)}
                    className="text-[11.5px] text-mist/60 hover:text-bone transition-colors">
                    Reset
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates TG */}
      {tab === "tg" && (
        <TgStepConfig
          steps={STEPS}
          triggers={tgTriggers}
          templates={tgTemplates}
          adminKey={adminKey}
          onReload={loadTg}
          get={get}
          post={post}
        />
      )}

      {/* Templates Mail */}
      {tab === "mail" && (
        <MailStepConfig
          steps={STEPS}
          automations={mailAutos}
          templates={mailTemplates}
          adminKey={adminKey}
          onReload={loadMail}
          get={get}
          post={post}
        />
      )}
    </div>
  );
}

/* ── TG step config ─────────────────────────────────────────────────────────── */
function TgStepConfig({ steps, triggers, templates, adminKey, onReload, get, post }) {
  const [editing, setEditing] = useState(null); // trigger_id en cours d'édition
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");

  function openEdit(step) {
    const existing = triggers.find((t) => t.trigger_id === step.tg_trigger);
    setForm({
      id:           existing?.id || null,
      name:         existing?.name || `Relance IIBAN ${step.label}`,
      trigger_id:   step.tg_trigger,
      template_id:  existing?.template_id || "",
      audience:     "user",
      enabled:      existing?.enabled ?? 1,
    });
    setEditing(step.tg_trigger);
    setMsg("");
  }

  async function save() {
    setSaving(true); setMsg("");
    const r = await post("/api/admin/tg/triggers", form);
    setSaving(false);
    if (r.ok) { setMsg("Enregistré ✓"); onReload(); setEditing(null); }
    else setMsg("Erreur : " + (r.error || "?"));
  }

  const tplOptions = [{ id: "", name: "— Choisir un template —" }, ...templates];

  return (
    <div className="space-y-4">
      {steps.map((step) => {
        const trig = triggers.find((t) => t.trigger_id === step.tg_trigger);
        const tmpl = templates.find((t) => t.id === trig?.template_id);
        const isEditing = editing === step.tg_trigger;

        return (
          <div key={step.id} className="rounded-2xl border hairline bg-ink-800/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-display text-[15px] text-bone">Relance {step.label}</span>
                <span className="ml-2 text-[10.5px] font-mono text-mist/50">{step.tg_trigger}</span>
              </div>
              <div className="flex items-center gap-2">
                {trig && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    trig.enabled ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-mist/40 bg-white/5"
                  }`}>
                    {trig.enabled ? "Actif" : "Désactivé"}
                  </span>
                )}
                {!trig && <span className="text-[10px] text-mist/40">Non configuré</span>}
                <button onClick={() => isEditing ? setEditing(null) : openEdit(step)}
                  className="btn-ghost rounded-xl px-3 py-1.5 text-[12px]">
                  {isEditing ? "Annuler" : (trig ? "Modifier" : "Configurer")}
                </button>
              </div>
            </div>

            {!isEditing && tmpl && (
              <div className="text-[12.5px] text-mist/70 bg-ink-900/60 rounded-xl p-3">
                <span className="font-mono text-[10px] text-mist/40 uppercase tracking-widest2">Template : </span>
                <span className="text-bone">{tmpl.name}</span>
                {tmpl.text && <p className="mt-1.5 text-[12px] text-mist/60 line-clamp-2 whitespace-pre-wrap">{tmpl.text}</p>}
              </div>
            )}

            {isEditing && (
              <div className="space-y-3 mt-2">
                <div>
                  <label className="block text-[11px] text-mist/60 mb-1">Template TG</label>
                  <select
                    value={form.template_id}
                    onChange={(e) => setForm((f) => ({ ...f, template_id: Number(e.target.value) || "" }))}
                    className="w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-3 py-2.5 text-bone text-[13px] outline-none"
                  >
                    {tplOptions.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <p className="text-[10.5px] text-mist/40 mt-1">Créez d'abord le template dans l'onglet "📨 Posts Telegram" → Templates.</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-[13px] text-mist cursor-pointer">
                    <input type="checkbox" checked={!!form.enabled}
                      onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked ? 1 : 0 }))}
                      className="rounded accent-gold" />
                    Activer ce trigger
                  </label>
                </div>
                {msg && <p className="text-[12.5px] text-emerald-400">{msg}</p>}
                <button onClick={save} disabled={saving || !form.template_id}
                  className="btn-gold rounded-xl px-5 py-2.5 text-[13px] font-semibold disabled:opacity-50">
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Mail step config ───────────────────────────────────────────────────────── */
function MailStepConfig({ steps, automations, templates, adminKey, onReload, get, post }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");

  function openEdit(step) {
    const existing = automations.find((a) => a.trigger === step.id);
    setForm({
      trigger:     step.id,
      template_id: existing?.template_id || "",
      audience:    "individuel",
      delay_min:   0,
      enabled:     existing?.enabled ?? 1,
    });
    setEditing(step.id);
    setMsg("");
  }

  async function save() {
    setSaving(true); setMsg("");
    const r = await post("/api/admin/mail/automations", form);
    setSaving(false);
    if (r.ok) { setMsg("Enregistré ✓"); onReload(); setEditing(null); }
    else setMsg("Erreur : " + (r.error || "?"));
  }

  const tplOptions = [{ id: "", name: "— Choisir un template —" }, ...templates];

  return (
    <div className="space-y-4">
      {steps.map((step) => {
        const auto = automations.find((a) => a.trigger === step.id);
        const tmpl = templates.find((t) => t.id === auto?.template_id);
        const isEditing = editing === step.id;

        return (
          <div key={step.id} className="rounded-2xl border hairline bg-ink-800/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-display text-[15px] text-bone">Email relance {step.label}</span>
                <span className="ml-2 text-[10.5px] font-mono text-mist/50">{step.id}</span>
              </div>
              <div className="flex items-center gap-2">
                {auto && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    auto.enabled ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-mist/40 bg-white/5"
                  }`}>
                    {auto.enabled ? "Actif" : "Désactivé"}
                  </span>
                )}
                {!auto && <span className="text-[10px] text-mist/40">Non configuré</span>}
                <button onClick={() => isEditing ? setEditing(null) : openEdit(step)}
                  className="btn-ghost rounded-xl px-3 py-1.5 text-[12px]">
                  {isEditing ? "Annuler" : (auto ? "Modifier" : "Configurer")}
                </button>
              </div>
            </div>

            {!isEditing && tmpl && (
              <div className="text-[12.5px] text-mist/70 bg-ink-900/60 rounded-xl p-3">
                <span className="font-mono text-[10px] text-mist/40 uppercase tracking-widest2">Template : </span>
                <span className="text-bone">{tmpl.name}</span>
                {tmpl.subject && <p className="mt-0.5 text-[11.5px] text-mist/60">Objet : {tmpl.subject}</p>}
              </div>
            )}

            {isEditing && (
              <div className="space-y-3 mt-2">
                <div>
                  <label className="block text-[11px] text-mist/60 mb-1">Template email</label>
                  <select
                    value={form.template_id}
                    onChange={(e) => setForm((f) => ({ ...f, template_id: Number(e.target.value) || "" }))}
                    className="w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-3 py-2.5 text-bone text-[13px] outline-none"
                  >
                    {tplOptions.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <p className="text-[10.5px] text-mist/40 mt-1">Créez d'abord le template dans l'onglet "📧 Emails" → Templates.</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-[13px] text-mist cursor-pointer">
                    <input type="checkbox" checked={!!form.enabled}
                      onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked ? 1 : 0 }))}
                      className="rounded accent-gold" />
                    Activer cette automatisation
                  </label>
                </div>
                {msg && <p className="text-[12.5px] text-emerald-400">{msg}</p>}
                <button onClick={save} disabled={saving || !form.template_id}
                  className="btn-gold rounded-xl px-5 py-2.5 text-[13px] font-semibold disabled:opacity-50">
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
