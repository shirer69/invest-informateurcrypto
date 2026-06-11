import { NextResponse } from "next/server";

// Proxy vers le VPS — cache partagé toutes les 3 min, pas de rate-limit Kraken.
const VPS_URL = "https://api.informateurcrypto.fr/api/kraken/spot-portfolio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(VPS_URL, {
      signal: AbortSignal.timeout(20_000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 200 });
  }
}
