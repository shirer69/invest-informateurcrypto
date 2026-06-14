"use client";

import { useState } from "react";

export default function FounderPhoto({ src = "/julien.jpg", alt = "Julien Moretto", href }) {
  const [failed, setFailed] = useState(false);
  const Wrapper = href ? "a" : "div";

  return (
    <Wrapper href={href} className={`relative block aspect-[4/5] bg-gradient-to-b from-ink-600 to-ink-900 overflow-hidden${href ? " cursor-pointer" : ""}`}>
      <div
        className="absolute inset-0 opacity-60"
        style={{ background: "radial-gradient(70% 50% at 50% 15%, rgba(46,230,168,0.16), transparent 60%)" }}
      />
      {/* Repli monogramme (visible si la photo manque) */}
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-[88px] leading-none text-bone/15 select-none">JM</span>
      </div>

      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover object-center grayscale contrast-[1.05]"
          loading="lazy"
        />
      )}

      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-ink-900 to-transparent" />
    </Wrapper>
  );
}
