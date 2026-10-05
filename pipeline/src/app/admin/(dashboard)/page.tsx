import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { FUNCTIONS, REQUEST_STATUSES } from "@/lib/talent-request-schema";
import { countByStatus, listTalentRequests } from "@/lib/talent-requests";
import { StatusBadge, formatBudget, formatDate } from "./ui";

export default async function RequestsPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
  const filters = { q: one(sp.q), status: one(sp.status), pipeline: one(sp.pipeline) };

  const rows = listTalentRequests(filters);
  const counts = countByStatus();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const exportQs = new URLSearchParams(
    Object.entries(filters).filter((e): e is [string, string] => !!e[1]),
  ).toString();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold">Talent requests</h1>
          <p className="mt-1 text-sm text-teal-900/60">
            {total} total · {counts.new ?? 0} new
          </p>
        </div>
        <a href={`/admin/export${exportQs ? `?${exportQs}` : ""}`} className="btn-primary bg-teal-900 px-4 py-2 text-sm text-white hover:bg-teal-800">
          Export CSV
        </a>
      </div>

      <form className="mt-6 flex flex-wrap gap-3" action="/admin">
        <input name="q" defaultValue={filters.q} placeholder="Search company, contact, role…" className="field-input max-w-xs" />
        <select name="status" defaultValue={filters.status ?? ""} className="field-input field-select w-auto">
          <option value="">All statuses</option>
          {REQUEST_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")} ({counts[s] ?? 0})</option>
          ))}
        </select>
        <select name="pipeline" defaultValue={filters.pipeline ?? ""} className="field-input field-select w-auto">
          <option value="">All functions</option>
          {FUNCTIONS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <button className="rounded-lg border border-teal-900/20 px-4 text-sm font-medium hover:border-teal-900">Filter</button>
        {(filters.q || filters.status || filters.pipeline) && (
          <Link href="/admin" className="self-center text-sm text-teal-900/60 underline">Clear</Link>
        )}
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white ring-1 ring-teal-900/10">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-teal-900/10 text-xs tracking-wide text-teal-900/55 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Received</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Pipeline</th>
              <th className="px-4 py-3 font-medium">Budget</th>
              <th className="px-4 py-3 font-medium">Mode</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-900/5">
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-teal-900/50">
                  No talent requests yet. Submissions from the landing page will appear here.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-paper">
                <td className="px-4 py-3 whitespace-nowrap text-teal-900/60">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/requests/${r.id}`} className="font-semibold hover:text-mint-600">{r.company_name}</Link>
                  <div className="text-xs text-teal-900/55">{r.contact_name} · {r.contact_email}</div>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/requests/${r.id}`} className="hover:text-mint-600">{r.role_title}</Link>
                  <div className="text-xs text-teal-900/55">{r.work_arrangement} · {r.job_location}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{r.target_pipeline}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatBudget(r)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.hiring_mode}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
