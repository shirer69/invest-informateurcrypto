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

function Toggle({ on, onClick, label, sub }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full flex items-center justify-between rounded-xl border hairline bg-ink-900/40 px-4 py-3.5">
      <span className="text-left">
        <span className="block text-[14px] text-bone">{label}</span>
        {sub && <span className="block text-[11.5px] text-mist/60">{sub}</span>}
      </span>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-pos" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} inputMode="decimal"
        className="mt-1.5 w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-3.5 py-2.5 text-bone font-mono text-[13.5px] outline-none" />
    </label>
  );
}

const usd = (n) => (n == null || isNaN(n) ? "—" : Number(n).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $");

function CopyAuto({ adminKey }) {
  const [st, setSt] = useState(null);
  const [risk, setRisk] = useState(null);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const s = await adminGet("/api/admin/copy/status", adminKey);
    setSt(s);
    setRisk((prev) => {
      if (prev || !s || !s.risk) return prev;
      return {
        size_ratio: s.risk.size_ratio,
        max_leverage: s.risk.max_leverage,
        slpct: Math.round((s.risk.auto_stop_loss_pct || 0) * 10000) / 100,
        max_notional_usd: s.risk.max_notional_usd,
        allowed: (s.risk.allowed_symbols || []).join(", "),
      };
    });
  }, [adminKey]);

  useEffect(() => { load(); const id = setInterval(load, 5000); return () => clearInterval(id); }, [load]);

  async function patchRisk(patch) { await adminPost("/api/admin/copy/risk", adminKey, patch); load(); }
  async function act(path, label) { setBusy(label); await adminPost(`/api/admin/copy/${path}`, adminKey); setBusy(""); load(); }
  async function saveGuards() {
    setMsg("");
    const r = await adminPost("/api/admin/copy/risk", adminKey, {
      size_ratio: Number(risk.size_ratio) || 0,
      max_leverage: Number(risk.max_leverage) || 0,
      auto_stop_loss_pct: (Number(risk.slpct) || 0) / 100,
      max_notional_usd: Number(risk.max_notional_usd) || 0,
      allowed_symbols: risk.allowed.split(",").map((x) => x.trim()).filter(Boolean),
    });
    setMsg(r && r.ok ? "Garde-fous enregistrés ✓" : "Erreur d'enregistrement");
    load();
  }

  if (!st) return <div className="text-mist text-[14px]">Chargement…</div>;
  if (st.offline) return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-5 text-amber-200/90 text-[13.5px]">
      Moteur copy-auto hors ligne. {st.error}
    </div>
  );
  const rk = st.risk || {};

  return (
    <div>
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-2.5 mb-5 text-[12px] text-amber-200/90">
        🧪 Exécution réelle sur l'environnement <span className="font-mono">demo-futures.kraken.com</span> (fonds fictifs). Aucun fonds réel.
      </div>

      <div className="grid lg:grid-cols-2 gap-5 items-start">
        {/* Capital & Ratio */}
        <div className="rounded-2xl border hairline bg-ink-800/50 p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70 mb-4">Capital & Ratio</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border hairline bg-ink-900/40 p-4">
              <div className="text-[12px] text-mist">Compte A (maître)</div>
              <div className="mt-1 font-display text-[22px] text-bone tabular-nums">{usd(st.equity_a)}</div>
              <div className="text-[11px] text-info">source</div>
            </div>
            <div className="rounded-xl border hairline bg-ink-900/40 p-4">
              <div className="text-[12px] text-mist">Compte B (esclave)</div>
              <div className="mt-1 font-display text-[22px] text-bone tabular-nums">{usd(st.equity_b)}</div>
              <div className="text-[11px] text-info">réplique</div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t hairline pt-3">
            <span className="text-[13px] text-mist">Ratio de copie (B/A)</span>
            <span className="font-mono text-bone">{(st.ratio * 100).toFixed(2)} %</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[12.5px]">
            <span className="text-mist">WebSocket fills (A)</span>
            <span className="font-mono text-mist/80">{st.ws_status}</span>
          </div>
          {st.last_error && <div className="mt-2 text-[12px] text-neg">{st.last_error}</div>}

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t hairline pt-4">
            <button onClick={() => act("start", "start")} disabled={busy === "start"}
              className="inline-flex items-center gap-2 rounded-lg bg-pos/90 hover:bg-pos px-4 py-2.5 text-[13.5px] font-semibold text-slate-950">
              ▶ {busy === "start" ? "…" : "Démarrer"}
            </button>
            <button onClick={() => act("stop", "stop")} disabled={busy === "stop"}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-500/90 hover:bg-rose-500 px-4 py-2.5 text-[13.5px] font-semibold text-white">
              ■ {busy === "stop" ? "…" : "Arrêter"}
            </button>
            <button onClick={() => { if (confirm("Fermer toutes les positions de B ?")) act("flatten", "flat"); }}
              className="ml-auto inline-flex items-center gap-2 rounded-lg border border-rose-500/50 text-rose-300 hover:bg-rose-500/10 px-4 py-2.5 text-[13px] font-semibold">
              ⚠ Tout fermer (B)
            </button>
          </div>
          <div className="mt-3 text-[12px]">
            <span className={`font-mono ${st.running ? "text-pos" : "text-mist/60"}`}>
              {st.running ? "● moteur actif" : "○ moteur arrêté"}
            </span>
          </div>
        </div>

        {/* Garde-fous */}
        <div className="rounded-2xl border hairline bg-ink-800/50 p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70 mb-4">Garde-fous (compte B)</div>
          <div className="space-y-2.5">
            <Toggle on={rk.dry_run} onClick={() => patchRisk({ dry_run: !rk.dry_run })}
              label="Mode simulation" sub="dry-run, aucun ordre réel" />
            <Toggle on={rk.enabled} onClick={() => patchRisk({ enabled: !rk.enabled })}
              label="Copie activée" />
          </div>
          {risk && (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Field label="Multiplicateur taille" value={risk.size_ratio} onChange={(v) => setRisk({ ...risk, size_ratio: v })} />
                <Field label="Levier max (x)" value={risk.max_leverage} onChange={(v) => setRisk({ ...risk, max_leverage: v })} />
                <Field label="Stop-loss auto (%)" value={risk.slpct} onChange={(v) => setRisk({ ...risk, slpct: v })} />
                <Field label="Notionnel max / ordre ($)" value={risk.max_notional_usd} onChange={(v) => setRisk({ ...risk, max_notional_usd: v })} />
              </div>
              <label className="block mt-3">
                <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Marchés autorisés (vide = tous, ex: PI_XBTUSD, PF_ETHUSD)</span>
                <input value={risk.allowed} onChange={(e) => setRisk({ ...risk, allowed: e.target.value })}
                  className="mt-1.5 w-full rounded-xl bg-ink-900 border border-white/10 focus:border-gold/50 px-3.5 py-2.5 text-bone font-mono text-[13px] outline-none" />
              </label>
              <button onClick={saveGuards}
                className="btn-gold mt-4 w-full rounded-xl px-6 py-3 text-[14px] font-semibold">
                Enregistrer les garde-fous
              </button>
              {msg && <p className="mt-2 text-[12.5px] text-pos">{msg}</p>}
            </>
          )}
        </div>
      </div>

      {/* Journal */}
      <div className="mt-5 rounded-2xl border hairline bg-ink-800/40 p-6">
        <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70 mb-3">Journal d'activité</div>
        <div className="space-y-1.5 max-h-[320px] overflow-y-auto font-mono text-[12px]">
          {(st.events || []).length === 0 && <div className="text-mist/50">Aucun événement.</div>}
          {(st.events || []).map((e, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-mist/50 shrink-0">{e.t ? new Date(e.t * 1000).toLocaleTimeString("fr-FR") : ""}</span>
              <span className="text-gold/80 uppercase shrink-0 w-16">{e.kind}</span>
              <span className="text-mist">{e.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
