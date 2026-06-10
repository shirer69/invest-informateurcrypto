import { NextResponse } from "next/server";
import { futuresGet } from "@/lib/krakenFuturesReal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const r = await futuresGet("/api/v3/accounts");
  return NextResponse.json(
    { ok: r.ok, data: r.data, error: r.error },
    { status: r.ok ? 200 : 200 }
  );
}
