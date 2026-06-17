"use client";

import { useEffect, useMemo, useState } from "react";
import QuizCard from "./QuizCard";
import { TRADING_LEVELS, TRADING_BADGES, TRADING_CASE_STUDIES } from "@/lib/trading";
import { progressGet, progressSave } from "@/lib/clientStore";
import { Locked } from "./UnlockProvider";

const TONE = {
  amber: { ring: "ring-amber-500/30",  text: "text-amber-400",  bar: "bg-amber-500",  dot: "bg-amber-500"  },
  orange:{ ring: "ring-orange-500/30", text: "text-orange-400", bar: "bg-orange-500", dot: "bg-orange-500" },
  rose:  { ring: "ring-rose-500/30",   text: "text-rose-400",   bar: "bg-rose-500",   dot: "bg-rose-500"   },
};

const ALL_MODULES = TRADING_LEVELS.flatMap((l) =>
  l.modules.map((m) => ({ ...m, levelId: l.id, tone: l.tone }))
);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Clé namespace pour la progression trading (séparé de l'invest)
const PROG_KEY = "trading";

function computeTradingBadges(p) {
  const done = p.done || {};
  const lvlDone = (lid) =>
    TRADING_LEVELS.find((l) => l.id === lid).modules.every((m) => done[m.id]);
  const b = new Set();
  if (lvlDone("t1")) b.add("t-analyst");
  if (lvlDone("t2")) b.add("t-momentum");
  if (lvlDone("t3")) b.add("t-pro");
  const risk = done["t2m2"];
  if (risk && risk.score === risk.total) b.add("t-risk-master");
  if ((p.streak || 0) >= 7) b.add("t-streak");
  return [...b];
}

export default function TradingAcademy({ onBack }) {
  const [progress, setProgress] = useState(null);
  const [active, setActive] = useState(null);
  const [mode, setMode] = useState("lesson");
  const [openCase, setOpenCase] = useState(null);

  useEffect(() => {
    (async () => {
      const all = (await progressGet()) || {};
      // La progression trading est stockée sous la clé "trading" dans l'objet global
      const p = all[PROG_KEY] || {};
      p.done = p.done || {};
      const t = todayStr();
      if (p.lastDay !== t) {
        const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        p.streak = p.lastDay === yest ? (p.streak || 0) + 1 : 1;
        p.lastDay = t;
        await progressSave({ ...all, [PROG_KEY]: p });
      }
      setProgress({ ...p, _all: all });
    })();
  }, []);

  const stats = useMemo(() => {
    if (!progress) return null;
    const done = progress.done || {};
    const ids = Object.keys(done);
    const totalQ = ids.reduce((s, k) => s + (done[k].total || 0), 0);
    const goodQ  = ids.reduce((s, k) => s + (done[k].score || 0), 0);
    const accuracy = totalQ ? Math.round((goodQ / totalQ) * 100) : 0;
    const completedLevels = TRADING_LEVELS.filter((l) =>
      l.modules.every((m) => done[m.id])
    ).length;
    const levelLabel = ["Débutant", "Intermédiaire", "Avancé", "Expert"][completedLevels] || "Expert";
    const badges = computeTradingBadges(progress);
    return { xp: progress.xp || 0, accuracy, streak: progress.streak || 0, modulesDone: ids.length, modulesTotal: ALL_MODULES.length, levelLabel, badges };
  }, [progress]);

  async function completeQuiz(moduleId, { score, total }) {
    const p = { ...(progress || {}) };
    const all = p._all || {};
    p.done = { ...(p.done || {}) };
    const prev = p.done[moduleId];
    if (!prev || score > prev.score) p.done[moduleId] = { score, total };
    p.xp = (p.xp || 0) + score * 20;
    p.history = [{ moduleId, score, total, ts: Date.now() }, ...(p.history || [])].slice(0, 30);
    p.badges = computeTradingBadges(p);
    const { _all: _, ...pClean } = p;
    await progressSave({ ...all, [PROG_KEY]: pClean });
    setProgress({ ...p, _all: { ...all, [PROG_KEY]: pClean } });
    setMode("lesson");
    setActive(null);
  }

  if (!progress || !stats) {
    return <div className="text-mist text-[14px]">Chargement…</div>;
  }

  // Vue module
  if (active) {
    const tone = TONE[active.tone];
    return (
      <div className="max-w-3xl">
        <button
          onClick={() => { setActive(null); setMode("lesson"); }}
          className="text-[13px] text-mist hover:text-bone mb-5"
        >
          ← Retour au parcours Trading
        </button>
        <div className="rounded-2xl border hairline bg-ink-800/50 p-6">
          <div className={`font-mono text-[10px] uppercase tracking-widest2 ${tone.text}`}>Module</div>
          <h3 className="mt-2 font-display text-[24px] text-bone">{active.title}</h3>
          {mode === "lesson" ? (
            <>
              <ul className="mt-5 space-y-3">
                {active.points.map((pt, i) => (
                  <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed text-slate-200">
                    <span className={`mt-2 h-1.5 w-1.5 rounded-full shrink-0 ${tone.dot}`} />
                    {pt}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setMode("quiz")}
                className="mt-7 rounded-lg bg-amber-500 px-6 py-3 text-[14px] font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
              >
                Lancer le quiz ({active.quiz.length} questions)
              </button>
            </>
          ) : (
            <div className="mt-6">
              <QuizCard
                questions={active.quiz}
                onComplete={(r) => completeQuiz(active.id, r)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vue d'accueil Trading
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-[13px] text-mist hover:text-bone">← Retour</button>
        <div className="flex items-center gap-2">
          <h3 className="font-display text-[18px] text-bone">Pôle Trading — Academy</h3>
          <span className="font-mono text-[9px] uppercase tracking-widest2 text-amber-400 border border-amber-500/30 rounded px-1.5 py-0.5">
            formation
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Niveau" value={stats.levelLabel} accent="text-amber-400" />
        <Stat label="XP total" value={stats.xp} />
        <Stat label="Précision" value={`${stats.accuracy} %`} accent="text-emerald-400" />
        <Stat label="Série" value={`${stats.streak} j 🔥`} />
      </div>

      {/* Badges */}
      <div className="mt-4 rounded-2xl border hairline bg-ink-800/50 p-5">
        <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70 mb-3">
          Badges ({stats.badges.length}/{TRADING_BADGES.length})
        </div>
        <div className="flex flex-wrap gap-2.5">
          {TRADING_BADGES.map((b) => {
            const earned = stats.badges.includes(b.id);
            return (
              <div
                key={b.id}
                title={b.desc}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] ${
                  earned
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
                    : "border-white/8 bg-white/[0.02] text-mist/50"
                }`}
              >
                <span className={earned ? "" : "grayscale opacity-50"}>{b.icon}</span>
                {b.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Parcours */}
      <Locked className="mt-6 block" label="Déverrouiller les modules">
      <div className="mt-6 space-y-5">
        {TRADING_LEVELS.map((l) => {
          const tone = TONE[l.tone];
          const doneCount = l.modules.filter((m) => progress.done[m.id]).length;
          const pct = Math.round((doneCount / l.modules.length) * 100);
          return (
            <div key={l.id} className={`rounded-2xl border bg-ink-800/40 p-6 ring-1 ${tone.ring}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-display text-[19px] text-bone">{l.label}</h4>
                  <p className="mt-1 text-[13px] text-mist max-w-prose2">{l.summary}</p>
                </div>
                <span className={`font-mono text-[12px] ${tone.text}`}>{pct}%</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className={`h-full ${tone.bar}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-5 grid sm:grid-cols-2 gap-3">
                {l.modules.map((m) => {
                  const d = progress.done[m.id];
                  return (
                    <button
                      key={m.id}
                      onClick={() => { setActive({ ...m, tone: l.tone }); setMode("lesson"); }}
                      className="text-left rounded-xl border hairline bg-white/[0.015] hover:border-amber-500/40 p-4 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[14.5px] text-bone">{m.title}</span>
                        {d ? (
                          <span className="text-[11px] text-emerald-400">✓ {d.score}/{d.total}</span>
                        ) : (
                          <span className="text-[11px] text-mist/50">à faire</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      </Locked>

      {/* Live Market Breakdowns */}
      <div className="mt-8">
        <h3 className="font-display text-[18px] text-bone mb-1">Live Market Breakdowns</h3>
        <p className="text-[13px] text-mist mb-4">
          Cas pédagogiques inspirés de situations de marché réelles — scalping, intraday, futures.
        </p>
        <Locked label="Déverrouiller les cas pratiques">
        <div className="space-y-3">
          {TRADING_CASE_STUDIES.map((c) => {
            const open = openCase === c.id;
            return (
              <div key={c.id} className="rounded-2xl border hairline bg-ink-800/40 overflow-hidden">
                <button
                  onClick={() => setOpenCase(open ? null : c.id)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest2 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5">
                      {c.tag}
                    </span>
                    <span className="font-display text-[16px] text-bone">{c.asset}</span>
                  </div>
                  <span className={`text-amber-400 transition-transform ${open ? "rotate-45" : ""}`}>+</span>
                </button>
                {open && (
                  <div className="px-5 pb-5 border-t hairline">
                    <p className="mt-4 text-[13.5px] leading-relaxed text-slate-300">{c.context}</p>
                    <ol className="mt-4 space-y-2">
                      {c.steps.map((s, i) => (
                        <li key={i} className="flex gap-3 text-[13.5px] text-mist">
                          <span className="font-mono text-amber-400/80 text-[12px]">{i + 1}.</span>
                          {s}
                        </li>
                      ))}
                    </ol>
                    <div className="mt-4 grid sm:grid-cols-2 gap-3">
                      <Info label="Décision" value={c.decision} />
                      <Info label="Résultat (pédagogique)" value={c.outcome} />
                    </div>
                    <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
                      <div className="font-mono text-[10px] uppercase tracking-widest2 text-amber-400">Débrief</div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300">{c.debrief}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </Locked>
      </div>

      <p className="mt-6 text-[11.5px] leading-relaxed text-mist/60">
        Contenu strictement pédagogique. Ne constitue pas un conseil en investissement et ne
        garantit aucun résultat. Tout trading comporte un risque de perte en capital.
      </p>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-2xl border hairline bg-ink-800/50 p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70">{label}</div>
      <div className={`mt-2 font-display text-[24px] ${accent || "text-bone"}`}>{value}</div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border hairline bg-white/[0.015] p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/60">{label}</div>
      <p className="mt-1 text-[13.5px] text-bone">{value}</p>
    </div>
  );
}
