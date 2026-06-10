import { NextResponse } from "next/server";
import { krakenPrivate } from "@/lib/krakenFutures";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const r = await krakenPrivate("/api/v3/openpositions", "GET");
  if (!r.ok) {
    return NextResponse.json(
      { ok: false, error: r.error || "request_failed", data: r.data },
      { status: r.status || 500 }
    );
  }
  return NextResponse.json({ ok: true, data: r.data });
}
