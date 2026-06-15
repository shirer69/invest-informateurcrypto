import { NextResponse } from "next/server";

const VPS_URL = "https://api.informateurcrypto.fr/api/kraken/spot/monthly-pnl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(VPS_URL, {
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    const data = await res.json();
    return NextResponse.json({ ok: data.ok, months: data.months ?? [], error: data.error });
  } catch (e) {
    return NextResponse.json({ ok: false, months: [], error: String(e) });
  }
}
