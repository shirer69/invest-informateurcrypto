import { NextResponse } from "next/server";
import { futuresGet } from "@/lib/krakenFuturesReal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const r = await futuresGet("/api/v3/openpositions");
  return NextResponse.json(
    { ok: r.ok, data: r.data, error: r.error },
    { status: 200 }
  );
}
