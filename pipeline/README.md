# Pipeline by StartupHR

Landing page and talent-request intake for **Pipeline**, the verified talent network from StartupHR Africa. This is the first slice of the MVP described in the Pipeline PRD: companies submit a talent request, it is routed to a Talent Pipeline (function × seniority, e.g. `Marketing — Senior`), and the StartupHR team reviews requests behind a login.

## Stack

- Next.js 16 (App Router, server actions) + TypeScript
- Tailwind CSS v4
- SQLite via `better-sqlite3` (single file, forward-only migrations in `src/lib/db.ts`)
- Zod for validation (`src/lib/talent-request-schema.ts`, shared by client and server)
- Session auth with scrypt-hashed passwords and httpOnly cookies (`src/lib/auth.ts`)

## Getting started

```bash
cd pipeline
cp .env.example .env.local   # set ADMIN_EMAIL / ADMIN_PASSWORD
npm install
npm run dev                  # http://localhost:3000
```

The database is created at `./data/pipeline.db` on first request (override with `DATABASE_PATH`).
The first admin is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` on the first sign-in attempt while the `users` table is empty. Add or reset logins later with:

```bash
npm run create-admin -- someone@startuphr.africa 'a-long-password' "Their Name" recruiter
```

## Routes

| Route | Access | What it does |
| --- | --- | --- |
| `/` | Public | Landing page + talent request form |
| `/admin/login` | Public | Team login |
| `/admin` | Admin / recruiter | All requests, search and filters |
| `/admin/requests/[id]` | Admin / recruiter | Full request, status and internal notes |
| `/admin/export` | Admin / recruiter | CSV export (respects current filters) |

## Data model

- `users`: email, name, scrypt password hash, `role` (`admin` · `recruiter` · `client` · `talent`, per PRD §4)
- `sessions`: sha256 of the session token, expiry
- `talent_requests`: company, contact, role, budget, hiring mode (PRD §38), computed `target_pipeline`, and an internal `status` (`new` → `contacted` → `in_progress` → `filled` / `closed`)

To change the schema, append a migration to the list in `src/lib/db.ts`.

## Deploying

SQLite needs a persistent disk, so deploy to a Node host with a volume (a VPS, Railway, Fly.io, Render with a disk) and point `DATABASE_PATH` at it. Serverless platforms with ephemeral filesystems (e.g. Vercel) will lose data.

```bash
npm run build && npm start
```

## Next steps toward the MVP

Client signup and portal, talent onboarding and Pipeline membership, jobs and Pipeline routing (turning a talent request into a `Job`), then matching. See PRD §40 for the build order.
