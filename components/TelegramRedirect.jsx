"use client";

import { useEffect } from "react";

// Dans la mini-app Telegram, il ne doit exister que /dashboard (pas la page d'accueil).
// Détection sans SDK : Telegram ajoute des paramètres tgWebApp* au lancement.
export default function TelegramRedirect() {
  useEffect(() => {
    try {
      const inTg =
        /tgWebApp/i.test(window.location.hash) ||
        /tgWebApp/i.test(window.location.search) ||
        (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData);
      if (inTg) {
        // On conserve le hash (tgWebAppData) pour que le dashboard initialise le SDK.
        window.location.replace("/dashboard" + (window.location.hash || ""));
      }
    } catch {}
  }, []);
  return null;
}
