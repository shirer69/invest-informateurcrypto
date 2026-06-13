import { NextResponse } from "next/server";

// URL d'entrée de la Mini App (Direct Link BotFather → /mini).
// À CHAQUE ouverture, redirige vers la home avec un identifiant de build (?b=<sha>) :
// nouveau déploiement = nouvelle URL = Telegram recharge un bundle frais, sans vider le cache.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const build = (process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now())).slice(0, 8);
  const res = NextResponse.redirect(
    `https://invest.informateurcrypto.fr/dashboard?b=${build}`,
    { status: 307 }
  );
  res.headers.set("Cache-Control", "no-store, no-cache, max-age=0, must-revalidate");
  return res;
}
