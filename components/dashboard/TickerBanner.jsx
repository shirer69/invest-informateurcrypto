"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/site";

const REFRESH_MS = 60_000;

const FMT = {
  BTC:    { decimals: 0, prefix: "$" },
  ETH:    { decimals: 2, prefix: "$" },
  SP500:  { decimals: 2, prefix: "" },
  Nasdaq: { decimals: 2, prefix: "" },
  Gold:   { decimals: 2, prefix: "$" },
  WTI:    { decimals: 2, prefix: "$" },
};

function fmt(sym, price) {
  const { decimals, prefix } = FMT[sym] || { decimals: 2, prefix: "" };
  return prefix + price.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function TickerItem({ sym, label, price, change }) {
  const pos = change >= 0;
  return (
    <span className="inline-flex items-center gap-1.5 px-4">
      <span className="font-mono text-[11px] text-mist/50 shrink-0">{label}</span>
      <span className="font-mono text-[12px] font-semibold text-bone shrink-0">{fmt(sym, price)}</span>
      <span className={`font-mono text-[11px] shrink-0 ${pos ? "text-emerald-400" : "text-rose-400"}`}>
        {pos ? "+" : ""}{change.toFixed(2)}%
      </span>
    </span>
  );
}

export default function TickerBanner() {
  const [items, setItems] = useState([]);
  const intervalRef = useRef(null);

  async function load() {
    try {
      const r = await fetch(`${API_BASE}/api/ticker`, { cache: "no-store" });
      const d = await r.json();
      if (d.ok && d.items?.length) setItems(d.items);
    } catch {}
  }

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, REFRESH_MS);
    return () => clearInterval(intervalRef.current);
  }, []);

  if (!items.length) return null;

  // Duplicate items for seamless loop
  const track = [...items, ...items];

  return (
    <div className="w-full overflow-hidden border-b border-white/[0.06] bg-ink-900/80 backdrop-blur-sm h-8 flex items-center">
      <div
        className="flex items-center whitespace-nowrap ticker-scroll"
        style={{ "--item-count": items.length }}
      >
        {track.map((item, i) => (
          <TickerItem key={`${item.sym}-${i}`} {...item} />
        ))}
      </div>

      <style>{`
        .ticker-scroll {
          animation: ticker-move calc(var(--item-count, 6) * 4s) linear infinite;
          will-change: transform;
        }
        @keyframes ticker-move {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
