import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

/**
 * SQLite connection + forward-only migrations.
 *
 * Each migration runs once, in order, and is recorded in `schema_migrations`.
 * To change the schema, append a new entry; never edit one that has shipped.
 */
const migrations: { id: number; name: string; sql: string }[] = [
  {
    id: 1,
    name: "users_sessions_talent_requests",
    sql: `
      CREATE TABLE users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
        name          TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        -- PRD §4 user types: admin | recruiter | client | talent
        role          TEXT NOT NULL DEFAULT 'admin',
        created_at    TEXT NOT NULL DEFAULT (datetime('now')),
        last_login_at TEXT
      );

      CREATE TABLE sessions (
        id          TEXT PRIMARY KEY,          -- sha256 of the cookie token
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at  TEXT NOT NULL DEFAULT (datetime('now')),
        expires_at  TEXT NOT NULL
      );
      CREATE INDEX sessions_user_id ON sessions(user_id);

      CREATE TABLE talent_requests (
        id                INTEGER PRIMARY KEY AUTOINCREMENT,
        -- Company
        company_name      TEXT NOT NULL,
        company_website   TEXT,
        industry          TEXT NOT NULL,
        company_size      TEXT NOT NULL,
        company_location  TEXT NOT NULL,
        -- Contact
        contact_name      TEXT NOT NULL,
        contact_title     TEXT NOT NULL,
        contact_email     TEXT NOT NULL,
        contact_phone     TEXT NOT NULL,
        -- Role
        role_title        TEXT NOT NULL,
        function          TEXT NOT NULL,
        seniority         TEXT NOT NULL,
        target_pipeline   TEXT NOT NULL,     -- e.g. "Marketing — Senior" (PRD §13)
        openings          INTEGER NOT NULL DEFAULT 1,
        employment_type   TEXT NOT NULL,
        work_arrangement  TEXT NOT NULL,
        job_location      TEXT NOT NULL,
        budget_currency   TEXT NOT NULL,
        budget_min        INTEGER,
        budget_max        INTEGER,
        budget_period     TEXT NOT NULL,
        start_timeline    TEXT NOT NULL,
        requirements      TEXT NOT NULL,
        jd_link           TEXT,
        -- Service
        hiring_mode       TEXT NOT NULL,     -- PRD §38
        referral_source   TEXT,
        notes             TEXT,
        -- Internal
        status            TEXT NOT NULL DEFAULT 'new',
        internal_notes    TEXT,
        ip_address        TEXT,
        user_agent        TEXT,
        created_at        TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX talent_requests_created_at ON talent_requests(created_at);
      CREATE INDEX talent_requests_status ON talent_requests(status);
    `,
  },
];

function migrate(db: Database.Database) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  const applied = new Set(
    db.prepare("SELECT id FROM schema_migrations").all().map((r) => (r as { id: number }).id),
  );
  for (const m of migrations) {
    if (applied.has(m.id)) continue;
    db.transaction(() => {
      db.exec(m.sql);
      db.prepare("INSERT INTO schema_migrations (id, name) VALUES (?, ?)").run(m.id, m.name);
    })();
  }
}

function open(): Database.Database {
  const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "pipeline.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  migrate(db);
  return db;
}

// Reuse one connection across hot reloads in dev.
const globalForDb = globalThis as unknown as { __pipelineDb?: Database.Database };

export function getDb(): Database.Database {
  if (!globalForDb.__pipelineDb) globalForDb.__pipelineDb = open();
  return globalForDb.__pipelineDb;
}
