"use client";

// Auth / chat / progression — adossés au backend exposé (api.informateurcrypto.fr).
// Le token (JWT-like signé) + un cache user sont conservés localement pour l'accès
// synchrone de l'UI ; toutes les écritures passent par le serveur.
import { API_BASE } from "./site";

const TOKEN_KEY = "pi_token";
const USER_KEY = "pi_user";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

function setSession({ token, user }) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function authPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function apiSignup({ email, password, name }) {
  const r = await authPost("/api/auth/signup", { email, password, name });
  if (r.ok && r.data.token) {
    setSession(r.data);
    return { ok: true, user: r.data.user };
  }
  return { ok: false, error: r.data.error || "signup_failed", status: r.status };
}

export async function apiTelegramAuth(initData) {
  const r = await authPost("/api/auth/telegram", { initData });
  if (r.ok && r.data.token) {
    setSession(r.data);
    return { ok: true, user: r.data.user };
  }
  return { ok: false, error: r.data.error || "telegram_failed" };
}

export async function apiLogin({ email, password }) {
  const r = await authPost("/api/auth/login", { email, password });
  if (r.ok && r.data.token) {
    setSession(r.data);
    return { ok: true, user: r.data.user };
  }
  return { ok: false, error: r.data.error || "login_failed", status: r.status };
}

// ---------------- chat ----------------
export async function chatList(since = 0) {
  try {
    const res = await fetch(`${API_BASE}/api/chat?since=${since}`, { cache: "no-store" });
    const data = await res.json();
    return data.messages || [];
  } catch {
    return [];
  }
}

export async function chatSend(text) {
  const token = getToken();
  if (!token) return { ok: false, error: "unauthorized" };
  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text }),
    });
    return await res.json();
  } catch {
    return { ok: false, error: "network" };
  }
}

// ---------------- posts VIP (canal en direct) ----------------
export async function vipPosts() {
  const token = getToken();
  if (!token) return { ok: false, error: "unauthorized", posts: [] };
  try {
    const res = await fetch(`${API_BASE}/api/vip/posts`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    return { ok: res.ok, posts: data.posts || [], error: data.error };
  } catch {
    return { ok: false, error: "network", posts: [] };
  }
}

// ---------------- progression ----------------
export async function progressGet() {
  const token = getToken();
  if (!token) {
    try {
      return JSON.parse(localStorage.getItem("pi_progress") || "null") || {};
    } catch {
      return {};
    }
  }
  try {
    const res = await fetch(`${API_BASE}/api/progress`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    return data.progress || {};
  } catch {
    return {};
  }
}

export async function progressSave(p) {
  const token = getToken();
  if (!token) {
    try {
      localStorage.setItem("pi_progress", JSON.stringify(p));
    } catch {}
    return { ok: true, local: true };
  }
  try {
    const res = await fetch(`${API_BASE}/api/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ progress: p }),
    });
    return await res.json();
  } catch {
    return { ok: false };
  }
}
