import { getCurrentUser } from "@/lib/auth";
import { listTalentRequests } from "@/lib/talent-requests";

const COLUMNS = [
  "id", "created_at", "status", "company_name", "company_website", "industry", "company_size",
  "company_location", "contact_name", "contact_title", "contact_email", "contact_phone",
  "role_title", "function", "seniority", "target_pipeline", "openings", "employment_type",
  "work_arrangement", "job_location", "budget_currency", "budget_min", "budget_max",
  "budget_period", "start_timeline", "requirements", "jd_link", "hiring_mode",
  "referral_source", "notes", "internal_notes",
] as const;

function cell(v: unknown): string {
  if (v == null) return "";
  let s = String(v);
  // Neutralise spreadsheet formula injection.
  // Neutralise spreadsheet formula injection (but leave phone numbers like +234… alone).
  if (/^[=+\-@\t\r]/.test(s) && !/^\+[\d\s()-]+$/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "recruiter")) {
    return new Response("Unauthorized", { status: 401 });
  }
  const sp = new URL(request.url).searchParams;
  const rows = listTalentRequests({
    q: sp.get("q") || undefined,
    status: sp.get("status") || undefined,
    pipeline: sp.get("pipeline") || undefined,
  });
  const csv = [
    COLUMNS.join(","),
    ...rows.map((r) => COLUMNS.map((c) => cell((r as Record<string, unknown>)[c])).join(",")),
  ].join("\r\n");

  const date = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pipeline-talent-requests-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
