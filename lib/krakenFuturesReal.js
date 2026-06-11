// Client Kraken Futures RÉEL — LECTURE SEULE.
// Ne fournit QUE des consultations (accounts, openpositions). Aucune méthode
// d'ordre n'est implémentée ici : impossible d'exécuter un trade via ce module.
import crypto from "crypto";

const FUTURES_REAL_BASE = "https://futures.kraken.com/derivatives";

export function getFuturesKeys() {
  const key = process.env.KRAKEN_FUTURES_API_KEY || "";
  const secret = process.env.KRAKEN_FUTURES_API_SECRET || "";
  return { key, secret, configured: Boolean(key && secret) };
}

function authent(endpointPath, postData, nonce, secret) {
  const message = postData + nonce + endpointPath;
  const hash = crypto.createHash("sha256").update(message).digest();
  const secretBuf = Buffer.from(secret, "base64");
  return crypto.createHmac("sha512", secretBuf).update(hash).digest("base64");
}

// Nonce monotone haute résolution : timestamp ms + compteur (évite les collisions
// quand plusieurs requêtes parallèles utilisent la même clé futures).
let _nonceCounter = 0;
let _lastNonce = 0;
function nextNonce() {
  _nonceCounter = (_nonceCounter + 1) % 1000;
  let n = Date.now() * 1000 + _nonceCounter;
  if (n <= _lastNonce) n = _lastNonce + 1; // garantit la stricte croissance locale
  _lastNonce = n;
  return String(n);
}

// Lecture seule : seuls les endpoints de consultation sont autorisés.
const READONLY = new Set([
  "/api/v3/accounts", "/api/v3/openpositions", "/api/v3/openorders", "/api/v3/fills",
]);

// Public (pas d'auth) — prix mark des perps/futures.
export async function futuresTickers() {
  try {
    const res = await fetch(FUTURES_REAL_BASE + "/api/v3/tickers", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    return data.tickers || [];
  } catch {
    return [];
  }
}

export async function futuresGet(path) {
  const { key, secret, configured } = getFuturesKeys();
  if (!configured) return { ok: false, error: "not_configured" };
  if (!READONLY.has(path)) return { ok: false, error: "method_not_allowed" };

  const nonce = nextNonce();
  const sig = authent(path, "", nonce, secret);
  try {
    const res = await fetch(FUTURES_REAL_BASE + path, {
      headers: { APIKey: key, Nonce: nonce, Authent: sig },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    // 'accountInactive' = compte Futures pas encore activé (clé valide).
    if (data.result === "error") {
      return { ok: false, error: (data.error || (data.errors && data.errors[0]) || "error"), data };
    }
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
