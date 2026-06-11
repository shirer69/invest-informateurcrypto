import { NextResponse } from "next/server";
import { futuresTickers } from "@/lib/krakenFuturesReal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const tickers = await futuresTickers();
  return NextResponse.json({ ok: true, tickers });
}
