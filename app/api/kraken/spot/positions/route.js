import { NextResponse } from "next/server";

const VPS_URL = "https://api.informateurcrypto.fr/api/kraken/spot/margin-positions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(VPS_URL, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const data = await res.json();
    return NextResponse.json({ ok: data.ok, result: data.result ?? {}, error: data.error });
  } catch (e) {
    return NextResponse.json({ ok: false, result: {}, error: String(e) });
  }
}
