"use client";

import { useEffect, useState, useCallback } from "react";
import { API_BASE } from "@/lib/site";

const hdr = (k) => ({ "x-admin-key": k });
async function aget(p, k) { try { return await (await fetch(`${API_BASE}${p}`, { headers: hdr(k), cache: "no-store" })).json(); } catch { return {}; } }
async function adel(p, k) { try { return await (await fetch(`${API_BASE}${p}`, { method: "DELETE", headers: hdr(k) })).json(); } catch { return {}; } }

function frDateTime(epoch) {
  try { return new Date(epoch * 1000).toLocaleString("fr-FR", { timeZone: "Europe/Paris", dateStyle: "medium", timeStyle: "short" }); }
  catch { return ""; }
}

const STATUS = {
  pending: { t: "En attente", c: "text-amber-400" },
  sent: { t: "Envoyé", c: "text-emerald-400" },
  failed: { t: "Échec", c: "text-red-400" },
  cancelled: { t: "Annulé", c: "text-mist/50" },
};

export default function ScheduledAdmin({ adminKey }) {
  const [items, setItems] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    const r = await aget("/api/admin/schedule", adminKey);
    setItems(r.items || []);
    setBusy(false);
  }, [adminKey]);

  useEffect(() => {
    load();
    const iv = setInterval(load, 30000); // rafraîchit pour voir les statuts évoluer
    return () => clearInterval(iv);
  }, [load]);

  async function cancel(id) {
    if (!confirm("Annuler cet envoi programmé ?")) return;
    await adel(`/api/admin/schedule/${id}`, adminKey);
    load();
  }

  const rows = items || [];
  const pending = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[20px] text-bone">🕒 Envois programmés</h2>
          <p className="text-[12.5px] text-mist">Mails et posts Telegram planifiés (heure française). {pending} en attente.</p>
        </div>
        <button onClick={load} className="rounded-lg px-3 py-1.5 text-[12.5px] border hairline text-mist hover:text-bone">{busy ? "…" : "Rafraîchir"}</button>
      </div>

      <div className="rounded-2xl border hairline bg-ink-800/40 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-mist/60 font-mono text-[10px] uppercase tracking-widest2 border-b hairline">
              <th className="px-4 py-3">Canal</th>
              <th className="px-3 py-3">Programmé pour (FR)</th>
              <th className="px-3 py-3">Statut</th>
              <th className="px-3 py-3">Détail</th>
              <th className="px-3 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {!items && <tr><td colSpan={5} className="px-4 py-6 text-center text-mist/50">Chargement…</td></tr>}
            {items && rows.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-mist/50">Aucun envoi programmé.</td></tr>}
            {rows.map((r) => {
              const st = STATUS[r.status] || { t: r.status, c: "text-mist" };
              return (
                <tr key={r.id} className="border-b hairline/50 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-bone">{r.channel === "mail" ? "📧 Email" : "✈️ Telegram"}</td>
                  <td className="px-3 py-3 text-bone">{frDateTime(r.run_at)}</td>
                  <td className={`px-3 py-3 font-semibold ${st.c}`}>{st.t}</td>
                  <td className="px-3 py-3 text-mist/70 max-w-[220px] truncate">{r.info || "—"}</td>
                  <td className="px-3 py-3 text-right">
                    {r.status === "pending"
                      ? <button onClick={() => cancel(r.id)} className="rounded-lg px-2.5 py-1.5 text-[11.5px] border border-red-500/30 text-red-400/80 hover:text-red-400">Annuler</button>
                      : <span className="text-mist/30 text-[11px]">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
