import { z } from "zod";

/**
 * Talent request form: field options + validation.
 * Shared by the client form and the server action, so keep it free of server-only imports.
 *
 * Functions and seniority levels mirror the Talent Pipelines in the PRD (§5),
 * so each request can be routed to a Pipeline such as "Marketing — Senior".
 */

export const FUNCTIONS = [
  "Engineering",
  "Product",
  "Design",
  "Data & Analytics",
  "Marketing",
  "Sales",
  "Customer Success",
  "Operations",
  "Finance",
  "HR & People",
  "Legal & Compliance",
  "Other",
] as const;

export const SENIORITY = ["Entry", "Mid", "Senior", "Lead / Manager", "Executive"] as const;

export const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"] as const;

export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;

export const WORK_ARRANGEMENTS = ["On-site", "Hybrid", "Remote"] as const;

export const CURRENCIES = ["NGN", "USD", "KES", "GHS", "ZAR", "EGP", "GBP", "EUR"] as const;

export const BUDGET_PERIODS = ["Monthly", "Annual"] as const;

export const START_TIMELINES = [
  "Immediately",
  "Within 2 weeks",
  "Within a month",
  "1–3 months",
  "Flexible",
] as const;

export const HIRING_MODES = [
  {
    value: "Post & Shortlist",
    description: "We match and rank candidates from the Pipeline. You get a Top 10.",
  },
  {
    value: "Pipeline Match",
    description: "Our recruiters deeply screen the Pipeline and send a smaller shortlist.",
  },
  {
    value: "Full Recruitment",
    description: "We run the whole search: sourcing, screening, interviews, offer and close.",
  },
  { value: "Not sure yet", description: "Talk it through with us first." },
] as const;

export const REFERRAL_SOURCES = [
  "LinkedIn",
  "X (Twitter)",
  "Instagram",
  "Referral / word of mouth",
  "Event",
  "Google search",
  "Existing StartupHR client",
  "Other",
] as const;

export const REQUEST_STATUSES = ["new", "contacted", "in_progress", "filled", "closed"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

const HIRING_MODE_VALUES = HIRING_MODES.map((m) => m.value) as [string, ...string[]];

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .transform((v) => {
    if (v === "") return null;
    return /^https?:\/\//i.test(v) ? v : `https://${v}`;
  })
  .pipe(z.url({ message: "Enter a valid URL" }).nullable())
  .nullable()
  .optional();

const optionalMoney = z
  .string()
  .trim()
  .transform((v) => v.replace(/[,\s]/g, ""))
  .transform((v, ctx) => {
    if (v === "") return null;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) {
      ctx.addIssue({ code: "custom", message: "Enter a number" });
      return z.NEVER;
    }
    return Math.round(n);
  })
  .nullable()
  .optional();

const required = (label: string, max = 200) =>
  z.string({ message: `${label} is required` }).trim().min(1, `${label} is required`).max(max);

export const talentRequestSchema = z
  .object({
    company_name: required("Company name"),
    company_website: optionalUrl,
    industry: required("Industry", 120),
    company_size: z.enum(COMPANY_SIZES, { message: "Choose a company size" }),
    company_location: required("Company location"),

    contact_name: required("Your name"),
    contact_title: required("Your job title"),
    contact_email: z.email({ message: "Enter a valid email" }).trim().max(200),
    contact_phone: required("Phone number", 40),

    role_title: required("Role title"),
    function: z.enum(FUNCTIONS, { message: "Choose a function" }),
    seniority: z.enum(SENIORITY, { message: "Choose a seniority level" }),
    openings: z.coerce
      .number({ message: "Enter a number" })
      .int()
      .min(1, "At least 1")
      .max(500)
      .default(1),
    employment_type: z.enum(EMPLOYMENT_TYPES, { message: "Choose an employment type" }),
    work_arrangement: z.enum(WORK_ARRANGEMENTS, { message: "Choose a work arrangement" }),
    job_location: required("Job location"),
    budget_currency: z.enum(CURRENCIES),
    budget_min: optionalMoney,
    budget_max: optionalMoney,
    budget_period: z.enum(BUDGET_PERIODS),
    start_timeline: z.enum(START_TIMELINES, { message: "Choose a start timeline" }),
    requirements: required("Key requirements", 5000),
    jd_link: optionalUrl,

    hiring_mode: z.enum(HIRING_MODE_VALUES, { message: "Choose how you'd like to hire" }),
    referral_source: optionalText(120),
    notes: optionalText(5000),
    consent: z.literal("on", { message: "Please confirm so we can contact you" }),
  })
  .refine((d) => d.budget_min == null || d.budget_max == null || d.budget_max >= d.budget_min, {
    path: ["budget_max"],
    message: "Max should be at least the min",
  });

export type TalentRequestInput = z.infer<typeof talentRequestSchema>;

export type FieldErrors = Partial<Record<keyof z.input<typeof talentRequestSchema>, string>>;

export function targetPipeline(fn: string, seniority: string) {
  return `${fn} — ${seniority}`;
}
