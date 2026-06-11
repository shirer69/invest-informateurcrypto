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
        {tab === "copy" && <CopyAuto members={members} />}
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

function CopyAuto({ members }) {
  if (!members) return <div className="text-mist text-[14px]">Chargement…</div>;
  const eligible = members.filter((m) => m.deposit === "active");
  return (
    <div>
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 mb-5">
        <p className="text-[12.5px] leading-relaxed text-amber-200/90">
          ⚠️ Le copy-trading <span className="font-semibold">automatique n'exécute aucun ordre</span> depuis cette plateforme
          (limite de sécurité). Cet onglet <span className="font-semibold">monitore</span> les membres et leur statut
          d'opt-in ; l'exécution réelle reste manuelle / externe.
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <KPI label="Membres éligibles (activés)" value={eligible.length} accent="text-pos" />
        <KPI label="Opt-in copy auto" value={0} sub="aucun pour l'instant" />
        <KPI label="Suivis actifs" value={0} />
      </div>
      <div className="rounded-2xl border hairline bg-ink-800/40 overflow-x-auto">
        <table className="w-full min-w-[640px] text-[13.5px]">
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest2 text-mist/60 border-b hairline">
              <th className="px-5 py-3">Membre</th>
              <th className="px-5 py-3">Statut dépôt</th>
              <th className="px-5 py-3">Copy auto</th>
              <th className="px-5 py-3">Mode</th>
              <th className="px-5 py-3 text-right">PnL copié</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.email} className="border-b hairline last:border-0">
                <td className="px-5 py-3">
                  <div className="text-bone">{m.name || "—"}</div>
                  <div className="font-mono text-[11px] text-mist/60">{m.email}</div>
                </td>
                <td className="px-5 py-3">
                  {m.deposit === "active" ? <span className="text-pos">✓ actif</span>
                    : m.deposit === "pending" ? <span className="text-flag">en attente</span>
                    : <span className="text-mist/50">—</span>}
                </td>
                <td className="px-5 py-3"><span className="text-mist/50">inactif</span></td>
                <td className="px-5 py-3 text-mist/50">—</td>
                <td className="px-5 py-3 text-right text-mist/50">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[11.5px] text-mist/60">
        Structure de monitoring prête : dès qu'un mécanisme d'opt-in copy (lecture seule / signaux) est branché,
        les colonnes « Copy auto », « Mode » et « PnL copié » se rempliront automatiquement.
      </p>
    </div>
  );
}
