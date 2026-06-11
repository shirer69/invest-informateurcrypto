"use client";

import { useEffect, useMemo, useState } from "react";
import QuizCard from "./QuizCard";
import { LEVELS, BADGES, CASE_STUDIES } from "@/lib/academy";
import { progressGet, progressSave } from "@/lib/clientStore";
import { Locked } from "./UnlockProvider";

const TONE = {
  emerald: { ring: "ring-emerald-500/30", text: "text-emerald-400", bar: "bg-emerald-500", dot: "bg-emerald-500" },
  cyan: { ring: "ring-cyan-500/30", text: "text-cyan-400", bar: "bg-cyan-500", dot: "bg-cyan-500" },
  violet: { ring: "ring-violet-500/30", text: "text-violet-400", bar: "bg-violet-500", dot: "bg-violet-500" },
};

const ALL_MODULES = LEVELS.flatMap((l) =>
  l.modules.map((m) => ({ ...m, levelId: l.id, tone: l.tone }))
);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function computeBadges(p) {
  const done = p.done || {};
  const lvlDone = (lid) =>
    LEVELS.find((l) => l.id === lid).modules.every((m) => done[m.id]);
  const b = new Set();
  if (lvlDone("l1")) b.add("market-analyst");
  if (lvlDone("l2")) b.add("liquidity-hunter");
  if (lvlDone("l3")) b.add("institutional");
  const risk = done["l2m3"];
  if (risk && risk.score === risk.total) b.add("risk-manager");
  if ((p.streak || 0) >= 7) b.add("streak-7");
  return [...b];
}

export default function Academy() {
  const [progress, setProgress] = useState(null);
  const [active, setActive] = useState(null); // module
  const [mode, setMode] = useState("lesson"); // lesson | quiz
  const [openCase, setOpenCase] = useState(null);

  useEffect(() => {
    (async () => {
      const p = (await progressGet()) || {};
      p.done = p.done || {};
      // streak quotidien
      const t = todayStr();
      if (p.lastDay !== t) {
        const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        p.streak = p.lastDay === yest ? (p.streak || 0) + 1 : 1;
        p.lastDay = t;
        await progressSave(p);
      }
      setProgress({ ...p });
    })();
  }, []);

  const stats = useMemo(() => {
    if (!progress) return null;
    const done = progress.done || {};
    const ids = Object.keys(done);
    const totalQ = ids.reduce((s, k) => s + (done[k].total || 0), 0);
    const goodQ = ids.reduce((s, k) => s + (done[k].score || 0), 0);
    const accuracy = totalQ ? Math.round((goodQ / totalQ) * 100) : 0;
    const completedLevels = LEVELS.filter((l) =>
      l.modules.every((m) => done[m.id])
    ).length;
    const levelLabel = ["Débutant", "Intermédiaire", "Avancé", "Expert"][completedLevels] || "Expert";
    const badges = computeBadges(progress);
    return {
      xp: progress.xp || 0,
      accuracy,
      streak: progress.streak || 0,
      modulesDone: ids.length,
      modulesTotal: ALL_MODULES.length,
      levelLabel,
      badges,
    };
  }, [progress]);

  function completeQuiz(moduleId, { score, total }) {
    const p = { ...(progress || {}) };
    p.done = { ...(p.done || {}) };
    const prev = p.done[moduleId];
    // on garde le meilleur score
    if (!prev || score > prev.score) p.done[moduleId] = { score, total };
    p.xp = (p.xp || 0) + score * 20;
    p.history = [
      { moduleId, score, total, ts: Date.now() },
      ...(p.history || []),
    ].slice(0, 30);
    p.badges = computeBadges(p);
    progressSave(p);
    setProgress(p);
    setMode("lesson");
    setActive(null);
  }

  if (!progress || !stats) {
    return <div className="text-mist text-[14px]">Chargement…</div>;
  }

  // Vue module (leçon + quiz)
  if (active) {
    const tone = TONE[active.tone];
    return (
      <div className="max-w-3xl">
        <button
          onClick={() => { setActive(null); setMode("lesson"); }}
          className="text-[13px] text-mist hover:text-bone mb-5"
        >
          ← Retour au parcours
        </button>
        <div className="rounded-2xl border hairline bg-ink-800/50 p-6">
          <div className={`font-mono text-[10px] uppercase tracking-widest2 ${tone.text}`}>
            Module
          </div>
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
                className="mt-7 rounded-lg bg-cyan-500 px-6 py-3 text-[14px] font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
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

  // Vue d'accueil
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-display text-[18px] text-bone">Academy Pôle Invest</h3>
        <span className="font-mono text-[9px] uppercase tracking-widest2 text-cyan-400 border border-cyan-500/30 rounded px-1.5 py-0.5">
          formation
        </span>
      </div>

      {/* ProgressTracker */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Niveau" value={stats.levelLabel} accent="text-cyan-400" />
        <Stat label="XP total" value={stats.xp} />
        <Stat label="Précision" value={`${stats.accuracy} %`} accent="text-emerald-400" />
        <Stat label="Série" value={`${stats.streak} j 🔥`} />
      </div>

      {/* Badges */}
      <div className="mt-4 rounded-2xl border hairline bg-ink-800/50 p-5">
        <div className="font-mono text-[10px] uppercase tracking-widest2 text-mist/70 mb-3">
          Badges ({stats.badges.length}/{BADGES.length})
        </div>
        <div className="flex flex-wrap gap-2.5">
          {BADGES.map((b) => {
            const earned = stats.badges.includes(b.id);
            return (
              <div
                key={b.id}
                title={b.desc}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] ${
                  earned
                    ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-100"
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

      {/* Parcours (modules verrouillés) */}
      <Locked className="mt-6 block" label="Déverrouiller les modules">
      <div className="mt-6 space-y-5">
        {LEVELS.map((l) => {
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
                      className="text-left rounded-xl border hairline bg-white/[0.015] hover:border-cyan-500/40 p-4 transition-colors"
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

      {/* Live Market Breakdowns (verrouillés) */}
      <div className="mt-8">
        <h3 className="font-display text-[18px] text-bone mb-1">Live Market Breakdowns</h3>
        <p className="text-[13px] text-mist mb-4">
          Cas pédagogiques inspirés de situations de marché réelles — entièrement reformulés.
        </p>
        <Locked label="Déverrouiller les cas pratiques">
        <div className="space-y-3">
          {CASE_STUDIES.map((c) => {
            const open = openCase === c.id;
            return (
              <div key={c.id} className="rounded-2xl border hairline bg-ink-800/40 overflow-hidden">
                <button
                  onClick={() => setOpenCase(open ? null : c.id)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest2 text-cyan-400 border border-cyan-500/30 rounded-full px-2 py-0.5">
                      {c.tag}
                    </span>
                    <span className="font-display text-[16px] text-bone">{c.asset}</span>
                  </div>
                  <span className={`text-cyan-400 transition-transform ${open ? "rotate-45" : ""}`}>+</span>
                </button>
                {open && (
                  <div className="px-5 pb-5 border-t hairline">
                    <p className="mt-4 text-[13.5px] leading-relaxed text-slate-300">{c.context}</p>
                    <ol className="mt-4 space-y-2">
                      {c.steps.map((s, i) => (
                        <li key={i} className="flex gap-3 text-[13.5px] text-mist">
                          <span className="font-mono text-cyan-400/80 text-[12px]">{i + 1}.</span>
                          {s}
                        </li>
                      ))}
                    </ol>
                    <div className="mt-4 grid sm:grid-cols-2 gap-3">
                      <Info label="Décision" value={c.decision} />
                      <Info label="Résultat (pédagogique)" value={c.outcome} />
                    </div>
                    <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.05] p-4">
                      <div className="font-mono text-[10px] uppercase tracking-widest2 text-cyan-400">Débrief</div>
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
        garantit aucun résultat. Tout investissement comporte un risque de perte en capital.
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
