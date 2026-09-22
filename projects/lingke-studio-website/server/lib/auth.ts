import crypto from "node:crypto";

const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const sessions = new Map<string, number>();

export const ADMIN_COOKIE = "lingke_admin";

export function createSession(): string {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + SESSION_MS);
  return token;
}

export function verifySession(token: string | undefined): boolean {
  if (!token) return false;
  const expires = sessions.get(token);
  if (!expires || expires < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function destroySession(token: string | undefined) {
  if (token) sessions.delete(token);
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !input) return false;

  const a = Buffer.from(input, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}
