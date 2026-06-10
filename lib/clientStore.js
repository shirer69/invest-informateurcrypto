"use client";

// Stockage local côté navigateur — MVP de démonstration (non sécurisé,
// non multi-appareils). À remplacer par une vraie auth + DB en phase 2.

const USER_KEY = "pi_user";
const PROGRESS_KEY = "pi_progress";

export function getUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function createUser({ email, password, name }) {
  const user = {
    email: (email || "").trim().toLowerCase(),
    name: name || (email || "").split("@")[0],
    createdAt: Date.now(),
  };
  // NB: en démo on ne stocke pas le mot de passe en clair côté prod ;
  // ici aucune donnée sensible n'est transmise à un serveur.
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  return user;
}

export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem(USER_KEY);
}

export function getProgress() {
  if (typeof window === "undefined") return { xp: 0, done: {}, badges: [], streak: 0 };
  try {
    return (
      JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {
        xp: 0,
        done: {},
        badges: [],
        streak: 0,
      }
    );
  } catch {
    return { xp: 0, done: {}, badges: [], streak: 0 };
  }
}

export function saveProgress(p) {
  if (typeof window !== "undefined") {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  }
}
