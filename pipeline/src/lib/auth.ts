import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "./db";

export const SESSION_COOKIE = "pipeline_session";
const SESSION_TTL_DAYS = 7;

export type User = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "recruiter" | "client" | "talent";
};

// ---------- Passwords (scrypt, no native deps) ----------

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, "base64"), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// ---------- Bootstrap admin ----------

/**
 * Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD when no users exist.
 * Later admins can be added with `npm run create-admin`.
 */
export function ensureBootstrapAdmin() {
  const db = getDb();
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  if (n > 0) return;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  db.prepare("INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'admin')").run(
    email.trim(),
    process.env.ADMIN_NAME || "Admin",
    hashPassword(password),
  );
}

// ---------- Sessions ----------

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export function authenticate(email: string, password: string): User | null {
  ensureBootstrapAdmin();
  const row = getDb()
    .prepare("SELECT id, email, name, role, password_hash FROM users WHERE email = ?")
    .get(email.trim()) as (User & { password_hash: string }) | undefined;
  if (!row || !verifyPassword(password, row.password_hash)) return null;
  const { password_hash: _, ...user } = row;
  return user;
}

export async function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_TTL_DAYS * 864e5);
  const db = getDb();
  db.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)").run(
    sha256(token),
    userId,
    expires.toISOString(),
  );
  db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(userId);
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(new Date().toISOString());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, s.expires_at
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.id = ?`,
    )
    .get(sha256(token)) as (User & { expires_at: string }) | undefined;
  if (!row || new Date(row.expires_at) < new Date()) return null;
  const { expires_at: _, ...user } = row;
  return user;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) getDb().prepare("DELETE FROM sessions WHERE id = ?").run(sha256(token));
  store.delete(SESSION_COOKIE);
}

/** Use at the top of every admin page, action and route handler. */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "recruiter")) redirect("/admin/login");
  return user;
}

// ---------- Login throttling (per process, per IP) ----------

const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export function isLoginThrottled(ip: string): boolean {
  const a = attempts.get(ip);
  if (!a || Date.now() - a.first > WINDOW_MS) return false;
  return a.count >= MAX_ATTEMPTS;
}

export function recordFailedLogin(ip: string) {
  const a = attempts.get(ip);
  if (!a || Date.now() - a.first > WINDOW_MS) attempts.set(ip, { count: 1, first: Date.now() });
  else a.count++;
}

export function clearFailedLogins(ip: string) {
  attempts.delete(ip);
}
