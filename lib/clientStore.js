"use client";

// Auth / chat / progression — adossés au backend exposé (api.informateurcrypto.fr).
// Le token (JWT-like signé) + un cache user sont conservés localement pour l'accès
// synchrone de l'UI ; toutes les écritures passent par le serveur.
import { API_BASE } from "./site";

const TOKEN_KEY = "pi_token";
const USER_KEY = "pi_user";

// Durée de session : cookie conservé 30 jours.
const SESSION_DAYS = 30;
const SESSION_MAXAGE = SESSION_DAYS * 24 * 60 * 60; // secondes

// Domaine partagé pour que le cookie survive sur les sous-domaines
// (invest. / dashboard / api.informateurcrypto.fr). Repli host-only en local.
function cookieDomain() {
  if (typeof window === "undefined") return "";
  const h = window.location.hostname;
  return h.endsWith("informateurcrypto.fr") ? "; domain=.informateurcrypto.fr" : "";
}

function setCookie(name, value) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${name}=${encodeURIComponent(value)}; path=/; max-age=${SESSION_MAXAGE}` +
    `; SameSite=Lax${secure}${cookieDomain()}`;
}

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function delCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${cookieDomain()}`;
  // efface aussi une éventuelle version host-only
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return getCookie(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = getCookie(USER_KEY) || localStorage.getItem(USER_KEY) || "null";
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setSession({ token, user }) {
  if (typeof window === "undefined") return;
  if (token) {
    setCookie(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_KEY, token); // repli lecture synchrone
  }
  if (user) {
    const u = JSON.stringify(user);
    setCookie(USER_KEY, u);
    localStorage.setItem(USER_KEY, u);
  }
}

export function logout() {
  if (typeof window === "undefined") return;
  delCookie(TOKEN_KEY);
  delCookie(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// initData Telegram si on est dans la mini-app (sert à lier le compte web ↔ Telegram).
function tgInitData() {
  try {
    const tg = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp;
    return (tg && tg.initData) || undefined;
  } catch {
    return undefined;
  }
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

export async function apiSignup({ email, password, name, uid }) {
  const r = await authPost("/api/auth/signup", { email, password, name, uid, initData: tgInitData() });
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

export async function apiForgot(email) {
  const r = await authPost("/api/auth/forgot", { email });
  return { ok: r.ok };
}

export async function apiReset({ token, password }) {
  const r = await authPost("/api/auth/reset", { token, password });
  if (r.ok && r.data.token) {
    setSession(r.data);
    return { ok: true, user: r.data.user };
  }
  return { ok: false, error: r.data.error || "reset_failed" };
}

export async function apiLogin({ email, password }) {
  const r = await authPost("/api/auth/login", { email, password, initData: tgInitData() });
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

// ---------------- audios Pôle Trading ----------------
export async function poleTradingAudios() {
  const token = getToken();
  if (!token) return { ok: false, error: "unauthorized", audios: [] };
  try {
    const res = await fetch(`${API_BASE}/api/pole-trading/audios`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    return { ok: res.ok, audios: data.audios || [], error: data.error };
  } catch {
    return { ok: false, error: "network", audios: [] };
  }
}

export function audioStreamUrl(id) {
  const t = getToken();
  return `${API_BASE}/api/pole-trading/audio/${id}?t=${encodeURIComponent(t || "")}`;
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

// ---------------- copy-trading (multi-user) ----------------
function copyHeaders() {
  const t = getToken();
  return t ? { "Content-Type": "application/json", Authorization: `Bearer ${t}` } : null;
}

export async function copyState() {
  const h = copyHeaders();
  if (!h) return { error: "unauthorized" };
  try {
    const res = await fetch(`${API_BASE}/api/copy/state`, { headers: h, cache: "no-store" });
    return await res.json();
  } catch {
    return { error: "network" };
  }
}

async function copyPost(path, body) {
  const h = copyHeaders();
  if (!h) return { ok: false, error: "unauthorized" };
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: h,
      body: JSON.stringify(body || {}),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, ...data };
  } catch {
    return { ok: false, error: "network" };
  }
}

export const copySaveKeys = (api_key, api_secret) =>
  copyPost("/api/copy/keys", { api_key, api_secret });
export const copySettings = (s) => copyPost("/api/copy/settings", s);
export const copyStart = () => copyPost("/api/copy/start", {});
export const copyStop = () => copyPost("/api/copy/stop", {});
export const copyResetBaseline = () => copyPost("/api/copy/reset_baseline", {});

export async function copyDeleteKeys() {
  const h = copyHeaders();
  if (!h) return { ok: false, error: "unauthorized" };
  try {
    const res = await fetch(`${API_BASE}/api/copy/keys`, { method: "DELETE", headers: h });
    return { ok: res.ok, ...(await res.json().catch(() => ({}))) };
  } catch {
    return { ok: false, error: "network" };
  }
}

export async function copyMaster() {
  const h = copyHeaders();
  if (!h) return { error: "unauthorized" };
  try {
    const res = await fetch(`${API_BASE}/api/copy/master`, { headers: h, cache: "no-store" });
    return await res.json();
  } catch {
    return { error: "network" };
  }
}
