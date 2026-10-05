import type { TalentRequest } from "@/lib/talent-requests";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-mint-400/20 text-mint-600",
  contacted: "bg-sky-100 text-sky-700",
  in_progress: "bg-amber-100 text-amber-700",
  filled: "bg-teal-900 text-mint-400",
  closed: "bg-teal-900/10 text-teal-900/60",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status] ?? ""}`}>
      {status.replace("_", " ")}
    </span>
  );
}

// SQLite datetime('now') is UTC without a zone marker.
export function formatDate(sqlDate: string) {
  return new Date(sqlDate.replace(" ", "T") + "Z").toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

export function formatBudget(r: Pick<TalentRequest, "budget_currency" | "budget_min" | "budget_max" | "budget_period">) {
  if (r.budget_min == null && r.budget_max == null) return "Not specified";
  const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  const range =
    r.budget_min != null && r.budget_max != null
      ? `${fmt(r.budget_min)}–${fmt(r.budget_max)}`
      : r.budget_min != null
        ? `from ${fmt(r.budget_min)}`
        : `up to ${fmt(r.budget_max!)}`;
  return `${r.budget_currency} ${range} / ${r.budget_period === "Monthly" ? "mo" : "yr"}`;
}
