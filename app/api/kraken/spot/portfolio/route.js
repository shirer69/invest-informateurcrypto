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

// Caches en mémoire (persistent sur instance serverless chaude).
const _baselineCache = {};            // norm -> cours au 1er juin (FIGÉ, jamais recalculé)
let _portfolioCache = { ts: 0, data: null };
const PORTFOLIO_TTL_MS = 300_000;     // réponse portefeuille réutilisée 5 min
const PORTFOLIO_STALE_MS = 1800_000;  // cache périmé servi si Kraken rate-limite (30 min max)

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

  // Cache court : on réutilise la dernière réponse OK pendant 25 s.
  if (_portfolioCache.data && Date.now() - _portfolioCache.ts < PORTFOLIO_TTL_MS) {
    return NextResponse.json({ ..._portfolioCache.data, cached: true });
  }

  const [bal, tb] = await Promise.all([spotBalance(), spotTradeBalance()]);
  if (!bal.ok) {
    // Rate-limit Kraken : servir le cache périmé plutôt qu'une erreur
    if (_portfolioCache.data && Date.now() - _portfolioCache.ts < PORTFOLIO_STALE_MS) {
      return NextResponse.json({ ..._portfolioCache.data, stale: true, cached: true });
    }
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
  // FIGÉ → mis en cache : on n'interroge l'OHLC que pour les actifs pas encore connus.
  const baseNorms = [...new Set(pairAssets)]; // hors USD/ZUSD
  const missing = baseNorms.filter((n) => _baselineCache[n] === undefined);
  // Appels OHLC en série (max 2 en parallèle) pour ne pas saturer le rate-limit Kraken.
  for (let i = 0; i < missing.length; i += 2) {
    await Promise.all(
      missing.slice(i, i + 2).map(async (norm) => {
        try {
          const res = await spotOHLC(`${norm}USD`, BASELINE_TS - 3 * 86400, 1440);
          let found = null;
          for (const [k, candles] of Object.entries(res)) {
            if (k === "last" || !Array.isArray(candles)) continue;
            const c = candles.find((row) => Number(row[0]) >= BASELINE_TS);
            if (c) { found = parseFloat(c[1]); break; }
          }
          _baselineCache[norm] = found;
        } catch {
          _baselineCache[norm] = null;
        }
      })
    );
  }

  const holdings = entries.map((e) => {
    const kind = classify(e.norm);
    const price = kind === "cash" && e.norm === "USD" ? 1 : priceFor(e.norm);
    const value = price !== null ? e.amount * price : null;
    // baseline = prix unitaire au 1er juin ; cost = valeur de référence (qté × baseline).
    const baseline = _baselineCache[e.norm] != null ? _baselineCache[e.norm] : null;
    const cost = baseline != null ? e.amount * baseline : null;
    return { asset: e.asset, symbol: e.norm, amount: e.amount, price, value, baseline, cost, kind };
  });

  const sum = (k) =>
    holdings.filter((h) => h.kind === k).reduce((s, h) => s + (h.value || 0), 0);

  const tradeEquity =
    tb.ok && tb.result ? parseFloat(tb.result.eb || tb.result.e || "0") : null;

  const payload = {
    ok: true,
    holdings: holdings.sort((a, b) => (b.value || 0) - (a.value || 0)),
    totals: {
      crypto: sum("crypto"),
      stock: sum("stock"),
      cash: sum("cash"),
      spotEquity: tradeEquity, // valeur de référence Kraken (TradeBalance)
    },
  };
  _portfolioCache = { ts: Date.now(), data: payload };
  return NextResponse.json(payload);
}
