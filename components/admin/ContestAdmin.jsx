"use client";

import { useState, useEffect, useCallback } from "react";
import { API_BASE } from "@/lib/site";

const CHANNELS = [
  { id: "-1001175984072", label: "📢 L'Informateurcrypto" },
  { id: "-1002073936792", label: "📣 Julien Club des Informateurs" },
  { id: "-1004262332671", label: "🔒 Pôle Invest VIP" },
];

const DASH_URL = "https://invest.informateurcrypto.fr/dashboard?tab=contest";

function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function fmtPrice(p) {
  if (p == null) return "—";
  return "$" + Number(p).toLocaleString("fr-FR", { maximumFractionDigits: 0 });
}

function StatusBadge({ status, paid }) {
  const cfg = {
    open:     { label: "Ouvert",       cls: "border-gold/40 text-gold" },
    closed:   { label: "Délibération", cls: "border-amber-500/40 text-amber-400" },
    resolved: { label: paid ? "Résolu · Payé ✓" : "Résolu · En attente paiement", cls: paid ? "border-emerald-500/40 text-emerald-400" : "border-rose-500/40 text-rose-400" },
  };
  const c = cfg[status] || cfg.open;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-mono border ${c.cls}`}>
      {c.label}
    </span>
  );
}

export default function ContestAdmin({ adminKey }) {
  const [contests, setContests] = useState(null);
  const [btcPrice, setBtcPrice] = useState(null);
  const [selected, setSelected] = useState(null); // contest id détaillé
  const [view, setView] = useState("list");         // list | create | detail

  // Create form
  const [createForm, setCreateForm] = useState({ date: "", deadline_hm: "19:30", resolve_hm: "21:00", prize_usd: "10" });
  const [createMsg, setCreateMsg] = useState("");
  const [createBusy, setCreateBusy] = useState(false);

  // Resolve
  const [resolvePrice, setResolvePrice] = useState("");
  const [resolveBusy, setResolveBusy] = useState(false);
  const [resolveMsg, setResolveMsg] = useState("");

  // Publish
  const [pubKind, setPubKind] = useState("promo");
  const [pubChannels, setPubChannels] = useState(["-1001175984072", "-1002073936792"]);
  const [pubPhoto, setPubPhoto] = useState("");
  const [pubText, setPubText] = useState("");
  const [pubBtnText, setPubBtnText] = useState("");
  const [pubBtnUrl, setPubBtnUrl] = useState(DASH_URL);
  const [pubBusy, setPubBusy] = useState(false);
  const [pubMsg, setPubMsg] = useState("");
  const [templates, setTemplates] = useState(null);

  const headers = { "x-admin-key": adminKey, "Content-Type": "application/json" };

  const load = useCallback(async () => {
    const r = await fetch(`${API_BASE}/api/admin/contest/list`, { headers: { "x-admin-key": adminKey }, cache: "no-store" });
    const d = await r.json();
    setContests(d.contests || []);
  }, [adminKey]);

  const loadBtc = useCallback(async () => {
    const r = await fetch(`${API_BASE}/api/admin/contest/btc-price`, { headers: { "x-admin-key": adminKey }, cache: "no-store" });
    const d = await r.json();
    if (d.price) setBtcPrice(d.price);
  }, [adminKey]);

  useEffect(() => { load(); loadBtc(); }, [load, loadBtc]);

  const selectedContest = contests?.find((c) => c.id === selected);

  // Charger templates quand on ouvre un concours
  useEffect(() => {
    if (!selected) return;
    fetch(`${API_BASE}/api/admin/contest/template/${selected}`, { headers: { "x-admin-key": adminKey }, cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setTemplates(d);
          // Promo : image fixe + pas de texte par défaut
          setPubPhoto(d.promo.photo || "");
          setPubText("");
          setPubBtnText(d.promo.buttons[0]?.text || "🎯 Participer maintenant →");
          setPubBtnUrl(d.promo.buttons[0]?.url || DASH_URL);
        }
      });
  }, [selected, adminKey]);

  // Sync template text quand kind change
  useEffect(() => {
    if (!templates) return;
    if (pubKind === "promo") {
      setPubPhoto(templates.promo.photo || "");
      setPubText("");
      setPubBtnText(templates.promo.buttons[0]?.text || "🎯 Participer maintenant →");
      setPubBtnUrl(templates.promo.buttons[0]?.url || DASH_URL);
    } else {
      setPubPhoto("");
      setPubText(templates.result.text || "");
      setPubBtnText(templates.result.buttons[0]?.text || "🎯 Prochain concours →");
      setPubBtnUrl(templates.result.buttons[0]?.url || DASH_URL);
    }
  }, [pubKind, templates]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreateBusy(true); setCreateMsg("");
    const r = await fetch(`${API_BASE}/api/admin/contest/create`, {
      method: "POST", headers,
      body: JSON.stringify({
        date: createForm.date || undefined,
        deadline_hm: createForm.deadline_hm,
        resolve_hm: createForm.resolve_hm,
        prize_usd: parseFloat(createForm.prize_usd),
      }),
    });
    const d = await r.json();
    setCreateBusy(false);
    if (d.ok) { setCreateMsg(`✓ Concours du ${d.date} créé (${d.prize_usd}$)`); load(); setView("list"); }
    else setCreateMsg("Erreur : " + (d.error || "inconnue"));
  }

  async function handleResolve(e) {
    e.preventDefault();
    if (!selected) return;
    setResolveBusy(true); setResolveMsg("");
    const price = parseFloat(resolvePrice) || undefined;
    const r = await fetch(`${API_BASE}/api/admin/contest/resolve/${selected}`, {
      method: "POST", headers, body: JSON.stringify({ btc_price: price }),
    });
    const d = await r.json();
    setResolveBusy(false);
    if (d.ok) {
      setResolveMsg(`✓ Résolu — Prix BTC : ${fmtPrice(d.btc_price)} · Gagnant : ${d.winner || "—"} (écart ${d.delta}$)`);
      load();
    } else setResolveMsg("Erreur : " + (d.error || "inconnue"));
  }

  async function handleMarkPaid() {
    if (!selected) return;
    await fetch(`${API_BASE}/api/admin/contest/mark-paid/${selected}`, { method: "POST", headers, body: "{}" });
    load();
  }

  async function handlePublish(e) {
    e.preventDefault();
    if (!selected || pubChannels.length === 0) return;
    setPubBusy(true); setPubMsg("");
    const r = await fetch(`${API_BASE}/api/admin/contest/publish/${selected}`, {
      method: "POST", headers,
      body: JSON.stringify({
        kind: pubKind,
        channels: pubChannels,
        photo: pubPhoto || null,
        text: pubText || null,
        button_text: pubBtnText || null,
        button_url: pubBtnUrl || null,
      }),
    });
    const d = await r.json();
    setPubBusy(false);
    if (d.ok) {
      const ok = d.results.filter((r) => r.ok).length;
      const fail = d.results.length - ok;
      setPubMsg(`✓ Publié sur ${ok}/${d.results.length} canal${ok > 1 ? "ux" : ""}${fail ? ` (${fail} échec)` : ""}`);
    } else setPubMsg("Erreur : " + (d.error || "inconnue"));
  }

  // ─── LIST VIEW ──────────────────────────────────────────────────────────────
  if (view === "list") {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-[22px] text-bone">🎯 Gestion des concours BTC</h2>
            {btcPrice && (
              <p className="text-[12.5px] text-mist/70 mt-0.5">Prix BTC actuel : <span className="text-gold font-semibold">{fmtPrice(btcPrice)}</span></p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={loadBtc} className="btn-ghost rounded-full px-4 py-2 text-[12.5px]">↻ Prix BTC</button>
            <button onClick={() => { setCreateMsg(""); setView("create"); }} className="btn-gold rounded-full px-5 py-2.5 text-[13px] font-semibold">
              + Nouveau concours
            </button>
          </div>
        </div>

        {contests === null ? (
          <div className="text-mist/60 text-[13px]">Chargement…</div>
        ) : contests.length === 0 ? (
          <div className="rounded-2xl border hairline bg-ink-800/40 p-10 text-center">
            <p className="text-[14px] text-mist/60">Aucun concours créé.</p>
            <button onClick={() => setView("create")} className="mt-4 btn-gold rounded-full px-6 py-2.5 text-[13px] font-semibold">
              Créer le premier concours
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {contests.map((c) => (
              <div key={c.id}
                onClick={() => { setSelected(c.id); setResolveMsg(""); setPubMsg(""); setView("detail"); }}
                className="rounded-2xl border hairline bg-ink-800/40 p-5 cursor-pointer hover:border-gold/30 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-[16px] text-bone">📅 {c.date}</span>
                    <StatusBadge status={c.status} paid={c.paid} />
                  </div>
                  <span className="text-[13px] text-mist">{c.participants} participant{c.participants !== 1 ? "s" : ""}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12.5px] text-mist/70">
                  <span>Gain : <span className="text-bone">{fmtPrice(c.prize_usd)}</span></span>
                  <span>Deadline : <span className="text-bone">{fmtDate(c.deadline_ts)}</span></span>
                  {c.winner_name && <span>Gagnant : <span className="text-bone">{c.winner_name}</span></span>}
                  {c.btc_price_at_21h && <span>BTC réel : <span className="text-bone">{fmtPrice(c.btc_price_at_21h)}</span></span>}
                  {c.winner_address && <span className="col-span-2 text-amber-400">Adresse : {c.winner_address}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── CREATE VIEW ────────────────────────────────────────────────────────────
  if (view === "create") {
    return (
      <div className="max-w-lg space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")} className="btn-ghost rounded-full px-3 py-1.5 text-[12.5px]">← Retour</button>
          <h2 className="font-display text-[20px] text-bone">Nouveau concours</h2>
        </div>
        <form onSubmit={handleCreate} className="rounded-2xl border hairline bg-ink-800/40 p-6 space-y-4">
          <div>
            <label className="block text-[12px] text-mist/70 mb-1.5 uppercase tracking-widest font-mono">Date (laisser vide = aujourd'hui Paris)</label>
            <input type="date" value={createForm.date} onChange={(e) => setCreateForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full rounded-xl border hairline bg-ink-900 px-4 py-2.5 text-bone text-[13px] focus:outline-none focus:border-gold/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-mist/70 mb-1.5 uppercase tracking-widest font-mono">Deadline (heure Paris)</label>
              <input type="time" value={createForm.deadline_hm} onChange={(e) => setCreateForm((f) => ({ ...f, deadline_hm: e.target.value }))}
                className="w-full rounded-xl border hairline bg-ink-900 px-4 py-2.5 text-bone text-[13px] focus:outline-none focus:border-gold/50" />
            </div>
            <div>
              <label className="block text-[12px] text-mist/70 mb-1.5 uppercase tracking-widest font-mono">Résolution (heure Paris)</label>
              <input type="time" value={createForm.resolve_hm} onChange={(e) => setCreateForm((f) => ({ ...f, resolve_hm: e.target.value }))}
                className="w-full rounded-xl border hairline bg-ink-900 px-4 py-2.5 text-bone text-[13px] focus:outline-none focus:border-gold/50" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] text-mist/70 mb-1.5 uppercase tracking-widest font-mono">Montant à gagner ($)</label>
            <input type="number" min="1" step="1" value={createForm.prize_usd}
              onChange={(e) => setCreateForm((f) => ({ ...f, prize_usd: e.target.value }))}
              className="w-full rounded-xl border hairline bg-ink-900 px-4 py-2.5 text-bone text-[13px] focus:outline-none focus:border-gold/50" />
          </div>
          {createMsg && <p className={`text-[12.5px] ${createMsg.startsWith("✓") ? "text-emerald-400" : "text-rose-400"}`}>{createMsg}</p>}
          <button type="submit" disabled={createBusy}
            className="btn-gold w-full rounded-full py-3 text-[14px] font-semibold">
            {createBusy ? "Création…" : "Créer le concours"}
          </button>
        </form>
      </div>
    );
  }

  // ─── DETAIL VIEW ────────────────────────────────────────────────────────────
  if (view === "detail" && selectedContest) {
    const c = selectedContest;
    const isResolved = c.status === "resolved";
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => { setView("list"); setSelected(null); }} className="btn-ghost rounded-full px-3 py-1.5 text-[12.5px]">← Retour</button>
          <h2 className="font-display text-[20px] text-bone">📅 Concours du {c.date}</h2>
          <StatusBadge status={c.status} paid={c.paid} />
          {btcPrice && <span className="text-[12px] text-mist/60">BTC live : <span className="text-gold font-semibold">{fmtPrice(btcPrice)}</span></span>}
        </div>

        <div className="grid sm:grid-cols-4 gap-3">
          {[
            { label: "Gain", value: fmtPrice(c.prize_usd) },
            { label: "Participants", value: c.participants },
            { label: "Deadline", value: fmtDate(c.deadline_ts) },
            { label: "Résolution", value: fmtDate(c.resolve_ts) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border hairline bg-ink-800/50 p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60">{label}</div>
              <div className="font-display text-[18px] text-bone mt-1">{value}</div>
            </div>
          ))}
        </div>

        {/* Gagnant */}
        {isResolved && (
          <div className={`rounded-2xl border p-5 ${c.paid ? "border-emerald-500/30 bg-emerald-500/5" : "border-gold/30 bg-gold/5"}`}>
            <div className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80 mb-2">Résultat</div>
            <div className="grid sm:grid-cols-3 gap-4 text-[13px]">
              <div><span className="text-mist/60">Prix BTC réel :</span> <span className="text-bone font-semibold">{fmtPrice(c.btc_price_at_21h)}</span></div>
              <div><span className="text-mist/60">Gagnant :</span> <span className="text-bone font-semibold">🥇 {c.winner_name || "—"}</span></div>
              <div><span className="text-mist/60">Adresse crypto :</span> {c.winner_address
                ? <span className="font-mono text-[11.5px] text-amber-300 break-all">{c.winner_address}</span>
                : <span className="text-mist/40 italic">En attente du gagnant…</span>}
              </div>
            </div>
            {!c.paid && c.winner_address && (
              <button onClick={handleMarkPaid} className="mt-4 btn-gold rounded-full px-5 py-2 text-[13px] font-semibold">
                ✓ Marquer comme payé
              </button>
            )}
            {c.paid && <p className="mt-3 text-[12.5px] text-emerald-400 font-semibold">✅ Paiement effectué</p>}
          </div>
        )}

        {/* Résolution */}
        {!isResolved && (
          <div className="rounded-2xl border hairline bg-ink-800/40 p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70 mb-3">Résoudre le concours</div>
            <form onSubmit={handleResolve} className="flex gap-2 flex-wrap items-center">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mist/60 text-[13px]">$</span>
                <input type="number" step="1" value={resolvePrice} onChange={(e) => setResolvePrice(e.target.value)}
                  placeholder={btcPrice ? String(Math.round(btcPrice)) : "Prix BTC à 21h"}
                  className="rounded-xl border hairline bg-ink-900 pl-7 pr-4 py-2.5 text-bone text-[13px] w-44 focus:outline-none focus:border-gold/50" />
              </div>
              <button type="submit" disabled={resolveBusy}
                className="btn-gold rounded-full px-5 py-2.5 text-[13px] font-semibold">
                {resolveBusy ? "Résolution…" : resolvePrice ? "Résoudre avec ce prix" : "Résoudre auto (CoinGecko)"}
              </button>
            </form>
            {resolveMsg && <p className={`mt-2 text-[12.5px] ${resolveMsg.startsWith("✓") ? "text-emerald-400" : "text-rose-400"}`}>{resolveMsg}</p>}
          </div>
        )}

        {/* Publish */}
        <div className="rounded-2xl border hairline bg-ink-800/40 p-5 space-y-4">
          <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Publication Telegram</div>

          {/* Type */}
          <div className="flex gap-2">
            {[{ k: "promo", label: "📣 Promo (avant)" }, { k: "result", label: "🏆 Résultat (après)" }].map(({ k, label }) => (
              <button key={k} onClick={() => setPubKind(k)}
                className={`rounded-xl px-4 py-2 text-[13px] border transition-colors ${pubKind === k ? "border-gold/50 text-gold bg-gold/[0.07]" : "border-white/10 text-mist hover:text-bone"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Channels */}
          <div>
            <p className="text-[12px] text-mist/60 mb-2">Canaux de destination</p>
            <div className="space-y-1.5">
              {CHANNELS.map((ch) => (
                <label key={ch.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" checked={pubChannels.includes(ch.id)}
                    onChange={(e) => setPubChannels((prev) => e.target.checked ? [...prev, ch.id] : prev.filter((id) => id !== ch.id))}
                    className="rounded" />
                  <span className={`text-[13px] ${pubChannels.includes(ch.id) ? "text-bone" : "text-mist/60"}`}>{ch.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Photo / aperçu */}
          <div className="space-y-2">
            <label className="block text-[12px] text-mist/60">URL photo</label>
            {pubPhoto && (
              <div className="rounded-xl overflow-hidden border border-white/10">
                <img src={pubPhoto} alt="aperçu" className="w-full max-h-48 object-cover" />
              </div>
            )}
            <input value={pubPhoto} onChange={(e) => setPubPhoto(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border hairline bg-ink-900 px-4 py-2.5 text-[13px] text-bone placeholder-mist/40 focus:outline-none focus:border-gold/50" />
          </div>

          {/* Texte */}
          <div>
            <label className="block text-[12px] text-mist/60 mb-1">Texte du post (HTML Telegram)</label>
            <textarea rows={8} value={pubText} onChange={(e) => setPubText(e.target.value)}
              className="w-full rounded-xl border hairline bg-ink-900 px-4 py-2.5 text-[12.5px] text-bone font-mono resize-y focus:outline-none focus:border-gold/50" />
          </div>

          {/* Bouton inline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-mist/60 mb-1">Texte du bouton</label>
              <input value={pubBtnText} onChange={(e) => setPubBtnText(e.target.value)}
                className="w-full rounded-xl border hairline bg-ink-900 px-4 py-2.5 text-[13px] text-bone focus:outline-none focus:border-gold/50" />
            </div>
            <div>
              <label className="block text-[12px] text-mist/60 mb-1">URL du bouton</label>
              <input value={pubBtnUrl} onChange={(e) => setPubBtnUrl(e.target.value)}
                className="w-full rounded-xl border hairline bg-ink-900 px-4 py-2.5 text-[13px] text-bone focus:outline-none focus:border-gold/50" />
            </div>
          </div>

          <button onClick={handlePublish} disabled={pubBusy || pubChannels.length === 0}
            className="btn-gold w-full rounded-full py-3 text-[14px] font-semibold disabled:opacity-50">
            {pubBusy ? "Publication…" : `Publier sur ${pubChannels.length} canal${pubChannels.length > 1 ? "ux" : ""}`}
          </button>
          {pubMsg && <p className={`text-[12.5px] ${pubMsg.startsWith("✓") ? "text-emerald-400" : "text-rose-400"}`}>{pubMsg}</p>}
        </div>

        {/* Classement */}
        <div className="rounded-2xl border hairline bg-ink-800/40 overflow-hidden">
          <div className="px-5 py-3 border-b hairline flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Classement des prédictions</span>
            <span className="text-[12px] text-mist/50">{c.participants} participant{c.participants !== 1 ? "s" : ""}</span>
          </div>
          {c.predictions.length === 0 ? (
            <div className="px-5 py-6 text-[13px] text-mist/50">Aucune prédiction.</div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {[...c.predictions]
                .sort((a, b) => isResolved ? (a.delta ?? 9e9) - (b.delta ?? 9e9) : a.submitted_at - b.submitted_at)
                .map((p, i) => (
                  <div key={p.id} className={`px-5 py-3 flex items-center gap-3 ${c.winner_name === p.display_name && isResolved ? "bg-emerald-500/[0.05]" : ""}`}>
                    <span className="font-mono text-[11px] text-mist/40 w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[13.5px] text-bone font-medium">{p.display_name}</span>
                      {c.winner_name === p.display_name && isResolved && (
                        <span className="ml-2 text-[11px] text-emerald-400">🥇 Gagnant</span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display text-[14px] text-bone">{fmtPrice(p.predicted_price)}</div>
                      {p.delta != null && (
                        <div className="text-[11px] text-mist/50">écart {fmtPrice(p.delta)}</div>
                      )}
                    </div>
                    <div className="text-[11px] text-mist/40 w-16 text-right">
                      {new Date(p.submitted_at * 1000).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
