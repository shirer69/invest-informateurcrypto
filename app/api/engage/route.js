import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VPS = process.env.POLEINVEST_API_URL || "https://api.informateurcrypto.fr";

export async function POST(req) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${VPS}/api/engage`, {
      method: "POST",
      headers: { Authorization: auth },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: "vps_unreachable" }, { status: 502 });
  }
}
