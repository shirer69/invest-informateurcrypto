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
        <span className="font-mono text-[11px] text-gold/80">— {t.name}</span>
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
