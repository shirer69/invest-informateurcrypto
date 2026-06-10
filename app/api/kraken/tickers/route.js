import { NextResponse } from "next/server";
import { krakenPublic } from "@/lib/krakenFutures";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const r = await krakenPublic("/api/v3/tickers");
  return NextResponse.json({ ok: r.ok, data: r.data }, { status: r.ok ? 200 : (r.status || 500) });
}
