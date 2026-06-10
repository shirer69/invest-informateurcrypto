import { NextResponse } from "next/server";
import { getKeys, KRAKEN_BASE } from "@/lib/krakenFutures";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { configured } = getKeys();
  return NextResponse.json({
    env: "sandbox",
    base: KRAKEN_BASE,
    configured,
  });
}
