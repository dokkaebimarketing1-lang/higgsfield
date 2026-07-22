import type { D1Database } from "@cloudflare/workers-types";
import { getRequestHeader } from "@tanstack/react-start/server";

type RateLimitOptions = {
  limit?: number;
  windowSeconds?: number;
};

const DEFAULT_LIMIT = 5;
const DEFAULT_WINDOW_SECONDS = 15 * 60;
const CLEANUP_HORIZON_SECONDS = 24 * 60 * 60;

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function clientIp(): string {
  const cloudflareIp = getRequestHeader("cf-connecting-ip")?.trim();
  if (cloudflareIp) return cloudflareIp;

  const forwardedIp = getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedIp || "unknown";
}

/**
 * Consumes one fixed-window allowance. Only a one-way hash of the request IP
 * is persisted; the raw address never leaves request memory.
 */
export async function consumeRateLimit(
  DB: D1Database,
  scope: string,
  options: RateLimitOptions = {},
): Promise<boolean> {
  const limit = options.limit ?? DEFAULT_LIMIT;
  const windowSeconds = options.windowSeconds ?? DEFAULT_WINDOW_SECONDS;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(nowSeconds / windowSeconds) * windowSeconds;
  const keyHash = await sha256Hex(`${scope}\0${clientIp()}`);

  await DB.prepare("DELETE FROM rate_limits WHERE window_start < ?")
    .bind(windowStart - CLEANUP_HORIZON_SECONDS)
    .run();

  await DB.prepare(
    `INSERT INTO rate_limits (key_hash, window_start, count) VALUES (?, ?, 1)
     ON CONFLICT(key_hash, window_start) DO UPDATE SET count = count + 1`,
  )
    .bind(keyHash, windowStart)
    .run();

  const row = await DB.prepare(
    "SELECT count FROM rate_limits WHERE key_hash = ? AND window_start = ? LIMIT 1",
  )
    .bind(keyHash, windowStart)
    .first<{ count: number }>();

  return (row?.count ?? limit + 1) <= limit;
}
