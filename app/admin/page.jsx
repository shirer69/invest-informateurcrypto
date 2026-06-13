"use client";

import { useEffect, useState, useCallback } from "react";
import { API_BASE } from "@/lib/site";
import TgPosts from "@/components/admin/TgPosts";
import EmailAdmin from "@/components/admin/EmailAdmin";
import SupportAdmin from "@/components/admin/SupportAdmin";
import IibanPendingAdmin from "@/components/admin/IibanPendingAdmin";
import MoonXAdmin from "@/components/admin/MoonXAdmin";

const KEYK = "pi_admin_key";

function fmtDate(unixSec) {
  if (!unixSec) return "—";
  try {
    return new Date(unixSec * 1000).toLocaleString("fr-FR", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}
function relFromMs(ms) {
  if (!ms) return "—";
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  return `il y a ${Math.floor(s / 86400)} j`;
}

async function adminGet(path, key) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { "x-admin-key": key }, cache: "no-store" });
  if (res.status === 401) return { _unauth: true };
  return res.json();
}

async function adminPost(path, key, body) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "x-admin-key": key, "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    return await res.json();
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

const TABS = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "members",  label: "Membres (CRM)" },
  { id: "deposits", label: "Dépôts & activation" },
  { id: "codes",    label: "Codes d'invitation" },
  { id: "posts",    label: "📨 Posts Telegram" },
  { id: "emails",   label: "📧 Emails" },
  { id: "copy",     label: "Copy Auto" },
  { id: "support",  label: "💬 Support" },
  { id: "iiban_pending", label: "⏳ IIBAN Pending" },
  { id: "moonx",        label: "🌙 MoonX" },
  { id: "trades_safe",  label: "📊 Trades Safe" },
];

export default function Admin() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("overview");

  const [ov, setOv] = useState(null);
  const [members, setMembers] = useState(null);
  const [iiban, setIiban] = useState(null);
  const [revenue, setRevenue] = useState(null);

  const loadAll = useCallback(async (k) => {
    const [o, m, l, rev] = await Promise.all([
      adminGet("/api/admin/overview", k),
      adminGet("/api/admin/members", k),
      adminGet("/api/admin/list?key=" + encodeURIComponent(k), k),
      adminGet("/api/admin/revenue", k),
    ]);
    setOv(o); setMembers(m?.members || []); setIiban(l?.items || []);
    if (rev?.ok) setRevenue(rev);
  }, []);

  useEffect(() => {
    const k = typeof window !== "undefined" ? sessionStorage.getItem(KEYK) : null;
    if (k) { setKey(k); setAuthed(true); loadAll(k); }
  }, [loadAll]);

  async function login(e) {
    e.preventDefault();
    setErr("");
    const o = await adminGet("/api/admin/overview", pw);
    if (o && !o._unauth && o.members !== undefined) {
      sessionStorage.setItem(KEYK, pw);
      setKey(pw); setAuthed(true); loadAll(pw);
    } else {
      setErr("Mot de passe administrateur incorrect.");
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen grid place-items-center px-4 aura">
        <form onSubmit={login} className="w-full max-w-sm rounded-3xl border gold-line glass p-7">
          <span className="eyebrow">Administration</span>
          <h1 className="mt-3 font-display text-[24px] text-bone">Console Pôle Invest</h1>
          <p className="mt-2 text-[13px] text-mist">Accès réservé. Saisissez le mot de passe administrateur.</p>
          <input
            type="password" autoFocus value={pw}
            onChange={(e) => { setPw(e.target.value); setErr(""); }}
            placeholder="Mot de passe"
            className="mt-5 w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-bone placeholder:text-mist/40 outline-none"
          />
          {err && <p className="mt-2 text-[12.5px] text-red-400/90">{err}</p>}
          <button className="btn-gold mt-4 w-full rounded-full px-6 py-3.5 text-[15px] font-semibold">
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen aura">
      <header className="sticky top-0 z-40 glass border-b hairline">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center h-9 w-9 rounded-[10px] border gold-line text-gold font-display text-[13px]">CI</span>
            <span className="leading-tight">
              <span className="block font-display text-[15px] text-bone">Console Admin</span>
              <span className="block font-mono text-[9.5px] uppercase tracking-widest2 text-gold/80">Pôle Invest</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {revenue && (
              <div className="hidden sm:flex items-center gap-3 text-right">
                <div className="text-right leading-tight">
                  <div className="font-mono text-[11px] text-mist/60 uppercase tracking-widest">Revenus estimés</div>
                  <div className="font-display text-[18px] text-gold font-semibold">
                    {revenue.total_usd.toLocaleString("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div className="text-right leading-tight border-l hairline pl-3">
                  <div className="font-mono text-[10px] text-mist/50 uppercase">Kraken ({revenue.active_members} membres)</div>
                  <div className="text-[13px] text-bone">{revenue.kraken_usd.toLocaleString("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
                  <div className="font-mono text-[10px] text-mist/50 uppercase mt-0.5">MoonX next payment</div>
                  <div className="text-[13px] text-bone">{revenue.moonx_usd.toLocaleString("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
                </div>
              </div>
            )}
            <button onClick={() => loadAll(key)} className="btn-ghost rounded-full px-4 py-2 text-[12.5px]">↻ Rafraîchir</button>
            <button onClick={() => { sessionStorage.removeItem(KEYK); setAuthed(false); }}
                    className="btn-ghost rounded-full px-4 py-2 text-[12.5px]">Quitter</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-5 py-6">
        <nav className="flex gap-1.5 overflow-x-auto pb-3 flex-wrap">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-2.5 text-[14px] whitespace-nowrap transition-colors ${
                tab === t.id ? "bg-gold/[0.10] text-bone border gold-line" : "text-mist hover:text-bone border border-transparent"
              }`}>
              {t.label}
            </button>
          ))}
        </nav>

        {tab === "overview"  && <Overview ov={ov} members={members} />}
        {tab === "members"   && <Members members={members} adminKey={key} />}
        {tab === "deposits"  && <Deposits iiban={iiban} ov={ov} adminKey={key} onReload={() => loadAll(key)} />}
        {tab === "codes"     && <Codes adminKey={key} />}
        {tab === "posts"     && <TgPosts adminKey={key} />}
        {tab === "emails"    && <EmailAdmin adminKey={key} />}
        {tab === "copy"      && <CopyAuto adminKey={key} />}
        {tab === "support"      && <SupportAdmin adminKey={key} />}
        {tab === "iiban_pending" && <IibanPendingAdmin adminKey={key} />}
        {tab === "moonx"         && <MoonXAdmin adminKey={key} />}
        {tab === "trades_safe"   && <TradesSafe adminKey={key} />}
      </div>
    </div>
  );
}

function KPI({ label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">{label}</div>
      <div className={`mt-2 font-display text-[28px] ${accent || "text-bone"}`}>{value}</div>
      {sub && <div className="mt-0.5 text-[12px] text-mist">{sub}</div>}
    </div>
  );
}

function Overview({ ov, members }) {
  const [filter, setFilter] = useState("all");
  if (!ov) return <div className="text-mist text-[14px]">Chargement…</div>;
  const filterFn = CRM_FILTERS.find((f) => f.id === filter)?.fn ?? (() => true);
  const visible = (members || []).filter(filterFn);
  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPI label="Membres" value={ov.members} sub={`+${ov.new24h} / 24h`} accent="text-gold-grad" />
        <KPI label="Via Telegram" value={ov.telegram} sub={`${ov.web} via web`} />
        <KPI label="Dépôts actifs" value={ov.iiban_active} sub={`${ov.iiban_pending} en attente`} accent="text-pos" />
        <KPI label="En attente d'activation" value={ov.iiban_pending} accent="text-flag" />
        <KPI label="Messages chat" value={ov.messages} />
        <KPI label="Academy démarrée" value={ov.academy} />
        <KPI label="UID suivis" value={ov.iiban_total} sub="dans la liste" />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {CRM_FILTERS.map((f) => {
          const count = (members || []).filter(f.fn).length;
          const on = filter === f.id;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-semibold border transition-colors ${
                on ? "bg-gold/[0.12] border-gold/50 text-gold" : "border-white/10 text-mist hover:text-bone"
              }`}>
              {f.label}
              <span className={`font-mono text-[11px] rounded-full px-1.5 py-0 ${on ? "bg-gold/20 text-gold" : "bg-white/5 text-mist/60"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border hairline bg-ink-800/40 overflow-x-auto">
        <table className="w-full min-w-[860px] text-[13.5px]">
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest2 text-mist/60 border-b hairline">
              <th className="px-5 py-3">Membre</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Inscription</th>
              <th className="px-5 py-3">Dépôt</th>
              <th className="px-5 py-3">Accès</th>
              <th className="px-5 py-3">Dernière activité</th>
            </tr>
          </thead>
          <tbody>
            {!members && (
              <tr><td colSpan={7} className="px-5 py-6 text-mist/50 text-center text-[13px]">Chargement…</td></tr>
            )}
            {members && visible.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-6 text-mist/50 text-center text-[13px]">Aucun membre dans ce segment.</td></tr>
            )}
            {visible.map((m) => (
              <tr key={m.email} className="border-b hairline last:border-0">
                <td className="px-5 py-3">
                  <div className="text-bone">{m.name || "—"}</div>
                  {m.tg_id && <div className="font-mono text-[10px] text-mist/50">tg:{m.tg_id}</div>}
                </td>
                <td className="px-5 py-3 font-mono text-[12px] text-mist">{m.email}</td>
                <td className="px-5 py-3">
                  <span className={`font-mono text-[10px] uppercase tracking-widest2 rounded px-1.5 py-0.5 border ${m.source === "telegram" ? "text-info border-info/30" : "text-gold border-gold/30"}`}>
                    {m.source}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-mist">{fmtDate(m.created_at)}</td>
                <td className="px-5 py-3">
                  {m.deposit === "active" ? <span className="text-pos">✓ actif</span>
                    : m.deposit === "pending" ? <span className="text-flag">en attente</span>
                    : <span className="text-mist/50">—</span>}
                </td>
                <td className="px-5 py-3">{m.has_access ? <span className="text-pos">ouvert</span> : <span className="text-mist/50">verrouillé</span>}</td>
                <td className="px-5 py-3 font-mono text-mist">{relFromMs(m.last_active)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SendCodesPanel({ adminKey, reachable }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [confirm, setConfirm] = useState(false);

  async function send() {
    setBusy(true); setMsg(null); setConfirm(false);
    const d = await adminPost("/api/admin/send-access-codes", adminKey, {});
    setBusy(false);
    if (d && d.ok) {
      setMsg({ ok: true, text: `${d.sent}/${d.eligible} code(s) envoyé(s)${d.failed ? ` · ${d.failed} échec(s)` : ""}.` });
    } else {
      setMsg({ ok: false, text: d?.error || "Envoi impossible." });
    }
  }

  return (
    <div className="rounded-2xl border gold-line bg-gold/[0.04] p-5 mb-5">
      <div className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80 mb-1">
        Codes d'accès 3 mois offert (mini-app)
      </div>
      <p className="text-[12.5px] leading-relaxed text-mist mb-3">
        Génère un <b>code unique aléatoire</b> (usage unique, 3 mois) et l'envoie via le bot Telegram
        à <b>chaque utilisateur mini-app qui n'en a jamais reçu</b>. Aucun double envoi.
      </p>
      {!confirm ? (
        <button onClick={() => setConfirm(true)} disabled={busy}
          className="btn-gold rounded-full px-6 py-2.5 text-[13.5px] font-semibold disabled:opacity-60">
          Envoyer les codes
        </button>
      ) : (
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[13px] text-bone">Confirmer l'envoi aux utilisateurs mini-app ?</span>
          <button onClick={send} disabled={busy}
            className="btn-gold rounded-full px-5 py-2.5 text-[13px] font-semibold disabled:opacity-60">
            {busy ? "Envoi…" : "Oui, envoyer"}
          </button>
          <button onClick={() => setConfirm(false)} className="btn-ghost rounded-full px-5 py-2.5 text-[13px]">Annuler</button>
        </div>
      )}
      {msg && <span className={`mt-3 block text-[12.5px] ${msg.ok ? "text-pos" : "text-flag"}`}>{msg.text}</span>}
    </div>
  );
}

const CRM_FILTERS = [
  { id: "all",     label: "Tous",              fn: () => true },
  { id: "active",  label: "✓ Actifs",          fn: (m) => m.has_access },
  { id: "pending", label: "⏳ Dépôt en attente", fn: (m) => m.uid && m.deposit === "pending" },
  { id: "signed",  label: "Inscrits",           fn: (m) => !m.has_access && !m.uid },
];

function Members({ members, adminKey }) {
  const [filter, setFilter] = useState("all");
  if (!members) return <div className="text-mist text-[14px]">Chargement…</div>;
  const filterFn = CRM_FILTERS.find((f) => f.id === filter)?.fn ?? (() => true);
  const visible = members.filter(filterFn);
  const reachable = visible.filter((m) => m.tg_id).length;
  return (
    <div>
      <BroadcastPanel adminKey={adminKey} reachable={members.filter((m) => m.tg_id).length} total={members.length} />

      {/* Onglets filtre */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CRM_FILTERS.map((f) => {
          const count = members.filter(f.fn).length;
          const on = filter === f.id;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-semibold border transition-colors ${
                on ? "bg-gold/[0.12] border-gold/50 text-gold" : "border-white/10 text-mist hover:text-bone"
              }`}>
              {f.label}
              <span className={`font-mono text-[11px] rounded-full px-1.5 py-0 ${on ? "bg-gold/20 text-gold" : "bg-white/5 text-mist/60"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border hairline bg-ink-800/40 overflow-x-auto">
        <table className="w-full min-w-[860px] text-[13.5px]">
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest2 text-mist/60 border-b hairline">
              <th className="px-5 py-3">Membre</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">UID</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Inscription</th>
              <th className="px-5 py-3">Dépôt</th>
              <th className="px-5 py-3">Clé Kraken</th>
              <th className="px-5 py-3">Accès</th>
              <th className="px-5 py-3 text-right">Messages</th>
              <th className="px-5 py-3">Academy</th>
              <th className="px-5 py-3">Dernière activité</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={11} className="px-5 py-6 text-mist/50 text-center text-[13px]">Aucun membre dans ce segment.</td></tr>
            )}
            {visible.map((m) => (
              <tr key={m.email} className="border-b hairline last:border-0">
                <td className="px-5 py-3">
                  <div className="text-bone">{m.name || "—"}</div>
                  {m.tg_id && <div className="font-mono text-[10px] text-mist/50">tg:{m.tg_id}</div>}
                </td>
                <td className="px-5 py-3 font-mono text-[12px] text-mist">{m.email}</td>
                <td className="px-5 py-3 font-mono text-[12px]">
                  {m.uid ? <span className="text-gold">{m.uid}</span> : <span className="text-mist/40">—</span>}
                </td>
                <td className="px-5 py-3">
                  <span className={`font-mono text-[10px] uppercase tracking-widest2 rounded px-1.5 py-0.5 border ${m.source === "telegram" ? "text-info border-info/30" : "text-gold border-gold/30"}`}>
                    {m.source}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-mist">{fmtDate(m.created_at)}</td>
                <td className="px-5 py-3">
                  {m.deposit === "active" ? <span className="text-pos">✓ actif</span>
                    : m.deposit === "pending" ? <span className="text-flag">en attente</span>
                    : <span className="text-mist/50">—</span>}
                </td>
                <td className="px-5 py-3">{m.has_kraken_key ? <span className="text-pos">✓</span> : <span className="text-mist/40">—</span>}</td>
                <td className="px-5 py-3">{m.has_access ? <span className="text-pos">ouvert</span> : <span className="text-mist/50">verrouillé</span>}</td>
                <td className="px-5 py-3 text-right font-mono text-mist">{m.messages}</td>
                <td className="px-5 py-3">{m.academy ? <span className="text-pos">oui</span> : <span className="text-mist/50">—</span>}</td>
                <td className="px-5 py-3 font-mono text-mist">{relFromMs(m.last_active)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const AUDIENCES = [
  { id: "all", label: "Tous" },
  { id: "members", label: "Membres (compte + UID)" },
  { id: "users", label: "Utilisateurs (mini-app)" },
  { id: "copy", label: "Membres avec copy actif" },
];

const CHANNELS = [
  { id: "bot", label: "Bot Telegram" },
  { id: "email", label: "Email" },
  { id: "both", label: "Bot + Email" },
];

function fmtRes(res) {
  if (!res) return null;
  if (!res.ok) return <span className="text-[12.5px] text-neg">Erreur : {res.error || "envoi impossible"}</span>;
  const parts = [];
  if (res.bot) parts.push(`Bot : ${res.bot.sent}/${res.bot.reachable}`);
  if (res.email) parts.push(`Email : ${res.email.sent}/${res.email.reachable}`);
  return <span className="text-[12.5px] text-pos">✓ {parts.join(" · ") || "envoyé"}</span>;
}

function BroadcastPanel({ adminKey, reachable, total }) {
  const [audience, setAudience] = useState("all");
  const [channel, setChannel] = useState("bot");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const [teaserBusy, setTeaserBusy] = useState(false);
  const [teaserRes, setTeaserRes] = useState(null);

  const channels = channel === "both" ? ["bot", "email"] : [channel];

  async function send() {
    if (!text.trim()) return;
    const audLabel = AUDIENCES.find((a) => a.id === audience)?.label;
    const chLabel = CHANNELS.find((c) => c.id === channel)?.label;
    if (!confirm(`Envoyer à « ${audLabel} » via ${chLabel} ?`)) return;
    setBusy(true); setRes(null);
    const r = await adminPost("/api/admin/broadcast", adminKey, {
      text: text.trim(), audience, channels,
      subject: subject.trim() || "Un message du Pôle Invest",
    });
    setBusy(false); setRes(r);
    if (r && r.ok) setText("");
  }

  async function teaser(kind) {
    if (!confirm(`Envoyer le teaser « achat ${kind} » (bot + email) à TOUS les utilisateurs ?`)) return;
    setTeaserBusy(true); setTeaserRes(null);
    const r = await adminPost("/api/admin/notify-trade", adminKey, { kind });
    setTeaserBusy(false); setTeaserRes(r);
  }

  return (
    <div className="rounded-2xl border gold-line bg-ink-800/40 p-5 mb-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-display text-[17px] text-bone">Envoyer un message</h3>
        <span className="font-mono text-[10.5px] text-mist/60">
          {reachable} joignable(s) bot / {total} membre(s)
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[9.5px] uppercase tracking-widest2 text-mist/50">Audience</span>
        {AUDIENCES.map((a) => (
          <button key={a.id} onClick={() => setAudience(a.id)}
            className={`rounded-lg px-3 py-1.5 text-[12px] transition-colors border ${
              audience === a.id ? "bg-gold/[0.10] text-bone gold-line" : "text-mist hover:text-bone border-transparent"}`}>
            {a.label}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[9.5px] uppercase tracking-widest2 text-mist/50">Canal</span>
        {CHANNELS.map((c) => (
          <button key={c.id} onClick={() => setChannel(c.id)}
            className={`rounded-lg px-3 py-1.5 text-[12px] transition-colors border ${
              channel === c.id ? "bg-gold/[0.10] text-bone gold-line" : "text-mist hover:text-bone border-transparent"}`}>
            {c.label}
          </button>
        ))}
      </div>

      {channel !== "bot" && (
        <input value={subject} onChange={(e) => setSubject(e.target.value)}
          placeholder="Objet de l'email"
          className="mt-3 w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-2.5 text-[13.5px] text-bone placeholder:text-mist/40 outline-none" />
      )}
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
        placeholder="Votre message… (HTML autorisé : <b>, <i>, <a href>)"
        className="mt-3 w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-[14px] text-bone placeholder:text-mist/40 outline-none resize-y" />
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <button onClick={send} disabled={busy || !text.trim()}
          className="btn-gold rounded-full px-6 py-2.5 text-[14px] font-semibold disabled:opacity-50">
          {busy ? "Envoi…" : "Envoyer"}
        </button>
        {fmtRes(res)}
      </div>

      <div className="mt-4 pt-4 border-t hairline">
        <div className="font-mono text-[9.5px] uppercase tracking-widest2 text-mist/50 mb-2">
          Teaser « achat repéré » → tous (bot + email, sans détails)
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={() => teaser("spot")} disabled={teaserBusy}
            className="rounded-full border gold-line text-gold hover:bg-gold/[0.06] px-4 py-2 text-[12.5px] disabled:opacity-50">
            Achat spot
          </button>
          <button onClick={() => teaser("marge")} disabled={teaserBusy}
            className="rounded-full border gold-line text-gold hover:bg-gold/[0.06] px-4 py-2 text-[12.5px] disabled:opacity-50">
            Achat marge
          </button>
          {fmtRes(teaserRes)}
        </div>
      </div>

      <p className="mt-3 text-[11px] text-mist/55">
        Bot : membres ayant ouvert la mini-app. Email : comptes avec email réel. Le teaser ne donne aucun détail (incite à rejoindre).
      </p>
    </div>
  );
}

function BulkIiban({ adminKey, onReload }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // {ok, text}

  async function importBulk() {
    if (!text.trim()) { setMsg({ ok: false, text: "Collez d'abord la liste." }); return; }
    setBusy(true); setMsg(null);
    const d = await adminPost("/api/admin/bulk", adminKey, { text });
    setBusy(false);
    if (d && d.ok) {
      setMsg({ ok: true, text: `${d.parsed} entrée(s) — ${d.added?.active || 0} active, ${d.added?.pending || 0} en attente · ${d.linked || 0} reliée(s) à un compte.` });
      setText("");
      onReload && onReload();
    } else {
      setMsg({ ok: false, text: d?.error || "Import impossible." });
    }
  }

  return (
    <div className="rounded-2xl border gold-line bg-gold/[0.04] p-5 mb-5">
      <div className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80 mb-1">
        Coller / mettre à jour la liste des IIBAN
      </div>
      <p className="text-[12.5px] leading-relaxed text-mist mb-3">
        Collez le contenu du dashboard affilié Kraken (IIBAN masqués + statut). Les lignes
        contenant <b>Active</b> donnent l'accès, <b>Pending</b> les met en attente. Seuls les
        4 derniers caractères de chaque IIBAN sont conservés.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder={"***************FQDQ\n8 juin 2026\n92,15 USD\nActive\n***************Q3BY\nPending"}
        className="w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-4 py-3 text-bone placeholder:text-mist/30 font-mono text-[12.5px] outline-none transition-colors resize-y"
      />
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <button onClick={importBulk} disabled={busy}
                className="btn-gold rounded-full px-6 py-2.5 text-[13.5px] font-semibold disabled:opacity-60">
          {busy ? "Import…" : "Importer la liste"}
        </button>
        {msg && (
          <span className={`text-[12.5px] ${msg.ok ? "text-pos" : "text-flag"}`}>{msg.text}</span>
        )}
      </div>
    </div>
  );
}

function Codes({ adminKey }) {
  const [codes, setCodes] = useState(null);
  const [form, setForm] = useState({ code: "", days: 90, max_uses: 60 });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await adminGet("/api/admin/codes", adminKey);
    setCodes(r?.codes || []);
  }, [adminKey]);
  useEffect(() => { load(); }, [load]);

  async function create() {
    const code = (form.code || "").trim().toUpperCase().replace(/\s/g, "");
    if (code.length < 3) { setMsg({ ok: false, t: "Code trop court (min 3)." }); return; }
    setBusy(true); setMsg(null);
    const d = await adminPost("/api/admin/codes/create", adminKey, {
      code, days: Number(form.days) || 90, max_uses: Number(form.max_uses) || 1,
    });
    setBusy(false);
    if (d?.ok) { setMsg({ ok: true, t: `Code ${d.code} créé (${d.max_uses} usages · ${d.days} j).` }); setForm({ ...form, code: "" }); load(); }
    else setMsg({ ok: false, t: d?.error === "code_exists" ? "Ce code existe déjà." : "Création impossible." });
  }

  const SITE = "https://invest.informateurcrypto.fr";

  return (
    <div>
      <SendCodesPanel adminKey={adminKey} />
      <div className="rounded-2xl border gold-line bg-gold/[0.04] p-5 mb-5 max-w-2xl">
        <div className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80 mb-1">Créer un code d'invitation</div>
        <p className="text-[12.5px] text-mist mb-3">Code nommé multi-usage : durée d'accès + nombre d'utilisations max (1 par personne).</p>
        <div className="grid sm:grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
          <div>
            <label className="block text-[11px] uppercase tracking-widest2 text-mist/70 mb-1.5">Code</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="20FREE3M"
              className="w-full rounded-lg bg-ink-900 border border-white/10 focus:border-gold/50 px-3.5 py-2.5 text-bone font-mono uppercase tracking-wider outline-none" />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest2 text-mist/70 mb-1.5">Jours</label>
            <input type="number" value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })}
              className="w-24 rounded-lg bg-ink-900 border border-white/10 focus:border-gold/50 px-3 py-2.5 text-bone font-mono outline-none" />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest2 text-mist/70 mb-1.5">Usages</label>
            <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              className="w-24 rounded-lg bg-ink-900 border border-white/10 focus:border-gold/50 px-3 py-2.5 text-bone font-mono outline-none" />
          </div>
          <button onClick={create} disabled={busy}
            className="btn-gold rounded-full px-5 py-2.5 text-[13.5px] font-semibold disabled:opacity-60">
            {busy ? "…" : "Créer"}
          </button>
        </div>
        {msg && <p className={`mt-2 text-[12.5px] ${msg.ok ? "text-pos" : "text-flag"}`}>{msg.t}</p>}
      </div>

      <div className="rounded-2xl border hairline bg-ink-800/40 overflow-x-auto">
        <table className="w-full min-w-[640px] text-[13.5px]">
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest2 text-mist/60 border-b hairline">
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3">Accès</th>
              <th className="px-5 py-3">Utilisations</th>
              <th className="px-5 py-3">Restantes</th>
              <th className="px-5 py-3">Lien d'invitation</th>
            </tr>
          </thead>
          <tbody>
            {codes === null && <tr><td colSpan={5} className="px-5 py-4 text-mist/60 text-[13px]">Chargement…</td></tr>}
            {codes && codes.length === 0 && <tr><td colSpan={5} className="px-5 py-4 text-mist/60 text-[13px]">Aucun code nommé. Créez-en un ci-dessus.</td></tr>}
            {codes && codes.map((c) => (
              <tr key={c.code} className="border-b hairline last:border-0">
                <td className="px-5 py-3 font-mono text-bone">{c.code}</td>
                <td className="px-5 py-3 text-mist">{c.days} j</td>
                <td className="px-5 py-3 font-mono">{c.used} / {c.max_uses}</td>
                <td className="px-5 py-3">
                  <span className={c.remaining > 0 ? "text-pos" : "text-flag"}>{c.remaining}</span>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => { try { navigator.clipboard.writeText(`${SITE}/dashboard?code=${c.code}`); } catch {} }}
                    className="text-[12px] text-gold hover:text-gold-soft underline">Copier le lien</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[11.5px] text-mist/60">
        Un membre = une utilisation (impossible de réutiliser le même code). Lien d'invitation à partager :
        <span className="font-mono"> {SITE}/dashboard?code=CODE</span>.
      </p>
    </div>
  );
}

function Deposits({ iiban, ov, adminKey, onReload }) {
  if (!iiban) return <div className="text-mist text-[14px]">Chargement…</div>;
  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <KPI label="Activés (dépôt / 1er trade)" value={ov?.iiban_active ?? "—"} accent="text-pos" />
        <KPI label="En attente" value={ov?.iiban_pending ?? "—"} accent="text-flag" />
        <KPI label="Total suivi" value={ov?.iiban_total ?? "—"} />
      </div>

      <BulkIiban adminKey={adminKey} onReload={onReload} />

      <div className="rounded-2xl border hairline bg-ink-800/40 overflow-x-auto">
        <table className="w-full min-w-[860px] text-[13.5px]">
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest2 text-mist/60 border-b hairline">
              <th className="px-4 py-3">IIBAN (4 derniers)</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telegram</th>
              <th className="px-4 py-3">Clé Kraken</th>
              <th className="px-4 py-3">Statut dépôt</th>
              <th className="px-4 py-3">Accès</th>
              <th className="px-4 py-3">Lien VIP</th>
            </tr>
          </thead>
          <tbody>
            {iiban.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-4 text-mist/60 text-[13px]">Aucune entrée. Collez votre liste d'IIBAN dans le champ ci-dessus.</td></tr>
            )}
            {iiban.map((r) => (
              <tr key={r.code} className="border-b hairline last:border-0">
                <td className="px-4 py-3 font-mono text-bone">{r.code}</td>
                <td className="px-4 py-3 text-mist">
                  {r.email ? (
                    <span className="text-bone">{r.email}</span>
                  ) : (
                    <span className="text-flag/80" title="Aucun compte ne correspond encore à cet IIBAN">non relié</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-mist">{r.tg_id || "—"}</td>
                <td className="px-4 py-3">{r.has_kraken_key ? <span className="text-pos">✓</span> : <span className="text-mist/40">—</span>}</td>
                <td className="px-4 py-3">
                  {r.status === "active" ? <span className="text-pos">✓ actif</span> : <span className="text-flag">en attente</span>}
                </td>
                <td className="px-4 py-3">{r.has_access ? <span className="text-pos">ouvert</span> : <span className="text-mist/50">verrouillé</span>}</td>
                <td className="px-4 py-3">{r.has_link ? <span className="text-pos">généré</span> : <span className="text-mist/50">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[11.5px] text-mist/60">
        Chaque IIBAN est relié automatiquement au compte (<b>email · Telegram · clé Kraken · accès</b>)
        dès qu'un membre a validé cet IIBAN. « non relié » = aucun compte ne correspond encore.
        « Activé » = attribution Kraken active. Collez/actualisez la liste via le champ ci-dessus.
      </p>
    </div>
  );
}

const usd = (n) => (n == null || isNaN(n) ? "—" : Number(n).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $");

function StatusBadge({ s }) {
  const map = {
    active: ["text-pos", "border-pos/40", "actif"],
    waiting_flat: ["text-flag", "border-flag/40", "en attente (A non flat)"],
    stopped: ["text-mist/60", "border-white/10", "arrêté"],
    stopped_loss: ["text-neg", "border-neg/40", "stop-loss"],
    idle: ["text-mist/60", "border-white/10", "inactif"],
  };
  const [c, b, label] = map[s] || ["text-mist/60", "border-white/10", s || "—"];
  return <span className={`font-mono text-[10px] uppercase tracking-widest2 rounded px-1.5 py-0.5 border ${c} ${b}`}>{label}</span>;
}

function CopyAuto({ adminKey }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setData(await adminGet("/api/admin/copy/users", adminKey));
  }, [adminKey]);

  useEffect(() => { load(); const id = setInterval(load, 6000); return () => clearInterval(id); }, [load]);

  async function userAction(email, action) {
    if (action === "flatten" && !confirm("Fermer toutes les positions copy de " + email + " ?")) return;
    setBusy(email + action);
    await adminPost(`/api/admin/copy/user/${action}`, adminKey, { email });
    setBusy("");
    load();
  }

  if (!data) return <div className="text-mist text-[14px]">Chargement…</div>;
  const m = data.master || {};
  const users = data.users || [];

  return (
    <div>
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-2.5 mb-5 text-[12px] text-amber-200/90">
        🧪 Copy-trading multi-utilisateurs sur <span className="font-mono">demo-futures.kraken.com</span> (sandbox, fonds fictifs). Chaque utilisateur = compte esclave B avec ses propres clés démo.
      </div>

      {/* Compte maître A */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <KPI label="Compte maître (A)" value={m.configured ? usd(m.equity) : "non configuré"} sub={m.flat ? "flat" : `${m.positions} position(s)`} accent="text-gold-grad" />
        <KPI label="Moteur" value={m.running ? "actif" : "à l'arrêt"} accent={m.running ? "text-pos" : "text-mist"} />
        <KPI label="Copys configurés" value={users.length} />
        <KPI label="Copys actifs" value={users.filter((u) => u.active).length} accent="text-pos" />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-[17px] text-bone">Utilisateurs en copy (compte B)</h3>
        <button onClick={load} className="text-[12px] text-mist hover:text-bone">↻ rafraîchir</button>
      </div>

      <div className="rounded-2xl border hairline bg-ink-800/40 overflow-x-auto">
        <table className="w-full min-w-[820px] text-[13.5px]">
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest2 text-mist/60 border-b hairline">
              <th className="px-5 py-3">Utilisateur (compte B)</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3 text-right">Équité B</th>
              <th className="px-5 py-3 text-right">PnL copy</th>
              <th className="px-5 py-3 text-right">Positions</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-5 text-mist/60 text-[13px]">
                Aucun utilisateur en copy pour l'instant. Les membres activent la copie depuis l'onglet « Copy-trading » de leur dashboard (ajout de leurs clés démo Kraken Futures).
              </td></tr>
            )}
            {users.map((u) => (
              <tr key={u.email} className="border-b hairline last:border-0">
                <td className="px-5 py-3">
                  <div className="text-bone">{u.name || "—"}</div>
                  <div className="font-mono text-[11px] text-mist/60">{u.email}</div>
                  {!u.configured && <div className="text-[10.5px] text-flag/80">clés non configurées</div>}
                  {u.error && <div className="text-[10.5px] text-neg/80">{u.error}</div>}
                </td>
                <td className="px-5 py-3"><StatusBadge s={u.status} /></td>
                <td className="px-5 py-3 text-right font-mono text-mist">{u.configured ? usd(u.equity) : "—"}</td>
                <td className={`px-5 py-3 text-right font-mono ${(u.pnl_total ?? 0) >= 0 ? "text-pos" : "text-neg"}`}>
                  {u.pnl_total == null ? "—" : `${u.pnl_total >= 0 ? "+" : ""}${u.pnl_total_pct?.toFixed?.(2) ?? "0.00"} %`}
                </td>
                <td className="px-5 py-3 text-right font-mono text-mist">{u.positions}</td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <button onClick={() => userAction(u.email, "stop")} disabled={busy === u.email + "stop"}
                    className="rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 text-[12px] mr-2">
                    {busy === u.email + "stop" ? "…" : "Arrêter"}
                  </button>
                  <button onClick={() => userAction(u.email, "flatten")} disabled={busy === u.email + "flatten"}
                    className="rounded-lg border border-white/15 text-mist hover:text-bone px-3 py-1.5 text-[12px]">
                    {busy === u.email + "flatten" ? "…" : "Tout fermer"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11.5px] leading-relaxed text-mist/60">
        Le maître A est piloté par le moteur ; chaque compte B réplique les positions de A (× ratio d'équité × garde-fous), en sandbox.
        « Arrêter » désactive la copie d'un user (et ferme ses positions copy) ; « Tout fermer » solde uniquement ses positions copy.
      </p>
    </div>
  );
}

function TradesSafe({ adminKey }) {
  const EMPTY = { asset: "", direction: "LONG", pnl_usd: "", pnl_pct: "", comment: "", notify: true };
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [trades, setTrades] = useState(null);

  const load = useCallback(async () => {
    const r = await adminGet("/api/julien/trades", adminKey);
    setTrades(r?.trades || []);
  }, [adminKey]);

  useEffect(() => { load(); }, [load]);

  async function submit(e) {
    e.preventDefault();
    if (!form.asset.trim()) { setMsg({ ok: false, t: "Asset requis." }); return; }
    setBusy(true); setMsg(null);
    const r = await adminPost("/api/admin/julien/trade", adminKey, {
      asset: form.asset.trim().toUpperCase(),
      direction: form.direction,
      pnl_usd: parseFloat(form.pnl_usd) || 0,
      pnl_pct: form.pnl_pct.trim(),
      comment: form.comment.trim(),
      notify: form.notify,
    });
    setBusy(false);
    if (r?.ok) {
      setMsg({ ok: true, t: `Trade ${form.asset} enregistré.${form.notify ? " Notifications envoyées." : ""}` });
      setForm(EMPTY);
      load();
    } else {
      setMsg({ ok: false, t: r?.error || "Erreur." });
    }
  }

  async function deleteTrade(id) {
    if (!confirm("Supprimer ce trade ?")) return;
    await adminPost(`/api/admin/julien/trade/${id}`, adminKey, {});
    load();
  }

  const fmtPnl = (v) => v == null ? "—" : (v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1)) + " $";
  const fmtDate = (ts) => { try { return new Date(ts * 1000).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); } catch { return "—"; } };

  const input = "rounded-lg bg-ink-900 border border-white/10 focus:border-gold/50 px-3 py-2.5 text-bone placeholder:text-mist/40 text-[13.5px] outline-none";

  return (
    <div>
      <div className="rounded-2xl border gold-line bg-gold/[0.04] p-5 mb-6 max-w-2xl">
        <div className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80 mb-1">Enregistrer un trade clôturé</div>
        <p className="text-[12.5px] text-mist mb-4">
          Ajoute le trade en base et envoie automatiquement un <b>broadcast TG + email</b> à tous les membres.
        </p>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-widest2 text-mist/60 mb-1">Asset</label>
            <input value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value })}
              placeholder="BTCUSDT" className={`w-full ${input}`} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest2 text-mist/60 mb-1">Direction</label>
            <div className="flex gap-2">
              {["LONG", "SHORT"].map((d) => (
                <button type="button" key={d} onClick={() => setForm({ ...form, direction: d })}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-[13px] font-semibold border transition-colors ${
                    form.direction === d ? (d === "LONG" ? "bg-pos/10 border-pos/40 text-pos" : "bg-neg/10 border-neg/40 text-neg") : "border-white/10 text-mist hover:text-bone"
                  }`}>{d}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest2 text-mist/60 mb-1">PnL ($)</label>
            <input type="number" step="0.01" value={form.pnl_usd} onChange={(e) => setForm({ ...form, pnl_usd: e.target.value })}
              placeholder="+592.30" className={`w-full ${input}`} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest2 text-mist/60 mb-1">PnL (%)</label>
            <input value={form.pnl_pct} onChange={(e) => setForm({ ...form, pnl_pct: e.target.value })}
              placeholder="+12.5%" className={`w-full ${input}`} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase tracking-widest2 text-mist/60 mb-1">Commentaire (optionnel)</label>
            <input value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Prise de profit partielle, objectif atteint…" className={`w-full ${input}`} />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3 flex-wrap">
            <button type="submit" disabled={busy}
              className="btn-gold rounded-full px-6 py-2.5 text-[13.5px] font-semibold disabled:opacity-60">
              {busy ? "Envoi…" : "Enregistrer & notifier"}
            </button>
            <label className="flex items-center gap-2 text-[12.5px] text-mist cursor-pointer">
              <input type="checkbox" checked={form.notify} onChange={(e) => setForm({ ...form, notify: e.target.checked })}
                className="accent-gold" />
              Envoyer les notifications (TG + email)
            </label>
            {msg && <span className={`text-[12.5px] ${msg.ok ? "text-pos" : "text-flag"}`}>{msg.t}</span>}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border hairline bg-ink-800/40 overflow-x-auto">
        <table className="w-full min-w-[640px] text-[13.5px]">
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest2 text-mist/60 border-b hairline">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Asset</th>
              <th className="px-5 py-3">Direction</th>
              <th className="px-5 py-3 text-right">PnL ($)</th>
              <th className="px-5 py-3">PnL (%)</th>
              <th className="px-5 py-3">Commentaire</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {trades === null && <tr><td colSpan={7} className="px-5 py-4 text-mist/50 text-[13px]">Chargement…</td></tr>}
            {trades && trades.length === 0 && <tr><td colSpan={7} className="px-5 py-4 text-mist/50 text-[13px]">Aucun trade enregistré.</td></tr>}
            {trades && trades.map((t) => (
              <tr key={t.id} className="border-b hairline last:border-0">
                <td className="px-5 py-3 font-mono text-[12px] text-mist">{fmtDate(t.created_at)}</td>
                <td className="px-5 py-3 font-mono text-bone">{t.asset}</td>
                <td className="px-5 py-3">
                  <span className={`font-mono text-[11px] uppercase rounded px-1.5 py-0.5 border ${t.direction === "LONG" ? "text-pos border-pos/30" : "text-neg border-neg/30"}`}>
                    {t.direction}
                  </span>
                </td>
                <td className={`px-5 py-3 text-right font-mono ${(t.pnl_usd || 0) >= 0 ? "text-pos" : "text-neg"}`}>{fmtPnl(t.pnl_usd)}</td>
                <td className="px-5 py-3 font-mono text-mist">{t.pnl_pct || "—"}</td>
                <td className="px-5 py-3 text-mist text-[12px]">{t.comment || "—"}</td>
                <td className="px-5 py-3">
                  <button onClick={() => deleteTrade(t.id)}
                    className="text-[11px] text-neg/60 hover:text-neg transition-colors">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11.5px] text-mist/55">
        Chaque trade enregistré déclenche un broadcast Telegram (trigger <span className="font-mono">trade_cloture_safe</span>) + email à tous les membres. Le template est personnalisable dans les onglets Posts TG et Emails.
      </p>
    </div>
  );
}
