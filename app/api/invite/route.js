import { NextResponse } from "next/server";
import { isActive } from "@/lib/allowlist";
import { TELEGRAM_URL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VIP_CHAT_ID = process.env.VIP_GROUP_CHAT_ID || "-1004262332671";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const uid = body.uid || "";
  const name = String(body.name || "Membre Pôle Invest").trim().slice(0, 32) || "Membre Pôle Invest";

  // Sécurité : on ne génère un lien que pour une attribution active.
  if (!isActive(uid)) {
    return NextResponse.json({ ok: false, error: "not_active" }, { status: 403 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  // Repli si le bot n'est pas encore configuré.
  if (!token) {
    return NextResponse.json({
      ok: true,
      generated: false,
      link: process.env.TELEGRAM_INVITE_URL || TELEGRAM_URL,
    });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/createChatInviteLink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: VIP_CHAT_ID,
        name, // titre du lien (côté admin) — « au nom du gars »
        creates_join_request: true,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      return NextResponse.json({
        ok: true,
        generated: false,
        link: process.env.TELEGRAM_INVITE_URL || TELEGRAM_URL,
        warn: data.description || "telegram_error",
      });
    }
    return NextResponse.json({
      ok: true,
      generated: true,
      link: data.result.invite_link,
    });
  } catch (e) {
    return NextResponse.json({
      ok: true,
      generated: false,
      link: process.env.TELEGRAM_INVITE_URL || TELEGRAM_URL,
      warn: String(e),
    });
  }
}
