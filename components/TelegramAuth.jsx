"use client";

import { useEffect } from "react";
import { apiTelegramAuth, getUser } from "@/lib/clientStore";

// Capture l'identité Telegram sur TOUTE page ouverte en tant que Mini App
// (Main App / direct link du bot pointent vers la page d'accueil).
// Enregistre le tg_id côté serveur dès que initData est présent, même si une
// session existe déjà — l'identité Telegram fait foi dans le contexte du bot.
export default function TelegramAuth() {
  useEffect(() => {
    let handled = false;

    function init() {
      const tg = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp;
      if (!tg) return;
      try {
        tg.ready();
        tg.expand();
      } catch {}
      // Ne pas écraser une session web réelle déjà ouverte (compte unifié).
      const cur = getUser();
      const realSession = cur && cur.email && !cur.email.endsWith("@telegram.local");
      if (!handled && tg.initData && !realSession) {
        handled = true;
        apiTelegramAuth(tg.initData).catch(() => {});
      }
    }

    if (window.Telegram && window.Telegram.WebApp) {
      init();
      return;
    }
    const existing = document.getElementById("tg-webapp-sdk");
    if (existing) {
      existing.addEventListener("load", init);
      return;
    }
    const s = document.createElement("script");
    s.id = "tg-webapp-sdk";
    s.src = "https://telegram.org/js/telegram-web-app.js";
    s.async = true;
    s.onload = init;
    document.head.appendChild(s);
  }, []);

  return null;
}
