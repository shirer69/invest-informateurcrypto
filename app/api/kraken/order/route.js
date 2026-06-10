import { NextResponse } from "next/server";
import { krakenPrivate, KRAKEN_BASE } from "@/lib/krakenFutures";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Envoi d'ordre — ENVIRONNEMENT DÉMO UNIQUEMENT (fonds fictifs).
// Garde-fou : on refuse si la base n'est pas le host démo.
export async function POST(req) {
  if (!KRAKEN_BASE.includes("demo-futures.kraken.com")) {
    return NextResponse.json({ ok: false, error: "sandbox_guard" }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const symbol = String(body.symbol || "").trim().toLowerCase();
  const side = String(body.side || "").trim().toLowerCase(); // buy | sell
  const size = Number(body.size);
  const orderType = body.orderType === "mkt" ? "mkt" : "lmt";
  const limitPrice = Number(body.limitPrice);

  if (!symbol) return NextResponse.json({ ok: false, error: "symbol_required" }, { status: 400 });
  if (!["buy", "sell"].includes(side))
    return NextResponse.json({ ok: false, error: "side_invalid" }, { status: 400 });
  if (!size || size <= 0)
    return NextResponse.json({ ok: false, error: "size_invalid" }, { status: 400 });
  if (orderType === "lmt" && (!limitPrice || limitPrice <= 0))
    return NextResponse.json({ ok: false, error: "limitPrice_required" }, { status: 400 });

  const params = { orderType, symbol, side, size };
  if (orderType === "lmt") params.limitPrice = limitPrice;

  const r = await krakenPrivate("/api/v3/sendorder", "POST", params);
  return NextResponse.json(
    { ok: r.ok, env: "sandbox", data: r.data, error: r.error },
    { status: r.ok ? 200 : (r.status || 500) }
  );
}
