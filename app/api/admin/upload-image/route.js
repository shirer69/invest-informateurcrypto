import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VPS = process.env.POLEINVEST_API_URL || "https://api.informateurcrypto.fr";

export async function POST(req) {
  try {
    const form = await req.formData();
    const adminKey = req.headers.get("x-admin-key") || form.get("adminKey") || "";

    const fd = new FormData();
    const file = form.get("file");
    if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });
    fd.append("file", file);

    const res = await fetch(`${VPS}/api/admin/upload-image`, {
      method: "POST",
      headers: { "x-admin-key": adminKey },
      body: fd,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
