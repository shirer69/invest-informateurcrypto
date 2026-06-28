"use client";

import { useState, useEffect, useCallback } from "react";
import { apiContestCurrent, apiContestPredict, apiContestWinnerAddress, getUser, getToken } from "@/lib/clientStore";

function fmtPrice(p) {
  if (p == null) return "—";
  return "$" + Number(p).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function useCountdown(ts) {
  const [diff, setDiff] = useState(() => ts ? ts * 1000 - Date.now() : 0);
  useEffect(() => {
    if (!ts) return;
    const iv = setInterval(() => setDiff(ts * 1000 - Date.now()), 1000);
    return () => clearInterval(iv);
  }, [ts]);
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h > 0 ? h + "h " : ""}${m}m ${s}s`;
}

function Medal({ rank }) {
  if (rank === 1) return <span className="text-[18px]">🥇</span>;
  if (rank === 2) return <span className="text-[18px]">🥈</span>;
  if (rank === 3) return <span className="text-[18px]">🥉</span>;
  return <span className="font-mono text-[12px] text-mist/50 w-6 text-right">{rank}</span>;
}

export default function Contest() {
  const [contest, setContest] = useState(undefined); // undefined = loading, null = aucun
  const [priceInput, setPriceInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [submitState, setSubmitState] = useState("idle"); // idle | loading | done | error
  const [submitMsg, setSubmitMsg] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [addrState, setAddrState] = useState("idle");
  const [addrMsg, setAddrMsg] = useState("");

  const user = getUser();
  const isLogged = !!getToken();

  const load = useCallback(async () => {
    const r = await apiContestCurrent();
    setContest(r.ok ? (r.contest || null) : null);
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, [load]);

  const countdown = useCountdown(contest?.deadline_ts);

  async function handlePredict(e) {
    e.preventDefault();
    const price = parseFloat(priceInput.replace(/[^0-9.]/g, ""));
    if (!price || price <= 0) { setSubmitMsg("Prix invalide."); setSubmitState("error"); return; }
    const name = isLogged ? (user?.name || "") : nameInput.trim();
    if (!isLogged && !name) { setSubmitMsg("Entrez votre prénom pour participer."); setSubmitState("error"); return; }

    setSubmitState("loading");
    const r = await apiContestPredict(price, name);
    if (r.ok) {
      setSubmitState("done");
      setSubmitMsg("Prédiction enregistrée ✓");
      await load();
    } else if (r.error === "already_predicted") {
      setSubmitState("error"); setSubmitMsg("Vous avez déjà prédit pour ce concours.");
    } else if (r.error === "deadline_passed") {
      setSubmitState("error"); setSubmitMsg("La deadline est passée.");
    } else {
      setSubmitState("error"); setSubmitMsg("Erreur : " + (r.error || "inconnue"));
    }
  }

  async function handleAddress(e) {
    e.preventDefault();
    const addr = addressInput.trim();
    if (addr.length < 10) { setAddrMsg("Adresse invalide."); setAddrState("error"); return; }
    setAddrState("loading");
    const r = await apiContestWinnerAddress(addr);
    if (r.ok) { setAddrState("done"); setAddrMsg("Adresse enregistrée ✓ — contactez @clubdesinformateurs pour recevoir votre gain."); }
    else { setAddrState("error"); setAddrMsg("Erreur : " + (r.error || "inconnue")); }
  }

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (contest === undefined) {
    return (
      <div>
        <h3 className="font-display text-[18px] text-bone mb-4">🎯 Concours BTC</h3>
        <div className="text-[13px] text-mist/60">Chargement…</div>
      </div>
    );
  }

  // ─── Aucun concours actif ─────────────────────────────────────────────────
  if (!contest) {
    return (
      <div>
        <h3 className="font-display text-[18px] text-bone mb-6">🎯 Concours BTC</h3>
        <div className="rounded-2xl border hairline bg-ink-800/40 p-10 text-center">
          <div className="text-[40px] mb-3">🏆</div>
          <p className="font-display text-[18px] text-bone">Aucun concours en cours</p>
          <p className="mt-3 text-[13.5px] text-mist leading-relaxed max-w-md mx-auto">
            Un nouveau concours de prédiction BTC (10 $ à gagner) est organisé tous les 3 jours.
            Revenez bientôt !
          </p>
        </div>
      </div>
    );
  }

  const isWinner = contest.winner_user_id && user && contest.winner_user_id === user.id;
  const isResolved = contest.status === "resolved";
  const isClosed = contest.status === "closed";
  const alreadyPredicted = !!contest.user_prediction;
  const deadlinePassed = contest.deadline_passed;

  const myPred = contest.user_prediction;
  const myRank = myPred
    ? contest.predictions.findIndex((p) => p.id === myPred.id) + 1
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-display text-[18px] text-bone">🎯 Concours BTC — {fmtPrice(10)} à gagner</h3>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-widest border ${
          isResolved ? "border-emerald-500/40 text-emerald-400" :
          isClosed   ? "border-amber-500/40 text-amber-400" :
                       "border-gold/40 text-gold"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${
            isResolved ? "bg-emerald-400" : isClosed ? "bg-amber-400" : "bg-gold"
          }`} />
          {isResolved ? "Résolu" : isClosed ? "Délibération" : "Ouvert"}
        </span>
      </div>

      {/* Bannière gagnant */}
      {isResolved && contest.winner_name && (
        <div className="relative rounded-2xl border gold-line overflow-hidden p-6">
          <div className="pointer-events-none absolute inset-0 opacity-80"
            style={{ background: "radial-gradient(80% 140% at 60% -10%, rgba(46,230,168,0.15), transparent 55%)" }} />
          <div className="relative">
            <div className="font-mono text-[10px] uppercase tracking-widest2 text-gold/80">Résultat</div>
            <p className="mt-2 font-display text-[22px] text-bone">
              🏆 {contest.winner_name} remporte {fmtPrice(contest.prize_usd)} !
            </p>
            <p className="mt-1.5 text-[13px] text-mist">
              Prix réel à 21h : <span className="text-bone font-semibold">{fmtPrice(contest.btc_price_at_21h)}</span>
            </p>
          </div>
        </div>
      )}

      {/* Bloc vainqueur : saisie adresse */}
      {isWinner && !contest.winner_address && (
        <div className="rounded-2xl border gold-line bg-gold/[0.05] p-6 space-y-4">
          <p className="font-display text-[16px] text-bone">
            🎉 Vous êtes le gagnant ! Renseignez votre adresse BEP20 / ERC20 pour recevoir votre gain.
          </p>
          <p className="text-[12.5px] text-mist">
            Puis contactez <a href="https://t.me/clubdesinformateurs" target="_blank" rel="noopener noreferrer"
              className="text-gold underline">@clubdesinformateurs</a> sur Telegram pour confirmer.
          </p>
          <form onSubmit={handleAddress} className="flex gap-2 flex-wrap">
            <input
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="0x... ou bnb1..."
              className="flex-1 min-w-[200px] rounded-xl border hairline bg-ink-900 px-4 py-2.5 text-[13px] text-bone placeholder-mist/40 focus:outline-none focus:border-gold/50"
            />
            <button type="submit" disabled={addrState === "loading" || addrState === "done"}
              className="btn-gold rounded-full px-5 py-2.5 text-[13px] font-semibold whitespace-nowrap">
              {addrState === "loading" ? "…" : addrState === "done" ? "Enregistré ✓" : "Envoyer"}
            </button>
          </form>
          {addrMsg && (
            <p className={`text-[12.5px] ${addrState === "error" ? "text-rose-400" : "text-emerald-400"}`}>{addrMsg}</p>
          )}
        </div>
      )}

      {/* Formulaire de prédiction */}
      {!isResolved && !isClosed && (
        <div className="rounded-2xl border hairline bg-ink-800/40 p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-display text-[15px] text-bone">Prédisez le prix du BTC à 21h</p>
              <p className="text-[12.5px] text-mist/70 mt-0.5">
                Deadline : <span className="text-bone">19h30</span> · 1 prédiction par participant
              </p>
            </div>
            {countdown && !deadlinePassed && (
              <div className="font-mono text-[13px] text-gold border gold-line rounded-full px-3 py-1">
                ⏱ {countdown}
              </div>
            )}
            {deadlinePassed && (
              <div className="font-mono text-[12px] text-mist/50 border hairline rounded-full px-3 py-1">
                Délibération en cours…
              </div>
            )}
          </div>

          {alreadyPredicted ? (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <span className="text-[20px]">✅</span>
              <div>
                <p className="text-[13.5px] text-bone font-medium">Prédiction enregistrée</p>
                <p className="text-[12.5px] text-mist/70">
                  Votre prédiction : <span className="text-bone font-semibold">{fmtPrice(myPred.predicted_price)}</span>
                  {myRank && !isResolved && <span className="ml-2 text-mist/50">· #{myRank} dans le classement</span>}
                </p>
              </div>
            </div>
          ) : deadlinePassed ? (
            <p className="text-[13px] text-mist/60">
              La deadline est passée. Résultats disponibles dès 21h.
            </p>
          ) : (
            <form onSubmit={handlePredict} className="space-y-3">
              {!isLogged && (
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Votre prénom (affiché dans le classement)"
                  maxLength={40}
                  className="w-full rounded-xl border hairline bg-ink-900 px-4 py-2.5 text-[13px] text-bone placeholder-mist/40 focus:outline-none focus:border-gold/50"
                />
              )}
              <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[140px]">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist/60 text-[13px]">$</span>
                  <input
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="Prix BTC en USD"
                    min="1000"
                    max="10000000"
                    step="1"
                    className="w-full rounded-xl border hairline bg-ink-900 pl-7 pr-4 py-2.5 text-[13px] text-bone placeholder-mist/40 focus:outline-none focus:border-gold/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <button type="submit"
                  disabled={submitState === "loading" || submitState === "done"}
                  className="btn-gold rounded-full px-6 py-2.5 text-[13px] font-semibold whitespace-nowrap">
                  {submitState === "loading" ? "…" : submitState === "done" ? "Enregistré ✓" : "Prédire"}
                </button>
              </div>
              {submitMsg && (
                <p className={`text-[12.5px] ${submitState === "error" ? "text-rose-400" : "text-emerald-400"}`}>
                  {submitMsg}
                </p>
              )}
            </form>
          )}
        </div>
      )}

      {/* Classement */}
      <div className="rounded-2xl border hairline bg-ink-800/40 overflow-hidden">
        <div className="px-5 py-3 border-b hairline flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">Classement</span>
          <span className="text-[12px] text-mist/50">{contest.predictions.length} participant{contest.predictions.length !== 1 ? "s" : ""}</span>
        </div>
        {contest.predictions.length === 0 ? (
          <div className="px-5 py-8 text-center text-[13px] text-mist/50">
            Aucune prédiction pour l'instant. Soyez le premier !
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {contest.predictions.map((p, i) => {
              const isMine = myPred && p.id === myPred.id;
              const isW = p.is_winner;
              return (
                <div key={p.id}
                  className={`px-5 py-3.5 flex items-center gap-3 ${isMine ? "bg-gold/[0.04]" : ""} ${isW ? "bg-emerald-500/[0.06]" : ""}`}>
                  <Medal rank={i + 1} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[13.5px] font-medium ${isMine ? "text-gold" : "text-bone"}`}>
                        {p.display_name}
                      </span>
                      {isMine && <span className="text-[10px] text-gold/70 font-mono">(vous)</span>}
                      {isW && <span className="text-[11px] text-emerald-400 font-semibold">🏆 Gagnant</span>}
                    </div>
                    {isResolved && p.delta != null && (
                      <div className="text-[11.5px] text-mist/60 mt-0.5">
                        Écart : {p.delta < 1 ? "< $1" : fmtPrice(p.delta)}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-display text-[15px] ${isMine ? "text-gold" : "text-bone"}`}>
                      {isResolved ? fmtPrice(p.predicted_price) : (isMine || alreadyPredicted ? fmtPrice(p.predicted_price) : "—")}
                    </div>
                    {!isResolved && !isMine && !alreadyPredicted && (
                      <div className="text-[10px] text-mist/40">révélé après</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[11.5px] text-mist/40 text-center">
        Concours organisé tous les 3 jours · 1 prédiction par participant · Gain versé en crypto (BEP20/ERC20)
      </p>
    </div>
  );
}
