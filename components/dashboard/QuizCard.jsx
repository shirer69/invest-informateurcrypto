"use client";

import { useState } from "react";

export default function QuizCard({ questions, onComplete }) {
  const [i, setI] = useState(0);
  const [sel, setSel] = useState([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const q = questions[i];
  const isMulti = q.type === "multiple";
  const isBool = q.type === "boolean";

  const correctSet = isBool ? [q.correct === true ? 1 : 0] : q.correct;

  function toggle(idx) {
    if (checked) return;
    if (isMulti) setSel((s) => (s.includes(idx) ? s.filter((x) => x !== idx) : [...s, idx]));
    else setSel([idx]);
  }

  function check() {
    const ok =
      sel.length === correctSet.length && sel.every((x) => correctSet.includes(x));
    if (ok) setScore((s) => s + 1);
    setChecked(true);
  }

  function next() {
    if (i + 1 < questions.length) {
      setI(i + 1);
      setSel([]);
      setChecked(false);
    } else {
      onComplete?.({ score: score, total: questions.length });
    }
  }

  const opts = isBool ? ["Vrai", "Faux"] : q.options;

  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-slate-400">
        <span>Question {i + 1}/{questions.length}</span>
        <span className="text-cyan-400/80">
          {q.type === "scenario" ? "Scénario" : q.type === "multiple" ? "Choix multiple" : q.type === "boolean" ? "Vrai / Faux" : "QCM"}
        </span>
      </div>

      <h4 className="mt-3 text-[16px] font-medium text-slate-100">{q.q}</h4>

      <div className="mt-4 space-y-2.5">
        {opts.map((o, idx) => {
          const isSel = sel.includes(idx);
          const isCorrect = correctSet.includes(idx);
          let cls =
            "border-white/10 bg-white/[0.02] hover:border-cyan-500/40 text-slate-200";
          if (checked) {
            if (isCorrect) cls = "border-emerald-500/60 bg-emerald-500/10 text-emerald-200";
            else if (isSel) cls = "border-rose-500/60 bg-rose-500/10 text-rose-200";
            else cls = "border-white/5 bg-white/[0.01] text-slate-400";
          } else if (isSel) {
            cls = "border-cyan-500/60 bg-cyan-500/10 text-cyan-100";
          }
          return (
            <button
              key={idx}
              onClick={() => toggle(idx)}
              disabled={checked}
              className={`w-full text-left rounded-xl border px-4 py-3 text-[14px] transition-colors ${cls}`}
            >
              <span className="font-mono text-[11px] mr-2 opacity-60">
                {String.fromCharCode(65 + idx)}
              </span>
              {o}
            </button>
          );
        })}
      </div>

      {checked && (
        <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] p-4">
          <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">
            Explication
          </div>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-300">{q.explain}</p>
        </div>
      )}

      <div className="mt-5 flex justify-end">
        {!checked ? (
          <button
            onClick={check}
            disabled={sel.length === 0}
            className="rounded-lg bg-cyan-500 px-5 py-2.5 text-[14px] font-semibold text-slate-950 disabled:opacity-40 hover:bg-cyan-400 transition-colors"
          >
            Valider
          </button>
        ) : (
          <button
            onClick={next}
            className="rounded-lg bg-emerald-500 px-5 py-2.5 text-[14px] font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
          >
            {i + 1 < questions.length ? "Question suivante" : "Terminer le module"}
          </button>
        )}
      </div>
    </div>
  );
}
