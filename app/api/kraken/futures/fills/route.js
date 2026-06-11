import { NextResponse } from "next/server";
import { futuresGet } from "@/lib/krakenFuturesReal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const r = await futuresGet("/api/v3/fills");
  const fills = (r.ok && r.data?.fills) || [];
  const trades = fills.map((f) => ({
    ts: f.fillTime ? Math.floor(new Date(f.fillTime).getTime() / 1000) : 0,
    market: (f.symbol || "").toUpperCase(),
    side: (f.side || "").toLowerCase(), // buy / sell
    cat: "perps",
    price: parseFloat(f.price) || null,
    vol: parseFloat(f.size) || null,
    cost: f.price && f.size ? parseFloat(f.price) * parseFloat(f.size) : null,
    fee: null,
  }));
  trades.sort((a, b) => b.ts - a.ts);
  return NextResponse.json({ ok: r.ok, trades, error: r.error }, { status: 200 });
}
