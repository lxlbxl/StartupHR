import "server-only";
import { getDb } from "./db";
import {
  targetPipeline,
  type RequestStatus,
  type TalentRequestInput,
} from "./talent-request-schema";

export type TalentRequest = Omit<TalentRequestInput, "consent"> & {
  id: number;
  target_pipeline: string;
  status: RequestStatus;
  internal_notes: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
};

export function createTalentRequest(
  input: TalentRequestInput,
  meta: { ip?: string | null; userAgent?: string | null } = {},
): number {
  const { consent: _, ...data } = input;
  const row: Record<string, unknown> = {
    ...data,
    target_pipeline: targetPipeline(input.function, input.seniority),
    ip_address: meta.ip ?? null,
    user_agent: meta.userAgent?.slice(0, 500) ?? null,
  };
  // Optional fields arrive as undefined; SQLite wants explicit NULLs.
  for (const k of Object.keys(row)) if (row[k] === undefined) row[k] = null;
  const cols = Object.keys(row);
  const result = getDb()
    .prepare(
      `INSERT INTO talent_requests (${cols.join(", ")}) VALUES (${cols.map((c) => "@" + c).join(", ")})`,
    )
    .run(row);
  return Number(result.lastInsertRowid);
}

export type ListFilters = { q?: string; status?: string; pipeline?: string };

export function listTalentRequests(filters: ListFilters = {}): TalentRequest[] {
  const where: string[] = [];
  const params: Record<string, string> = {};
  if (filters.q) {
    where.push(
      `(company_name LIKE @q OR contact_name LIKE @q OR contact_email LIKE @q OR role_title LIKE @q)`,
    );
    params.q = `%${filters.q}%`;
  }
  if (filters.status) {
    where.push("status = @status");
    params.status = filters.status;
  }
  if (filters.pipeline) {
    where.push("function = @pipeline");
    params.pipeline = filters.pipeline;
  }
  const sql = `SELECT * FROM talent_requests ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC, id DESC`;
  return getDb().prepare(sql).all(params) as TalentRequest[];
}

export function getTalentRequest(id: number): TalentRequest | undefined {
  return getDb().prepare("SELECT * FROM talent_requests WHERE id = ?").get(id) as
    | TalentRequest
    | undefined;
}

export function updateTalentRequestStatus(
  id: number,
  status: RequestStatus,
  internalNotes: string | null,
) {
  getDb()
    .prepare(
      "UPDATE talent_requests SET status = ?, internal_notes = ?, updated_at = datetime('now') WHERE id = ?",
    )
    .run(status, internalNotes, id);
}

export function countByStatus(): Record<string, number> {
  const rows = getDb()
    .prepare("SELECT status, COUNT(*) AS n FROM talent_requests GROUP BY status")
    .all() as { status: string; n: number }[];
  return Object.fromEntries(rows.map((r) => [r.status, r.n]));
}
