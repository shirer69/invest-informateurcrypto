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
// Xstocks Kraken : symboles se terminant par .T (ex: QQQx.T, NVDAx.T)
const isStock = (b) => STOCKS.has(b) || STOCKS.has((b || "").replace(/X$/i, "")) || (b || "").endsWith(".T");

export async function GET() {
  const { configured } = getSpotKeys();
  if (!configured) return NextResponse.json({ ok: false, error: "not_configured" });

  // ── 1. Trades Kraken classiques (spot + marge) ───────────────────────────
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
      side: t.type,
      cat,
      price: parseFloat(t.price) || null,
      vol: parseFloat(t.vol) || null,
      cost: parseFloat(t.cost) || null,
      fee: parseFloat(t.fee) || null,
    };
  });

  // ── 2. Xstocks depuis master_trade_events (VPS) ──────────────────────────
  // Les Xstocks Kraken n'apparaissent pas dans TradesHistory — produit séparé.
  try {
    const vps = await fetch("https://api.informateurcrypto.fr/api/julien/trade-history", {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    }).then((r) => r.json()).catch(() => null);

    const xstockEvents = (vps?.spot_events || []).filter((e) => e.type === "stock");
    for (const e of xstockEvents) {
      trades.push({
        ts: e.entry_ts || e.created_at,
        market: `${e.symbol}/USD`,
        base: e.symbol,
        side: e.direction === "achat" ? "buy" : "sell",
        cat: "xstocks",
        price: e.entry_price ?? null,
        vol: e.amount ?? null,
        cost: e.entry_price && e.amount ? e.entry_price * e.amount : null,
        fee: null,
      });
    }
  } catch (_) {}

  trades.sort((a, b) => b.ts - a.ts);

  return NextResponse.json({ ok: true, trades });
}
