import { NextResponse } from "next/server";
import {
  getSpotKeys,
  spotBalance,
  spotTradeBalance,
  spotTicker,
  spotTradesHistory,
} from "@/lib/krakenSpot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIAT = new Set(["USD", "EUR", "GBP", "CHF", "CAD", "AUD", "JPY", "USDT", "USDC", "DAI"]);
const STOCKS = new Set([
  "AAPL", "TSLA", "NVDA", "MSFT", "AMZN", "GOOGL", "GOOG", "META", "NFLX", "AMD",
  "SPY", "QQQ", "COIN", "MSTR", "PLTR", "INTC", "DIS", "BABA", "ABNB", "MCD",
]);

function normalize(asset) {
  let a = asset;
  // Kraken legacy : préfixe X (crypto) / Z (fiat) sur codes à 4 lettres
  if (a.length === 4 && (a[0] === "X" || a[0] === "Z")) a = a.slice(1);
  return a;
}

function classify(norm) {
  const base = norm.replace(/X$/i, "");
  if (FIAT.has(norm)) return "cash";
  if (STOCKS.has(norm) || STOCKS.has(base)) return "stock";
  return "crypto";
}

export async function GET() {
  const { configured } = getSpotKeys();
  if (!configured) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 200 });
  }

  const [bal, tb] = await Promise.all([spotBalance(), spotTradeBalance()]);
  if (!bal.ok) {
    return NextResponse.json({ ok: false, error: bal.error }, { status: 200 });
  }

  // BalanceEx renvoie { ASSET: { balance, hold_trade } }
  const raw = bal.result || {};
  const entries = Object.entries(raw)
    .map(([asset, v]) => ({
      asset,
      norm: normalize(asset),
      amount: parseFloat((v && v.balance) ?? v) || 0,
    }))
    .filter((e) => e.amount > 0.00000001);

  // Construire les paires de valorisation USD
  const pairAssets = entries
    .map((e) => e.norm)
    .filter((n) => !["USD", "ZUSD"].includes(n));
  const candidates = [...new Set(pairAssets.map((n) => `${n}USD`))];
  const ticker = await spotTicker(candidates);

  function priceFor(norm) {
    if (norm === "USD") return 1;
    // cherche une clé de résultat correspondant à norm + USD
    for (const [k, val] of Object.entries(ticker)) {
      if (k.includes(norm) && k.endsWith("USD") && val?.c?.[0]) {
        return parseFloat(val.c[0]);
      }
      if (k.replace(/^[XZ]/, "").startsWith(norm) && val?.c?.[0]) {
        return parseFloat(val.c[0]);
      }
    }
    return null;
  }

  // Prix de revient par actif (depuis l'historique des trades) -> P&L
  // Approx : coût restant pondéré, converti en USD (EUR via EURUSD).
  let costByNorm = {};
  try {
    const th = await spotTradesHistory();
    if (th.ok && th.result && th.result.trades) {
      const trades = Object.values(th.result.trades).sort((a, b) => (a.time || 0) - (b.time || 0));
      const QUOTES = ["ZUSD", "USD", "ZEUR", "EUR", "USDT", "USDC"];
      const eurT = await spotTicker(["EURUSD"]);
      let eurusd = 1;
      for (const [k, v] of Object.entries(eurT)) if (k.includes("EUR") && v?.c?.[0]) eurusd = parseFloat(v.c[0]);
      const pos = {}; // pair -> { vol, cost(quote), quote }
      for (const tr of trades) {
        const p = (tr.pair || "").toUpperCase();
        let quote = QUOTES.find((q) => p.endsWith(q));
        if (!quote) continue;
        let base = p.slice(0, p.length - quote.length).replace(/^[XZ]/, "");
        if (base.length === 4 && base[0] === "X") base = base.slice(1);
        quote = quote.replace(/^Z/, "");
        const v = parseFloat(tr.vol) || 0, c = parseFloat(tr.cost) || 0;
        pos[p] = pos[p] || { vol: 0, cost: 0, base, quote };
        if (tr.type === "buy") { pos[p].vol += v; pos[p].cost += c; }
        else if (pos[p].vol > 0) {
          const avg = pos[p].cost / pos[p].vol;
          pos[p].vol = Math.max(0, pos[p].vol - v);
          pos[p].cost = Math.max(0, pos[p].cost - avg * v);
        }
      }
      for (const { vol, cost, base, quote } of Object.values(pos)) {
        if (vol <= 0 || cost <= 0) continue;
        const f = quote === "EUR" ? eurusd : 1;
        costByNorm[base] = (costByNorm[base] || 0) + cost * f;
      }
    }
  } catch {}

  const holdings = entries.map((e) => {
    const kind = classify(e.norm);
    const price = kind === "cash" && e.norm === "USD" ? 1 : priceFor(e.norm);
    const value = price !== null ? e.amount * price : null;
    const cost = costByNorm[e.norm] != null ? costByNorm[e.norm] : null;
    return { asset: e.asset, symbol: e.norm, amount: e.amount, price, value, cost, kind };
  });

  const sum = (k) =>
    holdings.filter((h) => h.kind === k).reduce((s, h) => s + (h.value || 0), 0);

  const tradeEquity =
    tb.ok && tb.result ? parseFloat(tb.result.eb || tb.result.e || "0") : null;

  return NextResponse.json({
    ok: true,
    holdings: holdings.sort((a, b) => (b.value || 0) - (a.value || 0)),
    totals: {
      crypto: sum("crypto"),
      stock: sum("stock"),
      cash: sum("cash"),
      spotEquity: tradeEquity, // valeur de référence Kraken (TradeBalance)
    },
  });
}
