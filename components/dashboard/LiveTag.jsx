"use client";

// Badge "LIVE" vert avec point pulsant — remplace les mentions "lecture seule" / "démo".
export default function LiveTag({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest2 text-emerald-400 border border-emerald-500/40 rounded px-1.5 py-0.5 ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      LIVE
    </span>
  );
}
