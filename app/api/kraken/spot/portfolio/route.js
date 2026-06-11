import { NextResponse } from "next/server";
import {
  getSpotKeys,
  spotBalance,
  spotTradeBalance,
  spotTicker,
  spotOHLC,
} from "@/lib/krakenSpot";

// Référence de performance : cours de chaque actif au 1er juin 2026 (00:00 UTC).
const BASELINE_TS = Math.floor(Date.UTC(2026, 5, 1) / 1000); // mois index 5 = juin

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

  // Baseline de performance : cours de CHAQUE actif au 1er juin 2026 (OHLC journalier).
  // P&L = progression depuis ce cours (même pour les actifs détenus avant le 1er juin).
  const baselineByNorm = {};
  const baseNorms = [...new Set(pairAssets)]; // hors USD/ZUSD
  await Promise.all(
    baseNorms.map(async (norm) => {
      try {
        // `since` quelques jours avant pour garantir la bougie du 1er juin.
        const res = await spotOHLC(`${norm}USD`, BASELINE_TS - 3 * 86400, 1440);
        for (const [k, candles] of Object.entries(res)) {
          if (k === "last" || !Array.isArray(candles)) continue;
          // 1ère bougie dont le temps >= 1er juin → cours d'ouverture de ce jour.
          const c = candles.find((row) => Number(row[0]) >= BASELINE_TS);
          if (c) { baselineByNorm[norm] = parseFloat(c[1]); break; } // [time, open, ...]
        }
      } catch {}
    })
  );

  const holdings = entries.map((e) => {
    const kind = classify(e.norm);
    const price = kind === "cash" && e.norm === "USD" ? 1 : priceFor(e.norm);
    const value = price !== null ? e.amount * price : null;
    // baseline = prix unitaire au 1er juin ; cost = valeur de référence (qté × baseline).
    const baseline = baselineByNorm[e.norm] != null ? baselineByNorm[e.norm] : null;
    const cost = baseline != null ? e.amount * baseline : null;
    return { asset: e.asset, symbol: e.norm, amount: e.amount, price, value, baseline, cost, kind };
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
