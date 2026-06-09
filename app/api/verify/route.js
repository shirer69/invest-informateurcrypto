import { NextResponse } from "next/server";
import activeIds from "@/data/active-ids.json";
import { TELEGRAM_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

function last4(s) {
  return String(s || "").trim().toUpperCase().replace(/\s+/g, "").slice(-4);
}

export async function POST(req) {
  let uid = "";
  try {
    const body = await req.json();
    uid = body?.uid || "";
  } catch {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const code = last4(uid);
  if (code.length < 4) {
    return NextResponse.json({ status: "invalid" });
  }

  const envIds = (process.env.KRAKEN_ACTIVE_IDS || "")
    .split(",")
    .map((s) => last4(s))
    .filter(Boolean);

  const fileIds = (Array.isArray(activeIds) ? activeIds : [])
    .map((s) => last4(s))
    .filter((s) => s && s !== "DEMO".slice(-4));

  const allowed = new Set([...fileIds, ...envIds]);

  if (allowed.has(code)) {
    return NextResponse.json({
      status: "active",
      link: process.env.TELEGRAM_INVITE_URL || TELEGRAM_URL,
    });
  }

  return NextResponse.json({ status: "notfound" });
}
