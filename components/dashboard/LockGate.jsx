"use client";

import { useState } from "react";
import { getUser } from "@/lib/clientStore";
import { API_BASE } from "@/lib/site";
import { IconArrow } from "@/components/Icons";

// Accès actif si access_until (epoch s ou ms) est dans le futur.
export function hasAccess() {
  const u = getUser();
  const t = u && u.access_until;
  if (!t) return false;
  const ms = Number(t) < 1e12 ? Number(t) * 1000 : Number(t);
  return ms > Date.now();
}

export default function LockGate({ children, title = "Contenu réservé aux membres" }) {
  const [unlocked] = useState(hasAccess());
  const [uid, setUid] = useState("");
  const [state, setState] = useState("idle"); // idle | checking | eligible | pending | notfound | error
  const [pay, setPay] = useState(false);

  if (unlocked) return children;

  async function verify(e) {
    e.preventDefault();
    if (uid.trim().replace(/\s+/g, "").length < 4) { setState("notfound"); return; }
    setState("checking");
    try {
      const r = await fetch(`${API_BASE}/api/verify`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const d = await r.json();
      setState(d.status === "active" ? "eligible" : d.status === "pending" ? "pending" : "notfound");
    } catch { setState("error"); }
  }

  return (
    <div className="relative">
      {/* contenu réel, flouté + non interactif */}
      <div className="pointer-events-none select-none blur-[6px] opacity-40" aria-hidden>
        {children}
      </div>

      {/* overlay de déblocage */}
      <div className="absolute inset-0 z-10 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
        <div className="my-auto w-full max-w-md rounded-2xl border gold-line bg-ink-900/95 backdrop-blur-sm p-6 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center h-7 w-7 rounded-full border gold-line text-gold text-[13px]">🔒</span>
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">Accès verrouillé</span>
          </div>
          <h3 className="mt-3 font-display font-light text-[22px] leading-tight tracking-tightest text-bone">
            {title}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-mist">
            Débloquez l'accès complet (positions, actifs, performance en direct) avec l'une
            des deux options :
          </p>

          {/* Option 1 : IIBAN Kraken */}
          <div className="mt-5 rounded-xl border gold-line bg-gold/[0.05] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">
                Option 1 · IIBAN Kraken
              </span>
              <span className="text-[11px] text-emerald-400">3 mois offerts</span>
            </div>
            <form onSubmit={verify} className="mt-2.5 flex gap-2">
              <input
                value={uid}
                onChange={(e) => { setUid(e.target.value); if (state !== "checking") setState("idle"); }}
                placeholder="UID Kraken (identifiant IIBAN)"
                className="flex-1 min-w-0 rounded-lg bg-ink-900 border border-white/10 focus:border-gold/50 px-3.5 py-2.5 text-bone placeholder:text-mist/40 font-mono text-[13px] outline-none"
              />
              <button disabled={state === "checking"} className="btn-gold rounded-lg px-4 text-[13px] font-semibold disabled:opacity-60">
                {state === "checking" ? "…" : "Valider"}
              </button>
            </form>
            {state === "eligible" && (
              <p className="mt-2 text-[12.5px] text-emerald-400">
                ✓ Éligible — vos 3 mois d'accès vont être activés.
              </p>
            )}
            {state === "pending" && (
              <p className="mt-2 text-[12.5px] text-amber-300/90">
                Attribution en attente : ouvrez/fermez une position perps sur Kraken, puis réessayez.
              </p>
            )}
            {state === "notfound" && (
              <p className="mt-2 text-[12.5px] text-rose-400/90">
                IIBAN non reconnu comme actif. Vérifiez votre dépôt Kraken.
              </p>
            )}
            {state === "error" && (
              <p className="mt-2 text-[12.5px] text-rose-400/90">Erreur, réessayez.</p>
            )}
          </div>

          {/* Option 2 : 239$ via wallet */}
          <div className="mt-3 rounded-xl border hairline bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">
                Option 2 · Abonnement
              </span>
              <span className="text-[13px] font-display text-bone">239 $ <span className="text-mist text-[11px]">/ 3 mois</span></span>
            </div>
            <button
              onClick={() => setPay(true)}
              className="btn-ghost mt-2.5 w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px]"
            >
              Payer depuis mon wallet <IconArrow className="h-4 w-4" />
            </button>
            {pay && (
              <p className="mt-2 text-[12px] leading-relaxed text-mist">
                Le paiement se fera par débit de votre <span className="text-bone">wallet USDT</span> dédié
                (activation à venir). En attendant, alimentez votre wallet depuis l'espace
                facturation.
              </p>
            )}
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-mist/50">
            Aucun conseil en investissement. Risque de perte en capital.
          </p>
        </div>
      </div>
    </div>
  );
}
