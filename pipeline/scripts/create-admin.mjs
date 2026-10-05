// Create or reset an admin/recruiter login.
// Usage: npm run create-admin -- <email> <password> [name] [role]
import Database from "better-sqlite3";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const [email, password, name = "Admin", role = "admin"] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: npm run create-admin -- <email> <password> [name] [admin|recruiter]");
  process.exit(1);
}
if (password.length < 10) {
  console.error("Use a password of at least 10 characters.");
  process.exit(1);
}

const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "pipeline.db");
if (!fs.existsSync(file)) {
  console.error(`No database at ${file}. Start the app once (npm run dev) so it can run migrations.`);
  process.exit(1);
}

// Same format as hashPassword() in src/lib/auth.ts
const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password, salt, 64);
const passwordHash = `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;

const db = new Database(file);
db.prepare(
  `INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)
   ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash, name = excluded.name, role = excluded.role`,
).run(email.trim(), name, passwordHash, role);
console.log(`Saved ${role} login for ${email}`);
