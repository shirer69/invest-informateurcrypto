import { NextResponse } from "next/server";
import { getSpotKeys, spotTradesHistory } from "@/lib/krakenSpot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QUOTES = ["ZUSD", "USD", "ZEUR", "EUR", "USDT", "USDC"];
const STOCKS = new Set([
  "AAPL", "TSLA", "NVDA", "MSFT", "AMZN", "GOOGL", "GOOG", "META", "NFLX", "AMD",
  "SPY", "QQQ", "COIN", "MSTR", "PLTR", "INTC", "DIS", "BABA", "ABNB", "MCD",
]);

function splitPair(pair) {
  const p = (pair || "").toUpperCase();
  const quote = QUOTES.find((q) => p.endsWith(q)) || "USD";
  let base = p.slice(0, p.length - quote.length).replace(/^[XZ]/, "");
  if (base.length === 4 && base[0] === "X") base = base.slice(1);
  return { base, quote: quote.replace(/^Z/, "") };
}
const isStock = (b) => STOCKS.has(b) || STOCKS.has((b || "").replace(/X$/i, ""));

export async function GET() {
  const { configured } = getSpotKeys();
  if (!configured) return NextResponse.json({ ok: false, error: "not_configured" });

  let raw = [];
  for (let ofs = 0; ofs < 300; ofs += 50) {
    const th = await spotTradesHistory(ofs).catch(() => null);
    const batch = th?.ok && th.result?.trades
      ? Object.entries(th.result.trades).map(([id, t]) => ({ id, ...t }))
      : [];
    if (!batch.length) break;
    raw = raw.concat(batch);
    if (batch.length < 50) break;
  }

  const trades = raw.map((t) => {
    const { base, quote } = splitPair(t.pair);
    const isMargin = (parseFloat(t.margin) || 0) > 0 || !!t.posstatus;
    const cat = isMargin ? "marge" : isStock(base) ? "xstocks" : "spot";
    return {
      ts: Math.floor(Number(t.time) || 0),
      market: `${base}/${quote}`,
      base,
      side: t.type, // buy / sell
      cat, // spot | marge | xstocks
      price: parseFloat(t.price) || null,
      vol: parseFloat(t.vol) || null,
      cost: parseFloat(t.cost) || null,
      fee: parseFloat(t.fee) || null,
    };
  });
  trades.sort((a, b) => b.ts - a.ts);

  return NextResponse.json({ ok: true, trades });
}
