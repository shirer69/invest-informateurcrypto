import activeIds from "@/data/active-ids.json";

export function last4(s) {
  return String(s || "").trim().toUpperCase().replace(/\s+/g, "").slice(-4);
}

// Vrai si les 4 derniers caractères de l'UID/IIBAN sont dans l'allowlist
// (fichier data/active-ids.json ∪ env KRAKEN_ACTIVE_IDS).
export function isActive(uid) {
  const code = last4(uid);
  if (code.length < 4) return false;

  const envIds = (process.env.KRAKEN_ACTIVE_IDS || "")
    .split(",")
    .map((s) => last4(s))
    .filter(Boolean);

  const fileIds = (Array.isArray(activeIds) ? activeIds : [])
    .map((s) => last4(s))
    .filter((s) => s && s !== "DEMO");

  return new Set([...fileIds, ...envIds]).has(code);
}
