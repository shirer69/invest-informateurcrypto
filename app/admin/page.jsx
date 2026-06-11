"use client";

import { useEffect, useState, useCallback } from "react";
import { API_BASE } from "@/lib/site";

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
  { id: "members", label: "Membres (CRM)" },
  { id: "deposits", label: "Dépôts & activation" },
  { id: "copy", label: "Copy Auto" },
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

  const loadAll = useCallback(async (k) => {
    const [o, m, l] = await Promise.all([
      adminGet("/api/admin/overview", k),
      adminGet("/api/admin/members", k),
      adminGet("/api/admin/list?key=" + encodeURIComponent(k), k),
    ]);
    setOv(o); setMembers(m?.members || []); setIiban(l?.items || []);
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
          <div className="flex items-center gap-3">
            <button onClick={() => loadAll(key)} className="btn-ghost rounded-full px-4 py-2 text-[12.5px]">↻ Rafraîchir</button>
            <button onClick={() => { sessionStorage.removeItem(KEYK); setAuthed(false); }}
                    className="btn-ghost rounded-full px-4 py-2 text-[12.5px]">Quitter</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-5 py-6">
        <nav className="flex gap-1.5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-2.5 text-[14px] whitespace-nowrap transition-colors ${
                tab === t.id ? "bg-gold/[0.10] text-bone border gold-line" : "text-mist hover:text-bone border border-transparent"
              }`}>
              {t.label}
            </button>
          ))}
        </nav>

        {tab === "overview" && <Overview ov={ov} />}
        {tab === "members" && <Members members={members} />}
        {tab === "deposits" && <Deposits iiban={iiban} ov={ov} />}
        {tab === "copy" && <CopyAuto adminKey={key} />}
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

function Overview({ ov }) {
  if (!ov) return <div className="text-mist text-[14px]">Chargement…</div>;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPI label="Membres" value={ov.members} sub={`+${ov.new24h} / 24h`} accent="text-gold-grad" />
      <KPI label="Via Telegram" value={ov.telegram} sub={`${ov.web} via web`} />
      <KPI label="Dépôts actifs" value={ov.iiban_active} sub={`${ov.iiban_pending} en attente`} accent="text-pos" />
      <KPI label="En attente d'activation" value={ov.iiban_pending} accent="text-flag" />
      <KPI label="Messages chat" value={ov.messages} />
      <KPI label="Academy démarrée" value={ov.academy} />
      <KPI label="UID suivis" value={ov.iiban_total} sub="dans la liste" />
    </div>
  );
}

function Members({ members }) {
  if (!members) return <div className="text-mist text-[14px]">Chargement…</div>;
  return (
    <div className="rounded-2xl border hairline bg-ink-800/40 overflow-x-auto">
      <table className="w-full min-w-[760px] text-[13.5px]">
        <thead>
          <tr className="text-left font-mono text-[10px] uppercase tracking-widest2 text-mist/60 border-b hairline">
            <th className="px-5 py-3">Membre</th>
            <th className="px-5 py-3">UID</th>
            <th className="px-5 py-3">Source</th>
            <th className="px-5 py-3">Inscription</th>
            <th className="px-5 py-3">Dépôt</th>
            <th className="px-5 py-3 text-right">Messages</th>
            <th className="px-5 py-3">Academy</th>
            <th className="px-5 py-3">Dernière activité</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.email} className="border-b hairline last:border-0">
              <td className="px-5 py-3">
                <div className="text-bone">{m.name || "—"}</div>
                <div className="font-mono text-[11px] text-mist/60">{m.email}</div>
              </td>
              <td className="px-5 py-3 font-mono text-[12px]">
                {m.uid ? <span className="text-gold">{m.uid}</span> : <span className="text-mist/40">—</span>}
                {m.tg_id && <div className="text-[10px] text-mist/50">tg:{m.tg_id}</div>}
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
              <td className="px-5 py-3 text-right font-mono text-mist">{m.messages}</td>
              <td className="px-5 py-3">{m.academy ? <span className="text-pos">oui</span> : <span className="text-mist/50">—</span>}</td>
              <td className="px-5 py-3 font-mono text-mist">{relFromMs(m.last_active)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Deposits({ iiban, ov }) {
  if (!iiban) return <div className="text-mist text-[14px]">Chargement…</div>;
  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <KPI label="Activés (dépôt / 1er trade)" value={ov?.iiban_active ?? "—"} accent="text-pos" />
        <KPI label="En attente" value={ov?.iiban_pending ?? "—"} accent="text-flag" />
        <KPI label="Total suivi" value={ov?.iiban_total ?? "—"} />
      </div>
      <div className="rounded-2xl border hairline bg-ink-800/40 overflow-x-auto">
        <table className="w-full min-w-[560px] text-[13.5px]">
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest2 text-mist/60 border-b hairline">
              <th className="px-5 py-3">UID (4 derniers)</th>
              <th className="px-5 py-3">Nom</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Lien VIP</th>
            </tr>
          </thead>
          <tbody>
            {iiban.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-4 text-mist/60 text-[13px]">Aucune entrée. Ajoutez des IIBAN via /update.</td></tr>
            )}
            {iiban.map((r) => (
              <tr key={r.code} className="border-b hairline last:border-0">
                <td className="px-5 py-3 font-mono text-bone">{r.code}</td>
                <td className="px-5 py-3 text-mist">{r.name || "—"}</td>
                <td className="px-5 py-3">
                  {r.status === "active" ? <span className="text-pos">✓ actif</span> : <span className="text-flag">en attente</span>}
                </td>
                <td className="px-5 py-3">{r.has_link ? <span className="text-pos">généré</span> : <span className="text-mist/50">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[11.5px] text-mist/60">
        « Activé » = attribution Kraken active (dépôt effectué / premier trade). « En attente » = inscrit, pas encore activé.
        La liste se met à jour depuis la page <span className="font-mono">/update</span>.
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
