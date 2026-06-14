"use client";
import { useState, useEffect } from "react";
import { TESTIMONIALS } from "@/lib/testimonials";

export default function TestimonialCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(id);
  }, []);
  const t = TESTIMONIALS[idx];
  return (
    <div className="rounded-xl border hairline bg-white/[0.02] px-4 py-3 min-h-[90px] flex flex-col justify-between">
      <p className="text-[12.5px] leading-relaxed text-mist/80 italic">"{t.text}"</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <a href={t.link} target="_blank" rel="noopener noreferrer"
           className="flex items-center gap-1.5 font-mono text-[11px] text-gold/80 hover:text-gold transition-colors">
          — {t.name}
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden>
            <path d="M9.04 15.47 8.7 20.3c.46 0 .66-.2.9-.43l2.16-2.07 4.48 3.28c.82.45 1.41.21 1.63-.76l2.95-13.81c.26-1.2-.44-1.67-1.24-1.38L2.5 9.66c-1.18.46-1.16 1.12-.2 1.42l4.71 1.47L17.9 6.6c.5-.33.96-.15.58.18z" />
          </svg>
        </a>
        <div className="flex gap-1">
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-gold" : "w-1.5 bg-white/20"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
