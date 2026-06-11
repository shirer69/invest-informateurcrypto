import { NextResponse } from "next/server";
import { getSpotKeys, spotTradesHistory, spotTicker } from "@/lib/krakenSpot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QUOTES = ["ZUSD", "USD", "ZEUR", "EUR", "USDT", "USDC"];

function splitPair(pair) {
  const p = (pair || "").toUpperCase();
  const quote = QUOTES.find((q) => p.endsWith(q)) || "USD";
  let base = p.slice(0, p.length - quote.length).replace(/^[XZ]/, "");
  if (base.length === 4 && base[0] === "X") base = base.slice(1);
  return { base, quote: quote.replace(/^Z/, "") };
}

export async function GET() {
  const { configured } = getSpotKeys();
  if (!configured) return NextResponse.json({ ok: false, error: "not_configured" });

  // Pagination de l'historique des trades
  let trades = [];
  for (let ofs = 0; ofs < 500; ofs += 50) {
    const th = await spotTradesHistory(ofs).catch(() => null);
    const batch = th?.result?.trades ? Object.values(th.result.trades) : [];
    if (!batch.length) break;
    trades = trades.concat(batch);
    if (batch.length < 50) break;
  }
  trades.sort((a, b) => (a.time || 0) - (b.time || 0));

  // Taux EUR->USD pour homogénéiser en USD
  let eurusd = 1;
  try {
    const t = await spotTicker(["EURUSD"]);
    for (const [k, v] of Object.entries(t)) if (k.includes("EUR") && v?.c?.[0]) eurusd = parseFloat(v.c[0]);
  } catch {}
  const toUsd = (amount, quote) => amount * (quote === "EUR" ? eurusd : 1);

  const months = {}; // YYYY-MM -> { spot, margin }
  const add = (month, kind, usd) => {
    if (!month) return;
    months[month] = months[month] || { spot: 0, margin: 0 };
    months[month][kind] += usd;
  };

  const pos = {}; // base -> { vol, cost } (prix de revient FIFO moyen pondéré, en quote)

  for (const t of trades) {
    const month = new Date((t.time || 0) * 1000).toISOString().slice(0, 7);
    const { base, quote } = splitPair(t.pair);
    const vol = parseFloat(t.vol) || 0;
    const cost = parseFloat(t.cost) || 0;
    const fee = parseFloat(t.fee) || 0;
    const isMargin = (parseFloat(t.margin) || 0) > 0 || t.posstatus;

    // Marge : PnL réalisé fourni par Kraken (champ net) sur les clôtures
    if (isMargin) {
      const net = t.net != null ? parseFloat(t.net) : null;
      if (net != null && !Number.isNaN(net)) add(month, "margin", toUsd(net, quote));
      continue;
    }

    // Spot : FIFO (coût moyen pondéré)
    const k = base;
    pos[k] = pos[k] || { vol: 0, cost: 0 };
    if (t.type === "buy") {
      pos[k].vol += vol;
      pos[k].cost += cost + fee; // prix de revient inclut les frais
    } else if (t.type === "sell" && pos[k].vol > 0) {
      const avg = pos[k].cost / pos[k].vol;
      const sold = Math.min(vol, pos[k].vol);
      const proceeds = cost - fee;
      const realized = proceeds - avg * sold; // PnL réalisé en quote
      add(month, "spot", toUsd(realized, quote));
      pos[k].vol -= sold;
      pos[k].cost = Math.max(0, pos[k].cost - avg * sold);
    }
  }

  const out = Object.entries(months)
    .map(([month, v]) => ({ month, spot: +v.spot.toFixed(2), margin: +v.margin.toFixed(2) }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return NextResponse.json({ ok: true, months: out });
}
