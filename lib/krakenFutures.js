// Client Kraken Futures — ENVIRONNEMENT DÉMO / SANDBOX UNIQUEMENT.
// Base URL verrouillée sur le host démo : impossible d'atteindre la production.
// Fonds fictifs — aucun ordre réel, aucun transfert de fonds réels.
import crypto from "crypto";

// 🔒 Verrou de sécurité : sandbox uniquement.
export const KRAKEN_BASE = "https://demo-futures.kraken.com/derivatives";

export function getKeys() {
  const key = process.env.KRAKEN_DEMO_API_KEY || "";
  const secret = process.env.KRAKEN_DEMO_API_SECRET || "";
  return { key, secret, configured: Boolean(key && secret) };
}

// Signature Kraken Futures :
// message = postData + nonce + endpointPath ; sha256 -> hmac-sha512(secret base64) -> base64
function authent(endpointPath, postData, nonce, secret) {
  const message = postData + nonce + endpointPath;
  const hash = crypto.createHash("sha256").update(message).digest();
  const secretBuf = Buffer.from(secret, "base64");
  return crypto.createHmac("sha512", secretBuf).update(hash).digest("base64");
}

function nextNonce() {
  // unique, croissant
  return String(Date.now()) + String(Math.floor(performance.now() % 1000)).padStart(3, "0");
}

/**
 * Appel signé sur l'API démo.
 * @param {string} path  ex: "/api/v3/accounts"
 * @param {"GET"|"POST"} method
 * @param {Record<string,string|number>} params
 */
export async function krakenPrivate(path, method = "GET", params = {}) {
  const { key, secret, configured } = getKeys();
  if (!configured) {
    return { ok: false, status: 401, error: "not_configured" };
  }
  const postData =
    method === "POST"
      ? new URLSearchParams(
          Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
        ).toString()
      : "";
  const nonce = nextNonce();
  const sig = authent(path, postData, nonce, secret);

  const url = KRAKEN_BASE + path;
  const headers = {
    APIKey: key,
    Nonce: nonce,
    Authent: sig,
  };
  const init = { method, headers };
  if (method === "POST") {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    init.body = postData;
  }

  try {
    const res = await fetch(url, init);
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.result !== "error", status: res.status, data };
  } catch (e) {
    return { ok: false, status: 502, error: String(e) };
  }
}

// Endpoint public (pas d'auth) — prix.
export async function krakenPublic(path) {
  try {
    const res = await fetch(KRAKEN_BASE + path, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 502, error: String(e) };
  }
}
