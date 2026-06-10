// Client Kraken Spot — LECTURE SEULE.
// Ce module n'expose QUE des méthodes de consultation (soldes, positions, valorisation).
// Aucune méthode de passage d'ordre ni de retrait n'est implémentée.
import crypto from "crypto";

const SPOT_BASE = "https://api.kraken.com";

let counter = 0;

export function getSpotKeys() {
  const key = process.env.KRAKEN_SPOT_API_KEY || "";
  const secret = process.env.KRAKEN_SPOT_API_SECRET || "";
  return { key, secret, configured: Boolean(key && secret) };
}

function sign(path, postdata, nonce, secret) {
  const sha = crypto.createHash("sha256").update(nonce + postdata).digest();
  const hmac = crypto.createHmac("sha512", Buffer.from(secret, "base64"));
  hmac.update(path, "utf8");
  hmac.update(sha);
  return hmac.digest("base64");
}

// Appel privé en LECTURE SEULE (méthodes de consultation uniquement).
async function privateGet(method, params = {}) {
  const { key, secret, configured } = getSpotKeys();
  if (!configured) return { ok: false, error: "not_configured" };

  // Liste blanche stricte : aucune méthode d'ordre/retrait possible.
  const ALLOWED = new Set(["Balance", "BalanceEx", "TradeBalance", "OpenPositions"]);
  if (!ALLOWED.has(method)) return { ok: false, error: "method_not_allowed" };

  const path = `/0/private/${method}`;
  counter = (counter + 1) % 1000;
  const nonce = String(Date.now()) + String(counter).padStart(3, "0");
  const postdata = new URLSearchParams({ nonce, ...params }).toString();
  const apiSign = sign(path, postdata, nonce, secret);

  try {
    const res = await fetch(SPOT_BASE + path, {
      method: "POST",
      headers: {
        "API-Key": key,
        "API-Sign": apiSign,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: postdata,
    });
    const data = await res.json().catch(() => ({}));
    if (data.error && data.error.length) {
      return { ok: false, error: data.error.join("; ") };
    }
    return { ok: true, result: data.result };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export const spotBalance = () => privateGet("BalanceEx");
export const spotTradeBalance = () => privateGet("TradeBalance", { asset: "ZUSD" });
export const spotOpenPositions = () => privateGet("OpenPositions", { docalcs: "true" });

// Public — valorisation (pas d'auth).
export async function spotTicker(pairs) {
  if (!pairs.length) return {};
  try {
    const res = await fetch(`${SPOT_BASE}/0/public/Ticker?pair=${pairs.join(",")}`, {
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return data.result || {};
  } catch {
    return {};
  }
}
