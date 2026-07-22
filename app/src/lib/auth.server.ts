import type { D1Database } from "@cloudflare/workers-types";
import {
  deleteCookie,
  getCookie,
  setCookie,
  setResponseHeader,
} from "@tanstack/react-start/server";

import { bindings } from "./bindings.server";

const SESSION_COOKIE = "__Host-ewha_admin";
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
};

export class AdminAuthError extends Error {
  readonly statusCode = 401;

  constructor(message = "관리자 로그인이 필요합니다.") {
    super(message);
    this.name = "AdminAuthError";
  }
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function constantTimeTextEqual(left: string, right: string): Promise<boolean> {
  const [leftDigest, rightDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(left)),
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(right)),
  ]);
  const leftBytes = new Uint8Array(leftDigest);
  const rightBytes = new Uint8Array(rightDigest);
  let difference = leftBytes.length ^ rightBytes.length;
  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index]! ^ rightBytes[index]!;
  }
  return difference === 0;
}

export function setPrivateNoStore(): void {
  setResponseHeader("Cache-Control", "no-store");
}

async function purgeExpiredSessions(DB: D1Database): Promise<void> {
  await DB.prepare("DELETE FROM admin_sessions WHERE expires_at <= ?")
    .bind(new Date().toISOString())
    .run();
}

function currentToken(): string | null {
  const token = getCookie(SESSION_COOKIE);
  return token && SESSION_TOKEN_PATTERN.test(token) ? token : null;
}

export async function createAdminSession(DB: D1Database): Promise<void> {
  await purgeExpiredSessions(DB);

  const previousToken = currentToken();
  if (previousToken) {
    await DB.prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
      .bind(await sha256Hex(previousToken))
      .run();
  }

  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const token = base64Url(tokenBytes);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

  await DB.prepare("INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, ?)")
    .bind(await sha256Hex(token), expiresAt)
    .run();

  setCookie(SESSION_COOKIE, token, {
    ...COOKIE_OPTIONS,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function hasAdminSession(DB: D1Database): Promise<boolean> {
  await purgeExpiredSessions(DB);
  const token = currentToken();
  if (!token) return false;

  const row = await DB.prepare(
    "SELECT token_hash FROM admin_sessions WHERE token_hash = ? AND expires_at > ? LIMIT 1",
  )
    .bind(await sha256Hex(token), new Date().toISOString())
    .first<{ token_hash: string }>();
  return Boolean(row);
}

export async function requireAdmin(): Promise<void> {
  setPrivateNoStore();
  const { DB } = bindings();
  if (!DB || !(await hasAdminSession(DB))) throw new AdminAuthError();
}

export async function revokeAdminSession(DB?: D1Database): Promise<void> {
  const token = currentToken();
  if (DB && token) {
    await DB.prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
      .bind(await sha256Hex(token))
      .run();
  }
  deleteCookie(SESSION_COOKIE, COOKIE_OPTIONS);
}
