import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { REQUEST_STATUSES } from "@/lib/talent-request-schema";
import { getTalentRequest } from "@/lib/talent-requests";
import { updateRequest } from "../../../actions";
import { StatusBadge, formatBudget, formatDate } from "../../ui";

export default async function RequestDetailPage({ params }: PageProps<"/admin/requests/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const r = Number.isInteger(Number(id)) ? getTalentRequest(Number(id)) : undefined;
  if (!r) notFound();

  return (
    <div>
      <Link href="/admin" className="text-sm text-teal-900/60 hover:text-teal-900">← All requests</Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-teal-900/50">#PL-{String(r.id).padStart(5, "0")} · {formatDate(r.created_at)}</p>
          <h1 className="mt-1 font-mono text-2xl font-bold">{r.role_title}</h1>
          <p className="mt-1 text-teal-900/70">{r.company_name} · <span className="font-mono text-sm">{r.target_pipeline}</span></p>
        </div>
        <StatusBadge status={r.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card title="Role">
            <Row k="Function">{r.function}</Row>
            <Row k="Seniority">{r.seniority}</Row>
            <Row k="Openings">{r.openings}</Row>
            <Row k="Employment type">{r.employment_type}</Row>
            <Row k="Work arrangement">{r.work_arrangement}</Row>
            <Row k="Location">{r.job_location}</Row>
            <Row k="Budget">{formatBudget(r)}</Row>
            <Row k="Start">{r.start_timeline}</Row>
            <Row k="JD link">{r.jd_link ? <ExtLink href={r.jd_link} /> : "—"}</Row>
            <Row k="Requirements"><p className="whitespace-pre-wrap">{r.requirements}</p></Row>
          </Card>
          <Card title="Service">
            <Row k="Hiring mode">{r.hiring_mode}</Row>
            <Row k="Heard via">{r.referral_source ?? "—"}</Row>
            <Row k="Notes"><p className="whitespace-pre-wrap">{r.notes ?? "—"}</p></Row>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Contact">
            <Row k="Name">{r.contact_name}</Row>
            <Row k="Title">{r.contact_title}</Row>
            <Row k="Email"><a className="underline" href={`mailto:${r.contact_email}`}>{r.contact_email}</a></Row>
            <Row k="Phone"><a className="underline" href={`tel:${r.contact_phone}`}>{r.contact_phone}</a></Row>
          </Card>
          <Card title="Company">
            <Row k="Name">{r.company_name}</Row>
            <Row k="Website">{r.company_website ? <ExtLink href={r.company_website} /> : "—"}</Row>
            <Row k="Industry">{r.industry}</Row>
            <Row k="Size">{r.company_size}</Row>
            <Row k="HQ">{r.company_location}</Row>
          </Card>
          <Card title="Internal">
            <form action={updateRequest} className="space-y-3">
              <input type="hidden" name="id" value={r.id} />
              <label className="field-label" htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue={r.status} className="field-input field-select">
                {REQUEST_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
              <label className="field-label" htmlFor="internal_notes">Internal notes</label>
              <textarea id="internal_notes" name="internal_notes" rows={4} defaultValue={r.internal_notes ?? ""} className="field-input" />
              <button className="btn-primary w-full bg-teal-900 py-2 text-sm text-white hover:bg-teal-800">Save</button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-white p-5 ring-1 ring-teal-900/10">
      <h2 className="mb-3 font-mono text-sm font-bold tracking-wide text-teal-900/60 uppercase">{title}</h2>
      <dl className="divide-y divide-teal-900/5 text-sm">{children}</dl>
    </section>
  );
}

function Row({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 py-2">
      <dt className="text-teal-900/55">{k}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

function ExtLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="break-all underline">
      {href}
    </a>
  );
}
