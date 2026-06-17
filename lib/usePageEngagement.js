"use client";

import { useEffect, useRef, useState } from "react";
import { getToken } from "./clientStore";

const DELAY_MS = 60_000;

export function usePageEngagement() {
  const [showBubble, setShowBubble] = useState(false);
  const timerRef = useRef(null);
  const elapsedRef = useRef(0);
  const startRef = useRef(null);
  const firedRef = useRef(false);

  useEffect(() => {
    async function fire() {
      if (firedRef.current) return;
      firedRef.current = true;

      const token = getToken();
      if (!token) {
        setShowBubble(true);
        return;
      }

      try {
        const res = await fetch("/api/engage", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await res.json();
        if (data.no_tg) setShowBubble(true);
      } catch {
        setShowBubble(true);
      }
    }

    function tick() {
      timerRef.current = setTimeout(fire, DELAY_MS - elapsedRef.current);
      startRef.current = Date.now();
    }

    function pause() {
      if (document.visibilityState === "hidden") {
        clearTimeout(timerRef.current);
        elapsedRef.current += Date.now() - (startRef.current || Date.now());
      } else {
        tick();
      }
    }

    tick();
    document.addEventListener("visibilitychange", pause);
    return () => {
      clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", pause);
    };
  }, []);

  function dismissBubble() {
    setShowBubble(false);
  }

  return { showBubble, dismissBubble };
}
