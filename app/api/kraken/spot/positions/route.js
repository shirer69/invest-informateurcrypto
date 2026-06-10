import { NextResponse } from "next/server";
import { spotOpenPositions, getSpotKeys } from "@/lib/krakenSpot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!getSpotKeys().configured) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 200 });
  }
  const r = await spotOpenPositions();
  return NextResponse.json({ ok: r.ok, result: r.result, error: r.error }, { status: 200 });
}
