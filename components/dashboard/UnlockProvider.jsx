"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { hasAccess, apiAccess, apiAccessIiban, apiAccessPay } from "@/lib/clientStore";
import { IconArrow } from "@/components/Icons";

const Ctx = createContext({ locked: true, openUnlock: () => {}, wallet: null });
export const useUnlock = () => useContext(Ctx);

export function UnlockProvider({ children }) {
  const [locked, setLocked] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    const r = await apiAccess();
    if (r && r.ok) {
      setLocked(!r.has_access);
      setWallet({ wallet_balance: r.wallet_balance, price_usd: r.price_usd, can_pay: r.can_pay });
    } else {
      setLocked(!hasAccess());
    }
  }, []);

  useEffect(() => {
    setLocked(!hasAccess());
    refresh();
  }, [refresh]);

  const openUnlock = useCallback(() => setOpen(true), []);
  const onUnlocked = useCallback(() => { setLocked(false); setOpen(false); }, []);

  return (
    <Ctx.Provider value={{ locked, openUnlock, wallet }}>
      {children}
      {open && (
        <UnlockModal
          wallet={wallet}
          onClose={() => setOpen(false)}
          onUnlocked={onUnlocked}
        />
      )}
    </Ctx.Provider>
  );
}

/* Wrapper : floute le contenu + bouton « Déverrouiller » tant que verrouillé. */
export function Locked({ children, label = "Déverrouiller", className = "" }) {
  const { locked, openUnlock } = useUnlock();
  if (!locked) return children;
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none select-none blur-[6px] opacity-40" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 z-10 grid place-items-center p-4">
        <button
          onClick={openUnlock}
          className="btn-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold shadow-2xl"
        >
          <span aria-hidden>🔒</span> {label}
          <IconArrow className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* Modal des deux options de déblocage (IIBAN 3 mois offerts / 239 $ wallet). */
function UnlockModal({ wallet, onClose, onUnlocked }) {
  const [uid, setUid] = useState("");
  const [state, setState] = useState("idle"); // idle | checking | pending | notfound | error
  const [paying, setPaying] = useState(false);
  const [payMsg, setPayMsg] = useState("");
  const [bal, setBal] = useState(wallet);

  useEffect(() => { setBal(wallet); }, [wallet]);

  async function verify(e) {
    e.preventDefault();
    if (uid.trim().replace(/\s+/g, "").length < 4) { setState("notfound"); return; }
    setState("checking");
    const r = await apiAccessIiban(uid.trim());
    if (r.ok) { onUnlocked(); return; }
    if (r.status === 403) setState(r.uid_status === "pending" ? "pending" : "notfound");
    else setState("error");
  }

  async function pay() {
    setPaying(true); setPayMsg("");
    const r = await apiAccessPay();
    setPaying(false);
    if (r.ok) { onUnlocked(); return; }
    if (r.status === 402) {
      setPayMsg(
        `Solde insuffisant : ${Number(r.wallet_balance ?? 0).toFixed(2)} $ / ${Number(r.price_usd ?? 239).toFixed(0)} $. ` +
        `Alimentez votre wallet USDT dédié (il manque ${Number(r.missing ?? 0).toFixed(2)} $).`
      );
    } else if (r.status === 401) {
      setPayMsg("Connectez-vous pour finaliser le paiement.");
    } else {
      setPayMsg("Erreur lors du paiement, réessayez.");
    }
  }

  const price = bal?.price_usd ?? 239;

  return (
    <div className="fixed inset-0 z-[120] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative my-auto w-full max-w-md rounded-2xl border gold-line bg-ink-900/95 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">Déverrouiller l'accès</span>
          <button onClick={onClose} aria-label="Fermer"
                  className="h-8 w-8 grid place-items-center rounded-full border hairline text-mist hover:text-bone">
            <span className="block w-3 h-px bg-current rotate-45 translate-y-[0.5px]" />
            <span className="block w-3 h-px bg-current -rotate-45 -translate-y-[0.5px]" />
          </button>
        </div>
        <h3 className="mt-3 font-display font-light text-[22px] leading-tight tracking-tightest text-bone">
          Accédez à l'intégralité du dashboard
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-mist">
          Positions, actifs, alertes, academy et audios — débloquez tout avec l'une des deux options :
        </p>

        {/* Option 1 : IIBAN Kraken */}
        <div className="mt-5 rounded-xl border gold-line bg-gold/[0.05] p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">Option 1 · IIBAN Kraken</span>
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
          {state === "pending" && (
            <p className="mt-2 text-[12.5px] text-amber-300/90">
              Attribution en attente : ouvrez/fermez une position perps sur Kraken, puis réessayez.
            </p>
          )}
          {state === "notfound" && (
            <p className="mt-2 text-[12.5px] text-rose-400/90">IIBAN non reconnu comme actif. Vérifiez votre dépôt Kraken.</p>
          )}
          {state === "error" && <p className="mt-2 text-[12.5px] text-rose-400/90">Erreur, réessayez.</p>}
        </div>

        {/* Option 2 : abonnement via wallet */}
        <div className="mt-3 rounded-xl border hairline bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Option 2 · Abonnement</span>
            <span className="text-[13px] font-display text-bone">{Number(price).toFixed(0)} $ <span className="text-mist text-[11px]">/ 3 mois</span></span>
          </div>
          {bal && (
            <p className="mt-2 text-[11.5px] text-mist">
              Solde wallet : <span className="text-bone font-mono">{Number(bal.wallet_balance ?? 0).toFixed(2)} $</span>
            </p>
          )}
          <button onClick={pay} disabled={paying}
                  className="btn-gold mt-2.5 w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold disabled:opacity-60">
            {paying ? "Traitement…" : <>Payer {Number(price).toFixed(0)} $ depuis mon wallet <IconArrow className="h-4 w-4" /></>}
          </button>
          {payMsg && <p className="mt-2 text-[12px] leading-relaxed text-amber-300/90">{payMsg}</p>}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-mist/50">
          Aucun conseil en investissement. Risque de perte en capital.
        </p>
      </div>
    </div>
  );
}
